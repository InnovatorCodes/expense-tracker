"use client";

import { useEffect } from "react";

const ClearRefreshed = () => {
  useEffect(() => {
    const refreshed = localStorage.getItem("refreshed");
    if (!refreshed) {
      localStorage.setItem("refreshed", "true");
      window.location.reload();
    }
  }, []);

  return null;
};

export const ClearSessionStorage = () => {
  useEffect(() => {
    localStorage.removeItem("refreshed");
  }, []);

  return null;
};

export default ClearRefreshed;
