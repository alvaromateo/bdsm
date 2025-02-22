import { IDocumentParser, ParserConfig, StringParserConfigOptions } from '../parser';
import { ISolrDocument, SolrDocument } from '../solrDocument';
import { getTextWithoutTags, RegexConstants } from '../utils';

export default class MultiMarkdownParser implements IDocumentParser<string> {
  baseBlogUrl: string;
  parserConfig: ParserConfig<string>;

  constructor(baseBlogUrl: string, configOptions?: StringParserConfigOptions) {
    this.baseBlogUrl = baseBlogUrl;
    // remove last slash if present
    if (this.baseBlogUrl.lastIndexOf('/') === this.baseBlogUrl.length - 1) {
      this.baseBlogUrl = this.baseBlogUrl.slice(0, -1);
    }
    this.parserConfig = { ...defaultMultiMarkdownParserConfig, ...configOptions };
  }

  parse(document: string, documentName: string): ISolrDocument {
    const metadata = extractMultiMarkdownMetadata(document);
    let doc = document;
    if (Object.keys(metadata).length > 0) {
      const metadataEndMatch = RegexConstants.emptyLine.exec(document);
      doc = document.slice(metadataEndMatch ? metadataEndMatch.index + 1 : 0);
    }

    const title = this.parserConfig.parseTitle.call(metadata, doc);
    const date = this.parserConfig.parseDate.call(metadata, doc);
    const tags = this.parserConfig.parseTags.call(metadata, doc);
    const summary = this.parserConfig.parseSummary.call(metadata, doc);
    const sections = this.parserConfig.parseSections.call(metadata, doc);
    const paragraphs = this.parserConfig.parseParagraphs.call(metadata, doc);
    const snippets = this.parserConfig.parseSnippets.call(metadata, doc);

    return new SolrDocument(
      `${this.baseBlogUrl}/${documentName}`,
      title,
      date,
      tags,
      sections,
      summary,
      paragraphs,
      snippets,
    );
  }
}

export const extractMultiMarkdownMetadata = (markdown: string) => {
  const match = RegexConstants.emptyLine.exec(markdown);
  const metadata: { [key: string]: string } = {};
  if (match) {
    const metadataLines = markdown
      .slice(0, match.index)
      .split(RegexConstants.newLine)
      .filter((line) => !(line.startsWith('---') || line.startsWith('...') || line.length === 0));
    let key = '';
    for (const line of metadataLines) {
      const keyMatch = RegexConstants.metadataKey.exec(line);
      if (keyMatch && line.indexOf(':') !== -1) {
        // if there's no match, continue appending the value to the previous key
        key = line.slice(0, line.indexOf(':'));
      }
      const value = line.slice(line.indexOf(':') + 1).trim();
      if (Object.hasOwnProperty.call(metadata, key)) {
        metadata[key] = metadata[key] + value;
      } else {
        if (key.length > 0) {
          metadata[key] = value;
        }
      }
    }
  }
  return metadata;
};

/**
 * The default parser uses the MultiMarkdown Metadata, which consists on
 * several key-values starting at the beginning of the document and finishes
 * when the first blank line is found. Example:
 *
 * ```markdown
 * title:  sample title
 * date:   2025-01-03
 *
 * Markdown document after the first blank line.
 * ```
 */
const defaultMultiMarkdownParserConfig: ParserConfig<string> = {
  /**
   * Extracts the title of a post written in MultiMarkdown.
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
   * Extracts the date of a post written in MultiMarkdown.
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
   * Extracts the tags of a post written in MultiMarkdown.
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
   * Extracts the sections of a post written in MultiMarkdown. The sections
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
   * Extracts the summary of a post written in MultiMarkdown.
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
   * This method extracts all the code snippets found in a post.
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

function advanceUntilEndOfCodeBlock(lines: string[], lineNum: number): number {
  let index = lineNum;
  let line = lines[index];
  while (!line.match(RegexConstants.codeBlock)) {
    ++index;
    line = lines[index];
  }
  return index;
}
