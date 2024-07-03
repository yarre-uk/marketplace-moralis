import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Moralis from 'moralis';
import { viemClient } from 'src/shared/types';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

@Injectable()
export class UtilsService implements OnModuleInit {
  private viemClient: viemClient;

  constructor(private configService: ConfigService) {
    this.viemClient = createPublicClient({
      chain: sepolia,
      transport: http(),
    });
  }

  async onModuleInit() {
    await Moralis.start({
      apiKey: this.configService.get<string>('MORALIS_API_KEY'),
    });
  }

  getViemClient(): viemClient {
    return this.viemClient;
  }
}
