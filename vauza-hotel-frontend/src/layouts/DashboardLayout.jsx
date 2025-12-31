export default function DashboardLayout({ title, children }) {
    return (
        <div className="w-full max-w-[1440px]">
            <h1 className="text-3xl font-black mb-10 text-textMain tracking-tighter drop-shadow-sm">
                {title}
            </h1>
            {children}
        </div>
    );
}
