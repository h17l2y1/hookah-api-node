import {Injectable, NotFoundException} from '@nestjs/common';
import {Brand, Line} from '@prisma/client';
import {GetAllRequestDto} from '../../common/dto/get-all-request.dto';
import {GetAllResponseDto} from '../../common/dto/get-all-response.dto';
import {DEFAULT_IMAGE_LINK} from '../../common/constants/default-image';
import {ImageType} from '../../common/enums/image-type.enum';
import {parseRequiredInt} from '../../common/utils/ids';
import {getPaging, sortDirection} from '../../common/utils/query';
import {ImgurService} from '../../common/services/imgur.service';
import {PrismaService} from '../../database/prisma.service';
import {CreateBrandRequestDto, GetBrandOptionDto, GetBrandResponseDto, UpdateBrandRequestDto,} from './brands.dto';

@Injectable()
export class BrandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imgurService: ImgurService,
  ) {}

  async getById(id: number): Promise<GetBrandResponseDto> {
    const entity = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        country: true,
        image: true,
        lines: { orderBy: { name: 'asc' } },
      },
    });
    if (!entity) {
      throw new NotFoundException(`${id} doesn't exist`);
    }

    return this.mapBrand(entity);
  }

  async getAll(request: GetAllRequestDto): Promise<GetAllResponseDto<GetBrandResponseDto>> {
    const where = {
      ...(request.name ? { name: { contains: request.name.trim(), mode: 'insensitive' as const } } : {}),
      ...(request.countryId ? { countryId: parseRequiredInt(request.countryId) } : {}),
    };

    const total = await this.prisma.brand.count({ where });
    if (!total) {
      return new GetAllResponseDto(0, []);
    }

    const { skip, take } = getPaging(request);
    const entities = await this.prisma.brand.findMany({
      where,
      include: { country: true, image: true, lines: true },
      orderBy: [{ name: sortDirection(request.sortBy) }],
      skip,
      take,
    });

    return new GetAllResponseDto(total, entities.map((entity) => this.mapBrand(entity)));
  }

  async getOptions(): Promise<GetBrandOptionDto[]> {
    const entities = await this.prisma.brand.findMany({ orderBy: { name: 'asc' } });
    return entities.map((entity) => ({ id: entity.id, name: entity.name }));
  }

  async create(request: CreateBrandRequestDto): Promise<void> {
    const imageLink = request.image.base64?.trim()
      ? await this.imgurService.uploadImage(request.name, request.image.base64)
      : DEFAULT_IMAGE_LINK;
    const image = await this.prisma.image.create({
      data: {
        name: request.name.trim(),
        link: imageLink,
        type: request.image.type,
      },
    });
    const brand = await this.prisma.brand.create({
      data: {
        name: request.name.trim(),
        description: request.description ?? null,
        countryId: parseRequiredInt(request.countryId),
        imageId: image.id,
      },
      include: { image: true },
    });

    if (request.lines?.length) {
      await this.prisma.line.createMany({
        data: request.lines.filter((line) => line.name?.trim()).map((line) => ({
          name: line.name!.trim(),
          description: line.description ?? null,
          brandId: brand.id,
        })),
      });
    }
  }

  async update(request: UpdateBrandRequestDto): Promise<void> {
    const brand = await this.prisma.brand.findUnique({
      where: { id: request.id },
      include: { image: true },
    });
    if (!brand) {
      throw new NotFoundException(`${request.id} doesn't exist`);
    }

    const imageUpdate: { name: string; link?: string; type?: ImageType } = {
      name: request.name.trim(),
    };
    if (request.image.base64) {
      imageUpdate.link = await this.imgurService.uploadImage(request.name, request.image.base64);
    } else if (request.image.link) {
      imageUpdate.link = request.image.link;
    }
    if (request.image.type) {
      imageUpdate.type = request.image.type;
    }

    await this.prisma.image.update({
      where: { id: brand.imageId },
      data: imageUpdate,
    });

    await this.prisma.brand.update({
      where: { id: request.id },
      data: {
        name: request.name.trim(),
        description: request.description ?? null,
        countryId: parseRequiredInt(request.countryId),
      },
    });

    const newLines = (request.lines ?? []).filter((line) => line.isNew);
    if (newLines.length) {
      await this.prisma.line.createMany({
        data: newLines.map((line) => ({
          name: line.name.trim(),
          brandId: request.id,
        })),
      });
    }

    const existingLines = (request.lines ?? []).filter((line) => !line.isNew && line.id);
    for (const line of existingLines) {
      await this.prisma.line.update({
        where: { id: parseRequiredInt(line.id!) },
        data: {
          name: line.name.trim(),
          brandId: parseRequiredInt(line.brandId),
        },
      });
    }
  }

  async remove(id: number): Promise<void> {
    await this.prisma.brand.delete({ where: { id } });
  }

  private mapBrand(entity: Brand & { country: { id: number; name: string }; image: { id: number; name: string; link: string; type: string }; lines: Line[] }): GetBrandResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      country: { id: entity.country.id, name: entity.country.name },
      image: {
        id: entity.image.id,
        name: entity.image.name,
        link: entity.image.link,
        type: entity.image.type as ImageType,
      },
      lines: entity.lines.map((line) => ({
        id: line.id,
        name: line.name,
        brandId: String(line.brandId),
      })),
    };
  }
}
