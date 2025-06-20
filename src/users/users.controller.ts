import { Controller, Get, Param, Post, UseGuards, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {CreateUserDto } from './dto/user.dto'
import { CurrentUser } from '../auth/current-user.decorator';
import { CurrentUserInterface } from '../auth/current-user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  register(@Body() body: CreateUserDto) {
    return this.usersService.createUser(body);
  }
  
   @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: CurrentUserInterface) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('va-users')
  getAllVAUsers() {
    return this.usersService.findAllVAUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  

}
