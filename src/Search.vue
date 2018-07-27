<template>
    <div id="search" class="searchContainer" v-on:newSearch="emitNewSearch">
        <!-- <div v-if="hasResult" class="numHits">Results: {{result.num_hits}}</div> -->
        <div class="listContainer" v-for="entry in result.data">

            <div class="columns  is-gapless">
                <div class="column is-2 isquerter">
                        <div class="kanji"  v-for="kanji in entry.doc.kanji.slice(0, 1)">

                            <!-- <ruby class="ruby"><rb>{{ kanji.text }}</rb><rt>{{kanji.readings[0]}}</rt></ruby> -->
                            <ruby class="ruby"><span class="rt">{{kanji.readings[0]}}</span><span class="rb">{{ kanji.text }}</span></ruby>

                            <div class="bar-outer" v-if="kanji.commonness != 0">
                              <div class="bar-container" v-bind:style="{ width: Math.log10(kanji.commonness + 1) * 100 / 3 + '%' }" > <div class="bar-text">{{ kanji.commonness }}</div> </div>
                            </div>

                        </div>

                        <div v-if="entry.doc.kanji.length == 0" class="kana"  v-for="kana in entry.doc.kana.slice(0, 1)">
                            {{ kana.text }}
                        </div>
                        <!-- <div class="score smallHeader" >{{entry.hit.score}}</div> -->
                </div>
                <div class="column">

                        <p class="smallHeader" v-if="entry.doc.meanings.ger">German</p>
                        <div class="meaningBlock">
                            <span class="meaning"  v-for="(meaning, index) in entry.doc.meanings.ger">
                                <span> {{ meaning.text }} </span> <span v-if="index !== (entry.doc.meanings.ger.length-1)" class="separator">&#9679;</span>
                            </span>
                        </div>

                        <p class="smallHeader"  v-if="entry.doc.meanings.eng">English</p>
                        <div class="meaningBlock">
                            <span class="meaning"  v-for="(meaning, index) in entry.doc.meanings.eng">
                                <span> {{ meaning }}  </span> <span v-if="index !== (entry.doc.meanings.eng.length-1)" class="separator">&#9679;</span>
                            </span>
                        </div>
                </div>
            </div>

        </div>

        <div class="pagingContainer">
            <el-pagination v-if="hasResult" @current-change=handlePagination
              layout="prev, pager, next, total"
              :total="result.num_hits" :currentPage="currentPage">
            </el-pagination>
        </div>

    </div>
</template>

<script>
import jap_check from './jap_check'
import wanakana from './convert'

export default {
    data () {
        return {
            result: {},
            currentPage:1
        }
    },
    computed: {
        hasResult: function () {
            return this.result && this.result.data && this.result.data.length != 0
        }
    },
    created: function () {
        var search = jap_check.findGetParameter('q');
        if (search !=null) {
            this.$emit('input', {term:search, forceSearch:true});
            this.querySearch();
        }

        this.currentPage = 1 + this.getSkip()/10;
        // window.onpopstate = (event) => {
        //     var search = jap_check.findGetParameter('q');
        //     if (search !=null) {
        //         this.$emit('input', search);
        //         this.querySearch(search);
        //     }
        // };

    },
    methods: {
        handlePagination(newPage){
            // alert(newPage)
            if(jap_check.handleURL(null, (newPage - 1) * 10))
                this.querySearch()
        },
        emitNewSearch(queryString){
            this.$bus.$emit('newSearch', {term:queryString})
        },
        querySearch() {
            var queryString = jap_check.findGetParameter('q');
            if (queryString.length == 0) {
                if (this.previousRequest) this.previousRequest.abort();
                return
            }
            var self = this;
            var url = jap_check.url()+`/search`
            this.$http.post(url, this.get_search(queryString), {
                before(request) {
                    if (this.previousRequest) {this.previousRequest.abort(); }
                    this.previousRequest = request;
                }
            })
            .then((response) => {
                    self.result = response.body
            }, (response) => {
                    console.log(response);
            });
        },
        get_search(queryString){
            if (queryString.indexOf("to ") == 0) {
                queryString = queryString.substr(3, queryString.length)
            }
            queryString = queryString.toLowerCase().trim()
            var ors = [];

            if (jap_check.containsKanji(queryString)) {
                ors.push({
                    "search": jap_check.query(queryString,"kanji[].text", 0 ,true),
                    "boost": [
                        jap_check.boost("commonness", "Log10",1),
                        jap_check.boost("kanji[].commonness", "Log10",1)
                    ]
                })
            }
            if(wanakana.isHiragana(wanakana.toHiragana(queryString))){
                ors.push({
                    "search": jap_check.query(wanakana.toHiragana(queryString),"kana[].text", 0, true),
                    "boost": [
                        jap_check.boost("commonness", "Log10",1),
                        jap_check.boost("kana[].commonness", "Log10",1)
                    ]
                })
            }

            if(wanakana.isKatakana(wanakana.toKatakana(queryString))){
                ors.push({
                    "search": jap_check.query(wanakana.toKatakana(queryString),"kana[].text", 0, false),
                    "boost": [
                        jap_check.boost("commonness", "Log10", 1),
                        jap_check.boost("kana[].commonness", "Log10", 1)
                    ]
                })
            }

            if (wanakana.isRomaji(wanakana.toRomaji(queryString)) || jap_check.isRomajiOrGerman(queryString)) {
                let levenshtein = 0;
                if(wanakana.isRomaji(queryString) || jap_check.isRomajiOrGerman(queryString)){
                    levenshtein = 1;
                }
                let queryString2 = wanakana.toRomaji(queryString);
                ors.push(
                    {
                        "search": jap_check.query(queryString2,"meanings.ger[].text", levenshtein, false),
                        "boost": [
                            jap_check.boost("commonness", "Log10", 1),
                            {
                                "path":"meanings.ger[].rank",
                                "expression": "10 / $SCORE"
                            }
                        ]
                    })

                ors.push(
                    {
                        "search": jap_check.query(queryString,"meanings.eng[]", levenshtein, false),
                        "boost": [jap_check.boost("commonness", "Log10", 1) ]
                    })
            }

            return {
                "or":ors,
                "top": 10,
                "skip": this.getSkip()
            }
        },
        handleSelect(item) {
            console.log(item);
        },
        getSkip(item) {
            return parseInt(jap_check.findGetParameter("skip"), 10) || 0
        }
    },
    mounted() {
        this.$bus.$on('newSearch', (newTerm) => {
            console.log("newSearchnewTerm in Search", newTerm.term)

            if (jap_check.handleURL(newTerm.term, null) || newTerm.forceSearch) // url did change
                this.querySearch()
        })
    }
}
</script>

