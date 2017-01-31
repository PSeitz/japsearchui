<template>
    <div id="app">
        <el-autocomplete v-model="state4" :fetch-suggestions="querySearchAsync" placeholder="Please input" @select="handleSelect"></el-autocomplete>
        <img src="./assets/logo.png">
        <el-button @click.native="startHacking">Let's do iiiiit</el-button>


        <el-row :gutter="20">
          <el-col :span="16"><div class="grid-content bg-purple"></div></el-col>
          <el-col :span="8"><div class="grid-content bg-purple"></div></el-col>
        </el-row>

    </div>
</template>

<script>

export default {
    data() {
        return {
            links: [],
            state4: '',
            timeout:  null,
            results: []
        };
    },
    methods: {
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
        querySearchAsync(queryString, cb) {
            var links = this.links;
            var results = queryString ? links.filter(this.createFilter(queryString)) : links;

            var destintation = 'https://lof2wkd1gg'
            destintation += ".execute-api.eu-west-1.amazonaws.com/dev/search?searchterm=weich"

            // var destintation = "https://iihrm4d9ah.execute-api.us-east-1.ama"
            // destintation += "zonaws.com/prod/search?searchterm=chuushi&fuzzy=true&showGerman=true&showEnglish=true&printTime=true"
            this.$http.get(destintation).then(response => {
                console.log("JAAA")
                console.log(response)
                // get body data
                this.someData = response.body;

            }, response => {
                console.log("NEEEINN")
                // error callback
            });


            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                cb(results);
            }, 3000 * Math.random());
        },
        createFilter(queryString) {
            return (link) => {
                return (link.value.indexOf(queryString.toLowerCase()) === 0);
            };
        },
        handleSelect(item) {
            console.log(item);
        }
    },
    mounted() {
        this.links = this.loadAll();
    }
};

// export default {
//   data () {
//     return {
//       msg: 'Use Vue 2.0 Today!'
//     }
//   },

//   methods: {
//     startHacking () {
//       this.$notify({
//         title: 'It Works',
//         message: 'We have laid the groundwork for you. Now it\'s your time to build something epic!',
//         duration: 6000
//       })
//     }
//   }
// }
</script>

<style>
body {
    font-family: Helvetica, sans-serif;
}
.el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-purple {
    background: #d3dce6;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
</style>
