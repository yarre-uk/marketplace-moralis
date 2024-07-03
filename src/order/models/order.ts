import { bytes } from 'src/shared/types';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum OrderType {
  BUY,
  SELL,
}

export enum OrderStatus {
  Created,
  Processed,
  Closed,
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id!: bytes;

  @Column()
  sender!: bytes;

  @Column()
  orderType!: OrderType;

  @Column()
  orderStatus!: OrderStatus;

  @Column({ type: 'bigint' })
  price!: bigint;

  @Column({ type: 'bigint' })
  nftId!: bigint;

  @Column({ type: 'bigint' })
  createdAt!: bigint;

  constructor(obj: Partial<Order>) {
    Object.assign(this, obj);
  }
}
