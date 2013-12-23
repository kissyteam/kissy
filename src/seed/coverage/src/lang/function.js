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
  _$jscoverage['/lang/function.js'].lineData[13] = 0;
  _$jscoverage['/lang/function.js'].lineData[16] = 0;
  _$jscoverage['/lang/function.js'].lineData[17] = 0;
  _$jscoverage['/lang/function.js'].lineData[24] = 0;
  _$jscoverage['/lang/function.js'].lineData[25] = 0;
  _$jscoverage['/lang/function.js'].lineData[26] = 0;
  _$jscoverage['/lang/function.js'].lineData[29] = 0;
  _$jscoverage['/lang/function.js'].lineData[86] = 0;
  _$jscoverage['/lang/function.js'].lineData[87] = 0;
  _$jscoverage['/lang/function.js'].lineData[92] = 0;
  _$jscoverage['/lang/function.js'].lineData[93] = 0;
  _$jscoverage['/lang/function.js'].lineData[96] = 0;
  _$jscoverage['/lang/function.js'].lineData[97] = 0;
  _$jscoverage['/lang/function.js'].lineData[100] = 0;
  _$jscoverage['/lang/function.js'].lineData[101] = 0;
  _$jscoverage['/lang/function.js'].lineData[104] = 0;
  _$jscoverage['/lang/function.js'].lineData[106] = 0;
  _$jscoverage['/lang/function.js'].lineData[110] = 0;
  _$jscoverage['/lang/function.js'].lineData[111] = 0;
  _$jscoverage['/lang/function.js'].lineData[113] = 0;
  _$jscoverage['/lang/function.js'].lineData[129] = 0;
  _$jscoverage['/lang/function.js'].lineData[131] = 0;
  _$jscoverage['/lang/function.js'].lineData[132] = 0;
  _$jscoverage['/lang/function.js'].lineData[133] = 0;
  _$jscoverage['/lang/function.js'].lineData[137] = 0;
  _$jscoverage['/lang/function.js'].lineData[139] = 0;
  _$jscoverage['/lang/function.js'].lineData[140] = 0;
  _$jscoverage['/lang/function.js'].lineData[141] = 0;
  _$jscoverage['/lang/function.js'].lineData[142] = 0;
  _$jscoverage['/lang/function.js'].lineData[143] = 0;
  _$jscoverage['/lang/function.js'].lineData[157] = 0;
  _$jscoverage['/lang/function.js'].lineData[159] = 0;
  _$jscoverage['/lang/function.js'].lineData[160] = 0;
  _$jscoverage['/lang/function.js'].lineData[161] = 0;
  _$jscoverage['/lang/function.js'].lineData[164] = 0;
  _$jscoverage['/lang/function.js'].lineData[166] = 0;
  _$jscoverage['/lang/function.js'].lineData[167] = 0;
  _$jscoverage['/lang/function.js'].lineData[168] = 0;
  _$jscoverage['/lang/function.js'].lineData[171] = 0;
  _$jscoverage['/lang/function.js'].lineData[172] = 0;
  _$jscoverage['/lang/function.js'].lineData[173] = 0;
  _$jscoverage['/lang/function.js'].lineData[174] = 0;
  _$jscoverage['/lang/function.js'].lineData[178] = 0;
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
  _$jscoverage['/lang/function.js'].branchData['20'] = [];
  _$jscoverage['/lang/function.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['86'] = [];
  _$jscoverage['/lang/function.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['92'] = [];
  _$jscoverage['/lang/function.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['96'] = [];
  _$jscoverage['/lang/function.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['110'] = [];
  _$jscoverage['/lang/function.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['129'] = [];
  _$jscoverage['/lang/function.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['131'] = [];
  _$jscoverage['/lang/function.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['133'] = [];
  _$jscoverage['/lang/function.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['141'] = [];
  _$jscoverage['/lang/function.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['143'] = [];
  _$jscoverage['/lang/function.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['157'] = [];
  _$jscoverage['/lang/function.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['159'] = [];
  _$jscoverage['/lang/function.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['161'] = [];
  _$jscoverage['/lang/function.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['168'] = [];
  _$jscoverage['/lang/function.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/lang/function.js'].branchData['172'] = [];
  _$jscoverage['/lang/function.js'].branchData['172'][1] = new BranchData();
}
_$jscoverage['/lang/function.js'].branchData['172'][1].init(21, 11, 'bufferTimer');
function visit172_172_1(result) {
  _$jscoverage['/lang/function.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['168'][1].init(76, 15, 'context || this');
function visit171_168_1(result) {
  _$jscoverage['/lang/function.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['161'][1].init(30, 15, 'context || this');
function visit170_161_1(result) {
  _$jscoverage['/lang/function.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['159'][1].init(46, 9, 'ms === -1');
function visit169_159_1(result) {
  _$jscoverage['/lang/function.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['157'][1].init(18, 9, 'ms || 150');
function visit168_157_1(result) {
  _$jscoverage['/lang/function.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['143'][1].init(62, 15, 'context || this');
function visit167_143_1(result) {
  _$jscoverage['/lang/function.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['141'][1].init(56, 15, 'now - last > ms');
function visit166_141_1(result) {
  _$jscoverage['/lang/function.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['133'][1].init(30, 15, 'context || this');
function visit165_133_1(result) {
  _$jscoverage['/lang/function.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['131'][1].init(46, 9, 'ms === -1');
function visit164_131_1(result) {
  _$jscoverage['/lang/function.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['129'][1].init(18, 9, 'ms || 150');
function visit163_129_1(result) {
  _$jscoverage['/lang/function.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['110'][1].init(25, 13, 'this.interval');
function visit162_110_1(result) {
  _$jscoverage['/lang/function.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['96'][1].init(239, 2, '!m');
function visit161_96_1(result) {
  _$jscoverage['/lang/function.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['92'][1].init(149, 22, 'typeof fn === \'string\'');
function visit160_92_1(result) {
  _$jscoverage['/lang/function.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['86'][1].init(20, 9, 'when || 0');
function visit159_86_1(result) {
  _$jscoverage['/lang/function.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].branchData['20'][1].init(101, 11, 'obj || this');
function visit158_20_1(result) {
  _$jscoverage['/lang/function.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/function.js'].lineData[7]++;
(function(S, undefined) {
  _$jscoverage['/lang/function.js'].functionData[0]++;
  _$jscoverage['/lang/function.js'].lineData[9]++;
  function bindFn(r, fn, obj) {
    _$jscoverage['/lang/function.js'].functionData[1]++;
    _$jscoverage['/lang/function.js'].lineData[10]++;
    function FNOP() {
      _$jscoverage['/lang/function.js'].functionData[2]++;
    }
    _$jscoverage['/lang/function.js'].lineData[13]++;
    var slice = [].slice, args = slice.call(arguments, 3), bound = function() {
  _$jscoverage['/lang/function.js'].functionData[3]++;
  _$jscoverage['/lang/function.js'].lineData[16]++;
  var inArgs = slice.call(arguments);
  _$jscoverage['/lang/function.js'].lineData[17]++;
  return fn.apply(this instanceof FNOP ? this : visit158_20_1(obj || this), (r ? inArgs.concat(args) : args.concat(inArgs)));
};
    _$jscoverage['/lang/function.js'].lineData[24]++;
    FNOP.prototype = fn.prototype;
    _$jscoverage['/lang/function.js'].lineData[25]++;
    bound.prototype = new FNOP();
    _$jscoverage['/lang/function.js'].lineData[26]++;
    return bound;
  }
  _$jscoverage['/lang/function.js'].lineData[29]++;
  S.mix(S, {
  noop: function() {
  _$jscoverage['/lang/function.js'].functionData[4]++;
}, 
  bind: bindFn(0, bindFn, null, 0), 
  rbind: bindFn(0, bindFn, null, 1), 
  later: function(fn, when, periodic, context, data) {
  _$jscoverage['/lang/function.js'].functionData[5]++;
  _$jscoverage['/lang/function.js'].lineData[86]++;
  when = visit159_86_1(when || 0);
  _$jscoverage['/lang/function.js'].lineData[87]++;
  var m = fn, d = S.makeArray(data), f, r;
  _$jscoverage['/lang/function.js'].lineData[92]++;
  if (visit160_92_1(typeof fn === 'string')) {
    _$jscoverage['/lang/function.js'].lineData[93]++;
    m = context[fn];
  }
  _$jscoverage['/lang/function.js'].lineData[96]++;
  if (visit161_96_1(!m)) {
    _$jscoverage['/lang/function.js'].lineData[97]++;
    S.error('method undefined');
  }
  _$jscoverage['/lang/function.js'].lineData[100]++;
  f = function() {
  _$jscoverage['/lang/function.js'].functionData[6]++;
  _$jscoverage['/lang/function.js'].lineData[101]++;
  m.apply(context, d);
};
  _$jscoverage['/lang/function.js'].lineData[104]++;
  r = (periodic) ? setInterval(f, when) : setTimeout(f, when);
  _$jscoverage['/lang/function.js'].lineData[106]++;
  return {
  id: r, 
  interval: periodic, 
  cancel: function() {
  _$jscoverage['/lang/function.js'].functionData[7]++;
  _$jscoverage['/lang/function.js'].lineData[110]++;
  if (visit162_110_1(this.interval)) {
    _$jscoverage['/lang/function.js'].lineData[111]++;
    clearInterval(r);
  } else {
    _$jscoverage['/lang/function.js'].lineData[113]++;
    clearTimeout(r);
  }
}};
}, 
  throttle: function(fn, ms, context) {
  _$jscoverage['/lang/function.js'].functionData[8]++;
  _$jscoverage['/lang/function.js'].lineData[129]++;
  ms = visit163_129_1(ms || 150);
  _$jscoverage['/lang/function.js'].lineData[131]++;
  if (visit164_131_1(ms === -1)) {
    _$jscoverage['/lang/function.js'].lineData[132]++;
    return function() {
  _$jscoverage['/lang/function.js'].functionData[9]++;
  _$jscoverage['/lang/function.js'].lineData[133]++;
  fn.apply(visit165_133_1(context || this), arguments);
};
  }
  _$jscoverage['/lang/function.js'].lineData[137]++;
  var last = S.now();
  _$jscoverage['/lang/function.js'].lineData[139]++;
  return function() {
  _$jscoverage['/lang/function.js'].functionData[10]++;
  _$jscoverage['/lang/function.js'].lineData[140]++;
  var now = S.now();
  _$jscoverage['/lang/function.js'].lineData[141]++;
  if (visit166_141_1(now - last > ms)) {
    _$jscoverage['/lang/function.js'].lineData[142]++;
    last = now;
    _$jscoverage['/lang/function.js'].lineData[143]++;
    fn.apply(visit167_143_1(context || this), arguments);
  }
};
}, 
  buffer: function(fn, ms, context) {
  _$jscoverage['/lang/function.js'].functionData[11]++;
  _$jscoverage['/lang/function.js'].lineData[157]++;
  ms = visit168_157_1(ms || 150);
  _$jscoverage['/lang/function.js'].lineData[159]++;
  if (visit169_159_1(ms === -1)) {
    _$jscoverage['/lang/function.js'].lineData[160]++;
    return function() {
  _$jscoverage['/lang/function.js'].functionData[12]++;
  _$jscoverage['/lang/function.js'].lineData[161]++;
  fn.apply(visit170_161_1(context || this), arguments);
};
  }
  _$jscoverage['/lang/function.js'].lineData[164]++;
  var bufferTimer = null;
  _$jscoverage['/lang/function.js'].lineData[166]++;
  function f() {
    _$jscoverage['/lang/function.js'].functionData[13]++;
    _$jscoverage['/lang/function.js'].lineData[167]++;
    f.stop();
    _$jscoverage['/lang/function.js'].lineData[168]++;
    bufferTimer = S.later(fn, ms, 0, visit171_168_1(context || this), arguments);
  }
  _$jscoverage['/lang/function.js'].lineData[171]++;
  f.stop = function() {
  _$jscoverage['/lang/function.js'].functionData[14]++;
  _$jscoverage['/lang/function.js'].lineData[172]++;
  if (visit172_172_1(bufferTimer)) {
    _$jscoverage['/lang/function.js'].lineData[173]++;
    bufferTimer.cancel();
    _$jscoverage['/lang/function.js'].lineData[174]++;
    bufferTimer = 0;
  }
};
  _$jscoverage['/lang/function.js'].lineData[178]++;
  return f;
}});
})(KISSY);
