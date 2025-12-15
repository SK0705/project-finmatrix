export enum UserRole {
  CA = 'CA',
  CLIENT = 'CLIENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // In real app, this is hashed. keeping simple for frontend logic
  role: UserRole;
  clientId?: string; // If role is CLIENT, they are bound to this ID
}

export enum AccountType {
  ASSET = 'Asset',
  LIABILITY = 'Liability',
  EQUITY = 'Equity',
  REVENUE = 'Revenue',
  EXPENSE = 'Expense'
}

export enum CostCategory {
  DIRECT_MATERIAL = 'Direct Material',
  DIRECT_LABOR = 'Direct Labor',
  DIRECT_EXPENSE = 'Direct Expense',
  FACTORY_OVERHEAD = 'Factory Overhead',
  ADMIN_OVERHEAD = 'Admin Overhead',
  SELLING_OVERHEAD = 'Selling Overhead',
  NOT_APPLICABLE = 'N/A'
}

// Chart of Accounts Definition
export interface AccountHead {
  code: string;
  name: string;
  type: AccountType;
  costCategory: CostCategory;
  isDirect: boolean; // For Trading vs P&L
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  clientId: string;
}

export interface LedgerBalance {
  accountName: string;
  totalDebit: number;
  totalCredit: number;
  closingBalance: number; // Positive = Debit Balance, Negative = Credit Balance
  type: AccountType;
}

export interface FinancialReportData {
  trading: {
    revenue: LedgerBalance[];
    cogs: LedgerBalance[];
    grossProfit: number;
  };
  pnl: {
    income: LedgerBalance[];
    expenses: LedgerBalance[];
    netProfit: number;
  };
  balanceSheet: {
    assets: LedgerBalance[];
    liabilities: LedgerBalance[];
    equity: LedgerBalance[];
    totalAssets: number;
    totalLiabilitiesAndEquity: number;
  };
  costSheet: {
    primeCost: number;
    worksCost: number;
    costOfProduction: number;
    costOfSales: number;
    details: Record<string, LedgerBalance[]>;
  }
}