import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActualizarPreguntaDto, CrearPreguntaDto } from './dto/preguntas.dto';
import { Pregunta } from './entities/pregunta.entity';

@Injectable()
export class PreguntasService {
  constructor(private prisma: PrismaService) {}

  async contarPreguntas(): Promise<number> {
    return this.prisma.pregunta.count();
  }

  async obtenerPreguntas(): Promise<Pregunta[]> {
    return this.prisma.pregunta.findMany();
  }

  async obtenerPregunta(id: number): Promise<Pregunta> {
    return this.prisma.pregunta.findUniqueOrThrow({ where: { id } });
  }

  async crearPregunta(pregunta: CrearPreguntaDto): Promise<Pregunta> {
    return this.prisma.pregunta.create({
      data: {
        ...pregunta,
      },
    });
  }

  async actualizarPregunta(
    id: number,
    pregunta: ActualizarPreguntaDto,
  ): Promise<Pregunta> {
    return this.prisma.pregunta.update({ where: { id }, data: pregunta });
  }

  async eliminarPregunta(id: number): Promise<Pregunta> {
    return this.prisma.pregunta.delete({ where: { id } });
  }
}
