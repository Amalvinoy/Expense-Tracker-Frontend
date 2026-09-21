export type LendingStatus = 'PENDING' | 'PARTIALLY_PAID' | 'FULLY_PAID';

export interface Repayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}

export interface Lending {
  id: string;
  userId: string;
  personName: string;
  amount: number;
  amountReturned: number;
  remainingAmount: number;
  date: string;
  note?: string;
  status: LendingStatus;
  repayments: Repayment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLendingPayload {
  personName: string;
  amount: number;
  date?: string;
  note?: string;
}

export interface UpdateLendingPayload {
  personName?: string;
  amount?: number;
  date?: string;
  note?: string;
}

export interface RecordRepaymentPayload {
  amount: number;
  date?: string;
  note?: string;
}

export interface LendingSummary {
  totalLent: number;
  totalReturned: number;
  totalOutstanding: number;
  pendingCount: number;
  partiallyPaidCount: number;
  fullyPaidCount: number;
}
