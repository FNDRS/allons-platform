import { apiFetch, downloadFile } from "./client";
import type { CatalogPackageKind } from "./classCatalog";

export interface ClassSalesTotals {
  count: number;
  refunds: number;
  amountCents: number;
  feesCents: number;
  netCents: number;
}

export interface ClassFinance {
  from: string;
  to: string;
  totals: ClassSalesTotals;
  byKind: Array<{ kind: CatalogPackageKind; count: number; amountCents: number }>;
  /** `month` is `YYYY-MM`. */
  byMonth: Array<{ month: string; amountCents: number; netCents: number }>;
  topPackages: Array<{ packageId: string; name: string; count: number; amountCents: number }>;
  memberships: {
    active: number;
    pastDue: number;
    monthlyRecurringCents: number;
    pendingInstallmentsCents: number;
  };
  outstandingCredits: { credits: number; holders: number };
}

export interface ClassSale {
  id: string;
  /** `R-YYYYMM-XXXXXX`. */
  receiptNumber: string;
  createdAt: string;
  status: "paid" | "refunded";
  customer: { userId: string; name: string; email: null };
  item: {
    packageId: string;
    name: string;
    kind: CatalogPackageKind;
    programTitle: string | null;
    installment: { number: number; total: number } | null;
  };
  paymentMethod: string | null;
  authorization: string | null;
  amountCents: number;
  feesCents: number;
  netCents: number;
}

export interface ClassSales {
  from: string;
  to: string;
  totals: ClassSalesTotals;
  sales: ClassSale[];
}

export interface DateRange {
  /** `YYYY-MM-DD`, inclusive. */
  from: string;
  to: string;
}

export const classFinanceKeys = {
  all: ["provider", "class-finance"] as const,
  summary: (range: DateRange) => ["provider", "class-finance", "summary", range] as const,
  sales: (range: DateRange) => ["provider", "class-finance", "sales", range] as const,
};

const query = (range: DateRange) => new URLSearchParams({ ...range }).toString();

export const getClassFinance = (range: DateRange) =>
  apiFetch<ClassFinance>(`/provider/class-finance?${query(range)}`);

export const listClassSales = (range: DateRange) =>
  apiFetch<ClassSales>(`/provider/class-sales?${query(range)}`);

/** CSV for the accountant, with customer emails. */
export const downloadClassSalesCsv = (range: DateRange) =>
  downloadFile(
    `/provider/class-sales.csv?${query(range)}`,
    `ventas-clases-${range.from}-a-${range.to}.csv`,
  );

/** Internal sale receipt (comprobante), not a fiscal invoice. */
export const downloadClassSaleReceipt = (sale: Pick<ClassSale, "id" | "receiptNumber">) =>
  downloadFile(
    `/provider/class-sales/${encodeURIComponent(sale.id)}/receipt.pdf`,
    `comprobante-${sale.receiptNumber}.pdf`,
  );
