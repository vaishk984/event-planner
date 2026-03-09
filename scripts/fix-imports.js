const fs = require('fs');
const path = require('path');

const actionsDir = path.join(__dirname, '../actions');

function fixImports(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixImports(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('getSession()') && !content.includes('import { getSession }')) {
                // For actions/auth/login.ts, getSession is exported from there, don't add
                if (fullPath.includes('login.ts')) continue;

                content = content.replace(/(import.*?\n)/, "$1import { getSession } from '@/lib/session'\n");
                fs.writeFileSync(fullPath, content);
                console.log('Fixed imports in ' + fullPath);
            }
        }
    }
}

fixImports(actionsDir);
