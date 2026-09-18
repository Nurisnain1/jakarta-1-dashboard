"use client";

import { useEffect } from "react";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

export default function Jakarta1ReportDeps() {
  useEffect(() => {
    (window as any).html2canvas = html2canvas;
    (window as any).XLSX = XLSX;
    window.dispatchEvent(new Event("jakarta1-report-deps-ready"));
  }, []);
  return null;
}
