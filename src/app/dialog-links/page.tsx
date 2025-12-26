import DialogHeader from "../../components/bot-dialog/DialogHeader";

export default function DialogLinksPage() {
    return (
        <div className="h-[calc(100vh-100px)] bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
            <DialogHeader />
            <div className="flex-1 w-full flex flex-col gap-5 p-5">
                <h1 className="text-2xl font-bold tracking-tight">Bot Dialoq Keçidləri</h1>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 flex items-center justify-center h-96">
                    <p className="text-gray-400">Bu səhifə hələki boşdur.</p>
                </div>
            </div>
        </div>
    );
}
