"use client";

import { ModuleShell } from "@/components/mdx";
import { META_11, Content11 } from "@/components/mdx/modules";

export default function Module11Preview() {
  return (
    <ModuleShell
      {...META_11}
      next={{ href: "/preview/module-1-2", label: "Module 1.2 · AI at AMS" }}
    >
      <Content11 />
    </ModuleShell>
  );
}
