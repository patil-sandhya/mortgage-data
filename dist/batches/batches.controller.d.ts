import { BatchesService } from './batches.service';
import { Batch } from './entities/batch.entity';
export declare class BatchesController {
    private readonly service;
    constructor(service: BatchesService);
    create(body: {
        batch_name: string;
        batch_type: 'Daily' | 'Weekly';
    }): Promise<Batch>;
    findAll(page?: number, limit?: number, q?: string): Promise<{
        data: Batch[];
        total: number;
        page: number;
        lastPage: number;
    }>;
}
