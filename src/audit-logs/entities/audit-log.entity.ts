import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn  } from 'typeorm';
import { Record } from '../../records/entities/record.entity'
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  record_id!: string;

  @Column({ nullable: true })
  user_id!: string;

  @Column()
  action!: 'Create' | 'Edit' | 'Verify' | 'Flag';

  @Column({ nullable: true })
  field_name!: string;

  @Column({ nullable: true, type: 'text' })
  old_value!: string;

  @Column({ nullable: true, type: 'text' })
  new_value!: string;

  @CreateDateColumn()
  timestamp!: Date;

  @ManyToOne(() => Record, { eager: true }) 
  @JoinColumn({ name: 'record_id' })
  record?: Record;

  @ManyToOne(() => User, { eager: true })  
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
