const fs = require('fs');
let content = fs.readFileSync('sidebar_current.txt', 'utf8'); // Read from original backup!

// Replace quality dropdown safely. We find "Image Quality" label, then replace the following <select> block
const qualityRegex = /(<label[^>]*>Image Quality<\/label>\s*)<select[\s\S]*?<\/select>/;
content = content.replace(qualityRegex, `$1<select
                  value={state.quality}
                  onChange={e => updateState('quality', e.target.value as ImageQuality)}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                >
                  <option value="4K">4K</option>
                  <option value="Gigapixel">8K</option>
                </select>`);

// Replace Duration (Seconds) input safely
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

// Fix baseCost logic
content = content.replace(/const baseCost = state\.outputFormat === 'video'[\s\S]*?state\.quality === 'Ultra' \? 3 : 4\);/g, `const baseCost = state.outputFormat === 'video' 
                ? 5 
                : (state.quality === 'Gigapixel' ? 2 : 1);`);

fs.writeFileSync('src/components/Sidebar.tsx', content);
