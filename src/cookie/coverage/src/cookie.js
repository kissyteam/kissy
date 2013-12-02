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
if (! _$jscoverage['/cookie.js']) {
  _$jscoverage['/cookie.js'] = {};
  _$jscoverage['/cookie.js'].lineData = [];
  _$jscoverage['/cookie.js'].lineData[6] = 0;
  _$jscoverage['/cookie.js'].lineData[8] = 0;
  _$jscoverage['/cookie.js'].lineData[13] = 0;
  _$jscoverage['/cookie.js'].lineData[14] = 0;
  _$jscoverage['/cookie.js'].lineData[22] = 0;
  _$jscoverage['/cookie.js'].lineData[29] = 0;
  _$jscoverage['/cookie.js'].lineData[31] = 0;
  _$jscoverage['/cookie.js'].lineData[32] = 0;
  _$jscoverage['/cookie.js'].lineData[34] = 0;
  _$jscoverage['/cookie.js'].lineData[37] = 0;
  _$jscoverage['/cookie.js'].lineData[51] = 0;
  _$jscoverage['/cookie.js'].lineData[54] = 0;
  _$jscoverage['/cookie.js'].lineData[55] = 0;
  _$jscoverage['/cookie.js'].lineData[56] = 0;
  _$jscoverage['/cookie.js'].lineData[59] = 0;
  _$jscoverage['/cookie.js'].lineData[60] = 0;
  _$jscoverage['/cookie.js'].lineData[64] = 0;
  _$jscoverage['/cookie.js'].lineData[65] = 0;
  _$jscoverage['/cookie.js'].lineData[69] = 0;
  _$jscoverage['/cookie.js'].lineData[70] = 0;
  _$jscoverage['/cookie.js'].lineData[74] = 0;
  _$jscoverage['/cookie.js'].lineData[75] = 0;
  _$jscoverage['/cookie.js'].lineData[78] = 0;
  _$jscoverage['/cookie.js'].lineData[89] = 0;
  _$jscoverage['/cookie.js'].lineData[93] = 0;
}
if (! _$jscoverage['/cookie.js'].functionData) {
  _$jscoverage['/cookie.js'].functionData = [];
  _$jscoverage['/cookie.js'].functionData[0] = 0;
  _$jscoverage['/cookie.js'].functionData[1] = 0;
  _$jscoverage['/cookie.js'].functionData[2] = 0;
  _$jscoverage['/cookie.js'].functionData[3] = 0;
  _$jscoverage['/cookie.js'].functionData[4] = 0;
}
if (! _$jscoverage['/cookie.js'].branchData) {
  _$jscoverage['/cookie.js'].branchData = {};
  _$jscoverage['/cookie.js'].branchData['14'] = [];
  _$jscoverage['/cookie.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/cookie.js'].branchData['14'][2] = new BranchData();
  _$jscoverage['/cookie.js'].branchData['14'][3] = new BranchData();
  _$jscoverage['/cookie.js'].branchData['31'] = [];
  _$jscoverage['/cookie.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/cookie.js'].branchData['54'] = [];
  _$jscoverage['/cookie.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/cookie.js'].branchData['59'] = [];
  _$jscoverage['/cookie.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/cookie.js'].branchData['64'] = [];
  _$jscoverage['/cookie.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/cookie.js'].branchData['69'] = [];
  _$jscoverage['/cookie.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/cookie.js'].branchData['74'] = [];
  _$jscoverage['/cookie.js'].branchData['74'][1] = new BranchData();
}
_$jscoverage['/cookie.js'].branchData['74'][1].init(692, 6, 'secure');
function visit9_74_1(result) {
  _$jscoverage['/cookie.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/cookie.js'].branchData['69'][1].init(571, 22, 'isNotEmptyString(path)');
function visit8_69_1(result) {
  _$jscoverage['/cookie.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/cookie.js'].branchData['64'][1].init(446, 24, 'isNotEmptyString(domain)');
function visit7_64_1(result) {
  _$jscoverage['/cookie.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/cookie.js'].branchData['59'][1].init(310, 20, 'date instanceof Date');
function visit6_59_1(result) {
  _$jscoverage['/cookie.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/cookie.js'].branchData['54'][1].init(108, 24, 'typeof date === \'number\'');
function visit5_54_1(result) {
  _$jscoverage['/cookie.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/cookie.js'].branchData['31'][1].init(42, 22, 'isNotEmptyString(name)');
function visit4_31_1(result) {
  _$jscoverage['/cookie.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/cookie.js'].branchData['14'][3].init(45, 10, 'val !== \'\'');
function visit3_14_3(result) {
  _$jscoverage['/cookie.js'].branchData['14'][3].ranCondition(result);
  return result;
}_$jscoverage['/cookie.js'].branchData['14'][2].init(17, 23, 'typeof val === \'string\'');
function visit2_14_2(result) {
  _$jscoverage['/cookie.js'].branchData['14'][2].ranCondition(result);
  return result;
}_$jscoverage['/cookie.js'].branchData['14'][1].init(17, 38, '(typeof val === \'string\') && val !== \'\'');
function visit1_14_1(result) {
  _$jscoverage['/cookie.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/cookie.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/cookie.js'].functionData[0]++;
  _$jscoverage['/cookie.js'].lineData[8]++;
  var doc = S.Env.host.document, MILLISECONDS_OF_DAY = 24 * 60 * 60 * 1000, encode = encodeURIComponent, decode = S.urlDecode;
  _$jscoverage['/cookie.js'].lineData[13]++;
  function isNotEmptyString(val) {
    _$jscoverage['/cookie.js'].functionData[1]++;
    _$jscoverage['/cookie.js'].lineData[14]++;
    return visit1_14_1((visit2_14_2(typeof val === 'string')) && visit3_14_3(val !== ''));
  }
  _$jscoverage['/cookie.js'].lineData[22]++;
  S.Cookie = {
  get: function(name) {
  _$jscoverage['/cookie.js'].functionData[2]++;
  _$jscoverage['/cookie.js'].lineData[29]++;
  var ret, m;
  _$jscoverage['/cookie.js'].lineData[31]++;
  if (visit4_31_1(isNotEmptyString(name))) {
    _$jscoverage['/cookie.js'].lineData[32]++;
    if ((m = String(doc.cookie).match(new RegExp('(?:^| )' + name + '(?:(?:=([^;]*))|;|$)')))) {
      _$jscoverage['/cookie.js'].lineData[34]++;
      ret = m[1] ? decode(m[1]) : '';
    }
  }
  _$jscoverage['/cookie.js'].lineData[37]++;
  return ret;
}, 
  set: function(name, val, expires, domain, path, secure) {
  _$jscoverage['/cookie.js'].functionData[3]++;
  _$jscoverage['/cookie.js'].lineData[51]++;
  var text = String(encode(val)), date = expires;
  _$jscoverage['/cookie.js'].lineData[54]++;
  if (visit5_54_1(typeof date === 'number')) {
    _$jscoverage['/cookie.js'].lineData[55]++;
    date = new Date();
    _$jscoverage['/cookie.js'].lineData[56]++;
    date.setTime(date.getTime() + expires * MILLISECONDS_OF_DAY);
  }
  _$jscoverage['/cookie.js'].lineData[59]++;
  if (visit6_59_1(date instanceof Date)) {
    _$jscoverage['/cookie.js'].lineData[60]++;
    text += '; expires=' + date.toUTCString();
  }
  _$jscoverage['/cookie.js'].lineData[64]++;
  if (visit7_64_1(isNotEmptyString(domain))) {
    _$jscoverage['/cookie.js'].lineData[65]++;
    text += '; domain=' + domain;
  }
  _$jscoverage['/cookie.js'].lineData[69]++;
  if (visit8_69_1(isNotEmptyString(path))) {
    _$jscoverage['/cookie.js'].lineData[70]++;
    text += '; path=' + path;
  }
  _$jscoverage['/cookie.js'].lineData[74]++;
  if (visit9_74_1(secure)) {
    _$jscoverage['/cookie.js'].lineData[75]++;
    text += '; secure';
  }
  _$jscoverage['/cookie.js'].lineData[78]++;
  doc.cookie = name + '=' + text;
}, 
  remove: function(name, domain, path, secure) {
  _$jscoverage['/cookie.js'].functionData[4]++;
  _$jscoverage['/cookie.js'].lineData[89]++;
  this.set(name, '', -1, domain, path, secure);
}};
  _$jscoverage['/cookie.js'].lineData[93]++;
  return S.Cookie;
});
