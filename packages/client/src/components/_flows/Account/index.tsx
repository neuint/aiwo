import { FC, useEffect } from 'react';
import { StepResultType } from '@neuint/flows-plugin';

import { getWrite } from '@root/utils/terminal';
import useTranslation from '@hooks/useTranslation';
import { CommonPropsType } from '@root/components/_flows/types';

const AccountFlow: FC<CommonPropsType> = (
  { addFlow, addCommands }: CommonPropsType,
) => {
  const { t } = useTranslation();
  useEffect(() => {
    addCommands([t('_flows.account.signIn')]);
    addFlow({
      [t('_flows.account.signIn')]: [
        {
          variableName: 'login',
          write: getWrite([
            { str: t('_flows.account.enterLogin'), lock: true },
          ]),
          handler: (data: { [key: string]: string }): Promise<StepResultType | undefined> => {
            return Promise.resolve(data.login ? undefined : { to: '0' });
          },
        },
        {
          variableName: 'password',
          secret: true,
          write: getWrite([
            { str: t('_flows.account.enterPassword'), lock: true },
          ]),
          handler: (data: { [key: string]: string }): Promise<StepResultType | undefined> => {
            return Promise.resolve(data.passworsid ? undefined : { to: '1' });
          },
        },
      ],
    });
  }, [t, addFlow, addCommands]);
  return null;
};

export default AccountFlow;
