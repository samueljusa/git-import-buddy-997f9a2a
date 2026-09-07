/**
 * Frais de paiement SwyChr ajoutés au montant converti.
 *
 * Le montant affiché au client = conversion exacte EUR → devise locale
 * + ces frais, pour que le total corresponde (au plus près) à ce que
 * SwyChr prélève réellement sur sa page de paiement.
 *
 * SwyChr ajoute actuellement 2,5 % lorsque `pass_digital_charge` est activé.
 */

/** Pourcentage ajouté par SwyChr (0.025 = 2,5 %). */
export const FEE_PERCENT = 0.025;

/** Frais fixes ajoutés, exprimés en devise locale (0 = aucun). */
export const FEE_FIXED_LOCAL = 0;

export type FeeBreakdown = {
  /** Montant converti sans frais. */
  base: number;
  /** Part de frais ajoutée. */
  fee: number;
  /** Total à payer par le client (base + fee). */
  total: number;
};

/**
 * Ajoute les frais au montant converti.
 * @param amount montant converti en devise locale
 * @param zeroDecimal devise sans centimes (XAF, XOF…) → arrondi à l'entier
 */
export function addPaymentFees(amount: number, zeroDecimal: boolean): FeeBreakdown {
  const rawFee = amount * FEE_PERCENT + FEE_FIXED_LOCAL;
  const round = (v: number) => (zeroDecimal ? Math.round(v) : Math.round(v * 100) / 100);
  const fee = round(rawFee);
  return { base: amount, fee, total: round(amount + fee) };
}
