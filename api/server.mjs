// src/app.ts
import express from "express";
import cookieParser from "cookie-parser";

// src/app/routes/index.ts
import { Router as Router12 } from "express";

// src/app/modules/product/product.route.ts
import { Router } from "express";

// src/generated/prisma/enums.ts
var UserRoles = {
  USER: "USER",
  TRAINER: "TRAINER",
  ADMIN: "ADMIN"
};
var UserStatus = {
  ACTIVE: "ACTIVE",
  BANNED: "BANNED"
};
var BookingStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED"
};
var OrderStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED"
};
var PaymentProvider = {
  STRIPE: "STRIPE"
};
var PaymentPurpose = {
  TRAINER_BOOKING: "TRAINER_BOOKING",
  PRODUCT_ORDER: "PRODUCT_ORDER"
};
var PaymentStatus = {
  PENDING: "PENDING",
  SUCCEEDED: "SUCCEEDED",
  FAILED: "FAILED"
};

// src/app/utils/cookie.ts
var setCookie = (res, key, value, options) => {
  res.cookie(key, value, options);
};
var getCookie = (req, key) => {
  return req.cookies?.[key];
};
var clearCookie = (res, key, options) => {
  res.clearCookie(key, options);
};
var cookieUtils = {
  setCookie,
  getCookie,
  clearCookie
};

