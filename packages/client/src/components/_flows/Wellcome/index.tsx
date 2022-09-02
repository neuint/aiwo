import React, { FC, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ModalComponent } from '@neuint/modals-plugin-react';

import './index.scss';

import useTranslation from '@hooks/useTranslation';
import { getWrite } from '@root/utils/terminal';
import appConfig from '@root/appConfig.json';
import { IP_PATTER } from '@common/constants/patterns';
import { connectionConnect } from '@ducks/connection';
import { checkConnected, getConnectError, getHost } from '@ducks/connection/selectors';
import { tipsShown } from '@ducks/tips';
import { checkShown } from '@ducks/tips/selectors';
import { WELLCOME_HELP } from '@root/constants/tips';
import StateType from '@root/ducks/StateType';
import { CommonPropsType } from '@root/components/_flows/types';

type PropsType = CommonPropsType & {
  onConnect: () => void;
};

const WellcomeFlow: FC<PropsType> = (
  { setWrite, setFlows, setModal, onConnect }: PropsType,
) => {
  const connected = useSelector(checkConnected);
  const connectError = useSelector(getConnectError);
  const host = useSelector(getHost);
  const isHelpShown = useSelector((state: StateType) => checkShown(state, WELLCOME_HELP));
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const connect = useCallback((serverHost: string) => {
    setModal(
      <ModalComponent>
        <div className="WellcomeFlow__center">
          {t('_flows.wellcome.connecting', { serverHost })}
        </div>
      </ModalComponent>,
    );
    dispatch(connectionConnect({ host: serverHost }));
  }, [setModal, dispatch, t]);

  const handler = useCallback((data: { [key: string]: string }) => {
    const serverHost = data.response ? data.response : appConfig.defaultServer;

    if (IP_PATTER.test(serverHost)) {
      connect(serverHost);
      return Promise.resolve(undefined);
    }
    return Promise.resolve({ to: '0|incorrect' });
  }, [connect]);

  useEffect(() => {
    if (connected) {
      setModal();
      onConnect();
      setWrite(getWrite([
        { value: t('_flows.wellcome.connected.0', { serverHost: host }), withSubmit: true },
        ...(isHelpShown ? [] : [
          t('_flows.wellcome.connected.1'),
          { str: t('_flows.wellcome.connected.2'), className: 'WellcomeFlow__accent' },
          { value: t('_flows.wellcome.connected.3'), withSubmit: true },
        ]),
      ]));
    }
  }, [t, host, connected, isHelpShown, onConnect, setModal, setWrite]);

  useEffect(() => {
    if (connected && !isHelpShown) dispatch(tipsShown(WELLCOME_HELP));
  }, [connected, isHelpShown, dispatch]);

  useEffect(() => {
    if (connectError) {
      setModal();
      setFlows({
        connectError: [{
          handler,
          autostart: true,
          variableName: 'response',
          write: getWrite([
            { value: t('_flows.wellcome.connectionError'), withSubmit: true },
            { str: t('_flows.wellcome.initQuestion'), lock: true },
          ]),
        }],
      });
    }
  }, [t, handler, connectError, setModal, setFlows]);

  useEffect(() => {
    setFlows({
      wellcome: [
        {
          handler,
          autostart: true,
          variableName: 'response',
          write: getWrite([
            t('_flows.wellcome.initMessage.0'),
            { str: t('_flows.wellcome.initMessage.1'), className: 'WellcomeFlow__accent' },
            { value: t('_flows.wellcome.initMessage.2'), withSubmit: true },
            { str: t('_flows.wellcome.initQuestion'), lock: true },
          ]),
        },
      ],
      incorrect: [
        {
          handler,
          variableName: 'response',
          write: getWrite([{ str: t('_flows.wellcome.initQuestion'), lock: true }]),
        },
      ],
    });
  }, [setWrite, setFlows, t, handler]);
  return null;
};

export default WellcomeFlow;
