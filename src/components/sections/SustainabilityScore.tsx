'use client';

import { useEffect, useState, useRef } from 'react';
import { TreePine, Recycle, Cloud, LucideIcon } from 'lucide-react';
import { STATS } from '@/lib/constants';

const iconMap: Record<string, LucideIcon> = {
    TreePine,
    Recycle,
    Cloud,
};

function useCountUp(end: number, duration: number = 2000, shouldStart: boolean = false) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!shouldStart) return;

        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOutQuart * end));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, shouldStart]);

    return count;
}

function StatCounter({
    icon,
    value,
    label,
    suffix = '',
    isVisible
}: {
    icon: string;
    value: number;
    label: string;
    suffix?: string;
    isVisible: boolean;
}) {
    const Icon = iconMap[icon];
    const count = useCountUp(value, 2500, isVisible);

    return (
        <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                {Icon && <Icon size={32} strokeWidth={1.5} />}
            </div>
            <div className="text-4xl sm:text-5xl font-black text-secondary mb-2">
                {count.toLocaleString()}{suffix}
            </div>
            <div className="text-secondary-400 font-medium">
                {label}
            </div>
        </div>
    );
}

export function SustainabilityScore() {
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className="py-20 bg-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="section-heading text-secondary mb-4">
                        Our Environmental Impact
                    </h2>
                    <p className="text-lg text-secondary-300 max-w-2xl mx-auto">
                        Every pallet we recycle contributes to a more sustainable future for our planet and your business.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8">
                    {STATS.map((stat) => (
                        <StatCounter
                            key={stat.id}
                            icon={stat.icon}
                            value={stat.value}
                            label={stat.label}
                            suffix={stat.suffix}
                            isVisible={isVisible}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}