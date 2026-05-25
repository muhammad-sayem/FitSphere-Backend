export interface ICreateOrderPayload {
  productId: string;
  quantity: number;
  address: string;
  phone: string;
}

export interface IChangeOrderStatusPayload {
  status: "SHIPPED" | "DELIVERED" | "CANCELLED";
}