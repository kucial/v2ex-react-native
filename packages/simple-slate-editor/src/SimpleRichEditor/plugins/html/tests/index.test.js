import { createEditor, Editor } from 'slate';
import { JSDOM } from 'jsdom';
import { withHtml } from '../index';
import { doc1, html1, doc2, html2, doc3, html3, doc4, html4 } from './mock';

global.DOMParser = new JSDOM().window.DOMParser;

describe('html', () => {
  let editor;

  beforeAll(() => {
    editor = withHtml(createEditor());
  });
  describe('htmlFromFragment', () => {
    it('simple html', () => {
      const output = editor.html.htmlFromFragment(doc1);
      expect(output).toEqual(html1);
    });
    it('with multi inline style', () => {
      expect(editor.html.htmlFromFragment(doc2)).toEqual(html2);
    });
    it('register element in `tagsExtracter`', () => {
      editor.html.tagsExtracter.image = (node) => [
        {
          tag: 'img',
          attrs: {
            src: node.url,
          },
          selfClose: true,
        },
      ];
      expect(editor.html.htmlFromFragment(doc3)).toEqual(html3);
    });
    it('common attrs fix with `getCommonExtra`', () => {
      editor.html.getCommonExtra = (node) => {
        if (node._id) {
          return {
            'data-block-id': node._id,
          };
        }
      };
      expect(editor.html.htmlFromFragment(doc4)).toEqual(html4);
    });
  });

  describe('fragmentFromHtml', () => {
    it('simple html', () => {
      const output = editor.html.fragmentFromHtml(html1);
      expect(output).toEqual(doc1);
    });
    it('multi mark convert', () => {
      const output = editor.html.fragmentFromHtml(html2);
      expect(output).toEqual(doc2);
    });
    it('register deserializer in `attrsExtracter`', () => {
      editor.html.attrsExtracter.IMG = (el) => ({
        type: 'image',
        url: el.getAttribute('src'),
      });
      const output = editor.html.fragmentFromHtml(html3);
      expect(output).toEqual(doc3);
    });
    it('common attrs fix with `normalize`', () => {
      const { normalize } = editor.html;
      editor.html.normalize = (node, el) => {
        if (el.dataset.blockId) {
          node._id = el.dataset.blockId;
        }
        return normalize(node);
      };
      const output = editor.html.fragmentFromHtml(html4);
      expect(output).toEqual(doc4);
    });
  });
});
