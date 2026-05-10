import { activeAgreementSeeds, type AgreementSeed } from "@/lib/agreements";
import { prisma } from "@/lib/prisma";

const systemAuthorId = "00000000-0000-0000-0000-000000000001";

function isDatabaseConfigured() {
  const databaseUrl = process.env.DATABASE_URL;
  return Boolean(databaseUrl && !databaseUrl.includes("YOUR-PASS") && !databaseUrl.includes("YOUR"));
}

function toSeedDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export type AgreementView = AgreementSeed;

export function getRequiredAgreementVersionIdsFrom(agreements: AgreementView[]) {
  return agreements
    .filter((agreement) => agreement.required)
    .map((agreement) => agreement.versionId);
}

export async function getActiveAgreements(): Promise<AgreementView[]> {
  if (!isDatabaseConfigured()) {
    return activeAgreementSeeds;
  }

  try {
    const templates = await prisma.agreementTemplate.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
      include: {
        versions: {
          where: { effectiveAt: { lte: new Date() } },
          orderBy: { effectiveAt: "desc" },
          take: 1
        }
      }
    });

    const agreements = templates.flatMap((template) => {
      const version = template.versions[0];

      if (!version) {
        return [];
      }

      return {
        templateId: template.id,
        slug: template.slug,
        title: template.title,
        required: template.required,
        displayOrder: template.displayOrder,
        versionId: version.id,
        version: version.version,
        effectiveAt: version.effectiveAt.toISOString().slice(0, 10),
        content: version.content
      };
    });

    return agreements.length > 0 ? agreements : activeAgreementSeeds;
  } catch {
    return activeAgreementSeeds;
  }
}

export async function ensureDefaultAgreements(): Promise<AgreementView[]> {
  if (!isDatabaseConfigured()) {
    return activeAgreementSeeds;
  }

  for (const agreement of activeAgreementSeeds) {
    await prisma.agreementTemplate.upsert({
      where: { slug: agreement.slug },
      update: {
        title: agreement.title,
        required: agreement.required,
        displayOrder: agreement.displayOrder,
        active: true
      },
      create: {
        id: agreement.templateId,
        slug: agreement.slug,
        title: agreement.title,
        required: agreement.required,
        displayOrder: agreement.displayOrder,
        active: true
      }
    });

    await prisma.agreementVersion.upsert({
      where: { id: agreement.versionId },
      update: {
        content: agreement.content,
        effectiveAt: toSeedDate(agreement.effectiveAt)
      },
      create: {
        id: agreement.versionId,
        templateId: agreement.templateId,
        version: agreement.version,
        content: agreement.content,
        effectiveAt: toSeedDate(agreement.effectiveAt),
        createdBy: systemAuthorId
      }
    });
  }

  return getActiveAgreements();
}
