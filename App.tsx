import React, { useState, useEffect, useMemo, useRef } from 'react';
import Layout from './components/Layout';
import FinancialReports from './components/FinancialReports';
import { AccountingEngine } from './services/accountingEngine';
import { MOCK_ENTRIES, MOCK_USERS, CHART_OF_ACCOUNTS } from './constants';
import { User, UserRole, JournalEntry } from './types';

function App() {
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: UserRole.CA });
  const [authError, setAuthError] = useState('');
  
  // Simulated Database in Memory (In real app this is DB)
  const [usersDB, setUsersDB] = useState<User[]>(MOCK_USERS);

  // --- Data State ---
  const [entries, setEntries] = useState<JournalEntry[]>(MOCK_ENTRIES);
  const [viewingClientId, setViewingClientId] = useState<string>('c1');
  
  // New Entry Form State
  const [newEntry, setNewEntry] = useState({
    debitAccount: CHART_OF_ACCOUNTS[0].name,
    creditAccount: CHART_OF_ACCOUNTS[4].name,
    amount: '',
    description: ''
  });

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Derived State (The Accounting Magic) ---
  const filteredEntries = useMemo(() => {
    // SECURITY: If user is client, FORCE filtering by their ID.
    if (user?.role === UserRole.CLIENT) {
      return entries.filter(e => e.clientId === user.clientId);
    }
    // If CA, filter by the selected view
    return entries.filter(e => e.clientId === viewingClientId);
  }, [entries, viewingClientId, user]);

  const financialData = useMemo(() => {
    const ledgers = AccountingEngine.generateLedgers(filteredEntries);
    return AccountingEngine.generateFinancialStatements(ledgers);
  }, [filteredEntries]);

  // --- Auth Handlers ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate Login Check
    // For MOCK_USERS, we check name/role. For new users, we'd check email/password in a real app.
    // Simplifying for this demo to just check "Does email exist in DB?"
    
    // For demo purposes, we accept "ca" or "client" as shortcuts, or real emails
    let foundUser: User | undefined;

    if (authForm.email === 'ca') foundUser = usersDB.find(u => u.role === UserRole.CA && u.id === 'u1');
    else if (authForm.email === 'client') foundUser = usersDB.find(u => u.role === UserRole.CLIENT && u.id === 'u2');
    else foundUser = usersDB.find(u => u.email === authForm.email && u.password === authForm.password);

    if (foundUser) {
      setUser(foundUser);
      if (foundUser.role === UserRole.CLIENT && foundUser.clientId) {
        setViewingClientId(foundUser.clientId);
      }
      setAuthError('');
    } else {
      setAuthError('Invalid credentials. Try "ca" / "client" or register.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authForm.name || !authForm.email || !authForm.password) {
      setAuthError('Please fill all fields');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: authForm.name,
      email: authForm.email,
      password: authForm.password,
      role: authForm.role,
      clientId: authForm.role === UserRole.CLIENT ? `c_${Date.now()}` : undefined
    };

    setUsersDB([...usersDB, newUser]);
    setUser(newUser);
    if (newUser.role === UserRole.CLIENT && newUser.clientId) {
      setViewingClientId(newUser.clientId);
    }
    setAuthError('');
  };

  const handleLogout = () => {
    setUser(null);
    setAuthForm({ name: '', email: '', password: '', role: UserRole.CA });
    setAuthError('');
  };

  // --- Data Handlers ---

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      clientId: viewingClientId, // Always tag with currently active client ID
      debitAccount: newEntry.debitAccount,
      creditAccount: newEntry.creditAccount,
      amount: parseFloat(newEntry.amount),
      description: newEntry.description
    };
    setEntries([...entries, entry]);
    setNewEntry({ ...newEntry, amount: '', description: '' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n');
      
      // Simple CSV Parse: Date, Description, Debit, Credit, Amount
      // Skip header
      const newEntries: JournalEntry[] = [];
      
      lines.slice(1).forEach((line, idx) => {
        const [date, desc, dr, cr, amt] = line.split(',');
        if (date && dr && cr && amt) {
           newEntries.push({
             id: `upload_${Date.now()}_${idx}`,
             date: date.trim(),
             description: desc?.trim() || 'Imported Entry',
             debitAccount: dr.trim(),
             creditAccount: cr.trim(),
             amount: parseFloat(amt),
             clientId: viewingClientId // Import into CURRENT view
           });
        }
      });

      if (newEntries.length > 0) {
        setEntries([...entries, ...newEntries]);
        alert(`Successfully imported ${newEntries.length} transactions.`);
      } else {
        alert("No valid entries found. CSV Format: Date, Description, DebitAccount, CreditAccount, Amount");
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Render Auth Screen ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 bg-[url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80')] bg-cover bg-center bg-blend-overlay bg-opacity-90">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-2 w-full max-w-4xl flex overflow-hidden border border-white/20">
          
          {/* Left Side - Art */}
          <div className="hidden md:flex flex-col justify-between w-1/2 bg-slate-900/50 p-10 text-white">
            <div>
              <div className="bg-emerald-500 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <h1 className="text-4xl font-bold mb-4">FinMatrix</h1>
              <p className="text-slate-300 text-lg">The intelligent audit & accounting suite for modern professionals.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                <span>Automated Ledgers</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                <span>Instant Financial Statements</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                <span>Secure Client Isolation</span>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 bg-white p-8 md:p-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="text-slate-500 mb-8 text-sm">{isRegistering ? 'Start managing your audits today.' : 'Please enter your credentials to access.'}</p>
            
            {authError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{authError}</div>}

            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
              {isRegistering && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="John Doe"
                      value={authForm.name}
                      onChange={e => setAuthForm({...authForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">I am a</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        type="button"
                        onClick={() => setAuthForm({...authForm, role: UserRole.CA})}
                        className={`p-3 text-sm font-medium rounded-lg border ${authForm.role === UserRole.CA ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                      >
                        CA / Auditor
                      </button>
                      <button 
                         type="button"
                         onClick={() => setAuthForm({...authForm, role: UserRole.CLIENT})}
                         className={`p-3 text-sm font-medium rounded-lg border ${authForm.role === UserRole.CLIENT ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                      >
                        Organization
                      </button>
                    </div>
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email / Username</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder={isRegistering ? "john@example.com" : "Enter 'ca' or 'client'"}
                  value={authForm.email}
                  onChange={e => setAuthForm({...authForm, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Password</label>
                <input 
                  type="password" 
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={e => setAuthForm({...authForm, password: e.target.value})}
                />
              </div>

              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-emerald-500/20">
                {isRegistering ? 'Register Now' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              {isRegistering ? "Already have an account?" : "New to FinMatrix?"}
              <button 
                onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }}
                className="ml-2 text-emerald-600 font-bold hover:underline"
              >
                {isRegistering ? 'Login' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Dashboard ---
  return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Dashboard & Controls */}
        <div className="xl:col-span-4 space-y-8 no-print">
          
          {/* Welcome Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800">
               {user.role === UserRole.CA ? 'Auditor Console' : 'Organization Dashboard'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {user.role === UserRole.CA 
                ? 'Manage client entries and generate reports.' 
                : `Viewing financial data for ${user.name}`}
            </p>
            
            {user.role === UserRole.CA && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Select Audit Client</label>
                <select 
                  className="w-full border-slate-300 rounded-md text-sm p-2"
                  value={viewingClientId}
                  onChange={(e) => setViewingClientId(e.target.value)}
                >
                  <option value="c1">TechSolutions Pvt Ltd</option>
                  <option value="c2">New Client Inc.</option>
                  {/* In real app, this list comes from DB */}
                </select>
              </div>
            )}
          </div>

          {/* Key Metrics Card */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-xl shadow-lg shadow-emerald-500/20 text-white">
                <div className="text-xs font-medium opacity-80 uppercase tracking-wider">Net Profit</div>
                <div className="text-2xl font-bold mt-1">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(financialData.pnl.netProfit)}
                </div>
             </div>
             <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Assets</div>
                <div className="text-2xl font-bold mt-1 text-slate-800">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(financialData.balanceSheet.totalAssets)}
                </div>
             </div>
          </div>

           {/* Bulk Upload Section - Available to both CA and Client */}
           <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Bulk Data Import
              </h2>
              <p className="text-xs text-slate-500 mb-4">Upload CSV with format: Date, Description, Debit A/c, Credit A/c, Amount</p>
              
              <div className="relative">
                <input 
                  type="file" 
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>
          </div>

          {/* Manual Data Entry - Restricted to CA only */}
          {user.role === UserRole.CA && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Manual Journal Entry</h2>
              <form onSubmit={handleAddEntry} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Debit</label>
                    <select 
                      className="w-full border border-slate-200 rounded-md p-2 text-sm mt-1 focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={newEntry.debitAccount}
                      onChange={e => setNewEntry({...newEntry, debitAccount: e.target.value})}
                    >
                      {CHART_OF_ACCOUNTS.map(a => <option key={a.code} value={a.name}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Credit</label>
                    <select 
                      className="w-full border border-slate-200 rounded-md p-2 text-sm mt-1 focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={newEntry.creditAccount}
                      onChange={e => setNewEntry({...newEntry, creditAccount: e.target.value})}
                    >
                      {CHART_OF_ACCOUNTS.map(a => <option key={a.code} value={a.name}>{a.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Amount</label>
                  <input 
                    type="number" 
                    required
                    placeholder="0.00"
                    className="w-full border border-slate-200 rounded-md p-2 text-sm mt-1 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={newEntry.amount}
                    onChange={e => setNewEntry({...newEntry, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Narration</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Description of transaction..."
                    className="w-full border border-slate-200 rounded-md p-2 text-sm mt-1 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={newEntry.description}
                    onChange={e => setNewEntry({...newEntry, description: e.target.value})}
                  />
                </div>
                <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg transition-colors shadow-lg shadow-slate-900/10">
                  Post Entry
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Right Column: Reports */}
        <div className="xl:col-span-8">
           <FinancialReports 
             data={financialData} 
             companyName={user.role === UserRole.CLIENT ? user.name : (viewingClientId === 'c1' ? 'TechSolutions Pvt Ltd' : 'Client Company')} 
           />
           
           {/* Recent Transactions Table (Better visibility) */}
           <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden no-print">
             <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Recent Transactions</h3>
                <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">{filteredEntries.length} Records</span>
             </div>
             <div className="overflow-x-auto max-h-64 overflow-y-auto">
               <table className="w-full text-sm text-left">
                  <thead className="bg-white text-slate-500 sticky top-0">
                    <tr>
                      <th className="p-3 font-medium">Date</th>
                      <th className="p-3 font-medium">Description</th>
                      <th className="p-3 font-medium">Debit</th>
                      <th className="p-3 font-medium">Credit</th>
                      <th className="p-3 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEntries.slice().reverse().map(entry => (
                      <tr key={entry.id} className="hover:bg-slate-50">
                        <td className="p-3 text-slate-500 whitespace-nowrap">{entry.date}</td>
                        <td className="p-3 font-medium text-slate-800">{entry.description}</td>
                        <td className="p-3 text-slate-600">{entry.debitAccount}</td>
                        <td className="p-3 text-slate-600">{entry.creditAccount}</td>
                        <td className="p-3 text-right font-mono font-medium">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(entry.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
           </div>
        </div>

      </div>
    </Layout>
  );
}

export default App;