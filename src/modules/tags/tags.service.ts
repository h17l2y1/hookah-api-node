import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Tag } from '@prisma/client';
import { GetAllRequestDto } from '../../common/dto/get-all-request.dto';
import { GetAllResponseDto } from '../../common/dto/get-all-response.dto';
import { PrismaService } from '../../database/prisma.service';
import { getPaging, sortDirection } from '../../common/utils/query';
import { CreateTagRequestDto, GetTagResponseDto, ImportTagRequestDto, TagImportResultDto, UpdateTagRequestDto } from './tags.dto';

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
    const where = request.name
      ? { name: { contains: request.name.trim(), mode: 'insensitive' as const } }
      : {};

    const total = await this.prisma.tag.count({ where });
    if (!total) {
      return new GetAllResponseDto(0, []);
    }

    const { skip, take } = getPaging(request);
    const entities = await this.prisma.tag.findMany({
      where,
      orderBy: [{ name: sortDirection(request.sortBy) }],
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
    await this.ensureNotExists(request.name, request.isGlobal);
    await this.prisma.tag.create({
      data: {
        name: request.name.trim(),
        color: request.color.trim(),
        isGlobal: request.isGlobal,
      },
    });
  }

  async import(requests: ImportTagRequestDto[]): Promise<TagImportResultDto> {
    const normalizedRequests = requests.map((request) => ({
      name: request.name.trim(),
      color: request.color.trim(),
      isGlobal: request.isGlobal ?? false,
    })).filter((request) => request.name.length > 0 && request.color.length > 0);

    if (!normalizedRequests.length) {
      throw new BadRequestException('No valid tags provided');
    }

    const uniqueRequests = this.uniqueByKey(normalizedRequests);
    const existingTags = await this.prisma.tag.findMany({
      where: {
        OR: uniqueRequests.map((request) => ({
          name: request.name,
          isGlobal: request.isGlobal,
        })),
      },
      select: {
        name: true,
        isGlobal: true,
      },
    });

    const existingKeys = new Set(existingTags.map((tag) => this.getTagKey(tag.name, tag.isGlobal)));
    const tagsToCreate = uniqueRequests.filter((request) => !existingKeys.has(this.getTagKey(request.name, request.isGlobal)));

    if (tagsToCreate.length) {
      await this.prisma.tag.createMany({
        data: tagsToCreate,
      });
    }

    return {
      totalCount: requests.length,
      createdCount: tagsToCreate.length,
      skippedCount: requests.length - tagsToCreate.length,
    };
  }

  async update(request: UpdateTagRequestDto): Promise<void> {
    const normalizedId = Number(request.id);
    await this.ensureNotExists(request.name, request.isGlobal, normalizedId);
    await this.prisma.tag.update({
      where: { id: normalizedId },
      data: {
        name: request.name.trim(),
        color: request.color.trim(),
        isGlobal: request.isGlobal,
      },
    });
  }

  async remove(id: number): Promise<void> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!tag) {
      throw new NotFoundException(`${id} doesn't exist`);
    }

    await this.prisma.$transaction([
      this.prisma.tobaccoTag.deleteMany({ where: { tagId: id } }),
      this.prisma.tag.delete({ where: { id } }),
    ]);
  }

  private async ensureNotExists(name: string, isGlobal: boolean, excludeId?: number): Promise<void> {
    const exists = await this.prisma.tag.findFirst({
      where: {
        name: name.trim(),
        isGlobal,
        ...(excludeId !== undefined ? { id: { not: excludeId } } : {}),
      },
    });
    if (exists) {
      throw new BadRequestException(`Tag ${name} already exist`);
    }
  }

  private mapTag(entity: Tag): GetTagResponseDto {
    return {
      id: String(entity.id),
      name: entity.name,
      color: entity.color,
      isGlobal: entity.isGlobal,
    };
  }

  private uniqueByKey(requests: Array<{ name: string; color: string; isGlobal: boolean }>): Array<{ name: string; color: string; isGlobal: boolean }> {
    const seen = new Set<string>();
    return requests.filter((request) => {
      const key = this.getTagKey(request.name, request.isGlobal);
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }

  private getTagKey(name: string, isGlobal: boolean): string {
    return `${name}::${isGlobal ? '1' : '0'}`;
  }
}
