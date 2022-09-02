import * as Buffer from 'buffer';

export default interface IMessage {
  id: number
  data: string | Buffer
}
