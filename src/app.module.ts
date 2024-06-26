import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AvatarUsuarioModule } from './avatar-usuario/avatar-usuario.module';
import { AvatarModule } from './avatar/avatar.module';
import { CambiarClaveModule } from './cambiar-clave/cambiar-clave.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ContactosModule } from './contactos/contactos.module';
import { CuestionarioEstudianteModule } from './cuestionario-estudiante/cuestionario-estudiante.module';
import { CuestionariosModule } from './cuestionarios/cuestionarios.module';
import { DocentesModule } from './docentes/docentes.module';
import { EstudiantesModule } from './estudiantes/estudiantes.module';
import { FotoPerfilModule } from './foto-perfil/foto-perfil.module';
import { GenerosLiterariosModule } from './generos-literarios/generos-literarios.module';
import { GradoUsuarioModule } from './grado-usuario/grado-usuario.module';
import { GradosModule } from './grados/grados.module';
import { LibrosEstudianteModule } from './libros-estudiante/libros-estudiante.module';
import { LibrosModule } from './libros/libros.module';
import { MisLibrosModule } from './mis-libros/mis-libros.module';
import { OpcionesRespuestaModule } from './opciones-respuesta/opciones-respuesta.module';
import { PerfilModule } from './perfil/perfil.module';
import { PreguntasModule } from './preguntas/preguntas.module';
import { RecuperarClaveModule } from './recuperar-clave/recuperar-clave.module';
import { RegistrarseModule } from './registrarse/registrarse.module';
import { ReportesPdfModule } from './reportes-pdf/reportes-pdf.module';
import { RespuestasModule } from './respuestas/respuestas.module';
import { SoporteModule } from './soporte/soporte.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { VerificarCuentaModule } from './verificar-cuenta/verificar-cuenta.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EventEmitterModule } from '@nestjs/event-emitter';

const AppGuard = {
  provide: APP_GUARD,
  useClass: JwtAuthGuard,
};

@Module({
  imports: [
    // For serve docs
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'docs'),
    }),
    // For programmatically schedule jobs
    ScheduleModule.forRoot(),
    // For emit events
    EventEmitterModule.forRoot(),
    LibrosModule,
    UsuariosModule,
    GradosModule,
    AvatarModule,
    AvatarUsuarioModule,
    GradoUsuarioModule,
    MisLibrosModule,
    PreguntasModule,
    AuthModule,
    RecuperarClaveModule,
    ContactosModule,
    SoporteModule,
    CloudinaryModule,
    DocentesModule,
    EstudiantesModule,
    FotoPerfilModule,
    RegistrarseModule,
    VerificarCuentaModule,
    GenerosLiterariosModule,
    CuestionariosModule,
    CambiarClaveModule,
    PerfilModule,
    CuestionarioEstudianteModule,
    OpcionesRespuestaModule,
    RespuestasModule,
    LibrosEstudianteModule,
    ReportesPdfModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppGuard],
})
export class AppModule {}
