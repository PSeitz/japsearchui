/**
  * @typedef {Object} DefaultOptions
  * @property {Boolean} [useObsoleteKana=false] - Set to true to use obsolete characters, such as ゐ and ゑ.
  * @example
  * toHiragana('we', { useObsoleteKana: true })
  * // => 'ゑ'
  * @property {Boolean} [passRomaji=false] - Set to true to pass romaji when using mixed syllabaries with toKatakana() or toHiragana()
  * @example
  * toHiragana('only convert the katakana: ヒラガナ', { passRomaji: true })
  * // => "only convert the katakana: ひらがな"
  * @property {Boolean} [upcaseKatakana=false] - Set to true to convert katakana to uppercase using toRomaji()
  * @example
  * toRomaji('ひらがな カタカナ', { upcaseKatakana: true })
  * // => "hiragana KATAKANA"
  * @property {Boolean} [IMEMode=false] - Set to true to handle conversion from a text input as it is being typed
*/

/**
 * Default config for WanaKana, user passed options will be merged with this
 * @type {DefaultOptions}
 * @ignore
 */
var DEFAULT_OPTIONS = {
  useObsoleteKana: false,
  passRomaji: false,
  upcaseKatakana: false,
  IMEMode: false
};

// CharCode References
// http://unicode-table.com
// http://www.rikai.com/library/kanjitables/kanji_codes.unicode.shtml

/**
 * All Japanese regex, for mixes of kanji and kana like "泣き虫"
 * Includes Japanese full-width punctuation ranges
 * Doesn't include *half-width katakana / roman letters* since they should be considered typos
 * @type {RegExp}
 * @ignore
 */
var KANJI_KANA_REGEX = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff01-\uff0f\u4e00-\u9faf\u3400-\u4dbf]/;

/**
* Basic Latin unicode regex, for determining Romaji written as Hepburn romanisation
* Includes upper/lowercase long vowels like "ā, ī, ū, ē, ō"
* Includes curly quotes ‘’ “”
* @type {RegExp}
* @ignore
*/
var ROMAJI_REGEX = /[\u0000-\u007f\u0100-\u0101\u0112-\u0113\u012a-\u012b\u014c-\u014d\u016a-\u016b\u2018-\u2019\u201C-\u201D]/;

// TODO: just use a regex instead? not sure why these are in arrays
var ENGLISH_PUNCTUATION_RANGES = [[0x21, 0x2F], [0x3A, 0x3F], [0x5B, 0x60], [0x7B, 0x7E], [0x2018, 0x2019], // ‘ ’
[0x201C, 0x201D]];
var JAPANESE_FULLWIDTH_PUNCTUATION_RANGES = [[0x3001, 0x303E], [0x30FB, 0x30FC], [0xFF01, 0xFF0F], [0xFF1A, 0xFF1F], [0xFF3B, 0xFF3F], [0xFF5B, 0xFF60]];
var LOWERCASE_START = 0x61;

var UPPERCASE_START = 0x41;
var UPPERCASE_END = 0x5A;
var HIRAGANA_START = 0x3041;
var HIRAGANA_END = 0x3096;
var KATAKANA_START = 0x30A1;
var KATAKANA_END = 0x30FC;
var KANJI_START = 0x4E00;
var KANJI_END = 0x9FAF;
var LOWERCASE_FULLWIDTH_START = 0xFF41;
var LOWERCASE_FULLWIDTH_END = 0xFF5A;
var UPPERCASE_FULLWIDTH_START = 0xFF21;
var UPPERCASE_FULLWIDTH_END = 0xFF3A;
var PROLONGED_SOUND_MARK = 0x30FC;
var KANA_SLASH_DOT = 0x30FB;

var LONG_VOWELS = {
  a: 'あ',
  i: 'い',
  u: 'う',
  e: 'え',
  o: 'う'
};

var FOUR_CHAR_EDGECASES = ['lts', 'chy', 'shy'];

