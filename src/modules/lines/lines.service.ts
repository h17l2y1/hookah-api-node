import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { parseRequiredInt } from '../../common/utils/ids';
import { CreateLineRequestDto, GetLineResponseDto, UpdateLineRequestDto } from './lines.dto';

@Injectable()
export class LinesService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: number): Promise<GetLineResponseDto> {
    const entity = await this.prisma.line.findUnique({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`${id} doesn't exist`);
    }

    return { id: entity.id, name: entity.name, brandId: String(entity.brandId) };
  }

  async create(request: CreateLineRequestDto): Promise<void> {
    await this.prisma.line.create({
      data: {
        name: request.name.trim(),
        description: request.description ?? null,
        brandId: parseRequiredInt(request.brandId),
      },
    });
  }

  async update(request: UpdateLineRequestDto): Promise<void> {
    await this.prisma.line.update({
      where: { id: request.id },
      data: {
        name: request.name.trim(),
        description: request.description ?? null,
        brandId: parseRequiredInt(request.brandId),
      },
    });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.line.delete({ where: { id } });
  }

  async getLinesByBrandId(brandId: number): Promise<GetLineResponseDto[]> {
    const entities = await this.prisma.line.findMany({
      where: { brandId },
      orderBy: { name: 'asc' },
    });
    return entities.map((entity) => ({ id: entity.id, name: entity.name, brandId: String(entity.brandId) }));
  }
}
