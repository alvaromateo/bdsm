export interface ISolrDocument {
  url: string;
  title: string;
  date: Date | null;
  tags: string[];
  sections: string[];
  summary: string;
  paragraphs: string[];
  snippets: string[];
}

export class SolrDocument implements ISolrDocument {
  url: string;
  title: string;
  date: Date | null;
  tags: string[];
  sections: string[];
  summary: string;
  paragraphs: string[];
  snippets: string[];

  /**
   * Constructor for an empty SolrDocument.
   *
   * @param url the only mandatory field, as it is the minimum id required for Solr
   */
  constructor(
    url: string,
    title?: string,
    date?: Date | null,
    tags?: string[],
    sections?: string[],
    summary?: string,
    paragraphs?: string[],
    snippets?: string[],
  ) {
    this.url = url;
    this.title = title || '';
    this.date = date || null;
    this.tags = tags || [];
    this.sections = sections || [];
    this.summary = summary || '';
    this.paragraphs = paragraphs || [];
    this.snippets = snippets || [];
  }
}