var FROM_ROMAJI = {
  '.': '。',
  ',': '、',
  ':': '：',
  '/': '・',
  '!': '！',
  '?': '？',
  '~': '〜',
  '-': 'ー',
  '‘': '「',
  '’': '」',
  '“': '『',
  '”': '』',
  '[': '［',
  ']': '］',
  '(': '（',
  ')': '）',
  '{': '｛',
  '}': '｝',

  'a': 'あ',
  'i': 'い',
  'u': 'う',
  'e': 'え',
  'o': 'お',
  'yi': 'い',
  'wu': 'う',
  'whu': 'う',
  'xa': 'ぁ',
  'xi': 'ぃ',
  'xu': 'ぅ',
  'xe': 'ぇ',
  'xo': 'ぉ',
  'xyi': 'ぃ',
  'xye': 'ぇ',
  'ye': 'いぇ',
  'wha': 'うぁ',
  'whi': 'うぃ',
  'whe': 'うぇ',
  'who': 'うぉ',
  'wi': 'うぃ',
  'we': 'うぇ',
  'va': 'ゔぁ',
  'vi': 'ゔぃ',
  'vu': 'ゔ',
  've': 'ゔぇ',
  'vo': 'ゔぉ',
  'vya': 'ゔゃ',
  'vyi': 'ゔぃ',
  'vyu': 'ゔゅ',
  'vye': 'ゔぇ',
  'vyo': 'ゔょ',
  'ka': 'か',
  'ki': 'き',
  'ku': 'く',
  'ke': 'け',
  'ko': 'こ',
  'lka': 'ヵ',
  'lke': 'ヶ',
  'xka': 'ヵ',
  'xke': 'ヶ',
  'kya': 'きゃ',
  'kyi': 'きぃ',
  'kyu': 'きゅ',
  'kye': 'きぇ',
  'kyo': 'きょ',
  'ca': 'か',
  'ci': 'き',
  'cu': 'く',
  'ce': 'け',
  'co': 'こ',
  'lca': 'ヵ',
  'lce': 'ヶ',
  'xca': 'ヵ',
  'xce': 'ヶ',
  'qya': 'くゃ',
  'qyu': 'くゅ',
  'qyo': 'くょ',
  'qwa': 'くぁ',
  'qwi': 'くぃ',
  'qwu': 'くぅ',
  'qwe': 'くぇ',
  'qwo': 'くぉ',
  'qa': 'くぁ',
  'qi': 'くぃ',
  'qe': 'くぇ',
  'qo': 'くぉ',
  'kwa': 'くぁ',
  'qyi': 'くぃ',
  'qye': 'くぇ',
  'ga': 'が',
  'gi': 'ぎ',
  'gu': 'ぐ',
  'ge': 'げ',
  'go': 'ご',
  'gya': 'ぎゃ',
  'gyi': 'ぎぃ',
  'gyu': 'ぎゅ',
  'gye': 'ぎぇ',
  'gyo': 'ぎょ',
  'gwa': 'ぐぁ',
  'gwi': 'ぐぃ',
  'gwu': 'ぐぅ',
  'gwe': 'ぐぇ',
  'gwo': 'ぐぉ',
  'sa': 'さ',
  'si': 'し',
  'shi': 'し',
  'su': 'す',
  'se': 'せ',
  'so': 'そ',
  'za': 'ざ',
  'zi': 'じ',
  'zu': 'ず',
  'ze': 'ぜ',
  'zo': 'ぞ',
  'ji': 'じ',
  'sya': 'しゃ',
  'syi': 'しぃ',
  'syu': 'しゅ',
  'sye': 'しぇ',
  'syo': 'しょ',
  'sha': 'しゃ',
  'shu': 'しゅ',
  'she': 'しぇ',
  'sho': 'しょ',
  'shya': 'しゃ', // 4 character code
  'shyu': 'しゅ', // 4 character code
  'shye': 'しぇ', // 4 character code
  'shyo': 'しょ', // 4 character code
  'swa': 'すぁ',
  'swi': 'すぃ',
  'swu': 'すぅ',
  'swe': 'すぇ',
  'swo': 'すぉ',
  'zya': 'じゃ',
  'zyi': 'じぃ',
  'zyu': 'じゅ',
  'zye': 'じぇ',
  'zyo': 'じょ',
  'ja': 'じゃ',
  'ju': 'じゅ',
  'je': 'じぇ',
  'jo': 'じょ',
  'jya': 'じゃ',
  'jyi': 'じぃ',
  'jyu': 'じゅ',
  'jye': 'じぇ',
  'jyo': 'じょ',
  'ta': 'た',
  'ti': 'ち',
  'tu': 'つ',
  'te': 'て',
  'to': 'と',
  'chi': 'ち',
  'tsu': 'つ',
  'ltu': 'っ',
  'xtu': 'っ',
  'tya': 'ちゃ',
  'tyi': 'ちぃ',
  'tyu': 'ちゅ',
  'tye': 'ちぇ',
  'tyo': 'ちょ',
  'cha': 'ちゃ',
  'chu': 'ちゅ',
  'che': 'ちぇ',
  'cho': 'ちょ',
  'cya': 'ちゃ',
  'cyi': 'ちぃ',
  'cyu': 'ちゅ',
  'cye': 'ちぇ',
  'cyo': 'ちょ',
  'chya': 'ちゃ', // 4 character code
  'chyu': 'ちゅ', // 4 character code
  'chye': 'ちぇ', // 4 character code
  'chyo': 'ちょ', // 4 character code
  'tsa': 'つぁ',
  'tsi': 'つぃ',
  'tse': 'つぇ',
  'tso': 'つぉ',
  'tha': 'てゃ',
  'thi': 'てぃ',
  'thu': 'てゅ',
  'the': 'てぇ',
  'tho': 'てょ',
  'twa': 'とぁ',
  'twi': 'とぃ',
  'twu': 'とぅ',
  'twe': 'とぇ',
  'two': 'とぉ',
  'da': 'だ',
  'di': 'ぢ',
  'du': 'づ',
  'de': 'で',
  'do': 'ど',
  'dya': 'ぢゃ',
  'dyi': 'ぢぃ',
  'dyu': 'ぢゅ',
  'dye': 'ぢぇ',
  'dyo': 'ぢょ',
  'dha': 'でゃ',
  'dhi': 'でぃ',
  'dhu': 'でゅ',
  'dhe': 'でぇ',
  'dho': 'でょ',
  'dwa': 'どぁ',
  'dwi': 'どぃ',
  'dwu': 'どぅ',
  'dwe': 'どぇ',
  'dwo': 'どぉ',
  'na': 'な',
  'ni': 'に',
  'nu': 'ぬ',
  'ne': 'ね',
  'no': 'の',
  'nya': 'にゃ',
  'nyi': 'にぃ',
  'nyu': 'にゅ',
  'nye': 'にぇ',
  'nyo': 'にょ',
  'ha': 'は',
  'hi': 'ひ',
  'hu': 'ふ',
  'he': 'へ',
  'ho': 'ほ',
  'fu': 'ふ',
  'hya': 'ひゃ',
  'hyi': 'ひぃ',
  'hyu': 'ひゅ',
  'hye': 'ひぇ',
  'hyo': 'ひょ',
  'fya': 'ふゃ',
  'fyu': 'ふゅ',
  'fyo': 'ふょ',
  'fwa': 'ふぁ',
  'fwi': 'ふぃ',
  'fwu': 'ふぅ',
  'fwe': 'ふぇ',
  'fwo': 'ふぉ',
  'fa': 'ふぁ',
  'fi': 'ふぃ',
  'fe': 'ふぇ',
  'fo': 'ふぉ',
  'fyi': 'ふぃ',
  'fye': 'ふぇ',
  'ba': 'ば',
  'bi': 'び',
  'bu': 'ぶ',
  'be': 'べ',
  'bo': 'ぼ',
  'bya': 'びゃ',
  'byi': 'びぃ',
  'byu': 'びゅ',
  'bye': 'びぇ',
  'byo': 'びょ',
  'pa': 'ぱ',
  'pi': 'ぴ',
  'pu': 'ぷ',
  'pe': 'ぺ',
  'po': 'ぽ',
  'pya': 'ぴゃ',
  'pyi': 'ぴぃ',
  'pyu': 'ぴゅ',
  'pye': 'ぴぇ',
  'pyo': 'ぴょ',
  'ma': 'ま',
  'mi': 'み',
  'mu': 'む',
  'me': 'め',
  'mo': 'も',
  'mya': 'みゃ',
  'myi': 'みぃ',
  'myu': 'みゅ',
  'mye': 'みぇ',
  'myo': 'みょ',
  'ya': 'や',
  'yu': 'ゆ',
  'yo': 'よ',
  'xya': 'ゃ',
  'xyu': 'ゅ',
  'xyo': 'ょ',
  'ra': 'ら',
  'ri': 'り',
  'ru': 'る',
  're': 'れ',
  'ro': 'ろ',
  'rya': 'りゃ',
  'ryi': 'りぃ',
  'ryu': 'りゅ',
  'rye': 'りぇ',
  'ryo': 'りょ',
  'la': 'ら',
  'li': 'り',
  'lu': 'る',
  'le': 'れ',
  'lo': 'ろ',
  'lya': 'りゃ',
  'lyi': 'りぃ',
  'lyu': 'りゅ',
  'lye': 'りぇ',
  'lyo': 'りょ',
  'wa': 'わ',
  'wo': 'を',
  'lwe': 'ゎ',
  'xwa': 'ゎ',
  'n': 'ん',
  'nn': 'ん',
  'n\'': 'ん', // n' should equal single ん
  'n ': 'ん', // n + space
  'xn': 'ん',
  'ltsu': 'っ' // 4 character code
};

