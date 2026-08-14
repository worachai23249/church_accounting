import { useState, useRef } from 'react';
import { addTransaction } from '../supabase';

import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, Activity, ArrowLeft, Edit, Trash2, Image as ImageIcon, PieChart as PieIcon, LineChart, Download, Upload } from 'lucide-react';
import Papa from 'papaparse';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const MONTHS_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const FULL_MONTHS_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

export default function Reports({ transactions, fmt, formatThaiDate, handleViewImage, handleOpenEditTransaction, handleDeleteTransaction, isLoggedIn = true }) {
  const currentMonthNum = new Date().getMonth() + 1;
  const currentYearNum = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYearNum);
  const [selectedMonthDetail, setSelectedMonthDetail] = useState(null);
  const fileInputRef = useRef(null);

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
    detailTransactions = reportTransactions.filter(t => t.transaction_date.startsWith(`${selectedYear}-${monthIndexStr}`));
    detailTransactions.forEach(t => {
      if (t.type === 'INCOME') detailIncome += parseFloat(t.amount);
      else detailExpense += parseFloat(t.amount);
    });
    detailBalance = detailIncome - detailExpense;
    detailMonthName = FULL_MONTHS_TH[selectedMonthDetail - 1];
    detailTransactions.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  }

  // ========== ฟังก์ชัน Export ข้อมูล (ดาวน์โหลดเป็น CSV) ==========
  const handleExportCSV = () => {
    if (reportTransactions.length === 0) {
      alert("ไม่มีข้อมูลที่จะส่งออก");
      return;
    }

    const exportData = reportTransactions.map(t => ({
      วันที่: new Date(t.transaction_date).toLocaleDateString('th-TH'),
      ประเภท: t.type === 'INCOME' ? 'รายรับ' : 'รายจ่าย',
      หมวดหมู่: t.description,
      จำนวนเงิน: Number(t.amount).toFixed(2),
      หมายเหตุ: t.note || '',
      รูปภาพ: t.image_url ? '[มีรูปภาพแนบ]' : '-'
    }));

    const csv = Papa.unparse(exportData);
    const csvData = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(csvData);
    link.setAttribute('download', `worship_report_${selectedYear}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ========== ฟังก์ชัน Import ข้อมูล (อัปโหลดจาก CSV) ==========
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data;
        if (data.length === 0) {
          alert("ไม่พบข้อมูลในไฟล์ หรือไฟล์ผิดรูปแบบ");
          return;
        }

        const formattedData = data.map(row => {
          let dateStr = row['วันที่'] || new Date().toISOString().split('T')[0];
          if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              let year = parseInt(parts[2]);
              if (year > 2500) year -= 543;
              dateStr = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          }

          return {
            transaction_date: dateStr,
            type: row['ประเภท'] === 'รายรับ' ? 'INCOME' : 'EXPENSE',
            description: row['หมวดหมู่'] || 'Uncategorized',
            amount: parseFloat(row['จำนวนเงิน']?.toString().replace(/,/g, '') || 0),
            note: row['หมายเหตุ'] || '',
            image_url: null
          };
        });

        try {
          const resData = await addTransaction(formattedData);
          if (resData.status === 'success') {
            alert(resData.message);
            window.location.reload();
          } else {
            alert("เกิดข้อผิดพลาด: " + resData.message);
          }
        } catch (err) {
          console.error(err);
          alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
        }

        e.target.value = null;
      },
      error: (error) => {
        alert("อ่านไฟล์ไม่สำเร็จ: " + error.message);
      }
    });
  };

  // --- Render Month Details View ---
  if (selectedMonthDetail) {
    return (
      <div className="max-w-7xl mx-auto pb-20 mt-4 xl:mt-0 font-sans">
        {/* Header */}
        <div className="mb-8 relative animate-fade-in-up">
          <div className="absolute -left-6 -top-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl animate-pulse-glow"></div>
          <div className="flex items-center gap-4 relative z-10">
            <button onClick={() => setSelectedMonthDetail(null)} className="w-11 h-11 md:w-14 md:h-14 bg-white/70 dark:bg-[#0B1121]/60 backdrop-blur-md border border-white/20 dark:border-white/5 rounded-full flex items-center justify-center text-slate-500 dark:text-[#94A3B8] hover:text-blue-500 hover:scale-110 transition-all duration-300 shrink-0">
              <ArrowLeft size={18} className="md:w-6 md:h-6" />
            </button>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 tracking-tighter drop-shadow-sm pb-1">รายละเอียดประจำเดือน</h1>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">รายละเอียดประจำเดือน</h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">{detailMonthName} {selectedYear}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8 animate-fade-in-up">
          <div className="glass-panel p-4 md:p-8 rounded-[20px] md:rounded-[28px]">
            <span className="text-[10px] md:text-xs font-black uppercase text-slate-500">รายรับรวม</span>
            <div className="text-xl md:text-4xl font-black text-emerald-500">+{fmt(detailIncome)}</div>
          </div>
          <div className="glass-panel p-4 md:p-8 rounded-[20px] md:rounded-[28px]">
            <span className="text-[10px] md:text-xs font-black uppercase text-slate-500">รายจ่ายรวม</span>
            <div className="text-xl md:text-4xl font-black text-rose-500">-{fmt(detailExpense)}</div>
          </div>
          <div className="glass-panel p-4 md:p-8 rounded-[20px] md:rounded-[28px]">
            <span className="text-[10px] md:text-xs font-black uppercase text-slate-500">คงเหลือ</span>
            <div className={`text-xl md:text-4xl font-black ${detailBalance >= 0 ? 'text-violet-500' : 'text-rose-500'}`}>฿{fmt(detailBalance)}</div>
          </div>
        </div>

        <div className="glass-panel rounded-[28px] overflow-hidden animate-fade-in-up">
          <div className="px-5 py-4 border-b border-slate-200/50 dark:border-white/10 bg-slate-50/50">
            <h3 className="text-base font-black">รายการเดือน {detailMonthName}</h3>
          </div>
          {detailTransactions.length === 0 ? (
            <div className="p-10 text-center text-slate-400">No Transactions</div>
          ) : (
            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              {detailTransactions.map((t) => {
                const isIncome = t.type === 'INCOME';
                return (
                  <div key={t.id} className={`glass-panel p-5 rounded-[22px] border ${isIncome ? 'border-emerald-400/20' : 'border-rose-400/20'}`}>
                    <div className="flex justify-between items-center mb-4">
                      <span className={`text-xs font-black uppercase ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>{isIncome ? 'รายรับ' : 'รายจ่าย'}</span>
                      <span className="text-sm font-bold text-slate-500">{formatThaiDate(t.transaction_date)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-base font-black truncate">{t.description}</p>
                      <span className={`text-xl font-black ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>{isIncome ? '+' : '-'}฿{fmt(t.amount)}</span>
                    </div>
                    {isLoggedIn && (
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => handleOpenEditTransaction(t)} className="p-2 bg-slate-100 rounded-lg"><Edit size={14} /></button>
                        <button onClick={() => handleDeleteTransaction(t.id)} className="p-2 bg-slate-100 rounded-lg text-rose-500"><Trash2 size={14} /></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 mt-4 xl:mt-0 font-sans">
      <div className="mb-10 relative animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-2 tracking-tighter">Financial Analytics</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <PieIcon size={14} className="text-blue-500" /> รายงานสรุปการเงินคริสตจักร ประจำปี
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleExportCSV} className="bg-white border border-slate-200 px-6 py-2.5 rounded-full font-black text-xs uppercase transition-all hover:bg-slate-50">ส่งออกรายปี</button>
            <div className="glass-panel p-1 rounded-2xl flex items-center">
              <button onClick={() => setSelectedYear(y => y - 1)} className="p-3 text-slate-400 hover:text-blue-500"><ChevronLeft size={20} /></button>
              <div className="px-6 font-black text-xl tracking-widest">{selectedYear}</div>
              <button onClick={() => setSelectedYear(y => y + 1)} className="p-3 text-slate-400 hover:text-blue-500"><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'รายรับรวมทั้งปี', val: fmt(reportYearlyIncome), color: 'text-emerald-500', icon: TrendingUp },
          { label: 'รายจ่ายรวมทั้งปี', val: fmt(reportYearlyExpense), color: 'text-rose-500', icon: TrendingDown },
          { label: 'ยอดคงเหลือสุทธิ', val: fmt(reportYearlyBalance), color: 'text-violet-500', icon: Wallet },
          { label: 'อัตราการออม', val: reportSavingsRate + '%', color: 'text-blue-500', icon: Activity }
        ].map((item, i) => (
          <div key={i} className="glass-panel p-6 rounded-[24px] animate-fade-in-up">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</div>
            </div>
            <div className={`text-3xl font-black ${item.color}`}>฿{item.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
        <div className="glass-panel p-8 rounded-[32px] h-[400px] flex flex-col animate-fade-in-up">
          <h3 className="text-lg font-black mb-6">แนวโน้มรายรับ-รายจ่าย (12 เดือน)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={reportMonthlyStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <RechartsTooltip />
              <Area type="monotone" dataKey="income" stroke="#10B981" fill="#10B981" fillOpacity={0.1} animationDuration={600} />
              <Area type="monotone" dataKey="expense" stroke="#F43F5E" fill="#F43F5E" fillOpacity={0.1} animationDuration={600} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-8 rounded-[32px] h-[400px] flex flex-col animate-fade-in-up">
          <h3 className="text-lg font-black mb-6">เงินคงเหลือรายเดือนสุทธิ</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportMonthlyStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <ReferenceLine y={0} stroke="#64748B" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <RechartsTooltip />
              <Bar dataKey="balance" animationDuration={600}>
                {reportMonthlyStats.map((entry, index) => <Cell key={index} fill={entry.balance >= 0 ? '#8B5CF6' : '#F43F5E'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-12 animate-fade-in-up">
        {reportMonthlyStats.map((month, index) => (
          <div key={index} onClick={() => month.income > 0 && setSelectedMonthDetail(index + 1)} className="glass-panel p-5 rounded-[24px] cursor-pointer hover:border-blue-400/50 transition-all">
            <h4 className="font-black text-lg mb-4">{month.name}</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-emerald-500"><span>รายรับ</span> <span>+{fmt(month.income)}</span></div>
              <div className="flex justify-between text-xs font-bold text-rose-500"><span>รายจ่าย</span> <span>-{fmt(month.expense)}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}