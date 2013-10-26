function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/lang/function.js']) {
  _$jscoverage['/lang/function.js'] = {};
  _$jscoverage['/lang/function.js'].lineData = [];
  _$jscoverage['/lang/function.js'].lineData[7] = 0;
  _$jscoverage['/lang/function.js'].lineData[9] = 0;
  _$jscoverage['/lang/function.js'].lineData[10] = 0;
  _$jscoverage['/lang/function.js'].lineData[15] = 0;
  _$jscoverage['/lang/function.js'].lineData[16] = 0;
  _$jscoverage['/lang/function.js'].lineData[21] = 0;
  _$jscoverage['/lang/function.js'].lineData[22] = 0;
  _$jscoverage['/lang/function.js'].lineData[23] = 0;
  _$jscoverage['/lang/function.js'].lineData[26] = 0;
  _$jscoverage['/lang/function.js'].lineData[83] = 0;
  _$jscoverage['/lang/function.js'].lineData[84] = 0;
  _$jscoverage['/lang/function.js'].lineData[89] = 0;
  _$jscoverage['/lang/function.js'].lineData[90] = 0;
  _$jscoverage['/lang/function.js'].lineData[93] = 0;
  _$jscoverage['/lang/function.js'].lineData[94] = 0;
  _$jscoverage['/lang/function.js'].lineData[97] = 0;
  _$jscoverage['/lang/function.js'].lineData[98] = 0;
  _$jscoverage['/lang/function.js'].lineData[101] = 0;
  _$jscoverage['/lang/function.js'].lineData[103] = 0;
  _$jscoverage['/lang/function.js'].lineData[107] = 0;
  _$jscoverage['/lang/function.js'].lineData[108] = 0;
  _$jscoverage['/lang/function.js'].lineData[110] = 0;
  _$jscoverage['/lang/function.js'].lineData[127] = 0;
  _$jscoverage['/lang/function.js'].lineData[129] = 0;
  _$jscoverage['/lang/function.js'].lineData[130] = 0;
  _$jscoverage['/lang/function.js'].lineData[131] = 0;
  _$jscoverage['/lang/function.js'].lineData[135] = 0;
  _$jscoverage['/lang/function.js'].lineData[137] = 0;
  _$jscoverage['/lang/function.js'].lineData[138] = 0;
  _$jscoverage['/lang/function.js'].lineData[139] = 0;
  _$jscoverage['/lang/function.js'].lineData[140] = 0;
  _$jscoverage['/lang/function.js'].lineData[141] = 0;
  _$jscoverage['/lang/function.js'].lineData[155] = 0;
  _$jscoverage['/lang/function.js'].lineData[157] = 0;
  _$jscoverage['/lang/function.js'].lineData[158] = 0;
  _$jscoverage['/lang/function.js'].lineData[159] = 0;
  _$jscoverage['/lang/function.js'].lineData[162] = 0;
  _$jscoverage['/lang/function.js'].lineData[164] = 0;
  _$jscoverage['/lang/function.js'].lineData[165] = 0;
  _$jscoverage['/lang/function.js'].lineData[166] = 0;
  _$jscoverage['/lang/function.js'].lineData[169] = 0;
  _$jscoverage['/lang/function.js'].lineData[170] = 0;
  _$jscoverage['/lang/function.js'].lineData[171] = 0;
  _$jscoverage['/lang/function.js'].lineData[172] = 0;
  _$jscoverage['/lang/function.js'].lineData[176] = 0;
}
if (! _$jscoverage['/lang/function.js'].functionData) {
  _$jscoverage['/lang/function.js'].functionData = [];
  _$jscoverage['/lang/function.js'].functionData[0] = 0;
  _$jscoverage['/lang/function.js'].functionData[1] = 0;
  _$jscoverage['/lang/function.js'].functionData[2] = 0;
  _$jscoverage['/lang/function.js'].functionData[3] = 0;
  _$jscoverage['/lang/function.js'].functionData[4] = 0;
  _$jscoverage['/lang/function.js'].functionData[5] = 0;
  _$jscoverage['/lang/function.js'].functionData[6] = 0;
  _$jscoverage['/lang/function.js'].functionData[7] = 0;
  _$jscoverage['/lang/function.js'].functionData[8] = 0;
  _$jscoverage['/lang/function.js'].functionData[9] = 0;
  _$jscoverage['/lang/function.js'].functionData[10] = 0;
  _$jscoverage['/lang/function.js'].functionData[11] = 0;
  _$jscoverage['/lang/function.js'].functionData[12] = 0;
  _$jscoverage['/lang/function.js'].functionData[13] = 0;
  _$jscoverage['/lang/function.js'].functionData[14] = 0;
}
if (! _$jscoverage['/lang/function.js'].branchData) {
  _$jscoverage['/lang/function.js'].branchData = {};
  _$jscoverage['/lang/function.js'].branchData['83'] = [];
  _$jscoverage['/lang/function.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['89'] = [];
  _$jscoverage['/lang/function.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['93'] = [];
  _$jscoverage['/lang/function.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['107'] = [];
  _$jscoverage['/lang/function.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['127'] = [];
  _$jscoverage['/lang/function.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['129'] = [];
  _$jscoverage['/lang/function.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['131'] = [];
  _$jscoverage['/lang/function.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['139'] = [];
  _$jscoverage['/lang/function.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['141'] = [];
  _$jscoverage['/lang/function.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['155'] = [];
  _$jscoverage['/lang/function.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['157'] = [];
  _$jscoverage['/lang/function.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['159'] = [];
  _$jscoverage['/lang/function.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['166'] = [];
  _$jscoverage['/lang/function.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['170'] = [];
  _$jscoverage['/lang/function.js'].branchData['170'][1] = new BranchData();
}
_$jscoverage['/lang/function.js'].branchData['170'][1].init(21, 11, 'bufferTimer');
function visit163_170_1(result) {
  _$jscoverage['/lang/function.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['166'][1].init(76, 15, 'context || this');
function visit162_166_1(result) {
  _$jscoverage['/lang/function.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['159'][1].init(30, 15, 'context || this');
function visit161_159_1(result) {
  _$jscoverage['/lang/function.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['157'][1].init(46, 9, 'ms === -1');
function visit160_157_1(result) {
  _$jscoverage['/lang/function.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['155'][1].init(18, 9, 'ms || 150');
function visit159_155_1(result) {
  _$jscoverage['/lang/function.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['141'][1].init(62, 15, 'context || this');
function visit158_141_1(result) {
  _$jscoverage['/lang/function.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['139'][1].init(56, 15, 'now - last > ms');
function visit157_139_1(result) {
  _$jscoverage['/lang/function.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['131'][1].init(30, 15, 'context || this');
function visit156_131_1(result) {
  _$jscoverage['/lang/function.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['129'][1].init(46, 9, 'ms === -1');
function visit155_129_1(result) {
  _$jscoverage['/lang/function.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['127'][1].init(18, 9, 'ms || 150');
function visit154_127_1(result) {
  _$jscoverage['/lang/function.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['107'][1].init(25, 13, 'this.interval');
function visit153_107_1(result) {
  _$jscoverage['/lang/function.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['93'][1].init(238, 2, '!m');
function visit152_93_1(result) {
  _$jscoverage['/lang/function.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['89'][1].init(149, 21, 'typeof fn == \'string\'');
function visit151_89_1(result) {
  _$jscoverage['/lang/function.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['83'][1].init(20, 9, 'when || 0');
function visit150_83_1(result) {
  _$jscoverage['/lang/function.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].lineData[7]++;
(function(S, undefined) {
  _$jscoverage['/lang/function.js'].functionData[0]++;
  _$jscoverage['/lang/function.js'].lineData[9]++;
  function bindFn(r, fn, obj) {
    _$jscoverage['/lang/function.js'].functionData[1]++;
    _$jscoverage['/lang/function.js'].lineData[10]++;
    var slice = [].slice, args = slice.call(arguments, 3), fNOP = function() {
  _$jscoverage['/lang/function.js'].functionData[2]++;
}, bound = function() {
  _$jscoverage['/lang/function.js'].functionData[3]++;
  _$jscoverage['/lang/function.js'].lineData[15]++;
  var inArgs = slice.call(arguments);
  _$jscoverage['/lang/function.js'].lineData[16]++;
  return fn.apply(this instanceof fNOP ? this : obj, (r ? inArgs.concat(args) : args.concat(inArgs)));
};
    _$jscoverage['/lang/function.js'].lineData[21]++;
    fNOP.prototype = fn.prototype;
    _$jscoverage['/lang/function.js'].lineData[22]++;
    bound.prototype = new fNOP();
    _$jscoverage['/lang/function.js'].lineData[23]++;
    return bound;
  }
  _$jscoverage['/lang/function.js'].lineData[26]++;
  S.mix(S, {
  noop: function() {
  _$jscoverage['/lang/function.js'].functionData[4]++;
}, 
  bind: bindFn(0, bindFn, null, 0), 
  rbind: bindFn(0, bindFn, null, 1), 
  later: function(fn, when, periodic, context, data) {
  _$jscoverage['/lang/function.js'].functionData[5]++;
  _$jscoverage['/lang/function.js'].lineData[83]++;
  when = visit150_83_1(when || 0);
  _$jscoverage['/lang/function.js'].lineData[84]++;
  var m = fn, d = S.makeArray(data), f, r;
  _$jscoverage['/lang/function.js'].lineData[89]++;
  if (visit151_89_1(typeof fn == 'string')) {
    _$jscoverage['/lang/function.js'].lineData[90]++;
    m = context[fn];
  }
  _$jscoverage['/lang/function.js'].lineData[93]++;
  if (visit152_93_1(!m)) {
    _$jscoverage['/lang/function.js'].lineData[94]++;
    S.error('method undefined');
  }
  _$jscoverage['/lang/function.js'].lineData[97]++;
  f = function() {
  _$jscoverage['/lang/function.js'].functionData[6]++;
  _$jscoverage['/lang/function.js'].lineData[98]++;
  m.apply(context, d);
};
  _$jscoverage['/lang/function.js'].lineData[101]++;
  r = (periodic) ? setInterval(f, when) : setTimeout(f, when);
  _$jscoverage['/lang/function.js'].lineData[103]++;
  return {
  id: r, 
  interval: periodic, 
  cancel: function() {
  _$jscoverage['/lang/function.js'].functionData[7]++;
  _$jscoverage['/lang/function.js'].lineData[107]++;
  if (visit153_107_1(this.interval)) {
    _$jscoverage['/lang/function.js'].lineData[108]++;
    clearInterval(r);
  } else {
    _$jscoverage['/lang/function.js'].lineData[110]++;
    clearTimeout(r);
  }
}};
}, 
  throttle: function(fn, ms, context) {
  _$jscoverage['/lang/function.js'].functionData[8]++;
  _$jscoverage['/lang/function.js'].lineData[127]++;
  ms = visit154_127_1(ms || 150);
  _$jscoverage['/lang/function.js'].lineData[129]++;
  if (visit155_129_1(ms === -1)) {
    _$jscoverage['/lang/function.js'].lineData[130]++;
    return (function() {
  _$jscoverage['/lang/function.js'].functionData[9]++;
  _$jscoverage['/lang/function.js'].lineData[131]++;
  fn.apply(visit156_131_1(context || this), arguments);
});
  }
  _$jscoverage['/lang/function.js'].lineData[135]++;
  var last = S.now();
  _$jscoverage['/lang/function.js'].lineData[137]++;
  return (function() {
  _$jscoverage['/lang/function.js'].functionData[10]++;
  _$jscoverage['/lang/function.js'].lineData[138]++;
  var now = S.now();
  _$jscoverage['/lang/function.js'].lineData[139]++;
  if (visit157_139_1(now - last > ms)) {
    _$jscoverage['/lang/function.js'].lineData[140]++;
    last = now;
    _$jscoverage['/lang/function.js'].lineData[141]++;
    fn.apply(visit158_141_1(context || this), arguments);
  }
});
}, 
  buffer: function(fn, ms, context) {
  _$jscoverage['/lang/function.js'].functionData[11]++;
  _$jscoverage['/lang/function.js'].lineData[155]++;
  ms = visit159_155_1(ms || 150);
  _$jscoverage['/lang/function.js'].lineData[157]++;
  if (visit160_157_1(ms === -1)) {
    _$jscoverage['/lang/function.js'].lineData[158]++;
    return function() {
  _$jscoverage['/lang/function.js'].functionData[12]++;
  _$jscoverage['/lang/function.js'].lineData[159]++;
  fn.apply(visit161_159_1(context || this), arguments);
};
  }
  _$jscoverage['/lang/function.js'].lineData[162]++;
  var bufferTimer = null;
  _$jscoverage['/lang/function.js'].lineData[164]++;
  function f() {
    _$jscoverage['/lang/function.js'].functionData[13]++;
    _$jscoverage['/lang/function.js'].lineData[165]++;
    f.stop();
    _$jscoverage['/lang/function.js'].lineData[166]++;
    bufferTimer = S.later(fn, ms, 0, visit162_166_1(context || this), arguments);
  }
  _$jscoverage['/lang/function.js'].lineData[169]++;
  f.stop = function() {
  _$jscoverage['/lang/function.js'].functionData[14]++;
  _$jscoverage['/lang/function.js'].lineData[170]++;
  if (visit163_170_1(bufferTimer)) {
    _$jscoverage['/lang/function.js'].lineData[171]++;
    bufferTimer.cancel();
    _$jscoverage['/lang/function.js'].lineData[172]++;
    bufferTimer = 0;
  }
};
  _$jscoverage['/lang/function.js'].lineData[176]++;
  return f;
}});
})(KISSY);
