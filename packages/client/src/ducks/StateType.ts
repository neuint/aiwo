import type { StateType as ConnectionStateType } from '@root/ducks/connection';
import type { StateType as TipsStateType } from '@root/ducks/tips';
import type { StateType as WorldStateType } from '@root/ducks/world';

type StateType = {
  connection: ConnectionStateType;
  tips: TipsStateType;
  world: WorldStateType;
};

export default StateType;