var TO_ROMAJI = {
  '　': ' ',
  '！': '!',
  '？': '?',
  '。': '.',
  '：': ':',
  '・': '/',
  '、': ',',
  '〜': '~',
  'ー': '-',
  '「': '‘',
  '」': '’',
  '『': '“',
  '』': '”',
  '［': '[',
  '］': ']',
  '（': '(',
  '）': ')',
  '｛': '{',
  '｝': '}',

  'あ': 'a',
  'い': 'i',
  'う': 'u',
  'え': 'e',
  'お': 'o',
  'ゔぁ': 'va',
  'ゔぃ': 'vi',
  'ゔ': 'vu',
  'ゔぇ': 've',
  'ゔぉ': 'vo',
  'か': 'ka',
  'き': 'ki',
  'きゃ': 'kya',
  'きぃ': 'kyi',
  'きゅ': 'kyu',
  'く': 'ku',
  'け': 'ke',
  'こ': 'ko',
  'が': 'ga',
  'ぎ': 'gi',
  'ぐ': 'gu',
  'げ': 'ge',
  'ご': 'go',
  'ぎゃ': 'gya',
  'ぎぃ': 'gyi',
  'ぎゅ': 'gyu',
  'ぎぇ': 'gye',
  'ぎょ': 'gyo',
  'さ': 'sa',
  'す': 'su',
  'せ': 'se',
  'そ': 'so',
  'ざ': 'za',
  'ず': 'zu',
  'ぜ': 'ze',
  'ぞ': 'zo',
  'し': 'shi',
  'しゃ': 'sha',
  'しゅ': 'shu',
  'しょ': 'sho',
  'じ': 'ji',
  'じゃ': 'ja',
  'じゅ': 'ju',
  'じょ': 'jo',
  'た': 'ta',
  'ち': 'chi',
  'ちゃ': 'cha',
  'ちゅ': 'chu',
  'ちょ': 'cho',
  'つ': 'tsu',
  'て': 'te',
  'と': 'to',
  'だ': 'da',
  'ぢ': 'di',
  'づ': 'du',
  'で': 'de',
  'ど': 'do',
  'な': 'na',
  'に': 'ni',
  'にゃ': 'nya',
  'にゅ': 'nyu',
  'にょ': 'nyo',
  'ぬ': 'nu',
  'ね': 'ne',
  'の': 'no',
  'は': 'ha',
  'ひ': 'hi',
  'ふ': 'fu',
  'へ': 'he',
  'ほ': 'ho',
  'ひゃ': 'hya',
  'ひゅ': 'hyu',
  'ひょ': 'hyo',
  'ふぁ': 'fa',
  'ふぃ': 'fi',
  'ふぇ': 'fe',
  'ふぉ': 'fo',
  'ば': 'ba',
  'び': 'bi',
  'ぶ': 'bu',
  'べ': 'be',
  'ぼ': 'bo',
  'びゃ': 'bya',
  'びゅ': 'byu',
  'びょ': 'byo',
  'ぱ': 'pa',
  'ぴ': 'pi',
  'ぷ': 'pu',
  'ぺ': 'pe',
  'ぽ': 'po',
  'ぴゃ': 'pya',
  'ぴゅ': 'pyu',
  'ぴょ': 'pyo',
  'ま': 'ma',
  'み': 'mi',
  'む': 'mu',
  'め': 'me',
  'も': 'mo',
  'みゃ': 'mya',
  'みゅ': 'myu',
  'みょ': 'myo',
  'や': 'ya',
  'ゆ': 'yu',
  'よ': 'yo',
  'ら': 'ra',
  'り': 'ri',
  'る': 'ru',
  'れ': 're',
  'ろ': 'ro',
  'りゃ': 'rya',
  'りゅ': 'ryu',
  'りょ': 'ryo',
  'わ': 'wa',
  'を': 'wo',
  'ん': 'n',

  // Archaic characters
  'ゐ': 'wi',
  'ゑ': 'we',

  // Uncommon character combos
  'きぇ': 'kye',
  'きょ': 'kyo',
  'じぃ': 'jyi',
  'じぇ': 'jye',
  'ちぃ': 'cyi',
  'ちぇ': 'che',
  'ひぃ': 'hyi',
  'ひぇ': 'hye',
  'びぃ': 'byi',
  'びぇ': 'bye',
  'ぴぃ': 'pyi',
  'ぴぇ': 'pye',
  'みぇ': 'mye',
  'みぃ': 'myi',
  'りぃ': 'ryi',
  'りぇ': 'rye',
  'にぃ': 'nyi',
  'にぇ': 'nye',
  'しぃ': 'syi',
  'しぇ': 'she',
  'いぇ': 'ye',
  'うぁ': 'wha',
  'うぉ': 'who',
  'うぃ': 'wi',
  'うぇ': 'we',
  'ゔゃ': 'vya',
  'ゔゅ': 'vyu',
  'ゔょ': 'vyo',
  'すぁ': 'swa',
  'すぃ': 'swi',
  'すぅ': 'swu',
  'すぇ': 'swe',
  'すぉ': 'swo',
  'くゃ': 'qya',
  'くゅ': 'qyu',
  'くょ': 'qyo',
  'くぁ': 'qwa',
  'くぃ': 'qwi',
  'くぅ': 'qwu',
  'くぇ': 'qwe',
  'くぉ': 'qwo',
  'ぐぁ': 'gwa',
  'ぐぃ': 'gwi',
  'ぐぅ': 'gwu',
  'ぐぇ': 'gwe',
  'ぐぉ': 'gwo',
  'つぁ': 'tsa',
  'つぃ': 'tsi',
  'つぇ': 'tse',
  'つぉ': 'tso',
  'てゃ': 'tha',
  'てぃ': 'thi',
  'てゅ': 'thu',
  'てぇ': 'the',
  'てょ': 'tho',
  'とぁ': 'twa',
  'とぃ': 'twi',
  'とぅ': 'twu',
  'とぇ': 'twe',
  'とぉ': 'two',
  'ぢゃ': 'dya',
  'ぢぃ': 'dyi',
  'ぢゅ': 'dyu',
  'ぢぇ': 'dye',
  'ぢょ': 'dyo',
  'でゃ': 'dha',
  'でぃ': 'dhi',
  'でゅ': 'dhu',
  'でぇ': 'dhe',
  'でょ': 'dho',
  'どぁ': 'dwa',
  'どぃ': 'dwi',
  'どぅ': 'dwu',
  'どぇ': 'dwe',
  'どぉ': 'dwo',
  'ふぅ': 'fwu',
  'ふゃ': 'fya',
  'ふゅ': 'fyu',
  'ふょ': 'fyo',

  //  Small Characters (normally not transliterated alone)
  'ぁ': 'a',
  'ぃ': 'i',
  'ぇ': 'e',
  'ぅ': 'u',
  'ぉ': 'o',
  'ゃ': 'ya',
  'ゅ': 'yu',
  'ょ': 'yo',
  'っ': '',
  'ゕ': 'ka',
  'ゖ': 'ka',
  'ゎ': 'wa',

  // Ambiguous consonant vowel pairs
  'んあ': 'n\'a',
  'んい': 'n\'i',
  'んう': 'n\'u',
  'んえ': 'n\'e',
  'んお': 'n\'o',
  'んや': 'n\'ya',
  'んゆ': 'n\'yu',
  'んよ': 'n\'yo'
};

