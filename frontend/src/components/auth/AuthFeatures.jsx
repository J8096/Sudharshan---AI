import { Zap, BarChart2, Layers, ShieldCheck, ChevronRight } from 'lucide-react';

const G     = '#C97700';
const GL    = '#E8920A';
const GD    = '#3D1F00';
const GM    = '#7A4F00';
const CREAM = '#FFFDF5';
const LINE  = 'rgba(201,119,0,.13)';
const LINEB = 'rgba(201,119,0,.22)';
const GSoft = 'rgba(201,119,0,.08)';
const C     = { green: '#059669' };

export const FEATURES = [
  { Icon: Zap,         title: 'Ultra-fast Streaming AI',   desc: 'Groq · 280+ tokens/sec · 5 models live'          },
  { Icon: BarChart2,   title: 'Sacred Analytics',           desc: 'Real-time metrics, usage patterns & insights'    },
  { Icon: Layers,      title: 'Project Management',         desc: 'Kanban boards with divine order & precision'     },
  { Icon: ShieldCheck, title: 'Enterprise Security',        desc: 'JWT auth · Rate limiting · End-to-end encrypted' },
];

export const TRUST = [
  { label: 'SOC 2 Ready' },
  { label: 'Encrypted'   },
  { label: '99.9% Uptime' },
  { label: 'Enterprise'  },
];

// Re-exported for use in AuthPage
export function AuthFeatureList({ slide }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {FEATURES.map(({ Icon, title, desc }, i) => (
        <div key={i}
          className="af-feat"
          style={{
            ...slide(`${0.36 + i * 0.07}s`),
            display: 'flex', alignItems: 'center', gap: 13,
            padding: '10px 13px', borderRadius: 13,
            background: 'rgba(201,119,0,.05)',
          }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg,${G}18,${GL}10)`,
            border: `1px solid ${G}28`,
          }}>
            <Icon size={17} color={G} strokeWidth={1.7} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: GD, fontSize: 12.5, fontWeight: 700, marginBottom: 1 }}>{title}</div>
            <div style={{ color: 'rgba(122,79,0,.5)', fontSize: 11.5, lineHeight: 1.5 }}>{desc}</div>
          </div>
          <ChevronRight size={13} color="rgba(201,119,0,.28)" style={{ flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}

export function TrustBadges({ slide }) {
  return (
    <div style={{ ...slide('0.64s'), display: 'flex', gap: 7, marginTop: 18, flexWrap: 'wrap' }}>
      {TRUST.map(({ label }, i) => (
        <div key={i} className="af-trust"
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 11px', borderRadius: 99,
            background: GSoft, border: `1px solid ${LINE}`,
          }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, flexShrink: 0 }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: GM }}>{label}</span>
        </div>
      ))}
    </div>
  );
}
