import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpException,
  InternalServerErrorException,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ActualizarLibroDto, CrearLibroDto } from './dto/libros.dto';
import { Libro } from './entities/libro.entity';
import { LibrosService } from './libros.service';

@ApiBearerAuth('access-token')
@ApiTags('libros')
@Controller('libros')
export class LibrosController {
  constructor(
    private eventEmitter: EventEmitter2,
    private cloudinary: CloudinaryService,
    private readonly librosService: LibrosService,
  ) {}

  @Get('contar')
  @ApiOperation({
    summary: 'Contar todos los libros que existen en la base de datos',
    description: 'Devuelve el número de libros',
  })
  @ApiOkResponse({
    description: 'Número de libros',
    type: Number,
  })
  async contarLibros() {
    return await this.librosService.contarLibros();
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los libros',
    description: 'Obtener todos los libros',
  })
  @ApiOkResponse({
    description: 'Lista de libros',
    type: [Libro],
  })
  async obtenerLibros() {
    return await this.librosService.obtenerLibros();
  }

  @Get('populares')
  @ApiOperation({
    summary: 'Obtener los libros más populares',
    description: 'Obtener los libros más populares',
  })
  @ApiOkResponse({
    description: 'Lista de libros populares',
    type: [Libro],
  })
  async obtenerLibrosPopulares() {
    return await this.librosService.obtenerLibrosPopulares();
  }

  @Get('nombre')
  @ApiOperation({
    summary: 'Buscar libros por nombre',
    description: 'Buscar libros por nombre',
  })
  @ApiOkResponse({
    description: 'Lista de libros encontrados',
    type: [Libro],
  })
  async obtenerLibroPorNombre(@Query('nom_libro') nom_libro: string) {
    return await this.librosService.obtenerLibrosPorNombre(nom_libro);
  }

  @Get('autor')
  @ApiOperation({
    summary: 'Buscar libros por autor',
    description: 'Buscar libros por autor',
  })
  @ApiOkResponse({
    description: 'Lista de libros encontrados',
    type: [Libro],
  })
  async obtenerLibroPorAutor(@Query('autor') autor: string) {
    return await this.librosService.obtenerLibrosPorAutor(autor);
  }

  @Get('editorial')
  @ApiOperation({
    summary: 'Buscar libros por editorial',
    description: 'Buscar libros por editorial',
  })
  @ApiOkResponse({
    description: 'Lista de libros encontrados',
    type: [Libro],
  })
  async obtenerLibroPorEditorial(@Query('editorial') editorial: string) {
    return await this.librosService.obtenerLibrosPorEditorial(editorial);
  }

  @Get('genero')
  @ApiOperation({
    summary: 'Buscar libros por género literario',
    description: 'Buscar libros por género literario',
  })
  @ApiOkResponse({
    description: 'Lista de libros encontrados',
    type: [Libro],
  })
  async obtenerLibrosPorGeneroLiterario(
    @Query('genero_literario') genero_literario: string,
  ) {
    return await this.librosService.obtenerLibrosPorGeneroLiterario(
      genero_literario,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un libro por su ID',
    description: 'Obtener un libro por su ID',
  })
  @ApiOkResponse({
    description: 'Libro encontrado',
    type: Libro,
  })
  async obtenerLibro(@Param('id') id: number) {
    try {
      return await this.librosService.obtenerLibro(id);
    } catch (error) {
      console.error(error.message);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Libro no encontrado');
        }
      }
    }
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'imagen_portada', maxCount: 1 }]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Crear un libro',
    description: 'Crear un libro',
  })
  @ApiCreatedResponse({
    description: 'Libro creado',
    type: Libro,
  })
  async crearLibro(
    @Body() libro: CrearLibroDto,
    @UploadedFiles({
      transform: (fileRequest: { imagen_portada: Express.Multer.File[] }) => {
        const imagenPortadaValidators = [
          new FileTypeValidator({
            fileType: new RegExp('image/(jpeg|png)'),
          }),
          new MaxFileSizeValidator({
            maxSize: 1000 * 1024, // 1 MB
            message(maxSize) {
              return `El tamaño de la imagen no debe ser mayor a ${maxSize / 1024}kb`;
            },
          }),
        ];

        for (const validator of imagenPortadaValidators) {
          if (!validator.isValid(fileRequest.imagen_portada[0])) {
            throw new HttpException(validator.buildErrorMessage(), 400);
          }
        }

        return fileRequest;
      },
    })
    files: { imagen_portada: Express.Multer.File[] },
  ) {
    const { imagen_portada } = files;

    let imagen_portada_public_id = '';

    try {
      const resCloudinaryImagenPortada = await this.cloudinary.uploadImage(
        imagen_portada[0],
      );

      if (!resCloudinaryImagenPortada) {
        throw new BadGatewayException('Error al subir la imagen de portada');
      }

      const {
        secure_url: imagen_portada_url,
        public_id: cloudinaryPublicIdImagenPortada,
      } = resCloudinaryImagenPortada;

      imagen_portada_public_id = cloudinaryPublicIdImagenPortada;
      libro.imagen_portada = imagen_portada_url;

      this.eventEmitter.emit('enviar-email-notificacion-nuevo-libro', libro);
      return await this.librosService.crearLibro(libro);
    } catch (error) {
      console.error(error.message);

      if (imagen_portada[0] && imagen_portada_public_id) {
        await this.cloudinary.deleteRes(imagen_portada_public_id);
      }

      if (error instanceof BadGatewayException) {
        throw error;
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'El nombre o la portada del libro ya existe',
          );
        } else if (error.code === 'P2003') {
          throw new BadRequestException(
            'El id de grado o el id de género literario del libro no existe',
          );
        }
      }

      throw new InternalServerErrorException('Error al crear el libro');
    }
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'imagen_portada', maxCount: 1 }]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Actualizar un libro',
    description: 'Actualizar un libro',
  })
  @ApiOkResponse({
    description: 'Libro actualizado',
    type: Libro,
  })
  async actualizarLibro(
    @Param('id') id: number,
    @Body() libro: ActualizarLibroDto,
    @UploadedFiles({
      transform: (fileRequest: { imagen_portada: Express.Multer.File[] }) => {
        if (!fileRequest.imagen_portada) {
          return fileRequest;
        }

        const imagenPortadaValidators = [
          new FileTypeValidator({
            fileType: new RegExp('image/(jpeg|png)'),
          }),
          new MaxFileSizeValidator({
            maxSize: 1000 * 1024, // 1 MB
            message(maxSize) {
              return `El tamaño de la imagen no debe ser mayor a ${maxSize / 1024}kb`;
            },
          }),
        ];

        for (const validator of imagenPortadaValidators) {
          if (!validator.isValid(fileRequest.imagen_portada[0])) {
            throw new HttpException(validator.buildErrorMessage(), 400);
          }
        }

        return fileRequest;
      },
    })
    files: { imagen_portada: Express.Multer.File[] },
  ) {
    const { imagen_portada } = files;

    let imagen_portada_public_id = '';

    try {
      if (imagen_portada[0]) {
        const resCloudinaryImagenPortada = await this.cloudinary.uploadImage(
          imagen_portada[0],
        );

        if (!resCloudinaryImagenPortada) {
          throw new BadGatewayException('Error al subir la imagen de portada');
        }

        const {
          secure_url: imagen_portada_url,
          public_id: cloudinaryPublicIdImagenPortada,
        } = resCloudinaryImagenPortada;

        imagen_portada_public_id = cloudinaryPublicIdImagenPortada;
        libro.imagen_portada = imagen_portada_url;

        const libroAnterior = await this.librosService.obtenerLibro(id);

        const public_id_anterior = libroAnterior.imagen_portada
          ?.split('/')
          ?.pop()
          ?.split('.')[0];

        if (public_id_anterior) {
          await this.cloudinary.deleteRes(public_id_anterior);
        }
      }

      return await this.librosService.actualizarLibro(id, libro);
    } catch (error) {
      console.error(error.message);

      if (imagen_portada[0] && imagen_portada_public_id) {
        await this.cloudinary.deleteRes(imagen_portada_public_id);
      }

      if (error instanceof BadGatewayException) {
        throw error;
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'El nombre o la portada del libro ya existe',
          );
        } else if (error.code === 'P2003') {
          throw new BadRequestException(
            'El id de grado o el id de género literario del libro no existe',
          );
        } else if (error.code === 'P2025') {
          throw new NotFoundException('Libro no encontrado');
        }
      }
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un libro',
    description: 'Eliminar un libro',
  })
  @ApiOkResponse({
    description: 'Libro eliminado',
    type: Libro,
  })
  async eliminarLibro(@Param('id') id: number) {
    try {
      return await this.librosService.eliminarLibro(id);
    } catch (error) {
      console.error(error.message);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Libro no encontrado');
        }
      }
    }
  }
}
