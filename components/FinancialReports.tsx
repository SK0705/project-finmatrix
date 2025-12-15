import React, { useState } from 'react';
import { FinancialReportData, LedgerBalance } from '../types';

interface ReportProps {
  data: FinancialReportData;
  companyName: string;
}

const CurrencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const FinancialReports: React.FC<ReportProps> = ({ data, companyName }) => {
  const [activeTab, setActiveTab] = useState<'bs' | 'pnl' | 'cost' | 'ledger'>('pnl');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    // Generate CSV content based on active tab
    let csvContent = "data:text/csv;charset=utf-8,";
    
    const addToCSV = (row: string[]) => {
      csvContent += row.join(",") + "\r\n";
    };

    if (activeTab === 'pnl') {
      addToCSV(["Trading & PnL Account", companyName]);
      addToCSV(["Type", "Account Name", "Amount"]);
      data.trading.revenue.forEach(i => addToCSV(["Revenue", i.accountName, String(Math.abs(i.closingBalance))]));
      data.trading.cogs.forEach(i => addToCSV(["COGS", i.accountName, String(i.closingBalance)]));
      data.pnl.expenses.forEach(i => addToCSV(["Expense", i.accountName, String(i.closingBalance)]));
    } else if (activeTab === 'bs') {
      addToCSV(["Balance Sheet", companyName]);
      addToCSV(["Type", "Account Name", "Amount"]);
      data.balanceSheet.assets.forEach(i => addToCSV(["Asset", i.accountName, String(i.closingBalance)]));
      data.balanceSheet.liabilities.forEach(i => addToCSV(["Liability", i.accountName, String(Math.abs(i.closingBalance))]));
      data.balanceSheet.equity.forEach(i => addToCSV(["Equity", i.accountName, String(Math.abs(i.closingBalance))]));
    } else if (activeTab === 'ledger') {
      addToCSV(["General Ledger", companyName]);
      addToCSV(["Account Name", "Debit Total", "Credit Total", "Closing Balance"]);
      // Aggregate all ledgers for simplicity in export
      const allLedgers = [
        ...data.balanceSheet.assets, ...data.balanceSheet.liabilities, ...data.balanceSheet.equity,
        ...data.pnl.expenses, ...data.pnl.income, ...data.trading.revenue, ...data.trading.cogs
      ];
      allLedgers.forEach(i => addToCSV([i.accountName, String(i.totalDebit), String(i.totalCredit), String(i.closingBalance)]));
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${companyName}_${activeTab}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 no-print">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Financial Reports</h2>
           <p className="text-slate-500 text-sm">Real-time generated statements</p>
        </div>
       
        <div className="flex flex-wrap items-center gap-3">
           <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            {(['pnl', 'bs', 'cost', 'ledger'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab 
                    ? 'bg-slate-900 text-white shadow-md transform scale-105' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab === 'pnl' ? 'P&L A/c' : tab === 'bs' ? 'Balance Sheet' : tab === 'cost' ? 'Cost Sheet' : 'Ledgers'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              CSV
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-emerald-500/20 transition-all text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Report Container - This area gets printed */}
      <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200 print-container min-h-[600px]">
        
        {/* Print Header */}
        <div className="hidden print-only text-center mb-10 border-b-2 border-slate-900 pb-6">
          <h1 className="text-4xl font-bold uppercase tracking-wider text-slate-900">{companyName}</h1>
          <p className="text-slate-600 text-lg mt-2">Financial Statements & Cost Analysis</p>
          <p className="text-sm mt-2 text-slate-400">Generated on {new Date().toLocaleDateString()} via FinMatrix</p>
        </div>

        {/* --- P&L SECTION --- */}
        {(activeTab === 'pnl') && (
          <div className="space-y-10 animate-fade-in">
            <div className="bg-slate-50/50 rounded-lg p-6 border border-slate-100">
              <h3 className="text-lg font-bold uppercase text-slate-800 mb-4 border-b border-slate-200 pb-2 flex justify-between">
                <span>Trading Account</span>
                <span className="text-xs text-slate-400 font-normal normal-case mt-1">For the year ended 31st March</span>
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="p-3 text-left font-medium">Particulars</th>
                    <th className="p-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Revenue */}
                  {data.trading.revenue.map(item => (
                    <tr key={item.accountName} className="hover:bg-white transition-colors">
                      <td className="p-3 text-slate-700 font-medium">{item.accountName}</td>
                      <td className="p-3 text-right text-emerald-700">{CurrencyFormatter.format(Math.abs(item.closingBalance))}</td>
                    </tr>
                  ))}
                  {/* COGS */}
                  {data.trading.cogs.map(item => (
                    <tr key={item.accountName} className="hover:bg-white transition-colors">
                      <td className="p-3 text-slate-600 pl-6">Less: {item.accountName}</td>
                      <td className="p-3 text-right text-rose-500">({CurrencyFormatter.format(item.closingBalance)})</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold border-t border-slate-300">
                    <td className="p-3">Gross Profit c/d</td>
                    <td className="p-3 text-right text-slate-900">{CurrencyFormatter.format(data.trading.grossProfit)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="break-inside-avoid bg-slate-50/50 rounded-lg p-6 border border-slate-100">
              <h3 className="text-lg font-bold uppercase text-slate-800 mb-4 border-b border-slate-200 pb-2 flex justify-between">
                <span>Profit & Loss Account</span>
                <span className="text-xs text-slate-400 font-normal normal-case mt-1">Net Income Calculation</span>
              </h3>
              <table className="w-full text-sm">
                 <thead>
                  <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="p-3 text-left font-medium">Particulars</th>
                    <th className="p-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-semibold text-slate-700">Gross Profit b/d</td>
                    <td className="p-3 text-right font-semibold">{CurrencyFormatter.format(data.trading.grossProfit)}</td>
                  </tr>
                  {data.pnl.income.map(item => (
                    <tr key={item.accountName} className="hover:bg-white">
                      <td className="p-3 text-slate-600 pl-6">Add: {item.accountName}</td>
                      <td className="p-3 text-right text-emerald-600">{CurrencyFormatter.format(Math.abs(item.closingBalance))}</td>
                    </tr>
                  ))}
                  {data.pnl.expenses.map(item => (
                    <tr key={item.accountName} className="hover:bg-white">
                      <td className="p-3 text-slate-600 pl-6">Less: {item.accountName}</td>
                      <td className="p-3 text-right text-rose-500">({CurrencyFormatter.format(item.closingBalance)})</td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50 font-bold border-t-2 border-emerald-100 text-emerald-900">
                    <td className="p-4">Net Profit / (Loss)</td>
                    <td className="p-4 text-right text-lg">{CurrencyFormatter.format(data.pnl.netProfit)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- BALANCE SHEET SECTION --- */}
        {(activeTab === 'bs') && (
          <div className="space-y-6 animate-fade-in">
             <h3 className="text-lg font-bold uppercase text-slate-800 mb-4 border-b border-slate-200 pb-2 flex justify-between">
                <span>Balance Sheet</span>
                <span className="text-xs text-slate-400 font-normal normal-case mt-1">As at 31st March</span>
              </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Liabilities Side */}
              <div className="border border-slate-200 rounded-lg overflow-hidden break-inside-avoid shadow-sm">
                <div className="bg-slate-50 p-3 font-bold border-b border-slate-200 text-center uppercase text-xs tracking-widest text-slate-500">Liabilities & Equity</div>
                <div className="p-4 space-y-3">
                  <div className="font-bold text-slate-800 text-sm bg-slate-50/50 p-1 rounded">Capital Account</div>
                  {data.balanceSheet.equity.map(item => (
                    <div key={item.accountName} className="flex justify-between text-sm pl-4 border-b border-dashed border-slate-100 pb-1">
                      <span className="text-slate-600">{item.accountName}</span>
                      <span className="font-mono text-slate-800">{CurrencyFormatter.format(Math.abs(item.closingBalance))}</span>
                    </div>
                  ))}
                   <div className="flex justify-between text-sm pl-4 text-emerald-600 font-medium bg-emerald-50/30 p-1 rounded">
                      <span>Add: Net Profit</span>
                      <span>{CurrencyFormatter.format(data.pnl.netProfit)}</span>
                    </div>
                  
                  <div className="font-bold text-slate-800 text-sm mt-6 bg-slate-50/50 p-1 rounded">Current Liabilities</div>
                  {data.balanceSheet.liabilities.map(item => (
                    <div key={item.accountName} className="flex justify-between text-sm pl-4 border-b border-dashed border-slate-100 pb-1">
                      <span className="text-slate-600">{item.accountName}</span>
                      <span className="font-mono text-slate-800">{CurrencyFormatter.format(Math.abs(item.closingBalance))}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-100 p-4 font-bold border-t border-slate-200 flex justify-between mt-auto">
                  <span className="uppercase text-xs text-slate-500 mt-1">Total Liabilities</span>
                  {/* Total Equity (Abs) + Total Liab (Abs) + Net Profit */}
                  <span className="text-lg text-slate-900">{CurrencyFormatter.format(
                     Math.abs(data.balanceSheet.equity.reduce((a, b) => a + b.closingBalance, 0)) + 
                     Math.abs(data.balanceSheet.liabilities.reduce((a, b) => a + b.closingBalance, 0)) +
                     data.pnl.netProfit
                  )}</span>
                </div>
              </div>

              {/* Assets Side */}
              <div className="border border-slate-200 rounded-lg overflow-hidden break-inside-avoid shadow-sm">
                <div className="bg-slate-50 p-3 font-bold border-b border-slate-200 text-center uppercase text-xs tracking-widest text-slate-500">Assets</div>
                <div className="p-4 space-y-3">
                  <div className="font-bold text-slate-800 text-sm bg-slate-50/50 p-1 rounded">Fixed & Current Assets</div>
                  {data.balanceSheet.assets.map(item => (
                    <div key={item.accountName} className="flex justify-between text-sm pl-4 border-b border-dashed border-slate-100 pb-1">
                      <span className="text-slate-600">{item.accountName}</span>
                      <span className="font-mono text-slate-800">{CurrencyFormatter.format(item.closingBalance)}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-100 p-4 font-bold border-t border-slate-200 flex justify-between mt-auto h-full items-end">
                  <span className="uppercase text-xs text-slate-500 mb-1">Total Assets</span>
                  <span className="text-lg text-slate-900">{CurrencyFormatter.format(data.balanceSheet.totalAssets)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- COST SHEET SECTION --- */}
        {(activeTab === 'cost') && (
          <div className="animate-fade-in">
             <h3 className="text-lg font-bold uppercase text-slate-800 mb-6 border-b border-slate-200 pb-2">Statement of Cost</h3>
             <div className="overflow-hidden rounded-lg border border-slate-200">
               <table className="w-full text-sm">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      <th className="p-3 text-left font-medium">Particulars</th>
                      <th className="p-3 text-right w-32 font-medium">Details</th>
                      <th className="p-3 text-right w-32 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Direct Material */}
                    <tr><td colSpan={3} className="p-2 bg-slate-50 font-semibold text-xs text-slate-500 uppercase tracking-widest">Direct Costs</td></tr>
                    {data.costSheet.details['Direct Material'].map(item => (
                      <tr key={item.accountName}>
                        <td className="p-2 pl-4 text-slate-600">{item.accountName}</td>
                        <td className="p-2 text-right font-mono text-slate-700">{CurrencyFormatter.format(item.closingBalance)}</td>
                        <td></td>
                      </tr>
                    ))}
                    {data.costSheet.details['Direct Labor'].map(item => (
                      <tr key={item.accountName}>
                        <td className="p-2 pl-4 text-slate-600">{item.accountName}</td>
                        <td className="p-2 text-right font-mono text-slate-700">{CurrencyFormatter.format(item.closingBalance)}</td>
                        <td></td>
                      </tr>
                    ))}
                    
                    {/* PRIME COST */}
                    <tr className="bg-emerald-50/50 font-bold border-t border-b border-emerald-100">
                      <td className="p-3 pl-4 text-emerald-900">PRIME COST</td>
                      <td></td>
                      <td className="p-3 text-right text-emerald-900">{CurrencyFormatter.format(data.costSheet.primeCost)}</td>
                    </tr>

                    <tr><td colSpan={3} className="p-2 bg-slate-50 font-semibold text-xs text-slate-500 uppercase tracking-widest">Factory Overheads</td></tr>
                    {data.costSheet.details['Factory Overhead'].map(item => (
                      <tr key={item.accountName}>
                      <td className="p-2 pl-4 text-slate-600">{item.accountName}</td>
                      <td className="p-2 text-right font-mono text-slate-700">{CurrencyFormatter.format(item.closingBalance)}</td>
                      <td></td>
                    </tr>
                    ))}

                    {/* WORKS COST */}
                    <tr className="bg-emerald-50/50 font-bold border-t border-b border-emerald-100">
                      <td className="p-3 pl-4 text-emerald-900">WORKS COST</td>
                      <td></td>
                      <td className="p-3 text-right text-emerald-900">{CurrencyFormatter.format(data.costSheet.worksCost)}</td>
                    </tr>

                    <tr><td colSpan={3} className="p-2 bg-slate-50 font-semibold text-xs text-slate-500 uppercase tracking-widest">Admin Overheads</td></tr>
                    {data.costSheet.details['Admin Overhead'].map(item => (
                      <tr key={item.accountName}>
                      <td className="p-2 pl-4 text-slate-600">{item.accountName}</td>
                      <td className="p-2 text-right font-mono text-slate-700">{CurrencyFormatter.format(item.closingBalance)}</td>
                      <td></td>
                    </tr>
                    ))}

                    {/* COST OF PRODUCTION */}
                    <tr className="bg-emerald-50/50 font-bold border-t border-b border-emerald-100">
                      <td className="p-3 pl-4 text-emerald-900">COST OF PRODUCTION</td>
                      <td></td>
                      <td className="p-3 text-right text-emerald-900">{CurrencyFormatter.format(data.costSheet.costOfProduction)}</td>
                    </tr>
                    
                    <tr><td colSpan={3} className="p-2 bg-slate-50 font-semibold text-xs text-slate-500 uppercase tracking-widest">Selling & Dist. Overheads</td></tr>
                    {data.costSheet.details['Selling Overhead'].map(item => (
                      <tr key={item.accountName}>
                      <td className="p-2 pl-4 text-slate-600">{item.accountName}</td>
                      <td className="p-2 text-right font-mono text-slate-700">{CurrencyFormatter.format(item.closingBalance)}</td>
                      <td></td>
                    </tr>
                    ))}

                    {/* COST OF SALES */}
                    <tr className="bg-slate-900 text-white font-bold text-lg">
                      <td className="p-4">COST OF SALES</td>
                      <td></td>
                      <td className="p-4 text-right">{CurrencyFormatter.format(data.costSheet.costOfSales)}</td>
                    </tr>
                  </tbody>
              </table>
             </div>
          </div>
        )}

        {/* --- LEDGERS SECTION --- */}
        {(activeTab === 'ledger') && (
          <div className="space-y-6 animate-fade-in">
             <h3 className="text-lg font-bold uppercase text-slate-800 mb-4 border-b border-slate-200 pb-2">General Ledger Summary</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...data.balanceSheet.assets, ...data.balanceSheet.liabilities, ...data.pnl.expenses, ...data.trading.revenue].map(ledger => (
                <div key={ledger.accountName} className="border border-slate-200 p-5 rounded-lg flex justify-between items-center break-inside-avoid bg-white hover:shadow-md transition-shadow">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{ledger.accountName}</h4>
                    <span className="text-[10px] text-slate-500 font-bold uppercase bg-slate-100 px-2 py-1 rounded mt-1 inline-block tracking-wider">{ledger.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 mb-1">Closing Balance</div>
                    <div className={`font-mono font-bold text-xl ${ledger.closingBalance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {CurrencyFormatter.format(Math.abs(ledger.closingBalance))} {ledger.closingBalance >= 0 ? 'Dr' : 'Cr'}
                    </div>
                  </div>
                </div>
              ))}
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FinancialReports;