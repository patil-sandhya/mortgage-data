import { Injectable,BadRequestException } from '@nestjs/common';
import { InjectRepository,  } from '@nestjs/typeorm';
import { Repository,  } from 'typeorm';
import { Batch } from './entities/batch.entity';

@Injectable()
export class BatchesService {
  constructor(
    @InjectRepository(Batch)
    private readonly batchRepo: Repository<Batch>,
  ) {}

 async createBatch(data: Partial<Batch>) {
  const existing = await this.batchRepo.findOne({
    where: { batch_name: data.batch_name },
  });

  if (existing) {
    throw new BadRequestException('Batch name already exists');
  }

  const batch = this.batchRepo.create(data);
  return this.batchRepo.save(batch);
}

 async findAll({
  page = 1,
  limit = 10,
  q,
}: {
  page?: number;
  limit?: number;
  q?: string;
}) {
    const where: any = {};
if (q ) {
    where.batch_type = q;
  }

  const [data, total] = await this.batchRepo.findAndCount({
    where,
    order: { created_at: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });
     return {
    data,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
  }
}