import fs from 'fs';
import { expect } from 'chai';

import {
  parseCapabilities, parseProcessDescriptions, parseStatusInfo, parseResult,
} from '../../src/v20/parsing';

describe('v20/parsing', () => {
  describe('parseGetCapabilities', () => {
    it('shall parse the capabilities document', () => {
      const content = fs.readFileSync('test/v20/data/capabilities.xml', 'utf-8');
      const caps = parseCapabilities(content);
      expect(caps).to.deep.equal({
        version: '2.0.0',
        title: 'MyWebProcessingService',
        abstract: 'A Demo Service offering typical GIS distance transform processes',
        id: undefined,
        keywords: [
          'Geoprocessing',
          'Toolbox',
          'Distance transform',
        ],
        metadatas: [],
        profiles: [],
        fees: 'NONE',
        accessConstraints: ['NONE'],
        providerName: 'TU Dresden',
        processSummaries: [{
          abstract: undefined,
          title: 'Euclidean Distance',
          id: 'http://my.site/distance-transform/euclidean-distance',
          keywords: [],
          metadatas: [],
          version: '',
          allowsSync: true,
          allowsAsync: true,
          allowsDismiss: true,
          allowsReference: false,
          allowsValue: false,
        }, {
          abstract: undefined,
          title: 'Cost Distance',
          id: 'http://my.site/distance-transform/cost-distance',
          keywords: [],
          metadatas: [],
          version: '1.4.0',
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
    it('shall parse the process offerings', () => {
      const content = fs.readFileSync('test/v20/data/process_offerings.xml', 'utf-8');
      const processDescriptions = parseProcessDescriptions(content);
      expect(processDescriptions).to.deep.equal([{
        title: 'Planar Buffer operation for Simple Features',
        abstract: 'Create a buffer around Simple Feature geometries. '
                  + 'Accepts any valid simple features input in GML or GeoJson '
                  + 'and computes their joint buffer geometry.',
        id: 'http://my.wps.server/processes/proximity/Planar-Buffer',
        metadatas: [{
          role: 'http://www.opengis.net/spec/wps/2.0/def/process-profile/concept',
          href: 'http://some.host/profileregistry/concept/buffer',
        }, {
          role: 'http://www.opengis.net/spec/wps/2.0/def/process-profile/concept',
          href: 'http://some.host/profileregistry/concept/planarbuffer',
        }, {
          role: 'http://www.opengis.net/spec/wps/2.0/def/process-profile/generic',
          href: 'http://some.host/profileregistry/generic/SF-Buffer',
        }, {
          role: 'http://www.opengis.net/spec/wps/2.0/def/process/description/documentation',
          href: 'http://some.host/profileregistry/implementation/Planar-GML-Buffer.html',
        }],
        keywords: [],
        allowsSync: true,
        allowsAsync: true,
        allowsDismiss: true,
        allowsReference: true,
        allowsValue: true,
        inputs: [{
          title: 'Geometry to be buffered',
          abstract: 'Simple Features geometry input in GML or GeoJson',
          id: 'INPUT_GEOMETRY',
          metadatas: [{
            role: 'http://www.opengis.net/spec/wps/2.0/def/process/description/documentation',
            href: 'http://my.wps.server/processes/proximity/Planar-Buffer.html#input_geometry',
          }],
          keywords: [],
          formats: [{
            mimeType: 'text/xml',
            encoding: 'UTF-8',
            schema: 'http://schemas.opengis.net/gml/3.2.1/feature.xsd',
            maximumMegabytes: undefined,
            isDefault: true,
          }, {
            mimeType: 'application/json',
            encoding: 'UTF-8',
            schema: undefined,
            maximumMegabytes: undefined,
            isDefault: false,
          }],
          domains: [],
          subInputs: [],
        }, {
          title: 'Distance',
          abstract: 'Distance to be used to calculate buffer.',
          id: 'DISTANCE',
          metadatas: [{
            role: 'http://www.opengis.net/spec/wps/2.0/def/process/description/documentation',
            href: 'http://my.wps.server/processes/proximity/Planar-Buffer.html#distance',
          }],
          keywords: [],
          formats: [{
            mimeType: 'text/plain',
            encoding: undefined,
            schema: undefined,
            maximumMegabytes: undefined,
            isDefault: true,
          }, {
            mimeType: 'text/xml',
            encoding: undefined,
            schema: undefined,
            maximumMegabytes: undefined,
            isDefault: false,
          }],
          domains: [{
            allowedValues: [
              ['-INF', 'INF'],
            ],
            dataType: 'Double',
            defaultValue: undefined,
            uom: undefined,
            isDefault: true,
          }],
          subInputs: [],
        }],
        outputs: [{
          title: 'Buffered Geometry',
          abstract: 'Output Geometry in GML or GeoJson',
          id: 'BUFFERED_GEOMETRY',
          metadatas: [{
            role: 'http://www.opengis.net/spec/wps/2.0/def/process/description/documentation',
            href: 'http://my.wps.server/processes/proximity/Planar-Buffer.html#buffered_geometry',
          }],
          keywords: [],
          formats: [{
            mimeType: 'text/xml',
            encoding: 'UTF-8',
            schema: 'http://schemas.opengis.net/gml/3.2.1/feature.xsd',
            maximumMegabytes: undefined,
            isDefault: true,
          }, {
            mimeType: 'application/json',
            encoding: 'UTF-8',
            schema: undefined,
            maximumMegabytes: undefined,
            isDefault: false,
          }],
          domains: [],
          subOutputs: [],
        }],
      }]);
    });
  });

  describe('parseStatusInfo', () => {
    it('shall parse the status info', () => {
      const content = fs.readFileSync('test/v20/data/status_info.xml', 'utf-8');
      const statusInfo = parseStatusInfo(content);
      expect(statusInfo).to.deep.equal({
        jobId: 'FB6DD4B0-A2BB-11E3-A5E2-0800200C9A66',
        status: 'Accepted',
        nextPoll: new Date('2014-12-24T16:00:00Z'),
        expirationDate: null,
        estimatedCompletion: null,
        percentCompleted: NaN,
      });
    });
  });

  describe('parseResult', () => {
    it('shall parse the result', () => {
      const content = fs.readFileSync('test/v20/data/result.xml', 'utf-8');
      const result = parseResult(content);
      expect(result).to.deep.equal({
        jobId: 'FB6DD4B0-A2BB-11E3-A5E2-0800200C9A66',
        expirationDate: new Date('2014-12-24T24:00:00Z'),
        outputs: [{
          id: 'BUFFERED_GEOMETRY',
          reference: 'http://result.data.server/FB6DD4B0-A2BB-11E3-A5E2-0800200C9A66/BUFFERED_GEOMETRY.xml',
        }],
      });
    });
  });
});
