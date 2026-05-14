"use client";

import { ModuleShell } from "@/components/mdx";
import { META_13, Content13 } from "@/components/mdx/modules";

export default function Module13Preview() {
  return (
    <ModuleShell
      {...META_13}
      prev={{ href: "/preview/module-1-2", label: "Module 1.2 · AI at AMS" }}
      next={{ href: "/preview/module-1-4", label: "Module 1.4 · Privacy & Data" }}
    >
      <Content13 />
    </ModuleShell>
  );
}
