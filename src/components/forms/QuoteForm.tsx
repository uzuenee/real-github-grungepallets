import { useState } from 'react';
import { Input, Button } from '@/components/ui';
import { Package, Recycle } from 'lucide-react';

type QuoteType = 'buy' | 'sell' | null;
type Frequency = 'one-time' | 'weekly' | 'monthly';

interface BuyFormData {
    palletType: string;
    quantity: string;
    frequency: Frequency;
    deliveryLocation: string;
    name: string;
    email: string;
    company: string;
    phone: string;
    notes: string;
}

interface SellFormData {
    palletCondition: string;
    estimatedQuantity: string;
    pickupLocation: string;
    name: string;
    email: string;
    company: string;
    phone: string;
    notes: string;
}

interface FormErrors {
    [key: string]: string | undefined;
}

const palletTypes = [
    { value: '', label: 'Select pallet type...' },
    { value: 'gma-48x40-a', label: 'GMA 48x40 Grade A' },
    { value: 'gma-48x40-b', label: 'GMA 48x40 Grade B' },
    { value: '48x40-ht', label: '48x40 Heat Treated' },
    { value: '42x42', label: '42x42 Grade A' },
    { value: '48x48', label: '48x48 Grade A' },
    { value: 'custom', label: 'Custom Size' },
];

const palletConditions = [
    { value: '', label: 'Select condition...' },
    { value: 'grade-a', label: 'Grade A (Excellent condition)' },
    { value: 'grade-b', label: 'Grade B (Good condition, minor wear)' },
    { value: 'grade-c', label: 'Grade C (Usable, visible wear)' },
    { value: 'mixed', label: 'Mixed conditions' },
    { value: 'damaged', label: 'Damaged/Broken' },
];

