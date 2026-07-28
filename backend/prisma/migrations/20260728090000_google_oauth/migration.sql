-- AlterTable: motDePasseHash devient optionnel (Google OAuth remplace l'authentification
-- par mot de passe) ; ajout de googleId (unique) et avatarUrl.
ALTER TABLE "coaches" ALTER COLUMN "motDePasseHash" DROP NOT NULL;
ALTER TABLE "coaches" ADD COLUMN "googleId" TEXT;
ALTER TABLE "coaches" ADD COLUMN "avatarUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "coaches_googleId_key" ON "coaches"("googleId");
