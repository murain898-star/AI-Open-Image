const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Replace Custom Dimensions section
const customDimRegex = /(<div className="grid grid-cols-2 gap-2">[\s\S]*?<div>\s*<label className="block text-\[10px\] text-gray-500 dark:text-gray-400 mb-1">Width \(px\)<\/label>[\s\S]*?<input[\s\S]*?className="w-full[^>]*\/>\s*<\/div>\s*<div>\s*<label className="block text-\[10px\] text-gray-500 dark:text-gray-400 mb-1">Height \(px\)<\/label>[\s\S]*?<input[\s\S]*?className="w-full[^>]*\/>\s*<\/div>\s*<\/div>)/;

const replacement = `<div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] text-gray-500 dark:text-gray-400">Unit</label>
                    <select
                      value={state.customUnit || 'px'}
                      onChange={e => updateState('customUnit', e.target.value)}
                      className="text-xs border border-gray-200 dark:border-gray-700 rounded p-1 bg-white dark:bg-gray-800 dark:text-white outline-none"
                    >
                      <option value="px">Pixels</option>
                      <option value="in">Inches</option>
                      <option value="cm">Centimeters</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Width ({state.customUnit || 'px'})</label>
                      <input
                        type="number"
                        value={state.customWidth}
                        onChange={e => updateState('customWidth', parseFloat(e.target.value) || (state.customUnit === 'in' ? 10 : state.customUnit === 'cm' ? 25 : 1024))}
                        className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Height ({state.customUnit || 'px'})</label>
                      <input
                        type="number"
                        value={state.customHeight}
                        onChange={e => updateState('customHeight', parseFloat(e.target.value) || (state.customUnit === 'in' ? 10 : state.customUnit === 'cm' ? 25 : 1024))}
                        className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  {(state.customUnit === 'in' || state.customUnit === 'cm') && (
                    <div className="pt-1">
                      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Resolution (DPI)</label>
                      <select
                        value={state.customDPI || 300}
                        onChange={e => updateState('customDPI', parseInt(e.target.value))}
                        className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      >
                        <option value="72">72 DPI (Web)</option>
                        <option value="150">150 DPI (Print Draft)</option>
                        <option value="300">300 DPI (High Quality Print)</option>
                      </select>
                    </div>
                  )}
                </div>`;

content = content.replace(customDimRegex, replacement);

fs.writeFileSync('src/components/Sidebar.tsx', content);
