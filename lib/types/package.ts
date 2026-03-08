export type PackageStatus = 'draft' | 'pending_review' | 'approved' | 'rejected'
export type PackageType = 'good' | 'better' | 'best' | 'custom'

export interface PackageTemplate {
    id: string
    name: string
    event_type: string
    description?: string
    base_price?: number
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Package {
    id: string
    event_id: string
    template_id?: string
    type: PackageType
    total_cost?: number
    status: PackageStatus
    created_at: string
    updated_at: string
}

export interface PackageItem {
    id: string
    package_id: string
    service_id: string
    vendor_id?: string
    cost?: number
    created_at: string
}
