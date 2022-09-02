import http from 'http';
import { isObject } from 'lodash';
import { EventEmitter } from 'events';
import { server as WSServer } from 'websocket';

import { log } from '../utils/logger';
import { CONNECT, READY, MESSAGE, DISCONNECT } from './constants/events';
import IConnection from './interfaces/IConnection';
import IMessage from './interfaces/IMessage';
import { MessageType } from './types';

class Server extends EventEmitter {
  private port = 0;
  private server?: http.Server;
  private wsServer?: WSServer;
  private nextConnectionId = 1;
  private connections: Map<number, IConnection> = new Map<number, IConnection>();

  constructor(port: number) {
    super();
    this.port = port;
  }

  private checkOriginAllowed(origin: string) {
    return true;
  }

  addListener(eventName: 'ready', listener: () => void): this;
  addListener(eventName: 'connect', listener: (connection: IConnection) => void): this;
  addListener(eventName: 'message', listener: (message: IMessage) => void): this;
  addListener(eventName: 'disconnect', listener: (message: number) => void): this;
  addListener(
    eventName: 'ready' | 'connect' | 'message' | 'disconnect', listener: (...args: any[]) => void,
  ): this {
    return super.addListener(eventName, listener);
  }

  broadcast(data: MessageType) {
    try {
      const message = isObject(data) ? JSON.stringify(data) : String(data);
      this.connections.forEach(({ connection }) => connection.sendUTF(message));
    } catch (e) {
      log('send error', (e as Error).message);
    }
  }

  send(id: number, data: MessageType) {
    try {
      const connection = this.connections.get(id);
      if (connection) {
        connection.connection.sendUTF(isObject(data) ? JSON.stringify(data) : String(data));
      }
    } catch (e) {
      log('send to error', id, (e as Error).message);
    }
  }

  async init() {
    const { port } = this;
    return new Promise((resolve, reject) => {
      const server = http.createServer((request, response) => {
        log(`Received request for ${request.url}`);
        response.writeHead(404);
        response.end();
      });

      server.listen(port, () => {
        log(`Server is listening on port ${port}`);
        this.emit(READY);
        resolve(server);
      });

      server.on('error', (err: Error) => {
        reject(err);
      });

      const wss = new WSServer({
        httpServer: server,
        autoAcceptConnections: false,
      });

      wss.on('request', (request) => {
        if (this.checkOriginAllowed(request.origin)) {
          const connection = {
            connection: request.accept(null, request.origin),
            id: this.nextConnectionId
          };
          this.nextConnectionId += 1;
          this.connections.set(connection.id, connection);
          this.emit(CONNECT, connection);
          connection.connection.on('message', (message) => {
            if (message.type === 'utf8') {
              this.emit(MESSAGE, { id: connection.id, data: message.utf8Data } as IMessage);
            } else if (message.type === 'binary') {
              this.emit(MESSAGE, { id: connection.id, data: message.binaryData } as IMessage);
            }
          });
          connection.connection.on('close', () => {
            this.connections.delete(connection.id);
            this.emit(DISCONNECT, connection.id);
          });
        } else {
          request.reject();
          log(`Connection from origin ${request.origin} rejected`);
        }
      });
      this.server = server;
      this.wsServer = wss;
    });
  }
}

export default Server;
