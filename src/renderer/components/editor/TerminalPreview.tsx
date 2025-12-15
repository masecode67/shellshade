import React from 'react';
import type { ThemeColors, ThemeSettings } from '../../../shared/types/theme';

interface TerminalPreviewProps {
  colors: ThemeColors;
  settings: ThemeSettings;
}

const TerminalPreview: React.FC<TerminalPreviewProps> = ({ colors, settings }) => {
  const fontFamily = settings.fontFamily || 'SF Mono, Monaco, monospace';
  const fontSize = settings.fontSize || 13;

  // Sample terminal content with ANSI color demonstrations
  const lines = [
    { type: 'prompt', content: '~/projects/app' },
    { type: 'command', content: ' $ git status' },
    { type: 'output', segments: [
      { text: 'On branch ', color: colors.foreground },
      { text: 'main', color: colors.ansi.green },
    ]},
    { type: 'output', segments: [
      { text: 'Changes not staged for commit:', color: colors.ansi.yellow },
    ]},
    { type: 'output', segments: [
      { text: '  modified:   ', color: colors.ansi.red },
      { text: 'src/App.tsx', color: colors.foreground },
    ]},
    { type: 'output', segments: [
      { text: '  modified:   ', color: colors.ansi.red },
      { text: 'package.json', color: colors.foreground },
    ]},
    { type: 'blank' },
    { type: 'prompt', content: '~/projects/app' },
    { type: 'command', content: ' $ npm install' },
    { type: 'output', segments: [
      { text: 'added ', color: colors.foreground },
      { text: '127', color: colors.ansi.cyan },
      { text: ' packages in ', color: colors.foreground },
      { text: '4.2s', color: colors.ansi.green },
    ]},
    { type: 'blank' },
    { type: 'prompt', content: '~/projects/app' },
    { type: 'command', content: ' $ ls -la' },
    { type: 'output', segments: [
      { text: 'drwxr-xr-x  ', color: colors.ansi.brightBlack },
      { text: 'node_modules', color: colors.ansi.blue },
    ]},
    { type: 'output', segments: [
      { text: 'drwxr-xr-x  ', color: colors.ansi.brightBlack },
      { text: 'src', color: colors.ansi.blue },
    ]},
    { type: 'output', segments: [
      { text: '-rw-r--r--  ', color: colors.ansi.brightBlack },
      { text: 'package.json', color: colors.foreground },
    ]},
    { type: 'output', segments: [
      { text: '-rwxr-xr-x  ', color: colors.ansi.brightBlack },
      { text: 'build.sh', color: colors.ansi.green },
    ]},
    { type: 'blank' },
    { type: 'prompt', content: '~/projects/app' },
    { type: 'command', content: ' $ echo "Colors test"' },
    { type: 'colors' },
    { type: 'blank' },
    { type: 'prompt', content: '~/projects/app' },
    { type: 'cursor' },
  ];

  const renderLine = (line: typeof lines[number], index: number) => {
    if (line.type === 'blank') {
      return <div key={index} className="h-5" />;
    }

    if (line.type === 'prompt') {
      return (
        <div key={index} className="flex">
          <span style={{ color: colors.ansi.blue }}>{line.content}</span>
        </div>
      );
    }

    if (line.type === 'command') {
      return (
        <span key={index} style={{ color: colors.foreground }}>{line.content}</span>
      );
    }

    if (line.type === 'output' && 'segments' in line) {
      return (
        <div key={index}>
          {line.segments.map((seg, i) => (
            <span key={i} style={{ color: seg.color }}>{seg.text}</span>
          ))}
        </div>
      );
    }

    if (line.type === 'colors') {
      return (
        <div key={index} className="flex gap-1 py-1">
          {Object.entries(colors.ansi).slice(0, 8).map(([key, color]) => (
            <span
              key={key}
              className="px-2 py-0.5 rounded text-[10px]"
              style={{ backgroundColor: color, color: colors.background }}
            >
              {key.slice(0, 3)}
            </span>
          ))}
        </div>
      );
    }

    if (line.type === 'cursor') {
      return (
        <span
          key={index}
          className="inline-block w-2 h-4 animate-pulse"
          style={{
            backgroundColor: colors.cursor,
            marginLeft: '2px',
          }}
        />
      );
    }

    return null;
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-glass-lg border border-white/10">
      {/* macOS window title bar */}
      <div
        className="flex items-center px-4 py-3 border-b border-black/20"
        style={{
          backgroundColor: colors.background,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05), rgba(255,255,255,0))'
        }}
      >
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-inner" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-inner" />
          <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-inner" />
        </div>
        <span
          className="flex-1 text-center text-xs font-medium"
          style={{ color: colors.ansi.brightBlack }}
        >
          Terminal — bash
        </span>
        <div className="w-14" /> {/* Spacer for centering */}
      </div>

      {/* Terminal content */}
      <div
        className="p-4 min-h-[420px] overflow-auto"
        style={{
          backgroundColor: colors.background,
          color: colors.foreground,
          fontFamily,
          fontSize: `${fontSize}px`,
          lineHeight: '1.5',
        }}
      >
        {lines.map((line, index) => renderLine(line, index))}
      </div>
    </div>
  );
};

export default TerminalPreview;
