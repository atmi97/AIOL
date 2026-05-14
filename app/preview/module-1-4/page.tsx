"use client";

import { ModuleShell } from "@/components/mdx";
import { META_14, Content14 } from "@/components/mdx/modules";

export default function Module14Preview() {
  return (
    <ModuleShell
      {...META_14}
      prev={{ href: "/preview/module-1-3", label: "Module 1.3 · AI Risks" }}
      next={{ href: "/preview/module-1-5", label: "Module 1.5 · Reporting" }}
    >
      <Content14 />
    </ModuleShell>
  );
}