/**
 * Checks if input string is empty
 * @param  {String} input text input
 * @return {Boolean} true if no input
 */
function isEmpty(input) {
  if (typeof input !== 'string') {
    return true;
  }
  return !input.length;
}

/**
 * Takes a character and a unicode range. Returns true if the char is in the range.
 * @param  {String}  char  unicode character
 * @param  {Number}  start unicode start range
 * @param  {Number}  end   unicode end range
 * @return {Boolean}
 */
function isCharInRange() {
  var char = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var start = arguments[1];
  var end = arguments[2];

  if (isEmpty(char)) return false;
  var code = char.charCodeAt(0);
  return start <= code && code <= end;
}

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/**
 * Converts all fullwidth roman letters in string to proper ASCII
 * @param  {String} text Full Width roman letters
 * @return {String} ASCII
 */
function convertFullwidthCharsToASCII() {
  var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  var asciiChars = [].concat(toConsumableArray(text)).map(function (char, index) {
    var code = char.charCodeAt(0);
    var lower = isCharInRange(char, LOWERCASE_FULLWIDTH_START, LOWERCASE_FULLWIDTH_END);
    var upper = isCharInRange(char, UPPERCASE_FULLWIDTH_START, UPPERCASE_FULLWIDTH_END);
    if (lower) {
      return String.fromCharCode(code - LOWERCASE_FULLWIDTH_START + LOWERCASE_START);
    } else if (upper) {
      return String.fromCharCode(code - UPPERCASE_FULLWIDTH_START + UPPERCASE_START);
    }
    return char;
  });
  return asciiChars.join('');
}

/**
 * Tests if char is in English unicode uppercase range
 * @param  {String} char
 * @return {Boolean}
 */
function isCharUpperCase() {
  var char = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (isEmpty(char)) return false;
  return isCharInRange(char, UPPERCASE_START, UPPERCASE_END);
}

/**
 * Limits picking chunk size to be no bigger than the remaining characters.
 * @param  {Number} max index limit
 * @param  {Number} remaining
 * @return {Number}
 */
function getChunkSize() {
  var max = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var remaining = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  return Math.min(max, remaining);
}

/**
 * Returns a substring based on start/end values
 * @param  {String} text
 * @param  {Number} start index
 * @param  {Number} end index
 * @return {String} new substring
 */
function getChunk() {
  var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var end = arguments[2];

  return text.slice(start, end);
}

/**
 * Tests a character and an english consonant. Returns true if the char is a consonant.
 * @param  {String} char
 * @param  {Boolean} [includeY=true] Optional parameter to include y as a consonant in test
 * @return {Boolean}
 */
function isCharConsonant() {
  var char = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var includeY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  if (isEmpty(char)) return false;
  var regexp = includeY ? /[bcdfghjklmnpqrstvwxyz]/ : /[bcdfghjklmnpqrstvwxz]/;
  return char.toLowerCase().charAt(0).search(regexp) !== -1;
}

/**
 * Tests a character and an english vowel. Returns true if the char is a vowel.
 * @param  {String} char
 * @param  {Boolean} [includeY=true] Optional parameter to include y as a vowel in test
 * @return {Boolean}
 */
function isCharVowel() {
  var char = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var includeY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  if (isEmpty(char)) return false;
  var regexp = includeY ? /[aeiouy]/ : /[aeiou]/;
  return char.toLowerCase().charAt(0).search(regexp) !== -1;
}

/**
 * Returns true if char is 'ー'
 * @param  {String} char to test
 * @return {Boolean}
 */
function isCharLongDash() {
  var char = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (isEmpty(char)) return false;
  return char.charCodeAt(0) === PROLONGED_SOUND_MARK;
}

/**
 * Tests if char is '・'
 * @param  {String} char
 * @return {Boolean} true if '・'
 */
function isCharSlashDot() {
  var char = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (isEmpty(char)) return false;
  return char.charCodeAt(0) === KANA_SLASH_DOT;
}

/**
 * Tests a character. Returns true if the character is [Hiragana](https://en.wikipedia.org/wiki/Hiragana).
 * @param  {String} char character string to test
 * @return {Boolean}
 */
function isCharHiragana() {
  var char = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (isEmpty(char)) return false;
  if (isCharLongDash(char)) return true;
  return isCharInRange(char, HIRAGANA_START, HIRAGANA_END);
}

/**
 * Convert [Hiragana](https://en.wikipedia.org/wiki/Hiragana) to [Katakana](https://en.wikipedia.org/wiki/Katakana)
 * Passes through any non-hiragana chars
 * @param  {String} [input=''] text input
 * @return {String} converted text
 * @example
 * hiraganaToKatakana('ひらがな')
 * // => "ヒラガナ"
 * hiraganaToKatakana('ひらがな is a type of kana')
 * // => "ヒラガナ is a type of kana"
 * @ignore
 */
function hiraganaToKatakana() {
  var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  var kata = [];
  input.split('').forEach(function (char) {
    // Short circuit to avoid incorrect codeshift for 'ー' and '・'
    if (isCharLongDash(char) || isCharSlashDot(char)) {
      kata.push(char);
    } else if (isCharHiragana(char)) {
      // Shift charcode.
      var code = char.charCodeAt(0) + (KATAKANA_START - HIRAGANA_START);
      var kataChar = String.fromCharCode(code);
      kata.push(kataChar);
    } else {
      // Pass non-hiragana chars through
      kata.push(char);
    }
  });
  return kata.join('');
}

/**
 * Tests a character. Returns true if the character is [Katakana](https://en.wikipedia.org/wiki/Katakana).
 * @param  {String} char character string to test
 * @return {Boolean}
 */
