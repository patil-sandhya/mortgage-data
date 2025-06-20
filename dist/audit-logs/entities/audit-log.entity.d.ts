import { Record } from '../../records/entities/record.entity';
import { User } from '../../users/entities/user.entity';
export declare class AuditLog {
    id: string;
    record_id: string;
    user_id: string;
    action: 'Create' | 'Edit' | 'Verify' | 'Flag';
    field_name: string;
    old_value: string;
    new_value: string;
    timestamp: Date;
    record?: Record;
    user?: User;
}
