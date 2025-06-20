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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Batch = exports.BatchType = void 0;
const typeorm_1 = require("typeorm");
var BatchType;
(function (BatchType) {
    BatchType["DAILY"] = "Daily";
    BatchType["WEEKLY"] = "Weekly";
})(BatchType || (exports.BatchType = BatchType = {}));
let Batch = class Batch {
};
exports.Batch = Batch;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Batch.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Batch.prototype, "batch_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: BatchType }),
    __metadata("design:type", String)
], Batch.prototype, "batch_type", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Batch.prototype, "created_at", void 0);
exports.Batch = Batch = __decorate([
    (0, typeorm_1.Entity)('batches')
], Batch);
//# sourceMappingURL=batch.entity.js.map