interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  isEmpty?: boolean;
  onRowClick?: (row: T) => void;
  actions?: {
    label: string;
    onClick: (row: T) => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
}

export default function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  isLoading,
  isEmpty,
  onRowClick,
  actions,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded border border-gray-300 overflow-hidden">
        <div className="p-6 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="bg-white rounded border border-gray-300 overflow-hidden p-12 text-center">
        <p className="text-ink-500 text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded border border-gray-300 overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100 border-b border-gray-300">
          <tr>
            {columns.map((column, idx) => (
              <th
                key={idx}
                className={`px-6 py-3 text-left text-xs font-semibold text-ink-700 uppercase tracking-wide ${
                  column.width || 'w-auto'
                }`}
              >
                {column.header}
              </th>
            ))}
            {actions && actions.length > 0 && (
              <th className="px-6 py-3 text-left text-xs font-semibold text-ink-700 uppercase tracking-wide">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300">
          {data.map((row, rowIdx) => (
            <tr
              key={row.id || rowIdx}
              onClick={() => onRowClick?.(row)}
              className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
            >
              {columns.map((column, colIdx) => (
                <td key={colIdx} className="px-6 py-4 text-sm text-ink-700">
                  {column.render
                    ? column.render(row[column.accessor], row)
                    : String(row[column.accessor] || '-')}
                </td>
              ))}
              {actions && actions.length > 0 && (
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    {actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick(row);
                        }}
                        className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
                          action.variant === 'danger'
                            ? 'bg-white text-ink-600 border-ink-300 hover:bg-gray-50'
                            : action.variant === 'secondary'
                            ? 'bg-white text-ink-600 border-ink-300 hover:bg-gray-50'
                            : 'bg-ink-900 text-white border-ink-900 hover:bg-ink-800'
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
