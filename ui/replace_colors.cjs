const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Colors - Blue to Emerald (Wellness vibe)
  content = content.replace(/blue-600/g, 'emerald-800 dark:emerald-500');
  content = content.replace(/blue-500/g, 'emerald-600 dark:emerald-400');
  content = content.replace(/blue-400/g, 'emerald-500');
  content = content.replace(/blue-100/g, 'emerald-100 dark:emerald-900\/40');
  content = content.replace(/blue-50/g, 'emerald-50 dark:emerald-900\/20');
  
  // Neutrals - Slate to Stone/Emerald
  content = content.replace(/slate-900/g, 'stone-900');
  content = content.replace(/slate-800/g, 'stone-800');
  content = content.replace(/slate-700/g, 'stone-700');
  content = content.replace(/slate-600/g, 'stone-600');
  content = content.replace(/slate-500/g, 'stone-500 dark:text-emerald-100\/70');
  content = content.replace(/slate-400/g, 'stone-400');
  content = content.replace(/slate-300/g, 'stone-300');
  content = content.replace(/slate-200/g, 'stone-200');
  content = content.replace(/slate-100/g, 'stone-100 dark:bg-emerald-900\/50');
  content = content.replace(/slate-50/g, 'stone-50 dark:bg-emerald-950\/50');

  // Specific dark mode background overrides
  content = content.replace(/dark:bg-slate-900\/50/g, 'dark:bg-emerald-900\/20');
  content = content.replace(/dark:bg-slate-900/g, 'dark:bg-emerald-950');
  content = content.replace(/dark:bg-slate-950/g, 'dark:bg-[#022C22]');

  // Time pill specific
  content = content.replace(/px-3 py-3 rounded-md/g, 'px-3 py-3 time-pill');
  
  // Rounding global
  content = content.replace(/rounded-xl/g, 'rounded-3xl');
  content = content.replace(/rounded-lg/g, 'rounded-2xl');

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}

['src/components/AppointmentsWizard.tsx', 'src/components/Dashboard.tsx', 'src/components/Auth.tsx', 'src/App.tsx', 'src/components/Toast.tsx'].forEach(replaceInFile);
