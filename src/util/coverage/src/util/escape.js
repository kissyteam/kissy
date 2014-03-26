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
if (! _$jscoverage['/util/escape.js']) {
  _$jscoverage['/util/escape.js'] = {};
  _$jscoverage['/util/escape.js'].lineData = [];
  _$jscoverage['/util/escape.js'].lineData[7] = 0;
  _$jscoverage['/util/escape.js'].lineData[12] = 0;
  _$jscoverage['/util/escape.js'].lineData[32] = 0;
  _$jscoverage['/util/escape.js'].lineData[33] = 0;
  _$jscoverage['/util/escape.js'].lineData[34] = 0;
  _$jscoverage['/util/escape.js'].lineData[38] = 0;
  _$jscoverage['/util/escape.js'].lineData[39] = 0;
  _$jscoverage['/util/escape.js'].lineData[41] = 0;
  _$jscoverage['/util/escape.js'].lineData[42] = 0;
  _$jscoverage['/util/escape.js'].lineData[43] = 0;
  _$jscoverage['/util/escape.js'].lineData[44] = 0;
  _$jscoverage['/util/escape.js'].lineData[45] = 0;
  _$jscoverage['/util/escape.js'].lineData[47] = 0;
  _$jscoverage['/util/escape.js'].lineData[48] = 0;
  _$jscoverage['/util/escape.js'].lineData[49] = 0;
  _$jscoverage['/util/escape.js'].lineData[52] = 0;
  _$jscoverage['/util/escape.js'].lineData[53] = 0;
  _$jscoverage['/util/escape.js'].lineData[54] = 0;
  _$jscoverage['/util/escape.js'].lineData[55] = 0;
  _$jscoverage['/util/escape.js'].lineData[56] = 0;
  _$jscoverage['/util/escape.js'].lineData[58] = 0;
  _$jscoverage['/util/escape.js'].lineData[59] = 0;
  _$jscoverage['/util/escape.js'].lineData[60] = 0;
  _$jscoverage['/util/escape.js'].lineData[63] = 0;
  _$jscoverage['/util/escape.js'].lineData[78] = 0;
  _$jscoverage['/util/escape.js'].lineData[79] = 0;
  _$jscoverage['/util/escape.js'].lineData[81] = 0;
  _$jscoverage['/util/escape.js'].lineData[82] = 0;
  _$jscoverage['/util/escape.js'].lineData[83] = 0;
  _$jscoverage['/util/escape.js'].lineData[85] = 0;
  _$jscoverage['/util/escape.js'].lineData[86] = 0;
  _$jscoverage['/util/escape.js'].lineData[97] = 0;
  _$jscoverage['/util/escape.js'].lineData[109] = 0;
  _$jscoverage['/util/escape.js'].lineData[110] = 0;
  _$jscoverage['/util/escape.js'].lineData[115] = 0;
  _$jscoverage['/util/escape.js'].lineData[116] = 0;
}
if (! _$jscoverage['/util/escape.js'].functionData) {
  _$jscoverage['/util/escape.js'].functionData = [];
  _$jscoverage['/util/escape.js'].functionData[0] = 0;
  _$jscoverage['/util/escape.js'].functionData[1] = 0;
  _$jscoverage['/util/escape.js'].functionData[2] = 0;
  _$jscoverage['/util/escape.js'].functionData[3] = 0;
  _$jscoverage['/util/escape.js'].functionData[4] = 0;
  _$jscoverage['/util/escape.js'].functionData[5] = 0;
  _$jscoverage['/util/escape.js'].functionData[6] = 0;
  _$jscoverage['/util/escape.js'].functionData[7] = 0;
  _$jscoverage['/util/escape.js'].functionData[8] = 0;
}
if (! _$jscoverage['/util/escape.js'].branchData) {
  _$jscoverage['/util/escape.js'].branchData = {};
  _$jscoverage['/util/escape.js'].branchData['78'] = [];
  _$jscoverage['/util/escape.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/util/escape.js'].branchData['78'][2] = new BranchData();
  _$jscoverage['/util/escape.js'].branchData['82'] = [];
  _$jscoverage['/util/escape.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/util/escape.js'].branchData['110'] = [];
  _$jscoverage['/util/escape.js'].branchData['110'][1] = new BranchData();
}
_$jscoverage['/util/escape.js'].branchData['110'][1].init(24, 42, 'htmlEntities[m] || String.fromCharCode(+n)');
function visit61_110_1(result) {
  _$jscoverage['/util/escape.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/escape.js'].branchData['82'][1].init(123, 32, '!possibleEscapeHtmlReg.test(str)');
function visit60_82_1(result) {
  _$jscoverage['/util/escape.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/escape.js'].branchData['78'][2].init(25, 9, 'str !== 0');
function visit59_78_2(result) {
  _$jscoverage['/util/escape.js'].branchData['78'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/escape.js'].branchData['78'][1].init(17, 17, '!str && str !== 0');
function visit58_78_1(result) {
  _$jscoverage['/util/escape.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/escape.js'].lineData[7]++;
KISSY.add(function(S) {
  _$jscoverage['/util/escape.js'].functionData[0]++;
  _$jscoverage['/util/escape.js'].lineData[12]++;
  var EMPTY = '', htmlEntities = {
  '&amp;': '&', 
  '&gt;': '>', 
  '&lt;': '<', 
  '&#x60;': '`', 
  '&#x2F;': '/', 
  '&quot;': '"', 
  '&#x27;': "'"}, reverseEntities = {}, escapeHtmlReg, unEscapeHtmlReg, possibleEscapeHtmlReg = /[&<>"'`]/, escapeRegExp = /[\-#$\^*()+\[\]{}|\\,.?\s]/g;
  _$jscoverage['/util/escape.js'].lineData[32]++;
  (function() {
  _$jscoverage['/util/escape.js'].functionData[1]++;
  _$jscoverage['/util/escape.js'].lineData[33]++;
  for (var k in htmlEntities) {
    _$jscoverage['/util/escape.js'].lineData[34]++;
    reverseEntities[htmlEntities[k]] = k;
  }
})();
  _$jscoverage['/util/escape.js'].lineData[38]++;
  escapeHtmlReg = getEscapeReg();
  _$jscoverage['/util/escape.js'].lineData[39]++;
  unEscapeHtmlReg = getUnEscapeReg();
  _$jscoverage['/util/escape.js'].lineData[41]++;
  function getEscapeReg() {
    _$jscoverage['/util/escape.js'].functionData[2]++;
    _$jscoverage['/util/escape.js'].lineData[42]++;
    var str = EMPTY;
    _$jscoverage['/util/escape.js'].lineData[43]++;
    for (var e in htmlEntities) {
      _$jscoverage['/util/escape.js'].lineData[44]++;
      var entity = htmlEntities[e];
      _$jscoverage['/util/escape.js'].lineData[45]++;
      str += entity + '|';
    }
    _$jscoverage['/util/escape.js'].lineData[47]++;
    str = str.slice(0, -1);
    _$jscoverage['/util/escape.js'].lineData[48]++;
    escapeHtmlReg = new RegExp(str, 'g');
    _$jscoverage['/util/escape.js'].lineData[49]++;
    return escapeHtmlReg;
  }
  _$jscoverage['/util/escape.js'].lineData[52]++;
  function getUnEscapeReg() {
    _$jscoverage['/util/escape.js'].functionData[3]++;
    _$jscoverage['/util/escape.js'].lineData[53]++;
    var str = EMPTY;
    _$jscoverage['/util/escape.js'].lineData[54]++;
    for (var e in reverseEntities) {
      _$jscoverage['/util/escape.js'].lineData[55]++;
      var entity = reverseEntities[e];
      _$jscoverage['/util/escape.js'].lineData[56]++;
      str += entity + '|';
    }
    _$jscoverage['/util/escape.js'].lineData[58]++;
    str += '&#(\\d{1,5});';
    _$jscoverage['/util/escape.js'].lineData[59]++;
    unEscapeHtmlReg = new RegExp(str, 'g');
    _$jscoverage['/util/escape.js'].lineData[60]++;
    return unEscapeHtmlReg;
  }
  _$jscoverage['/util/escape.js'].lineData[63]++;
  S.mix(S, {
  escapeHtml: function(str) {
  _$jscoverage['/util/escape.js'].functionData[4]++;
  _$jscoverage['/util/escape.js'].lineData[78]++;
  if (visit58_78_1(!str && visit59_78_2(str !== 0))) {
    _$jscoverage['/util/escape.js'].lineData[79]++;
    return '';
  }
  _$jscoverage['/util/escape.js'].lineData[81]++;
  str = '' + str;
  _$jscoverage['/util/escape.js'].lineData[82]++;
  if (visit60_82_1(!possibleEscapeHtmlReg.test(str))) {
    _$jscoverage['/util/escape.js'].lineData[83]++;
    return str;
  }
  _$jscoverage['/util/escape.js'].lineData[85]++;
  return (str + '').replace(escapeHtmlReg, function(m) {
  _$jscoverage['/util/escape.js'].functionData[5]++;
  _$jscoverage['/util/escape.js'].lineData[86]++;
  return reverseEntities[m];
});
}, 
  escapeRegExp: function(str) {
  _$jscoverage['/util/escape.js'].functionData[6]++;
  _$jscoverage['/util/escape.js'].lineData[97]++;
  return str.replace(escapeRegExp, '\\$&');
}, 
  unEscapeHtml: function(str) {
  _$jscoverage['/util/escape.js'].functionData[7]++;
  _$jscoverage['/util/escape.js'].lineData[109]++;
  return str.replace(unEscapeHtmlReg, function(m, n) {
  _$jscoverage['/util/escape.js'].functionData[8]++;
  _$jscoverage['/util/escape.js'].lineData[110]++;
  return visit61_110_1(htmlEntities[m] || String.fromCharCode(+n));
});
}});
  _$jscoverage['/util/escape.js'].lineData[115]++;
  S.escapeHTML = S.escapeHtml;
  _$jscoverage['/util/escape.js'].lineData[116]++;
  S.unEscapeHTML = S.unEscapeHtml;
});
