import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import 'normalize.css/normalize.css';
import './styles/variables.scss';
import './styles/colors.scss';
import './styles/index.scss';

import App from '@containers/App';
import { getStore } from '@root/store';
import useTranslation from '@hooks/useTranslation';

const store = getStore();

const Root = (): React.ReactElement | null => {
  const { ready } = useTranslation();
  return ready ? (
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  ) : null;
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Root />);
}
