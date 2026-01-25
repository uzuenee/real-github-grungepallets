'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Input, Button } from '@/components/ui';
import { Package, Recycle, Upload, X } from 'lucide-react';
import { formatPhoneNumber } from '@/lib/utils/phoneFormat';

// Constants for photo upload
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
const MAX_PHOTOS = 3;

interface ProcessedImage {
    name: string;
    base64: string;
    size: number;
}

// Read image file and convert to base64 (no compression)
async function processImage(file: File): Promise<ProcessedImage> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            resolve({
                name: file.name,
                base64,
                size: file.size,
            });
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file); // This was missing!
    });
}

type QuoteType = 'buy' | 'sell' | null;
type Frequency = 'one-time' | 'weekly' | 'monthly';

interface Product {
    id: string;
    name: string;
    size: string;
}

interface BuyFormData {
    palletType: string;
    quantity: string;
    frequency: Frequency;
    deliveryLocation: string;
    needByDate: string;
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

const palletConditions = [
    { value: '', label: 'Select condition...' },
    { value: 'grade-a', label: 'Grade A (Excellent condition)' },
    { value: 'grade-b', label: 'Grade B (Good condition, minor wear)' },
    { value: 'grade-c', label: 'Grade C (Usable, visible wear)' },
    { value: 'mixed', label: 'Mixed conditions' },
    { value: 'damaged', label: 'Damaged/Broken' },
];

export function QuoteForm() {
    const searchParams = useSearchParams();
    const [quoteType, setQuoteType] = useState<QuoteType>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [products, setProducts] = useState<Product[]>([]);
    const [photos, setPhotos] = useState<ProcessedImage[]>([]);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Read URL parameter and set quote type
    useEffect(() => {
        const typeParam = searchParams.get('type');
        if (typeParam === 'buy' || typeParam === 'sell') {
            setQuoteType(typeParam);
        }
    }, [searchParams]);

    // Fetch products from database on mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products');
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data.products || []);
                }
            } catch (err) {
                console.error('Failed to fetch products:', err);
            }
        };
        fetchProducts();
    }, []);

    // Build pallet types from database products (sorted A-Z, Custom at end)
    const palletTypes = [
        { value: '', label: 'Select pallet type...' },
        ...products
            .filter(p => !p.name.toLowerCase().includes('custom')) // Exclude custom products
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(p => ({ value: p.id, label: p.name })),
        { value: 'custom', label: 'Custom Size' },
    ];

    const [buyData, setBuyData] = useState<BuyFormData>({
        palletType: '',
        quantity: '',
        frequency: 'one-time',
        deliveryLocation: '',
        needByDate: '',
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
        else if (parseInt(buyData.quantity) > 100000) newErrors.quantity = 'Maximum quantity is 100,000';
        else if (parseInt(buyData.quantity) < 1) newErrors.quantity = 'Quantity must be at least 1';
        if (!buyData.deliveryLocation) newErrors.deliveryLocation = 'Delivery location is required';
        if (!buyData.name) newErrors.name = 'Name is required';
        if (!buyData.email) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyData.email)) newErrors.email = 'Invalid email';
        if (!buyData.phone) newErrors.phone = 'Phone is required';
        else if (buyData.phone.replace(/\D/g, '').length < 10) newErrors.phone = 'Please enter a valid phone number';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateSellForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!sellData.palletCondition) newErrors.palletCondition = 'Please select condition';
        if (!sellData.estimatedQuantity) newErrors.estimatedQuantity = 'Quantity is required';
        else if (parseInt(sellData.estimatedQuantity) > 100000) newErrors.estimatedQuantity = 'Maximum quantity is 100,000';
        else if (parseInt(sellData.estimatedQuantity) < 1) newErrors.estimatedQuantity = 'Quantity must be at least 1';
        if (!sellData.pickupLocation) newErrors.pickupLocation = 'Pickup location is required';
        if (!sellData.name) newErrors.name = 'Name is required';
        if (!sellData.email) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sellData.email)) newErrors.email = 'Invalid email';
        if (!sellData.phone) newErrors.phone = 'Phone is required';
        else if (sellData.phone.replace(/\D/g, '').length < 10) newErrors.phone = 'Please enter a valid phone number';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = quoteType === 'buy' ? validateBuyForm() : validateSellForm();
        if (!isValid) return;

        setIsSubmitting(true);
        setSubmitError(null);

        const submissionId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        // Get display labels instead of internal IDs
        const palletTypeLabel = palletTypes.find(p => p.value === buyData.palletType)?.label || buyData.palletType;
        const conditionLabel = palletConditions.find(c => c.value === sellData.palletCondition)?.label || sellData.palletCondition;

        try {
            let response: Response;
            if (quoteType === 'buy') {
                response = await fetch('/api/forms/quote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        submissionId,
                        data: { ...buyData, palletType: palletTypeLabel },
                    }),
                });
            } else {
                response = await fetch('/api/forms/pickup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        submissionId,
                        data: { ...sellData, palletCondition: conditionLabel },
                        photos: photos.map(p => p.base64),
                    }),
                });
            }

            if (!response.ok) {
                const text = await response.text().catch(() => '');
                setSubmitError(text || 'Submission failed. Please try again.');
                setIsSubmitting(false);
                return;
            }
        } catch (error) {
            console.error('Failed to submit quote:', error);
            setSubmitError('Submission failed. Please try again.');
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    const handleBuyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const formattedValue = name === 'phone' ? formatPhoneNumber(value) : value;
        setBuyData((prev) => ({ ...prev, [name]: formattedValue }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleSellChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const formattedValue = name === 'phone' ? formatPhoneNumber(value) : value;
        setSellData((prev) => ({ ...prev, [name]: formattedValue }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setPhotoError(null);

        // Check if adding these would exceed max
        if (photos.length + files.length > MAX_PHOTOS) {
            setPhotoError(`Maximum ${MAX_PHOTOS} photos allowed`);
            return;
        }

        setIsProcessing(true);

        try {
            const newPhotos: ProcessedImage[] = [];

            for (const file of Array.from(files)) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    setPhotoError(`${file.name} is not an image file`);
                    continue;
                }

                // Validate size
                if (file.size > MAX_FILE_SIZE) {
                    setPhotoError(`${file.name} exceeds 5MB limit`);
                    continue;
                }

                const processed = await processImage(file);
                newPhotos.push(processed);
            }

            setPhotos(prev => [...prev, ...newPhotos]);
        } catch (err) {
            console.error('Photo processing error:', err);
            setPhotoError('Failed to process image(s)');
        } finally {
            setIsProcessing(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
        setPhotoError(null);
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
                {submitError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {submitError}
                    </div>
                )}
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

                        <Input
                            label="Need By Date"
                            name="needByDate"
                            type="date"
                            value={buyData.needByDate}
                            onChange={handleBuyChange}
                            min={new Date().toISOString().split('T')[0]}
                            placeholder="When do you need these pallets?"
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
                            <label className="block text-sm font-medium text-secondary-500 mb-2">
                                Photos (Optional) - Max {MAX_PHOTOS}
                            </label>

                            {/* Photo Previews */}
                            {photos.length > 0 && (
                                <div className="flex flex-wrap gap-3 mb-4">
                                    {photos.map((photo, index) => (
                                        <div key={index} className="relative group">
                                            <Image
                                                src={photo.base64}
                                                alt={photo.name}
                                                width={80}
                                                height={80}
                                                sizes="80px"
                                                unoptimized
                                                className="w-20 h-20 object-cover rounded-lg border border-secondary-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                            <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5 rounded-b-lg">
                                                {Math.round(photo.size / 1024)}KB
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload Area */}
                            {photos.length < MAX_PHOTOS && (
                                <label className="border-2 border-dashed border-secondary-200 rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors block">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                        disabled={isProcessing}
                                    />
                                    {isProcessing ? (
                                        <div className="flex items-center justify-center gap-2 text-secondary-400">
                                            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="mx-auto h-8 w-8 text-secondary-300 mb-2" />
                                            <p className="text-secondary-400">Click to upload photos</p>
                                            <p className="text-secondary-300 text-sm mt-1">
                                                JPG, PNG up to 5MB each
                                            </p>
                                        </>
                                    )}
                                </label>
                            )}

                            {/* Error Message */}
                            {photoError && (
                                <p className="mt-2 text-sm text-red-500">{photoError}</p>
                            )}
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
                            label="Phone *"
                            name="phone"
                            type="tel"
                            value={quoteType === 'buy' ? buyData.phone : sellData.phone}
                            onChange={quoteType === 'buy' ? handleBuyChange : handleSellChange}
                            error={errors.phone}
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
