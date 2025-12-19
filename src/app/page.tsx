import DashboardStats from '@/components/DashboardStats';
import UserTable from '@/components/UserTable';

export default function Home() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                    Download Report
                </button>
            </div>

            <DashboardStats />

            <UserTable />
        </div>
    );
}
