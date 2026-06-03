import { Card, CardContent } from '../../components/ui/card';

export default function AdminOrdersPage() {
  return (
    <Card>
      <CardContent className="p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-sky-300">Orders</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Orders coming soon</h1>
        <p className="mt-3 text-slate-400">This section is reserved for future order management flows.</p>
      </CardContent>
    </Card>
  );
}