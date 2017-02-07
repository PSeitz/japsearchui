<template>
    <div id="app">
        <el-autocomplete v-model="state4" :fetch-suggestions="querySuggest" placeholder="Please input" @keyup.enter="submit" @select="handleSelect"></el-autocomplete>
        <img src="./assets/logo.png">
        <el-button @click.native="startHacking">Let's do iiiiit</el-button>


        <el-row :gutter="20" v-for="item in items">
            <el-col :span="4"><div class="grid-content bg-purple-light block">
                <div class='kanji leftcontent'>{{ item.mainText }}</div>
                <div class='kana leftcontent'>{{ item.subText }}</div>
                <div class='romaji leftcontent'>{{ item.romaji }}</div>

                <div class='leftcontent'>Commonness</div>
                <div class='commonness leftcontent' v-bind:style="{ width: item.commonness/2 + 'px' }"></div>


            </div></el-col>
            <el-col :span="16"><div class="grid-content bg-purple-light block">
                <div class="meaningsBlock"> German:
                    <div class='meanings' v-for="(ger, index) in item.meanings.ger">{{index+1}}.{{ ger.text }}</div>
                </div>
                <div class="meaningsBlock"> English :
                    <div class='meanings' v-for="(eng, index) in item.meanings.eng">{{index+1}}.{{ eng }}</div>
                </div>

            </div></el-col>
        </el-row>

        <ul id="example-1">
          <li v-for="item in items">
            <div class='kanji' v-for="(kanji, index) in item.kanji" v-bind:class="{notlast : index !== (item.kanji.length-1)}" >{{ kanji.text }}</div>
            
            <div class='kana' v-for="kana in item.kana">{{ kana.text }}</div>
            <div></div>
            <div class='romaji' v-for="kana in item.kana">{{ kana.romaji }}</div>

            <div></div>
            <div class='meanings' v-for="(eng, index) in item.meanings.eng">{{ eng }}</div>
            <div></div>
            <div class='meanings' v-for="(ger, index) in item.meanings.ger">{{ ger.text }}</div>
            
          </li>
        </ul>

    </div>
