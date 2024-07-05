import { bytes } from 'src/shared/types';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryColumn()
  orderId!: bytes;

  @Column()
  sender!: bytes;

  @Column()
  signature!: bytes;

  @Column()
  nonce!: string;

  constructor(obj: Partial<Order>) {
    Object.assign(this, obj);
  }
}
