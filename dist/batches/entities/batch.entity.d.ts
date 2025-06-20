export declare enum BatchType {
    DAILY = "Daily",
    WEEKLY = "Weekly"
}
export declare class Batch {
    id: string;
    batch_name: string;
    batch_type: BatchType;
    created_at: Date;
}
