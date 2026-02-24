import { useState } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon, Database, Filter } from 'lucide-react';

export default function Record({ transactions, formatThaiDate, fmt, handleViewImage, handleOpenAddTransaction, handleOpenEditTransaction, handleDeleteTransaction }) {
  const [filterType, setFilterType] = useState('ALL');

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto pb-20 mt-4 xl:mt-0">

      {/* Header section */}
      <div className="mb-10 relative animate-fade-in-up">
        <div className="absolute -left-6 -top-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl animate-pulse-glow"></div>
        <div className="absolute top-0 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-2 pb-2 tracking-tighter drop-shadow-sm">Transaction Logs</h1>
            <p className="text-slate-500 dark:text-[#94A3B8] text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
              <Database size={14} className="text-blue-500" />
              บันทึกการเงินและรายการทั้งหมด
            </p>
          </div>
          <button
            onClick={handleOpenAddTransaction}
            className="group relative flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:-translate-y-1 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300 relative z-10" />
            <span className="relative z-10">บันทึกรายการ</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white/70 dark:bg-[#0B1121]/60 backdrop-blur-md border border-white/20 dark:border-white/5 rounded-[24px] p-2 mb-8 max-w-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <button
          onClick={() => setFilterType('ALL')}
          className={`group flex-1 py-3.5 rounded-[18px] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${filterType === 'ALL' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}>
          <Filter size={16} className={`${filterType === 'ALL' ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`} />
          ทั้งหมด (All)
        </button>
        <button
          onClick={() => setFilterType('INCOME')}
          className={`flex-1 py-3.5 rounded-[18px] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${filterType === 'INCOME' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-slate-500 dark:text-[#94A3B8] hover:text-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10'}`}>
          <span className={`w-2 h-2 rounded-full ${filterType === 'INCOME' ? 'bg-white' : 'bg-emerald-500'}`}></span>
          รายรับ (In)
        </button>
        <button
          onClick={() => setFilterType('EXPENSE')}
          className={`flex-1 py-3.5 rounded-[18px] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${filterType === 'EXPENSE' ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'text-slate-500 dark:text-[#94A3B8] hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-500/10'}`}>
          <span className={`w-2 h-2 rounded-full ${filterType === 'EXPENSE' ? 'bg-white' : 'bg-rose-500'}`}></span>
          รายจ่าย (Out)
        </button>
      </div>

      {/* Main Table Container */}
      <div className="glass-panel rounded-[32px] overflow-hidden animate-fade-in-up flex flex-col" style={{ animationDelay: '0.2s' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[900px] table-fixed">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-[#0B1121]/80 backdrop-blur-md text-slate-500 dark:text-[#94A3B8] text-[11px] font-black uppercase tracking-[0.15em] border-b border-slate-200/50 dark:border-white/5">
                <th className="p-6 w-[14.28%] text-center font-medium">วันที่ (DATE)</th>
                <th className="p-6 w-[14.28%] text-center font-medium">หมวดหมู่ (CATEGORY)</th>
                <th className="p-6 w-[14.28%] text-center font-medium">ประเภท (TYPE)</th>
                <th className="p-6 w-[14.28%] text-center font-medium">หมายเหตุ (NOTES)</th>
                <th className="p-6 w-[14.28%] text-center font-medium">จำนวนเงิน (AMT)</th>
                <th className="p-6 w-[14.28%] text-center font-medium">หลักฐาน (RECEIPT)</th>
                <th className="p-6 w-[14.28%] text-center font-medium">จัดการ (ACTION)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 dark:divide-white/5">
              {filteredTransactions.map((t) => {
                const isIncome = t.type === 'INCOME';
                return (
                  <tr key={t.id} className="hover:bg-white/60 dark:hover:bg-white/5 transition-colors duration-200 group">
                    <td className="p-6 text-center overflow-hidden">
                      <div className="text-sm font-bold text-slate-600 dark:text-[#CBD5E1] whitespace-nowrap inline-block">{formatThaiDate(t.transaction_date)}</div>
                    </td>

                    <td className="p-6 text-center overflow-hidden">
                      <div className="inline-flex items-center justify-center gap-3 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1E293B]/50 border border-slate-200/50 dark:border-white/5 mx-auto">
                        <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${isIncome ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'}`}></span>
                        <span className="text-xs font-bold text-slate-700 dark:text-[#E2E8F0] whitespace-nowrap">{t.description}</span>
                      </div>
                    </td>

                    <td className="p-6 text-center overflow-hidden">
                      <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${isIncome ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.3)] dark:shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30 dark:border-rose-400/40 shadow-[0_0_15px_rgba(244,63,94,0.3)] dark:shadow-[0_0_20px_rgba(244,63,94,0.4)]'} mx-auto`}>
                        {isIncome ? 'รายรับ' : 'รายจ่าย'}
                      </div>
                    </td>

                    <td className="p-6 text-center overflow-hidden">
                      <div className="text-sm text-slate-500 dark:text-[#94A3B8] line-clamp-1 truncate mx-auto max-w-[200px]">{t.note || '-'}</div>
                    </td>

                    <td className="p-6 text-center overflow-hidden">
                      <div className={`text-lg font-black tracking-tight whitespace-nowrap inline-block ${isIncome ? 'text-emerald-500 text-glow-emerald' : 'text-rose-500'}`}>
                        ฿{fmt(t.amount)}
                      </div>
                    </td>

                    <td className="p-6 text-center overflow-hidden">
                      <button
                        onClick={(e) => { e.stopPropagation(); t.image_url && handleViewImage(t.image_url); }}
                        className={`relative z-10 w-12 h-12 mx-auto rounded-[16px] bg-white dark:bg-[#060A13] border border-slate-200 dark:border-[#1E293B] overflow-hidden flex items-center justify-center transition-all duration-300 group/btn ${t.image_url ? 'cursor-pointer hover:scale-110 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'opacity-40 cursor-default'}`}
                        title={t.image_url ? 'คลิกเพื่อดูรูป' : 'ไม่มีรูปภาพ'}
                      >
                        {t.image_url ? (
                          <>
                            <img src={t.image_url} alt="Receipt" className="w-full h-full object-cover group-hover/btn:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/btn:opacity-100 flex items-center justify-center transition-all">
                              <ImageIcon size={16} className="text-white" />
                            </div>
                          </>
                        ) : (
                          <ImageIcon size={18} className="text-slate-400" />
                        )}
                      </button>
                    </td>

                    <td className="p-6 text-center relative z-20">
                      <div className="flex items-center justify-center space-x-3 transition-opacity duration-300 mx-auto w-max relative z-20">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenEditTransaction(t); }}
                          className="w-10 h-10 rounded-[14px] bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-sm hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center text-slate-500 dark:text-[#94A3B8] hover:text-blue-500 dark:hover:text-[#3B82F6] hover:-translate-y-1 transition-all cursor-pointer relative z-30"
                          title="แก้ไขรายการ"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(t.id); }}
                          className="w-10 h-10 rounded-[14px] bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-sm hover:border-rose-500 dark:hover:border-rose-500 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] flex items-center justify-center text-slate-500 dark:text-[#94A3B8] hover:text-rose-500 dark:hover:text-rose-400 hover:-translate-y-1 transition-all cursor-pointer relative z-30"
                          title="ลบรายการ"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-4">
                      <div className="w-20 h-20 rounded-full border-4 border-dashed border-slate-300 dark:border-[#334155] flex items-center justify-center animate-spin-slow">
                        <Database size={24} className="animate-none" />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-black uppercase tracking-widest block text-slate-500 dark:text-[#94A3B8]">No Data Found</span>
                        <span className="text-xs text-slate-400 mt-1 block">ไม่พบข้อมูลในหมวดหมู่นี้</span>
                      </div>
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