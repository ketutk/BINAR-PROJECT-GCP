-- AlterTable
ALTER TABLE "flights" ALTER COLUMN "departureAt" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "arriveAt" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "return_arriveAt" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "return_departureAt" SET DATA TYPE TIMESTAMPTZ;
