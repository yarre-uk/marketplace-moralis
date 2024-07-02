import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from 'src/moralis/utils.module';
import { NFTModule } from 'src/nft/nft.module';

@Module({
  imports: [ConfigModule, UtilsModule, NFTModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
