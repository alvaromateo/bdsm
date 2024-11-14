import { getTextWithoutTags, getMatchingEnd, getTagName } from './utils';

describe('documents > utils', () => {
  describe('getTextWithoutTags', () => {
    it('should return text when there is no nested tag', () => {
      const input = 'This is a text without any nested tag.';
      const output = getTextWithoutTags(input);
      expect(output).toBe(input);
    });

    it('should return text when there is a simple tag', () => {
      const input = 'Text with an <em>important</em> tag.';
      const output = getTextWithoutTags(input);
      expect(output).toBe('Text with an important tag.');
    });

    it('should return text when there is a tag with attributes', () => {
      const input = 'Text with a <span class="random">complex class</span> tag.';
      const output = getTextWithoutTags(input);
      expect(output).toBe('Text with a complex class tag.');
    });

    it('should return text when there are multiple nested tags', () => {
      const input = 'Text with <span class="random">multiple <em>nested</em></span> tags.';
      const output = getTextWithoutTags(input);
      expect(output).toBe('Text with multiple nested tags.');
    });

    it('should return text when there is an attribute that contains > or <', () => {
      const input = 'Text with <span attribute="> <">a greater than character</span> in attribute.';
      const output = getTextWithoutTags(input);
      expect(output).toBe('Text with a greater than character in attribute.');
    });

    it('should return empty string with empty text input', () => {
      const input = '';
      const output = getTextWithoutTags(input);
      expect(output).toBe('');
    });

    it('should return text when there is a tag right at the start', () => {
      const input = '<div>Text inside top level div.</div>';
      const output = getTextWithoutTags(input);
      expect(output).toBe('Text inside top level div.');
    });

    it('should return text when there is a quoted text with tags', () => {
      const input = '"Quotes outside of tag <span class="random">that should be ignored</span>".';
      const output = getTextWithoutTags(input);
      expect(output).toBe('"Quotes outside of tag that should be ignored".');
    });

    it('should return text when there is a self closing tag', () => {
      const input = '<img class="><" src="https://noart.dev/images/me"/>With text.';
      const output = getTextWithoutTags(input);
      expect(output).toBe('With text.');
    });

    it('should throw error when there is HTML with a < character', () => {
      const input = "Malformed because of a less than character '<'.";
      try {
        getTextWithoutTags(input);
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError);
      }
    });

    it('should throw error when there is a missing closing tag', () => {
      const input = 'Malformed because of <span>missing closing tag.';
      try {
        getTextWithoutTags(input);
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError);
      }
    });

    it('should throw error when the tag name does not immediately follow <', () => {
      const input = '< div> Malformed because of whitespace after opening tag.';
      try {
        getTextWithoutTags(input);
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError);
      }
    });

    it('should throw error when there are mismatched tags', () => {
      const input = 'Malformed because of <span>mismatched</em> tags.';
      try {
        getTextWithoutTags(input);
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError);
      }
    });

    it('should throw error when there is a malformed tag', () => {
      const input = 'Malformed with <span>missing part of tag </';
      try {
        getTextWithoutTags(input);
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError);
      }
    });
  });

  describe('getMatchingEnd', () => {
    it('should return index of >', () => {
      const inputs: [string, number][] = [
        ['Text with a <span class="random">complex', 32],
        ['<div>', 4],
        ['<img class=">"/> self closing', 15],
      ];

      for (const [input, expectedOutput] of inputs) {
        const output = getMatchingEnd(input);
        expect(output).toBe(expectedOutput);
      }
    });

    it('should return index of > after start', () => {
      const input = '<span>Text</span>';
      const output = getMatchingEnd(input, 10);
      expect(output).toBe(16);
    });

    it('should throw error when the tag has no closing >', () => {
      const input = '<div without closing';
      try {
        getMatchingEnd(input);
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError);
      }
    });
  });

  describe('getTagName', () => {
    it('should return tag name found after start', () => {
      const inputs: [string, number, string][] = [
        ['<div>', 1, 'div'],
        ['<div><test', 6, 'test'],
        ['<img/>', 1, 'img'],
      ];

      for (const [input, start, expectedOutput] of inputs) {
        const output = getTagName(input, start);
        expect(output).toBe(expectedOutput);
      }
    });

    it('should throw error if tag name does not follow immediately character <', () => {
      const input = '<   div>';
      try {
        getTagName(input);
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError);
      }
    });
  });
});
