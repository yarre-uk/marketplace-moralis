import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NFTModule } from 'src/nft/nft.module';
import { UtilsModule } from 'src/moralis/utils.module';
import { OrderModule } from 'src/order/order.module';
import { GraphQLRequestModule } from '@golevelup/nestjs-graphql-request';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLRequestModule.forRootAsync(GraphQLRequestModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        endpoint: configService.get('GRAPHQL_ENDPOINT'),
      }),
    }),
    UtilsModule,
    NFTModule,
    OrderModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
