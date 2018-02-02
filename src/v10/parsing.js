import { parseXml, makeXPathSelector, getAttributeValue } from '../utils';
import { parseOwsException } from '../exception';

const namespaces = {
  xlink: 'http://www.w3.org/1999/xlink',
  wps: 'http://www.opengis.net/wps/1.0.0',
  ows: 'http://www.opengis.net/ows/1.1',
};

const { select, single } = makeXPathSelector(namespaces);

function parseGenericMetadata(node) {
  return {
    id: single('ows:Identifier/text()', node),
    title: single('ows:Title/text()', node),
    abstract: single('ows:Abstract/text()', node),
    keywords: select('ows:Keywords/ows:Keyword/text()', node),
    metadatas: select('ows:Metadata', node)
      .map(metadataNode => ({
        href: metadataNode.getAttributeNS(namespaces.xlink, 'href'),
        role: metadataNode.getAttributeNS(namespaces.xlink, 'role'),
        title: metadataNode.getAttributeNS(namespaces.xlink, 'title'),
      })),
  };
}

/**
 *
 */
export function parseCapabilities(text) {
  const doc = parseXml(text);
  const elem = doc.documentElement;
  const serviceIdendification = single('ows:ServiceIdentification', elem);
  const serviceProvider = single('ows:ServiceProvider', elem);

  return {
    version: elem.getAttribute('version'),
    ...parseGenericMetadata(serviceIdendification),
    profiles: select('ows:Profile/text()', serviceIdendification),
    fees: single('ows:Fees/text()', serviceIdendification),
    accessConstraints: select('ows:AccessConstraints/text()', serviceIdendification),
    providerName: single('ows:ProviderName/text()', serviceProvider),
    // providerSite: single('ows:ProviderSite/@xlink:href', serviceProvider),
    processSummaries: select('wps:ProcessOfferings/wps:Process', elem)
      .map((node) => ({
        ...parseGenericMetadata(node),
        version: node.getAttributeNS(namespaces.wps, 'processVersion'),
      })),
    defaultLanguage: single('wps:Languages/wps:Default/ows:Language/text()', elem),
    languages: select('wps:Languages/wps:Supported/ows:Language/text()', elem),
  };
}

function parseInput(node) {
  const maximumMegabytes = single('ComplexData/@maximumMegabytes', node);
  return {
    ...parseGenericMetadata(node),
    domains: select('LiteralData', node)
      .map(domainNode => ({
        dataType: single('ows:DataType/text()', domainNode),
        // TODO: multiple UOMs
        uom: single('UOMs/Supported/ows:UOM/text()', domainNode),
        defaultValue: single('DefaultValue/text()', domainNode),
        // allowedValues:
        //   select('ows:AllowedValues/ows:Value | ows:AllowedValues/ows:Range', domainNode)
        //   .map((valueNode) => (valueNode.localName === 'Value' ? valueNode.textContent : [
        //     single('ows:MinimumValue/text()', valueNode),
        //     single('ows:MaximumValue/text()', valueNode),
        //   ])),
        // isDefault: domainNode.getAttribute('default') === 'true',
      })),
    formats:
      select('ComplexData/Default/Format', node)
        .map((formatNode) => ({
          mimeType: single('MimeType/text()', formatNode),
          encoding: single('Encoding/text()', formatNode),
          schema: single('Schema/text()', formatNode),
          maximumMegabytes, // TODO: in ComplexData
          isDefault: true,
        })).concat(
          select('ComplexData/Supported/Format', node)
            .map((formatNode) => ({
              mimeType: single('MimeType/text()', formatNode),
              encoding: single('Encoding/text()', formatNode),
              schema: single('Schema/text()', formatNode),
              maximumMegabytes, // TODO: in ComplexData
              isDefault: false,
            }))
        ),
  };
}

function parseOutput(node) {
  return {
    ...parseGenericMetadata(node),

    formats:
      select('ComplexOutput/Default/Format', node)
        .map((formatNode) => ({
          mimeType: single('MimeType/text()', formatNode),
          encoding: single('Encoding/text()', formatNode),
          schema: single('Schema/text()', formatNode),
          maximumMegabytes: undefined,
          isDefault: true,
        })).concat(
          select('ComplexOutput/Supported/Format', node)
            .map((formatNode) => ({
              mimeType: single('MimeType/text()', formatNode),
              encoding: single('Encoding/text()', formatNode),
              schema: single('Schema/text()', formatNode),
              maximumMegabytes: undefined, // TODO: in ComplexData
              isDefault: false,
            }))
        ),
  };
}


/**
 * Parse a WPS 2.0 process offerings document.
 * @param {string} text the XML text to parse.
 * @returns {ProcessDescription[]} the parsed process offerings
 */
export function parseProcessDescriptions(text) {
  const doc = parseXml(text);
  const elem = doc.documentElement;
  return select('ProcessDescription', elem)
    .map((processDescriptionNode) => ({
      ...parseGenericMetadata(processDescriptionNode),
      // TODO: wsdl and profiles
      inputs: select('DataInputs/Input', processDescriptionNode).map(parseInput),
      outputs: select('ProcessOutputs/Output', processDescriptionNode).map(parseOutput),
    }));
}


export function parseExecuteResponse(text) {
  const doc = parseXml(text);
  const elem = doc.documentElement;

  const statusElem = single(
    'wps:Status/' +
    '(wps:ProcessAccepted | wps:ProcessStarted | wps:ProcessSucceeded | ' +
    'wps:ProcessPaused | wps:ProcessFailed)', elem
  );

  let status = undefined;
  if (statusElem) {
    if (statusElem.localName === 'ProcessAccepted') {
      status = 'Accepted';
    } else if (statusElem.localName === 'ProcessStarted') {
      status = 'Running';
    } else if (statusElem.localName === 'ProcessSucceeded') {
      status = 'Succeded';
    } else if (statusElem.localName === 'ProcessPaused') {
      status = 'Paused';
    } else if (statusElem.localName === 'ProcessFailed') {
      status = 'Failed';
    }
  }

  return {
    jobId: undefined,
    status,
    percentCompleted: single('@percentCompleted', statusElem),
    statusLocation: single('@statusLocation', elem),
  };
}
