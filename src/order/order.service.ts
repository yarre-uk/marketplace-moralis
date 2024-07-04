import { gql } from '@apollo/client/core';
import { Injectable } from '@nestjs/common';
import { GraphQLClientService } from 'src/utils/graph.service';
import { QueryOrderResult } from './types/order';
import { NFTService } from 'src/nft/nft.service';
import { bytes } from 'src/shared/types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './models/order';

@Injectable()
export class OrderService {
  constructor(
    private graphService: GraphQLClientService,
    private nftService: NFTService,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
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

  // async createOrder(id: bytes, sender: bytes, proof: bytes) {
  //   const order = new Order({
  //     id,
  //     sender,
  //     signature: proof,
  //   });
  //   const res = await this.orderRepository.save(order);

  //   return res;
  // }

  // async processOrder(sellOrderId: bytes, buyOrderId: bytes) {
  //   if (!this.orderRepository.existsBy({ id: sellOrderId })) {
  //     throw new Error('Sell order does not exist');
  //   }
  //   if (!this.orderRepository.existsBy({ id: buyOrderId })) {
  //     throw new Error('Buy order does not exist');
  //   }

  //   return Promise.all([
  //     this.orderRepository.delete({ id: sellOrderId }),
  //     this.orderRepository.delete({ id: buyOrderId }),
  //   ]);
  // }

  // async cancelOrder(orderId: bytes) {
  //   if (!this.orderRepository.existsBy({ id: orderId })) {
  //     throw new Error('Order does not exist');
  //   }

  //   return this.orderRepository.delete({ id: orderId });
  // }

  async prepareProcessOrder(
    address: bytes,
    sellOrderId: bytes,
    buyOrderId: bytes,
  ) {
    const sellOrder = await this.orderRepository.findOneByOrFail({
      id: sellOrderId,
      sender: address,
    });
    const buyOrder = await this.orderRepository.findOneByOrFail({
      id: buyOrderId,
    });

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
        }
      }
    `;

    const res = await this.graphService.query<QueryOrderResult>(queryOrders, {
      nftIds: [sellOrder.id, buyOrder.id],
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
      sellOrderId,
      buyOrderId,
      sellSignature: sellOrderResult.signature,
      buySignature: buyOrderResult.signature,
      sellOrder: sellOrderResult,
      buyOrder: buyOrderResult,
    };
  }

  async prepareCancelOrder(address: bytes, orderId: bytes) {
    const order = await this.orderRepository.findOneByOrFail({
      id: orderId,
      sender: address,
    });

    const queryOrder = gql`
      query ($orderId: ID!) {
        orders(where: { orderStatus: 0, id: $orderId }) {
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

    const res = await this.graphService.query<QueryOrderResult>(queryOrder, {
      orderId,
    });

    if (!res.orders || res.orders.length !== 1) {
      throw new Error('Order not found');
    }

    return {
      signature: order.signature,
      order: res.orders[0],
    };
  }
}
