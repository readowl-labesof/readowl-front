import React from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
};

export default function EditDateField({ value, onChange, label = "Data de registro", placeholder = "Data não disponível" }: Props) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
      <span role="img" aria-label="data">📅</span>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          flex: 1,
          borderRadius: 12,
          border: 'none',
          padding: '8px 16px',
          background: '#ede7f6',
          color: '#7c5cbf',
          fontWeight: 500,
          fontSize: 16,
        }}
      />
      {!value && <span style={{ color: '#fff', fontSize: 16, marginLeft: 8 }}>{placeholder}</span>}
    </label>
  );
}