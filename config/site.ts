export const siteConfig = {
    name: 'PlannerOS',
    description: 'Professional Event Planning Platform for Agencies',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    ogImage: '/og-image.png',
    links: {
        twitter: 'https://twitter.com/planneros',
        github: 'https://github.com/planneros',
    },
}

export type SiteConfig = typeof siteConfig
