"use client";

import { useState, useEffect } from "react";
import Loader from "./Loader";

export default function LoaderWrapper({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 5000); // ⏳ simulasi 2 detik
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return children;
}
