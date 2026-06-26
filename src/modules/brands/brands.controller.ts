import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandRequestDto, UpdateBrandRequestDto } from './brands.dto';
import { GetAllRequestDto } from '../../common/dto/get-all-request.dto';

@ApiTags('Brand')
@Controller('api/Brand')
export class BrandsController {
  constructor(private readonly service: BrandsService) {}

  @Get('GetById/:id')
  getById(@Param('id') id: string) {
    return this.service.getById(Number(id));
  }

  @Get('GetAll')
  getAll(@Query() request: GetAllRequestDto) {
    return this.service.getAll(request);
  }

  @Get('GetOptions')
  getOptions() {
    return this.service.getOptions();
  }

  @Post('Create')
  create(@Body() request: CreateBrandRequestDto) {
    return this.service.create(request);
  }

  @Put('Update')
  update(@Body() request: UpdateBrandRequestDto) {
    return this.service.update(request);
  }

  @Delete('Remove/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
