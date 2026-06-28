import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../database/prisma.service';
import {CreateReviewRequestDto} from './reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(request: CreateReviewRequestDto): Promise<void> {
    const targetWhere = request.tobaccoId != null
      ? { tobaccoId: request.tobaccoId }
      : { mixId: request.mixId };
    const identityWhere = request.userId
      ? { userId: String(request.userId) }
      : { anonymousName: request.name ?? null };

    const existingReview = await this.prisma.review.findFirst({
      where: {
        ...targetWhere,
        ...identityWhere,
      },
    });

    const reviewData = {
      tobaccoId: request.tobaccoId ?? null,
      mixId: request.mixId ?? null,
      userId: request.userId ? String(request.userId) : null,
      anonymousName: request.name ?? null,
      isAnonymous: request.isAnonymous,
      rating: request.rating,
      sweetness: request.sweetness ?? 0,
      sourness: request.sourness ?? 0,
      freshness: request.freshness ?? 0,
      flavorBrightness: request.flavorBrightness ?? 0,
      strength: request.strength ?? 0,
      heatResistance: request.heatResistance ?? 0,
      smokiness: request.smokiness ?? 0,
      comment: request.comment ?? null,
    };

    const review = existingReview
      ? await this.prisma.review.update({
        where: { id: existingReview.id },
        data: reviewData,
      })
      : await this.prisma.review.create({
        data: reviewData,
      });

    if (request.tobaccoId != null) {
      await this.updateTobaccoRating(request.tobaccoId);
    }

    if (request.mixId != null) {
      await this.updateMixRating(request.mixId);
    }

    return review ? undefined : undefined;
  }

  private async updateTobaccoRating(tobaccoId: number): Promise<void> {
    const aggregation = await this.prisma.review.aggregate({
      where: { tobaccoId },
      _avg: { rating: true },
    });
    const tobacco = await this.prisma.tobacco.findUnique({ where: { id: tobaccoId } });
    if (!tobacco) {
      return;
    }

    await this.prisma.tobacco.update({
      where: { id: tobaccoId },
      data: { rating: Math.round((aggregation._avg.rating ?? 0) * 100) / 100 },
    });
  }

  private async updateMixRating(mixId: number): Promise<void> {
    const aggregation = await this.prisma.review.aggregate({
      where: { mixId },
      _avg: { rating: true },
    });
    const mix = await this.prisma.mix.findUnique({ where: { id: mixId } });
    if (!mix) {
      return;
    }

    await this.prisma.mix.update({
      where: { id: mixId },
      data: { rating: Math.round((aggregation._avg.rating ?? 0) * 100) / 100 },
    });
  }
}
