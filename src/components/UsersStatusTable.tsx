import { CheckCircle, XCircle } from 'lucide-react';

const users = [
    { id: 1, name: 'Jane Cooper', status: 'done' },
    { id: 2, name: 'Cody Fisher', status: 'rejected' },
    { id: 3, name: 'Esther Howard', status: 'done' },
    { id: 4, name: 'Jenny Wilson', status: 'done' },
    { id: 5, name: 'Kristin Watson', status: 'rejected' },
    { id: 6, name: 'Cameron Williamson', status: 'done' },
    { id: 7, name: 'Jerome Bell', status: 'rejected' },
    { id: 8, name: 'Courtney Henry', status: 'done' },
    { id: 9, name: 'Theresa Webb', status: 'done' },
    { id: 10, name: 'Arlene McCoy', status: 'rejected' },
];

const UsersStatusTable = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Users Management</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                        <tr>
                            <th className="px-6 py-3 font-medium">Name Surname</th>
                            <th className="px-6 py-3 font-medium text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{user.name}</div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-3">
                                        <div className={`flex flex-col items-center ${user.status === 'done' ? 'text-green-600' : 'text-gray-300'}`}>
                                            <CheckCircle className="w-6 h-6" />
                                            <span className="text-[10px] font-medium mt-0.5">Done</span>
                                        </div>
                                        <div className={`flex flex-col items-center ${user.status === 'rejected' ? 'text-red-600' : 'text-gray-300'}`}>
                                            <XCircle className="w-6 h-6" />
                                            <span className="text-[10px] font-medium mt-0.5">Rejected</span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersStatusTable;
