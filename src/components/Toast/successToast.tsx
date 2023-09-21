import React from "react";
import type { Renderable, Toast } from "react-hot-toast";

const SuccessToast = ({
  t,
  message,
  icon,
}: {
  t: Toast;
  message: string;
  icon?: Renderable;
}) => {
  return (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-out"
      } pointer-events-auto flex w-full max-w-xs rounded-lg bg-success-500 shadow-lg ring-1 ring-success-500 ring-opacity-5`}
    >
      <div className="w-0 flex-1 p-4">
        <div className="flex items-center">
          {icon ?? <div className="flex-shrink-0 pt-0.5">{icon}</div>}
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-success-700">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessToast;
