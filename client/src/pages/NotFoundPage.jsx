import { Link } from 'react-router-dom';
import { NotFound } from '@/components/ui/ErrorBoundary';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <NotFound resource="page" />
    </div>
  );
}
