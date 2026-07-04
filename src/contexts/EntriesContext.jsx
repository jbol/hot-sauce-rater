import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { byHeat } from '../utils/heat';

const EntriesContext = createContext(null);

export function EntriesProvider({ children }) {
  const [entries, setEntries] = useState(null);   // null while loading
  const [error, setError] = useState(null);

  useEffect(() => {
    api.entries.list()
      .then((data) => setEntries(data.entries))
      .catch((err) => {
        setError(err.message);
        setEntries([]);
      });
  }, []);

  const addEntry = useCallback(async (values) => {
    const data = await api.entries.create(values);
    setEntries((prev) => [...(prev ?? []), data.entry]);
    return data.entry;
  }, []);

  const updateEntry = useCallback(async (id, values) => {
    const data = await api.entries.update(id, values);
    setEntries((prev) => (prev ?? []).map((e) => (e.id === id ? data.entry : e)));
    return data.entry;
  }, []);

  const deleteEntry = useCallback(async (id) => {
    await api.entries.remove(id);
    setEntries((prev) => (prev ?? []).filter((e) => e.id !== id));
  }, []);

  // The canonical passport order: least → most spicy.
  const sorted = useMemo(() => (entries ? [...entries].sort(byHeat) : []), [entries]);

  const value = {
    entries: sorted,
    loading: entries === null,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
  };

  return <EntriesContext.Provider value={value}>{children}</EntriesContext.Provider>;
}

export function useEntries() {
  const ctx = useContext(EntriesContext);
  if (!ctx) throw new Error('useEntries must be used inside <EntriesProvider>');
  return ctx;
}
