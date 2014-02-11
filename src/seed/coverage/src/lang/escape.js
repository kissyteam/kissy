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
if (! _$jscoverage['/lang/escape.js']) {
  _$jscoverage['/lang/escape.js'] = {};
  _$jscoverage['/lang/escape.js'].lineData = [];
  _$jscoverage['/lang/escape.js'].lineData[7] = 0;
  _$jscoverage['/lang/escape.js'].lineData[12] = 0;
  _$jscoverage['/lang/escape.js'].lineData[32] = 0;
  _$jscoverage['/lang/escape.js'].lineData[33] = 0;
  _$jscoverage['/lang/escape.js'].lineData[34] = 0;
  _$jscoverage['/lang/escape.js'].lineData[39] = 0;
  _$jscoverage['/lang/escape.js'].lineData[40] = 0;
  _$jscoverage['/lang/escape.js'].lineData[41] = 0;
  _$jscoverage['/lang/escape.js'].lineData[43] = 0;
  _$jscoverage['/lang/escape.js'].lineData[44] = 0;
  _$jscoverage['/lang/escape.js'].lineData[45] = 0;
  _$jscoverage['/lang/escape.js'].lineData[47] = 0;
  _$jscoverage['/lang/escape.js'].lineData[48] = 0;
  _$jscoverage['/lang/escape.js'].lineData[49] = 0;
  _$jscoverage['/lang/escape.js'].lineData[52] = 0;
  _$jscoverage['/lang/escape.js'].lineData[53] = 0;
  _$jscoverage['/lang/escape.js'].lineData[54] = 0;
  _$jscoverage['/lang/escape.js'].lineData[56] = 0;
  _$jscoverage['/lang/escape.js'].lineData[57] = 0;
  _$jscoverage['/lang/escape.js'].lineData[58] = 0;
  _$jscoverage['/lang/escape.js'].lineData[60] = 0;
  _$jscoverage['/lang/escape.js'].lineData[61] = 0;
  _$jscoverage['/lang/escape.js'].lineData[62] = 0;
  _$jscoverage['/lang/escape.js'].lineData[65] = 0;
  _$jscoverage['/lang/escape.js'].lineData[72] = 0;
  _$jscoverage['/lang/escape.js'].lineData[73] = 0;
  _$jscoverage['/lang/escape.js'].lineData[90] = 0;
  _$jscoverage['/lang/escape.js'].lineData[91] = 0;
  _$jscoverage['/lang/escape.js'].lineData[102] = 0;
  _$jscoverage['/lang/escape.js'].lineData[114] = 0;
  _$jscoverage['/lang/escape.js'].lineData[115] = 0;
  _$jscoverage['/lang/escape.js'].lineData[120] = 0;
  _$jscoverage['/lang/escape.js'].lineData[121] = 0;
}
if (! _$jscoverage['/lang/escape.js'].functionData) {
  _$jscoverage['/lang/escape.js'].functionData = [];
  _$jscoverage['/lang/escape.js'].functionData[0] = 0;
  _$jscoverage['/lang/escape.js'].functionData[1] = 0;
  _$jscoverage['/lang/escape.js'].functionData[2] = 0;
  _$jscoverage['/lang/escape.js'].functionData[3] = 0;
  _$jscoverage['/lang/escape.js'].functionData[4] = 0;
  _$jscoverage['/lang/escape.js'].functionData[5] = 0;
  _$jscoverage['/lang/escape.js'].functionData[6] = 0;
  _$jscoverage['/lang/escape.js'].functionData[7] = 0;
  _$jscoverage['/lang/escape.js'].functionData[8] = 0;
  _$jscoverage['/lang/escape.js'].functionData[9] = 0;
  _$jscoverage['/lang/escape.js'].functionData[10] = 0;
  _$jscoverage['/lang/escape.js'].functionData[11] = 0;
  _$jscoverage['/lang/escape.js'].functionData[12] = 0;
}
if (! _$jscoverage['/lang/escape.js'].branchData) {
  _$jscoverage['/lang/escape.js'].branchData = {};
  _$jscoverage['/lang/escape.js'].branchData['40'] = [];
  _$jscoverage['/lang/escape.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['53'] = [];
  _$jscoverage['/lang/escape.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['115'] = [];
  _$jscoverage['/lang/escape.js'].branchData['115'][1] = new BranchData();
}
_$jscoverage['/lang/escape.js'].branchData['115'][1].init(24, 42, 'htmlEntities[m] || String.fromCharCode(+n)');
function visit105_115_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['53'][1].init(13, 11, 'unEscapeReg');
function visit104_53_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['40'][1].init(13, 9, 'escapeReg');
function visit103_40_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].lineData[7]++;
(function(S) {
  _$jscoverage['/lang/escape.js'].functionData[0]++;
  _$jscoverage['/lang/escape.js'].lineData[12]++;
  var EMPTY = '', HEX_BASE = 16, htmlEntities = {
  '&amp;': '&', 
  '&gt;': '>', 
  '&lt;': '<', 
  '&#x60;': '`', 
  '&#x2F;': '/', 
  '&quot;': '"', 
  '&#x27;': "'"}, reverseEntities = {}, escapeReg, unEscapeReg, escapeRegExp = /[\-#$\^*()+\[\]{}|\\,.?\s]/g;
  _$jscoverage['/lang/escape.js'].lineData[32]++;
  (function() {
  _$jscoverage['/lang/escape.js'].functionData[1]++;
  _$jscoverage['/lang/escape.js'].lineData[33]++;
  for (var k in htmlEntities) {
    _$jscoverage['/lang/escape.js'].lineData[34]++;
    reverseEntities[htmlEntities[k]] = k;
  }
})();
  _$jscoverage['/lang/escape.js'].lineData[39]++;
  function getEscapeReg() {
    _$jscoverage['/lang/escape.js'].functionData[2]++;
    _$jscoverage['/lang/escape.js'].lineData[40]++;
    if (visit103_40_1(escapeReg)) {
      _$jscoverage['/lang/escape.js'].lineData[41]++;
      return escapeReg;
    }
    _$jscoverage['/lang/escape.js'].lineData[43]++;
    var str = EMPTY;
    _$jscoverage['/lang/escape.js'].lineData[44]++;
    S.each(htmlEntities, function(entity) {
  _$jscoverage['/lang/escape.js'].functionData[3]++;
  _$jscoverage['/lang/escape.js'].lineData[45]++;
  str += entity + '|';
});
    _$jscoverage['/lang/escape.js'].lineData[47]++;
    str = str.slice(0, -1);
    _$jscoverage['/lang/escape.js'].lineData[48]++;
    escapeReg = new RegExp(str, 'g');
    _$jscoverage['/lang/escape.js'].lineData[49]++;
    return escapeReg;
  }
  _$jscoverage['/lang/escape.js'].lineData[52]++;
  function getUnEscapeReg() {
    _$jscoverage['/lang/escape.js'].functionData[4]++;
    _$jscoverage['/lang/escape.js'].lineData[53]++;
    if (visit104_53_1(unEscapeReg)) {
      _$jscoverage['/lang/escape.js'].lineData[54]++;
      return unEscapeReg;
    }
    _$jscoverage['/lang/escape.js'].lineData[56]++;
    var str = EMPTY;
    _$jscoverage['/lang/escape.js'].lineData[57]++;
    S.each(reverseEntities, function(entity) {
  _$jscoverage['/lang/escape.js'].functionData[5]++;
  _$jscoverage['/lang/escape.js'].lineData[58]++;
  str += entity + '|';
});
    _$jscoverage['/lang/escape.js'].lineData[60]++;
    str += '&#(\\d{1,5});';
    _$jscoverage['/lang/escape.js'].lineData[61]++;
    unEscapeReg = new RegExp(str, 'g');
    _$jscoverage['/lang/escape.js'].lineData[62]++;
    return unEscapeReg;
  }
  _$jscoverage['/lang/escape.js'].lineData[65]++;
  S.mix(S, {
  fromUnicode: function(str) {
  _$jscoverage['/lang/escape.js'].functionData[6]++;
  _$jscoverage['/lang/escape.js'].lineData[72]++;
  return str.replace(/\\u([a-f\d]{4})/ig, function(m, u) {
  _$jscoverage['/lang/escape.js'].functionData[7]++;
  _$jscoverage['/lang/escape.js'].lineData[73]++;
  return String.fromCharCode(parseInt(u, HEX_BASE));
});
}, 
  escapeHtml: function(str) {
  _$jscoverage['/lang/escape.js'].functionData[8]++;
  _$jscoverage['/lang/escape.js'].lineData[90]++;
  return (str + '').replace(getEscapeReg(), function(m) {
  _$jscoverage['/lang/escape.js'].functionData[9]++;
  _$jscoverage['/lang/escape.js'].lineData[91]++;
  return reverseEntities[m];
});
}, 
  escapeRegExp: function(str) {
  _$jscoverage['/lang/escape.js'].functionData[10]++;
  _$jscoverage['/lang/escape.js'].lineData[102]++;
  return str.replace(escapeRegExp, '\\$&');
}, 
  unEscapeHtml: function(str) {
  _$jscoverage['/lang/escape.js'].functionData[11]++;
  _$jscoverage['/lang/escape.js'].lineData[114]++;
  return str.replace(getUnEscapeReg(), function(m, n) {
  _$jscoverage['/lang/escape.js'].functionData[12]++;
  _$jscoverage['/lang/escape.js'].lineData[115]++;
  return visit105_115_1(htmlEntities[m] || String.fromCharCode(+n));
});
}});
  _$jscoverage['/lang/escape.js'].lineData[120]++;
  S.escapeHTML = S.escapeHtml;
  _$jscoverage['/lang/escape.js'].lineData[121]++;
  S.unEscapeHTML = S.unEscapeHtml;
})(KISSY);
