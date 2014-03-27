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
if (! _$jscoverage['/nodejs.js']) {
  _$jscoverage['/nodejs.js'] = {};
  _$jscoverage['/nodejs.js'].lineData = [];
  _$jscoverage['/nodejs.js'].lineData[7] = 0;
  _$jscoverage['/nodejs.js'].lineData[9] = 0;
  _$jscoverage['/nodejs.js'].lineData[12] = 0;
  _$jscoverage['/nodejs.js'].lineData[13] = 0;
  _$jscoverage['/nodejs.js'].lineData[15] = 0;
  _$jscoverage['/nodejs.js'].lineData[16] = 0;
  _$jscoverage['/nodejs.js'].lineData[17] = 0;
  _$jscoverage['/nodejs.js'].lineData[18] = 0;
  _$jscoverage['/nodejs.js'].lineData[21] = 0;
  _$jscoverage['/nodejs.js'].lineData[22] = 0;
  _$jscoverage['/nodejs.js'].lineData[23] = 0;
  _$jscoverage['/nodejs.js'].lineData[24] = 0;
  _$jscoverage['/nodejs.js'].lineData[26] = 0;
  _$jscoverage['/nodejs.js'].lineData[29] = 0;
  _$jscoverage['/nodejs.js'].lineData[32] = 0;
  _$jscoverage['/nodejs.js'].lineData[36] = 0;
  _$jscoverage['/nodejs.js'].lineData[37] = 0;
  _$jscoverage['/nodejs.js'].lineData[38] = 0;
  _$jscoverage['/nodejs.js'].lineData[39] = 0;
  _$jscoverage['/nodejs.js'].lineData[42] = 0;
  _$jscoverage['/nodejs.js'].lineData[43] = 0;
  _$jscoverage['/nodejs.js'].lineData[44] = 0;
  _$jscoverage['/nodejs.js'].lineData[45] = 0;
  _$jscoverage['/nodejs.js'].lineData[50] = 0;
  _$jscoverage['/nodejs.js'].lineData[53] = 0;
  _$jscoverage['/nodejs.js'].lineData[54] = 0;
  _$jscoverage['/nodejs.js'].lineData[57] = 0;
  _$jscoverage['/nodejs.js'].lineData[64] = 0;
  _$jscoverage['/nodejs.js'].lineData[65] = 0;
  _$jscoverage['/nodejs.js'].lineData[66] = 0;
  _$jscoverage['/nodejs.js'].lineData[67] = 0;
  _$jscoverage['/nodejs.js'].lineData[69] = 0;
  _$jscoverage['/nodejs.js'].lineData[71] = 0;
  _$jscoverage['/nodejs.js'].lineData[75] = 0;
}
if (! _$jscoverage['/nodejs.js'].functionData) {
  _$jscoverage['/nodejs.js'].functionData = [];
  _$jscoverage['/nodejs.js'].functionData[0] = 0;
  _$jscoverage['/nodejs.js'].functionData[1] = 0;
  _$jscoverage['/nodejs.js'].functionData[2] = 0;
  _$jscoverage['/nodejs.js'].functionData[3] = 0;
}
if (! _$jscoverage['/nodejs.js'].branchData) {
  _$jscoverage['/nodejs.js'].branchData = {};
  _$jscoverage['/nodejs.js'].branchData['15'] = [];
  _$jscoverage['/nodejs.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/nodejs.js'].branchData['21'] = [];
  _$jscoverage['/nodejs.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/nodejs.js'].branchData['23'] = [];
  _$jscoverage['/nodejs.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/nodejs.js'].branchData['38'] = [];
  _$jscoverage['/nodejs.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/nodejs.js'].branchData['44'] = [];
  _$jscoverage['/nodejs.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/nodejs.js'].branchData['53'] = [];
  _$jscoverage['/nodejs.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/nodejs.js'].branchData['66'] = [];
  _$jscoverage['/nodejs.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/nodejs.js'].branchData['66'][2] = new BranchData();
  _$jscoverage['/nodejs.js'].branchData['66'][3] = new BranchData();
  _$jscoverage['/nodejs.js'].branchData['75'] = [];
  _$jscoverage['/nodejs.js'].branchData['75'][1] = new BranchData();
}
_$jscoverage['/nodejs.js'].branchData['75'][1].init(325, 27, 'typeof modName === \'string\'');
function visit233_75_1(result) {
  _$jscoverage['/nodejs.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/nodejs.js'].branchData['66'][3].init(66, 27, 'modName.indexOf(\',\') !== -1');
function visit232_66_3(result) {
  _$jscoverage['/nodejs.js'].branchData['66'][3].ranCondition(result);
  return result;
}_$jscoverage['/nodejs.js'].branchData['66'][2].init(35, 27, 'typeof modName === \'string\'');
function visit231_66_2(result) {
  _$jscoverage['/nodejs.js'].branchData['66'][2].ranCondition(result);
  return result;
}_$jscoverage['/nodejs.js'].branchData['66'][1].init(35, 58, 'typeof modName === \'string\' && modName.indexOf(\',\') !== -1');
function visit230_66_1(result) {
  _$jscoverage['/nodejs.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/nodejs.js'].branchData['53'][1].init(1365, 29, 'typeof module !== \'undefined\'');
function visit229_53_1(result) {
  _$jscoverage['/nodejs.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/nodejs.js'].branchData['44'][1].init(101, 5, 'error');
function visit228_44_1(result) {
  _$jscoverage['/nodejs.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/nodejs.js'].branchData['38'][1].init(541, 7, 'success');
function visit227_38_1(result) {
  _$jscoverage['/nodejs.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/nodejs.js'].branchData['23'][1].init(80, 7, 'success');
function visit226_23_1(result) {
  _$jscoverage['/nodejs.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/nodejs.js'].branchData['21'][1].init(200, 23, 'S.endsWith(url, \'.css\')');
function visit225_21_1(result) {
  _$jscoverage['/nodejs.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/nodejs.js'].branchData['15'][1].init(33, 27, 'typeof success === \'object\'');
function visit224_15_1(result) {
  _$jscoverage['/nodejs.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/nodejs.js'].lineData[7]++;
(function(S) {
  _$jscoverage['/nodejs.js'].functionData[0]++;
  _$jscoverage['/nodejs.js'].lineData[9]++;
  var fs = require('fs'), vm = require('vm');
  _$jscoverage['/nodejs.js'].lineData[12]++;
  S.getScript = function(url, success, charset) {
  _$jscoverage['/nodejs.js'].functionData[1]++;
  _$jscoverage['/nodejs.js'].lineData[13]++;
  var error;
  _$jscoverage['/nodejs.js'].lineData[15]++;
  if (visit224_15_1(typeof success === 'object')) {
    _$jscoverage['/nodejs.js'].lineData[16]++;
    charset = success.charset;
    _$jscoverage['/nodejs.js'].lineData[17]++;
    error = success.error;
    _$jscoverage['/nodejs.js'].lineData[18]++;
    success = success.success;
  }
  _$jscoverage['/nodejs.js'].lineData[21]++;
  if (visit225_21_1(S.endsWith(url, '.css'))) {
    _$jscoverage['/nodejs.js'].lineData[22]++;
    S.log('node js can not load css: ' + url, 'warn');
    _$jscoverage['/nodejs.js'].lineData[23]++;
    if (visit226_23_1(success)) {
      _$jscoverage['/nodejs.js'].lineData[24]++;
      success();
    }
    _$jscoverage['/nodejs.js'].lineData[26]++;
    return;
  }
  _$jscoverage['/nodejs.js'].lineData[29]++;
  try {
    _$jscoverage['/nodejs.js'].lineData[32]++;
    var mod = fs.readFileSync(url, charset);
    _$jscoverage['/nodejs.js'].lineData[36]++;
    var factory = vm.runInThisContext('(function(KISSY,requireNode){' + mod + '})', url);
    _$jscoverage['/nodejs.js'].lineData[37]++;
    factory(S, require);
    _$jscoverage['/nodejs.js'].lineData[38]++;
    if (visit227_38_1(success)) {
      _$jscoverage['/nodejs.js'].lineData[39]++;
      success();
    }
  }  catch (e) {
  _$jscoverage['/nodejs.js'].lineData[42]++;
  S.log('in file: ' + url, 'error');
  _$jscoverage['/nodejs.js'].lineData[43]++;
  S.log(e.stack, 'error');
  _$jscoverage['/nodejs.js'].lineData[44]++;
  if (visit228_44_1(error)) {
    _$jscoverage['/nodejs.js'].lineData[45]++;
    error(e);
  }
}
};
  _$jscoverage['/nodejs.js'].lineData[50]++;
  S.KISSY = S;
  _$jscoverage['/nodejs.js'].lineData[53]++;
  if (visit229_53_1(typeof module !== 'undefined')) {
    _$jscoverage['/nodejs.js'].lineData[54]++;
    module.exports = S;
  }
  _$jscoverage['/nodejs.js'].lineData[57]++;
  S.config({
  charset: 'utf-8', 
  base: __dirname.replace(/\\/g, '/').replace(/\/$/, '') + '/'});
  _$jscoverage['/nodejs.js'].lineData[64]++;
  S.nodeRequire = function(modName) {
  _$jscoverage['/nodejs.js'].functionData[2]++;
  _$jscoverage['/nodejs.js'].lineData[65]++;
  var ret = [];
  _$jscoverage['/nodejs.js'].lineData[66]++;
  if (visit230_66_1(visit231_66_2(typeof modName === 'string') && visit232_66_3(modName.indexOf(',') !== -1))) {
    _$jscoverage['/nodejs.js'].lineData[67]++;
    modName = modName.split(',');
  }
  _$jscoverage['/nodejs.js'].lineData[69]++;
  S.use(modName, {
  success: function() {
  _$jscoverage['/nodejs.js'].functionData[3]++;
  _$jscoverage['/nodejs.js'].lineData[71]++;
  ret = [].slice.call(arguments, 1);
}, 
  sync: true});
  _$jscoverage['/nodejs.js'].lineData[75]++;
  return visit233_75_1(typeof modName === 'string') ? ret[0] : ret;
};
})(KISSY);
