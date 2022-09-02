import React, { FC, useEffect, useState, useCallback, useRef } from 'react';

import './Message.scss';

type PropsType = {
  onSubmit: (message: string) => void;
};

const ElementControlFlowMessage: FC<PropsType> = ({ onSubmit }: PropsType) => {
  const [value, setValue] = useState<string>('');
  const isReady = useRef(false);
  const changeHandler = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (isReady.current) setValue(event.target.value);
  }, []);

  const submitHandler = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onSubmit(value);
  }, [onSubmit, value]);

  useEffect(() => {
    const readyTimeout = setTimeout(() => {
      isReady.current = true;
    }, 10);
    return () => {
      clearTimeout(readyTimeout);
    };
  }, []);

  return (
    <form className="ElementControlFlowMessage" onSubmit={submitHandler}>
      <input
        autoFocus
        className="ElementControlFlowMessage__input"
        onChange={changeHandler}
        value={value}
        type="text"
      />
    </form>
  );
};

export default ElementControlFlowMessage;
