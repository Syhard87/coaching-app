-- CreateEnum
CREATE TYPE "StatutProspect" AS ENUM ('NOUVEAU', 'CONTACTE', 'CONVERTI', 'PERDU');

-- AlterTable coaches: add slug as nullable first, backfill, then enforce NOT NULL + unique.
ALTER TABLE "coaches" ADD COLUMN "slug" TEXT;

-- Pas d'extension `unaccent` requise : les caractères accentués ne matchent pas [a-z0-9]
-- et sont donc simplement remplacés par un tiret, comme n'importe quel autre séparateur.
UPDATE "coaches"
SET "slug" = trim(BOTH '-' FROM regexp_replace(lower("nom"), '[^a-z0-9]+', '-', 'g')) || '-' || substr("id", 1, 6)
WHERE "slug" IS NULL;

ALTER TABLE "coaches" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "coaches_slug_key" ON "coaches"("slug");

-- CreateTable
CREATE TABLE "prospects" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "objectif" TEXT,
    "message" TEXT,
    "statut" "StatutProspect" NOT NULL DEFAULT 'NOUVEAU',
    "clientId" TEXT,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prospects_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
