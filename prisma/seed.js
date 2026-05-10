const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const systemAuthorId = "00000000-0000-0000-0000-000000000001";

const agreements = [
  {
    templateId: "11111111-1111-4111-8111-111111111001",
    slug: "terms",
    title: "이용약관",
    required: true,
    displayOrder: 1,
    versionId: "11111111-1111-4111-8111-111111111101",
    version: "1.0",
    effectiveAt: "2026-05-10",
    content:
      "경희대학교 골프대회 홈페이지 이용 목적, 계정 이용, 서비스 제공 범위에 관한 기본 약관입니다. 최종 문구는 관리자 약관 관리에서 직접 작성합니다."
  },
  {
    templateId: "11111111-1111-4111-8111-111111111002",
    slug: "privacy",
    title: "개인정보 처리방침",
    required: true,
    displayOrder: 2,
    versionId: "11111111-1111-4111-8111-111111111102",
    version: "1.0",
    effectiveAt: "2026-05-10",
    content:
      "회원가입, 선수 등록, 대회 기록 관리에 필요한 개인정보 수집 및 이용 기준입니다. 주민등록번호는 수집하지 않고 생년월일을 사용합니다."
  },
  {
    templateId: "11111111-1111-4111-8111-111111111003",
    slug: "marketing",
    title: "마케팅 수신 동의",
    required: false,
    displayOrder: 3,
    versionId: "11111111-1111-4111-8111-111111111103",
    version: "1.0",
    effectiveAt: "2026-05-10",
    content:
      "대회 소식, 행사 안내 등 선택 알림 수신에 관한 동의입니다. 동의하지 않아도 회원가입은 가능합니다."
  }
];

async function main() {
  await prisma.sport.upsert({
    where: { code: "GOLF" },
    update: { name: "골프", active: true },
    create: { code: "GOLF", name: "골프", active: true }
  });

  for (const agreement of agreements) {
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
        effectiveAt: new Date(`${agreement.effectiveAt}T00:00:00.000Z`)
      },
      create: {
        id: agreement.versionId,
        templateId: agreement.templateId,
        version: agreement.version,
        content: agreement.content,
        effectiveAt: new Date(`${agreement.effectiveAt}T00:00:00.000Z`),
        createdBy: systemAuthorId
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
