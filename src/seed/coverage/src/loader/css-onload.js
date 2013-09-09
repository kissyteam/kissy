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
  _$jscoverage['/loader/css-onload.js'].lineData[7] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[39] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[40] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[41] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[46] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[47] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[48] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[52] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[54] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[55] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[56] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[58] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[59] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[60] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[61] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[62] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[63] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[66] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[67] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[69] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[72] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[73] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[78] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[79] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[80] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[82] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[87] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[88] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[90] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[94] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[98] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[100] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[101] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[102] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[103] = 0;
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
  _$jscoverage['/loader/css-onload.js'].branchData['40'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['52'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['54'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['58'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['61'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['71'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['78'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['79'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['87'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['87'][1] = new BranchData();
}
_$jscoverage['/loader/css-onload.js'].branchData['87'][1].init(1536, 25, 'S.isEmptyObject(monitors)');
function visit361_87_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['79'][1].init(22, 20, 'callbackObj.callback');
function visit360_79_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['78'][1].init(1289, 6, 'loaded');
function visit359_78_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['71'][1].init(100, 37, 'exName == \'NS_ERROR_DOM_SECURITY_ERR\'');
function visit358_71_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['61'][1].init(86, 8, 'cssRules');
function visit357_61_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['58'][1].init(425, 13, 'node[\'sheet\']');
function visit356_58_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['54'][1].init(98, 13, 'node[\'sheet\']');
function visit355_54_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['52'][1].init(160, 9, 'UA.webkit');
function visit354_52_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['40'][1].init(14, 6, '!timer');
function visit353_40_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/css-onload.js'].functionData[0]++;
  _$jscoverage['/loader/css-onload.js'].lineData[7]++;
  var CSS_POLL_INTERVAL = 30, UA = S.UA, logger = S.getLogger('s/loader'), Utils = S.Loader.Utils, timer = 0, monitors = {};
  _$jscoverage['/loader/css-onload.js'].lineData[39]++;
  function startCssTimer() {
    _$jscoverage['/loader/css-onload.js'].functionData[1]++;
    _$jscoverage['/loader/css-onload.js'].lineData[40]++;
    if (visit353_40_1(!timer)) {
      _$jscoverage['/loader/css-onload.js'].lineData[41]++;
      cssPoll();
    }
  }
  _$jscoverage['/loader/css-onload.js'].lineData[46]++;
  function cssPoll() {
    _$jscoverage['/loader/css-onload.js'].functionData[2]++;
    _$jscoverage['/loader/css-onload.js'].lineData[47]++;
    for (var url in monitors) {
      _$jscoverage['/loader/css-onload.js'].lineData[48]++;
      var callbackObj = monitors[url], node = callbackObj.node, exName, loaded = 0;
      _$jscoverage['/loader/css-onload.js'].lineData[52]++;
      if (visit354_52_1(UA.webkit)) {
        _$jscoverage['/loader/css-onload.js'].lineData[54]++;
        if (visit355_54_1(node['sheet'])) {
          _$jscoverage['/loader/css-onload.js'].lineData[55]++;
          logger.debug('webkit loaded : ' + url);
          _$jscoverage['/loader/css-onload.js'].lineData[56]++;
          loaded = 1;
        }
      } else {
        _$jscoverage['/loader/css-onload.js'].lineData[58]++;
        if (visit356_58_1(node['sheet'])) {
          _$jscoverage['/loader/css-onload.js'].lineData[59]++;
          try {
            _$jscoverage['/loader/css-onload.js'].lineData[60]++;
            var cssRules = node['sheet'].cssRules;
            _$jscoverage['/loader/css-onload.js'].lineData[61]++;
            if (visit357_61_1(cssRules)) {
              _$jscoverage['/loader/css-onload.js'].lineData[62]++;
              logger.debug('same domain firefox loaded : ' + url);
              _$jscoverage['/loader/css-onload.js'].lineData[63]++;
              loaded = 1;
            }
          }          catch (ex) {
  _$jscoverage['/loader/css-onload.js'].lineData[66]++;
  exName = ex.name;
  _$jscoverage['/loader/css-onload.js'].lineData[67]++;
  logger.debug('firefox getStyle : ' + exName + ' ' + ex.code + ' ' + url);
  _$jscoverage['/loader/css-onload.js'].lineData[69]++;
  if (visit358_71_1(exName == 'NS_ERROR_DOM_SECURITY_ERR')) {
    _$jscoverage['/loader/css-onload.js'].lineData[72]++;
    logger.debug(exName + ' firefox loaded : ' + url);
    _$jscoverage['/loader/css-onload.js'].lineData[73]++;
    loaded = 1;
  }
}
        }
      }
      _$jscoverage['/loader/css-onload.js'].lineData[78]++;
      if (visit359_78_1(loaded)) {
        _$jscoverage['/loader/css-onload.js'].lineData[79]++;
        if (visit360_79_1(callbackObj.callback)) {
          _$jscoverage['/loader/css-onload.js'].lineData[80]++;
          callbackObj.callback.call(node);
        }
        _$jscoverage['/loader/css-onload.js'].lineData[82]++;
        delete monitors[url];
      }
    }
    _$jscoverage['/loader/css-onload.js'].lineData[87]++;
    if (visit361_87_1(S.isEmptyObject(monitors))) {
      _$jscoverage['/loader/css-onload.js'].lineData[88]++;
      timer = 0;
    } else {
      _$jscoverage['/loader/css-onload.js'].lineData[90]++;
      timer = setTimeout(cssPoll, CSS_POLL_INTERVAL);
    }
  }
  _$jscoverage['/loader/css-onload.js'].lineData[94]++;
  S.mix(Utils, {
  pollCss: function(node, callback) {
  _$jscoverage['/loader/css-onload.js'].functionData[3]++;
  _$jscoverage['/loader/css-onload.js'].lineData[98]++;
  var href = node.href, arr;
  _$jscoverage['/loader/css-onload.js'].lineData[100]++;
  arr = monitors[href] = {};
  _$jscoverage['/loader/css-onload.js'].lineData[101]++;
  arr.node = node;
  _$jscoverage['/loader/css-onload.js'].lineData[102]++;
  arr.callback = callback;
  _$jscoverage['/loader/css-onload.js'].lineData[103]++;
  startCssTimer();
}});
})(KISSY);
