/**
 * Money is integer paise everywhere (₹1 = 100 paise). Formatting uses Indian digit grouping
 * (₹1,49,999) and is done by hand so it is identical on Hermes, the web and in tests.
 */
function groupIndian(rupees: number): string {
  const digits = String(rupees);
  if (digits.length <= 3) return digits;
  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${rest},${lastThree}`;
}

/** 1499900 → "₹14,999"; 1050 → "₹10.50"; 0 → "₹0". */
export function formatInr(paise: number): string {
  const sign = paise < 0 ? '-' : '';
  const abs = Math.abs(Math.round(paise));
  const rupees = Math.floor(abs / 100);
  const rest = abs % 100;
  const fraction = rest === 0 ? '' : `.${String(rest).padStart(2, '0')}`;
  return `${sign}₹${groupIndian(rupees)}${fraction}`;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/** Whole-number percentage off the original price, or null when there is no discount to show. */
export function discountPercent(originalPaise: number | null, pricePaise: number): number | null {
  if (originalPaise === null || originalPaise <= 0 || pricePaise >= originalPaise) return null;
  return Math.round(((originalPaise - pricePaise) / originalPaise) * 100);
}