// src/app/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// src/generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.8.0",
  "engineVersion": "3c6e192761c0362d496ed980de936e2f3cebcd3a",
  "activeProvider": "postgresql",
  "inlineSchema": 'model User {\n  id            String     @id\n  name          String\n  email         String\n  emailVerified Boolean    @default(false)\n  image         String?\n  role          UserRoles\n  status        UserStatus @default(ACTIVE)\n  isDeleted     Boolean    @default(false)\n  createdAt     DateTime   @default(now())\n  updatedAt     DateTime   @updatedAt\n  sessions      Session[]\n  accounts      Account[]\n\n  trainerProfiles TrainerProfile[]\n  bookings        BookingSlot[]\n  payments        Payment[]\n  orders          Order[]\n  reviews         Review[]\n\n  @@unique([email])\n  @@map("users")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("sessions")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("accounts")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verifications")\n}\n\nmodel BookingSlot {\n  id            String         @id @default(uuid())\n  userId        String\n  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)\n  trainerId     String\n  trainer       TrainerProfile @relation(fields: [trainerId], references: [id], onDelete: Cascade)\n  slotId        String\n  slot          Slot           @relation(fields: [slotId], references: [id], onDelete: Cascade)\n  status        BookingStatus  @default(PENDING)\n  feeAmount     Float\n  paymentStatus PaymentStatus  @default(PENDING)\n  transactionId String?\n  createdAt     DateTime       @default(now())\n  updatedAt     DateTime       @updatedAt\n\n  payment Payment?\n\n  @@index([userId])\n  @@index([trainerId])\n  @@index([slotId])\n  @@map("booking_slots")\n}\n\nenum UserRoles {\n  USER\n  TRAINER\n  ADMIN\n}\n\nenum UserStatus {\n  ACTIVE\n  BANNED\n}\n\nenum ProductCategories {\n  TRADEMILL\n  MASSAGER\n  DUMMBBELL\n  BENCHES\n  FLOOR_MAT\n  EXERCISE_BIKE\n  OTHER\n}\n\nenum BookingStatus {\n  PENDING\n  COMPLETED\n}\n\nenum OrderStatus {\n  PENDING\n  PAID\n  SHIPPED\n  DELIVERED\n  CANCELLED\n}\n\nenum PaymentProvider {\n  STRIPE\n}\n\nenum PaymentPurpose {\n  TRAINER_BOOKING\n  PRODUCT_ORDER\n}\n\nenum PaymentStatus {\n  PENDING\n  SUCCEEDED\n  FAILED\n}\n\nmodel Order {\n  id            String      @id @default(uuid())\n  userId        String\n  user          User        @relation(fields: [userId], references: [id])\n  productId     String\n  product       Product     @relation(fields: [productId], references: [id])\n  price         Float\n  quantity      Int\n  totalAmount   Float\n  status        OrderStatus @default(PENDING)\n  address       String\n  phone         String\n  transactionId String?\n  createdAt     DateTime    @default(now())\n  updatedAt     DateTime    @updatedAt\n\n  payment    Payment?\n  orderItems OrderItem[]\n\n  @@index([userId])\n  @@map("orders")\n}\n\nmodel OrderItem {\n  id        String  @id @default(uuid())\n  orderId   String\n  order     Order   @relation(fields: [orderId], references: [id])\n  productId String\n  product   Product @relation(fields: [productId], references: [id])\n  quantity  Int\n  price     Float\n\n  @@map("order_items")\n}\n\nmodel Payment {\n  id                 String          @id @default(uuid())\n  userId             String\n  user               User            @relation(fields: [userId], references: [id], onDelete: Cascade)\n  bookingSlotId      String?         @unique\n  bookingSlot        BookingSlot?    @relation(fields: [bookingSlotId], references: [id], onDelete: SetNull)\n  orderId            String?         @unique\n  order              Order?          @relation(fields: [orderId], references: [id], onDelete: SetNull)\n  provider           PaymentProvider @default(STRIPE)\n  purpose            PaymentPurpose\n  status             PaymentStatus   @default(PENDING)\n  amount             Float\n  stripeEventId      String?         @unique\n  paymentGatewayData Json?\n  paidAt             DateTime?\n  createdAt          DateTime        @default(now())\n  updatedAt          DateTime        @updatedAt\n\n  @@index([userId])\n  @@index([status])\n  @@index([purpose])\n  @@index([provider])\n}\n\nmodel Product {\n  id             String            @id @default(uuid())\n  name           String\n  description    String\n  price          Float\n  category       ProductCategories\n  remainingStock Int\n  image          String?\n  createdAt      DateTime          @default(now())\n  updatedAt      DateTime          @updatedAt\n\n  orderItems OrderItem[]\n  orders     Order[]\n\n  @@map("products")\n}\n\nmodel Review {\n  id        String         @id @default(uuid())\n  userId    String\n  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)\n  trainerId String\n  trainer   TrainerProfile @relation(fields: [trainerId], references: [id], onDelete: Cascade)\n  rating    Float\n  comment   String?\n  createdAt DateTime       @default(now())\n  updatedAt DateTime       @updatedAt\n\n  @@index([trainerId])\n  @@map("reviews")\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Slot {\n  id        String         @id @default(uuid())\n  trainerId String\n  trainer   TrainerProfile @relation(fields: [trainerId], references: [id], onDelete: Cascade)\n  date      DateTime\n  startTime String\n  endTime   String\n  isBooked  Boolean        @default(false)\n  createdAt DateTime       @default(now())\n\n  bookings BookingSlot[]\n\n  @@index([trainerId])\n  @@map("slots")\n}\n\nmodel TrainerProfile {\n  id          String   @id @default(uuid())\n  userId      String   @unique\n  user        User     @relation(fields: [userId], references: [id])\n  bio         String?\n  specialties String\n  experience  Int\n  feePerHour  Float\n  avgRating   Float    @default(0)\n  isApproved  Boolean  @default(false)\n  createdAt   DateTime @default(now())\n\n  slots    Slot[]\n  bookings BookingSlot[]\n  reviews  Review[]\n\n  @@index([userId])\n  @@map("trainer_profiles")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRoles"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"trainerProfiles","kind":"object","type":"TrainerProfile","relationName":"TrainerProfileToUser"},{"name":"bookings","kind":"object","type":"BookingSlot","relationName":"BookingSlotToUser"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToUser"},{"name":"orders","kind":"object","type":"Order","relationName":"OrderToUser"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"}],"dbName":"users"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"sessions"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"accounts"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verifications"},"BookingSlot":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"BookingSlotToUser"},{"name":"trainerId","kind":"scalar","type":"String"},{"name":"trainer","kind":"object","type":"TrainerProfile","relationName":"BookingSlotToTrainerProfile"},{"name":"slotId","kind":"scalar","type":"String"},{"name":"slot","kind":"object","type":"Slot","relationName":"BookingSlotToSlot"},{"name":"status","kind":"enum","type":"BookingStatus"},{"name":"feeAmount","kind":"scalar","type":"Float"},{"name":"paymentStatus","kind":"enum","type":"PaymentStatus"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"payment","kind":"object","type":"Payment","relationName":"BookingSlotToPayment"}],"dbName":"booking_slots"},"Order":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"OrderToUser"},{"name":"productId","kind":"scalar","type":"String"},{"name":"product","kind":"object","type":"Product","relationName":"OrderToProduct"},{"name":"price","kind":"scalar","type":"Float"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"totalAmount","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"OrderStatus"},{"name":"address","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"payment","kind":"object","type":"Payment","relationName":"OrderToPayment"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"OrderToOrderItem"}],"dbName":"orders"},"OrderItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToOrderItem"},{"name":"productId","kind":"scalar","type":"String"},{"name":"product","kind":"object","type":"Product","relationName":"OrderItemToProduct"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"price","kind":"scalar","type":"Float"}],"dbName":"order_items"},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"PaymentToUser"},{"name":"bookingSlotId","kind":"scalar","type":"String"},{"name":"bookingSlot","kind":"object","type":"BookingSlot","relationName":"BookingSlotToPayment"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToPayment"},{"name":"provider","kind":"enum","type":"PaymentProvider"},{"name":"purpose","kind":"enum","type":"PaymentPurpose"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"stripeEventId","kind":"scalar","type":"String"},{"name":"paymentGatewayData","kind":"scalar","type":"Json"},{"name":"paidAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Product":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Float"},{"name":"category","kind":"enum","type":"ProductCategories"},{"name":"remainingStock","kind":"scalar","type":"Int"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"OrderItemToProduct"},{"name":"orders","kind":"object","type":"Order","relationName":"OrderToProduct"}],"dbName":"products"},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"trainerId","kind":"scalar","type":"String"},{"name":"trainer","kind":"object","type":"TrainerProfile","relationName":"ReviewToTrainerProfile"},{"name":"rating","kind":"scalar","type":"Float"},{"name":"comment","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"reviews"},"Slot":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"trainerId","kind":"scalar","type":"String"},{"name":"trainer","kind":"object","type":"TrainerProfile","relationName":"SlotToTrainerProfile"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"startTime","kind":"scalar","type":"String"},{"name":"endTime","kind":"scalar","type":"String"},{"name":"isBooked","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"bookings","kind":"object","type":"BookingSlot","relationName":"BookingSlotToSlot"}],"dbName":"slots"},"TrainerProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"TrainerProfileToUser"},{"name":"bio","kind":"scalar","type":"String"},{"name":"specialties","kind":"scalar","type":"String"},{"name":"experience","kind":"scalar","type":"Int"},{"name":"feePerHour","kind":"scalar","type":"Float"},{"name":"avgRating","kind":"scalar","type":"Float"},{"name":"isApproved","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"slots","kind":"object","type":"Slot","relationName":"SlotToTrainerProfile"},{"name":"bookings","kind":"object","type":"BookingSlot","relationName":"BookingSlotToTrainerProfile"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToTrainerProfile"}],"dbName":"trainer_profiles"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","trainer","slot","bookingSlot","order","product","orderItems","orders","_count","payment","bookings","slots","reviews","trainerProfiles","payments","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","BookingSlot.findUnique","BookingSlot.findUniqueOrThrow","BookingSlot.findFirst","BookingSlot.findFirstOrThrow","BookingSlot.findMany","BookingSlot.createOne","BookingSlot.createMany","BookingSlot.createManyAndReturn","BookingSlot.updateOne","BookingSlot.updateMany","BookingSlot.updateManyAndReturn","BookingSlot.upsertOne","BookingSlot.deleteOne","BookingSlot.deleteMany","_avg","_sum","BookingSlot.groupBy","BookingSlot.aggregate","Order.findUnique","Order.findUniqueOrThrow","Order.findFirst","Order.findFirstOrThrow","Order.findMany","Order.createOne","Order.createMany","Order.createManyAndReturn","Order.updateOne","Order.updateMany","Order.updateManyAndReturn","Order.upsertOne","Order.deleteOne","Order.deleteMany","Order.groupBy","Order.aggregate","OrderItem.findUnique","OrderItem.findUniqueOrThrow","OrderItem.findFirst","OrderItem.findFirstOrThrow","OrderItem.findMany","OrderItem.createOne","OrderItem.createMany","OrderItem.createManyAndReturn","OrderItem.updateOne","OrderItem.updateMany","OrderItem.updateManyAndReturn","OrderItem.upsertOne","OrderItem.deleteOne","OrderItem.deleteMany","OrderItem.groupBy","OrderItem.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","Product.findUnique","Product.findUniqueOrThrow","Product.findFirst","Product.findFirstOrThrow","Product.findMany","Product.createOne","Product.createMany","Product.createManyAndReturn","Product.updateOne","Product.updateMany","Product.updateManyAndReturn","Product.upsertOne","Product.deleteOne","Product.deleteMany","Product.groupBy","Product.aggregate","Review.findUnique","Review.findUniqueOrThrow","Review.findFirst","Review.findFirstOrThrow","Review.findMany","Review.createOne","Review.createMany","Review.createManyAndReturn","Review.updateOne","Review.updateMany","Review.updateManyAndReturn","Review.upsertOne","Review.deleteOne","Review.deleteMany","Review.groupBy","Review.aggregate","Slot.findUnique","Slot.findUniqueOrThrow","Slot.findFirst","Slot.findFirstOrThrow","Slot.findMany","Slot.createOne","Slot.createMany","Slot.createManyAndReturn","Slot.updateOne","Slot.updateMany","Slot.updateManyAndReturn","Slot.upsertOne","Slot.deleteOne","Slot.deleteMany","Slot.groupBy","Slot.aggregate","TrainerProfile.findUnique","TrainerProfile.findUniqueOrThrow","TrainerProfile.findFirst","TrainerProfile.findFirstOrThrow","TrainerProfile.findMany","TrainerProfile.createOne","TrainerProfile.createMany","TrainerProfile.createManyAndReturn","TrainerProfile.updateOne","TrainerProfile.updateMany","TrainerProfile.updateManyAndReturn","TrainerProfile.upsertOne","TrainerProfile.deleteOne","TrainerProfile.deleteMany","TrainerProfile.groupBy","TrainerProfile.aggregate","AND","OR","NOT","id","userId","bio","specialties","experience","feePerHour","avgRating","isApproved","createdAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","trainerId","date","startTime","endTime","isBooked","rating","comment","updatedAt","name","description","price","ProductCategories","category","remainingStock","image","every","some","none","bookingSlotId","orderId","PaymentProvider","provider","PaymentPurpose","purpose","PaymentStatus","status","amount","stripeEventId","paymentGatewayData","paidAt","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","productId","quantity","totalAmount","OrderStatus","address","phone","transactionId","slotId","BookingStatus","feeAmount","paymentStatus","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","email","emailVerified","UserRoles","role","UserStatus","isDeleted","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "zAZ0wAEUBAAAmwMAIAUAAJwDACAMAADzAgAgDwAAngMAIBEAAKADACASAACdAwAgEwAAnwMAINwBAACXAwAw3QEAAD8AEN4BAACXAwAw3wEBAAAAAecBQADxAgAh-gFAAPECACH7AQEA7AIAIYECAQDwAgAhjAIAAJoDtgIisQIBAAAAAbICIACYAwAhtAIAAJkDtAIitgIgAJgDACEBAAAAAQAgDAMAAKcDACDcAQAAuQMAMN0BAAADABDeAQAAuQMAMN8BAQDsAgAh4AEBAOwCACHnAUAA8QIAIfoBQADxAgAhpAJAAPECACGuAgEA7AIAIa8CAQDwAgAhsAIBAPACACEDAwAA5wUAIK8CAAC6AwAgsAIAALoDACAMAwAApwMAINwBAAC5AwAw3QEAAAMAEN4BAAC5AwAw3wEBAAAAAeABAQDsAgAh5wFAAPECACH6AUAA8QIAIaQCQADxAgAhrgIBAAAAAa8CAQDwAgAhsAIBAPACACEDAAAAAwAgAQAABAAwAgAABQAgEQMAAKcDACDcAQAAuAMAMN0BAAAHABDeAQAAuAMAMN8BAQDsAgAh4AEBAOwCACHnAUAA8QIAIfoBQADxAgAhpQIBAOwCACGmAgEA7AIAIacCAQDwAgAhqAIBAPACACGpAgEA8AIAIaoCQACmAwAhqwJAAKYDACGsAgEA8AIAIa0CAQDwAgAhCAMAAOcFACCnAgAAugMAIKgCAAC6AwAgqQIAALoDACCqAgAAugMAIKsCAAC6AwAgrAIAALoDACCtAgAAugMAIBEDAACnAwAg3AEAALgDADDdAQAABwAQ3gEAALgDADDfAQEAAAAB4AEBAOwCACHnAUAA8QIAIfoBQADxAgAhpQIBAOwCACGmAgEA7AIAIacCAQDwAgAhqAIBAPACACGpAgEA8AIAIaoCQACmAwAhqwJAAKYDACGsAgEA8AIAIa0CAQDwAgAhAwAAAAcAIAEAAAgAMAIAAAkAIBADAACnAwAgDwAAngMAIBAAALcDACARAACgAwAg3AEAALYDADDdAQAACwAQ3gEAALYDADDfAQEA7AIAIeABAQDsAgAh4QEBAPACACHiAQEA7AIAIeMBAgDvAgAh5AEIAO0CACHlAQgA7QIAIeYBIACYAwAh5wFAAPECACEFAwAA5wUAIA8AAOQFACAQAADuBQAgEQAA5gUAIOEBAAC6AwAgEAMAAKcDACAPAACeAwAgEAAAtwMAIBEAAKADACDcAQAAtgMAMN0BAAALABDeAQAAtgMAMN8BAQAAAAHgAQEAAAAB4QEBAPACACHiAQEA7AIAIeMBAgDvAgAh5AEIAO0CACHlAQgA7QIAIeYBIACYAwAh5wFAAPECACEDAAAACwAgAQAADAAwAgAADQAgDAYAAKsDACAPAACeAwAg3AEAALUDADDdAQAADwAQ3gEAALUDADDfAQEA7AIAIecBQADxAgAh8wEBAOwCACH0AUAA8QIAIfUBAQDsAgAh9gEBAOwCACH3ASAAmAMAIQIGAADqBQAgDwAA5AUAIAwGAACrAwAgDwAAngMAINwBAAC1AwAw3QEAAA8AEN4BAAC1AwAw3wEBAAAAAecBQADxAgAh8wEBAOwCACH0AUAA8QIAIfUBAQDsAgAh9gEBAOwCACH3ASAAmAMAIQMAAAAPACABAAAQADACAAARACARAwAApwMAIAYAAKsDACAHAAC0AwAgDgAArwMAINwBAACyAwAw3QEAABMAEN4BAACyAwAw3wEBAOwCACHgAQEA7AIAIecBQADxAgAh8wEBAOwCACH6AUAA8QIAIYwCAACzA6ACIp0CAQDwAgAhngIBAOwCACGgAggA7QIAIaECAACkA4wCIgUDAADnBQAgBgAA6gUAIAcAAO0FACAOAADsBQAgnQIAALoDACARAwAApwMAIAYAAKsDACAHAAC0AwAgDgAArwMAINwBAACyAwAw3QEAABMAEN4BAACyAwAw3wEBAAAAAeABAQDsAgAh5wFAAPECACHzAQEA7AIAIfoBQADxAgAhjAIAALMDoAIinQIBAPACACGeAgEA7AIAIaACCADtAgAhoQIAAKQDjAIiAwAAABMAIAEAABQAMAIAABUAIBMDAACnAwAgCAAAqAMAIAkAAKkDACDcAQAAoQMAMN0BAAAXABDeAQAAoQMAMN8BAQDsAgAh4AEBAOwCACHnAUAA8QIAIfoBQADxAgAhhQIBAPACACGGAgEA8AIAIYgCAACiA4gCIooCAACjA4oCIowCAACkA4wCIo0CCADtAgAhjgIBAPACACGPAgAApQMAIJACQACmAwAhAQAAABcAIAEAAAATACATAwAApwMAIAoAAK4DACALAADyAgAgDgAArwMAINwBAACsAwAw3QEAABoAEN4BAACsAwAw3wEBAOwCACHgAQEA7AIAIecBQADxAgAh-gFAAPECACH9AQgA7QIAIYwCAACtA5sCIpcCAQDsAgAhmAICAO8CACGZAggA7QIAIZsCAQDsAgAhnAIBAOwCACGdAgEA8AIAIQEAAAAaACAKCQAAsQMAIAoAAK4DACDcAQAAsAMAMN0BAAAcABDeAQAAsAMAMN8BAQDsAgAh_QEIAO0CACGGAgEA7AIAIZcCAQDsAgAhmAICAO8CACECCQAA6QUAIAoAAOsFACAKCQAAsQMAIAoAAK4DACDcAQAAsAMAMN0BAAAcABDeAQAAsAMAMN8BAQAAAAH9AQgA7QIAIYYCAQDsAgAhlwIBAOwCACGYAgIA7wIAIQMAAAAcACABAAAdADACAAAeACAFAwAA5wUAIAoAAOsFACALAADeBAAgDgAA7AUAIJ0CAAC6AwAgEwMAAKcDACAKAACuAwAgCwAA8gIAIA4AAK8DACDcAQAArAMAMN0BAAAaABDeAQAArAMAMN8BAQAAAAHgAQEA7AIAIecBQADxAgAh-gFAAPECACH9AQgA7QIAIYwCAACtA5sCIpcCAQDsAgAhmAICAO8CACGZAggA7QIAIZsCAQDsAgAhnAIBAOwCACGdAgEA8AIAIQMAAAAaACABAAAgADACAAAhACABAAAAHAAgAQAAABoAIAEAAAAXACADAAAAHAAgAQAAHQAwAgAAHgAgAQAAABwAIAEAAAATACADAAAAEwAgAQAAFAAwAgAAFQAgDAMAAKcDACAGAACrAwAg3AEAAKoDADDdAQAAKgAQ3gEAAKoDADDfAQEA7AIAIeABAQDsAgAh5wFAAPECACHzAQEA7AIAIfgBCADtAgAh-QEBAPACACH6AUAA8QIAIQMDAADnBQAgBgAA6gUAIPkBAAC6AwAgDAMAAKcDACAGAACrAwAg3AEAAKoDADDdAQAAKgAQ3gEAAKoDADDfAQEAAAAB4AEBAOwCACHnAUAA8QIAIfMBAQDsAgAh-AEIAO0CACH5AQEA8AIAIfoBQADxAgAhAwAAACoAIAEAACsAMAIAACwAIAEAAAAPACABAAAAEwAgAQAAACoAIAMAAAATACABAAAUADACAAAVACAIAwAA5wUAIAgAAOgFACAJAADpBQAghQIAALoDACCGAgAAugMAII4CAAC6AwAgjwIAALoDACCQAgAAugMAIBMDAACnAwAgCAAAqAMAIAkAAKkDACDcAQAAoQMAMN0BAAAXABDeAQAAoQMAMN8BAQAAAAHgAQEA7AIAIecBQADxAgAh-gFAAPECACGFAgEAAAABhgIBAAAAAYgCAACiA4gCIooCAACjA4oCIowCAACkA4wCIo0CCADtAgAhjgIBAAAAAY8CAAClAwAgkAJAAKYDACEDAAAAFwAgAQAAMgAwAgAAMwAgAwAAABoAIAEAACAAMAIAACEAIAMAAAAqACABAAArADACAAAsACABAAAAAwAgAQAAAAcAIAEAAAALACABAAAAEwAgAQAAABcAIAEAAAAaACABAAAAKgAgAQAAAAEAIBQEAACbAwAgBQAAnAMAIAwAAPMCACAPAACeAwAgEQAAoAMAIBIAAJ0DACATAACfAwAg3AEAAJcDADDdAQAAPwAQ3gEAAJcDADDfAQEA7AIAIecBQADxAgAh-gFAAPECACH7AQEA7AIAIYECAQDwAgAhjAIAAJoDtgIisQIBAOwCACGyAiAAmAMAIbQCAACZA7QCIrYCIACYAwAhCAQAAOEFACAFAADiBQAgDAAA3wQAIA8AAOQFACARAADmBQAgEgAA4wUAIBMAAOUFACCBAgAAugMAIAMAAAA_ACABAABAADACAAABACADAAAAPwAgAQAAQAAwAgAAAQAgAwAAAD8AIAEAAEAAMAIAAAEAIBEEAADaBQAgBQAA2wUAIAwAAN8FACAPAADdBQAgEQAA4AUAIBIAANwFACATAADeBQAg3wEBAAAAAecBQAAAAAH6AUAAAAAB-wEBAAAAAYECAQAAAAGMAgAAALYCArECAQAAAAGyAiAAAAABtAIAAAC0AgK2AiAAAAABARkAAEQAIArfAQEAAAAB5wFAAAAAAfoBQAAAAAH7AQEAAAABgQIBAAAAAYwCAAAAtgICsQIBAAAAAbICIAAAAAG0AgAAALQCArYCIAAAAAEBGQAARgAwARkAAEYAMBEEAACIBQAgBQAAiQUAIAwAAI0FACAPAACLBQAgEQAAjgUAIBIAAIoFACATAACMBQAg3wEBAMADACHnAUAAxQMAIfoBQADFAwAh-wEBAMADACGBAgEAwQMAIYwCAACHBbYCIrECAQDAAwAhsgIgAMQDACG0AgAAhgW0AiK2AiAAxAMAIQIAAAABACAZAABJACAK3wEBAMADACHnAUAAxQMAIfoBQADFAwAh-wEBAMADACGBAgEAwQMAIYwCAACHBbYCIrECAQDAAwAhsgIgAMQDACG0AgAAhgW0AiK2AiAAxAMAIQIAAAA_ACAZAABLACACAAAAPwAgGQAASwAgAwAAAAEAICAAAEQAICEAAEkAIAEAAAABACABAAAAPwAgBA0AAIMFACAmAACFBQAgJwAAhAUAIIECAAC6AwAgDdwBAACQAwAw3QEAAFIAEN4BAACQAwAw3wEBANICACHnAUAA1wIAIfoBQADXAgAh-wEBANICACGBAgEA0wIAIYwCAACSA7YCIrECAQDSAgAhsgIgANYCACG0AgAAkQO0AiK2AiAA1gIAIQMAAAA_ACABAABRADAlAABSACADAAAAPwAgAQAAQAAwAgAAAQAgAQAAAAUAIAEAAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACAJAwAAggUAIN8BAQAAAAHgAQEAAAAB5wFAAAAAAfoBQAAAAAGkAkAAAAABrgIBAAAAAa8CAQAAAAGwAgEAAAABARkAAFoAIAjfAQEAAAAB4AEBAAAAAecBQAAAAAH6AUAAAAABpAJAAAAAAa4CAQAAAAGvAgEAAAABsAIBAAAAAQEZAABcADABGQAAXAAwCQMAAIEFACDfAQEAwAMAIeABAQDAAwAh5wFAAMUDACH6AUAAxQMAIaQCQADFAwAhrgIBAMADACGvAgEAwQMAIbACAQDBAwAhAgAAAAUAIBkAAF8AIAjfAQEAwAMAIeABAQDAAwAh5wFAAMUDACH6AUAAxQMAIaQCQADFAwAhrgIBAMADACGvAgEAwQMAIbACAQDBAwAhAgAAAAMAIBkAAGEAIAIAAAADACAZAABhACADAAAABQAgIAAAWgAgIQAAXwAgAQAAAAUAIAEAAAADACAFDQAA_gQAICYAAIAFACAnAAD_BAAgrwIAALoDACCwAgAAugMAIAvcAQAAjwMAMN0BAABoABDeAQAAjwMAMN8BAQDSAgAh4AEBANICACHnAUAA1wIAIfoBQADXAgAhpAJAANcCACGuAgEA0gIAIa8CAQDTAgAhsAIBANMCACEDAAAAAwAgAQAAZwAwJQAAaAAgAwAAAAMAIAEAAAQAMAIAAAUAIAEAAAAJACABAAAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAAHACABAAAIADACAAAJACADAAAABwAgAQAACAAwAgAACQAgDgMAAP0EACDfAQEAAAAB4AEBAAAAAecBQAAAAAH6AUAAAAABpQIBAAAAAaYCAQAAAAGnAgEAAAABqAIBAAAAAakCAQAAAAGqAkAAAAABqwJAAAAAAawCAQAAAAGtAgEAAAABARkAAHAAIA3fAQEAAAAB4AEBAAAAAecBQAAAAAH6AUAAAAABpQIBAAAAAaYCAQAAAAGnAgEAAAABqAIBAAAAAakCAQAAAAGqAkAAAAABqwJAAAAAAawCAQAAAAGtAgEAAAABARkAAHIAMAEZAAByADAOAwAA_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_QEIAAAAAYwCAAAAmwIClwIBAAAAAZgCAgAAAAGZAggAAAABmwIBAAAAAZwCAQAAAAGdAgEAAAABARkAALUBACAM3wEBAAAAAeABAQAAAAHnAUAAAAAB-gFAAAAAAf0BCAAAAAGMAgAAAJsCApcCAQAAAAGYAgIAAAABmQIIAAAAAZsCAQAAAAGcAgEAAAABnQIBAAAAAQEZAAC3AQAwARkAALcBADAQAwAAtQQAIAoAAO8EACALAAC3BAAgDgAAtgQAIN8BAQDAAwAh4AEBAMADACHnAUAAxQMAIfoBQADFAwAh_QEIAMMDACGMAgAAswSbAiKXAgEAwAMAIZgCAgDCAwAhmQIIAMMDACGbAgEAwAMAIZwCAQDAAwAhnQIBAMEDACECAAAAIQAgGQAAugEAIAzfAQEAwAMAIeABAQDAAwAh5wFAAMUDACH6AUAAxQMAIf0BCADDAwAhjAIAALMEmwIilwIBAMADACGYAgIAwgMAIZkCCADDAwAhmwIBAMADACGcAgEAwAMAIZ0CAQDBAwAhAgAAABoAIBkAALwBACACAAAAGgAgGQAAvAEAIAMAAAAhACAgAAC1AQAgIQAAugEAIAEAAAAhACABAAAAGgAgBg0AAOoEACAmAADtBAAgJwAA7AQAIGgAAOsEACBpAADuBAAgnQIAALoDACAP3AEAAIQDADDdAQAAwwEAEN4BAACEAwAw3wEBANICACHgAQEA0gIAIecBQADXAgAh-gFAANcCACH9AQgA1QIAIYwCAACFA5sCIpcCAQDSAgAhmAICANQCACGZAggA1QIAIZsCAQDSAgAhnAIBANICACGdAgEA0wIAIQMAAAAaACABAADCAQAwJQAAwwEAIAMAAAAaACABAAAgADACAAAhACABAAAAHgAgAQAAAB4AIAMAAAAcACABAAAdADACAAAeACADAAAAHAAgAQAAHQAwAgAAHgAgAwAAABwAIAEAAB0AMAIAAB4AIAcJAADbBAAgCgAAxQQAIN8BAQAAAAH9AQgAAAABhgIBAAAAAZcCAQAAAAGYAgIAAAABARkAAMsBACAF3wEBAAAAAf0BCAAAAAGGAgEAAAABlwIBAAAAAZgCAgAAAAEBGQAAzQEAMAEZAADNAQAwBwkAANkEACAKAADDBAAg3wEBAMADACH9AQgAwwMAIYYCAQDAAwAhlwIBAMADACGYAgIAwgMAIQIAAAAeACAZAADQAQAgBd8BAQDAAwAh_QEIAMMDACGGAgEAwAMAIZcCAQDAAwAhmAICAMIDACECAAAAHAAgGQAA0gEAIAIAAAAcACAZAADSAQAgAwAAAB4AICAAAMsBACAhAADQAQAgAQAAAB4AIAEAAAAcACAFDQAA5QQAICYAAOgEACAnAADnBAAgaAAA5gQAIGkAAOkEACAI3AEAAIMDADDdAQAA2QEAEN4BAACDAwAw3wEBANICACH9AQgA1QIAIYYCAQDSAgAhlwIBANICACGYAgIA1AIAIQMAAAAcACABAADYAQAwJQAA2QEAIAMAAAAcACABAAAdADACAAAeACABAAAAMwAgAQAAADMAIAMAAAAXACABAAAyADACAAAzACADAAAAFwAgAQAAMgAwAgAAMwAgAwAAABcAIAEAADIAMAIAADMAIBADAADyAwAgCAAAzAQAIAkAAPMDACDfAQEAAAAB4AEBAAAAAecBQAAAAAH6AUAAAAABhQIBAAAAAYYCAQAAAAGIAgAAAIgCAooCAAAAigICjAIAAACMAgKNAggAAAABjgIBAAAAAY8CgAAAAAGQAkAAAAABARkAAOEBACAN3wEBAAAAAeABAQAAAAHnAUAAAAAB-gFAAAAAAYUCAQAAAAGGAgEAAAABiAIAAACIAgKKAgAAAIoCAowCAAAAjAICjQIIAAAAAY4CAQAAAAGPAoAAAAABkAJAAAAAAQEZAADjAQAwARkAAOMBADABAAAAEwAgAQAAABoAIBADAADwAwAgCAAAywQAIAkAAPEDACDfAQEAwAMAIeABAQDAAwAh5wFAAMUDACH6AUAAxQMAIYUCAQDBAwAhhgIBAMEDACGIAgAA7QOIAiKKAgAA7gOKAiKMAgAA4wOMAiKNAggAwwMAIY4CAQDBAwAhjwKAAAAAAZACQADvAwAhAgAAADMAIBkAAOgBACAN3wEBAMADACHgAQEAwAMAIecBQADFAwAh-gFAAMUDACGFAgEAwQMAIYYCAQDBAwAhiAIAAO0DiAIiigIAAO4DigIijAIAAOMDjAIijQIIAMMDACGOAgEAwQMAIY8CgAAAAAGQAkAA7wMAIQIAAAAXACAZAADqAQAgAgAAABcAIBkAAOoBACABAAAAEwAgAQAAABoAIAMAAAAzACAgAADhAQAgIQAA6AEAIAEAAAAzACABAAAAFwAgCg0AAOAEACAmAADjBAAgJwAA4gQAIGgAAOEEACBpAADkBAAghQIAALoDACCGAgAAugMAII4CAAC6AwAgjwIAALoDACCQAgAAugMAIBDcAQAA9AIAMN0BAADzAQAQ3gEAAPQCADDfAQEA0gIAIeABAQDSAgAh5wFAANcCACH6AUAA1wIAIYUCAQDTAgAhhgIBANMCACGIAgAA9QKIAiKKAgAA9gKKAiKMAgAA9wKMAiKNAggA1QIAIY4CAQDTAgAhjwIAAPgCACCQAkAA-QIAIQMAAAAXACABAADyAQAwJQAA8wEAIAMAAAAXACABAAAyADACAAAzACAOCwAA8gIAIAwAAPMCACDcAQAA6wIAMN0BAAD5AQAQ3gEAAOsCADDfAQEAAAAB5wFAAPECACH6AUAA8QIAIfsBAQDsAgAh_AEBAOwCACH9AQgA7QIAIf8BAADuAv8BIoACAgDvAgAhgQIBAPACACEBAAAA9gEAIAEAAAD2AQAgDgsAAPICACAMAADzAgAg3AEAAOsCADDdAQAA-QEAEN4BAADrAgAw3wEBAOwCACHnAUAA8QIAIfoBQADxAgAh-wEBAOwCACH8AQEA7AIAIf0BCADtAgAh_wEAAO4C_wEigAICAO8CACGBAgEA8AIAIQMLAADeBAAgDAAA3wQAIIECAAC6AwAgAwAAAPkBACABAAD6AQAwAgAA9gEAIAMAAAD5AQAgAQAA-gEAMAIAAPYBACADAAAA-QEAIAEAAPoBADACAAD2AQAgCwsAANwEACAMAADdBAAg3wEBAAAAAecBQAAAAAH6AUAAAAAB-wEBAAAAAfwBAQAAAAH9AQgAAAAB_wEAAAD_AQKAAgIAAAABgQIBAAAAAQEZAAD-AQAgCd8BAQAAAAHnAUAAAAAB-gFAAAAAAfsBAQAAAAH8AQEAAAAB_QEIAAAAAf8BAAAA_wECgAICAAAAAYECAQAAAAEBGQAAgAIAMAEZAACAAgAwCwsAAKcEACAMAACoBAAg3wEBAMADACHnAUAAxQMAIfoBQADFAwAh-wEBAMADACH8AQEAwAMAIf0BCADDAwAh_wEAAKYE_wEigAICAMIDACGBAgEAwQMAIQIAAAD2AQAgGQAAgwIAIAnfAQEAwAMAIecBQADFAwAh-gFAAMUDACH7AQEAwAMAIfwBAQDAAwAh_QEIAMMDACH_AQAApgT_ASKAAgIAwgMAIYECAQDBAwAhAgAAAPkBACAZAACFAgAgAgAAAPkBACAZAACFAgAgAwAAAPYBACAgAAD-AQAgIQAAgwIAIAEAAAD2AQAgAQAAAPkBACAGDQAAoQQAICYAAKQEACAnAACjBAAgaAAAogQAIGkAAKUEACCBAgAAugMAIAzcAQAA5wIAMN0BAACMAgAQ3gEAAOcCADDfAQEA0gIAIecBQADXAgAh-gFAANcCACH7AQEA0gIAIfwBAQDSAgAh_QEIANUCACH_AQAA6AL_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-gFAANcCACH7AQEA0gIAIfwBAQDSAgAh_QEIANUCACH_AQAA6AL_ASKAAgIA1AIAIYECAQDTAgAhBw0AANkCACAmAADqAgAgJwAA6gIAIOgBAAAA_wEC6QEAAAD_AQjqAQAAAP8BCO8BAADpAv8BIgcNAADZAgAgJgAA6gIAICcAAOoCACDoAQAAAP8BAukBAAAA_wEI6gEAAAD_AQjvAQAA6QL_ASIE6AEAAAD_AQLpAQAAAP8BCOoBAAAA_wEI7wEAAOoC_wEiDgsAAPICACAMAADzAgAg3AEAAOsCADDdAQAA-QEAEN4BAADrAgAw3wEBAOwCACHnAUAA8QIAIfoBQADxAgAh-wEBAOwCACH8AQEA7AIAIf0BCADtAgAh_wEAAO4C_wEigAICAO8CACGBAgEA8AIAIQvoAQEAAAAB6QEBAAAABOoBAQAAAATrAQEAAAAB7AEBAAAAAe0BAQAAAAHuAQEAAAAB7wEBAOQCACHwAQEAAAAB8QEBAAAAAfIBAQAAAAEI6AEIAAAAAekBCAAAAATqAQgAAAAE6wEIAAAAAewBCAAAAAHtAQgAAAAB7gEIAAAAAe8BCADeAgAhBOgBAAAA_wEC6QEAAAD_AQjqAQAAAP8BCO8BAADqAv8BIgjoAQIAAAAB6QECAAAABOoBAgAAAATrAQIAAAAB7AECAAAAAe0BAgAAAAHuAQIAAAAB7wECANkCACEL6AEBAAAAAekBAQAAAAXqAQEAAAAF6wEBAAAAAewBAQAAAAHtAQEAAAAB7gEBAAAAAe8BAQDiAgAh8AEBAAAAAfEBAQAAAAHyAQEAAAABCOgBQAAAAAHpAUAAAAAE6gFAAAAABOsBQAAAAAHsAUAAAAAB7QFAAAAAAe4BQAAAAAHvAUAA2gIAIQOCAgAAHAAggwIAABwAIIQCAAAcACADggIAABoAIIMCAAAaACCEAgAAGgAgENwBAAD0AgAw3QEAAPMBABDeAQAA9AIAMN8BAQDSAgAh4AEBANICACHnAUAA1wIAIfoBQADXAgAhhQIBANMCACGGAgEA0wIAIYgCAAD1AogCIooCAAD2AooCIowCAAD3AowCIo0CCADVAgAhjgIBANMCACGPAgAA-AIAIJACQAD5AgAhBw0AANkCACAmAACCAwAgJwAAggMAIOgBAAAAiAIC6QEAAACIAgjqAQAAAIgCCO8BAACBA4gCIgcNAADZAgAgJgAAgAMAICcAAIADACDoAQAAAIoCAukBAAAAigII6gEAAACKAgjvAQAA_wKKAiIHDQAA2QIAICYAAP4CACAnAAD-AgAg6AEAAACMAgLpAQAAAIwCCOoBAAAAjAII7wEAAP0CjAIiDw0AAOECACAmAAD8AgAgJwAA_AIAIOgBgAAAAAHrAYAAAAAB7AGAAAAAAe0BgAAAAAHuAYAAAAAB7wGAAAAAAZECAQAAAAGSAgEAAAABkwIBAAAAAZQCgAAAAAGVAoAAAAABlgKAAAAAAQsNAADhAgAgJgAA-wIAICcAAPsCACDoAUAAAAAB6QFAAAAABeoBQAAAAAXrAUAAAAAB7AFAAAAAAe0BQAAAAAHuAUAAAAAB7wFAAPoCACELDQAA4QIAICYAAPsCACAnAAD7AgAg6AFAAAAAAekBQAAAAAXqAUAAAAAF6wFAAAAAAewBQAAAAAHtAUAAAAAB7gFAAAAAAe8BQAD6AgAhCOgBQAAAAAHpAUAAAAAF6gFAAAAABesBQAAAAAHsAUAAAAAB7QFAAAAAAe4BQAAAAAHvAUAA-wIAIQzoAYAAAAAB6wGAAAAAAewBgAAAAAHtAYAAAAAB7gGAAAAAAe8BgAAAAAGRAgEAAAABkgIBAAAAAZMCAQAAAAGUAoAAAAABlQKAAAAAAZYCgAAAAAEHDQAA2QIAICYAAP4CACAnAAD-AgAg6AEAAACMAgLpAQAAAIwCCOoBAAAAjAII7wEAAP0CjAIiBOgBAAAAjAIC6QEAAACMAgjqAQAAAIwCCO8BAAD-AowCIgcNAADZAgAgJgAAgAMAICcAAIADACDoAQAAAIoCAukBAAAAigII6gEAAACKAgjvAQAA_wKKAiIE6AEAAACKAgLpAQAAAIoCCOoBAAAAigII7wEAAIADigIiBw0AANkCACAmAACCAwAgJwAAggMAIOgBAAAAiAIC6QEAAACIAgjqAQAAAIgCCO8BAACBA4gCIgToAQAAAIgCAukBAAAAiAII6gEAAACIAgjvAQAAggOIAiII3AEAAIMDADDdAQAA2QEAEN4BAACDAwAw3wEBANICACH9AQgA1QIAIYYCAQDSAgAhlwIBANICACGYAgIA1AIAIQ_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_ACC4AgAAPwAgEwMAAKcDACAGAACrAwAgBwAAtAMAIA4AAK8DACDcAQAAsgMAMN0BAAATABDeAQAAsgMAMN8BAQDsAgAh4AEBAOwCACHnAUAA8QIAIfMBAQDsAgAh-gFAAPECACGMAgAAswOgAiKdAgEA8AIAIZ4CAQDsAgAhoAIIAO0CACGhAgAApAOMAiK3AgAAEwAguAIAABMAIBUDAACnAwAgCgAArgMAIAsAAPICACAOAACvAwAg3AEAAKwDADDdAQAAGgAQ3gEAAKwDADDfAQEA7AIAIeABAQDsAgAh5wFAAPECACH6AUAA8QIAIf0BCADtAgAhjAIAAK0DmwIilwIBAOwCACGYAgIA7wIAIZkCCADtAgAhmwIBAOwCACGcAgEA7AIAIZ0CAQDwAgAhtwIAABoAILgCAAAaACAMAwAApwMAIAYAAKsDACDcAQAAqgMAMN0BAAAqABDeAQAAqgMAMN8BAQDsAgAh4AEBAOwCACHnAUAA8QIAIfMBAQDsAgAh-AEIAO0CACH5AQEA8AIAIfoBQADxAgAhEgMAAKcDACAPAACeAwAgEAAAtwMAIBEAAKADACDcAQAAtgMAMN0BAAALABDeAQAAtgMAMN8BAQDsAgAh4AEBAOwCACHhAQEA8AIAIeIBAQDsAgAh4wECAO8CACHkAQgA7QIAIeUBCADtAgAh5gEgAJgDACHnAUAA8QIAIbcCAAALACC4AgAACwAgEwMAAKcDACAKAACuAwAgCwAA8gIAIA4AAK8DACDcAQAArAMAMN0BAAAaABDeAQAArAMAMN8BAQDsAgAh4AEBAOwCACHnAUAA8QIAIfoBQADxAgAh_QEIAO0CACGMAgAArQObAiKXAgEA7AIAIZgCAgDvAgAhmQIIAO0CACGbAgEA7AIAIZwCAQDsAgAhnQIBAPACACEE6AEAAACbAgLpAQAAAJsCCOoBAAAAmwII7wEAAIcDmwIiEAsAAPICACAMAADzAgAg3AEAAOsCADDdAQAA-QEAEN4BAADrAgAw3wEBAOwCACHnAUAA8QIAIfoBQADxAgAh-wEBAOwCACH8AQEA7AIAIf0BCADtAgAh_wEAAO4C_wEigAICAO8CACGBAgEA8AIAIbcCAAD5AQAguAIAAPkBACAVAwAApwMAIAgAAKgDACAJAACpAwAg3AEAAKEDADDdAQAAFwAQ3gEAAKEDADDfAQEA7AIAIeABAQDsAgAh5wFAAPECACH6AUAA8QIAIYUCAQDwAgAhhgIBAPACACGIAgAAogOIAiKKAgAAowOKAiKMAgAApAOMAiKNAggA7QIAIY4CAQDwAgAhjwIAAKUDACCQAkAApgMAIbcCAAAXACC4AgAAFwAgCgkAALEDACAKAACuAwAg3AEAALADADDdAQAAHAAQ3gEAALADADDfAQEA7AIAIf0BCADtAgAhhgIBAOwCACGXAgEA7AIAIZgCAgDvAgAhFQMAAKcDACAKAACuAwAgCwAA8gIAIA4AAK8DACDcAQAArAMAMN0BAAAaABDeAQAArAMAMN8BAQDsAgAh4AEBAOwCACHnAUAA8QIAIfoBQADxAgAh_QEIAO0CACGMAgAArQObAiKXAgEA7AIAIZgCAgDvAgAhmQIIAO0CACGbAgEA7AIAIZwCAQDsAgAhnQIBAPACACG3AgAAGgAguAIAABoAIBEDAACnAwAgBgAAqwMAIAcAALQDACAOAACvAwAg3AEAALIDADDdAQAAEwAQ3gEAALIDADDfAQEA7AIAIeABAQDsAgAh5wFAAPECACHzAQEA7AIAIfoBQADxAgAhjAIAALMDoAIinQIBAPACACGeAgEA7AIAIaACCADtAgAhoQIAAKQDjAIiBOgBAAAAoAIC6QEAAACgAgjqAQAAAKACCO8BAACLA6ACIg4GAACrAwAgDwAAngMAINwBAAC1AwAw3QEAAA8AEN4BAAC1AwAw3wEBAOwCACHnAUAA8QIAIfMBAQDsAgAh9AFAAPECACH1AQEA7AIAIfYBAQDsAgAh9wEgAJgDACG3AgAADwAguAIAAA8AIAwGAACrAwAgDwAAngMAINwBAAC1AwAw3QEAAA8AEN4BAAC1AwAw3wEBAOwCACHnAUAA8QIAIfMBAQDsAgAh9AFAAPECACH1AQEA7AIAIfYBAQDsAgAh9wEgAJgDACEQAwAApwMAIA8AAJ4DACAQAAC3AwAgEQAAoAMAINwBAAC2AwAw3QEAAAsAEN4BAAC2AwAw3wEBAOwCACHgAQEA7AIAIeEBAQDwAgAh4gEBAOwCACHjAQIA7wIAIeQBCADtAgAh5QEIAO0CACHmASAAmAMAIecBQADxAgAhA4ICAAAPACCDAgAADwAghAIAAA8AIBEDAACnAwAg3AEAALgDADDdAQAABwAQ3gEAALgDADDfAQEA7AIAIeABAQDsAgAh5wFAAPECACH6AUAA8QIAIaUCAQDsAgAhpgIBAOwCACGnAgEA8AIAIagCAQDwAgAhqQIBAPACACGqAkAApgMAIasCQACmAwAhrAIBAPACACGtAgEA8AIAIQwDAACnAwAg3AEAALkDADDdAQAAAwAQ3gEAALkDADDfAQEA7AIAIeABAQDsAgAh5wFAAPECACH6AUAA8QIAIaQCQADxAgAhrgIBAOwCACGvAgEA8AIAIbACAQDwAgAhAAAAAAAAAbwCAQAAAAEBvAIBAAAAAQW8AgIAAAABwgICAAAAAcMCAgAAAAHEAgIAAAABxQICAAAAAQW8AggAAAABwgIIAAAAAcMCCAAAAAHEAggAAAABxQIIAAAAAQG8AiAAAAABAbwCQAAAAAEFIAAApgYAICEAAMsGACC5AgAApwYAILoCAADKBgAgvwIAAAEAIAsgAAD4AwAwIQAA_QMAMLkCAAD5AwAwugIAAPoDADC7AgAA-wMAILwCAAD8AwAwvQIAAPwDADC-AgAA_AMAML8CAAD8AwAwwAIAAP4DADDBAgAA_wMAMAsgAADYAwAwIQAA3QMAMLkCAADZAwAwugIAANoDADC7AgAA2wMAILwCAADcAwAwvQIAANwDADC-AgAA3AMAML8CAADcAwAwwAIAAN4DADDBAgAA3wMAMAsgAADKAwAwIQAAzwMAMLkCAADLAwAwugIAAMwDADC7AgAAzQMAILwCAADOAwAwvQIAAM4DADC-AgAAzgMAML8CAADOAwAwwAIAANADADDBAgAA0QMAMAcDAADXAwAg3wEBAAAAAeABAQAAAAHnAUAAAAAB-AEIAAAAAfkBAQAAAAH6AUAAAAABAgAAACwAICAAANYDACADAAAALAAgIAAA1gMAICEAANQDACABGQAAyQYAMAwDAACnAwAgBgAAqwMAINwBAACqAwAw3QEAACoAEN4BAACqAwAw3wEBAAAAAeABAQDsAgAh5wFAAPECACHzAQEA7AIAIfgBCADtAgAh-QEBAPACACH6AUAA8QIAIQIAAAAsACAZAADUAwAgAgAAANIDACAZAADTAwAgCtwBAADRAwAw3QEAANIDABDeAQAA0QMAMN8BAQDsAgAh4AEBAOwCACHnAUAA8QIAIfMBAQDsAgAh-AEIAO0CACH5AQEA8AIAIfoBQADxAgAhCtwBAADRAwAw3QEAANIDABDeAQAA0QMAMN8BAQDsAgAh4AEBAOwCACHnAUAA8QIAIfMBAQDsAgAh-AEIAO0CACH5AQEA8AIAIfoBQADxAgAhBt8BAQDAAwAh4AEBAMADACHnAUAAxQMAIfgBCADDAwAh-QEBAMEDACH6AUAAxQMAIQcDAADVAwAg3wEBAMADACHgAQEAwAMAIecBQADFAwAh-AEIAMMDACH5AQEAwQMAIfoBQADFAwAhBSAAAMQGACAhAADHBgAguQIAAMUGACC6AgAAxgYAIL8CAAABACAHAwAA1wMAIN8BAQAAAAHgAQEAAAAB5wFAAAAAAfgBCAAAAAH5AQEAAAAB-gFAAAAAAQMgAADEBgAguQIAAMUGACC_AgAAAQAgDAMAAPUDACAHAAD2AwAgDgAA9wMAIN8BAQAAAAHgAQEAAAAB5wFAAAAAAfoBQAAAAAGMAgAAAKACAp0CAQAAAAGeAgEAAAABoAIIAAAAAaECAAAAjAICAgAAABUAICAAAPQDACADAAAAFQAgIAAA9AMAICEAAOQDACABGQAAwwYAMBEDAACnAwAgBgAAqwMAIAcAALQDACAOAACvAwAg3AEAALIDADDdAQAAEwAQ3gEAALIDADDfAQEAAAAB4AEBAOwCACHnAUAA8QIAIfMBAQDsAgAh-gFAAPECACGMAgAAswOgAiKdAgEA8AIAIZ4CAQDsAgAhoAIIAO0CACGhAgAApAOMAiICAAAAFQAgGQAA5AMAIAIAAADgAwAgGQAA4QMAIA3cAQAA3wMAMN0BAADgAwAQ3gEAAN8DADDfAQEA7AIAIeABAQDsAgAh5wFAAPECACHzAQEA7AIAIfoBQADxAgAhjAIAALMDoAIinQIBAPACACGeAgEA7AIAIaACCADtAgAhoQIAAKQDjAIiDdwBAADfAwAw3QEAAOADABDeAQAA3wMAMN8BAQDsAgAh4AEBAOwCACHnAUAA8QIAIfMBAQDsAgAh-gFAAPECACGMAgAAswOgAiKdAgEA8AIAIZ4CAQDsAgAhoAIIAO0CACGhAgAApAOMAiIJ3wEBAMADACHgAQEAwAMAIecBQADFAwAh-gFAAMUDACGMAgAA4gOgAiKdAgEAwQMAIZ4CAQDAAwAhoAIIAMMDACGhAgAA4wOMAiIBvAIAAACgAgIBvAIAAACMAgIMAwAA5QMAIAcAAOYDACAOAADnAwAg3wEBAMADACHgAQEAwAMAIecBQADFAwAh-gFAAMUDACGMAgAA4gOgAiKdAgEAwQMAIZ4CAQDAAwAhoAIIAMMDACGhAgAA4wOMAiIFIAAAsQYAICEAAMEGACC5AgAAsgYAILoCAADABgAgvwIAAAEAIAUgAACvBgAgIQAAvgYAILkCAACwBgAgugIAAL0GACC_AgAAEQAgByAAAOgDACAhAADrAwAguQIAAOkDACC6AgAA6gMAIL0CAAAXACC-AgAAFwAgvwIAADMAIA4DAADyAwAgCQAA8wMAIN8BAQAAAAHgAQEAAAAB5wFAAAAAAfoBQAAAAAGGAgEAAAABiAIAAACIAgKKAgAAAIoCAowCAAAAjAICjQIIAAAAAY4CAQAAAAGPAoAAAAABkAJAAAAAAQIAAAAzACAgAADoAwAgAwAAABcAICAAAOgDACAhAADsAwAgEAAAABcAIAMAAPADACAJAADxAwAgGQAA7AMAIN8BAQDAAwAh4AEBAMADACHnAUAAxQMAIfoBQADFAwAhhgIBAMEDACGIAgAA7QOIAiKKAgAA7gOKAiKMAgAA4wOMAiKNAggAwwMAIY4CAQDBAwAhjwKAAAAAAZACQADvAwAhDgMAAPADACAJAADxAwAg3wEBAMADACHgAQEAwAMAIecBQADFAwAh-gFAAMUDACGGAgEAwQMAIYgCAADtA4gCIooCAADuA4oCIowCAADjA4wCIo0CCADDAwAhjgIBAMEDACGPAoAAAAABkAJAAO8DACEBvAIAAACIAgIBvAIAAACKAgIBvAJAAAAAAQUgAAC1BgAgIQAAuwYAILkCAAC2BgAgugIAALoGACC_AgAAAQAgByAAALMGACAhAAC4BgAguQIAALQGACC6AgAAtwYAIL0CAAAaACC-AgAAGgAgvwIAACEAIAMgAAC1BgAguQIAALYGACC_AgAAAQAgAyAAALMGACC5AgAAtAYAIL8CAAAhACAMAwAA9QMAIAcAAPYDACAOAAD3AwAg3wEBAAAAAeABAQAAAAHnAUAAAAAB-gFAAAAAAYwCAAAAoAICnQIBAAAAAZ4CAQAAAAGgAggAAAABoQIAAACMAgIDIAAAsQYAILkCAACyBgAgvwIAAAEAIAMgAACvBgAguQIAALAGACC_AgAAEQAgAyAAAOgDACC5AgAA6QMAIL8CAAAzACAHDwAAkAQAIN8BAQAAAAHnAUAAAAAB9AFAAAAAAfUBAQAAAAH2AQEAAAAB9wEgAAAAAQIAAAARACAgAACPBAAgAwAAABEAICAAAI8EACAhAACCBAAgARkAAK4GADAMBgAAqwMAIA8AAJ4DACDcAQAAtQMAMN0BAAAPABDeAQAAtQMAMN8BAQAAAAHnAUAA8QIAIfMBAQDsAgAh9AFAAPECACH1AQEA7AIAIfYBAQDsAgAh9wEgAJgDACECAAAAEQAgGQAAggQAIAIAAACABAAgGQAAgQQAIArcAQAA_wMAMN0BAACABAAQ3gEAAP8DADDfAQEA7AIAIecBQADxAgAh8wEBAOwCACH0AUAA8QIAIfUBAQDsAgAh9gEBAOwCACH3ASAAmAMAIQrcAQAA_wMAMN0BAACABAAQ3gEAAP8DADDfAQEA7AIAIecBQADxAgAh8wEBAOwCACH0AUAA8QIAIfUBAQDsAgAh9gEBAOwCACH3ASAAmAMAIQbfAQEAwAMAIecBQADFAwAh9AFAAMUDACH1AQEAwAMAIfYBAQDAAwAh9wEgAMQDACEHDwAAgwQAIN8BAQDAAwAh5wFAAMUDACH0AUAAxQMAIfUBAQDAAwAh9gEBAMADACH3ASAAxAMAIQsgAACEBAAwIQAAiAQAMLkCAACFBAAwugIAAIYEADC7AgAAhwQAILwCAADcAwAwvQIAANwDADC-AgAA3AMAML8CAADcAwAwwAIAAIkEADDBAgAA3wMAMAwDAAD1AwAgBgAAjgQAIA4AAPcDACDfAQEAAAAB4AEBAAAAAecBQAAAAAHzAQEAAAAB-gFAAAAAAYwCAAAAoAICnQIBAAAAAaACCAAAAAGhAgAAAIwCAgIAAAAVACAgAACNBAAgAwAAABUAICAAAI0EACAhAACLBAAgARkAAK0GADACAAAAFQAgGQAAiwQAIAIAAADgAwAgGQAAigQAIAnfAQEAwAMAIeABAQDAAwAh5wFAAMUDACHzAQEAwAMAIfoBQADFAwAhjAIAAOIDoAIinQIBAMEDACGgAggAwwMAIaECAADjA4wCIgwDAADlAwAgBgAAjAQAIA4AAOcDACDfAQEAwAMAIeABAQDAAwAh5wFAAMUDACHzAQEAwAMAIfoBQADFAwAhjAIAAOIDoAIinQIBAMEDACGgAggAwwMAIaECAADjA4wCIgUgAACoBgAgIQAAqwYAILkCAACpBgAgugIAAKoGACC_AgAADQAgDAMAAPUDACAGAACOBAAgDgAA9wMAIN8BAQAAAAHgAQEAAAAB5wFAAAAAAfMBAQAAAAH6AUAAAAABjAIAAACgAgKdAgEAAAABoAIIAAAAAaECAAAAjAICAyAAAKgGACC5AgAAqQYAIL8CAAANACAHDwAAkAQAIN8BAQAAAAHnAUAAAAAB9AFAAAAAAfUBAQAAAAH2AQEAAAAB9wEgAAAAAQQgAACEBAAwuQIAAIUEADC7AgAAhwQAIL8CAADcAwAwAyAAAKYGACC5AgAApwYAIL8CAAABACAEIAAA-AMAMLkCAAD5AwAwuwIAAPsDACC_AgAA_AMAMAQgAADYAwAwuQIAANkDADC7AgAA2wMAIL8CAADcAwAwBCAAAMoDADC5AgAAywMAMLsCAADNAwAgvwIAAM4DADAAAAAFIAAAoQYAICEAAKQGACC5AgAAogYAILoCAACjBgAgvwIAAA0AIAMgAAChBgAguQIAAKIGACC_AgAADQAgAAAAAAAFIAAAnAYAICEAAJ8GACC5AgAAnQYAILoCAACeBgAgvwIAAA0AIAMgAACcBgAguQIAAJ0GACC_AgAADQAgAAAAAAABvAIAAAD_AQILIAAA0QQAMCEAANUEADC5AgAA0gQAMLoCAADTBAAwuwIAANQEACC8AgAAvAQAML0CAAC8BAAwvgIAALwEADC_AgAAvAQAMMACAADWBAAwwQIAAL8EADALIAAAqQQAMCEAAK4EADC5AgAAqgQAMLoCAACrBAAwuwIAAKwEACC8AgAArQQAML0CAACtBAAwvgIAAK0EADC_AgAArQQAMMACAACvBAAwwQIAALAEADAOAwAAzgQAIAsAANAEACAOAADPBAAg3wEBAAAAAeABAQAAAAHnAUAAAAAB-gFAAAAAAf0BCAAAAAGMAgAAAJsCApgCAgAAAAGZAggAAAABmwIBAAAAAZwCAQAAAAGdAgEAAAABAgAAACEAICAAAM0EACADAAAAIQAgIAAAzQQAICEAALQEACABGQAAmwYAMBMDAACnAwAgCgAArgMAIAsAAPICACAOAACvAwAg3AEAAKwDADDdAQAAGgAQ3gEAAKwDADDfAQEAAAAB4AEBAOwCACHnAUAA8QIAIfoBQADxAgAh_QEIAO0CACGMAgAArQObAiKXAgEA7AIAIZgCAgDvAgAhmQIIAO0CACGbAgEA7AIAIZwCAQDsAgAhnQIBAPACACECAAAAIQAgGQAAtAQAIAIAAACxBAAgGQAAsgQAIA_cAQAAsAQAMN0BAACxBAAQ3gEAALAEADDfAQEA7AIAIeABAQDsAgAh5wFAAPECACH6AUAA8QIAIf0BCADtAgAhjAIAAK0DmwIilwIBAOwCACGYAgIA7wIAIZkCCADtAgAhmwIBAOwCACGcAgEA7AIAIZ0CAQDwAgAhD9wBAACwBAAw3QEAALEEABDeAQAAsAQAMN8BAQDsAgAh4AEBAOwCACHnAUAA8QIAIfoBQADxAgAh_QEIAO0CACGMAgAArQObAiKXAgEA7AIAIZgCAgDvAgAhmQIIAO0CACGbAgEA7AIAIZwCAQDsAgAhnQIBAPACACEL3wEBAMADACHgAQEAwAMAIecBQADFAwAh-gFAAMUDACH9AQgAwwMAIYwCAACzBJsCIpgCAgDCAwAhmQIIAMMDACGbAgEAwAMAIZwCAQDAAwAhnQIBAMEDACEBvAIAAACbAgIOAwAAtQQAIAsAALcEACAOAAC2BAAg3wEBAMADACHgAQEAwAMAIecBQADFAwAh-gFAAMUDACH9AQgAwwMAIYwCAACzBJsCIpgCAgDCAwAhmQIIAMMDACGbAgEAwAMAIZwCAQDAAwAhnQIBAMEDACEFIAAAiwYAICEAAJkGACC5AgAAjAYAILoCAACYBgAgvwIAAAEAIAcgAADGBAAgIQAAyQQAILkCAADHBAAgugIAAMgEACC9AgAAFwAgvgIAABcAIL8CAAAzACALIAAAuAQAMCEAAL0EADC5AgAAuQQAMLoCAAC6BAAwuwIAALsEACC8AgAAvAQAML0CAAC8BAAwvgIAALwEADC_AgAAvAQAMMACAAC-BAAwwQIAAL8EADAFCgAAxQQAIN8BAQAAAAH9AQgAAAABlwIBAAAAAZgCAgAAAAECAAAAHgAgIAAAxAQAIAMAAAAeACAgAADEBAAgIQAAwgQAIAEZAACXBgAwCgkAALEDACAKAACuAwAg3AEAALADADDdAQAAHAAQ3gEAALADADDfAQEAAAAB_QEIAO0CACGGAgEA7AIAIZcCAQDsAgAhmAICAO8CACECAAAAHgAgGQAAwgQAIAIAAADABAAgGQAAwQQAIAjcAQAAvwQAMN0BAADABAAQ3gEAAL8EADDfAQEA7AIAIf0BCADtAgAhhgIBAOwCACGXAgEA7AIAIZgCAgDvAgAhCNwBAAC_BAAw3QEAAMAEABDeAQAAvwQAMN8BAQDsAgAh_QEIAO0CACGGAgEA7AIAIZcCAQDsAgAhmAICAO8CACEE3wEBAMADACH9AQgAwwMAIZcCAQDAAwAhmAICAMIDACEFCgAAwwQAIN8BAQDAAwAh_QEIAMMDACGXAgEAwAMAIZgCAgDCAwAhBSAAAJIGACAhAACVBgAguQIAAJMGACC6AgAAlAYAIL8CAAD2AQAgBQoAAMUEACDfAQEAAAAB_QEIAAAAAZcCAQAAAAGYAgIAAAABAyAAAJIGACC5AgAAkwYAIL8CAAD2AQAgDgMAAPIDACAIAADMBAAg3wEBAAAAAeABAQAAAAHnAUAAAAAB-gFAAAAAAYUCAQAAAAGIAgAAAIgCAooCAAAAigICjAIAAACMAgKNAggAAAABjgIBAAAAAY8CgAAAAAGQAkAAAAABAgAAADMAICAAAMYEACADAAAAFwAgIAAAxgQAICEAAMoEACAQAAAAFwAgAwAA8AMAIAgAAMsEACAZAADKBAAg3wEBAMADACHgAQEAwAMAIecBQADFAwAh-gFAAMUDACGFAgEAwQMAIYgCAADtA4gCIooCAADuA4oCIowCAADjA4wCIo0CCADDAwAhjgIBAMEDACGPAoAAAAABkAJAAO8DACEOAwAA8AMAIAgAAMsEACDfAQEAwAMAIeABAQDAAwAh5wFAAMUDACH6AUAAxQMAIYUCAQDBAwAhiAIAAO0DiAIiigIAAO4DigIijAIAAOMDjAIijQIIAMMDACGOAgEAwQMAIY8CgAAAAAGQAkAA7wMAIQcgAACNBgAgIQAAkAYAILkCAACOBgAgugIAAI8GACC9AgAAEwAgvgIAABMAIL8CAAAVACADIAAAjQYAILkCAACOBgAgvwIAABUAIA4DAADOBAAgCwAA0AQAIA4AAM8EACDfAQEAAAAB4AEBAAAAAecBQAAAAAH6AUAAAAAB_QEIAAAAAYwCAAAAmwICmAICAAAAAZkCCAAAAAGbAgEAAAABnAIBAAAAAZ0CAQAAAAEDIAAAiwYAILkCAACMBgAgvwIAAAEAIAMgAADGBAAguQIAAMcEACC_AgAAMwAgBCAAALgEADC5AgAAuQQAMLsCAAC7BAAgvwIAALwEADAFCQAA2wQAIN8BAQAAAAH9AQgAAAABhgIBAAAAAZgCAgAAAAECAAAAHgAgIAAA2gQAIAMAAAAeACAgAADaBAAgIQAA2AQAIAEZAACKBgAwAgAAAB4AIBkAANgEACACAAAAwAQAIBkAANcEACAE3wEBAMADACH9AQgAwwMAIYYCAQDAAwAhmAICAMIDACEFCQAA2QQAIN8BAQDAAwAh_QEIAMMDACGGAgEAwAMAIZgCAgDCAwAhBSAAAIUGACAhAACIBgAguQIAAIYGACC6AgAAhwYAIL8CAAAhACAFCQAA2wQAIN8BAQAAAAH9AQgAAAABhgIBAAAAAZgCAgAAAAEDIAAAhQYAILkCAACGBgAgvwIAACEAIAQgAADRBAAwuQIAANIEADC7AgAA1AQAIL8CAAC8BAAwBCAAAKkEADC5AgAAqgQAMLsCAACsBAAgvwIAAK0EADAAAAAAAAAAAAAAAAAAAAAAAAUgAACABgAgIQAAgwYAILkCAACBBgAgugIAAIIGACC_AgAA9gEAIAMgAACABgAguQIAAIEGACC_AgAA9gEAIAAAAAAAAAAAAAAABSAAAPsFACAhAAD-BQAguQIAAPwFACC6AgAA_QUAIL8CAAABACADIAAA-wUAILkCAAD8BQAgvwIAAAEAIAAAAAUgAAD2BQAgIQAA-QUAILkCAAD3BQAgugIAAPgFACC_AgAAAQAgAyAAAPYFACC5AgAA9wUAIL8CAAABACAAAAABvAIAAAC0AgIBvAIAAAC2AgILIAAAzgUAMCEAANMFADC5AgAAzwUAMLoCAADQBQAwuwIAANEFACC8AgAA0gUAML0CAADSBQAwvgIAANIFADC_AgAA0gUAMMACAADUBQAwwQIAANUFADALIAAAwgUAMCEAAMcFADC5AgAAwwUAMLoCAADEBQAwuwIAAMUFACC8AgAAxgUAML0CAADGBQAwvgIAAMYFADC_AgAAxgUAMMACAADIBQAwwQIAAMkFADALIAAAtgUAMCEAALsFADC5AgAAtwUAMLoCAAC4BQAwuwIAALkFACC8AgAAugUAML0CAAC6BQAwvgIAALoFADC_AgAAugUAMMACAAC8BQAwwQIAAL0FADALIAAArQUAMCEAALEFADC5AgAArgUAMLoCAACvBQAwuwIAALAFACC8AgAA3AMAML0CAADcAwAwvgIAANwDADC_AgAA3AMAMMACAACyBQAwwQIAAN8DADALIAAAoQUAMCEAAKYFADC5AgAAogUAMLoCAACjBQAwuwIAAKQFACC8AgAApQUAML0CAAClBQAwvgIAAKUFADC_AgAApQUAMMACAACnBQAwwQIAAKgFADALIAAAmAUAMCEAAJwFADC5AgAAmQUAMLoCAACaBQAwuwIAAJsFACC8AgAArQQAML0CAACtBAAwvgIAAK0EADC_AgAArQQAMMACAACdBQAwwQIAALAEADALIAAAjwUAMCEAAJMFADC5AgAAkAUAMLoCAACRBQAwuwIAAJIFACC8AgAAzgMAML0CAADOAwAwvgIAAM4DADC_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-BQAgGQAAvwUAIAzcAQAAvQUAMN0BAAC-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_AgAAxgUAMAQgAAC2BQAwuQIAALcFADC7AgAAuQUAIL8CAAC6BQAwBCAAAK0FADC5AgAArgUAMLsCAACwBQAgvwIAANwDADAEIAAAoQUAMLkCAACiBQAwuwIAAKQFACC_AgAApQUAMAQgAACYBQAwuQIAAJkFADC7AgAAmwUAIL8CAACtBAAwBCAAAI8FADC5AgAAkAUAMLsCAACSBQAgvwIAAM4DADAAAAAAAAAIBAAA4QUAIAUAAOIFACAMAADfBAAgDwAA5AUAIBEAAOYFACASAADjBQAgEwAA5QUAIIECAAC6AwAgBQMAAOcFACAGAADqBQAgBwAA7QUAIA4AAOwFACCdAgAAugMAIAUDAADnBQAgCgAA6wUAIAsAAN4EACAOAADsBQAgnQIAALoDACAFAwAA5wUAIA8AAOQFACAQAADuBQAgEQAA5gUAIOEBAAC6AwAgAwsAAN4EACAMAADfBAAggQIAALoDACAIAwAA5wUAIAgAAOgFACAJAADpBQAghQIAALoDACCGAgAAugMAII4CAAC6AwAgjwIAALoDACCQAgAAugMAIAIGAADqBQAgDwAA5AUAIAAH3wEBAAAAAecBQAAAAAH6AUAAAAABpAJAAAAAAa4CAQAAAAGvAgEAAAABsAIBAAAAAQzfAQEAAAAB5wFAAAAAAfoBQAAAAAGlAgEAAAABpgIBAAAAAacCAQAAAAGoAgEAAAABqQIBAAAAAaoCQAAAAAGrAkAAAAABrAIBAAAAAa0CAQAAAAEI3wEBAAAAAeEBAQAAAAHiAQEAAAAB4wECAAAAAeQBCAAAAAHlAQgAAAAB5gEgAAAAAecBQAAAAAEJ3wEBAAAAAecBQAAAAAHzAQEAAAAB-gFAAAAAAYwCAAAAoAICnQIBAAAAAZ4CAQAAAAGgAggAAAABoQIAAACMAgIM3wEBAAAAAecBQAAAAAH6AUAAAAABhQIBAAAAAYYCAQAAAAGIAgAAAIgCAooCAAAAigICjAIAAACMAgKNAggAAAABjgIBAAAAAY8CgAAAAAGQAkAAAAABC98BAQAAAAHnAUAAAAAB-gFAAAAAAf0BCAAAAAGMAgAAAJsCApcCAQAAAAGYAgIAAAABmQIIAAAAAZsCAQAAAAGcAgEAAAABnQIBAAAAAQbfAQEAAAAB5wFAAAAAAfMBAQAAAAH4AQgAAAAB-QEBAAAAAfoBQAAAAAEQBQAA2wUAIAwAAN8FACAPAADdBQAgEQAA4AUAIBIAANwFACATAADeBQAg3wEBAAAAAecBQAAAAAH6AUAAAAAB-wEBAAAAAYECAQAAAAGMAgAAALYCArECAQAAAAGyAiAAAAABtAIAAAC0AgK2AiAAAAABAgAAAAEAICAAAPYFACADAAAAPwAgIAAA9gUAICEAAPoFACASAAAAPwAgBQAAiQUAIAwAAI0FACAPAACLBQAgEQAAjgUAIBIAAIoFACATAACMBQAgGQAA-gUAIN8BAQDAAwAh5wFAAMUDACH6AUAAxQMAIfsBAQDAAwAhgQIBAMEDACGMAgAAhwW2AiKxAgEAwAMAIbICIADEAwAhtAIAAIYFtAIitgIgAMQDACEQBQAAiQUAIAwAAI0FACAPAACLBQAgEQAAjgUAIBIAAIoFACATAACMBQAg3wEBAMADACHnAUAAxQMAIfoBQADFAwAh-wEBAMADACGBAgEAwQMAIYwCAACHBbYCIrECAQDAAwAhsgIgAMQDACG0AgAAhgW0AiK2AiAAxAMAIRAEAADaBQAgDAAA3wUAIA8AAN0FACARAADgBQAgEgAA3AUAIBMAAN4FACDfAQEAAAAB5wFAAAAAAfoBQAAAAAH7AQEAAAABgQIBAAAAAYwCAAAAtgICsQIBAAAAAbICIAAAAAG0AgAAALQCArYCIAAAAAECAAAAAQAgIAAA-wUAIAMAAAA_ACAgAAD7BQAgIQAA_wUAIBIAAAA_ACAEAACIBQAgDAAAjQUAIA8AAIsFACARAACOBQAgEgAAigUAIBMAAIwFACAZAAD_BQAg3wEBAMADACHnAUAAxQMAIfoBQADFAwAh-wEBAMADACGBAgEAwQMAIYwCAACHBbYCIrECAQDAAwAhsgIgAMQDACG0AgAAhgW0AiK2AiAAxAMAIRAEAACIBQAgDAAAjQUAIA8AAIsFACARAACOBQAgEgAAigUAIBMAAIwFACDfAQEAwAMAIecBQADFAwAh-gFAAMUDACH7AQEAwAMAIYECAQDBAwAhjAIAAIcFtgIisQIBAMADACGyAiAAxAMAIbQCAACGBbQCIrYCIADEAwAhCgsAANwEACDfAQEAAAAB5wFAAAAAAfoBQAAAAAH7AQEAAAAB_AEBAAAAAf0BCAAAAAH_AQAAAP8BAoACAgAAAAGBAgEAAAABAgAAAPYBACAgAACABgAgAwAAAPkBACAgAACABgAgIQAAhAYAIAwAAAD5AQAgCwAApwQAIBkAAIQGACDfAQEAwAMAIecBQADFAwAh-gFAAMUDACH7AQEAwAMAIfwBAQDAAwAh_QEIAMMDACH_AQAApgT_ASKAAgIAwgMAIYECAQDBAwAhCgsAAKcEACDfAQEAwAMAIecBQADFAwAh-gFAAMUDACH7AQEAwAMAIfwBAQDAAwAh_QEIAMMDACH_AQAApgT_ASKAAgIAwgMAIYECAQDBAwAhDwMAAM4EACAKAADwBAAgDgAAzwQAIN8BAQAAAAHgAQEAAAAB5wFAAAAAAfoBQAAAAAH9AQgAAAABjAIAAACbAgKXAgEAAAABmAICAAAAAZkCCAAAAAGbAgEAAAABnAIBAAAAAZ0CAQAAAAECAAAAIQAgIAAAhQYAIAMAAAAaACAgAACFBgAgIQAAiQYAIBEAAAAaACADAAC1BAAgCgAA7wQAIA4AALYEACAZAACJBgAg3wEBAMADACHgAQEAwAMAIecBQADFAwAh-gFAAMUDACH9AQgAwwMAIYwCAACzBJsCIpcCAQDAAwAhmAICAMIDACGZAggAwwMAIZsCAQDAAwAhnAIBAMADACGdAgEAwQMAIQ8DAAC1BAAgCgAA7wQAIA4AALYEACDfAQEAwAMAIeABAQDAAwAh5wFAAMUDACH6AUAAxQMAIf0BCADDAwAhjAIAALMEmwIilwIBAMADACGYAgIAwgMAIZkCCADDAwAhmwIBAMADACGcAgEAwAMAIZ0CAQDBAwAhBN8BAQAAAAH9AQgAAAABhgIBAAAAAZgCAgAAAAEQBAAA2gUAIAUAANsFACAPAADdBQAgEQAA4AUAIBIAANwFACATAADeBQAg3wEBAAAAAecBQAAAAAH6AUAAAAAB-wEBAAAAAYECAQAAAAGMAgAAALYCArECAQAAAAGyAiAAAAABtAIAAAC0AgK2AiAAAAABAgAAAAEAICAAAIsGACANAwAA9QMAIAYAAI4EACAHAAD2AwAg3wEBAAAAAeABAQAAAAHnAUAAAAAB8wEBAAAAAfoBQAAAAAGMAgAAAKACAp0CAQAAAAGeAgEAAAABoAIIAAAAAaECAAAAjAICAgAAABUAICAAAI0GACADAAAAEwAgIAAAjQYAICEAAJEGACAPAAAAEwAgAwAA5QMAIAYAAIwEACAHAADmAwAgGQAAkQYAIN8BAQDAAwAh4AEBAMADACHnAUAAxQMAIfMBAQDAAwAh-gFAAMUDACGMAgAA4gOgAiKdAgEAwQMAIZ4CAQDAAwAhoAIIAMMDACGhAgAA4wOMAiINAwAA5QMAIAYAAIwEACAHAADmAwAg3wEBAMADACHgAQEAwAMAIecBQADFAwAh8wEBAMADACH6AUAAxQMAIYwCAADiA6ACIp0CAQDBAwAhngIBAMADACGgAggAwwMAIaECAADjA4wCIgoMAADdBAAg3wEBAAAAAecBQAAAAAH6AUAAAAAB-wEBAAAAAfwBAQAAAAH9AQgAAAAB_wEAAAD_AQKAAgIAAAABgQIBAAAAAQIAAAD2AQAgIAAAkgYAIAMAAAD5AQAgIAAAkgYAICEAAJYGACAMAAAA-QEAIAwAAKgEACAZAACWBgAg3wEBAMADACHnAUAAxQMAIfoBQADFAwAh-wEBAMADACH8AQEAwAMAIf0BCADDAwAh_wEAAKYE_wEigAICAMIDACGBAgEAwQMAIQoMAACoBAAg3wEBAMADACHnAUAAxQMAIfoBQADFAwAh-wEBAMADACH8AQEAwAMAIf0BCADDAwAh_wEAAKYE_wEigAICAMIDACGBAgEAwQMAIQTfAQEAAAAB_QEIAAAAAZcCAQAAAAGYAgIAAAABAwAAAD8AICAAAIsGACAhAACaBgAgEgAAAD8AIAQAAIgFACAFAACJBQAgDwAAiwUAIBEAAI4FACASAACKBQAgEwAAjAUAIBkAAJoGACDfAQEAwAMAIecBQADFAwAh-gFAAMUDACH7AQEAwAMAIYECAQDBAwAhjAIAAIcFtgIisQIBAMADACGyAiAAxAMAIbQCAACGBbQCIrYCIADEAwAhEAQAAIgFACAFAACJBQAgDwAAiwUAIBEAAI4FACASAACKBQAgEwAAjAUAIN8BAQDAAwAh5wFAAMUDACH6AUAAxQMAIfsBAQDAAwAhgQIBAMEDACGMAgAAhwW2AiKxAgEAwAMAIbICIADEAwAhtAIAAIYFtAIitgIgAMQDACEL3wEBAAAAAeABAQAAAAHnAUAAAAAB-gFAAAAAAf0BCAAAAAGMAgAAAJsCApgCAgAAAAGZAggAAAABmwIBAAAAAZwCAQAAAAGdAgEAAAABDAMAAJEEACAPAACTBAAgEAAAkgQAIN8BAQAAAAHgAQEAAAAB4QEBAAAAAeIBAQAAAAHjAQIAAAAB5AEIAAAAAeUBCAAAAAHmASAAAAAB5wFAAAAAAQIAAAANACAgAACcBgAgAwAAAAsAICAAAJwGACAhAACgBgAgDgAAAAsAIAMAAMYDACAPAADIAwAgEAAAxwMAIBkAAKAGACDfAQEAwAMAIeABAQDAAwAh4QEBAMEDACHiAQEAwAMAIeMBAgDCAwAh5AEIAMMDACHlAQgAwwMAIeYBIADEAwAh5wFAAMUDACEMAwAAxgMAIA8AAMgDACAQAADHAwAg3wEBAMADACHgAQEAwAMAIeEBAQDBAwAh4gEBAMADACHjAQIAwgMAIeQBCADDAwAh5QEIAMMDACHmASAAxAMAIecBQADFAwAhDAMAAJEEACAPAACTBAAgEQAAlAQAIN8BAQAAAAHgAQEAAAAB4QEBAAAAAeIBAQAAAAHjAQIAAAAB5AEIAAAAAeUBCAAAAAHmASAAAAAB5wFAAAAAAQIAAAANACAgAAChBgAgAwAAAAsAICAAAKEGACAhAAClBgAgDgAAAAsAIAMAAMYDACAPAADIAwAgEQAAyQMAIBkAAKUGACDfAQEAwAMAIeABAQDAAwAh4QEBAMEDACHiAQEAwAMAIeMBAgDCAwAh5AEIAMMDACHlAQgAwwMAIeYBIADEAwAh5wFAAMUDACEMAwAAxgMAIA8AAMgDACARAADJAwAg3wEBAMADACHgAQEAwAMAIeEBAQDBAwAh4gEBAMADACHjAQIAwgMAIeQBCADDAwAh5QEIAMMDACHmASAAxAMAIecBQADFAwAhEAQAANoFACAFAADbBQAgDAAA3wUAIA8AAN0FACARAADgBQAgEwAA3gUAIN8BAQAAAAHnAUAAAAAB-gFAAAAAAfsBAQAAAAGBAgEAAAABjAIAAAC2AgKxAgEAAAABsgIgAAAAAbQCAAAAtAICtgIgAAAAAQIAAAABACAgAACmBgAgDAMAAJEEACAQAACSBAAgEQAAlAQAIN8BAQAAAAHgAQEAAAAB4QEBAAAAAeIBAQAAAAHjAQIAAAAB5AEIAAAAAeUBCAAAAAHmASAAAAAB5wFAAAAAAQIAAAANACAgAACoBgAgAwAAAAsAICAAAKgGACAhAACsBgAgDgAAAAsAIAMAAMYDACAQAADHAwAgEQAAyQMAIBkAAKwGACDfAQEAwAMAIeABAQDAAwAh4QEBAMEDACHiAQEAwAMAIeMBAgDCAwAh5AEIAMMDACHlAQgAwwMAIeYBIADEAwAh5wFAAMUDACEMAwAAxgMAIBAAAMcDACARAADJAwAg3wEBAMADACHgAQEAwAMAIeEBAQDBAwAh4gEBAMADACHjAQIAwgMAIeQBCADDAwAh5QEIAMMDACHmASAAxAMAIecBQADFAwAhCd8BAQAAAAHgAQEAAAAB5wFAAAAAAfMBAQAAAAH6AUAAAAABjAIAAACgAgKdAgEAAAABoAIIAAAAAaECAAAAjAICBt8BAQAAAAHnAUAAAAAB9AFAAAAAAfUBAQAAAAH2AQEAAAAB9wEgAAAAAQgGAACZBAAg3wEBAAAAAecBQAAAAAHzAQEAAAAB9AFAAAAAAfUBAQAAAAH2AQEAAAAB9wEgAAAAAQIAAAARACAgAACvBgAgEAQAANoFACAFAADbBQAgDAAA3wUAIBEAAOAFACASAADcBQAgEwAA3gUAIN8BAQAAAAHnAUAAAAAB-gFAAAAAAfsBAQAAAAGBAgEAAAABjAIAAAC2AgKxAgEAAAABsgIgAAAAAbQCAAAAtAICtgIgAAAAAQIAAAABACAgAACxBgAgDwMAAM4EACAKAADwBAAgCwAA0AQAIN8BAQAAAAHgAQEAAAAB5wFAAAAAAfoBQAAAAAH9AQgAAAABjAIAAACbAgKXAgEAAAABmAICAAAAAZkCCAAAAAGbAgEAAAABnAIBAAAAAZ0CAQAAAAECAAAAIQAgIAAAswYAIBAEAADaBQAgBQAA2wUAIAwAAN8FACAPAADdBQAgEQAA4AUAIBIAANwFACDfAQEAAAAB5wFAAAAAAfoBQAAAAAH7AQEAAAABgQIBAAAAAYwCAAAAtgICsQIBAAAAAbICIAAAAAG0AgAAALQCArYCIAAAAAECAAAAAQAgIAAAtQYAIAMAAAAaACAgAACzBgAgIQAAuQYAIBEAAAAaACADAAC1BAAgCgAA7wQAIAsAALcEACAZAAC5BgAg3wEBAMADACHgAQEAwAMAIecBQADFAwAh-gFAAMUDACH9AQgAwwMAIYwCAACzBJsCIpcCAQDAAwAhmAICAMIDACGZAggAwwMAIZsCAQDAAwAhnAIBAMADACGdAgEAwQMAIQ8DAAC1BAAgCgAA7wQAIAsAALcEACDfAQEAwAMAIeABAQDAAwAh5wFAAMUDACH6AUAAxQMAIf0BCADDAwAhjAIAALMEmwIilwIBAMADACGYAgIAwgMAIZkCCADDAwAhmwIBAMADACGcAgEAwAMAIZ0CAQDBAwAhAwAAAD8AICAAALUGACAhAAC8BgAgEgAAAD8AIAQAAIgFACAFAACJBQAgDAAAjQUAIA8AAIsFACARAACOBQAgEgAAigUAIBkAALwGACDfAQEAwAMAIecBQADFAwAh-gFAAMUDACH7AQEAwAMAIYECAQDBAwAhjAIAAIcFtgIisQIBAMADACGyAiAAxAMAIbQCAACGBbQCIrYCIADEAwAhEAQAAIgFACAFAACJBQAgDAAAjQUAIA8AAIsFACARAACOBQAgEgAAigUAIN8BAQDAAwAh5wFAAMUDACH6AUAAxQMAIfsBAQDAAwAhgQIBAMEDACGMAgAAhwW2AiKxAgEAwAMAIbICIADEAwAhtAIAAIYFtAIitgIgAMQDACEDAAAADwAgIAAArwYAICEAAL8GACAKAAAADwAgBgAAmAQAIBkAAL8GACDfAQEAwAMAIecBQADFAwAh8wEBAMADACH0AUAAxQMAIfUBAQDAAwAh9gEBAMADACH3ASAAxAMAIQgGAACYBAAg3wEBAMADACHnAUAAxQMAIfMBAQDAAwAh9AFAAMUDACH1AQEAwAMAIfYBAQDAAwAh9wEgAMQDACEDAAAAPwAgIAAAsQYAICEAAMIGACASAAAAPwAgBAAAiAUAIAUAAIkFACAMAACNBQAgEQAAjgUAIBIAAIoFACATAACMBQAgGQAAwgYAIN8BAQDAAwAh5wFAAMUDACH6AUAAxQMAIfsBAQDAAwAhgQIBAMEDACGMAgAAhwW2AiKxAgEAwAMAIbICIADEAwAhtAIAAIYFtAIitgIgAMQDACEQBAAAiAUAIAUAAIkFACAMAACNBQAgEQAAjgUAIBIAAIoFACATAACMBQAg3wEBAMADACHnAUAAxQMAIfoBQADFAwAh-wEBAMADACGBAgEAwQMAIYwCAACHBbYCIrECAQDAAwAhsgIgAMQDACG0AgAAhgW0AiK2AiAAxAMAIQnfAQEAAAAB4AEBAAAAAecBQAAAAAH6AUAAAAABjAIAAACgAgKdAgEAAAABngIBAAAAAaACCAAAAAGhAgAAAIwCAhAEAADaBQAgBQAA2wUAIAwAAN8FACAPAADdBQAgEgAA3AUAIBMAAN4FACDfAQEAAAAB5wFAAAAAAfoBQAAAAAH7AQEAAAABgQIBAAAAAYwCAAAAtgICsQIBAAAAAbICIAAAAAG0AgAAALQCArYCIAAAAAECAAAAAQAgIAAAxAYAIAMAAAA_ACAgAADEBgAgIQAAyAYAIBIAAAA_ACAEAACIBQAgBQAAiQUAIAwAAI0FACAPAACLBQAgEgAAigUAIBMAAIwFACAZAADIBgAg3wEBAMADACHnAUAAxQMAIfoBQADFAwAh-wEBAMADACGBAgEAwQMAIYwCAACHBbYCIrECAQDAAwAhsgIgAMQDACG0AgAAhgW0AiK2AiAAxAMAIRAEAACIBQAgBQAAiQUAIAwAAI0FACAPAACLBQAgEgAAigUAIBMAAIwFACDfAQEAwAMAIecBQADFAwAh-gFAAMUDACH7AQEAwAMAIYECAQDBAwAhjAIAAIcFtgIisQIBAMADACGyAiAAxAMAIbQCAACGBbQCIrYCIADEAwAhBt8BAQAAAAHgAQEAAAAB5wFAAAAAAfgBCAAAAAH5AQEAAAAB-gFAAAAAAQMAAAA_ACAgAACmBgAgIQAAzAYAIBIAAAA_ACAEAACIBQAgBQAAiQUAIAwAAI0FACAPAACLBQAgEQAAjgUAIBMAAIwFACAZAADMBgAg3wEBAMADACHnAUAAxQMAIfoBQADFAwAh-wEBAMADACGBAgEAwQMAIYwCAACHBbYCIrECAQDAAwAhsgIgAMQDACG0AgAAhgW0AiK2AiAAxAMAIRAEAACIBQAgBQAAiQUAIAwAAI0FACAPAACLBQAgEQAAjgUAIBMAAIwFACDfAQEAwAMAIecBQADFAwAh-gFAAMUDACH7AQEAwAMAIYECAQDBAwAhjAIAAIcFtgIisQIBAMADACGyAiAAxAMAIbQCAACGBbQCIrYCIADEAwAhCAQGAgUKAww1CA0AEA8xBhE2DhIOBBM0BwEDAAEBAwABBQMAAQ0ADw8pBhASBREtDgMGAAQNAA0PFgYEAwABBgAEBwAFDhgHAwMAAQgZBgkbCAUDAAEKAAkLJgoNAAwOJQcDCx8KDCIIDQALAgkACAoACQILIwAMJAABCycAAQ8oAAIDAAEGAAQDDy8AEC4AETAABwQ3AAU4AAw8AA86ABE9ABI5ABM7AAAAAAMNABUmABYnABcAAAADDQAVJgAWJwAXAQMAAQEDAAEDDQAcJgAdJwAeAAAAAw0AHCYAHScAHgEDAAEBAwABAw0AIyYAJCcAJQAAAAMNACMmACQnACUAAAADDQArJgAsJwAtAAAAAw0AKyYALCcALQMDAAEGAAQHAAUDAwABBgAEBwAFBQ0AMiYANScANmgAM2kANAAAAAAABQ0AMiYANScANmgAM2kANAIDAAEKAAkCAwABCgAJBQ0AOyYAPicAP2gAPGkAPQAAAAAABQ0AOyYAPicAP2gAPGkAPQIJAAgKAAkCCQAICgAJBQ0ARCYARycASGgARWkARgAAAAAABQ0ARCYARycASGgARWkARgMDAAEI5gEGCecBCAMDAAEI7QEGCe4BCAUNAE0mAFAnAFFoAE5pAE8AAAAAAAUNAE0mAFAnAFFoAE5pAE8AAAUNAFYmAFknAFpoAFdpAFgAAAAAAAUNAFYmAFknAFpoAFdpAFgCAwABBgAEAgMAAQYABAUNAF8mAGInAGNoAGBpAGEAAAAAAAUNAF8mAGInAGNoAGBpAGEBBgAEAQYABAMNAGgmAGknAGoAAAADDQBoJgBpJwBqAQMAAQEDAAEFDQBvJgByJwBzaABwaQBxAAAAAAAFDQBvJgByJwBzaABwaQBxFAIBFT4BFkEBF0IBGEMBGkUBG0cRHEgSHUoBHkwRH00TIk4BI08BJFARKFMUKVQYKlUCK1YCLFcCLVgCLlkCL1sCMF0RMV4ZMmACM2IRNGMaNWQCNmUCN2YROGkbOWofOmsDO2wDPG0DPW4DPm8DP3EDQHMRQXQgQnYDQ3gRRHkhRXoDRnsDR3wRSH8iSYABJkqCASdLgwEnTIYBJ02HASdOiAEnT4oBJ1CMARFRjQEoUo8BJ1ORARFUkgEpVZMBJ1aUASdXlQERWJgBKlmZAS5amgEGW5sBBlycAQZdnQEGXp4BBl-gAQZgogERYaMBL2KlAQZjpwERZKgBMGWpAQZmqgEGZ6sBEWquATFrrwE3bLABCG2xAQhusgEIb7MBCHC0AQhxtgEIcrgBEXO5ATh0uwEIdb0BEXa-ATl3vwEIeMABCHnBARF6xAE6e8UBQHzGAQp9xwEKfsgBCn_JAQqAAcoBCoEBzAEKggHOARGDAc8BQYQB0QEKhQHTARGGAdQBQocB1QEKiAHWAQqJAdcBEYoB2gFDiwHbAUmMAdwBB40B3QEHjgHeAQePAd8BB5AB4AEHkQHiAQeSAeQBEZMB5QFKlAHpAQeVAesBEZYB7AFLlwHvAQeYAfABB5kB8QERmgH0AUybAfUBUpwB9wEJnQH4AQmeAfsBCZ8B_AEJoAH9AQmhAf8BCaIBgQIRowGCAlOkAYQCCaUBhgIRpgGHAlSnAYgCCagBiQIJqQGKAhGqAY0CVasBjgJbrAGPAg6tAZACDq4BkQIOrwGSAg6wAZMCDrEBlQIOsgGXAhGzAZgCXLQBmgIOtQGcAhG2AZ0CXbcBngIOuAGfAg65AaACEboBowJeuwGkAmS8AaUCBb0BpgIFvgGnAgW_AagCBcABqQIFwQGrAgXCAa0CEcMBrgJlxAGwAgXFAbICEcYBswJmxwG0AgXIAbUCBckBtgIRygG5AmfLAboCa8wBuwIEzQG8AgTOAb0CBM8BvgIE0AG_AgTRAcECBNIBwwIR0wHEAmzUAcYCBNUByAIR1gHJAm3XAcoCBNgBywIE2QHMAhHaAc8CbtsB0AJ0"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/app/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/app/middleware/checkAuth.ts
