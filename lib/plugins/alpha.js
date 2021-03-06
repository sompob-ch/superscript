'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rhymes = require('rhymes');

var _rhymes2 = _interopRequireDefault(_rhymes);

var _syllablistic = require('syllablistic');

var _syllablistic2 = _interopRequireDefault(_syllablistic);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug2.default)('AlphaPlugins');

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// TODO: deprecate oppisite and replace with opposite
const oppisite = function oppisite(word, cb) {
  debug('oppisite', word);

  this.facts.db.get({ subject: word, predicate: 'opposite' }, (err, opp) => {
    if (!_lodash2.default.isEmpty(opp)) {
      let oppositeWord = opp[0].object;
      oppositeWord = oppositeWord.replace(/_/g, ' ');
      cb(null, oppositeWord);
    } else {
      cb(null, '');
    }
  });
};

const rhymes = function rhymes(word, cb) {
  debug('rhyming', word);

  const rhymedWords = (0, _rhymes2.default)(word);
  const i = getRandomInt(0, rhymedWords.length - 1);

  if (rhymedWords.length !== 0) {
    cb(null, rhymedWords[i].word.toLowerCase());
  } else {
    cb(null, null);
  }
};

const syllable = (word, cb) => cb(null, _syllablistic2.default.text(word));

const letterLookup = function letterLookup(cb) {
  let reply = '';

  const lastWord = this.message.lemWords.slice(-1)[0];
  debug('--LastWord', lastWord);
  debug('LemWords', this.message.lemWords);
  const alpha = 'abcdefghijklmonpqrstuvwxyz'.split('');
  const pos = alpha.indexOf(lastWord);
  debug('POS', pos);
  if (this.message.lemWords.indexOf('before') !== -1) {
    if (alpha[pos - 1]) {
      reply = alpha[pos - 1].toUpperCase();
    } else {
      reply = "Don't be silly, there is nothing before A";
    }
  } else if (this.message.lemWords.indexOf('after') !== -1) {
    if (alpha[pos + 1]) {
      reply = alpha[pos + 1].toUpperCase();
    } else {
      reply = 'haha, funny.';
    }
  } else {
    const i = this.message.lemWords.indexOf('letter');
    const loc = this.message.lemWords[i - 1];

    if (loc === 'first') {
      reply = 'It is A.';
    } else if (loc === 'last') {
      reply = 'It is Z.';
    } else {
      // Number or word number
      // 1st, 2nd, 3rd, 4th or less then 99
      if ((loc === 'st' || loc === 'nd' || loc === 'rd' || loc === 'th') && this.message.numbers.length !== 0) {
        const num = parseInt(this.message.numbers[0]);
        if (num > 0 && num <= 26) {
          reply = `It is ${alpha[num - 1].toUpperCase()}`;
        } else {
          reply = 'seriously...';
        }
      }
    }
  }
  cb(null, reply);
};

const wordLength = function wordLength(cap, cb) {
  if (typeof cap === 'string') {
    const parts = cap.split(' ');
    if (parts.length === 1) {
      cb(null, cap.length);
    } else if (parts[0].toLowerCase() === 'the' && parts.length === 3) {
      // name bill, word bill
      cb(null, parts.pop().length);
    } else if (parts[0] === 'the' && parts[1].toLowerCase() === 'alphabet') {
      cb(null, '26');
    } else if (parts[0] === 'my' && parts.length === 2) {
      // Varible lookup
      const lookup = parts[1];
      this.user.getVar(lookup, (e, v) => {
        if (v !== null && v.length) {
          cb(null, `There are ${v.length} letters in your ${lookup}.`);
        } else {
          cb(null, "I don't know");
        }
      });
    } else if (parts[0] == 'this' && parts.length == 2) {
      // this phrase, this sentence
      cb(null, `That phrase has ${this.message.raw.length} characters. I think.`);
    } else {
      cb(null, 'I think there is about 10 characters. :)');
    }
  } else {
    cap(null, '');
  }
};

const nextNumber = function nextNumber(cb) {
  let reply = '';
  const num = this.message.numbers.slice(-1)[0];

  if (num) {
    if (this.message.lemWords.indexOf('before') !== -1) {
      reply = parseInt(num) - 1;
    }
    if (this.message.lemWords.indexOf('after') !== -1) {
      reply = parseInt(num) + 1;
    }
  }

  cb(null, reply);
};

exports.default = {
  letterLookup,
  nextNumber,
  oppisite,
  rhymes,
  syllable,
  wordLength
};