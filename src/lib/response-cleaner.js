/**
 * Cleans up corrupted or malformed AI responses
 * @param {string} rawContent - The raw response content
 * @returns {string} - Cleaned content
 */
export function cleanAIResponse(rawContent) {
  if (!rawContent || typeof rawContent !== 'string') {
    return '';
  }

  let cleaned = rawContent;

  // Remove common corruption patterns
  const cleanupPatterns = [
    // Remove $ ? ? ? patterns
    { pattern: /\$\s*\?\s*\?\s*\?\s*/g, replacement: '$' },

    // Clean up bold text with trailing dots (but preserve chart references)
    { pattern: /\*\*([^*]+)\*\*\s*\.{3,}(?!.*chart|visual|graph)/gi, replacement: '**$1**' },

    // Replace excessive dots with proper ellipsis
    { pattern: /\.{4,}/g, replacement: '...' },
    { pattern: /…{2,}/g, replacement: '…' },

    // Fix spacing issues
    { pattern: /\s{3,}/g, replacement: ' ' },

    // Remove fragmented words with ellipsis
    { pattern: /(\w+)…(\w+)…(\w+)…/g, replacement: '$1 $2 $3' },

    // Remove error messages and apologies
    { pattern: /Sorry[.\s…]*It (looks|appears)[.\s…]*/gi, replacement: '' },
    { pattern: /Oops[!\s….]*/gi, replacement: '' },
    { pattern: /Apologies[.\s…]*for[.\s…]*the[.\s…]*glitch[.\s…]*/gi, replacement: '' },

    // Remove fragmented sentences
    { pattern: /We…[.\s…]*The…[.\s…]*/gi, replacement: '' },
    { pattern: /Okay…[.\s…]*/gi, replacement: '' },
    { pattern: /The…[.\s…]*We…[.\s…]*/gi, replacement: '' },

    // Remove empty parentheses with dots
    { pattern: /\([.\s…]*\)/g, replacement: '' },

    // Remove standalone dots and ellipsis
    { pattern: /^\s*[.…]+\s*$/gm, replacement: '' },

    // Remove lines with only repeated characters
    { pattern: /^[.\s…]{10,}$/gm, replacement: '' },
  ];

  // Apply all cleanup patterns
  cleanupPatterns.forEach(({ pattern, replacement }) => {
    cleaned = cleaned.replace(pattern, replacement);
  });

  // Try to extract clean content after error recovery messages
  const recoveryPatterns = [
    /(?:Apologies for the glitch\.|Let me provide a clean response\.)\s*([\s\S]*)/i,
    /(?:Here's the corrected|Here's the clean|Let me try again)\s*[:\-]?\s*([\s\S]*)/i,
  ];

  for (const pattern of recoveryPatterns) {
    const match = cleaned.match(pattern);
    if (match && match[1].trim().length > 50) { // Only use if substantial content
      cleaned = match[1].trim();
      break;
    }
  }

  // Final cleanup
  cleaned = cleaned
    .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
    .replace(/^\s+|\s+$/g, '') // Trim whitespace
    .replace(/\s+([.!?])/g, '$1'); // Fix spacing before punctuation

  return cleaned;
}

/**
 * Validates if the response seems severely corrupted
 * @param {string} content - The content to validate
 * @returns {boolean} - True if content seems severely corrupted
 */
export function isResponseCorrupted(content) {
  if (!content || typeof content !== 'string') {
    return true;
  }

  // Only flag as corrupted if there are severe issues
  const severeCorruptionIndicators = [
    /\?\s*\?\s*\?\s*\?\s*\?/, // Many question marks (5+)
    /\.{15,}/, // Excessive dots (15+)
    /…{8,}/, // Excessive ellipsis (8+)
    /Sorry.*It (looks|appears).*Oops.*Apologies/i, // Multiple error patterns
    /We….*The….*Okay….*Sorry…/i, // Multiple fragmented sentences
  ];

  return severeCorruptionIndicators.some(pattern => pattern.test(content));
}