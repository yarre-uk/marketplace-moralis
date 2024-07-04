import { bytes } from 'src/shared/types';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id!: bytes;

  @Column()
  sender!: bytes;

  @Column()
  signature!: bytes;

  constructor(obj: Partial<Order>) {
    Object.assign(this, obj);
  }
}
