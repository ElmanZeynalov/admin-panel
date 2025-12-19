import { Users, Activity, CheckCircle, XCircle } from 'lucide-react';

const stats = [
    {
        name: 'Total Users',
        value: '24,580',
        change: '+12%',
        icon: Users,
        color: 'bg-blue-500',
    },
    {
        name: 'Online Users',
        value: '30',
        change: '+5%',
        icon: Activity,
        color: 'bg-green-500',
    },
    {
        name: 'Resolved Issues',
        value: '1,240',
        change: '+18%',
        icon: CheckCircle,
        color: 'bg-indigo-500',
    },
    {
        name: 'Unresolved Issues',
        value: '12',
        change: '-2%',
        icon: XCircle,
        color: 'bg-red-500',
    },
];

const DashboardStats = () => {
    return (
        <div className="grid grid-cols-1 gap-6 mb-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div key={stat.name} className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                                <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                                <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span
                                className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                    }`}
                            >
                                {stat.change}
                            </span>
                            <span className="ml-2 text-sm text-gray-500">from last month</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DashboardStats;
