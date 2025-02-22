const MALFORMED_MSG = 'Malformed HTML/XML text: ';

/**
 * This method gets a string containing a text which may have some HTML/XML tags
 * and returns only the plain text without any tags. Example:
 * For input -> 'This is <em>important<em>!'
 * The output is -> 'This is important!'
 *
 * It handles nested tags. Example:
 * For input -> '<div>This is <em>important<em>!</div>'
 * The output is -> 'This is important!'
 *
 * It runs in O(n) where n is the length of the text.
 *
 * @param text a text containing possible HTML/XML tags.
 * @returns the plain text having removed all the nested tags.
 */
export const getTextWithoutTags = (text: string): string => {
  const stack: string[] = [];
  let index = 0;
  let resultIndex = 0;
  const result: string[] = new Array(text.length);

  while (index < text.length) {
    if (text[index] === '<') {
      if (index + 1 >= text.length) {
        throw SyntaxError(MALFORMED_MSG + '< character without proper tag definition.');
      }

      if (text[index + 1] === '/') {
        // closing an open tag
        const tagName = getTagName(text, index + 2);
        if (stack.length === 0) {
          throw SyntaxError(MALFORMED_MSG + 'found closing tag without its opening match.');
        }
        const topTag = stack.pop()!;
        if (topTag !== tagName) {
          // mismatched tags
          throw SyntaxError(
            MALFORMED_MSG + `mismatched tags { open: ${topTag}, close: ${tagName} }.`,
          );
        }
        index = getMatchingEnd(text, index + 2);
      } else {
        // opening a new tag
        const tagName = getTagName(text, index + 1);
        const endTag = getMatchingEnd(text, index + 1 + tagName.length);
        // if it's a self closing tag don't push it to the stack
        if (text[endTag - 1] !== '/') {
          stack.push(tagName);
        }
        index = endTag;
      }
    } else {
      result[resultIndex++] = text[index];
    }
    ++index;
  }

  return result.slice(0, resultIndex).join('');
};

/**
 * HTML/XML can have opening and closing tags, which in time they can have
 * some attributes. Thus we have to consider the character '"', as it could contain
 * a character '>' inside which is not a valid ending for the tag. Every time one
 * of these appears we need to find the closing match.
 *
 * @param text input text containing at least an HTML/XML tag.
 * @param start the index at which to start looking.
 */
export const getMatchingEnd = (text: string, start: number = 0): number => {
  let index = start;
  let found = false;
  let insideQuotes = false;

  while (!found && index < text.length) {
    if (text[index] === '"') {
      insideQuotes = !insideQuotes;
    }

    // anything can go while inside quotes
    if (text[index] === '>' && !insideQuotes) {
      found = true;
    } else {
      ++index;
    }
  }

  if (index === text.length && !found) {
    // missing end tag
    throw SyntaxError(MALFORMED_MSG + 'tag missing closing.');
  }
  return index;
};

const endTagNameChars = new Set(['\t', '\n', '\v', '\r', '\f', ' ', '/', '>']);

export const getTagName = (text: string, start: number = 0): string => {
  let index = start;
  const startName = index;
  // then get the name characters
  while (index < text.length && !endTagNameChars.has(text[index])) {
    ++index;
  }
  if (startName === index) {
    // invalid tag name
    throw SyntaxError(
      MALFORMED_MSG + "after opening tag character '<' there needs to come a valid tag name.",
    );
  }
  return text.slice(startName, index);
};

export const advanceUntilEndOfCodeBlock = (lines: string[], lineNum: number): number => {
  let index = lineNum;
  let line = lines[index];
  while (!line.match(RegexConstants.codeBlock)) {
    ++index;
    line = lines[index];
  }
  return index;
};

export const RegexConstants = {
  emptyLine: /^\s*$/m,
  newLine: /\r?\n|\r|\n/g,
  metadataKey: /[a-zA-Z0-9]/,
  section: /\s*##+\s*(.+)$/gm,
  title: /\s*#\s*(.+)$/,
  codeBlock: /^\s*```/,
};
