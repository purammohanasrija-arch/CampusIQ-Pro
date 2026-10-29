const fs = require('fs');
const path = require('path');

const imgDir = path.join(process.cwd(), 'src', 'assets', 'images');
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

// 1. Book: The C Programming Language
const bookC = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="400" height="560">
  <defs>
    <linearGradient id="bgC" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="badgeC" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="400" height="560" rx="12" fill="url(#bgC)"/>
  <rect x="0" y="0" width="24" height="560" rx="4" fill="#0284c7" opacity="0.4"/>
  <rect x="16" y="16" width="368" height="528" rx="8" fill="none" stroke="#334155" stroke-width="2"/>
  <rect x="48" y="48" width="160" height="26" rx="13" fill="url(#badgeC)"/>
  <text x="128" y="65" fill="#ffffff" font-family="system-ui, sans-serif" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="1">PRENTICE HALL PTR</text>
  <circle cx="200" cy="230" r="90" fill="#0284c7" opacity="0.15"/>
  <circle cx="200" cy="230" r="75" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="8 4"/>
  <text x="200" y="275" fill="#f8fafc" font-family="Georgia, serif" font-size="130" font-weight="900" text-anchor="middle">C</text>
  <text x="200" y="360" fill="#ffffff" font-family="system-ui, sans-serif" font-size="22" font-weight="800" text-anchor="middle">THE C PROGRAMMING</text>
  <text x="200" y="390" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="22" font-weight="800" text-anchor="middle">LANGUAGE</text>
  <text x="200" y="425" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13" font-weight="600" text-anchor="middle">Second Edition · ANSI C Standard</text>
  <line x1="80" y1="450" x2="320" y2="450" stroke="#334155" stroke-width="1.5"/>
  <text x="200" y="480" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Brian W. Kernighan</text>
  <text x="200" y="502" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Dennis M. Ritchie</text>
</svg>`;

// 2. Book: Introduction to Algorithms (CLRS)
const bookCLRS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="400" height="560">
  <defs>
    <linearGradient id="bgCLRS" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#450a0a"/>
      <stop offset="60%" stop-color="#1c1917"/>
      <stop offset="100%" stop-color="#0c0a09"/>
    </linearGradient>
    <linearGradient id="accentCLRS" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
  </defs>
  <rect width="400" height="560" rx="12" fill="url(#bgCLRS)"/>
  <rect x="0" y="0" width="24" height="560" rx="4" fill="#b91c1c" opacity="0.5"/>
  <rect x="16" y="16" width="368" height="528" rx="8" fill="none" stroke="#7f1d1d" stroke-width="1.5"/>
  <rect x="48" y="48" width="130" height="26" rx="13" fill="url(#accentCLRS)"/>
  <text x="113" y="65" fill="#ffffff" font-family="system-ui, sans-serif" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="1">MIT PRESS</text>
  <g stroke="#f87171" stroke-width="2" fill="none" opacity="0.8">
    <circle cx="200" cy="160" r="14" fill="#ef4444"/>
    <circle cx="140" cy="220" r="12" fill="#b91c1c"/>
    <circle cx="260" cy="220" r="12" fill="#b91c1c"/>
    <circle cx="100" cy="280" r="10" fill="#7f1d1d"/>
    <circle cx="170" cy="280" r="10" fill="#7f1d1d"/>
    <circle cx="230" cy="280" r="10" fill="#7f1d1d"/>
    <circle cx="300" cy="280" r="10" fill="#7f1d1d"/>
    <line x1="200" y1="174" x2="140" y2="208"/>
    <line x1="200" y1="174" x2="260" y2="208"/>
    <line x1="140" y1="232" x2="100" y2="270"/>
    <line x1="140" y1="232" x2="170" y2="270"/>
    <line x1="260" y1="232" x2="230" y2="270"/>
    <line x1="260" y1="232" x2="300" y2="270"/>
  </g>
  <text x="200" y="350" fill="#ffffff" font-family="system-ui, sans-serif" font-size="23" font-weight="800" text-anchor="middle">INTRODUCTION TO</text>
  <text x="200" y="382" fill="#f87171" font-family="system-ui, sans-serif" font-size="27" font-weight="900" text-anchor="middle">ALGORITHMS</text>
  <text x="200" y="415" fill="#fda4af" font-family="system-ui, sans-serif" font-size="13" font-weight="600" text-anchor="middle">Third Edition · CLRS</text>
  <line x1="80" y1="440" x2="320" y2="440" stroke="#7f1d1d" stroke-width="1.5"/>
  <text x="200" y="470" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="13" font-weight="600" text-anchor="middle">Cormen · Leiserson</text>
  <text x="200" y="494" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="13" font-weight="600" text-anchor="middle">Rivest · Stein</text>
</svg>`;

