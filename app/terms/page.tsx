import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Terms of Service | PlannerOS',
    description: 'Terms and conditions for using PlannerOS event planning platform',
}

export default function TermsOfServicePage() {
    const effectiveDate = 'February 1, 2026'

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
                    <p className="text-gray-500 mb-8">Effective Date: {effectiveDate}</p>

                    <div className="prose prose-gray max-w-none">
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                            <p className="text-gray-600 mb-4">
                                By accessing or using PlannerOS ("the Service"), you agree to be bound by these Terms of Service.
                                If you do not agree to these terms, please do not use the Service.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                            <p className="text-gray-600 mb-4">
                                PlannerOS is an event management platform that connects event planners with vendors.
                                The Service includes:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Event planning and management tools</li>
                                <li>Vendor discovery and booking</li>
                                <li>Client management and communication</li>
                                <li>Budget tracking and reporting</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
                            <p className="text-gray-600 mb-4">
                                You are responsible for maintaining the confidentiality of your account credentials
                                and for all activities that occur under your account. You must:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Provide accurate and complete information</li>
                                <li>Keep your password secure</li>
                                <li>Notify us immediately of any unauthorized access</li>
                                <li>Be at least 18 years old to use the Service</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
                            <p className="text-gray-600 mb-4">You agree not to:</p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Use the Service for any illegal purpose</li>
                                <li>Violate any applicable laws or regulations</li>
                                <li>Infringe on the rights of others</li>
                                <li>Transmit harmful code or interfere with the Service</li>
                                <li>Attempt to gain unauthorized access to any part of the Service</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Vendor Terms</h2>
                            <p className="text-gray-600 mb-4">
                                Vendors on our platform agree to:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Provide accurate service descriptions and pricing</li>
                                <li>Honor confirmed bookings</li>
                                <li>Maintain professional conduct with clients</li>
                                <li>Comply with all applicable business licenses and regulations</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Payment Terms</h2>
                            <p className="text-gray-600 mb-4">
                                Payments are processed securely through our payment partners.
                                You agree to pay all fees associated with your use of the Service.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
                            <p className="text-gray-600 mb-4">
                                To the maximum extent permitted by law, PlannerOS shall not be liable for any
                                indirect, incidental, special, or consequential damages arising from your use
                                of the Service.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Changes to Terms</h2>
                            <p className="text-gray-600 mb-4">
                                We may update these Terms from time to time. We will notify you of any material
                                changes by posting the new Terms on this page.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
                            <p className="text-gray-600">
                                If you have any questions about these Terms, please contact us at{' '}
                                <a href="mailto:legal@planneros.com" className="text-indigo-600 hover:underline">
                                    legal@planneros.com
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
