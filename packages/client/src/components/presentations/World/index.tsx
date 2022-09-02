/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect } from 'react';
import cn from 'classnames';
import { noop } from 'lodash';

import './World.scss';

import logo from '@root/assets/svg/logo.svg';
import WorldElementPower from '@containers/WorldElementPower';

type PropsType = {
  className?: string;
  waiting: boolean;
  onPointerMove?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseDown?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onWheel?: (event: WheelEvent) => void;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onResize?: () => void;
};

const World = React.forwardRef<HTMLDivElement, PropsType>((
  {
    className, waiting, onPointerMove, onMouseDown, onMouseUp, onMouseLeave, onWheel, onClick,
    onResize,
  }: PropsType,
  ref,
) => {
  const { current } = ref as { current: HTMLDivElement };
  useEffect(() => {
    if (!current || !onResize) return noop;
    const resizeObserver = new ResizeObserver(() => {
      onResize();
    });
    resizeObserver.observe(current as HTMLDivElement);
    return (): void => {
      resizeObserver.unobserve(current);
    };
  }, [current, onResize]);

  useEffect(() => {
    if (!current || !onWheel) return noop;
    current.addEventListener('wheel', onWheel);
    return (): void => {
      current.removeEventListener('wheel', onWheel);
    };
  }, [current, onWheel]);

  return (
    <div className={cn('World', className)}>
      <div
        ref={ref}
        className="World__container"
        onPointerMove={onPointerMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      />
      {waiting && (
        <div className="World__logoContainer">
          <img className="World__logo" src={logo} alt="" />
        </div>
      )}
      <WorldElementPower />
    </div>
  );
});

World.displayName = 'World';

export default World;
