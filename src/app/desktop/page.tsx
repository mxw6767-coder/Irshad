"use client";

import { useEffect } from "react";

export default function DesktopPage() {
  useEffect(() => {
    window.location.replace("/");
  }, []);

  return null;
}