</template>

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
.notlast{
    
}
.leftcontent{
    padding-bottom: 10px;
}
.block{
    padding: 10px 0 10px 10px;
    border-right: solid 10px rgba(0, 0, 0, 0);
    overflow: hidden;
}
.kanji{
    font-size: 24px;
}
.romaji{
    display: inline-flex;
    font-size: 14px;
}
.commonness{
    background-color: #2323a0
}
.kana{
    color: orange
}
.meanings{
    display: inline-flex;
    padding: 5px;
}
.meaningsBlock{

}
.el-col {
    border-radius: 4px;
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


<script>

export default {
    data() {
        return {
            links: [],
            state4: '',
            timeout:  null,
            results: [],
            items: [
             
            ]
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
        querySuggest(queryString, cb) {
            clearTimeout(this.timeout);
            if(queryString.length > 1){
                this.timeout = setTimeout(() => {

                    var destintation = 'https://lof2wkd1gg'
                    destintation += ".execute-api.eu-west-1.amazonaws.com/dev/search?suggestterm="+queryString.toLowerCase()

                    var destintation_search = 'https://lof2wkd1gg'
                    destintation_search += ".execute-api.eu-west-1.amazonaws.com/dev/search?searchterm="
                    // var destintation = "https://iihrm4d9ah.execute-api.us-east-1.ama"
                    // destintation += "zonaws.com/prod/search?searchterm=chuushi&fuzzy=true&showGerman=true&showEnglish=true&printTime=true"
                    
                    this.$http.get(destintation).then(response => {
                        console.log(JSON.stringify(response.body))
                        cb(response.body.map(res => ({"value":res, "link":this.getSearchUrl(res)})));
                        
                    }, response => {
                        console.log("NEEEINN")
                    });

                }, 150);
            }
        },
        getSearchUrl(res){
            var destintation_search = 'https://lof2wkd1gg'
            destintation_search += ".execute-api.eu-west-1.amazonaws.com/dev/search?searchterm="+res
            return destintation_search
        },
        createFilter(queryString) {
            return (link) => {
                return (link.value.indexOf(queryString.toLowerCase()) === 0);
            };
        },
        handleSelect(item) {
            console.log(item);
            this.doSearch(this.getSearchUrl(item.value))
        },
        submit(item){
            console.log("!JAAAA")
            this.doSearch(this.getSearchUrl(this.state4))
        },
        workData(items){
            return items.map(el => {
                el.mainText = el.kanji[0] ? el.kanji[0].text : el.kana[0].text
                el.subText = el.kanji[0] ? el.kana[0].text : ''
                el.romaji = el.kana[0].romaji 
                return el
            })
        },
        doSearch(url){
            if (!url) return

            this.$http.get(url).then(response => {
                console.log(JSON.stringify(response.body))
                this.items = this.workData(response.body)
                console.log(response)
            }, response => {
                console.log("NEEEINN")
            });
        }
    },
    mounted() {
        this.items = this.workData(window.testData)
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

window.testData = [{"pos":["adj-i"],"commonness":102,"misc":[],"kanji":[{"text":"柔らかい","commonness":57},{"text":"軟らかい","commonness":15},{"text":"柔かい","commonness":0}],"kana":[{"text":"やわらかい","romaji":"Yawarakai","commonness":30}],"meanings":{"eng":["soft","tender","limp","limber","gentle","mild"],"ger":[{"text":"weich","rank":1},{"text":"sanft"},{"text":"zart"},{"text":"elastisch"},{"text":"mild","rank":2},{"text":"locker","rank":3},{"text":"nicht förmlich"}]},"ent_seq":"1605630","score":24.629862798578465},{"pos":["adj-na","adj-no","n"],"commonness":38,"misc":[],"kanji":[],"kana":[{"text":"ソフト","romaji":"Sofuto","commonness":38}],"meanings":{"eng":["soft","software","soft hat","felt hat","soft serve ice cream","softball"],"ger":[{"text":"weich","rank":1},{"text":"weicher Hut (m)","rank":2},{"text":"Software (f)"},{"text":"weich"}]},"ent_seq":"1075500","score":23.850658241293743},{"pos":["adj-na","n"],"commonness":30,"misc":[],"kanji":[{"text":"軟弱","commonness":15}],"kana":[{"text":"なんじゃく","romaji":"Nanjaku","commonness":15}],"meanings":{"eng":["weakness"],"ger":[{"text":"Weichheit (f)","rank":1},{"text":"Weichlichkeit (f)","rank":2},{"text":"Nachgiebigkeit (f)"},{"text":"Baisse (f)","rank":3},{"text":"weich","rank":1},{"text":"schwach","rank":2},{"text":"schwächlich"},{"text":"weichlich"},{"text":"nachgiebig"},{"text":"mit sinkender Tendenz","rank":3}]},"ent_seq":"1460790","score":23.61772668361337},{"pos":["adv","adv-to","vs","adj-no","adj-na"],"commonness":0,"misc":[],"kanji":[],"kana":[{"text":"へなへな","romaji":"Henahena","commonness":null}],"meanings":{"eng":["weakly","helplessly","weak","flimsy"],"ger":[{"text":"weich","rank":1},{"text":"flexibel"},{"text":"weich","rank":2},{"text":"schwach"},{"text":"läppisch"}]},"ent_seq":"1011340","score":19.406852819440058},{"pos":["adj-i"],"commonness":0,"misc":["colloquialism"],"kanji":[],"kana":[{"text":"やらかい","romaji":"Yarakai","commonness":null}],"meanings":{"eng":["soft"],"ger":[{"text":"weich","rank":1},{"text":"sanft"},{"text":"zart"},{"text":"elastisch"},{"text":"mild","rank":2},{"text":"locker","rank":3},{"text":"nicht förmlich"}]},"ent_seq":"2746190","score":19.306852819440056},{"pos":["adj-i"],"commonness":0,"misc":[],"kanji":[{"text":"柔い","commonness":0}],"kana":[{"text":"やわい","romaji":"Yawai","commonness":0},{"text":"やっこい","romaji":"Yakkoi","commonness":0}],"meanings":{"eng":["soft","weak"],"ger":[{"text":"weich","rank":1},{"text":"sanft"},{"text":"schwach","rank":2}]},"ent_seq":"2600380","score":19.306852819440056},{"pos":["adv-to"],"commonness":0,"misc":["onomatopoeic or mimetic word"],"kanji":[],"kana":[{"text":"ふわり","romaji":"Fuwari","commonness":null}],"meanings":{"eng":["softly","gently","lightly"],"ger":[{"text":"weich","rank":1},{"text":"sich leicht und sanft bewegend","rank":2}]},"ent_seq":"1011090","score":19.306852819440056},{"pos":["adj-i"],"commonness":49,"misc":[],"kanji":[{"text":"緩い","commonness":29}],"kana":[{"text":"ゆるい","romaji":"Yurui","commonness":20}],"meanings":{"eng":["loose","lenient","lax","gentle (curve, slope, etc.)","slow","weak","soft","not firm","difficult","hard"],"ger":[{"text":"lose","rank":1},{"text":"locker"},{"text":"nachsichtig","rank":2},{"text":"mild"},{"text":"weich","rank":3},{"text":"aufgeweicht"},{"text":"nicht fest"},{"text":"langsam","rank":4},{"text":"schwach","rank":5},{"text":"sanft","rank":6},{"text":"schwach (ein Biegung)"},{"text":"schwunglos"},{"text":"großherzig"}]},"ent_seq":"1214410","score":17.23530600290798},{"pos":["adj-na","n"],"commonness":2,"misc":["word usually written using kana alone"],"kanji":[{"text":"柔","commonness":0},{"text":"和","commonness":2}],"kana":[{"text":"やわ","romaji":"Yawa","commonness":0},{"text":"ヤワ","romaji":"Yawa","commonness":0}],"meanings":{"eng":["soft","fragile","weak","poorly built","insubstantial"],"ger":[{"text":"zerbrechlich","rank":1},{"text":"weich","rank":2},{"text":"sanft"}]},"ent_seq":"2039460","score":15.916290731874156},{"pos":["adj-na","n"],"commonness":87,"misc":[],"kanji":[{"text":"柔軟","commonness":47}],"kana":[{"text":"じゅうなん","romaji":"Juunan","commonness":40}],"meanings":{"eng":["flexible","lithe","soft","pliable"],"ger":[{"text":"weich"},{"text":"elastisch"},{"text":"biegsam"},{"text":"flexibel"},{"text":"dehnbar"},{"text":"federnd"},{"text":"geschmeidig"},{"text":"nachgebend"},{"text":"gelenkig"},{"text":"Weichheit (f)"},{"text":"Biegsamkeit (f)"},{"text":"Dehnbarkeit (f)"},{"text":"Elastizität (f)"},{"text":"Federkraft (f)"},{"text":"Geschmeidigkeit (f)"}]},"ent_seq":"1335480","score":14.571638793363569}]

</script>

