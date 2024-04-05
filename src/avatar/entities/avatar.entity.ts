import { ApiProperty } from '@nestjs/swagger';
import { Avatar as TAvatar } from '@prisma/client';

export class Avatar implements TAvatar {
  @ApiProperty({
    title: 'Id del avatar',
    description: 'Id del avatar',
    example: 1,
    minLength: 1,
    maxLength: 4294967295,
  })
  id: number;

  @ApiProperty({
    title: 'Nombre del avatar',
    description: 'Nombre del avatar',
    example: 'Avatar 1',
    minLength: 3,
    maxLength: 30,
  })
  nom_avatar: string;
}