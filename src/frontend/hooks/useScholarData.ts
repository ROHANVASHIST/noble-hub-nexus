import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    const [loading, setLoading] = useState(true);

    const fetchNotes = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await (supabase as any)
            .from('scholar_notes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (!error && data) {
            setNotes(data.map((n: any) => ({
                id: n.id,
                title: n.title,
                content: n.content,
                date: new Date(n.created_at).toISOString().split('T')[0],
                type: n.type as 'note' | 'insight' | 'breakthrough',
            })));
        }
    }, []);

    const fetchProjects = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await (supabase as any)
            .from('research_projects')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (!error && data) {
            setProjects(data.map((p: any) => ({
                id: p.id,
                name: p.name,
                status: p.status,
                progress: p.progress,
                topic: p.topic,
                discovery: p.discovery ?? undefined,
                date: new Date(p.created_at).toISOString().split('T')[0],
            })));
        }
    }, []);

    const fetchBookmarks = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
            .from('bookmarks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (!error && data) {
            setBookmarks(data.map((b: any) => ({
                id: b.id,
                itemId: b.item_id,
                itemType: b.item_type as 'paper' | 'lecture' | 'laureate',
                title: `${b.item_type.charAt(0).toUpperCase() + b.item_type.slice(1)} Bookmark`,
                date: new Date(b.created_at).toISOString().split('T')[0],
            })));
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchNotes(), fetchProjects(), fetchBookmarks()]);
            setLoading(false);
        };
        load();
    }, [fetchNotes, fetchProjects, fetchBookmarks]);

    const addNote = async (note: Omit<LabNote, 'id' | 'date'>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        const { data, error } = await (supabase as any)
            .from('scholar_notes')
            .insert({ user_id: user.id, title: note.title, content: note.content, type: note.type })
            .select()
            .single();
        if (error) { toast.error('Failed to save note'); return null; }
        await fetchNotes();
        return data;
    };

    const addProject = async (project: Omit<ResearchProject, 'id' | 'date' | 'progress' | 'status'>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        const { data, error } = await (supabase as any)
            .from('research_projects')
            .insert({ user_id: user.id, name: project.name, topic: project.topic, discovery: project.discovery })
            .select()
            .single();
        if (error) { toast.error('Failed to save project'); return null; }
        await fetchProjects();
        return data;
    };

    const addBookmark = async (bookmark: Omit<Bookmark, 'id' | 'date'>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        const existing = bookmarks.find(b => b.itemId === bookmark.itemId && b.itemType === bookmark.itemType);
        if (existing) return null;
        const { data, error } = await supabase
            .from('bookmarks')
            .insert({ user_id: user.id, item_id: bookmark.itemId, item_type: bookmark.itemType })
            .select()
            .single();
        if (error) { toast.error('Failed to save bookmark'); return null; }
        await fetchBookmarks();
        return data;
    };

    const deleteNote = async (id: string) => {
        const { error } = await (supabase as any).from('scholar_notes').delete().eq('id', id);
        if (error) { toast.error('Failed to delete note'); return; }
        setNotes(prev => prev.filter(n => n.id !== id));
    };

    const deleteProject = async (id: string) => {
        const { error } = await (supabase as any).from('research_projects').delete().eq('id', id);
        if (error) { toast.error('Failed to delete project'); return; }
        setProjects(prev => prev.filter(p => p.id !== id));
    };

    const deleteBookmark = async (id: string) => {
        const { error } = await supabase.from('bookmarks').delete().eq('id', id);
        if (error) { toast.error('Failed to delete bookmark'); return; }
        setBookmarks(prev => prev.filter(b => b.id !== id));
    };

    const updateProjectProgress = async (id: string, progress: number, status?: string) => {
        const updates: any = { progress };
        if (status) updates.status = status;
        const { error } = await (supabase as any).from('research_projects').update(updates).eq('id', id);
        if (error) { toast.error('Failed to update project'); return; }
        await fetchProjects();
    };

    const updateNote = async (id: string, updates: { title?: string; content?: string }) => {
        const { error } = await (supabase as any).from('scholar_notes').update(updates).eq('id', id);
        if (error) { toast.error('Failed to update note'); return; }
        await fetchNotes();
    };

    return {
        notes,
        projects,
        bookmarks,
        loading,
        addNote,
        addProject,
        addBookmark,
        deleteNote,
        deleteProject,
        deleteBookmark,
        updateProjectProgress,
        updateNote,
        refreshNotes: fetchNotes,
        refreshProjects: fetchProjects,
        refreshBookmarks: fetchBookmarks,
    };
};
