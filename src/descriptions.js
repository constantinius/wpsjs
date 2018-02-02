/**
 * Base class for description types.
 */
class DescriptionBase {
  /**
   * @param {object} options
   * @param {string} options.id
   * @param {string} [options.title]
   * @param {string} [options.abstract]
   * @param {string} [options.keywords]
   * @param {string} [options.metadata]
   */
  constructor({ id, title, abstract, keywords, metadatas }) {
    this._id = id;
    this._title = title;
    this._abstract = abstract;
    this._keywords = keywords;
    this._metadatas = metadatas;
  }

  /**
   * @readonly
   */
  get id() {
    return this._id;
  }

  /**
   * @readonly
   */
  get title() {
    return this._title;
  }

  /**
   * @readonly
   */
  get abstract() {
    return this._abstract;
  }

  /**
   * @readonly
   */
  get keywords() {
    return this._keywords;
  }

  /**
   * @readonly
   */
  get metadata() {
    return this._metadata;
  }
}

/**
 * Description type for literal data domains.
 */
export class LiteralDataDomain {
  /**
   * @param {object} options
   * @param {string} [options.dataType]
   * @param {string} [options.uom]
   * @param {string} [options.defaultValue]
   * @param {string} [options.allowedValues]
   * @param {string} [options.reference]
   */
  constructor({ dataType, uom, defaultValue, allowedValues, reference }) {
    this._dataType = dataType;
    this._uom = uom;
    this._defaultValue = defaultValue;
    this._allowedValues = allowedValues;
    this._reference = reference;
  }

  /**
   * @readonly
   */
  get dataType() {
    return this._dataType;
  }

  /**
   * @readonly
   */
  get uom() {
    return this._uom;
  }

  /**
   * @readonly
   */
  get defaultValue() {
    return this._defaultValue;
  }

  /**
   * @readonly
   */
  get allowedValues() {
    return this._allowedValues;
  }

  /**
   * @readonly
   */
  get reference() {
    return this._reference;
  }
}

/**
 * Description type for data formats.
 */
export class FormatDescription {
  /**
   * @param {object} options
   * @param {string} [options.mimeType]
   * @param {string} [options.encoding]
   * @param {string} [options.schema]
   * @param {string} [options.maximumMegabytes]
   * @param {string} [options.isDefault]
   */
  constructor({ mimeType, encoding, schema, maximumMegabytes, isDefault }) {
    this._mimeType = mimeType;
    this._encoding = encoding;
    this._schema = schema;
    this._maximumMegabytes = maximumMegabytes;
    this._isDefault = isDefault;
  }

  /**
   * @readonly
   */
  get mimeType() {
    return this._mimeType;
  }

  /**
   * @readonly
   */
  get encoding() {
    return this._encoding;
  }

  /**
   * @readonly
   */
  get schema() {
    return this._schema;
  }

  /**
   * @readonly
   */
  get maximumMegabytes() {
    return this._maximumMegabytes;
  }

  /**
   * @readonly
   */
  get isDefault() {
    return this._isDefault;
  }
}


class InputOutputDescriptionBase extends DescriptionBase {
  constructor({ formats = [], domains = [], ...base }) {
    super(base);
    this._domains = domains;
    this._formats = formats;
  }

  /**
   * @readonly
   */
  get formats() {
    return this._formats;
  }
}


export class InputDescription extends InputOutputDescriptionBase {
  constructor({ subInputs = [], ...base }) {
    super(base);
    this._subInputs = subInputs;
  }
}


export class OutputDescription extends InputOutputDescriptionBase {
  constructor({ subOutputs = [], ...base }) {
    super(base);
    this._subOutputs = subOutputs;
  }
}


export class ProcessSummary extends DescriptionBase {
  constructor({
      version, allowsSync, allowsAsync, allowsDismiss, allowsValue, allowsReference, ...base
  }) {
    super(base);
    this._version = version;
    this._allowsSync = allowsSync;
    this._allowsAsync = allowsAsync;
    this._allowsDismiss = allowsDismiss;
    this._allowsValue = allowsValue;
    this._allowsReference = allowsReference;
  }
}


export class ProcessDescription extends ProcessSummary {
  constructor({ inputs = [], outputs = [], lang = '', ...base }) {
    super(base);
    this._inputs = inputs;
    this._inputsMap = new Map(inputs.map(input => [input.id, input]));
    this._outputs = outputs;
    this._outputsMap = new Map(outputs.map(output => [output.id, output]));

    this._lang = lang;
  }

  /**
   * @param {string} id The identifier of the input
   * @returns {InputDescription}
   */
  getInput(id) {
    return this._inputsMap.get(id);
  }

  /**
   * @param {string} id The identifier of the output
   * @returns {OutputDescription}
   */
  getOutput(id) {
    return this._outputsMap.get(id);
  }

  /**
   * @readonly
   */
  get inputs() {
    return this._inputs;
  }

  /**
   * @readonly
   */
  get outputs() {
    return this._outputs;
  }

  /**
   * @readonly
   */
  get lang() {
    return this._lang;
  }
}

export class Capabilities {
  constructor({ version, processSummaries }) {
    this._version = version;
    this._processSummaries = processSummaries;
  }

  get version() {
    return this._version;
  }

  get processSummaries() {
    return this._processSummaries;
  }
}

export const jobStatusTypes = {
  SUCCEDED: 'Succeded',
  FAILED: 'Failed',
  ACCEPTED: 'Accepted',
  RUNNING: 'Running',
};

export class StatusInfo {
  constructor({ jobId, status, expirationDate, estimatedCompletion, nextPoll, percentCompleted }) {
    this._jobId = jobId;
    this._status = status;
    this._expirationDate = expirationDate;
    this._estimatedCompletion = estimatedCompletion;
    this._nextPoll = nextPoll;
    this._percentCompleted = percentCompleted;
  }

  /**
   * @readonly
   */
  get jobId() {
    return this._jobId;
  }

  /**
   * @readonly
   */
  get status() {
    return this._status;
  }

  /**
   * @readonly
   */
  get expirationDate() {
    return this._expirationDate;
  }

  /**
   * @readonly
   */
  get estimatedCompletion() {
    return this._estimatedCompletion;
  }

  /**
   * @readonly
   */
  get nextPoll() {
    return this._nextPoll;
  }

  /**
   * @readonly
   */
  get percentCompleted() {
    return this._percentCompleted;
  }

  /**
   * Boolean value, indicating whether the job is completed (either failed or succeded)
   * @readonly
   */
  get isCompleted() {
    return this.status === jobStatusTypes.FAILED || this.status === jobStatusTypes.SUCCEDED;
  }
}


export class Output {
  constructor({ id, data, reference, subOutputs }) {
    this._id = id;
    this._data = data;
    this._reference = reference;
    this._subOutputs = subOutputs;
  }
}


export class Result {
  constructor({ jobId, expirationDate, outputs }) {
    this._jobId = jobId;
    this._expirationDate = expirationDate;
    this._outputs = outputs;
  }

  /**
   * @readonly
   */
  get jobId() {
    return this._jobId;
  }

  /**
   * @readonly
   */
  get expirationDate() {
    return this._expirationDate;
  }

  /**
   * @readonly
   */
  get outputs() {
    return this._outputs;
  }
}
