import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CountriesService } from './countries.service';
import { CreateCountryRequestDto, UpdateCountryRequestDto } from './countries.dto';

@ApiTags('Country')
@Controller('api/Country')
export class CountriesController {
  constructor(private readonly service: CountriesService) {}

  @Get('GetById/:id')
  getById(@Param('id') id: string) {
    return this.service.getById(Number(id));
  }

  @Get('GetOptions')
  getOptions() {
    return this.service.getOptions();
  }

  @Post('Create')
  create(@Body() request: CreateCountryRequestDto) {
    return this.service.create(request);
  }

  @Put('Update')
  update(@Body() request: UpdateCountryRequestDto) {
    return this.service.update(request);
  }

  @Delete('Remove/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
