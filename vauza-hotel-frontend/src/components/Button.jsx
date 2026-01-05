import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "px-6 py-2.5 rounded-full font-semibold text-sm tracking-wide transition-all transform duration-200 active:scale-95 hover:shadow-md shadow-sm flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-primary text-white hover:bg-primaryHover shadow-primary/30",
        secondary: "bg-white text-primary border border-gray-200 hover:border-primary hover:bg-gray-50",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
        ghost: "bg-transparent text-textSub hover:bg-gray-100 hover:text-textMain shadow-none",
        // Table Actions
        actionEdit: "bg-blue-50 text-blue-600 hover:bg-blue-100 p-2 rounded-full shadow-none",
        actionDelete: "bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-full shadow-none",
        actionView: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 p-2 rounded-full shadow-none"
    };

    return (
        <button
            onClick={onClick}
            className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
