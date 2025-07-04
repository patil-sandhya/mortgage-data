import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
export declare class AuditLogsService {
    private readonly auditRepo;
    constructor(auditRepo: Repository<AuditLog>);
    createLog(data: Partial<AuditLog>): Promise<AuditLog>;
    findAll({ page, limit, }: {
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            borrower_name: string | undefined;
            property_address: string | undefined;
            user_name: string | undefined;
            id: string;
            record_id: string;
            user_id: string;
            action: "Create" | "Edit" | "Verify" | "Flag";
            field_name: string;
            old_value: string;
            new_value: string;
            timestamp: Date;
            record?: import("../records/entities/record.entity").Record;
            user?: import("../users/entities/user.entity").User;
        }[];
        total: number;
        page: number;
        lastPage: number;
    }>;
}
