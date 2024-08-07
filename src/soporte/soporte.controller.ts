import {
  BadGatewayException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { UsuariosService } from '../usuarios/usuarios.service';
import { ActualizarSoporteDto, CrearSoporteDto } from './dto/soporte.dto';
import { Soporte } from './entities/soporte.entity';
import { SoporteService } from './soporte.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@ApiTags('soporte')
@Controller('soporte')
export class SoporteController {
  constructor(
    private eventEmitter: EventEmitter2,
    private readonly soporteService: SoporteService,
    private readonly usuariosService: UsuariosService,
  ) {}

  @ApiBearerAuth('access-token')
  @Get()
  @ApiOperation({
    summary: 'Obtener todos los soportes',
    description: 'Obtiene todos los soportes de la base de datos',
  })
  @ApiOkResponse({
    description: 'Soportes encontrados',
    type: [Soporte],
  })
  async obtenerSoportes() {
    return await this.soporteService.obtenerSoportes();
  }

  @ApiBearerAuth('access-token')
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un soporte por su ID',
    description: 'Obtiene un soporte de la base de datos por su ID',
  })
  @ApiOkResponse({
    description: 'Soporte encontrado',
    type: Soporte,
  })
  async obtenerSoporte(@Param('id') id: number) {
    try {
      return await this.soporteService.obtenerSoporte(id);
    } catch (error) {
      console.error(error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Soporte no encontrado');
        }
      }
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Crear un soporte',
    description: 'Crea un soporte en la base de datos',
  })
  @ApiCreatedResponse({
    description: 'Soporte creado',
    type: Soporte,
  })
  async crearSoporte(@Body() soporte: CrearSoporteDto) {
    try {
      const { p_nombre, p_apellido, username } =
        await this.usuariosService.obtenerUsuarioPorEmail(soporte.email);

      const payload = { username, p_nombre, p_apellido };
      this.eventEmitter.emit('enviar-email-de-soporte', soporte.email, payload);
      return await this.soporteService.crearSoporte(soporte);
    } catch (error) {
      console.error(error);

      if (error instanceof BadGatewayException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al crear el soporte');
    }
  }

  @ApiBearerAuth('access-token')
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un soporte',
    description: 'Actualiza un soporte existente.',
  })
  @ApiOkResponse({
    description: 'Soporte actualizado',
    type: Soporte,
  })
  async actualizarSoporte(
    @Param('id') id: number,
    @Body() soporte: ActualizarSoporteDto,
  ) {
    try {
      return await this.soporteService.actualizarSoporte(id, soporte);
    } catch (error) {
      console.error(error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Soporte no encontrado');
        }
      }
    }
  }

  @ApiBearerAuth('access-token')
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un soporte',
    description: 'Elimina un soporte de la base de datos',
  })
  @ApiOkResponse({
    description: 'Soporte eliminado',
    type: Soporte,
  })
  async eliminarSoporte(@Param('id') id: number) {
    try {
      return await this.soporteService.eliminarSoporte(id);
    } catch (error) {
      console.error(error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Soporte no encontrado');
        }
      }
    }
  }
}
