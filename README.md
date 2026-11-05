# SOA – Hệ thống quản lý đồ án tốt nghiệp (NestJS + React)

Đồ án môn **Kiến trúc hướng dịch vụ (SOA)** – Nhóm 5, giảng viên hướng dẫn: Võ Thị Mỹ.

Hệ thống quản lý quy trình đồ án tốt nghiệp của Khoa: sinh viên, đề tài, đăng ký đề tài, xác thực. Backend NestJS + MySQL, frontend React (Vite). Dự án phát triển từ bài giữa kỳ (một backend gộp, cổng 3000); bài cuối kỳ **tách thành các dịch vụ độc lập, mỗi dịch vụ chạy trên một cổng và có cơ sở dữ liệu riêng**, theo nguyên tắc SOA. Backend gộp của giữa kỳ đã được gỡ khỏi mã nguồn.

Tài liệu phân tích bài toán (yêu cầu chức năng FR-01 → FR-24, phi chức năng NFR-01 → NFR-12) nằm trong báo cáo của nhóm. Mã yêu cầu trong README này lấy theo báo cáo đó.

## Trạng thái hiện tại (cập nhật 05/11/2026)

| Hạng mục                                                                                          | Trạng thái |
| ------------------------------------------------------------------------------------------------- | ---------- |
| Tách monorepo NestJS (`apps/` + `libs/`)                                                          | Xong       |
| Student service (cổng 3001, CSDL riêng)                                                           | Xong       |
| Topic service (cổng 3002, CSDL riêng)                                                             | Xong       |
| Registration service (cổng 3003, CSDL riêng, gọi HTTP sang 3001 và 3002)                          | Xong       |
| Guard JWT dùng chung (`libs/common`), mọi dịch vụ tự kiểm tra token                               | Xong       |
| Auth service (cổng 3004): đăng nhập, refresh, đăng xuất bằng tài khoản admin trong `.env`         | Xong       |
| API Gateway (cổng 3000): điểm vào chung của hệ thống                                              | Xong       |
| Gỡ bỏ backend gộp của bài giữa kỳ                                                                 | Xong       |
| Service registry, message queue                                                                   | Chưa làm   |
| Health check, retry, circuit breaker, Docker                                                      | Chưa làm   |
| Cập nhật frontend để gọi hệ thống mới                                                             | Chưa làm   |
| Mở rộng nghiệp vụ theo báo cáo (khoa, ngành, giảng viên, GPA, duyệt đăng ký, thông báo, thống kê) | Chưa làm   |

## Kiến trúc hiện tại

```
Postman / Frontend
   │  HTTP/REST (JSON, Bearer JWT)
   ▼
API Gateway :3000  (điểm vào chung)
   ├──► auth-service       :3004 ── (chưa có CSDL, tài khoản admin lấy từ .env)
   ├──► sinh-vien-service  :3001 ── MySQL: qldatn_sinhvien
   ├──► de-tai-service     :3002 ── MySQL: qldatn_detai
   └──► dang-ky-service    :3003 ── MySQL: qldatn_dangky
              │  HTTP GET, chuyển tiếp header Authorization
              ├──► :3001  /sinh-vien/:MaSV   (xác nhận sinh viên tồn tại)
              └──► :3002  /de-tai/:id        (xác nhận đề tài tồn tại)
```

Nguyên tắc đang áp dụng:

- Mỗi dịch vụ là một tiến trình riêng: `main.ts`, `.env`, cổng và CSDL riêng.
- Không có khóa ngoại giữa các CSDL. Bảng `DangKy` chỉ lưu `MaSV` và `MaDeTai`.
- Dịch vụ không đọc CSDL của dịch vụ khác, chỉ gọi qua API. Địa chỉ gọi nằm trong `.env` (`SINHVIEN_URL`, `DETAI_URL`).
- `libs/common` chỉ chứa mã hạ tầng dùng chung (guard JWT, decorator `@Public()`), không chứa entity hay nghiệp vụ.

Kiến trúc đích theo báo cáo: Auth, Academic, Topic, Registration, Notification, Report đứng sau API Gateway, kèm service registry và message queue.

## Các dịch vụ

| Dịch vụ      | Thư mục                  | Cổng | CSDL                                    | Phụ trách |
| ------------ | ------------------------ | ---- | --------------------------------------- | --------- |
| API Gateway  | `apps/api-gateway`       | 3000 | không có                                | Nhóm      |
| Student      | `apps/sinh-vien-service` | 3001 | `qldatn_sinhvien`                       | Khương    |
| Topic        | `apps/de-tai-service`    | 3002 | `qldatn_detai`                          | Khang     |
| Registration | `apps/dang-ky-service`   | 3003 | `qldatn_dangky`                         | Khoa      |
| Auth         | `apps/auth-service`      | 3004 | chưa có (tài khoản admin lấy từ `.env`) | Nhóm      |

Tất cả dịch vụ hiện dùng chung một MySQL server và một tài khoản, chỉ khác tên database. Mức này đủ cho môn học nhưng chưa phải cách ly hoàn toàn. Hướng nâng cấp: mỗi dịch vụ một user MySQL riêng, hoặc mỗi dịch vụ một container MySQL.

