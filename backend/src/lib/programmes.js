export const PROGRAMME_INCLUDE = {
  jours: { orderBy: { ordre: 'asc' }, include: { exercices: true } },
  cycles: { orderBy: { ordre: 'asc' }, include: { semaines: { orderBy: { numeroSemaine: 'asc' } } } },
};

function joursCreateInput(jours = []) {
  return jours.map((j, idx) => ({
    nom: j.nom,
    ordre: j.ordre ?? idx,
    exercices: {
      create: (j.exercices || []).map((e) => ({
        nom: e.nom,
        series: e.series,
        reps: e.reps,
        chargeCible: e.chargeCible ?? null,
        tempsRepos: e.tempsRepos ?? null,
        notes: e.notes ?? null,
        lienVideo: e.lienVideo ?? null,
      })),
    },
  }));
}

export function validateJours(jours) {
  if (jours === undefined) return;
  if (!Array.isArray(jours)) {
    const err = new Error('jours doit être un tableau');
    err.status = 400;
    throw err;
  }
  for (const jour of jours) {
    if (!jour.nom) {
      const err = new Error('Chaque jour doit avoir un nom');
      err.status = 400;
      throw err;
    }
    for (const exo of jour.exercices || []) {
      if (!exo.nom || !exo.series || !exo.reps) {
        const err = new Error('Chaque exercice doit avoir nom, series et reps');
        err.status = 400;
        throw err;
      }
    }
  }
}

export async function createProgrammeForClient(prisma, clientId, { nom, typeSplit, frequence, jours }) {
  return prisma.programme.create({
    data: { nom, typeSplit, frequence, clientId, jours: { create: joursCreateInput(jours) } },
    include: PROGRAMME_INCLUDE,
  });
}

export async function replaceProgrammeJours(prisma, programmeId, jours) {
  return prisma.$transaction(async (tx) => {
    await tx.jourEntrainement.deleteMany({ where: { programmeId } });
    await tx.programme.update({
      where: { id: programmeId },
      data: { jours: { create: joursCreateInput(jours) } },
    });
    return tx.programme.findUnique({ where: { id: programmeId }, include: PROGRAMME_INCLUDE });
  });
}
