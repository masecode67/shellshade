import React, { useState, useEffect, useRef } from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hexValue, setHexValue] = useState(color);
  const [hsl, setHsl] = useState(() => {
    const rgb = hexToRgb(color);
    return rgbToHsl(rgb.r, rgb.g, rgb.b);
  });
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHexValue(color);
    const rgb = hexToRgb(color);
    setHsl(rgbToHsl(rgb.r, rgb.g, rgb.b));
  }, [color]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleHexChange = (value: string) => {
    setHexValue(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onChange(value);
      const rgb = hexToRgb(value);
      setHsl(rgbToHsl(rgb.r, rgb.g, rgb.b));
    }
  };

  const handleHslChange = (key: 'h' | 's' | 'l', value: number) => {
    const newHsl = { ...hsl, [key]: value };
    setHsl(newHsl);
    const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setHexValue(hex);
    onChange(hex);
  };

  const noDragStyle: React.CSSProperties = { WebkitAppRegion: 'no-drag' as const };

  return (
    <div className="relative" style={noDragStyle}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full p-2 rounded border border-surface-border hover:border-accent transition-colors cursor-pointer"
        style={noDragStyle}
      >
        <div
          className="w-6 h-6 rounded border border-white/20"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-mono flex-1 text-left">{color.toUpperCase()}</span>
        {label && <span className="text-xs text-gray-500">{label}</span>}
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-50 mt-2 p-4 bg-surface-secondary rounded-lg border border-surface-border shadow-xl w-64"
          style={noDragStyle}
        >
          {/* Color preview */}
          <div
            className="h-16 rounded mb-4 border border-white/10"
            style={{ backgroundColor: hexValue }}
          />

          {/* Hex input */}
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-1">Hex</label>
            <input
              type="text"
              value={hexValue}
              onChange={(e) => handleHexChange(e.target.value)}
              className="w-full bg-surface border border-surface-border rounded px-2 py-1 font-mono text-sm"
              style={noDragStyle}
            />
          </div>

          {/* HSL sliders */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Hue</span>
                <span>{hsl.h}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={hsl.h}
                onChange={(e) => handleHslChange('h', parseInt(e.target.value))}
                className="w-full accent-accent"
                style={{
                  ...noDragStyle,
                  background: `linear-gradient(to right,
                    hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%),
                    hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))`
                }}
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Saturation</span>
                <span>{hsl.s}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={hsl.s}
                onChange={(e) => handleHslChange('s', parseInt(e.target.value))}
                className="w-full accent-accent"
                style={noDragStyle}
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Lightness</span>
                <span>{hsl.l}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={hsl.l}
                onChange={(e) => handleHslChange('l', parseInt(e.target.value))}
                className="w-full accent-accent"
                style={noDragStyle}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
