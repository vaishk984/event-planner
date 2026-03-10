const fs = require('fs');
const path = require('path');

const layouts = [
    'app/(dashboard)/layout.tsx',
    'app/(vendor)/layout.tsx',
    'app/(admin)/layout.tsx',
    'app/(client)/layout.tsx',
    'app/(showroom)/layout.tsx'
];

layouts.forEach(l => {
    const p = path.resolve(process.cwd(), l);
    if (fs.existsSync(p)) {
        let c = fs.readFileSync(p, 'utf8');
        if (!c.includes('force-dynamic')) {
            c = "export const dynamic = 'force-dynamic';\n" + c;
            fs.writeFileSync(p, c);
            console.log('Patched', l);
        }
    }
});
