import React, { useEffect, useState } from 'react';
import { AlertCircle, BookOpen, Brain, CheckCircle, FileText, GraduationCap, Loader, Radar, Save, Search, Shield, Trash2, X } from 'lucide-react';
import { useRAG } from '../contexts/RAGContext';
import { advancedAPI } from '../services/api';
import DocumentUpload from './DocumentUpload';

const TABS = [
    { id: 'create', label: 'Create Set', icon: BookOpen },
    { id: 'upload', label: 'Upload Document', icon: FileText },
    { id: 'query', label: 'Safe Query', icon: Search },
    { id: 'plan', label: 'Generate Plan', icon: Brain },
    { id: 'insights', label: 'Learning Twin', icon: Radar },
    { id: 'exam', label: 'Exam Mode', icon: GraduationCap },
];

const RAGTestUI = () => {
    const {
        sets,
        createSet,
        updateSet,
        deleteSet,
        queryDocuments,
        generateStudyPlan,
        loading,
    } = useRAG();

    const [activeTab, setActiveTab] = useState('create');
    const [newSet, setNewSet] = useState({ name: '', subject: '', grade: '', difficulty: 'medium', description: '' });
    const [selectedSet, setSelectedSet] = useState(null);
    const [query, setQuery] = useState('');
    const [queryResults, setQueryResults] = useState(null);
    const [studyPlan, setStudyPlan] = useState(null);
    const [status, setStatus] = useState(null);
    const [editingSet, setEditingSet] = useState(null);
    const [editForm, setEditForm] = useState({});

    const [safeMode, setSafeMode] = useState(true);
    const [learningTwin, setLearningTwin] = useState(null);
    const [breakpoint, setBreakpoint] = useState(null);

    const [examQuestionCount, setExamQuestionCount] = useState(8);
    const [examSession, setExamSession] = useState(null);
    const [examAnswers, setExamAnswers] = useState({});
    const [examResult, setExamResult] = useState(null);

    useEffect(() => {
        if (!selectedSet) {
            setLearningTwin(null);
            setBreakpoint(null);
            return;
        }

        (async () => {
            try {
                const [lt, bp] = await Promise.all([
                    advancedAPI.getLearningTwin(selectedSet),
                    advancedAPI.getBreakpoint(selectedSet),
                ]);
                setLearningTwin(lt.data);
                setBreakpoint(bp.data);
            } catch (error) {
                console.error('Failed to load advanced insights:', error);
            }
        })();
    }, [selectedSet]);

    const setStatusWithTimeout = (payload, ms = 3500) => {
        setStatus(payload);
        setTimeout(() => setStatus(null), ms);
    };

    const handleCreateSet = async (e) => {
        e.preventDefault();
        if (!newSet.name || !newSet.subject || !newSet.grade) {
            setStatusWithTimeout({ type: 'error', message: 'Name, subject, and grade are required.' }, 4000);
            return;
        }

        try {
            setStatus({ type: 'loading', message: 'Creating set...' });
            const result = await createSet(newSet);
            setStatusWithTimeout({ type: 'success', message: `Set "${result.name}" created.` });
            setNewSet({ name: '', subject: '', grade: '', difficulty: 'medium', description: '' });
            setSelectedSet(result.id);
        } catch (error) {
            setStatusWithTimeout({ type: 'error', message: error.message || 'Failed to create set' }, 5000);
        }
    };

    const handleDeleteSet = async (setId) => {
        if (!confirm('Delete this set and all related data?')) return;
        try {
            setStatus({ type: 'loading', message: 'Deleting set...' });
            await deleteSet(setId);
            if (selectedSet === setId) setSelectedSet(null);
            setStatusWithTimeout({ type: 'success', message: 'Set deleted.' });
        } catch (error) {
            setStatusWithTimeout({ type: 'error', message: error.message || 'Delete failed' }, 5000);
        }
    };

    const handleSaveEdit = async (setId) => {
        try {
            setStatus({ type: 'loading', message: 'Updating set...' });
            await updateSet(setId, editForm);
            setEditingSet(null);
            setStatusWithTimeout({ type: 'success', message: 'Set updated.' });
        } catch (error) {
            setStatusWithTimeout({ type: 'error', message: error.message || 'Update failed' }, 5000);
        }
    };

    const handleQuery = async (e) => {
        e.preventDefault();
        if (!query.trim()) {
            setStatusWithTimeout({ type: 'error', message: 'Enter a query first.' });
            return;
        }

        try {
            setStatus({ type: 'loading', message: safeMode ? 'Running safe query firewall...' : 'Querying documents...' });
            setQueryResults(null);

            const data = safeMode
                ? (await advancedAPI.safeQuery(query, selectedSet)).data
                : await queryDocuments(query, selectedSet);

            setQueryResults(data);
            if (data.blocked) {
                setStatusWithTimeout({ type: 'error', message: 'Low trust answer blocked by firewall.' }, 4500);
            } else {
                setStatusWithTimeout({ type: 'success', message: 'Query completed.' });
            }
        } catch (error) {
            setStatusWithTimeout({ type: 'error', message: error.response?.data?.error || error.message || 'Query failed' }, 5000);
        }
    };

    const handleGeneratePlan = async () => {
        if (!selectedSet) {
            setStatusWithTimeout({ type: 'error', message: 'Select a set first.' });
            return;
        }

        try {
            setStatus({ type: 'loading', message: 'Generating study plan...' });
            const plan = await generateStudyPlan(selectedSet, 7, 2);
            setStudyPlan(plan);
            setStatusWithTimeout({ type: 'success', message: 'Study plan generated.' });
        } catch (error) {
            setStatusWithTimeout({ type: 'error', message: error.response?.data?.error || error.message || 'Plan generation failed' }, 5000);
        }
    };

    const handleGenerateExam = async () => {
        if (!selectedSet) {
            setStatusWithTimeout({ type: 'error', message: 'Select a set first.' });
            return;
        }

        try {
            setStatus({ type: 'loading', message: 'Generating exam session...' });
            const { data } = await advancedAPI.generateExam(selectedSet, examQuestionCount);
            setExamSession(data);
            setExamAnswers({});
            setExamResult(null);
            setStatusWithTimeout({ type: 'success', message: 'Exam generated.' });
        } catch (error) {
            setStatusWithTimeout({ type: 'error', message: error.response?.data?.error || error.message || 'Exam generation failed' }, 5000);
        }
    };

    const handleSubmitExam = async () => {
        if (!examSession?.session_id) return;
        try {
            setStatus({ type: 'loading', message: 'Submitting exam...' });
            const { data } = await advancedAPI.submitExam(examSession.session_id, examAnswers);
            setExamResult(data);
            setStatusWithTimeout({ type: 'success', message: `Exam scored ${data.score}%` }, 5000);
        } catch (error) {
            setStatusWithTimeout({ type: 'error', message: error.response?.data?.error || error.message || 'Exam submit failed' }, 5000);
        }
    };

    return (
        <div className="h-full w-full p-8 overflow-y-auto bg-slate-950">
            <div className="w-full space-y-6">
                <div>
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Brainstorm AI Lab</h1>
                    <p className="text-slate-400">Advanced planning engine: Safe Query, Learning Twin, Breakpoint Detector, and Exam Mode Agent.</p>
                </div>

                {status && (
                    <div className={`p-4 rounded-lg flex items-center gap-3 ${status.type === 'success' ? 'bg-green-500/10 border border-green-500/30' : status.type === 'error' ? 'bg-red-500/10 border border-red-500/30' : 'bg-blue-500/10 border border-blue-500/30'}`}>
                        {status.type === 'loading' && <Loader className="animate-spin text-blue-400" size={20} />}
                        {status.type === 'success' && <CheckCircle className="text-green-400" size={20} />}
                        {status.type === 'error' && <AlertCircle className="text-red-400" size={20} />}
                        <p className="text-sm text-slate-200">{status.message}</p>
                    </div>
                )}

                <div className="flex flex-wrap gap-2 border-b border-slate-800">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    {activeTab === 'create' && (
                        <div className="space-y-6">
                            <form onSubmit={handleCreateSet} className="space-y-3">
                                <input value={newSet.name} onChange={(e) => setNewSet({ ...newSet, name: e.target.value })} className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700" placeholder="Set Name" required />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input value={newSet.subject} onChange={(e) => setNewSet({ ...newSet, subject: e.target.value })} className="px-3 py-2 rounded bg-slate-800 border border-slate-700" placeholder="Subject" required />
                                    <input value={newSet.grade} onChange={(e) => setNewSet({ ...newSet, grade: e.target.value })} className="px-3 py-2 rounded bg-slate-800 border border-slate-700" placeholder="Grade" required />
                                    <select value={newSet.difficulty} onChange={(e) => setNewSet({ ...newSet, difficulty: e.target.value })} className="px-3 py-2 rounded bg-slate-800 border border-slate-700">
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                                <textarea value={newSet.description} onChange={(e) => setNewSet({ ...newSet, description: e.target.value })} className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700" rows={3} placeholder="Description" />
                                <button disabled={loading} className="w-full py-2.5 rounded bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700">{loading ? 'Creating...' : 'Create Set'}</button>
                            </form>

                            <div className="space-y-2">
                                {sets.map((set) => (
                                    <div key={set.id} className={`p-3 rounded border ${selectedSet === set.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-800/50'}`}>
                                        {editingSet === set.id ? (
                                            <div className="space-y-2">
                                                <input value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-2 py-1 rounded bg-slate-700 border border-slate-600" />
                                                <div className="grid grid-cols-3 gap-2">
                                                    <input value={editForm.subject || ''} onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })} className="px-2 py-1 rounded bg-slate-700 border border-slate-600" />
                                                    <input value={editForm.grade || ''} onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })} className="px-2 py-1 rounded bg-slate-700 border border-slate-600" />
                                                    <select value={editForm.difficulty || 'medium'} onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })} className="px-2 py-1 rounded bg-slate-700 border border-slate-600">
                                                        <option value="easy">Easy</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="hard">Hard</option>
                                                    </select>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleSaveEdit(set.id)} className="flex-1 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center gap-1"><Save size={14} /> Save</button>
                                                    <button onClick={() => setEditingSet(null)} className="flex-1 py-1.5 rounded bg-slate-600 hover:bg-slate-500 flex items-center justify-center gap-1"><X size={14} /> Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between gap-2">
                                                <div onClick={() => setSelectedSet(set.id)} className="cursor-pointer flex-1">
                                                    <p className="font-semibold">{set.name}</p>
                                                    <p className="text-sm text-slate-400">{set.subject} | Grade {set.grade} | {set.difficulty}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => { setEditingSet(set.id); setEditForm({ name: set.name, subject: set.subject, grade: set.grade, difficulty: set.difficulty }); }} className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs">Edit</button>
                                                    <button onClick={() => handleDeleteSet(set.id)} className="px-2 py-1 rounded bg-red-500/20 text-red-300 text-xs flex items-center gap-1"><Trash2 size={12} /> Delete</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        selectedSet ? (
                            <DocumentUpload setId={selectedSet} onUploadComplete={() => setStatusWithTimeout({ type: 'success', message: 'Document uploaded and processed.' })} />
                        ) : <p className="text-slate-400">Select a set in Create tab first.</p>
                    )}

                    {activeTab === 'query' && (
                        <div className="space-y-4">
                            <form onSubmit={handleQuery} className="space-y-3">
                                <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700" placeholder="Ask a question from your docs" required />
                                <label className="flex items-center gap-2 text-sm text-slate-300">
                                    <input type="checkbox" checked={safeMode} onChange={(e) => setSafeMode(e.target.checked)} className="rounded" />
                                    <span className="flex items-center gap-1"><Shield size={14} /> Enable Hallucination Firewall</span>
                                </label>
                                <button className="w-full py-2.5 rounded bg-blue-500 hover:bg-blue-600">Run Query</button>
                            </form>

                            {queryResults && (
                                <div className="space-y-3">
                                    {queryResults.verdict && (
                                        <div className="p-3 rounded border border-amber-500/30 bg-amber-500/10 text-sm text-amber-200">
                                            Verdict: {queryResults.verdict} | Trust: {Math.round((queryResults.trust_score || 0) * 100)}%
                                        </div>
                                    )}
                                    {queryResults.answer && (
                                        <div className="p-4 rounded border border-slate-700 bg-slate-800/50">
                                            <h3 className="font-semibold mb-2">Answer</h3>
                                            <p className="text-slate-300 whitespace-pre-wrap">{queryResults.answer}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'plan' && (
                        <div className="space-y-4">
                            <button onClick={handleGeneratePlan} className="w-full py-2.5 rounded bg-purple-500 hover:bg-purple-600">Generate 7-Day Plan</button>
                            {studyPlan && (
                                <div className="space-y-3">
                                    <div className="p-3 rounded border border-purple-500/30 bg-purple-500/10 text-sm">
                                        {studyPlan.set_name} | {studyPlan.duration_days} days | {studyPlan.hours_per_day}h/day
                                    </div>
                                    {studyPlan.study_plan?.map((day) => (
                                        <div key={day.day} className="p-3 rounded border border-slate-700 bg-slate-800/50">
                                            <p className="font-semibold mb-1">Day {day.day} ({day.date})</p>
                                            <ul className="text-sm text-slate-300 space-y-1">
                                                {day.objectives?.map((o, i) => <li key={i}>- {o}</li>)}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'insights' && (
                        selectedSet ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded border border-cyan-500/30 bg-cyan-500/10">
                                    <h3 className="font-semibold text-cyan-300 mb-2">Learning Twin</h3>
                                    {learningTwin ? (
                                        <>
                                            <p className="text-sm text-slate-200">Best Time Slot: {learningTwin.best_time_slot}</p>
                                            <p className="text-sm text-slate-200">Preferred Modality: {learningTwin.preferred_modality}</p>
                                            <p className="text-sm text-slate-200">Mastery Score: {learningTwin.mastery_score}</p>
                                            <p className="text-sm text-slate-400 mt-2">{learningTwin.adaptation_notes}</p>
                                        </>
                                    ) : <p className="text-sm text-slate-400">Loading profile...</p>}
                                </div>

                                <div className="p-4 rounded border border-amber-500/30 bg-amber-500/10">
                                    <h3 className="font-semibold text-amber-300 mb-2">Breakpoint Detector</h3>
                                    {breakpoint ? (
                                        <>
                                            <p className="text-sm text-slate-200">Breakpoint Topic: {breakpoint.breakpoint_topic || 'N/A'}</p>
                                            <p className="text-sm text-slate-200">Prerequisite Root: {breakpoint.prerequisite_root || 'N/A'}</p>
                                            <p className="text-sm text-slate-200">Confidence: {Math.round((breakpoint.confidence || 0) * 100)}%</p>
                                            <ul className="text-sm text-slate-400 mt-2 space-y-1">
                                                {(breakpoint.remediation_path || []).map((x, i) => <li key={i}>- {x}</li>)}
                                            </ul>
                                        </>
                                    ) : <p className="text-sm text-slate-400">Loading breakpoint analysis...</p>}
                                </div>
                            </div>
                        ) : <p className="text-slate-400">Select a set first.</p>
                    )}

                    {activeTab === 'exam' && (
                        selectedSet ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <input type="number" min={3} max={20} value={examQuestionCount} onChange={(e) => setExamQuestionCount(Number(e.target.value))} className="w-24 px-2 py-1 rounded bg-slate-800 border border-slate-700" />
                                    <button onClick={handleGenerateExam} className="px-4 py-2 rounded bg-indigo-500 hover:bg-indigo-600">Generate Exam</button>
                                </div>

                                {examSession?.questions?.map((q, idx) => (
                                    <div key={q.id} className="p-4 rounded border border-slate-700 bg-slate-800/50">
                                        <p className="font-medium mb-2">{idx + 1}. {q.question}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                            {q.options.map((opt, i) => {
                                                const label = ['A', 'B', 'C', 'D'][i];
                                                return (
                                                    <label key={label} className="flex items-center gap-2">
                                                        <input type="radio" name={q.id} checked={examAnswers[q.id] === label} onChange={() => setExamAnswers((prev) => ({ ...prev, [q.id]: label }))} />
                                                        <span>{label}. {opt}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {examSession && <button onClick={handleSubmitExam} className="w-full py-2.5 rounded bg-emerald-500 hover:bg-emerald-600">Submit Exam</button>}

                                {examResult && (
                                    <div className="p-4 rounded border border-emerald-500/30 bg-emerald-500/10">
                                        <h3 className="font-semibold text-emerald-300">Score: {examResult.score}%</h3>
                                        <p className="text-sm text-slate-300">Correct: {examResult.correct}/{examResult.total}</p>
                                        <p className="text-sm text-slate-400 mt-2">{examResult.recommendation}</p>
                                    </div>
                                )}
                            </div>
                        ) : <p className="text-slate-400">Select a set first.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RAGTestUI;
