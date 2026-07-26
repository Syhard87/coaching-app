import { prisma } from './prisma.js';

// Vérifie qu'un programme (et ses sous-ressources) appartient bien au coach connecté,
// en remontant la chaîne jusqu'à client.coachId. Retourne null si absent ou non autorisé.

export async function getOwnedProgramme(coachId, programmeId) {
  const programme = await prisma.programme.findUnique({
    where: { id: programmeId },
    include: { client: true },
  });
  if (!programme || programme.client.coachId !== coachId) return null;
  return programme;
}

export async function getOwnedCycle(coachId, cycleId) {
  const cycle = await prisma.cycle.findUnique({
    where: { id: cycleId },
    include: { programme: { include: { client: true } } },
  });
  if (!cycle || cycle.programme.client.coachId !== coachId) return null;
  return cycle;
}

export async function getOwnedSemaine(coachId, semaineId) {
  const semaine = await prisma.semainePlanifiee.findUnique({
    where: { id: semaineId },
    include: { cycle: { include: { programme: { include: { client: true } } } } },
  });
  if (!semaine || semaine.cycle.programme.client.coachId !== coachId) return null;
  return semaine;
}

export async function getOwnedJournalEntry(coachId, entryId) {
  const entry = await prisma.journalDiete.findUnique({ where: { id: entryId }, include: { client: true } });
  if (!entry || entry.client.coachId !== coachId) return null;
  return entry;
}

export async function getOwnedMesure(coachId, mesureId) {
  const mesure = await prisma.mesure.findUnique({ where: { id: mesureId }, include: { client: true } });
  if (!mesure || mesure.client.coachId !== coachId) return null;
  return mesure;
}