import status2 from "http-status";

// src/app/errorHelpers/AppError.ts
var AppError = class extends Error {
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/app/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, { expiresIn }) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return {
      success: true,
      data: decoded
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error
    };
  }
};
var decodeToken = (token) => {
  const decoded = jwt.decode(token);
  return decoded;
};
var jwtUtils = {
  createToken,
  verifyToken,
  decodeToken
};

// src/app/config/env.ts
import dotenv from "dotenv";
import status from "http-status";
dotenv.config();
var loadEnvVariables = () => {
  const requireEnvVariable = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRES_IN",
    "REFRESH_TOKEN_EXPIRES_IN",
    "BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN",
    "BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE",
    "FRONTEND_URL",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET"
    // 'CLOUDINARY_CLOUD_NAME',
    // 'CLOUDINARY_API_KEY',
    // 'CLOUDINARY_API_SECRET'
  ];
  requireEnvVariable.forEach((variable) => {
    if (!process.env[variable]) {
      throw new AppError_default(status.INTERNAL_SERVER_ERROR, `Environment variable ${variable} is required but not set in .env file.`);
    }
  });
  return {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
    BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN,
    BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE,
    FRONTEND_URL: process.env.FRONTEND_URL,
    STRIPE: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
    }
    // CLOUDINARY: {
    //   CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
    //   CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
    //   CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string
    // }
  };
};
var envVars = loadEnvVariables();