function isCharKatakana() {
  var char = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  return isCharInRange(char, KATAKANA_START, KATAKANA_END);
}

/**
 * Tests a character. Returns true if the character is [Hiragana](https://en.wikipedia.org/wiki/Hiragana) or [Katakana](https://en.wikipedia.org/wiki/Katakana).
 * @param  {String} char character string to test
 * @return {Boolean}
 */
function isCharKana() {
  var char = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (isEmpty(char)) return false;
  return isCharHiragana(char) || isCharKatakana(char);
}

/**
 * Test if `input` is [Kana](https://en.wikipedia.org/wiki/Kana) ([Katakana](https://en.wikipedia.org/wiki/Katakana) and/or [Hiragana](https://en.wikipedia.org/wiki/Hiragana))
 * @param  {String} [input=''] text
 * @return {Boolean} true if all [Kana](https://en.wikipedia.org/wiki/Kana)
 * @example
 * isKana('あ')
 * // => true
 * isKana('ア')
 * // => true
 * isKana('あーア')
 * // => true
 * isKana('A')
 * // => false
 * isKana('あAア')
 * // => false
 */
function isKana() {
  var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (isEmpty(input)) return false;
  return [].concat(toConsumableArray(input)).every(isCharKana);
}

/**
 * Convert [Romaji](https://en.wikipedia.org/wiki/Romaji) to [Kana](https://en.wikipedia.org/wiki/Kana), lowercase text will result in [Hiragana](https://en.wikipedia.org/wiki/Hiragana) and uppercase text will result in [Katakana](https://en.wikipedia.org/wiki/Katakana).
 * @param  {String} [input=''] text
 * @param  {DefaultOptions} [options=defaultOptions]
 * @return {String} converted text
 * @example
 * toKana('onaji BUTTSUUJI')
 * // => 'おなじ ブッツウジ'
 * toKana('ONAJI buttsuuji')
 * // => 'オナジ ぶっつうじ'
 * toKana('座禅‘zazen’スタイル')
 * // => '座禅「ざぜん」スタイル'
 * toKana('batsuge-mu')
 * // => 'ばつげーむ'
 * toKana('!?.:/,~-‘’“”[](){}') // Punctuation conversion
 * // => '！？。：・、〜ー「」『』［］（）｛｝'
 * toKana('we', { useObsoleteKana: true })
 * // => 'ゑ'
 */
function toKana() {
  var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var ignoreCase = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var config = Object.assign({}, DEFAULT_OPTIONS, options);
  // Final output array
  var kana = [];
  // Position in the string that is being evaluated
  var cursor = 0;
  var len = input.length;
  var maxChunk = 3;
  var chunkSize = 3;
  var chunk = '';
  var chunkLC = '';

  // Steps through the string pulling out chunks of characters. Each chunk will be evaluated
  // against the romaji to kana table. If there is no match, the last character in the chunk
  // is dropped and the chunk is reevaluated. If nothing matches, the character is assumed
  // to be invalid or punctuation or other and gets passed through.
  while (cursor < len) {
    var kanaChar = null;
    chunkSize = getChunkSize(maxChunk, len - cursor);
    while (chunkSize > 0) {
      chunk = getChunk(input, cursor, cursor + chunkSize);
      chunkLC = chunk.toLowerCase();
      // Handle super-rare edge cases with 4 char chunks (like ltsu, chya, shya)
      if (FOUR_CHAR_EDGECASES.includes(chunkLC) && len - cursor >= 4) {
        chunkSize += 1;
        chunk = getChunk(input, cursor, cursor + chunkSize);
        chunkLC = chunk.toLowerCase();
      } else {
        // Handle edge case of n followed by consonant
        if (chunkLC.charAt(0) === 'n') {
          if (chunkSize === 2) {
            // Handle edge case of n followed by a space (only if not in IME mode)
            if (!config.IMEMode && chunkLC.charAt(1) === ' ') {
              kanaChar = 'ん ';
              break;
            }
            // Convert IME input of n' to "ん"
            if (config.IMEMode && chunkLC === "n'") {
              kanaChar = 'ん';
              break;
            }
          }
          // Handle edge case of n followed by n and vowel
          if (isCharConsonant(chunkLC.charAt(1), false) && isCharVowel(chunkLC.charAt(2))) {
            chunkSize = 1;
            chunk = getChunk(input, cursor, cursor + chunkSize);
            chunkLC = chunk.toLowerCase();
          }
        }

        // Handle case of double consonants
        if (chunkLC.charAt(0) !== 'n' && isCharConsonant(chunkLC.charAt(0)) && chunk.charAt(0) === chunk.charAt(1)) {
          chunkSize = 1;
          // Return katakana ッ if chunk is uppercase, otherwise return hiragana っ
          if (isCharInRange(chunk.charAt(0), UPPERCASE_START, UPPERCASE_END)) {
            chunkLC = 'ッ';
            chunk = 'ッ';
          } else {
            chunkLC = 'っ';
            chunk = 'っ';
          }
        }
      }

      kanaChar = FROM_ROMAJI[chunkLC];
      // console.log(`${chunkLC}, ${cursor}x${chunkSize}:${chunk} => ${kanaChar}`); // DEBUG
      if (kanaChar != null) {
        break;
      }
      // Step down the chunk size.
      // If chunkSize was 4, step down twice.
      if (chunkSize === 4) {
        chunkSize -= 2;
      } else {
        chunkSize -= 1;
      }
    }

    // Passthrough undefined values
    if (kanaChar == null) {
      kanaChar = chunk;
    }

    // Handle special cases.
    if (config.useObsoleteKana) {
      if (chunkLC === 'wi') kanaChar = 'ゐ';
      if (chunkLC === 'we') kanaChar = 'ゑ';
    }

    if (!!config.IMEMode && chunkLC.charAt(0) === 'n') {
      if (input.charAt(cursor + 1).toLowerCase() === 'y' && isCharVowel(input.charAt(cursor + 2)) === false || cursor === len - 1 || isKana(input.charAt(cursor + 1))) {
        // Don't transliterate this yet.
        kanaChar = chunk.charAt(0);
      }
    }

    // Use katakana if first letter in chunk is uppercase
    if (!ignoreCase) {
      if (isCharUpperCase(chunk.charAt(0))) {
        kanaChar = hiraganaToKatakana(kanaChar);
      }
    }

    kana.push(kanaChar);
    cursor += chunkSize || 1;
  }

  return kana.join('');
}

var ELEMENTS = ['TEXTAREA', 'INPUT'];
var LISTENERS = [];

