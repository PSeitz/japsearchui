import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import App from './App.vue'
import Suggestion from './Suggestion.vue'
import Search from './Search.vue'


import VueResource from 'vue-resource'
Vue.use(VueResource);

Vue.use(ElementUI)
Vue.http.options.crossOrigin = true

Vue.component('suggestion', Suggestion)
Vue.component('search', Search)

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