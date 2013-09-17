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
  _$jscoverage['/loader/css-onload.js'].lineData[17] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[18] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[19] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[24] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[25] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[26] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[30] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[32] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[33] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[34] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[36] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[37] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[38] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[39] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[40] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[41] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[44] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[45] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[47] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[50] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[51] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[56] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[57] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[58] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[60] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[65] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[66] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[68] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[74] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[75] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[77] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[78] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[79] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[80] = 0;
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
  _$jscoverage['/loader/css-onload.js'].branchData['18'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['30'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['32'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['36'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['39'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['49'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['56'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['57'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['65'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['65'][1] = new BranchData();
}
_$jscoverage['/loader/css-onload.js'].branchData['65'][1].init(1536, 25, 'S.isEmptyObject(monitors)');
function visit371_65_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['57'][1].init(22, 20, 'callbackObj.callback');
function visit370_57_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['56'][1].init(1289, 6, 'loaded');
function visit369_56_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['49'][1].init(100, 37, 'exName == \'NS_ERROR_DOM_SECURITY_ERR\'');
function visit368_49_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['39'][1].init(86, 8, 'cssRules');
function visit367_39_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['36'][1].init(425, 13, 'node[\'sheet\']');
function visit366_36_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['32'][1].init(98, 13, 'node[\'sheet\']');
function visit365_32_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['30'][1].init(160, 9, 'UA.webkit');
function visit364_30_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['18'][1].init(14, 6, '!timer');
function visit363_18_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/css-onload.js'].functionData[0]++;
  _$jscoverage['/loader/css-onload.js'].lineData[7]++;
  var CSS_POLL_INTERVAL = 30, UA = S.UA, logger = S.getLogger('s/loader'), Utils = S.Loader.Utils, timer = 0, monitors = {};
  _$jscoverage['/loader/css-onload.js'].lineData[17]++;
  function startCssTimer() {
    _$jscoverage['/loader/css-onload.js'].functionData[1]++;
    _$jscoverage['/loader/css-onload.js'].lineData[18]++;
    if (visit363_18_1(!timer)) {
      _$jscoverage['/loader/css-onload.js'].lineData[19]++;
      cssPoll();
    }
  }
  _$jscoverage['/loader/css-onload.js'].lineData[24]++;
  function cssPoll() {
    _$jscoverage['/loader/css-onload.js'].functionData[2]++;
    _$jscoverage['/loader/css-onload.js'].lineData[25]++;
    for (var url in monitors) {
      _$jscoverage['/loader/css-onload.js'].lineData[26]++;
      var callbackObj = monitors[url], node = callbackObj.node, exName, loaded = 0;
      _$jscoverage['/loader/css-onload.js'].lineData[30]++;
      if (visit364_30_1(UA.webkit)) {
        _$jscoverage['/loader/css-onload.js'].lineData[32]++;
        if (visit365_32_1(node['sheet'])) {
          _$jscoverage['/loader/css-onload.js'].lineData[33]++;
          logger.debug('webkit loaded : ' + url);
          _$jscoverage['/loader/css-onload.js'].lineData[34]++;
          loaded = 1;
        }
      } else {
        _$jscoverage['/loader/css-onload.js'].lineData[36]++;
        if (visit366_36_1(node['sheet'])) {
          _$jscoverage['/loader/css-onload.js'].lineData[37]++;
          try {
            _$jscoverage['/loader/css-onload.js'].lineData[38]++;
            var cssRules = node['sheet'].cssRules;
            _$jscoverage['/loader/css-onload.js'].lineData[39]++;
            if (visit367_39_1(cssRules)) {
              _$jscoverage['/loader/css-onload.js'].lineData[40]++;
              logger.debug('same domain firefox loaded : ' + url);
              _$jscoverage['/loader/css-onload.js'].lineData[41]++;
              loaded = 1;
            }
          }          catch (ex) {
  _$jscoverage['/loader/css-onload.js'].lineData[44]++;
  exName = ex.name;
  _$jscoverage['/loader/css-onload.js'].lineData[45]++;
  logger.debug('firefox getStyle : ' + exName + ' ' + ex.code + ' ' + url);
  _$jscoverage['/loader/css-onload.js'].lineData[47]++;
  if (visit368_49_1(exName == 'NS_ERROR_DOM_SECURITY_ERR')) {
    _$jscoverage['/loader/css-onload.js'].lineData[50]++;
    logger.debug(exName + ' firefox loaded : ' + url);
    _$jscoverage['/loader/css-onload.js'].lineData[51]++;
    loaded = 1;
  }
}
        }
      }
      _$jscoverage['/loader/css-onload.js'].lineData[56]++;
      if (visit369_56_1(loaded)) {
        _$jscoverage['/loader/css-onload.js'].lineData[57]++;
        if (visit370_57_1(callbackObj.callback)) {
          _$jscoverage['/loader/css-onload.js'].lineData[58]++;
          callbackObj.callback.call(node);
        }
        _$jscoverage['/loader/css-onload.js'].lineData[60]++;
        delete monitors[url];
      }
    }
    _$jscoverage['/loader/css-onload.js'].lineData[65]++;
    if (visit371_65_1(S.isEmptyObject(monitors))) {
      _$jscoverage['/loader/css-onload.js'].lineData[66]++;
      timer = 0;
    } else {
      _$jscoverage['/loader/css-onload.js'].lineData[68]++;
      timer = setTimeout(cssPoll, CSS_POLL_INTERVAL);
    }
  }
  _$jscoverage['/loader/css-onload.js'].lineData[74]++;
  Utils.pollCss = function(node, callback) {
  _$jscoverage['/loader/css-onload.js'].functionData[3]++;
  _$jscoverage['/loader/css-onload.js'].lineData[75]++;
  var href = node.href, arr;
  _$jscoverage['/loader/css-onload.js'].lineData[77]++;
  arr = monitors[href] = {};
  _$jscoverage['/loader/css-onload.js'].lineData[78]++;
  arr.node = node;
  _$jscoverage['/loader/css-onload.js'].lineData[79]++;
  arr.callback = callback;
  _$jscoverage['/loader/css-onload.js'].lineData[80]++;
  startCssTimer();
};
})(KISSY);
