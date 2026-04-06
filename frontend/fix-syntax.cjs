const fs = require('fs');
let fileContent = fs.readFileSync('src/App.jsx', 'utf8');

const targetGarbage = `                ) : (
                  <div onClick={() => fileInputRef.current.click()} className="w-full py-10 bg-white/40 dark:bg-[#060A13]/40 border-2 border-slate-300 dark:border-[#1E293B] border-dashed rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-all group backdrop-blur-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                    <Upload size={32} className="text-slate-400 dark:text-[#334155] mb-3 group-hover:text-blue-500 group-hover:animate-bounce transition-colors" />
                    <span className="text-[10px] font-black text-slate-500 dark:text-[#64748B] uppercase tracking-[0.2em] group-hover:text-blue-500">คลิกเพื่ออัปโหลดสลิป</span>
                  </div>
                )}`;

if (fileContent.includes(targetGarbage)) {
  fileContent = fileContent.replace(targetGarbage, '');
  fs.writeFileSync('src/App.jsx', fileContent);
  console.log('Fixed syntax error by removing garbage block!');
} else {
  console.log('ERROR: Garbage block not found.');
  // Alternatively, try splitting lines manually.
}
