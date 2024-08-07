import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import type { Request } from 'express';
import {
  ActualizarEstudianteDto,
  CrearEstudianteDto,
} from './dto/estudiantes.dto';
import { Estudiante } from './entities/estudiante.entity';
import { EstudiantesService } from './estudiantes.service';

@ApiBearerAuth('access-token')
@ApiTags('estudiantes')
@Controller('estudiantes')
export class EstudiantesController {
  constructor(private estudiantesService: EstudiantesService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los estudiantes',
    description: 'Obtiene todos los estudiantes existentes.',
  })
  @ApiOkResponse({
    description: 'Estudiantes encontrados',
    type: [Estudiante],
  })
  async obtenerEstudiantes(@Query('id_grado') id_grado: number) {
    return await this.estudiantesService.obtenerEstudiantes(id_grado);
  }

  @Get('mejor-puntaje')
  @ApiOperation({
    summary: 'Obtener todos los estudiantes con mejor puntaje',
    description: 'Obtiene todos los estudiantes con mejor puntaje.',
  })
  @ApiOkResponse({
    description: 'Estudiantes con mejor puntaje encontrados',
    type: [Estudiante],
  })
  async obtenerEstudiantesConMejorPuntaje(@Query('id_grado') id_grado: number) {
    return await this.estudiantesService.obtenerEstudiantesConMejorPuntaje(
      id_grado,
    );
  }

  @Get('usuario')
  @ApiOperation({
    summary: 'Obtener un estudiante por su ID de usuario',
    description: 'Obtiene un estudiante por su ID de usuario.',
  })
  @ApiOkResponse({
    description: 'Estudiante encontrado',
    type: Estudiante,
  })
  async obtenerEstudiantePorIdUsuario(@Req() req: Request) {
    try {
      return await this.estudiantesService.obtenerEstudiantePorIdUsuario(
        req.user.id,
      );
    } catch (error) {
      console.error(error.message);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'No se encontró el estudiante con el ID de usuario proporcionado',
          );
        }
      }
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un estudiante por su ID',
    description: 'Obtiene un estudiante por su ID.',
  })
  @ApiOkResponse({
    description: 'Estudiante encontrado',
    type: Estudiante,
  })
  async obtenerEstudiante(@Param('id') id: number) {
    try {
      return await this.estudiantesService.obtenerEstudiante(id);
    } catch (error) {
      console.error(error.message);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'No se encontró el estudiante con el ID proporcionado',
          );
        }
      }
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Crear un estudiante',
    description: 'Crea un nuevo estudiante.',
  })
  @ApiCreatedResponse({
    description: 'Estudiante creado',
    type: Estudiante,
  })
  async crearEstudiante(@Body() estudiante: CrearEstudianteDto) {
    try {
      return await this.estudiantesService.crearEstudiante(estudiante);
    } catch (error) {
      console.error(error.message);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Ya existe un estudiante con el mismo usuario o con el mismo codigo de estudiante',
          );
        } else if (error.code === 'P2003') {
          throw new BadRequestException(
            'El id de usuario proporcionado no existe',
          );
        }
      }

      throw new InternalServerErrorException('Error al crear el estudiante');
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un estudiante',
    description: 'Actualiza un estudiante existente.',
  })
  @ApiOkResponse({
    description: 'Estudiante actualizado',
    type: Estudiante,
  })
  async actualizarEstudiante(
    @Param('id') id: number,
    @Body() estudiante: ActualizarEstudianteDto,
  ) {
    try {
      return await this.estudiantesService.actualizarEstudiante(id, estudiante);
    } catch (error) {
      console.error(error.message);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Ya existe un estudiante con el mismo usuario o con el mismo codigo de estudiante',
          );
        } else if (error.code === 'P2003') {
          throw new BadRequestException(
            'El id de usuario proporcionado no existe',
          );
        } else if (error.code === 'P2025') {
          throw new NotFoundException(
            'No se encontró el estudiante con el ID proporcionado',
          );
        }
      }
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un estudiante',
    description: 'Elimina un estudiante existente.',
  })
  @ApiOkResponse({
    description: 'Estudiante eliminado',
    type: Estudiante,
  })
  async eliminarEstudiante(@Param('id') id: number) {
    try {
      return await this.estudiantesService.eliminarEstudiante(id);
    } catch (error) {
      console.error(error.message);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'No se encontró el estudiante con el ID proporcionado',
          );
        }
      }
    }
  }
}
