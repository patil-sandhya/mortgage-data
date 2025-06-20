import { UsersService } from './users.service';
import { CreateUserDto } from './dto/user.dto';
import { CurrentUserInterface } from '../auth/current-user.interface';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(body: CreateUserDto): Promise<import("./entities/user.entity").User>;
    getMe(user: CurrentUserInterface): CurrentUserInterface;
    getAllVAUsers(): Promise<import("./entities/user.entity").User[]>;
    getUser(id: string): Promise<import("./entities/user.entity").User | null>;
}
