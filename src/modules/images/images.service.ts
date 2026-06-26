import { Injectable, NotFoundException } from '@nestjs/common';
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
      Name: entity.name,
      Link: entity.link,
      Type: entity.type as ImageType,
    };
  }

  async create(request: CreateImageRequestDto): Promise<void> {
    await this.prisma.image.create({
      data: { name: request.Name.trim(), link: request.Base64.trim(), type: request.Type },
    });
  }

  async update(request: UpdateImageRequestDto): Promise<void> {
    await this.prisma.image.update({
      where: { id: request.id },
      data: {
        name: request.Name.trim(),
        ...(request.Link ? { link: request.Link.trim() } : {}),
        ...(request.Type ? { type: request.Type } : {}),
      },
    });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.image.delete({ where: { id } });
  }
}
