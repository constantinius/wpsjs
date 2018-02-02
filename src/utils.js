import xpath from 'xpath';
import { DOMParser } from 'xmldom';

export function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return '';
    }
  });
}

const parser = new DOMParser({
  errorHandler: {
    warning(warning) {
      // eslint-disable-next-line no-console
      console.warn(warning);
    },
    error(error) {
      throw new Error(error);
    },
    fatalError(error) {
      throw new Error(error);
    },
  },
});

export function parseXml(text) {
  if (typeof text === 'string') {
    return parser.parseFromString(text, 'text/xml');
  }
  return text;
}

export function makeXPathSelector(namespaces) {
  const xPathWithNamespaces = xpath.useNamespaces(namespaces);
  return {
    select(path, elem) {
      const result = xPathWithNamespaces(path, elem);
      const first = result[0];

      // convert attribute and text nodes to text itself
      if (first && (first.nodeType === 2 || first.nodeType === 3)) {
        return result.map(node => node.nodeValue);
      }
      return result;
    },
    single(path, elem) {
      const result = xPathWithNamespaces(path, elem, true);
      if (result && (result.nodeType === 2 || result.nodeType === 3)) {
        return result.nodeValue;
      }
      return result;
    },
  };
}

export function getAttributeValue(node, name, defaultValue = undefined) {
  if (node.hasAttribute(name)) {
    return node.getAttribute(name);
  }
  return defaultValue;
}