// src/app/middleware/checkAuth.ts
var checkAuth = (...authRoles) => async (req, res, next) => {
  try {
    const sessionToken = cookieUtils.getCookie(req, "better-auth.session_token");
    if (!sessionToken) {
      throw new Error("Unauthorized access! No session token provided");
    }
    if (sessionToken) {
      const sessionExists = await prisma.session.findFirst({
        where: {
          token: sessionToken,
          expiresAt: {
            gt: /* @__PURE__ */ new Date()
          }
        },
        include: {
          user: true
        }
      });
      if (sessionExists && sessionExists.user) {
        const user = sessionExists.user;
        const now = /* @__PURE__ */ new Date();
        const createdAt = new Date(sessionExists.createdAt);
        const expiresAt = new Date(sessionExists.expiresAt);
        const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
        const timeRemaining = expiresAt.getTime() - now.getTime();
        const percentRemaining = timeRemaining / sessionLifeTime * 100;
        if (percentRemaining < 20) {
          res.setHeader("X-session-Refresh", "true");
          res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
          res.setHeader("X-Time-Remaining", timeRemaining.toString());
          console.log("Session Expiring Soon!!");
        }
        if (user.status === UserStatus.BANNED) {
          throw new AppError_default(status2.UNAUTHORIZED, "Unauthorized access! User is banned.");
        }
        if (user.isDeleted) {
          throw new AppError_default(status2.UNAUTHORIZED, "Unauthorized access! User is deleted");
        }
        if (authRoles.length > 0 && !authRoles.includes(user.role)) {
          throw new AppError_default(status2.FORBIDDEN, "Forbidden access! You do not have permission to access this resource.");
        }
        req.user = {
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
    }
    const access_token = cookieUtils.getCookie(req, "access_token");
    if (!access_token) {
      throw new AppError_default(status2.UNAUTHORIZED, "Unauthorized access! No access token provided.");
    }
    const verifiedToken = jwtUtils.verifyToken(access_token, envVars.ACCESS_TOKEN_SECRET);
    if (!verifiedToken.success) {
      throw new AppError_default(status2.UNAUTHORIZED, "Unauthorized access! Invalid access token.");
    }
    const decoded = verifiedToken.data;
    if (authRoles.length > 0 && !authRoles.includes(decoded.role)) {
      throw new AppError_default(status2.FORBIDDEN, "Forbidden access!");
    }
    next();
  } catch (error) {
    next(error);
  }
};

// src/app/middleware/validateRequest.ts
var validateRequest = (zodSchema) => {
  return (req, res, next) => {
    if (req.body && req.body.data) {
      try {
        req.body = JSON.parse(req.body.data);
      } catch (error) {
        return next(error);
      }
    }
    const parsedResult = zodSchema.safeParse({
      body: req.body,
      query: req.query,
      cookies: req.cookies
    });
    if (!parsedResult.success) {
      return next(parsedResult.error);
    }
    req.body = parsedResult.data.body;
    return next();
  };
};

// src/app/modules/product/product.validation.ts
import z from "zod";
var createProductZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().min(1, "Product description is required"),
    price: z.coerce.number({}).positive("Price must be a positive number"),
    category: z.string().min(1, "Product category is required"),
    remainingStock: z.coerce.number({}).int("Remaining stock must be an integer").nonnegative("Remaining stock must be a non-negative integer"),
    image: z.string().optional()
  })
});
var updateProductZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Product name is required").optional(),
    description: z.string().min(1, "Product description is required").optional(),
    price: z.coerce.number().positive("Price must be a positive number").optional(),
    category: z.string().min(1, "Product category is required").optional(),
    remainingStock: z.coerce.number().int().nonnegative("Remaining stock must be a non-negative integer").optional(),
    image: z.string().url("Invalid image URL format").optional()
  })
});

// src/app/modules/product/product.service.ts
import status3 from "http-status";

// src/generated/prisma/internal/prismaNamespaceBrowser.ts
import * as runtime3 from "@prisma/client/runtime/index-browser";
var NullTypes4 = {
  DbNull: runtime3.NullTypes.DbNull,
  JsonNull: runtime3.NullTypes.JsonNull,
  AnyNull: runtime3.NullTypes.AnyNull
};
var TransactionIsolationLevel2 = runtime3.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});

