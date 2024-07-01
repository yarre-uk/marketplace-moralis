import { Controller, Get, Param } from '@nestjs/common';
import { NFTService } from './nft.service';

@Controller('nft')
export class NFTController {
  constructor(private readonly nftService: NFTService) {}

  @Get()
  getAll() {
    return this.nftService.getAll();
  }

  @Get(':walletAddress')
  getByWalletAddress(@Param('walletAddress') walletAddress: string) {
    return this.nftService.getByAddress(walletAddress);
  }
}
