import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetAllRequestDto } from '../../common/dto/get-all-request.dto';
import { TobaccosService } from './tobaccos.service';
import { CreateTobaccoRequestDto, UpdateTobaccoRequestDto } from './tobaccos.dto';

@ApiTags('Tobacco')
@Controller('api/Tobacco')
export class TobaccosController {
  constructor(private readonly service: TobaccosService) {}

  @Get('GetById/:id')
  getById(@Param('id') id: string) {
    return this.service.getById(Number(id));
  }

  @Get('GetAll')
  getAll(@Query() request: GetAllRequestDto) {
    return this.service.getAll(request);
  }

  @Post('Create')
  create(@Body() request: CreateTobaccoRequestDto) {
    return this.service.create(request);
  }

  @Put('Update')
  update(@Body() request: UpdateTobaccoRequestDto) {
    return this.service.update(request);
  }

  @Delete('Remove/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }

  @Get('GetByBrandId/:id')
  getByBrandId(@Param('id') id: string) {
    return this.service.getByBrandId(Number(id));
  }
}
