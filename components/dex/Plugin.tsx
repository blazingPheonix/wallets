"use client";

import React, { useEffect } from "react";

export default function PluginComponent() {
  useEffect(() => {
   const check = setInterval(() => {
    if ((window as any).Jupiter) {
      (window as any).Jupiter.init({
        displayMode: "widget",
        integratedTargetId: "jupiter-plugin",
      });
      clearInterval(check);
    }
  }, 100);
  }, []);

  return (
    <div>
      <h1>Jupiter Plugin Demo</h1>
      <div
        id="jupiter-plugin"
      />
    </div>
  );
}