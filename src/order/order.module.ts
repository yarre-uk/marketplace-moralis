import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from 'src/utils/utils.module';
import { NFTModule } from 'src/nft/nft.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './models/order';

@Module({
  imports: [
    ConfigModule,
    UtilsModule,
    NFTModule,
    TypeOrmModule.forFeature([Order]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
