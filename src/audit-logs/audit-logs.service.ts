import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  createLog(data: Partial<AuditLog>) {
    const log = this.auditRepo.create(data);
    return this.auditRepo.save(log);
  }

 async findAll(
  {
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}
 ) {
  // return this.auditRepo.find({
  //   order: { timestamp: 'DESC' },
  // });
  const [data, total] = await this.auditRepo.findAndCount({
    relations: ['user', 'record'],
    order: { timestamp: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });

  // console.log("usss", data)

  const mapdata = data.map(item => {
  const newRecord = {
    ...item,
    borrower_name: item?.record?.borrower_name,
    property_address: item?.record?.property_address,
    user_name: item?.user?.username,  
  };
  delete newRecord.record;
  delete newRecord.user;
  return newRecord;
});
    


  return {
    data: mapdata,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
}
  
}