import React from "react";
import { toast, type Renderable, type Toast } from "react-hot-toast";

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
        t.visible ? "animate-enter" : "animate-leave"
      } pointer-events-auto flex w-full max-w-xs rounded-lg bg-success shadow-lg ring-1 ring-success ring-opacity-5`}
    >
      <div className="w-0 flex-1 p-4">
        <div className="flex items-center">
          {icon ?? <div className="flex-shrink-0 pt-0.5">{icon}</div>}
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-success-content">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessToast;
