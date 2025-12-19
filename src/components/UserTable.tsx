import { MoreVertical, Edit2, Trash2 } from 'lucide-react';

const users = [
    { id: 1, name: 'Alice Freeman', email: 'alice@example.com', role: 'Admin', status: 'Active', lastActive: '2 mins ago' },
    { id: 2, name: 'Bob Smith', email: 'bob@gmail.com', role: 'User', status: 'Inactive', lastActive: '2 days ago' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@domain.com', role: 'User', status: 'Active', lastActive: '5 hours ago' },
    { id: 4, name: 'Diana Prince', email: 'diana@wonder.com', role: 'Editor', status: 'Active', lastActive: '1 day ago' },
    { id: 5, name: 'Evan Wright', email: 'evan@work.com', role: 'User', status: 'Suspended', lastActive: '1 week ago' },
];

const UserTable = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                        <tr>
                            <th className="px-6 py-3 font-medium">User</th>
                            <th className="px-6 py-3 font-medium">Role</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium">Last Active</th>
                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                                            {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{user.name}</div>
                                            <div className="text-xs text-gray-400">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-green-100 text-green-800' :
                                            user.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-400">
                                    {user.lastActive}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1 text-gray-400 hover:text-blue-600 rounded">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-1 text-gray-400 hover:text-red-600 rounded">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
                <span>Showing 5 of 128 users</span>
                <div className="flex gap-1">
                    <button className="px-2 py-1 border border-gray-200 rounded bg-white disabled:opacity-50">Prev</button>
                    <button className="px-2 py-1 border border-gray-200 rounded bg-white">Next</button>
                </div>
            </div>
        </div>
    );
};

export default UserTable;
