import { AlertCircle } from 'lucide-react';

const G    = '#C97700';
const GM   = '#7A4F00';
const GD   = '#3D1F00';
const CREAM = '#FFFDF5';
const LINEB = 'rgba(201,119,0,.22)';
const C    = { red: '#DC2626' };

export default function AuthField({
  label, type = 'text', value, onChange, onKeyDown,
  placeholder, focused, onFocus, onBlur, error, Icon, suffix,
}) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 9.5, fontWeight: 800,
        color: focused ? G : GM, textTransform: 'uppercase',
        letterSpacing: '.6px', marginBottom: 6,
        fontFamily: 'Cinzel,serif', transition: 'color .18s',
      }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none', display: 'flex', alignItems: 'center',
          }}>
            <Icon size={14} color={focused ? G : 'rgba(122,79,0,.38)'} strokeWidth={1.8} />
          </span>
        )}
        <input
          type={type} value={value} onChange={onChange}
          onKeyDown={onKeyDown} placeholder={placeholder}
          onFocus={onFocus} onBlur={onBlur}
          style={{
            width: '100%', padding: '11px 14px',
            paddingLeft: Icon ? '37px' : '14px',
            paddingRight: suffix ? '44px' : '14px',
            borderRadius: 11, fontSize: 13.5,
            fontFamily: 'Outfit,sans-serif',
            outline: 'none', transition: 'all .2s',
            boxSizing: 'border-box', color: GD,
            background: focused ? CREAM : 'rgba(255,252,240,.75)',
            border: `1.5px solid ${error ? C.red : focused ? G : LINEB}`,
            boxShadow: focused
              ? '0 0 0 3px rgba(201,119,0,.11),0 2px 8px rgba(0,0,0,.05)'
              : '0 1px 3px rgba(0,0,0,.04)',
          }} />
        {suffix && (
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p style={{ fontSize: 10.5, color: C.red, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertCircle size={10} /> {error}
        </p>
      )}
    </div>
  );
}
