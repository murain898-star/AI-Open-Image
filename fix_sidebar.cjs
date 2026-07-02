const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Replace quality dropdown
content = content.replace(/<select[\s\S]*?value=\{state\.quality\}[\s\S]*?onChange=\{e => updateState\('quality'[\s\S]*?<\/select>/, `<select
                  value={state.quality}
                  onChange={e => updateState('quality', e.target.value as ImageQuality)}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                >
                  <option value="4K">4K</option>
                  <option value="Gigapixel">8K</option>
                </select>`);

// Fix baseCost logic in Sidebar cost estimation (there are multiple occurrences)
content = content.replace(/const baseCost = state\.outputFormat === 'video'[\s\S]*?state\.quality === 'Ultra' \? 3 : 4\);/g, `const baseCost = state.outputFormat === 'video' 
                ? 5 
                : (state.quality === 'Gigapixel' ? 2 : 1);`);

fs.writeFileSync('src/components/Sidebar.tsx', content);
