import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import App from './App.vue'
import Suggestion from './Suggestion.vue'
import Search from './Search.vue'
import Search2 from './Search2.vue'

import VueResource from 'vue-resource'
Vue.use(VueResource);

// import Vue_Responsive from 'vue-responsive'
// Vue.directive('responsiveness', Vue_Responsive);

// import MuseUI from 'muse-ui'
// import 'muse-ui/dist/muse-ui.css'
// Vue.use(MuseUI)

const EventBus = new Vue()
Object.defineProperties(Vue.prototype, {
  $bus: {
    get: function () {
      return EventBus
    }
  }
})

Vue.use(ElementUI)
Vue.http.options.crossOrigin = true

Vue.component('suggestion', Suggestion)
Vue.component('search', Search)
Vue.component('search2', Search2)

new Vue({
  el: '#app',
  render: h => h(App)
})


// new Vue({
//   el: '#suggestion',
//   render: h => h(Suggestion)
// })

// var Main = {
//     data() {
//       return {
//         links: [],
//         state1: '',
//         state2: ''
//       };
//     },
//     methods: {
//       querySearch(queryString, cb) {
//         var links = this.links;
//         var results = queryString ? links.filter(this.createFilter(queryString)) : links;
//         // call callback function to return suggestions
//         cb(results);
//       },
//       createFilter(queryString) {
//         return (link) => {
//           return (link.value.indexOf(queryString.toLowerCase()) === 0);
//         };
//       },
//       loadAll() {
//         return [
//           { "value": "vue", "link": "https://github.com/vuejs/vue" },
//           { "value": "element", "link": "https://github.com/ElemeFE/element" },
//           { "value": "cooking", "link": "https://github.com/ElemeFE/cooking" },
//           { "value": "mint-ui", "link": "https://github.com/ElemeFE/mint-ui" },
//           { "value": "vuex", "link": "https://github.com/vuejs/vuex" },
//           { "value": "vue-router", "link": "https://github.com/vuejs/vue-router" },
//           { "value": "babel", "link": "https://github.com/babel/babel" }
//          ];
//       },
//       handleSelect(item) {
//         console.log(item);
//       }
//     },
//     mounted() {
//       this.links = this.loadAll();
//     }
// }
// var Ctor = Vue.extend(Main)
// new Ctor().$mount('#app')