import React from 'react';
import ColorPicker from './ColorPicker';
import type { ThemeColors, AnsiColors } from '../../../shared/types/theme';

interface ColorPaletteProps {
  colors: ThemeColors;
  onChange: (colors: ThemeColors) => void;
}

const ANSI_COLOR_NAMES: { key: keyof AnsiColors; label: string; index: number }[] = [
  { key: 'black', label: 'Black', index: 0 },
  { key: 'red', label: 'Red', index: 1 },
  { key: 'green', label: 'Green', index: 2 },
  { key: 'yellow', label: 'Yellow', index: 3 },
  { key: 'blue', label: 'Blue', index: 4 },
  { key: 'magenta', label: 'Magenta', index: 5 },
  { key: 'cyan', label: 'Cyan', index: 6 },
  { key: 'white', label: 'White', index: 7 },
  { key: 'brightBlack', label: 'Bright Black', index: 8 },
  { key: 'brightRed', label: 'Bright Red', index: 9 },
  { key: 'brightGreen', label: 'Bright Green', index: 10 },
  { key: 'brightYellow', label: 'Bright Yellow', index: 11 },
  { key: 'brightBlue', label: 'Bright Blue', index: 12 },
  { key: 'brightMagenta', label: 'Bright Magenta', index: 13 },
  { key: 'brightCyan', label: 'Bright Cyan', index: 14 },
  { key: 'brightWhite', label: 'Bright White', index: 15 },
];

const ColorPalette: React.FC<ColorPaletteProps> = ({ colors, onChange }) => {
  const handleCoreColorChange = (key: keyof ThemeColors, value: string) => {
    onChange({
      ...colors,
      [key]: value,
    });
  };

  const handleAnsiColorChange = (key: keyof AnsiColors, value: string) => {
    onChange({
      ...colors,
      ansi: {
        ...colors.ansi,
        [key]: value,
      },
    });
  };

  const noDragStyle: React.CSSProperties = { WebkitAppRegion: 'no-drag' as const };

  return (
    <div className="space-y-6" style={noDragStyle}>
      {/* Core Colors */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Core Colors</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Background</label>
            <ColorPicker
              color={colors.background}
              onChange={(c) => handleCoreColorChange('background', c)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Foreground</label>
            <ColorPicker
              color={colors.foreground}
              onChange={(c) => handleCoreColorChange('foreground', c)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Cursor</label>
            <ColorPicker
              color={colors.cursor}
              onChange={(c) => handleCoreColorChange('cursor', c)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Cursor Text</label>
            <ColorPicker
              color={colors.cursorText}
              onChange={(c) => handleCoreColorChange('cursorText', c)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Selection</label>
            <ColorPicker
              color={colors.selection}
              onChange={(c) => handleCoreColorChange('selection', c)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Selection Text</label>
            <ColorPicker
              color={colors.selectionText}
              onChange={(c) => handleCoreColorChange('selectionText', c)}
            />
          </div>
        </div>
      </div>

      {/* ANSI Colors */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Normal Colors (0-7)</h3>
        <div className="grid grid-cols-4 gap-2">
          {ANSI_COLOR_NAMES.slice(0, 8).map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs text-gray-500 mb-1 truncate">{label}</label>
              <ColorPicker
                color={colors.ansi[key]}
                onChange={(c) => handleAnsiColorChange(key, c)}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Bright Colors (8-15)</h3>
        <div className="grid grid-cols-4 gap-2">
          {ANSI_COLOR_NAMES.slice(8, 16).map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs text-gray-500 mb-1 truncate">{label}</label>
              <ColorPicker
                color={colors.ansi[key]}
                onChange={(c) => handleAnsiColorChange(key, c)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Color Grid Preview */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Color Preview</h3>
        <div className="p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
          <div className="grid grid-cols-8 gap-1 mb-2">
            {ANSI_COLOR_NAMES.slice(0, 8).map(({ key }) => (
              <div
                key={key}
                className="h-6 rounded"
                style={{ backgroundColor: colors.ansi[key] }}
                title={key}
              />
            ))}
          </div>
          <div className="grid grid-cols-8 gap-1">
            {ANSI_COLOR_NAMES.slice(8, 16).map(({ key }) => (
              <div
                key={key}
                className="h-6 rounded"
                style={{ backgroundColor: colors.ansi[key] }}
                title={key}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPalette;
