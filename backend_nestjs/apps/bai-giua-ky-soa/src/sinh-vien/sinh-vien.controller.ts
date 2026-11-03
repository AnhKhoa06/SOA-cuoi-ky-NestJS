import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SinhVienService } from './sinh-vien.service';
import { CreateSinhVienDto } from './dto/create-sinh-vien.dto';
import { UpdateSinhVienDto } from './dto/update-sinh-vien.dto';

@Controller('sinh-vien')
export class SinhVienController {
  constructor(private readonly sinhVienService: SinhVienService) {}

  // POST /sinh-vien - Thêm mới
  @Post()
  async create(@Body() data: CreateSinhVienDto) {
    return await this.sinhVienService.create(data);
  }

  // GET /sinh-vien - Lấy tất cả
  @Get()
  async findAll() {
    return await this.sinhVienService.findAll();
  }

  // GET /sinh-vien/:MaSV - Lấy 1
  @Get(':MaSV')
  async findOne(@Param('MaSV') MaSV: string) {
    return await this.sinhVienService.findOne(MaSV);
  }

  // PATCH /sinh-vien/:MaSV - Cập nhật
  @Patch(':MaSV')
  async update(@Param('MaSV') MaSV: string, @Body() data: UpdateSinhVienDto) {
    return await this.sinhVienService.update(MaSV, data);
  }

  // DELETE /sinh-vien/:MaSV - Xóa
  @Delete(':MaSV')
  async remove(@Param('MaSV') MaSV: string) {
    return await this.sinhVienService.remove(MaSV);
  }
}
