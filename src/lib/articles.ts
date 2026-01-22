import { Article } from '@/components/ui/ArticleCard';

export const ARTICLES: Article[] = [
    {
        slug: 'pallet-grades-explained',
        title: 'Pallet Grades Explained: Grade A vs Grade B vs Grade C',
        excerpt: 'Understanding the differences between pallet grades helps you choose the right option for your business needs and budget.',
        category: 'Education',
        date: 'December 15, 2024',
        readingTime: 5,
        author: 'Grunge Pallets Team',
        image: '/Pallet-Grades.png',
    },
    {
        slug: 'sustainability-report-2024',
        title: '2024 Sustainability Report: Our Environmental Impact',
        excerpt: 'See how Grunge Pallets is leading the charge in sustainable pallet solutions with our annual environmental impact report.',
        category: 'Sustainability',
        date: 'December 10, 2024',
        readingTime: 8,
        author: 'Grunge Pallets Team',
        image: '/Sustainability_report.png',
    },
    {
        slug: 'choosing-right-pallet',
        title: 'How to Choose the Right Pallet for Your Products',
        excerpt: 'From load capacity to wood type, learn the key factors to consider when selecting pallets for your shipping needs.',
        category: 'Guide',
        date: 'December 5, 2024',
        readingTime: 6,
        author: 'Grunge Pallets Team',
        image: '/Choosing-Right-Pallet.jpeg',
    },
    {
        slug: 'recycling-benefits',
        title: 'The Business Benefits of Pallet Recycling Programs',
        excerpt: 'Discover how partnering with a pallet recycling service can reduce costs and boost your sustainability credentials.',
        category: 'Sustainability',
        date: 'November 28, 2024',
        readingTime: 4,
        author: 'Grunge Pallets Team',
        image: '/Recycling-Benefits.jpeg',
    },
];

// Get unique categories from articles
export const ARTICLE_CATEGORIES = ['All', ...new Set(ARTICLES.map(a => a.category))];