export function QuoteForm() {
    const [quoteType, setQuoteType] = useState<QuoteType>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const [buyData, setBuyData] = useState<BuyFormData>({
        palletType: '',
        quantity: '',
        frequency: 'one-time',
        deliveryLocation: '',
        name: '',
        email: '',
        company: '',
        phone: '',
        notes: '',
    });

    const [sellData, setSellData] = useState<SellFormData>({
        palletCondition: '',
        estimatedQuantity: '',
        pickupLocation: '',
        name: '',
        email: '',
        company: '',
        phone: '',
        notes: '',
    });

    const validateBuyForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!buyData.palletType) newErrors.palletType = 'Please select a pallet type';
        if (!buyData.quantity) newErrors.quantity = 'Quantity is required';
        if (!buyData.deliveryLocation) newErrors.deliveryLocation = 'Delivery location is required';
        if (!buyData.name) newErrors.name = 'Name is required';
        if (!buyData.email) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyData.email)) newErrors.email = 'Invalid email';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateSellForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!sellData.palletCondition) newErrors.palletCondition = 'Please select condition';
        if (!sellData.estimatedQuantity) newErrors.estimatedQuantity = 'Quantity is required';
        if (!sellData.pickupLocation) newErrors.pickupLocation = 'Pickup location is required';
        if (!sellData.name) newErrors.name = 'Name is required';
        if (!sellData.email) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sellData.email)) newErrors.email = 'Invalid email';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = quoteType === 'buy' ? validateBuyForm() : validateSellForm();
        if (!isValid) return;

        setIsSubmitting(true);
        console.log('Quote Form Submitted:', quoteType === 'buy' ? buyData : sellData);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    const handleBuyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setBuyData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleSellChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSellData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    if (isSubmitted) {
        return (
            <div className="text-center py-12 bg-white rounded-xl p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-secondary mb-2">Quote Request Received!</h3>
                <p className="text-secondary-400 mb-6">
                    Thank you for your request. A member of our team will contact you within 24 hours with a custom quote.
                </p>
                <Button variant="outline" onClick={() => { setIsSubmitted(false); setQuoteType(null); }}>
                    Submit Another Request
                </Button>
            </div>
        );
    }

    // Step 1: Type Selection
    if (!quoteType) {
        return (
            <div className="bg-white rounded-xl p-8">
                <h2 className="text-2xl font-bold text-secondary mb-6 text-center">
                    What can we help you with?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => setQuoteType('buy')}
                        className="p-8 border-2 border-secondary-100 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group text-left"
                    >
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                            <Package size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-secondary mb-2">I want to BUY pallets</h3>
                        <p className="text-secondary-400">Get a quote for new or recycled pallets delivered to your location.</p>
                    </button>

                    <button
                        onClick={() => setQuoteType('sell')}
                        className="p-8 border-2 border-secondary-100 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group text-left"
                    >
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                            <Recycle size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-secondary mb-2">I have pallets to SELL</h3>
                        <p className="text-secondary-400">Schedule a free pickup for unwanted pallets from your facility.</p>
                    </button>
                </div>
            </div>
        );
    }

    // Step 2: Form based on selection
    return (
        <div className="bg-white rounded-xl p-8">
            <button
                onClick={() => setQuoteType(null)}
                className="text-secondary-400 hover:text-primary mb-6 inline-flex items-center"
            >
                ← Back to selection
            </button>

            <h2 className="text-2xl font-bold text-secondary mb-6">
                {quoteType === 'buy' ? 'Request a Purchase Quote' : 'Schedule Pallet Pickup'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {quoteType === 'buy' ? (
                    <>
                        {/* Buy Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-secondary-500 mb-2">Pallet Type *</label>
                                <select
                                    name="palletType"
                                    value={buyData.palletType}
                                    onChange={handleBuyChange}
                                    className={`w-full px-4 py-3 rounded-lg border bg-white text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary ${errors.palletType ? 'border-red-500' : 'border-secondary-100'}`}
                                >
                                    {palletTypes.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {errors.palletType && <p className="mt-2 text-sm text-red-500">{errors.palletType}</p>}
                            </div>

                            <Input
                                label="Quantity Needed *"
                                name="quantity"
                                type="number"
                                value={buyData.quantity}
                                onChange={handleBuyChange}
                                error={errors.quantity}
                                placeholder="e.g., 100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-500 mb-2">Order Frequency</label>
                            <div className="flex flex-wrap gap-3">
                                {(['one-time', 'weekly', 'monthly'] as Frequency[]).map((freq) => (
                                    <button
                                        key={freq}
                                        type="button"
                                        onClick={() => setBuyData((prev) => ({ ...prev, frequency: freq }))}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${buyData.frequency === freq
                                                ? 'bg-primary text-white'
                                                : 'bg-secondary-50 text-secondary-500 hover:bg-secondary-100'
                                            }`}
                                    >
                                        {freq === 'one-time' ? 'One-time' : freq.charAt(0).toUpperCase() + freq.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Input
                            label="Delivery Location *"
                            name="deliveryLocation"
                            value={buyData.deliveryLocation}
                            onChange={handleBuyChange}
                            error={errors.deliveryLocation}
                            placeholder="Address or city for delivery"
                        />
                    </>
                ) : (
                    <>
                        {/* Sell Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-secondary-500 mb-2">Pallet Condition *</label>
                                <select
                                    name="palletCondition"
                                    value={sellData.palletCondition}
                                    onChange={handleSellChange}
                                    className={`w-full px-4 py-3 rounded-lg border bg-white text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary ${errors.palletCondition ? 'border-red-500' : 'border-secondary-100'}`}
                                >
                                    {palletConditions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {errors.palletCondition && <p className="mt-2 text-sm text-red-500">{errors.palletCondition}</p>}
                            </div>

                            <Input
                                label="Estimated Quantity *"
                                name="estimatedQuantity"
                                type="number"
                                value={sellData.estimatedQuantity}
                                onChange={handleSellChange}
                                error={errors.estimatedQuantity}
                                placeholder="e.g., 50"
                            />
                        </div>

                        <Input
                            label="Pickup Location *"
                            name="pickupLocation"
                            value={sellData.pickupLocation}
                            onChange={handleSellChange}
                            error={errors.pickupLocation}
                            placeholder="Address for pallet pickup"
                        />

                        <div>
                            <label className="block text-sm font-medium text-secondary-500 mb-2">Photos (Optional)</label>
                            <div className="border-2 border-dashed border-secondary-200 rounded-lg p-8 text-center">
                                <p className="text-secondary-400">Photo upload coming soon</p>
                                <p className="text-secondary-300 text-sm mt-1">Drag & drop or click to upload pallet photos</p>
                            </div>
                        </div>
                    </>
                )}

                {/* Contact Info - Common to both */}
                <div className="border-t border-secondary-100 pt-6 mt-6">
                    <h3 className="text-lg font-semibold text-secondary mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Name *"
                            name="name"
                            value={quoteType === 'buy' ? buyData.name : sellData.name}
                            onChange={quoteType === 'buy' ? handleBuyChange : handleSellChange}
                            error={errors.name}
                            placeholder="John Smith"
                        />
                        <Input
                            label="Email *"
                            name="email"
                            type="email"
                            value={quoteType === 'buy' ? buyData.email : sellData.email}
                            onChange={quoteType === 'buy' ? handleBuyChange : handleSellChange}
                            error={errors.email}
                            placeholder="john@company.com"
                        />
                        <Input
                            label="Company"
                            name="company"
                            value={quoteType === 'buy' ? buyData.company : sellData.company}
                            onChange={quoteType === 'buy' ? handleBuyChange : handleSellChange}
                            placeholder="Your Company Name"
                        />
                        <Input
                            label="Phone"
                            name="phone"
                            type="tel"
                            value={quoteType === 'buy' ? buyData.phone : sellData.phone}
                            onChange={quoteType === 'buy' ? handleBuyChange : handleSellChange}
                            placeholder="(404) 555-1234"
                        />
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-secondary-500 mb-2">Additional Notes</label>
                        <textarea
                            name="notes"
                            value={quoteType === 'buy' ? buyData.notes : sellData.notes}
                            onChange={quoteType === 'buy' ? handleBuyChange : handleSellChange}
                            rows={3}
                            placeholder="Any special requirements or questions?"
                            className="w-full px-4 py-3 rounded-lg border border-secondary-100 bg-white text-secondary-500 placeholder:text-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
                </Button>
            </form>
        </div>
    );
}