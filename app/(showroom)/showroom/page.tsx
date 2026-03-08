import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const CATEGORIES = [
    {
        id: 'venue',
        label: 'Venues',
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop',
        color: 'from-purple-600 to-indigo-600',
        icon: '🏰'
    },
    {
        id: 'catering',
        label: 'Catering',
        image: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800&auto=format&fit=crop',
        color: 'from-orange-500 to-red-500',
        icon: '🍽️'
    },
    {
        id: 'decor',
        label: 'Decor & Styling',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
        color: 'from-pink-500 to-rose-500',
        icon: '✨'
    },
    {
        id: 'photography',
        label: 'Photography',
        image: 'https://images.unsplash.com/photo-1537905569824-f89f14cceb68?q=80&w=800&auto=format&fit=crop',
        color: 'from-blue-500 to-cyan-500',
        icon: '📸'
    },
    {
        id: 'entertainment',
        label: 'Entertainment',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop',
        color: 'from-violet-500 to-purple-500',
        icon: '🎵'
    },
    {
        id: 'makeup',
        label: 'Makeup & Styling',
        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop',
        color: 'from-pink-400 to-fuchsia-500',
        icon: '💄'
    },
    {
        id: 'transport',
        label: 'Transport',
        image: 'https://images.unsplash.com/photo-1494976388531-d1058494ceb8?q=80&w=800&auto=format&fit=crop',
        color: 'from-emerald-500 to-teal-600',
        icon: '🚗'
    },
    {
        id: 'mehendi',
        label: 'Mehendi Artists',
        image: 'https://images.unsplash.com/photo-1596553122843-41bd0b807d43?q=80&w=800&auto=format&fit=crop',
        color: 'from-amber-500 to-orange-600',
        icon: '🎨'
    },
    {
        id: 'florist',
        label: 'Florists',
        image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?q=80&w=800&auto=format&fit=crop',
        color: 'from-green-500 to-emerald-600',
        icon: '💐'
    },
    {
        id: 'choreography',
        label: 'Choreographers',
        image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?q=80&w=800&auto=format&fit=crop',
        color: 'from-rose-500 to-red-600',
        icon: '💃'
    },
    {
        id: 'lighting',
        label: 'Lighting & AV',
        image: 'https://images.unsplash.com/photo-1504509546545-e000b4a62425?q=80&w=800&auto=format&fit=crop',
        color: 'from-yellow-500 to-amber-600',
        icon: '💡'
    }
]

export default function ShowroomHome() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                    Curated Collections
                </h1>
                <p className="text-lg text-gray-500">
                    Explore our handpicked selection of premium vendors and services for your perfect event.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CATEGORIES.map((cat) => (
                    <Link href={`/showroom/browse/${cat.id}`} key={cat.id}>
                        <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 h-[300px] relative cursor-pointer">
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <img
                                    src={cat.image}
                                    alt={cat.label}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col justify-end p-8">
                                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-2xl bg-gradient-to-br shadow-lg",
                                        cat.color
                                    )}>
                                        {cat.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{cat.label}</h3>
                                    <div className="h-0 group-hover:h-auto overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                                        <span className="text-gray-300 text-sm font-medium flex items-center gap-2">
                                            Explore Network <span className="text-white">→</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
