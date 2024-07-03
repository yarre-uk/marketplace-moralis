import { gql } from '@apollo/client/core';
import { Injectable } from '@nestjs/common';
import { GraphQLClientService } from 'src/utils/graph.service';
import { QueryOrderResult } from './types/order';
import { NFTService } from 'src/nft/nft.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, OrderType } from './models/order';
import { bytes, viemClient } from 'src/shared/types';
import { UtilsService } from 'src/utils/utils.service';
import { ConfigService } from '@nestjs/config';
import { decodeFunctionResult, encodeFunctionData } from 'viem';
import { erc721Abi } from 'src/shared/abis';

@Injectable()
export class OrderService {
  private viemClient: viemClient;
  private wethAddress: bytes;
  private erc721Address: bytes;

  constructor(
    private graphService: GraphQLClientService,
    private configService: ConfigService,
    private nftService: NFTService,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private utilsService: UtilsService,
  ) {
    this.viemClient = this.utilsService.getViemClient();
    this.wethAddress =
      this.configService.get<bytes>('WETH_CONTRACT_ADDRESS') ?? '0x';
    this.erc721Address =
      this.configService.get<bytes>('ERC721_CONTRACT_ADDRESS') ?? '0x';
  }

  async getForAddress(address: bytes) {
    const queryUserQueries = gql`
      query ($address: ID!) {
        orders(where: { orderStatus: 0, sender: $address }) {
          id
          sender
          orderType
          orderStatus
          price
          nftId
          createdAt
        }
      }
    `;

    const res = await this.graphService.query<QueryOrderResult>(
      queryUserQueries,
      {
        address,
      },
    );

    return res.orders;
  }

  async getForSale() {
    const queryOrdersForSale = gql`
      query {
        orders(where: { orderType: 0, orderStatus: 0 }) {
          id
          sender
          orderType
          orderStatus
          price
          nftId
          createdAt
        }
      }
    `;

    const res =
      await this.graphService.query<QueryOrderResult>(queryOrdersForSale);

    return res.orders;
  }

  async getFilteredOrders(walletAddress: bytes) {
    const userNFTs = await this.nftService.getByAddress(walletAddress);

    const nftIds = userNFTs.nfts.result.map((nft) => nft.tokenId);

    if (!nftIds || nftIds.length === 0) {
      return [];
    }

    const queryNftIdsForSale = gql`
      query ($sender: ID!, $nftIds: [ID!]) {
        orders(
          where: {
            sender: $sender
            orderType: 0
            orderStatus: 0
            nftId_in: $nftIds
          }
        ) {
          nftId
        }
      }
    `;

    const queryBuyOrders = gql`
      query ($nftIds: [ID!]) {
        orders(where: { orderType: 1, orderStatus: 0, nftId_in: $nftIds }) {
          id
          sender
          orderType
          orderStatus
          price
          nftId
          createdAt
        }
      }
    `;

    const idsResult = await this.graphService.query<QueryOrderResult>(
      queryNftIdsForSale,
      {
        sender: walletAddress,
        nftIds,
      },
    );

    const buyOrdersResult = await this.graphService.query<QueryOrderResult>(
      queryBuyOrders,
      { nftIds },
    );

    if (!buyOrdersResult || !idsResult) {
      return [];
    }

    const sellOrderNftIds = new Set(
      idsResult?.orders?.map((order) => order.nftId),
    );
    const filteredBuyOrders = buyOrdersResult?.orders?.filter((order) =>
      sellOrderNftIds.has(order.nftId),
    );

    return filteredBuyOrders;
  }

  async createOrder({
    nftId,
    orderType,
    price,
    sender,
  }: {
    sender: bytes;
    orderType: OrderType;
    price: bigint;
    nftId: bigint;
  }) {
    const blockNumber = await this.viemClient.getBlockNumber();

    const ownerOfCalldata = await this.viemClient.call({
      to: this.erc721Address,
      data: encodeFunctionData({
        abi: erc721Abi,
        functionName: 'ownerOf',
        args: [nftId],
      }),
    });

    if (!ownerOfCalldata.data) {
      throw new Error('Error fetching owner of NFT');
    }

    const ownerOfNft = decodeFunctionResult({
      abi: erc721Abi,
      functionName: 'ownerOf',
      data: ownerOfCalldata.data,
    });

    if (ownerOfNft !== sender) {
      throw new Error('Sender does not own the NFT');
    }

    const order = new Order({
      nftId,
      orderType,
      price,
      sender,
      orderStatus: OrderStatus.Created,
      createdAt: blockNumber,
    });

    const res = await this.orderRepository.save(order);

    return res;
  }

  cancelCreatedOrder(orderId: bytes) {
    if (!this.orderRepository.existsBy({ id: orderId })) {
      throw new Error('Order does not exist');
    }

    this.orderRepository.delete({ id: orderId });
  }
}