// src/app/utils/QueryBuilder.ts
var filterOperatorPattern = /^([^[\]]+)\[([^[\]]+)\]$/;
var isListRelationSegment = (segment) => segment.endsWith("s") || segment.endsWith("ies");
var isPlainObject = (value) => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};
var mergeDeep = (target, source) => {
  Object.entries(source).forEach(([key, value]) => {
    const existingValue = target[key];
    if (isPlainObject(existingValue) && isPlainObject(value)) {
      target[key] = mergeDeep({ ...existingValue }, value);
      return;
    }
    target[key] = value;
  });
  return target;
};
var buildNestedFieldFilter = (fieldPath, leafFilter) => {
  const segments = fieldPath.split(".");
  if (segments.length === 1) {
    return leafFilter;
  }
  let nestedFilter = {
    [segments[segments.length - 1]]: leafFilter
  };
  for (let index = segments.length - 2; index >= 0; index -= 1) {
    const segment = segments[index];
    nestedFilter = {
      [segment]: isListRelationSegment(segment) ? {
        some: nestedFilter
      } : nestedFilter
    };
  }
  return nestedFilter;
};
var isNestedFieldPath = (fieldPath) => fieldPath.includes(".");
var normalizeFilterValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => parseQueryValue(item));
  }
  return parseQueryValue(value);
};
var toNumberIfNumeric = (value) => {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  if (trimmed === "") {
    return value;
  }
  const numericValue = Number(trimmed);
  return Number.isNaN(numericValue) ? value : numericValue;
};
var buildOperatorFilter = (operator, value) => {
  const normalizedValue = normalizeFilterValue(value);
  if (operator === "in") {
    return {
      in: Array.isArray(normalizedValue) ? normalizedValue : [normalizedValue]
    };
  }
  if (operator === "not") {
    return {
      not: normalizedValue
    };
  }
  return {
    [operator]: toNumberIfNumeric(normalizedValue)
  };
};
var parseQueryValue = (value) => {
  if (typeof value !== "string") {
    return value;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }
  if (normalized === "false") {
    return false;
  }
  return value;
};
var getPaginationOptions = (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  return {
    page,
    limit,
    skip
  };
};
var getSortOptions = (query) => {
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";
  let orderBy = {};
  if (sortBy.includes(".")) {
    const [relation, field] = sortBy.split(".");
    const normalizedRelation = relation === "tutor" ? "trainer" : relation;
    orderBy = {
      [normalizedRelation]: {
        [field]: sortOrder
      }
    };
  } else {
    orderBy = {
      [sortBy]: sortOrder
    };
  }
  return { orderBy };
};
var getSearchConditions = (query, searchableFields) => {
  const searchConditions = [];
  if (query.searchTerm) {
    const searchTerms = Array.isArray(query.searchTerm) ? query.searchTerm : [query.searchTerm];
    searchTerms.map((term) => typeof term === "string" ? term.trim() : "").filter(Boolean).forEach((searchTerm) => {
      searchableFields.forEach((field) => {
        const leafFilter = {
          contains: searchTerm,
          mode: "insensitive"
        };
        if (isNestedFieldPath(field)) {
          searchConditions.push(buildNestedFieldFilter(field, leafFilter));
        } else {
          searchConditions.push(
            {
              [field]: leafFilter
            }
          );
        }
      });
    });
  }
  return { searchConditions };
};
var getFilterConditions = (query, filterableFields) => {
  const filterConditions = {};
  filterableFields.forEach((field) => {
    const directValue = query[field];
    if (directValue !== void 0) {
      if (!isNestedFieldPath(field)) {
        if (Array.isArray(directValue)) {
          filterConditions[field] = {
            in: directValue.map((item) => parseQueryValue(item))
          };
          return;
        }
        filterConditions[field] = toNumberIfNumeric(parseQueryValue(directValue));
        return;
      }
      if (Array.isArray(directValue)) {
        mergeDeep(filterConditions, buildNestedFieldFilter(field, {
          in: directValue.map((item) => toNumberIfNumeric(parseQueryValue(item)))
        }));
        return;
      }
      if (typeof directValue === "object" && directValue !== null) {
        mergeDeep(filterConditions, buildNestedFieldFilter(field, directValue));
        return;
      }
      mergeDeep(filterConditions, buildNestedFieldFilter(field, toNumberIfNumeric(parseQueryValue(directValue))));
      return;
    }
    const operatorEntries = Object.entries(query).filter(([key]) => filterOperatorPattern.test(key));
    if (operatorEntries.length === 0) {
      return;
    }
    operatorEntries.forEach(([key, value]) => {
      const match = key.match(filterOperatorPattern);
      if (!match || match[1] !== field) {
        return;
      }
      const operator = match[2];
      const operatorFilter = {
        ...filterConditions[field],
        ...buildOperatorFilter(operator, value)
      };
      if (isNestedFieldPath(field)) {
        mergeDeep(filterConditions, buildNestedFieldFilter(field, operatorFilter));
        return;
      }
      filterConditions[field] = operatorFilter;
    });
  });
  return { filterConditions };
};
var QueryBuilder = {
  getPaginationOptions,
  getSortOptions,
  getSearchConditions,
  getFilterConditions
};

// src/app/modules/product/product.service.ts
var createProduct = async (payload) => {
  try {
    const result = await prisma.product.create({
      data: payload
    });
    return result;
  } catch (error) {
    console.log("Error creating product: ", error);
    throw new AppError_default(status3.INTERNAL_SERVER_ERROR, "Failed to create product", error.stack);
  }
};
var getAllProducts = async (query) => {
  const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);
  const { orderBy } = QueryBuilder.getSortOptions(query);
  const searchableFields = ["name", "description"];
  const { searchConditions } = QueryBuilder.getSearchConditions(query, searchableFields);
  const filterableFields = ["category", "remainingStock", "price"];
  const { filterConditions } = QueryBuilder.getFilterConditions(query, filterableFields);
  const whereConditions = [
    ...searchConditions.length > 0 ? [{ OR: searchConditions }] : [],
    { ...filterConditions }
  ];
  const finalWhere = whereConditions.length > 0 ? { AND: whereConditions } : void 0;
  const products = await prisma.product.findMany({
    where: finalWhere,
    skip,
    take: limit,
    orderBy
  });
  const total = await prisma.product.count({
    where: finalWhere
  });
  return {
    data: products,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getProductById = async (productId) => {
  const result = await prisma.product.findUnique({
    where: {
      id: productId
    }
  });
  return result;
};
var updateProduct = async (productId, payload) => {
  try {
    const result = await prisma.product.update({
      where: {
        id: productId
      },
      data: payload
    });
    return result;
  } catch (error) {
    console.log("Error updating product: ", error);
    throw new AppError_default(
      status3.INTERNAL_SERVER_ERROR,
      "Failed to update product",
      error.stack
    );
  }
};
var deleteProduct = async (user, productId) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  if (isUserExists.role !== UserRoles.ADMIN) {
    throw new AppError_default(status3.FORBIDDEN, "Only admins can delete products");
  }
  try {
    const result = await prisma.product.delete({
      where: {
        id: productId
      }
    });
    return result;
  } catch (error) {
    console.log("Error deleting product: ", error);
    throw new AppError_default(status3.INTERNAL_SERVER_ERROR, "Failed to delete product", error.stack);
  }
};
var ProductService = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};

// src/app/shared/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// src/app/shared/sendResponse.ts
var sendResponse = (res, responseData) => {
  const { httpStatusCode, success, message, data, meta } = responseData;
  res.status(httpStatusCode).json({
    success,
    message,
    data,
    meta
  });
};

// src/app/modules/product/product.controller.ts
var createProduct2 = catchAsync(
  async (req, res) => {
    const payload = req.body;
    const result = await ProductService.createProduct(payload);
    sendResponse(res, {
      httpStatusCode: 201,
      success: true,
      message: "Product created successfully",
      data: result
    });
  }
);
var getAllProducts2 = catchAsync(
  async (req, res) => {
    const query = req.query;
    const result = await ProductService.getAllProducts(query);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Products retrieved successfully",
      data: result.data,
      meta: result.meta
    });
  }
);
var getProductById2 = catchAsync(
  async (req, res) => {
    const { productId } = req.params;
    const result = await ProductService.getProductById(productId);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Product retrieved successfully",
      data: result
    });
  }
);
var updateProduct2 = catchAsync(
  async (req, res) => {
    const { productId } = req.params;
    const payload = req.body;
    const result = await ProductService.updateProduct(productId, payload);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Product updated successfully",
      data: result
    });
  }
);
var deleteProduct2 = catchAsync(
  async (req, res) => {
    const { productId } = req.params;
    const user = req.user;
    const result = await ProductService.deleteProduct(user, productId);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Product deleted successfully",
      data: result
    });
  }
);
var ProductController = {
  createProduct: createProduct2,
  getAllProducts: getAllProducts2,
  getProductById: getProductById2,
  updateProduct: updateProduct2,
  deleteProduct: deleteProduct2
};

// src/app/modules/product/product.route.ts
var router = Router();
router.post("/create-product", checkAuth(UserRoles.ADMIN), validateRequest(createProductZodSchema), ProductController.createProduct);
router.get("/", ProductController.getAllProducts);
router.get("/:productId", ProductController.getProductById);
router.patch("/update-product/:productId", validateRequest(updateProductZodSchema), checkAuth(UserRoles.ADMIN), ProductController.updateProduct);
router.delete("/delete-product/:productId", checkAuth(UserRoles.ADMIN), ProductController.deleteProduct);
var ProductRouters = router;

// src/app/modules/auth/auth.route.ts
import { Router as Router2 } from "express";

// src/app/modules/auth/auth.service.ts
import status4 from "http-status";

// src/app/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  // trustedOrigins: [process.env.APP_URL!],
  emailAndPassword: {
    enabled: true
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: UserRoles.USER
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false
      }
    }
  }
});

// src/app/utils/token.ts
var getAccessToken = (payload) => {
  const access_token = jwtUtils.createToken(payload, envVars.ACCESS_TOKEN_SECRET, { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN });
  return access_token;
};
var getRefreshToken = (payload) => {
  const refresh_token = jwtUtils.createToken(payload, envVars.REFRESH_TOKEN_SECRET, { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN });
  return refresh_token;
};
var setAccessTokenCookie = (res, token) => {
  cookieUtils.setCookie(res, "access_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 1e3
    // 1 day 
  });
};
var setRefreshTokenCookie = (res, token) => {
  cookieUtils.setCookie(res, "refresh_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 * 1e3
    // 7 days 
  });
};
var setBetterAuthSessionTokenCookie = (res, token) => {
  cookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 1e3
    // 1 day
  });
};
var tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionTokenCookie
};

