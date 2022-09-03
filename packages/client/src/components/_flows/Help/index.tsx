import React, { FC, useEffect, useCallback } from 'react';
import { ModalComponent } from '@neuint/modals-plugin-react';

import './index.scss';

import { CommonPropsType } from '@root/components/_flows/types';
import useTranslation from '@hooks/useTranslation';

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
          <span className="HelpFlow__title">{t('AddElementFlow.add')}</span>
          <span className="HelpFlow__text">{t('HelpFlow.delimiter')}</span>
          <span className="HelpFlow__text">{t('AddElementFlow.addDescription')}</span>
        </div>
        <div className="HelpFlow__row">
          <span className="HelpFlow__title">{t('RemoveElementFlow.remove')}</span>
          <span className="HelpFlow__text">{t('HelpFlow.delimiter')}</span>
          <span className="HelpFlow__text">{t('RemoveElementFlow.removeDescription')}</span>
        </div>
        <div className="HelpFlow__row">
          <span className="HelpFlow__title">{t('EditElementFlow.edit')}</span>
          <span className="HelpFlow__text">{t('HelpFlow.delimiter')}</span>
          <span className="HelpFlow__text">{t('EditElementFlow.editDescription')}</span>
        </div>
        <div className="HelpFlow__row">
          <span className="HelpFlow__title">{t('WorldClearSelectionFlow.clear')}</span>
          <span className="HelpFlow__text">{t('HelpFlow.delimiter')}</span>
          <span className="HelpFlow__text">{t('WorldClearSelectionFlow.clearDescription')}</span>
        </div>
        <div className="HelpFlow__row">
          <span className="HelpFlow__title">{t('ElementControlFlow.control')}</span>
          <span className="HelpFlow__text">{t('HelpFlow.delimiter')}</span>
          <span className="HelpFlow__text">{t('ElementControlFlow.controlDescription')}</span>
        </div>
        <div>{t('_common.exitModal')}</div>
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
