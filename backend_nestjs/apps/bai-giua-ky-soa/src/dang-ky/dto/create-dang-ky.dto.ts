import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateDangKyDto {
  @IsString()
  @IsNotEmpty()
  maSV: string;

  @IsInt()
  maDeTai: number;
}
