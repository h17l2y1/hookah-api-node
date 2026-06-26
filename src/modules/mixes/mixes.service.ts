import {Injectable, NotFoundException} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {GetAllRequestDto} from '../../common/dto/get-all-request.dto';
import {GetAllResponseDto} from '../../common/dto/get-all-response.dto';
import {parseRequiredInt} from '../../common/utils/ids';
import {getPaging, sortDirection} from '../../common/utils/query';
import {PrismaService} from '../../database/prisma.service';
import {MixRequestDto, MixResponseDto} from './mixes.dto';

@Injectable()
export class MixesService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: number): Promise<MixResponseDto> {
    const entity = await this.prisma.mix.findUnique({
      where: { id },
      include: {
        reviews: { include: { user: true } },
        tobaccoMixes: true,
      },
    });
    if (!entity) {
      throw new NotFoundException(`${id} doesn't exist`);
    }

    return this.mapMix(entity);
  }

  async create(request: MixRequestDto): Promise<void> {
    const mix = await this.prisma.mix.create({
      data: { name: request.Name.trim() },
    });

    if (request.TobaccoMixes.length) {
      await this.prisma.tobaccoMix.createMany({
        data: request.TobaccoMixes.map((item) => ({
          tobaccoId: parseRequiredInt(item.TobaccoId),
          percent: item.Percent,
          mixId: mix.id,
        })),
      });
    }
  }

  async getAll(request: GetAllRequestDto): Promise<GetAllResponseDto<MixResponseDto>> {
    const where: Prisma.MixWhereInput = request.Name
      ? { name: { contains: request.Name.trim() } }
      : {};

    const total = await this.prisma.mix.count({ where });
    if (!total) {
      return new GetAllResponseDto(0, []);
    }

    const { skip, take } = getPaging(request);
    const entities = await this.prisma.mix.findMany({
      where,
      include: {
        reviews: { include: { user: true } },
        tobaccoMixes: true,
      },
      orderBy: [{ name: sortDirection(request.SortBy) }],
      skip,
      take,
    });

    return new GetAllResponseDto(total, entities.map((entity) => this.mapMix(entity)));
  }

  private mapMix(entity: any): MixResponseDto {
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

    return {
      id: entity.id,
      Name: entity.name,
      Rating: entity.rating,
      RatingCount: reviews.length,
      CommentsCount: reviews.filter((review: any) => review.Comment != null).length,
      Reviews: reviews,
      TobaccoMixes: (entity.tobaccoMixes ?? []).map((item: any) => ({
        id: item.id,
        TobaccoId: String(item.tobaccoId),
        Percent: item.percent,
      })),
    };
  }
}
