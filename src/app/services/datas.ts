/**
 * Converte a data vinda dos formulários (ex.: "2026-12-31" ou ISO completo)
 * para ISO, como o FestaSim fazia ao gravar no Firestore. Vazio vira undefined.
 */
export function paraIsoOuUndefined(valor?: string | null): string | undefined {
  if (!valor) {
    return undefined;
  }
  const data = new Date(valor);
  return isNaN(data.getTime()) ? undefined : data.toISOString();
}
