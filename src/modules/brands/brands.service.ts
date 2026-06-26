import {Injectable, NotFoundException} from '@nestjs/common';
import {Brand, Line} from '@prisma/client';
import {GetAllRequestDto} from '../../common/dto/get-all-request.dto';
import {GetAllResponseDto} from '../../common/dto/get-all-response.dto';
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
      ...(request.Name ? { name: { contains: request.Name.trim(), mode: 'insensitive' as const } } : {}),
      ...(request.CountryId ? { countryId: parseRequiredInt(request.CountryId) } : {}),
    };

    const total = await this.prisma.brand.count({ where });
    if (!total) {
      return new GetAllResponseDto(0, []);
    }

    const { skip, take } = getPaging(request);
    const entities = await this.prisma.brand.findMany({
      where,
      include: { country: true, image: true, lines: true },
      orderBy: [{ name: sortDirection(request.SortBy) }],
      skip,
      take,
    });

    return new GetAllResponseDto(total, entities.map((entity) => this.mapBrand(entity)));
  }

  async getOptions(): Promise<GetBrandOptionDto[]> {
    const entities = await this.prisma.brand.findMany({ orderBy: { name: 'asc' } });
    return entities.map((entity) => ({ id: entity.id, Name: entity.name }));
  }

  async create(request: CreateBrandRequestDto): Promise<void> {
    const imageLink = await this.imgurService.uploadImage(request.Name, request.Image.Base64);
    const image = await this.prisma.image.create({
      data: {
        name: request.Name.trim(),
        link: imageLink,
        type: request.Image.Type,
      },
    });
    const brand = await this.prisma.brand.create({
      data: {
        name: request.Name.trim(),
        description: request.Description ?? null,
        countryId: parseRequiredInt(request.CountryId),
        imageId: image.id,
      },
      include: { image: true },
    });

    if (request.Lines?.length) {
      await this.prisma.line.createMany({
        data: request.Lines.filter((line) => line.Name?.trim()).map((line) => ({
          name: line.Name!.trim(),
          description: line.Description ?? null,
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
      name: request.Name.trim(),
    };
    if (request.Image.Base64) {
      imageUpdate.link = await this.imgurService.uploadImage(request.Name, request.Image.Base64);
    } else if (request.Image.Link) {
      imageUpdate.link = request.Image.Link;
    }
    if (request.Image.Type) {
      imageUpdate.type = request.Image.Type;
    }

    await this.prisma.image.update({
      where: { id: brand.imageId },
      data: imageUpdate,
    });

    await this.prisma.brand.update({
      where: { id: request.id },
      data: {
        name: request.Name.trim(),
        description: request.Description ?? null,
        countryId: parseRequiredInt(request.CountryId),
      },
    });

    const newLines = (request.Lines ?? []).filter((line) => line.IsNew);
    if (newLines.length) {
      await this.prisma.line.createMany({
        data: newLines.map((line) => ({
          name: line.Name.trim(),
          brandId: request.id,
        })),
      });
    }

    const existingLines = (request.Lines ?? []).filter((line) => !line.IsNew && line.Id);
    for (const line of existingLines) {
      await this.prisma.line.update({
        where: { id: parseRequiredInt(line.Id!) },
        data: {
          name: line.Name.trim(),
          brandId: parseRequiredInt(line.BrandId),
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
      Name: entity.name,
      Description: entity.description,
      Country: { id: entity.country.id, Name: entity.country.name },
      Image: {
        id: entity.image.id,
        Name: entity.image.name,
        Link: entity.image.link,
        Type: entity.image.type as ImageType,
      },
      Lines: entity.lines.map((line) => ({
        id: line.id,
        Name: line.name,
        BrandId: String(line.brandId),
      })),
    };
  }
}
