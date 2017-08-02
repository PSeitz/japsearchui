export default {
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

  query: function(term, path, levenshtein, startsWith){
        var query = {
            "term": term,
            "path": path,
            "levenshtein_distance": levenshtein
        }
        if (startsWith) {
            query.starts_with = true;
        }
        return query

  }


}