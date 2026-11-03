# SOA – Hệ thống quản lý đồ án tốt nghiệp (NestJS + React)

Đồ án môn **Kiến trúc hướng dịch vụ (SOA)** – Nhóm 5, giảng viên hướng dẫn: Võ Thị Mỹ.

Hệ thống quản lý quy trình đồ án tốt nghiệp của Khoa: sinh viên, đề tài, đăng ký đề tài, xác thực. Backend NestJS + MySQL, frontend React (Vite). Dự án phát triển từ bài giữa kỳ (một backend gộp, cổng 3000); bài cuối kỳ **tách thành các dịch vụ độc lập, mỗi dịch vụ chạy trên một cổng và có cơ sở dữ liệu riêng**, theo nguyên tắc SOA.

Tài liệu phân tích bài toán (yêu cầu chức năng FR-01 → FR-24, phi chức năng NFR-01 → NFR-12) nằm trong báo cáo của nhóm. Mã yêu cầu trong README này lấy theo báo cáo đó.

## Trạng thái hiện tại (cập nhật 03/11/2026)

| Hạng mục                                                                                          | Trạng thái                                           |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Tách monorepo NestJS (`apps/` + `libs/`)                                                          | Xong                                                 |
| Student service (cổng 3001, CSDL riêng)                                                           | Xong                                                 |
| Topic service (cổng 3002, CSDL riêng)                                                             | Xong                                                 |
| Registration service (cổng 3003, CSDL riêng, gọi HTTP sang 3001 và 3002)                          | Xong                                                 |
| Guard JWT dùng chung (`libs/common`), mọi dịch vụ tự kiểm tra token                               | Xong                                                 |
| Kiểm thử Postman cho 3 dịch vụ                                                                    | Xong (xem mục Kiểm thử)                              |
| Auth Service tách riêng (cổng 3004)                                                               | Đang làm. Hiện `/auth` còn nằm trong Student service |
| API Gateway, service registry, message queue                                                      | Chưa làm                                             |
| Health check, retry, circuit breaker, Docker                                                      | Chưa làm                                             |
| Cập nhật frontend để gọi hệ thống mới                                                             | Chưa làm (chờ Gateway)                               |
| Mở rộng nghiệp vụ theo báo cáo (khoa, ngành, giảng viên, GPA, duyệt đăng ký, thông báo, thống kê) | Chưa làm                                             |

## Kiến trúc hiện tại

```
Postman / Frontend
   │  HTTP/REST (JSON, Bearer JWT)
   ├──► sinh-vien-service  :3001 ── MySQL: qldatn_sinhvien   (kèm /auth, tạm thời)
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

Kiến trúc đích theo báo cáo: Auth, Academic, Topic, Registration, Notification, Report đứng sau một API Gateway, kèm service registry và message queue.

## Các dịch vụ

| Dịch vụ          | Thư mục                  | Cổng | CSDL                            | Phụ trách |
| ---------------- | ------------------------ | ---- | ------------------------------- | --------- |
| Student          | `apps/sinh-vien-service` | 3001 | `qldatn_sinhvien`               | Khương    |
| Topic            | `apps/de-tai-service`    | 3002 | `qldatn_detai`                  | Khang     |
| Registration     | `apps/dang-ky-service`   | 3003 | `qldatn_dangky`                 | Khoa      |
| Auth (đang tách) | `apps/auth-service`      | 3004 | không dùng CSDL ở giai đoạn đầu | Nhóm      |

Tất cả dịch vụ hiện dùng chung một MySQL server và một tài khoản, chỉ khác tên database. Mức này đủ cho môn học nhưng chưa phải cách ly hoàn toàn. Hướng nâng cấp: mỗi dịch vụ một user MySQL riêng, hoặc mỗi dịch vụ một container MySQL.

## Cấu trúc dự án

```
SOA-giua-ky-NestJS/
├── backend_nestjs/
│   ├── apps/
│   │   ├── sinh-vien-service/   # Student service (+ auth tạm thời)
│   │   ├── de-tai-service/      # Topic service
│   │   ├── dang-ky-service/     # Registration service
│   │   └── bai-giua-ky-soa/     # Bản giữa kỳ (gộp), giữ để đối chiếu, sẽ xóa sau
│   ├── libs/common/             # Guard JWT và @Public() dùng chung
│   ├── .env.example             # Biến dùng chung (DB, JWT, admin)
│   ├── nest-cli.json
│   └── tsconfig.json
└── frontend_react/              # React + Vite (chưa cập nhật cho kiến trúc mới)
```

Mỗi dịch vụ có: `src/main.ts`, `src/<tên>-service.module.ts` (module gốc), `database.sql` (tạo CSDL riêng), `.env.example`, `tsconfig.app.json`, và các `controller`, `service`, `entity`, `module`, `dto/`.

## Đối chiếu 7 tính chất SOA

| Tính chất                            | Mức hiện tại                | Ghi chú                                                                                     |
| ------------------------------------ | --------------------------- | ------------------------------------------------------------------------------------------- |
| 1. Liên kết lỏng (NFR-01)            | Đáp ứng (chưa có container) | Cổng, tiến trình, CSDL riêng; gọi nhau qua HTTP. Chưa đóng gói Docker.                      |
| 2. Sử dụng lại dịch vụ (NFR-04)      | Đáp ứng một phần            | Registration dùng lại API của Student và Topic.                                             |
| 3. Bất đồng bộ (NFR-05)              | Chưa                        | Chưa có message queue.                                                                      |
| 4. Quản lý chính sách (NFR-06)       | Tạm thời                    | Mỗi dịch vụ tự kiểm tra JWT bằng chung secret. Sẽ chuyển về API Gateway.                    |
| 5. Khả năng cộng tác (NFR-03)        | Đáp ứng một phần            | REST/JSON. Chưa có tài liệu OpenAPI (Swagger).                                              |
| 6. Dò tìm và ràng buộc động (NFR-07) | Chưa                        | Địa chỉ dịch vụ đang ghi trong `.env`.                                                      |
| 7. Tự phục hồi (NFR-08)              | Đáp ứng một phần            | Trả 503 khi dịch vụ phụ thuộc không phản hồi. Chưa có health check, retry, circuit breaker. |

## API

Mọi route (trừ login và refresh) cần header `Authorization: Bearer <access_token>`.

| Dịch vụ             | Endpoint                                                      |
| ------------------- | ------------------------------------------------------------- |
| Auth (hiện ở :3001) | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` |
| Student :3001       | `POST/GET /sinh-vien`, `GET/PATCH/DELETE /sinh-vien/:MaSV`    |
| Topic :3002         | `POST/GET /de-tai`, `GET/PUT/DELETE /de-tai/:id`              |
| Registration :3003  | `POST/GET /dang-ky`, `GET/PATCH/DELETE /dang-ky/:id`          |

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
npx nest start sinh-vien-service
npx nest start de-tai-service
npx nest start dang-ky-service
```

Mỗi dịch vụ in ra dòng "đang chạy ở cổng ...". Bật `sinh-vien-service` và `de-tai-service` trước `dang-ky-service`.

5. **Lấy token** bằng `POST http://localhost:3001/auth/login`, rồi gửi kèm `Authorization: Bearer <access_token>` khi gọi các dịch vụ.

