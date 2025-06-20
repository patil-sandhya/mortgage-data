import { Controller,Query, Post,UseGuards, Body, Get } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { Batch } from './entities/batch.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('batches')
export class BatchesController {
  constructor(private readonly service: BatchesService) {}

  @Post()
create(@Body() body: { batch_name: string; batch_type: 'Daily' | 'Weekly' }) {
  return this.service.createBatch(body as Partial<Batch>);
}

  @Get()
  findAll(
     @Query('page') page?: number,
      @Query('limit') limit?: number,
      @Query('q') q?: string
  ) {
    return this.service.findAll({ page, limit, q });
  }
}