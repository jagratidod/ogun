import { classNames } from '../../utils/helpers';
import { RiArrowUpSLine, RiArrowDownSLine } from 'react-icons/ri';

export default function DataTable({ columns, data, sortKey, sortDirection, onSort, onRowClick, className = '' }) {
  return (
    <div className={classNames('table-container overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="table-header">
            {columns.map((col) => (
              <th
                key={col.key}
                className={classNames(
                  'px-4 py-3 text-left',
                  col.sortable && 'cursor-pointer select-none hover:text-content-primary',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  col.width && `w-[${col.width}]`
                )}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <div className={classNames('flex items-center gap-1', col.align === 'right' && 'justify-end', col.align === 'center' && 'justify-center')}>
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    sortDirection === 'asc' ? <RiArrowUpSLine className="w-4 h-4" /> : <RiArrowDownSLine className="w-4 h-4" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-content-tertiary">
                No data found
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row.id || idx}
                className={classNames('table-row', onRowClick && 'cursor-pointer')}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={classNames(
                      'px-4 py-3 text-sm',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center'
                    )}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
