import React, { useState } from 'react';
import { Search, BookOpen, Video, FileText, ExternalLink, Star, Clock, Filter, Loader } from 'lucide-react';
import { useRAG } from '../contexts/RAGContext';

const ContentFinder = () => {
    const { queryDocuments, sets, loading } = useRAG();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchResults, setSearchResults] = useState(null);
    const [searching, setSearching] = useState(false);

    // Mock content data (fallback when no RAG results)
    const mockContentItems = [
        {
            id: 1,
            title: 'Introduction to Calculus - Khan Academy',
            type: 'video',
            source: 'Khan Academy',
            duration: '15 min',
            rating: 4.8,
            topic: 'Calculus',
            url: 'https://khanacademy.org',
            description: 'Comprehensive introduction to calculus concepts including limits and derivatives.'
        },
        {
            id: 2,
            title: 'React Hooks Complete Guide',
            type: 'article',
            source: 'Dev.to',
            duration: '10 min read',
            rating: 4.5,
            topic: 'React JS',
            url: 'https://dev.to',
            description: 'Deep dive into React Hooks with practical examples and best practices.'
        },
        {
            id: 3,
            title: 'Linear Algebra MIT OpenCourseWare',
            type: 'course',
            source: 'MIT OCW',
            duration: '12 weeks',
            rating: 4.9,
            topic: 'Linear Algebra',
            url: 'https://ocw.mit.edu',
            description: 'Complete linear algebra course from MIT with lectures and problem sets.'
        },
    ];

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            setSearching(true);
            const results = await queryDocuments(searchQuery, null, 10);
            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults({ results: [], total_found: 0 });
        } finally {
            setSearching(false);
        }
    };

    // Determine what content to display
    const displayContent = searchResults
        ? searchResults.results.map((result, idx) => ({
            id: `rag-${idx}`,
            title: result.citation,
            type: 'document',
            source: result.source,
            duration: 'From your documents',
            rating: result.relevance_score * 5,
            topic: result.set_name,
            url: '#',
            description: result.content.substring(0, 200) + '...'
        }))
        : mockContentItems.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.topic.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter;
            return matchesSearch && matchesFilter;
        });

    const getTypeColor = (type) => {
        const colors = {
            video: 'bg-red-500/20 text-red-300 border-red-500/30',
            article: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            course: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            interactive: 'bg-green-500/20 text-green-300 border-green-500/30',
            document: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        };
        return colors[type] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    };

    return (
        <div className="h-full w-full p-8 overflow-y-auto bg-slate-950">
            <div className="w-full space-y-6">

                {/* Header */}
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Content Finder</h2>
                    <p className="text-slate-400">
                        {searchResults
                            ? 'Searching your uploaded documents with RAG'
                            : 'Discover curated learning resources tailored to your study topics'}
                    </p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search for topics, resources, or content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {searching && (
                        <Loader className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" size={20} />
                    )}
                </form>

                {/* RAG Status */}
                {searchResults && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-sm text-blue-300">
                            ✨ Showing results from your uploaded documents using RAG
                        </p>
                    </div>
                )}

                {/* Results Count */}
                <div className="text-sm text-slate-400">
                    Found <span className="text-white font-semibold">{displayContent.length}</span> resources
                    {searchResults && <span className="ml-2 text-blue-400">(from RAG search)</span>}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayContent.map(item => (
                        <div
                            key={item.id}
                            className="group bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 rounded-xl p-5 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors mb-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-slate-400">{item.source}</p>
                                </div>
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-slate-800 hover:bg-blue-500 rounded-lg transition-colors"
                                >
                                    <ExternalLink size={16} className="text-slate-300" />
                                </a>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                                {item.description}
                            </p>

                            {/* Meta Info */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(item.type)}`}>
                                        {item.type}
                                    </span>
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <Clock size={12} />
                                        <span>{item.duration}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-yellow-400">
                                    <Star size={14} fill="currentColor" />
                                    <span className="text-sm font-medium">{item.rating.toFixed(1)}</span>
                                </div>
                            </div>

                            {/* Topic Tag */}
                            <div className="mt-3 pt-3 border-t border-slate-800">
                                <span className="text-xs text-slate-500">Related to: <span className="text-blue-400">{item.topic}</span></span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {displayContent.length === 0 && (
                    <div className="text-center py-16">
                        <Search size={48} className="mx-auto text-slate-600 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-400 mb-2">No results found</h3>
                        <p className="text-slate-500">
                            {searchResults
                                ? 'Try uploading documents in the RAG Test tab first'
                                : 'Try adjusting your search or filters'}
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ContentFinder;
