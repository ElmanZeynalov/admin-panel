import DialogUserList from '@/components/DialogUserList';

export default function DialogPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Dialogs</h2>
            </div>

            <DialogUserList />
        </div>
    );
}
