import React, { createContext, useContext, useState, useEffect } from 'react';
import { setsAPI, ragAPI, documentsAPI } from '../services/api';

const RAGContext = createContext();

export const useRAG = () => {
    const context = useContext(RAGContext);
    if (!context) {
        throw new Error('useRAG must be used within RAGProvider');
    }
    return context;
};

export const RAGProvider = ({ children }) => {
    const [sets, setSets] = useState([]);
    const [currentSet, setCurrentSet] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load all sets
    const loadSets = async () => {
        try {
            setLoading(true);
            const response = await setsAPI.getAll();
            setSets(response.data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error loading sets:', err);
        } finally {
            setLoading(false);
        }
    };

    // Create new set
    const createSet = async (setData) => {
        try {
            setLoading(true);
            console.log('Creating set with data:', setData);
            const response = await setsAPI.create(setData);
            console.log('Set created successfully:', response.data);
            await loadSets(); // Reload sets
            return response.data;
        } catch (err) {
            console.error('Error creating set:', err);
            console.error('Error response:', err.response?.data);
            const errorMessage = err.response?.data?.error || err.message || 'Failed to create set';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Update existing set
    const updateSet = async (id, setData) => {
        try {
            setLoading(true);
            const response = await setsAPI.update(id, setData);
            await loadSets(); // Reload sets
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete set
    const deleteSet = async (id) => {
        try {
            setLoading(true);
            await setsAPI.delete(id);
            await loadSets(); // Reload sets
            if (currentSet === id) {
                setCurrentSet(null);
            }
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Upload document to set
    const uploadDocument = async (setId, file) => {
        try {
            setLoading(true);
            const response = await documentsAPI.upload(setId, file);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Query documents
    const queryDocuments = async (query, setId = null, limit = 5) => {
        try {
            setLoading(true);
            const response = await ragAPI.query(query, setId, limit);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Generate study plan
    const generateStudyPlan = async (setId, duration = 7, hoursPerDay = 2) => {
        try {
            setLoading(true);
            const response = await ragAPI.generatePlan(setId, duration, hoursPerDay);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get set connections
    const getConnections = async (setId) => {
        try {
            const response = await ragAPI.getConnections(setId);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Generate headlines
    const generateHeadlines = async (setId, limit = 5) => {
        try {
            const response = await ragAPI.generateHeadlines(setId, limit);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Analyze knowledge gaps
    const analyzeGaps = async (setId) => {
        try {
            const response = await ragAPI.analyzeGaps(setId);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Load sets on mount
    useEffect(() => {
        loadSets();
    }, []);

    const value = {
        sets,
        currentSet,
        setCurrentSet,
        loading,
        error,
        loadSets,
        createSet,
        updateSet,
        deleteSet,
        uploadDocument,
        queryDocuments,
        generateStudyPlan,
        getConnections,
        generateHeadlines,
        analyzeGaps,
    };

    return <RAGContext.Provider value={value}>{children}</RAGContext.Provider>;
};
