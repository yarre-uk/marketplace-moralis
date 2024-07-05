import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { bytes } from 'src/shared/types';
import { CancelOrderDto, PrepareOrderDto } from './types/dtos';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('filtered/:walletAddress')
  getAll(@Param('walletAddress') walletAddress: bytes) {
    return this.orderService.getFilteredOrders(walletAddress);
  }

  @Get('for-sale')
  getForSale() {
    return this.orderService.getForSale();
  }

  @Get('user-orders/:walletAddress')
  getUserOrders(@Param('walletAddress') walletAddress: bytes) {
    return this.orderService.getForAddress(walletAddress);
  }

  @Post('prepare/process')
  async prepareOrder(@Body() dto: PrepareOrderDto) {
    return this.orderService.prepareProcessOrder(
      dto.sellOrderId,
      dto.buyOrderId,
    );
  }

  @Post('prepare/cancel')
  async prepareCancelOrder(@Body() dto: CancelOrderDto) {
    return this.orderService.prepareCancelOrder(dto.address, dto.orderId);
  }
}
