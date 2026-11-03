import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { NextFunction, Request, Response } from 'express';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule, { bodyParser: false });
  const config = app.get(ConfigService);
  const jwt = app.get(JwtService);
  const secret = config.get<string>('JWT_ACCESS_SECRET');

  const targets: Record<string, string> = {
    '/auth': config.get<string>('AUTH_SERVICE_URL')!,
    '/sinh-vien': config.get<string>('SINHVIEN_SERVICE_URL')!,
    '/de-tai': config.get<string>('DETAI_SERVICE_URL')!,
    '/dang-ky': config.get<string>('DANGKY_SERVICE_URL')!,
  };
  const publicPaths = ['/auth/login', '/auth/refresh'];

  const findTarget = (url: string): string | undefined => {
    const path = url.split('?')[0];
    const prefix = Object.keys(targets).find(
      (p) => path === p || path.startsWith(p + '/'),
    );
    return prefix ? targets[prefix] : undefined;
  };

  const server = app.getHttpAdapter().getInstance();

  server.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      console.log(
        `[gateway] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`,
      );
    });
    next();
  });

  server.use((req: Request, res: Response, next: NextFunction) => {
    if (!findTarget(req.originalUrl)) {
      return res.status(404).json({
        message: 'Không tìm thấy dịch vụ',
        error: 'Not Found',
        statusCode: 404,
      });
    }
    next();
  });

  server.use(async (req: Request, res: Response, next: NextFunction) => {
    const path = req.originalUrl.split('?')[0];
    if (req.method === 'OPTIONS' || publicPaths.includes(path)) return next();

    const [type, token] = (req.headers.authorization ?? '').split(' ');
    if (type !== 'Bearer' || !token) {
      return res.status(401).json({
        message: 'Thiếu token',
        error: 'Unauthorized',
        statusCode: 401,
      });
    }
    try {
      await jwt.verifyAsync(token, { secret });
      next();
    } catch {
      return res.status(401).json({
        message: 'Token không hợp lệ hoặc đã hết hạn',
        error: 'Unauthorized',
        statusCode: 401,
      });
    }
  });

  server.use(
    createProxyMiddleware({
      target: targets['/auth'],
      changeOrigin: true,
      router: (req) => findTarget(req.url ?? '') as string,
      on: {
        error: (_err, _req, res) => {
          const r = res as unknown as Response;
          if (!r.headersSent) {
            r.status(503).json({
              message: 'Dịch vụ phía sau không phản hồi',
              error: 'Service Unavailable',
              statusCode: 503,
            });
          }
        },
      },
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`API Gateway đang chạy ở cổng ${port}`);
}
bootstrap();
