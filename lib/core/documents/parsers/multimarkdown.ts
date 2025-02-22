import { IDocumentParser, MetadataObj, ParserConfig, StringParserConfigOptions } from '../parser';
import { ISolrDocument, SolrDocument } from '../solrDocument';
import { RegexConstants } from '../utils';
import { defaultMarkdownParserConfig } from './defaultMarkdownParserConfig';

export default class MultiMarkdownParser implements IDocumentParser<string> {
  baseBlogUrl: string;
  parserConfig: ParserConfig<string>;

  constructor(baseBlogUrl: string, configOptions?: StringParserConfigOptions) {
    this.baseBlogUrl = baseBlogUrl;
    // remove last slash if present
    if (this.baseBlogUrl.lastIndexOf('/') === this.baseBlogUrl.length - 1) {
      this.baseBlogUrl = this.baseBlogUrl.slice(0, -1);
    }
    this.parserConfig = { ...defaultMarkdownParserConfig, ...configOptions };
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
  const metadata: MetadataObj = {};
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
