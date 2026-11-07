const textEncoder = new TextEncoder();

/**
 * Returns the exact UTF-8 byte length of a string.
 * Essential for accurate QR capacity estimation across multilingual scripts
 * (Sinhala, Tamil, Japanese, Arabic, Emoji).
 */
export function getUtf8ByteLength(value: string): number {
  return textEncoder.encode(value).byteLength;
}

/**
 * Converts a JavaScript UTF-16 string into a binary string where each character code
 * (0x00–0xFF) represents one UTF-8 byte.
 *
 * Why this is required:
 * `qr-code-styling` uses `qrcode-generator`'s default `stringToBytes` implementation,
 * which reads `str.charCodeAt(i) & 0xFF` in Byte mode without UTF-8 encoding.
 * Pre-encoding into a UTF-8 binary string ensures multi-byte scripts (Sinhala, Tamil,
 * Japanese, Arabic, Emoji) are written into the QR bitstream as valid UTF-8 octets.
 */
export function encodeUtf8ToBinaryString(value: string): string {
  const bytes = textEncoder.encode(value);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return binary;
}

/**
 * Returns the Unicode code point count (grapheme-safe character count for emojis/surrogates)
 * rather than UTF-16 code unit length.
 */
export function getCharacterCount(value: string): number {
  return Array.from(value).length;
}

/**
 * Normalizes all CRLF and CR line breaks to LF (\n).
 */
export function normalizeNewlines(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

/**
 * Folds a single content line at maxOctets (default 75 bytes per RFC 2426 / RFC 5545)
 * using CRLF + single space ("\r\n "), ensuring multi-byte UTF-8 characters are never
 * split mid-sequence.
 */
export function foldUtf8Line(line: string, maxOctets = 75): string {
  if (getUtf8ByteLength(line) <= maxOctets) {
    return line;
  }

  const segments: string[] = [];
  let currentSegment = "";
  let currentBytes = 0;

  for (const char of Array.from(line)) {
    const charBytes = getUtf8ByteLength(char);
    const limit = segments.length === 0 ? maxOctets : maxOctets - 1;

    if (currentBytes + charBytes > limit && currentSegment.length > 0) {
      segments.push(currentSegment);
      currentSegment = char;
      currentBytes = charBytes;
    } else {
      currentSegment += char;
      currentBytes += charBytes;
    }
  }

  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  return segments.join("\r\n ");
}
