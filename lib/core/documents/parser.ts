import { ISolrDocument } from './solrDocument';

export interface IDocumentParser<T extends string | Document> {
  baseBlogUrl: string;
  parse: (document: string, documentName: string) => ISolrDocument;
  parserConfig: ParserConfig<T>;
}

export interface ParserConfig<T extends string | Document> {
  parseTitle: (this: MetadataObj, document: T) => string;
  parseDate: (this: MetadataObj, document: T) => Date | null;
  parseTags: (this: MetadataObj, document: T) => string[];
  parseSections: (this: MetadataObj, document: T) => string[];
  parseSummary: (this: MetadataObj, document: T) => string;
  parseParagraphs: (this: MetadataObj, document: T) => string[];
  parseSnippets: (this: MetadataObj, document: T) => string[];
}

export type MetadataObj = {
  [key: string]: string;
};

export type StringParserConfigOptions = Partial<ParserConfig<string>>;
export type DocumentParserConfigOptions = Partial<ParserConfig<Document>>;
