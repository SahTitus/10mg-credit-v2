import { DEFAULT_INSTITUTIONS } from '@/lib/constants/institutions';
import { STORAGE_KEYS } from '@/lib/constants/storage-keys';
import { Institution } from '@/types/institution';

export function sanitizeHex(color: string | undefined): string {
  return /^#[0-9a-fA-F]{6}$/.test(String(color)) ? String(color) : '#2583d9';
}

export function calculateLuma(hex: string): number {
  const clean = sanitizeHex(hex).slice(1);
  // Linearize sRGB channels before weighting them for perceived brightness
  const rgb = [0, 2, 4]
    .map((i) => parseInt(clean.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));

  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

export function mixColors(colorA: string, colorB: string, weight: number): string {
  const a = sanitizeHex(colorA).slice(1);
  const b = sanitizeHex(colorB).slice(1);
  let result = '#';

  for (let i = 0; i < 6; i += 2) {
    const ca = parseInt(a.slice(i, i + 2), 16);
    const cb = parseInt(b.slice(i, i + 2), 16);
    result += Math.round(ca * (1 - weight) + cb * weight)
      .toString(16)
      .padStart(2, '0');
  }

  return result;
}

export function applyInstitutionTheme(institution: Institution): void {
  if (typeof document === 'undefined') return;

  const color = sanitizeHex(institution.primary);
  const root = document.documentElement;

  root.style.setProperty('--brand', color);
  root.style.setProperty('--primary', color);
  root.style.setProperty('--ring', color);
  root.style.setProperty('--brand-deep', mixColors(color, '#000000', 0.16));
  root.style.setProperty('--brand-pale', mixColors(color, '#ffffff', 0.91));

  const mode = ['light', 'brand', 'custom'].includes(institution.sidebarMode)
    ? institution.sidebarMode
    : 'light';

  const bg =
    mode === 'brand'
      ? color
      : mode === 'custom'
        ? sanitizeHex(institution.sidebarColor || '#1b344f')
        : '#ffffff';

  // Use perceived brightness rather than the sidebar mode to choose readable text
  const dark = mode !== 'light' && calculateLuma(bg) < 0.52;

  root.style.setProperty('--sidebar-bg', bg);
  root.style.setProperty('--sidebar-fg', dark ? '#f6f9fc' : '#0f1b2a');
  root.style.setProperty('--sidebar-muted', dark ? '#c8daeb' : '#4b5d73');
  root.style.setProperty('--sidebar-line', dark ? 'rgba(255,255,255,.14)' : '#e8edf3');
  root.style.setProperty('--sidebar-hover', dark ? 'rgba(255,255,255,.09)' : '#f2f6fa');
  root.style.setProperty(
    '--sidebar-active',
    dark ? 'rgba(255,255,255,.17)' : mixColors(color, '#ffffff', 0.91),
  );
  root.style.setProperty('--sidebar-active-fg', dark ? '#ffffff' : color);
  root.style.setProperty('--sidebar-tenant-bg', dark ? 'rgba(255,255,255,.09)' : '#f7f9fc');
  root.style.setProperty('--sidebar-user-bg', dark ? 'rgba(255,255,255,.10)' : '#f6f8fb');
  root.style.setProperty('--sidebar-brandmark-bg', dark ? 'rgba(255,255,255,.17)' : color);
  root.style.setProperty('--sidebar-brandmark-fg', '#ffffff');
  root.style.setProperty('--sidebar-avatar-fg', dark ? '#ffffff' : '#6451a2');

  document.title = `${institution.short} | 10mg Credit V2`;
}

export function buildThemeInitScript(): string {
  const defaultsJson = JSON.stringify(
    DEFAULT_INSTITUTIONS.map((inst) => ({
      id: inst.id,
      short: inst.short,
      primary: inst.primary,
      sidebarMode: inst.sidebarMode,
      sidebarColor: inst.sidebarColor,
    })),
  );

  // Mirror the runtime tokens here so saved branding is present on the first paint
  return `(function(){try{var activeKey=${JSON.stringify(STORAGE_KEYS.CURRENT_INSTITUTION)};var dbKey=${JSON.stringify(STORAGE_KEYS.DB_STORE)};var list=${defaultsJson};var rawDb=localStorage.getItem(dbKey);if(rawDb){var parsed=JSON.parse(rawDb);if(parsed&&Array.isArray(parsed.institutions)&&parsed.institutions.length>0){list=parsed.institutions;}}var activeId=localStorage.getItem(activeKey);var inst=list.find(function(b){return b.id===activeId;})||list[0];if(!inst)return;var hex=function(c){return /^#[0-9a-fA-F]{6}$/.test(String(c))?String(c):'#1776ce';};var mix=function(a,b,w){var ca=hex(a).slice(1),cb=hex(b).slice(1),out='#';for(var i=0;i<6;i+=2){var va=parseInt(ca.slice(i,i+2),16),vb=parseInt(cb.slice(i,i+2),16);out+=Math.round(va*(1-w)+vb*w).toString(16).padStart(2,'0');}return out;};var luma=function(c){var s=hex(c).slice(1);var rgb=[0,2,4].map(function(i){var v=parseInt(s.slice(i,i+2),16)/255;return v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;};var color=hex(inst.primary);var root=document.documentElement;root.style.setProperty('--brand',color);root.style.setProperty('--primary',color);root.style.setProperty('--ring',color);root.style.setProperty('--brand-deep',mix(color,'#000000',0.16));root.style.setProperty('--brand-pale',mix(color,'#ffffff',0.91));var mode=['light','brand','custom'].indexOf(inst.sidebarMode)!==-1?inst.sidebarMode:'light';var bg=mode==='brand'?color:mode==='custom'?hex(inst.sidebarColor||'#1b344f'):'#ffffff';var dark=mode!=='light'&&luma(bg)<0.52;root.style.setProperty('--sidebar-bg',bg);root.style.setProperty('--sidebar-fg',dark?'#f6f9fc':'#0f1b2a');root.style.setProperty('--sidebar-muted',dark?'#c8daeb':'#4b5d73');root.style.setProperty('--sidebar-line',dark?'rgba(255,255,255,.14)':'#e8edf3');root.style.setProperty('--sidebar-hover',dark?'rgba(255,255,255,.09)':'#f2f6fa');root.style.setProperty('--sidebar-active',dark?'rgba(255,255,255,.17)':mix(color,'#ffffff',0.91));root.style.setProperty('--sidebar-active-fg',dark?'#ffffff':color);root.style.setProperty('--sidebar-tenant-bg',dark?'rgba(255,255,255,.09)':'#f7f9fc');root.style.setProperty('--sidebar-user-bg',dark?'rgba(255,255,255,.10)':'#f6f8fb');root.style.setProperty('--sidebar-brandmark-bg',dark?'rgba(255,255,255,.17)':color);root.style.setProperty('--sidebar-brandmark-fg','#ffffff');root.style.setProperty('--sidebar-avatar-fg',dark?'#ffffff':'#6451a2');}catch(e){}})();`;
}
