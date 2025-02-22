import loadFile from '../../../jest/global';
import FrontMatterParser, { extractYamlMetadata } from './frontmatter';

describe('documents > parsers > frontmatter', () => {
  const mdError = loadFile('frontMatterError.md');
  const mdNoData = loadFile('frontMatterNoData.md');
  const mdSample = loadFile('frontMatterSample.md');

  it('should return a document when there is an error in the metadata', () => {
    const frontMatterParser = new FrontMatterParser('/blog');
    const solrDoc = frontMatterParser.parse(mdError, 'error');
    expect(solrDoc.url).toBe('/blog/error');
    // other fields should be empty
    expect(solrDoc.title).toBeFalsy();
    expect(solrDoc.date).toBeNull();
    expect(solrDoc.summary).toBeFalsy();
    expect(solrDoc.tags).toHaveLength(0);
    expect(solrDoc.sections).toHaveLength(0);
    expect(solrDoc.paragraphs).toHaveLength(1);
    expect(solrDoc.paragraphs).toContain('This is the rest of the document.');
    expect(solrDoc.snippets).toHaveLength(0);
  });

  it('should parse (using default parser) a document', () => {
    const frontMatterParser = new FrontMatterParser('/blog');
    const solrDoc = frontMatterParser.parse(mdSample, 'post');
    expect(solrDoc.url).toBe('/blog/post');

    expect(solrDoc.title).toBe('Sample title');
    expect(solrDoc.date).toStrictEqual(new Date('2025-01-01'));
    expect(solrDoc.summary).toBe('Sample summary');
    expect(solrDoc.tags).toContain('test');
    expect(solrDoc.tags).toContain('tag');

    expect(solrDoc.sections).toContain('Section 1');
    expect(solrDoc.sections).toContain('Sub-section');
    expect(solrDoc.sections).toContain('Section 2');

    expect(solrDoc.paragraphs).toContain('Paragraph 1');
    expect(solrDoc.paragraphs).toContain('Paragraph 2');
    expect(solrDoc.paragraphs).toContain('Paragraph 3');

    expect(solrDoc.snippets).toContain('code snippet');
  });

  it('should return an empty document if no data is found', () => {
    const frontMatterParser = new FrontMatterParser('/blog');
    const solrDoc = frontMatterParser.parse(mdNoData, 'nodata');
    expect(solrDoc.url).toBe('/blog/nodata');
    // other fields should be empty
    expect(solrDoc.title).toBeFalsy();
    expect(solrDoc.date).toBeFalsy();
    expect(solrDoc.sections).toHaveLength(0);
    expect(solrDoc.paragraphs).toHaveLength(1);
    expect(solrDoc.paragraphs).toContain('This is a sample document without any metadata.');
    expect(solrDoc.snippets).toHaveLength(0);
  });

  it('should use provided parsing functions', () => {
    const frontMatterParser = new FrontMatterParser('/blog', { parseTitle: () => 'My own title' });
    const solrDoc = frontMatterParser.parse(mdSample, 'doc');
    expect(solrDoc.url).toBe('/blog/doc');
    expect(solrDoc.title).toBe('My own title');
  });

  it('should return an object with its metadata', () => {
    const metadata = extractYamlMetadata(mdSample);
    expect(metadata).toHaveProperty('title');
    expect(metadata['title']).toBe('Sample title');
    expect(metadata).toHaveProperty('date');
    expect(metadata['date']).toBe('2025-01-01');
    expect(metadata).toHaveProperty('summary');
    expect(metadata['summary']).toBe('Sample summary');
    expect(metadata).toHaveProperty('tags');
    expect(metadata['tags']).toBe('tag | test');

    const emptyMetadata = extractYamlMetadata(mdNoData);
    expect(emptyMetadata).toMatchObject({});
  });
});
