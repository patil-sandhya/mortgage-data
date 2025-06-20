import { Injectable,ForbiddenException,BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,In,IsNull, ILike, Not } from 'typeorm';
import { Record } from './entities/record.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

import { CurrentUserInterface } from '../auth/current-user.interface';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(Record)
    private readonly recordRepo: Repository<Record>,
    private readonly auditLogService: AuditLogsService,
  ) {}

  async create(data: Partial<Record>): Promise<Record> {
  const record = this.recordRepo.create(data);
  const saved = await this.recordRepo.save(record);

  // Log audit action
  await this.auditLogService.createLog({
    record_id: saved.id,
    user_id: data.entered_by!,
    action: 'Create',
  });

  return saved;
}

  findOne(id: string) {
    return this.recordRepo.findOne({ where: { id } });
  } 

 async findAll({
  page = 1,
  limit = 10,
  status,
  q,
}: {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
}) {
  const where: any = {};

  // If status filter is provided
  if (status) {
    where.status = status;
  }

  // If query is "unassigned", check for null assigned_to
  if (q === 'unassigned') {
    where.assigned_to = IsNull();
  }

  if (q === 'assigned') {
    where.assigned_to = Not(IsNull());
  }
  const [data, total] = await this.recordRepo.findAndCount({
    // select: ['id', 'property_address','transaction_date','borrower_name','loan_amount', 'status', 'assigned_to','created_at'],
    where,
    relations: ['entered_by_user', 'reviewed_by_user', 'locked_by_user', 'assigned_to_user'],
    order: { created_at: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });

  // console.log("usss", data)

  const mapdata = data.map(record => {
  const newRecord = {
    ...record,
    reviewed_by: record.reviewed_by_user?.username || null,
  locked_by: record.locked_by_user?.username || null,
  assigned_to: record.assigned_to_user?.username || null,
    entered_by: record.entered_by_user?.username || null,
  };
  delete newRecord.entered_by_user;
  delete newRecord.assigned_to_user;
  delete newRecord.locked_by_user;
  delete newRecord.reviewed_by_user;
  return newRecord;
});
    


  return {
    data:mapdata,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
  }

  // async updateStatus(id: string, status: 'Pending' | 'Verified' | 'Flagged') {
  //   const record = await this.recordRepo.findOne({ where: { id } });
  //   if (!record) {
  //     return null;
  //   }
  //   record.status = status;
  //   return this.recordRepo.save(record);
  // }

  async reviewRecord(
  id: string,
  userId: string,
  status: 'Verified' | 'Flagged',
  
) {
  const record = await this.recordRepo.findOne({ where: { id } });
  if (!record) return null;

  if (record.status !== 'Pending') {
    throw new Error('Record already reviewed');
  }

  await this.auditLogService.createLog({
    record_id: id,
    user_id: userId,
    action: status === 'Verified' ? 'Verify' : 'Flag',
    field_name: 'status',
    old_value: record.status,
    new_value: status,
  });

  record.status = status;
  record.reviewed_by = userId;
  record.reviewed_by_date = new Date();
  record.locked_by = userId;
  record.lock_timestamp = new Date();

  return this.recordRepo.save(record);
}

async lock(id: string, userId: string) {
  const record = await this.recordRepo.findOne({ where: { id } });
  if (!record || record.locked_by) return null;
  if (record.locked_by) {
    throw new Error('Record locked by another user');
  }
  record.locked_by = userId;
  record.lock_timestamp = new Date();
  await this.recordRepo.save(record);

   const updated = await this.recordRepo.findOne({
    where: { id },
    relations: ['batch','entered_by_user', 'reviewed_by_user', 'locked_by_user','assigned_to_user'],
  });
  const newRecord = {
    ...updated,
    reviewed_by_name: updated?.reviewed_by_user?.username || null,
  locked_by_name: updated?.locked_by_user?.username || null,
  assigned_to_name: updated?.assigned_to_user?.username || null,
    entered_by_name: updated?.entered_by_user?.username || null,
    batch_name: updated?.batch?.batch_name || null,
  };
  delete newRecord.entered_by_user;
  delete newRecord.assigned_to_user;
  delete newRecord.locked_by_user;
  delete newRecord.reviewed_by_user;

  return newRecord
}

async unlock(id: string, userId: string) {
  const record = await this.recordRepo.findOne({ where: { id } });

  if (!record) {
    throw new NotFoundException('Record not found');
  }

  if (record.status !== 'Pending') {
    throw new BadRequestException('Record is already verified');
  }

  if (record.locked_by !== userId) {
    throw new ForbiddenException('You cannot unlock a record locked by another user');
  }

  record.locked_by = null;
  record.lock_timestamp = null;

  return this.recordRepo.save(record);
}

async assignRecordsToBatch(recordIds: string[], batchId: string) {
  const records = await this.recordRepo.find({
  where: { id: In(recordIds) },
});
  for (const record of records) {
    record.batch_id = batchId;
  }
  return this.recordRepo.save(records);
}

async getRecordsByUser({
  userId,
  page = 1,
  limit = 10,
  status,
  sortBy = 'created_at',
}: {
  userId: string;
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: 'created_at' | 'updated_at';
}) {
   const where: any = { assigned_to: userId };
if (status) {
    where.status = status;
  }

  const [records, total] = await this.recordRepo.findAndCount({
    where,
    relations: ['batch','entered_by_user', 'reviewed_by_user', 'locked_by_user','assigned_to_user'],
    order: { [sortBy]: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });

   const mapdata = records.map(record => {
  const newRecord = {
    ...record,
    reviewed_by: record.reviewed_by_user?.username || null,
  locked_by: record.locked_by_user?.username || null,
  assigned_to: record.assigned_to_user?.username || null,
    entered_by: record.entered_by_user?.username || null,
  };
  delete newRecord.entered_by_user;
  delete newRecord.assigned_to_user;
  delete newRecord.locked_by_user;
  delete newRecord.reviewed_by_user;
  return newRecord;
});

  return {
    data: mapdata,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
}


// Get assign record by VAs
async assignRecord(id: string, userId: string) {
  const record = await this.recordRepo.findOne({ where: { id } });
  if (!record) throw new Error('Record not found');

  record.assigned_to = userId;
  return this.recordRepo.save(record);
}

async getUnassignedRecords() {
  return this.recordRepo.find({
    where: {
      locked_by: IsNull(),
      status: 'Pending',
    },
    order: { created_at: 'DESC' },
  });
}

async getRecordsWithoutBatch(page = 1, limit = 10) {
  const [data, total] = await this.recordRepo.findAndCount({
    where: { batch_id: IsNull() },
    relations: ['entered_by_user', 'reviewed_by_user', 'locked_by_user', 'assigned_to_user'],
    order: { created_at: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });
   const mapdata = data.map(record => {
  const newRecord = {
    ...record,
    reviewed_by: record.reviewed_by_user?.username || null,
  locked_by: record.locked_by_user?.username || null,
  assigned_to: record.assigned_to_user?.username || null,
    entered_by: record.entered_by_user?.username || null,
  };
  delete newRecord.entered_by_user;
  delete newRecord.assigned_to_user;
  delete newRecord.locked_by_user;
  delete newRecord.reviewed_by_user;
  return newRecord;
});

  return {
    data: mapdata,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

async updateRecord(
  id: string,
  updates: Partial<Record>,
  user: CurrentUserInterface,
) {
  const record = await this.recordRepo.findOne({ where: { id } });
  if (!record) throw new Error('Record not found');

  if (user.role !== 'VA') {
    throw new Error('Only VAs can edit records');
  }

  if (record.status !== 'Pending') {
    throw new Error('Only records in Pending status can be edited');
  }

  if (record.locked_by !== user.userId) {
    throw new Error('You can only edit records locked by you');
  }

  const editableFields: (keyof Record)[] = [
    'property_address',
    'transaction_date',
    'borrower_name',
    'loan_amount',
    'sales_price',
    'down_payment',
    'apn',
  ];

  for (const field of editableFields) {
    if (updates[field] !== undefined && updates[field] !== record[field]) {
      await this.auditLogService.createLog({
        record_id: id,
        user_id: user.userId,
        action: 'Edit',
        field_name: field,
        old_value: String(record[field]),
        new_value: String(updates[field]),
      });

     (record as any)[field] = updates[field];
    }
  }

  return this.recordRepo.save(record);
}

async searchRecords(query: string, userId: string) {
  const results = await this.recordRepo.find({
    where: [
      { assigned_to: userId, property_address: ILike(`%${query}%`) },
      { assigned_to: userId, borrower_name: ILike(`%${query}%`) },
      { assigned_to: userId, apn: ILike(`%${query}%`) },
    ],
    relations: ['entered_by_user', 'reviewed_by_user', 'locked_by_user'],
    order: { created_at: 'DESC' },
  });
   const mapdata = results.map(record => {
  const newRecord = {
    ...record,
    reviewed_by: record.reviewed_by_user?.username || null,
  locked_by: record.locked_by_user?.username || null,
  assigned_to: record.assigned_to_user?.username || null,
    entered_by: record.entered_by_user?.username || null,
  };
  delete newRecord.entered_by_user;
  delete newRecord.assigned_to_user;
  delete newRecord.locked_by_user;
  delete newRecord.reviewed_by_user;
  return newRecord;
});
return mapdata
}

async searchAllRecords(query: string) {
  const results = await this.recordRepo.find({
    where: [
      { property_address: ILike(`%${query}%`) },
      { borrower_name: ILike(`%${query}%`) },
      { apn: ILike(`%${query}%`) },
    ],
    relations: ['entered_by_user', 'reviewed_by_user', 'locked_by_user'],
    order: { created_at: 'DESC' },
  });

  const mapdata = results.map(record => {
  const newRecord = {
    ...record,
    reviewed_by: record.reviewed_by_user?.username || null,
  locked_by: record.locked_by_user?.username || null,
  assigned_to: record.assigned_to_user?.username || null,
    entered_by: record.entered_by_user?.username || null,
  };
  delete newRecord.entered_by_user;
  delete newRecord.assigned_to_user;
  delete newRecord.locked_by_user;
  delete newRecord.reviewed_by_user;
  return newRecord;
});
  return mapdata;
}

async findByBatchId(batchId: string) {
  const results = await this.recordRepo.find({
    where: { batch_id: batchId },
    relations: ['entered_by_user', 'reviewed_by_user', 'locked_by_user'], 
    order: { created_at: 'DESC' },
  });

   const mapdata = results.map(record => {
  const newRecord = {
    ...record,
    reviewed_by: record.reviewed_by_user?.username || null,
  locked_by: record.locked_by_user?.username || null,
  assigned_to: record.assigned_to_user?.username || null,
    entered_by: record.entered_by_user?.username || null,
  };
  delete newRecord.entered_by_user;
  delete newRecord.assigned_to_user;
  delete newRecord.locked_by_user;
  delete newRecord.reviewed_by_user;
  return newRecord;
});
  return mapdata;
}

}