// model Product {
//   id             String            @id @default(uuid())
//   name           String
//   description    String
//   price          Float
//   category       ProductCategories
//   remainingStock Int
//   image          String?
//   createdAt      DateTime          @default(now())
//   updatedAt      DateTime          @updatedAt

import { ProductCategories } from "../../../generated/prisma/browser";

//   orderItems      OrderItem[]

//   @@map("products")
// }


export interface ICreateProductPayload {
  name: string;
  description: string;
  price: number;
  category: ProductCategories;
  remainingStock: number;
  image?: string;
}

export interface IUpdateProductPayload {
  name: string;
  description: string;
  price: number;
  category: ProductCategories;
  remainingStock: number;
  image?: string;
}