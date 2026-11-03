import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/api-gateway/.env', '.env'],
    }),
    JwtModule.register({}),
  ],
})
export class ApiGatewayModule {}
