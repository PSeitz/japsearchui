<template>
    <div id="search" class="searchContainer" v-on:newSearch="emitNewSearch">
        <!-- <div v-if="hasResult" class="numHits">Results: {{result.num_hits}}</div> -->
        <div class="listContainer" v-for="entry in result.data">

            <div class="columns  is-gapless">
                <div class="column is-2 isquerter">
                        <div class="kanji"  v-for="kanji in entry.doc.kanji.slice(0, 1)">

                            <!-- <ruby class="ruby"><rb>{{ kanji.text }}</rb><rt>{{kanji.readings[0]}}</rt></ruby> -->
                            <ruby class="ruby"><span class="rt" v-html=kanji.readings[0]></span><span class="rb" v-html=kanji.text></span></ruby>

                            <div class="bar-outer" v-if="kanji.commonness != 0">
                              <div class="bar-container" v-bind:style="{ width: Math.log10(kanji.commonness + 1) * 100 / 3 + '%' }" > <div class="bar-text">{{ kanji.commonness }}</div> </div>
                            </div>

                        </div>

                        <div v-if="entry.doc.kanji.length == 0" class="kana"  v-for="kana in entry.doc.kana.slice(0, 1)" v-html=kana.text>
                            <!-- {{ kana.text }} -->
                        </div>
                        <!-- <div class="score smallHeader" >{{entry.hit.score}}</div> -->
                </div>
                <div class="column">

                        <p class="smallHeader" v-if="entry.doc.meanings.ger">German</p>
                        <div class="meaningBlock">
                            <span class="meaning"  v-for="(meaning, index) in entry.doc.meanings.ger">
                                <span v-html=meaning.text> <!-- {{ meaning.text }} --> </span> <span v-if="index !== (entry.doc.meanings.ger.length-1)" class="separator">&#9679;</span>
                            </span>
                        </div>

                        <p class="smallHeader"  v-if="entry.doc.meanings.eng">English</p>
                        <div class="meaningBlock">
                            <span class="meaning"  v-for="(meaning, index) in entry.doc.meanings.eng">
                                <span v-html=meaning> <!-- {{ meaning }} -->  </span> <span v-if="index !== (entry.doc.meanings.eng.length-1)" class="separator">&#9679;</span>
                            </span>
                        </div>

                        <!-- "why_found": {
                            "meanings.ger[].text": [
                                "<b>Hawaii</b>-Musik (f)"
                            ]
                        } -->

                        <!-- <p class="smallHeader"  v-if="entry.why_found.length != 0">Why Found</p> -->
                        <div class="whyfoundBlock">
                            <span class="whyfound"  v-for="(list, field) in entry.why_found">
                                {{field}}
                                <span v-for="(el, index) in list">
                                    <span v-html="el">  </span>  <span class="separator"></span>
                                    <!-- <span > {{ el }}  </span> <span v-if="index !== (list.length-1)" class="separator">&#9679;</span> -->
                                </span>
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
            // var url = jap_check.url()+`/search`
            // this.$http.get(url + this.get_search_request(queryString), {
            //     before(request) {
            //         if (this.previousRequest) {this.previousRequest.abort(); }
            //         this.previousRequest = request;
            //     }
            // })
            // .then((response) => {
            //         self.result = response.body
            // }, (response) => {
            //         console.log(response);
            // });
            var url = jap_check.url()+`/search_query_params`
            this.$http.post(url, this.get_post_search_request(queryString), {
                before(request) {
                    if (this.previousRequest) {this.previousRequest.abort(); }
                    this.previousRequest = request;
                }
            })
            .then((response) => {

                function edit(data, selector, cb ) {
                    let stepsi = selector.split(".")

                    let checkIsLast = (steps) => {
                        return steps.length == 0;
                    }

                    let walk = (data, steps, cb ) => {
                        let next;
                        if (next = steps.shift()) {
                            let isLast = checkIsLast(steps);
                            if (next.endsWith("[]")) {
                                let nextData = data[next.slice(0, -2)];
                                for (var i = 0; i < nextData.length; i++) {
                                    isLast ? nextData[i] = cb(nextData[i]):walk(nextData[i], steps.slice(0), cb)
                                }
                            }else{
                                isLast ? data[next] = cb(data[next]) : data[next] && walk(data[next], steps.slice(0), cb)
                            }
                        }
                    }
                    walk(data, stepsi, cb)
                }

                let removeBTags = (orig) =>{
                    let cleaned = orig.split("<b>").join("")
                    cleaned = cleaned.split("</b>").join("")
                    return cleaned;
                }

                function applyWhyFound(res){
                    for(let entry of res.data){
                        for (let path in entry.why_found){

                            let whyFounds = entry.why_found[path]
                            edit(entry.doc, path, (el) => {
                                for (let why_found of whyFounds){
                                    if (el == removeBTags(why_found)) { //Found why_found match, replace
                                        return why_found;
                                    }
                                }
                                return el;
                            })


                        }
                    }
                }

                let resp = response.body;
                applyWhyFound(resp)

                // remove all whyfound info which are already highlighted

                let rename = (obj, from, to) =>{
                    if (obj[from]) {
                        obj[to] = obj[from];
                        delete obj[from];
                    }
                }

                for(let entry of resp.data){
                    delete entry.why_found["kanji[].readings[]"]
                    delete entry.why_found["meanings.eng[]"]
                    delete entry.why_found["meanings.ger[].text"]

                    //TODO use UI Labels from 
                    rename(entry.why_found, "kana[].romaji", "Kana (Romaji)")
                    rename(entry.why_found, "kana[].text", "Kana")
                    rename(entry.why_found, "kana[].conjugated[].form", "Kana Conjugated")
                }

                // let removeBTags = (orig) =>{
                //     let cleaned = orig.split("<b>").join("")
                //     cleaned = cleaned.split("</b>").join("")
                //     return cleaned;
                // }

                // let replace_why_found = (orig) =>{
                //     let cleaned = orig.split("<b>").join("")
                //     cleaned = cleaned.split("</b>").join("")
                //     return cleaned;
                // }

                // //Set why_found
                // let resp = response.body;
                // for(let entry of resp.data){
                //     let first_kana = entry.doc && entry.doc.kana && entry.doc.kana[0] && entry.doc.kana[0].text

                //     // entry.why_found["kana[].text"] || entry.why_found["kana[].text"][0];

                //     if ( entry.why_found["kana[].text"]) {
                //         entry.why_found["kana[].text"] = entry.why_found["kana[].text"].filter(why_found=>{
                //             let matches = first_kana == removeBTags(why_found)

                //             if (matches) {
                //                 entry.doc.kana[0].text = "waaa";
                //                 console.log("new dingens " + entry.doc.kana[0].text)
                //             }
                //             !matches
                //         });
                //     }
                    


                // }

                // console.log("WAS DAS "+ resp.data[0].doc.kana[0].text)

                self.result = resp
            }, (err) => {
                console.log(err);
            });
        },
        // get_search_request(queryString){
        //     if (queryString.indexOf("to ") == 0) {
        //         queryString = queryString.substr(3, queryString.length)
        //     }
        //     queryString = queryString.toLowerCase().trim()
        //     let query = "?query="+queryString;

        //     let hiragana = wanakana.toHiragana(queryString);
        //     if(!wanakana.isHiragana(queryString) && wanakana.isHiragana(hiragana)){
        //         query+= " " +hiragana;
        //     }
        //     let katakana = wanakana.toKatakana(queryString);
        //     if(!wanakana.isKatakana(queryString) && wanakana.isKatakana(katakana)){
        //         query+= " " +katakana;
        //     }
        //     let romaji = wanakana.toRomaji(queryString);
        //     if(!wanakana.isRomaji(queryString) && wanakana.isRomaji(romaji)){
        //         query+= " " +romaji;
        //     }
        //     query += "&top=10";
        //     query += "&skip="+this.getSkip();
        //     query += "&why_found=true";
        //     query += "&phrase_pairs=true";
        //     query += '&boost_queries=[{"path": "commonness","boost_fun": "Log10","param": 1},{"path": "meanings.ger[].rank","expression": "10 / $SCORE"},{"path": "kana[].commonness","boost_fun": "Log10","param": 1},{"path": "kanji[].commonness","boost_fun": "Log10","param": 1}]';

        //     return encodeURI(query);
        // },
        get_post_search_request(queryString){

            //TODO still needed??, should be covered
            if (queryString.indexOf("to ") == 0) {
                queryString = queryString.substr(3, queryString.length)
            }

            let expandedQueryString = queryString
            let hiragana = wanakana.toHiragana(queryString);
            if(!wanakana.isHiragana(queryString) && wanakana.isHiragana(hiragana)){
                expandedQueryString+= " " +hiragana;
            }
            let katakana = wanakana.toKatakana(queryString);
            if(!wanakana.isKatakana(queryString) && wanakana.isKatakana(katakana)){
                expandedQueryString+= " " +katakana;
            }
            let romaji = wanakana.toRomaji(queryString);
            if(!wanakana.isRomaji(queryString) && wanakana.isRomaji(romaji)){
                expandedQueryString+= " " +romaji;
            }


            let query = {
                "search_term": expandedQueryString,
                "top": 10,
                "skip": this.getSkip(),
                "why_found": true,
                "phrase_pairs": true,
                "boost_queries": [
                    {
                        "path": "commonness",
                        "boost_fun": "Log10",
                        "param": 1
                    },
                    {
                        "path": "meanings.ger[].rank",
                        "expression": "2 / $SCORE"
                    },
                    {
                        "path": "kana[].commonness",
                        "boost_fun": "Log10",
                        "param": 1
                    },  
                    {
                        "path": "kanji[].commonness",
                        "boost_fun": "Log10",
                        "param": 1
                    }
                ],
                "boost_fields": {
                    "meanings.ger[].text": 2.0,
                    "kana[].text": 2.0,
                    "pos[]": 2.0,
                    "kanji[].text": 2.0,
                    "meanings.eng[]": 2.0
                }
            };

            return query;


        },
        // post_search_request(queryString){
        //     if (queryString.indexOf("to ") == 0) {
        //         queryString = queryString.substr(3, queryString.length)
        //     }
        //     queryString = queryString.toLowerCase().trim()
        //     var ors = [];

        //     if (jap_check.containsKanji(queryString)) {
        //         ors.push({
        //             "search": jap_check.query(queryString,"kanji[].text", 0 ,true),
        //             "boost": [
        //                 jap_check.boost("commonness", "Log10",1),
        //                 jap_check.boost("kanji[].commonness", "Log10",1)
        //             ]
        //         })
        //     }
        //     if(wanakana.isHiragana(wanakana.toHiragana(queryString))){
        //         ors.push({
        //             "search": jap_check.query(wanakana.toHiragana(queryString),"kana[].text", 0, true),
        //             "boost": [
        //                 jap_check.boost("commonness", "Log10",1),
        //                 jap_check.boost("kana[].commonness", "Log10",1)
        //             ]
        //         })
        //     }

        //     if(wanakana.isKatakana(wanakana.toKatakana(queryString))){
        //         ors.push({
        //             "search": jap_check.query(wanakana.toKatakana(queryString),"kana[].text", 0, false),
        //             "boost": [
        //                 jap_check.boost("commonness", "Log10", 1),
        //                 jap_check.boost("kana[].commonness", "Log10", 1)
        //             ]
        //         })
        //     }

        //     if (wanakana.isRomaji(wanakana.toRomaji(queryString)) || jap_check.isRomajiOrGerman(queryString)) {
        //         let levenshtein = 0;
        //         if(wanakana.isRomaji(queryString) || jap_check.isRomajiOrGerman(queryString)){
        //             levenshtein = 1;
        //         }
        //         let queryString2 = wanakana.toRomaji(queryString);
        //         ors.push(
        //             {
        //                 "search": jap_check.query(queryString2,"meanings.ger[].text", levenshtein, false),
        //                 "boost": [
        //                     jap_check.boost("commonness", "Log10", 1),
        //                     {
        //                         "path":"meanings.ger[].rank",
        //                         "expression": "10 / $SCORE"
        //                     }
        //                 ]
        //             })

        //         ors.push(
        //             {
        //                 "search": jap_check.query(queryString,"meanings.eng[]", levenshtein, false),
        //                 "boost": [jap_check.boost("commonness", "Log10", 1) ]
        //             })
        //     }

        //     return {
        //         "or":ors,
        //         "top": 10,
        //         "skip": this.getSkip()
        //     }
        // },
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
b, strong {
  font-weight: normal;
  color: @color-highlight;
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
.whyfoundBlock{
    margin-bottom: 8px;
}
.whyfound{
    border-radius: 2px;
    white-space: normal;
    display: inline-block;
    font-size: 0.8rem;
}
.whyfound b{
    padding: 1px 3px 1px 3px;
    // color: #eee;
    // background-color: @color-secondary-2-1;
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
