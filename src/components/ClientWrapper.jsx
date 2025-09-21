"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ClientWrapper({ children }) {
  const pathname = usePathname();
  const hideNavAndFooter = ["/auth/login", "/auth/register"];
  const shouldHide = hideNavAndFooter.includes(pathname);

  return (
    <>
      {!shouldHide && <Navbar />}
      <main>{children}</main>
      {!shouldHide && <Footer />}
    </>
  );
}
