import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Moralis from 'moralis';

@Injectable()
export class UtilsService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await Moralis.start({
      apiKey: this.configService.get<string>('MORALIS_API_KEY'),
    });
  }
}
