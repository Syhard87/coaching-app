-- CreateEnum
CREATE TYPE "ModuleAbonnement" AS ENUM ('SPORT', 'DIETE', 'PACK_COMPLET');

-- CreateTable
CREATE TABLE "catalogue_abonnements" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "module" "ModuleAbonnement" NOT NULL,
    "dureeMois" INTEGER NOT NULL,
    "prixTotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogue_abonnements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_abonnements" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "catalogueAbonnementId" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_abonnements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "catalogue_abonnements" ADD CONSTRAINT "catalogue_abonnements_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_abonnements" ADD CONSTRAINT "client_abonnements_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_abonnements" ADD CONSTRAINT "client_abonnements_catalogueAbonnementId_fkey" FOREIGN KEY ("catalogueAbonnementId") REFERENCES "catalogue_abonnements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
