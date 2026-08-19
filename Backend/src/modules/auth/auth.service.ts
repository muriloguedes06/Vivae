import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

    async register(username: string, lastname: string, email: string, password: string) {
        if (!username || !lastname || !email || !password) { throw new BadRequestException('Todos os campos devem ser preenchidos!'); }
        const fields = {
            username: username.trim(),
            lastname: lastname.trim(),
            email: email.trim(),
            password: password.trim(),
        };

        if(Object.values(fields).some(value => !value)) {
            throw new BadRequestException('Todos os campos devem ser preenchidos!');
        }

        const validations = [
            [fields.username.length >= 5, 'O username deve conter no minimo 5 caracters.'],
            [fields.lastname.length >= 5, 'O sobrenome deve conter no minimo 5 caracters.'],
            [
                fields.email.length >= 5 && fields.email.includes('@') && fields.email.includes('.'), 'Email inválido.',
            ],
            [fields.password.length >= 6, 'A senha deve conter no minimo 6 caracters']
        ]

        for (const [isValid, message] of validations) {
            if (!isValid) {
                throw new BadRequestException(message);
            };
        };

        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    {username},
                    {email},
                ]
            }
        });

        if (existingUser) {
            if (existingUser.username === username) {
                throw new ConflictException('Este username já está em uso.');
            }

            if (existingUser.email === email) {
                throw new ConflictException('Este email já está em uso.');
            }

            throw new ConflictException('Usuário já cadastrado.');
        };

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await this.prisma.user.create({
            data: {
                username,
                lastname,
                email,
                password: hashedPassword,
            }
        });

        return {
            message: 'Usuário cadastrado com sucesso',
            user: {
                username: user.username,
                lastname: user.lastname,
                email: user.email,
            }
        }
    }

    async login(email: string, password: string) {
        if (!email || !password) { throw new BadRequestException('Email e senha são obrigatorios.'); }
        email = email.trim();
        password = password.trim();

        if (!email || !password) {
            throw new BadRequestException('Email e senha são obrigatorios.');
        };

        const user = await this.prisma.user.findUnique({
            where: {
                email,
            }
        })

        if (!user) {
            throw new UnauthorizedException('Email ou senha inválidos.');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            throw new UnauthorizedException('Email ou senha inválidos.');
        }

        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username,
        };

        const accessToken = await this.jwtService.signAsync(payload, {secret: process.env.JWT_SECRET, expiresIn: '15m',});
        const refreshToken = await this.jwtService.signAsync(payload, {secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d',});

        return {
            message: 'Login realizado com sucesso.',
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                username: user.username,
                lastname: user.lastname,
                email: user.email,
            }
        }
    }
}
