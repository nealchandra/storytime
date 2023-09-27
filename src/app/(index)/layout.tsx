import React from 'react';

interface BuilderLayoutProps {
  children?: React.ReactNode;
}

export default async function BuilderLayout({ children }: BuilderLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4"></div>
      </header>
      <div className="container grid flex-1 gap-12">
        <main className="flex w-full flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
