import { readdir } from "node:fs/promises";
import path from "node:path";
import { importTierFromRepo } from "../lib/content-sync";
import { prisma } from "../lib/prisma";

async function main() {
  const contentDir = path.join(process.cwd(), "content");
  const entries = await readdir(contentDir, { withFileTypes: true });
  const tiers = entries
    .filter((e) => e.isDirectory() && e.name.startsWith("tier"))
    .map((e) => e.name)
    .sort();

  if (tiers.length === 0) {
    console.error("No tier directories found under content/");
    process.exit(1);
  }

  for (const t of tiers) {
    process.stdout.write(`Importing ${t}… `);
    await importTierFromRepo(t);
    console.log("ok");
  }

  const adminEmail = process.env.INITIAL_ADMIN_EMAIL?.toLowerCase().trim();
  if (adminEmail) {
    const user = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (user && user.role !== "ADMIN") {
      await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
      console.log(`Promoted ${adminEmail} to ADMIN`);
    } else if (!user) {
      console.log(`INITIAL_ADMIN_EMAIL=${adminEmail} — will be promoted on first sign-in.`);
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
