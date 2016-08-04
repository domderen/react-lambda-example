import Immutable from 'immutable';

import HomePage from '../components/HomePage/HomePage';
// import the other pages here. pick up here.

export const homeRoute = 'home';

// add the other pages here also
export const config = Immutable.fromJS([
  [HomePage, { name: homeRoute }, { path: '/' }],
  [HomePage, { name: 'homePage' }, { path: '/home'}],
]);
