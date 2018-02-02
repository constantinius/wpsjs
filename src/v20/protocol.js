import { parseOwsException } from '../exception';
import {
  parseProcessDescriptions, parseStatusInfo, parseResult, parseStatusInfoOrResult,
} from './parsing';
import {
  createDescribeProcessRequest, createExecuteRequest, createGetStatusRequest,
  createGetResultRequest,
} from './requests';

const xmlContentTypes = new Set(['application/xml', 'text/xml']);

async function sendRequest(request, text = true) {
  const response = await fetch(request);
  if (!response.ok) {
    throw parseOwsException(await response.text());
  }
  if (text) {
    return response.text();
  }
  return response;
}

export class ProtocolV20 {
  constructor(url, usePost = false) {
    this._url = url;
    this._usePost = usePost;
  }

  _createRequest(bodyOrQuery, isPost = this.usePost) {
    if (isPost) {
      return new Request(this.url, {
        method: 'POST',
        body: bodyOrQuery,
        headers: {
          'Content-Type': 'text/xml',
        },
      });
    }
    return new Request(`${this.url}?${bodyOrQuery}`);
  }

  async describeProcess(processIds = []) {
    const request = this._createRequest(
      createDescribeProcessRequest(processIds, this.usePost),
    );
    return parseProcessDescriptions(await sendRequest(request));
  }

  async execute(processDescription, inputs, outputs, options) {
    const request = this._createRequest(
      createExecuteRequest(
        processDescription.id, options.async, options.raw, inputs, outputs
      ),
      true,
    );
    const response = await sendRequest(request, false);

    //
    if (xmlContentTypes.has(response.headers.get('content-type'))) {
      return parseStatusInfoOrResult(await response.text());
    }

    // return raw response
    return response;
  }

  async getStatus(job) {
    const request = this._createRequest(
      createGetStatusRequest(job, this.usePost),
    );
    return parseStatusInfo(await sendRequest(request));
  }

  async getResult(job) {
    const request = this._createRequest(createGetResultRequest(job.id, this.usePost));
    return parseResult(await sendRequest(request));
  }
}
