'use client';
import { useEffect, useRef, useState } from 'react';
import { Search, UserPlus, X } from 'lucide-react';

export default function ClientPicker({ clients, email, onSelect }: {
  clients: any[];
  email: string;
  onSelect: (data: { email: string; firstName?: string; lastName?: string }) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = (clients ?? []).find((c: any) => (c?.email ?? '').toLowerCase() === (email ?? '').toLowerCase());
    setQuery(current ? `${current.firstName ?? ''} ${current.lastName ?? ''} (${current.email})`.trim() : (email ?? ''));
  }, [email, clients]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const q = query.toLowerCase().trim();
  const results = q.length === 0 ? [] : (clients ?? []).filter((c: any) => {
    const s = `${c?.firstName ?? ''} ${c?.lastName ?? ''} ${c?.email ?? ''}`.toLowerCase();
    return s.includes(q);
  }).slice(0, 8);

  const selectClient = (c: any) => {
    onSelect({ email: c.email, firstName: c.firstName, lastName: c.lastName });
    setQuery(`${c.firstName ?? ''} ${c.lastName ?? ''} (${c.email})`.trim());
    setOpen(false);
    setCreating(false);
  };

  const startCreate = () => {
    setCreating(true);
    setNewEmail(query.includes('@') ? query : '');
    setNewFirstName('');
    setNewLastName('');
  };

  const confirmCreate = () => {
    if (!newEmail || !newEmail.includes('@')) return;
    onSelect({ email: newEmail, firstName: newFirstName, lastName: newLastName });
    setQuery(`${newFirstName} ${newLastName} (${newEmail})`.trim());
    setOpen(false);
    setCreating(false);
  };

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B312D]/30" />
        <input
          value={query}
          onChange={(e: any) => { setQuery(e.target?.value ?? ''); setOpen(true); setCreating(false); }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher un client par nom ou email..."
          className="w-full pl-9 pr-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]"
        />
      </div>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-[#F8F4EF] max-h-64 overflow-y-auto">
          {!creating && results.map((c: any) => (
            <button key={c.id} type="button" onClick={() => selectClient(c)}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F8F4EF] flex flex-col">
              <span className="font-medium text-[#3B312D]">{c?.firstName ?? ''} {c?.lastName ?? ''}</span>
              <span className="text-xs text-[#3B312D]/50">{c?.email ?? ''}</span>
            </button>
          ))}
          {!creating && q.length > 0 && results.length === 0 && (
            <p className="px-4 py-3 text-xs text-[#3B312D]/40">Aucun client trouvé pour "{query}"</p>
          )}
          {!creating && (
            <button type="button" onClick={startCreate} className="w-full text-left px-4 py-2.5 text-sm text-[#C98F79] hover:bg-[#F8F4EF] flex items-center gap-2 border-t border-[#F8F4EF]">
              <UserPlus size={14} />Créer un nouveau client
            </button>
          )}
          {creating && (
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#3B312D]/60">Nouveau client</p>
                <button type="button" onClick={() => setCreating(false)}><X size={14} className="text-[#3B312D]/40" /></button>
              </div>
              <input value={newEmail} onChange={(e: any) => setNewEmail(e.target?.value ?? '')} type="email" placeholder="Email"
                className="w-full px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" />
              <div className="grid grid-cols-2 gap-2">
                <input value={newFirstName} onChange={(e: any) => setNewFirstName(e.target?.value ?? '')} placeholder="Prénom"
                  className="px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" />
                <input value={newLastName} onChange={(e: any) => setNewLastName(e.target?.value ?? '')} placeholder="Nom"
                  className="px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" />
              </div>
              <button type="button" onClick={confirmCreate} disabled={!newEmail.includes('@')}
                className="w-full py-2 bg-[#C98F79] text-white text-sm rounded-lg disabled:opacity-40">Créer et sélectionner</button>
              <p className="text-[10px] text-[#3B312D]/40">Le compte sera créé à l'enregistrement du rendez-vous, avec un email d'invitation.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
