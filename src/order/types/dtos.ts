import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { bytes } from 'src/shared/types';

export class PrepareOrderDto {
  @IsString()
  @IsNotEmpty()
  sellOrderId: bytes;

  @IsString()
  @IsNotEmpty()
  buyOrderId: bytes;
}

export class CancelOrderDto {
  @IsString()
  @IsNotEmpty()
  address: bytes;

  @IsString()
  @IsNotEmpty()
  orderId: bytes;
}

export class PrepareOrderbookDto {
  @IsString()
  @IsNotEmpty()
  tokenId: string;

  @IsString()
  @IsNotEmpty()
  price: string;

  @IsNumber()
  orderType: number;
}
