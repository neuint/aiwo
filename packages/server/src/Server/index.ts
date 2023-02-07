import http from 'http';
import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
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
  private app: Koa = new Koa();
  private appRouter: Router = new Router();
  private nextConnectionId = 1;
  private connections: Map<number, IConnection> = new Map<number, IConnection>();

  get router(): Router {
    return this.appRouter;
  }

  constructor(port: number) {
    super();
    this.port = port;
    this.app
      .use(bodyParser())
      .use(async (ctx, next) => {
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
        ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        ctx.set('Content-Type', 'application/json');
        if (ctx.method === 'OPTIONS') {
          ctx.status = 200;
          ctx.body = '';
          return;
        }
        return next();
      })
      .use(this.appRouter.routes())
      .use(this.appRouter.allowedMethods());
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
      const server = http.createServer(this.app.callback());

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
