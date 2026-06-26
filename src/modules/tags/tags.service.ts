import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Tag } from '@prisma/client';
import { GetAllRequestDto } from '../../common/dto/get-all-request.dto';
import { GetAllResponseDto } from '../../common/dto/get-all-response.dto';
import { PrismaService } from '../../database/prisma.service';
import { getPaging, sortDirection } from '../../common/utils/query';
import { CreateTagRequestDto, GetTagResponseDto, UpdateTagRequestDto } from './tags.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: number): Promise<GetTagResponseDto> {
    const entity = await this.prisma.tag.findUnique({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`${id} doesn't exist`);
    }

    return this.mapTag(entity);
  }

  async getAll(request: GetAllRequestDto): Promise<GetAllResponseDto<GetTagResponseDto>> {
    const where = request.Name
      ? { name: { contains: request.Name.trim(), mode: 'insensitive' as const } }
      : {};

    const total = await this.prisma.tag.count({ where });
    if (!total) {
      return new GetAllResponseDto(0, []);
    }

    const { skip, take } = getPaging(request);
    const entities = await this.prisma.tag.findMany({
      where,
      orderBy: [{ name: sortDirection(request.SortBy) }],
      skip,
      take,
    });

    return new GetAllResponseDto(total, entities.map((entity) => this.mapTag(entity)));
  }

  async getOptions(): Promise<GetTagResponseDto[]> {
    const entities = await this.prisma.tag.findMany({ orderBy: { name: 'asc' } });
    return entities.map((entity) => this.mapTag(entity));
  }

  async getGlobalOptions(): Promise<GetTagResponseDto[]> {
    const entities = await this.prisma.tag.findMany({
      where: { isGlobal: true },
      orderBy: { name: 'asc' },
    });
    return entities.map((entity) => this.mapTag(entity));
  }

  async create(request: CreateTagRequestDto): Promise<void> {
    await this.ensureNotExists(request.Name, request.IsGlobal);
    await this.prisma.tag.create({
      data: {
        name: request.Name.trim(),
        color: request.Color.trim(),
        isGlobal: request.IsGlobal,
      },
    });
  }

  async update(request: UpdateTagRequestDto): Promise<void> {
    await this.ensureNotExists(request.Name, request.IsGlobal);
    await this.prisma.tag.update({
      where: { id: request.id },
      data: {
        name: request.Name.trim(),
        color: request.Color.trim(),
        isGlobal: request.IsGlobal,
      },
    });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.tag.delete({ where: { id } });
  }

  private async ensureNotExists(name: string, isGlobal: boolean): Promise<void> {
    const exists = await this.prisma.tag.findFirst({
      where: { name: name.trim(), isGlobal },
    });
    if (exists) {
      throw new BadRequestException(`Tag ${name} already exist`);
    }
  }

  private mapTag(entity: Tag): GetTagResponseDto {
    return {
      id: String(entity.id),
      Name: entity.name,
      Color: entity.color,
      IsGlobal: entity.isGlobal,
    };
  }
}
