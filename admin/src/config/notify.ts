import React from "react";
import {toast} from "sonner";

type titleT = (() => React.ReactNode) | React.ReactNode;

export const notify = (type: 'success' | 'error' | 'warning' | 'info', message: titleT) => {
    toast[type](message, {
        duration: 3000,
        position: 'top-right',
    });
};

export const success = (msg: titleT) => notify('success', msg);
export const error = (msg: titleT) => notify('error', msg);
export const warning = (msg: titleT) => notify('warning', msg);
export const info = (msg: titleT) => notify('info', msg);