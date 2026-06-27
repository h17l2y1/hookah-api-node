import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import type {User} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import {randomUUID} from 'crypto';
import {PrismaService} from '../database/prisma.service';
import {LoginDto} from './dto/login.dto';
import {LoginResponseDto} from './dto/login-response.dto';
import {RefreshTokenRequestDto} from './dto/refresh-token-request.dto';
import {SignUpDto} from './dto/signup.dto';
import {JwtPayload} from './types/jwt-payload.interface';

type TokenPair = {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(dto: SignUpDto): Promise<void> {
    const email = dto.Email.trim();
    const exists = await this.prisma.user.findFirst({ where: { email } });
    if (exists) {
      throw new BadRequestException('Email already exist');
    }

    const passwordHash = await bcrypt.hash(dto.Password, 10);
    await this.prisma.user.create({
      data: {
        firstName: dto.FirstName.trim(),
        lastName: dto.LastName.trim(),
        email,
        password: dto.Password,
        passwordHash,
        role: dto.Role.trim(),
        userName: `${dto.FirstName.trim()}${dto.LastName.trim()}`,
      },
    });
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.findUserByEmail(dto.Email);
    if (!user) {
      throw new UnauthorizedException('User email does not found');
    }

    const matches = await bcrypt.compare(dto.Password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Password error');
    }

    const tokenPair = await this.generateTokenPair(user);
    await this.prisma.refreshToken.create({
      data: {
        token: tokenPair.refreshToken,
        expiredDate: tokenPair.refreshExpiresAt,
        userId: user.id,
      },
    });

    return {
      AccessToken: tokenPair.accessToken,
      RefreshToken: tokenPair.refreshToken,
    };
  }

  async refreshAuthToken(dto: RefreshTokenRequestDto): Promise<LoginResponseDto> {
    const payload = await this.verifyRefreshToken(dto.RefreshToken);
    const token = await this.prisma.refreshToken.findFirst({
      where: { token: dto.RefreshToken },
    });

    if (!token || token.expiredDate.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh Token Invalid');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      throw new UnauthorizedException('User email does not found');
    }

    const tokenPair = await this.generateTokenPair(user);
    await this.prisma.refreshToken.create({
      data: {
        token: tokenPair.refreshToken,
        expiredDate: tokenPair.refreshExpiresAt,
        userId: user.id,
      },
    });

    return {
      AccessToken: tokenPair.accessToken,
      RefreshToken: tokenPair.refreshToken,
    };
  }

  async isAdmin(role: string): Promise<void> {
    if (role !== 'admin') {
      throw new UnauthorizedException();
    }
  }

  private async findUserByEmail(email: string) {
    return this.prisma.user.findFirst({ where: { email: email.trim() } });
  }

  private async verifyRefreshToken(refreshToken: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
      secret: this.configService.getOrThrow<string>('jwt.secret'),
      ignoreExpiration: true,
    });
  }

  private async generateTokenPair(user: User): Promise<TokenPair> {
    const secret = this.configService.getOrThrow<string>('jwt.secret');
    const accessExpiresIn = this.configService.get<string>('jwt.accessExpiresIn') ?? '1h';
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') ?? '48h';
    const payload = this.createPayload(user);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret,
        expiresIn: accessExpiresIn as JwtSignOptions['expiresIn'],
      }),
      this.jwtService.signAsync(payload, {
        secret,
        expiresIn: refreshExpiresIn as JwtSignOptions['expiresIn'],
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      refreshExpiresAt: this.computeExpiresAt(refreshExpiresIn),
    };
  }

  private createPayload(user: User): JwtPayload {
    return {
      sub: user.id,
      email: user.email ?? '',
      role: user.role,
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      jti: randomUUID(),
    };
  }

  private computeExpiresAt(expiresIn: string): Date {
    const now = new Date();
    const match = /^(\d+)([smhd])$/i.exec(expiresIn.trim());
    if (!match) {
      throw new BadRequestException(`Unsupported token TTL: ${expiresIn}`);
    }

    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    const ms = unit === 's' ? value * 1000 : unit === 'm' ? value * 60_000 : unit === 'h' ? value * 3_600_000 : value * 86_400_000;
    return new Date(now.getTime() + ms);
  }
}
