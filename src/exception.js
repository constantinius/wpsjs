import { parseXML, makeXPathSelector } from './utils';

const namespaces = {
  ows11: '',
  ows20: '',
};

const { single } = makeXPathSelector(namespaces);

export function parseOwsException(text) {
  const doc = parseXML(text);
  const elem = doc.documentElement;
  const exception = single('ows11:Exception|ows20:Exception', elem);
  const error = new Error(single('(ows11:ExceptionText|ows20:ExceptionText)/text()', exception));
  error.locator = exception.getAttribute('locator');
  error.exceptionCode = exception.getAttribute('exceptionCode');
  return error;
}
