import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from "./dto/user.dto";
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    findOne(id: string): Promise<User | null>;
    createUser(dto: CreateUserDto): Promise<User>;
    findAllVAUsers(): Promise<User[]>;
}
