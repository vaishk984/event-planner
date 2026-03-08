import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Privacy Policy | PlannerOS',
    description: 'Privacy policy for PlannerOS event planning platform',
}

export default function PrivacyPolicyPage() {
    const effectiveDate = 'February 1, 2026'

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
                    <p className="text-gray-500 mb-8">Effective Date: {effectiveDate}</p>

                    <div className="prose prose-gray max-w-none">
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                            <p className="text-gray-600 mb-4">
                                PlannerOS ("we", "our", or "us") is committed to protecting your privacy.
                                This Privacy Policy explains how we collect, use, and protect your personal information
                                when you use our event planning platform.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
                            <p className="text-gray-600 mb-4">We collect the following types of information:</p>

                            <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Account Information</h3>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Name and email address</li>
                                <li>Password (encrypted)</li>
                                <li>Phone number (optional)</li>
                                <li>Business name (for vendors)</li>
                            </ul>

                            <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Event Information</h3>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Event details (dates, locations, guest counts)</li>
                                <li>Vendor preferences and bookings</li>
                                <li>Budget information</li>
                            </ul>

                            <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Usage Information</h3>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Log data and IP addresses</li>
                                <li>Device and browser information</li>
                                <li>Pages visited and features used</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Provide and improve our services</li>
                                <li>Process bookings and payments</li>
                                <li>Send important notifications</li>
                                <li>Respond to support requests</li>
                                <li>Prevent fraud and ensure security</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
                            <p className="text-gray-600 mb-4">
                                We do not sell your personal information. We may share information with:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Vendors you book through our platform</li>
                                <li>Service providers who help us operate (payment processors, hosting)</li>
                                <li>Law enforcement when required by law</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
                            <p className="text-gray-600 mb-4">
                                We implement industry-standard security measures including:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>SSL/TLS encryption for data in transit</li>
                                <li>Encrypted password storage</li>
                                <li>Regular security audits</li>
                                <li>Access controls for our team</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
                            <p className="text-gray-600 mb-4">You have the right to:</p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Access your personal data</li>
                                <li>Correct inaccurate information</li>
                                <li>Request deletion of your data</li>
                                <li>Export your data</li>
                                <li>Opt out of marketing communications</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Cookies</h2>
                            <p className="text-gray-600 mb-4">
                                We use essential cookies to maintain your session and preferences.
                                You can control cookie settings in your browser.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
                            <p className="text-gray-600 mb-4">
                                We retain your data for as long as your account is active or as needed
                                to provide services. You can request deletion at any time.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
                            <p className="text-gray-600 mb-4">
                                We may update this Privacy Policy from time to time. We will notify you
                                of any material changes via email or in-app notification.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
                            <p className="text-gray-600">
                                For privacy-related questions, contact us at{' '}
                                <a href="mailto:privacy@planneros.com" className="text-indigo-600 hover:underline">
                                    privacy@planneros.com
                                </a>
                            </p>
                        </section>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <Link href="/" className="text-indigo-600 hover:underline">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
