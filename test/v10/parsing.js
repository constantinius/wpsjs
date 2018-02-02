import fs from 'fs';
import { expect } from 'chai';

import {
  parseCapabilities, parseProcessDescriptions, parseStatusInfo, parseResult,
} from '../../src/v10/parsing';

describe('v10/parsing', () => {
  describe('parseCapabilities', () => {
    it('shall parse the capabilities document', () => {
      const content = fs.readFileSync('test/v10/data/capabilities.xml', 'utf-8');
      const caps = parseCapabilities(content);

      expect(caps).to.deep.equal({
        version: '1.0.0',
        title: 'AAFC GDAS-based WPS server',
        abstract: 'AAFC GDAS-based WPS server developed for the OGC WPSie.',
        id: undefined,
        keywords: [
          'WPS',
          'AAFC',
          'geospatial',
          'geoprocessing',
        ],
        metadatas: [],
        profiles: [],
        fees: 'NONE',
        accessConstraints: ['NONE'],
        providerName: 'Agriculture and Agri-Food Canada',
        processSummaries: [{
          abstract: 'Buffer  the polygon coordinates found in one GML stream by ' +
                    'a given buffer distance, and output the results in GML.',
          title: 'Buffer a polygon feature',
          id: 'buffer',
          keywords: [],
          metadatas: [{
            href: '',
            role: '',
            title: 'buffer',
          }, {
            href: '',
            role: '',
            title: 'polygon',
          }],
          version: '1',
          allowsSync: true,
          allowsAsync: true,
          allowsDismiss: true,
          allowsReference: false,
          allowsValue: false,
        }],
      });
    });
  });

  describe('parseProcessDescriptions', () => {
    it('shall parse the capabilities document', () => {
      const content = fs.readFileSync('test/v10/data/process_descriptions.xml', 'utf-8');
      const processDescriptions = parseProcessDescriptions(content);
      expect(processDescriptions).to.deep.equal([{
        title: 'Create a buffer around a polygon.',
        abstract: 'Create a buffer around a single polygon. Accepts the polygon as ' +
                  'GML and provides GML output for the buffered feature. ',
        id: 'Buffer',
        keywords: [],
        metadatas: [{
          href: '',
          role: '',
          title: 'spatial',
        }, {
          href: '',
          role: '',
          title: 'geometry',
        }, {
          href: '',
          role: '',
          title: 'buffer',
        }, {
          href: '',
          role: '',
          title: 'GML',
        }],
        inputs: [{
          title: 'Polygon to be buffered',
          abstract: 'URI to a set of GML that describes the polygon.',
          id: 'InputPolygon',
          keywords: [],
          metadatas: [],
          domains: [],
          formats: [{
            mimeType: 'text/xml',
            encoding: 'base64',
            schema: 'http://foo.bar/gml/3.1.0/polygon.xsd',
            maximumMegabytes: '5',
            isDefault: true,
          }, {
            mimeType: 'text/xml',
            encoding: 'UTF-8',
            schema: 'http://foo.bar/gml/3.1.0/polygon.xsd',
            maximumMegabytes: '5',
            isDefault: false,
          }],
        }, {
          title: 'Buffer Distance',
          abstract: 'Distance to be used to calculate buffer.',
          id: 'BufferDistance',
          keywords: [],
          metadatas: [],
          domains: [{
            dataType: 'float',
            uom: 'meters',
            defaultValue: '100',
          }],
          formats: [],
        }, {
          title: 'Buffer Zones',
          abstract: 'Defines the width of each buffer zone for a multiple-ring-buffer. ' +
                    'If only one buffer zone shall be created, this Input can be omitted.',
          id: 'BufferZones',
          keywords: [],
          metadatas: [],
          domains: [],
          formats: [{
            mimeType: 'text/xml',
            encoding: 'UTF-8',
            schema: 'http://foo.bar/complexValueSchema.xsd',
            maximumMegabytes: undefined,
            isDefault: true,
          }, {
            mimeType: 'text/xml',
            encoding: 'UTF-8',
            schema: 'http://foo.bar/SecondComplexValueSchema.xsd',
            maximumMegabytes: undefined,
            isDefault: false,
          }],
        }],
        outputs: [{
          title: 'Buffered Polygon',
          abstract: 'GML stream describing the buffered polygon feature.',
          id: 'BufferedPolygon',
          keywords: [],
          metadatas: [],
          formats: [{
            mimeType: 'text/xml',
            encoding: 'base64',
            schema: 'http://foo.bar/gml/3.1.0/polygon.xsd',
            maximumMegabytes: undefined,
            isDefault: true,
          }, {
            mimeType: 'text/xml',
            encoding: 'UTF-8',
            schema: 'http://foo.bar/gml/3.1.0/polygon.xsd',
            maximumMegabytes: undefined,
            isDefault: false,
          }],
        }],
      }]);
    });
  });
});
