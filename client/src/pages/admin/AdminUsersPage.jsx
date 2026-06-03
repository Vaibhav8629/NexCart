import { Card, CardContent } from '../../components/ui/card';

export default function AdminUsersPage() {
  return (
    <Card>
      <CardContent className="p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-sky-300">Users</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">User management coming soon</h1>
        <p className="mt-3 text-slate-400">This section is reserved for future customer and staff tools.</p>
      </CardContent>
    </Card>
  );
}