<style lang="less">
@import (reference) "colors.less";

.el-autocomplete {
    width: 100%;
}
body {
    font-family: Helvetica, sans-serif;
}
.bar-outer{
    font-size: 50%;
    // background-color: @color-secondary-1-0;
    margin: 0.25rem;
    margin-left: 0;
    margin-right: 2rem;
    border-radius: 4px;
    line-height: 1.5em;
}
.bar-container{
    background-color: @color-secondary-2-0;
    max-width: 100%;
    border-radius: 4px;
}
.bar-text{
    padding-left: 4px;
}
.meaningBlock{
    margin-bottom: 8px;
}
.meaning{
    // color: #eee;
    // background-color: @color-secondary-2-4;
    // margin: 2px 0px 0px 2px;
    // padding: 8px;
    padding-top: 1px;
    padding-bottom: 1px;
    border-radius: 2px;
    white-space: normal;
    display: inline-block;
    font-size: 0.8rem;
}
.separator{
    margin-left: 8px;
    margin-right: 8px;
}
.gerMeaning{
    /*padding-top: 2px;*/
}
.engMeaning{
    padding-top: 8px;
}


.commonness{
    font-size: 50%;
    color: @color-secondary-2-0;
}
.reading{
    color: #FF9000
}
.text{
    white-space:normal;
    display: inline-block;
}
.kana{
    padding: 8px;
    padding-left: 0;
    font-size: 2em;
    line-height: 1em;
}
.kanji{
    // margin: 0.2rem 0 0.4rem 0rem;
    // font-size: 150%;
    font-size: 2em;
    line-height: 1em;
    padding: 8px;
    padding-left: 0;
}
.ruby{
    // font-size: 72pt;
    display: inline-block;
    line-height: 1em;
    position: relative;
}
.rb{
    display: inline-block;
    // padding-top: 0.6em;
    position: relative;
}
.rt{
    font-size: 0.55em;
    position: relative;
    display: block;
    line-height: 1.3em;
    top: 0;
}
.score{
    color: @color-secondary-2-0;
    position: absolute;
    bottom: 0px;
}
.smallHeader{
    font-size: 8px;
    margin-left: 2px;
}
.listContainer{
    border-bottom: 1px solid #eee;
    padding-top: .5rem;
    padding-bottom: .5rem;
    position: relative;
    line-height: 1em;
}
.numHits{
    padding-top: .5rem;
    color: @color-secondary-2-0;
    font-size: 12px;
    right: 0.2rem;
    position: absolute;
}
.searchContainer{
    // text-align: center;
}
.pagingContainer{
    padding-top: 1em;
    text-align: center;
}
</style>
