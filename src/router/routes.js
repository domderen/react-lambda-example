import Immutable from 'immutable';

import HomePage from '../components/HomePage/HomePage';

export const homeRoute = 'home';

export const config = Immutable.fromJS([
  [HomePage, { name: homeRoute }, { path: '/' }],
  [HomePage, { name: 'homePage' }, { path: '/home'}],
]);
