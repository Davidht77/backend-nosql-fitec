/// <reference types="multer" />
import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    Body,
    BadRequestException,
    Delete,
    Get,
    Param,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { S3Service } from '../s3/s3.service'; // Asegúrate de importar tu servicio S3
  import { diskStorage } from 'multer'; // Necesario para FileInterceptor
  import { extname } from 'path'

@Controller('s3')
export class S3Controller {
    constructor(private s3Service: S3Service) {}

  @Post('/file')
  @UseInterceptors(
    FileInterceptor('file', { // 'file' es el nombre del campo en el formulario multipart
      // Optional: límites de archivo, validación de tipo, etc.
      limits: {
        fileSize: 1024 * 1024 * 50, // 50MB de límite por ejemplo
      },
      fileFilter: (req, file, cb) => {
        // Validar tipos de archivo permitidos (imágenes y videos comunes)
        const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|wmv|flv/;
        const mimeType = allowedTypes.test(file.mimetype);
        const fileExt = allowedTypes.test(extname(file.originalname).toLowerCase());

        if (mimeType && fileExt) {
          return cb(null, true);
        }
        cb(new BadRequestException('Tipo de archivo no soportado'), false);
      },
      // No necesitas storage si usas el buffer directamente en S3Service
      // diskStorage({ destination: './uploads' }) // Esto guardaría el archivo localmente temporalmente
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Llamar al servicio S3 para subir el archivo
    // Puedes pasar una subcarpeta opcional, ej: 'perfiles', 'clases', etc.
    const uploadResult = await this.s3Service.uploadFile(file, 'media'); // 'media' es la carpeta en S3

    // Aquí, después de la subida exitosa a S3, DEBERÍAS guardar la 'uploadResult.key'
    // o 'uploadResult.url' en tu base de datos MongoDB, asociada a la entidad correspondiente.
    // Por ejemplo, si es la foto de perfil de un usuario, actualizarías el documento del usuario.
    // await this.userService.updateUser(userId, { profileImageKey: uploadResult.key });

    return {
      message: 'Archivo subido exitosamente',
      s3Key: uploadResult.key,
      s3Url: uploadResult.url,
      // Puedes devolver el objeto actualizado del usuario o solo los detalles de S3
    };
}

// Puedes añadir rutas para eliminar archivos, o para generar URLs firmadas
   @Delete('/file/*key')
   async deleteFile(@Param('key') key: string) {

     const stringKey = key[0] +'/'+key[1];

     await this.s3Service.deleteFile(stringKey);
     return { message: 'Archivo eliminado exitosamente' };
   }

   @Get('/file/*key/signed-url')
   async getSignedUrl(@Param('key') key: string) {

      if (!key) {
        throw new BadRequestException('A valid S3 object key must be provided.');
      }

      const stringKey = key[0] +'/'+key[1];

      const url = await this.s3Service.getSignedUrl(stringKey);
      return { signedUrl: url };
   }
}