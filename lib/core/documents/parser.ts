import { SolrDocument } from './solrDocument';

export interface IDocumentParser {
  baseBlogUrl: string;
  parse: (document: string) => SolrDocument;
  parserConfig: ParserConfig;
}

export interface ParserConfig {
  parseTitle: () => string;
  parseDate: () => Date;
  parseTags: () => string[];
  parseSections: () => string[];
  parseSummary: () => string;
  parseParagraphs: () => string[];
  parseSnippets: () => string[];
}

export type MetadataObj = {
  [key: string]: string;
};
