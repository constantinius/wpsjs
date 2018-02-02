import { escapeXml } from '../utils';
import { isRef, isData } from '../data';

const wps20GetPreamble = 'service=WPS&version=2.0.0';
const wps20XmlNamespaces = 'xmlns:wps="http://www.opengis.net/wps/2.0" xmlns:ows="http://www.opengis.net/ows/2.0" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wps/2.0 http://schemas.opengis.net/wps/2.0/wps.xsd"';

/**
 * Create either a KVP or XML 'DescribeProcess' request
 * @param {string[]} [processIds=['ALL']] The IDs for the processes to fetch the description for
 * @param {boolean} [useXml=false] Whether an XML request shall be used.
 */
export function createDescribeProcessRequest(processIds = ['ALL'], useXml = false) {
  if (useXml) {
    return `<wps:DescribeProcess ${wps20XmlNamespaces} service="WPS" version="2.0.0">
      ${processIds.map(processId =>
        `<ows:Identifier>${escapeXml(processId)}</ows:Identifier>`).join('')}
    </wps:DescribeProcess>`;
  }
  return `${wps20GetPreamble}&request=DescribeProcess&identifier=${processIds.join(',')}`;
}

function encodeMetadata({ mimeType, encoding, schema }) {
  return [
    mimeType ? `mimetype="${escapeXml(mimeType)}"` : '',
    encoding ? `encoding="${escapeXml(encoding)}"` : '',
    schema ? `schema="${escapeXml(schema)}"` : '',
  ].filter(item => item !== '').join(' ');
}

function encodeInputValue(value) {
  const type = typeof value;
  if (type === 'string' || type === 'number' || type === 'boolean') {
    return value;
  } else if (value instanceof Date) {
    return value.toISOString();
  }
  return JSON.stringify(value);
}

function encodeInput(id, value) {
  if (isRef(value)) {
    return `<wps:Input id="${id}">
      <wps:Reference ${encodeMetadata(value)} xlink:href="${value.href}"/>
    </wps:Input>`;
  } else if (isData(value)) {
    return `<wps:Input id="${id}">
      <wps:Data ${encodeMetadata(value)}>${encodeInputValue(value.data)}</wps:Data>
    </wps:Input>`;
  }
  return `<wps:Input id="${id}">
    <wps:Data>${encodeInputValue(value)}</wps:Data>
  </wps:Input>`;
}

function encodeOutput(id, { asValue, ...metadata }) {
  return `<wps:Output id="${escapeXml(id)}" transmission="${
    asValue ? 'value' : 'reference'
  }" ${encodeMetadata(metadata)}/>`;
}

/**
 *
 */
export function createExecuteRequest(processId, { isAsync, raw, inputs = {}, outputs = {} }) {
  return `<wps:Execute ${wps20XmlNamespaces} service="WPS" version="2.0.0"
      response="${raw ? 'raw' : 'document'}" mode="${isAsync}">
    <ows:Identifier>${escapeXml(processId)}</ows:Identifier>
    ${Object.entries(inputs).map(([id, value]) => encodeInput(id, value)).join('')}
    ${Object.entries(outputs).map(([id, value]) => encodeOutput(id, value)).join('')}
  </wps:Execute>`;
}

/**
 *
 */
export function createGetStatusRequest(jobId, useXml = false) {
  if (useXml) {
    return `<wps:GetStatus ${wps20XmlNamespaces} service="WPS" version="2.0.0">
      <wps:JobID>${escapeXml(jobId)}</wps:JobID>
    </wps:GetStatus>`;
  }
  return `${wps20GetPreamble}&request=GetStatus&jobid=jobId`;
}

/**
 *
 */
export function createGetResultRequest(jobId, useXml = false) {
  if (useXml) {
    return `<wps:GetResult ${wps20XmlNamespaces} service="WPS" version="2.0.0">
      <wps:JobID>${escapeXml(jobId)}</wps:JobID>
    </wps:GetResult>`;
  }
  return `${wps20GetPreamble}&request=GetResult&jobid=jobId`;
}
