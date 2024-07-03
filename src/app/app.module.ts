import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { NFTModule } from 'src/nft/nft.module';
import { UtilsModule } from 'src/utils/utils.module';
import { OrderModule } from 'src/order/order.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/order/models/order';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'orderbook',
      entities: [Order],
      synchronize: true,
    }),
    UtilsModule,
    NFTModule,
    OrderModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
