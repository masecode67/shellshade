import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <main className="flex-1 overflow-auto bg-surface-solid">
      <div className="h-full">{children}</div>
    </main>
  );
};

export default Layout;
