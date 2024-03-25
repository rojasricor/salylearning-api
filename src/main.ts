import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { options } from '../utils/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Salylearning API')
    .setDescription(
      'The Salylearning API for students to learn books in the salylearning software',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();
