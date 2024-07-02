export type Order = {
  id?: string;
  sender?: string;
  orderType?: number;
  orderStatus?: number;
  price?: bigint;
  nftId?: bigint;
  createdAt?: bigint;
};

export type QueryOrderResult = {
  orders?: Order[];
};
