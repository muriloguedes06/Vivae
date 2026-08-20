import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

interface TokenPayload {
  sub: string;
  email: string;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    username: string,
    lastname: string,
    email: string,
    password: string,
  ) {
    if (!username || !lastname || !email || !password) {
      throw new BadRequestException('Todos os campos devem ser preenchidos!');
    }
    const fields = {
      username: username.trim(),
      lastname: lastname.trim(),
      email: email.trim().toLowerCase(),
      password,
    };

    if (Object.values(fields).some((value) => !value)) {
      throw new BadRequestException('Todos os campos devem ser preenchidos!');
    }

    const validations = [
      [
        fields.username.length >= 5,
        'O username deve conter no minimo 5 caracters.',
      ],
      [
        fields.lastname.length >= 5,
        'O sobrenome deve conter no minimo 5 caracters.',
      ],
      [
        fields.email.length >= 5 &&
          fields.email.includes('@') &&
          fields.email.includes('.'),
        'Email inválido.',
      ],
      [
        fields.password.length >= 8,
        'A senha deve conter no mínimo 8 caracteres.',
      ],
    ];

    for (const [isValid, message] of validations) {
      if (!isValid) {
        throw new BadRequestException(message);
      }
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: fields.username }, { email: fields.email }],
      },
    });

    if (existingUser) {
      if (existingUser.username === fields.username) {
        throw new ConflictException('Este username já está em uso.');
      }

      if (existingUser.email === fields.email) {
        throw new ConflictException('Este email já está em uso.');
      }

      throw new ConflictException('Usuário já cadastrado.');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(fields.password, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        username: fields.username,
        lastname: fields.lastname,
        email: fields.email,
        password: hashedPassword,
      },
    });

    return {
      message: 'Usuário cadastrado com sucesso',
      user: {
        username: user.username,
        lastname: user.lastname,
        email: user.email,
      },
    };
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email e senha são obrigatorios.');
    }
    email = email.trim().toLowerCase();

    if (!email || !password) {
      throw new BadRequestException('Email e senha são obrigatorios.');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos.');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Usuário não está ativo.');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Email ou senha inválidos.');
    }

    const tokens = await this.createTokens({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    return {
      message: 'Login realizado com sucesso.',
      ...tokens,
      user: {
        username: user.username,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token não informado.');
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!refreshSecret) {
      throw new UnauthorizedException('Refresh token não configurado.');
    }

    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(
        refreshToken,
        { secret: refreshSecret },
      );
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Usuário não está ativo.');
      }

      const tokens = await this.createTokens({
        sub: user.id,
        email: user.email,
        username: user.username,
      });

      return {
        message: 'Tokens renovados com sucesso.',
        ...tokens,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }
  }

  private async createTokens(payload: TokenPayload) {
    const accessSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!accessSecret || !refreshSecret) {
      throw new UnauthorizedException('Segredos JWT não configurados.');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
