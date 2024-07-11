export type Order = {
  id?: string;
  sender?: string;
  orderType?: number;
  orderStatus?: number;
  price?: bigint;
  nftId?: bigint;
  createdAt?: bigint;
  signature?: string;
  nonce?: string;
};

export type Orderbook = {
  id: string;
  sender: string;
  tokenId: string;
  price: bigint;
  amount: bigint;
  createdAt: bigint;
  orderType: number;
};

export type QueryOrderResult = {
  orders?: Order[];
};

export type QueryOrderbookResult = {
  orderbooks?: Orderbook[];
};
