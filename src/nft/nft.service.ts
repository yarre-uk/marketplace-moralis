import { EvmChain } from '@moralisweb3/common-evm-utils';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Moralis from 'moralis';
import { bytes } from 'src/shared/types';

@Injectable()
export class NFTService {
  private chain = EvmChain.SEPOLIA;
  private address: bytes;

  constructor(private configService: ConfigService) {
    this.address =
      this.configService.get<bytes>('NFT_CONTRACT_ADDRESS') ?? '0x';
  }

  async getAll() {
    const nfts = await Moralis.EvmApi.nft.getContractNFTs({
      chain: this.chain,
      address: this.address,
      format: 'decimal',
    });

    return { nfts };
  }

  async getByAddress(walletAddress: string) {
    const nfts = await Moralis.EvmApi.nft.getWalletNFTs({
      chain: this.chain,
      address: walletAddress,
      tokenAddresses: [this.address],
      format: 'decimal',
    });

    return { nfts };
  }
}
