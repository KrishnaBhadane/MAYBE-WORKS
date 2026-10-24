"use client";

import React, { useMemo, useState } from "react";
import { Copy, Check, ListOrdered, ExternalLink } from "lucide-react";

export interface WikipediaArticleRendererProps {
  content: string;
  showToc?: boolean;
  infoboxData?: Array<{ label: string; value: string }>;
  className?: string;
  articleMeta?: {
    category?: string;
    lastRevised?: string;
  };
}

interface TocItem {
  id: string;
  text: string;
  level: number;
  numbering: string;
}

export function WikipediaArticleRenderer({
  content,
  showToc = true,
  infoboxData,
  className = "",
  articleMeta,
}: WikipediaArticleRendererProps) {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);
  const [tocCollapsed, setTocCollapsed] = useState<boolean>(false);

  // Extract Table of Contents items with Wikipedia numbering (e.g., 1, 1.1, 1.2, 2, 2.1)
  const tocItems: TocItem[] = useMemo(() => {
    if (!content) return [];
    const lines = content.split(/\r?\n/);
    const items: TocItem[] = [];
    let h2Counter = 0;
    let h3Counter = 0;

    lines.forEach((line) => {
      const h2Match = line.match(/^##\s+(.+)$/);
      const h3Match = line.match(/^###\s+(.+)$/);

      if (h2Match) {
        h2Counter++;
        h3Counter = 0;
        const text = h2Match[1].replace(/[*_`#]/g, "").trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        items.push({ id, text, level: 2, numbering: `${h2Counter}` });
      } else if (h3Match) {
        h3Counter++;
        const text = h3Match[1].replace(/[*_`#]/g, "").trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const num = h2Counter > 0 ? `${h2Counter}.${h3Counter}` : `${h3Counter}`;
        items.push({ id, text, level: 3, numbering: num });
      }
    });

    return items;
  }, [content]);

  const handleCopyCode = async (codeStr: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(codeStr);
      setCopiedCodeIdx(idx);
      setTimeout(() => setCopiedCodeIdx(null), 2000);
    } catch {
      // Fallback
    }
  };

  // Helper to parse inline markdown (bold, italic, inline code, links)
  const parseInline = (text: string): React.ReactNode => {
    if (!text) return "";
    const parts: React.ReactNode[] = [];
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[([^\]]+)\]\(([^)]+)\))/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      const token = match[0];

      if (token.startsWith("`") && token.endsWith("`")) {
        parts.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-[#F8F9FA] border border-[#a2a9b1]/60 text-black font-semibold mx-0.5"
          >
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith("**") && token.endsWith("**")) {
        parts.push(
          <strong key={match.index} className="font-bold text-black">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith("*") && token.endsWith("*")) {
        parts.push(
          <em key={match.index} className="italic text-neutral-800">
            {token.slice(1, -1)}
          </em>
        );
      } else if (token.startsWith("[")) {
        // [title](url)
        const linkText = match[2];
        const linkHref = match[3];
        parts.push(
          <a
            key={match.index}
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3366cc] hover:underline inline-flex items-center gap-0.5"
          >
            <span>{linkText}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60 inline" />
          </a>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Structured block parser (Headings, Tables, Lists, Code, Callouts, Paragraphs)
  const renderedBlocks = useMemo(() => {
    if (!content) return null;
    const lines = content.split(/\r?\n/);
    const blocks: React.ReactNode[] = [];

    let inCodeBlock = false;
    let codeLanguage = "";
    let codeBuffer: string[] = [];
    let codeBlockCount = 0;

    let inList = false;
    let listItems: string[] = [];
    let listIsOrdered = false;

    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    const flushList = (key: string) => {
      if (listItems.length > 0) {
        if (listIsOrdered) {
          blocks.push(
            <ol key={key} className="list-decimal pl-7 my-3 space-y-1.5 text-sm text-neutral-800 font-sans">
              {listItems.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {parseInline(item)}
                </li>
              ))}
            </ol>
          );
        } else {
          blocks.push(
            <ul key={key} className="list-disc pl-7 my-3 space-y-1.5 text-sm text-neutral-800 font-sans">
              {listItems.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {parseInline(item)}
                </li>
              ))}
            </ul>
          );
        }
        listItems = [];
        inList = false;
      }
    };

    const flushTable = (key: string) => {
      if (inTable && (tableHeaders.length > 0 || tableRows.length > 0)) {
        blocks.push(
          <div key={key} className="my-5 overflow-x-auto">
            <table className="wikitable w-full text-xs font-sans border-collapse border border-[#a2a9b1] bg-white shadow-2xs">
              {tableHeaders.length > 0 && (
                <thead>
                  <tr className="bg-[#eaecf0] border-b border-[#a2a9b1]">
                    {tableHeaders.map((th, hIdx) => (
                      <th
                        key={hIdx}
                        className="px-3 py-2 text-left font-bold text-black border border-[#a2a9b1] text-xs uppercase tracking-wide"
                      >
                        {parseInline(th)}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-[#a2a9b1]/60">
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 1 ? "bg-[#f8f9fa] hover:bg-[#f2f4f7]" : "bg-white hover:bg-[#f2f4f7]"}>
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="px-3 py-2 border border-[#a2a9b1] text-neutral-800 leading-normal"
                      >
                        {parseInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableHeaders = [];
        tableRows = [];
        inTable = false;
      }
    };

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];

      // Code Block Boundary
      if (line.trim().startsWith("```")) {
        flushList(`list-before-code-${idx}`);
        flushTable(`table-before-code-${idx}`);
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.trim().slice(3).trim();
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          const codeString = codeBuffer.join("\n");
          const blockIdx = codeBlockCount++;
          blocks.push(
            <div
              key={`code-${blockIdx}`}
              className="my-4 rounded-lg border border-black/20 overflow-hidden bg-[#0D111A] text-white font-mono text-xs shadow-xs"
            >
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#141A29] border-b border-neutral-800 text-[11px] text-neutral-400">
                <span className="font-bold uppercase tracking-wider text-[#FAFF00]">
                  {codeLanguage || "code"}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(codeString, blockIdx)}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  {copiedCodeIdx === blockIdx ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedCodeIdx === blockIdx ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto leading-relaxed text-neutral-200">
                {codeString}
              </pre>
            </div>
          );
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // Check for Table Row: | Col 1 | Col 2 |
      if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
        flushList(`list-before-table-${idx}`);
        const cells = line
          .trim()
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim());

        // Check if this is the separator row: |---|---|
        const isSeparator = cells.every((c) => /^:?-+:?$/.test(c));

        if (isSeparator) {
          // It's the delimiter, skip adding it as data
          inTable = true;
        } else if (!inTable) {
          // First row is headers
          inTable = true;
          tableHeaders = cells;
        } else {
          // Data row
          tableRows.push(cells);
        }
        continue;
      } else if (inTable) {
        flushTable(`table-flush-${idx}`);
      }

      // Check for List Items
      const ulMatch = line.match(/^[-*]\s+(.+)$/);
      const olMatch = line.match(/^(\d+)\.\s+(.+)$/);

      if (ulMatch) {
        if (inList && listIsOrdered) flushList(`list-switch-${idx}`);
        inList = true;
        listIsOrdered = false;
        listItems.push(ulMatch[1]);
        continue;
      } else if (olMatch) {
        if (inList && !listIsOrdered) flushList(`list-switch-${idx}`);
        inList = true;
        listIsOrdered = true;
        listItems.push(olMatch[2]);
        continue;
      } else {
        flushList(`list-flush-${idx}`);
      }

      // Wikipedia Level 1 Heading: # Title
      if (line.startsWith("# ")) {
        const text = line.slice(2).trim();
        blocks.push(
          <div key={`h1-${idx}`} className="mt-4 mb-5">
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-black border-b border-[#a2a9b1] pb-2 tracking-tight">
              {parseInline(text)}
            </h1>
            <div className="text-[11px] font-sans text-neutral-500 italic mt-1">
              From the technical reference and algorithmic documentation encyclopedia
            </div>
          </div>
        );
        continue;
      }

      // Wikipedia Level 2 Section Heading: ## Section
      if (line.startsWith("## ")) {
        const text = line.slice(3).trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        blocks.push(
          <div key={`h2-${idx}`} className="mt-8 mb-3">
            <h2
              id={id}
              className="text-xl sm:text-2xl font-serif font-normal text-black border-b border-[#a2a9b1] pb-1 tracking-tight flex items-center justify-between group"
            >
              <span>{parseInline(text)}</span>
              <a
                href={`#${id}`}
                className="text-xs font-sans text-[#3366cc] opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
              >
                [section link]
              </a>
            </h2>
          </div>
        );
        continue;
      }

      // Wikipedia Level 3 Subsection Heading: ### Subsection
      // Perfect for questions: ### Problem Statement, ### Constraints, ### Input Format, ### Output Format
      if (line.startsWith("### ")) {
        const text = line.slice(4).trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        blocks.push(
          <div key={`h3-${idx}`} className="mt-6 mb-2">
            <h3
              id={id}
              className="text-base sm:text-lg font-sans font-bold text-black border-b border-[#a2a9b1]/40 pb-1 flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FAFF00] border border-black inline-block flex-shrink-0" />
              <span>{parseInline(text)}</span>
            </h3>
          </div>
        );
        continue;
      }

      // Wikipedia Level 4 Subsection Heading: #### Sub-heading
      if (line.startsWith("#### ")) {
        const text = line.slice(5).trim();
        blocks.push(
          <h4
            key={`h4-${idx}`}
            className="text-sm font-sans font-bold text-neutral-900 mt-4 mb-1 uppercase tracking-wider"
          >
            {parseInline(text)}
          </h4>
        );
        continue;
      }

      // Blockquote / Wikipedia Callout Box
      if (line.startsWith("> ")) {
        const quoteText = line.slice(2).trim();
        blocks.push(
          <div
            key={`quote-${idx}`}
            className="my-3.5 p-3.5 bg-[#F8F9FA] border-l-4 border-[#3366cc] rounded-r-lg text-xs leading-relaxed text-neutral-800 italic font-sans"
          >
            {parseInline(quoteText)}
          </div>
        );
        continue;
      }

      // Hatnote / Disambiguation (e.g. *Main article: ...* or *Note: ...*)
      if (line.trim().startsWith("*") && line.trim().endsWith("*") && !line.includes("**")) {
        const hatnoteText = line.trim().slice(1, -1);
        blocks.push(
          <div
            key={`hatnote-${idx}`}
            className="pl-6 text-xs italic text-neutral-600 font-sans my-2 relative before:content-['↳'] before:absolute before:left-1 before:text-neutral-400"
          >
            {parseInline(hatnoteText)}
          </div>
        );
        continue;
      }

      // Empty Lines
      if (line.trim() === "") {
        continue;
      }

      // Standard Paragraph (Encyclopedic typography, high readability, justified spacing)
      blocks.push(
        <p
          key={`p-${idx}`}
          className="text-sm text-neutral-800 leading-relaxed my-2.5 font-sans"
        >
          {parseInline(line)}
        </p>
      );
    }

    flushList("list-end");
    flushTable("table-end");
    return blocks;
  }, [content, copiedCodeIdx]);

  return (
    <article className={`space-y-4 text-black select-text ${className}`}>
      {/* Optional Wikipedia Infobox (Floating Right on Desktop) */}
      {infoboxData && infoboxData.length > 0 && (
        <aside className="float-none sm:float-right sm:ml-5 sm:mb-4 mb-5 w-full sm:w-72 bg-[#F8F9FA] border border-[#a2a9b1] rounded-md shadow-xs p-3 text-xs font-sans">
          <div className="bg-[#eaecf0] border-b border-[#a2a9b1] p-2 font-bold text-center text-black tracking-wide uppercase text-[11px] mb-2 rounded-t">
            Specification Summary
          </div>
          <table className="w-full border-collapse">
            <tbody className="divide-y divide-[#a2a9b1]/30">
              {infoboxData.map((row, idx) => (
                <tr key={idx} className="py-1">
                  <td className="font-bold text-neutral-700 pr-2 py-1.5 align-top text-[11px] w-28">
                    {row.label}
                  </td>
                  <td className="font-mono text-black font-semibold py-1.5 text-right text-[11px] break-all">
                    {row.value}
                  </td>
                </tr>
              ))}
              {articleMeta?.category && (
                <tr className="py-1">
                  <td className="font-bold text-neutral-700 pr-2 py-1.5 align-top text-[11px]">
                    Category
                  </td>
                  <td className="font-sans text-neutral-900 py-1.5 text-right text-[11px]">
                    {articleMeta.category}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </aside>
      )}

      {/* Wikipedia Table of Contents (TOC) */}
      {showToc && tocItems.length >= 3 && (
        <div className="my-4 inline-block min-w-[260px] max-w-md bg-[#F8F9FA] border border-[#a2a9b1] rounded-md p-3.5 text-xs shadow-2xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#a2a9b1]/60 font-bold text-black mb-2">
            <span className="flex items-center gap-1.5 tracking-tight font-serif text-sm">
              <ListOrdered className="w-4 h-4 text-neutral-700" />
              Contents
            </span>
            <button
              type="button"
              onClick={() => setTocCollapsed(!tocCollapsed)}
              className="text-[11px] text-[#3366cc] hover:underline font-mono"
            >
              [{tocCollapsed ? "show" : "hide"}]
            </button>
          </div>

          {!tocCollapsed && (
            <nav className="space-y-1.5 font-sans pt-1">
              {tocItems.map((item, idx) => (
                <a
                  key={idx}
                  href={`#${item.id}`}
                  className={`block text-[#3366cc] hover:underline transition-colors ${
                    item.level === 3
                      ? "pl-5 text-[11px] text-neutral-700 hover:text-[#3366cc]"
                      : "font-semibold text-xs"
                  }`}
                >
                  <span className="text-neutral-500 mr-2 font-mono text-[11px]">
                    {item.numbering}
                  </span>
                  <span>{item.text}</span>
                </a>
              ))}
            </nav>
          )}
        </div>
      )}

      {/* Main Encyclopedic Body */}
      <div className="space-y-2">{renderedBlocks}</div>
    </article>
  );
}
