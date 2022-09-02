import { FC, useCallback, useMemo } from 'react';
import { StepResultType } from '@neuint/flows-plugin';

import './ConfirmationStep.scss';

import useTranslation from '@hooks/useTranslation';
import { StepPropsType } from '@root/components/_flows/types';
import { getWrite } from '@root/utils/terminal';
import useStep from '../../_hooks/useStep';

type PropsType = StepPropsType & {
  question: string;
  type: 'common' | 'warning' | 'danger',
  onSubmit?: (
    data: { [key: string]: string }, value: boolean,
  ) => void | Promise<StepResultType | undefined>;
};

const ConfirmationStep: FC<PropsType> = (props: PropsType) => {
  const { t } = useTranslation();
  const { name, type, onSubmit, question, before } = props;

  const checkYes = useCallback((value: string): boolean => {
    const yesText = t('ConfirmationStep.yes');
    if (!value) return true;
    if (value.length > yesText.length) return false;
    return new RegExp(`^${value}`, 'i').test(yesText);
  }, [t]);

  const checkNo = useCallback((value: string): boolean => {
    const noText = t('ConfirmationStep.no');
    if (value.length > noText.length) return false;
    return new RegExp(`^${value}`, 'i').test(noText);
  }, [t]);

  const submitHandler = useCallback((
    data: { [key: string]: string }, stepIndex: number,
  ): Promise<StepResultType | undefined> => {
    const to = String(stepIndex);
    const itemData = data[name].trim();
    if (checkYes(itemData)) {
      // eslint-disable-next-line no-param-reassign
      data[name] = 'yes';
      const result = onSubmit ? onSubmit(data, true) : undefined;
      return result instanceof Promise ? result : Promise.resolve(undefined);
    }
    if (checkNo(itemData)) {
      // eslint-disable-next-line no-param-reassign
      data[name] = 'no';
      const result = onSubmit ? onSubmit(data, false) : undefined;
      return result instanceof Promise ? result : Promise.resolve(undefined);
    }
    return Promise.resolve({ to });
  }, [checkYes, checkNo, onSubmit, name]);

  let mainClass = '';
  if (type === 'warning') mainClass = 'ConfirmationStep__warning';
  if (type === 'danger') mainClass = 'ConfirmationStep__danger';

  const step = useMemo(() => ({
    before,
    onSubmit: submitHandler,
    write: getWrite([
      {
        value: {
          str: t('ConfirmationStep.question', { question }),
          className: mainClass,
        },
      },
      {
        value: {
          str: t('ConfirmationStep.yes'),
          className: [mainClass, 'ConfirmationStep__yes'].join(' '),
        },
      },
      {
        value: {
          str: t('ConfirmationStep.no'),
          className: [mainClass, 'ConfirmationStep__no'].join(' '),
          lock: true,
        },
      },
      {
        value: { str: t('_common.space'), lock: true },
      },
    ], 'fast'),
  }), [mainClass, question, submitHandler, t, before]);

  useStep(props, step);
  return null;
};

export default ConfirmationStep;
