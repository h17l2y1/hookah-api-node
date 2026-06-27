import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCountryRequestDto, GetCountryResponseDto, UpdateCountryRequestDto } from './countries.dto';

@Injectable()
export class CountriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: number): Promise<GetCountryResponseDto> {
    const entity = await this.prisma.country.findUnique({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`${id} doesn't exist`);
    }

    return { id: entity.id, name: entity.name };
  }

  async getOptions(): Promise<GetCountryResponseDto[]> {
    const entities = await this.prisma.country.findMany({ orderBy: { name: 'asc' } });
    return entities.map((entity) => ({ id: entity.id, name: entity.name }));
  }

  async create(request: CreateCountryRequestDto): Promise<void> {
    await this.prisma.country.create({ data: { name: request.name.trim() } });
  }

  async update(request: UpdateCountryRequestDto): Promise<void> {
    await this.prisma.country.update({
      where: { id: request.id },
      data: { name: request.name.trim() },
    });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.country.delete({ where: { id } });
  }
}
