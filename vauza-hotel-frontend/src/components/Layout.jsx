export default function Layout({ title, children }) {
    return (
        <div className="w-full max-w-[1440px]">
            {title && (
                <h1 className="text-3xl font-semibold mb-10 text-textMain">
                    {title}
                </h1>
            )}
            {children}
        </div>
    );
}
