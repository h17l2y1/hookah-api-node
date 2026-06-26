import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenRequestDto } from './dto/refresh-token-request.dto';
import { SignUpDto } from './dto/signup.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Account')
@Controller('api/Account')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('SignUp')
  async signUp(@Body() request: SignUpDto) {
    await this.authService.signUp(request);
    return null;
  }

  @Post('Login')
  async login(@Body() request: LoginDto) {
    return this.authService.login(request);
  }

  @Post('RefreshAuthToken')
  async refreshAuthToken(@Body() request: RefreshTokenRequestDto) {
    return this.authService.refreshAuthToken(request);
  }

  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiExcludeEndpoint()
  @Get('IsAdmin')
  async isAdmin(@Req() request: { user: { role: string } }) {
    await this.authService.isAdmin(request.user.role);
    return null;
  }
}
