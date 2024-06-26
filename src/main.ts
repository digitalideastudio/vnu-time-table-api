import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix('api/v1');
  app.disable('x-powered-by');
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.use(json({ limit: '100mb' }));

  const options = new DocumentBuilder()
    .setTitle('VNU Timetable API')
    .setDescription('A simple API for VNU Timetable')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('/docs', app, document);

  await app.listen(
    process.env.PORT || 4000,
    process.env.HOST || 'localhost',
    () => {
      console.log(
        `Server is running on ${process.env.HOST || 'localhost'}:${process.env.PORT || 4000}`,
      );
    },
  );
}

bootstrap();
