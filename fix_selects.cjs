const fs = require('fs');
const path = 'c:/Users/naikr/OneDrive/Desktop/AGS Project/ask-new-crm/src/app/auth/Register.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Make placeholder labels a little darker
content = content.replace(/text-slate-400/g, 'text-slate-500');

// 2. Fix Dropdown (SelectContent) overlapping and remove borders
content = content.replace(/<SelectContent>/g, '<SelectContent position="popper" sideOffset={4} className="border-0 shadow-lg ring-1 ring-slate-100 rounded-xl">');

fs.writeFileSync(path, content, 'utf8');
console.log("Fixes applied successfully.");
