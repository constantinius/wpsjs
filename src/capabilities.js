import { parseXML } from './utils';
import v20 from './v20/parsing';

export function parseCapabilities(text) {
  const doc = parseXML(text);
  const elem = doc.documentElement;

  if (elem.localName !== 'Capabilities') {
    throw new Error('Document is not a capabilities document.');
  }
  const version = elem.getAttribute('version') || '';
  if (version.startsWith('1.0')) {
    // TODO: not yet implemented
    return null;
  } else if (version.startsWith('2.0')) {
    return v20.parseCapabilities(text);
  }
  throw new Error(`Unsupported WPS version ${elem.getAttribute('version')}`);
}


export async function getCapabilities(url) {
  const response = await fetch(url);
  const text = await response.text();
  return parseCapabilities(text);
}
