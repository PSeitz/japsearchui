import Vue from 'vue'
import './css/bulma.css'

import App from './App.vue'
import Suggestion from './Suggestion.vue'
import Search from './Search.vue'
import CustomSuggestion from './suggestions/autocomplete'
import Colors from './colors.css'

import loading from './loading.css'
import Pagination from './pagination/pagination.js'


import VueResource from 'vue-resource'
Vue.use(VueResource);


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


