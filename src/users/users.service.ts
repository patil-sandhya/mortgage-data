import { Injectable, BadRequestException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import {CreateUserDto } from "./dto/user.dto"
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findOne(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.userRepository.findOne({ where: { username: dto.username } });
    if (existing) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = this.userRepository.create({
      username: dto.username,
      password_hash: hashedPassword,
      role: dto.role,
    });

    return this.userRepository.save(newUser);
  }

  async findAllVAUsers() {
  return this.userRepository.find({
    where: { role: 'VA' },
    select: ['id', 'username'], 
    order: { created_at: 'DESC' }
  });
}
}