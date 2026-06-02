import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');

   app.setGlobalPrefix('api');
   app.enableVersioning({
     type: VersioningType.URI,
     defaultVersion: '1',
   });
   app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

   // Swagger setup
   const swaggerConfig = new DocumentBuilder()
     .setTitle('Nestera API')
     .setDescription('API documentation for the Nestera platform (URI versioned, e.g., /v1/)')
     .setVersion('1.0')
     .addBearerAuth()
     .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port || 3001);
   console.log(`Application is running on: http://localhost:${port}/api (with URI versioning, e.g., /v1/)`);
   console.log(`Swagger docs available at: http://localhost:${port}/api/docs (shows versioned endpoints)`);
}
bootstrap();
