import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Avatar } from '../entities/avatar.entity';

export class CrearAvatarDto extends OmitType(Avatar, ['id'] as const) {
  @IsNotEmpty({ message: 'El nombre del avatar es requerido' })
  @IsString({ message: 'El nombre del avatar debe ser una cadena de texto' })
  @MinLength(3, {
    message: 'El nombre del avatar debe tener al menos 3 caracteres',
  })
  @MaxLength(30, {
    message: 'El nombre del avatar no puede tener más de 30 caracteres',
  })
  nom_avatar: string;
}

export class ActualizarAvatarDto extends PartialType(CrearAvatarDto) {
  @ApiPropertyOptional()
  @IsOptional()
  nom_avatar?: string;
}
