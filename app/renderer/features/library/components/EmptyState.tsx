import { FileSearch, UploadCloud } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface EmptyStateProps {
  type: 'no-tests' | 'no-results';
  onAction?: () => void;
}

export function EmptyState({ type, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-gray-100 shadow-sm">
      {type === 'no-tests' ? (
        <>
          <div className="w-20 h-20 bg-blue-50 text-app-primary rounded-full flex items-center justify-center mb-6">
            <UploadCloud size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Tests Found</h3>
          <p className="text-gray-500 mb-8 max-w-md">
            Your library is empty. Import a NEET CBT practice test package to get started.
          </p>
          {onAction && (
            <Button size="lg" onClick={onAction}>
              Import Test Package
            </Button>
          )}
        </>
      ) : (
        <>
          <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-6">
            <FileSearch size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-500 mb-6">
            We couldn't find any tests matching your search and filter criteria.
          </p>
          {onAction && (
            <Button variant="secondary" onClick={onAction}>
              Clear Filters
            </Button>
          )}
        </>
      )}
    </div>
  );
}
