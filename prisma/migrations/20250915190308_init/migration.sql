-- CreateEnum
CREATE TYPE "ClassificationType" AS ENUM ('TAG', 'TOPIC', 'SECTION', 'REGION', 'DEPARTMENT');

-- CreateTable
CREATE TABLE "Assistant" (
    "id" TEXT NOT NULL,
    "assistant_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assistant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Party" (
    "id" SERIAL NOT NULL,
    "party_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isCommons" BOOLEAN NOT NULL DEFAULT false,
    "isLords" BOOLEAN NOT NULL DEFAULT false,
    "isIndependent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classification_items" (
    "id" SERIAL NOT NULL,
    "externalId" INTEGER NOT NULL,
    "type" "ClassificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "classification_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Assistant_assistant_id_key" ON "Assistant"("assistant_id");

-- CreateIndex
CREATE UNIQUE INDEX "Party_party_id_key" ON "Party"("party_id");

-- CreateIndex
CREATE UNIQUE INDEX "classification_items_externalId_key" ON "classification_items"("externalId");

-- CreateIndex
CREATE INDEX "classification_items_type_idx" ON "classification_items"("type");
