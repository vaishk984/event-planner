import { getVendorProfile, getVendorPackages } from '@/lib/actions/vendor-actions'
import { VendorProfileForm } from './vendor-profile-form'
import { VendorPackagesManager } from './vendor-packages-manager'
import { VendorPortfolioManager } from './vendor-portfolio-manager'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function VendorProfilePage() {
    const vendor = await getVendorProfile()
    const packages = await getVendorPackages()

    if (!vendor) {
        redirect('/login')
    }

    return (
        <div className="container max-w-6xl mx-auto py-6 space-y-8">
            <VendorProfileForm vendor={vendor} />
            <VendorPortfolioManager vendor={vendor} />
            <VendorPackagesManager packages={packages} />
        </div>
    )
}
