import { ReactNode } from "react";
import StoreHeader from "./StoreHeader";
import StoreFooter from "./StoreFooter";

interface StoreLayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

const StoreLayout = ({ children, hideFooter }: StoreLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />
      <main className="flex-1">{children}</main>
      {!hideFooter && <StoreFooter />}
    </div>
  );
};

export default StoreLayout;
