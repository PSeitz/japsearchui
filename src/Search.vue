<template>
    <div id="search">

        <div id="listContainer">
            <ul class="list">
                <li class="listItem" v-for="entry in entries">
                    <div class="showTitle"  v-for="kanji in entry.doc.kanji">
                            {{ kanji.text }} {{ kanji.readings }}
                    </div>

                    <div class="showTranslation"  v-for="meaning in entry.doc.meanings.ger">
                            {{ meaning.text }}
                    </div>
                    <hr>
                </li>
            </ul>
        </div>
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
            var url = `http://localhost:3000/search`
            this.$http.post(url, this.get_search(queryString))
            .then((response) => {
                    cb(response.body);
            }, (response) => {
                    // error callback
                    console.log(response);
            });
        },
        get_search(queryString){
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