/**
 * Binds eventListener for 'input' events to an input field to automagically replace values with kana
 * Sets`autocapitalize="none"` on the input field to prevent mobile devices forcing the first input character to katakana.
 * @param  {HTMLElement} input textarea, input[type="text"] etc
 * @param  {DefaultOptions} [options=defaultOptions] user config overrides
 */
function bind(input) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var listener = onInput(options);
  if (input instanceof Element && ELEMENTS.includes(input.nodeName)) {
    input.autocapitalize = 'none'; // eslint-disable-line no-param-reassign
    input.addEventListener('input', listener);
    LISTENERS = LISTENERS.concat({ id: input.getAttribute('id'), handler: listener });
  } else {
    console.warn('Input provided to wanakana.bind was not a valid input field.'); // eslint-disable-line no-console
  }
}

/**
 * Unbinds eventListener from input field
 * @param  {HTMLElement} input textarea, input[type="text"] etc
 */
function unbind(input) {
  var found = LISTENERS.find(function (_ref) {
    var id = _ref.id;
    return id === input.id;
  });
  if (found != null) {
    input.removeEventListener('input', found.handler);
    LISTENERS = LISTENERS.filter(function (entry) {
      return entry.handler !== found.handler;
    });
  } else {
    console.warn('Input had no listener registered.'); // eslint-disable-line no-console
  }
}

/**
 * Automagically replaces input values with converted text to kana
 * @param  {Object} event DOM event to listen to
 * @param  {defaultOptions} [options] user config overrides, default conversion is toKana()
 * @return {Function} event handler with bound options
 * @ignore
 */
function onInput(options) {
  var config = Object.assign({}, DEFAULT_OPTIONS, options);

  return function listener(event) {
    var input = event.target;
    // const startingCursor = input.selectionStart;
    // const startingLength = input.value.length;

    var normalizedInputString = convertFullwidthCharsToASCII(input.value);
    var hiraOrKataString = setKanaType(normalizedInputString, config.IMEMode);
    var ensureIMEModeConfig = Object.assign({}, config, { IMEMode: true });
    var newText = toKana(hiraOrKataString, ensureIMEModeConfig);

    if (normalizedInputString !== newText) {
      input.value = newText;

      // Modern browsers, set cursor to the end of the new text
      if (input.setSelectionRange != null && typeof input.selectionStart === 'number') {
        input.setSelectionRange(input.value.length, input.value.length);
        return;
      }
      // < IE 9
      if (input.createTextRange != null) {
        input.focus();
        var range = input.createTextRange();
        range.collapse(false);
        range.select();
      }
    }
  };
}

// easy way to still use `toKana` to handle IME input - but with forced conversion type
function setKanaType(input, flag) {
  switch (true) {
    case flag === 'toHiragana':
      return input.toLowerCase();
    case flag === 'toKatakana':
      return input.toUpperCase();
    default:
      return input;
  }
}

/**
 * Tests a character. Returns true if the character is [Romaji](https://en.wikipedia.org/wiki/Romaji)
 * @param  {String} char character string to test
 * @return {Boolean}
 */
function isCharKana$2() {
  var char = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (isEmpty(char)) return false;
  return ROMAJI_REGEX.test(char);
}

/**
 * Test if `input` is [Romaji](https://en.wikipedia.org/wiki/Romaji) (allowing [Hepburn romanisation](https://en.wikipedia.org/wiki/Hepburn_romanization))
 * @param  {String} [input=''] text
 * @return {Boolean} true if [Romaji](https://en.wikipedia.org/wiki/Romaji)
 * @example
 * isRomaji('Tōkyō and Ōsaka')
 * // => true
 * isRomaji('a*b&c-d')
 * // => true
 * isRomaji('あアA')
 * // => false
 * isRomaji('お願い')
 * // => false
 * isRomaji('a！b&cーd') // Full-width punctuation fails
 * // => false
 */
function isRomaji() {
  var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (isEmpty(input)) return false;
  return [].concat(toConsumableArray(input)).every(function (char) {
    return isCharKana$2(char);
  });
}

/**
 * Test if `input` is [Kanji](https://en.wikipedia.org/wiki/Kanji) and/or [Kana](https://en.wikipedia.org/wiki/Kana) like “「泣き虫」”
 * Includes Japanese full-width punctuation ranges
 * @param  {String} [input=''] text
 * @return {Boolean} true if all [Kanji](https://en.wikipedia.org/wiki/Kanji) and/or [Kana](https://en.wikipedia.org/wiki/Kana)
 * @example
 * isJapanese('泣き虫')
 * // => true
 * isJapanese('あア')
 * // => true
 * isJapanese('泣き虫。！〜') // Full-width punctuation
 * // => true
 * isJapanese('泣き虫.!~') // Half-width / Latin punctuation
 * // => false
 * isJapanese('泣き虫A')
 * // => false
 * isJapanese('A')
 * // => false
 */
function isJapanese() {
  var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (isEmpty(input)) return false;
  return [].concat(toConsumableArray(input)).every(function (char) {
    return KANJI_KANA_REGEX.test(char);
  });
}

/**
 * Test if `input` is [Hiragana](https://en.wikipedia.org/wiki/Hiragana)
 * @param  {String} [input=''] text
 * @return {Boolean} true if all [Hiragana](https://en.wikipedia.org/wiki/Hiragana)
 * @example
 * isHiragana('げーむ')
 * // => true
 * isHiragana('A')
 * // => false
 * isHiragana('あア')
 * // => false
 */
function isHiragana() {
  var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (isEmpty(input)) return false;
  return [].concat(toConsumableArray(input)).every(isCharHiragana);
}

/**
 * Test if `input` is [Katakana](https://en.wikipedia.org/wiki/Katakana)
 * @param  {String} [input=''] text
 * @return {Boolean} true if all [Katakana](https://en.wikipedia.org/wiki/Katakana)
 * @example
 * isKatakana('ゲーム')
 * // => true
 * isKatakana('あ')
 * // => false
 * isKatakana('A')
 * // => false
 * isKatakana('あア')
 * // => false
 */
function isKatakana() {
  var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (isEmpty(input)) return false;
  return [].concat(toConsumableArray(input)).every(isCharKatakana);
}

/**
 * Tests a character. Returns true if the character is a CJK ideograph (kanji).
 * @param  {String} char character string to test
 * @return {Boolean}
 */
function isCharKanji() {
  var char = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  return isCharInRange(char, KANJI_START, KANJI_END);
}

