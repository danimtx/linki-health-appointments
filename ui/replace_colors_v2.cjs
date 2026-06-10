const fs = require('fs');

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Undo Emerald/Stone -> Zinc/Monochrome
  content = content.replace(/emerald-800 dark:emerald-500/g, 'zinc-900 dark:zinc-100');
  content = content.replace(/emerald-700 dark:emerald-500/g, 'zinc-900 dark:zinc-100');
  content = content.replace(/emerald-700/g, 'zinc-900');
  content = content.replace(/emerald-600 dark:emerald-400/g, 'zinc-900 dark:zinc-100');
  content = content.replace(/emerald-600/g, 'zinc-900');
  content = content.replace(/emerald-500/g, 'zinc-800 dark:zinc-300');
  content = content.replace(/emerald-400/g, 'zinc-700 dark:zinc-300');
  content = content.replace(/emerald-100 dark:emerald-900\/40/g, 'zinc-100 dark:zinc-800\/40');
  content = content.replace(/emerald-50 dark:emerald-900\/20/g, 'zinc-50 dark:zinc-900\/20');
  
  // Neutrals 
  content = content.replace(/stone-900/g, 'zinc-900');
  content = content.replace(/stone-800/g, 'zinc-800');
  content = content.replace(/stone-700/g, 'zinc-700');
  content = content.replace(/stone-600/g, 'zinc-600');
  content = content.replace(/stone-500/g, 'zinc-500');
  content = content.replace(/stone-400/g, 'zinc-400');
  content = content.replace(/stone-300/g, 'zinc-300');
  content = content.replace(/stone-200/g, 'zinc-200');
  content = content.replace(/stone-100/g, 'zinc-100');
  content = content.replace(/stone-50/g, 'zinc-50');

  content = content.replace(/dark:text-emerald-100\/70/g, 'dark:text-zinc-400');
  content = content.replace(/dark:bg-emerald-900\/50/g, 'dark:bg-zinc-800\/50');
  content = content.replace(/dark:bg-emerald-950\/50/g, 'dark:bg-zinc-900\/50');
  content = content.replace(/dark:bg-emerald-900\/20/g, 'dark:bg-zinc-800\/20');
  content = content.replace(/dark:bg-emerald-950/g, 'dark:bg-black');
  content = content.replace(/dark:bg-\[\#022C22\]/g, 'dark:bg-black');
  
  // Removing rounding (Swiss Design is angular)
  content = content.replace(/rounded-3xl/g, 'rounded-none');
  content = content.replace(/rounded-2xl/g, 'rounded-none');
  content = content.replace(/rounded-full/g, 'rounded-none');
  content = content.replace(/rounded-md/g, 'rounded-none');
  content = content.replace(/rounded-lg/g, 'rounded-none');
  content = content.replace(/rounded-xl/g, 'rounded-none');
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}

['src/components/AppointmentsWizard.tsx', 'src/components/Dashboard.tsx', 'src/components/Auth.tsx', 'src/App.tsx', 'src/components/Toast.tsx'].forEach(replaceInFile);
