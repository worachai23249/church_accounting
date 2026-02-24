import { TrendingUp, TrendingDown, Wallet, Receipt, Image as ImageIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// เพิ่ม categories เข้ามาใน Props
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

  // ปรับปรุงตรงนี้: ดึงสีจาก categories มาใช้ในข้อมูล
  const categoryData = (() => {
    const ed = {};
    currentMonthTransactions.forEach(t => {
      if (t.type === 'EXPENSE') {
        const desc = t.description || 'อื่นๆ';
        ed[desc] = (ed[desc] || 0) + parseFloat(t.amount);
      }
    });
    return Object.keys(ed).map(key => {
      // ค้นหาหมวดหมู่เพื่อเอาสี
      const cat = categories.find(c => c.name === key);
      return { 
        name: key, 
        value: ed[key],
        color: cat ? cat.color : '#94A3B8' // ถ้าไม่เจอสีให้ใช้สีเทา
      };
    });
  })();

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight transition-colors">ภาพรวมคริสตจักร</h1>
        <p className="text-slate-500 dark:text-[#94A3B8] text-sm transition-colors">สรุปการเงินเดือนปัจจุบัน ({MONTHS_TH[currentMonthNum - 1]} {currentYearNum + 543})</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-[#0E1525] border border-slate-200 dark:border-[#1E293B] p-6 rounded-2xl flex justify-between items-start transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md group">
          <div><div className="text-slate-500 dark:text-[#94A3B8] text-sm font-medium mb-1">รายรับ</div><div className="text-3xl font-bold text-[#4ADE80] tracking-tight">฿{fmt(totalIncome)}</div></div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center"><TrendingUp size={20} className="text-[#4ADE80]" /></div>
        </div>
        <div className="bg-white dark:bg-[#0E1525] border border-slate-200 dark:border-[#1E293B] p-6 rounded-2xl flex justify-between items-start transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md group">
          <div><div className="text-slate-500 dark:text-[#94A3B8] text-sm font-medium mb-1">รายจ่าย</div><div className="text-3xl font-bold text-[#FB7185] tracking-tight">฿{fmt(totalExpense)}</div></div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center"><TrendingDown size={20} className="text-[#FB7185]" /></div>
        </div>
        <div className="bg-white dark:bg-[#0E1525] border border-slate-200 dark:border-[#1E293B] p-6 rounded-2xl flex justify-between items-start transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md group">
          <div><div className="text-slate-500 dark:text-[#94A3B8] text-sm font-medium mb-1">คงเหลือ</div><div className={`text-3xl font-bold tracking-tight ${balance >= 0 ? 'text-[#4ADE80]' : 'text-[#FB7185]'}`}>฿{fmt(balance)}</div></div>
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center"><Wallet size={20} className="text-violet-500 dark:text-[#A78BFA]" /></div>
        </div>
        <div className="bg-white dark:bg-[#0E1525] border border-slate-200 dark:border-[#1E293B] p-6 rounded-2xl flex justify-between items-start transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md group">
          <div><div className="text-slate-500 dark:text-[#94A3B8] text-sm font-medium mb-1">บันทึกทั้งหมด</div><div className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{transactionCount}</div></div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center border border-slate-200 dark:border-[#1E293B]"><Receipt size={20} className="text-slate-500 dark:text-[#94A3B8]" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* กราฟแท่ง (เหมือนเดิม) */}
        <div className="bg-white dark:bg-[#0E1525] border border-slate-200 dark:border-[#1E293B] p-6 rounded-2xl shadow-sm h-[400px]">
          <div className="flex items-center space-x-2 mb-6"><div className="w-1 h-5 bg-blue-500 rounded-full"></div><h3 className="text-lg font-bold text-slate-800 dark:text-white">รายรับรายจ่าย 6 เดือนล่าสุด</h3></div>
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={1}/><stop offset="100%" stopColor="#1E3A8A" stopOpacity={0.8}/></linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EF4444" stopOpacity={1}/><stop offset="100%" stopColor="#7F1D1D" stopOpacity={0.8}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="dark:stroke-[#1E293B]" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000 ? (val/1000)+'k' : val} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="income" name="รายรับ" fill="url(#colorIncome)" radius={[6, 6, 0, 0]} maxBarSize={16} />
                <Bar dataKey="expense" name="รายจ่าย" fill="url(#colorExpense)" radius={[6, 6, 0, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* กราฟวงกลม: ปรับให้ใช้สีตามหมวดหมู่จริง */}
        <div className="bg-white dark:bg-[#0E1525] border border-slate-200 dark:border-[#1E293B] p-6 rounded-2xl shadow-sm h-[400px]">
          <div className="flex items-center space-x-2 mb-6"><div className="w-1 h-5 bg-blue-500 rounded-full"></div><h3 className="text-lg font-bold text-slate-800 dark:text-white">รายจ่ายตามประเภท</h3></div>
          <div className="flex-1 flex items-center h-[300px]">
            <div className="w-1/2 h-full">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                      {/* ใช้ entry.color ที่ดึงมาจาก categories */}
                      {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} formatter={(value) => `฿${fmt(value)}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-slate-400 text-sm">ไม่มีข้อมูล</div>}
            </div>
            <div className="w-1/2 flex flex-col justify-center space-y-4 pl-6 border-l dark:border-[#1E293B]">
              {categoryData.map((entry, index) => (
                <div key={index} className="flex justify-between items-center pr-4">
                  <div className="flex items-center space-x-3">
                    {/* ใช้สีตามหมวดหมู่ */}
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                    <span className="text-slate-600 dark:text-[#94A3B8] text-sm">{entry.name}</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-white text-sm">฿{fmt(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block bg-white dark:bg-[#0E1525] border border-slate-200 dark:border-[#1E293B] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b dark:border-[#1E293B] flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">บันทึกล่าสุด</h3>
          <button onClick={() => setActiveMenu('record')} className="text-sm text-blue-500 font-medium">ดูทั้งหมด</button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#0B1121]/50 text-slate-500 dark:text-[#94A3B8] text-sm border-b dark:border-[#1E293B]">
              <th className="p-4 text-center font-medium">วันที่</th>
              <th className="p-4 text-center font-medium">หมวดหมู่</th>
              <th className="p-4 text-center font-medium">หมายเหตุ</th>
              <th className="p-4 text-center font-medium">หลักฐาน</th>
              <th className="p-4 text-center font-medium">จำนวนเงิน</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-[#1E293B]">
            {transactions.slice(0, 10).map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/30 group">
                <td className="p-4 text-center text-slate-600 dark:text-[#94A3B8] text-sm">{formatThaiDate(tx.transaction_date)}</td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center gap-2 text-slate-800 dark:text-[#E2E8F0]">
                    {/* เปลี่ยนจุดสีหน้าชื่อให้ตรงตามหมวดหมู่ */}
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categories.find(c => c.name === tx.description)?.color || '#94A3B8' }}></span>
                    <span>{tx.description}</span>
                  </span>
                </td>
                <td className="p-4 text-center text-slate-500 dark:text-[#64748B] text-sm">{tx.note || '-'}</td>
                <td className="p-4 text-center">
                  <button onClick={() => handleViewImage(tx.image_url)} className={`w-12 h-12 rounded-lg bg-slate-50 dark:bg-[#060A13] border border-slate-200 dark:border-[#1E293B] overflow-hidden transition-all ${tx.image_url ? 'cursor-pointer' : 'opacity-50'}`}>
                    {tx.image_url ? <img src={tx.image_url} alt="Evid" className="w-full h-full object-cover" /> : <ImageIcon size={16} className="mx-auto text-slate-400" />}
                  </button>
                </td>
                <td className={`p-4 text-center font-bold ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>{tx.type === 'INCOME' ? '+' : '-'}฿{fmt(tx.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}