// src/app/modules/auth/auth.service.ts
var registerUser = async (payload) => {
  const { name, image, email, password, role } = payload;
  const data = await auth.api.signUpEmail({
    body: {
      name,
      image,
      email,
      password,
      role
    }
  });
  if (!data.user) {
    throw new AppError_default(status4.BAD_REQUEST, "Failed to register user");
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: data.user.id
      }
    });
    const access_token = tokenUtils.getAccessToken({
      userId: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      status: data.user.status,
      isDeleted: data.user.isDeleted
    });
    const refresh_token = tokenUtils.getRefreshToken({
      userId: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      status: data.user.status,
      isDeleted: data.user.isDeleted
    });
    return {
      ...data,
      access_token,
      refresh_token,
      user
    };
  } catch (error) {
    throw new AppError_default(status4.INTERNAL_SERVER_ERROR, "Error creating user in database:", error.message);
  }
};
var loginUser = async (payload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password
    }
  });
  if (data.user.status === UserStatus.BANNED) {
    throw new AppError_default(status4.FORBIDDEN, "User is banned");
  }
  if (data.user.isDeleted) {
    throw new AppError_default(status4.FORBIDDEN, "User is deleted");
  }
  const access_token = tokenUtils.getAccessToken({
    userId: data.user.id,
    name: data.user.name,
    image: data.user.image,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted
  });
  const refresh_token = tokenUtils.getRefreshToken({
    userId: data.user.id,
    name: data.user.name,
    image: data.user.image,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted
  });
  return {
    ...data,
    access_token,
    refresh_token
  };
};
var logoutUser = async (session_token) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      "Cookie": `better-auth.session_token=${session_token}`
    })
  });
  return result;
};
var changePassword = async (currentPassword, newPassword, session_token) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${session_token}`
    })
  });
  if (!session) {
    throw new AppError_default(status4.UNAUTHORIZED, "Invalid session token");
  }
  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true
    },
    headers: {
      Authorization: `Bearer ${session_token}`
    }
  });
  const access_token = tokenUtils.getAccessToken({
    userId: session.user.id,
    name: session.user.name,
    role: session.user.role,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.status,
    emailVerified: session.user.emailVerified
  });
  const refresh_token = tokenUtils.getRefreshToken({
    userId: session.user.id,
    name: session.user.name,
    role: session.user.role,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.status,
    emailVerified: session.user.emailVerified
  });
  return {
    ...result,
    access_token,
    refresh_token
  };
};
var getMe = async (user) => {
  if (!user?.userId) {
    throw new AppError_default(status4.UNAUTHORIZED, "Unauthorized access");
  }
  const profile = await prisma.user.findUnique({
    where: {
      id: user.userId
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      status: true,
      isDeleted: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true
    }
  });
  if (!profile) {
    throw new AppError_default(status4.NOT_FOUND, "User not found");
  }
  if (profile.role === UserRoles.USER) {
    const [bookings, orders, reviews, payments] = await Promise.all([
      prisma.bookingSlot.findMany({
        where: {
          userId: user.userId
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 5,
        select: {
          id: true,
          trainerId: true,
          slotId: true,
          status: true,
          paymentStatus: true,
          feeAmount: true,
          transactionId: true,
          createdAt: true
        }
      }),
      prisma.order.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          productId: true,
          price: true,
          quantity: true,
          totalAmount: true,
          status: true,
          address: true,
          phone: true,
          transactionId: true,
          createdAt: true
        }
      }),
      prisma.review.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: "desc" },
        take: 5
      }),
      prisma.payment.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          purpose: true,
          status: true,
          amount: true,
          provider: true,
          paidAt: true,
          createdAt: true
        }
      })
    ]);
    return {
      profile,
      roleData: {
        bookings,
        orders,
        reviews,
        payments
      }
    };
  }
  if (profile.role === UserRoles.TRAINER) {
    const trainerProfile = await prisma.trainerProfile.findFirst({
      where: {
        userId: user.userId
      },
      select: {
        id: true,
        bio: true,
        specialties: true,
        experience: true,
        feePerHour: true,
        avgRating: true,
        isApproved: true,
        slots: {
          orderBy: {
            createdAt: "desc"
          },
          take: 5
        },
        bookings: {
          orderBy: {
            createdAt: "desc"
          },
          take: 5
        },
        reviews: {
          orderBy: {
            createdAt: "desc"
          },
          take: 5
        }
      }
    });
    return {
      profile,
      roleData: trainerProfile
    };
  }
  const [userCount, trainerCount, bookingCount, orderCount, paymentCount, reviewCount] = await Promise.all([
    prisma.user.count(),
    prisma.trainerProfile.count(),
    prisma.bookingSlot.count(),
    prisma.order.count(),
    prisma.payment.count(),
    prisma.review.count()
  ]);
  const [recentUsers, recentTrainers, recentBookings, recentPayments] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    }),
    prisma.trainerProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        userId: true,
        bio: true,
        specialties: true,
        isApproved: true,
        avgRating: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } }
      }
    }),
    prisma.bookingSlot.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, userId: true, trainerId: true, slotId: true, status: true, paymentStatus: true, feeAmount: true, createdAt: true }
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, userId: true, amount: true, status: true, purpose: true, provider: true, paidAt: true, createdAt: true }
    })
  ]);
  return {
    profile,
    roleData: {
      summary: {
        userCount,
        trainerCount,
        bookingCount,
        orderCount,
        paymentCount,
        reviewCount
      },
      recent: {
        users: recentUsers,
        trainers: recentTrainers,
        bookings: recentBookings,
        payments: recentPayments
      }
    }
  };
};
var AuthService = {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  getMe
};

// src/app/modules/auth/auth.controller.ts
import status5 from "http-status";
var registerUser2 = catchAsync(
  async (req, res) => {
    const payload = req.body;
    const result = await AuthService.registerUser(payload);
    const { access_token, refresh_token, token, ...rest } = result;
    tokenUtils.setAccessTokenCookie(res, access_token);
    tokenUtils.setRefreshTokenCookie(res, refresh_token);
    tokenUtils.setBetterAuthSessionTokenCookie(res, token);
    sendResponse(res, {
      httpStatusCode: status5.CREATED,
      success: true,
      message: "User registered successfully",
      data: {
        access_token,
        refresh_token,
        token,
        ...rest
      }
    });
  }
);
var loginUser2 = catchAsync(
  async (req, res) => {
    const payload = req.body;
    const result = await AuthService.loginUser(payload);
    const { access_token, refresh_token, token, ...rest } = result;
    tokenUtils.setAccessTokenCookie(res, access_token);
    tokenUtils.setRefreshTokenCookie(res, refresh_token);
    tokenUtils.setBetterAuthSessionTokenCookie(res, token);
    sendResponse(res, {
      httpStatusCode: status5.OK,
      success: true,
      message: "User logged in successfully",
      data: {
        access_token,
        refresh_token,
        token,
        ...rest
      }
    });
  }
);
var logoutUser2 = catchAsync(
  async (req, res) => {
    const session_token = req.cookies["better-auth.session_token"];
    const result = await AuthService.logoutUser(session_token);
    cookieUtils.clearCookie(res, "access_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    cookieUtils.clearCookie(res, "refresh_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    cookieUtils.clearCookie(res, "better-auth.session_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    sendResponse(res, {
      httpStatusCode: status5.OK,
      success: true,
      message: "Logged out successfully!!",
      data: result
    });
  }
);
var changePassword2 = catchAsync(
  async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const session_token = req.cookies["better-auth.session_token"];
    console.log("Session Token for change password: ", session_token);
    const result = await AuthService.changePassword(currentPassword, newPassword, session_token);
    console.log("Result After change password: ", result);
    sendResponse(res, {
      httpStatusCode: status5.OK,
      success: true,
      message: "Password changed successfully",
      data: result
    });
  }
);
var getMe2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const result = await AuthService.getMe(user);
    sendResponse(res, {
      httpStatusCode: status5.OK,
      success: true,
      message: "User data (My data) retrieved successfully",
      data: result
    });
  }
);
var AuthControllers = {
  registerUser: registerUser2,
  loginUser: loginUser2,
  logoutUser: logoutUser2,
  changePassword: changePassword2,
  getMe: getMe2
};

// src/app/modules/auth/auth.route.ts
var router2 = Router2();
router2.post("/register", AuthControllers.registerUser);
router2.post("/login", AuthControllers.loginUser);
router2.post("/logout", AuthControllers.logoutUser);
router2.post("/change-password", checkAuth(UserRoles.USER, UserRoles.TRAINER, UserRoles.ADMIN), AuthControllers.changePassword);
router2.get("/me", checkAuth(UserRoles.USER, UserRoles.TRAINER, UserRoles.ADMIN), AuthControllers.getMe);
var AuthRoutes = router2;

// src/app/modules/trainerProfile/trainerProfile.route.ts
import { Router as Router3 } from "express";

// src/app/modules/trainerProfile/trainerProfile.service.ts
import status6 from "http-status";
var createTrainerProfile = async (user, payload) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status6.NOT_FOUND, "User not found");
  }
  const isTrainer = isUserExists.role === UserRoles.TRAINER;
  if (!isTrainer) {
    throw new AppError_default(status6.FORBIDDEN, "Only trainers can create trainer profiles");
  }
  const isTutorProfileExists = await prisma.trainerProfile.findUnique({
    where: {
      userId: user.userId
    }
  });
  if (isTutorProfileExists) {
    throw new AppError_default(status6.CONFLICT, "Trainer profile already exists");
  }
  try {
    const result = await prisma.trainerProfile.create({
      data: {
        userId: user.userId,
        ...payload
      }
    });
    return result;
  } catch (error) {
    console.log("Error creating trainer profile: ", error);
    throw new AppError_default(status6.INTERNAL_SERVER_ERROR, "Failed to create trainer profile", error.stack);
  }
};
var getAllTrainers = async (query) => {
  const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);
  const trainerQuery = {
    ...query,
    sortBy: query.sortBy ?? "avgRating"
  };
  const { orderBy } = QueryBuilder.getSortOptions(trainerQuery);
  const searchableFields = ["user.name", "user.email"];
  const { searchConditions } = QueryBuilder.getSearchConditions(query, searchableFields);
  const filterableFields = ["feePerHour", "experience", "avgRating", "user.status"];
  const { filterConditions } = QueryBuilder.getFilterConditions(query, filterableFields);
  const whereConditions = [
    ...searchConditions.length > 0 ? [{ OR: searchConditions }] : [],
    { ...filterConditions }
  ];
  const [trainerProfiles, total] = await Promise.all([
    prisma.trainerProfile.findMany({
      where: whereConditions.length > 0 ? { AND: whereConditions } : void 0,
      skip,
      take: limit,
      orderBy,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            status: true,
            isDeleted: true
          }
        }
      }
    }),
    prisma.trainerProfile.count({
      where: whereConditions.length > 0 ? { AND: whereConditions } : void 0
    })
  ]);
  return {
    data: trainerProfiles,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getAllTrainerProfilesApprovedOnly = async (query) => {
  const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);
  const trainerQuery = {
    ...query,
    sortBy: query.sortBy ?? "avgRating"
  };
  const { orderBy } = QueryBuilder.getSortOptions(trainerQuery);
  const searchableFields = ["user.name", "user.email"];
  const { searchConditions } = QueryBuilder.getSearchConditions(query, searchableFields);
  const filterableFields = ["feePerHour", "experience", "avgRating", "user.status"];
  const { filterConditions } = QueryBuilder.getFilterConditions(query, filterableFields);
  const whereConditions = [
    ...searchConditions.length > 0 ? [{ OR: searchConditions }] : [],
    { ...filterConditions },
    {
      user: {
        status: UserStatus.ACTIVE
      }
    },
    {
      isApproved: true
    }
  ];
  const [trainerProfiles, total] = await Promise.all([
    prisma.trainerProfile.findMany({
      where: whereConditions.length > 0 ? { AND: whereConditions } : void 0,
      skip,
      take: limit,
      orderBy,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            status: true,
            isDeleted: true
          }
        }
      }
    }),
    prisma.trainerProfile.count({
      where: whereConditions.length > 0 ? { AND: whereConditions } : void 0
    })
  ]);
  return {
    data: trainerProfiles,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getAllTrainersFromUsers = async (query) => {
  try {
    const searchTerm = query?.searchTerm;
    const status25 = query?.status;
    const page = query?.page;
    const limit = query?.limit;
    const sortBy = query?.sortBy;
    const sortOrder = query?.sortOrder;
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;
    const andConditions = [
      {
        role: "TRAINER",
        isDeleted: false
      }
    ];
    if (searchTerm) {
      andConditions.push({
        name: {
          contains: String(searchTerm),
          mode: "insensitive"
        }
      });
    }
    if (status25) {
      andConditions.push({
        status: status25
      });
    }
    const whereConditions = { AND: andConditions };
    const sortWith = sortBy || "name";
    const sortDirection = sortOrder || "desc";
    const orderByConditions = {
      [sortWith]: sortDirection
    };
    const result = await prisma.user.findMany({
      where: whereConditions,
      skip,
      take: limitNumber,
      orderBy: orderByConditions
    });
    const total = await prisma.user.count({
      where: whereConditions
    });
    const totalPages = Math.ceil(total / limitNumber);
    return {
      meta: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages
      },
      data: result
    };
  } catch (error) {
    console.log("Error fetching trainers from users: ", error);
    throw new AppError_default(500, "Failed to fetch trainers from users", error.stack);
  }
};
var getTrainerProfileByUserId = async (userId) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status6.NOT_FOUND, "User not found");
  }
  const trainerProfile = await prisma.trainerProfile.findUnique({
    where: {
      userId
    }
  });
  if (!trainerProfile) {
    throw new AppError_default(status6.NOT_FOUND, "Trainer profile not found");
  }
  return trainerProfile;
};
var getTrainerByTrainerProfileId = async (trainerProfileId) => {
  const result = await prisma.trainerProfile.findFirst({
    where: {
      id: trainerProfileId,
      isApproved: true
    },
    include: {
      user: true
    }
  });
  if (!result) {
    throw new AppError_default(status6.NOT_FOUND, "Trainer profile not found");
  }
  return result;
};
var getNotApprovedTrainerProfiles = async () => {
  try {
    const result = await prisma.trainerProfile.findMany({
      where: {
        isApproved: false
      },
      include: {
        user: true
      }
    });
    return result;
  } catch (error) {
    console.log("Error fetching not approved trainer profiles: ", error);
    throw new AppError_default(status6.INTERNAL_SERVER_ERROR, "Failed to fetch not approved trainer profiles", error.stack);
  }
};
var approvalControlForTrainerProfile = async (user, trainerProfileId, isApproved) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status6.NOT_FOUND, "User not found");
  }
  const isTrainerExists = await prisma.trainerProfile.findUnique({
    where: {
      id: trainerProfileId
    }
  });
  if (!isTrainerExists) {
    throw new AppError_default(status6.NOT_FOUND, "Trainer profile not found");
  }
  const isAdmin = user.role === UserRoles.ADMIN;
  if (!isAdmin) {
    throw new AppError_default(status6.FORBIDDEN, "Only admins can approve or reject trainer profiles");
  }
  try {
    const result = await prisma.trainerProfile.update({
      where: {
        id: trainerProfileId
      },
      data: {
        isApproved
      }
    });
    return result;
  } catch (error) {
    console.log("Error updating trainer profile: ", error);
    throw new AppError_default(status6.INTERNAL_SERVER_ERROR, "Failed to update trainer profile", error.stack);
  }
};
var updateTrainerProfile = async (user, trainerProfileId, payload) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status6.NOT_FOUND, "User not found");
  }
  const isTrainerExists = await prisma.trainerProfile.findUnique({
    where: {
      id: trainerProfileId
    }
  });
  if (!isTrainerExists) {
    throw new AppError_default(status6.NOT_FOUND, "Trainer profile not found");
  }
  const isValidTrainer = user.userId === isTrainerExists.userId;
  if (!isValidTrainer) {
    throw new AppError_default(status6.FORBIDDEN, "Trainers can only update their own profiles");
  }
  try {
    const result = await prisma.trainerProfile.update({
      where: {
        id: trainerProfileId
      },
      data: {
        ...payload
      }
    });
    return result;
  } catch (error) {
    console.log("Error updating trainer profile: ", error);
    throw new AppError_default(status6.INTERNAL_SERVER_ERROR, "Failed to update trainer profile", error.stack);
  }
};
var deleteTrainerProfile = async (user, trainerProfileId) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status6.NOT_FOUND, "User not found");
  }
  const isTrainerExists = await prisma.trainerProfile.findUnique({
    where: {
      id: trainerProfileId
    }
  });
  if (!isTrainerExists) {
    throw new AppError_default(status6.NOT_FOUND, "Trainer profile not found");
  }
  const isAdmin = user.role === UserRoles.ADMIN;
  if (!isAdmin) {
    throw new AppError_default(status6.FORBIDDEN, "Only admins can delete trainer profiles");
  }
  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.trainerProfile.delete({
        where: {
          id: trainerProfileId
        }
      });
      await tx.user.update({
        where: {
          id: isTrainerExists.userId
        },
        data: {
          isDeleted: true
          // status: UserStatus.BANNED
        }
      });
    });
    return result;
  } catch (error) {
    console.log("Error deleting trainer profile: ", error);
    throw new AppError_default(status6.INTERNAL_SERVER_ERROR, "Failed to delete trainer profile", error.stack);
  }
};
var TrainerProfileService = {
  createTrainerProfile,
  getAllTrainers,
  getAllTrainerProfilesApprovedOnly,
  getAllTrainersFromUsers,
  getTrainerByTrainerProfileId,
  getTrainerProfileByUserId,
  getNotApprovedTrainerProfiles,
  approvalControlForTrainerProfile,
  updateTrainerProfile,
  deleteTrainerProfile
};

// src/app/modules/trainerProfile/trainerProfile.controller.ts
import status7 from "http-status";
var createTrainerProfile2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const payload = req.body;
    const result = await TrainerProfileService.createTrainerProfile(user, payload);
    sendResponse(res, {
      httpStatusCode: status7.CREATED,
      success: true,
      message: "Trainer profile created successfully",
      data: result
    });
  }
);
var getAllTrainers2 = catchAsync(
  async (req, res) => {
    const query = req.query;
    const result = await TrainerProfileService.getAllTrainers(query);
    sendResponse(res, {
      httpStatusCode: status7.OK,
      success: true,
      message: "Trainer profiles retrieved successfully",
      data: result.data,
      meta: result.meta
    });
  }
);
var getAllTrainerProfilesApprovedOnly2 = catchAsync(
  async (req, res) => {
    const query = req.query;
    const result = await TrainerProfileService.getAllTrainerProfilesApprovedOnly(query);
    sendResponse(res, {
      httpStatusCode: status7.OK,
      success: true,
      message: "Trainer profiles retrieved successfully",
      data: result.data,
      meta: result.meta
    });
  }
);
var getAllTrainersFromUsers2 = catchAsync(
  async (req, res) => {
    const query = req.query;
    const result = await TrainerProfileService.getAllTrainersFromUsers(query);
    sendResponse(res, {
      httpStatusCode: status7.OK,
      success: true,
      message: "Trainers retrieved successfully",
      data: result.data,
      meta: result.meta
    });
  }
);
var getTrainerProfileByUserId2 = catchAsync(
  async (req, res) => {
    const { userId } = req.params;
    const result = await TrainerProfileService.getTrainerProfileByUserId(userId);
    sendResponse(res, {
      httpStatusCode: status7.OK,
      success: true,
      message: "Trainer profile retrieved successfully",
      data: result
    });
  }
);
var getTrainerByTrainerProfileId2 = catchAsync(
  async (req, res) => {
    const { trainerProfileId } = req.params;
    const result = await TrainerProfileService.getTrainerByTrainerProfileId(trainerProfileId);
    sendResponse(res, {
      httpStatusCode: status7.OK,
      success: true,
      message: "Trainer profile retrieved successfully",
      data: result
    });
  }
);
var getNotApprovedTrainerProfiles2 = catchAsync(
  async (req, res) => {
    const result = await TrainerProfileService.getNotApprovedTrainerProfiles();
    sendResponse(res, {
      httpStatusCode: status7.OK,
      success: true,
      message: "Not approved trainer profiles retrieved successfully",
      data: result
    });
  }
);
var approvalControlForTrainerProfile2 = catchAsync(
  async (req, res) => {
    const { trainerProfileId } = req.params;
    const { isApproved } = req.body;
    const user = req.user;
    const result = await TrainerProfileService.approvalControlForTrainerProfile(user, trainerProfileId, isApproved);
    sendResponse(res, {
      httpStatusCode: status7.OK,
      success: true,
      message: `Trainer profile ${isApproved ? "approved" : "rejected"} successfully`,
      data: result
    });
  }
);
var updateTrainerProfile2 = catchAsync(
  async (req, res) => {
    const { trainerProfileId } = req.params;
    const payload = req.body;
    const user = req.user;
    const result = await TrainerProfileService.updateTrainerProfile(user, trainerProfileId, payload);
    sendResponse(res, {
      httpStatusCode: status7.OK,
      success: true,
      message: "Trainer profile updated successfully",
      data: result
    });
  }
);
var deleteTrainerProfile2 = catchAsync(
  async (req, res) => {
    const { trainerProfileId } = req.params;
    const user = req.user;
    const result = await TrainerProfileService.deleteTrainerProfile(user, trainerProfileId);
    sendResponse(res, {
      httpStatusCode: status7.OK,
      success: true,
      message: "Trainer profile deleted successfully",
      data: result
    });
  }
);
var TrainerProfileController = {
  createTrainerProfile: createTrainerProfile2,
  getAllTrainers: getAllTrainers2,
  getAllTrainerProfilesApprovedOnly: getAllTrainerProfilesApprovedOnly2,
  getAllTrainersFromUsers: getAllTrainersFromUsers2,
  getTrainerByTrainerProfileId: getTrainerByTrainerProfileId2,
  getTrainerProfileByUserId: getTrainerProfileByUserId2,
  getNotApprovedTrainerProfiles: getNotApprovedTrainerProfiles2,
  approvalControlForTrainerProfile: approvalControlForTrainerProfile2,
  updateTrainerProfile: updateTrainerProfile2,
  deleteTrainerProfile: deleteTrainerProfile2
};

// src/app/modules/trainerProfile/trainerProfile.validation.ts
import z2 from "zod";
var createTrainerProfileZodSchema = z2.object({
  body: z2.object({
    bio: z2.string().optional(),
    specialties: z2.string().min(5, "Specialties must be at least 5 characters long"),
    experience: z2.number().int().positive("Experience must be a positive integer"),
    feePerHour: z2.number().positive("Fee per hour must be a positive number")
  })
});
var updateTrainerProfileZodSchema = z2.object({
  body: z2.object({
    bio: z2.string().optional(),
    specialties: z2.string().min(5, "Specialties must be at least 5 characters long"),
    experience: z2.number().int().positive("Experience must be a positive integer"),
    feePerHour: z2.number().positive("Fee per hour must be a positive number")
  })
});

// src/app/modules/trainerProfile/trainerProfile.route.ts
var router3 = Router3();
router3.post("/create-trainer-profile", validateRequest(createTrainerProfileZodSchema), checkAuth(UserRoles.TRAINER), TrainerProfileController.createTrainerProfile);
router3.get("/", TrainerProfileController.getAllTrainers);
router3.get("/approved-trainers", TrainerProfileController.getAllTrainerProfilesApprovedOnly);
router3.get("/from-users", checkAuth(UserRoles.ADMIN), TrainerProfileController.getAllTrainersFromUsers);
router3.get("/:trainerProfileId", TrainerProfileController.getTrainerByTrainerProfileId);
router3.get("/userId/:userId", checkAuth(UserRoles.USER, UserRoles.TRAINER), TrainerProfileController.getTrainerProfileByUserId);
router3.get("/trainers/not-approved", checkAuth(UserRoles.ADMIN), TrainerProfileController.getNotApprovedTrainerProfiles);
router3.patch("/approval-control/:trainerProfileId", checkAuth(UserRoles.ADMIN), TrainerProfileController.approvalControlForTrainerProfile);
router3.patch("/update-trainer-profile/:trainerProfileId", checkAuth(UserRoles.TRAINER), TrainerProfileController.updateTrainerProfile);
router3.delete("/delete-trainer-profile/:trainerProfileId", checkAuth(UserRoles.ADMIN), TrainerProfileController.deleteTrainerProfile);
var TrainerProfileRoute = router3;

// src/app/modules/slot/slot.route.ts
import { Router as Router4 } from "express";

// src/app/modules/slot/slot.service.ts
import status8 from "http-status";
var createSlot = async (user, payload) => {
  const isTrainer = await prisma.trainerProfile.findUnique({
    where: {
      userId: user.userId
    }
  });
  if (!isTrainer) {
    throw new Error("Only trainers can create slots");
  }
  try {
    const { date, startTime, endTime } = payload;
    const formattedStartTime = startTime.trim();
    const formattedEndTime = endTime.trim();
    if (formattedStartTime > formattedEndTime) {
      throw new AppError_default(status8.BAD_REQUEST, "Start time must be before end time");
    }
    const startOfDay = /* @__PURE__ */ new Date(`${date}T00:00:00.000Z`);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = /* @__PURE__ */ new Date(`${date}T00:00:00.000Z`);
    endOfDay.setUTCHours(23, 59, 59, 999);
    const isSlotAlreadyCreated = await prisma.slot.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        trainer: {
          userId: user.userId
        }
      }
    });
    if (isSlotAlreadyCreated) {
      throw new AppError_default(status8.CONFLICT, "Slot with the same date and time already exists");
    }
    const result = await prisma.slot.create({
      data: {
        trainerId: isTrainer.id,
        date: /* @__PURE__ */ new Date(`${date}T12:00:00.000Z`),
        startTime: formattedStartTime,
        endTime: formattedEndTime
      }
    });
    return result;
  } catch (error) {
    if (error instanceof AppError_default) {
      throw error;
    }
    console.log("Error creating slot: ", error);
    throw new AppError_default(status8.INTERNAL_SERVER_ERROR, "Failed to create slot");
  }
};
var getAllSlots = async (query) => {
  const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);
  const normalizedQuery = {
    ...query,
    sortBy: query.sortBy ?? "date",
    "trainer.avgRating": query["trainer.rating"],
    "trainer.feePerHour": query["trainer.freePerHour"]
  };
  const operatorKeyPattern = /^([^\[]+)\[([^\]]+)\]$/;
  Object.keys(query).forEach((key) => {
    const m = key.match(operatorKeyPattern);
    if (!m) return;
    const base = m[1];
    const op = m[2];
    if (base === "trainer.freePerHour") {
      normalizedQuery[`trainer.feePerHour[${op}]`] = query[key];
    }
    if (base === "trainer.rating" || base === "rating") {
      normalizedQuery[`trainer.avgRating[${op}]`] = query[key];
    }
    if (base === "experience") {
      normalizedQuery[`trainer.experience[${op}]`] = query[key];
    }
    if (base === "freePerHour") {
      normalizedQuery[`trainer.feePerHour[${op}]`] = query[key];
    }
  });
  Object.keys(query).forEach((key) => {
    if (key === "experience") {
      if (query[key] !== void 0 && normalizedQuery["trainer.experience"] === void 0) {
        normalizedQuery["trainer.experience"] = query[key];
      }
    }
    if (key === "trainer.experience") {
    }
    if (key === "freePerHour") {
      if (query[key] !== void 0 && normalizedQuery["trainer.feePerHour"] === void 0) {
        normalizedQuery["trainer.feePerHour"] = query[key];
      }
    }
  });
  const { orderBy } = QueryBuilder.getSortOptions(normalizedQuery);
  const searchableFields = ["trainer.user.name"];
  const { searchConditions } = QueryBuilder.getSearchConditions(query, searchableFields);
  const filterableFields = ["trainer.user.name", "trainer.avgRating", "trainer.feePerHour", "trainer.experience", "date"];
  const { filterConditions } = QueryBuilder.getFilterConditions(normalizedQuery, filterableFields);
  const filterConditionsTyped = filterConditions;
  const dateFilters = filterConditionsTyped.date;
  if (dateFilters) {
    const normalizeDateValue = (value) => {
      if (value === void 0 || value === null) {
        return value;
      }
      if (Array.isArray(value)) {
        return value.map((item) => normalizeDateValue(item));
      }
      if (typeof value === "string" || value instanceof Date) {
        return new Date(value);
      }
      return value;
    };
    Object.keys(dateFilters).forEach((key) => {
      dateFilters[key] = normalizeDateValue(dateFilters[key]);
    });
    filterConditionsTyped.date = dateFilters;
  }
  const whereConditions = [
    { isBooked: false },
    ...searchConditions.length > 0 ? [{ OR: searchConditions }] : [],
    filterConditionsTyped
  ];
  const [slots, total] = await Promise.all([
    prisma.slot.findMany({
      where: whereConditions.length > 0 ? { AND: whereConditions } : void 0,
      skip,
      take: limit,
      orderBy,
      include: {
        trainer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    }),
    prisma.slot.count({
      where: whereConditions.length > 0 ? { AND: whereConditions } : void 0
    })
  ]);
  return {
    data: slots,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getSlotById = async (slotId) => {
  const slot = await prisma.slot.findUnique({
    where: {
      id: slotId
    }
  });
  return slot;
};
var getSlotsByTrainerId = async (trainerId, query) => {
  const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);
  const sortBy = query.sortBy || "date";
  const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";
  const orderBy = {
    [sortBy]: sortOrder
  };
  const { filterConditions } = QueryBuilder.getFilterConditions(query, ["date", "isBooked"]);
  if (filterConditions && filterConditions.date && typeof filterConditions.date === "object") {
    const dateFilter = filterConditions.date;
    if (dateFilter.gte && typeof dateFilter.gte === "string") {
      dateFilter.gte = new Date(dateFilter.gte);
    }
    if (dateFilter.lte && typeof dateFilter.lte === "string") {
      dateFilter.lte = new Date(dateFilter.lte);
    }
  }
  const whereConditions = {
    trainerId,
    ...filterConditions
  };
  const [slots, total] = await prisma.$transaction([
    prisma.slot.findMany({
      where: whereConditions,
      include: {
        trainer: {
          select: {
            id: true,
            feePerHour: true,
            user: {
              select: {
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      },
      orderBy,
      skip,
      take: limit
    }),
    prisma.slot.count({
      where: whereConditions
    })
  ]);
  return {
    data: slots,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var updateSlot = async (user, slotId, payload) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user?.userId
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status8.NOT_FOUND, "User not found");
  }
  const isTrainer = await prisma.trainerProfile.findUnique({
    where: {
      userId: user?.userId
    }
  });
  if (!isTrainer) {
    throw new AppError_default(status8.FORBIDDEN, "Only trainers can update slots");
  }
  const isSlotExists = await prisma.slot.findFirst({
    where: {
      id: slotId,
      trainerId: isTrainer.id,
      isBooked: false
    }
  });
  if (!isSlotExists) {
    throw new AppError_default(status8.NOT_FOUND, "Slot not found or you are trying to update other trainer's slot");
  }
  const isSlotAvailable = await prisma.slot.findFirst({
    where: {
      date: new Date(payload.date),
      startTime: payload.startTime,
      endTime: payload.endTime,
      trainer: {
        userId: user?.userId
      }
    }
  });
  if (isSlotAvailable) {
    throw new AppError_default(status8.CONFLICT, "Slot with the same date and time already exists");
  }
  try {
    const { date, startTime, endTime } = payload;
    if (startTime > endTime) {
      throw new AppError_default(status8.BAD_REQUEST, "Start time must be before end time");
    }
    const result = await prisma.slot.update({
      where: {
        id: slotId
      },
      data: {
        date: new Date(date),
        startTime,
        endTime
      }
    });
    return result;
  } catch (error) {
    console.log("Error updating slot: ", error);
    throw new AppError_default(status8.INTERNAL_SERVER_ERROR, "Failed to update slot");
  }
};
var updateSlotStatusToCompleted = async (user, slotId) => {
  const isTrainer = await prisma.trainerProfile.findUnique({
    where: {
      userId: user?.userId
    }
  });
  if (!isTrainer) {
    throw new AppError_default(status8.FORBIDDEN, "Only trainers can update slot status");
  }
  const isSlotExists = await prisma.slot.findFirst({
    where: {
      id: slotId,
      trainerId: isTrainer.id
    }
  });
  if (!isSlotExists) {
    throw new AppError_default(status8.NOT_FOUND, "Slot not found or you are trying to update other trainer's slot");
  }
  const isBookingExists = await prisma.bookingSlot.findFirst({
    where: {
      slotId
    }
  });
  if (!isBookingExists) {
    throw new AppError_default(status8.NOT_FOUND, "No booking found for this slot");
  }
  if (isBookingExists.trainerId !== isTrainer.id) {
    throw new AppError_default(status8.FORBIDDEN, "You can only update bookings for your own slots");
  }
  try {
    const result = await prisma.bookingSlot.update({
      where: {
        id: isBookingExists.id
      },
      data: {
        status: BookingStatus.COMPLETED
      }
    });
    return result;
  } catch (error) {
    console.log("Error updating slot status: ", error);
    throw new AppError_default(status8.INTERNAL_SERVER_ERROR, "Failed to update slot status");
  }
};
var deleteSlot = async (user, slotId) => {
  const isTrainer = await prisma.trainerProfile.findUnique({
    where: {
      userId: user?.userId
    }
  });
  if (!isTrainer) {
    throw new AppError_default(status8.FORBIDDEN, "Only trainers can delete slots");
  }
  const isSlotExists = await prisma.slot.findFirst({
    where: {
      id: slotId,
      trainerId: isTrainer.id,
      isBooked: false
    }
  });
  if (!isSlotExists) {
    throw new AppError_default(status8.NOT_FOUND, "Slot not found or you are trying to delete other trainer's slot");
  }
  try {
    await prisma.slot.delete({
      where: {
        id: slotId
      }
    });
  } catch (error) {
    console.log("Error deleting slot: ", error);
    throw new AppError_default(status8.INTERNAL_SERVER_ERROR, "Failed to delete slot");
  }
};
var SlotService = {
  createSlot,
  getAllSlots,
  getSlotById,
  getSlotsByTrainerId,
  updateSlot,
  updateSlotStatusToCompleted,
  deleteSlot
};

// src/app/modules/slot/slot.controller.ts
import status9 from "http-status";
var createSlot2 = catchAsync(async (req, res) => {
  const user = req.user;
  const payload = req.body;
  const result = await SlotService.createSlot(user, payload);
  sendResponse(res, {
    httpStatusCode: status9.CREATED,
    success: true,
    message: "Slot created successfully",
    data: result
  });
});
var getAllSlots2 = catchAsync(
  async (req, res) => {
    const result = await SlotService.getAllSlots(req.query);
    sendResponse(res, {
      httpStatusCode: status9.OK,
      success: true,
      message: "Slots retrieved successfully",
      data: result
    });
  }
);
var getSlotById2 = catchAsync(
  async (req, res) => {
    const { slotId } = req.params;
    const result = await SlotService.getSlotById(slotId);
    sendResponse(res, {
      httpStatusCode: status9.OK,
      success: true,
      message: "Slot retrieved successfully",
      data: result
    });
  }
);
var getSlotsByTrainerId2 = catchAsync(
  async (req, res) => {
    const { trainerId } = req.params;
    const query = req.query;
    const result = await SlotService.getSlotsByTrainerId(trainerId, query);
    sendResponse(res, {
      httpStatusCode: status9.OK,
      success: true,
      message: "Slots retrieved successfully",
      data: result.data,
      meta: result.meta
    });
  }
);
var updateSlot2 = catchAsync(async (req, res) => {
  const user = req.user;
  const payload = req.body;
  const { slotId } = req.params;
  const result = await SlotService.updateSlot(user, slotId, payload);
  sendResponse(res, {
    httpStatusCode: status9.OK,
    success: true,
    message: "Slot updated successfully",
    data: result
  });
});
var updateSlotStatusToCompleted2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const { slotId } = req.params;
    const result = await SlotService.updateSlotStatusToCompleted(user, slotId);
    sendResponse(res, {
      httpStatusCode: status9.OK,
      success: true,
      message: "Slot status updated to completed successfully",
      data: result
    });
  }
);
var deleteSlot2 = catchAsync(async (req, res) => {
  const user = req.user;
  const { slotId } = req.params;
  const result = await SlotService.deleteSlot(user, slotId);
  sendResponse(res, {
    httpStatusCode: status9.OK,
    success: true,
    message: "Slot deleted successfully",
    data: result
  });
});
var SlotController = {
  createSlot: createSlot2,
  getAllSlots: getAllSlots2,
  getSlotById: getSlotById2,
  getSlotsByTrainerId: getSlotsByTrainerId2,
  updateSlot: updateSlot2,
  updateSlotStatusToCompleted: updateSlotStatusToCompleted2,
  deleteSlot: deleteSlot2
};

// src/app/modules/slot/slot.validation.ts
import z3 from "zod";
var createSlotZodSchema = z3.object({
  body: z3.object({
    date: z3.string().refine((dateStr) => {
      const date = new Date(dateStr);
      return !isNaN(date.getTime());
    }),
    startTime: z3.string().refine((timeStr) => {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      return timeRegex.test(timeStr);
    }),
    endTime: z3.string().refine((timeStr) => {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      return timeRegex.test(timeStr);
    })
  })
});
var updateSlotZodSchema = z3.object({
  body: z3.object({
    date: z3.string().refine((dateStr) => {
      const date = new Date(dateStr);
      return !isNaN(date.getTime());
    }),
    startTime: z3.string().refine((timeStr) => {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      return timeRegex.test(timeStr);
    }),
    endTime: z3.string().refine((timeStr) => {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      return timeRegex.test(timeStr);
    })
  })
});

// src/app/modules/slot/slot.route.ts
var router4 = Router4();
router4.post("/create-slot", validateRequest(createSlotZodSchema), checkAuth(UserRoles.TRAINER), SlotController.createSlot);
router4.get("/", SlotController.getAllSlots);
router4.get("/:slotId", SlotController.getSlotById);
router4.get("/trainer/:trainerId", SlotController.getSlotsByTrainerId);
router4.patch("/update-slot/:slotId", validateRequest(updateSlotZodSchema), checkAuth(UserRoles.TRAINER), SlotController.updateSlot);
router4.patch("/update-booking-status/:slotId", checkAuth(UserRoles.TRAINER), SlotController.updateSlotStatusToCompleted);
router4.delete("/delete-slot/:slotId", checkAuth(UserRoles.TRAINER), SlotController.deleteSlot);
var SlotRoute = router4;

// src/app/modules/review/review.route.ts
import { Router as Router5 } from "express";

// src/app/modules/review/review.service.ts
import status10 from "http-status";
var createReview = async (user, payload) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status10.NOT_FOUND, "User not found");
  }
  const isTrainerExists = await prisma.trainerProfile.findUnique({
    where: {
      id: payload.trainerId
    }
  });
  if (!isTrainerExists) {
    throw new AppError_default(status10.NOT_FOUND, "Trainer not found");
  }
  const alreadyReviewed = await prisma.review.findFirst({
    where: {
      userId: user.userId,
      trainerId: payload.trainerId
    }
  });
  if (alreadyReviewed) {
    throw new AppError_default(status10.BAD_REQUEST, "You have already reviewed this trainer");
  }
  try {
    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          userId: user.userId,
          ...payload
        }
      });
      const ratingSummary = await tx.review.aggregate({
        where: {
          trainerId: payload.trainerId
        },
        _avg: {
          rating: true
        }
      });
      await tx.trainerProfile.update({
        where: {
          id: payload.trainerId
        },
        data: {
          avgRating: ratingSummary._avg.rating ?? 0
        }
      });
      return review;
    });
    return result;
  } catch (error) {
    console.log("Error creating review: ", error);
    throw new AppError_default(status10.INTERNAL_SERVER_ERROR, "Failed to create review");
  }
};
var getAllReviews = async (query) => {
  const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);
  const { orderBy } = QueryBuilder.getSortOptions(query);
  const searchableFields = ["user.name", "trainer.user.name"];
  const { searchConditions } = QueryBuilder.getSearchConditions(query, searchableFields);
  const filterableFields = ["rating", "trainer.avgRating", "trainer.experience"];
  const { filterConditions } = QueryBuilder.getFilterConditions(query, filterableFields);
  const result = await prisma.review.findMany({
    where: {
      AND: [
        { OR: searchConditions.length > 0 ? searchConditions : void 0 },
        { ...filterConditions }
      ]
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      trainer: {
        include: {
          user: true
        }
      }
    },
    skip,
    take: limit,
    orderBy
  });
  return {
    data: result,
    meta: {
      page,
      limit,
      total: result.length,
      totalPages: Math.ceil(result.length / limit)
    }
  };
};
var getReviewsByUserId = async (user, query) => {
  const filterableFields = ["rating", "trainer.avgRating"];
  const searchableFields = ["trainer.user.name", "trainer.user.email"];
  const paginationOptions = QueryBuilder.getPaginationOptions(query);
  const { orderBy } = QueryBuilder.getSortOptions(query);
  const { searchConditions } = QueryBuilder.getSearchConditions(query, searchableFields);
  const { filterConditions } = QueryBuilder.getFilterConditions(query, filterableFields);
  const { page, limit, skip } = paginationOptions;
  const whereConditions = {
    userId: user.userId,
    ...filterConditions,
    ...searchConditions.length > 0 ? { OR: searchConditions } : {}
  };
  const [result, total] = await prisma.$transaction([
    prisma.review.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy,
      include: {
        trainer: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    }),
    prisma.review.count({
      where: whereConditions
    })
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    data: result,
    meta: {
      page,
      limit,
      total,
      totalPages
    }
  };
};
var getReviewsByTrainerId = async (trainerId) => {
  const isTrainerExists = await prisma.trainerProfile.findUnique({
    where: {
      id: trainerId
    }
  });
  if (!isTrainerExists) {
    throw new AppError_default(status10.NOT_FOUND, "Trainer not found");
  }
  try {
    const result = await prisma.review.findMany({
      where: {
        trainerId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    });
    return result;
  } catch (error) {
    console.log("Error fetching reviews by trainer ID: ", error);
    throw new AppError_default(status10.INTERNAL_SERVER_ERROR, "Failed to fetch reviews");
  }
};
var updateReview = async (user, reviewId, payload) => {
  const isReviewExists = await prisma.review.findFirst({
    where: {
      id: reviewId
    }
  });
  if (!isReviewExists) {
    throw new AppError_default(status10.NOT_FOUND, "Review not found");
  }
  const isOwnReview = await prisma.review.findFirst({
    where: {
      id: reviewId,
      userId: user.userId
    }
  });
  if (!isOwnReview) {
    throw new AppError_default(status10.FORBIDDEN, "You can't update others' reviews. You can only update your own reviews");
  }
  try {
    const result = await prisma.review.update({
      where: {
        id: reviewId
      },
      data: payload
    });
    return result;
  } catch (error) {
    console.log("Error updating review: ", error);
    throw new AppError_default(status10.INTERNAL_SERVER_ERROR, "Failed to update review");
  }
};
var isAlreadyReviewed = async (user, trainerId) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status10.NOT_FOUND, "User not found");
  }
  const isTrainerExists = await prisma.trainerProfile.findUnique({
    where: {
      id: trainerId
    }
  });
  if (!isTrainerExists) {
    throw new AppError_default(status10.NOT_FOUND, "Trainer not found");
  }
  try {
    const alreadyReviewed = await prisma.review.findFirst({
      where: {
        userId: user.userId,
        trainerId
      }
    });
    return !!alreadyReviewed;
  } catch (error) {
    console.log("Error checking review existence: ", error);
    throw new AppError_default(status10.INTERNAL_SERVER_ERROR, "Failed to check review existence");
  }
};
var deleteReview = async (user, reviewId) => {
  const isReviewExists = await prisma.review.findFirst({
    where: {
      id: reviewId
    }
  });
  if (!isReviewExists) {
    throw new AppError_default(status10.NOT_FOUND, "Review not found");
  }
  ;
  const isOwnReview = await prisma.review.findFirst({
    where: {
      id: reviewId,
      userId: user.userId
    }
  });
  if (!isOwnReview) {
    throw new AppError_default(status10.FORBIDDEN, "You can't delete others' reviews. You can only delete your own reviews");
  }
  try {
    const result = await prisma.$transaction(async (tx) => {
      const deletedReview = await tx.review.delete({
        where: {
          id: reviewId
        }
      });
      const ratingSummary = await tx.review.aggregate({
        where: {
          trainerId: deletedReview.trainerId
        },
        _avg: {
          rating: true
        }
      });
      await tx.trainerProfile.update({
        where: {
          id: deletedReview.trainerId
        },
        data: {
          avgRating: ratingSummary._avg.rating ?? 0
        }
      });
      return deletedReview;
    });
    return result;
  } catch (error) {
    console.log("Error deleting review: ", error);
    throw new AppError_default(status10.INTERNAL_SERVER_ERROR, "Failed to delete review");
  }
};
var ReviewService = {
  createReview,
  getAllReviews,
  getReviewsByUserId,
  getReviewsByTrainerId,
  updateReview,
  isAlreadyReviewed,
  deleteReview
};

// src/app/modules/review/review.controller.ts
import status11 from "http-status";
var createReview2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const payload = req.body;
    const result = await ReviewService.createReview(user, payload);
    sendResponse(res, {
      httpStatusCode: status11.CREATED,
      success: true,
      message: "Review created successfully",
      data: result
    });
  }
);
var getAllReviews2 = catchAsync(
  async (req, res) => {
    const query = req.query;
    const result = await ReviewService.getAllReviews(query);
    sendResponse(res, {
      httpStatusCode: status11.OK,
      success: true,
      message: "Reviews retrieved successfully",
      data: result
    });
  }
);
var getReviewsByUserId2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const query = req.query;
    const result = await ReviewService.getReviewsByUserId(user, query);
    sendResponse(res, {
      httpStatusCode: status11.OK,
      success: true,
      message: "Reviews retrieved successfully",
      data: result.data,
      meta: result.meta
    });
  }
);
var getReviewsByTrainerId2 = catchAsync(
  async (req, res) => {
    const trainerId = req.params.trainerId;
    const result = await ReviewService.getReviewsByTrainerId(trainerId);
    sendResponse(res, {
      httpStatusCode: status11.OK,
      success: true,
      message: "Reviews retrieved successfully",
      data: result
    });
  }
);
var updateReview2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const reviewId = req.params.reviewId;
    const payload = req.body;
    const result = await ReviewService.updateReview(user, reviewId, payload);
    sendResponse(res, {
      httpStatusCode: status11.OK,
      success: true,
      message: "Review updated successfully",
      data: result
    });
  }
);
var isAlreadyReviewed2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const trainerId = req.params.trainerId;
    const result = await ReviewService.isAlreadyReviewed(user, trainerId);
    sendResponse(res, {
      httpStatusCode: status11.OK,
      success: true,
      message: "Review status retrieved successfully",
      data: result
    });
  }
);
var deleteReview2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const reviewId = req.params.reviewId;
    const result = await ReviewService.deleteReview(user, reviewId);
    sendResponse(res, {
      httpStatusCode: status11.OK,
      success: true,
      message: "Review deleted successfully",
      data: result
    });
  }
);
var ReviewController = {
  createReview: createReview2,
  getAllReviews: getAllReviews2,
  getReviewsByUserId: getReviewsByUserId2,
  getReviewsByTrainerId: getReviewsByTrainerId2,
  deleteReview: deleteReview2,
  isAlreadyReviewed: isAlreadyReviewed2,
  updateReview: updateReview2
};

// src/app/modules/review/review.validation.ts
import z4 from "zod";
var CreateReviewZodSchema = z4.object({
  body: z4.object({
    trainerId: z4.string().uuid({ message: "Invalid trainer ID format" }),
    rating: z4.number().min(1, { message: "Rating must be at least 1" }).max(5, { message: "Rating must be at most 5" }),
    comment: z4.string().optional()
  })
});
var UpdateReviewZodSchema = z4.object({
  body: z4.object({
    rating: z4.number().min(1, { message: "Rating must be at least 1" }).max(5, { message: "Rating must be at most 5" }).optional(),
    comment: z4.string().optional()
  })
});

// src/app/modules/review/review.route.ts
var router5 = Router5();
router5.post("/create-review", validateRequest(CreateReviewZodSchema), checkAuth(UserRoles.USER), ReviewController.createReview);
router5.get("/", ReviewController.getAllReviews);
router5.get("/user/my-reviews", checkAuth(UserRoles.USER), ReviewController.getReviewsByUserId);
router5.get("/trainer/:trainerId/reviews", ReviewController.getReviewsByTrainerId);
router5.patch("/update-review/:reviewId", validateRequest(CreateReviewZodSchema.partial()), checkAuth(UserRoles.USER), ReviewController.updateReview);
router5.get("/is-already-reviewed/:trainerId", checkAuth(UserRoles.USER, UserRoles.TRAINER, UserRoles.ADMIN), ReviewController.isAlreadyReviewed);
router5.delete("/delete-review/:reviewId", checkAuth(UserRoles.USER), ReviewController.deleteReview);
var TrainerReviewRoute = router5;

// src/app/modules/booking/booking.route.ts
import { Router as Router6 } from "express";

// src/app/modules/booking/booking.service.ts
import status12 from "http-status";

// src/app/config/stripe.config.ts
import Stripe from "stripe";
var stripe = new Stripe(envVars.STRIPE.STRIPE_SECRET_KEY);

// src/app/modules/booking/booking.service.ts
import { v7 as uuidv7 } from "uuid";
var paymentRedirectBaseUrl = process.env.FRONTEND_URL ?? envVars.BETTER_AUTH_URL;
var createBooking = async (user, payload) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status12.NOT_FOUND, "User not found");
  }
  const isTrainerExists = await prisma.trainerProfile.findUnique({
    where: {
      id: payload.trainerId
    },
    include: {
      user: {
        select: {
          name: true
        }
      }
    }
  });
  if (!isTrainerExists) {
    throw new AppError_default(status12.NOT_FOUND, "Trainer not found");
  }
  const isSlotExists = await prisma.slot.findFirst({
    where: {
      id: payload.slotId,
      trainerId: payload.trainerId
    }
  });
  if (!isSlotExists) {
    throw new AppError_default(status12.NOT_FOUND, "Slot not found");
  }
  if (isSlotExists.isBooked) {
    throw new AppError_default(status12.BAD_REQUEST, "This slot is already booked");
  }
  try {
    const result = await prisma.$transaction(async (tx) => {
      const transactionId = String(uuidv7());
      const paymentData = await tx.payment.create({
        data: {
          userId: user.userId,
          purpose: PaymentPurpose.TRAINER_BOOKING,
          provider: PaymentProvider.STRIPE,
          status: PaymentStatus.PENDING,
          amount: isTrainerExists.feePerHour
        }
      });
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Booking with ${isTrainerExists.user?.name ?? "trainer"}`
              },
              unit_amount: Math.round(isTrainerExists.feePerHour * 100)
            },
            quantity: 1
          }
        ],
        payment_intent_data: {
          metadata: {
            paymentId: paymentData.id,
            trainerId: payload.trainerId,
            slotId: payload.slotId,
            userId: user.userId,
            feeAmount: String(isTrainerExists.feePerHour),
            purpose: PaymentPurpose.TRAINER_BOOKING
          }
        },
        metadata: {
          paymentId: paymentData.id,
          trainerId: payload.trainerId,
          slotId: payload.slotId,
          userId: user.userId,
          feeAmount: String(isTrainerExists.feePerHour),
          purpose: PaymentPurpose.TRAINER_BOOKING
        },
        success_url: `${paymentRedirectBaseUrl}/payment/payment-success`,
        cancel_url: `${paymentRedirectBaseUrl}/dashboard/appointments`
      });
      if (!session.url) {
        throw new AppError_default(status12.INTERNAL_SERVER_ERROR, "Failed to create payment session");
      }
      return {
        paymentData,
        paymentUrl: session.url
      };
    });
    return result;
  } catch (error) {
    console.log("Error creating booking: ", error);
    if (error instanceof AppError_default) {
      throw error;
    }
    if (error instanceof Error) {
      throw new AppError_default(status12.INTERNAL_SERVER_ERROR, error.message);
    }
    throw new AppError_default(status12.INTERNAL_SERVER_ERROR, "Failed to create booking");
  }
};
var getAllBookings = async (query) => {
  const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);
  const bookingQuery = {
    ...query,
    sortBy: query.sortBy ?? "createdAt"
  };
  const { orderBy } = QueryBuilder.getSortOptions(bookingQuery);
  const searchableFields = ["user.name", "trainer.user.name"];
  const { searchConditions } = QueryBuilder.getSearchConditions(query, searchableFields);
  const filterableFields = ["feeAmount"];
  const { filterConditions } = QueryBuilder.getFilterConditions(query, filterableFields);
  const whereConditions = [
    ...searchConditions.length > 0 ? [{ OR: searchConditions }] : [],
    { ...filterConditions }
  ];
  try {
    const [bookings, total] = await Promise.all([
      prisma.bookingSlot.findMany({
        where: whereConditions.length > 0 ? { AND: whereConditions } : void 0,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          trainer: {
            select: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy
      }),
      prisma.bookingSlot.count({
        where: whereConditions.length > 0 ? { AND: whereConditions } : void 0
      })
    ]);
    return {
      data: bookings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.log("Error fetching all bookings: ", error);
    throw new AppError_default(status12.INTERNAL_SERVER_ERROR, "Failed to fetch bookings");
  }
};
var getBookingsByUserId = async (user, query) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status12.NOT_FOUND, "User not found");
  }
  const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);
  const bookingQuery = {
    ...query,
    sortBy: query.sortBy ?? "createdAt"
  };
  const { orderBy } = QueryBuilder.getSortOptions(bookingQuery);
  const searchableFields = ["trainer.user.name", "trainer.user.email"];
  const { searchConditions } = QueryBuilder.getSearchConditions(
    query,
    searchableFields
  );
  const filterableFields = [
    "paymentStatus",
    "feeAmount",
    "slot.date",
    "slot.startTime",
    "slot.endTime"
  ];
  const { filterConditions } = QueryBuilder.getFilterConditions(query, filterableFields);
  const whereConditions = [
    { userId: user.userId },
    ...searchConditions.length > 0 ? [{ OR: searchConditions }] : [],
    { ...filterConditions }
  ];
  try {
    const [bookings, total] = await Promise.all([
      prisma.bookingSlot.findMany({
        where: { AND: whereConditions },
        include: {
          trainer: {
            select: {
              user: {
                select: {
                  name: true,
                  email: true,
                  image: true
                }
              }
            }
          },
          slot: {
            select: {
              date: true,
              startTime: true,
              endTime: true
            }
          }
        },
        skip,
        take: limit,
        orderBy
      }),
      prisma.bookingSlot.count({
        where: { AND: whereConditions }
      })
    ]);
    return {
      data: bookings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.log("Error fetching user bookings: ", error);
    throw new AppError_default(status12.INTERNAL_SERVER_ERROR, "Failed to fetch bookings");
  }
};
var getBookingsByTrainerId = async (trainerId) => {
  const isTrainerExists = await prisma.trainerProfile.findUnique({
    where: {
      id: trainerId
    }
  });
  if (!isTrainerExists) {
    throw new AppError_default(status12.NOT_FOUND, "Trainer not found");
  }
  try {
    const result = await prisma.bookingSlot.findMany({
      where: {
        trainerId
      }
    });
    return result;
  } catch (error) {
    console.log("Error fetching bookings by trainer ID: ", error);
    throw new AppError_default(status12.INTERNAL_SERVER_ERROR, "Failed to fetch bookings");
  }
};
var updateBookingStatusToCompleted = async (user, bookingId) => {
  const isTrainerExists = await prisma.trainerProfile.findUnique({
    where: {
      userId: user.userId
    }
  });
  if (!isTrainerExists) {
    throw new AppError_default(status12.NOT_FOUND, "Trainer not found");
  }
  const isValidBookingExists = await prisma.bookingSlot.findFirst({
    where: {
      id: bookingId,
      trainerId: isTrainerExists.id
    }
  });
  if (!isValidBookingExists) {
    throw new AppError_default(status12.NOT_FOUND, "Invalid booking or your'e trying to update booking that doesn't belong to you");
  }
  try {
    const result = await prisma.bookingSlot.update({
      where: {
        id: bookingId
      },
      data: {
        status: BookingStatus.COMPLETED
      }
    });
    return result;
  } catch (error) {
    console.log("Error updating booking status: ", error);
    throw new AppError_default(status12.INTERNAL_SERVER_ERROR, "Failed to update booking status");
  }
};
var deleteBooking = async (user, bookingId) => {
  const isBookingExists = await prisma.bookingSlot.findFirst({
    where: {
      id: bookingId
    }
  });
  if (!isBookingExists) {
    throw new AppError_default(status12.NOT_FOUND, "Booking not found");
  }
  const isOwnBooking = await prisma.bookingSlot.findFirst({
    where: {
      id: bookingId,
      userId: user.userId
    }
  });
  if (!isOwnBooking) {
    throw new AppError_default(status12.FORBIDDEN, "You can't delete others' bookings. You can only delete your own bookings");
  }
  if (isOwnBooking.paymentStatus === PaymentStatus.SUCCEEDED) {
    throw new AppError_default(status12.BAD_REQUEST, "Paid booking cannot be deleted");
  }
  try {
    const result = await prisma.$transaction(async (tx) => {
      const deletedBooking = await tx.bookingSlot.delete({
        where: {
          id: bookingId
        }
      });
      await tx.slot.update({
        where: {
          id: deletedBooking.slotId
        },
        data: {
          isBooked: false
        }
      });
      return deletedBooking;
    });
    return result;
  } catch (error) {
    console.log("Error deleting booking: ", error);
    throw new AppError_default(status12.INTERNAL_SERVER_ERROR, "Failed to delete booking");
  }
};
var BookingService = {
  createBooking,
  getAllBookings,
  getBookingsByUserId,
  getBookingsByTrainerId,
  updateBookingStatusToCompleted,
  deleteBooking
};

