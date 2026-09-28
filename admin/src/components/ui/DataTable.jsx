export default function DataTable({
  caption,
  columns,
  rows,
  renderRow,
  emptyState
}) {
  if (!rows.length) {
    return emptyState;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <caption className="sr-only">
          {caption}
        </caption>

        <thead>
          <tr className="border-b border-forest-900/10 bg-mist/70">
            {columns.map(
              (
                column
              ) => (
                <th
                  key={
                    column
                  }
                  className="whitespace-nowrap px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-forest-900/45"
                >
                  {
                    column
                  }
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-forest-900/10">
          {rows.map(
            renderRow
          )}
        </tbody>
      </table>
    </div>
  );
}
