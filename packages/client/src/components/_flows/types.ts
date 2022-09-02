import { ReactNode } from 'react';
import { WriteType } from '@neuint/term-js-react';
import { FlowsType } from '@neuint/flows-plugin-react';
import { StepType } from '@neuint/flows-plugin';

export type CommonPropsType = {
  setWrite: (data: WriteType) => void;
  setFlows: (flows: FlowsType) => void;
  addFlow: (flows: FlowsType) => void;
  setModal: (modal?: ReactNode) => void;
  setCommands: (commands: string[]) => void;
  addCommands: (commands: string[]) => void;
  setTempCommands: (commands?: string[], selected?: string) => void;
};

export type StepPropsType = CommonPropsType & {
  name: string;
  defaultValueKey?: string;
  addStep: (step: StepType) => number;
  replaceStep: (index: number, step?: StepType) => void;
  write?: ((data: { [key: string]: string }) => WriteType) | WriteType;
  onWrite?: () => void;
  onExit?: (data: { [key: string]: string }) => void;
  before?: (data: { [key: string]: string }) => WriteType | undefined;
};
