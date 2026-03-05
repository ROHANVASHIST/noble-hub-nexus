import { useState, useEffect } from 'react';

export interface LabNote {
    id: string;
    title: string;
    content: string;
    date: string;
    type: 'note' | 'insight' | 'breakthrough';
}

export interface ResearchProject {
    id: string;
    name: string;
    status: string;
    progress: number;
    topic: string;
    discovery?: string;
    date: string;
}

export interface Bookmark {
    id: string;
    itemId: string;
    itemType: 'paper' | 'lecture' | 'laureate';
    title: string;
    date: string;
}

export const useScholarData = () => {
    const [notes, setNotes] = useState<LabNote[]>([]);
    const [projects, setProjects] = useState<ResearchProject[]>([]);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

    // Initialize from localStorage
    useEffect(() => {
        const savedNotes = localStorage.getItem('scholar_notes');
        const savedProjects = localStorage.getItem('scholar_projects');
        const savedBookmarks = localStorage.getItem('scholar_bookmarks');

        if (savedNotes) setNotes(JSON.parse(savedNotes));
        if (savedProjects) setProjects(JSON.parse(savedProjects));
        if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
    }, []);

    const addNote = (note: Omit<LabNote, 'id' | 'date'>) => {
        const newNote: LabNote = {
            ...note,
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
        };

        setNotes(prev => {
            const updated = [newNote, ...prev];
            localStorage.setItem('scholar_notes', JSON.stringify(updated));
            return updated;
        });
        return newNote;
    };

    const addProject = (project: Omit<ResearchProject, 'id' | 'date' | 'progress' | 'status'>) => {
        const newProject: ResearchProject = {
            ...project,
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            progress: 0,
            status: 'Active Research',
        };

        setProjects(prev => {
            const updated = [newProject, ...prev];
            localStorage.setItem('scholar_projects', JSON.stringify(updated));
            return updated;
        });
        return newProject;
    };

    const addBookmark = (bookmark: Omit<Bookmark, 'id' | 'date'>) => {
        let added = null;
        setBookmarks(prev => {
            if (prev.find(b => b.itemId === bookmark.itemId && b.itemType === bookmark.itemType)) {
                return prev;
            }
            const newBookmark: Bookmark = {
                ...bookmark,
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0],
            };
            const updated = [newBookmark, ...prev];
            localStorage.setItem('scholar_bookmarks', JSON.stringify(updated));
            added = newBookmark;
            return updated;
        });
        return added;
    };

    const deleteNote = (id: string) => {
        setNotes(prev => {
            const updated = prev.filter(n => n.id !== id);
            localStorage.setItem('scholar_notes', JSON.stringify(updated));
            return updated;
        });
    };

    const updateProjectProgress = (id: string, progress: number, status?: string) => {
        setProjects(prev => {
            const updated = prev.map(p => p.id === id ? { ...p, progress, status: status || p.status } : p);
            localStorage.setItem('scholar_projects', JSON.stringify(updated));
            return updated;
        });
    };

    return {
        notes,
        projects,
        bookmarks,
        addNote,
        addProject,
        addBookmark,
        deleteNote,
        updateProjectProgress
    };
};
