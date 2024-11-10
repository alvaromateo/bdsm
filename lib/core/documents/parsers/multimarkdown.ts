import { IDocumentParser, ParserConfig } from '../parser';
import { SolrDocument } from '../solrDocument';

export default class MultiMarkdownParser implements IDocumentParser {}

class DefaultMultiMarkdownParserConfig implements ParserConfig {}
