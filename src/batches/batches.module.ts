import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchesService } from './batches.service';
import { BatchesController } from './batches.controller';
import { Batch } from './entities/batch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Batch])],
  providers: [BatchesService],
  controllers: [BatchesController],
  exports: [TypeOrmModule], // export if used in other modules
})
export class BatchesModule {}
