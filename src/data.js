const isRefSymbol = Symbol('isRef');
const isDataSymbol = Symbol('isData');

/**
 * Create a new reference object.
 * @param {string} href The URL for the referenced object.
 * @param {string} [options.mimeType] The mime type of the referenced object.
 * @param {string} [options.encoding] The encoding of the referenced object.
 * @param {string} [options.schema] The shema of the referenced object.
 * @param {any} [options.body] The request body to be sent when retrieving the referenced object.
 * @param {string} [options.bodyReferenceHref] The URL of the body to be used in requests when
 *                                             resolving the referenced object.
 * @returns {object} The created reference object.
 */
export function makeRef(href, { mimeType, encoding, schema, body, bodyReferenceHref } = {}) {
  return { href, mimeType, encoding, schema, body, bodyReferenceHref, [isRefSymbol]: true };
}

/**
 * Create a new reference object.
 * @param {*} data The included data.
 * @param {string} [options.mimeType] The mime type of the data.
 * @param {string} [options.encoding] The encoding of the data.
 * @param {string} [options.schema] The shema of the data.
 * @returns {object} The created data object.
 */
export function makeData(data, { mimeType, encoding, schema } = {}) {
  return { data, mimeType, encoding, schema, [isDataSymbol]: true };
}


/**
 * Checks whether the passed object is a reference object (created with {@link makeRef}).
 * @param {*} obj The value to check.
 * @returns {boolean} Whther the object is a reference object.
 */
export function isRef(obj) {
  return obj && obj[isRefSymbol] === true;
}

/**
 * Checks whether the passed object is a data object (created with {@link makeData}).
 * @param {*} obj The value to check.
 * @returns {boolean} Whther the object is a data object.
 */
export function isData(obj) {
  return obj && obj[isDataSymbol] === true;
}
