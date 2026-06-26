import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LinesService } from './lines.service';
import { CreateLineRequestDto, UpdateLineRequestDto } from './lines.dto';

@ApiTags('Line')
@Controller('api/Line')
export class LinesController {
  constructor(private readonly service: LinesService) {}

  @Get('GetById/:id')
  getById(@Param('id') id: string) {
    return this.service.getById(Number(id));
  }

  @Post('Create')
  create(@Body() request: CreateLineRequestDto) {
    return this.service.create(request);
  }

  @Put('Update')
  update(@Body() request: UpdateLineRequestDto) {
    return this.service.update(request);
  }

  @Delete('Remove/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }

  @Get('GetLinesByBrandId/:id')
  getLinesByBrandId(@Param('id') id: string) {
    return this.service.getLinesByBrandId(Number(id));
  }
}
