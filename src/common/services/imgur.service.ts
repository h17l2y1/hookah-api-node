import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type ImgurResponse<T> = {
  data: T;
  success: boolean;
  status: number;
};

type ImgurImage = {
  link?: string;
};

@Injectable()
export class ImgurService {
  constructor(private readonly configService: ConfigService) {}

  async uploadImage(name: string, base64: string): Promise<string> {
    const payload = this.extractBase64Payload(base64);
    const response = await fetch('https://api.imgur.com/3/upload', {
      method: 'POST',
      headers: {
        Authorization: this.buildAuthorizationHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: payload,
        name,
        title: 'title',
        description: 'description',
      }),
    });

    const text = await response.text();
    if (!response.ok) {
      throw new BadGatewayException(`Imgur upload failed with status ${response.status}: ${text}`);
    }

    const parsed = JSON.parse(text) as ImgurResponse<ImgurImage>;
    if (!parsed.success || !parsed.data?.link) {
      throw new BadGatewayException(`Unexpected Imgur response: ${text}`);
    }

    return parsed.data.link;
  }

  private buildAuthorizationHeader(): string {
    const accessToken = this.configService.get<string>('imgur.accessToken');
    if (accessToken && accessToken.trim().length > 0) {
      return `Bearer ${accessToken}`;
    }

    const clientId = this.configService.getOrThrow<string>('imgur.clientId');
    if (!clientId.trim()) {
      throw new BadGatewayException('Imgur ClientId is not configured.');
    }

    return `Client-ID ${clientId}`;
  }

  private extractBase64Payload(base64: string): string {
    if (!base64 || base64.trim().length === 0) {
      throw new BadGatewayException('Image payload is empty.');
    }

    const index = base64.indexOf(',');
    return index >= 0 ? base64.slice(index + 1) : base64;
  }
}
