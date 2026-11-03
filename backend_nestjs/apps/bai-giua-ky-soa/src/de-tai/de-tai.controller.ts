import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { DeTaiService } from './de-tai.service';
import { CreateDeTaiDto } from './dto/create-de-tai.dto';
import { UpdateDeTaiDto } from './dto/update-de-tai.dto';

@Controller('de-tai')
export class DeTaiController {
  constructor(private readonly deTaiService: DeTaiService) {}

  //POST /de-tai
  @Post()
  createDeTai(@Body() body: CreateDeTaiDto) {
    return this.deTaiService.createDeTai(body);
  }

  //GET /de-tai
  @Get()
  getAllDeTai() {
    return this.deTaiService.getAllDeTai();
  }

  //GET /de-tai/:id
  @Get(':id')
  getDeTaiById(@Param('id', ParseIntPipe) id: number) {
    return this.deTaiService.findOne(id);
  }

  //PUT /de-tai/:id
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateDeTaiDto) {
    return this.deTaiService.update(id, body);
  }

  //DELETE /de-tai/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.deTaiService.remove(id);
  }
}
