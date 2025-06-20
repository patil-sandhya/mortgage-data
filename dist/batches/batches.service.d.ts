import { Repository } from 'typeorm';
import { Batch } from './entities/batch.entity';
export declare class BatchesService {
    private readonly batchRepo;
    constructor(batchRepo: Repository<Batch>);
    createBatch(data: Partial<Batch>): Promise<Batch>;
    findAll({ page, limit, q, }: {
        page?: number;
        limit?: number;
        q?: string;
    }): Promise<{
        data: Batch[];
        total: number;
        page: number;
        lastPage: number;
    }>;
}
