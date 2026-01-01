import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "px-4 py-2 rounded-xl font-bold tracking-tight transition-all transform duration-200 active:scale-95 hover:scale-105 shadow-sm";

    const variants = {
        primary: "bg-primary text-white hover:bg-primaryHover shadow-neu-button",
        secondary: "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white shadow-card",
        danger: "bg-red-50 text-red-600 hover:bg-red-100",
        ghost: "bg-transparent text-textSub hover:bg-gray-100 hover:text-textMain",
        // Table Actions
        actionEdit: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 px-3 py-1.5 text-xs rounded-full",
        actionDelete: "bg-red-500/10 text-red-600 hover:bg-red-500/20 px-3 py-1.5 text-xs rounded-full",
        actionView: "bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 text-xs rounded-full"
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
