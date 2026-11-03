import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { readConfig } from './config.js';
import { configureHttp } from './http.js';

const config = readConfig();
const app = await NestFactory.create(AppModule);
configureHttp(app,config.origins);
const document = SwaggerModule.createDocument(app,new DocumentBuilder().setTitle('UX_UI Healthcare').setVersion('0.1.0').addBearerAuth().build());
SwaggerModule.setup('api/docs',app,document);
app.enableShutdownHooks();
await app.listen(config.port,'0.0.0.0');