// 3. Book: Clean Code
const bookCleanCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="400" height="560">
  <defs>
    <linearGradient id="bgCC" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="50%" stop-color="#022c22"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="badgeCC" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <rect width="400" height="560" rx="12" fill="url(#bgCC)"/>
  <rect x="0" y="0" width="24" height="560" rx="4" fill="#059669" opacity="0.4"/>
  <rect x="16" y="16" width="368" height="528" rx="8" fill="none" stroke="#065f46" stroke-width="2"/>
  <rect x="48" y="48" width="160" height="26" rx="13" fill="url(#badgeCC)"/>
  <text x="128" y="65" fill="#ffffff" font-family="system-ui, sans-serif" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="1">ROBERT C. MARTIN</text>
  <circle cx="200" cy="210" r="75" fill="#10b981" opacity="0.12"/>
  <path d="M160 180 L120 210 L160 240" stroke="#34d399" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M240 180 L280 210 L240 240" stroke="#34d399" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <line x1="215" y1="170" x2="185" y2="250" stroke="#10b981" stroke-width="5" stroke-linecap="round"/>
  <text x="200" y="330" fill="#ffffff" font-family="system-ui, sans-serif" font-size="32" font-weight="900" text-anchor="middle" letter-spacing="2">CLEAN CODE</text>
  <text x="200" y="365" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="13" font-weight="600" text-anchor="middle">A Handbook of Agile Software Craftsmanship</text>
  <rect x="110" y="385" width="180" height="24" rx="6" fill="#065f46" opacity="0.6"/>
  <text x="200" y="401" fill="#a7f3d0" font-family="system-ui, sans-serif" font-size="11" font-weight="700" text-anchor="middle">THE PRENTICE HALL SERIES</text>
  <line x1="80" y1="435" x2="320" y2="435" stroke="#065f46" stroke-width="1.5"/>
  <text x="200" y="475" fill="#ffffff" font-family="system-ui, sans-serif" font-size="16" font-weight="700" text-anchor="middle">Robert C. Martin</text>
  <text x="200" y="498" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12" font-weight="500" text-anchor="middle">Foreword by James O. Coplien</text>
