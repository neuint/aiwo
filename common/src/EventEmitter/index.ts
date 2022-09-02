import IEventEmitter from './IEventEmitter';

export default class EventEmitter implements IEventEmitter {
  private eventMap: { [key: string]: Array<(...args: any[]) => void> } = {};

  protected emit(event: string, data?: any) {
    const list = this.eventMap[event];
    if (list) list.forEach((callback) => callback(data));
  }

  addEventListener(event: string, callback: (...args: any[]) => void) {
    const { eventMap } = this;
    if (!eventMap[event]) eventMap[event] = [];
    eventMap[event].push(callback);
  }

  removeEventListener(event: string, callback: (...args: any[]) => void) {
    const { eventMap } = this;
    if (eventMap[event]) {
      const index = eventMap[event].indexOf(callback);
      if (index) eventMap[event].splice(index, 1);
    }
  }

  clear() {
    this.eventMap = {};
  }
}
