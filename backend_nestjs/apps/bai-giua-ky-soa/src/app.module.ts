import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SinhVienModule } from './sinh-vien/sinh-vien.module';
import { DeTaiModule } from './de-tai/de-tai.module';
import { DangKyModule } from './dang-ky/dang-ky.module';
import { AuthModule } from './auth/auth.module';
import { LoggingInterceptor } from './common/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        type: 'mysql',
        host: c.get('DB_HOST', 'localhost'),
        port: Number(c.get('DB_PORT', 3306)),
        username: c.get('DB_USER', 'root'),
        password: c.get('DB_PASS', ''),
        database: c.get('DB_NAME', 'quanly_dotot_nghiep'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    AuthModule,
    SinhVienModule,
    DeTaiModule,
    DangKyModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
