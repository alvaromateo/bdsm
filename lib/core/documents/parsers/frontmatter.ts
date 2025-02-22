import { IDocumentParser, MetadataObj, ParserConfig } from '../parser';
import { ISolrDocument } from '../solrDocument';

export default class FrontMatterParser implements IDocumentParser {}

class DefaultFrontMatterParserConfig implements ParserConfig {}

export const extractYamlMetadata = (markdown: string) => {
  const charactersBetweenGroupedHyphens = /^---([\s\S]*?)---/;
  const metadataMatched = markdown.match(charactersBetweenGroupedHyphens);
  let metadata: string | null = null;

  if (metadataMatched) {
    metadata = metadataMatched[1];
  }
  if (!metadata) {
    return {};
  }

  const metadataLines = metadata.split('\n');
  const metadataObject: MetadataObj = metadataLines.reduce((accumulator, line) => {
    const [key, ...value] = line.split(':').map((part) => part.trim());
    if (key) {
      accumulator[key] = value[1] ? value.join(':') : value.join('');
    }
    return accumulator;
  }, {} as MetadataObj);

  return metadataObject;
};
