export type AgreementSeed = {
  slug: string;
  title: string;
  required: boolean;
  displayOrder: number;
  versionId: string;
  version: string;
  effectiveAt: string;
  content: string;
};

export const activeAgreementSeeds: AgreementSeed[] = [
  {
    slug: "terms",
    title: "이용약관",
    required: true,
    displayOrder: 1,
    versionId: "seed-terms-1-0",
    version: "1.0",
    effectiveAt: "2026-05-10",
    content:
      "경희대학교 골프대회 홈페이지 이용 목적, 계정 이용, 서비스 제공 범위에 관한 기본 약관입니다. 최종 문구는 관리자 약관 관리에서 직접 작성합니다."
  },
  {
    slug: "privacy",
    title: "개인정보 처리방침",
    required: true,
    displayOrder: 2,
    versionId: "seed-privacy-1-0",
    version: "1.0",
    effectiveAt: "2026-05-10",
    content:
      "회원가입, 선수 등록, 대회 기록 관리에 필요한 개인정보 수집 및 이용 기준입니다. 주민등록번호는 수집하지 않고 생년월일을 사용합니다."
  },
  {
    slug: "marketing",
    title: "마케팅 수신 동의",
    required: false,
    displayOrder: 3,
    versionId: "seed-marketing-1-0",
    version: "1.0",
    effectiveAt: "2026-05-10",
    content:
      "대회 소식, 행사 안내 등 선택 알림 수신에 관한 동의입니다. 동의하지 않아도 회원가입은 가능합니다."
  }
].sort((a, b) => a.displayOrder - b.displayOrder);

export function getRequiredAgreementVersionIds() {
  return activeAgreementSeeds
    .filter((agreement) => agreement.required)
    .map((agreement) => agreement.versionId);
}
