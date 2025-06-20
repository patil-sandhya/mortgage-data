import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Batch } from "../../batches/entities/batch.entity";
import { User } from "../../users/entities/user.entity";

@Entity("records")
export class Record {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  property_address!: string;

  @Column({ type: "date" })
  transaction_date!: Date;

  @Column()
  borrower_name!: string;

  @Column({ nullable: true })
  loan_officer_name!: string;

  @Column("decimal")
  loan_amount!: number;

  @Column("decimal", { nullable: true })
  nmls_id!: number;

  @Column("decimal", { nullable: true })
  loan_term!: number;

  @Column("decimal")
  sales_price!: number;

  @Column("decimal")
  down_payment!: number;

  @Column()
  apn!: string;

  @Column({ default: "Pending" })
  status!: "Pending" | "Verified" | "Flagged";

  @Column({ type: "varchar", nullable: true })
  locked_by!: string | null;

  @Column({ nullable: true, type: "timestamp" })
  lock_timestamp!: Date | null;

  @Column({ nullable: true })
  entered_by!: string;

  @Column({ type: "timestamp" })
  entered_by_date!: Date;

  @Column({ nullable: true })
  reviewed_by!: string;

  @Column({ nullable: true, type: "timestamp" })
  reviewed_by_date!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ type: "uuid", nullable: true })
  assigned_to!: string | null;

  @Column({type: "uuid", nullable: true })
  batch_id?: string;

  @ManyToOne(() => Batch, { nullable: true })
  @JoinColumn({ name: "batch_id" })
  batch?: Batch;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "entered_by" })
  entered_by_user?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "assigned_to" })
  assigned_to_user?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "reviewed_by" })
  reviewed_by_user?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "locked_by" })
  locked_by_user?: User;
}
