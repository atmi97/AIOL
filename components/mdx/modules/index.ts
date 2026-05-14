import { META_11, Content11 } from "./module-1-1";
import { META_12, Content12 } from "./module-1-2";
import { META_13, Content13 } from "./module-1-3";
import { META_14, Content14 } from "./module-1-4";
import { META_15, Content15 } from "./module-1-5";

export type ModuleMeta = {
  moduleNumber: string;
  title: string;
  minutes: number;
  sectionsCount: number;
  interactiveCount: number;
  objectives: string[];
  sections: { id: string; n: string; label: string }[];
};

export type ModuleEntry = {
  meta: ModuleMeta;
  Content: () => React.JSX.Element;
};

export const MODULE_REGISTRY: Record<string, ModuleEntry> = {
  "module-1.1": { meta: META_11, Content: Content11 },
  "module-1.2": { meta: META_12, Content: Content12 },
  "module-1.3": { meta: META_13, Content: Content13 },
  "module-1.4": { meta: META_14, Content: Content14 },
  "module-1.5": { meta: META_15, Content: Content15 },
};

export { META_11, META_12, META_13, META_14, META_15 };
export { Content11, Content12, Content13, Content14, Content15 };
