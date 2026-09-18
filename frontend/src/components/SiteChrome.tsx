import React from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-intro container">
      <div className="eyebrow">{eyebrow}</div>
      <h1 className="serif">{title}</h1>
      <p>{description}</p>
    </div>
  );
}
