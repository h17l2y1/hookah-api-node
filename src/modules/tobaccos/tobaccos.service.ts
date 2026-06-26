import {Injectable, NotFoundException} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {GetAllRequestDto} from '../../common/dto/get-all-request.dto';
import {GetAllResponseDto} from '../../common/dto/get-all-response.dto';
import {parseRequiredInt} from '../../common/utils/ids';
import {getPaging, sortDirection} from '../../common/utils/query';
import {ImgurService} from '../../common/services/imgur.service';
import {ImageType} from '../../common/enums/image-type.enum';
import {PrismaService} from '../../database/prisma.service';
import {CreateTobaccoRequestDto, GetTobaccoResponseDto, UpdateTobaccoRequestDto} from './tobaccos.dto';

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
    const filterName = request.Name?.trim();
    const where: Prisma.TobaccoWhereInput = {
      ...(filterName
        ? {
            OR: [
              { name: { contains: filterName } },
              { tobaccoTags: { some: { tag: { name: { equals: filterName } } } } },
            ],
          }
        : {}),
      ...(request.TagId ? { tobaccoTags: { some: { tagId: parseRequiredInt(request.TagId) } } } : {}),
      ...(request.BrandId ? { brandId: parseRequiredInt(request.BrandId) } : {}),
      ...(request.CountryId ? { brand: { countryId: parseRequiredInt(request.CountryId) } } : {}),
      ...(request.LineId ? { lineId: parseRequiredInt(request.LineId) } : {}),
      ...(request.HeavinessId ? { heavinessId: parseRequiredInt(request.HeavinessId) } : {}),
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
      orderBy: [{ [request.Column || 'name']: sortDirection(request.SortBy) }],
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
    const imageLink = await this.imgurService.uploadImage(request.Name, request.Image.Base64);
    const image = await this.prisma.image.create({
      data: {
        name: request.Name.trim(),
        link: imageLink,
        type: request.Image.Type,
      },
    });
    const tobacco = await this.prisma.tobacco.create({
      data: {
        name: request.Name.trim(),
        description: request.Description ?? null,
        lineId: parseRequiredInt(request.LineId),
        brandId: parseRequiredInt(request.BrandId),
        heavinessId: parseRequiredInt(request.HeavinessId),
        imageId: image.id,
      },
    });

    const tags = request.TobaccoTags ?? [];
    if (tags.length) {
      await this.prisma.tobaccoTag.createMany({
        data: tags.map((item) => ({
          tagId: parseRequiredInt(item.TagId),
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

    if (entity.imageId) {
      await this.prisma.image.update({
        where: { id: entity.imageId },
        data: imageUpdate,
      });
    }

    await this.prisma.tobacco.update({
      where: { id: request.id },
      data: {
        name: request.Name.trim(),
        description: request.Description ?? null,
        lineId: parseRequiredInt(request.LineId),
        heavinessId: parseRequiredInt(request.HeavinessId),
        brandId: parseRequiredInt(request.BrandId),
        rating: request.Rating ?? entity.rating,
      },
    });

    const removedTags = request.TobaccoTags.filter((item) => item.IsRemoved);
    for (const item of removedTags) {
      await this.prisma.tobaccoTag.deleteMany({
        where: {
          ...(item.Id ? { id: parseRequiredInt(item.Id) } : {}),
          ...(item.TagId ? { tagId: parseRequiredInt(item.TagId) } : {}),
          tobaccoId: request.id,
        },
      });
    }

    const newTags = request.TobaccoTags.filter((item) => item.IsNew);
    if (newTags.length) {
      await this.prisma.tobaccoTag.createMany({
        data: newTags.map((item) => ({
          tagId: parseRequiredInt(item.TagId),
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
      TobaccoId: review.tobaccoId ? String(review.tobaccoId) : null,
      MixId: review.mixId ? String(review.mixId) : null,
      UserId: review.userId ?? null,
      IsAnonymous: review.isAnonymous,
      Rating: review.rating,
      Comment: review.comment ?? null,
      Name: review.isAnonymous ? (review.anonymousName ?? '') : `${review.user?.firstName ?? ''} ${review.user?.lastName ?? ''}`.trim(),
      CreationDate: review.creationDate,
    }));
    const tags = (entity.tobaccoTags ?? []).map((item: any) => ({
      id: String(item.tag.id),
      Name: item.tag.name,
      Color: item.tag.color,
      IsGlobal: item.tag.isGlobal,
    }));

    return {
      id: entity.id,
      Name: entity.name,
      Description: entity.description,
      LineId: String(entity.lineId),
      BrandId: String(entity.brandId),
      HeavinessId: String(entity.heavinessId),
      Rating: entity.rating,
      RatingCount: reviews.length,
      CommentsCount: reviews.filter((review: any) => review.Comment != null).length,
      Image: entity.image
        ? {
            id: entity.image.id,
            Name: entity.image.name,
            Link: entity.image.link,
            Type: entity.image.type,
          }
        : null,
      Brand: entity.brand ? { id: entity.brand.id, Name: entity.brand.name } : null,
      Tags: tags,
      TobaccoTags: (entity.tobaccoTags ?? []).map((item: any) => ({
        Id: String(item.id),
        TagId: String(item.tagId),
        TobaccoId: String(item.tobaccoId),
        IsNew: false,
        IsRemoved: false,
      })),
      Reviews: reviews,
    };
  }
}
