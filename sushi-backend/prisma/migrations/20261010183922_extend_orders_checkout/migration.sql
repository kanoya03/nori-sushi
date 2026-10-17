-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD_ON_DELIVERY');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "comment" TEXT,
ADD COLUMN     "deliveryFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CARD_ON_DELIVERY',
ADD COLUMN     "subtotal" INTEGER NOT NULL DEFAULT 0;
