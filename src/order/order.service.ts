import { gql } from '@apollo/client/core';
import { Injectable } from '@nestjs/common';
import { GraphQLClientService } from 'src/moralis/graph.service';
import { QueryOrderResult } from './types/order';
import { NFTService } from 'src/nft/nft.service';

@Injectable()
export class OrderService {
  constructor(
    private graphService: GraphQLClientService,
    private nftService: NFTService,
  ) {}

  async getForAddress(address: string) {
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

  async getFilteredOrders(walletAddress: string) {
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
      idsResult.orders.map((order) => order.nftId),
    );
    const filteredBuyOrders = buyOrdersResult.orders.filter((order) =>
      sellOrderNftIds.has(order.nftId),
    );

    return filteredBuyOrders;
  }
}
