<template>
  <div id="suggestion">
      <div class="sub-title">list suggestions on input</div>

      <el-autocomplete class="inline-input" v-model="state2" :fetch-suggestions="suggestSearch" placeholder="Please Input" :trigger-on-focus="false" @select="handleSelect"></el-autocomplete>
  </div>
</template>

<script>
export default {
  data () {
    return {
      links: [],
      state2: ''
    }
  },

  methods: {
    querySearch(queryString, cb) {

      var links = this.links;
      var results = queryString ? links.filter(this.createFilter(queryString)) : links;
      // call callback function to return suggestions
      cb(results);
    },
    suggestSearch(queryString, cb) {
      var url = `http://localhost:3000/suggest`
      this.$http.post(url, this.get_suggestion(queryString))
      .then((response) => {
          cb(response.body.map(el => ({"value":el[0], "link":""})));
      }, (response) => {
          // error callback
          console.log(response);
      });


      // var links = this.links;
      // var results = queryString ? links.filter(this.createFilter(queryString)) : links;
      // // call callback function to return suggestions
      // cb(results);
    },
    createFilter(queryString) {
      return (link) => {
        return (link.value.indexOf(queryString.toLowerCase()) === 0);
      };
    },
    get_suggestion(queryString){
        return {
            "suggest":[
                {
                    "term": queryString,
                    "path": "meanings.ger[].text",
                    "starts_with": true,
                    "token_value": {
                        "path":"meanings.ger[].text.textindex.tokenValues",
                        "boost_fun":"Add",
                        "param":0
                    }
                },
                {
                    "term": queryString,
                    "path": "meanings.eng[]",
                    "starts_with": true,
                    "token_value": {
                        "path":"meanings.eng[].textindex.tokenValues",
                        "boost_fun":"Add",
                        "param":0
                    }
                }
            ],
            "top": 10,
            "skip": 0
        }
    },
    loadAll() {
      return [
        { "value": "vue", "link": "https://github.com/vuejs/vue" },
        { "value": "element", "link": "https://github.com/ElemeFE/element" },
        { "value": "cooking", "link": "https://github.com/ElemeFE/cooking" },
        { "value": "mint-ui", "link": "https://github.com/ElemeFE/mint-ui" },
        { "value": "vuex", "link": "https://github.com/vuejs/vuex" },
        { "value": "vue-router", "link": "https://github.com/vuejs/vue-router" },
        { "value": "babel", "link": "https://github.com/babel/babel" }
       ];
    },
    handleSelect(item) {
      console.log(item);
    }
  },
  mounted() {
    this.links = this.loadAll();
  }
}
</script>

<style>
  .el-autocomplete {
    width: 100%;
  }
body {
  font-family: Helvetica, sans-serif;
}
</style>
