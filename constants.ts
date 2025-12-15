import { AccountHead, AccountType, CostCategory, JournalEntry, User, UserRole } from './types';

// 1. Chart of Accounts (Master Data)
export const CHART_OF_ACCOUNTS: AccountHead[] = [
  { code: '101', name: 'Cash', type: AccountType.ASSET, costCategory: CostCategory.NOT_APPLICABLE, isDirect: false },
  { code: '102', name: 'Bank', type: AccountType.ASSET, costCategory: CostCategory.NOT_APPLICABLE, isDirect: false },
  { code: '103', name: 'Accounts Receivable', type: AccountType.ASSET, costCategory: CostCategory.NOT_APPLICABLE, isDirect: false },
  { code: '104', name: 'Machinery', type: AccountType.ASSET, costCategory: CostCategory.NOT_APPLICABLE, isDirect: false },
  
  { code: '201', name: 'Accounts Payable', type: AccountType.LIABILITY, costCategory: CostCategory.NOT_APPLICABLE, isDirect: false },
  { code: '202', name: 'Bank Loan', type: AccountType.LIABILITY, costCategory: CostCategory.NOT_APPLICABLE, isDirect: false },
  
  { code: '301', name: 'Share Capital', type: AccountType.EQUITY, costCategory: CostCategory.NOT_APPLICABLE, isDirect: false },
  { code: '302', name: 'Retained Earnings', type: AccountType.EQUITY, costCategory: CostCategory.NOT_APPLICABLE, isDirect: false },
  
  { code: '401', name: 'Sales', type: AccountType.REVENUE, costCategory: CostCategory.NOT_APPLICABLE, isDirect: true },
  { code: '402', name: 'Service Income', type: AccountType.REVENUE, costCategory: CostCategory.NOT_APPLICABLE, isDirect: true },
  
  { code: '501', name: 'Raw Material Purchase', type: AccountType.EXPENSE, costCategory: CostCategory.DIRECT_MATERIAL, isDirect: true },
  { code: '502', name: 'Factory Wages', type: AccountType.EXPENSE, costCategory: CostCategory.DIRECT_LABOR, isDirect: true },
  { code: '503', name: 'Factory Electricity', type: AccountType.EXPENSE, costCategory: CostCategory.FACTORY_OVERHEAD, isDirect: true },
  { code: '504', name: 'Office Rent', type: AccountType.EXPENSE, costCategory: CostCategory.ADMIN_OVERHEAD, isDirect: false },
  { code: '505', name: 'Salaries (Admin)', type: AccountType.EXPENSE, costCategory: CostCategory.ADMIN_OVERHEAD, isDirect: false },
  { code: '506', name: 'Marketing', type: AccountType.EXPENSE, costCategory: CostCategory.SELLING_OVERHEAD, isDirect: false },
];

// 2. Mock Users
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Arjun Mehta (FCA)', email: 'arjun@finmatrix.com', role: UserRole.CA },
  { id: 'u2', name: 'TechSolutions Pvt Ltd', email: 'admin@techsolutions.com', role: UserRole.CLIENT, clientId: 'c1' },
];

// 3. Mock Financial Data (Journal Entries)
export const MOCK_ENTRIES: JournalEntry[] = [
  // Initial Capital
  { id: '1', date: '2024-04-01', description: 'Capital Infusion', debitAccount: 'Bank', creditAccount: 'Share Capital', amount: 5000000, clientId: 'c1' },
  // Purchases
  { id: '2', date: '2024-04-05', description: 'Raw Material Purchase', debitAccount: 'Raw Material Purchase', creditAccount: 'Accounts Payable', amount: 1200000, clientId: 'c1' },
  // Sales
  { id: '3', date: '2024-04-10', description: 'Sales to Customer A', debitAccount: 'Accounts Receivable', creditAccount: 'Sales', amount: 2500000, clientId: 'c1' },
  // Expenses
  { id: '4', date: '2024-04-15', description: 'Factory Wages Paid', debitAccount: 'Factory Wages', creditAccount: 'Bank', amount: 300000, clientId: 'c1' },
  { id: '5', date: '2024-04-20', description: 'Office Rent', debitAccount: 'Office Rent', creditAccount: 'Bank', amount: 50000, clientId: 'c1' },
  { id: '6', date: '2024-04-25', description: 'Factory Power Bill', debitAccount: 'Factory Electricity', creditAccount: 'Accounts Payable', amount: 25000, clientId: 'c1' },
  { id: '7', date: '2024-04-28', description: 'Marketing Campaign', debitAccount: 'Marketing', creditAccount: 'Bank', amount: 100000, clientId: 'c1' },
  // Asset Purchase
  { id: '8', date: '2024-05-01', description: 'Purchased New Machinery', debitAccount: 'Machinery', creditAccount: 'Bank', amount: 800000, clientId: 'c1' },
];