import { NestFactory } from '@nestjs/core';
import { SinhVienServiceModule } from './sinh-vien-service.module';

async function bootstrap() {
  const app = await NestFactory.create(SinhVienServiceModule);
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`SinhVien service đang chạy ở cổng ${port}`);
}
bootstrap();
