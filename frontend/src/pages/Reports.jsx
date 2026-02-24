import { useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, Activity, ArrowLeft, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

const MONTHS_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const FULL_MONTHS_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

export default function Reports({ transactions, fmt, formatThaiDate, handleViewImage, handleOpenEditTransaction, handleDeleteTransaction }) {
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

  if (selectedMonthDetail) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="flex items-center space-x-4 mb-8">
          <button 
            onClick={() => setSelectedMonthDetail(null)} 
            className="p-2.5 bg-slate-200 dark:bg-[#1E293B]/50 hover:bg-slate-300 dark:hover:bg-[#1E293B] text-slate-600 dark:text-[#94A3B8] hover:text-slate-800 dark:hover:text-white rounded-xl transition-all duration-300"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight transition-colors">รายละเอียดประจำเดือน</h1>
            <p className="text-slate-500 dark:text-[#94A3B8] text-sm mt-1 transition-colors">{detailMonthName} {selectedYear}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-[#0E1525] border border-slate-200 dark:border-[#1E293B] p-6 rounded-2xl flex flex-col justify-center transition-all shadow-sm">
            <span className="text-slate-500 dark:text-[#94A3B8] text-sm font-medium mb-2 transition-colors">รายรับรวม</span>
            <span className="text-3xl font-bold text-[#4ADE80] tracking-tight">+{fmt(detailIncome)}</span>
          </div>
          <div className="bg-white dark:bg-[#0E1525] border border-slate-200 dark:border-[#1E293B] p-6 rounded-2xl flex flex-col justify-center transition-all shadow-sm">
            <span className="text-slate-500 dark:text-[#94A3B8] text-sm font-medium mb-2 transition-colors">รายจ่ายรวม</span>
            <span className="text-3xl font-bold text-[#FB7185] tracking-tight">-{fmt(detailExpense)}</span>
          </div>
          <div className="bg-white dark:bg-[#0E1525] border border-slate-200 dark:border-[#1E293B] p-6 rounded-2xl flex flex-col justify-center transition-all shadow-sm">
            <span className="text-slate-500 dark:text-[#94A3B8] text-sm font-medium mb-2 transition-colors">คงเหลือสุทธิ</span>
            <span className={`text-3xl font-bold tracking-tight ${detailBalance >= 0 ? 'text-blue-500 dark:text-[#3B82F6]' : 'text-[#FB7185]'}`}>
              ฿{fmt(detailBalance)}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0E1525] border border-slate-200 dark:border-[#1E293B] rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0B1121]/50 border-b border-slate-200 dark:border-[#1E293B] text-slate-500 dark:text-[#94A3B8] text-sm transition-colors duration-300">
                  <th className="p-5 font-medium tracking-wide text-center">วันที่</th>
                  <th className="p-5 font-medium tracking-wide text-center">หมวดหมู่</th>
                  <th className="p-5 font-medium text-center tracking-wide">ประเภท</th>
                  <th className="p-5 font-medium text-center tracking-wide">หมายเหตุ</th>
                  <th className="p-5 font-medium text-center tracking-wide">หลักฐาน</th>
                  <th className="p-5 font-medium text-center tracking-wide">จำนวนเงิน</th>
                  <th className="p-5 font-medium text-center tracking-wide">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1E293B] transition-colors duration-300">
                {detailTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/30 transition-colors duration-200 group">
                    <td className="p-5 text-center text-slate-600 dark:text-[#94A3B8] text-sm group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{formatThaiDate(t.transaction_date)}</td>
                    <td className="p-5 text-center text-slate-800 dark:text-[#E2E8F0] transition-colors">
                      <div className="flex items-center justify-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${t.type === 'INCOME' ? 'bg-[#4ADE80]' : 'bg-[#FB7185]'}`}></span>
                        <span className="group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{t.description}</span>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium border ${t.type === 'INCOME' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-[#4ADE80] border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-[#FB7185] border-rose-200 dark:border-rose-500/20'}`}>
                        {t.type === 'INCOME' ? 'รายรับ' : 'รายจ่าย'}
                      </span>
                    </td>
                    <td className="p-5 text-center text-slate-500 dark:text-[#64748B] text-sm transition-colors">{t.note || '-'}</td>
                    <td className="p-5 text-center">
                      <button onClick={() => handleViewImage(t.image_url)} className={`group/btn relative inline-flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-50 dark:bg-[#060A13] border border-slate-200 dark:border-[#1E293B] overflow-hidden transition-all duration-300 mx-auto ${t.image_url ? 'hover:border-blue-400 dark:hover:border-[#3B82F6] cursor-pointer' : 'cursor-default opacity-50'}`}>
                        {t.image_url ? (
                          <><img src={t.image_url} alt="Evidence" className="w-full h-full object-cover group-hover/btn:scale-110 transition-transform duration-500" /><div className="absolute inset-0 bg-slate-900/40 dark:bg-black/40 opacity-0 group-hover/btn:opacity-100 flex items-center justify-center transition-opacity duration-300"><ImageIcon size={16} className="text-white" /></div></>
                        ) : (<div className="flex flex-col items-center justify-center text-slate-400 dark:text-[#64748B]"><ImageIcon size={16} /><span className="text-[9px] mt-1 tracking-wider">Evide</span></div>)}
                      </button>
                    </td>
                    <td className={`p-5 text-center font-bold tracking-wide transition-colors ${t.type === 'INCOME' ? 'text-emerald-500 dark:text-[#4ADE80]' : 'text-rose-500 dark:text-[#FB7185]'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}฿{fmt(t.amount)}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center space-x-2 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                        <button onClick={() => handleOpenEditTransaction(t)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1E293B]/50 hover:bg-slate-200 dark:hover:bg-[#1E293B] flex items-center justify-center text-slate-500 dark:text-[#94A3B8] hover:text-blue-500 dark:hover:text-[#3B82F6] transition-all"><Edit size={14} /></button>
                        <button onClick={() => handleDeleteTransaction(t.id)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1E293B]/50 hover:bg-rose-100 dark:hover:bg-rose-500/20 flex items-center justify-center text-slate-500 dark:text-[#94A3B8] hover:text-rose-500 dark:hover:text-rose-400 transition-all"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {detailTransactions.length === 0 && (
                  <tr><td colSpan="7" className="p-10 text-center text-slate-500 dark:text-[#64748B] transition-colors">ไม่พบรายการในเดือนนี้</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight transition-colors">รายงานการเงิน</h1>
          <p className="text-slate-500 dark:text-[#94A3B8] text-sm transition-colors">สรุปการเงินคริสตจักร ประจำปี {selectedYear}</p>
        </div>
        <div className="flex items-center bg-white dark:bg-[#0E1525] border border-slate-200 dark:border-[#1E293B] rounded-xl overflow-hidden shadow-sm dark:shadow-lg p-1 transition-colors duration-300">
          <button onClick={() => setSelectedYear(y => y - 1)} className="p-2 text-slate-500 dark:text-[#94A3B8] hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-lg transition-colors"><ChevronLeft size={20} /></button>
          <div className="px-6 font-bold text-slate-800 dark:text-white tracking-widest text-lg transition-colors">{selectedYear}</div>
          <button onClick={() => setSelectedYear(y => y + 1)} className="p-2 text-slate-500 dark:text-[#94A3B8] hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-lg transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-[#0E1525] border border-slate-200 dark:border-[#1E293B] p-6 rounded-2xl flex justify-between items-start transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 dark:hover:border-[#334155] shadow-sm dark:shadow-lg group">
          <div><div className="text-slate-500 dark:text-[#94A3B8] text-sm font-medium mb-1 transition-colors">รายรับรวม</div><div className="text-3xl font-bold text-[#4ADE80] tracking-tight">฿{fmt(reportYearlyIncome)}</div></div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center"><TrendingUp size={20} className="text-[#4ADE80]" /></div>
        </div>
        <div className="bg-white dark:bg-[#0E1525] border border-slate-200 dark:border-[#1E293B] p-6 rounded-2xl flex justify-between items-start transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 dark:hover:border-[#334155] shadow-sm dark:shadow-lg group">
          <div><div className="text-slate-500 dark:text-[#94A3B8] text-sm font-medium mb-1 transition-colors">รายจ่ายรวม</div><div className="text-3xl font-bold text-[#FB7185] tracking-tight">฿{fmt(reportYearlyExpense)}</div></div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center"><TrendingDown size={20} className="text-[#FB7185]" /></div>
        </div>
        <div className="bg-white dark:bg-[#0E1525] border border-slate-200 dark:border-[#1E293B] p-6 rounded-2xl flex justify-between items-start transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 dark:hover:border-[#334155] shadow-sm dark:shadow-lg group">
          <div><div className="text-slate-500 dark:text-[#94A3B8] text-sm font-medium mb-1 transition-colors">คงเหลือสุทธิ</div><div className={`text-3xl font-bold tracking-tight ${reportYearlyBalance >= 0 ? 'text-[#4ADE80]' : 'text-[#FB7185]'}`}>฿{fmt(reportYearlyBalance)}</div></div>
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center"><Wallet size={20} className="text-violet-500 dark:text-[#A78BFA]" /></div>
        </div>
        <div className="bg-white dark:bg-[#0E1525] border border-slate-200 dark:border-[#1E293B] p-6 rounded-2xl flex justify-between items-start transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-[#334155] shadow-sm dark:shadow-lg group">
          <div><div className="text-slate-500 dark:text-[#94A3B8] text-sm font-medium mb-1 transition-colors">อัตราออม</div><div className={`text-3xl font-bold tracking-tight ${reportSavingsRate >= 0 ? 'text-[#4ADE80]' : 'text-[#FB7185]'}`}>{reportSavingsRate > 0 ? '+' : ''}{reportSavingsRate}%</div></div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center border border-slate-200 dark:border-[#1E293B]"><Activity size={20} className="text-slate-500 dark:text-[#94A3B8]" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-[#0E1525] border border-slate-200 dark:border-[#1E293B] p-6 rounded-2xl shadow-sm dark:shadow-lg flex flex-col h-[400px] transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-[#334155]">
          <div className="flex items-center space-x-2 mb-6"><h3 className="text-lg font-bold text-slate-800 dark:text-white transition-colors">แนวโน้มรายรับรายจ่าย</h3></div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportMonthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncArea" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3}/><stop offset="95%" stopColor="#4ADE80" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorExpArea" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FB7185" stopOpacity={0.3}/><stop offset="95%" stopColor="#FB7185" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" strokeOpacity={0.5} vertical={false} className="dark:stroke-[#1E293B] dark:stroke-opacity-100" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000 ? (val/1000)+'k' : val} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} cursor={{stroke: '#94A3B8', strokeWidth: 2, strokeDasharray: '4 4'}} />
                <Area type="monotone" dataKey="income" name="รายรับ" stroke="#4ADE80" strokeWidth={3} fillOpacity={1} fill="url(#colorIncArea)" />
                <Area type="monotone" dataKey="expense" name="รายจ่าย" stroke="#FB7185" strokeWidth={3} fillOpacity={1} fill="url(#colorExpArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0E1525] border border-slate-200 dark:border-[#1E293B] p-6 rounded-2xl shadow-sm dark:shadow-lg flex flex-col h-[400px] transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-[#334155]">
          <div className="flex items-center space-x-2 mb-6"><h3 className="text-lg font-bold text-slate-800 dark:text-white transition-colors">ยอดคงเหลือรายเดือน</h3></div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportMonthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" strokeOpacity={0.5} vertical={false} className="dark:stroke-[#1E293B] dark:stroke-opacity-100" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000 ? (val/1000)+'k' : (val <= -1000 ? (val/1000)+'k' : val)} />
                <RechartsTooltip cursor={{fill: '#E2E8F0', opacity: 0.4}} contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="balance" name="คงเหลือ" radius={[4, 4, 4, 4]} maxBarSize={30}>
                  {reportMonthlyStats.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.balance >= 0 ? '#3B82F6' : '#EF4444'} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mb-6"><h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-wide transition-colors">สรุปรายเดือน (มกราคม - ธันวาคม)</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
        {reportMonthlyStats.map((month, index) => {
          const isCurrentMonth = (index + 1) === currentMonthNum && selectedYear === currentYearNum;
          return (
            <div 
              key={index} 
              onClick={() => setSelectedMonthDetail(index + 1)} 
              className={`bg-slate-50 dark:bg-[#060A13] border p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:hover:shadow-xl group 
                ${isCurrentMonth ? 'border-blue-500 dark:border-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.1)] dark:shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-slate-200 dark:border-[#1E293B] hover:border-emerald-400 dark:hover:border-[#4ADE80]'}`}
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className={`font-bold text-lg transition-colors 
                  ${isCurrentMonth ? 'text-blue-600 dark:text-[#3B82F6]' : 'text-slate-800 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-[#4ADE80]'}`}>
                  {month.name}
                </h4>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${month.balance >= 0 ? 'bg-emerald-100 dark:bg-[#4ADE80]/10 text-emerald-600 dark:text-[#4ADE80]' : 'bg-rose-100 dark:bg-[#FB7185]/10 text-rose-600 dark:text-[#FB7185]'}`}>
                  {month.balance >= 0 ? 'คงเหลือ' : 'ติดลบ'} {month.balance >= 0 ? '+' : ''}฿{fmt(month.balance)}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#1E293B] pb-2 transition-colors"><span className="text-slate-500 dark:text-[#94A3B8] text-sm font-medium transition-colors">รายรับ</span><span className="text-emerald-500 dark:text-[#4ADE80] font-bold text-sm tracking-wide transition-colors">+{fmt(month.income)}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-[#94A3B8] text-sm font-medium transition-colors">รายจ่าย</span><span className="text-rose-500 dark:text-[#FB7185] font-bold text-sm tracking-wide transition-colors">-{fmt(month.expense)}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}