import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ImagesService } from './images.service';
import { CreateImageRequestDto, UpdateImageRequestDto } from './images.dto';

@ApiTags('Image')
@Controller('api/Image')
export class ImagesController {
  constructor(private readonly service: ImagesService) {}

  @Get('GetById/:id')
  getById(@Param('id') id: string) {
    return this.service.getById(Number(id));
  }

  @Post('Create')
  create(@Body() request: CreateImageRequestDto) {
    return this.service.create(request);
  }

  @Put('Update')
  update(@Body() request: UpdateImageRequestDto) {
    return this.service.update(request);
  }

  @Delete('Remove/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
