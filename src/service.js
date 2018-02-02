// import { sendRequest } from './utils';
import { getCapabilities } from './capabilities';
import { Protocol as ProtocolV10 } from './v10/protocol';
import { Protocol as ProtocolV20 } from './v20/protocol';


export class Service {
  constructor(capabilities, protocol) {
    this._capabilities = capabilities;
    this._protocol = protocol;
    this._processDescription = {};
  }

  async getProcessDescription(id) {
    let description = this._processDescriptions[id];
    if (!description) {
      const newDescriptions = await this._protocol.describeProcess(id);
      for (const newDescription of newDescriptions) {
        this._processDescriptions[newDescription.id] = newDescription;
      }
      description = this._processDescriptions[id];
    }
    return await description;
  }

  async execute(id, inputs, outputs) {
    const process = this.getProcessDescription(id);
    return process.execute(inputs, outputs);
  }

  static async discover(url, full = false) {
    const capabilities = await getCapabilities(url);

    let protocol = null;
    if (capabilities.version.startsWith('2.0')) {
      protocol = new ProtocolV20();
    } else if (capabilities.version.startsWith('1.0')) {
      protocol = new ProtocolV10();
    }
    return new Service(capabilities, protocol);
  }
}

const discover = Service.discover;

export { discover };
