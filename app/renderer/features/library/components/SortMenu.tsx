import { ArrowUpDown } from 'lucide-react';

export type SortOption = 
  | 'recent-import'
  | 'alphabetical'
  | 'highest-score'
  | 'lowest-score'
  | 'last-attempt'
  | 'most-attempts';

interface SortMenuProps {
  activeSort: SortOption;
  onChange: (sort: SortOption) => void;
}

export function SortMenu({ activeSort, onChange }: SortMenuProps) {
  return (
    <div className="flex items-center space-x-2">
      <ArrowUpDown size={18} className="text-gray-500" />
      <select
        value={activeSort}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="block w-full py-2 pl-3 pr-8 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-app-primary focus:border-app-primary sm:text-sm cursor-pointer"
      >
        <option value="recent-import">Recently Imported</option>
        <option value="alphabetical">Alphabetical (A-Z)</option>
        <option value="highest-score">Highest Score</option>
        <option value="lowest-score">Lowest Score</option>
        <option value="last-attempt">Last Attempted</option>
        <option value="most-attempts">Most Attempts</option>
      </select>
    </div>
  );
}
