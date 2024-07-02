import { Controller, Get, Param } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('filtered/:walletAddress')
  getAll(@Param('walletAddress') walletAddress: string) {
    return this.orderService.getFilteredOrders(walletAddress);
  }

  @Get('for-sale')
  getForSale() {
    return this.orderService.getForSale();
  }
  @Get('user-orders/:walletAddress')
  getUserOrders(@Param('walletAddress') walletAddress: string) {
    return this.orderService.getForAddress(walletAddress);
  }
}
