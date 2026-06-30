import fs from 'fs';
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');

const startIdx = code.indexOf('        {/* Model Settings */}');
const endStr = '        </div>\n      </div>\n\n      <div className="p-6 border-t';
const endIdx = code.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
    const newCode = code.substring(0, startIdx) + '      </div>\n\n      <div className="p-6 border-t' + code.substring(endIdx + endStr.length);
    fs.writeFileSync('src/components/Sidebar.tsx', newCode);
    console.log('Success');
} else {
    console.log('Failed to find indices', startIdx, endIdx);
}
