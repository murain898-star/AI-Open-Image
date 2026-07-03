const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

code = code.replace(/<label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Image Dimensions \(300 DPI\)<\/label>[\s\S]*?<\/div>\n            <\/div>\n          \) : \(/m, 
\`<label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Image Dimensions</label>
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] text-gray-500 dark:text-gray-400">Unit</label>
                    <select
                      value={state.customUnit || 'pixels'}
                      onChange={e => updateState('customUnit', e.target.value as any)}
                      className="text-xs border border-gray-200 dark:border-gray-700 rounded p-1 bg-white dark:bg-gray-800 dark:text-white outline-none"
                    >
                      <option value="pixels">Pixels</option>
                      <option value="inches">Inches</option>
                      <option value="cm">Centimeters</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Width ({state.customUnit === 'pixels' ? 'px' : state.customUnit === 'inches' ? 'in' : 'cm'})</label>
                      <input
                        type="number"
                        value={state.customWidth || 1024}
                        onChange={e => updateState('customWidth', parseFloat(e.target.value) || (state.customUnit === 'inches' ? 10 : state.customUnit === 'cm' ? 25 : 1024))}
                        className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Height ({state.customUnit === 'pixels' ? 'px' : state.customUnit === 'inches' ? 'in' : 'cm'})</label>
                      <input
                        type="number"
                        value={state.customHeight || 1280}
                        onChange={e => updateState('customHeight', parseFloat(e.target.value) || (state.customUnit === 'inches' ? 14 : state.customUnit === 'cm' ? 35 : 1280))}
                        className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  {(state.customUnit === 'inches' || state.customUnit === 'cm') && (
                    <div className="pt-1 space-y-1">
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
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Setting 300 DPI ensures high-resolution professional print-ready output.</p>
                    </div>
                  )}
                </div>
            </div>
          ) : (\`);

fs.writeFileSync('src/components/Sidebar.tsx', code);