</svg>`;

// 4. Book: Head First Design Patterns
const bookHeadFirst = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="400" height="560">
  <defs>
    <linearGradient id="bgHF" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c2d12"/>
      <stop offset="50%" stop-color="#431407"/>
      <stop offset="100%" stop-color="#1c1917"/>
    </linearGradient>
    <linearGradient id="badgeHF" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>
  <rect width="400" height="560" rx="12" fill="url(#bgHF)"/>
  <rect x="0" y="0" width="24" height="560" rx="4" fill="#ea580c" opacity="0.5"/>
  <rect x="16" y="16" width="368" height="528" rx="8" fill="none" stroke="#9a3412" stroke-width="2"/>
  <rect x="48" y="48" width="140" height="26" rx="13" fill="url(#badgeHF)"/>
  <text x="118" y="65" fill="#ffffff" font-family="system-ui, sans-serif" font-size="11" font-weight="800" text-anchor="middle" letter-spacing="1">O'REILLY MEDIA</text>
  <circle cx="200" cy="210" r="75" fill="#f59e0b" opacity="0.15"/>
  <path d="M160 190 Q200 150 240 190 Q260 230 200 260 Q140 230 160 190 Z" fill="none" stroke="#fbbf24" stroke-width="3"/>
  <circle cx="200" cy="205" r="18" fill="#f97316" opacity="0.4"/>
  <text x="200" y="212" fill="#fffbeb" font-family="system-ui, sans-serif" font-size="20" font-weight="900" text-anchor="middle">HF</text>
  <text x="200" y="325" fill="#fef08a" font-family="system-ui, sans-serif" font-size="20" font-weight="800" text-anchor="middle" letter-spacing="3">HEAD FIRST</text>
  <text x="200" y="365" fill="#ffffff" font-family="system-ui, sans-serif" font-size="26" font-weight="900" text-anchor="middle">DESIGN PATTERNS</text>
  <text x="200" y="400" fill="#fdba74" font-family="system-ui, sans-serif" font-size="12" font-weight="600" text-anchor="middle">Building Extensible &amp; Maintainable OO Software</text>
  <line x1="80" y1="430" x2="320" y2="430" stroke="#9a3412" stroke-width="1.5"/>
  <text x="200" y="465" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="700" text-anchor="middle">Eric Freeman &amp; Elisabeth Robson</text>
  <text x="200" y="490" fill="#fed7aa" font-family="system-ui, sans-serif" font-size="12" font-weight="500" text-anchor="middle">with Kathy Sierra &amp; Bert Bates</text>
</svg>`;

// Avatars for staff / personas
function makeAvatarSvg(name, role, color1, color2, initials) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="grad_${initials}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="36" fill="url(#grad_${initials})"/>
  <circle cx="100" cy="78" r="38" fill="#ffffff" opacity="0.92"/>
  <path d="M40 175 C40 130 70 120 100 120 C130 120 160 130 160 175 Z" fill="#ffffff" opacity="0.92"/>
  <rect x="125" y="125" width="56" height="28" rx="14" fill="#0f172a" stroke="#ffffff" stroke-width="2"/>
  <text x="153" y="144" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="800" text-anchor="middle">${initials}</text>
</svg>`;
}

const filesToWrite = {
  'book_c_programming.svg': bookC,
  'book_clrs_algorithms.svg': bookCLRS,
  'book_clean_code.svg': bookCleanCode,
  'book_head_first_design_patterns.svg': bookHeadFirst,
  'avatar_chief_reed.svg': makeAvatarSvg('Chief Jackson Reed', 'Security Staff', '#1e3a8a', '#172554', 'JR'),
  'avatar_dean_davies.svg': makeAvatarSvg('Prof. Arthur Davies', 'College Administrator', '#065f46', '#022c22', 'AD'),
  'avatar_marcus_bell.svg': makeAvatarSvg('Marcus Bell', 'Librarian', '#854d0e', '#451a03', 'MB'),
  'avatar_vikram_mehta.svg': makeAvatarSvg('Vikram Mehta', 'Lab Technician', '#4c1d95', '#2e1065', 'VM'),
  'avatar_chef_mario.svg': makeAvatarSvg('Chef Mario Rossi', 'Canteen Staff', '#9a3412', '#431407', 'MR'),
  'avatar_priya_nambiar.svg': makeAvatarSvg('Priya Nambiar', 'Event Organizer', '#831843', '#500724', 'PN'),
  'avatar_dr_thorne.svg': makeAvatarSvg('Dr. Robert Thorne', 'Examination Staff', '#334155', '#0f172a', 'RT'),
  'avatar_sophia_vance.svg': makeAvatarSvg('Dr. Sophia Vance', 'Project Judge', '#134e4a', '#042f2e', 'SV')
};

const targetDirs = [
  path.join(process.cwd(), 'src', 'assets', 'images'),
  path.join(process.cwd(), 'public', 'src', 'assets', 'images'),
  path.join(process.cwd(), 'public', 'assets', 'images'),
  path.join(process.cwd(), 'public', 'images')
];

for (const targetDir of targetDirs) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  for (const [filename, content] of Object.entries(filesToWrite)) {
    fs.writeFileSync(path.join(targetDir, filename), content, 'utf8');
  }
}

console.log('Successfully written all distinct book covers and avatars to all target directories!');

