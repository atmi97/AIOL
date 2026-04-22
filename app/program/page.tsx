import { MDXRemote } from "next-mdx-remote/rsc";
import { readProgramOverview } from "@/lib/content";
import { SiteHeader } from "@/components/site-header";

export default async function ProgramPage() {
  const mdx = await readProgramOverview();
  // Strip YAML frontmatter for render.
  const body = mdx.replace(/^---[\s\S]*?---\s*/, "");
  return (
    <>
      <SiteHeader />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <article className="prose-aiol">
          {body ? <MDXRemote source={body} /> : <p>Program overview coming soon.</p>}
        </article>
      </main>
    </>
  );
}
