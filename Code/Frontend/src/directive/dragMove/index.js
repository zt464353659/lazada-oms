import dragMove from './dragMove'

const install = function(Vue) {
  Vue.directive('dragMove', dragMove)
}

if (window.Vue) {
  window['dragMove'] = dragMove
  Vue.use(install); // eslint-disable-line
}

dragMove.install = install
export default dragMove
