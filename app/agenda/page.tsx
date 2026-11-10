'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const AdminDashboard = dynamic(() => import('@/app/admin/admin-dashboard'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F4EF]">
      <Loader2 size={32} className="animate-spin text-[#C98F79]" />
    </div>
  ),
});

export default function AgendaPage() {
  return (
    <main className="min-h-screen bg-[#F8F4EF]">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8F4EF]"><Loader2 size={32} className="animate-spin text-[#C98F79]" /></div>}>
        <AdminDashboard agendaOnly />
      </Suspense>
    </main>
  );
}