/**
 * Tests if `input` is [Kanji](https://en.wikipedia.org/wiki/Kanji) ([Japanese CJK ideographs](https://en.wikipedia.org/wiki/CJK_Unified_Ideographs))
 * @param  {String} [input=''] text
 * @return {Boolean} true if all [Kanji](https://en.wikipedia.org/wiki/Kanji)
 * @example
 * isKanji('刀')
 * // => true
 * isKanji('切腹')
 * // => true
 * isKanji('勢い')
 * // => false
 * isKanji('あAア')
 * // => false
 * isKanji('🐸')
 * // => false
 */
function isKanji() {
  var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (isEmpty(input)) return false;
  return [].concat(toConsumableArray(input)).every(isCharKanji);
}

/**
 * Test if `input` contains a mix of [Romaji](https://en.wikipedia.org/wiki/Romaji) *and* [Kana](https://en.wikipedia.org/wiki/Kana), defaults to pass through [Kanji](https://en.wikipedia.org/wiki/Kanji)
 * @param  {String} input text
 * @param  {Object} [options={ passKanji: true }] optional config to pass through kanji
 * @return {Boolean} true if mixed
 * @example
 * isMixed('Abあア'))
 * // => true
 * isMixed('お腹A'))
 * // => true
 * isMixed('お腹A', { passKanji: false }))
 * // => false
 * isMixed('ab'))
 * // => false
 * isMixed('あア'))
 * // => false
 */
function isMixed() {
  var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { passKanji: true };

  var chars = [].concat(toConsumableArray(input));
  var hasKanji = false;
  if (!options.passKanji) {
    hasKanji = chars.some(isKanji);
  }
  return (chars.some(isHiragana) || chars.some(isKatakana)) && chars.some(isRomaji) && !hasKanji;
}

/**
 * Convert [Katakana](https://en.wikipedia.org/wiki/Katakana) to [Hiragana](https://en.wikipedia.org/wiki/Hiragana)
 * Passes through any non-katakana chars
 * @param  {String} [input=''] text input
 * @return {String} converted text
 * @example
 * katakanaToHiragana('カタカナ')
 * // => "かたかな"
 * katakanaToHiragana('カタカナ is a type of kana')
 * // => "かたかな is a type of kana"
 * @ignore
 */
function katakanaToHiragana() {
  var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  var hira = [];
  var previousKana = '';
  var iterable = input.split('');
  for (var index = 0; index < iterable.length; index += 1) {
    var char = iterable[index];
    var _ref = [isCharSlashDot(char), isCharLongDash(char)],
        slashDot = _ref[0],
        longDash = _ref[1];
    // Short circuit to avoid incorrect codeshift for 'ー' and '・'

    if (slashDot || longDash && index < 1) {
      hira.push(char);
      // Transform long vowels: 'オー' to 'おう'
    } else if (longDash && index > 0) {
      // Transform previousKana back to romaji, and slice off the vowel
      var romaji = TO_ROMAJI[previousKana].slice(-1);
      hira.push(LONG_VOWELS[romaji]);
    } else if (isCharKatakana(char)) {
      // Shift charcode.
      var code = char.charCodeAt(0) + (HIRAGANA_START - KATAKANA_START);
      var hiraChar = String.fromCharCode(code);
      hira.push(hiraChar);
      previousKana = hiraChar;
    } else {
      // Pass non katakana chars through
      hira.push(char);
      previousKana = '';
    }
  }
  return hira.join('');
}

/**
 * Convert kana to romaji
 * @param  {String} kana text input
 * @param  {DefaultOptions} [options=defaultOptions]
 * @return {String} converted text
 * @example
 * toRomaji('ひらがな　カタカナ')
 * // => 'hiragana katakana'
 * toRomaji('ひらがな　カタカナ', { upcaseKatakana: true })
 * // => 'hiragana KATAKANA'
 */
function toRomaji() {
  var kana = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var config = Object.assign({}, DEFAULT_OPTIONS, options);
  var len = kana.length;
  // Final output array
  var roma = [];
  // Position in the string that is being evaluated
  var cursor = 0;
  var maxChunk = 2;
  var chunkSize = 2;
  var chunk = '';
  var romaChar = '';
  var nextCharIsDoubleConsonant = void 0;

  while (cursor < len) {
    chunkSize = getChunkSize(maxChunk, len - cursor);
    var convertThisChunkToUppercase = false;
    while (chunkSize > 0) {
      chunk = getChunk(kana, cursor, cursor + chunkSize);
      if (isKatakana(chunk)) {
        convertThisChunkToUppercase = config.upcaseKatakana;
        chunk = katakanaToHiragana(chunk);
      }
      // special case for small tsus
      if (chunk.charAt(0) === 'っ' && chunkSize === 1 && cursor < len - 1) {
        nextCharIsDoubleConsonant = true;
        romaChar = '';
        break;
      }

      romaChar = TO_ROMAJI[chunk];

      if (romaChar != null && nextCharIsDoubleConsonant) {
        romaChar = romaChar.charAt(0).concat(romaChar);
        nextCharIsDoubleConsonant = false;
      }
      // console.log(`${cursor}x${chunkSize}:${chunk} => ${romaChar}`);
      if (romaChar != null) {
        break;
      }
      chunkSize -= 1;
    }
    if (romaChar == null) {
      // Passthrough undefined values
      romaChar = chunk;
    }

    if (convertThisChunkToUppercase) {
      romaChar = romaChar.toUpperCase();
    }
    roma.push(romaChar);
    cursor += chunkSize || 1;
  }
  return roma.join('');
}

/**
 * Convert [Romaji](https://en.wikipedia.org/wiki/Romaji) to [Hiragana](https://en.wikipedia.org/wiki/Hiragana)
 * @param  {String} [input=''] text
 * @param  {Object} options used internally to pass along default options
 * @return {String} converted text
 * @example
 * romajiToHiragana('hiragana')
 * // => "ひらがな"
 * @ignore
 */
function romajiToHiragana() {
  var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return toKana(input, options, true /* ignore case to enforce Hiragana conversion */);
}

/**
 * Convert input to [Hiragana](https://en.wikipedia.org/wiki/Hiragana)
 * @param  {String} [input=''] text
 * @param  {DefaultOptions} [options=defaultOptions]
 * @return {String} converted text
 * @example
 * toHiragana('toukyou, オオサカ')
 * // => 'とうきょう、　おおさか'
 * toHiragana('only カナ', { passRomaji: true })
 * // => 'only かな'
 * toHiragana('wi')
 * // => 'うぃ'
 * toHiragana('wi', { useObsoleteKana: true })
 * // => 'ゐ'
*/
function toHiragana() {
  var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var config = Object.assign({}, DEFAULT_OPTIONS, options);
  if (config.passRomaji) return katakanaToHiragana(input);
  if (isRomaji(input)) return romajiToHiragana(input, config);
  if (isMixed(input, { passKanji: true })) {
    var romaji = katakanaToHiragana(input);
    return romajiToHiragana(romaji, config);
  }
  return katakanaToHiragana(input);
}

