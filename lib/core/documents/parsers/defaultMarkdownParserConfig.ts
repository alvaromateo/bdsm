import { ParserConfig } from '../parser';
import { advanceUntilEndOfCodeBlock, getTextWithoutTags, RegexConstants } from '../utils';

/**
 * The default parser uses the Markdown Metadata, extracted by each specific parser
 * and passed in the 'this' property of the parser configuration.
 * Example (MultiMarkdown):
 *
 * ```markdown
 * title:  sample title
 * date:   2025-01-03
 *
 * Markdown document after the first blank line.
 * ```
 */
export const defaultMarkdownParserConfig: ParserConfig<string> = {
  /**
   * Extracts the title of a post written in Markdown.
   * To extract the title, the metadata needs to contain a key named
   * "title".
   *
   * @param document the markdown file.
   * @returns the title of the post.
   */
  parseTitle: function (): string {
    return getTextWithoutTags(this.title || '');
  },

  /**
   * Extracts the date of a post written in Markdown.
   * To extract the date, the metadata needs to contain a key named
   * "date".
   *
   * @param document the markdown file.
   * @returns the date of the post.
   */
  parseDate: function (): Date | null {
    const dateString = getTextWithoutTags(this.date || '');
    return dateString ? new Date(dateString) : null;
  },

  /**
   * Extracts the tags of a post written in Markdown.
   * To extract the tags, the metadata needs to contain a key named
   * "tags". The tags are separated by the character '|'.
   *
   * @param document the markdown file.
   * @returns the tags of the post.
   */
  parseTags: function (): string[] {
    const tagElements = this.tags && this.tags.length > 0 ? this.tags.split('|') : [];
    const tags = [];
    for (const tag of tagElements) {
      tags.push(getTextWithoutTags(tag.trim()));
    }
    return tags;
  },

  /**
   * Extracts the sections of a post written in Markdown. The sections
   * are the headings and subheadings (in markdown they start with '#' characters).
   *
   * @param document the markdown file.
   * @returns the sections of the post, which consist of each of the headings it has.
   */
  parseSections: function (document: string): string[] {
    const elements = document.matchAll(RegexConstants.section);
    const headings = [];
    for (const heading of elements || []) {
      if (heading.length == 2) {
        // get the match, which is the heading
        headings.push(getTextWithoutTags(heading[1].trim()));
      }
    }
    return headings;
  },

  /**
   * Extracts the summary of a post written in Markdown.
   * To extract the summary, the metadata must contain a key named
   * "summary".
   *
   * @param document the markdown file.
   * @returns the summary/introduction of the post.
   */
  parseSummary: function (): string {
    return getTextWithoutTags(this.summary || '').trim();
  },

  /**
   * This method extracts all the text paragraphs of a post written in Markdown.
   *
   * @param document the markdown file.
   * @returns all the paragraphs of the post.
   */
  parseParagraphs: function (document: string): string[] {
    const lines = document.split(RegexConstants.newLine);
    const paragraphs = [];

    let lineNum = 0;
    let insideParagraph = false;
    let paragraph = '';
    while (lineNum < lines.length) {
      const line = lines[lineNum];
      if (line.match(RegexConstants.codeBlock)) {
        lineNum = advanceUntilEndOfCodeBlock(lines, lineNum + 1);
      }
      if (line.match(RegexConstants.section) || line.match(RegexConstants.title)) {
        insideParagraph = false;
      }
      if (line.match(RegexConstants.emptyLine)) {
        insideParagraph = !insideParagraph;
        if (paragraph.length > 0 && !insideParagraph) {
          paragraphs.push(getTextWithoutTags(paragraph).trim());
          paragraph = '';
        }
      } else {
        if (insideParagraph) {
          paragraph += line + '\n';
        }
      }
      lineNum++;
    }

    return paragraphs;
  },

  /**
   * This method extracts all the code snippets found in a post written in Markdown.
   * To do so it gets all the text inside triple quotes (```).
   *
   * @param document the markdown file.
   * @returns all the code snippets present, if any.
   */
  parseSnippets: function (document: string): string[] {
    const lines = document.split(RegexConstants.newLine);
    const snippets = [];

    let lineNum = 0;
    let insideSnippet = false;
    let snippet = '';
    while (lineNum < lines.length) {
      const line = lines[lineNum];
      if (line.match(RegexConstants.codeBlock)) {
        insideSnippet = !insideSnippet;
        if (snippet.length > 0) {
          snippets.push(getTextWithoutTags(snippet).trim());
          snippet = '';
        }
      } else {
        if (insideSnippet) {
          snippet += line + '\n';
        }
      }
      lineNum++;
    }

    return snippets;
  },
};
