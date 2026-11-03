import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DangKyServiceModule } from './dang-ky-service.module';

async function bootstrap() {
  const app = await NestFactory.create(DangKyServiceModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const port = process.env.PORT ?? 3003;
  await app.listen(port);
  console.log(`DangKy service đang chạy ở cổng ${port}`);
}
bootstrap();
