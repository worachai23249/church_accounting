import { useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, Activity, ArrowLeft, Edit, Trash2, Image as ImageIcon, PieChart as PieIcon, LineChart } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const MONTHS_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const FULL_MONTHS_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

export default function Reports({ transactions, fmt, formatThaiDate, handleViewImage, handleOpenEditTransaction, handleDeleteTransaction, isLoggedIn = true }) {
  const currentMonthNum = new Date().getMonth() + 1;
  const currentYearNum = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYearNum);
  const [selectedMonthDetail, setSelectedMonthDetail] = useState(null);

  const reportTransactions = transactions.filter(t => t.transaction_date.startsWith(selectedYear.toString()));
  const reportYearlyIncome = reportTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const reportYearlyExpense = reportTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const reportYearlyBalance = reportYearlyIncome - reportYearlyExpense;
  const reportSavingsRate = reportYearlyIncome > 0 ? ((reportYearlyBalance / reportYearlyIncome) * 100).toFixed(1) : 0;

  const reportMonthlyStats = MONTHS_TH.map((monthName, index) => {
    const monthIndexStr = (index + 1).toString().padStart(2, '0');
    const monthTx = reportTransactions.filter(t => t.transaction_date.startsWith(`${selectedYear}-${monthIndexStr}`));
    let inc = 0, exp = 0;
    monthTx.forEach(t => { if (t.type === 'INCOME') inc += parseFloat(t.amount); else exp += parseFloat(t.amount); });
    return { name: monthName, income: inc, expense: exp, balance: inc - exp };
  });

  let detailTransactions = [];
  let detailIncome = 0;
  let detailExpense = 0;
  let detailBalance = 0;
  let detailMonthName = "";

  if (selectedMonthDetail) {
    const monthIndexStr = selectedMonthDetail.toString().padStart(2, '0');
    detailTransactions = transactions.filter(t => t.transaction_date.startsWith(`${selectedYear}-${monthIndexStr}`));
    detailIncome = detailTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    detailExpense = detailTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    detailBalance = detailIncome - detailExpense;
    detailMonthName = FULL_MONTHS_TH[selectedMonthDetail - 1];
    detailTransactions.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  }

  // --- Render Month Details View ---
  if (selectedMonthDetail) {
    return (
      <div className="max-w-7xl mx-auto pb-20 mt-4 xl:mt-0 font-sans">
        {/* Header section with Glass Back Button */}
        <div className="mb-10 relative animate-fade-in-up">
          <div className="absolute -left-6 -top-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl animate-pulse-glow"></div>
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 relative z-10">
            <button
              onClick={() => setSelectedMonthDetail(null)}
              className="w-12 h-12 md:w-14 md:h-14 bg-white/70 dark:bg-[#0B1121]/60 backdrop-blur-md border border-white/20 dark:border-white/5 rounded-full flex items-center justify-center text-slate-500 dark:text-[#94A3B8] hover:text-blue-500 dark:hover:text-blue-400 hover:scale-110 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:-translate-x-2 transition-all duration-300 shrink-0"
            >
              <ArrowLeft size={20} className="md:w-6 md:h-6" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 tracking-tighter drop-shadow-sm pb-2 mb-1">รายละเอียดประจำเดือน</h1>
              <p className="text-slate-500 dark:text-[#94A3B8] text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                <Activity size={12} className="text-blue-500" />
                {detailMonthName} {selectedYear}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="glass-panel glass-panel-hover p-8 rounded-[28px] flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-slate-500 dark:text-[#94A3B8] text-[10px] font-black uppercase tracking-[0.2em]">รายรับรวม</span>
            </div>
            <span className="text-4xl xl:text-5xl font-black text-emerald-500 tracking-tight drop-shadow-sm relative z-10">+{fmt(detailIncome)}</span>
          </div>

          <div className="glass-panel glass-panel-hover p-8 rounded-[28px] flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-all duration-700"></div>
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
              <span className="text-slate-500 dark:text-[#94A3B8] text-[10px] font-black uppercase tracking-[0.2em]">รายจ่ายรวม</span>
            </div>
            <span className="text-4xl xl:text-5xl font-black text-rose-500 tracking-tight drop-shadow-sm relative z-10">-{fmt(detailExpense)}</span>
          </div>

          <div className="glass-panel glass-panel-hover p-8 rounded-[28px] flex flex-col justify-center relative overflow-hidden group bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-[#0B1121]/80 dark:to-[#131C31]/80">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-all duration-700"></div>
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <div className={`w-1.5 h-1.5 rounded-full ${detailBalance >= 0 ? 'bg-violet-500' : 'bg-rose-500'}`}></div>
              <span className="text-slate-500 dark:text-[#94A3B8] text-[10px] font-black uppercase tracking-[0.2em]">คงเหลือสุทธิ (Net)</span>
            </div>
            <span className={`text-4xl xl:text-5xl font-black tracking-tight drop-shadow-sm relative z-10 ${detailBalance >= 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'text-rose-500'}`}>
              ฿{fmt(detailBalance)}
            </span>
          </div>
        </div>

        {/* Details Table */}
        <div className="glass-panel rounded-[32px] overflow-hidden animate-fade-in-up flex flex-col" style={{ animationDelay: '0.2s' }}>
          <div className="px-8 py-6 border-b border-slate-200/50 dark:border-white/10 flex justify-between items-center bg-slate-50/50 dark:bg-[#0B1121]/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-gradient-to-b from-blue-400 to-purple-600 rounded-full"></div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">รายการธุรกรรมเดือน {detailMonthName}</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse min-w-[900px] table-fixed">
              <thead>
                <tr className="bg-transparent text-slate-500 dark:text-[#94A3B8] text-[11px] font-black uppercase tracking-[0.15em] border-b border-slate-200/50 dark:border-white/5">
                  <th className="p-6 font-medium text-center">วันที่ (DATE)</th>
                  <th className="p-6 font-medium text-center">หมวดหมู่ (CATEGORY)</th>
                  <th className="p-6 font-medium text-center">ประเภท (TYPE)</th>
                  <th className="p-6 font-medium text-center">หมายเหตุ (NOTES)</th>
                  <th className="p-6 font-medium text-center">จำนวนเงิน (AMOUNT)</th>
                  <th className="p-6 font-medium text-center">หลักฐาน (RECEIPT)</th>
                  {isLoggedIn && <th className="p-6 font-medium text-center">จัดการ (ACTION)</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-white/5">
                {detailTransactions.map((t) => {
                  const isIncome = t.type === 'INCOME';
                  return (
                    <tr key={t.id} className="hover:bg-white/60 dark:hover:bg-white/5 transition-colors duration-200 group">
                      <td className="p-6 text-center overflow-hidden">
                        <div className="text-sm font-bold text-slate-600 dark:text-[#CBD5E1] whitespace-nowrap inline-block">{formatThaiDate(t.transaction_date)}</div>
                      </td>
                      <td className="p-6 text-center overflow-hidden">
                        <div className="inline-flex items-center justify-center gap-3 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1E293B]/50 border border-slate-200/50 dark:border-white/5 mx-auto">
                          <span className={`w-2 h-2 rounded-full ${isIncome ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'}`}></span>
                          <span className="text-xs font-bold text-slate-700 dark:text-[#E2E8F0]">{t.description}</span>
                        </div>
                      </td>
                      <td className="p-6 text-center overflow-hidden">
                        <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${isIncome ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.3)] dark:shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30 dark:border-rose-400/40 shadow-[0_0_15px_rgba(244,63,94,0.3)] dark:shadow-[0_0_20px_rgba(244,63,94,0.4)]'} mx-auto`}>
                          {isIncome ? 'รายรับ' : 'รายจ่าย'}
                        </span>
                      </td>
                      <td className="p-6 text-center overflow-hidden">
                        <div className="text-sm text-slate-500 dark:text-[#94A3B8] line-clamp-1 truncate mx-auto max-w-[200px]">{t.note || '-'}</div>
                      </td>
                      <td className="p-6 text-center overflow-hidden">
                        <div className={`text-base font-black tracking-tight whitespace-nowrap inline-block ${isIncome ? 'text-emerald-500 text-glow-emerald' : 'text-rose-500'}`}>
                          ฿{fmt(t.amount)}
                        </div>
                      </td>
                      <td className="p-6 text-center overflow-hidden">
                        <button onClick={(e) => { e.stopPropagation(); t.image_url && handleViewImage(t.image_url); }} className={`relative z-10 w-10 h-10 mx-auto rounded-[12px] bg-white dark:bg-[#060A13] border border-slate-200 dark:border-[#1E293B] overflow-hidden flex items-center justify-center transition-all duration-300 group/btn ${t.image_url ? 'cursor-pointer hover:scale-110 hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'opacity-40 cursor-default'}`}>
                          {t.image_url ? (
                            <><img src={t.image_url} alt="Evidence" className="w-full h-full object-cover group-hover/btn:scale-110 transition-transform duration-500" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover/btn:opacity-100 flex items-center justify-center transition-opacity duration-300"><ImageIcon size={14} className="text-white" /></div></>
                          ) : (<ImageIcon size={14} className="text-slate-400" />)}
                        </button>
                      </td>
                      {isLoggedIn && (
                        <td className="p-6 text-center relative z-20">
                          <div className="flex items-center justify-center space-x-3 transition-opacity duration-300 mx-auto w-max relative z-20">
                            <button onClick={(e) => { e.stopPropagation(); handleOpenEditTransaction(t); }} className="w-9 h-9 rounded-[10px] bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-sm hover:border-blue-500 dark:hover:border-blue-500 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:-translate-y-1 transition-all cursor-pointer relative z-30"><Edit size={14} /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(t.id); }} className="w-9 h-9 rounded-[10px] bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-sm hover:border-rose-500 dark:hover:border-rose-500 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:-translate-y-1 transition-all cursor-pointer relative z-30"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {detailTransactions.length === 0 && (
                  <tr><td colSpan={isLoggedIn ? "7" : "6"} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-[#64748B] space-y-3">
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 dark:border-[#334155] flex items-center justify-center"><Activity size={20} /></div>
                      <span className="text-xs font-black uppercase tracking-widest block">No Transactions in {detailMonthName}</span>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Reports View ---
  return (
    <div className="max-w-7xl mx-auto pb-20 mt-4 xl:mt-0 font-sans animate-fade-in">

      {/* Header section with Year Selector */}
      <div className="mb-10 relative">
        <div className="absolute -left-6 -top-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl animate-pulse-glow"></div>
        <div className="absolute top-0 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-2 pb-2 tracking-tighter drop-shadow-sm">Financial Analytics</h1>
            <p className="text-slate-500 dark:text-[#94A3B8] text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
              <PieIcon size={14} className="text-blue-500" />
              รายงานสรุปการเงินคริสตจักร ประจำปี
            </p>
          </div>

          {/* Glass Year Selector */}
          <div className="glass-panel p-1 rounded-2xl flex items-center justify-between md:justify-start w-full md:w-auto shadow-lg shadow-blue-500/5 mt-4 md:mt-0">
            <button
              onClick={() => setSelectedYear(y => y - 1)}
              className="p-4 md:p-3 text-slate-400 dark:text-[#64748B] hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all duration-300"
            >
              <ChevronLeft size={24} className="md:w-5 md:h-5" />
            </button>
            <div className="px-4 md:px-8 font-black text-2xl md:text-2xl text-slate-800 dark:text-white tracking-widest text-glow-emerald">
              {selectedYear}
            </div>
            <button
              onClick={() => setSelectedYear(y => y + 1)}
              className="p-4 md:p-3 text-slate-400 dark:text-[#64748B] hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all duration-300"
            >
              <ChevronRight size={24} className="md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Yearly Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        <div className="glass-panel glass-panel-hover p-6 rounded-[24px] flex justify-between items-start group relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <div className="text-slate-500 dark:text-[#94A3B8] text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">รายรับรวมทั้งปี</div>
            </div>
            <div className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white tracking-tight">฿{fmt(reportYearlyIncome)}</div>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/5 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500  shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <TrendingUp size={24} className="text-emerald-500" />
          </div>
        </div>

        <div className="glass-panel glass-panel-hover p-6 rounded-[24px] flex justify-between items-start group relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-all duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
              <div className="text-slate-500 dark:text-[#94A3B8] text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">รายจ่ายรวมทั้งปี</div>
            </div>
            <div className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white tracking-tight">฿{fmt(reportYearlyExpense)}</div>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400/20 to-rose-600/5 border border-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
            <TrendingDown size={24} className="text-rose-500" />
          </div>
        </div>

        <div className="glass-panel glass-panel-hover p-6 rounded-[24px] flex justify-between items-start group relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-all duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-1.5 h-1.5 rounded-full ${reportYearlyBalance >= 0 ? 'bg-violet-500' : 'bg-rose-500'}`}></div>
              <div className="text-slate-500 dark:text-[#94A3B8] text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">ยอดคงเหลือสุทธิปีนี้</div>
            </div>
            <div className={`text-3xl lg:text-4xl font-black tracking-tight ${reportYearlyBalance >= 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'text-rose-500'}`}>฿{fmt(reportYearlyBalance)}</div>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400/20 to-violet-600/5 border border-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
            <Wallet size={24} className="text-violet-500 dark:text-[#A78BFA]" />
          </div>
        </div>

        <div className="glass-panel glass-panel-hover p-6 rounded-[24px] flex justify-between items-start group relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              <div className="text-slate-500 dark:text-[#94A3B8] text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">อัตราการออมสุทธิ</div>
            </div>
            <div className="flex items-baseline gap-1">
              <div className={`text-3xl lg:text-4xl font-black tracking-tight ${reportSavingsRate >= 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400' : 'text-rose-500'}`}>{reportSavingsRate > 0 ? '+' : ''}{reportSavingsRate}</div>
              <span className="text-lg font-bold text-slate-500">%</span>
            </div>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400/20 to-blue-600/5 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Activity size={24} className="text-blue-500 dark:text-[#60A5FA]" />
          </div>
        </div>

      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">

        {/* Area Chart: Income vs Expense Trend */}
        <div className="glass-panel p-8 rounded-[32px] h-[450px] flex flex-col relative animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="absolute top-0 right-0 w-[80%] h-full bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none rounded-r-[32px]"></div>
          <div className="mb-8 relative z-10">
            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
              <span className="w-2 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></span>
              แนวโน้มรายรับ-รายจ่าย (12 เดือน)
            </h3>
            <p className="text-xs text-slate-500 ml-5 mt-1 font-bold uppercase tracking-widest">Yearly Trend Analysis</p>
          </div>

          <div className="flex-1 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportMonthlyStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncAreaLine" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34D399" stopOpacity={0.4} /><stop offset="95%" stopColor="#34D399" stopOpacity={0} /></linearGradient>
                  <linearGradient id="colorExpAreaLine" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FB7185" stopOpacity={0.4} /><stop offset="95%" stopColor="#FB7185" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-[#1E293B]" opacity={0.5} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontWeight: 700 }} dy={10} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontWeight: 700 }} tickFormatter={(val) => val >= 1000 ? (val / 1000) + 'k' : val} dx={-10} />
                <RechartsTooltip
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, strokeDasharray: '4 4' }}
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
                <Area type="monotone" dataKey="income" name="รายรับ" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorIncAreaLine)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981', style: { filter: 'drop-shadow(0px 0px 5px rgba(16,185,129,0.8))' } }} animationDuration={1500} animationEasing="ease-out" />
                <Area type="monotone" dataKey="expense" name="รายจ่าย" stroke="#F43F5E" strokeWidth={4} fillOpacity={1} fill="url(#colorExpAreaLine)" activeDot={{ r: 6, strokeWidth: 0, fill: '#F43F5E', style: { filter: 'drop-shadow(0px 0px 5px rgba(244,63,94,0.8))' } }} animationDuration={1500} animationEasing="ease-out" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Monthly Balances */}
        <div className="glass-panel p-8 rounded-[32px] h-[450px] flex flex-col relative animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="absolute top-0 left-0 w-[80%] h-full bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none rounded-l-[32px]"></div>
          <div className="mb-8 relative z-10">
            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
              <span className="w-2 h-6 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full"></span>
              เงินคงเหลือรายเดือนสุทธิ
            </h3>
            <p className="text-xs text-slate-500 ml-5 mt-1 font-bold uppercase tracking-widest">Monthly Net Balance</p>
          </div>
          <div className="flex-1 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportMonthlyStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-[#1E293B]" opacity={0.5} />
                <ReferenceLine y={0} stroke="#64748B" strokeWidth={2} opacity={0.5} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontWeight: 700 }} dy={10} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontWeight: 700 }} tickFormatter={(val) => val >= 1000 ? (val / 1000) + 'k' : (val <= -1000 ? (val / 1000) + 'k' : val)} dx={-10} />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]">
                          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-3">{label}</p>
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: payload[0].payload.balance >= 0 ? '#8B5CF6' : '#F43F5E', boxShadow: `0 0 10px ${payload[0].payload.balance >= 0 ? '#8B5CF6' : '#F43F5E'}` }}></div>
                            <span className="text-slate-200 font-bold text-xs">{payload[0].name}: <span className="font-black text-white ml-1">฿{fmt(payload[0].value)}</span></span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="balance" name="คงเหลือ" radius={[6, 6, 6, 6]} maxBarSize={24} animationDuration={1500} animationEasing="ease-out">
                  {reportMonthlyStats.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.balance >= 0 ? '#8B5CF6' : '#F43F5E'} className="drop-shadow-sm hover:opacity-80 transition-opacity" />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Summary Grids (12 Cards) */}
      <div className="mb-8 mt-12 md:mt-0 relative animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
        <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
          <LineChart className="text-blue-500 md:w-6 md:h-6" size={20} /> สรุปละเอียดรายเดือน
        </h3>
        <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 ml-8 md:ml-9">Monthly Breakdown Panel (คลิกเพื่อดูรายละเอียด)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-12 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
        {reportMonthlyStats.map((month, index) => {
          const isCurrentMonth = (index + 1) === currentMonthNum && selectedYear === currentYearNum;
          const hasData = month.income > 0 || month.expense > 0;

          return (
            <div
              key={index}
              onClick={() => hasData && setSelectedMonthDetail(index + 1)}
              className={`glass-panel p-5 rounded-[24px] relative overflow-hidden transition-all duration-300 group
                cursor-pointer hover:-translate-y-2 hover:shadow-[0_15px_30px_-5px_rgba(59,130,246,0.3)] hover:border-blue-400/50 dark:hover:border-blue-500/50
                ${!hasData ? 'opacity-70 grayscale-[50%] hover:opacity-100 hover:grayscale-0' : ''} 
                ${isCurrentMonth ? 'border-blue-400/50 dark:border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20 shadow-inner' : ''}`}
            >
              {isCurrentMonth && (
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-full blur-xl pointer-events-none"></div>
              )}

              <div className="flex justify-between items-center mb-5 relative z-10">
                <h4 className={`font-black text-lg tracking-wide transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400 ${isCurrentMonth ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>
                  {month.name}
                </h4>
                <div className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${month.balance >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-500/20'}`}>
                  {month.balance >= 0 ? 'สุทธิบวก' : 'สุทธิลบ'}
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#060A13]/50 border border-slate-100 dark:border-white/5 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-[#94A3B8] text-[11px] font-bold uppercase tracking-wider">รายรับ</span>
                    <span className="text-emerald-500 dark:text-[#4ADE80] font-black text-sm tracking-wide">+{fmt(month.income)}</span>
                  </div>
                  <div className="w-full h-px bg-slate-200/50 dark:bg-white/5"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-[#94A3B8] text-[11px] font-bold uppercase tracking-wider">รายจ่าย</span>
                    <span className="text-rose-500 dark:text-[#FB7185] font-black text-sm tracking-wide">-{fmt(month.expense)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end px-1">
                  <span className="text-slate-400 dark:text-[#64748B] text-[10px] font-bold uppercase tracking-widest">ยอดสุทธิ</span>
                  <span className={`font-black tracking-tight ${month.balance >= 0 ? 'text-slate-800 dark:text-white group-hover:text-blue-500 transition-colors' : 'text-rose-500'}`}>
                    ฿{fmt(month.balance)}
                  </span>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}