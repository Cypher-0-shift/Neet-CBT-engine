interface FilterPanelProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

export function FilterPanel({
  statusFilter,
  onStatusChange
}: FilterPanelProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="block w-full py-1.5 pl-3 pr-8 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-app-primary focus:border-app-primary sm:text-sm cursor-pointer"
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="never">Never Attempted</option>
        </select>
      </div>
      
    </div>
  );
}
