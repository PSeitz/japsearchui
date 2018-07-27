export default {
  url:function(){
    // return "http://localhost:3000/jmdict"
    // return "http://94.130.184.231:3000/jmdict"
    return "https://ultimatejapanese.de/db/jmdict"
  },

  check_string: function(input){

    // UNICODE RANGE : DESCRIPTION
    //
    // 3000-303F : punctuation
    // 3040-309F : hiragana
    // 30A0-30FF : katakana
    // FF00-FFEF : Full-width roman + half-width katakana
    // 4E00-9FAF : Common and uncommon kanji
    //
    // Non-Japanese punctuation/formatting characters commonly used in Japanese text
    // 2605-2606 : Stars
    // 2190-2195 : Arrows
    // u203B     : Weird asterisk thing

    var kanjiRegex = /[\u4E00-\u9FAF]/g;
    var kanaHiraganaRegex = /[\u3040-\u309F]|[\u30A0-\u30FF]/g;
    var containsKanji = kanjiRegex.test(input);
    var containsKana = kanaHiraganaRegex.test(input);
    var input = "input string";
    if(containsKanji) {
        return "KANJI"
    }else if(containsKana){
        return "KANA"
    }else{
        return "NONE"
    }

  },

  containsKanji: function(input){
        var kanjiRegex = /[\u4E00-\u9FAF]/g;
        return kanjiRegex.test(input);
  },

  containsGerman: function(input){
        var gerReg = /\b([äöüÄÖÜß]+)\b/g
        if (input) {
            return gerReg.test(input)
        }
  },

  isRomajiOrGerman(input){
    var germanRegex = /[\u00C0-\u00ff]/g;
    return germanRegex.test(input)
  },

  query: function(term, path, levenshtein, startsWith){
        var query = {
            "terms": [term],
            "path": path,
            "levenshtein_distance": levenshtein
        }
        if (startsWith) {
            query.starts_with = true;
        }
        return query

  },

  boost: function(path, boost_fun, param){
        var query = {
            "path": path,
            "boost_fun": boost_fun,
            "param": param
        }
        return query
  },

    handleURL: function(term, skip) {
        var newUrl = window.location.href;

        var url_search = this.findGetParameter('q');
        var isNewSearchTerm = false
        if (term != null && url_search != term) {
            isNewSearchTerm = true
            skip = 0 // reset skip on new term
            newUrl = this.replaceUrlParam(newUrl, 'q', term)
        }

        var pageChange = false
        var url_skip = this.findGetParameter('skip');
        if (skip !== null && (url_skip||0) != skip ) {
            pageChange = true
            newUrl = this.replaceUrlParam(newUrl, "skip", skip)
        }

        if (isNewSearchTerm || pageChange) {
            window.history.pushState({term:term, skip:skip}, null, newUrl);
            return true
        }else {
            return false
        }

    },

    findGetParameter: function(parameterName) {
        var result = null,
            tmp = [];
        var items = location.search.substr(1).split("&");
        for (var index = 0; index < items.length; index++) {
            tmp = items[index].split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        }
        return result;
    },

    replaceUrlParam: function(url, paramName, paramValue){
        if(paramValue == null)
            paramValue = '';
        var pattern = new RegExp('\\b('+paramName+'=).*?(&|$)')
        if(url.search(pattern)>=0){
            return url.replace(pattern,'$1' + paramValue + '$2');
        }
        return url + (url.indexOf('?')>0 ? '&' : '?') + paramName + '=' + paramValue
    }
}