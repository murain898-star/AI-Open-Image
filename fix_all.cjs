const fs = require('fs');
let content = fs.readFileSync('sidebar_current.txt', 'utf8');

// 1. Replace Image Quality
const qualityRegex = /(<label[^>]*>Image Quality<\/label>\s*)<select[\s\S]*?<\/select>/;
content = content.replace(qualityRegex, `$1<select
                  value={state.quality}
                  onChange={e => updateState('quality', e.target.value as ImageQuality)}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                >
                  <option value="4K">4K</option>
                  <option value="Gigapixel">8K</option>
                </select>`);

// 2. Replace Video Duration
const durationRegex = /(<label[^>]*>Duration \(Seconds\)<\/label>\s*)<input[^>]*value=\{state\.videoDuration\}[^>]*\/>/;
content = content.replace(durationRegex, `$1<select
                  value={state.videoDuration}
                  onChange={e => updateState('videoDuration', parseInt(e.target.value) || 15)}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value={15}>15 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={45}>45 seconds</option>
                </select>`);

// 3. Fix baseCost logic (all occurrences)
content = content.replace(/const baseCost = state\.outputFormat === 'video'[\s\S]*?state\.quality === 'Ultra' \? 3 : 4\);/g, `const baseCost = state.outputFormat === 'video' 
                ? 5 
                : (state.quality === 'Gigapixel' ? 2 : 1);`);


// 4. Custom Dimensions (String replacement)
const customDimsSearch = `{state.aspectRatio === 'Custom' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Width (px)</label>
                    <input
                      type="number"
                      value={state.customWidth}
                      onChange={e => updateState('customWidth', parseInt(e.target.value) || 1024)}
                      className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Height (px)</label>
                    <input
                      type="number"
                      value={state.customHeight}
                      onChange={e => updateState('customHeight', parseInt(e.target.value) || 1024)}
                      className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              )}`;

const customDimsReplace = `{state.aspectRatio === 'Custom' && (
                <div className="space-y-2">
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
                </div>
              )}`;

if (content.indexOf(customDimsSearch) !== -1) {
    content = content.replace(customDimsSearch, customDimsReplace);
} else {
    console.log("WARNING: Could not find exact custom dimensions block");
}

fs.writeFileSync('src/components/Sidebar.tsx', content);
