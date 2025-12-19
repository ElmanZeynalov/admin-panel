import UsersStatusTable from '@/components/UsersStatusTable';

export default function UsersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Users</h2>
            </div>

            <UsersStatusTable />
        </div>
    );
}
