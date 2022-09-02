import StateType from '../StateType';

export const checkShown = (
  state: StateType, tip: string,
): boolean => Boolean(state.tips.shown[tip]);
