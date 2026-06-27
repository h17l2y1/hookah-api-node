import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GetAllRequestDto } from '../../common/dto/get-all-request.dto';
import { GetAllResponseDto } from '../../common/dto/get-all-response.dto';
import { DEFAULT_IMAGE_LINK } from '../../common/constants/default-image';
import { ImageType } from '../../common/enums/image-type.enum';
import { ImgurService } from '../../common/services/imgur.service';
import { parseRequiredInt } from '../../common/utils/ids';
import { getPaging, sortDirection } from '../../common/utils/query';
import { PrismaService } from '../../database/prisma.service';
import { CreateTobaccoRequestDto, GetTobaccoResponseDto, UpdateTobaccoRequestDto } from './tobaccos.dto';

@Injectable()
export class TobaccosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imgurService: ImgurService,
  ) {}

  async getById(id: number): Promise<GetTobaccoResponseDto> {
    const entity = await this.prisma.tobacco.findUnique({
      where: { id },
      include: {
        image: true,
        brand: true,
        reviews: { include: { user: true } },
        tobaccoTags: { include: { tag: true } },
      },
    });
    if (!entity) {
      throw new NotFoundException(`${id} doesn't exist`);
    }

    return this.mapTobacco(entity);
  }

  async getAll(request: GetAllRequestDto): Promise<GetAllResponseDto<GetTobaccoResponseDto>> {
    const filterName = request.name?.trim();
    const where: Prisma.TobaccoWhereInput = {
      ...(filterName
        ? {
            OR: [
              { name: { contains: filterName } },
              { tobaccoTags: { some: { tag: { name: { equals: filterName } } } } },
            ],
          }
        : {}),
      ...(request.tagId ? { tobaccoTags: { some: { tagId: parseRequiredInt(request.tagId) } } } : {}),
      ...(request.brandId ? { brandId: parseRequiredInt(request.brandId) } : {}),
      ...(request.countryId ? { brand: { countryId: parseRequiredInt(request.countryId) } } : {}),
      ...(request.lineId ? { lineId: parseRequiredInt(request.lineId) } : {}),
      ...(request.heavinessId ? { heavinessId: parseRequiredInt(request.heavinessId) } : {}),
    };

    const total = await this.prisma.tobacco.count({ where });
    if (!total) {
      return new GetAllResponseDto(0, []);
    }

    const { skip, take } = getPaging(request);
    const entities = await this.prisma.tobacco.findMany({
      where,
      include: {
        image: true,
        brand: true,
        reviews: { include: { user: true } },
        tobaccoTags: { include: { tag: true } },
      },
      orderBy: [{ [request.column || 'name']: sortDirection(request.sortBy) }],
      skip,
      take,
    });

    return new GetAllResponseDto(total, entities.map((entity) => this.mapTobacco(entity)));
  }

  async getByBrandId(brandId: number): Promise<GetTobaccoResponseDto[]> {
    const entities = await this.prisma.tobacco.findMany({
      where: { brandId },
      include: {
        image: true,
        brand: true,
      },
      orderBy: { name: 'asc' },
    });

    return entities.map((entity) => this.mapTobacco(entity));
  }

  async create(request: CreateTobaccoRequestDto): Promise<void> {
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
    const tobacco = await this.prisma.tobacco.create({
      data: {
        name: request.name.trim(),
        description: request.description ?? null,
        lineId: parseRequiredInt(request.lineId),
        brandId: parseRequiredInt(request.brandId),
        heavinessId: parseRequiredInt(request.heavinessId),
        imageId: image.id,
      },
    });

    const tags = request.tobaccoTags ?? [];
    if (tags.length) {
      await this.prisma.tobaccoTag.createMany({
        data: tags.map((item) => ({
          tagId: parseRequiredInt(item.tagId),
          tobaccoId: tobacco.id,
        })),
      });
    }
  }

  async update(request: UpdateTobaccoRequestDto): Promise<void> {
    const entity = await this.prisma.tobacco.findUnique({
      where: { id: request.id },
      include: { image: true },
    });
    if (!entity) {
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

    if (entity.imageId) {
      await this.prisma.image.update({
        where: { id: entity.imageId },
        data: imageUpdate,
      });
    }

    await this.prisma.tobacco.update({
      where: { id: request.id },
      data: {
        name: request.name.trim(),
        description: request.description ?? null,
        lineId: parseRequiredInt(request.lineId),
        heavinessId: parseRequiredInt(request.heavinessId),
        brandId: parseRequiredInt(request.brandId),
        rating: request.rating ?? entity.rating,
      },
    });

    const removedTags = request.tobaccoTags.filter((item) => item.isRemoved);
    for (const item of removedTags) {
      await this.prisma.tobaccoTag.deleteMany({
        where: {
          ...(item.id ? { id: parseRequiredInt(item.id) } : {}),
          ...(item.tagId ? { tagId: parseRequiredInt(item.tagId) } : {}),
          tobaccoId: request.id,
        },
      });
    }

    const newTags = request.tobaccoTags.filter((item) => item.isNew);
    if (newTags.length) {
      await this.prisma.tobaccoTag.createMany({
        data: newTags.map((item) => ({
          tagId: parseRequiredInt(item.tagId),
          tobaccoId: request.id,
        })),
      });
    }
  }

  async remove(id: number): Promise<void> {
    await this.prisma.tobacco.delete({ where: { id } });
  }

  private mapTobacco(entity: any): GetTobaccoResponseDto {
    const reviews = (entity.reviews ?? []).map((review: any) => ({
      tobaccoId: review.tobaccoId ? String(review.tobaccoId) : null,
      mixId: review.mixId ? String(review.mixId) : null,
      userId: review.userId ?? null,
      isAnonymous: review.isAnonymous,
      rating: review.rating,
      comment: review.comment ?? null,
      name: review.isAnonymous ? (review.anonymousName ?? '') : `${review.user?.firstName ?? ''} ${review.user?.lastName ?? ''}`.trim(),
      creationDate: review.creationDate,
    }));
    const tags = (entity.tobaccoTags ?? []).map((item: any) => ({
      id: String(item.tag.id),
      name: item.tag.name,
      color: item.tag.color,
      isGlobal: item.tag.isGlobal,
    }));

    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      lineId: String(entity.lineId),
      brandId: String(entity.brandId),
      heavinessId: String(entity.heavinessId),
      rating: entity.rating,
      ratingCount: reviews.length,
      commentsCount: reviews.filter((review: any) => review.comment != null).length,
      image: entity.image
        ? {
            id: entity.image.id,
            name: entity.image.name,
            link: entity.image.link,
            type: entity.image.type,
          }
        : null,
      brand: entity.brand ? { id: entity.brand.id, name: entity.brand.name } : null,
      tags,
      tobaccoTags: (entity.tobaccoTags ?? []).map((item: any) => ({
        id: String(item.id),
        tagId: String(item.tagId),
        tobaccoId: String(item.tobaccoId),
        isNew: false,
        isRemoved: false,
      })),
      reviews,
    };
  }
}
