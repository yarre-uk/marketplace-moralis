import { IsString } from 'class-validator';
import { bytes } from 'src/shared/types';

export class PrepareOrderDto {
  @IsString()
  address: bytes;

  @IsString()
  sellOrderId: bytes;

  @IsString()
  buyOrderId: bytes;
}

export class CancelOrderDto {
  @IsString()
  address: bytes;

  @IsString()
  orderId: bytes;
}
