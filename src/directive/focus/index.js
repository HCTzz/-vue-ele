import focusOnCondition from './focusOnCondition'

const install = function(Vue) {
  Vue.directive('focus-on-condition', focusOnCondition)
}

if (window.Vue) {
  window['focus-on-condition'] = focusOnCondition
  Vue.use(install); // eslint-disable-line
}

focusOnCondition.install = install
export default focusOnCondition
