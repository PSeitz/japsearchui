<template>
    <div id="suggestion">

            <el-autocompleto size="large" :autofocus="true" class="inline-input" v-model="input" :fetch-suggestions="suggestSearch" placeholder="Search" value="input"  :trigger-on-focus="false" @select="handleSelect" @keyup.native.enter="submit"></el-autocompleto>
    </div>
</template>

<script>
import jap_check from './jap_check'
import wanakana from './convert'

export default {
    data () {
        return {
            input: ''
        }
    },
    created: function () {

    },
    methods: {
        suggestSearch(queryString, cb) {
            this.setSuggestionsHook = cb;
            if (queryString.length == 0) {
                cb([])
                if (this.previousRequest) this.previousRequest.abort();
                return
            }
            var url = jap_check.url()+`/suggest`
            // this.cb_hook = cb;
            this.lastRequest = this.$http.post(url, this.get_suggestion(queryString), {
                before(request) {
                    if (this.previousRequest) {this.previousRequest.abort(); }
                    this.previousRequest = request;
                }
            })
            .then((response) => {
                cb(response.body.map(el => ({"value":el[0], "link":""})));
            }, (response) => {
                    // error callback
                    console.log(response);
            });

        },
        get_suggestion(queryString){
            queryString = queryString.toLowerCase().trim()
            var kana = wanakana.toHiragana(queryString);
            var suggests = [];

            if (jap_check.containsKanji(queryString)) {
                console.log("isKanji")
                suggests.push(
                    {
                        "terms": [queryString],
                        "path": "kanji[].text",
                        "starts_with": true
                    }
                )
            }
            if(wanakana.isHiragana(wanakana.toHiragana(queryString))){
                console.log("isKana or converted")
                suggests.push(
                    {
                        "terms": [wanakana.toHiragana(queryString)],
                        "path": "kana[].text",
                        "starts_with": true
                    }
                )
            }

            if(wanakana.isKatakana(wanakana.toKatakana(queryString))){
                console.log("isKana or converted")
                suggests.push(
                    {
                        "terms": [wanakana.toKatakana(queryString)],
                        "path": "kana[].text",
                        "starts_with": true
                    }
                )
            }

            if (wanakana.isRomaji(wanakana.toRomaji(queryString)) || jap_check.isRomajiOrGerman(queryString)) {
                console.log("isRomaji or converted")
                var levenshtein_distance = wanakana.toRomaji(queryString).length >= 3 ? 1: 0;
                Array.prototype.push.apply(suggests,[
                        {
                            "terms": [wanakana.toRomaji(queryString)],
                            "path": "meanings.ger[].text",
                            "levenshtein_distance": levenshtein_distance,
                            "starts_with": true,
                            "token_value": {
                                "path":"meanings.ger[].text.textindex.tokenValues",
                                "boost_fun":"Linear",
                                "param":1
                            }
                        },
                        {
                            "terms": [wanakana.toRomaji(queryString)],
                            "path": "meanings.eng[]",
                            "levenshtein_distance": levenshtein_distance,
                            "starts_with": true,
                            "token_value": {
                                "path":"meanings.eng[].textindex.tokenValues",
                                "boost_fun":"Linear",
                                "param":1
                            }
                        },
                        {
                            "terms": [queryString],
                            "path": "kana[].romaji",
                            "levenshtein_distance": levenshtein_distance,
                            "starts_with": true
                        }
                ])
            }

            return {
                "suggest": suggests,
                "top": 5,
                "skip": 0
            }

        },
        handleSelect(item) {
            console.log(item);
            // this.$bus.$emit('newSearch', item.value)
            // var newUrl = jap_check.replaceUrlParam(window.location.href, "q", item.value)
            // window.history.pushState({term:item.value}, null, newUrl);
            this.submit()
        },
        submit() {
            this.clear();
            // this.cb_hook([])
            this.$bus.$emit('newSearch', {term:this.input})
        },
        clear(){
            if (this.setSuggestionsHook) {
                this.setSuggestionsHook([])
            }
            // this.suggestions = []
        }
    },
    mounted() {
        var self = this;
        var search = jap_check.findGetParameter("q");
        if (search !=null) {
            self.input = search;
        }
        window.onpopstate = function (event) {
            var search = jap_check.findGetParameter("q");
            if (search != null) {
                self.input = search;
                self.$bus.$emit('newSearch', {term:this.input, forceSearch:true})
            }
        };

        this.$bus.$on('newSearch', ($event) => {
            console.log("newSearch event in Suggest - clear suggestions")
            self.clear()
        })

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
