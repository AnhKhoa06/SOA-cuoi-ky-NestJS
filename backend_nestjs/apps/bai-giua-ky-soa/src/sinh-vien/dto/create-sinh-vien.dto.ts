import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateSinhVienDto {
  @IsString()
  @IsNotEmpty()
  MaSV: string;

  @IsString()
  @IsNotEmpty()
  hoTen: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  lop?: string;

  @IsString()
  @MinLength(6)
  password: string;
}
