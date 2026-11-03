import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SinhVien } from './sinh-vien.entity';
import { CreateSinhVienDto } from './dto/create-sinh-vien.dto';
import { UpdateSinhVienDto } from './dto/update-sinh-vien.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SinhVienService {
  constructor(
    @InjectRepository(SinhVien)
    private readonly sinhVienRepository: Repository<SinhVien>,
  ) {}

  // CREATE - Thêm sinh viên mới
  async create(
    data: CreateSinhVienDto,
  ): Promise<Omit<SinhVien, 'password' | 'token'>> {
    const existingStudent = await this.sinhVienRepository.findOne({
      where: { MaSV: data.MaSV },
    });
    if (existingStudent) {
      throw new ConflictException('Mã sinh viên đã tồn tại');
    }
    const sinhVien = this.sinhVienRepository.create({
      ...data,
      password: await bcrypt.hash(data.password, 10),
    });
    const { password, token, ...saved } =
      await this.sinhVienRepository.save(sinhVien);
    return saved;
  }

  // READ ALL - Lấy tất cả sinh viên
  async findAll(): Promise<SinhVien[]> {
    return await this.sinhVienRepository.find();
  }

  // READ ONE - Lấy 1 sinh viên theo MaSV
  async findOne(MaSV: string): Promise<SinhVien> {
    const sinhVien = await this.sinhVienRepository.findOne({
      where: { MaSV },
    });

    if (!sinhVien) {
      throw new NotFoundException(`Không tìm thấy sinh viên có mã ${MaSV}`);
    }

    return sinhVien;
  }

  // UPDATE - Cập nhật thông tin sinh viên
  async update(MaSV: string, data: UpdateSinhVienDto): Promise<SinhVien> {
    const sinhVien = await this.findOne(MaSV);
    const { password, ...rest } = data;
    Object.assign(sinhVien, rest);
    if (password) sinhVien.password = await bcrypt.hash(password, 10);
    const saved = await this.sinhVienRepository.save(sinhVien);
    delete (saved as any).password;
    delete (saved as any).token;
    return saved;
  }

  // DELETE - Xóa sinh viên
  async remove(MaSV: string): Promise<{ message: string }> {
    const sinhVien = await this.findOne(MaSV);
    try {
      await this.sinhVienRepository.remove(sinhVien);
    } catch (e: any) {
      const errno = e?.errno ?? e?.driverError?.errno;
      const code = e?.code ?? e?.driverError?.code;
      if (errno === 1451 || code === 'ER_ROW_IS_REFERENCED_2') {
        throw new ConflictException(
          'Không thể xóa: sinh viên đã có đăng ký đề tài',
        );
      }
      throw e;
    }
    return { message: `Đã xóa sinh viên ${MaSV} thành công` };
  }
}
