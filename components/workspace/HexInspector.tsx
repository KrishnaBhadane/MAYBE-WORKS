"use client";

import { useState, useMemo } from "react";
import { Binary, Copy, Check, Info, Layers } from "lucide-react";

export interface FieldMapping {
  name: string;
  start: number;
  end: number; // inclusive
  color: string;
  description: string;
  decodedValue: string;
}

export interface BinaryPreset {
  id: string;
  name: string;
  format: "ELF" | "PE" | "Mach-O" | "Wasm" | "ZIP";
  bytes: number[];
  fields: FieldMapping[];
}

export const PRESET_BINARIES: BinaryPreset[] = [
  {
    id: "elf64",
    name: "Minimal Linux ELF64",
    format: "ELF",
    // Standard minimal ELF64 executable header (64 bytes)
    bytes: [
      0x7f, 0x45, 0x4c, 0x46, // 0x00-0x03: \x7fELF magic
      0x02,                   // 0x04: 64-bit (EI_CLASS)
      0x01,                   // 0x05: Little endian (EI_DATA)
      0x01,                   // 0x06: ELF version 1 (EI_VERSION)
      0x00,                   // 0x07: System V ABI (EI_OSABI)
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // 0x08-0x0F: Padding
      0x02, 0x00,             // 0x10-0x11: ET_EXEC Executable (e_type)
      0x3e, 0x00,             // 0x12-0x13: AMD x86-64 (e_machine)
      0x01, 0x00, 0x00, 0x00, // 0x14-0x17: EV_CURRENT (e_version)
      0x78, 0x00, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, // 0x18-0x1F: Entry point 0x400078 (e_entry)
      0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // 0x20-0x27: Program header offset 64 (e_phoff)
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // 0x28-0x2F: Section header offset 0 (e_shoff)
      0x00, 0x00, 0x00, 0x00, // 0x30-0x33: Flags (e_flags)
      0x40, 0x00,             // 0x34-0x35: Header size 64 bytes (e_ehsize)
      0x38, 0x00,             // 0x36-0x37: Program header size 56 (e_phentsize)
      0x01, 0x00,             // 0x38-0x39: Program headers count 1 (e_phnum)
      0x40, 0x00,             // 0x3A-0x3B: Section header size 64 (e_shentsize)
      0x00, 0x00,             // 0x3C-0x3D: Section headers count 0 (e_shnum)
      0x00, 0x00,             // 0x3E-0x3F: Section name index (e_shstrndx)
    ],
    fields: [
      { name: "Magic Signature", start: 0, end: 3, color: "bg-amber-500/30 text-amber-300 border-amber-500", description: "Standard ELF identification header bytes (0x7F 'E' 'L' 'F')", decodedValue: "\\x7fELF (0x7F454C46)" },
      { name: "Class (Bit Width)", start: 4, end: 4, color: "bg-blue-500/30 text-blue-300 border-blue-500", description: "Target architecture word size (0x02 = 64-bit Architecture)", decodedValue: "64-bit Objects (ELFCLASS64)" },
      { name: "Endianness", start: 5, end: 5, color: "bg-cyan-500/30 text-cyan-300 border-cyan-500", description: "Data encoding byte-order (0x01 = 2's complement, little-endian)", decodedValue: "Little-Endian (ELFDATA2LSB)" },
      { name: "OS ABI", start: 7, end: 7, color: "bg-emerald-500/30 text-emerald-300 border-emerald-500", description: "Target Operating System Application Binary Interface", decodedValue: "UNIX System V (0x00)" },
      { name: "File Type (e_type)", start: 16, end: 17, color: "bg-purple-500/30 text-purple-300 border-purple-500", description: "Identifies whether binary is Relocatable, Executable, or Shared Library", decodedValue: "ET_EXEC (0x0002 Standalone Executable)" },
      { name: "Machine Architecture", start: 18, end: 19, color: "bg-red-500/30 text-red-300 border-red-500", description: "Target processor instruction set", decodedValue: "Advanced Micro Devices x86-64 (0x003E)" },
      { name: "Entry Point (e_entry)", start: 24, end: 31, color: "bg-yellow-500/30 text-yellow-300 border-yellow-500", description: "Virtual memory address where execution begins when process starts", decodedValue: "0x00400078 (Virtual Address)" },
      { name: "Program Header Offset", start: 32, end: 39, color: "bg-teal-500/30 text-teal-300 border-teal-500", description: "Byte offset in file to the first program segment header", decodedValue: "64 bytes (0x00000040)" },
    ],
  },
  {
    id: "pe64",
    name: "Minimal Windows PE32+",
    format: "PE",
    // Standard minimal MS-DOS stub + PE signature (68 bytes)
    bytes: [
      0x4d, 0x5a, // 0x00-0x01: 'MZ' DOS signature
      0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00, // DOS header fields
      0xb8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x40, 0x00, 0x00, 0x00, // 0x3C-0x3F: e_lfanew pointer to PE signature (0x00000040)
      0x50, 0x45, 0x00, 0x00, // 0x40-0x43: 'PE\0\0' Signature
      0x64, 0x86,             // 0x44-0x45: Machine (0x8664 = x86-64)
      0x02, 0x00,             // 0x46-0x47: NumberOfSections (2 sections: .text, .data)
    ],
    fields: [
      { name: "DOS 'MZ' Signature", start: 0, end: 1, color: "bg-amber-500/30 text-amber-300 border-amber-500", description: "Legacy MS-DOS executable marker (0x4D 0x5A = 'MZ' Mark Zbikowski)", decodedValue: "'MZ' (0x5A4D)" },
      { name: "PE Header Offset (e_lfanew)", start: 60, end: 63, color: "bg-cyan-500/30 text-cyan-300 border-cyan-500", description: "Pointer at offset 0x3C pointing to start of NT PE header", decodedValue: "Offset 0x00000040 (64 bytes)" },
      { name: "PE Signature", start: 64, end: 67, color: "bg-emerald-500/30 text-emerald-300 border-emerald-500", description: "Portable Executable signature marker (0x50 0x45 0x00 0x00)", decodedValue: "'PE\\0\\0' (0x00004550)" },
      { name: "COFF Machine", start: 68, end: 69, color: "bg-red-500/30 text-red-300 border-red-500", description: "Target architecture in COFF header (IMAGE_FILE_MACHINE_AMD64)", decodedValue: "0x8664 (x86-64 / AMD64)" },
      { name: "Number of Sections", start: 70, end: 71, color: "bg-purple-500/30 text-purple-300 border-purple-500", description: "Count of section entries in section table following optional header", decodedValue: "2 Sections (.text, .data)" },
    ],
  },
  {
    id: "wasm",
    name: "WebAssembly Module (.wasm)",
    format: "Wasm",
    bytes: [
      0x00, 0x61, 0x73, 0x6d, // 0x00-0x03: \0asm magic
      0x01, 0x00, 0x00, 0x00, // 0x04-0x07: version 1
      0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7f, // Type section (ID 1, size 5, func () -> i32)
      0x03, 0x02, 0x01, 0x00, // Function section (ID 3, size 2, type 0)
      0x0a, 0x06, 0x01, 0x04, 0x00, 0x41, 0x2a, 0x0f, 0x0b, // Code section (ID 10, i32.const 42, return)
    ],
    fields: [
      { name: "Wasm Magic Number", start: 0, end: 3, color: "bg-amber-500/30 text-amber-300 border-amber-500", description: "Binary format magic bytes (0x00 'a' 's' 'm')", decodedValue: "\\0asm (0x6D736100)" },
      { name: "Wasm Version", start: 4, end: 7, color: "bg-blue-500/30 text-blue-300 border-blue-500", description: "WebAssembly binary specification edition", decodedValue: "Version 1 (0x00000001)" },
      { name: "Type Section Header", start: 8, end: 9, color: "bg-purple-500/30 text-purple-300 border-purple-500", description: "Section ID 1 (Type Section), payload length 5 bytes", decodedValue: "Section ID 0x01 (Length 5)" },
      { name: "Code Section Header", start: 19, end: 20, color: "bg-emerald-500/30 text-emerald-300 border-emerald-500", description: "Section ID 10 (Code Section) containing bytecode instructions", decodedValue: "Section ID 0x0A (Code Bodies)" },
    ],
  },
  {
    id: "zip",
    name: "ZIP / APK Local Header",
    format: "ZIP",
    bytes: [
      0x50, 0x4b, 0x03, 0x04, // 0x00-0x03: PK\x03\x04 Local file header signature
      0x14, 0x00,             // 0x04-0x05: Version needed to extract (2.0)
      0x00, 0x00,             // 0x06-0x07: General purpose bit flag
      0x08, 0x00,             // 0x08-0x09: Compression method (8 = Deflate)
      0x00, 0x40, 0x6e, 0x59, // 0x0A-0x0D: Last mod file time and date
      0x12, 0x34, 0x56, 0x78, // 0x0E-0x11: CRC-32 checksum
      0x20, 0x00, 0x00, 0x00, // 0x12-0x15: Compressed size (32 bytes)
      0x35, 0x00, 0x00, 0x00, // 0x16-0x19: Uncompressed size (53 bytes)
      0x09, 0x00,             // 0x1A-0x1B: File name length (9 bytes)
      0x00, 0x00,             // 0x1C-0x1D: Extra field length
      0x70, 0x72, 0x6f, 0x62, 0x65, 0x2e, 0x74, 0x78, 0x74, // "probe.txt"
    ],
    fields: [
      { name: "PK Local Signature", start: 0, end: 3, color: "bg-amber-500/30 text-amber-300 border-amber-500", description: "ZIP / Android APK archive record marker (0x50 0x4B 0x03 0x04)", decodedValue: "'PK\\x03\\x04' (0x04034B50)" },
      { name: "Extract Version", start: 4, end: 5, color: "bg-cyan-500/30 text-cyan-300 border-cyan-500", description: "Minimum ZIP version required for decompression", decodedValue: "2.0 (Deflate compatible)" },
      { name: "Compression Method", start: 8, end: 9, color: "bg-purple-500/30 text-purple-300 border-purple-500", description: "Algorithm used for payload storage (0x0008 = DEFLATE)", decodedValue: "0x0008 (Deflate Algorithm)" },
      { name: "CRC-32 Checksum", start: 14, end: 17, color: "bg-red-500/30 text-red-300 border-red-500", description: "Cyclic redundancy check for verifying payload integrity", decodedValue: "0x78563412" },
      { name: "File Name ('probe.txt')", start: 30, end: 38, color: "bg-emerald-500/30 text-emerald-300 border-emerald-500", description: "UTF-8 filename string stored in local header record", decodedValue: "\"probe.txt\" (9 ASCII bytes)" },
    ],
  },
];

