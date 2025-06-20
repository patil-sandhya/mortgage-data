import { Controller,Query, Get,ForbiddenException, Post,UseGuards, Body, Param, Put } from '@nestjs/common';
import { RecordsService } from './records.service';
import { Record } from './entities/record.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CurrentUserInterface } from '../auth/current-user.interface';

@UseGuards(JwtAuthGuard)
@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

   @Post()
  create(
    @Body() body: Partial<Record>,
    @CurrentUser() user: CurrentUserInterface
  ) {
    // Inject the entered_by and entered_by_date from token/user context
    return this.recordsService.create({
      ...body,
      entered_by: user.userId!,
      entered_by_date: new Date()
    });
  }

  @Put('assign-batch')
assignBatch(
  @Body() body: { recordIds: string[]; batchId: string }
) {
  return this.recordsService.assignRecordsToBatch(body.recordIds, body.batchId);
}
 

  // @Put(':id/lock')
  // lock(@Param('id') id: string, @Body('userId') userId: string) {
  //   return this.recordsService.lock(id, userId);
  // }

//   @Put(':id/review')
// reviewRecord(
//   @Param('id') id: string,
//   @Body('status') status: 'Verified' | 'Flagged',
//   @Body('reviewerId') reviewerId: string,
// ) {
//   return this.recordsService.reviewRecord(id, status, reviewerId);
// }

@Put(':id/review')
reviewRecord(
  @Param('id') id: string,
  @Body('status') status: 'Verified' | 'Flagged',
  @CurrentUser() user: CurrentUserInterface
) {
   if (user.role !== 'VA') {
    throw new ForbiddenException('Only VA can edit the record');
  }
  return this.recordsService.reviewRecord(id, user.userId, status);
}

@Put(':id')
async updateRecord(
  @Param('id') id: string,
  @Body() body: Partial<Record>,
  @CurrentUser() user: CurrentUserInterface,
) {
  return this.recordsService.updateRecord(id, body, user);
}

@Put(':id/lock')
lock(@Param('id') id: string, @CurrentUser() user: CurrentUserInterface) {
  if (user.role !== 'VA') {
    throw new ForbiddenException(`Only VA can lock the record ${user.role} ${user.username}`);
  }
  return this.recordsService.lock(id, user.userId);
}

@Put(':id/unlock')
unlock(
  @Param('id') id: string,
  @CurrentUser() user: CurrentUserInterface
) {
  return this.recordsService.unlock(id, user.userId);
}

  // @Put(':id/status')
  // updateStatus(
  //   @Param('id') id: string,
  //   @Body('status') status: 'Pending' | 'Verified' | 'Flagged'
  // ) {
  //   return this.recordsService.updateStatus(id, status);
  // }

  

@Get('my')
getMyRecords(
  @Query('page') page: number,
  @Query('limit') limit: number,
  @Query('status') status: string,
  @Query('sortBy') sortBy: 'created_at' | 'updated_at',
  @CurrentUser() user: CurrentUserInterface
) {
  return this.recordsService.getRecordsByUser({userId:user.userId, page, limit,  status,sortBy});
}

@Put(':id/assign')
assignRecord(
  @Param('id') id: string,
  @Body() body: { userId: string}
) {
  return this.recordsService.assignRecord(id, body.userId);
}

@Get('unassigned')
getUnassignedRecords() {
  return this.recordsService.getUnassignedRecords();
}

@Get('without-batch')
getRecordsWithoutBatch(
  @Query('page') page = 1,
  @Query('limit') limit = 10,
) {
  return this.recordsService.getRecordsWithoutBatch(Number(page), Number(limit));
}

@Get('search-all')
  searchAllRecords(
    @Query('q') query: string,
    @CurrentUser() user: CurrentUserInterface
  ) {
    if (user.role == 'VA') {
    throw new ForbiddenException(`Only Admin can fetch the record`);
  }
    return this.recordsService.searchAllRecords(query);
  }

@Get('search')
  searchRecords(
    @Query('q') query: string,
    @CurrentUser() user: CurrentUserInterface
  ) {
    return this.recordsService.searchRecords(query, user.userId);
  }

  

  @Get()
  findAll(
    @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('status') status?: string,
  @Query('q') q?: string
  ) {
    return this.recordsService.findAll({ page, limit, status, q });
  }
  @Get('batch/:id')
getRecordsByBatch(@Param('id') batchId: string) {
  return this.recordsService.findByBatchId(batchId);
}

   @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recordsService.findOne(id);
  }
}