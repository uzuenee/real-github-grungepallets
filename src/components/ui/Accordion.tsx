'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
    id: string;
    question: string;
    answer: string;
}

interface AccordionProps {
    items: AccordionItem[];
}

export function Accordion({ items }: AccordionProps) {
    const [openId, setOpenId] = useState<string | null>(null);

    const toggleItem = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <div className="space-y-3">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="bg-white rounded-xl border border-secondary-100 overflow-hidden"
                >
                    <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary-50 transition-colors"
                        aria-expanded={openId === item.id}
                    >
                        <span className="font-semibold text-secondary pr-4">
                            {item.question}
                        </span>
                        <ChevronDown
                            size={20}
                            className={`flex-shrink-0 text-secondary-400 transition-transform duration-300 ${openId === item.id ? 'rotate-180' : ''
                                }`}
                        />
                    </button>
                    <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${openId === item.id ? 'max-h-96' : 'max-h-0'
                            }`}
                    >
                        <div className="p-5 pt-0 text-secondary-400 leading-relaxed">
                            {item.answer}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
