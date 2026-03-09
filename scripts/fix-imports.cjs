const fs = require('fs');
const path = require('path');

function walk(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(file => {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            walk(fullPath);
        } else if (['.ts', '.js', '.tsx', '.jsx'].includes(path.extname(file.name))) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            
            // Fix capitalized SiriClawInstruct in relative imports
            const newContent = content.replace(/(from|import) (['"])(.*?)SiriClawInstruct(.*?)\2/g, (match, p1, p2, p3, p4) => {
                changed = true;
                return `${p1} ${p2}${p3}siriclaw-instruct${p4}${p2}`;
            });

            if (changed && newContent !== content) {
                fs.writeFileSync(fullPath, newContent);
                console.log('Fixed imports in: ' + fullPath);
            }
        }
    });
}

console.log('Starting import path fix...');
walk('./src');
console.log('Fix complete.');
