import IWorldBridge from '@common/World/IWorldBridge';
import {
  ADD_ELEMENT, BACK, FORWARD, INIT, MESSAGE, REMOVE_ELEMENT, ROTATE_LEFT, ROTATE_RIGHT,
  UPDATE_ELEMENT, VIEW_ANGLE, PUSH, PULL, BITE_OFF, BREAK, COMBINE, COLLISION, LEFT, RIGHT,
} from '@common/World/constants/events';
import IElement from '@common/World/elements/IElement';
import { elementFactory } from '@common/World/elements';
import { BaseParamsType } from '@common/World/types/elemets';
import IEventEmitter from '@common/EventEmitter/IEventEmitter';
import EventEmitter from '@common/EventEmitter';

class WorldBridge extends EventEmitter implements IWorldBridge, IEventEmitter {
  private static instance?: IWorldBridge;

  public static get(port?: number, host?: string): IWorldBridge {
    if (!WorldBridge.instance && port && host) WorldBridge.instance = new WorldBridge(port, host);
    if (WorldBridge.instance) return WorldBridge.instance;
    throw new Error('WorldBridge is already initialized');
  }

  public elements: IElement[] = [];

  private socket: WebSocket;

  private isInitialized = false;

  private initPromise?: Promise<boolean>;

  private initResolve?: (data: boolean) => void;

  private initReject?: (err: Error) => void;

  private constructor(port: number, host: string) {
    super();
    this.socket = new WebSocket(`ws://${host}:${port}`);
    this.socket.addEventListener('message', this.onSocketMessage);
    this.initPromise = this.init();
  }

  init = (): Promise<boolean> => {
    const { initPromise } = this;
    if (initPromise) return initPromise;
    return new Promise<boolean>((resolve, reject) => {
      this.initResolve = resolve;
      this.initReject = reject;
    });
  };

  private onInitElements = (json: { [key: string]: any }): void => {
    const { initResolve, initReject } = this;
    const { elementParamList } = json;
    if (!elementParamList) return initReject ? initReject(new Error('broken data')) : undefined;
    const list = (elementParamList as BaseParamsType[]).map((params): IElement | undefined => {
      return elementFactory(params, 'left');
    });
    if (list.some((element) => !element)) {
      console.log('some elements not created', elementParamList);
      return initReject ? initReject(new Error('broken data')) : undefined;
    }
    this.elements = list as IElement[];
    this.isInitialized = true;
    return initResolve ? initResolve(true) : undefined;
  };

  private onAddElement = (json: { [key: string]: any }): void => {
    const { params } = json;
    if (!params) return;
    const element = elementFactory(params, 'left');
    if (element) this.elements.push(element);
    this.emit(ADD_ELEMENT, params);
  };

  private onRemoveElement = (json: { [key: string]: any }): void => {
    const { elements } = this;
    const { id } = json;
    if (!id) return;
    const index = elements.findIndex((element) => element.id === id);
    if (index >= 0) elements.splice(index, 1);
    this.emit(REMOVE_ELEMENT, id);
  };

  private onUpdateElement = (json: { [key: string]: any }): void => {
    const { elements } = this;
    const { params } = json;
    const id = params?.id;
    if (!id) return;
    const element = elements.find((e) => e.id === id);
    if (!element) return;
    element.updateParams(params);
    this.emit(UPDATE_ELEMENT, params);
  };

  private onCollision = (json: { [key: string]: any }): void => {
    const { params } = json;
    this.emit(COLLISION, params);
  };

  private onMessage = (json: { [key: string]: any }): void => {
    const { params } = json;
    this.emit(MESSAGE, params);
  };

  private onSocketMessage = (event: MessageEvent): void => {
    const { data } = event;
    try {
      const json = JSON.parse(data);
      const { type } = json;
      const processor = ({
        [INIT]: this.onInitElements,
        [ADD_ELEMENT]: this.onAddElement,
        [REMOVE_ELEMENT]: this.onRemoveElement,
        [UPDATE_ELEMENT]: this.onUpdateElement,
        [COLLISION]: this.onCollision,
        [MESSAGE]: this.onMessage,
      } as { [key: string]: (data: any) => void })[type];
      if (processor) processor(json);
    } catch (e) {
      console.log('message error', e);
    }
  };

  private getElement(data: number | IElement): IElement | undefined {
    if (typeof data === 'number') {
      const { elements } = this;
      return elements.find((element) => element.id === data);
    }
    return data;
  }

  private send(data: { [key: string]: any }): void {
    this.socket.send(JSON.stringify(data));
  }

  removeElement(id: number): void {
    if (!this.isInitialized) return;
    this.send({ type: REMOVE_ELEMENT, id });
  }

  addElement(params: BaseParamsType): void {
    if (!this.isInitialized) return;
    this.send({ type: ADD_ELEMENT, params });
  }

  updateElement(params: BaseParamsType): void {
    if (!this.isInitialized) return;
    this.send({ type: UPDATE_ELEMENT, params });
  }

  forward(data: number | IElement, step: number): void {
    const element = this.getElement(data);
    if (element) this.send({ type: FORWARD, id: element.id, step });
  }

  back(data: number | IElement, step: number): void {
    const element = this.getElement(data);
    if (element) this.send({ type: BACK, id: element.id, step });
  }

  left(data: number | IElement, step: number): void {
    const element = this.getElement(data);
    if (element) this.send({ type: LEFT, id: element.id, step });
  }

  right(data: number | IElement, step: number): void {
    const element = this.getElement(data);
    if (element) this.send({ type: RIGHT, id: element.id, step });
  }

  rotateLeft(data: number | IElement, step: number): void {
    const element = this.getElement(data);
    if (element) this.send({ type: ROTATE_LEFT, id: element.id, step });
  }

  rotateRight(data: number | IElement, step: number): void {
    const element = this.getElement(data);
    if (element) this.send({ type: ROTATE_RIGHT, id: element.id, step });
  }

  viewAngle(data: number | IElement, viewAngle: number): void {
    const element = this.getElement(data);
    if (element) this.send({ type: VIEW_ANGLE, id: element.id, viewAngle });
  }

  message(data: number | IElement, params: { text: string; volume: number }): void {
    const element = this.getElement(data);
    if (element) {
      this.send({
        type: MESSAGE, id: element.id, params: { message: params.text, volume: params.volume },
      });
    }
  }

  elementAction(
    data: number | IElement,
    params: {
      action: 'push'| 'pull' | 'biteOff' | 'break' | 'combine',
      executor: number,
      additional?: number,
      force?: number,
    },
  ): void {
    const element = this.getElement(data);
    const { action, executor, additional, force = 1 } = params;
    if (!element) return;
    if (action === PUSH) this.send({ type: PUSH, id: element.id, executor, force });
    if (action === PULL) this.send({ type: PULL, id: element.id, executor, force });
    if (action === BITE_OFF) this.send({ type: BITE_OFF, id: element.id, executor, force });
    if (action === BREAK) this.send({ type: BREAK, id: element.id, executor });
    if (action === COMBINE && additional) {
      this.send({ type: COMBINE, id: element.id, additional, executor });
    }
  }

  destroy(): void {
    this.socket.close();
    this.clear();
    WorldBridge.instance = undefined;
  }
}

export default WorldBridge;
