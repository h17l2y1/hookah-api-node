import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetAllRequestDto } from '../../common/dto/get-all-request.dto';
import { MixesService } from './mixes.service';
import { MixRequestDto } from './mixes.dto';

@ApiTags('Mix')
@Controller('api/Mix')
export class MixesController {
  constructor(private readonly service: MixesService) {}

  @Get('GetById/:id')
  getById(@Param('id') id: string) {
    return this.service.getById(Number(id));
  }

  @Post('Create')
  create(@Body() request: MixRequestDto) {
    return this.service.create(request);
  }

  @Get('GetAll')
  getAll(@Query() request: GetAllRequestDto) {
    return this.service.getAll(request);
  }
}
