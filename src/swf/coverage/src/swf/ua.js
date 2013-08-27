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
if (! _$jscoverage['/swf/ua.js']) {
  _$jscoverage['/swf/ua.js'] = {};
  _$jscoverage['/swf/ua.js'].lineData = [];
  _$jscoverage['/swf/ua.js'].lineData[6] = 0;
  _$jscoverage['/swf/ua.js'].lineData[8] = 0;
  _$jscoverage['/swf/ua.js'].lineData[16] = 0;
  _$jscoverage['/swf/ua.js'].lineData[17] = 0;
  _$jscoverage['/swf/ua.js'].lineData[21] = 0;
  _$jscoverage['/swf/ua.js'].lineData[22] = 0;
  _$jscoverage['/swf/ua.js'].lineData[25] = 0;
  _$jscoverage['/swf/ua.js'].lineData[26] = 0;
  _$jscoverage['/swf/ua.js'].lineData[27] = 0;
  _$jscoverage['/swf/ua.js'].lineData[29] = 0;
  _$jscoverage['/swf/ua.js'].lineData[35] = 0;
  _$jscoverage['/swf/ua.js'].lineData[36] = 0;
  _$jscoverage['/swf/ua.js'].lineData[40] = 0;
  _$jscoverage['/swf/ua.js'].lineData[46] = 0;
  _$jscoverage['/swf/ua.js'].lineData[47] = 0;
  _$jscoverage['/swf/ua.js'].lineData[57] = 0;
  _$jscoverage['/swf/ua.js'].lineData[58] = 0;
  _$jscoverage['/swf/ua.js'].lineData[62] = 0;
  _$jscoverage['/swf/ua.js'].lineData[63] = 0;
  _$jscoverage['/swf/ua.js'].lineData[65] = 0;
  _$jscoverage['/swf/ua.js'].lineData[71] = 0;
  _$jscoverage['/swf/ua.js'].lineData[72] = 0;
  _$jscoverage['/swf/ua.js'].lineData[73] = 0;
  _$jscoverage['/swf/ua.js'].lineData[74] = 0;
  _$jscoverage['/swf/ua.js'].lineData[75] = 0;
  _$jscoverage['/swf/ua.js'].lineData[85] = 0;
  _$jscoverage['/swf/ua.js'].lineData[87] = 0;
  _$jscoverage['/swf/ua.js'].lineData[88] = 0;
  _$jscoverage['/swf/ua.js'].lineData[89] = 0;
  _$jscoverage['/swf/ua.js'].lineData[91] = 0;
  _$jscoverage['/swf/ua.js'].lineData[102] = 0;
  _$jscoverage['/swf/ua.js'].lineData[103] = 0;
  _$jscoverage['/swf/ua.js'].lineData[106] = 0;
}
if (! _$jscoverage['/swf/ua.js'].functionData) {
  _$jscoverage['/swf/ua.js'].functionData = [];
  _$jscoverage['/swf/ua.js'].functionData[0] = 0;
  _$jscoverage['/swf/ua.js'].functionData[1] = 0;
  _$jscoverage['/swf/ua.js'].functionData[2] = 0;
  _$jscoverage['/swf/ua.js'].functionData[3] = 0;
  _$jscoverage['/swf/ua.js'].functionData[4] = 0;
  _$jscoverage['/swf/ua.js'].functionData[5] = 0;
  _$jscoverage['/swf/ua.js'].functionData[6] = 0;
}
if (! _$jscoverage['/swf/ua.js'].branchData) {
  _$jscoverage['/swf/ua.js'].branchData = {};
  _$jscoverage['/swf/ua.js'].branchData['21'] = [];
  _$jscoverage['/swf/ua.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/swf/ua.js'].branchData['22'] = [];
  _$jscoverage['/swf/ua.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/swf/ua.js'].branchData['25'] = [];
  _$jscoverage['/swf/ua.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/swf/ua.js'].branchData['35'] = [];
  _$jscoverage['/swf/ua.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/swf/ua.js'].branchData['58'] = [];
  _$jscoverage['/swf/ua.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/swf/ua.js'].branchData['62'] = [];
  _$jscoverage['/swf/ua.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/swf/ua.js'].branchData['65'] = [];
  _$jscoverage['/swf/ua.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/swf/ua.js'].branchData['72'] = [];
  _$jscoverage['/swf/ua.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/swf/ua.js'].branchData['75'] = [];
  _$jscoverage['/swf/ua.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/swf/ua.js'].branchData['87'] = [];
  _$jscoverage['/swf/ua.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/swf/ua.js'].branchData['103'] = [];
  _$jscoverage['/swf/ua.js'].branchData['103'][1] = new BranchData();
}
_$jscoverage['/swf/ua.js'].branchData['103'][1].init(17, 53, 'getNumberVersion(fpv(force)) >= getNumberVersion(ver)');
function visit11_103_1(result) {
  _$jscoverage['/swf/ua.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf/ua.js'].branchData['87'][1].init(73, 17, 'force || firstRun');
function visit10_87_1(result) {
  _$jscoverage['/swf/ua.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf/ua.js'].branchData['75'][1].init(115, 11, 'padding > 0');
function visit9_75_1(result) {
  _$jscoverage['/swf/ua.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf/ua.js'].branchData['72'][1].init(16, 8, 'num || 0');
function visit8_72_1(result) {
  _$jscoverage['/swf/ua.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf/ua.js'].branchData['65'][1].init(268, 8, 'ret || 0');
function visit7_65_1(result) {
  _$jscoverage['/swf/ua.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf/ua.js'].branchData['62'][1].init(144, 14, 'S.isArray(arr)');
function visit6_62_1(result) {
  _$jscoverage['/swf/ua.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf/ua.js'].branchData['58'][1].init(20, 22, 'typeof ver == \'string\'');
function visit5_58_1(result) {
  _$jscoverage['/swf/ua.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf/ua.js'].branchData['35'][1].init(714, 4, '!ver');
function visit4_35_1(result) {
  _$jscoverage['/swf/ua.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf/ua.js'].branchData['25'][1].init(355, 20, 'win[\'ActiveXObject\']');
function visit3_25_1(result) {
  _$jscoverage['/swf/ua.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf/ua.js'].branchData['22'][1].init(21, 41, 'navigator.plugins[\'Shockwave Flash\'] || 0');
function visit2_22_1(result) {
  _$jscoverage['/swf/ua.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf/ua.js'].branchData['21'][1].init(132, 47, 'navigator.plugins && navigator.mimeTypes.length');
function visit1_21_1(result) {
  _$jscoverage['/swf/ua.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf/ua.js'].lineData[6]++;
KISSY.add('swf/ua', function(S, undefined) {
  _$jscoverage['/swf/ua.js'].functionData[0]++;
  _$jscoverage['/swf/ua.js'].lineData[8]++;
  var fpvCached, firstRun = true, win = S.Env.host;
  _$jscoverage['/swf/ua.js'].lineData[16]++;
  function getFlashVersion() {
    _$jscoverage['/swf/ua.js'].functionData[1]++;
    _$jscoverage['/swf/ua.js'].lineData[17]++;
    var ver, SF = 'ShockwaveFlash';
    _$jscoverage['/swf/ua.js'].lineData[21]++;
    if (visit1_21_1(navigator.plugins && navigator.mimeTypes.length)) {
      _$jscoverage['/swf/ua.js'].lineData[22]++;
      ver = (visit2_22_1(navigator.plugins['Shockwave Flash'] || 0)).description;
    } else {
      _$jscoverage['/swf/ua.js'].lineData[25]++;
      if (visit3_25_1(win['ActiveXObject'])) {
        _$jscoverage['/swf/ua.js'].lineData[26]++;
        try {
          _$jscoverage['/swf/ua.js'].lineData[27]++;
          ver = new ActiveXObject(SF + '.' + SF)['GetVariable']('$version');
        }        catch (ex) {
  _$jscoverage['/swf/ua.js'].lineData[29]++;
  S.log('getFlashVersion failed via ActiveXObject');
}
      }
    }
    _$jscoverage['/swf/ua.js'].lineData[35]++;
    if (visit4_35_1(!ver)) {
      _$jscoverage['/swf/ua.js'].lineData[36]++;
      return undefined;
    }
    _$jscoverage['/swf/ua.js'].lineData[40]++;
    return getArrayVersion(ver);
  }
  _$jscoverage['/swf/ua.js'].lineData[46]++;
  function getArrayVersion(ver) {
    _$jscoverage['/swf/ua.js'].functionData[2]++;
    _$jscoverage['/swf/ua.js'].lineData[47]++;
    return ver.match(/\d+/g).splice(0, 3);
  }
  _$jscoverage['/swf/ua.js'].lineData[57]++;
  function getNumberVersion(ver) {
    _$jscoverage['/swf/ua.js'].functionData[3]++;
    _$jscoverage['/swf/ua.js'].lineData[58]++;
    var arr = visit5_58_1(typeof ver == 'string') ? getArrayVersion(ver) : ver, ret = ver;
    _$jscoverage['/swf/ua.js'].lineData[62]++;
    if (visit6_62_1(S.isArray(arr))) {
      _$jscoverage['/swf/ua.js'].lineData[63]++;
      ret = parseFloat(arr[0] + '.' + pad(arr[1], 3) + pad(arr[2], 5));
    }
    _$jscoverage['/swf/ua.js'].lineData[65]++;
    return visit7_65_1(ret || 0);
  }
  _$jscoverage['/swf/ua.js'].lineData[71]++;
  function pad(num, n) {
    _$jscoverage['/swf/ua.js'].functionData[4]++;
    _$jscoverage['/swf/ua.js'].lineData[72]++;
    num = visit8_72_1(num || 0);
    _$jscoverage['/swf/ua.js'].lineData[73]++;
    num += '';
    _$jscoverage['/swf/ua.js'].lineData[74]++;
    var padding = n + 1 - num.length;
    _$jscoverage['/swf/ua.js'].lineData[75]++;
    return new Array(visit9_75_1(padding > 0) ? padding : 0).join('0') + num;
  }
  _$jscoverage['/swf/ua.js'].lineData[85]++;
  function fpv(force) {
    _$jscoverage['/swf/ua.js'].functionData[5]++;
    _$jscoverage['/swf/ua.js'].lineData[87]++;
    if (visit10_87_1(force || firstRun)) {
      _$jscoverage['/swf/ua.js'].lineData[88]++;
      firstRun = false;
      _$jscoverage['/swf/ua.js'].lineData[89]++;
      fpvCached = getFlashVersion();
    }
    _$jscoverage['/swf/ua.js'].lineData[91]++;
    return fpvCached;
  }
  _$jscoverage['/swf/ua.js'].lineData[102]++;
  function fpvGTE(ver, force) {
    _$jscoverage['/swf/ua.js'].functionData[6]++;
    _$jscoverage['/swf/ua.js'].lineData[103]++;
    return visit11_103_1(getNumberVersion(fpv(force)) >= getNumberVersion(ver));
  }
  _$jscoverage['/swf/ua.js'].lineData[106]++;
  return {
  fpv: fpv, 
  fpvGTE: fpvGTE};
});
