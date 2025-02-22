import { IDocumentParser, ParserConfig, MetadataObj, StringParserConfigOptions } from '../parser';
import { ISolrDocument, SolrDocument } from '../solrDocument';
import { RegexConstants } from '../utils';
import { defaultMarkdownParserConfig } from './defaultMarkdownParserConfig';

export default class FrontMatterParser implements IDocumentParser<string> {
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
    const metadata = extractYamlMetadata(document);
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

export const extractYamlMetadata = (markdown: string) => {
  const charactersBetweenGroupedHyphens = /^---([\s\S]*?)---/;
  const metadataMatched = markdown.match(charactersBetweenGroupedHyphens);
  let metadata: string | null = null;

  if (metadataMatched) {
    metadata = metadataMatched[1];
  }
  if (!metadata) {
    return {};
  }

  const metadataLines = metadata.split('\n');
  const metadataObject: MetadataObj = metadataLines.reduce((accumulator, line) => {
    const [key, ...value] = line.split(':').map((part) => part.trim());
    if (key) {
      accumulator[key] = value[1] ? value.join(':') : value.join('');
    }
    return accumulator;
  }, {} as MetadataObj);

  return metadataObject;
};
