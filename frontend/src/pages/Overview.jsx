import { TrendingUp, TrendingDown, Wallet, Receipt, Image as ImageIcon, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Overview({ transactions, categories = [], formatThaiDate, fmt, handleViewImage, setActiveMenu }) {
  const MONTHS_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  const currentMonthNum = new Date().getMonth() + 1;
  const currentYearNum = new Date().getFullYear();

  const currentMonthTransactions = transactions.filter(t => {
    const [y, m] = t.transaction_date.split('-');
    return parseInt(m) === currentMonthNum && parseInt(y) === currentYearNum;
  });

  const totalIncome = currentMonthTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpense = currentMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const balance = totalIncome - totalExpense;
  const transactionCount = currentMonthTransactions.length;

  const monthlyData = (() => {
    const md = {};
    MONTHS_TH.forEach(m => md[m] = { name: m, income: 0, expense: 0 });
    transactions.filter(t => t.transaction_date.startsWith(currentYearNum.toString())).forEach(t => {
      const [, month] = t.transaction_date.split('-');
      const monthName = MONTHS_TH[parseInt(month) - 1];
      if (t.type === 'INCOME') md[monthName].income += parseFloat(t.amount);
      else md[monthName].expense += parseFloat(t.amount);
    });
    return Object.values(md).slice(0, 6);
  })();

  const categoryData = (() => {
    const ed = {};
    currentMonthTransactions.forEach(t => {
      if (t.type === 'EXPENSE') {
        const desc = t.description || 'อื่นๆ';
        ed[desc] = (ed[desc] || 0) + parseFloat(t.amount);
      }
    });
    return Object.keys(ed).map(key => {
      const cat = categories.find(c => c.name === key);
      return {
        name: key,
        value: ed[key],
        color: cat ? cat.color : '#94A3B8'
      };
    }).sort((a, b) => b.value - a.value); // Sort by highest expense
  })();

  return (
    <div className="max-w-7xl mx-auto pb-20 mt-4 xl:mt-0">
      {/* Header section */}
      <div className="mb-10 relative animate-fade-in-up">
        <div className="absolute -left-6 -top-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl animate-pulse-glow"></div>
        <div className="absolute top-0 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-2 pb-2 tracking-tighter drop-shadow-sm">System Overview</h1>
            <p className="text-slate-500 dark:text-[#94A3B8] text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
              <Activity size={14} className="text-blue-500" />
              สรุปการเงินเดือนปัจจุบัน <span className="text-blue-600 dark:text-blue-400">({MONTHS_TH[currentMonthNum - 1]} {currentYearNum + 543})</span>
            </p>
          </div>
          <div className="glass-panel px-6 py-3 rounded-full inline-flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-black tracking-widest uppercase text-slate-600 dark:text-slate-300">Live Status</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        <div className="glass-panel glass-panel-hover p-6 rounded-[24px] flex justify-between items-start group relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700 ease-out"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <div className="text-slate-500 dark:text-[#94A3B8] text-[10px] font-black uppercase tracking-[0.2em]">รายรับ (Income)</div>
            </div>
            <div className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white tracking-tight">฿{fmt(totalIncome)}</div>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/5 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]">
            <TrendingUp size={24} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
        </div>

        <div className="glass-panel glass-panel-hover p-6 rounded-[24px] flex justify-between items-start group relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-all duration-700 ease-out"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
              <div className="text-slate-500 dark:text-[#94A3B8] text-[10px] font-black uppercase tracking-[0.2em]">รายจ่าย (Expense)</div>
            </div>
            <div className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white tracking-tight">฿{fmt(totalExpense)}</div>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400/20 to-rose-600/5 border border-rose-500/20 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 shadow-[0_0_15px_rgba(244,63,94,0.1)] group-hover:shadow-[0_0_25px_rgba(244,63,94,0.3)]">
            <TrendingDown size={24} className="text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
          </div>
        </div>

        <div className="glass-panel glass-panel-hover p-6 rounded-[24px] flex justify-between items-start group relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-all duration-700 ease-out"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-1.5 h-1.5 rounded-full ${balance >= 0 ? 'bg-violet-500' : 'bg-rose-500'}`}></div>
              <div className="text-slate-500 dark:text-[#94A3B8] text-[10px] font-black uppercase tracking-[0.2em]">คงเหลือ (Balance)</div>
            </div>
            <div className={`text-3xl lg:text-4xl font-black tracking-tight ${balance >= 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'text-rose-500'}`}>฿{fmt(balance)}</div>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400/20 to-violet-600/5 border border-violet-500/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-[0_0_15px_rgba(139,92,246,0.1)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.3)]">
            <Wallet size={24} className="text-violet-500 dark:text-[#A78BFA] drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
          </div>
        </div>

        <div className="glass-panel glass-panel-hover p-6 rounded-[24px] flex justify-between items-start group relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700 ease-out"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              <div className="text-slate-500 dark:text-[#94A3B8] text-[10px] font-black uppercase tracking-[0.2em]">รายการทั้งหมด</div>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white tracking-tight">{transactionCount}</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Txns</div>
            </div>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400/20 to-blue-600/5 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]">
            <Receipt size={24} className="text-blue-500 dark:text-[#60A5FA] drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        {/* Bar Chart Container */}
        <div className="glass-panel p-8 rounded-[32px] h-[450px] flex flex-col relative animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="absolute top-0 right-0 w-[500px] h-full bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none rounded-r-[32px]"></div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                <span className="w-2 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></span>
                รายรับ-รายจ่าย 6 เดือนล่าสุด
              </h3>
              <p className="text-xs text-slate-500 ml-5 mt-1 font-bold uppercase tracking-widest">Financial Trend (6 Months)</p>
            </div>
          </div>

          <div className="flex-1 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity={1} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FB7185" stopOpacity={1} />
                    <stop offset="100%" stopColor="#E11D48" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-[#1E293B]" opacity={0.5} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontWeight: 700 }} dy={10} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontWeight: 700 }} tickFormatter={(val) => val >= 1000 ? (val / 1000) + 'k' : val} dx={-10} />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]">
                          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-3">{label}</p>
                          <div className="space-y-2.5">
                            {payload.map((entry, index) => (
                              <div key={`item-${index}`} className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color, boxShadow: `0 0 10px ${entry.color}` }}></div>
                                <span className="text-slate-200 font-bold text-xs">{entry.name}: <span className="font-black text-white ml-1">฿{fmt(entry.value)}</span></span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="income" name="รายรับ" fill="url(#colorIncome)" radius={[8, 8, 4, 4]} maxBarSize={20} animationDuration={1500} animationEasing="ease-out" />
                <Bar dataKey="expense" name="รายจ่าย" fill="url(#colorExpense)" radius={[8, 8, 4, 4]} maxBarSize={20} animationDuration={1500} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Container */}
        <div className="glass-panel p-8 rounded-[32px] h-[450px] flex flex-col relative animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="absolute bottom-0 left-0 w-full h-[200px] bg-gradient-to-t from-purple-500/5 to-transparent pointer-events-none rounded-b-[32px]"></div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                <span className="w-2 h-6 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full"></span>
                สัดส่วนรายจ่าย (Expense Ratio)
              </h3>
              <p className="text-xs text-slate-500 ml-5 mt-1 font-bold uppercase tracking-widest">Top Expenses Current Month</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-center relative z-10">
            <div className="w-full sm:w-1/2 h-[250px] sm:h-full relative flex items-center justify-center filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.2)]">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%" cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={8}
                      animationDuration={1500}
                    >
                      {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 py-3 px-5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.color, boxShadow: `0 0 12px ${payload[0].payload.color}` }}></div>
                              <span className="text-slate-200 font-bold text-xs">{payload[0].name} : <span className="font-black text-white ml-2">฿{fmt(payload[0].value)}</span></span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <div className="w-20 h-20 rounded-full border-4 border-dashed border-slate-300 dark:border-[#334155] animate-spin-slow"></div>
                  <span className="text-xs font-black uppercase tracking-widest">No Data</span>
                </div>
              )}

              {/* Center Text for Pie Chart */}
              {categoryData.length > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1 mt-2">รวมรายจ่าย</span>
                  <span className="text-xl font-black text-slate-800 dark:text-white drop-shadow-md">
                    {fmt(categoryData.reduce((acc, curr) => acc + curr.value, 0))}
                  </span>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="w-full sm:w-1/2 flex flex-col justify-center space-y-4 sm:pl-8 mt-6 sm:mt-0 max-h-full overflow-y-auto custom-scrollbar pr-2">
              {categoryData.map((entry, index) => (
                <div key={index} className="flex justify-between items-center group cursor-default p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-center space-x-3 flex-1 pr-4">
                    <span
                      className="w-4 h-4 rounded-md shadow-sm transition-transform duration-300 group-hover:scale-125 shrink-0"
                      style={{ backgroundColor: entry.color, boxShadow: `0 0 10px ${entry.color}80` }}
                    ></span>
                    <span className="text-slate-600 dark:text-[#E2E8F0] font-bold text-sm leading-snug break-words">{entry.name}</span>
                  </div>
                  <span className="font-black text-slate-800 dark:text-white text-sm shrink-0">฿{fmt(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="glass-panel rounded-[32px] overflow-hidden animate-fade-in-up flex flex-col" style={{ animationDelay: '0.7s' }}>
        <div className="px-8 py-6 border-b border-slate-200/50 dark:border-white/10 flex justify-between items-center bg-slate-50/50 dark:bg-[#0B1121]/50 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-full"></div>
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight leading-none">บันทึกธุรกรรมล่าสุด</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Recent Transactions History</p>
            </div>
          </div>
          <button
            onClick={() => setActiveMenu('record')}
            className="group px-6 py-2.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all duration-300 border border-transparent hover:border-blue-400 shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
          >
            ดูทั้งหมด (View All)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[800px] table-fixed">
            <thead>
              <tr className="bg-transparent text-slate-500 dark:text-[#94A3B8] text-[11px] font-black uppercase tracking-[0.15em] border-b border-slate-200/50 dark:border-white/5">
                <th className="p-5 font-medium text-center">วันที่ (DATE)</th>
                <th className="p-5 font-medium text-center">หมวดหมู่ (CATEGORY)</th>
                <th className="p-5 font-medium text-center">ประเภท (TYPE)</th>
                <th className="p-5 font-medium text-center">หมายเหตุ (NOTES)</th>
                <th className="p-5 font-medium text-center">จำนวนเงิน (AMOUNT)</th>
                <th className="p-5 font-medium text-center">หลักฐาน (RECEIPT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 dark:divide-white/5">
              {transactions.slice(0, 8).map((tx) => {
                const isIncome = tx.type === 'INCOME';
                const catColor = categories.find(c => c.name === tx.description)?.color || '#94A3B8';

                return (
                  <tr key={tx.id} className="hover:bg-white/60 dark:hover:bg-white/5 transition-colors duration-200 group">
                    <td className="p-5 text-center overflow-hidden">
                      <div className="text-sm font-bold text-slate-600 dark:text-[#CBD5E1] inline-block">{formatThaiDate(tx.transaction_date)}</div>
                    </td>
                    <td className="p-5 text-center overflow-hidden">
                      <div className="inline-flex items-center justify-center gap-3 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1E293B]/50 border border-slate-200/50 dark:border-white/5 mx-auto">
                        <span
                          className="w-2.5 h-2.5 rounded-full shadow-sm"
                          style={{ backgroundColor: catColor, boxShadow: `0 0 8px ${catColor}` }}
                        ></span>
                        <span className="text-xs font-bold text-slate-700 dark:text-[#E2E8F0] whitespace-nowrap">{tx.description}</span>
                      </div>
                    </td>
                    <td className="p-5 text-center overflow-hidden">
                      <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${isIncome ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.3)] dark:shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30 dark:border-rose-400/40 shadow-[0_0_15px_rgba(244,63,94,0.3)] dark:shadow-[0_0_20px_rgba(244,63,94,0.4)]'} mx-auto`}>
                        {isIncome ? 'รายรับ' : 'รายจ่าย'}
                      </div>
                    </td>
                    <td className="p-5 text-center overflow-hidden">
                      <div className="text-sm text-slate-500 dark:text-[#94A3B8] line-clamp-1 mx-auto max-w-[200px]">{tx.note || '-'}</div>
                    </td>
                    <td className="p-5 text-center overflow-hidden">
                      <div className={`text-base font-black tracking-tight inline-block ${isIncome ? 'text-emerald-500 text-glow-emerald' : 'text-rose-500'}`}>
                        ฿{fmt(tx.amount)}
                      </div>
                    </td>
                    <td className="p-5 text-center overflow-hidden">
                      <button
                        onClick={(e) => { e.stopPropagation(); tx.image_url && handleViewImage(tx.image_url); }}
                        className={`relative z-10 w-10 h-10 mx-auto rounded-xl bg-white dark:bg-[#060A13] border border-slate-200 dark:border-[#1E293B] overflow-hidden flex items-center justify-center transition-all duration-300 ${tx.image_url ? 'cursor-pointer hover:scale-110 hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'opacity-40 cursor-default'}`}
                        title={tx.image_url ? 'คลิกเพื่อดูรูป' : 'ไม่มีรูปภาพ'}
                      >
                        {tx.image_url ? (
                          <img src={tx.image_url} alt="Receipt" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={16} className="text-slate-400" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-10 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                      <Receipt size={32} className="text-slate-300 dark:text-slate-600" />
                      <span className="text-sm font-bold uppercase tracking-wider">No Transactions Found</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}