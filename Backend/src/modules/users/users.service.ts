import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async checkUser(userId: string) {
    const currentUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!currentUser) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return {
      user: {
        username: currentUser.username,
        lastname: currentUser.lastname,
        email: currentUser.email,
        role: currentUser.role,
      },
    };
  }
}
