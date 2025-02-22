import HtmlParser from './html';
import loadFile from '../../../jest/global';

describe('documents > parsers > html', () => {
  const htmlDocError = loadFile('htmlDocError.html');
  const noDataHtml = loadFile('htmlDocNoData.html');
  const htmlSample = loadFile('htmlDocSample.html');

  it('should return an empty document when there is a parsing error', () => {
    const htmlParser = new HtmlParser('/blog');
    const solrDoc = htmlParser.parse(htmlDocError, 'error');
    expect(solrDoc.url).toBe('/blog/error');
    // other fields should be empty
    expect(solrDoc.title).toBeFalsy();
  });

  it('should parse (using default parser) a document', () => {
    const htmlParser = new HtmlParser('/blog');
    const solrDoc = htmlParser.parse(htmlSample, 'doc');
    expect(solrDoc.url).toBe('/blog/doc');

    expect(solrDoc.title).toBe('Test HTML Document');
    expect(solrDoc.date).toStrictEqual(new Date('2024-11-30'));
    expect(solrDoc.summary).toBe('This is a sample document to test the HTML parser.');
    expect(solrDoc.tags).toContain('test');
    expect(solrDoc.tags).toContain('parser');

    expect(solrDoc.sections).toContain('Section 1');
    expect(solrDoc.sections).toContain('Sub-Section 1.1');
    expect(solrDoc.sections).toContain('Sub-Sub-Section');
    expect(solrDoc.sections).toContain('Section 2');

    expect(solrDoc.paragraphs).toContain('Section 1 paragraph');
    expect(solrDoc.paragraphs).toContain('Sub-Section 1.1 paragraph');
    expect(solrDoc.paragraphs).toContain('Sub-Sub-Section paragraph');
    expect(solrDoc.paragraphs).toContain('Section 2 paragraph');

    expect(solrDoc.snippets).toContain('expect(this).toWork()');
  });

  it('should return an empty document if no data is found', () => {
    const htmlParser = new HtmlParser('/blog');
    const solrDoc = htmlParser.parse(noDataHtml, 'nodata');
    expect(solrDoc.url).toBe('/blog/nodata');
    // other fields should be empty
    expect(solrDoc.title).toBeFalsy();
    expect(solrDoc.date).toBeFalsy();
    expect(solrDoc.sections).toHaveLength(0);
    expect(solrDoc.paragraphs).toHaveLength(1);
    expect(solrDoc.paragraphs).toContain('Just a normal HTML with no data to extract.');
    expect(solrDoc.snippets).toHaveLength(0);
  });

  it('should use provided parsing functions', () => {
    const htmlParser = new HtmlParser('/blog', { parseTitle: () => 'My own title' });
    const solrDoc = htmlParser.parse(htmlSample, 'doc');
    expect(solrDoc.url).toBe('/blog/doc');
    expect(solrDoc.title).toBe('My own title');
  });
});
