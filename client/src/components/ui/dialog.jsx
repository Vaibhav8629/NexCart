export function Dialog({ open, children }) {
  if (!open) {
    return null;
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">{children}</div>;
}

export function DialogContent({ className = '', ...props }) {
  return <div className={`w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-glow ${className}`} {...props} />;
}

export function DialogHeader(props) {
  return <div className="mb-5 space-y-2" {...props} />;
}

export function DialogTitle(props) {
  return <h3 className="text-xl font-semibold text-white" {...props} />;
}

export function DialogDescription(props) {
  return <p className="text-sm text-slate-400" {...props} />;
}

export function DialogFooter(props) {
  return <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end" {...props} />;
}