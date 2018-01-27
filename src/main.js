import Vue from 'vue'
// import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-default/index.css'
// import 'bulma/css/bulma.css'

// import "bulma/sass/utilities/_all.sass"
// import "bulma/sass/grid/columns.sass"

import './css/bulma.css'

import App from './App.vue'
import Suggestion from './Suggestion.vue'
import Search from './Search.vue'
// import Search2 from './Search2.vue'
import CustomSuggestion from './suggestions/autocomplete'
import Colors from './colors.css'

// import base from './base.css'
import loading from './loading.css'

// import pagination_css from './pagination/pagination.css'
import Pagination from './pagination/pagination.js'

// import autocomplete from './autocomplete.css'
// import input from './input.css'


import VueResource from 'vue-resource'
Vue.use(VueResource);

// import Vue_Responsive from 'vue-responsive'
// Vue.directive('responsiveness', Vue_Responsive);

// import MuseUI from 'muse-ui'
// import 'muse-ui/dist/muse-ui.css'
// Vue.use(MuseUI)

window['is_dev'] = JSON.stringify(process.env)

const EventBus = new Vue()
Object.defineProperties(Vue.prototype, {
  $bus: {
    get: function () {
      return EventBus
    }
  }
})

// Vue.use(ElementUI)
Vue.http.options.crossOrigin = true

Vue.component('ElAutocompleto', CustomSuggestion)
Vue.component('suggestion', Suggestion)
Vue.component('search', Search)
Vue.component('ElPagination', Pagination)
// Vue.component('search2', Search2)

new Vue({
  el: '#app',
  render: h => h(App)
})


