import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GetHeavinessResponseDto } from './heaviness.dto';

@Injectable()
export class HeavinessService {
  constructor(private readonly prisma: PrismaService) {}

  async getOptions(): Promise<GetHeavinessResponseDto[]> {
    const entities = await this.prisma.heaviness.findMany({ orderBy: { value: 'asc' } });
    return entities.map((entity) => ({ id: entity.id, name: entity.name }));
  }
}
