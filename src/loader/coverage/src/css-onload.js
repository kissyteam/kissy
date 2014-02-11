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
if (! _$jscoverage['/css-onload.js']) {
  _$jscoverage['/css-onload.js'] = {};
  _$jscoverage['/css-onload.js'].lineData = [];
  _$jscoverage['/css-onload.js'].lineData[6] = 0;
  _$jscoverage['/css-onload.js'].lineData[7] = 0;
  _$jscoverage['/css-onload.js'].lineData[8] = 0;
  _$jscoverage['/css-onload.js'].lineData[15] = 0;
  _$jscoverage['/css-onload.js'].lineData[16] = 0;
  _$jscoverage['/css-onload.js'].lineData[17] = 0;
  _$jscoverage['/css-onload.js'].lineData[18] = 0;
  _$jscoverage['/css-onload.js'].lineData[22] = 0;
  _$jscoverage['/css-onload.js'].lineData[23] = 0;
  _$jscoverage['/css-onload.js'].lineData[24] = 0;
  _$jscoverage['/css-onload.js'].lineData[26] = 0;
  _$jscoverage['/css-onload.js'].lineData[27] = 0;
  _$jscoverage['/css-onload.js'].lineData[28] = 0;
  _$jscoverage['/css-onload.js'].lineData[30] = 0;
  _$jscoverage['/css-onload.js'].lineData[31] = 0;
  _$jscoverage['/css-onload.js'].lineData[32] = 0;
  _$jscoverage['/css-onload.js'].lineData[33] = 0;
  _$jscoverage['/css-onload.js'].lineData[34] = 0;
  _$jscoverage['/css-onload.js'].lineData[35] = 0;
  _$jscoverage['/css-onload.js'].lineData[38] = 0;
  _$jscoverage['/css-onload.js'].lineData[39] = 0;
  _$jscoverage['/css-onload.js'].lineData[41] = 0;
  _$jscoverage['/css-onload.js'].lineData[44] = 0;
  _$jscoverage['/css-onload.js'].lineData[45] = 0;
  _$jscoverage['/css-onload.js'].lineData[49] = 0;
  _$jscoverage['/css-onload.js'].lineData[53] = 0;
  _$jscoverage['/css-onload.js'].lineData[54] = 0;
  _$jscoverage['/css-onload.js'].lineData[55] = 0;
  _$jscoverage['/css-onload.js'].lineData[57] = 0;
  _$jscoverage['/css-onload.js'].lineData[58] = 0;
  _$jscoverage['/css-onload.js'].lineData[59] = 0;
  _$jscoverage['/css-onload.js'].lineData[61] = 0;
  _$jscoverage['/css-onload.js'].lineData[65] = 0;
  _$jscoverage['/css-onload.js'].lineData[66] = 0;
  _$jscoverage['/css-onload.js'].lineData[67] = 0;
  _$jscoverage['/css-onload.js'].lineData[69] = 0;
  _$jscoverage['/css-onload.js'].lineData[75] = 0;
  _$jscoverage['/css-onload.js'].lineData[76] = 0;
  _$jscoverage['/css-onload.js'].lineData[78] = 0;
  _$jscoverage['/css-onload.js'].lineData[79] = 0;
  _$jscoverage['/css-onload.js'].lineData[80] = 0;
  _$jscoverage['/css-onload.js'].lineData[81] = 0;
  _$jscoverage['/css-onload.js'].lineData[84] = 0;
}
if (! _$jscoverage['/css-onload.js'].functionData) {
  _$jscoverage['/css-onload.js'].functionData = [];
  _$jscoverage['/css-onload.js'].functionData[0] = 0;
  _$jscoverage['/css-onload.js'].functionData[1] = 0;
  _$jscoverage['/css-onload.js'].functionData[2] = 0;
  _$jscoverage['/css-onload.js'].functionData[3] = 0;
  _$jscoverage['/css-onload.js'].functionData[4] = 0;
}
if (! _$jscoverage['/css-onload.js'].branchData) {
  _$jscoverage['/css-onload.js'].branchData = {};
  _$jscoverage['/css-onload.js'].branchData['16'] = [];
  _$jscoverage['/css-onload.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/css-onload.js'].branchData['24'] = [];
  _$jscoverage['/css-onload.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/css-onload.js'].branchData['26'] = [];
  _$jscoverage['/css-onload.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/css-onload.js'].branchData['30'] = [];
  _$jscoverage['/css-onload.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/css-onload.js'].branchData['33'] = [];
  _$jscoverage['/css-onload.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/css-onload.js'].branchData['43'] = [];
  _$jscoverage['/css-onload.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/css-onload.js'].branchData['57'] = [];
  _$jscoverage['/css-onload.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/css-onload.js'].branchData['58'] = [];
  _$jscoverage['/css-onload.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/css-onload.js'].branchData['65'] = [];
  _$jscoverage['/css-onload.js'].branchData['65'][1] = new BranchData();
}
_$jscoverage['/css-onload.js'].branchData['65'][1].init(355, 25, 'S.isEmptyObject(monitors)');
function visit90_65_1(result) {
  _$jscoverage['/css-onload.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/css-onload.js'].branchData['58'][1].init(21, 20, 'callbackObj.callback');
function visit89_58_1(result) {
  _$jscoverage['/css-onload.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/css-onload.js'].branchData['57'][1].init(103, 22, 'isCssLoaded(node, url)');
function visit88_57_1(result) {
  _$jscoverage['/css-onload.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/css-onload.js'].branchData['43'][1].init(90, 38, 'exName === \'NS_ERROR_DOM_SECURITY_ERR\'');
function visit87_43_1(result) {
  _$jscoverage['/css-onload.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/css-onload.js'].branchData['33'][1].init(73, 8, 'cssRules');
function visit86_33_1(result) {
  _$jscoverage['/css-onload.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/css-onload.js'].branchData['30'][1].init(280, 10, 'node.sheet');
function visit85_30_1(result) {
  _$jscoverage['/css-onload.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/css-onload.js'].branchData['26'][1].init(88, 10, 'node.sheet');
function visit84_26_1(result) {
  _$jscoverage['/css-onload.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/css-onload.js'].branchData['24'][1].init(37, 12, 'Utils.webkit');
function visit83_24_1(result) {
  _$jscoverage['/css-onload.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/css-onload.js'].branchData['16'][1].init(13, 6, '!timer');
function visit82_16_1(result) {
  _$jscoverage['/css-onload.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/css-onload.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/css-onload.js'].functionData[0]++;
  _$jscoverage['/css-onload.js'].lineData[7]++;
  var logger = S.getLogger('s/loader/getScript');
  _$jscoverage['/css-onload.js'].lineData[8]++;
  var CSS_POLL_INTERVAL = 30, Utils = S.Loader.Utils, timer = 0, monitors = {};
  _$jscoverage['/css-onload.js'].lineData[15]++;
  function startCssTimer() {
    _$jscoverage['/css-onload.js'].functionData[1]++;
    _$jscoverage['/css-onload.js'].lineData[16]++;
    if (visit82_16_1(!timer)) {
      _$jscoverage['/css-onload.js'].lineData[17]++;
      logger.debug('start css poll timer');
      _$jscoverage['/css-onload.js'].lineData[18]++;
      cssPoll();
    }
  }
  _$jscoverage['/css-onload.js'].lineData[22]++;
  function isCssLoaded(node, url) {
    _$jscoverage['/css-onload.js'].functionData[2]++;
    _$jscoverage['/css-onload.js'].lineData[23]++;
    var loaded = 0;
    _$jscoverage['/css-onload.js'].lineData[24]++;
    if (visit83_24_1(Utils.webkit)) {
      _$jscoverage['/css-onload.js'].lineData[26]++;
      if (visit84_26_1(node.sheet)) {
        _$jscoverage['/css-onload.js'].lineData[27]++;
        logger.debug('webkit css poll loaded: ' + url);
        _$jscoverage['/css-onload.js'].lineData[28]++;
        loaded = 1;
      }
    } else {
      _$jscoverage['/css-onload.js'].lineData[30]++;
      if (visit85_30_1(node.sheet)) {
        _$jscoverage['/css-onload.js'].lineData[31]++;
        try {
          _$jscoverage['/css-onload.js'].lineData[32]++;
          var cssRules = node.sheet.cssRules;
          _$jscoverage['/css-onload.js'].lineData[33]++;
          if (visit86_33_1(cssRules)) {
            _$jscoverage['/css-onload.js'].lineData[34]++;
            logger.debug('same domain css poll loaded: ' + url);
            _$jscoverage['/css-onload.js'].lineData[35]++;
            loaded = 1;
          }
        }        catch (ex) {
  _$jscoverage['/css-onload.js'].lineData[38]++;
  var exName = ex.name;
  _$jscoverage['/css-onload.js'].lineData[39]++;
  logger.debug('css poll exception: ' + exName + ' ' + ex.code + ' ' + url);
  _$jscoverage['/css-onload.js'].lineData[41]++;
  if (visit87_43_1(exName === 'NS_ERROR_DOM_SECURITY_ERR')) {
    _$jscoverage['/css-onload.js'].lineData[44]++;
    logger.debug('css poll exception: ' + exName + 'loaded : ' + url);
    _$jscoverage['/css-onload.js'].lineData[45]++;
    loaded = 1;
  }
}
      }
    }
    _$jscoverage['/css-onload.js'].lineData[49]++;
    return loaded;
  }
  _$jscoverage['/css-onload.js'].lineData[53]++;
  function cssPoll() {
    _$jscoverage['/css-onload.js'].functionData[3]++;
    _$jscoverage['/css-onload.js'].lineData[54]++;
    for (var url in monitors) {
      _$jscoverage['/css-onload.js'].lineData[55]++;
      var callbackObj = monitors[url], node = callbackObj.node;
      _$jscoverage['/css-onload.js'].lineData[57]++;
      if (visit88_57_1(isCssLoaded(node, url))) {
        _$jscoverage['/css-onload.js'].lineData[58]++;
        if (visit89_58_1(callbackObj.callback)) {
          _$jscoverage['/css-onload.js'].lineData[59]++;
          callbackObj.callback.call(node);
        }
        _$jscoverage['/css-onload.js'].lineData[61]++;
        delete monitors[url];
      }
    }
    _$jscoverage['/css-onload.js'].lineData[65]++;
    if (visit90_65_1(S.isEmptyObject(monitors))) {
      _$jscoverage['/css-onload.js'].lineData[66]++;
      logger.debug('clear css poll timer');
      _$jscoverage['/css-onload.js'].lineData[67]++;
      timer = 0;
    } else {
      _$jscoverage['/css-onload.js'].lineData[69]++;
      timer = setTimeout(cssPoll, CSS_POLL_INTERVAL);
    }
  }
  _$jscoverage['/css-onload.js'].lineData[75]++;
  Utils.pollCss = function(node, callback) {
  _$jscoverage['/css-onload.js'].functionData[4]++;
  _$jscoverage['/css-onload.js'].lineData[76]++;
  var href = node.href, arr;
  _$jscoverage['/css-onload.js'].lineData[78]++;
  arr = monitors[href] = {};
  _$jscoverage['/css-onload.js'].lineData[79]++;
  arr.node = node;
  _$jscoverage['/css-onload.js'].lineData[80]++;
  arr.callback = callback;
  _$jscoverage['/css-onload.js'].lineData[81]++;
  startCssTimer();
};
  _$jscoverage['/css-onload.js'].lineData[84]++;
  Utils.isCssLoaded = isCssLoaded;
})(KISSY);
