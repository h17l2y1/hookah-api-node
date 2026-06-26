import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagRequestDto, UpdateTagRequestDto } from './tags.dto';
import { GetAllRequestDto } from '../../common/dto/get-all-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Tag')
@Controller('api/Tag')
export class TagsController {
  constructor(private readonly service: TagsService) {}

  @Get('GetById/:id')
  getById(@Param('id') id: string) {
    return this.service.getById(Number(id));
  }

  @Get('GetAll')
  getAll(@Query() request: GetAllRequestDto) {
    return this.service.getAll(request);
  }

  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('Create')
  create(@Body() request: CreateTagRequestDto) {
    return this.service.create(request);
  }

  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('Update')
  update(@Body() request: UpdateTagRequestDto) {
    return this.service.update(request);
  }

  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('Remove/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }

  @Get('GetOptions')
  getOptions() {
    return this.service.getOptions();
  }

  @Get('GetGlobalOptions')
  getGlobalOptions() {
    return this.service.getGlobalOptions();
  }
}
