import { cn } from '../../lib/utils';

export function Checkbox({ className, ...props }) {
  return <input type="checkbox" className={cn('h-4 w-4 rounded border-slate-600 bg-slate-950 text-sky-400 focus:ring-sky-400/30', className)} {...props} />;
}