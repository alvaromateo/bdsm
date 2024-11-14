import { IDocumentParser, ParserConfig } from '../parser';
import { ISolrDocument, SolrDocument } from '../solrDocument';

export type ParserConfigOptions = Partial<ParserConfig<Document>>;

export default class HtmlParser implements IDocumentParser<Document> {
  baseBlogUrl: string;
  parserConfig: ParserConfig<Document>;

  constructor(baseBlogUrl: string, configOptions?: ParserConfigOptions) {
    this.baseBlogUrl = baseBlogUrl;
    // remove last slash if present
    if (this.baseBlogUrl.lastIndexOf('/') === this.baseBlogUrl.length - 1) {
      this.baseBlogUrl = this.baseBlogUrl.slice(0, -1);
    }
    this.parserConfig = { ...defaultHtmlParserConfig, ...configOptions };
  }

  parse(document: string, documentName: string): ISolrDocument {
    const documentObj = new DOMParser().parseFromString(document, 'text/html');
    const title = this.parserConfig.parseTitle(documentObj);
    const date = this.parserConfig.parseDate(documentObj);
    const tags = this.parserConfig.parseTags(documentObj);
    const sections = this.parserConfig.parseSections(documentObj);
    const summary = this.parserConfig.parseSummary(documentObj);
    const paragraphs = this.parserConfig.parseParagraphs(documentObj);
    const snippets = this.parserConfig.parseSnippets(documentObj);

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

const defaultHtmlParserConfig: ParserConfig<Document> = {
  /**
   * This method extracts the title of a post written in HTML.
   * To do so the HTML needs to contain an element with the following attribute.
   *
   * ```html
   * <h1 data-bdsm="title">Post title</h1>
   * ```
   *
   * The method will extract and return the inner text of the element.
   *
   * @param document a parsed Document object of the full post HTML text.
   * @returns the title of the post.
   */
  parseTitle: (document: Document): string => {
    const element = document.querySelector('[data-bdsm="title"]');
    return '';
  },

  /**
   * This method extracts the date when the post was written.
   * To do so the HTML needs to contain an element with the following attribute.
   *
   * ```html
   * <p data-bdsm="date">YYYY-MM-DDTHH:mm:ss.sssZ</p>
   * ```
   *
   * The method will extract and return a Date object from the inner text of the element.
   * The date format needs to be a valid ECMAScript Date Time String.
   *
   * @param document a parsed Document object of the full post HTML text.
   * @returns the date of the post.
   */
  parseDate: (document: Document): Date => {
    return new Date();
  },

  /**
   * This method extracts the tags applied to the post.
   * To do so it needs an HTML list marked as follows.
   *
   * ```html
   * <ul data-bdsm="tags">
   *  <li>tag1</li>
   *  <li>tag2</li>
   * </ul>
   * ```
   *
   * The method will extract and return a list with each tag found in "li" elements inside the list.
   *
   * @param document a parsed Document object of the full post HTML text.
   * @returns the tags of the post.
   */
  parseTags: (document: Document): string[] => {
    return [];
  },

  /**
   * This method extracts the headings of a post, excluding the main title.
   * It takes any <hX> element without the data-bdsm="title" attribute. Example:
   *
   * ```html
   * <h2>This is a subtitle</h2>
   * <p>Random text</p>
   * <h3>Nested section</h3>
   * ```
   *
   * The above would return a list with ['This is a subtitle', 'Nested section'].
   *
   * @param document a parsed Document object of the full post HTML text.
   * @returns the sections of the post, which consist of each of the headings it has.
   */
  parseSections: (document: Document): string[] => {
    return [];
  },

  /**
   * This method extracts the summary/introduction of the HTML post.
   * This has to consist of a paragraph only (it's supposed to be a short excerpt). To do so,
   * this method looks for an HTML element with the following attribute.
   *
   * ```html
   * <h2>This is a subtitle</h2>
   * <p>Random text</p>
   * <h3>Nested section</h3>
   * ```
   *
   * The method returns a string with the post introduction.
   *
   * @param document a parsed Document object of the full post HTML text.
   * @returns the summary/introduction of the post.
   */
  parseSummary: (document: Document): string => {
    return '';
  },

  /**
   * This method extracts all the text paragraphs of a post written in HTML.
   * It returns a list of the text found inside any <p> element of the HTML document.
   *
   * @param document a parsed Document object of the full post HTML text.
   * @returns all the paragraphs of the post.
   */
  parseParagraphs: (document: Document): string[] => {
    return [];
  },

  /**
   * This method extracts all the code snippets found in a post.
   * To do so it gets all the text from inside <code> elements.
   *
   * @param document a parsed Document object of the full post HTML text.
   * @returns all the code snippets present, if any.
   */
  parseSnippets: (document: Document): string[] => {
    return [];
  },
};
