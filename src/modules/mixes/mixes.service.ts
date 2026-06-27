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
      data: { name: request.name.trim() },
    });

    if (request.tobaccoMixes.length) {
      await this.prisma.tobaccoMix.createMany({
        data: request.tobaccoMixes.map((item) => ({
          tobaccoId: parseRequiredInt(item.tobaccoId),
          percent: item.percent,
          mixId: mix.id,
        })),
      });
    }
  }

  async getAll(request: GetAllRequestDto): Promise<GetAllResponseDto<MixResponseDto>> {
    const where: Prisma.MixWhereInput = request.name
      ? { name: { contains: request.name.trim() } }
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
      orderBy: [{ name: sortDirection(request.sortBy) }],
      skip,
      take,
    });

    return new GetAllResponseDto(total, entities.map((entity) => this.mapMix(entity)));
  }

  private mapMix(entity: any): MixResponseDto {
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

    return {
      id: entity.id,
      name: entity.name,
      rating: entity.rating,
      ratingCount: reviews.length,
      commentsCount: reviews.filter((review: any) => review.comment != null).length,
      reviews,
      tobaccoMixes: (entity.tobaccoMixes ?? []).map((item: any) => ({
        id: item.id,
        tobaccoId: String(item.tobaccoId),
        percent: item.percent,
      })),
    };
  }
}
