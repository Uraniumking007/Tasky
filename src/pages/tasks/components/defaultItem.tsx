import { de } from "date-fns/locale";
import React, { forwardRef } from "react";

export interface SelectItemProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "value"> {
  label: React.ReactNode;
  value?: string;
}

const DefaultItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ label, value, ...others }: SelectItemProps, ref) => (
    <div
      ref={ref}
      {...others}
      className="rounded-md bg-base-100 px-4 py-1 text-base-content hover:bg-base-200"
    >
      {label ?? value}
    </div>
  )
);

DefaultItem.displayName = "@mantine/core/DefaultItem";
export default DefaultItem;
