import React, { FC, useEffect, useCallback } from 'react';
import { ModalComponent } from '@neuint/modals-plugin-react';

import './index.scss';

import { CommonPropsType } from '@root/components/_flows/types';
import useTranslation from '@hooks/useTranslation';
import { IS_MAC } from '@root/utils/bowser';

type PropsType = CommonPropsType;

const HelpFlow: FC<PropsType> = ({ setFlows, setModal, addCommands }: PropsType) => {
  const { t } = useTranslation();

  const onClose = useCallback(() => {
    setModal();
  }, [setModal]);

  const showModal = useCallback(() => {
    setModal(
      <ModalComponent
        escHide
        overlayHide
        onClose={onClose}
        title={t('HelpFlow.title')}
      >
        <div className="HelpFlow__row">
          <div className="HelpFlow__title">{t('AddElementFlow.add')}</div>
          <div className="HelpFlow__text">{t('AddElementFlow.addDescription')}</div>
        </div>
        <div className="HelpFlow__row">
          <div className="HelpFlow__title">{t('RemoveElementFlow.remove')}</div>
          <div className="HelpFlow__text">{t('RemoveElementFlow.removeDescription')}</div>
        </div>
        <div className="HelpFlow__row">
          <div className="HelpFlow__title">{t('EditElementFlow.edit')}</div>
          <div className="HelpFlow__text">{t('EditElementFlow.editDescription')}</div>
        </div>
        <div className="HelpFlow__row">
          <div className="HelpFlow__title">{t('WorldClearSelectionFlow.clear')}</div>
          <div className="HelpFlow__text">{t('WorldClearSelectionFlow.clearDescription')}</div>
        </div>
        <div className="HelpFlow__row">
          <div className="HelpFlow__title">{t('ElementControlFlow.control')}</div>
          <div className="HelpFlow__text">{t('ElementControlFlow.controlDescription')}</div>
        </div>
        <div className="HelpFlow__row">
          <div className="HelpFlow__title">{t(IS_MAC ? 'HelpFlow.cmdB' : 'HelpFlow.ctrlB')}</div>
          <div className="HelpFlow__text">{t('HelpFlow.toggleConsole')}</div>
        </div>
        <div className="HelpFlow__row">
          <div className="HelpFlow__title">{t(IS_MAC ? 'HelpFlow.cmdY' : 'HelpFlow.ctrlY')}</div>
          <div className="HelpFlow__text">{t('HelpFlow.historySearch')}</div>
        </div>
        <div className="HelpFlow__row">
          <div className="HelpFlow__title">{t('HelpFlow.tab')}</div>
          <div className="HelpFlow__text">{t('HelpFlow.commandSearch')}</div>
        </div>
        <div className="HelpFlow__exit">{t('_common.exitModal')}</div>
      </ModalComponent>,
    );
    return Promise.resolve(undefined);
  }, [setModal, onClose, t]);

  useEffect(() => {
    addCommands([t('HelpFlow.help')]);
    setFlows({
      help: [{
        onEnter: showModal,
      }],
    });
  }, [t, setFlows, showModal, addCommands]);
  return null;
};

export default HelpFlow;
