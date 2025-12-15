import { CHART_OF_ACCOUNTS } from '../constants';
import { AccountType, CostCategory, FinancialReportData, JournalEntry, LedgerBalance } from '../types';

/**
 * The Brain of FinMatrix.
 * Converts raw Journal Entries into structured accounting reports.
 */
export const AccountingEngine = {

  getAccountDetails: (accountName: string) => {
    return CHART_OF_ACCOUNTS.find(a => a.name === accountName) || {
      code: '999',
      name: accountName,
      type: AccountType.EXPENSE, // Default fallback safely
      costCategory: CostCategory.NOT_APPLICABLE,
      isDirect: false
    };
  },

  generateLedgers: (entries: JournalEntry[]): LedgerBalance[] => {
    const ledgerMap: Record<string, { debit: number; credit: number }> = {};

    entries.forEach(entry => {
      // Debit Side
      if (!ledgerMap[entry.debitAccount]) ledgerMap[entry.debitAccount] = { debit: 0, credit: 0 };
      ledgerMap[entry.debitAccount].debit += entry.amount;

      // Credit Side
      if (!ledgerMap[entry.creditAccount]) ledgerMap[entry.creditAccount] = { debit: 0, credit: 0 };
      ledgerMap[entry.creditAccount].credit += entry.amount;
    });

    return Object.keys(ledgerMap).map(accountName => {
      const details = AccountingEngine.getAccountDetails(accountName);
      const { debit, credit } = ledgerMap[accountName];
      // Asset/Expense: Normal Debit Balance (Debit - Credit)
      // Liability/Income/Equity: Normal Credit Balance (Credit - Debit)
      // We normalize everything to "Net Debit Balance" for calculation simplicity (negative means credit balance)
      const closingBalance = debit - credit; 

      return {
        accountName,
        totalDebit: debit,
        totalCredit: credit,
        closingBalance,
        type: details.type
      };
    });
  },

  generateFinancialStatements: (ledgers: LedgerBalance[]): FinancialReportData => {
    // 1. Trading Account
    const tradingRevenue: LedgerBalance[] = [];
    const tradingCOGS: LedgerBalance[] = [];
    
    // 2. P&L Account
    const pnlIncome: LedgerBalance[] = [];
    const pnlExpenses: LedgerBalance[] = [];

    // 3. Balance Sheet
    const assets: LedgerBalance[] = [];
    const liabilities: LedgerBalance[] = [];
    const equity: LedgerBalance[] = [];

    // 4. Cost Sheet buckets
    const costSheetDetails: Record<string, LedgerBalance[]> = {
      [CostCategory.DIRECT_MATERIAL]: [],
      [CostCategory.DIRECT_LABOR]: [],
      [CostCategory.DIRECT_EXPENSE]: [],
      [CostCategory.FACTORY_OVERHEAD]: [],
      [CostCategory.ADMIN_OVERHEAD]: [],
      [CostCategory.SELLING_OVERHEAD]: [],
    };

    ledgers.forEach(ledger => {
      const meta = AccountingEngine.getAccountDetails(ledger.accountName);

      // Cost Sheet Allocator
      if (meta.costCategory !== CostCategory.NOT_APPLICABLE) {
        costSheetDetails[meta.costCategory].push(ledger);
      }

      // Financial Statement Allocator
      if (meta.type === AccountType.REVENUE) {
        if (meta.isDirect) tradingRevenue.push(ledger);
        else pnlIncome.push(ledger);
      } else if (meta.type === AccountType.EXPENSE) {
        if (meta.isDirect) tradingCOGS.push(ledger);
        else pnlExpenses.push(ledger);
      } else if (meta.type === AccountType.ASSET) {
        assets.push(ledger);
      } else if (meta.type === AccountType.LIABILITY) {
        liabilities.push(ledger);
      } else if (meta.type === AccountType.EQUITY) {
        equity.push(ledger);
      }
    });

    // Calculations
    // Remember: closingBalance is (Debit - Credit).
    // Revenue (Credit balance) will be negative in closingBalance. 
    // We abs() for display, but use raw for math.

    const totalRevenue = Math.abs(tradingRevenue.reduce((sum, l) => sum + l.closingBalance, 0));
    const totalCOGS = tradingCOGS.reduce((sum, l) => sum + l.closingBalance, 0);
    const grossProfit = totalRevenue - totalCOGS;

    const totalIndirectIncome = Math.abs(pnlIncome.reduce((sum, l) => sum + l.closingBalance, 0));
    const totalIndirectExpense = pnlExpenses.reduce((sum, l) => sum + l.closingBalance, 0);
    const netProfit = grossProfit + totalIndirectIncome - totalIndirectExpense;

    // Cost Sheet Sums
    const sumCost = (cat: CostCategory) => 
      costSheetDetails[cat].reduce((sum, l) => sum + l.closingBalance, 0);

    const primeCost = sumCost(CostCategory.DIRECT_MATERIAL) + sumCost(CostCategory.DIRECT_LABOR) + sumCost(CostCategory.DIRECT_EXPENSE);
    const worksCost = primeCost + sumCost(CostCategory.FACTORY_OVERHEAD);
    const costOfProduction = worksCost + sumCost(CostCategory.ADMIN_OVERHEAD);
    const costOfSales = costOfProduction + sumCost(CostCategory.SELLING_OVERHEAD);

    return {
      trading: { revenue: tradingRevenue, cogs: tradingCOGS, grossProfit },
      pnl: { income: pnlIncome, expenses: pnlExpenses, netProfit },
      balanceSheet: { 
        assets, 
        liabilities, 
        equity,
        totalAssets: assets.reduce((sum, l) => sum + l.closingBalance, 0),
        totalLiabilitiesAndEquity: 0 // Calculated in UI by adding Net Profit to Equity
      },
      costSheet: {
        primeCost,
        worksCost,
        costOfProduction,
        costOfSales,
        details: costSheetDetails
      }
    };
  }
};