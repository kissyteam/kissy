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
  _$jscoverage['/loader/css-onload.js'].lineData[8] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[18] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[19] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[20] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[21] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[25] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[26] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[27] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[29] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[30] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[31] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[33] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[34] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[35] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[36] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[37] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[38] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[41] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[42] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[44] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[47] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[48] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[52] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[56] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[57] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[58] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[60] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[61] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[62] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[64] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[68] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[69] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[70] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[72] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[78] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[79] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[81] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[82] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[83] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[84] = 0;
  _$jscoverage['/loader/css-onload.js'].lineData[87] = 0;
}
if (! _$jscoverage['/loader/css-onload.js'].functionData) {
  _$jscoverage['/loader/css-onload.js'].functionData = [];
  _$jscoverage['/loader/css-onload.js'].functionData[0] = 0;
  _$jscoverage['/loader/css-onload.js'].functionData[1] = 0;
  _$jscoverage['/loader/css-onload.js'].functionData[2] = 0;
  _$jscoverage['/loader/css-onload.js'].functionData[3] = 0;
  _$jscoverage['/loader/css-onload.js'].functionData[4] = 0;
}
if (! _$jscoverage['/loader/css-onload.js'].branchData) {
  _$jscoverage['/loader/css-onload.js'].branchData = {};
  _$jscoverage['/loader/css-onload.js'].branchData['19'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['27'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['29'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['33'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['36'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['46'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['60'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['61'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/loader/css-onload.js'].branchData['68'] = [];
  _$jscoverage['/loader/css-onload.js'].branchData['68'][1] = new BranchData();
}
_$jscoverage['/loader/css-onload.js'].branchData['68'][1].init(355, 25, 'S.isEmptyObject(monitors)');
function visit385_68_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['61'][1].init(21, 20, 'callbackObj.callback');
function visit384_61_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['60'][1].init(103, 22, 'isCssLoaded(node, url)');
function visit383_60_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['46'][1].init(90, 37, 'exName == \'NS_ERROR_DOM_SECURITY_ERR\'');
function visit382_46_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['36'][1].init(76, 8, 'cssRules');
function visit381_36_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['33'][1].init(280, 13, 'node[\'sheet\']');
function visit380_33_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['29'][1].init(88, 13, 'node[\'sheet\']');
function visit379_29_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['27'][1].init(37, 9, 'UA.webkit');
function visit378_27_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].branchData['19'][1].init(13, 6, '!timer');
function visit377_19_1(result) {
  _$jscoverage['/loader/css-onload.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/css-onload.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/css-onload.js'].functionData[0]++;
  _$jscoverage['/loader/css-onload.js'].lineData[7]++;
  var logger = S.getLogger('s/loader/getScript');
  _$jscoverage['/loader/css-onload.js'].lineData[8]++;
  var CSS_POLL_INTERVAL = 30, UA = S.UA, Utils = S.Loader.Utils, timer = 0, monitors = {};
  _$jscoverage['/loader/css-onload.js'].lineData[18]++;
  function startCssTimer() {
    _$jscoverage['/loader/css-onload.js'].functionData[1]++;
    _$jscoverage['/loader/css-onload.js'].lineData[19]++;
    if (visit377_19_1(!timer)) {
      _$jscoverage['/loader/css-onload.js'].lineData[20]++;
      logger.debug('start css poll timer');
      _$jscoverage['/loader/css-onload.js'].lineData[21]++;
      cssPoll();
    }
  }
  _$jscoverage['/loader/css-onload.js'].lineData[25]++;
  function isCssLoaded(node, url) {
    _$jscoverage['/loader/css-onload.js'].functionData[2]++;
    _$jscoverage['/loader/css-onload.js'].lineData[26]++;
    var loaded = 0;
    _$jscoverage['/loader/css-onload.js'].lineData[27]++;
    if (visit378_27_1(UA.webkit)) {
      _$jscoverage['/loader/css-onload.js'].lineData[29]++;
      if (visit379_29_1(node['sheet'])) {
        _$jscoverage['/loader/css-onload.js'].lineData[30]++;
        logger.debug('webkit css poll loaded: ' + url);
        _$jscoverage['/loader/css-onload.js'].lineData[31]++;
        loaded = 1;
      }
    } else {
      _$jscoverage['/loader/css-onload.js'].lineData[33]++;
      if (visit380_33_1(node['sheet'])) {
        _$jscoverage['/loader/css-onload.js'].lineData[34]++;
        try {
          _$jscoverage['/loader/css-onload.js'].lineData[35]++;
          var cssRules = node['sheet'].cssRules;
          _$jscoverage['/loader/css-onload.js'].lineData[36]++;
          if (visit381_36_1(cssRules)) {
            _$jscoverage['/loader/css-onload.js'].lineData[37]++;
            logger.debug('same domain css poll loaded: ' + url);
            _$jscoverage['/loader/css-onload.js'].lineData[38]++;
            loaded = 1;
          }
        }        catch (ex) {
  _$jscoverage['/loader/css-onload.js'].lineData[41]++;
  var exName = ex.name;
  _$jscoverage['/loader/css-onload.js'].lineData[42]++;
  logger.debug('css poll exception: ' + exName + ' ' + ex.code + ' ' + url);
  _$jscoverage['/loader/css-onload.js'].lineData[44]++;
  if (visit382_46_1(exName == 'NS_ERROR_DOM_SECURITY_ERR')) {
    _$jscoverage['/loader/css-onload.js'].lineData[47]++;
    logger.debug('css poll exception: ' + exName + 'loaded : ' + url);
    _$jscoverage['/loader/css-onload.js'].lineData[48]++;
    loaded = 1;
  }
}
      }
    }
    _$jscoverage['/loader/css-onload.js'].lineData[52]++;
    return loaded;
  }
  _$jscoverage['/loader/css-onload.js'].lineData[56]++;
  function cssPoll() {
    _$jscoverage['/loader/css-onload.js'].functionData[3]++;
    _$jscoverage['/loader/css-onload.js'].lineData[57]++;
    for (var url in monitors) {
      _$jscoverage['/loader/css-onload.js'].lineData[58]++;
      var callbackObj = monitors[url], node = callbackObj.node;
      _$jscoverage['/loader/css-onload.js'].lineData[60]++;
      if (visit383_60_1(isCssLoaded(node, url))) {
        _$jscoverage['/loader/css-onload.js'].lineData[61]++;
        if (visit384_61_1(callbackObj.callback)) {
          _$jscoverage['/loader/css-onload.js'].lineData[62]++;
          callbackObj.callback.call(node);
        }
        _$jscoverage['/loader/css-onload.js'].lineData[64]++;
        delete monitors[url];
      }
    }
    _$jscoverage['/loader/css-onload.js'].lineData[68]++;
    if (visit385_68_1(S.isEmptyObject(monitors))) {
      _$jscoverage['/loader/css-onload.js'].lineData[69]++;
      logger.debug('clear css poll timer');
      _$jscoverage['/loader/css-onload.js'].lineData[70]++;
      timer = 0;
    } else {
      _$jscoverage['/loader/css-onload.js'].lineData[72]++;
      timer = setTimeout(cssPoll, CSS_POLL_INTERVAL);
    }
  }
  _$jscoverage['/loader/css-onload.js'].lineData[78]++;
  Utils.pollCss = function(node, callback) {
  _$jscoverage['/loader/css-onload.js'].functionData[4]++;
  _$jscoverage['/loader/css-onload.js'].lineData[79]++;
  var href = node.href, arr;
  _$jscoverage['/loader/css-onload.js'].lineData[81]++;
  arr = monitors[href] = {};
  _$jscoverage['/loader/css-onload.js'].lineData[82]++;
  arr.node = node;
  _$jscoverage['/loader/css-onload.js'].lineData[83]++;
  arr.callback = callback;
  _$jscoverage['/loader/css-onload.js'].lineData[84]++;
  startCssTimer();
};
  _$jscoverage['/loader/css-onload.js'].lineData[87]++;
  Utils.isCssLoaded = isCssLoaded;
})(KISSY);
