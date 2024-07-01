import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { NFTModule } from 'src/nft/nft.module';
import { MoralisModule } from 'src/moralis/moralis.module';
@Module({
  imports: [ConfigModule.forRoot(), MoralisModule, NFTModule],
  controllers: [AppController],
})
export class AppModule {}
