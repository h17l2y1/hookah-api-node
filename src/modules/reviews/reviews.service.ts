import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../database/prisma.service';
import {CreateReviewRequestDto} from './reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(request: CreateReviewRequestDto): Promise<void> {
    const review = await this.prisma.review.create({
      data: {
        tobaccoId: request.TobaccoId ?? null,
        mixId: request.MixId ?? null,
        userId: request.UserId ? String(request.UserId) : null,
        anonymousName: request.Name ?? null,
        isAnonymous: request.IsAnonymous,
        rating: request.Rating,
        comment: request.Comment ?? null,
      },
    });

    if (request.TobaccoId != null) {
      await this.updateTobaccoRating(request.TobaccoId);
    }

    if (request.MixId != null) {
      await this.updateMixRating(request.MixId);
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
