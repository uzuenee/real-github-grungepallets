import { Metadata } from 'next';
import { MainLayout } from '@/components/layout';
import { PageHero } from '@/components/sections';
import { ContactForm } from '@/components/forms';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { COMPANY_INFO } from '@/lib/constants';

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Get in touch with Grunge Pallets. Contact us for pallet supply, recycling, and logistics services in Metro Atlanta.',
    openGraph: {
        title: 'Contact Us | Grunge Pallets',
        description: 'Get in touch for pallet supply, recycling, and logistics in Metro Atlanta.',
    },
    twitter: {
        card: 'summary',
        title: 'Contact Grunge Pallets',
        description: 'Reach out for pallet solutions in Metro Atlanta.',
    },
};

const contactInfo = [
    {
        icon: MapPin,
        label: 'Address',
        value: `${COMPANY_INFO.address}\n${COMPANY_INFO.city}, ${COMPANY_INFO.state} ${COMPANY_INFO.zip}`,
    },
    {
        icon: Phone,
        label: 'Phone',
        value: COMPANY_INFO.phone,
        href: `tel:${COMPANY_INFO.phone.replace(/[^\d]/g, '')}`,
    },
    {
        icon: Mail,
        label: 'Email',
        value: COMPANY_INFO.email,
        href: `mailto:${COMPANY_INFO.email}`,
    },
    {
        icon: Clock,
        label: 'Business Hours',
        value: 'Mon - Fri: 7:00 AM - 5:00 PM\nSat: 8:00 AM - 12:00 PM',
    },
];

export default function ContactPage() {
    return (
        <MainLayout>
            <PageHero
                title="Contact Us"
                subtitle="We're here to help with all your pallet needs"
                backgroundImage="/contact_page_header.png"
            />

            <section className="py-16 bg-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div className="bg-white rounded-xl p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-secondary mb-6">Send us a Message</h2>
                            <ContactForm />
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h2 className="text-2xl font-bold text-secondary mb-6">Get in Touch</h2>
                            <p className="text-secondary-400 mb-8">
                                Have questions about our pallets or services? We&apos;d love to hear from you.
                                Reach out using any of the methods below, and our team will respond within 24 hours.
                            </p>

                            <div className="space-y-6">
                                {contactInfo.map((item) => (
                                    <div key={item.label} className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <item.icon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-secondary mb-1">{item.label}</h3>
                                            {item.href ? (
                                                <a
                                                    href={item.href}
                                                    className="text-secondary-400 hover:text-primary transition-colors whitespace-pre-line"
                                                >
                                                    {item.value}
                                                </a>
                                            ) : (
                                                <p className="text-secondary-400 whitespace-pre-line">{item.value}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Google Maps */}
                            <div className="mt-8 aspect-video bg-secondary-50 rounded-xl overflow-hidden shadow-lg">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3322.7689!2d-84.8434!3d33.7296!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88f4e1c4c4c4c4c4%3A0x0!2s1925%20Jason%20Industrial%20Pkwy%2C%20Winston%2C%20GA%2030187!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Grunge Pallets Location - 1925 Jason Industrial Parkway, Winston, GA 30187"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
