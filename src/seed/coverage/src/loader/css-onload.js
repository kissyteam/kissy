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
if (! _$jscoverage['/loader/css-onload.js']) {
  _$jscoverage['/loader/css-onload.js'] = {};
  _$jscoverage['/loader/css-onload.js'].lineData = [];
  _$jscoverage['/loader/css-onload.js'].lineData[6] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[8] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[40] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[41] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[43] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[48] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[50] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[52] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[56] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[58] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[59] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[60] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[62] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[63] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[64] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[65] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[66] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[67] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[70] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[71] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[73] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[76] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[77] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[82] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[83] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[84] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[86] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[91] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[92] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[95] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[99] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[103] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[105] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[106] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[107] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[108] = 0;
}
if (! _$jscoverage['/loader/css-onload.js'].functionData) {
  _$jscoverage['/loader/css-onload.js'].functionData = [];
  _$jscoverage['/loader/css-onload.js'].functionData[0] = 0;
  _$jscoverage['/loader/css-onload.js'].functionData[1] = 0;
  _$jscoverage['/loader/css-onload.js'].functionData[2] = 0;
  _$jscoverage['/loader/css-onload.js'].functionData[3] = 0;
}
if (! _$jscoverage['/loader/css-onload.js'].branchData) {
  _$jscoverage['/loader/css-onload.js'].branchData = {};
  _$jscoverage['/loader/css-onload.js'].branchData['41'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['56'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['58'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['62'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['65'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['75'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['82'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['83'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['91'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['91'][1] = new BranchData();
}
_$jscoverage['/loader/css-onload.js'].branchData['91'][1].init(1512, 25, 'S.isEmptyObject(monitors)');
function visit339_91_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['83'][1].init(22, 20, 'callbackObj.callback');
function visit338_83_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['82'][1].init(1263, 6, 'loaded');
function visit337_82_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['75'][1].init(100, 37, 'exName == \'NS_ERROR_DOM_SECURITY_ERR\'');
function visit336_75_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['65'][1].init(86, 8, 'cssRules');
function visit335_65_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['62'][1].init(420, 13, 'node[\'sheet\']');
function visit334_62_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['58'][1].init(98, 13, 'node[\'sheet\']');
function visit333_58_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['56'][1].init(162, 9, 'UA.webkit');
function visit332_56_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['41'][1].init(14, 6, '!timer');
function visit331_41_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/css-onload.js'].functionData[0]++;
  _$jscoverage['/loader/css-onload.js'].lineData[8]++;
  var CSS_POLL_INTERVAL = 30, UA = S.UA, Utils = S.Loader.Utils, timer = 0, monitors = {};
  _$jscoverage['/loader/css-onload.js'].lineData[40]++;
  function startCssTimer() {
    _$jscoverage['/loader/css-onload.js'].functionData[1]++;
    _$jscoverage['/loader/css-onload.js'].lineData[41]++;
    if (visit331_41_1(!timer)) {
      _$jscoverage['/loader/css-onload.js'].lineData[43]++;
      cssPoll();
    }
  }
  _$jscoverage['/loader/css-onload.js'].lineData[48]++;
  function cssPoll() {
    _$jscoverage['/loader/css-onload.js'].functionData[2]++;
    _$jscoverage['/loader/css-onload.js'].lineData[50]++;
    for (var url in monitors) {
      _$jscoverage['/loader/css-onload.js'].lineData[52]++;
      var callbackObj = monitors[url], node = callbackObj.node, exName, loaded = 0;
      _$jscoverage['/loader/css-onload.js'].lineData[56]++;
      if (visit332_56_1(UA.webkit)) {
        _$jscoverage['/loader/css-onload.js'].lineData[58]++;
        if (visit333_58_1(node['sheet'])) {
          _$jscoverage['/loader/css-onload.js'].lineData[59]++;
          S.log('webkit loaded : ' + url);
          _$jscoverage['/loader/css-onload.js'].lineData[60]++;
          loaded = 1;
        }
      } else {
        _$jscoverage['/loader/css-onload.js'].lineData[62]++;
        if (visit334_62_1(node['sheet'])) {
          _$jscoverage['/loader/css-onload.js'].lineData[63]++;
          try {
            _$jscoverage['/loader/css-onload.js'].lineData[64]++;
            var cssRules = node['sheet'].cssRules;
            _$jscoverage['/loader/css-onload.js'].lineData[65]++;
            if (visit335_65_1(cssRules)) {
              _$jscoverage['/loader/css-onload.js'].lineData[66]++;
              S.log('same domain firefox loaded : ' + url);
              _$jscoverage['/loader/css-onload.js'].lineData[67]++;
              loaded = 1;
            }
          }          catch (ex) {
  _$jscoverage['/loader/css-onload.js'].lineData[70]++;
  exName = ex.name;
  _$jscoverage['/loader/css-onload.js'].lineData[71]++;
  S.log('firefox getStyle : ' + exName + ' ' + ex.code + ' ' + url);
  _$jscoverage['/loader/css-onload.js'].lineData[73]++;
  if (visit336_75_1(exName == 'NS_ERROR_DOM_SECURITY_ERR')) {
    _$jscoverage['/loader/css-onload.js'].lineData[76]++;
    S.log(exName + ' firefox loaded : ' + url);
    _$jscoverage['/loader/css-onload.js'].lineData[77]++;
    loaded = 1;
  }
}
        }
      }
      _$jscoverage['/loader/css-onload.js'].lineData[82]++;
      if (visit337_82_1(loaded)) {
        _$jscoverage['/loader/css-onload.js'].lineData[83]++;
        if (visit338_83_1(callbackObj.callback)) {
          _$jscoverage['/loader/css-onload.js'].lineData[84]++;
          callbackObj.callback.call(node);
        }
        _$jscoverage['/loader/css-onload.js'].lineData[86]++;
        delete monitors[url];
      }
    }
    _$jscoverage['/loader/css-onload.js'].lineData[91]++;
    if (visit339_91_1(S.isEmptyObject(monitors))) {
      _$jscoverage['/loader/css-onload.js'].lineData[92]++;
      timer = 0;
    } else {
      _$jscoverage['/loader/css-onload.js'].lineData[95]++;
      timer = setTimeout(cssPoll, CSS_POLL_INTERVAL);
    }
  }
  _$jscoverage['/loader/css-onload.js'].lineData[99]++;
  S.mix(Utils, {
  pollCss: function(node, callback) {
  _$jscoverage['/loader/css-onload.js'].functionData[3]++;
  _$jscoverage['/loader/css-onload.js'].lineData[103]++;
  var href = node.href, arr;
  _$jscoverage['/loader/css-onload.js'].lineData[105]++;
  arr = monitors[href] = {};
  _$jscoverage['/loader/css-onload.js'].lineData[106]++;
  arr.node = node;
  _$jscoverage['/loader/css-onload.js'].lineData[107]++;
  arr.callback = callback;
  _$jscoverage['/loader/css-onload.js'].lineData[108]++;
  startCssTimer();
}});
})(KISSY);
