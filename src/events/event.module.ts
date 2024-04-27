import { Module } from '@nestjs/common';
import EventController from './event.controller';
import EventService from './event.service';
import { GraphQLRequestModule } from '@golevelup/nestjs-graphql-request';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  controllers: [EventController],
  exports: [EventService],
  imports: [
    CacheModule.register(),
    GraphQLRequestModule.forRoot(GraphQLRequestModule, {
      // Exposes configuration options based on the graphql-request package
      endpoint: 'https://ai.esputnik.com/graphql',
      options: {
        headers: {
          'content-type': 'application/json',
        },
      },
    }),
  ],
  providers: [EventService],
})
export class EventModule {}
