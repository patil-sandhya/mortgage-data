import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum BatchType {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
}

@Entity('batches')
export class Batch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  batch_name!: string;

  @Column({ type: 'enum', enum: BatchType })
  batch_type!: BatchType;

  @CreateDateColumn()
  created_at!: Date;
}
