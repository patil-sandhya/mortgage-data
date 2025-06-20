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
exports.AuditLogsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("./entities/audit-log.entity");
let AuditLogsService = class AuditLogsService {
    constructor(auditRepo) {
        this.auditRepo = auditRepo;
    }
    createLog(data) {
        const log = this.auditRepo.create(data);
        return this.auditRepo.save(log);
    }
    async findAll({ page = 1, limit = 10, }) {
        const [data, total] = await this.auditRepo.findAndCount({
            relations: ['user', 'record'],
            order: { timestamp: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        const mapdata = data.map(item => {
            var _a, _b, _c;
            const newRecord = Object.assign(Object.assign({}, item), { borrower_name: (_a = item === null || item === void 0 ? void 0 : item.record) === null || _a === void 0 ? void 0 : _a.borrower_name, property_address: (_b = item === null || item === void 0 ? void 0 : item.record) === null || _b === void 0 ? void 0 : _b.property_address, user_name: (_c = item === null || item === void 0 ? void 0 : item.user) === null || _c === void 0 ? void 0 : _c.username });
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
};
exports.AuditLogsService = AuditLogsService;
exports.AuditLogsService = AuditLogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditLogsService);
//# sourceMappingURL=audit-logs.service.js.map