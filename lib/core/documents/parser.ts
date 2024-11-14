import { ISolrDocument } from './solrDocument';

export interface IDocumentParser<T extends string | Document> {
  baseBlogUrl: string;
  parse: (document: string, documentName: string) => ISolrDocument;
  parserConfig: ParserConfig<T>;
}

export interface ParserConfig<T extends string | Document> {
  parseTitle: (document: T) => string;
  parseDate: (document: T) => Date;
  parseTags: (document: T) => string[];
  parseSections: (document: T) => string[];
  parseSummary: (document: T) => string;
  parseParagraphs: (document: T) => string[];
  parseSnippets: (document: T) => string[];
}

export type MetadataObj = {
  [key: string]: string;
};
