"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const record_entity_1 = require("./entities/record.entity");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
let RecordsService = class RecordsService {
    constructor(recordRepo, auditLogService) {
        this.recordRepo = recordRepo;
        this.auditLogService = auditLogService;
    }
    async create(data) {
        const record = this.recordRepo.create(data);
        const saved = await this.recordRepo.save(record);
        await this.auditLogService.createLog({
            record_id: saved.id,
            user_id: data.entered_by,
            action: 'Create',
        });
        return saved;
    }
    findOne(id) {
        return this.recordRepo.findOne({ where: { id } });
    }
    async findAll({ page = 1, limit = 10, status, q, }) {
        const where = {};
        if (status) {
            where.status = status;
        }
        if (q === 'unassigned') {
            where.assigned_to = (0, typeorm_2.IsNull)();
        }
        if (q === 'assigned') {
            where.assigned_to = (0, typeorm_2.Not)((0, typeorm_2.IsNull)());
        }
        const [data, total] = await this.recordRepo.findAndCount({
            where,
            relations: ['entered_by_user', 'reviewed_by_user', 'locked_by_user', 'assigned_to_user'],
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        const mapdata = data.map(record => {
            var _a, _b, _c, _d;
            const newRecord = Object.assign(Object.assign({}, record), { reviewed_by: ((_a = record.reviewed_by_user) === null || _a === void 0 ? void 0 : _a.username) || null, locked_by: ((_b = record.locked_by_user) === null || _b === void 0 ? void 0 : _b.username) || null, assigned_to: ((_c = record.assigned_to_user) === null || _c === void 0 ? void 0 : _c.username) || null, entered_by: ((_d = record.entered_by_user) === null || _d === void 0 ? void 0 : _d.username) || null });
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
    async reviewRecord(id, userId, status) {
        const record = await this.recordRepo.findOne({ where: { id } });
        if (!record)
            return null;
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
    async lock(id, userId) {
        var _a, _b, _c, _d, _e;
        const record = await this.recordRepo.findOne({ where: { id } });
        if (!record || record.locked_by)
            return null;
        if (record.locked_by) {
            throw new Error('Record locked by another user');
        }
        record.locked_by = userId;
        record.lock_timestamp = new Date();
        await this.recordRepo.save(record);
        const updated = await this.recordRepo.findOne({
            where: { id },
            relations: ['batch', 'entered_by_user', 'reviewed_by_user', 'locked_by_user', 'assigned_to_user'],
        });
        const newRecord = Object.assign(Object.assign({}, updated), { reviewed_by_name: ((_a = updated === null || updated === void 0 ? void 0 : updated.reviewed_by_user) === null || _a === void 0 ? void 0 : _a.username) || null, locked_by_name: ((_b = updated === null || updated === void 0 ? void 0 : updated.locked_by_user) === null || _b === void 0 ? void 0 : _b.username) || null, assigned_to_name: ((_c = updated === null || updated === void 0 ? void 0 : updated.assigned_to_user) === null || _c === void 0 ? void 0 : _c.username) || null, entered_by_name: ((_d = updated === null || updated === void 0 ? void 0 : updated.entered_by_user) === null || _d === void 0 ? void 0 : _d.username) || null, batch_name: ((_e = updated === null || updated === void 0 ? void 0 : updated.batch) === null || _e === void 0 ? void 0 : _e.batch_name) || null });
        delete newRecord.entered_by_user;
        delete newRecord.assigned_to_user;
        delete newRecord.locked_by_user;
        delete newRecord.reviewed_by_user;
        return newRecord;
    }
    async unlock(id, userId) {
        const record = await this.recordRepo.findOne({ where: { id } });
        if (!record) {
            throw new common_1.NotFoundException('Record not found');
        }
        if (record.status !== 'Pending') {
            throw new common_1.BadRequestException('Record is already verified');
        }
        if (record.locked_by !== userId) {
            throw new common_1.ForbiddenException('You cannot unlock a record locked by another user');
        }
        record.locked_by = null;
        record.lock_timestamp = null;
        return this.recordRepo.save(record);
    }
    async assignRecordsToBatch(recordIds, batchId) {
        const records = await this.recordRepo.find({
            where: { id: (0, typeorm_2.In)(recordIds) },
        });
        for (const record of records) {
            record.batch_id = batchId;
        }
        return this.recordRepo.save(records);
    }
    async getRecordsByUser({ userId, page = 1, limit = 10, status, sortBy = 'created_at', }) {
        const where = { assigned_to: userId };
        if (status) {
            where.status = status;
        }
        const [records, total] = await this.recordRepo.findAndCount({
            where,
            relations: ['batch', 'entered_by_user', 'reviewed_by_user', 'locked_by_user', 'assigned_to_user'],
            order: { [sortBy]: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        const mapdata = records.map(record => {
            var _a, _b, _c, _d;
            const newRecord = Object.assign(Object.assign({}, record), { reviewed_by: ((_a = record.reviewed_by_user) === null || _a === void 0 ? void 0 : _a.username) || null, locked_by: ((_b = record.locked_by_user) === null || _b === void 0 ? void 0 : _b.username) || null, assigned_to: ((_c = record.assigned_to_user) === null || _c === void 0 ? void 0 : _c.username) || null, entered_by: ((_d = record.entered_by_user) === null || _d === void 0 ? void 0 : _d.username) || null });
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
    async assignRecord(id, userId) {
        const record = await this.recordRepo.findOne({ where: { id } });
        if (!record)
            throw new Error('Record not found');
        record.assigned_to = userId;
        return this.recordRepo.save(record);
    }
    async getUnassignedRecords() {
        return this.recordRepo.find({
            where: {
                locked_by: (0, typeorm_2.IsNull)(),
                status: 'Pending',
            },
            order: { created_at: 'DESC' },
        });
    }
    async getRecordsWithoutBatch(page = 1, limit = 10) {
        const [data, total] = await this.recordRepo.findAndCount({
            where: { batch_id: (0, typeorm_2.IsNull)() },
            relations: ['entered_by_user', 'reviewed_by_user', 'locked_by_user', 'assigned_to_user'],
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        const mapdata = data.map(record => {
            var _a, _b, _c, _d;
            const newRecord = Object.assign(Object.assign({}, record), { reviewed_by: ((_a = record.reviewed_by_user) === null || _a === void 0 ? void 0 : _a.username) || null, locked_by: ((_b = record.locked_by_user) === null || _b === void 0 ? void 0 : _b.username) || null, assigned_to: ((_c = record.assigned_to_user) === null || _c === void 0 ? void 0 : _c.username) || null, entered_by: ((_d = record.entered_by_user) === null || _d === void 0 ? void 0 : _d.username) || null });
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
    async updateRecord(id, updates, user) {
        const record = await this.recordRepo.findOne({ where: { id } });
        if (!record)
            throw new Error('Record not found');
        if (user.role !== 'VA') {
            throw new Error('Only VAs can edit records');
        }
        if (record.status !== 'Pending') {
            throw new Error('Only records in Pending status can be edited');
        }
        if (record.locked_by !== user.userId) {
            throw new Error('You can only edit records locked by you');
        }
        const editableFields = [
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
                record[field] = updates[field];
            }
        }
        return this.recordRepo.save(record);
    }
    async searchRecords(query, userId) {
        const results = await this.recordRepo.find({
            where: [
                { assigned_to: userId, property_address: (0, typeorm_2.ILike)(`%${query}%`) },
                { assigned_to: userId, borrower_name: (0, typeorm_2.ILike)(`%${query}%`) },
                { assigned_to: userId, apn: (0, typeorm_2.ILike)(`%${query}%`) },
            ],
            relations: ['entered_by_user', 'reviewed_by_user', 'locked_by_user'],
            order: { created_at: 'DESC' },
        });
        const mapdata = results.map(record => {
            var _a, _b, _c, _d;
            const newRecord = Object.assign(Object.assign({}, record), { reviewed_by: ((_a = record.reviewed_by_user) === null || _a === void 0 ? void 0 : _a.username) || null, locked_by: ((_b = record.locked_by_user) === null || _b === void 0 ? void 0 : _b.username) || null, assigned_to: ((_c = record.assigned_to_user) === null || _c === void 0 ? void 0 : _c.username) || null, entered_by: ((_d = record.entered_by_user) === null || _d === void 0 ? void 0 : _d.username) || null });
            delete newRecord.entered_by_user;
            delete newRecord.assigned_to_user;
            delete newRecord.locked_by_user;
            delete newRecord.reviewed_by_user;
            return newRecord;
        });
        return mapdata;
    }
    async searchAllRecords(query) {
        const results = await this.recordRepo.find({
            where: [
                { property_address: (0, typeorm_2.ILike)(`%${query}%`) },
                { borrower_name: (0, typeorm_2.ILike)(`%${query}%`) },
                { apn: (0, typeorm_2.ILike)(`%${query}%`) },
            ],
            relations: ['entered_by_user', 'reviewed_by_user', 'locked_by_user'],
            order: { created_at: 'DESC' },
        });
        const mapdata = results.map(record => {
            var _a, _b, _c, _d;
            const newRecord = Object.assign(Object.assign({}, record), { reviewed_by: ((_a = record.reviewed_by_user) === null || _a === void 0 ? void 0 : _a.username) || null, locked_by: ((_b = record.locked_by_user) === null || _b === void 0 ? void 0 : _b.username) || null, assigned_to: ((_c = record.assigned_to_user) === null || _c === void 0 ? void 0 : _c.username) || null, entered_by: ((_d = record.entered_by_user) === null || _d === void 0 ? void 0 : _d.username) || null });
            delete newRecord.entered_by_user;
            delete newRecord.assigned_to_user;
            delete newRecord.locked_by_user;
            delete newRecord.reviewed_by_user;
            return newRecord;
        });
        return mapdata;
    }
    async findByBatchId(batchId) {
        const results = await this.recordRepo.find({
            where: { batch_id: batchId },
            relations: ['entered_by_user', 'reviewed_by_user', 'locked_by_user'],
            order: { created_at: 'DESC' },
        });
        const mapdata = results.map(record => {
            var _a, _b, _c, _d;
            const newRecord = Object.assign(Object.assign({}, record), { reviewed_by: ((_a = record.reviewed_by_user) === null || _a === void 0 ? void 0 : _a.username) || null, locked_by: ((_b = record.locked_by_user) === null || _b === void 0 ? void 0 : _b.username) || null, assigned_to: ((_c = record.assigned_to_user) === null || _c === void 0 ? void 0 : _c.username) || null, entered_by: ((_d = record.entered_by_user) === null || _d === void 0 ? void 0 : _d.username) || null });
            delete newRecord.entered_by_user;
            delete newRecord.assigned_to_user;
            delete newRecord.locked_by_user;
            delete newRecord.reviewed_by_user;
            return newRecord;
        });
        return mapdata;
    }
};
exports.RecordsService = RecordsService;
exports.RecordsService = RecordsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(record_entity_1.Record)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        audit_logs_service_1.AuditLogsService])
], RecordsService);
//# sourceMappingURL=records.service.js.map