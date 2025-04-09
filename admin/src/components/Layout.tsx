import React, { ReactNode } from "react";
import Sidebar from "./Sidebar";
import {Toaster} from "sonner";

type LayoutProps = {
    children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <Toaster />
                {children}
        </div>
    );
};

export default Layout;
