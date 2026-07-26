-- CreateEnum
CREATE TYPE "Sexe" AS ENUM ('HOMME', 'FEMME');

-- CreateEnum
CREATE TYPE "ObjectifClient" AS ENUM ('PRISE_DE_MASSE', 'PERTE_DE_POIDS', 'REMISE_EN_FORME', 'PERFORMANCE');

-- CreateEnum
CREATE TYPE "NiveauActivite" AS ENUM ('SEDENTAIRE', 'LEGEREMENT_ACTIF', 'MODEREMENT_ACTIF', 'TRES_ACTIF', 'EXTREMEMENT_ACTIF');

-- CreateEnum
CREATE TYPE "HoraireTravail" AS ENUM ('BUREAU', 'POSTE_3X8', 'IRREGULIER', 'AUTRE');

-- CreateEnum
CREATE TYPE "ExperienceSportive" AS ENUM ('DEBUTANT', 'INTERMEDIAIRE', 'CONFIRME');

-- CreateEnum
CREATE TYPE "JourSemaine" AS ENUM ('LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE');

-- CreateEnum
CREATE TYPE "Creneau" AS ENUM ('MATIN', 'MIDI', 'SOIR');

-- CreateEnum
CREATE TYPE "TypeSplit" AS ENUM ('FULL_BODY', 'HALF_BODY', 'PPL', 'BRO_SPLIT', 'PERSONNALISE');

-- CreateEnum
CREATE TYPE "StatutSemaine" AS ENUM ('NORMALE', 'DELOAD', 'TEST');

-- CreateEnum
CREATE TYPE "MethodeCalcul" AS ENUM ('AUTO', 'MANUEL');

-- CreateEnum
CREATE TYPE "TypeObjectifCalorique" AS ENUM ('DEFICIT_LEGER', 'DEFICIT_MODERE', 'SURPLUS_LEGER', 'SURPLUS_MODERE', 'MAINTIEN');

-- CreateTable
CREATE TABLE "coaches" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasseHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coaches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "age" INTEGER,
    "sexe" "Sexe",
    "tailleCm" DOUBLE PRECISION,
    "poidsInitial" DOUBLE PRECISION,
    "objectif" "ObjectifClient" NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notesSante" TEXT,
    "suiviMedical" BOOLEAN NOT NULL DEFAULT false,
    "niveauActivite" "NiveauActivite",
    "profession" TEXT,
    "horaireTravail" "HoraireTravail",
    "experienceSportive" "ExperienceSportive",
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilites" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "jourSemaine" "JourSemaine" NOT NULL,
    "creneau" "Creneau" NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "disponibilites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programmes" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "typeSplit" "TypeSplit" NOT NULL,
    "frequence" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programmes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cycles" (
    "id" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "dureeSemaines" INTEGER NOT NULL,

    CONSTRAINT "cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semaines_planifiees" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "numeroSemaine" INTEGER NOT NULL,
    "statut" "StatutSemaine" NOT NULL DEFAULT 'NORMALE',
    "notes" TEXT,

    CONSTRAINT "semaines_planifiees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jours_entrainement" (
    "id" TEXT NOT NULL,
    "programmeId" TEXT,
    "semaineId" TEXT,
    "nom" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,

    CONSTRAINT "jours_entrainement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercices_programme" (
    "id" TEXT NOT NULL,
    "jourId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "series" INTEGER NOT NULL,
    "reps" TEXT NOT NULL,
    "chargeCible" DOUBLE PRECISION,
    "tempsRepos" INTEGER,
    "notes" TEXT,
    "lienVideo" TEXT,

    CONSTRAINT "exercices_programme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seances" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "jourId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ressenti" INTEGER,
    "notes" TEXT,

    CONSTRAINT "seances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercices_realises" (
    "id" TEXT NOT NULL,
    "seanceId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "chargeRealisee" DOUBLE PRECISION,
    "repsRealisees" TEXT,
    "notes" TEXT,

    CONSTRAINT "exercices_realises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objectifs_diete" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "methodeCalcul" "MethodeCalcul" NOT NULL DEFAULT 'AUTO',
    "tdeeCalcule" DOUBLE PRECISION,
    "typeObjectifCalorique" "TypeObjectifCalorique",
    "caloriesCible" INTEGER NOT NULL,
    "proteinesCible" INTEGER NOT NULL,
    "glucidesCible" INTEGER NOT NULL,
    "lipidesCible" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "objectifs_diete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_diete" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calories" INTEGER,
    "proteines" INTEGER,
    "glucides" INTEGER,
    "lipides" INTEGER,
    "eau" DOUBLE PRECISION,
    "repas" TEXT,
    "notes" TEXT,

    CONSTRAINT "journal_diete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesures" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "poids" DOUBLE PRECISION,
    "bras" DOUBLE PRECISION,
    "taille" DOUBLE PRECISION,
    "poitrine" DOUBLE PRECISION,
    "cuisse" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "mesures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates_programme" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "typeSplit" "TypeSplit" NOT NULL,
    "contenuJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "templates_programme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coaches_email_key" ON "coaches"("email");

-- CreateIndex
CREATE UNIQUE INDEX "disponibilites_clientId_jourSemaine_creneau_key" ON "disponibilites"("clientId", "jourSemaine", "creneau");

-- CreateIndex
CREATE UNIQUE INDEX "objectifs_diete_clientId_key" ON "objectifs_diete"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "journal_diete_clientId_date_key" ON "journal_diete"("clientId", "date");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilites" ADD CONSTRAINT "disponibilites_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programmes" ADD CONSTRAINT "programmes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cycles" ADD CONSTRAINT "cycles_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semaines_planifiees" ADD CONSTRAINT "semaines_planifiees_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jours_entrainement" ADD CONSTRAINT "jours_entrainement_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jours_entrainement" ADD CONSTRAINT "jours_entrainement_semaineId_fkey" FOREIGN KEY ("semaineId") REFERENCES "semaines_planifiees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercices_programme" ADD CONSTRAINT "exercices_programme_jourId_fkey" FOREIGN KEY ("jourId") REFERENCES "jours_entrainement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seances" ADD CONSTRAINT "seances_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seances" ADD CONSTRAINT "seances_jourId_fkey" FOREIGN KEY ("jourId") REFERENCES "jours_entrainement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercices_realises" ADD CONSTRAINT "exercices_realises_seanceId_fkey" FOREIGN KEY ("seanceId") REFERENCES "seances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objectifs_diete" ADD CONSTRAINT "objectifs_diete_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_diete" ADD CONSTRAINT "journal_diete_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesures" ADD CONSTRAINT "mesures_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templates_programme" ADD CONSTRAINT "templates_programme_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
