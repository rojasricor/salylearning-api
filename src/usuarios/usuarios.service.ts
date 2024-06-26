import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActualizarUsuarioDto, CrearUsuarioDto } from './dto/usuarios.dto';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async obtenerUsuarios(): Promise<Usuario[]> {
    return this.prisma.usuario.findMany();
  }

  async obtenerUsuario(id: number): Promise<Usuario> {
    return this.prisma.usuario.findUniqueOrThrow({ where: { id } });
  }

  async obtenerUsuarioForProfile(id: number) {
    return this.prisma.usuario.findUniqueOrThrow({
      where: { id },
      include: {
        avatar_usuario: {
          include: { avatar: { select: { nom_avatar: true } } },
        },
        foto_perfil: true,
        grado_usuario: {
          select: {
            id: true,
            id_grado: true,
            grados: { select: { nom_grado: true } },
          },
        },
      },
    });
  }

  async obtenerUsuarioPorUsername(username: string): Promise<Usuario> {
    return this.prisma.usuario.findUniqueOrThrow({ where: { username } });
  }

  async obtenerUsuarioPorEmail(email: string): Promise<Usuario> {
    return this.prisma.usuario.findUniqueOrThrow({ where: { email } });
  }

  async obtenerUsuarioExistente(email: string): Promise<Usuario> {
    return this.prisma.usuario.findFirst({ where: { email } });
  }

  async crearUsuario(usuario: CrearUsuarioDto): Promise<Usuario> {
    return this.prisma.usuario.create({ data: usuario });
  }

  async actualizarUsuario(
    id: number,
    usuario: ActualizarUsuarioDto,
  ): Promise<Usuario> {
    return this.prisma.usuario.update({ where: { id }, data: usuario });
  }

  async verificarUsuario(email: string): Promise<Usuario> {
    return this.prisma.usuario.update({
      where: { email },
      data: {
        verificado: true,
      },
    });
  }

  async cambiarClave(email: string, password: string): Promise<Usuario> {
    return this.prisma.usuario.update({ where: { email }, data: { password } });
  }

  async eliminarUsuario(id: number): Promise<Usuario> {
    return this.prisma.usuario.delete({ where: { id } });
  }

  calcularEdad(fechaNacimiento: Date): number {
    const diff = new Date().getFullYear() - fechaNacimiento.getFullYear();
    return diff > 0 ? diff : 0;
  }
}
