-- CreateEnum
CREATE TYPE "StatutReservation" AS ENUM ('CONFIRMEE', 'ANNULEE', 'HONOREE');

-- CreateTable
CREATE TABLE "creneaux_disponibles" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "recurrent" BOOLEAN NOT NULL DEFAULT true,
    "jourSemaine" "JourSemaine",
    "date" TIMESTAMP(3),
    "heureDebut" TEXT NOT NULL,
    "heureFin" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creneaux_disponibles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "creneauId" TEXT,
    "dateHeure" TIMESTAMP(3) NOT NULL,
    "statut" "StatutReservation" NOT NULL DEFAULT 'CONFIRMEE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "creneaux_disponibles" ADD CONSTRAINT "creneaux_disponibles_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_creneauId_fkey" FOREIGN KEY ("creneauId") REFERENCES "creneaux_disponibles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
