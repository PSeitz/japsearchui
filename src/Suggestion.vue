<template>
    <div id="suggestion">

            <el-autocomplete class="inline-input" v-model="state2" :fetch-suggestions="suggestSearch" placeholder="Search" :trigger-on-focus="false" @select="handleSelect" @keyup.native.enter="submit"></el-autocomplete>
    </div>
</template>

<script>
import jap_check from './jap_check'

export default {
    data () {
        return {
            links: [],
            state2: ''
        }
    },

    methods: {
        suggestSearch(queryString, cb) {
            var url = `http://localhost:3000/suggest`
            this.cb_hook = cb;
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
        get_suggestion(queryString){
            queryString = queryString.toLowerCase().trim()
            var kana = wanakana.toHiragana(queryString);

            var suggests = [];

            if (wanakana.isKanji(queryString)) {
                console.log("isKanji")
                suggests.push(
                    {
                        "term": queryString,
                        "path": "kanji[].text",
                        "starts_with": true
                    }
                )
            }
            if(wanakana.isHiragana(wanakana.toHiragana(queryString))){
                console.log("isKana or converted")
                suggests.push(
                    {
                        "term": wanakana.toHiragana(queryString),
                        "path": "kana[].text",
                        "starts_with": true
                    }
                )
            }

            if(wanakana.isKatakana(wanakana.toKatakana(queryString))){
                console.log("isKana or converted")
                suggests.push(
                    {
                        "term": wanakana.toKatakana(queryString),
                        "path": "kana[].text",
                        "starts_with": true
                    }
                )
            }

            if (wanakana.isRomaji(wanakana.toRomaji(queryString))) {
                console.log("isRomaji or converted")
                Array.prototype.push.apply(suggests,[
                        {
                            "term": wanakana.toRomaji(queryString),
                            "path": "meanings.ger[].text",
                            "starts_with": true,
                            "token_value": {
                                "path":"meanings.ger[].text.textindex.tokenValues",
                                "boost_fun":"Add",
                                "param":0
                            }
                        },
                        {
                            "term": wanakana.toRomaji(queryString),
                            "path": "meanings.eng[]",
                            "starts_with": true,
                            "token_value": {
                                "path":"meanings.eng[].textindex.tokenValues",
                                "boost_fun":"Add",
                                "param":0
                            }
                        }
                ])
            }

            return {
                "suggest": suggests,
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
            this.$bus.$emit('newSearch', item.value)
        },
        submit() {
            this.suggestions= [];
            this.cb_hook([])
            this.$bus.$emit('newSearch', this.state2)
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
