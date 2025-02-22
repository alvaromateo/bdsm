import { IDocumentParser, ParserConfig, DocumentParserConfigOptions } from '../parser';
import { ISolrDocument, SolrDocument } from '../solrDocument';
import { getTextWithoutTags } from '../utils';
import { JSDOM } from 'jsdom';

export default class HtmlParser implements IDocumentParser<Document> {
  baseBlogUrl: string;
  parserConfig: ParserConfig<Document>;

  constructor(baseBlogUrl: string, configOptions?: DocumentParserConfigOptions) {
    this.baseBlogUrl = baseBlogUrl;
    // remove last slash if present
    if (this.baseBlogUrl.lastIndexOf('/') === this.baseBlogUrl.length - 1) {
      this.baseBlogUrl = this.baseBlogUrl.slice(0, -1);
    }
    this.parserConfig = { ...defaultHtmlParserConfig, ...configOptions };
  }

  parse(document: string, documentName: string): ISolrDocument {
    let documentObj: Document | undefined;
    try {
      documentObj = new JSDOM(document).window.document;
    } catch (error) {
      console.error(`Could not parse ${documentName}:`, error);
      return new SolrDocument(`${this.baseBlogUrl}/${documentName}`);
    }

    const title = this.parserConfig.parseTitle.call({}, documentObj);
    const date = this.parserConfig.parseDate.call({}, documentObj);
    const tags = this.parserConfig.parseTags.call({}, documentObj);
    const sections = this.parserConfig.parseSections.call({}, documentObj);
    const summary = this.parserConfig.parseSummary.call({}, documentObj);
    const paragraphs = this.parserConfig.parseParagraphs.call({}, documentObj);
    const snippets = this.parserConfig.parseSnippets.call({}, documentObj);

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
  parseTitle: function (document: Document): string {
    const element = document.querySelector('[data-bdsm="title"]');
    return getTextWithoutTags(element?.innerHTML || '');
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
  parseDate: function (document: Document): Date | null {
    const element = document.querySelector('[data-bdsm="date"]');
    const dateString = getTextWithoutTags(element?.innerHTML || '');
    return dateString ? new Date(dateString) : null;
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
  parseTags: function (document: Document): string[] {
    const element = document.querySelector('[data-bdsm="tags"]');
    const tagElements = element?.querySelectorAll('li');
    const tags = [];
    for (const tag of tagElements || []) {
      if (tag.innerHTML) {
        tags.push(getTextWithoutTags(tag.innerHTML));
      }
    }
    return tags;
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
  parseSections: function (document: Document): string[] {
    const elements = Array.from(
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').values(),
    ).filter((elem) => elem.getAttribute('data-bdsm') !== 'title');
    const headings = [];
    for (const heading of elements || []) {
      if (heading.innerHTML) {
        headings.push(getTextWithoutTags(heading.innerHTML));
      }
    }
    return headings;
  },

  /**
   * This method extracts the summary/introduction of the HTML post.
   * This has to consist of a paragraph only (it's supposed to be a short excerpt). To do so,
   * this method looks for an HTML element with the following attribute.
   *
   * ```html
   * <p data-bdsm="summary">Summary text</p>
   * ```
   *
   * The method returns a string with the post introduction.
   *
   * @param document a parsed Document object of the full post HTML text.
   * @returns the summary/introduction of the post.
   */
  parseSummary: function (document: Document): string {
    const element = document.querySelector('[data-bdsm="summary"]');
    return getTextWithoutTags(element?.innerHTML || '');
  },

  /**
   * This method extracts all the text paragraphs of a post written in HTML.
   * It returns a list of the text found inside any <p> element of the HTML document.
   *
   * @param document a parsed Document object of the full post HTML text.
   * @returns all the paragraphs of the post.
   */
  parseParagraphs: function (document: Document): string[] {
    const elements = document.querySelectorAll('p');
    const paragraphs = [];
    for (const paragraph of elements || []) {
      if (paragraph.innerHTML) {
        paragraphs.push(getTextWithoutTags(paragraph.innerHTML));
      }
    }
    return paragraphs;
  },

  /**
   * This method extracts all the code snippets found in a post.
   * To do so it gets all the text from inside <code> elements.
   *
   * @param document a parsed Document object of the full post HTML text.
   * @returns all the code snippets present, if any.
   */
  parseSnippets: function (document: Document): string[] {
    const elements = document.querySelectorAll('code');
    const snippets = [];
    for (const snippet of elements || []) {
      if (snippet.innerHTML) {
        snippets.push(getTextWithoutTags(snippet.innerHTML));
      }
    }
    return snippets;
  },
};
