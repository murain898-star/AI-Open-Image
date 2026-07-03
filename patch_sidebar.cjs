const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// 1. Remove AspectRatio select entirely and only keep Custom Dimensions UI.
code = code.replace(/              <div>\s*<label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Aspect Ratio<\/label>\s*<select\s*value=\{state\.aspectRatio\}[\s\S]*?<\/select>\s*<\/div>\s*\{state\.aspectRatio === 'Custom' && \(\s*<div className="space-y-2">/m, '              <div className="space-y-2">\n                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Image Dimensions (300 DPI)</label>');
code = code.replace(/                        placeholder="Height"\n                      \/>\n                    <\/div>\n                  <\/div>\n                <\/div>\n              \)}/m, '                        placeholder="Height"\n                      />\n                    </div>\n                  </div>\n                </div>');

// 2. Remove 'Close-up' from Pose select
code = code.replace(/<option value="Close-up">Close-up \(Half Body\)<\/option>/g, "");

// 3. Remove the Composition section
code = code.replace(/        \{\/\* Composition \*\/\}\s*<div className="space-y-4">\s*<label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">\s*<Layout className="w-4 h-4 text-gray-500 dark:text-gray-400" \/>\s*Composition\s*<\/label>\s*<label className="flex items-center gap-2 cursor-pointer">\s*<div className="relative">\s*<input \s*type="checkbox" \s*className="sr-only"\s*checked=\{state\.fullBody\}\s*onChange=\{\(e\) => updateState\('fullBody', e\.target\.checked\)\}\s*\/>\s*<div className=\{`block w-10 h-6 rounded-full transition-colors \$\{state\.fullBody \? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'\}`\}><\/div>\s*<div className=\{`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform \$\{state\.fullBody \? 'transform translate-x-4' : ''\}`\}><\/div>\s*<\/div>\s*<span className="text-sm text-gray-700 dark:text-gray-300">Full Body \(Head to Toe\)<\/span>\s*<\/label>\s*<\/div>\n\n/m, "");

fs.writeFileSync('src/components/Sidebar.tsx', code);
