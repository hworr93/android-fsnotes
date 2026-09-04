import React, { useMemo } from 'react';
import { marked } from 'marked';
import { ThemeColors } from '../utils/theme';

interface Props {
  content: string;
  theme: ThemeColors;
  fontSize: number;
  fontFamily: 'sans' | 'mono' | 'serif';
  onToggleCheckbox?: (itemText: string, newCheckedState: boolean) => void;
  onTagClick?: (tag: string) => void;
}

export function MarkdownRenderer({
  content,
  theme,
  fontSize,
  fontFamily,
  onToggleCheckbox,
  onTagClick,
}: Props) {
  // Parse markdown into HTML string
  const htmlContent = useMemo(() => {
    marked.setOptions({
      gfm: true,
      breaks: true,
    });

    try {
      return marked.parse(content || '*No content*') as string;
    } catch {
      return `<p>${content}</p>`;
    }
  }, [content]);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Handle Checkbox Taps
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      const parentLi = target.closest('li');
      if (parentLi && onToggleCheckbox) {
        // Extract plain text after checkbox
        const textContent = parentLi.innerText.trim();
        onToggleCheckbox(textContent, target.checked);
      }
      return;
    }

    // Handle Hashtag Click
    if (target.dataset?.tag && onTagClick) {
      onTagClick(target.dataset.tag);
    }
  };

  const fontClass =
    fontFamily === 'mono'
      ? 'font-mono'
      : fontFamily === 'serif'
        ? 'font-serif'
        : 'font-sans';

  return (
    <div
      id="markdown-rendered-view"
      onClick={handleContainerClick}
      style={{ fontSize: `${fontSize}px` }}
      className={`prose max-w-none leading-relaxed transition-colors duration-150 ${fontClass} ${theme.textPrimary}`}
    >
      <div
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        className="markdown-body space-y-3"
      />
    </div>
  );
}
