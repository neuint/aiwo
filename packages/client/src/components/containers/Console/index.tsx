import React, { FC, useState, useCallback, useMemo } from 'react';

import '@neuint/term-js-react/dist/index.css';
import '@neuint/status-bar-plugin-react/dist/index.css';
import '@neuint/history-search-plugin-react/dist/index.css';
import '@neuint/command-search-plugin-react/dist/index.css';
import '@neuint/modals-plugin-react/dist/index.css';

import TermComponent, { WriteType } from '@neuint/term-js-react';
import HistorySearchComponent from '@neuint/history-search-plugin-react';
import CommandSearchComponent from '@neuint/command-search-plugin-react';
import FlowsComponent, { FlowsType } from '@neuint/flows-plugin-react';
import ModalsComponent from '@neuint/modals-plugin-react';

import WellcomeFlow from '@flows/Wellcome';
import HelpFlow from '@flows/Help';
import ElementFlow from '@root/components/_flows/Element';
import WorldFlow from '@root/components/_flows/World';
import { DELIMITER } from '@constants/terminal';
import ConsoleStatusBar from '@containers/ConsoleStatusBar';
import ConsoleAutoFocus from '@containers/ConsoleAutoFocus';

type PropsType = {
  disabled?: boolean;
};

const Console: FC<PropsType> = ({ disabled }: PropsType) => {
  const [flows, setFlows] = useState<FlowsType | undefined>();
  const [commands, setCommands] = useState<string[]>([]);
  const [tempCommands, setTempCommands] = useState<{
    list: string[], selected?: string,
  } | undefined>();
  const [write, setWrite] = useState<WriteType>();
  const [modal, setModal] = useState<React.ReactNode | undefined>();
  const [showWellcome, setShowWellcome] = useState<boolean>(true);

  const updateTempCommands = useCallback((list: string[] | undefined, selected?: string) => {
    setTempCommands(list ? { list, selected } : undefined);
  }, [setTempCommands]);

  const onConnect = useCallback(() => {
    setFlows({});
    setShowWellcome(false);
  }, [setFlows]);

  const addFlow = useCallback((additionalFlow: FlowsType) => {
    setFlows((prevFlows) => {
      return { ...prevFlows, ...additionalFlow };
    });
  }, [setFlows]);

  const addCommands = useCallback((additionalCommands: string[]) => {
    setCommands((prevCommands) => {
      return [...prevCommands, ...additionalCommands];
    });
  }, [setCommands]);

  const rootFlowProps = useMemo(() => ({
    setWrite,
    setFlows,
    setCommands,
    setModal,
    addFlow,
    addCommands,
    setTempCommands: updateTempCommands,
  }), [
    setWrite, setFlows, setCommands, setModal, addFlow, addCommands, updateTempCommands,
  ]);

  return (
    <>
      <TermComponent
        disabled={disabled}
        write={write}
        delimiter={DELIMITER}
      >
        <ConsoleStatusBar />
        <ConsoleAutoFocus modalOpened={Boolean(modal)} />
        <FlowsComponent flows={flows} />
        <HistorySearchComponent />
        <CommandSearchComponent
          commands={tempCommands?.list || commands}
          autoOpen={Boolean(tempCommands)}
        />
        <ModalsComponent>
          {modal}
        </ModalsComponent>
      </TermComponent>
      {showWellcome ? (
        <WellcomeFlow {...rootFlowProps} onConnect={onConnect} />
      ) : (
        <>
          <HelpFlow {...rootFlowProps} />
          <ElementFlow {...rootFlowProps} />
          <WorldFlow {...rootFlowProps} />
        </>
      )}
    </>
  );
};

export default Console;
