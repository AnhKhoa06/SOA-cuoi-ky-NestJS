import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SinhVienModule } from './sinh-vien.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '@app/common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/sinh-vien-service/.env', '.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123456', // sửa đúng mật khẩu máy bạn
      database: 'qldatn_sinhvien',
      autoLoadEntities: true,
      synchronize: false,
    }),
    SinhVienModule,
    AuthModule,
    CommonModule,
  ],
})
export class SinhVienServiceModule {}