export function HexInspector() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("elf64");
  const [activeFieldIndex, setActiveFieldIndex] = useState<number | null>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const preset = useMemo(() => {
    return PRESET_BINARIES.find((p) => p.id === selectedPresetId) || PRESET_BINARIES[0];
  }, [selectedPresetId]);

  const activeField = activeFieldIndex !== null ? preset.fields[activeFieldIndex] : null;

  // Format bytes into 16-byte rows
  const rows = useMemo(() => {
    const list: Array<{ offset: number; hexTokens: Array<{ byte: number; idx: number }>; ascii: string }> = [];
    for (let i = 0; i < preset.bytes.length; i += 16) {
      const slice = preset.bytes.slice(i, i + 16);
      const hexTokens = slice.map((b, relativeIdx) => ({ byte: b, idx: i + relativeIdx }));
      const ascii = slice.map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : ".")).join("");
      list.push({ offset: i, hexTokens, ascii });
    }
    return list;
  }, [preset.bytes]);

  const handleCopyHex = async () => {
    const hexString = preset.bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ");
    try {
      await navigator.clipboard.writeText(hexString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const getByteField = (idx: number): FieldMapping | undefined => {
    return preset.fields.find((f) => idx >= f.start && idx <= f.end);
  };

  return (
    <div className="flex flex-col h-full bg-[#111622] text-neutral-200 font-mono text-xs select-text">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0A0E17] border-b border-neutral-800 shrink-0">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-[#FAFF00]" />
          <span className="font-bold uppercase tracking-wider text-white text-[11px]">
            Binary Structure &amp; Hex Inspector
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-400 font-bold">
            {preset.format}
          </span>
        </div>

        {/* Preset Select Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {PRESET_BINARIES.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPresetId(p.id);
                setActiveFieldIndex(0);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors whitespace-nowrap ${
                selectedPresetId === p.id
                  ? "bg-[#FAFF00] text-black"
                  : "bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700"
              }`}
            >
              {p.format}
            </button>
          ))}

          <button
            onClick={handleCopyHex}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 ml-1"
            title="Copy raw hex bytes"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied" : "Copy Hex"}</span>
          </button>
        </div>
      </div>

      {/* Main Hex Grid + Field Details Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Structure Legend (Clickable Field Badges) */}
        <div>
          <div className="text-[10px] uppercase font-bold text-neutral-500 mb-2 flex items-center gap-1.5">
            <Layers className="w-3 h-3" />
            <span>Interactive Format Template Overlay (Click to Inspect)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {preset.fields.map((f, idx) => {
              const isSelected = activeFieldIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveFieldIndex(idx)}
                  className={`px-2.5 py-1 rounded-md border text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "ring-2 ring-white border-white bg-white/20 text-white shadow-sm"
                      : "border-neutral-700 bg-neutral-900/60 text-neutral-400 hover:text-white hover:border-neutral-500"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${f.color.split(" ")[0]}`} />
                  <span>{f.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Field Interpretation Card */}
        {activeField && (
          <div className="p-3 bg-neutral-900/90 border border-neutral-700 rounded-xl space-y-1.5 text-neutral-300">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#FAFF00]" />
                {activeField.name}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                Byte Offset: 0x{activeField.start.toString(16).toUpperCase().padStart(2, "0")} - 0x
                {activeField.end.toString(16).toUpperCase().padStart(2, "0")} ({activeField.end - activeField.start + 1} bytes)
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 font-sans">
              {activeField.description}
            </div>
            <div className="pt-1 border-t border-neutral-800 flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-bold">Decoded Value:</span>
              <code className="text-[#FAFF00] font-bold">{activeField.decodedValue}</code>
            </div>
          </div>
        )}

        {/* Raw Hex Table */}
        <div className="border border-neutral-800 rounded-xl bg-black/60 p-3 overflow-x-auto">
          <div className="text-neutral-500 font-bold text-[10px] pb-1 border-b border-neutral-800 mb-2 grid grid-cols-[80px_1fr_140px] gap-3">
            <span>OFFSET</span>
            <span>HEX BYTES (00 - 0F)</span>
            <span>ASCII DUMP</span>
          </div>

          <div className="space-y-1 leading-relaxed">
            {rows.map((row) => (
              <div key={row.offset} className="grid grid-cols-[80px_1fr_140px] gap-3 items-center">
                {/* Offset column */}
                <span className="text-neutral-500 select-none font-bold">
                  {row.offset.toString(16).padStart(8, "0").toUpperCase()}:
                </span>

                {/* Hex Bytes column */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {row.hexTokens.map(({ byte, idx }) => {
                    const field = getByteField(idx);
                    const isActive = activeField && idx >= activeField.start && idx <= activeField.end;
                    const hexStr = byte.toString(16).padStart(2, "0").toUpperCase();

                    return (
                      <span
                        key={idx}
                        onClick={() => {
                          const fIdx = preset.fields.findIndex((f) => idx >= f.start && idx <= f.end);
                          if (fIdx !== -1) setActiveFieldIndex(fIdx);
                        }}
                        className={`px-1 py-0.5 rounded cursor-pointer transition-all ${
                          isActive
                            ? "bg-[#FAFF00] text-black font-black scale-105 shadow-xs"
                            : field
                            ? `${field.color} hover:ring-1 hover:ring-white`
                            : "text-neutral-400 hover:text-white"
                        }`}
                        title={field ? `${field.name} (Offset 0x${idx.toString(16).toUpperCase()})` : `Byte 0x${idx.toString(16)}`}
                      >
                        {hexStr}
                      </span>
                    );
                  })}
                </div>

                {/* ASCII preview */}
                <span className="text-neutral-400 tracking-wider">
                  {row.ascii}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
