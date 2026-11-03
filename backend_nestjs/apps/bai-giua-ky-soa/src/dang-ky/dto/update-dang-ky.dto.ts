import { IsIn, IsInt, IsOptional } from 'class-validator';

export class UpdateDangKyDto {
  @IsOptional()
  @IsInt()
  maDeTai?: number;

  @IsOptional()
  @IsIn(['Cho duyet', 'Da duyet', 'Tu choi'])
  trangThai?: string;
}
