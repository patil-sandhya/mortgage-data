"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const batches_service_1 = require("./batches.service");
const batches_controller_1 = require("./batches.controller");
const batch_entity_1 = require("./entities/batch.entity");
let BatchesModule = class BatchesModule {
};
exports.BatchesModule = BatchesModule;
exports.BatchesModule = BatchesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([batch_entity_1.Batch])],
        providers: [batches_service_1.BatchesService],
        controllers: [batches_controller_1.BatchesController],
        exports: [typeorm_1.TypeOrmModule],
    })
], BatchesModule);
//# sourceMappingURL=batches.module.js.map