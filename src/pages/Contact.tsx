import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/layout';
import { PageHero } from '@/components/sections';
import { ContactForm } from '@/components/forms';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { COMPANY_INFO } from '@/lib/constants';

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

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact Us | Grunge Pallets & Recycling Services</title>
        <meta name="description" content="Get in touch with Grunge Pallets. Contact us for pallet supply, recycling, and logistics services in Metro Atlanta." />
      </Helmet>
      <MainLayout>
        <PageHero
          title="Contact Us"
          subtitle="We're here to help with all your pallet needs"
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
                  Have questions about our pallets or services? We'd love to hear from you.
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

                {/* Map Placeholder */}
                <div className="mt-8 aspect-video bg-secondary-50 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={48} className="text-secondary-200 mx-auto mb-2" />
                    <p className="text-secondary-300">Map Integration</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </MainLayout>
    </>
  );
}
