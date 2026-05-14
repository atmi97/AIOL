"use client";

import { ModuleShell } from "@/components/mdx";
import { META_12, Content12 } from "@/components/mdx/modules";

export default function Module12Preview() {
  return (
    <ModuleShell
      {...META_12}
      prev={{ href: "/preview/module-1-1", label: "Module 1.1 · What Is AI?" }}
      next={{ href: "/preview/module-1-3", label: "Module 1.3 · AI Risks" }}
    >
      <Content12 />
    </ModuleShell>
  );
}
