export class Job extends Promise {
  constructor(id, initialInfo = {}) {
    this._id = id;
    this._result = null;
    this.updateInfo(initialInfo);
  }

  get result() {
    return this._result;
  }

  updateInfo({ statusUrl, status, nextPoll, estimatedCompletion, percentCompleted }) {
    this._statusUrl = statusUrl;
    this._status = status;
    this._nextPoll = nextPoll;
    this._estimatedCompletion = estimatedCompletion;
    this._percentCompleted = percentCompleted;
  }

  setResult(result) {
    if (!this._result) {
      this._result = result;
      this.resolve(result);
    } else {
      throw new Error('Result was already set');
    }
  }
}
