#!/bin/bash
# 통합 반응형 HTML 생성 스크립트
DIR="$(cd "$(dirname "$0")" && pwd)/2026-05-10_KHU-스포츠-골프대회-스티치"
OUT="$(cd "$(dirname "$0")/.." && pwd)/index.html"

# 각 HTML에서 <body> 내부 콘텐츠만 추출하는 함수
extract_body() {
  sed -n '/<body/,/<\/body>/p' "$1" | sed '1s/.*<body[^>]*>//' | sed '$s/<\/body>.*//'
}

# 모바일 콘텐츠 추출
M_HOME=$(extract_body "$DIR/mobile/01_홈.html")
M_LEADER=$(extract_body "$DIR/mobile/02_리더보드.html")
M_NOTICE=$(extract_body "$DIR/mobile/03_공지사항.html")

# 데스크톱 콘텐츠 추출
D_HOME=$(extract_body "$DIR/desktop/01_홈_PC.html")
D_LEADER=$(extract_body "$DIR/desktop/02_리더보드_PC.html")
D_NOTICE=$(extract_body "$DIR/desktop/03_공지사항_PC.html")

cat > "$OUT" << 'HTMLHEAD'
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>경희대학교 총장배 골프대회 - KHU Sports Golf</title>
<meta name="description" content="경희대학교 총장배 전국 골프대회 공식 홈페이지. 공지사항, 실시간 리더보드, 대회 결과를 확인하세요."/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lexend:wght@400;600;700;800&family=Hanken+Grotesk:wght@400;700;800&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<script>
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-container-highest":"#e1e3e4","surface-container-high":"#e7e8e9",
        "on-tertiary":"#ffffff","primary-fixed-dim":"#aacec3","surface-variant":"#e1e3e4",
        "secondary-fixed-dim":"#e9c349","surface-bright":"#f8f9fa",
        "on-secondary-fixed-variant":"#574500","outline":"#717976",
        "surface-container":"#edeeef","on-primary-fixed":"#00201a",
        "on-secondary-fixed":"#241a00","surface-container-low":"#f3f4f5",
        "outline-variant":"#c1c8c4","error":"#ba1a1a","surface-dim":"#d9dadb",
        "surface":"#f8f9fa","on-secondary-container":"#745c00",
        "tertiary-container":"#483200","primary-fixed":"#c5eadf",
        "surface-tint":"#43655c","tertiary-fixed-dim":"#e9c176",
        "secondary-container":"#fed65b","on-primary-fixed-variant":"#2b4d44",
        "on-primary":"#ffffff","secondary-fixed":"#ffe088",
        "inverse-on-surface":"#f0f1f2","on-surface":"#191c1d",
        "secondary":"#735c00","on-surface-variant":"#414846",
        "primary-container":"#1a3c34","on-tertiary-fixed":"#261900",
        "on-tertiary-container":"#be9953","error-container":"#ffdad6",
        "on-error-container":"#93000a","tertiary-fixed":"#ffdea5",
        "tertiary":"#2d1e00","on-primary-container":"#83a69c",
        "surface-container-lowest":"#ffffff","inverse-surface":"#2e3132",
        "on-background":"#191c1d","on-secondary":"#ffffff",
        "inverse-primary":"#aacec3","background":"#f8f9fa",
        "on-tertiary-fixed-variant":"#5d4201","on-error":"#ffffff",
        "primary":"#01261f"
      },
      borderRadius:{"DEFAULT":"0.25rem","lg":"0.5rem","xl":"0.75rem","full":"9999px"},
      spacing:{"container-max":"1280px","xl":"80px","md":"24px","gutter":"24px","base":"8px","xs":"4px","margin-mobile":"16px","sm":"12px","lg":"48px"},
      fontFamily:{
        "body-md":["Pretendard","Inter","sans-serif"],
        "stat-number":["Lexend","Pretendard","sans-serif"],
        "display-lg":["Pretendard","Hanken Grotesk","sans-serif"],
        "headline-lg":["Pretendard","Hanken Grotesk","sans-serif"],
        "label-bold":["Pretendard","Lexend","sans-serif"],
        "headline-md":["Pretendard","Hanken Grotesk","sans-serif"],
        "display-lg-mobile":["Pretendard","Hanken Grotesk","sans-serif"],
        "body-lg":["Pretendard","Inter","sans-serif"]
      },
      fontSize:{
        "body-md":["16px",{"lineHeight":"24px","fontWeight":"400"}],
        "stat-number":["24px",{"lineHeight":"24px","fontWeight":"700"}],
        "display-lg":["48px",{"lineHeight":"56px","letterSpacing":"-0.02em","fontWeight":"800"}],
        "headline-lg":["32px",{"lineHeight":"40px","fontWeight":"700"}],
        "label-bold":["14px",{"lineHeight":"20px","letterSpacing":"0.05em","fontWeight":"600"}],
        "headline-md":["24px",{"lineHeight":"32px","fontWeight":"700"}],
        "display-lg-mobile":["32px",{"lineHeight":"40px","letterSpacing":"-0.01em","fontWeight":"800"}],
        "body-lg":["18px",{"lineHeight":"28px","fontWeight":"400"}]
      }
    }
  }
}
</script>
<style>
.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}
.material-symbols-outlined.fill,.material-symbols-outlined[data-weight="fill"]{font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24}
body{background:#f8f9fa;color:#191c1d;font-family:'Pretendard',sans-serif;min-height:100dvh}
.shadow-premium{box-shadow:0 4px 12px rgba(26,60,52,0.08)}
.zebra-row:nth-child(even){background-color:#f1f3f2}
.page{display:none}.page.active{display:block}
.mobile-view{display:block}.desktop-view{display:none}
@media(min-width:768px){.mobile-view{display:none}.desktop-view{display:block}}
.hide-scrollbar::-webkit-scrollbar{display:none}
.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
::-webkit-scrollbar{width:8px}::-webkit-scrollbar-track{background:#f1f3f2}
::-webkit-scrollbar-thumb{background:#c1c8c4;border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:#717976}
</style>
</head>
<body class="font-body-md text-body-md antialiased">
HTMLHEAD

# 3개 페이지를 모바일/데스크톱 분기로 작성
cat >> "$OUT" << 'PAGESCRIPT'
<!-- ===== PAGE: HOME ===== -->
<div class="page active" id="page-home">
<div class="mobile-view">
PAGESCRIPT
echo "$M_HOME" >> "$OUT"
cat >> "$OUT" << 'SEP1'
</div>
<div class="desktop-view">
SEP1
echo "$D_HOME" >> "$OUT"
cat >> "$OUT" << 'SEP2'
</div>
</div>
<!-- ===== PAGE: LEADERBOARD ===== -->
<div class="page" id="page-leaderboard">
<div class="mobile-view">
SEP2
echo "$M_LEADER" >> "$OUT"
cat >> "$OUT" << 'SEP3'
</div>
<div class="desktop-view">
SEP3
echo "$D_LEADER" >> "$OUT"
cat >> "$OUT" << 'SEP4'
</div>
</div>
<!-- ===== PAGE: NOTICES ===== -->
<div class="page" id="page-notices">
<div class="mobile-view">
SEP4
echo "$M_NOTICE" >> "$OUT"
cat >> "$OUT" << 'SEP5'
</div>
<div class="desktop-view">
SEP5
echo "$D_NOTICE" >> "$OUT"

cat >> "$OUT" << 'HTMLTAIL'
</div>
</div>

<!-- Navigation JS -->
<script>
function navigateTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + pageId).classList.add('active');
  window.scrollTo(0, 0);

  // Update all nav links
  document.querySelectorAll('[data-nav]').forEach(link => {
    const isActive = link.dataset.nav === pageId;
    // Mobile bottom nav
    if (link.closest('.bottom-nav')) {
      if (isActive) {
        link.className = 'flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1 active:scale-90 transition-all duration-200';
      } else {
        link.className = 'flex flex-col items-center justify-center text-on-surface-variant hover:text-primary active:scale-90 transition-all duration-200 w-16';
      }
    }
  });
}

// Attach click handlers to all navigation links
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('a[href="#"], button').forEach(el => {
    const text = el.textContent.trim();
    if (text === '홈' || text.includes('홈')) {
      el.addEventListener('click', (e) => { e.preventDefault(); navigateTo('home'); });
      el.dataset.nav = 'home';
    } else if (text.includes('리더보드') || text.includes('라이브 스코어') || text.includes('결과 보기')) {
      el.addEventListener('click', (e) => { e.preventDefault(); navigateTo('leaderboard'); });
      el.dataset.nav = 'leaderboard';
    } else if (text.includes('공지') || text.includes('최신 공지')) {
      el.addEventListener('click', (e) => { e.preventDefault(); navigateTo('notices'); });
      el.dataset.nav = 'notices';
    }
  });
});
</script>
</body></html>
HTMLTAIL

echo "✅ 통합 HTML 생성 완료: $OUT"
echo "📏 파일 크기: $(du -h "$OUT" | cut -f1)"
