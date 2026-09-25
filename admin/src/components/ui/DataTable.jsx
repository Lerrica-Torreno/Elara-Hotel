export default function DataTable({ caption, columns, rows, renderRow }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-forest-900/10 bg-mist">
            {columns.map((column) => (
              <th key={column} scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-forest-900/55">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-forest-900/10">
          {rows.map(renderRow)}
        </tbody>
      </table>
    </div>
  );
}
