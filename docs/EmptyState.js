function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div className="card text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--primary-color)]/10 to-[var(--secondary-color)]/10 flex items-center justify-center">
        <div className={`icon-${icon} text-5xl text-[var(--primary-color)]`}></div>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary">
          <div className="icon-plus text-sm mr-2"></div>
          {actionLabel}
        </button>
      )}
    </div>
  );
}