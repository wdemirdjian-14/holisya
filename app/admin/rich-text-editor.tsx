'use client';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false, loading: () => <div className="h-48 bg-[#F8F4EF]/50 rounded-lg animate-pulse" /> });

const MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

export default function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  return (
    <div className="bg-white rounded-lg [&_.ql-container]:rounded-b-lg [&_.ql-toolbar]:rounded-t-lg [&_.ql-editor]:min-h-[200px]">
      <ReactQuill theme="snow" value={value ?? ''} onChange={onChange} modules={MODULES} />
    </div>
  );
}
