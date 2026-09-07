/**
 * Pays africains pris en charge par SwyChr / AccountPe (18 pays)
 * et devise locale associée. Module client-safe (aucun secret).
 */
export type SupportedCountry = {
  code: string;
  name: string;
  currency: string;
  /** Indicatif téléphonique international (sans le « + »). */
  dialCode: string;
  /** Devises sans sous-unité : le montant envoyé doit être entier. */
  zeroDecimal: boolean;
};

export const SUPPORTED_COUNTRIES: SupportedCountry[] = [
  { code: "BJ", name: "Bénin", currency: "XOF", dialCode: "229", zeroDecimal: true },
  { code: "BF", name: "Burkina Faso", currency: "XOF", dialCode: "226", zeroDecimal: true },
  { code: "CM", name: "Cameroun", currency: "XAF", dialCode: "237", zeroDecimal: true },
  { code: "CF", name: "République centrafricaine", currency: "XAF", dialCode: "236", zeroDecimal: true },
  { code: "TD", name: "Tchad", currency: "XAF", dialCode: "235", zeroDecimal: true },
  { code: "CG", name: "Congo-Brazzaville", currency: "XAF", dialCode: "242", zeroDecimal: true },
  { code: "CD", name: "République démocratique du Congo", currency: "CDF", dialCode: "243", zeroDecimal: true },
  { code: "CI", name: "Côte d'Ivoire", currency: "XOF", dialCode: "225", zeroDecimal: true },
  { code: "GA", name: "Gabon", currency: "XAF", dialCode: "241", zeroDecimal: true },
  { code: "GH", name: "Ghana", currency: "GHS", dialCode: "233", zeroDecimal: false },
  { code: "GN", name: "Guinée", currency: "GNF", dialCode: "224", zeroDecimal: true },
  { code: "KE", name: "Kenya", currency: "KES", dialCode: "254", zeroDecimal: false },
  { code: "ML", name: "Mali", currency: "XOF", dialCode: "223", zeroDecimal: true },
  { code: "NE", name: "Niger", currency: "XOF", dialCode: "227", zeroDecimal: true },
  { code: "NG", name: "Nigeria", currency: "NGN", dialCode: "234", zeroDecimal: false },
  { code: "RW", name: "Rwanda", currency: "RWF", dialCode: "250", zeroDecimal: true },
  { code: "SN", name: "Sénégal", currency: "XOF", dialCode: "221", zeroDecimal: true },
  { code: "TG", name: "Togo", currency: "XOF", dialCode: "228", zeroDecimal: true },
];

/**
 * Normalise un numéro local au format international attendu par le
 * prestataire : enlève le zéro initial éventuel et ajoute l'indicatif pays
 * s'il n'y figure pas déjà (ex. RDC : 0974616738 → 243974616738).
 */
export function toInternationalMobile(countryCode: string, raw: string): string {
  const country = findCountry(countryCode);
  let digits = raw.replace(/\D/g, "");
  if (!country) return digits;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith(country.dialCode)) return digits;
  digits = digits.replace(/^0+/, "");
  return `${country.dialCode}${digits}`;
}

export function findCountry(code: string): SupportedCountry | undefined {
  return SUPPORTED_COUNTRIES.find((c) => c.code === code.toUpperCase());
}

export function formatLocalAmount(amount: number, currency: string): string {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(amount)} ${currency}`;
}

/**
 * Préfixes réels par opérateur, quand l'API renvoie un format générique
 * identique pour tous les opérateurs d'un pays (cas de la RDC).
 */
const OPERATOR_PREFIXES: Record<string, { match: string[]; prefixes: string[] }[]> = {
  CD: [
    { match: ["airtel"], prefixes: ["99", "97", "98"] },
    { match: ["vodacom", "mpesa", "m-pesa"], prefixes: ["81", "82", "83"] },
    { match: ["orange"], prefixes: ["84", "85", "89"] },
    { match: ["africell", "afrimoney"], prefixes: ["90"] },
  ],
};

/** Préfixes attendus pour un opérateur donné, ou `null` si non spécifié. */
export function operatorPrefixes(countryCode: string, methodLabel: string): string[] | null {
  const rules = OPERATOR_PREFIXES[countryCode.toUpperCase()];
  if (!rules) return null;
  const label = methodLabel.toLowerCase();
  const rule = rules.find((r) => r.match.some((m) => label.includes(m)));
  return rule ? rule.prefixes : null;
}

/**
 * Exemple de numéro affiché : on remplace le préfixe générique renvoyé par
 * l'API par le vrai préfixe de l'opérateur (ex : 99XXXXXXX pour Airtel RDC).
 */
export function formatHint(
  countryCode: string,
  methodLabel: string,
  mobileFormat: string | null,
  length: number | null,
): string | null {
  const prefixes = operatorPrefixes(countryCode, methodLabel);
  const size = length ?? (mobileFormat ? mobileFormat.replace(/[^0-9Xx]/g, "").length : null);
  if (!prefixes || prefixes.length === 0 || !size) return mobileFormat;
  const p = prefixes[0]!;
  return `${p}${"X".repeat(Math.max(0, size - p.length))}`;
}


