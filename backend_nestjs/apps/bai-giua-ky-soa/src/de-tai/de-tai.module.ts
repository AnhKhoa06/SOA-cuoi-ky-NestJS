import { Module } from '@nestjs/common';
import { DeTaiController } from './de-tai.controller';
import { DeTaiService } from './de-tai.service';
import { DeTai } from './de-tai.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [DeTaiController],
  providers: [DeTaiService],
  imports: [TypeOrmModule.forFeature([DeTai])],
  exports: [DeTaiService],
})
export class DeTaiModule {}
