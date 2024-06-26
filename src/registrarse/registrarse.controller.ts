import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  Headers,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { Public } from '../public.decorator';
import { Usuario, UsuarioRespuesta } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegistrarseDto } from './dto/registrarse.dto';
import { RegistrarseService } from './registrarse.service';

@Controller('auth/registrarse')
export class RegistrarseController {
  constructor(
    private eventEmitter: EventEmitter2,
    private readonly registrarseService: RegistrarseService,
    private readonly usuariosService: UsuariosService,
  ) {}

  @Post()
  @Public()
  @ApiTags('registrarse', 'publico')
  @ApiOperation({
    summary: 'Registrarse',
    description: 'Registro de usuario',
  })
  @ApiCreatedResponse({
    description: 'Usuario registrado',
    type: UsuarioRespuesta,
  })
  async registrarse(@Body() nuevoUsuario: RegistrarseDto, @Headers() headers) {
    let isNewUser = true;
    let usuario: Usuario = null;

    try {
      const usuarioExistente =
        await this.usuariosService.obtenerUsuarioExistente(nuevoUsuario.email);
      if (usuarioExistente) {
        isNewUser = false;
        usuario = usuarioExistente;
      } else {
        const hash = await argon2.hash(nuevoUsuario.password);
        nuevoUsuario.password = hash;

        if (nuevoUsuario.rol === 'DOCENTE') {
          if (
            !(await this.registrarseService.verificarCodigoDocente(
              nuevoUsuario.cod_docente,
            ))
          ) {
            throw new BadRequestException(
              'Código de docente proporcionado no válido. No podemos registrarte como docente. Por favor, revise su código de docente.',
            );
          }
        }

        // Delete confirmar_password property because it is not needed in the database
        delete nuevoUsuario.confirmar_password;
        usuario = await this.registrarseService.registrarUsuario(
          nuevoUsuario,
          nuevoUsuario.cod_docente || undefined,
        );
        // Delete password property from the response because it is sensitive
        delete usuario.password;
      }

      // Generate activation token
      const tokenDeActivacion =
        this.registrarseService.generarTokenDeActivacion({
          email: usuario.email,
        });

      const payload = {
        origin: headers.origin,
        token: tokenDeActivacion,
        username: usuario.username,
        p_nombre: usuario.p_nombre,
        p_apellido: usuario.p_apellido,
      };

      if (isNewUser || (!isNewUser && !usuario.verificado)) {
        this.eventEmitter.emit(
          'enviar-email-de-verificacion',
          usuario.email,
          payload,
        );
      } else {
        return {
          message: `Cuenta de ${usuario.rol} "${usuario.p_nombre} ${usuario.p_apellido}" ya existe. Por favor, inicie sesión con tu cuenta.`,
          usuario,
        };
      }

      if (isNewUser) {
        return {
          message: `Usuario registrado. Se ha enviado un email de verificación a "${usuario.email}". Por favor, verifica tu cuenta.`,
          usuario,
        };
      } else {
        return {
          message: `Email de verificación reenviado a "${usuario.email}". Por favor, verifica tu cuenta.`,
          usuario,
        };
      }
    } catch (error) {
      console.error(error.message);

      if (
        error instanceof BadGatewayException ||
        error instanceof BadRequestException
      ) {
        throw error;
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'El email, el nombre de usuario o el grado ya existen',
          );
        } else if (error.code === 'P2003') {
          throw new BadRequestException('El id de grado del usuario no existe');
        }
      }

      throw new InternalServerErrorException('Error al registrar el usuario');
    }
  }
}
