// src/s3/s3.service.ts
/// <reference types="multer" />
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client, // Para la configuración del cliente
  PutObjectCommand, // Para la carga simple (aunque Upload es mejor para archivos grandes)
  GetObjectCommand, // Para descargar o obtener metadata
  DeleteObjectCommand, // Para eliminar
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage'; // Para cargas multi-parte eficientes
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; // Para URLs firmadas
import { v4 as uuidv4 } from 'uuid'; // Para generar nombres de archivo únicos
import * as path from 'path'; // Para manejar rutas de archivo

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName!: string;
  private region!: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const sessionToken = this.configService.get<string | undefined>('AWS_SESSION_TOKEN');

    if (!region) {
      throw new InternalServerErrorException('AWS_REGION environment variable is not set.');
    }
    if (!bucketName) {
        throw new InternalServerErrorException('AWS_S3_BUCKET_NAME environment variable is not set.');
    }
    if (!accessKeyId) {
        throw new InternalServerErrorException('AWS_ACCESS_KEY_ID environment variable is not set.');
    }
    if (!secretAccessKey) {
        throw new InternalServerErrorException('AWS_SECRET_ACCESS_KEY environment variable is not set.');
    }
    // sessionToken is optional for many credential types, so no strict check throwing an error if it's not set.

    // Ahora que hemos verificado que no son undefined, podemos asignarlas.
    this.region = region;
    this.bucketName = bucketName;
    
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        ...(sessionToken && { sessionToken: sessionToken }), // Conditionally add if present
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File, // Archivo obtenido del interceptor
    folder: string = '', // Carpeta opcional dentro del bucket
  ): Promise<{ key: string; url: string }> {
    // Generar un nombre de archivo único para evitar colisiones y sanear el nombre original
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const key = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

    try {
      // Usar Upload para cargas eficientes, especialmente con archivos grandes
      const uploader = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer, // Buffer del archivo
          ContentType: file.mimetype, // Tipo MIME del archivo (importante para el navegador)
          // ACL: 'public-read', // Descomentar si quieres que los archivos sean públicos (¡menos seguro!)
        },
        tags: [], // Opcional: añadir tags al objeto S3
        queueSize: 4, // Número de partes a cargar en paralelo
        partSize: 1024 * 1024 * 5, // Tamaño de cada parte (mínimo 5MB excepto la última)
        leavePartsOnError: false, // No dejar partes subidas si falla
      });

      // Escuchar progreso opcionalmente
      uploader.on('httpUploadProgress', (progress) => {
        console.log(progress);
      });

      // Ejecutar la carga
      const data = await uploader.done();

      // Si el bucket NO es público y NO configuraste ACL: 'public-read', necesitas una URL firmada
      // O puedes construir la URL si el bucket ES público (Configurado en política o ACL)
      const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
      // Si necesitas URLs firmadas para acceso privado, usarías getSignedUrl aquí o en otro método.

      return {
        key: key,
        url: fileUrl, // Devuelve la URL (puede ser pública o una que asumas que usarás con URLs firmadas después)
      };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error; // Relanzar el error para que NestJS lo maneje
    }
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
      console.log(`File deleted successfully: ${key}`);
    } catch (error) {
      console.error(`Error deleting file ${key} from S3:`, error);
      throw error;
    }
  }

  // Ejemplo de cómo generar una URL firmada para acceso privado
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
     const command = new GetObjectCommand({
       Bucket: this.bucketName,
       Key: key,
     });
     // expiresIN está en segundos
     const url = await getSignedUrl(this.s3Client, command, { expiresIn });
     return url;
  }
}
