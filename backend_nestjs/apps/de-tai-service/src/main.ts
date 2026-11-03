import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DeTaiServiceModule } from './de-tai-service.module';

async function bootstrap() {
  const app = await NestFactory.create(DeTaiServiceModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const port = process.env.PORT ?? 3002;
  await app.listen(port);
  console.log(`DeTai service đang chạy ở cổng ${port}`);
}
bootstrap();
