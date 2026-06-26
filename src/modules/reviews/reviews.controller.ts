import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewRequestDto } from './reviews.dto';

@ApiTags('Review')
@Controller('api/Review')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @Post('Create')
  create(@Body() request: CreateReviewRequestDto) {
    return this.service.create(request);
  }
}
