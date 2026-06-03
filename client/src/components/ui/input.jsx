import { cn } from '../../lib/utils';

export function Input({ className, ...props }) {
  return <input className={cn('flex h-11 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50', className)} {...props} />;
}