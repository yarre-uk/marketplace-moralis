import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UtilsService } from './utils.service';
import { GraphQLClientService } from './graph.service';

@Module({
  imports: [ConfigModule],
  providers: [UtilsService, GraphQLClientService],
  exports: [GraphQLClientService],
})
export class UtilsModule {}
