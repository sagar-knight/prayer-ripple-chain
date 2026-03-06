import { ReactNode } from "react";
import StoreFooter from "./StoreFooter";

interface StoreLayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

const StoreLayout = ({ children, hideFooter }: StoreLayoutProps) => {
  return (
    <>
      <main className="flex-1">{children}</main>
      {!hideFooter && <StoreFooter />}
    </>
  );
};

export default StoreLayout;
