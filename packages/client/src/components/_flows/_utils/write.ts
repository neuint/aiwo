import { WriteType } from '@neuint/term-js-react';

import { getWrite } from '@root/utils/terminal';

export const getError = (str: string): WriteType => {
  return getWrite({
    value: { str, className: 'ElementFlow__warn' }, withSubmit: true,
  }, 'fast');
};
