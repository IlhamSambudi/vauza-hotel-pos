export default function Card({ children, className = "" }) {
    return (
        <div
            className={`
        bg-white border border-borderSoft
        rounded-2xl shadow-sm
        ${className}
      `}
        >
            {children}
        </div>
    );
}
