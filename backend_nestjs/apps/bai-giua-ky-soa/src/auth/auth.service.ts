import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class AuthService {
  // Hash của refresh token đang hiệu lực (1 admin). Mất khi restart server.
  private refreshHash: string | null = null;

  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  private safeEqual(a: string, b: string) {
    const x = Buffer.from(a); //chuyển thành byte
    const y = Buffer.from(b);
    return x.length === y.length && timingSafeEqual(x, y);
  }

  private async issueTokens(username: string) {
    const payload = { sub: username, role: 'admin' };
    const access_token = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES', '15m') as any,
    });
    const refresh_token = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES', '7d') as any,
    });
    this.refreshHash = await bcrypt.hash(refresh_token, 10);
    return {
      access_token,
      refresh_token,
      user: { username, role: 'admin' },
    };
  }

  async login(username: string, password: string) {
    const okUser = this.safeEqual(username, this.config.get('ADMIN_USER', ''));
    const okPass = this.safeEqual(password, this.config.get('ADMIN_PASS', ''));
    if (!okUser || !okPass) {
      throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu');
    }
    return this.issueTokens(username);
  }

  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }
    const valid =
      this.refreshHash &&
      (await bcrypt.compare(refreshToken, this.refreshHash));
    if (!valid) {
      throw new UnauthorizedException(
        'Refresh token đã bị thu hồi, hãy đăng nhập lại',
      );
    }
    return this.issueTokens(payload.sub); // rotation: token cũ mất hiệu lực
  }

  logout() {
    this.refreshHash = null;
    return { message: 'Đã đăng xuất' };
  }
}
