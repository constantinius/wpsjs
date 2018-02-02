import { expect } from 'chai';
import { makeRef, makeData, isRef, isData } from '../src/data';


/* eslint-disable no-unused-expressions */

describe('data', () => {
  describe('makeRef/isRef', () => {
    it('', () => {
      const ref = makeRef('http://example.com');
      expect(isRef(ref)).to.be.true;
      expect(isData(ref)).to.be.false;
    });
  });

  describe('makeData/isData', () => {
    it('', () => {
      const ref = makeData('someData');
      expect(isData(ref)).to.be.true;
      expect(isRef(ref)).to.be.false;
    });
  });
});

/* eslint-ensable no-unused-expressions */
