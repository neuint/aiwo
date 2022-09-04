import React, { FC } from 'react';
import { IModals } from '@neuint/modals-plugin';
import { ModalComponent } from '@neuint/modals-plugin-react';

import './Modal.scss';

import useTranslation from '@hooks/useTranslation';

type PropsType = {
  onClose: () => void;
  plugin?: IModals;
};

const ElementControlFlowModal: FC<PropsType> = ({ onClose, plugin }: PropsType) => {
  const { t } = useTranslation();
  return (
    <ModalComponent
      overlayHide
      plugin={plugin}
      onClose={onClose}
      title={t('ElementControlFlowModal.title')}
    >
      <div className="ElementControlFlowModal__pair">
        <div className="ElementControlFlowModal__key">
          {t('ElementControlFlowModal.w')}
        </div>
        <div className="ElementControlFlow__description">
          {t('ElementControlFlowModal.moveForward')}
        </div>
      </div>
      <div className="ElementControlFlowModal__pair">
        <div className="ElementControlFlowModal__key">
          {t('ElementControlFlowModal.s')}
        </div>
        <div className="ElementControlFlow__description">
          {t('ElementControlFlowModal.moveBackward')}
        </div>
      </div>
      <div className="ElementControlFlowModal__pair">
        <div className="ElementControlFlowModal__key">
          {t('ElementControlFlowModal.a')}
        </div>
        <div className="ElementControlFlow__description">
          {t('ElementControlFlowModal.rotateCounterclockwise')}
        </div>
      </div>
      <div className="ElementControlFlowModal__pair">
        <div className="ElementControlFlowModal__key">
          {t('ElementControlFlowModal.d')}
        </div>
        <div className="ElementControlFlow__description">
          {t('ElementControlFlowModal.rotateClockwise')}
        </div>
      </div>
      <div className="ElementControlFlowModal__pair">
        <div className="ElementControlFlowModal__key">
          {t('ElementControlFlowModal.shiftPlusA')}
        </div>
        <div className="ElementControlFlow__description">
          {t('ElementControlFlowModal.moveLeft')}
        </div>
      </div>
      <div className="ElementControlFlowModal__pair">
        <div className="ElementControlFlowModal__key">
          {t('ElementControlFlowModal.shiftPlusD')}
        </div>
        <div className="ElementControlFlow__description">
          {t('ElementControlFlowModal.moveRight')}
        </div>
      </div>
      <div className="ElementControlFlowModal__pair">
        <div className="ElementControlFlowModal__key">
          {t('ElementControlFlowModal.space')}
        </div>
        <div className="ElementControlFlow__description">
          {t('ElementControlFlowModal.combine')}
        </div>
      </div>
      <div className="ElementControlFlowModal__pair">
        <div className="ElementControlFlowModal__key">
          {t('ElementControlFlowModal.shiftPlusW')}
        </div>
        <div className="ElementControlFlow__description">
          {t('ElementControlFlowModal.push')}
        </div>
      </div>
      <div className="ElementControlFlowModal__pair">
        <div className="ElementControlFlowModal__key">
          {t('ElementControlFlowModal.shiftPlusS')}
        </div>
        <div className="ElementControlFlow__description">
          {t('ElementControlFlowModal.pull')}
        </div>
      </div>
      <div className="ElementControlFlowModal__pair">
        <div className="ElementControlFlowModal__key">
          {t('ElementControlFlowModal.q')}
        </div>
        <div className="ElementControlFlow__description">
          {t('ElementControlFlowModal.biteOff')}
        </div>
      </div>
      <div className="ElementControlFlowModal__pair">
        <div className="ElementControlFlowModal__key">
          {t('ElementControlFlowModal.e')}
        </div>
        <div className="ElementControlFlow__description">
          {t('ElementControlFlowModal.break')}
        </div>
      </div>
      <div className="ElementControlFlowModal__pair">
        <div className="ElementControlFlowModal__key">
          {t('ElementControlFlowModal.t')}
        </div>
        <div className="ElementControlFlow__description">
          {t('ElementControlFlowModal.message')}
        </div>
      </div>
      <div className="ElementControlFlowModal__pair">
        <div className="ElementControlFlowModal__key">
          {t('ElementControlFlowModal.esc')}
        </div>
        <div className="ElementControlFlow__description">
          {t('ElementControlFlowModal.clearSelection')}
        </div>
      </div>
      <div className="ModalView__exit">
        {t('_common.exitModal')}
      </div>
    </ModalComponent>
  );
};

export default ElementControlFlowModal;
