import { gql } from '@apollo/client/core';
import { Injectable } from '@nestjs/common';
import { GraphQLClientService } from 'src/utils/graph.service';
import {
  Orderbook,
  QueryOrderbookResult,
  QueryOrderResult,
} from './types/order';
import { NFTService } from 'src/nft/nft.service';
import { bytes } from 'src/shared/types';

@Injectable()
export class OrderService {
  constructor(
    private graphService: GraphQLClientService,
    private nftService: NFTService,
  ) {}

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

    const _buyOrdersResult = await this.graphService.query<QueryOrderResult>(
      queryBuyOrders,
      { nftIds },
    );

    if (!_buyOrdersResult || !idsResult) {
      return [];
    }

    const sellOrderNftIds = new Set(
      idsResult?.orders?.map((order) => order.nftId),
    );
    const filtered_buyOrders = _buyOrdersResult?.orders?.filter((order) =>
      sellOrderNftIds.has(order.nftId),
    );

    return filtered_buyOrders;
  }

  async prepareProcessOrder(sellOrderId: bytes, buyOrderId: bytes) {
    const queryOrders = gql`
      query ($ids: [ID!]) {
        orders(where: { orderStatus: 0, id_in: $ids }) {
          id
          sender
          orderType
          orderStatus
          price
          nftId
          createdAt
          signature
          nonce
        }
      }
    `;

    console.log([sellOrderId, buyOrderId]);

    const res = await this.graphService.query<QueryOrderResult>(queryOrders, {
      ids: [sellOrderId, buyOrderId],
    });

    if (!res.orders || res.orders.length !== 2) {
      throw new Error('Order not found');
    }

    const sellOrderResult = res.orders.find(
      (order) => order.id === sellOrderId,
    );
    const buyOrderResult = res.orders.find((order) => order.id === buyOrderId);

    if (!sellOrderResult || !buyOrderResult) {
      throw new Error('Order not found');
    }

    return {
      sellNonce: sellOrderResult.nonce,
      buyNonce: buyOrderResult.nonce,
    };
  }

  async prepareCancelOrder(address: bytes, orderId: bytes) {
    const queryOrder = gql`
      query ($orderId: ID!, $address: ID!) {
        orders(where: { orderStatus: 0, id: $orderId, sender: $address }) {
          id
          sender
          orderType
          orderStatus
          price
          nftId
          createdAt
          signature
          nonce
        }
      }
    `;

    const res = await this.graphService.query<QueryOrderResult>(queryOrder, {
      orderId,
      address,
    });

    if (!res.orders || res.orders.length !== 1) {
      throw new Error('Order not found');
    }

    return {
      nonce: res.orders[0].nonce,
      order: res.orders[0],
    };
  }

  async getOrderbooks() {
    const queryOrderbooks = gql`
      query {
        buyOrders: orderbooks(
          where: { processed: false, orderType: 0 }
          orderBy: price
          orderDirection: asc
        ) {
          id
          amount
          sender
          tokenId
          price
          createdAt
          orderType
        }
        sellOrders: orderbooks(
          where: { processed: false, orderType: 1 }
          orderBy: price
          orderDirection: desc
        ) {
          id
          amount
          sender
          tokenId
          price
          createdAt
          orderType
        }
      }
    `;

    const res = await this.graphService.query<{
      buyOrders?: Orderbook[];
      sellOrders?: Orderbook[];
    }>(queryOrderbooks);

    if (!res.buyOrders || !res.sellOrders) {
      return {
        buyOrders: [],
        sellOrders: [],
      };
    }

    const buyOrders = res.buyOrders.map((order) => {
      return {
        amount: order.amount.toString(),
        price: order.price.toString(),
        id: order.id,
      };
    });

    const sellOrders = res.sellOrders.map((order) => {
      return {
        amount: order.amount.toString(),
        price: order.price.toString(),
        id: order.id,
      };
    });

    return {
      buyOrders,
      sellOrders,
    };
  }

  async prepareCreateOrderbook(
    price: string,
    tokenId: string,
    orderType: number,
  ) {
    const queryOrderbook = gql`
      query ($orderType: Int!, $tokenId: BigInt!, $price: BigInt!) {
        orderbooks(
          where: {
            processed: false
            orderType: $orderType
            tokenId: $tokenId
            price_lt: $price
          }
        ) {
          id
          price
        }
      }
    `;

    const res = await this.graphService.query<QueryOrderbookResult>(
      queryOrderbook,
      {
        orderType,
        tokenId,
        price,
      },
    );

    if (!res.orderbooks || res.orderbooks.length === 0) {
      return '0x' + '0'.repeat(64);
    }

    const dtos = [...res.orderbooks].sort((a, b) => {
      return Number(a.price) - Number(b.price);
    });

    console.log(dtos);

    if (!dtos || dtos.length === 0) {
      return '0x' + '0'.repeat(64);
    }

    return dtos[dtos.length - 1].id;
  }
}
