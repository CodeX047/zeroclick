export function HistoryPanel() {
  return (
    <div className="flex flex-col h-full rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <h2 className="text-lg font-semibold text-foreground">Command History</h2>
        <p className="text-sm text-muted-foreground mt-1">Review your past ZeroClick actions.</p>
      </div>
      <div className="flex-1 p-5 flex items-center justify-center text-muted-foreground">
        History view coming soon...
      </div>
    </div>
  );
}