Thư mục `apps/bai-giua-ky-soa` là bản giữa kỳ, chỉ giữ để đối chiếu và không chạy trong cấu hình mới.

## Kiểm thử bằng Postman (đã thực hiện)

| Phép thử                                              | Kết quả                                        |
| ----------------------------------------------------- | ---------------------------------------------- |
| `POST :3002/de-tai` không token                       | 401 `Thiếu token`                              |
| Đăng nhập ở :3001, dùng token gọi `POST :3002/de-tai` | 201 (token do :3001 cấp, :3002 chấp nhận)      |
| `POST :3003/dang-ky` không token                      | 401 `Thiếu token`                              |
| `POST :3003/dang-ky` hợp lệ                           | 201, bản ghi nằm trong `qldatn_dangky.DangKy`  |
| Đăng ký với sinh viên hoặc đề tài không tồn tại       | 404                                            |
| Đăng ký lần hai của cùng sinh viên                    | 409                                            |
| Tắt :3001 rồi đăng ký                                 | 503, bật lại thì hoạt động trở lại             |
| `SELECT`, `SHOW TABLES` trên ba CSDL                  | Bảng `SinhVien` chỉ có trong `qldatn_sinhvien` |

## Giới hạn đã biết

- Frontend chưa được cập nhật: `frontend_react/src/api.js` vẫn trỏ về backend gộp của bài giữa kỳ. Sẽ trỏ về API Gateway khi có.
- Hash refresh token lưu trong bộ nhớ (restart dịch vụ thì phải đăng nhập lại), chỉ một phiên admin tại một thời điểm.
- Các dịch vụ chia sẻ một MySQL server và một tài khoản.
- Tên trường chưa thống nhất giữa các dịch vụ (`MaSV` ở Student, `maSV` ở Registration). Sẽ chuẩn hóa sau.
- Mô hình dữ liệu hiện chỉ có các cột cơ bản; chưa có ngành, GPA, trạng thái đề tài như báo cáo yêu cầu (FR-03, FR-06, FR-11).

## Lộ trình

1. Tách Auth Service (cổng 3004), bỏ `auth/` khỏi Student service.
2. API Gateway (cổng 3000) làm điểm vào chung, kiểm token và phân quyền tập trung (NFR-06).
3. Docker Compose, mỗi dịch vụ một container (NFR-01).
4. Cập nhật frontend gọi qua Gateway.
5. Tùy thời gian: Notification qua hàng đợi (NFR-05), health check, retry, circuit breaker (NFR-08), Swagger (FR-24), mở rộng nghiệp vụ.

## Quy tắc làm việc nhóm

- Mỗi người chỉ sửa dịch vụ của mình. Phần dùng chung (`libs/common`, `nest-cli.json`, `tsconfig.json`, `frontend_react/src/api.js`, `components/`) do nhóm trưởng sửa.
- Test API bằng Postman trước khi báo xong.
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
