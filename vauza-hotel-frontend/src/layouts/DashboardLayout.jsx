export default function DashboardLayout({ title, children }) {
    return (
        <div className="w-full max-w-[1440px] mx-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-textMain tracking-tight">
                    {title}
                </h1>
            </header>
            {children}
        </div>
    );
}
