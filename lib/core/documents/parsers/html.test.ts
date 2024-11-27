import HtmlParser from './html';

describe('documents > parsers > html', () => {
  const noDataHtml = loadFile('htmlDocNoData.html');
  const htmlSample = loadFile('htmlDocSample.html');

  it('should return an empty document when there is a parsing error', () => {
    const htmlParser = new HtmlParser('/blog');
    htmlParser.parse(noDataHtml, 'test');
    htmlParser.parse(htmlSample, 'test');
  });

  it('should parse the title of a document', () => {});

  it('should parse the date of a document', () => {});

  it('should parse the tags of a document', () => {});

  it('should parse the sections of a document', () => {});

  it('should parse the summary of a document', () => {});

  it('should parse the paragraphs of a document', () => {});

  it('should parse the snippets of a document', () => {});

  it('should return an empty document if no data is found', () => {});

  it('should return a document with data found', () => {});

  it('should use provided parsing functions', () => {});
});