// src/app/modules/booking/booking.controller.ts
import status13 from "http-status";
var createBooking2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const payload = req.body;
    const result = await BookingService.createBooking(user, payload);
    sendResponse(res, {
      httpStatusCode: status13.CREATED,
      success: true,
      message: "Booking created successfully",
      data: result
    });
  }
);
var getAllBookings2 = catchAsync(
  async (req, res) => {
    const query = req.query;
    const result = await BookingService.getAllBookings(query);
    sendResponse(res, {
      httpStatusCode: status13.OK,
      success: true,
      message: "Bookings retrieved successfully",
      data: result
    });
  }
);
var getBookingsByUserId2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const query = req.query;
    const result = await BookingService.getBookingsByUserId(user, query);
    sendResponse(res, {
      httpStatusCode: status13.OK,
      success: true,
      message: "Bookings retrieved successfully",
      data: result.data,
      meta: result.meta
    });
  }
);
var getBookingsByTrainerId2 = catchAsync(
  async (req, res) => {
    const trainerId = req.params.trainerId;
    const result = await BookingService.getBookingsByTrainerId(trainerId);
    sendResponse(res, {
      httpStatusCode: status13.OK,
      success: true,
      message: "Bookings retrieved successfully",
      data: result
    });
  }
);
var updateBookingStatusToCompleted2 = catchAsync(
  async (req, res) => {
    const trainer = req.user;
    const bookingId = req.params.bookingId;
    const result = await BookingService.updateBookingStatusToCompleted(trainer, bookingId);
    sendResponse(res, {
      httpStatusCode: status13.OK,
      success: true,
      message: "Booking status updated to CONFIRM successfully",
      data: result
    });
  }
);
var deleteBooking2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const bookingId = req.params.bookingId;
    const result = await BookingService.deleteBooking(user, bookingId);
    sendResponse(res, {
      httpStatusCode: status13.OK,
      success: true,
      message: "Booking deleted successfully",
      data: result
    });
  }
);
var BookingController = {
  createBooking: createBooking2,
  getAllBookings: getAllBookings2,
  getBookingsByUserId: getBookingsByUserId2,
  getBookingsByTrainerId: getBookingsByTrainerId2,
  updateBookingStatusToCompleted: updateBookingStatusToCompleted2,
  deleteBooking: deleteBooking2
};

// src/app/modules/booking/booking.validation.ts
import z5 from "zod";
var CreateBookingZodSchema = z5.object({
  body: z5.object({
    trainerId: z5.string().uuid({ message: "Invalid trainer ID format" }),
    slotId: z5.string().uuid({ message: "Invalid slot ID format" })
  })
});

// src/app/modules/booking/booking.route.ts
var router6 = Router6();
router6.post("/create-booking", validateRequest(CreateBookingZodSchema), checkAuth(UserRoles.USER), BookingController.createBooking);
router6.get("/", BookingController.getAllBookings);
router6.get("/user/my-bookings", checkAuth(UserRoles.USER), BookingController.getBookingsByUserId);
router6.get("/trainer/:trainerId/bookings", BookingController.getBookingsByTrainerId);
router6.patch("/update-booking/:bookingId", checkAuth(UserRoles.TRAINER), BookingController.updateBookingStatusToCompleted);
router6.delete("/delete-booking/:bookingId", checkAuth(UserRoles.USER), BookingController.deleteBooking);
var BookingRoute = router6;

// src/app/modules/order/order.route.ts
import { Router as Router7 } from "express";

