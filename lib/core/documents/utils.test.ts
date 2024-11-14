import { jest } from '@jest/globals';

describe('documents > utils', () => {
  describe('getTextWithoutTags', () => {
    it('should return text when there is no nested tag', () => {});

    it('should return text when there is a simple tag', () => {});

    it('should return text when there is a tag with attributes', () => {});

    it('should return text when there are multiple nested tags', () => {});

    it('should return text when there is an attribute that contains > or <', () => {});

    it('should return empty string with empty text input', () => {});

    it('should return text when there is a tag right at the start', () => {});

    it('should return text when there is a quoted text with tags', () => {});

    it('should throw error when there is HTML with a < character', () => {});

    it('should throw error when there is a missing closing tag', () => {});

    it('should throw error when the tag name does not immediately follow <', () => {});

    it('should throw error when there are mismatched tags', () => {});

    it('should throw error when there is a malformed tag', () => {});
  });

  describe('getMatchingEnd', () => {
    it('should ', () => {});
  });

  describe('getTagName', () => {
    it('should ', () => {});
  });
});

/**
 * Test cases:
 *
 * CORRECT
 * This is a text without any nested tag.
 * Text with an <em>important</em> tag.
 * Text with a <span class="random">complex class</span> tag.
 * Text with <span class="random">multiple <em>nested</em></span> tags.
 * Text with <span attribute="> <">a greater than character</span>.
 * {empty text}
 * <div>Text inside top level div.</div>
 * "Quotes outside of tag <span class="random">that should be ignored</span>".
 *
 * ERROR
 * Malformed HTML < because of a less than character.
 * Malformed HTML because of <span>missing closing tag.
 * < div> Malformed because of whitespace after opening tag.
 * Malformed because of <span>mismatched</em> tags.
 * Malformed with <span>missing part of tag </
 * Another missing part of a tag. <
 */
