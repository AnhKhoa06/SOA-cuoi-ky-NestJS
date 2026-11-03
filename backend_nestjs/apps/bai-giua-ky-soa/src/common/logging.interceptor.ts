import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest();
    const res = ctx.switchToHttp().getResponse();
    const start = Date.now(); // // PHẦN 1: chạy TRƯỚC controller (lúc request đi vào)
    const who = req.user?.sub ?? 'anonymous'; // . lấy người gọi (từ JWT)
    return next.handle().pipe(
      // next.handle() = "chạy controller (và service) đi"
      tap({
        // PHẦN 2: chạy SAU controller (lúc kết quả đi ra)
        next: () =>
          this.logger.log(
            `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms [${who}]`, // 3. cho request chạy tiếp tới controller
          ),
        error: (e) =>
          this.logger.warn(
            `${req.method} ${req.originalUrl} ${e?.status ?? 500} ${Date.now() - start}ms [${who}]`, // lỗi
          ),
      }),
    );
  }
}