/**
 * Convert input to [Katakana](https://en.wikipedia.org/wiki/Katakana)
 * @param  {String} [input=''] text
 * @param  {DefaultOptions} [options=defaultOptions]
 * @return {String} converted text
 * @example
 * toKatakana('toukyou, おおさか')
 * // => 'トウキョウ、　オオサカ'
 * toKatakana('only かな', { passRomaji: true })
 * // => 'only カナ'
 * toKatakana('wi')
 * // => 'うぃ'
 * toKatakana('wi', { useObsoleteKana: true })
 * // => 'ヰ'
*/
function toKatakana() {
  var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var config = Object.assign({}, DEFAULT_OPTIONS, options);
  if (config.passRomaji) return hiraganaToKatakana(input);
  if (isRomaji(input) || isMixed(input)) {
    var romaji = romajiToHiragana(input, config);
    return hiraganaToKatakana(romaji);
  }
  return hiraganaToKatakana(input);
}

/**
 * Tests a character. Returns true if the character is considered English punctuation.
 * @param  {String} char character string to test
 * @return {Boolean}
 */
function isCharEnglishPunctuation() {
  var char = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (isEmpty(char)) return false;
  return ENGLISH_PUNCTUATION_RANGES.some(function (_ref) {
    var _ref2 = slicedToArray(_ref, 2),
        start = _ref2[0],
        end = _ref2[1];

    return isCharInRange(char, start, end);
  });
}

/**
 * Tests a character. Returns true if the character is considered Japanese punctuation.
 * @param  {String} char character string to test
 * @return {Boolean}
 */
function isCharJapanesePunctuation() {
  var char = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  return JAPANESE_FULLWIDTH_PUNCTUATION_RANGES.some(function (_ref) {
    var _ref2 = slicedToArray(_ref, 2),
        start = _ref2[0],
        end = _ref2[1];

    return isCharInRange(char, start, end);
  });
}

/**
 * Tests a character. Returns true if the character is considered Japanese or English punctuation.
 * @param  {String} char character string to test
 * @return {Boolean}
 */
function isCharPunctuation() {
  var char = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (isEmpty(char)) return false;
  return isCharEnglishPunctuation(char) || isCharJapanesePunctuation(char);
}

/**
 * Strips trailing [Okurigana](https://en.wikipedia.org/wiki/Okurigana) if `input` is a mix of [Kanji](https://en.wikipedia.org/wiki/Kanji) and [Kana](https://en.wikipedia.org/wiki/Kana)
 * @param  {String} input text
 * @param  {Object} [options={ all: false }] config object specifying if *all* kana should be removed, not just trailing okurigana
 * @return {String} text with okurigana removed
 * @example
 * stripOkurigana('踏み込む')
 * // => '踏み込'
 * stripOkurigana('粘り。')
 * // => '粘。'
 * stripOkurigana('お祝い')
 * // => 'お祝'
 * stripOkurigana('踏み込む', { all: true })
 * // => '踏込'
 * stripOkurigana('お祝い', { all: true })
 * // => '祝'
 */
function stripOkurigana() {
  var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { all: false };

  if (isEmpty(input) || !isJapanese(input) || isKana(input)) return input;
  var chars = [].concat(toConsumableArray(input));

  // strip every kana
  if (options.all) return chars.filter(function (char) {
    return !isCharKana(char);
  }).join('');

  // strip trailing only
  var reverseChars = chars.reverse();
  for (var i = 0, len = reverseChars.length; i < len; i += 1) {
    var char = reverseChars[i];
    // pass if it's punctuation
    if (isCharPunctuation(char)) continue; // eslint-disable-line no-continue
    // blank out if not kanji
    if (!isKanji(char)) {
      reverseChars[i] = '';
    } else break; // stop when we hit a kanji char
  }

  return reverseChars.reverse().join('');
}

// TODO: worth splitting into utils? so far not used anywhere else
function getType(input) {
  switch (true) {
    case isCharJapanesePunctuation(input):
      return 'japanesePunctuation';
    case isCharKanji(input):
      return 'kanji';
    case isCharHiragana(input):
      return 'hiragana';
    case isCharKatakana(input):
      return 'katakana';
    default:
      return 'romaji';
  }
}

/**
 * Splits input into array of [Kanji](https://en.wikipedia.org/wiki/Kanji), [Hiragana](https://en.wikipedia.org/wiki/Hiragana), [Katakana](https://en.wikipedia.org/wiki/Katakana), and [Romaji](https://en.wikipedia.org/wiki/Romaji) tokens.
 * Does not split into parts of speech!
 * @param  {String} input text
 * @return {Array} text split into tokens
 * @example
 * tokenize('ふふフフ')
 * // => ['ふふ', 'フフ']
 * tokenize('感じ')
 * // => ['感', 'じ']
 * tokenize('私は悲しい')
 * // => ['私', 'は', '悲', 'しい']
 * tokenize('what the...私は「悲しい」。')
 * // => ['what the...', '私', 'は', '「', '悲', 'しい', '」。']
 */
function tokenize() {
  var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (isEmpty(input)) return [''];
  var chars = [].concat(toConsumableArray(input));
  var head = chars.shift();
  var prevType = getType(head);

  var result = chars.reduce(function (tokens, char) {
    var currType = getType(char);
    var sameType = currType === prevType;
    prevType = getType(char);
    if (sameType) {
      var prev = tokens.pop();
      return tokens.concat(prev.concat(char));
    }
    return tokens.concat(char);
  }, [head]);

  return result;
}

// IME event listener DOM helpers

// exports.bind = bind;
// exports.unbind = unbind;
// exports.isRomaji = isRomaji;
// exports.isJapanese = isJapanese;
// exports.isKana = isKana;
// exports.isHiragana = isHiragana;
// exports.isKatakana = isKatakana;
// exports.isMixed = isMixed;
// exports.isKanji = isKanji;
// exports.toRomaji = toRomaji;
// exports.toKana = toKana;
// exports.toHiragana = toHiragana;
// exports.toKatakana = toKatakana;
// exports.stripOkurigana = stripOkurigana;
// exports.tokenize = tokenize;

export default {
    isRomaji : isRomaji,
    isJapanese : isJapanese,
    isKana : isKana,
    isHiragana : isHiragana,
    isKatakana : isKatakana,
    isMixed : isMixed,
    isKanji : isKanji,
    toRomaji : toRomaji,
    toKana : toKana,
    toHiragana : toHiragana,
    toKatakana : toKatakana,
    stripOkurigana : stripOkurigana,
    tokenize : tokenize
}
