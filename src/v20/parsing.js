import { parseXml, makeXPathSelector, getAttributeValue } from '../utils';
import { parseOwsException } from '../exception';
// import {
//   Capabilities, ProcessSummary, ProcessDescription, FormatDescription,
//   InputDescription, OutputDescription, LiteralDataDomain, StatusInfo,
//   Result, Output,
// } from '../descriptions';


const namespaces = {
  xlink: 'http://www.w3.org/1999/xlink',
  wps: 'http://www.opengis.net/wps/2.0',
  ows: 'http://www.opengis.net/ows/2.0',
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
      })),
  };
}

function parseJobControlOptions(node) {
  const jobControlOptions = (node.getAttribute('jobControlOptions') || '').split(' ');
  return {
    allowsSync: jobControlOptions.includes('sync-execute'),
    allowsAsync: jobControlOptions.includes('async-execute'),
    allowsDismiss: jobControlOptions.includes('dismiss'),
  };
}

function parseOutputTransmission(node) {
  const outputTransmission = (node.getAttribute('outputTransmission') || '').split(' ');

  return {
    allowsValue: outputTransmission.includes('value'),
    allowsReference: outputTransmission.includes('reference'),
  };
}

/**
 * Parse a WPS 2.0 capabilities document.
 * @param {string} text the XML text to parse.
 * @returns {Capabilities} the parsed capabilities
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
    processSummaries: select('wps:Contents/wps:ProcessSummary', elem)
      .map((node) => ({
        ...parseGenericMetadata(node),
        ...parseJobControlOptions(node),
        ...parseOutputTransmission(node),
        version: node.getAttribute('processVersion'),
      })),
  };
}

function parseInputOutputBase(node) {
  return {
    ...parseGenericMetadata(node),
    domains: select('wps:LiteralData/LiteralDataDomain', node)
      .map(domainNode => ({
        dataType: single('ows:DataType/text()', domainNode),
        uom: single('ows:UOM/text()', domainNode),
        defaultValue: single('ows:DefaultValue/text()', domainNode),
        allowedValues:
          select('ows:AllowedValues/ows:Value | ows:AllowedValues/ows:Range', domainNode)
          .map((valueNode) => (valueNode.localName === 'Value' ? valueNode.textContent : [
            single('ows:MinimumValue/text()', valueNode),
            single('ows:MaximumValue/text()', valueNode),
          ])),
        isDefault: domainNode.getAttribute('default') === 'true',
      })),
    formats: select('(wps:LiteralData|wps:ComplexData)/wps:Format', node)
      .map(formatNode => ({
        mimeType: getAttributeValue(formatNode, 'mimeType'),
        encoding: getAttributeValue(formatNode, 'encoding'),
        schema: getAttributeValue(formatNode, 'schema'),
        maximumMegabytes: getAttributeValue(formatNode, 'maximumMegabytes'),
        isDefault: formatNode.getAttribute('default') === 'true',
      })),
  };
}

function parseInput(node) {
  return {
    ...parseInputOutputBase(node),
    subInputs: select('wps:Input', node).map(parseInput),
  };
}

function parseOutput(node) {
  return {
    ...parseInputOutputBase(node),
    subOutputs: select('wps:Output', node).map(parseOutput),
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

  return select('wps:ProcessOffering', elem)
    .map((processOfferingNode) => {
      const processNode = single('wps:Process', processOfferingNode);
      return {
        ...parseGenericMetadata(processNode),
        ...parseJobControlOptions(processOfferingNode),
        ...parseOutputTransmission(processOfferingNode),
        inputs: select('wps:Input', processNode).map(parseInput),
        outputs: select('wps:Output', processNode).map(parseOutput),
      };
    });
}

function optDate(dateString) {
  if (dateString) {
    return new Date(dateString);
  }
  return null;
}

/**
 * Parse a WPS 2.0 status info document.
 * @param {string} text the XML text to parse.
 * @returns {StatusInfo} the parsed status info
 */
export function parseStatusInfo(text) {
  const doc = parseXml(text);
  const elem = doc.documentElement;

  return {
    jobId: single('wps:JobID/text()', elem),
    status: single('wps:Status/text()', elem),
    expirationDate: optDate(single('wps:ExpirationDate/text()', elem)),
    estimatedCompletion: optDate(single('wps:EstimatedCompletion/text()', elem)),
    nextPoll: optDate(single('wps:NextPoll/text()', elem)),
    percentCompleted: parseFloat(single('wps:PercentCompleted/text()', elem)),
  };
}

function parseLiteralValue(node) {
  return {
    value: node.textContent,
    dataType: node.getAttribute('dataType'),
    uom: node.getAttribute('uom'),
  };
}

function parseComplexValue(node) {
  return {
    value: node.children.length ? node : node.innerText,
    mimeType: node.getAttribute('mimeType'),
    encoding: node.getAttribute('encoding'),
    schema: node.getAttribute('schema'),
  };
}

function parseResultOutput(elem) {
  const id = elem.getAttribute('id');
  const literalValue = single('wps:LiteralValue', elem);
  const reference = single('wps:Reference', elem);
  const subOutputs = select('wps:Output', elem);
  if (reference) {
    return {
      id,
      reference: reference.getAttributeNS(namespaces.xlink, 'href'),
    };
  } else if (literalValue) {
    return {
      id,
      data: parseLiteralValue(literalValue),
    };
  } else if (subOutputs.length) {
    return {
      id,
      subOutputs: subOutputs.map(parseResultOutput),
    };
  }
  // TODO: complex data
  const child = elem.children[0];
  return {
    id,
    data: parseComplexValue(child),
  };
}

/**
 * Parse a WPS 2.0 result document.
 * @param {string} text the XML text to parse.
 * @returns {Result} the parsed status info
 */
export function parseResult(text) {
  const doc = parseXml(text);
  const elem = doc.documentElement;

  return {
    jobId: single('wps:JobID/text()', elem),
    expirationDate: optDate(single('wps:ExpirationDate/text()', elem)),
    outputs: select('wps:Output', elem).map(parseResultOutput),
  };
}

export function parseStatusInfoOrResult(text) {
  const doc = parseXml(text);
  const elem = doc.documentElement;
  switch (elem.localName) {
    case 'Result': return parseResult(doc);
    case 'StatusInfo': return parseStatusInfo(doc);
    case 'ExceptionReport': throw parseOwsException(doc);
    default: throw new Error(`Unexpected XML root element '${elem.localName}'.`);
  }
}
