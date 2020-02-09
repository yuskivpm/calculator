import React from 'react';
import ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader/root';
import './index.scss';

import App from './components/app';

const AppWithHot = hot(App);
const rootNode = document.getElementById('root');

ReactDOM.render(<AppWithHot />, rootNode);
