import { FC, useEffect, useCallback } from 'react';
import { ITerm } from '@neuint/term-js';

type PropsType = {
  term?: ITerm;
  modalOpened: boolean;
};

const ConsoleAutoFocus: FC<PropsType> = ({ term, modalOpened }: PropsType) => {
  const keyDownHandler = useCallback(() => {
    if (modalOpened || term?.focused || term?.disabled) {
      return;
    }
    term?.focus();
  }, [modalOpened, term]);

  useEffect(() => {
    window.addEventListener('keydown', keyDownHandler);
    return () => {
      window.removeEventListener('keydown', keyDownHandler);
    };
  }, [keyDownHandler]);

  return null;
};

export default ConsoleAutoFocus;
