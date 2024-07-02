import { Module } from '@nestjs/common';
import { NFTController } from './nft.controller';
import { NFTService } from './nft.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [NFTController],
  providers: [NFTService],
  exports: [NFTService],
})
export class NFTModule {}