// src/app/modules/order/order.service.ts
import status14 from "http-status";
var paymentRedirectBaseUrl2 = process.env.FRONTEND_URL ?? envVars.BETTER_AUTH_URL;
var createOrder = async (user, payload) => {
  const isProductExists = await prisma.product.findFirst({
    where: {
      id: payload.productId
    }
  });
  if (!isProductExists) {
    throw new AppError_default(status14.NOT_FOUND, "Product not found");
  }
  const isStockAvailable = await prisma.product.findFirst({
    where: {
      id: payload.productId,
      remainingStock: {
        gte: payload.quantity
      }
    }
  });
  if (!isStockAvailable) {
    throw new AppError_default(status14.BAD_REQUEST, "Insufficient stock available");
  }
  const price = isProductExists.price;
  const totalAmount = price * payload.quantity;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const paymentData = await tx.payment.create({
        data: {
          userId: user.userId,
          purpose: PaymentPurpose.PRODUCT_ORDER,
          provider: PaymentProvider.STRIPE,
          status: PaymentStatus.PENDING,
          amount: totalAmount
        }
      });
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Order for ${isProductExists.name}`
              },
              unit_amount: Math.round(totalAmount * 100)
            },
            quantity: 1
          }
        ],
        payment_intent_data: {
          metadata: {
            paymentId: paymentData.id,
            userId: user.userId,
            productId: payload.productId,
            quantity: String(payload.quantity),
            address: payload.address,
            phone: payload.phone,
            totalAmount: String(totalAmount),
            purpose: PaymentPurpose.PRODUCT_ORDER
          }
        },
        metadata: {
          paymentId: paymentData.id,
          userId: user.userId,
          productId: payload.productId,
          quantity: String(payload.quantity),
          address: payload.address,
          phone: payload.phone,
          totalAmount: String(totalAmount),
          purpose: PaymentPurpose.PRODUCT_ORDER
        },
        success_url: `${paymentRedirectBaseUrl2}/payment/payment-success`,
        cancel_url: `${paymentRedirectBaseUrl2}/dashboard/orders`
      });
      if (!session.url) {
        throw new AppError_default(status14.INTERNAL_SERVER_ERROR, "Failed to create payment session");
      }
      return {
        paymentData,
        paymentUrl: session.url
      };
    });
    return result;
  } catch (error) {
    console.log("Error creating order: ", error);
    if (error instanceof AppError_default) {
      throw error;
    }
    if (error instanceof Error) {
      throw new AppError_default(status14.INTERNAL_SERVER_ERROR, error.message);
    }
    throw new AppError_default(status14.INTERNAL_SERVER_ERROR, "Failed to create order");
  }
};
var getOwnOrders = async (user, query) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status14.NOT_FOUND, "User not found");
  }
  try {
    const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);
    const orderQuery = {
      ...query,
      sortBy: query.sortBy ?? "createdAt"
    };
    const { orderBy } = QueryBuilder.getSortOptions(orderQuery);
    const searchableFields = ["product.name", "product.description", "address"];
    const { searchConditions } = QueryBuilder.getSearchConditions(query, searchableFields);
    const filterableFields = ["status", "price", "totalAmount", "quantity"];
    const { filterConditions } = QueryBuilder.getFilterConditions(query, filterableFields);
    const whereConditions = [
      { userId: user.userId },
      ...searchConditions.length > 0 ? [{ OR: searchConditions }] : [],
      { ...filterConditions }
    ];
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { AND: whereConditions },
        include: {
          product: {
            select: {
              name: true
            }
          }
        },
        skip,
        take: limit,
        orderBy
      }),
      prisma.order.count({
        where: { AND: whereConditions }
      })
    ]);
    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new AppError_default(status14.INTERNAL_SERVER_ERROR, "Failed to fetch orders", error.stack);
  }
};
var getAllOrders = async (query) => {
  const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);
  const orderQuery = {
    ...query,
    sortBy: query.sortBy ?? "createdAt"
  };
  const { orderBy } = QueryBuilder.getSortOptions(orderQuery);
  const searchableFields = ["user.name", "product.name", "product.description"];
  const { searchConditions } = QueryBuilder.getSearchConditions(query, searchableFields);
  const filterableFields = ["status", "price", "totalAmount", "quantity"];
  const { filterConditions } = QueryBuilder.getFilterConditions(query, filterableFields);
  const whereConditions = [
    ...searchConditions.length > 0 ? [{ OR: searchConditions }] : [],
    { ...filterConditions }
  ];
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: whereConditions.length > 0 ? { AND: whereConditions } : void 0,
      include: {
        product: {
          select: {
            name: true,
            price: true,
            description: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      skip,
      take: limit,
      orderBy
    }),
    prisma.order.count({
      where: whereConditions.length > 0 ? { AND: whereConditions } : void 0
    })
  ]);
  return {
    data: orders,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var changeOrderStatus = async (user, orderId, payload) => {
  const isOrderExists = await prisma.order.findUnique({
    where: {
      id: orderId
    }
  });
  if (!isOrderExists) {
    throw new AppError_default(status14.NOT_FOUND, "Order not found");
  }
  try {
    const result = await prisma.order.update({
      where: {
        id: orderId
      },
      data: {
        status: payload.status
      }
    });
    return result;
  } catch (error) {
    throw new AppError_default(status14.INTERNAL_SERVER_ERROR, "Failed to update order status", error.stack);
  }
};
var OrderService = {
  createOrder,
  getOwnOrders,
  getAllOrders,
  changeOrderStatus
};

// src/app/modules/order/order.controller.ts
import status15 from "http-status";
var createOrder2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const payload = req.body;
    const result = await OrderService.createOrder(user, payload);
    sendResponse(res, {
      httpStatusCode: status15.CREATED,
      success: true,
      message: "Order created successfully",
      data: result
    });
  }
);
var getOwnOrders2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const query = req.query;
    const result = await OrderService.getOwnOrders(user, query);
    sendResponse(res, {
      httpStatusCode: status15.OK,
      success: true,
      message: "Orders retrieved successfully",
      data: result
    });
  }
);
var getAllOrders2 = catchAsync(
  async (req, res) => {
    const rawQuery = req.query;
    const query = {};
    Object.entries(rawQuery).forEach(([rawKey, rawValue]) => {
      const key = rawKey.trim().replace(/\s+/g, "");
      const normalize = (v) => {
        if (typeof v === "string") return v.replace(/^=+/, "").trim();
        return v;
      };
      const values = Array.isArray(rawValue) ? rawValue.map((v) => normalize(v)) : [normalize(rawValue)];
      const existing = query[key];
      if (existing === void 0) {
        query[key] = values.length === 1 ? values[0] : values;
        return;
      }
      if (Array.isArray(existing)) {
        query[key] = [...existing, ...values];
      } else {
        query[key] = [existing, ...values];
      }
    });
    const result = await OrderService.getAllOrders(query);
    sendResponse(res, {
      httpStatusCode: status15.OK,
      success: true,
      message: "Orders retrieved successfully",
      data: result
    });
  }
);
var changeOrderStatus2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const orderId = req.params.orderId;
    const payload = req.body;
    const result = await OrderService.changeOrderStatus(
      user,
      orderId,
      payload
    );
    sendResponse(res, {
      httpStatusCode: status15.OK,
      success: true,
      message: "Order status updated successfully",
      data: result
    });
  }
);
var OrderController = {
  createOrder: createOrder2,
  getOwnOrders: getOwnOrders2,
  getAllOrders: getAllOrders2,
  changeOrderStatus: changeOrderStatus2
};

// src/app/modules/order/order.validation.ts
import z6 from "zod";
var createOrderZodSchema = z6.object({
  body: z6.object({
    productId: z6.string().uuid("Invalid product ID format"),
    quantity: z6.number().int().positive("Quantity must be a positive integer"),
    address: z6.string().min(1, "Address is required"),
    phone: z6.string().min(1, "Phone number is required")
  })
});
var changeOrderStatusZodSchema = z6.object({
  status: z6.enum(["SHIPPED", "DELIVERED", "CANCELLED"], {
    message: "Invalid order status"
  })
});

// src/app/modules/order/order.route.ts
var router7 = Router7();
router7.post("/create-order", validateRequest(createOrderZodSchema), checkAuth(UserRoles.USER, UserRoles.TRAINER), OrderController.createOrder);
router7.get("/user/my-orders", checkAuth(UserRoles.USER, UserRoles.TRAINER), OrderController.getOwnOrders);
router7.get("/", checkAuth(UserRoles.ADMIN), OrderController.getAllOrders);
router7.patch(
  "/update-order-status/:orderId",
  validateRequest(changeOrderStatusZodSchema),
  checkAuth(UserRoles.ADMIN),
  OrderController.changeOrderStatus
);
var OrderRoute = router7;

// src/app/modules/user/user.route.ts
import { Router as Router8 } from "express";

// src/app/modules/user/user.service.ts
import status16 from "http-status";
var getAllUsers = async (user, query) => {
  const isAdmin = user.role === UserRoles.ADMIN;
  if (!isAdmin) {
    throw new AppError_default(status16.FORBIDDEN, "Unauthorized");
  }
  try {
    const searchableFields = ["name", "email"];
    const filterableFields = ["status"];
    const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);
    const { orderBy } = QueryBuilder.getSortOptions(query);
    const { searchConditions } = QueryBuilder.getSearchConditions(query, searchableFields);
    const { filterConditions } = QueryBuilder.getFilterConditions(query, filterableFields);
    const baseConditions = {
      isDeleted: false,
      role: UserRoles.USER
    };
    const andConditions = [baseConditions];
    if (query.name && typeof query.name === "string") {
      andConditions.push({
        name: {
          contains: query.name.trim(),
          mode: "insensitive"
        }
      });
    }
    if (searchConditions.length > 0) {
      andConditions.push({ OR: searchConditions });
    }
    if (Object.keys(filterConditions).length > 0) {
      andConditions.push(filterConditions);
    }
    const whereConditions = { AND: andConditions };
    const users = await prisma.user.findMany({
      where: whereConditions,
      orderBy,
      skip,
      take: limit
    });
    const total = await prisma.user.count({
      where: whereConditions
    });
    return {
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      data: users
    };
  } catch (error) {
    console.log("Error fetching users: ", error);
    throw new AppError_default(status16.INTERNAL_SERVER_ERROR, "Failed to fetch users");
  }
};
var changeUserStatus = async (userId, newStatus) => {
  const isUserExist = await prisma.user.findUnique(
    {
      where: {
        id: userId
      }
    }
  );
  if (!isUserExist) {
    throw new AppError_default(status16.NOT_FOUND, "User not found");
  }
  try {
    const result = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        status: newStatus
      }
    });
    return result;
  } catch (error) {
    console.log("Error changing user status: ", error);
    throw new AppError_default(status16.INTERNAL_SERVER_ERROR, "Failed to change user status");
  }
};
var deleteUser = async (userId) => {
  const isUserExist = await prisma.user.findUnique(
    {
      where: {
        id: userId
      }
    }
  );
  if (!isUserExist) {
    throw new AppError_default(status16.NOT_FOUND, "User not found");
  }
  try {
    const result = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        isDeleted: true
      }
    });
    return result;
  } catch (error) {
    console.log("Error deleting user: ", error);
    throw new AppError_default(status16.INTERNAL_SERVER_ERROR, "Failed to delete user");
  }
};
var UserService = {
  getAllUsers,
  changeUserStatus,
  deleteUser
};

// src/app/modules/user/user.controller.ts
import status17 from "http-status";
var getAllUsers2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const query = req.query;
    const result = await UserService.getAllUsers(user, query);
    sendResponse(res, {
      httpStatusCode: status17.OK,
      success: true,
      message: "Users retrieved successfully",
      data: result.data,
      meta: result.meta
    });
  }
);
var changeUserStatus2 = catchAsync(
  async (req, res) => {
    const { userId } = req.params;
    const newStatus = req.body.status;
    const result = await UserService.changeUserStatus(userId, newStatus);
    sendResponse(res, {
      httpStatusCode: status17.OK,
      success: true,
      message: "User status changed successfully",
      data: result
    });
  }
);
var deleteUser2 = catchAsync(
  async (req, res) => {
    const { userId } = req.params;
    const result = await UserService.deleteUser(userId);
    sendResponse(res, {
      httpStatusCode: status17.OK,
      success: true,
      message: "User deleted successfully",
      data: result
    });
  }
);
var UserControllers = {
  getAllUsers: getAllUsers2,
  changeUserStatus: changeUserStatus2,
  deleteUser: deleteUser2
};

// src/app/modules/user/user.route.ts
var router8 = Router8();
router8.get("/", checkAuth(UserRoles.ADMIN), UserControllers.getAllUsers);
router8.patch("/change-user-status/:userId", checkAuth(UserRoles.ADMIN), UserControllers.changeUserStatus);
router8.delete("/delete-user/:userId", checkAuth(UserRoles.ADMIN), UserControllers.deleteUser);
var UserRoute = router8;

// src/app/modules/payment/payment.route.ts
import { Router as Router9 } from "express";

// src/app/modules/payment/payment.controller.ts
import status19 from "http-status";

// src/app/modules/payment/payment.service.ts
import status18 from "http-status";
var getPurpose = (metadata) => {
  if (metadata?.purpose === PaymentPurpose.TRAINER_BOOKING || metadata?.paymentPurpose === PaymentPurpose.TRAINER_BOOKING) {
    return PaymentPurpose.TRAINER_BOOKING;
  }
  if (metadata?.purpose === PaymentPurpose.PRODUCT_ORDER || metadata?.paymentPurpose === PaymentPurpose.PRODUCT_ORDER) {
    return PaymentPurpose.PRODUCT_ORDER;
  }
  return void 0;
};
var getTransactionId = (paymentIntent, fallbackId) => {
  if (typeof paymentIntent === "string") {
    return paymentIntent;
  }
  if (paymentIntent?.id) {
    return paymentIntent.id;
  }
  return fallbackId;
};
var getAmount = (data) => {
  const rawAmount = data.amount_total ?? data.amount ?? 0;
  return rawAmount / 100;
};
var processTrainerBookingPayment = async (event, data, isSuccessful) => {
  const paymentId = data.metadata?.paymentId;
  const trainerId = data.metadata?.trainerId;
  const slotId = data.metadata?.slotId;
  const userId = data.metadata?.userId;
  if (!paymentId) {
    throw new AppError_default(status18.BAD_REQUEST, "paymentId is required for trainer booking payment");
  }
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId
    }
  });
  if (!payment) {
    throw new AppError_default(status18.NOT_FOUND, "Payment not found");
  }
  const transactionId = getTransactionId(data.payment_intent, data.id);
  const amount = getAmount(data);
  const result = await prisma.$transaction(async (tx) => {
    let bookingSlotId = payment.bookingSlotId;
    let slotIdToBook = slotId;
    if (isSuccessful && !bookingSlotId) {
      if (!trainerId || !slotId || !userId) {
        throw new AppError_default(status18.BAD_REQUEST, "trainerId, slotId and userId are required for trainer booking payment");
      }
      const createdBooking = await tx.bookingSlot.create({
        data: {
          userId,
          trainerId,
          slotId,
          feeAmount: payment.amount,
          paymentStatus: PaymentStatus.SUCCEEDED,
          transactionId
        }
      });
      bookingSlotId = createdBooking.id;
      slotIdToBook = createdBooking.slotId;
    }
    if (isSuccessful && bookingSlotId && !slotIdToBook) {
      const existingBooking = await tx.bookingSlot.findUnique({
        where: {
          id: bookingSlotId
        },
        select: {
          slotId: true
        }
      });
      if (!existingBooking) {
        throw new AppError_default(status18.NOT_FOUND, "Booking slot not found");
      }
      slotIdToBook = existingBooking.slotId;
    }
    const updatedPayment = await tx.payment.update({
      where: {
        id: payment.id
      },
      data: {
        bookingSlotId: bookingSlotId ?? void 0,
        stripeEventId: event.id,
        status: isSuccessful ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
        amount,
        paidAt: isSuccessful ? /* @__PURE__ */ new Date() : null,
        paymentGatewayData: event.data.object,
        ...isSuccessful ? { userId: payment.userId, purpose: PaymentPurpose.TRAINER_BOOKING } : {}
      }
    });
    if (isSuccessful && bookingSlotId) {
      await tx.bookingSlot.update({
        where: {
          id: bookingSlotId
        },
        data: {
          paymentStatus: PaymentStatus.SUCCEEDED,
          transactionId
        }
      });
      await tx.slot.update({
        where: {
          id: slotIdToBook ?? ""
        },
        data: {
          isBooked: true
        }
      });
    }
    return updatedPayment;
  });
  return {
    message: isSuccessful ? "Trainer booking payment processed successfully" : "Trainer booking payment marked as failed",
    data: result
  };
};
var processProductOrderPayment = async (event, data, isSuccessful) => {
  const paymentId = data.metadata?.paymentId;
  const userId = data.metadata?.userId;
  const productId = data.metadata?.productId;
  const quantity = data.metadata?.quantity ? Number(data.metadata.quantity) : void 0;
  const address = data.metadata?.address;
  const phone = data.metadata?.phone;
  const totalAmountMeta = data.metadata?.totalAmount ? Number(data.metadata.totalAmount) : void 0;
  if (!paymentId) {
    throw new AppError_default(status18.BAD_REQUEST, "paymentId is required for product order payment");
  }
  if (isSuccessful && (!userId || !productId || !quantity || !address || !phone || !totalAmountMeta)) {
    throw new AppError_default(
      status18.BAD_REQUEST,
      "userId, productId, quantity, address, phone and totalAmount are required for product order payment"
    );
  }
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId
    }
  });
  if (!payment) {
    throw new AppError_default(status18.NOT_FOUND, "Payment not found");
  }
  const transactionId = getTransactionId(data.payment_intent, data.id);
  const amount = getAmount(data);
  const result = await prisma.$transaction(async (tx) => {
    let orderId = payment.orderId;
    let orderUserId = payment.userId;
    if (isSuccessful && !orderId) {
      const product = await tx.product.findUnique({
        where: {
          id: productId
        },
        select: {
          price: true,
          remainingStock: true
        }
      });
      if (!product) {
        throw new AppError_default(status18.NOT_FOUND, "Product not found");
      }
      if (product.remainingStock < quantity) {
        throw new AppError_default(status18.BAD_REQUEST, "Insufficient stock available");
      }
      const createdOrder = await tx.order.create({
        data: {
          userId,
          productId,
          price: product.price,
          quantity,
          totalAmount: totalAmountMeta,
          address,
          phone,
          status: OrderStatus.PAID,
          transactionId
        }
      });
      orderId = createdOrder.id;
      orderUserId = createdOrder.userId;
      await tx.product.update({
        where: {
          id: productId
        },
        data: {
          remainingStock: {
            decrement: quantity
          }
        }
      });
    }
    const updatedPayment = await tx.payment.update({
      where: {
        id: payment.id
      },
      data: {
        orderId: orderId ?? null,
        stripeEventId: event.id,
        status: isSuccessful ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
        amount,
        paidAt: isSuccessful ? /* @__PURE__ */ new Date() : null,
        paymentGatewayData: event.data.object,
        ...isSuccessful ? { userId: orderUserId, purpose: PaymentPurpose.PRODUCT_ORDER } : {}
      }
    });
    return updatedPayment;
  });
  return {
    message: isSuccessful ? "Product order payment processed successfully" : "Product order payment marked as failed",
    data: result
  };
};
var handlerStripeWebhookEvent = async (event) => {
  const existingPaymentByEvent = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id
    }
  });
  if (existingPaymentByEvent) {
    console.log(`Event ${event.id} already processed. Skipping`);
    return { message: `Event ${event.id} already processed. Skipping` };
  }
  const data = event.data.object;
  const purpose = getPurpose(data.metadata);
  const isSuccessfulEvent = event.type === "checkout.session.completed";
  const isFailedEvent = event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed";
  if (!isSuccessfulEvent && !isFailedEvent) {
    console.log(`Unhandled or ignored event type ${event.type}`);
    return { message: `Unhandled or ignored event type ${event.type}` };
  }
  const paymentId = data.metadata?.paymentId;
  if (paymentId) {
    const paymentCheck = await prisma.payment.findUnique({
      where: { id: paymentId }
    });
    if (paymentCheck && paymentCheck.status === PaymentStatus.SUCCEEDED && isSuccessfulEvent) {
      console.log(`Payment ${paymentId} is already SUCCEEDED. Skipping duplicate process.`);
      return { message: "Payment already processed" };
    }
  }
  if (!purpose) {
    if (data.metadata?.bookingSlotId || data.metadata?.trainerId || data.metadata?.slotId) {
      return processTrainerBookingPayment(event, data, isSuccessfulEvent);
    }
    if (data.metadata?.paymentId || data.metadata?.productId) {
      return processProductOrderPayment(event, data, isSuccessfulEvent);
    }
    console.log(`Payment metadata missing for event ${event.id}`);
    return { message: `Payment metadata missing for event ${event.id}` };
  }
  if (purpose === PaymentPurpose.TRAINER_BOOKING) {
    return processTrainerBookingPayment(event, data, isSuccessfulEvent);
  }
  return processProductOrderPayment(event, data, isSuccessfulEvent);
};
var getPaymentByUserId = async (user, query) => {
  if (!user || !user.userId) {
    return {
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      data: []
    };
  }
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status18.NOT_FOUND, "User not found");
  }
  const searchableFields = [
    "order.product.name",
    "bookingSlot.trainer.user.name"
  ];
  const filterableFields = [
    "purpose",
    "status",
    "bookingSlot.status",
    "order.status"
  ];
  const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);
  const { orderBy } = QueryBuilder.getSortOptions(query);
  const { searchConditions } = QueryBuilder.getSearchConditions(query, searchableFields);
  const { filterConditions } = QueryBuilder.getFilterConditions(query, filterableFields);
  const baseConditions = {
    userId: user.userId,
    status: PaymentStatus.SUCCEEDED
  };
  const andConditions = [baseConditions];
  if (searchConditions.length > 0) {
    andConditions.push({ OR: searchConditions });
  }
  if (Object.keys(filterConditions).length > 0) {
    andConditions.push(filterConditions);
  }
  const whereConditions = { AND: andConditions };
  try {
    const [payments, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy,
        include: {
          order: {
            include: {
              product: {
                select: {
                  name: true
                }
              }
            }
          },
          bookingSlot: {
            include: {
              user: {
                select: {
                  name: true
                }
              },
              trainer: {
                include: {
                  user: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      }),
      prisma.payment.count({
        where: whereConditions
      })
    ]);
    return {
      data: payments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new AppError_default(status18.INTERNAL_SERVER_ERROR, "Error fetching payments", error.message);
  }
};
var PaymentService = {
  getPaymentByUserId
};

// src/app/modules/payment/payment.controller.ts
var handleStripeWebhookEvent = catchAsync(async (req, res) => {
  const rawBody = req.body;
  const event = typeof rawBody === "string" ? JSON.parse(rawBody) : Buffer.isBuffer(rawBody) ? JSON.parse(rawBody.toString("utf8")) : rawBody;
  const result = await handlerStripeWebhookEvent(event);
  const data = "data" in result ? result.data : void 0;
  sendResponse(res, {
    httpStatusCode: status19.OK,
    success: true,
    message: result.message,
    data
  });
});
var getPaymentByUserId2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const query = req.query;
    const result = await PaymentService.getPaymentByUserId(user, query);
    sendResponse(res, {
      httpStatusCode: status19.OK,
      success: true,
      message: "Payments retrieved successfully",
      meta: result.meta,
      data: result.data
    });
  }
);
var PaymentController = {
  handleStripeWebhookEvent,
  getPaymentByUserId: getPaymentByUserId2
};

// src/app/modules/payment/payment.route.ts
var router9 = Router9();
router9.post("/webhook", PaymentController.handleStripeWebhookEvent);
router9.get("/my-payments", checkAuth(UserRoles.USER, UserRoles.TRAINER), PaymentController.getPaymentByUserId);
var PaymentRoute = router9;

// src/app/modules/stats/stats.route.ts
import { Router as Router10 } from "express";

// src/app/modules/stats/stats.service.ts
import status20 from "http-status";
var getDashboardData = async (user) => {
  let statsData;
  switch (user.role) {
    case UserRoles.ADMIN:
      statsData = await getAdminStatsData();
      break;
    case UserRoles.TRAINER:
      statsData = await getTrainerStatsData(user);
      break;
    case UserRoles.USER:
      statsData = await getUserStatsData(user);
      break;
    default:
      throw new AppError_default(status20.BAD_REQUEST, "Invalid user role");
  }
  return statsData;
};
var getAdminStatsData = async () => {
  const userCount = await prisma.user.count();
  const trainerCount = await prisma.trainerProfile.count();
  const productCount = await prisma.product.count();
  const bookingSlotCount = await prisma.bookingSlot.count();
  const orderCount = await prisma.order.count();
  const reviewCount = await prisma.review.count();
  const paymentCount = await prisma.payment.count();
  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true
    },
    where: {
      status: PaymentStatus.SUCCEEDED
    }
  });
  const pieChartData = await getPieChartData();
  const barChartData = await getBarChartData();
  return {
    userCount,
    trainerCount,
    productCount,
    bookingSlotCount,
    orderCount,
    reviewCount,
    paymentCount,
    totalRevenue: totalRevenue._sum.amount || 0,
    pieChartData,
    barChartData
  };
};
var getTrainerStatsData = async (user) => {
  const trainerProfile = await prisma.trainerProfile.findUnique({
    where: {
      userId: user.userId
    }
  });
  if (!trainerProfile) {
    throw new AppError_default(status20.NOT_FOUND, "Trainer profile not found");
  }
  const availableSlotCount = await prisma.slot.count({
    where: {
      trainerId: trainerProfile.id,
      isBooked: false
    }
  });
  const bookingCount = await prisma.bookingSlot.count({
    where: {
      trainerId: trainerProfile.id
    }
  });
  const myReceivedReviewCount = await prisma.review.count({
    where: {
      trainerId: trainerProfile.id
    }
  });
  return {
    availableSlotCount,
    bookingCount,
    myReceivedReviewCount
  };
};
var getUserStatsData = async (user) => {
  const userProfile = await prisma.user.findUnique(
    {
      where: {
        id: user.userId
      }
    }
  );
  if (!userProfile) {
    throw new AppError_default(status20.NOT_FOUND, "User not found");
  }
  const myBookingCount = await prisma.bookingSlot.count({
    where: {
      userId: user.userId
    }
  });
  const myOrderCount = await prisma.order.count({
    where: {
      userId: user.userId
    }
  });
  const myGivenReviewCount = await prisma.review.count({
    where: {
      userId: user.userId
    }
  });
  const myTotalSpentAmount = await prisma.payment.aggregate({
    _sum: {
      amount: true
    },
    where: {
      userId: user.userId,
      status: PaymentStatus.SUCCEEDED
    }
  });
  return {
    myBookingCount,
    myOrderCount,
    myGivenReviewCount,
    myTotalSpentAmount: myTotalSpentAmount._sum.amount || 0
  };
};
var getPieChartData = async () => {
  const bookingStatusDistribution = await prisma.bookingSlot.groupBy({
    by: ["status"],
    _count: {
      id: true
    }
  });
  return bookingStatusDistribution.map(({ _count, status: status25 }) => ({
    status: status25,
    count: _count.id
  }));
};
var getBarChartData = async () => {
  const bookingByMonth = await prisma.$queryRaw`
    SELECT DATE_TRUNC('month', "createdAt") AS "month",
           CAST(COUNT(*) AS INTEGER) AS "count"
    FROM "booking_slots"
    GROUP BY "month"
    ORDER BY "month" ASC
  `;
  return bookingByMonth;
};
var getCommonStatsData = async () => {
  const userCount = await prisma.user.count();
  const trainerCount = await prisma.trainerProfile.count();
  const productCount = await prisma.product.count();
  const reviewCount = await prisma.review.count();
  return {
    userCount,
    trainerCount,
    productCount,
    reviewCount
  };
};
var StatsService = {
  getDashboardData,
  getPieChartData,
  getBarChartData,
  getCommonStatsData
};

// src/app/modules/stats/stats.controller.ts
var getDashboardData2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const result = await StatsService.getDashboardData(user);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Dashboard data retrieved successfully",
      data: result
    });
  }
);
var getCommonStatsData2 = catchAsync(
  async (req, res) => {
    const result = await StatsService.getCommonStatsData();
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Dashboard data retrieved successfully",
      data: result
    });
  }
);
var StatsController = {
  getDashboardData: getDashboardData2,
  getCommonStatsData: getCommonStatsData2
};

// src/app/modules/stats/stats.route.ts
var router10 = Router10();
router10.get("/", checkAuth(UserRoles.USER, UserRoles.TRAINER, UserRoles.ADMIN), StatsController.getDashboardData);
router10.get("/common-stats", StatsController.getCommonStatsData);
var StatsRoute = router10;

// src/app/modules/myProfile/myProfile.route.ts
import { Router as Router11 } from "express";

// src/app/modules/myProfile/myProfile.service.ts
var editMyProfile = async (user, payload) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });
  if (!isUserExists) {
    throw new Error("User not found");
  }
  const { name, image } = payload;
  await prisma.user.update({
    where: {
      id: user.userId
    },
    data: {
      name,
      image
    }
  });
};
var myProfileService = {
  editMyProfile
};

// src/app/modules/myProfile/myProfile.controller.ts
import status21 from "http-status";
var editMyProfile2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const payload = req.body;
    const result = await myProfileService.editMyProfile(user, payload);
    sendResponse(res, {
      httpStatusCode: status21.OK,
      success: true,
      message: "Profile updated successfully",
      data: result
    });
  }
);
var myProfileController = {
  editMyProfile: editMyProfile2
};

// src/app/modules/myProfile/myProfile.validation.ts
import z7 from "zod";
var EditMyProfileZodSchema = z7.object({
  body: z7.object({
    name: z7.string().optional(),
    image: z7.string().optional(),
    roleData: z7.object({
      bio: z7.string().optional()
    }).optional()
  })
});

// src/app/modules/myProfile/myProfile.route.ts
var router11 = Router11();
router11.patch("/edit-my-profile", validateRequest(EditMyProfileZodSchema), checkAuth(UserRoles.USER, UserRoles.TRAINER, UserRoles.ADMIN), myProfileController.editMyProfile);
var MyProfileRoute = router11;

// src/app/routes/index.ts
var router12 = Router12();
router12.use("/products", ProductRouters);
router12.use("/auth", AuthRoutes);
router12.use("/trainer-profiles", TrainerProfileRoute);
router12.use("/slots", SlotRoute);
router12.use("/reviews", TrainerReviewRoute);
router12.use("/bookings", BookingRoute);
router12.use("/orders", OrderRoute);
router12.use("/users", UserRoute);
router12.use("/payments", PaymentRoute);
router12.use("/stats", StatsRoute);
router12.use("/my-profile", MyProfileRoute);
var IndexRouters = router12;

// src/app/middleware/notFound.ts
import status22 from "http-status";
var notFound = (req, res) => {
  res.status(status22.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} Not Found`
  });
};

// src/app/middleware/globalErrorHandler.ts
import status24 from "http-status";
import z8 from "zod";

// src/app/errorHelpers/handleZodError.ts
import status23 from "http-status";
var handleZodError = (err) => {
  const statusCode = status23.BAD_REQUEST;
  const message = "Zod Validation Error";
  const errorSources = [];
  err.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join(" => "),
      message: issue.message
    });
  });
  return {
    success: false,
    message,
    errorSources,
    statusCode
  };
};

// src/app/middleware/globalErrorHandler.ts
var globalErrorHandler = async (err, req, res, next) => {
  if (envVars.NODE_ENV === "development") {
    console.log("Error from Global Error Handler", err);
  }
  let errorSources = [];
  let statusCode = status24.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let stack = void 0;
  if (err instanceof z8.ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof AppError_default) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  } else if (err instanceof Error) {
    statusCode = status24.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  }
  const errorResponse = {
    success: false,
    message,
    errorSources,
    error: envVars.NODE_ENV === "development" ? err : void 0,
    stack: envVars.NODE_ENV === "development" ? stack : void 0
  };
  res.status(statusCode).json(errorResponse);
};

// src/app.ts
import cors from "cors";
var app = express();
app.use(express.urlencoded({ extended: true }));
app.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhookEvent);
app.use(cors({
  origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, "http://localhost:3000", "http://localhost:5000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", IndexRouters);
app.get("/", (req, res) => {
  res.send("Hello, TypeScript + Express!");
});
app.use(notFound);
app.use(globalErrorHandler);
var app_default = app;

// src/app/utils/seed.ts
var seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "123456Aa";
  try {
    const isAdminExist = await prisma.user.findFirst({
      where: {
        email: adminEmail,
        role: UserRoles.ADMIN
      }
    });
    if (isAdminExist) {
      console.log("Admin already exists. Skipping admin seeding.");
      return;
    }
    const adminUser = await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: "Admin",
        role: UserRoles.ADMIN
      }
    });
    if (adminUser.user) {
      await prisma.user.update({
        where: {
          id: adminUser.user.id
        },
        data: {
          emailVerified: true
        }
      });
    }
    const seededAdmin = await prisma.user.findFirst({
      where: {
        email: adminEmail,
        role: UserRoles.ADMIN
      }
    });
    console.log("Admin created", seededAdmin);
  } catch (error) {
    console.error("Error seeding admin: ", error);
  }
};

// src/server.ts
var bootstrap = async () => {
  try {
    await seedAdmin();
    app_default.listen(5e3, () => {
      console.log(`The server is running on port: 5000`);
    });
  } catch (error) {
    console.log(`Failed to start the server`);
  }
};
bootstrap();
