"use client";
import React from "react";

interface ButtonProps {
    text: string;
    onClick: () => void;
    variant: "primary" | "secondary" | "warning" | "danger"; // Button types
    type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({ text, onClick, variant, type }) => {
    // Button styles based on variant
    const buttonStyles = {
        primary: "bg-green-500 text-white px-3 py-1 rounded text-sm",
        secondary: "bg-green-800 text-white px-3 py-1 rounded text-sm",
        warning: "bg-yellow-500 text-white px-3 py-1 rounded text-sm",
        danger: "bg-red-500 text-white px-3 py-1 rounded text-sm",
    };

    return (
        <button className={buttonStyles[variant]} onClick={onClick}>
            {text}
        </button>
    );
};

export default Button;
