// TrendSpark.jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';

const lerpHex = (a, b, t) => {
  const p = (h) => parseInt(h, 16);
  const r = (i) => i.toString(16).padStart(2, '0');
  const ar = p(a.slice(1, 3)), ag = p(a.slice(3, 5)), ab = p(a.slice(5, 7));
  const br = p(b.slice(1, 3)), bg = p(b.slice(3, 5)), bb = p(b.slice(5, 7));
  return `#${r(Math.round(ar + (br - ar) * t))}${r(Math.round(ag + (bg - ag) * t))}${r(Math.round(ab + (bb - ab) * t))}`;
};

// maps 0..1000 => green → yellow → red
const priceToColor = (v0) => {
  const v = Math.max(0, Math.min(1000, Number(v0) || 0));
  if (v <= 500) return lerpHex('#16a34a', '#eab308', v / 500);
  return lerpHex('#eab308', '#dc2626', (v - 500) / 500);
};

export default function TrendSpark({ points = [] }) {
  if (!points?.length) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const norm = (v) => (max === min ? 0.5 : (v - min) / (max - min));

  return (
    <View style={s.wrap}>
      {points.map((v, i) => (
        <View
          key={i}
          style={[
            s.bar,
            {
              height: 8 + 20 * norm(v),
              backgroundColor: priceToColor(v),
            },
          ]}
        />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  // Transparent container (no background tint)
  wrap: { flexDirection: 'row', gap: 3, alignItems: 'flex-end' },
  bar:  { width: 8, borderRadius: 4 },
});
