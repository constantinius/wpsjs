import { expect } from 'chai';
import xpath from 'xpath';

import { parseXml } from '../../src/utils';
import {
  createDescribeProcessRequest, createExecuteRequest, createGetStatusRequest,
  createGetResultRequest,
} from '../../src/v20/requests';


const parseKvp = query => {
  if (!query) {
    return { };
  }

  return (/^[?#]/.test(query) ? query.slice(1) : query)
    .split('&')
    .reduce((params, param) => {
      const [key, value] = param.split('=');
      return { ...params, [key]: value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '' };
    }, {});
};


describe('v20/requests', () => {
  describe('createDescribeProcessRequest', () => {
    it('shall create a correct GET request with default parameters', () => {
      const getRequest = createDescribeProcessRequest();
      expect(parseKvp(getRequest)).to.deep.equal({
        service: 'WPS',
        version: '2.0.0',
        request: 'DescribeProcess',
        identifier: 'ALL',
      });
    });

    it('shall create a correct GET request with specific identifiers', () => {
      const getRequest = createDescribeProcessRequest(['a', 'b']);
      expect(parseKvp(getRequest)).to.deep.equal({
        service: 'WPS',
        version: '2.0.0',
        request: 'DescribeProcess',
        identifier: 'a,b',
      });
    });

    it('shall create a correct POST/XML request with default parameters', () => {
      const xmlRequest = createDescribeProcessRequest(undefined, true);
      const parsed = parseXml(xmlRequest);
      const ids = xpath.select('//*[local-name() = "Identifier"]/text()', parsed)
        .map(node => node.textContent);
      expect(ids).to.deep.equal(['ALL']);
    });

    it('shall create a correct POST/XML request with specific identifiers', () => {
      const xmlRequest = createDescribeProcessRequest(['a', 'b'], true);
      const parsed = parseXml(xmlRequest);
      const ids = xpath.select('//*[local-name() = "Identifier"]/text()', parsed)
        .map(node => node.textContent);
      expect(ids).to.deep.equal(['a', 'b']);
    });
  });

  describe('createExecuteRequest', () => {
    it('', () => {
      console.log(
        createExecuteRequest('process', { isAsync: true, raw: false, inputs: {}, outputs: {} })
      );
    });
  });

  describe('createGetStatusRequest', () => {
    it('', () => {
      console.log(createGetStatusRequest('jobId'));
    });

    it('', () => {
      console.log(createGetStatusRequest('jobId', true));
    });
  });

  describe('createGetResultRequest', () => {
    it('', () => {
      console.log(createGetResultRequest('jobId'));
    });

    it('', () => {
      console.log(createGetResultRequest('jobId', true));
    });
  });
});
