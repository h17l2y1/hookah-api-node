import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_IMAGE_LINK } from '../../common/constants/default-image';
import { PrismaService } from '../../database/prisma.service';
import { ImageType } from '../../common/enums/image-type.enum';
import { CreateImageRequestDto, GetImageResponseDto, UpdateImageRequestDto } from './images.dto';

@Injectable()
export class ImagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: number): Promise<GetImageResponseDto> {
    const entity = await this.prisma.image.findUnique({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`${id} doesn't exist`);
    }

    return {
      id: entity.id,
      name: entity.name,
      link: entity.link,
      type: entity.type as ImageType,
    };
  }

  async create(request: CreateImageRequestDto): Promise<void> {
    await this.prisma.image.create({
      data: {
        name: request.name.trim(),
        link: request.base64?.trim() ? request.base64.trim() : DEFAULT_IMAGE_LINK,
        type: request.type,
      },
    });
  }

  async update(request: UpdateImageRequestDto): Promise<void> {
    await this.prisma.image.update({
      where: { id: request.id },
      data: {
        name: request.name.trim(),
        ...(request.link ? { link: request.link.trim() } : {}),
        ...(request.type ? { type: request.type } : {}),
      },
    });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.image.delete({ where: { id } });
  }
}
