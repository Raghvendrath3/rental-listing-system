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
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden p-12 text-center">
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto shadow-sm">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((column, idx) => (
              <th
                key={idx}
                className={`px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide ${
                  column.width || 'w-auto'
                }`}
              >
                {column.header}
              </th>
            ))}
            {actions && actions.length > 0 && (
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, rowIdx) => (
            <tr
              key={row.id || rowIdx}
              onClick={() => onRowClick?.(row)}
              className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
            >
              {columns.map((column, colIdx) => (
                <td key={colIdx} className="px-6 py-4 text-sm text-gray-700">
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
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                          action.variant === 'danger'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : action.variant === 'secondary'
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
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
