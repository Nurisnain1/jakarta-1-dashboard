"use client";

import { useEffect } from "react";
declare global {
  interface Window {
    htmlToImage?: typeof import("html-to-image");
    XLSX?: typeof import("xlsx");
    jakarta1LoadReportDependency?: (kind: "image" | "xlsx") => Promise<void>;
  }
}

export default function Jakarta1ReportDeps() {
  useEffect(() => {
    let imageRequest: Promise<void> | undefined;
    let xlsxRequest: Promise<void> | undefined;
    const load = (kind: "image" | "xlsx") => {
      if (kind === "image") {
        if (window.htmlToImage) return Promise.resolve();
        return imageRequest ??= import("html-to-image").then(module => { window.htmlToImage = module; })
          .finally(() => { imageRequest = undefined; });
      }
      if (window.XLSX) return Promise.resolve();
      return xlsxRequest ??= import("xlsx").then(module => { window.XLSX = module; })
        .finally(() => { xlsxRequest = undefined; });
    };
    window.jakarta1LoadReportDependency = load;
    window.dispatchEvent(new Event("jakarta1-report-deps-ready"));
    return () => { if (window.jakarta1LoadReportDependency === load) delete window.jakarta1LoadReportDependency; };
  }, []);
  return null;
}
