import { connection } from 'websocket';

export default interface IConnection {
  id: number
  connection: connection,
}
