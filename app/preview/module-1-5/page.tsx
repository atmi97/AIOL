"use client";

import { ModuleShell } from "@/components/mdx";
import { META_15, Content15 } from "@/components/mdx/modules";

export default function Module15Preview() {
  return (
    <ModuleShell
      {...META_15}
      prev={{ href: "/preview/module-1-4", label: "Module 1.4 · Privacy & Data" }}
    >
      <Content15 />
    </ModuleShell>
  );
}
