import { Controller, Get, Param } from '@nestjs/common';
import { OrderService } from './order.service';
import { bytes } from 'src/shared/types';

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

  // @Post('prepare/process')
  // async prepareOrder(@Body() body: any) {
  //   return this.orderService.prepareProcessOrder(...body);
  // }

  // @Get('prepare/cancel/:orderId')
  // async prepareCancelOrder(@Body() body: any) {
  //   return this.orderService.prepareCancelOrder(orderId);
  // }
}
