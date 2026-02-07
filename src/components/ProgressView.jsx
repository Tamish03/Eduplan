import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Label, BarChart, Bar, LineChart, Line } from 'recharts';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, X, BookOpen, Target, Lightbulb, Loader } from 'lucide-react';
import { progressAPI } from '../services/api';

const ProgressView = () => {
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [realData, setRealData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiRecommendations, setAiRecommendations] = useState(null);
    const [examAnalysis, setExamAnalysis] = useState(null);

    // Load real progress data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await progressAPI.getOverview();
                if (response.data.data && response.data.data.length > 0) {
                    setRealData(response.data.data);
                    setAiRecommendations(response.data.recommendations);
                }
                const examResponse = await progressAPI.getExamAnalysis();
                setExamAnalysis(examResponse.data);
            } catch (error) {
                console.error('Error loading progress data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Use real data if available, otherwise fall back to mock data
    const mockData = [
        {
            topic: 'Calculus Integration',
            time: 12,
            score: 45,
            status: 'struggling',
            weakAreas: ['U-Substitution', 'Integration by Parts', 'Trigonometric Integrals'],
            strengths: ['Basic Integration Rules'],
            gapDetails: {
                'U-Substitution': 30,
                'Integration by Parts': 40,
                'Trigonometric Integrals': 25,
                'Partial Fractions': 50,
                'Basic Integration Rules': 80
            }
        },
        { topic: 'React Hooks', time: 3, score: 90, status: 'mastered' },
        { topic: 'Graph Theory', time: 8, score: 60, status: 'learning' },
        {
            topic: 'Organic Chemistry',
            time: 15,
            score: 30,
            status: 'struggling',
            weakAreas: ['Reaction Mechanisms', 'Stereochemistry', 'Nomenclature'],
            strengths: ['Basic Bonding'],
            gapDetails: {
                'Reaction Mechanisms': 20,
                'Stereochemistry': 25,
                'Nomenclature': 35,
                'Functional Groups': 40,
                'Basic Bonding': 70
            }
        },
        { topic: 'European History', time: 5, score: 85, status: 'mastered' },
        { topic: 'Linear Algebra', time: 10, score: 55, status: 'learning' },
        {
            topic: 'Thermodynamics',
            time: 14,
            score: 40,
            status: 'struggling',
            weakAreas: ['Entropy', 'Heat Engines', 'Carnot Cycle'],
            strengths: ['First Law'],
            gapDetails: {
                'Entropy': 30,
                'Heat Engines': 35,
                'Carnot Cycle': 25,
                'Second Law': 45,
                'First Law': 75
            }
        },
    ];

    const data = realData.length > 0 ? realData : mockData;

    const COLORS = {
        struggling: '#ef4444',
        learning: '#eab308',
        mastered: '#22c55e'
    };

    const getTopicData = (topicName) => {
        return data.find(d => d.topic === topicName);
    };

    return (
        <div className="h-full w-full p-8 overflow-y-auto bg-slate-950">
            <div className="w-full space-y-8">

                {/* Header */}
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Knowledge Gap Analysis</h2>
                    <p className="text-slate-400">Visualizing study efficiency: Identifying topics where you spend time but struggle to retain concepts.</p>
                </div>

                {/* Main Chart Section */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Chart */}
                    <div className="lg:col-span-3 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <TrendingUp className="text-blue-400" />
                            Proficiency vs. Time Spent
                        </h3>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis
                                        type="number"
                                        dataKey="time"
                                        name="Time Spent"
                                        unit="h"
                                        stroke="#94a3b8"
                                        label={{ value: 'Time Spent (Hours)', position: 'bottom', fill: '#94a3b8', offset: 0 }}
                                    />
                                    <YAxis
                                        type="number"
                                        dataKey="score"
                                        name="Proficiency"
                                        unit="%"
                                        stroke="#94a3b8"
                                        label={{ value: 'Proficiency Score (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                                    />
                                    <Tooltip
                                        cursor={{ strokeDasharray: '3 3' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
                                                        <p className="font-bold text-white mb-1">{data.topic}</p>
                                                        <p className="text-slate-300 text-sm">Time: {data.time}h</p>
                                                        <p className="text-slate-300 text-sm">Score: {data.score}%</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <ReferenceLine x={8} stroke="#475569" strokeDasharray="3 3" />
                                    <ReferenceLine y={60} stroke="#475569" strokeDasharray="3 3" />
                                    <Label value="Efficient" position="insideTopLeft" fill="#22c55e" offset={10} />
                                    <Label value="Struggling (Lagging)" position="insideBottomRight" fill="#ef4444" offset={10} />
                                    <Scatter name="Topics" data={data} fill="#8884d8">
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry.status]} />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 flex justify-center gap-6 text-sm">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-slate-300">Struggling</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span className="text-slate-300">In Progress</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-slate-300">Mastered</span></div>
                        </div>
                    </div>

                    {/* Critical Lag List */}
                    <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-red-400" />
                            Critical Attention Needed
                        </h3>
                        <p className="text-slate-400 text-sm mb-6">
                            These topics consume high study time but show low proficiency. Consider changing study resources or breaking them down.
                        </p>

                        <div className="space-y-4 overflow-y-auto flex-1">
                            {data.filter(d => d.status === 'struggling').map((item, idx) => (
                                <div key={idx} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-red-200">{item.topic}</h4>
                                        <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-1 rounded">{item.score}% Score</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-red-300/70">
                                        <Clock size={12} />
                                        <span>{item.time} hours spent</span>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-red-500/20">
                                        <button
                                            onClick={() => setSelectedTopic(item.topic)}
                                            className="w-full py-1.5 text-xs font-medium bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-colors"
                                        >
                                            View Gap Analysis
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Recommendations Section */}
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                            <Lightbulb size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">
                                {realData.length > 0 ? 'AI-Powered Recommendations' : 'AI Recommendation (Demo Mode)'}
                            </h3>
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                {aiRecommendations ? aiRecommendations.recommendation : 
                                    'Based on your graph, you are spending significant time on Organic Chemistry and Thermodynamics with suboptimal results.\n\nSuggestion: Switch from passive reading to active recall for these topics. The system has generated 3 new interactive "Sets" breaking these down into smaller, manageable chunks.'
                                }
                            </p>
                            {realData.length === 0 && (
                                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                    <p className="text-yellow-300 text-xs">
                                        💡 This is demo data. Start tracking your study sessions and quiz results in the Brainstorm tab to see personalized AI recommendations!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Exam Score Analyzer */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold text-white mb-4">Exam Score Analyzer</h3>
                    {examAnalysis && examAnalysis.summary && examAnalysis.summary.total_attempts > 0 ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <MetricCard label="Total Attempts" value={examAnalysis.summary.total_attempts} />
                                <MetricCard label="Average Score" value={`${examAnalysis.summary.average_score}%`} />
                                <MetricCard label="Latest Score" value={`${examAnalysis.summary.latest_score}%`} />
                                <MetricCard
                                    label="Trend Delta"
                                    value={`${examAnalysis.summary.trend_delta > 0 ? '+' : ''}${examAnalysis.summary.trend_delta}%`}
                                    positive={examAnalysis.summary.trend_delta >= 0}
                                />
                            </div>

                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={examAnalysis.timeline}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="label" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" domain={[0, 100]} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                                            formatter={(value, name, props) => [`${value}%`, props.payload.topic]}
                                            labelFormatter={(label) => `Attempt ${label}`}
                                        />
                                        <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-400 text-sm">
                            No exam attempts recorded yet. Use Exam Mode in Brainstorm to generate and submit tests.
                        </div>
                    )}
                </div>

            </div>

            {/* Gap Analysis Modal */}
            {selectedTopic && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-700 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Detailed Gap Analysis</h2>
                                <p className="text-slate-400">{selectedTopic}</p>
                            </div>
                            <button
                                onClick={() => setSelectedTopic(null)}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {(() => {
                                const topicData = getTopicData(selectedTopic);
                                if (!topicData || !topicData.gapDetails) return null;

                                const gapData = Object.entries(topicData.gapDetails).map(([area, score]) => ({
                                    area,
                                    score
                                }));

                                return (
                                    <>
                                        {/* Performance Breakdown Chart */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                                <Target className="text-blue-400" />
                                                Performance by Subtopic
                                            </h3>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={gapData}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                                        <XAxis dataKey="area" stroke="#94a3b8" angle={-45} textAnchor="end" height={100} />
                                                        <YAxis stroke="#94a3b8" />
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                                                            labelStyle={{ color: '#fff' }}
                                                        />
                                                        <Bar dataKey="score" fill="#3b82f6">
                                                            {gapData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.score < 40 ? '#ef4444' : entry.score < 70 ? '#eab308' : '#22c55e'} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Weak Areas */}
                                        {topicData.weakAreas && (
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
                                                <h3 className="text-lg font-semibold text-red-200 mb-3 flex items-center gap-2">
                                                    <AlertTriangle size={18} />
                                                    Areas Needing Attention
                                                </h3>
                                                <ul className="space-y-2">
                                                    {topicData.weakAreas.map((area, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-red-300">
                                                            <span className="text-red-400 mt-1">•</span>
                                                            <span>{area}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Strengths */}
                                        {topicData.strengths && (
                                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5">
                                                <h3 className="text-lg font-semibold text-green-200 mb-3 flex items-center gap-2">
                                                    <CheckCircle size={18} />
                                                    Your Strengths
                                                </h3>
                                                <ul className="space-y-2">
                                                    {topicData.strengths.map((area, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-green-300">
                                                            <span className="text-green-400 mt-1">✓</span>
                                                            <span>{area}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* AI Recommendations */}
                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
                                            <h3 className="text-lg font-semibold text-blue-200 mb-3 flex items-center gap-2">
                                                <Lightbulb size={18} />
                                                Personalized Study Plan
                                            </h3>
                                            <ol className="space-y-3 text-slate-300">
                                                <li className="flex gap-3">
                                                    <span className="font-bold text-blue-400">1.</span>
                                                    <span>Focus on your weakest areas first: {topicData.weakAreas?.[0]}</span>
                                                </li>
                                                <li className="flex gap-3">
                                                    <span className="font-bold text-blue-400">2.</span>
                                                    <span>Use active recall techniques instead of passive reading</span>
                                                </li>
                                                <li className="flex gap-3">
                                                    <span className="font-bold text-blue-400">3.</span>
                                                    <span>Break down study sessions into 25-minute focused intervals</span>
                                                </li>
                                                <li className="flex gap-3">
                                                    <span className="font-bold text-blue-400">4.</span>
                                                    <span>Practice with problem sets daily to reinforce concepts</span>
                                                </li>
                                            </ol>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MetricCard = ({ label, value, positive = true }) => (
    <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
        <div className="text-xs text-slate-400 mb-1">{label}</div>
        <div className={`text-lg font-semibold ${label === 'Trend Delta' ? (positive ? 'text-emerald-300' : 'text-red-300') : 'text-white'}`}>
            {value}
        </div>
    </div>
);

export default ProgressView;
