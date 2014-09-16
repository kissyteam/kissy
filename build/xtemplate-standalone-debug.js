var XTemplate = (function(){ var module = {};

/*
combined modules:
xtemplate
xtemplate/runtime
xtemplate/runtime/util
xtemplate/runtime/commands
xtemplate/runtime/scope
xtemplate/runtime/linked-buffer
xtemplate/compiler
xtemplate/compiler/parser
xtemplate/compiler/ast
*/
var xtemplateRuntimeUtil, xtemplateRuntimeScope, xtemplateRuntimeLinkedBuffer, xtemplateCompilerParser, xtemplateCompilerAst, xtemplateRuntimeCommands, xtemplateRuntime, xtemplateCompiler, xtemplate;
xtemplateRuntimeUtil = function (exports) {
  // http://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
  // http://wonko.com/post/html-escaping
  var htmlEntities = {
    '&': '&amp;',
    '>': '&gt;',
    '<': '&lt;',
    '`': '&#x60;',
    '/': '&#x2F;',
    '"': '&quot;',
    /*jshint quotmark:false*/
    '\'': '&#x27;'
  };
  var possibleEscapeHtmlReg = /[&<>"'`]/;
  var escapeHtmlReg = getEscapeReg();
  var SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g;
  var win = typeof global !== 'undefined' ? global : window;
  function getEscapeReg() {
    var str = '';
    for (var entity in htmlEntities) {
      str += entity + '|';
    }
    str = str.slice(0, -1);
    escapeHtmlReg = new RegExp(str, 'g');
    return escapeHtmlReg;
  }
  var util;
  var toString = Object.prototype.toString;
  exports = util = {
    isArray: Array.isArray || function (obj) {
      return toString.call(obj);
    },
    keys: Object.keys || function (o) {
      var result = [];
      var p;
      for (p in o) {
        if (o.hasOwnProperty(p)) {
          result.push(p);
        }
      }
      return result;
    },
    each: function (object, fn, context) {
      if (object) {
        var key, val, keys;
        var i = 0;
        var length = object && object.length;
        var isObj = length === undefined || Object.prototype.toString.call(object) === '[object Function]';
        context = context || null;
        if (isObj) {
          keys = util.keys(object);
          for (; i < keys.length; i++) {
            key = keys[i];
            if (fn.call(context, object[key], key, object) === false) {
              break;
            }
          }
        } else {
          for (val = object[0]; i < length; val = object[++i]) {
            if (fn.call(context, val, i, object) === false) {
              break;
            }
          }
        }
      }
      return object;
    },
    mix: function (t, s) {
      for (var p in s) {
        t[p] = s[p];
      }
      return t;
    },
    globalEval: function (data) {
      if (win.execScript) {
        win.execScript(data);
      } else {
        (function (data) {
          win['eval'].call(win, data);
        }(data));
      }
    },
    substitute: function (str, o, regexp) {
      if (typeof str !== 'string' || !o) {
        return str;
      }
      return str.replace(regexp || SUBSTITUTE_REG, function (match, name) {
        if (match.charAt(0) === '\\') {
          return match.slice(1);
        }
        return o[name] === undefined ? '' : o[name];
      });
    },
    escapeHtml: function (str) {
      str = '' + str;
      if (!possibleEscapeHtmlReg.test(str)) {
        return str;
      }
      return (str + '').replace(escapeHtmlReg, function (m) {
        return htmlEntities[m];
      });
    },
    log: function () {
      if (typeof console !== 'undefined') {
        console.log.apply(console, arguments);
      }
    }
  };
  return exports;
}();
xtemplateRuntimeScope = function (exports) {
  var undef;
  function Scope(data) {
    if (data !== undef) {
      this.data = data;
    } else {
      this.data = {};
    }
    this.root = this;
  }
  Scope.prototype = {
    isScope: 1,
    setParent: function (parentScope) {
      this.parent = parentScope;
      this.root = parentScope.root;
    },
    set: function (name, value) {
      if (!this.affix) {
        this.affix = {};
      }
      this.affix[name] = value;
    },
    setData: function (data) {
      this.data = data;
    },
    getData: function () {
      return this.data;
    },
    mix: function (v) {
      var affix = this.affix;
      if (!affix) {
        affix = this.affix = {};
      }
      for (var name in v) {
        affix[name] = v[name];
      }
    },
    get: function (name) {
      var data = this.data;
      var v;
      var affix = this.affix;
      v = affix && affix[name];
      if (v !== undef) {
        return v;
      }
      if (data !== undef && data !== null) {
        v = data[name];
      }
      if (v !== undef) {
        return v;
      }
      if (name === 'this') {
        return data;
      } else if (name === 'root') {
        return this.root.data;
      }
      return v;
    },
    resolve: function (parts, depth) {
      var self = this;
      var v;
      if (!depth && parts.length === 1) {
        v = self.get(parts[0]);
        if (v !== undef) {
          return v;
        } else {
          depth = 1;
        }
      }
      var len = parts.length;
      var scope = self;
      var i;
      if (len && parts[0] === 'root') {
        parts.shift();
        scope = scope.root;
        len--;
      } else if (depth) {
        while (scope && depth--) {
          scope = scope.parent;
        }
      }
      if (!scope) {
        return undef;
      }
      if (!len) {
        return scope.data;
      }
      var part0 = parts[0];
      do {
        v = scope.get(part0);
      } while (v === undef && (scope = scope.parent));
      if (v && scope) {
        for (i = 1; v && i < len; i++) {
          v = v[parts[i]];
        }
        return v;
      } else {
        return undef;
      }
    }
  };
  exports = Scope;
  return exports;
}();
xtemplateRuntimeLinkedBuffer = function (exports) {
  var undef;
  var util = xtemplateRuntimeUtil;
  function Buffer(list) {
    this.list = list;
    this.init();
  }
  Buffer.prototype = {
    constructor: Buffer,
    isBuffer: 1,
    init: function () {
      this.data = '';
    },
    append: function (data) {
      this.data += data;
      return this;
    },
    write: function (data) {
      if (data != null) {
        this.append(data);
      }
      return this;
    },
    writeEscaped: function (data) {
      if (data != null) {
        this.append(util.escapeHtml(data));
      }
      return this;
    },
    async: function (fn) {
      var self = this;
      var list = self.list;
      var asyncFragment = new Buffer(list);
      var nextFragment = new Buffer(list);
      nextFragment.next = self.next;
      asyncFragment.next = nextFragment;
      self.next = asyncFragment;
      self.ready = true;
      fn(asyncFragment);
      return nextFragment;
    },
    error: function (reason) {
      var callback = this.list.callback;
      if (callback) {
        callback(reason, undef);
        this.list.callback = null;
      }
    },
    end: function () {
      var self = this;
      if (self.list.callback) {
        self.ready = true;
        self.list.flush();
      }
      return self;
    }
  };
  function LinkedBuffer(callback, config) {
    var self = this;
    self.config = config;
    self.head = new Buffer(self);
    self.callback = callback;
    this.init();
  }
  LinkedBuffer.prototype = {
    constructor: LinkedBuffer,
    init: function () {
      this.data = '';
    },
    append: function (data) {
      this.data += data;
    },
    end: function () {
      this.callback(null, this.data);
    },
    flush: function () {
      var self = this;
      var fragment = self.head;
      while (fragment) {
        if (fragment.ready) {
          this.append(fragment.data);
        } else {
          return;
        }
        fragment = fragment.next;
        self.head = fragment;
      }
      self.end();
    }
  };
  LinkedBuffer.Buffer = Buffer;
  exports = LinkedBuffer;
  return exports;
}();
xtemplateCompilerParser = function (exports) {
  var parser = function (undefined) {
    var parser = {};
    var GrammarConst = {
      'SHIFT_TYPE': 1,
      'REDUCE_TYPE': 2,
      'ACCEPT_TYPE': 0,
      'TYPE_INDEX': 0,
      'PRODUCTION_INDEX': 1,
      'TO_INDEX': 2
    };
    function peekStack(stack, n) {
      n = n || 1;
      return stack[stack.length - n];
    }
    function mix(to, from) {
      for (var f in from) {
        to[f] = from[f];
      }
    }
    function isArray(obj) {
      return '[object Array]' === Object.prototype.toString.call(obj);
    }
    function each(object, fn, context) {
      if (object) {
        var key, val, length, i = 0;
        context = context || null;
        if (!isArray(object)) {
          for (key in object) {
            if (fn.call(context, object[key], key, object) === false) {
              break;
            }
          }
        } else {
          length = object.length;
          for (val = object[0]; i < length; val = object[++i]) {
            if (fn.call(context, val, i, object) === false) {
              break;
            }
          }
        }
      }
    }
    function inArray(item, arr) {
      for (var i = 0, l = arr.length; i < l; i++) {
        if (arr[i] === item) {
          return true;
        }
      }
      return false;
    }
    var Lexer = function Lexer(cfg) {
      var self = this;
      self.rules = [];
      mix(self, cfg);
      self.resetInput(self.input);
    };
    Lexer.prototype = {
      'resetInput': function (input) {
        mix(this, {
          input: input,
          matched: '',
          stateStack: [Lexer.STATIC.INITIAL],
          match: '',
          text: '',
          firstLine: 1,
          lineNumber: 1,
          lastLine: 1,
          firstColumn: 1,
          lastColumn: 1
        });
      },
      'getCurrentRules': function () {
        var self = this, currentState = self.stateStack[self.stateStack.length - 1], rules = [];
        if (self.mapState) {
          currentState = self.mapState(currentState);
        }
        each(self.rules, function (r) {
          var state = r.state || r[3];
          if (!state) {
            if (currentState === Lexer.STATIC.INITIAL) {
              rules.push(r);
            }
          } else if (inArray(currentState, state)) {
            rules.push(r);
          }
        });
        return rules;
      },
      'pushState': function (state) {
        this.stateStack.push(state);
      },
      'popState': function (num) {
        num = num || 1;
        var ret;
        while (num--) {
          ret = this.stateStack.pop();
        }
        return ret;
      },
      'showDebugInfo': function () {
        var self = this, DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT, matched = self.matched, match = self.match, input = self.input;
        matched = matched.slice(0, matched.length - match.length);
        var past = (matched.length > DEBUG_CONTEXT_LIMIT ? '...' : '') + matched.slice(0 - DEBUG_CONTEXT_LIMIT).replace(/\n/g, ' '), next = match + input;
        next = next.slice(0, DEBUG_CONTEXT_LIMIT).replace(/\n/g, ' ') + (next.length > DEBUG_CONTEXT_LIMIT ? '...' : '');
        return past + next + '\n' + new Array(past.length + 1).join('-') + '^';
      },
      'mapSymbol': function mapSymbolForCodeGen(t) {
        return this.symbolMap[t];
      },
      'mapReverseSymbol': function (rs) {
        var self = this, symbolMap = self.symbolMap, i, reverseSymbolMap = self.reverseSymbolMap;
        if (!reverseSymbolMap && symbolMap) {
          reverseSymbolMap = self.reverseSymbolMap = {};
          for (i in symbolMap) {
            reverseSymbolMap[symbolMap[i]] = i;
          }
        }
        if (reverseSymbolMap) {
          return reverseSymbolMap[rs];
        } else {
          return rs;
        }
      },
      'lex': function () {
        var self = this, input = self.input, i, rule, m, ret, lines, rules = self.getCurrentRules();
        self.match = self.text = '';
        if (!input) {
          return self.mapSymbol(Lexer.STATIC.END_TAG);
        }
        for (i = 0; i < rules.length; i++) {
          rule = rules[i];
          var regexp = rule.regexp || rule[1], token = rule.token || rule[0], action = rule.action || rule[2] || undefined;
          if (m = input.match(regexp)) {
            lines = m[0].match(/\n.*/g);
            if (lines) {
              self.lineNumber += lines.length;
            }
            mix(self, {
              firstLine: self.lastLine,
              lastLine: self.lineNumber,
              firstColumn: self.lastColumn,
              lastColumn: lines ? lines[lines.length - 1].length - 1 : self.lastColumn + m[0].length
            });
            var match;
            match = self.match = m[0];
            self.matches = m;
            self.text = match;
            self.matched += match;
            ret = action && action.call(self);
            if (ret === undefined) {
              ret = token;
            } else {
              ret = self.mapSymbol(ret);
            }
            input = input.slice(match.length);
            self.input = input;
            if (ret) {
              return ret;
            } else {
              return self.lex();
            }
          }
        }
      }
    };
    Lexer.STATIC = {
      'INITIAL': 'I',
      'DEBUG_CONTEXT_LIMIT': 20,
      'END_TAG': '$EOF'
    };
    var lexer = new Lexer({
      'rules': [
        [
          0,
          /^[\s\S]*?(?={{)/,
          function () {
            var self = this, text = self.text, m, n = 0;
            if (m = text.match(/\\+$/)) {
              n = m[0].length;
            }
            if (n % 2) {
              self.pushState('et');
              text = text.slice(0, -1);
            } else {
              self.pushState('t');
            }
            if (n) {
              text = text.replace(/\\+$/g, function (m) {
                return new Array(m.length / 2 + 1).join('\\');
              });
            }
            self.text = text;
            return 'CONTENT';
          }
        ],
        [
          'b',
          /^[\s\S]+/,
          0
        ],
        [
          'b',
          /^[\s\S]{2,}?(?:(?={{)|$)/,
          function popState() {
            this.popState();
          },
          ['et']
        ],
        [
          'c',
          /^{{{?(?:#|@)/,
          function () {
            var self = this, text = self.text;
            if (text.length === 4) {
              self.pushState('p');
            } else {
              self.pushState('e');
            }
          },
          ['t']
        ],
        [
          'd',
          /^{{{?\//,
          function () {
            var self = this, text = self.text;
            if (text.length === 4) {
              self.pushState('p');
            } else {
              self.pushState('e');
            }
          },
          ['t']
        ],
        [
          'e',
          /^{{\s*else\s*}}/,
          function popState() {
            this.popState();
          },
          ['t']
        ],
        [
          0,
          /^{{![\s\S]*?}}/,
          function popState() {
            this.popState();
          },
          ['t']
        ],
        [
          'b',
          /^{{%([\s\S]*?)%}}/,
          function () {
            this.text = this.matches[1] || '';
            this.popState();
          },
          ['t']
        ],
        [
          'f',
          /^{{{?/,
          function () {
            var self = this, text = self.text;
            if (text.length === 3) {
              self.pushState('p');
            } else {
              self.pushState('e');
            }
          },
          ['t']
        ],
        [
          0,
          /^\s+/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'g',
          /^,/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'h',
          /^}}}/,
          function () {
            this.popState(2);
          },
          ['p']
        ],
        [
          'h',
          /^}}/,
          function () {
            this.popState(2);
          },
          ['e']
        ],
        [
          'i',
          /^\(/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'j',
          /^\)/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'k',
          /^\|\|/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'l',
          /^&&/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'm',
          /^===/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'n',
          /^!==/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'o',
          /^>=/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'p',
          /^<=/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'q',
          /^>/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'r',
          /^</,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          's',
          /^\+/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          't',
          /^-/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'u',
          /^\*/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'v',
          /^\//,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'w',
          /^%/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'x',
          /^!/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'y',
          /^"(\\[\s\S]|[^\\"\n])*"/,
          function () {
            this.text = this.text.slice(1, -1).replace(/\\"/g, '"');
          },
          [
            'p',
            'e'
          ]
        ],
        [
          'y',
          /^'(\\[\s\S]|[^\\'\n])*'/,
          function () {
            this.text = this.text.slice(1, -1).replace(/\\'/g, '\'');
          },
          [
            'p',
            'e'
          ]
        ],
        [
          'z',
          /^\d+(?:\.\d+)?(?:e-?\d+)?/i,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'aa',
          /^=/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'ab',
          /^\.\./,
          function () {
            this.pushState('ws');
          },
          [
            'p',
            'e'
          ]
        ],
        [
          'ac',
          /^\//,
          function popState() {
            this.popState();
          },
          ['ws']
        ],
        [
          'ac',
          /^\./,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'ad',
          /^\[/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'ae',
          /^\]/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'af',
          /^\{/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'ag',
          /^\:/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'ah',
          /^\}/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'ab',
          /^[a-zA-Z_$][a-zA-Z0-9_$]*/,
          0,
          [
            'p',
            'e'
          ]
        ]
      ]
    });
    parser.lexer = lexer;
    lexer.symbolMap = {
      '$EOF': 'a',
      'CONTENT': 'b',
      'OPEN_BLOCK': 'c',
      'OPEN_CLOSE_BLOCK': 'd',
      'INVERSE': 'e',
      'OPEN_TPL': 'f',
      'COMMA': 'g',
      'CLOSE': 'h',
      'L_PAREN': 'i',
      'R_PAREN': 'j',
      'OR': 'k',
      'AND': 'l',
      'LOGIC_EQUALS': 'm',
      'LOGIC_NOT_EQUALS': 'n',
      'GE': 'o',
      'LE': 'p',
      'GT': 'q',
      'LT': 'r',
      'PLUS': 's',
      'MINUS': 't',
      'MULTIPLY': 'u',
      'DIVIDE': 'v',
      'MODULUS': 'w',
      'NOT': 'x',
      'STRING': 'y',
      'NUMBER': 'z',
      'EQUALS': 'aa',
      'ID': 'ab',
      'SEP': 'ac',
      'L_BRACKET': 'ad',
      'R_BRACKET': 'ae',
      'L_BRACE': 'af',
      'COLON': 'ag',
      'R_BRACE': 'ah',
      '$START': 'ai',
      'program': 'aj',
      'statements': 'ak',
      'statement': 'al',
      'function': 'am',
      'id': 'an',
      'expression': 'ao',
      'params': 'ap',
      'hash': 'aq',
      'param': 'ar',
      'conditionalOrExpression': 'as',
      'listExpression': 'at',
      'jsonExpression': 'au',
      'jsonPart': 'av',
      'conditionalAndExpression': 'aw',
      'equalityExpression': 'ax',
      'relationalExpression': 'ay',
      'additiveExpression': 'az',
      'multiplicativeExpression': 'ba',
      'unaryExpression': 'bb',
      'primaryExpression': 'bc',
      'hashSegment': 'bd',
      'idSegments': 'be'
    };
    parser.productions = [
      [
        'ai',
        ['aj']
      ],
      [
        'aj',
        [
          'ak',
          'e',
          'ak'
        ],
        function () {
          return new this.yy.ProgramNode({
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$1, this.$3);
        }
      ],
      [
        'aj',
        ['ak'],
        function () {
          return new this.yy.ProgramNode({
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$1);
        }
      ],
      [
        'ak',
        ['al'],
        function () {
          return [this.$1];
        }
      ],
      [
        'ak',
        [
          'ak',
          'al'
        ],
        function () {
          this.$1.push(this.$2);
        }
      ],
      [
        'al',
        [
          'c',
          'am',
          'h',
          'aj',
          'd',
          'an',
          'h'
        ],
        function () {
          return new this.yy.BlockStatement({
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$2, this.$4, this.$6, this.$1.length !== 4);
        }
      ],
      [
        'al',
        [
          'f',
          'ao',
          'h'
        ],
        function () {
          return new this.yy.ExpressionStatement({
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$2, this.$1.length !== 3);
        }
      ],
      [
        'al',
        ['b'],
        function () {
          return new this.yy.ContentStatement({
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$1);
        }
      ],
      [
        'am',
        [
          'an',
          'i',
          'ap',
          'g',
          'aq',
          'j'
        ],
        function () {
          return new this.yy.Function({
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$1, this.$3, this.$5);
        }
      ],
      [
        'am',
        [
          'an',
          'i',
          'ap',
          'j'
        ],
        function () {
          return new this.yy.Function({
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$1, this.$3);
        }
      ],
      [
        'am',
        [
          'an',
          'i',
          'aq',
          'j'
        ],
        function () {
          return new this.yy.Function({
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$1, null, this.$3);
        }
      ],
      [
        'am',
        [
          'an',
          'i',
          'j'
        ],
        function () {
          return new this.yy.Function({
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$1);
        }
      ],
      [
        'ap',
        [
          'ap',
          'g',
          'ar'
        ],
        function () {
          this.$1.push(this.$3);
        }
      ],
      [
        'ap',
        ['ar'],
        function () {
          return [this.$1];
        }
      ],
      [
        'ar',
        ['ao']
      ],
      [
        'ao',
        ['as']
      ],
      [
        'ao',
        [
          'ad',
          'at',
          'ae'
        ],
        function () {
          return new this.yy.ArrayExpression(this.$2);
        }
      ],
      [
        'ao',
        [
          'af',
          'au',
          'ah'
        ],
        function () {
          return new this.yy.JsonExpression(this.$2);
        }
      ],
      [
        'av',
        [
          'y',
          'ag',
          'ao'
        ],
        function () {
          return [
            this.$1,
            this.$3
          ];
        }
      ],
      [
        'av',
        [
          'ab',
          'ag',
          'ao'
        ],
        function () {
          return [
            this.$1,
            this.$3
          ];
        }
      ],
      [
        'au',
        ['av'],
        function () {
          return [this.$1];
        }
      ],
      [
        'au',
        [
          'au',
          'g',
          'av'
        ],
        function () {
          this.$1.push(this.$3);
        }
      ],
      [
        'at',
        ['ao'],
        function () {
          return [this.$1];
        }
      ],
      [
        'at',
        [
          'at',
          'g',
          'ao'
        ],
        function () {
          this.$1.push(this.$3);
        }
      ],
      [
        'as',
        ['aw']
      ],
      [
        'as',
        [
          'as',
          'k',
          'aw'
        ],
        function () {
          return new this.yy.ConditionalOrExpression(this.$1, this.$3);
        }
      ],
      [
        'aw',
        ['ax']
      ],
      [
        'aw',
        [
          'aw',
          'l',
          'ax'
        ],
        function () {
          return new this.yy.ConditionalAndExpression(this.$1, this.$3);
        }
      ],
      [
        'ax',
        ['ay']
      ],
      [
        'ax',
        [
          'ax',
          'm',
          'ay'
        ],
        function () {
          return new this.yy.EqualityExpression(this.$1, '===', this.$3);
        }
      ],
      [
        'ax',
        [
          'ax',
          'n',
          'ay'
        ],
        function () {
          return new this.yy.EqualityExpression(this.$1, '!==', this.$3);
        }
      ],
      [
        'ay',
        ['az']
      ],
      [
        'ay',
        [
          'ay',
          'r',
          'az'
        ],
        function () {
          return new this.yy.RelationalExpression(this.$1, '<', this.$3);
        }
      ],
      [
        'ay',
        [
          'ay',
          'q',
          'az'
        ],
        function () {
          return new this.yy.RelationalExpression(this.$1, '>', this.$3);
        }
      ],
      [
        'ay',
        [
          'ay',
          'p',
          'az'
        ],
        function () {
          return new this.yy.RelationalExpression(this.$1, '<=', this.$3);
        }
      ],
      [
        'ay',
        [
          'ay',
          'o',
          'az'
        ],
        function () {
          return new this.yy.RelationalExpression(this.$1, '>=', this.$3);
        }
      ],
      [
        'az',
        ['ba']
      ],
      [
        'az',
        [
          'az',
          's',
          'ba'
        ],
        function () {
          return new this.yy.AdditiveExpression(this.$1, '+', this.$3);
        }
      ],
      [
        'az',
        [
          'az',
          't',
          'ba'
        ],
        function () {
          return new this.yy.AdditiveExpression(this.$1, '-', this.$3);
        }
      ],
      [
        'ba',
        ['bb']
      ],
      [
        'ba',
        [
          'ba',
          'u',
          'bb'
        ],
        function () {
          return new this.yy.MultiplicativeExpression(this.$1, '*', this.$3);
        }
      ],
      [
        'ba',
        [
          'ba',
          'v',
          'bb'
        ],
        function () {
          return new this.yy.MultiplicativeExpression(this.$1, '/', this.$3);
        }
      ],
      [
        'ba',
        [
          'ba',
          'w',
          'bb'
        ],
        function () {
          return new this.yy.MultiplicativeExpression(this.$1, '%', this.$3);
        }
      ],
      [
        'bb',
        [
          'x',
          'bb'
        ],
        function () {
          return new this.yy.UnaryExpression(this.$1, this.$2);
        }
      ],
      [
        'bb',
        [
          't',
          'bb'
        ],
        function () {
          return new this.yy.UnaryExpression(this.$1, this.$2);
        }
      ],
      [
        'bb',
        ['bc']
      ],
      [
        'bc',
        ['am']
      ],
      [
        'bc',
        ['y'],
        function () {
          return new this.yy.String({
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$1);
        }
      ],
      [
        'bc',
        ['z'],
        function () {
          return new this.yy.Number({
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$1);
        }
      ],
      [
        'bc',
        ['an']
      ],
      [
        'bc',
        [
          'i',
          'ao',
          'j'
        ],
        function () {
          return this.$2;
        }
      ],
      [
        'aq',
        [
          'aq',
          'g',
          'bd'
        ],
        function () {
          var hash = this.$1, seg = this.$3;
          hash.value[seg[0]] = seg[1];
        }
      ],
      [
        'aq',
        ['bd'],
        function () {
          var hash = new this.yy.Hash({
              line: this.lexer.firstLine,
              col: this.lexer.firstColumn
            }), $1 = this.$1;
          hash.value[$1[0]] = $1[1];
          return hash;
        }
      ],
      [
        'bd',
        [
          'ab',
          'aa',
          'ao'
        ],
        function () {
          return [
            this.$1,
            this.$3
          ];
        }
      ],
      [
        'an',
        ['be'],
        function () {
          return new this.yy.Id({
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$1);
        }
      ],
      [
        'be',
        [
          'be',
          'ac',
          'ab'
        ],
        function () {
          this.$1.push(this.$3);
        }
      ],
      [
        'be',
        [
          'be',
          'ad',
          'ao',
          'ae'
        ],
        function () {
          this.$1.push(this.$3);
        }
      ],
      [
        'be',
        ['ab'],
        function () {
          return [this.$1];
        }
      ]
    ];
    parser.table = {
      'gotos': {
        '0': {
          'aj': 4,
          'ak': 5,
          'al': 6
        },
        '2': {
          'am': 8,
          'an': 9,
          'be': 10
        },
        '3': {
          'am': 18,
          'an': 19,
          'ao': 20,
          'as': 21,
          'aw': 22,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '5': { 'al': 30 },
        '11': {
          'am': 18,
          'an': 19,
          'ao': 35,
          'as': 21,
          'aw': 22,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '12': {
          'am': 18,
          'an': 19,
          'bb': 36,
          'bc': 28,
          'be': 10
        },
        '13': {
          'am': 18,
          'an': 19,
          'bb': 37,
          'bc': 28,
          'be': 10
        },
        '16': {
          'am': 18,
          'an': 19,
          'ao': 38,
          'as': 21,
          'at': 39,
          'aw': 22,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '17': {
          'au': 42,
          'av': 43
        },
        '29': {
          'ak': 58,
          'al': 6
        },
        '31': {
          'aj': 59,
          'ak': 5,
          'al': 6
        },
        '32': {
          'am': 18,
          'an': 19,
          'ao': 62,
          'ap': 63,
          'aq': 64,
          'ar': 65,
          'as': 21,
          'aw': 22,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'bd': 66,
          'be': 10
        },
        '34': {
          'am': 18,
          'an': 19,
          'ao': 68,
          'as': 21,
          'aw': 22,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '45': {
          'am': 18,
          'an': 19,
          'aw': 76,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '46': {
          'am': 18,
          'an': 19,
          'ax': 77,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '47': {
          'am': 18,
          'an': 19,
          'ay': 78,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '48': {
          'am': 18,
          'an': 19,
          'ay': 79,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '49': {
          'am': 18,
          'an': 19,
          'az': 80,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '50': {
          'am': 18,
          'an': 19,
          'az': 81,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '51': {
          'am': 18,
          'an': 19,
          'az': 82,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '52': {
          'am': 18,
          'an': 19,
          'az': 83,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '53': {
          'am': 18,
          'an': 19,
          'ba': 84,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '54': {
          'am': 18,
          'an': 19,
          'ba': 85,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '55': {
          'am': 18,
          'an': 19,
          'bb': 86,
          'bc': 28,
          'be': 10
        },
        '56': {
          'am': 18,
          'an': 19,
          'bb': 87,
          'bc': 28,
          'be': 10
        },
        '57': {
          'am': 18,
          'an': 19,
          'bb': 88,
          'bc': 28,
          'be': 10
        },
        '58': { 'al': 30 },
        '70': {
          'am': 18,
          'an': 19,
          'ao': 96,
          'as': 21,
          'aw': 22,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '72': {
          'am': 18,
          'an': 19,
          'ao': 97,
          'as': 21,
          'aw': 22,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '73': {
          'am': 18,
          'an': 19,
          'ao': 98,
          'as': 21,
          'aw': 22,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '74': { 'av': 99 },
        '89': {
          'an': 100,
          'be': 10
        },
        '90': {
          'am': 18,
          'an': 19,
          'ao': 101,
          'as': 21,
          'aw': 22,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '91': {
          'am': 18,
          'an': 19,
          'ao': 62,
          'aq': 102,
          'ar': 103,
          'as': 21,
          'aw': 22,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'bd': 66,
          'be': 10
        },
        '93': { 'bd': 105 }
      },
      'action': {
        '0': {
          'b': [
            1,
            undefined,
            1
          ],
          'c': [
            1,
            undefined,
            2
          ],
          'f': [
            1,
            undefined,
            3
          ]
        },
        '1': {
          'a': [
            2,
            7
          ],
          'e': [
            2,
            7
          ],
          'c': [
            2,
            7
          ],
          'f': [
            2,
            7
          ],
          'b': [
            2,
            7
          ],
          'd': [
            2,
            7
          ]
        },
        '2': {
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '3': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ],
          'ad': [
            1,
            undefined,
            16
          ],
          'af': [
            1,
            undefined,
            17
          ]
        },
        '4': { 'a': [0] },
        '5': {
          'a': [
            2,
            2
          ],
          'd': [
            2,
            2
          ],
          'b': [
            1,
            undefined,
            1
          ],
          'c': [
            1,
            undefined,
            2
          ],
          'e': [
            1,
            undefined,
            29
          ],
          'f': [
            1,
            undefined,
            3
          ]
        },
        '6': {
          'a': [
            2,
            3
          ],
          'e': [
            2,
            3
          ],
          'c': [
            2,
            3
          ],
          'f': [
            2,
            3
          ],
          'b': [
            2,
            3
          ],
          'd': [
            2,
            3
          ]
        },
        '7': {
          'i': [
            2,
            57
          ],
          'ac': [
            2,
            57
          ],
          'ad': [
            2,
            57
          ],
          'h': [
            2,
            57
          ],
          'k': [
            2,
            57
          ],
          'l': [
            2,
            57
          ],
          'm': [
            2,
            57
          ],
          'n': [
            2,
            57
          ],
          'o': [
            2,
            57
          ],
          'p': [
            2,
            57
          ],
          'q': [
            2,
            57
          ],
          'r': [
            2,
            57
          ],
          's': [
            2,
            57
          ],
          't': [
            2,
            57
          ],
          'u': [
            2,
            57
          ],
          'v': [
            2,
            57
          ],
          'w': [
            2,
            57
          ],
          'j': [
            2,
            57
          ],
          'ae': [
            2,
            57
          ],
          'g': [
            2,
            57
          ],
          'ah': [
            2,
            57
          ]
        },
        '8': {
          'h': [
            1,
            undefined,
            31
          ]
        },
        '9': {
          'i': [
            1,
            undefined,
            32
          ]
        },
        '10': {
          'i': [
            2,
            54
          ],
          'h': [
            2,
            54
          ],
          'k': [
            2,
            54
          ],
          'l': [
            2,
            54
          ],
          'm': [
            2,
            54
          ],
          'n': [
            2,
            54
          ],
          'o': [
            2,
            54
          ],
          'p': [
            2,
            54
          ],
          'q': [
            2,
            54
          ],
          'r': [
            2,
            54
          ],
          's': [
            2,
            54
          ],
          't': [
            2,
            54
          ],
          'u': [
            2,
            54
          ],
          'v': [
            2,
            54
          ],
          'w': [
            2,
            54
          ],
          'j': [
            2,
            54
          ],
          'ae': [
            2,
            54
          ],
          'g': [
            2,
            54
          ],
          'ah': [
            2,
            54
          ],
          'ac': [
            1,
            undefined,
            33
          ],
          'ad': [
            1,
            undefined,
            34
          ]
        },
        '11': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ],
          'ad': [
            1,
            undefined,
            16
          ],
          'af': [
            1,
            undefined,
            17
          ]
        },
        '12': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '13': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '14': {
          'h': [
            2,
            47
          ],
          'k': [
            2,
            47
          ],
          'l': [
            2,
            47
          ],
          'm': [
            2,
            47
          ],
          'n': [
            2,
            47
          ],
          'o': [
            2,
            47
          ],
          'p': [
            2,
            47
          ],
          'q': [
            2,
            47
          ],
          'r': [
            2,
            47
          ],
          's': [
            2,
            47
          ],
          't': [
            2,
            47
          ],
          'u': [
            2,
            47
          ],
          'v': [
            2,
            47
          ],
          'w': [
            2,
            47
          ],
          'j': [
            2,
            47
          ],
          'ae': [
            2,
            47
          ],
          'g': [
            2,
            47
          ],
          'ah': [
            2,
            47
          ]
        },
        '15': {
          'h': [
            2,
            48
          ],
          'k': [
            2,
            48
          ],
          'l': [
            2,
            48
          ],
          'm': [
            2,
            48
          ],
          'n': [
            2,
            48
          ],
          'o': [
            2,
            48
          ],
          'p': [
            2,
            48
          ],
          'q': [
            2,
            48
          ],
          'r': [
            2,
            48
          ],
          's': [
            2,
            48
          ],
          't': [
            2,
            48
          ],
          'u': [
            2,
            48
          ],
          'v': [
            2,
            48
          ],
          'w': [
            2,
            48
          ],
          'j': [
            2,
            48
          ],
          'ae': [
            2,
            48
          ],
          'g': [
            2,
            48
          ],
          'ah': [
            2,
            48
          ]
        },
        '16': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ],
          'ad': [
            1,
            undefined,
            16
          ],
          'af': [
            1,
            undefined,
            17
          ]
        },
        '17': {
          'y': [
            1,
            undefined,
            40
          ],
          'ab': [
            1,
            undefined,
            41
          ]
        },
        '18': {
          'h': [
            2,
            46
          ],
          'k': [
            2,
            46
          ],
          'l': [
            2,
            46
          ],
          'm': [
            2,
            46
          ],
          'n': [
            2,
            46
          ],
          'o': [
            2,
            46
          ],
          'p': [
            2,
            46
          ],
          'q': [
            2,
            46
          ],
          'r': [
            2,
            46
          ],
          's': [
            2,
            46
          ],
          't': [
            2,
            46
          ],
          'u': [
            2,
            46
          ],
          'v': [
            2,
            46
          ],
          'w': [
            2,
            46
          ],
          'j': [
            2,
            46
          ],
          'ae': [
            2,
            46
          ],
          'g': [
            2,
            46
          ],
          'ah': [
            2,
            46
          ]
        },
        '19': {
          'h': [
            2,
            49
          ],
          'k': [
            2,
            49
          ],
          'l': [
            2,
            49
          ],
          'm': [
            2,
            49
          ],
          'n': [
            2,
            49
          ],
          'o': [
            2,
            49
          ],
          'p': [
            2,
            49
          ],
          'q': [
            2,
            49
          ],
          'r': [
            2,
            49
          ],
          's': [
            2,
            49
          ],
          't': [
            2,
            49
          ],
          'u': [
            2,
            49
          ],
          'v': [
            2,
            49
          ],
          'w': [
            2,
            49
          ],
          'j': [
            2,
            49
          ],
          'ae': [
            2,
            49
          ],
          'g': [
            2,
            49
          ],
          'ah': [
            2,
            49
          ],
          'i': [
            1,
            undefined,
            32
          ]
        },
        '20': {
          'h': [
            1,
            undefined,
            44
          ]
        },
        '21': {
          'h': [
            2,
            15
          ],
          'j': [
            2,
            15
          ],
          'ae': [
            2,
            15
          ],
          'g': [
            2,
            15
          ],
          'ah': [
            2,
            15
          ],
          'k': [
            1,
            undefined,
            45
          ]
        },
        '22': {
          'h': [
            2,
            24
          ],
          'k': [
            2,
            24
          ],
          'j': [
            2,
            24
          ],
          'ae': [
            2,
            24
          ],
          'g': [
            2,
            24
          ],
          'ah': [
            2,
            24
          ],
          'l': [
            1,
            undefined,
            46
          ]
        },
        '23': {
          'h': [
            2,
            26
          ],
          'k': [
            2,
            26
          ],
          'l': [
            2,
            26
          ],
          'j': [
            2,
            26
          ],
          'ae': [
            2,
            26
          ],
          'g': [
            2,
            26
          ],
          'ah': [
            2,
            26
          ],
          'm': [
            1,
            undefined,
            47
          ],
          'n': [
            1,
            undefined,
            48
          ]
        },
        '24': {
          'h': [
            2,
            28
          ],
          'k': [
            2,
            28
          ],
          'l': [
            2,
            28
          ],
          'm': [
            2,
            28
          ],
          'n': [
            2,
            28
          ],
          'j': [
            2,
            28
          ],
          'ae': [
            2,
            28
          ],
          'g': [
            2,
            28
          ],
          'ah': [
            2,
            28
          ],
          'o': [
            1,
            undefined,
            49
          ],
          'p': [
            1,
            undefined,
            50
          ],
          'q': [
            1,
            undefined,
            51
          ],
          'r': [
            1,
            undefined,
            52
          ]
        },
        '25': {
          'h': [
            2,
            31
          ],
          'k': [
            2,
            31
          ],
          'l': [
            2,
            31
          ],
          'm': [
            2,
            31
          ],
          'n': [
            2,
            31
          ],
          'o': [
            2,
            31
          ],
          'p': [
            2,
            31
          ],
          'q': [
            2,
            31
          ],
          'r': [
            2,
            31
          ],
          'j': [
            2,
            31
          ],
          'ae': [
            2,
            31
          ],
          'g': [
            2,
            31
          ],
          'ah': [
            2,
            31
          ],
          's': [
            1,
            undefined,
            53
          ],
          't': [
            1,
            undefined,
            54
          ]
        },
        '26': {
          'h': [
            2,
            36
          ],
          'k': [
            2,
            36
          ],
          'l': [
            2,
            36
          ],
          'm': [
            2,
            36
          ],
          'n': [
            2,
            36
          ],
          'o': [
            2,
            36
          ],
          'p': [
            2,
            36
          ],
          'q': [
            2,
            36
          ],
          'r': [
            2,
            36
          ],
          's': [
            2,
            36
          ],
          't': [
            2,
            36
          ],
          'j': [
            2,
            36
          ],
          'ae': [
            2,
            36
          ],
          'g': [
            2,
            36
          ],
          'ah': [
            2,
            36
          ],
          'u': [
            1,
            undefined,
            55
          ],
          'v': [
            1,
            undefined,
            56
          ],
          'w': [
            1,
            undefined,
            57
          ]
        },
        '27': {
          'h': [
            2,
            39
          ],
          'k': [
            2,
            39
          ],
          'l': [
            2,
            39
          ],
          'm': [
            2,
            39
          ],
          'n': [
            2,
            39
          ],
          'o': [
            2,
            39
          ],
          'p': [
            2,
            39
          ],
          'q': [
            2,
            39
          ],
          'r': [
            2,
            39
          ],
          's': [
            2,
            39
          ],
          't': [
            2,
            39
          ],
          'u': [
            2,
            39
          ],
          'v': [
            2,
            39
          ],
          'w': [
            2,
            39
          ],
          'j': [
            2,
            39
          ],
          'ae': [
            2,
            39
          ],
          'g': [
            2,
            39
          ],
          'ah': [
            2,
            39
          ]
        },
        '28': {
          'h': [
            2,
            45
          ],
          'k': [
            2,
            45
          ],
          'l': [
            2,
            45
          ],
          'm': [
            2,
            45
          ],
          'n': [
            2,
            45
          ],
          'o': [
            2,
            45
          ],
          'p': [
            2,
            45
          ],
          'q': [
            2,
            45
          ],
          'r': [
            2,
            45
          ],
          's': [
            2,
            45
          ],
          't': [
            2,
            45
          ],
          'u': [
            2,
            45
          ],
          'v': [
            2,
            45
          ],
          'w': [
            2,
            45
          ],
          'j': [
            2,
            45
          ],
          'ae': [
            2,
            45
          ],
          'g': [
            2,
            45
          ],
          'ah': [
            2,
            45
          ]
        },
        '29': {
          'b': [
            1,
            undefined,
            1
          ],
          'c': [
            1,
            undefined,
            2
          ],
          'f': [
            1,
            undefined,
            3
          ]
        },
        '30': {
          'a': [
            2,
            4
          ],
          'e': [
            2,
            4
          ],
          'c': [
            2,
            4
          ],
          'f': [
            2,
            4
          ],
          'b': [
            2,
            4
          ],
          'd': [
            2,
            4
          ]
        },
        '31': {
          'b': [
            1,
            undefined,
            1
          ],
          'c': [
            1,
            undefined,
            2
          ],
          'f': [
            1,
            undefined,
            3
          ]
        },
        '32': {
          'i': [
            1,
            undefined,
            11
          ],
          'j': [
            1,
            undefined,
            60
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            61
          ],
          'ad': [
            1,
            undefined,
            16
          ],
          'af': [
            1,
            undefined,
            17
          ]
        },
        '33': {
          'ab': [
            1,
            undefined,
            67
          ]
        },
        '34': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ],
          'ad': [
            1,
            undefined,
            16
          ],
          'af': [
            1,
            undefined,
            17
          ]
        },
        '35': {
          'j': [
            1,
            undefined,
            69
          ]
        },
        '36': {
          'h': [
            2,
            44
          ],
          'k': [
            2,
            44
          ],
          'l': [
            2,
            44
          ],
          'm': [
            2,
            44
          ],
          'n': [
            2,
            44
          ],
          'o': [
            2,
            44
          ],
          'p': [
            2,
            44
          ],
          'q': [
            2,
            44
          ],
          'r': [
            2,
            44
          ],
          's': [
            2,
            44
          ],
          't': [
            2,
            44
          ],
          'u': [
            2,
            44
          ],
          'v': [
            2,
            44
          ],
          'w': [
            2,
            44
          ],
          'j': [
            2,
            44
          ],
          'ae': [
            2,
            44
          ],
          'g': [
            2,
            44
          ],
          'ah': [
            2,
            44
          ]
        },
        '37': {
          'h': [
            2,
            43
          ],
          'k': [
            2,
            43
          ],
          'l': [
            2,
            43
          ],
          'm': [
            2,
            43
          ],
          'n': [
            2,
            43
          ],
          'o': [
            2,
            43
          ],
          'p': [
            2,
            43
          ],
          'q': [
            2,
            43
          ],
          'r': [
            2,
            43
          ],
          's': [
            2,
            43
          ],
          't': [
            2,
            43
          ],
          'u': [
            2,
            43
          ],
          'v': [
            2,
            43
          ],
          'w': [
            2,
            43
          ],
          'j': [
            2,
            43
          ],
          'ae': [
            2,
            43
          ],
          'g': [
            2,
            43
          ],
          'ah': [
            2,
            43
          ]
        },
        '38': {
          'ae': [
            2,
            22
          ],
          'g': [
            2,
            22
          ]
        },
        '39': {
          'g': [
            1,
            undefined,
            70
          ],
          'ae': [
            1,
            undefined,
            71
          ]
        },
        '40': {
          'ag': [
            1,
            undefined,
            72
          ]
        },
        '41': {
          'ag': [
            1,
            undefined,
            73
          ]
        },
        '42': {
          'g': [
            1,
            undefined,
            74
          ],
          'ah': [
            1,
            undefined,
            75
          ]
        },
        '43': {
          'ah': [
            2,
            20
          ],
          'g': [
            2,
            20
          ]
        },
        '44': {
          'a': [
            2,
            6
          ],
          'e': [
            2,
            6
          ],
          'c': [
            2,
            6
          ],
          'f': [
            2,
            6
          ],
          'b': [
            2,
            6
          ],
          'd': [
            2,
            6
          ]
        },
        '45': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '46': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '47': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '48': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '49': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '50': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '51': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '52': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '53': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '54': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '55': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '56': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '57': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '58': {
          'a': [
            2,
            1
          ],
          'd': [
            2,
            1
          ],
          'b': [
            1,
            undefined,
            1
          ],
          'c': [
            1,
            undefined,
            2
          ],
          'f': [
            1,
            undefined,
            3
          ]
        },
        '59': {
          'd': [
            1,
            undefined,
            89
          ]
        },
        '60': {
          'h': [
            2,
            11
          ],
          'k': [
            2,
            11
          ],
          'l': [
            2,
            11
          ],
          'm': [
            2,
            11
          ],
          'n': [
            2,
            11
          ],
          'o': [
            2,
            11
          ],
          'p': [
            2,
            11
          ],
          'q': [
            2,
            11
          ],
          'r': [
            2,
            11
          ],
          's': [
            2,
            11
          ],
          't': [
            2,
            11
          ],
          'u': [
            2,
            11
          ],
          'v': [
            2,
            11
          ],
          'w': [
            2,
            11
          ],
          'j': [
            2,
            11
          ],
          'ae': [
            2,
            11
          ],
          'g': [
            2,
            11
          ],
          'ah': [
            2,
            11
          ]
        },
        '61': {
          'g': [
            2,
            57
          ],
          'i': [
            2,
            57
          ],
          'j': [
            2,
            57
          ],
          'k': [
            2,
            57
          ],
          'l': [
            2,
            57
          ],
          'm': [
            2,
            57
          ],
          'n': [
            2,
            57
          ],
          'o': [
            2,
            57
          ],
          'p': [
            2,
            57
          ],
          'q': [
            2,
            57
          ],
          'r': [
            2,
            57
          ],
          's': [
            2,
            57
          ],
          't': [
            2,
            57
          ],
          'u': [
            2,
            57
          ],
          'v': [
            2,
            57
          ],
          'w': [
            2,
            57
          ],
          'ac': [
            2,
            57
          ],
          'ad': [
            2,
            57
          ],
          'aa': [
            1,
            undefined,
            90
          ]
        },
        '62': {
          'g': [
            2,
            14
          ],
          'j': [
            2,
            14
          ]
        },
        '63': {
          'g': [
            1,
            undefined,
            91
          ],
          'j': [
            1,
            undefined,
            92
          ]
        },
        '64': {
          'g': [
            1,
            undefined,
            93
          ],
          'j': [
            1,
            undefined,
            94
          ]
        },
        '65': {
          'g': [
            2,
            13
          ],
          'j': [
            2,
            13
          ]
        },
        '66': {
          'j': [
            2,
            52
          ],
          'g': [
            2,
            52
          ]
        },
        '67': {
          'i': [
            2,
            55
          ],
          'ac': [
            2,
            55
          ],
          'ad': [
            2,
            55
          ],
          'h': [
            2,
            55
          ],
          'k': [
            2,
            55
          ],
          'l': [
            2,
            55
          ],
          'm': [
            2,
            55
          ],
          'n': [
            2,
            55
          ],
          'o': [
            2,
            55
          ],
          'p': [
            2,
            55
          ],
          'q': [
            2,
            55
          ],
          'r': [
            2,
            55
          ],
          's': [
            2,
            55
          ],
          't': [
            2,
            55
          ],
          'u': [
            2,
            55
          ],
          'v': [
            2,
            55
          ],
          'w': [
            2,
            55
          ],
          'j': [
            2,
            55
          ],
          'ae': [
            2,
            55
          ],
          'g': [
            2,
            55
          ],
          'ah': [
            2,
            55
          ]
        },
        '68': {
          'ae': [
            1,
            undefined,
            95
          ]
        },
        '69': {
          'h': [
            2,
            50
          ],
          'k': [
            2,
            50
          ],
          'l': [
            2,
            50
          ],
          'm': [
            2,
            50
          ],
          'n': [
            2,
            50
          ],
          'o': [
            2,
            50
          ],
          'p': [
            2,
            50
          ],
          'q': [
            2,
            50
          ],
          'r': [
            2,
            50
          ],
          's': [
            2,
            50
          ],
          't': [
            2,
            50
          ],
          'u': [
            2,
            50
          ],
          'v': [
            2,
            50
          ],
          'w': [
            2,
            50
          ],
          'j': [
            2,
            50
          ],
          'ae': [
            2,
            50
          ],
          'g': [
            2,
            50
          ],
          'ah': [
            2,
            50
          ]
        },
        '70': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ],
          'ad': [
            1,
            undefined,
            16
          ],
          'af': [
            1,
            undefined,
            17
          ]
        },
        '71': {
          'h': [
            2,
            16
          ],
          'j': [
            2,
            16
          ],
          'ae': [
            2,
            16
          ],
          'g': [
            2,
            16
          ],
          'ah': [
            2,
            16
          ]
        },
        '72': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ],
          'ad': [
            1,
            undefined,
            16
          ],
          'af': [
            1,
            undefined,
            17
          ]
        },
        '73': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ],
          'ad': [
            1,
            undefined,
            16
          ],
          'af': [
            1,
            undefined,
            17
          ]
        },
        '74': {
          'y': [
            1,
            undefined,
            40
          ],
          'ab': [
            1,
            undefined,
            41
          ]
        },
        '75': {
          'h': [
            2,
            17
          ],
          'j': [
            2,
            17
          ],
          'ae': [
            2,
            17
          ],
          'g': [
            2,
            17
          ],
          'ah': [
            2,
            17
          ]
        },
        '76': {
          'h': [
            2,
            25
          ],
          'k': [
            2,
            25
          ],
          'j': [
            2,
            25
          ],
          'ae': [
            2,
            25
          ],
          'g': [
            2,
            25
          ],
          'ah': [
            2,
            25
          ],
          'l': [
            1,
            undefined,
            46
          ]
        },
        '77': {
          'h': [
            2,
            27
          ],
          'k': [
            2,
            27
          ],
          'l': [
            2,
            27
          ],
          'j': [
            2,
            27
          ],
          'ae': [
            2,
            27
          ],
          'g': [
            2,
            27
          ],
          'ah': [
            2,
            27
          ],
          'm': [
            1,
            undefined,
            47
          ],
          'n': [
            1,
            undefined,
            48
          ]
        },
        '78': {
          'h': [
            2,
            29
          ],
          'k': [
            2,
            29
          ],
          'l': [
            2,
            29
          ],
          'm': [
            2,
            29
          ],
          'n': [
            2,
            29
          ],
          'j': [
            2,
            29
          ],
          'ae': [
            2,
            29
          ],
          'g': [
            2,
            29
          ],
          'ah': [
            2,
            29
          ],
          'o': [
            1,
            undefined,
            49
          ],
          'p': [
            1,
            undefined,
            50
          ],
          'q': [
            1,
            undefined,
            51
          ],
          'r': [
            1,
            undefined,
            52
          ]
        },
        '79': {
          'h': [
            2,
            30
          ],
          'k': [
            2,
            30
          ],
          'l': [
            2,
            30
          ],
          'm': [
            2,
            30
          ],
          'n': [
            2,
            30
          ],
          'j': [
            2,
            30
          ],
          'ae': [
            2,
            30
          ],
          'g': [
            2,
            30
          ],
          'ah': [
            2,
            30
          ],
          'o': [
            1,
            undefined,
            49
          ],
          'p': [
            1,
            undefined,
            50
          ],
          'q': [
            1,
            undefined,
            51
          ],
          'r': [
            1,
            undefined,
            52
          ]
        },
        '80': {
          'h': [
            2,
            35
          ],
          'k': [
            2,
            35
          ],
          'l': [
            2,
            35
          ],
          'm': [
            2,
            35
          ],
          'n': [
            2,
            35
          ],
          'o': [
            2,
            35
          ],
          'p': [
            2,
            35
          ],
          'q': [
            2,
            35
          ],
          'r': [
            2,
            35
          ],
          'j': [
            2,
            35
          ],
          'ae': [
            2,
            35
          ],
          'g': [
            2,
            35
          ],
          'ah': [
            2,
            35
          ],
          's': [
            1,
            undefined,
            53
          ],
          't': [
            1,
            undefined,
            54
          ]
        },
        '81': {
          'h': [
            2,
            34
          ],
          'k': [
            2,
            34
          ],
          'l': [
            2,
            34
          ],
          'm': [
            2,
            34
          ],
          'n': [
            2,
            34
          ],
          'o': [
            2,
            34
          ],
          'p': [
            2,
            34
          ],
          'q': [
            2,
            34
          ],
          'r': [
            2,
            34
          ],
          'j': [
            2,
            34
          ],
          'ae': [
            2,
            34
          ],
          'g': [
            2,
            34
          ],
          'ah': [
            2,
            34
          ],
          's': [
            1,
            undefined,
            53
          ],
          't': [
            1,
            undefined,
            54
          ]
        },
        '82': {
          'h': [
            2,
            33
          ],
          'k': [
            2,
            33
          ],
          'l': [
            2,
            33
          ],
          'm': [
            2,
            33
          ],
          'n': [
            2,
            33
          ],
          'o': [
            2,
            33
          ],
          'p': [
            2,
            33
          ],
          'q': [
            2,
            33
          ],
          'r': [
            2,
            33
          ],
          'j': [
            2,
            33
          ],
          'ae': [
            2,
            33
          ],
          'g': [
            2,
            33
          ],
          'ah': [
            2,
            33
          ],
          's': [
            1,
            undefined,
            53
          ],
          't': [
            1,
            undefined,
            54
          ]
        },
        '83': {
          'h': [
            2,
            32
          ],
          'k': [
            2,
            32
          ],
          'l': [
            2,
            32
          ],
          'm': [
            2,
            32
          ],
          'n': [
            2,
            32
          ],
          'o': [
            2,
            32
          ],
          'p': [
            2,
            32
          ],
          'q': [
            2,
            32
          ],
          'r': [
            2,
            32
          ],
          'j': [
            2,
            32
          ],
          'ae': [
            2,
            32
          ],
          'g': [
            2,
            32
          ],
          'ah': [
            2,
            32
          ],
          's': [
            1,
            undefined,
            53
          ],
          't': [
            1,
            undefined,
            54
          ]
        },
        '84': {
          'h': [
            2,
            37
          ],
          'k': [
            2,
            37
          ],
          'l': [
            2,
            37
          ],
          'm': [
            2,
            37
          ],
          'n': [
            2,
            37
          ],
          'o': [
            2,
            37
          ],
          'p': [
            2,
            37
          ],
          'q': [
            2,
            37
          ],
          'r': [
            2,
            37
          ],
          's': [
            2,
            37
          ],
          't': [
            2,
            37
          ],
          'j': [
            2,
            37
          ],
          'ae': [
            2,
            37
          ],
          'g': [
            2,
            37
          ],
          'ah': [
            2,
            37
          ],
          'u': [
            1,
            undefined,
            55
          ],
          'v': [
            1,
            undefined,
            56
          ],
          'w': [
            1,
            undefined,
            57
          ]
        },
        '85': {
          'h': [
            2,
            38
          ],
          'k': [
            2,
            38
          ],
          'l': [
            2,
            38
          ],
          'm': [
            2,
            38
          ],
          'n': [
            2,
            38
          ],
          'o': [
            2,
            38
          ],
          'p': [
            2,
            38
          ],
          'q': [
            2,
            38
          ],
          'r': [
            2,
            38
          ],
          's': [
            2,
            38
          ],
          't': [
            2,
            38
          ],
          'j': [
            2,
            38
          ],
          'ae': [
            2,
            38
          ],
          'g': [
            2,
            38
          ],
          'ah': [
            2,
            38
          ],
          'u': [
            1,
            undefined,
            55
          ],
          'v': [
            1,
            undefined,
            56
          ],
          'w': [
            1,
            undefined,
            57
          ]
        },
        '86': {
          'h': [
            2,
            40
          ],
          'k': [
            2,
            40
          ],
          'l': [
            2,
            40
          ],
          'm': [
            2,
            40
          ],
          'n': [
            2,
            40
          ],
          'o': [
            2,
            40
          ],
          'p': [
            2,
            40
          ],
          'q': [
            2,
            40
          ],
          'r': [
            2,
            40
          ],
          's': [
            2,
            40
          ],
          't': [
            2,
            40
          ],
          'u': [
            2,
            40
          ],
          'v': [
            2,
            40
          ],
          'w': [
            2,
            40
          ],
          'j': [
            2,
            40
          ],
          'ae': [
            2,
            40
          ],
          'g': [
            2,
            40
          ],
          'ah': [
            2,
            40
          ]
        },
        '87': {
          'h': [
            2,
            41
          ],
          'k': [
            2,
            41
          ],
          'l': [
            2,
            41
          ],
          'm': [
            2,
            41
          ],
          'n': [
            2,
            41
          ],
          'o': [
            2,
            41
          ],
          'p': [
            2,
            41
          ],
          'q': [
            2,
            41
          ],
          'r': [
            2,
            41
          ],
          's': [
            2,
            41
          ],
          't': [
            2,
            41
          ],
          'u': [
            2,
            41
          ],
          'v': [
            2,
            41
          ],
          'w': [
            2,
            41
          ],
          'j': [
            2,
            41
          ],
          'ae': [
            2,
            41
          ],
          'g': [
            2,
            41
          ],
          'ah': [
            2,
            41
          ]
        },
        '88': {
          'h': [
            2,
            42
          ],
          'k': [
            2,
            42
          ],
          'l': [
            2,
            42
          ],
          'm': [
            2,
            42
          ],
          'n': [
            2,
            42
          ],
          'o': [
            2,
            42
          ],
          'p': [
            2,
            42
          ],
          'q': [
            2,
            42
          ],
          'r': [
            2,
            42
          ],
          's': [
            2,
            42
          ],
          't': [
            2,
            42
          ],
          'u': [
            2,
            42
          ],
          'v': [
            2,
            42
          ],
          'w': [
            2,
            42
          ],
          'j': [
            2,
            42
          ],
          'ae': [
            2,
            42
          ],
          'g': [
            2,
            42
          ],
          'ah': [
            2,
            42
          ]
        },
        '89': {
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '90': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ],
          'ad': [
            1,
            undefined,
            16
          ],
          'af': [
            1,
            undefined,
            17
          ]
        },
        '91': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            61
          ],
          'ad': [
            1,
            undefined,
            16
          ],
          'af': [
            1,
            undefined,
            17
          ]
        },
        '92': {
          'h': [
            2,
            9
          ],
          'k': [
            2,
            9
          ],
          'l': [
            2,
            9
          ],
          'm': [
            2,
            9
          ],
          'n': [
            2,
            9
          ],
          'o': [
            2,
            9
          ],
          'p': [
            2,
            9
          ],
          'q': [
            2,
            9
          ],
          'r': [
            2,
            9
          ],
          's': [
            2,
            9
          ],
          't': [
            2,
            9
          ],
          'u': [
            2,
            9
          ],
          'v': [
            2,
            9
          ],
          'w': [
            2,
            9
          ],
          'j': [
            2,
            9
          ],
          'ae': [
            2,
            9
          ],
          'g': [
            2,
            9
          ],
          'ah': [
            2,
            9
          ]
        },
        '93': {
          'ab': [
            1,
            undefined,
            104
          ]
        },
        '94': {
          'h': [
            2,
            10
          ],
          'k': [
            2,
            10
          ],
          'l': [
            2,
            10
          ],
          'm': [
            2,
            10
          ],
          'n': [
            2,
            10
          ],
          'o': [
            2,
            10
          ],
          'p': [
            2,
            10
          ],
          'q': [
            2,
            10
          ],
          'r': [
            2,
            10
          ],
          's': [
            2,
            10
          ],
          't': [
            2,
            10
          ],
          'u': [
            2,
            10
          ],
          'v': [
            2,
            10
          ],
          'w': [
            2,
            10
          ],
          'j': [
            2,
            10
          ],
          'ae': [
            2,
            10
          ],
          'g': [
            2,
            10
          ],
          'ah': [
            2,
            10
          ]
        },
        '95': {
          'i': [
            2,
            56
          ],
          'ac': [
            2,
            56
          ],
          'ad': [
            2,
            56
          ],
          'h': [
            2,
            56
          ],
          'k': [
            2,
            56
          ],
          'l': [
            2,
            56
          ],
          'm': [
            2,
            56
          ],
          'n': [
            2,
            56
          ],
          'o': [
            2,
            56
          ],
          'p': [
            2,
            56
          ],
          'q': [
            2,
            56
          ],
          'r': [
            2,
            56
          ],
          's': [
            2,
            56
          ],
          't': [
            2,
            56
          ],
          'u': [
            2,
            56
          ],
          'v': [
            2,
            56
          ],
          'w': [
            2,
            56
          ],
          'j': [
            2,
            56
          ],
          'ae': [
            2,
            56
          ],
          'g': [
            2,
            56
          ],
          'ah': [
            2,
            56
          ]
        },
        '96': {
          'ae': [
            2,
            23
          ],
          'g': [
            2,
            23
          ]
        },
        '97': {
          'ah': [
            2,
            18
          ],
          'g': [
            2,
            18
          ]
        },
        '98': {
          'ah': [
            2,
            19
          ],
          'g': [
            2,
            19
          ]
        },
        '99': {
          'ah': [
            2,
            21
          ],
          'g': [
            2,
            21
          ]
        },
        '100': {
          'h': [
            1,
            undefined,
            106
          ]
        },
        '101': {
          'j': [
            2,
            53
          ],
          'g': [
            2,
            53
          ]
        },
        '102': {
          'g': [
            1,
            undefined,
            93
          ],
          'j': [
            1,
            undefined,
            107
          ]
        },
        '103': {
          'g': [
            2,
            12
          ],
          'j': [
            2,
            12
          ]
        },
        '104': {
          'aa': [
            1,
            undefined,
            90
          ]
        },
        '105': {
          'j': [
            2,
            51
          ],
          'g': [
            2,
            51
          ]
        },
        '106': {
          'a': [
            2,
            5
          ],
          'e': [
            2,
            5
          ],
          'c': [
            2,
            5
          ],
          'f': [
            2,
            5
          ],
          'b': [
            2,
            5
          ],
          'd': [
            2,
            5
          ]
        },
        '107': {
          'h': [
            2,
            8
          ],
          'k': [
            2,
            8
          ],
          'l': [
            2,
            8
          ],
          'm': [
            2,
            8
          ],
          'n': [
            2,
            8
          ],
          'o': [
            2,
            8
          ],
          'p': [
            2,
            8
          ],
          'q': [
            2,
            8
          ],
          'r': [
            2,
            8
          ],
          's': [
            2,
            8
          ],
          't': [
            2,
            8
          ],
          'u': [
            2,
            8
          ],
          'v': [
            2,
            8
          ],
          'w': [
            2,
            8
          ],
          'j': [
            2,
            8
          ],
          'ae': [
            2,
            8
          ],
          'g': [
            2,
            8
          ],
          'ah': [
            2,
            8
          ]
        }
      }
    };
    parser.parse = function parse(input, filename) {
      var state, symbol, ret, action, $$;
      var self = this;
      var lexer = self.lexer;
      var table = self.table;
      var gotos = table.gotos;
      var tableAction = table.action;
      var productions = self.productions;
      var prefix = filename ? 'in file: ' + filename + ' ' : '';
      var valueStack = [];
      var stateStack = [0];
      var symbolStack = [];
      lexer.resetInput(input);
      while (1) {
        state = peekStack(stateStack);
        if (!symbol) {
          symbol = lexer.lex();
        }
        if (symbol) {
          action = tableAction[state] && tableAction[state][symbol];
        } else {
          action = null;
        }
        if (!action) {
          var expected = [];
          var error;
          if (tableAction[state]) {
            each(tableAction[state], function (v, symbolForState) {
              action = v[GrammarConst.TYPE_INDEX];
              var map = [];
              map[GrammarConst.SHIFT_TYPE] = 'shift';
              map[GrammarConst.REDUCE_TYPE] = 'reduce';
              map[GrammarConst.ACCEPT_TYPE] = 'accept';
              expected.push(map[action] + ':' + self.lexer.mapReverseSymbol(symbolForState));
            });
          }
          error = prefix + 'syntax error at line ' + lexer.lineNumber + ':\n' + lexer.showDebugInfo() + '\n' + 'expect ' + expected.join(', ');
          throw new Error(error);
        }
        switch (action[GrammarConst.TYPE_INDEX]) {
        case GrammarConst.SHIFT_TYPE:
          symbolStack.push(symbol);
          valueStack.push(lexer.text);
          stateStack.push(action[GrammarConst.TO_INDEX]);
          symbol = null;
          break;
        case GrammarConst.REDUCE_TYPE:
          var production = productions[action[GrammarConst.PRODUCTION_INDEX]];
          var reducedSymbol = production.symbol || production[0];
          var reducedAction = production.action || production[2];
          var reducedRhs = production.rhs || production[1];
          var len = reducedRhs.length;
          $$ = peekStack(valueStack, len);
          ret = undefined;
          self.$$ = $$;
          for (var i = 0; i < len; i++) {
            self['$' + (len - i)] = peekStack(valueStack, i + 1);
          }
          if (reducedAction) {
            ret = reducedAction.call(self);
          }
          if (ret !== undefined) {
            $$ = ret;
          } else {
            $$ = self.$$;
          }
          var reverseIndex = len * -1;
          stateStack.splice(reverseIndex, len);
          valueStack.splice(reverseIndex, len);
          symbolStack.splice(reverseIndex, len);
          symbolStack.push(reducedSymbol);
          valueStack.push($$);
          var newState = gotos[peekStack(stateStack)][reducedSymbol];
          stateStack.push(newState);
          break;
        case GrammarConst.ACCEPT_TYPE:
          return $$;
        }
      }
    };
    return parser;
  }();
  if (typeof module !== 'undefined') {
    exports = parser;
  }
  return exports;
}();
xtemplateCompilerAst = function (exports) {
  var ast = {};
  function sameArray(a1, a2) {
    var l1 = a1.length, l2 = a2.length;
    if (l1 !== l2) {
      return 0;
    }
    for (var i = 0; i < l1; i++) {
      if (a1[i] !== a2[i]) {
        return 0;
      }
    }
    return 1;
  }
  ast.ProgramNode = function (pos, statements, inverse) {
    var self = this;
    self.pos = pos;
    self.statements = statements;
    self.inverse = inverse;
  };
  ast.ProgramNode.prototype.type = 'program';
  ast.BlockStatement = function (pos, func, program, close, escape) {
    var closeParts = close.parts, self = this, e;
    if (!sameArray(func.id.parts, closeParts)) {
      e = 'Syntax error at line ' + pos.line + ', col ' + pos.col + ':\n' + 'expect {{/' + func.id.parts + '}} not {{/' + closeParts + '}}';
      throw new Error(e);
    }
    self.escape = escape;
    self.pos = pos;
    self.func = func;
    self.program = program;
  };
  ast.BlockStatement.prototype.type = 'blockStatement';
  ast.ExpressionStatement = function (pos, expression, escape) {
    var self = this;
    self.pos = pos;
    self.value = expression;
    self.escape = escape;
  };
  ast.ExpressionStatement.prototype.type = 'expressionStatement';
  ast.ContentStatement = function (pos, value) {
    var self = this;
    self.pos = pos;
    self.value = value;
  };
  ast.ContentStatement.prototype.type = 'contentStatement';
  ast.UnaryExpression = function (unaryType, v) {
    this.value = v;
    this.unaryType = unaryType;
  };
  ast.Function = function (pos, id, params, hash) {
    var self = this;
    self.pos = pos;
    self.id = id;
    self.params = params;
    self.hash = hash;
  };
  ast.Function.prototype.type = 'function';
  ast.UnaryExpression.prototype.type = 'unaryExpression';
  ast.MultiplicativeExpression = function (op1, opType, op2) {
    var self = this;
    self.op1 = op1;
    self.opType = opType;
    self.op2 = op2;
  };
  ast.MultiplicativeExpression.prototype.type = 'multiplicativeExpression';
  ast.AdditiveExpression = function (op1, opType, op2) {
    var self = this;
    self.op1 = op1;
    self.opType = opType;
    self.op2 = op2;
  };
  ast.AdditiveExpression.prototype.type = 'additiveExpression';
  ast.RelationalExpression = function (op1, opType, op2) {
    var self = this;
    self.op1 = op1;
    self.opType = opType;
    self.op2 = op2;
  };
  ast.RelationalExpression.prototype.type = 'relationalExpression';
  ast.EqualityExpression = function (op1, opType, op2) {
    var self = this;
    self.op1 = op1;
    self.opType = opType;
    self.op2 = op2;
  };
  ast.EqualityExpression.prototype.type = 'equalityExpression';
  ast.ConditionalAndExpression = function (op1, op2) {
    var self = this;
    self.op1 = op1;
    self.op2 = op2;
    self.opType = '&&';
  };
  ast.ConditionalAndExpression.prototype.type = 'conditionalAndExpression';
  ast.ConditionalOrExpression = function (op1, op2) {
    var self = this;
    self.op1 = op1;
    self.op2 = op2;
    self.opType = '||';
  };
  ast.ConditionalOrExpression.prototype.type = 'conditionalOrExpression';
  ast.String = function (pos, value) {
    var self = this;
    self.pos = pos;
    self.value = value;
  };
  ast.String.prototype.type = 'string';
  ast.Number = function (pos, value) {
    var self = this;
    self.pos = pos;
    self.value = value;
  };
  ast.Number.prototype.type = 'number';
  ast.Hash = function (pos) {
    var self = this;
    var value = {};
    self.pos = pos;
    self.value = value;
  };
  ast.Hash.prototype.type = 'hash';
  ast.ArrayExpression = function (list) {
    this.list = list;
  };
  ast.ArrayExpression.prototype.type = 'arrayExpression';
  ast.JsonExpression = function (json) {
    this.json = json;
  };
  ast.JsonExpression.prototype.type = 'jsonExpression';
  ast.Id = function (pos, raw) {
    var self = this;
    var parts = [];
    var depth = 0;
    self.pos = pos;
    for (var i = 0, l = raw.length; i < l; i++) {
      var p = raw[i];
      if (p === '..') {
        depth++;
      } else {
        parts.push(p);
      }
    }
    self.parts = parts;
    self.string = parts.join('.');
    self.depth = depth;
  };
  ast.Id.prototype.type = 'id';
  exports = ast;
  return exports;
}();
xtemplateRuntimeCommands = function (exports) {
  var Scope = xtemplateRuntimeScope;
  var util = xtemplateRuntimeUtil;
  var commands = {
    range: function (scope, option) {
      var params = option.params;
      var start = params[0];
      var end = params[1];
      var step = params[2];
      if (!step) {
        step = start > end ? -1 : 1;
      } else if (start > end && step > 0 || start < end && step < 0) {
        step = -step;
      }
      var ret = [];
      for (var i = start; start < end ? i < end : i > end; i += step) {
        ret.push(i);
      }
      return ret;
    },
    each: function (scope, option, buffer) {
      var params = option.params;
      var param0 = params[0];
      var xindexName = params[2] || 'xindex';
      var valueName = params[1];
      var xcount;
      var opScope;
      var affix;
      if (param0) {
        if (util.isArray(param0)) {
          xcount = param0.length;
          for (var xindex = 0; xindex < xcount; xindex++) {
            opScope = new Scope(param0[xindex]);
            affix = opScope.affix = { xcount: xcount };
            affix[xindexName] = xindex;
            if (valueName) {
              affix[valueName] = param0[xindex];
            }
            opScope.setParent(scope);
            buffer = option.fn(opScope, buffer);
          }
        } else {
          for (var name in param0) {
            opScope = new Scope(param0[name]);
            affix = opScope.affix = {};
            affix[xindexName] = name;
            if (valueName) {
              affix[valueName] = param0[name];
            }
            opScope.setParent(scope);
            buffer = option.fn(opScope, buffer);
          }
        }
      }
      return buffer;
    },
    'with': function (scope, option, buffer) {
      var params = option.params;
      var param0 = params[0];
      if (param0) {
        var opScope = new Scope(param0);
        opScope.setParent(scope);
        buffer = option.fn(opScope, buffer);
      }
      return buffer;
    },
    'if': function (scope, option, buffer) {
      var params = option.params;
      var param0 = params[0];
      if (param0) {
        var fn = option.fn;
        if (fn) {
          buffer = fn(scope, buffer);
        }
      } else {
        var matchElseIf = false;
        var elseIfs = option.elseIfs;
        var inverse = option.inverse;
        if (elseIfs) {
          for (var i = 0, len = elseIfs.length; i < len; i++) {
            var elseIf = elseIfs[i];
            matchElseIf = elseIf.test(scope);
            if (matchElseIf) {
              buffer = elseIf.fn(scope, buffer);
              break;
            }
          }
        }
        if (!matchElseIf && inverse) {
          buffer = inverse(scope, buffer);
        }
      }
      return buffer;
    },
    set: function (scope, option, buffer) {
      scope.mix(option.hash);
      return buffer;
    },
    include: function (scope, option, buffer) {
      var params = option.params;
      var i, newScope;
      var l = params.length;
      newScope = scope;
      if (option.hash) {
        newScope = new Scope(option.hash);
        newScope.setParent(scope);
      }
      for (i = 0; i < l; i++) {
        buffer = this.root.include(params[i], this, newScope, option, buffer);
      }
      return buffer;
    },
    parse: function (scope, option, buffer) {
      return commands.include.call(this, new Scope(), option, buffer);
    },
    extend: function (scope, option, buffer) {
      this.runtime.extendTplName = option.params[0];
      return buffer;
    },
    block: function (scope, option, buffer) {
      var self = this;
      var runtime = self.runtime;
      var params = option.params;
      var blockName = params[0];
      var type;
      if (params.length === 2) {
        type = params[0];
        blockName = params[1];
      }
      var blocks = runtime.blocks = runtime.blocks || {};
      var head = blocks[blockName], cursor;
      var current = {
        fn: option.fn,
        type: type
      };
      if (!head) {
        blocks[blockName] = current;
      } else if (head.type) {
        if (head.type === 'append') {
          current.next = head;
          blocks[blockName] = current;
        } else if (head.type === 'prepend') {
          var prev;
          cursor = head;
          while (cursor && cursor.type === 'prepend') {
            prev = cursor;
            cursor = cursor.next;
          }
          current.next = cursor;
          prev.next = current;
        }
      }
      if (!runtime.extendTplName) {
        cursor = blocks[blockName];
        while (cursor) {
          if (cursor.fn) {
            buffer = cursor.fn.call(self, scope, buffer);
          }
          cursor = cursor.next;
        }
      }
      return buffer;
    },
    macro: function (scope, option, buffer) {
      var hash = option.hash;
      var params = option.params;
      var macroName = params[0];
      var params1 = params.slice(1);
      var self = this;
      var runtime = self.runtime;
      var macros = runtime.macros = runtime.macros || {};
      if (option.fn) {
        macros[macroName] = {
          paramNames: params1,
          hash: hash,
          fn: option.fn
        };
      } else {
        var macro = macros[macroName];
        var paramValues = macro.hash || {};
        var paramNames;
        if (macro && (paramNames = macro.paramNames)) {
          for (var i = 0, len = paramNames.length; i < len; i++) {
            var p = paramNames[i];
            paramValues[p] = params1[i];
          }
          if (hash) {
            for (var h in hash) {
              paramValues[h] = hash[h];
            }
          }
          var newScope = new Scope(paramValues);
          buffer = macro.fn.call(self, newScope, buffer);
        } else {
          var error = 'in file: ' + self.name + ' can not find macro: ' + name + '" at line ' + self.pos.line + ', col ' + self.pos.col;
          throw new Error(error);
        }
      }
      return buffer;
    }
  };
  commands['debugger'] = function () {
    if ('@DEBUG@') {
      util.globalEval('debugger');
    }
  };
  exports = commands;
  return exports;
}();
xtemplateRuntime = function (exports) {
  var util = xtemplateRuntimeUtil;
  var nativeCommands = xtemplateRuntimeCommands;
  var commands = {};
  var Scope = xtemplateRuntimeScope;
  var LinkedBuffer = xtemplateRuntimeLinkedBuffer;
  function findCommand(runtimeCommands, instanceCommands, parts) {
    var name = parts[0];
    var cmd = runtimeCommands && runtimeCommands[name] || instanceCommands && instanceCommands[name] || commands[name];
    if (parts.length === 1) {
      return cmd;
    }
    if (cmd) {
      var len = parts.length;
      for (var i = 1; i < len; i++) {
        cmd = cmd[parts[i]];
        if (!cmd) {
          break;
        }
      }
    }
    return cmd;
  }
  function getSubNameFromParentName(parentName, subName) {
    var parts = parentName.split('/');
    var subParts = subName.split('/');
    parts.pop();
    for (var i = 0, l = subParts.length; i < l; i++) {
      var subPart = subParts[i];
      if (subPart === '.') {
      } else if (subPart === '..') {
        parts.pop();
      } else {
        parts.push(subPart);
      }
    }
    return parts.join('/');
  }
  function renderTpl(tpl, scope, buffer) {
    buffer = tpl.fn(scope, buffer);
    var runtime = tpl.runtime;
    var extendTplName = runtime.extendTplName;
    if (extendTplName) {
      runtime.extendTplName = null;
      buffer = tpl.root.include(extendTplName, tpl, scope, null, buffer);
    }
    return buffer.end();
  }
  function callFn(tpl, scope, option, buffer, parts, depth) {
    var error, caller, fn, command1;
    if (!depth) {
      command1 = findCommand(tpl.runtime.commands, tpl.root.config.commands, parts);
    }
    if (command1) {
      return command1.call(tpl, scope, option, buffer);
    } else {
      error = 'in file: ' + tpl.name + ' can not call: ' + parts.join('.') + '" at line ' + tpl.pos.line + ', col ' + tpl.pos.col;
    }
    caller = scope.resolve(parts.slice(0, -1), depth);
    fn = caller[parts[parts.length - 1]];
    if (fn) {
      return fn.apply(caller, option.params);
    }
    if (error) {
      throw new Error(error);
    }
    return buffer;
  }
  var utils = {
    callFn: callFn,
    callCommand: function (tpl, scope, option, buffer, parts) {
      return callFn(tpl, scope, option, buffer, parts);
    }
  };
  var loader = {
    cache: {},
    load: function (params, callback) {
      var name = params.name;
      var cache = this.cache;
      if (cache[name]) {
        return callback(undefined, cache[name]);
      }
      require([name], function (tpl) {
        cache[name] = tpl;
        callback(undefined, tpl);
      }, function () {
        var error = 'template "' + params.name + '" does not exist';
        util.log(error, 'error');
        callback(error);
      });
    }
  };
  function XTemplateRuntime(fn, config) {
    var self = this;
    self.fn = fn;
    config = self.config = config || {};
    config.loader = config.loader || XTemplateRuntime.loader;
    this.subNameResolveCache = {};
  }
  util.mix(XTemplateRuntime, {
    loader: loader,
    version: '1.3.0',
    nativeCommands: nativeCommands,
    utils: utils,
    util: util,
    addCommand: function (commandName, fn) {
      commands[commandName] = fn;
    },
    removeCommand: function (commandName) {
      delete commands[commandName];
    }
  });
  XTemplateRuntime.prototype = {
    constructor: XTemplateRuntime,
    Scope: Scope,
    nativeCommands: nativeCommands,
    utils: utils,
    removeCommand: function (commandName) {
      var config = this.config;
      if (config.commands) {
        delete config.commands[commandName];
      }
    },
    addCommand: function (commandName, fn) {
      var config = this.config;
      config.commands = config.commands || {};
      config.commands[commandName] = fn;
    },
    resolve: function (subName, parentName) {
      if (subName.charAt(0) !== '.') {
        return subName;
      }
      if (!parentName) {
        var error = 'parent template does not have name' + ' for relative sub tpl name: ' + subName;
        throw new Error(error);
      }
      var nameResolveCache = this.subNameResolveCache[parentName] = this.subNameResolveCache[parentName] || {};
      if (nameResolveCache[subName]) {
        return nameResolveCache[subName];
      }
      subName = nameResolveCache[subName] = getSubNameFromParentName(parentName, subName);
      return subName;
    },
    include: function (subTplName, tpl, scope, option, buffer) {
      var self = this;
      var parentName = tpl.name;
      var resolvedSubTplName = self.resolve(subTplName, parentName);
      return buffer.async(function (newBuffer) {
        self.config.loader.load({
          root: self,
          parentName: parentName,
          originalName: subTplName,
          name: resolvedSubTplName,
          scope: scope,
          option: option
        }, function (error, tplFn) {
          if (error) {
            newBuffer.error(error);
          } else if (typeof tplFn === 'string') {
            if (option && option.escaped) {
              newBuffer.writeEscaped(tplFn);
            } else {
              newBuffer.append(tplFn);
            }
            newBuffer.end();
          } else {
            renderTpl({
              root: tpl.root,
              fn: tplFn,
              name: resolvedSubTplName,
              runtime: tpl.runtime
            }, scope, newBuffer);
          }
        });
      });
    },
    render: function (data, option, callback) {
      var html = '';
      var self = this;
      var fn = self.fn;
      if (typeof option === 'function') {
        callback = option;
        option = null;
      }
      option = option || {};
      callback = callback || function (error, ret) {
        if (error) {
          if (!(error instanceof Error)) {
            error = new Error(error);
          }
          throw error;
        }
        html = ret;
      };
      var name = self.config.name;
      if (!name && fn.TPL_NAME) {
        name = fn.TPL_NAME;
      }
      var scope = new Scope(data);
      var buffer = new XTemplateRuntime.LinkedBuffer(callback, self.config).head;
      renderTpl({
        name: name,
        fn: fn,
        runtime: { commands: option.commands },
        root: self
      }, scope, buffer);
      return html;
    }
  };
  XTemplateRuntime.Scope = Scope;
  XTemplateRuntime.LinkedBuffer = LinkedBuffer;
  exports = XTemplateRuntime;
  return exports;
}();
xtemplateCompiler = function (exports) {
  var util = xtemplateRuntime.util;
  var xtplAstToJs;
  var TOP_DECLARATION = [
    'var tpl = this;' + 'var pos = tpl.pos = {line:1, col:1};',
    'var nativeCommands = tpl.root.nativeCommands;',
    'var utils = tpl.root.utils;'
  ].join('\n');
  var CALL_NATIVE_COMMAND = '{lhs} = {name}Command.call(tpl, scope, {option}, buffer);';
  var CALL_CUSTOM_COMMAND = 'buffer = callCommandUtil(tpl, scope, {option}, buffer, [{idParts}]);';
  var CALL_FUNCTION = '{lhs} = callFnUtil(tpl, scope, {option}, buffer, [{idParts}]);';
  var CALL_FUNCTION_DEPTH = '{lhs} = callFnUtil(tpl, scope, {option}, buffer, [{idParts}], {depth});';
  var SCOPE_RESOLVE = 'var {lhs} = scope.resolve([{idParts}]);';
  var SCOPE_RESOLVE_DEPTH = 'var {lhs} = scope.resolve([{idParts}],{depth});';
  var REQUIRE_MODULE = 'var {variable} = re' + 'quire("{name}");';
  var CHANGE_REQUIRE_PARAM = '{option}.params[0] = {variable}.TPL_NAME;';
  var CHECK_BUFFER = [
    'if({name} && {name}.isBuffer){',
    'buffer = {name};',
    '{name} = undefined;',
    '}'
  ].join('\n');
  var FUNC = [
    'function {functionName}({params}){',
    '{body}',
    '}'
  ].join('\n');
  var SOURCE_URL = [
    '',
    '//# sourceURL = {name}.js'
  ].join('\n');
  var DECLARE_NATIVE_COMMANDS = 'var {name}Command = nativeCommands["{name}"];';
  var DECLARE_UTILS = 'var {name}Util = utils["{name}"];';
  var BUFFER_WRITE = 'buffer.write({value});';
  var BUFFER_APPEND = 'buffer.append({value});';
  var BUFFER_WRITE_ESCAPED = 'buffer.writeEscaped({value});';
  var RETURN_BUFFER = 'return buffer;';
  var XTemplateRuntime = xtemplateRuntime;
  var parser = xtemplateCompilerParser;
  parser.yy = xtemplateCompilerAst;
  var nativeCode = [];
  var substitute = util.substitute;
  var each = util.each;
  var nativeCommands = XTemplateRuntime.nativeCommands;
  var nativeUtils = XTemplateRuntime.utils;
  var globals = {};
  globals['undefined'] = globals['null'] = globals['true'] = globals['false'] = 1;
  each(nativeUtils, function (v, name) {
    nativeCode.push(substitute(DECLARE_UTILS, { name: name }));
  });
  each(nativeCommands, function (v, name) {
    nativeCode.push(substitute(DECLARE_NATIVE_COMMANDS, { name: name }));
  });
  nativeCode = nativeCode.join('\n');
  var doubleReg = /\\*"/g, singleReg = /\\*'/g, arrayPush = [].push, uuid = 0;
  function isGlobalId(node) {
    if (globals[node.string]) {
      return 1;
    }
    return 0;
  }
  function guid(str) {
    return str + uuid++;
  }
  function wrapByDoubleQuote(str) {
    return '"' + str + '"';
  }
  function wrapBySingleQuote(str) {
    return '\'' + str + '\'';
  }
  function joinArrayOfString(arr) {
    return wrapByDoubleQuote(arr.join('","'));
  }
  function escapeSingleQuoteInCodeString(str, isDouble) {
    return str.replace(isDouble ? doubleReg : singleReg, function (m) {
      if (m.length % 2) {
        m = '\\' + m;
      }
      return m;
    });
  }
  function escapeString(str, isCode) {
    if (isCode) {
      str = escapeSingleQuoteInCodeString(str, 0);
    } else {
      str = str.replace(/\\/g, '\\\\').replace(/'/g, '\\\'');
    }
    str = str.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    return str;
  }
  function pushToArray(to, from) {
    arrayPush.apply(to, from);
  }
  function opExpression(e) {
    var source = [], type = e.opType, exp1, exp2, code1Source, code2Source, code1 = xtplAstToJs[e.op1.type](e.op1), code2 = xtplAstToJs[e.op2.type](e.op2);
    exp1 = code1.exp;
    exp2 = code2.exp;
    var exp = guid('exp');
    code1Source = code1.source;
    code2Source = code2.source;
    pushToArray(source, code1Source);
    source.push('var ' + exp + ' = ' + exp1 + ';');
    if (type === '&&' || type === '||') {
      source.push('if(' + (type === '&&' ? '' : '!') + '(' + exp + ')){');
      pushToArray(source, code2Source);
      source.push(exp + ' = ' + exp2 + ';');
      source.push('}');
    } else {
      pushToArray(source, code2Source);
      source.push(exp + ' = ' + '(' + exp1 + ')' + type + '(' + exp2 + ');');
    }
    return {
      exp: exp,
      source: source
    };
  }
  function markPos(pos) {
    return 'pos.line = ' + pos.line + '; pos.col = ' + pos.col + ';';
  }
  function getIdStringFromIdParts(source, idParts) {
    if (idParts.length === 1) {
      return null;
    }
    var i, l, idPart, idPartType, check = 0, nextIdNameCode;
    for (i = 0, l = idParts.length; i < l; i++) {
      if (idParts[i].type) {
        check = 1;
        break;
      }
    }
    if (check) {
      var ret = [];
      for (i = 0, l = idParts.length; i < l; i++) {
        idPart = idParts[i];
        idPartType = idPart.type;
        if (idPartType) {
          nextIdNameCode = xtplAstToJs[idPartType](idPart);
          pushToArray(source, nextIdNameCode.source);
          ret.push(nextIdNameCode.exp);
        } else {
          ret.push(wrapByDoubleQuote(idPart));
        }
      }
      return ret;
    } else {
      return null;
    }
  }
  function genFunction(statements) {
    var source = ['function(scope, buffer) {'];
    for (var i = 0, len = statements.length; i < len; i++) {
      pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
    }
    source.push(RETURN_BUFFER);
    source.push('}');
    return source;
  }
  function genTopFunction(xtplAstToJs, statements) {
    var source = [
      TOP_DECLARATION,
      nativeCode
    ];
    for (var i = 0, len = statements.length; i < len; i++) {
      pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
    }
    source.push(RETURN_BUFFER);
    return {
      params: [
        'scope',
        'buffer',
        'undefined'
      ],
      source: source.join('\n')
    };
  }
  function genOptionFromFunction(func, escape) {
    var optionName = guid('option');
    var source = ['var ' + optionName + ' = {' + (escape ? 'escape: 1' : '') + '};'], params = func.params, hash = func.hash;
    if (params) {
      var paramsName = guid('params');
      source.push('var ' + paramsName + ' = [];');
      each(params, function (param) {
        var nextIdNameCode = xtplAstToJs[param.type](param);
        pushToArray(source, nextIdNameCode.source);
        source.push(paramsName + '.push(' + nextIdNameCode.exp + ');');
      });
      source.push(optionName + '.params = ' + paramsName + ';');
    }
    if (hash) {
      var hashName = guid('hash');
      source.push('var ' + hashName + ' = {};');
      each(hash.value, function (v, key) {
        var nextIdNameCode = xtplAstToJs[v.type](v);
        pushToArray(source, nextIdNameCode.source);
        source.push(hashName + '[' + wrapByDoubleQuote(key) + '] = ' + nextIdNameCode.exp + ';');
      });
      source.push(optionName + '.hash = ' + hashName + ';');
    }
    return {
      exp: optionName,
      source: source
    };
  }
  function generateFunction(xtplAstToJs, func, escape, block) {
    var source = [];
    var functionConfigCode, optionName, idName;
    var id = func.id;
    var idString = id.string;
    var idParts = id.parts;
    var i;
    if (idString === 'elseif') {
      return {
        exp: '',
        source: []
      };
    }
    functionConfigCode = genOptionFromFunction(func, escape);
    optionName = functionConfigCode.exp;
    pushToArray(source, functionConfigCode.source);
    if (block) {
      var programNode = block.program;
      var inverse = programNode.inverse;
      var elseIfs = [];
      var elseIf, functionValue, statement;
      var statements = programNode.statements;
      var thenStatements = [];
      for (i = 0; i < statements.length; i++) {
        statement = statements[i];
        if (statement.type === 'expressionStatement' && (functionValue = statement.value) && functionValue.type === 'function' && functionValue.id.string === 'elseif') {
          if (elseIf) {
            elseIfs.push(elseIf);
          }
          elseIf = {
            condition: functionValue.params[0],
            statements: []
          };
        } else if (elseIf) {
          elseIf.statements.push(statement);
        } else {
          thenStatements.push(statement);
        }
      }
      if (elseIf) {
        elseIfs.push(elseIf);
      }
      source.push(optionName + '.fn = ' + genFunction(thenStatements).join('\n') + ';');
      if (inverse) {
        source.push(optionName + '.inverse = ' + genFunction(inverse).join('\n') + ';');
      }
      if (elseIfs.length) {
        var elseIfsVariable = guid('elseIfs');
        source.push('var ' + elseIfsVariable + ' = []');
        for (i = 0; i < elseIfs.length; i++) {
          var elseIfStatement = elseIfs[i];
          var elseIfVariable = guid('elseIf');
          source.push('var ' + elseIfVariable + ' = {}');
          var condition = elseIfStatement.condition;
          var conditionCode = xtplAstToJs[condition.type](condition);
          source.push(elseIfVariable + '.test = function(scope){');
          pushToArray(source, conditionCode.source);
          source.push('return (' + conditionCode.exp + ');');
          source.push('};');
          source.push(elseIfVariable + '.fn = ' + genFunction(elseIfStatement.statements).join('\n') + ';');
          source.push(elseIfsVariable + '.push(' + elseIfVariable + ');');
        }
        source.push(optionName + '.elseIfs = ' + elseIfsVariable + ';');
      }
    }
    if (xtplAstToJs.isModule) {
      if (idString === 'include' || idString === 'extend') {
        var moduleVariable = guid('module');
        source.push(substitute(REQUIRE_MODULE, {
          name: func.params[0].value,
          variable: moduleVariable
        }));
        source.push(substitute(CHANGE_REQUIRE_PARAM, {
          option: optionName,
          variable: moduleVariable
        }));
      }
    }
    if (!block) {
      idName = guid('callRet');
      source.push('var ' + idName);
    }
    source.push(markPos(id.pos));
    if (idString in nativeCommands) {
      source.push(substitute(CALL_NATIVE_COMMAND, {
        lhs: block ? 'buffer' : idName,
        name: idString,
        option: optionName
      }));
    } else if (block) {
      source.push(substitute(CALL_CUSTOM_COMMAND, {
        option: optionName,
        idParts: joinArrayOfString(idParts)
      }));
    } else {
      var newParts = getIdStringFromIdParts(source, idParts);
      source.push(substitute(id.depth ? CALL_FUNCTION_DEPTH : CALL_FUNCTION, {
        lhs: idName,
        option: optionName,
        idParts: newParts ? newParts.join(',') : joinArrayOfString(idParts),
        depth: id.depth
      }));
    }
    if (idName) {
      source.push(substitute(CHECK_BUFFER, { name: idName }));
    }
    return {
      exp: idName,
      source: source
    };
  }
  xtplAstToJs = {
    arrayExpression: function (e) {
      var list = e.list;
      var len = list.length;
      var r;
      var source = [];
      var exp = [];
      for (var i = 0; i < len; i++) {
        r = xtplAstToJs[list[i].type](list[i]);
        source.push.apply(source, r.source);
        exp.push(r.exp);
      }
      return {
        exp: '[' + exp.join(',') + ']',
        source: source
      };
    },
    jsonExpression: function (e) {
      var json = e.json;
      var len = json.length;
      var r;
      var source = [];
      var exp = [];
      for (var i = 0; i < len; i++) {
        var item = json[i];
        r = xtplAstToJs[item[1].type](item[1]);
        source.push.apply(source, r.source);
        exp.push('"' + item[0] + '": ' + r.exp);
      }
      return {
        exp: '{' + exp.join(',') + '}',
        source: source
      };
    },
    conditionalOrExpression: opExpression,
    conditionalAndExpression: opExpression,
    relationalExpression: opExpression,
    equalityExpression: opExpression,
    additiveExpression: opExpression,
    multiplicativeExpression: opExpression,
    unaryExpression: function (e) {
      var code = xtplAstToJs[e.value.type](e.value);
      return {
        exp: e.unaryType + '(' + code.exp + ')',
        source: code.source
      };
    },
    string: function (e) {
      return {
        exp: wrapBySingleQuote(escapeString(e.value, 1)),
        source: []
      };
    },
    number: function (e) {
      return {
        exp: e.value,
        source: []
      };
    },
    id: function (idNode) {
      if (isGlobalId(idNode)) {
        return {
          exp: idNode.string,
          source: []
        };
      }
      var source = [], depth = idNode.depth, idParts = idNode.parts, idName = guid('id');
      var newParts = getIdStringFromIdParts(source, idParts);
      source.push(substitute(depth ? SCOPE_RESOLVE_DEPTH : SCOPE_RESOLVE, {
        lhs: idName,
        idParts: newParts ? newParts.join(',') : joinArrayOfString(idParts),
        depth: depth
      }));
      return {
        exp: idName,
        source: source
      };
    },
    'function': function (func, escape) {
      return generateFunction(this, func, escape);
    },
    blockStatement: function (block) {
      return generateFunction(this, block.func, block.escape, block);
    },
    expressionStatement: function (expressionStatement) {
      var source = [], escape = expressionStatement.escape, code, expression = expressionStatement.value, type = expression.type, expressionOrVariable;
      code = xtplAstToJs[type](expression, escape);
      pushToArray(source, code.source);
      expressionOrVariable = code.exp;
      source.push(substitute(escape ? BUFFER_WRITE_ESCAPED : BUFFER_WRITE, { value: expressionOrVariable }));
      return {
        exp: '',
        source: source
      };
    },
    contentStatement: function (contentStatement) {
      return {
        exp: '',
        source: [substitute(BUFFER_APPEND, { value: wrapBySingleQuote(escapeString(contentStatement.value, 0)) })]
      };
    }
  };
  var compiler;
  compiler = {
    parse: function (tplContent, name) {
      return parser.parse(tplContent, name);
    },
    compileToStr: function (param) {
      var func = compiler.compileToJson(param);
      return substitute(FUNC, {
        functionName: param.functionName || '',
        params: func.params.join(','),
        body: func.source
      });
    },
    compileToJson: function (param) {
      var root = compiler.parse(param.content, param.name);
      uuid = 0;
      xtplAstToJs.isModule = param.isModule;
      return genTopFunction(xtplAstToJs, root.statements);
    },
    compile: function (tplContent, name) {
      var code = compiler.compileToJson({
        content: tplContent,
        name: name || guid('xtemplate')
      });
      return Function.apply(null, code.params.concat(code.source + substitute(SOURCE_URL, { name: name })));
    }
  };
  exports = compiler;
  return exports;
}();
xtemplate = function (exports) {
  var XTemplateRuntime = xtemplateRuntime;
  var util = XTemplateRuntime.util;
  var Compiler = xtemplateCompiler;
  var loader = {
    cache: {},
    load: function (params, callback) {
      var name = params.name;
      var cache = this.cache;
      if (cache[name]) {
        return callback(undefined, cache[name]);
      }
      require([name], function (tpl) {
        if (typeof tpl === 'string') {
          try {
            tpl = XTemplate.compile(tpl, name);
          } catch (e) {
            return callback(e);
          }
        }
        cache[name] = tpl;
        callback(undefined, tpl);
      }, function () {
        var error = 'template "' + name + '" does not exist';
        util.log(error, 'error');
        callback(error);
      });
    }
  };
  function XTemplate(tpl, config) {
    var self = this;
    config = self.config = config || {};
    config.loader = config.loader || XTemplate.loader;
    if (typeof tpl === 'string') {
      tpl = Compiler.compile(tpl, config && config.name);
    }
    XTemplateRuntime.call(self, tpl, config);
  }
  function Noop() {
  }
  Noop.prototype = XTemplateRuntime.prototype;
  XTemplate.prototype = new Noop();
  XTemplate.prototype.constructor = XTemplate;
  exports = util.mix(XTemplate, {
    compile: Compiler.compile,
    version: '1.3.0',
    loader: loader,
    Compiler: Compiler,
    Scope: XTemplateRuntime.Scope,
    Runtime: XTemplateRuntime,
    addCommand: XTemplateRuntime.addCommand,
    removeCommand: XTemplateRuntime.removeCommand
  });
  return exports;
}();
return xtemplate;
})();