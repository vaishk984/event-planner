const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            // Skip auth files as they manage their own sessions natively
            if (fullPath.includes('auth\\login.ts') || fullPath.includes('auth/login.ts')) continue;

            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // 1. Check if getSession is used but not imported
            if (content.includes('getSession()') && !content.includes('import { getSession }')) {
                 // Insert after the first import or 'use server'
                 const useServerMatch = content.match(/('use server'|"use server");?\s*\n/);
                 if (useServerMatch) {
                     content = content.replace(useServerMatch[0], useServerMatch[0] + "import { getSession } from '@/lib/session';\n");
                 } else {
                     content = "import { getSession } from '@/lib/session';\n" + content;
                 }
                 modified = true;
            }

            // 2. Fix the typing errors where 'session.user' or 'user.id' was used
            // but our new getSession returns { userId, email, role, displayName }
            if (content.includes('session?.user') || content.includes('session.user')) {
                 content = content.replace(/session\?\.user;/g, '');
                 content = content.replace(/session\?\.user\?\.id/g, 'session?.userId');
                 content = content.replace(/session\?\.user\.id/g, 'session?.userId');
                 content = content.replace(/session\.user\.id/g, 'session?.userId');
                 modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Fixed: ${fullPath}`);
            }
        }
    }
}

// Run on actions folder
processDirectory(path.join(process.cwd(), 'actions'));
console.log('Done fixing TypeScript errors.');
