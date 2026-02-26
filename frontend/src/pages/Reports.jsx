import { useState, useRef } from 'react';
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
    detailTransactions = transactions.filter(t => t.transaction_date.startsWith(`${selectedYear}-${monthIndexStr}`));
    detailIncome = detailTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    detailExpense = detailTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    detailBalance = detailIncome - detailExpense;
    detailMonthName = FULL_MONTHS_TH[selectedMonthDetail - 1];
    detailTransactions.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  }

  // ========== ฟังก์ชัน Export ข้อมูล (ดาวน์โหลดเป็น CSV) ==========
  const handleExportCSV = (dataToExport, filenamePrefix) => {
    if (!dataToExport || dataToExport.length === 0) {
      alert("ไม่มีข้อมูลที่จะส่งออก");
      return;
    }

    const exportData = dataToExport.map(t => ({
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
    link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().split('T')[0]}.csv`);
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
      complete: (results) => {
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

        fetch('/church_api/add_transaction.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedData)
        })
          .then(res => res.json())
          .then(resData => {
            if (resData.status === 'success') {
              alert(resData.message);
              window.location.reload();
            } else {
              alert("เกิดข้อผิดพลาด: " + resData.message);
            }
          })
          .catch(err => {
            console.error(err);
            alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
          });

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
              <p className="text-slate-500 dark:text-[#94A3B8] text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                <Activity size={12} className="text-blue-500" />
                {detailMonthName} {selectedYear}
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0 md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2">
            <button
              onClick={() => handleExportCSV(detailTransactions, `worship_data_${selectedYear}_${selectedMonthDetail.toString().padStart(2, '0')}`)}
              className="group relative flex flex-1 md:flex-none items-center justify-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white px-5 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-sm"
            >
              <Download size={16} className="text-blue-400 group-hover:translate-y-1 transition-transform duration-300" />
              <span>ส่งออกรายเดือน</span>
            </button>
          </div>
        </div>

        {/* Detailed Summary Cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="glass-panel p-4 md:p-8 rounded-[20px] md:rounded-[28px] flex flex-col justify-center relative overflow-hidden group">
            <div className="flex items-center gap-1.5 mb-2 relative z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
              <span className="text-slate-500 dark:text-[#94A3B8] text-[10px] md:text-xs font-black uppercase tracking-[0.15em]">รายรับรวม</span>
            </div>
            <span className="text-xl md:text-4xl xl:text-5xl font-black text-emerald-500 tracking-tight drop-shadow-sm relative z-10">+{fmt(detailIncome)}</span>
          </div>
          <div className="glass-panel p-4 md:p-8 rounded-[20px] md:rounded-[28px] flex flex-col justify-center relative overflow-hidden group">
            <div className="flex items-center gap-1.5 mb-2 relative z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></div>
              <span className="text-slate-500 dark:text-[#94A3B8] text-[10px] md:text-xs font-black uppercase tracking-[0.15em]">รายจ่ายรวม</span>
            </div>
            <span className="text-xl md:text-4xl xl:text-5xl font-black text-rose-500 tracking-tight drop-shadow-sm relative z-10">-{fmt(detailExpense)}</span>
          </div>
          <div className="glass-panel p-4 md:p-8 rounded-[20px] md:rounded-[28px] flex flex-col justify-center relative overflow-hidden group">
            <div className="flex items-center gap-1.5 mb-2 relative z-10">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${detailBalance >= 0 ? 'bg-violet-500' : 'bg-rose-500'}`}></div>
              <span className="text-slate-500 dark:text-[#94A3B8] text-[10px] md:text-xs font-black uppercase tracking-[0.15em]">คงเหลือ</span>
            </div>
            <span className={`text-xl md:text-4xl xl:text-5xl font-black tracking-tight drop-shadow-sm relative z-10 ${detailBalance >= 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'text-rose-500'}`}>฿{fmt(detailBalance)}</span>
          </div>
        </div>

        {/* Premium Card Grid — All screens */}
        <div className="glass-panel rounded-[28px] overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="px-5 py-4 border-b border-slate-200/50 dark:border-white/10 flex items-center gap-3 bg-slate-50/50 dark:bg-[#0B1121]/50">
            <div className="w-1.5 h-5 bg-gradient-to-b from-blue-400 to-purple-600 rounded-full"></div>
            <h3 className="text-base font-black text-slate-800 dark:text-white">รายการเดือน {detailMonthName}</h3>
          </div>
          {detailTransactions.length === 0 ? (
            <div className="p-10 flex flex-col items-center text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 dark:border-[#334155] flex items-center justify-center"><Activity size={18} /></div>
              <span className="text-xs font-black uppercase tracking-widest">No Transactions in {detailMonthName}</span>
            </div>
          ) : (
            <div className="px-3 pb-3 pt-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              {detailTransactions.map((t) => {
                const isIncome = t.type === 'INCOME';
                return (
                  <div
                    key={t.id}
                    className={`glass-panel relative rounded-[22px] overflow-hidden
                    border ${isIncome ? 'border-emerald-400/40 dark:border-emerald-500/30' : 'border-rose-400/40 dark:border-rose-500/30'}`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-[2px] ${isIncome ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent' : 'bg-gradient-to-r from-transparent via-rose-400 to-transparent'}`} />
                    <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl pointer-events-none opacity-0 dark:opacity-100 ${isIncome ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`} />

                    {/* HEADER */}
                    <div className="relative flex items-center justify-between px-5 pt-4 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${isIncome ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)]' : 'bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.9)]'}`} />
                        <span className={`text-sm font-black tracking-[0.25em] uppercase ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>{isIncome ? 'รายรับ' : 'รายจ่าย'}</span>
                      </div>
                      <span className="text-sm text-slate-500 dark:text-white font-bold tracking-wide">{formatThaiDate(t.transaction_date)}</span>
                    </div>

                    <div className={`mx-5 h-px ${isIncome ? 'bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent' : 'bg-gradient-to-r from-transparent via-rose-500/30 to-transparent'}`} />

                    {/* BODY */}
                    <div className="relative flex items-center justify-between px-5 py-4">
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-base font-black text-slate-800 dark:text-white mb-1.5 truncate tracking-tight">{t.description}</p>
                        <span className={`text-2xl font-black tracking-tight ${isIncome ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-300 dark:to-emerald-500' : 'text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-rose-600 dark:from-rose-300 dark:to-rose-500'}`}>
                          {isIncome ? '+' : '-'}฿{fmt(t.amount)}
                        </span>
                      </div>
                      <button
                        onClick={() => t.image_url && handleViewImage(t.image_url)}
                        className={`relative w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden transition-all duration-300 active:scale-95
                        ${t.image_url
                            ? `cursor-pointer border-2 ${isIncome ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.3)]'}`
                            : 'border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 cursor-default opacity-40'}`}
                      >
                        {t.image_url ? <img src={t.image_url} alt="Evidence" className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-slate-400 dark:text-white/30" />}
                      </button>
                    </div>

                    <div className={`mx-5 h-px ${isIncome ? 'bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent' : 'bg-gradient-to-r from-transparent via-rose-500/20 to-transparent'}`} />

                    {/* FOOTER */}
                    <div className="flex items-center justify-between px-5 py-3.5">
                      <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                        <span className="text-slate-400 dark:text-white/25 text-[10px] font-black uppercase tracking-widest shrink-0">NOTE</span>
                        <span className="text-xs text-slate-500 dark:text-white/60 font-medium truncate">{t.note || '—'}</span>
                      </div>
                      {isLoggedIn && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); handleOpenEditTransaction(t); }} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15 flex items-center justify-center text-slate-400 dark:text-white/50 hover:text-blue-500 hover:border-blue-400/50 active:scale-95 transition-all"><Edit size={13} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(t.id); }} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15 flex items-center justify-center text-slate-400 dark:text-white/50 hover:text-rose-500 hover:border-rose-400/50 active:scale-95 transition-all"><Trash2 size={13} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Main Reports View ---
  return (
    <div className="max-w-7xl mx-auto pb-20 mt-4 xl:mt-0 font-sans animate-fade-in" id="reports-main">

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
          <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0">
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => handleExportCSV(reportTransactions, `worship_data_yearly_${selectedYear}`)}
                className="group relative flex flex-1 md:flex-none items-center justify-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white px-4 py-3 md:py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-sm"
              >
                <Download size={14} className="text-blue-400 group-hover:translate-y-1 transition-transform duration-300" />
                <span className="whitespace-nowrap">ส่งออกรายปี</span>
              </button>
            </div>

            <div className="glass-panel p-1 rounded-2xl flex items-center justify-between md:justify-start w-full md:w-auto shadow-lg shadow-blue-500/5">
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
      </div>

      {/* Yearly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8">

        <div className="glass-panel glass-panel-hover p-6 rounded-[24px] flex justify-between items-start group relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <div className="text-slate-500 dark:text-[#94A3B8] text-xs font-black uppercase tracking-[0.15em] whitespace-nowrap">รายรับรวมทั้งปี</div>
            </div>
            <div className="text-3xl lg:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-500">฿{fmt(reportYearlyIncome)}</div>
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
              <div className="text-slate-500 dark:text-[#94A3B8] text-xs font-black uppercase tracking-[0.15em] whitespace-nowrap">รายจ่ายรวมทั้งปี</div>
            </div>
            <div className="text-3xl lg:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-rose-700 dark:from-rose-400 dark:to-rose-500">฿{fmt(reportYearlyExpense)}</div>
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
              <div className="text-slate-500 dark:text-[#94A3B8] text-xs font-black uppercase tracking-[0.15em] whitespace-nowrap">ยอดคงเหลือสุทธิปีนี้</div>
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
              <div className="text-slate-500 dark:text-[#94A3B8] text-xs font-black uppercase tracking-[0.15em] whitespace-nowrap">อัตราการออมสุทธิ</div>
            </div>
            <div className="flex items-baseline gap-1">
              <div className={`text-3xl lg:text-4xl font-black tracking-tight ${reportSavingsRate >= 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400' : 'text-rose-500'}`}>{reportSavingsRate > 0 ? '+' : ''}{reportSavingsRate}</div>
              <span className="text-lg font-bold text-slate-500">%</span>
            </div>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400/20 to-blue-600/5 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Activity size={24} className="text-blue-500 dark:text-[#60A5FA]" />
          </div>
        </div>

      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">

        {/* Area Chart: Income vs Expense Trend */}
        <div className="glass-panel p-5 md:p-8 rounded-[24px] md:rounded-[32px] h-[300px] md:h-[450px] flex flex-col relative animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
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
        <div className="glass-panel p-5 md:p-8 rounded-[24px] md:rounded-[32px] h-[300px] md:h-[450px] flex flex-col relative animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
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
      <div className="mb-6 mt-8 md:mt-0 relative animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
        <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
          <LineChart className="text-blue-500 md:w-6 md:h-6" size={20} /> สรุปละเอียดรายเดือน
        </h3>
        <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 ml-8 md:ml-9">Monthly Breakdown Panel (คลิกเพื่อดูรายละเอียด)</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-12 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
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