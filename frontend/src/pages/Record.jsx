import { useState } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';

export default function Record({ transactions, formatThaiDate, fmt, handleViewImage, handleOpenAddTransaction, handleOpenEditTransaction, handleDeleteTransaction }) {
  const [filterType, setFilterType] = useState('ALL');

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight transition-colors">บันทึกการเงิน</h2>
          <p className="text-slate-500 dark:text-[#94A3B8] text-sm transition-colors">รายการรับและจ่ายคริสตจักร</p>
        </div>
        <button onClick={handleOpenAddTransaction} className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:-translate-y-1 active:scale-95">
          <Plus size={18} />
          <span>บันทึกรายการ</span>
        </button>
      </div>

      <div className="flex bg-white dark:bg-[#0E1525] border border-slate-200 dark:border-[#1E293B] rounded-xl p-1.5 mb-6 max-w-2xl shadow-sm transition-colors duration-300">
        <button 
          onClick={() => setFilterType('ALL')} 
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${filterType === 'ALL' ? 'bg-gradient-to-r from-blue-400 via-blue-600 to-blue-950 text-white shadow-md' : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B]/50'}`}>
          ทั้งหมด
        </button>
        <button 
          onClick={() => setFilterType('INCOME')} 
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${filterType === 'INCOME' ? 'bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-950 text-white shadow-md' : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B]/50'}`}>
          รายรับ
        </button>
        <button 
          onClick={() => setFilterType('EXPENSE')} 
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${filterType === 'EXPENSE' ? 'bg-gradient-to-r from-rose-400 via-rose-600 to-rose-950 text-white shadow-md' : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B]/50'}`}>
          รายจ่าย
        </button>
      </div>

      <div className="bg-white dark:bg-[#0E1525] border border-slate-200 dark:border-[#1E293B] rounded-2xl shadow-lg overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0B1121]/50 border-b border-slate-200 dark:border-[#1E293B] text-slate-500 dark:text-[#94A3B8] text-sm transition-colors duration-300">
                <th className="w-[14.28%] p-5 font-medium text-center tracking-wide">วันที่</th>
                <th className="w-[14.28%] p-5 font-medium text-center tracking-wide">หมวดหมู่</th>
                <th className="w-[14.28%] p-5 font-medium text-center tracking-wide">ประเภท</th>
                <th className="w-[14.28%] p-5 font-medium text-center tracking-wide">หมายเหตุ</th>
                <th className="w-[14.28%] p-5 font-medium text-center tracking-wide">หลักฐาน</th>
                <th className="w-[14.28%] p-5 font-medium text-center tracking-wide">จำนวนเงิน</th>
                <th className="w-[14.28%] p-5 font-medium text-center tracking-wide">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#1E293B] transition-colors duration-300">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/30 transition-colors duration-200 group">
                  <td className="p-5 text-center text-slate-600 dark:text-[#94A3B8] text-sm group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate">
                    {formatThaiDate(t.transaction_date)}
                  </td>
                  
                  <td className="p-5 text-center text-slate-800 dark:text-[#E2E8F0] truncate transition-colors">
                    <div className="flex items-center justify-center space-x-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${t.type === 'INCOME' ? 'bg-[#4ADE80]' : 'bg-[#FB7185]'}`}></span>
                      <span className="group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate">{t.description}</span>
                    </div>
                  </td>
                  
                  <td className="p-5 text-center truncate">
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium border ${t.type === 'INCOME' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-[#4ADE80] border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-[#FB7185] border-rose-200 dark:border-rose-500/20'}`}>
                      {t.type === 'INCOME' ? 'รายรับ' : 'รายจ่าย'}
                    </span>
                  </td>
                  
                  <td className="p-5 text-center text-slate-500 dark:text-[#64748B] text-sm truncate transition-colors">
                    {t.note || '-'}
                  </td>

                  <td className="p-5 text-center">
                    <button onClick={() => handleViewImage(t.image_url)} className={`group/btn relative inline-flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-50 dark:bg-[#060A13] border border-slate-200 dark:border-[#1E293B] overflow-hidden transition-all duration-300 mx-auto ${t.image_url ? 'hover:border-blue-400 dark:hover:border-[#3B82F6] cursor-pointer' : 'cursor-default opacity-50'}`}>
                      {t.image_url ? (
                        <>
                          <img src={t.image_url} alt="Evidence" className="w-full h-full object-cover group-hover/btn:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/40 opacity-0 group-hover/btn:opacity-100 flex items-center justify-center transition-opacity duration-300">
                            <ImageIcon size={16} className="text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-[#64748B]">
                          <ImageIcon size={16} />
                          <span className="text-[9px] mt-1 tracking-wider">Evide</span>
                        </div>
                      )}
                    </button>
                  </td>
                  
                  <td className={`p-5 text-center font-bold tracking-wide truncate transition-colors ${t.type === 'INCOME' ? 'text-emerald-500 dark:text-[#4ADE80]' : 'text-rose-500 dark:text-[#FB7185]'}`}>
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
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-slate-500 dark:text-[#64748B] transition-colors">ไม่พบรายการในหมวดหมู่นี้</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}