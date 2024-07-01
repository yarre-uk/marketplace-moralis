import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MoralisService } from './moralis.service';
@Module({
  imports: [ConfigModule],
  providers: [MoralisService],
  exports: [MoralisService],
})
export class MoralisModule {}
