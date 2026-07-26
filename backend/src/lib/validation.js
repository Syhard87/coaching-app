export function validateEnum(value, enumObj, fieldName) {
  if (value === undefined || value === null) return;
  if (!Object.values(enumObj).includes(value)) {
    const err = new Error(`Valeur invalide pour ${fieldName} : ${value}`);
    err.status = 400;
    throw err;
  }
}