## Cấu trúc dự án

```
SOA-giua-ky-NestJS/
├── backend_nestjs/
│   ├── apps/
│   │   ├── api-gateway/         # API Gateway (điểm vào chung)
│   │   ├── auth-service/        # Auth service (login, refresh, logout)
│   │   ├── sinh-vien-service/   # Student service
│   │   ├── de-tai-service/      # Topic service
│   │   └── dang-ky-service/     # Registration service
│   ├── libs/common/             # Guard JWT và @Public() dùng chung
│   ├── .env.example             # Biến dùng chung (DB, JWT, admin)
│   ├── nest-cli.json
│   └── tsconfig.json
└── frontend_react/              # React + Vite (chưa cập nhật cho kiến trúc mới)
```

Mỗi dịch vụ có: `src/main.ts`, `src/<tên>-service.module.ts` (module gốc), `.env.example`, `tsconfig.app.json`; các dịch vụ nghiệp vụ có thêm `database.sql` (tạo CSDL riêng), `controller`, `service`, `entity`, `module`, `dto/`.

## Đối chiếu 7 tính chất SOA

| Tính chất                            | Mức hiện tại                | Ghi chú                                                                                                                         |
| ------------------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1. Liên kết lỏng (NFR-01)            | Đáp ứng (chưa có container) | Cổng, tiến trình, CSDL riêng; gọi nhau qua HTTP. Chưa đóng gói Docker.                                                          |
| 2. Sử dụng lại dịch vụ (NFR-04)      | Đáp ứng một phần            | Registration dùng lại API của Student và Topic.                                                                                 |
| 3. Bất đồng bộ (NFR-05)              | Chưa                        | Chưa có message queue.                                                                                                          |
| 4. Quản lý chính sách (NFR-06)       | Đáp ứng một phần            | Có API Gateway làm điểm vào chung; mỗi dịch vụ vẫn tự kiểm tra JWT bằng chung secret (`libs/common`). Chưa tập trung hoàn toàn. |
| 5. Khả năng cộng tác (NFR-03)        | Đáp ứng một phần            | REST/JSON. Chưa có tài liệu OpenAPI (Swagger).                                                                                  |
| 6. Dò tìm và ràng buộc động (NFR-07) | Chưa                        | Địa chỉ dịch vụ đang ghi trong `.env`.                                                                                          |
| 7. Tự phục hồi (NFR-08)              | Đáp ứng một phần            | Trả 503 khi dịch vụ phụ thuộc không phản hồi. Chưa có health check, retry, circuit breaker.                                     |

## API

Mọi route (trừ login và refresh) cần header `Authorization: Bearer <access_token>`.

| Dịch vụ            | Endpoint                                                      |
| ------------------ | ------------------------------------------------------------- |
| Auth :3004         | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` |
| Student :3001      | `POST/GET /sinh-vien`, `GET/PATCH/DELETE /sinh-vien/:MaSV`    |
| Topic :3002        | `POST/GET /de-tai`, `GET/PUT/DELETE /de-tai/:id`              |
| Registration :3003 | `POST/GET /dang-ky`, `GET/PATCH/DELETE /dang-ky/:id`          |

Client gọi vào API Gateway (cổng 3000), Gateway chuyển tiếp tới các dịch vụ trên. Các dịch vụ vẫn có thể gọi trực tiếp qua cổng riêng khi phát triển và kiểm thử.

Tên trường trong body (phân biệt hoa thường, trường lạ bị loại bỏ):

| Dịch vụ      | Body tạo mới                                                                            |
| ------------ | --------------------------------------------------------------------------------------- |
| Student      | `{ "MaSV", "hoTen", "email", "lop", "password" }` (`password` tối thiểu 6 ký tự)        |
| Topic        | `{ "tenDeTai", "moTa", "giangVienHuongDan", "soLuongToiDa" }` (chỉ `tenDeTai` bắt buộc) |
| Registration | `{ "maSV", "maDeTai" }` (`maDeTai` là số)                                               |

| Mã       | Ý nghĩa                                                                        |
| -------- | ------------------------------------------------------------------------------ |
| 200, 201 | Thành công                                                                     |
| 400      | Dữ liệu thiếu hoặc sai định dạng (validate DTO)                                |
| 401      | Thiếu token, token sai hoặc hết hạn                                            |
| 404      | Không tìm thấy bản ghi (kể cả sinh viên hoặc đề tài không tồn tại khi đăng ký) |
| 409      | Trùng dữ liệu, ví dụ sinh viên đã đăng ký một đề tài                           |
| 503      | Dịch vụ phụ thuộc không phản hồi                                               |

Luật nghiệp vụ của `POST /dang-ky` (kế thừa từ bản giữa kỳ): sinh viên và đề tài phải tồn tại (kiểm tra bằng HTTP sang hai dịch vụ kia), mỗi sinh viên chỉ có một đăng ký còn hiệu lực, đề tài không vượt `soLuongToiDa`.

## Bảo mật

- JWT access token (15 phút) và refresh token (7 ngày), ký bằng hai secret khác nhau.
- `JWT_ACCESS_SECRET` phải **giống nhau ở mọi dịch vụ** thì token do một nơi cấp mới được dịch vụ khác chấp nhận.
- Guard toàn cục: mọi route bị khóa trừ route gắn `@Public()`.
- Mật khẩu sinh viên băm bcrypt, `password` và `token` không trả ra trong response.
- Cấu hình bí mật nằm trong `.env`, không nằm trong mã nguồn.
- Validate dữ liệu bằng DTO và `class-validator` (`whitelist`).

## Yêu cầu môi trường

- Node.js (bản LTS) và npm
- MySQL Server và MySQL Workbench
- Git

## Hướng dẫn chạy (sau khi clone)

1. **Clone và cài thư viện:**

```
git clone https://github.com/AnhKhoa06/SOA-giua-ky-NestJS.git
cd SOA-giua-ky-NestJS/backend_nestjs
npm install

