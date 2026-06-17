export function SettingsPanel() {
  return (
    <div className="flex flex-col h-full rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and integrations.</p>
      </div>
      <div className="flex-1 p-5 flex items-center justify-center text-muted-foreground">
        Settings view coming soon...
      </div>
    </div>
  );
}
