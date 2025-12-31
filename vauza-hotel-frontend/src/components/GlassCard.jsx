export default function GlassCard({ children, className = "" }) {
    return (
        <div
            className={`
        bg-glass backdrop-blur-glass
        border border-glassBorder
        rounded-2xl shadow-xl
        ${className}
      `}
        >
            {children}
        </div>
    );
}
