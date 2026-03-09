const fs = require('fs');
const path = require('path');

function fixLayout(filePath, role) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Add Menu, X lucide imports if not there
    if (!content.includes('Menu, X')) {
        content = content.replace(/lucide-react'\n/g, ""); // Remove trailing quote/newline if needed
        // A safer replace:
        content = content.replace(/(from 'lucide-react')/, ", Menu, X $1");
        // Or just inject
        content = content.replace(/LogOut,?\s*/, 'LogOut, Menu, X,\n');
    }

    // Add isMobileMenuOpen state
    if (!content.includes('isMobileMenuOpen')) {
        content = content.replace(
            /const \[isCollapsed, setIsCollapsed\] = useState\(false\)/,
            'const [isCollapsed, setIsCollapsed] = useState(false)\n    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)'
        );
        content = content.replace(
            /const \[collapsed, setCollapsed\] = useState\(false\)/, // for admin
            'const [collapsed, setCollapsed] = useState(false)\n    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)'
        );
    }

    // Replace the main wrapper div and Sidebar opening
    const isVendor = role === 'vendor';

    if (isVendor) {
        if (!content.includes('Mobile Header overlay for hamburger')) {
            const mobileHeader = `
            {/* Mobile Header overlay for hamburger */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-40 flex items-center justify-between px-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                        <Camera className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg text-gray-800 tracking-tight">
                        {vendorName}
                    </span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-gray-50 rounded-lg text-gray-600">
                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Sidebar backdrop */}
            {isMobileMenuOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity" 
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
`;
            content = content.replace(
                /<div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50\/30">\s*{\/\* Sidebar - Cool Blue Theme for Vendors \*\/}/,
                `<div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">\n${mobileHeader}\n            {/* Sidebar - Cool Blue Theme for Vendors */}`
            );

            // Fix aside classes
            content = content.replace(
                /"fixed left-0 top-0 h-screen bg-white border-r border-slate-200 z-50 flex flex-col transition-all duration-300 ease-in-out shadow-sm",/g,
                '"fixed left-0 top-0 h-screen bg-white border-r border-slate-200 z-50 flex flex-col transition-all duration-300 ease-in-out shadow-sm transform",\n                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",'
            );

            // Hide desktop elements
            content = content.replace(
                /className="absolute -right-3 top-8 bg-white border border-slate-300 rounded-full p-1 shadow-md hover:bg-slate-50 z-50"/g,
                'className="hidden md:flex absolute -right-3 top-8 bg-white border border-slate-300 rounded-full p-1 shadow-md hover:bg-slate-50 z-50"'
            );
            content = content.replace(
                /className=\{cn\("p-6 border-b border-slate-200 flex items-center gap-3/g,
                'className={cn("hidden md:flex p-6 border-b border-slate-200 items-center gap-3'
            );

            // Fix main content
            content = content.replace(
                /className={cn\(\s*"flex-1 transition-all duration-300 ease-in-out p-8 w-full",\s*isCollapsed \? "ml-20" : "ml-64"\s*\)}/g,
                'className={cn("flex-1 transition-all duration-300 ease-in-out p-4 md:p-8 w-full mt-16 md:mt-0", isCollapsed ? "md:ml-20" : "md:ml-64")}'
            );

            // Close menu on click
            content = content.replace(/href=\{item\.href\}/g, 'href={item.href}\n                                onClick={() => setIsMobileMenuOpen(false)}');
            content = content.replace(/href="\/logout"/g, 'href="/logout"\n                        onClick={() => setIsMobileMenuOpen(false)}');
        }
    } else if (role === 'admin') {
        if (!content.includes('Mobile Header overlay for hamburger')) {
            const mobileHeader = `
            {/* Mobile Header overlay for hamburger */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-40 flex items-center justify-between px-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg text-gray-800 tracking-tight">
                        AdminOS
                    </span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-gray-50 rounded-lg text-gray-600">
                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Sidebar backdrop */}
            {isMobileMenuOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/50 z-50" 
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
`;
            content = content.replace(
                /<div className="min-h-screen bg-gray-100 flex">\s*{\/\* Sidebar \*\/}/,
                `<div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">\n${mobileHeader}\n            {/* Sidebar */}`
            );

            content = content.replace(
                /className={`\${collapsed \? 'w-16' : 'w-64'} bg-slate-900 text-white transition-all duration-300 flex flex-col`}/,
                'className={`fixed md:relative left-0 top-0 h-screen z-[60] transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} ${collapsed ? "w-16" : "w-64"} bg-slate-900 text-white transition-all duration-300 flex flex-col`}'
            );

            content = content.replace(
                /className="flex-1 flex flex-col"/,
                'className="flex-1 flex flex-col w-full mt-16 md:mt-0"'
            );

            // Close menu on click
            content = content.replace(/href=\{item\.href\}/g, 'href={item.href}\n                                onClick={() => setIsMobileMenuOpen(false)}');
            content = content.replace(/href="\/logout"/g, 'href="/logout"\n                        onClick={() => setIsMobileMenuOpen(false)}');
        }
    }

    fs.writeFileSync(filePath, content);
    console.log(`Fixed layout for ${role}`);
}

fixLayout(path.join(__dirname, '../components/layout/vendor-layout-wrapper.tsx'), 'vendor');
fixLayout(path.join(__dirname, '../components/layout/admin-layout-wrapper.tsx'), 'admin');
