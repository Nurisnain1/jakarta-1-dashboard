"use client";

import { useEffect } from "react";
import * as htmlToImage from "html-to-image";
import * as XLSX from "xlsx";

export default function Jakarta1ReportDeps() {
  useEffect(() => {
    (window as any).htmlToImage = htmlToImage;
    (window as any).XLSX = XLSX;
    window.dispatchEvent(new Event("jakarta1-report-deps-ready"));
  }, []);
  return null;
}