cd ../frontend_react
npm install
```

2. **Tạo ba CSDL:** mở MySQL Workbench, chạy lần lượt ba file:
   - `backend_nestjs/apps/sinh-vien-service/database.sql`
   - `backend_nestjs/apps/de-tai-service/database.sql`
   - `backend_nestjs/apps/dang-ky-service/database.sql`

3. **Tạo file cấu hình** (không commit các file `.env`):
   - `backend_nestjs/.env` từ `backend_nestjs/.env.example`, điền `DB_PASS`, `ADMIN_USER`, `ADMIN_PASS`, hai `JWT_*_SECRET` (dài, khác nhau).
   - `apps/<dịch-vụ>/.env` từ `apps/<dịch-vụ>/.env.example` cho từng dịch vụ (cổng, tên CSDL, URL dịch vụ phụ thuộc).

4. **Chạy các dịch vụ**, mỗi dịch vụ một terminal, trong `backend_nestjs`:

```
npx nest start auth-service
npx nest start sinh-vien-service
npx nest start de-tai-service
npx nest start dang-ky-service
npx nest start api-gateway
```

Mỗi dịch vụ in ra dòng "đang chạy ở cổng ...". Bật `sinh-vien-service` và `de-tai-service` trước `dang-ky-service`, và bật `api-gateway` sau cùng.

5. **Lấy token** bằng `POST http://localhost:3004/auth/login` với body `{ "username", "password" }` (tài khoản `ADMIN_USER`, `ADMIN_PASS` trong `.env` gốc), rồi gửi kèm `Authorization: Bearer <access_token>` khi gọi các dịch vụ.

## Giới hạn đã biết

- Frontend chưa được cập nhật: `frontend_react/src/api.js` vẫn trỏ về backend gộp của bài giữa kỳ (đã gỡ), nên frontend chưa hoạt động cho đến khi trỏ về API Gateway.
- Auth service chưa có CSDL riêng và chưa quản lý tài khoản (FR-22): chỉ có tài khoản admin lấy từ `.env`.
- Hash refresh token lưu trong bộ nhớ (restart Auth service thì phải đăng nhập lại), chỉ một phiên admin tại một thời điểm.
- Các dịch vụ chia sẻ một MySQL server và một tài khoản.
- Tên trường chưa thống nhất giữa các dịch vụ (`MaSV` ở Student, `maSV` ở Registration). Sẽ chuẩn hóa sau.
- Mô hình dữ liệu hiện chỉ có các cột cơ bản; chưa có ngành, GPA, trạng thái đề tài như báo cáo yêu cầu (FR-03, FR-06, FR-11).
- Chưa có service registry, message queue, health check, retry, circuit breaker và Docker.

## Lộ trình

1. Cập nhật frontend gọi qua API Gateway.
2. Docker Compose, mỗi dịch vụ một container (NFR-01).
3. Message queue và Notification service (NFR-05); service registry (NFR-07).
4. Health check, retry, circuit breaker (NFR-08); Swagger (FR-24).
5. Tùy thời gian: Auth có CSDL riêng và quản lý tài khoản (FR-22), mở rộng nghiệp vụ theo báo cáo.

## Quy tắc làm việc nhóm

- Mỗi người chỉ sửa dịch vụ của mình. Phần dùng chung (`libs/common`, `nest-cli.json`, `tsconfig.json`, `frontend_react/src/api.js`, `components/`) do nhóm trưởng sửa.
- Tên biến môi trường và cổng không ghi cứng trong mã, đặt trong `.env`.

## Lưu ý về Git

- Không đẩy `node_modules/` và `.env` (đã có trong `.gitignore`). Chỉ commit `.env.example`.
- Làm việc trên nhánh riêng, mở Pull Request vào `main`, nhờ thành viên khác xem trước khi gộp.
- Trước khi làm việc luôn `git pull`. Gặp conflict thì dừng lại và hỏi nhóm.

```
git add <đúng file mình sửa>
git commit -m "mô tả ngắn"
git pull --rebase --autostash
git push
```
