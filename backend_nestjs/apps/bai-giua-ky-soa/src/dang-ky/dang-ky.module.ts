import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DangKy } from './dang-ky.entity';
import { DangKyController } from './dang-ky.controller';
import { DangKyService } from './dang-ky.service';

@Module({
  imports: [TypeOrmModule.forFeature([DangKy]), HttpModule],
  controllers: [DangKyController],
  providers: [DangKyService],
})
export class DangKyModule {}
