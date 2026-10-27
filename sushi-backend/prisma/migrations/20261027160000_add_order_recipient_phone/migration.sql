-- Existing accounts and historical orders have no phone number yet.
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "Order" ADD COLUMN "recipientPhone" TEXT;
