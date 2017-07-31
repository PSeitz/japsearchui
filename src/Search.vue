<template>
    <div id="search" v-on:newSearch="querySearch">
        <div id="listContainer" v-for="entry in entries">


            <el-row type="flex" class="row-bg" justify="center">
                <el-col :span="6">
                    <h1 class="kanji"  v-for="kanji in entry.doc.kanji">
                        <a :title="kanji.readings[0]" href="#fg">{{ kanji.text }}</a>
                        <!-- <div class="text">{{ kanji.text }}</div> - <div class="reading text" v-for="read in kanji.readings">{{ read }}</div> -->
                    </h1>

                    <h1 v-if="entry.doc.kanji.length == 0" class="kana"  v-for="kana in entry.doc.kana">
                        {{ kana.text }}
                    </h1>

                </el-col>
                <el-col :span="18">

                <div class="smallHeader">German</div>
                <div class="gerMeaning">
                    <div class="meaning"  v-for="meaning in entry.doc.meanings.ger">
                    {{ meaning.text }}
                    </div>
                </div>

                <div class="smallHeader">English</div>
                <div class="engMeaning">
                    <div class="meaning"  v-for="meaning in entry.doc.meanings.eng">
                            {{ meaning }}
                    </div>
                </div>

                </el-col>
            </el-row>


            <hr>
        </div>
    </div>
</template>



<script>
import jap_check from './jap_check'

export default {
    data () {
        return {
            entries: []        }
    },
    methods: {
        querySearch(queryString) {
            console.log("ALARM")
            var self = this;
            var url = `http://localhost:3000/search`
            this.$http.post(url, this.get_search(queryString))
            .then((response) => {
                    self.entries = response.body
                    // cb(response.body);
            }, (response) => {
                    // error callback
                    console.log(response);
            });
        },
        get_search(queryString){
            let res = jap_check.check_string(queryString);
            if (res == "KANJI") {
                return {
                    "search": {
                        "term": queryString,
                        "path": "kanji[].text",
                        "levenshtein_distance": 0,
                        "starts_with": true
                    },
                    "boost": [
                        {
                            "path":"commonness",
                            "boost_fun": "Log10",
                            "param": 1
                        },{
                            "path":"kanji[].commonness",
                            "boost_fun": "Log10",
                            "param": 1
                        }
                    ],
                    "top": 10,
                    "skip": 0
                }
            }else if(res == "KANA"){
                return {
                    "search": {
                        "term": queryString,
                        "path": "kana[].text",
                        "levenshtein_distance": 0,
                        "starts_with": true
                    },
                    "boost": [
                        {
                            "path":"commonness",
                            "boost_fun": "Log10",
                            "param": 1
                        },{
                            "path":"kana[].commonness",
                            "boost_fun": "Log10",
                            "param": 1
                        }
                    ],
                    "top": 10,
                    "skip": 0
                }
            }else{
                return {
                    "or":[
                        {
                            "search": {
                                "term": queryString,
                                "path": "meanings.ger[].text",
                                "levenshtein_distance": 1
                            },
                            "boost": [
                                {
                                    "path":"commonness",
                                    "boost_fun": "Log10",
                                    "param": 1
                                },{
                                    "path":"meanings.ger[].rank",
                                    "expression": "10 / $SCORE"
                                }
                            ]
                        },
                        {
                            "search": {
                                "term": queryString,
                                "path": "meanings.eng[]",
                                "levenshtein_distance": 1
                            },
                            "boost": [
                                {
                                    "path":"commonness",
                                    "boost_fun": "Log10",
                                    "param": 1
                                }
                            ]
                        }
                    ],
                    "top": 10,
                    "skip": 0
                }
            }
            
        },
        handleSelect(item) {
            console.log(item);
        }
    },
    mounted() {
        this.$bus.$on('newSearch', ($event) => {
            console.log('My event has been triggered', $event)
            this.querySearch($event)
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
.meaning{
    background-color: #C0CCDA;
    margin: 3px 0px 1px 5px;
    padding: 5px;
    padding-top: 2px;
    padding-bottom: 2px;
    border-radius: 2px;
    white-space:normal;
    display: inline-block;
}
.gerMeaning{
    padding-top: 2px;
}
.engMeaning{
    padding-top: 8px;
}
.kanji{
    margin: 0.2em 0 0.4em 0em
}
.reading{
    color: #FF9000
}
.text{
    white-space:normal;
    display: inline-block; 
}
/* /r/LearnJapanese furigana */
a[href$="/fg"], a[href$="#fg"], a[href$="/fgb"], a[href$="#fgb"] {
    cursor: default !important;
    text-decoration: none;
    line-height: 1;
    text-align: center;
    display: inline-block;
    color: inherit !important;
    position: relative;
}
a[href$="/fgb"], a[href$="#fgb"] {
    top: 0.8em;
    margin-top:-0.8em;
    margin-bottom: 0.5em;
}
/* For the ruby characters. */
a[href$="/fg"]:before, a[href$="#fg"]:before, a[href$="/fgb"]:after, a[href$="#fgb"]:after {
    font-size: 0.70em;
    font-weight: normal;
    line-height: 1.2;
    cursor: default;
    text-decoration: none;
    display: block;
    content: attr(title);
    position: relative;
}
/* Second option (then you can have furigana underneath aswell)*/
sup:before {
    cursor: default !important;
    text-decoration: none;
    line-height: 1;
    text-align: center;
    display: inline-block;
    color: inherit !important;
}
 
sup {
    font-size: 0.70em;
    font-weight: normal;
    line-height: 1.2;
    cursor: pointer;
    text-decoration: none;
    display: block;
} 
</style>
