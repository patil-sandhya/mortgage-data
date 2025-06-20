import { Controller,Get,Query, Post, UseGuards, Body } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  @Post()
logAction(@Body() body: { user_id: string; action: 'Create' | 'Edit' | 'Verify' | 'Flag'; timestamp: Date }) {
  return this.service.createLog(body);
}

@UseGuards(JwtAuthGuard)
@Get()
getAllLogs(
   @Query('page') page?: number,
    @Query('limit') limit?: number,
) {
  return this.service.findAll({ page, limit });
}
}
