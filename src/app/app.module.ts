import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { NFTModule } from 'src/nft/nft.module';
import { UtilsModule } from 'src/utils/utils.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [ConfigModule.forRoot(), UtilsModule, NFTModule, OrderModule],
  controllers: [AppController],
})
export class AppModule {}
