import { cn } from '../../lib/utils';

export function Table({ className, ...props }) {
  return <div className={cn('w-full overflow-x-auto', className)}><table className="w-full caption-bottom text-sm text-slate-200" {...props} /></div>;
}

export function TableHeader(props) {
  return <thead className="border-b border-white/10 text-left text-xs uppercase tracking-[0.18em] text-slate-400" {...props} />;
}

export function TableBody(props) {
  return <tbody className="divide-y divide-white/5" {...props} />;
}

export function TableRow({ className, ...props }) {
  return <tr className={cn('hover:bg-white/3', className)} {...props} />;
}

export function TableHead({ className, ...props }) {
  return <th className={cn('px-4 py-3 font-medium', className)} {...props} />;
}

export function TableCell({ className, ...props }) {
  return <td className={cn('px-4 py-4 align-middle', className)} {...props} />;
}