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
if (! _$jscoverage['/features.js']) {
  _$jscoverage['/features.js'] = {};
  _$jscoverage['/features.js'].lineData = [];
  _$jscoverage['/features.js'].lineData[6] = 0;
  _$jscoverage['/features.js'].lineData[7] = 0;
  _$jscoverage['/features.js'].lineData[34] = 0;
  _$jscoverage['/features.js'].lineData[36] = 0;
  _$jscoverage['/features.js'].lineData[37] = 0;
  _$jscoverage['/features.js'].lineData[39] = 0;
  _$jscoverage['/features.js'].lineData[40] = 0;
  _$jscoverage['/features.js'].lineData[41] = 0;
  _$jscoverage['/features.js'].lineData[42] = 0;
  _$jscoverage['/features.js'].lineData[43] = 0;
  _$jscoverage['/features.js'].lineData[47] = 0;
  _$jscoverage['/features.js'].lineData[48] = 0;
  _$jscoverage['/features.js'].lineData[49] = 0;
  _$jscoverage['/features.js'].lineData[52] = 0;
  _$jscoverage['/features.js'].lineData[53] = 0;
  _$jscoverage['/features.js'].lineData[58] = 0;
  _$jscoverage['/features.js'].lineData[62] = 0;
  _$jscoverage['/features.js'].lineData[63] = 0;
  _$jscoverage['/features.js'].lineData[64] = 0;
  _$jscoverage['/features.js'].lineData[65] = 0;
  _$jscoverage['/features.js'].lineData[72] = 0;
  _$jscoverage['/features.js'].lineData[77] = 0;
  _$jscoverage['/features.js'].lineData[86] = 0;
  _$jscoverage['/features.js'].lineData[94] = 0;
  _$jscoverage['/features.js'].lineData[103] = 0;
  _$jscoverage['/features.js'].lineData[111] = 0;
  _$jscoverage['/features.js'].lineData[115] = 0;
  _$jscoverage['/features.js'].lineData[123] = 0;
  _$jscoverage['/features.js'].lineData[134] = 0;
  _$jscoverage['/features.js'].lineData[138] = 0;
  _$jscoverage['/features.js'].lineData[146] = 0;
  _$jscoverage['/features.js'].lineData[147] = 0;
  _$jscoverage['/features.js'].lineData[149] = 0;
  _$jscoverage['/features.js'].lineData[150] = 0;
  _$jscoverage['/features.js'].lineData[155] = 0;
  _$jscoverage['/features.js'].lineData[156] = 0;
  _$jscoverage['/features.js'].lineData[157] = 0;
  _$jscoverage['/features.js'].lineData[158] = 0;
  _$jscoverage['/features.js'].lineData[159] = 0;
  _$jscoverage['/features.js'].lineData[160] = 0;
  _$jscoverage['/features.js'].lineData[161] = 0;
  _$jscoverage['/features.js'].lineData[162] = 0;
  _$jscoverage['/features.js'].lineData[165] = 0;
  _$jscoverage['/features.js'].lineData[173] = 0;
  _$jscoverage['/features.js'].lineData[182] = 0;
  _$jscoverage['/features.js'].lineData[186] = 0;
  _$jscoverage['/features.js'].lineData[190] = 0;
}
if (! _$jscoverage['/features.js'].functionData) {
  _$jscoverage['/features.js'].functionData = [];
  _$jscoverage['/features.js'].functionData[0] = 0;
  _$jscoverage['/features.js'].functionData[1] = 0;
  _$jscoverage['/features.js'].functionData[2] = 0;
  _$jscoverage['/features.js'].functionData[3] = 0;
  _$jscoverage['/features.js'].functionData[4] = 0;
  _$jscoverage['/features.js'].functionData[5] = 0;
  _$jscoverage['/features.js'].functionData[6] = 0;
  _$jscoverage['/features.js'].functionData[7] = 0;
  _$jscoverage['/features.js'].functionData[8] = 0;
  _$jscoverage['/features.js'].functionData[9] = 0;
  _$jscoverage['/features.js'].functionData[10] = 0;
  _$jscoverage['/features.js'].functionData[11] = 0;
  _$jscoverage['/features.js'].functionData[12] = 0;
  _$jscoverage['/features.js'].functionData[13] = 0;
}
if (! _$jscoverage['/features.js'].branchData) {
  _$jscoverage['/features.js'].branchData = {};
  _$jscoverage['/features.js'].branchData['18'] = [];
  _$jscoverage['/features.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['24'] = [];
  _$jscoverage['/features.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['30'] = [];
  _$jscoverage['/features.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['34'] = [];
  _$jscoverage['/features.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['36'] = [];
  _$jscoverage['/features.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['36'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['41'] = [];
  _$jscoverage['/features.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['48'] = [];
  _$jscoverage['/features.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['52'] = [];
  _$jscoverage['/features.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['64'] = [];
  _$jscoverage['/features.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['72'] = [];
  _$jscoverage['/features.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['115'] = [];
  _$jscoverage['/features.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['115'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['134'] = [];
  _$jscoverage['/features.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['134'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['134'][3] = new BranchData();
  _$jscoverage['/features.js'].branchData['138'] = [];
  _$jscoverage['/features.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['138'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['138'][3] = new BranchData();
  _$jscoverage['/features.js'].branchData['138'][4] = new BranchData();
  _$jscoverage['/features.js'].branchData['146'] = [];
  _$jscoverage['/features.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['149'] = [];
  _$jscoverage['/features.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['149'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['160'] = [];
  _$jscoverage['/features.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['162'] = [];
  _$jscoverage['/features.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['162'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['162'][3] = new BranchData();
  _$jscoverage['/features.js'].branchData['162'][4] = new BranchData();
  _$jscoverage['/features.js'].branchData['162'][5] = new BranchData();
  _$jscoverage['/features.js'].branchData['182'] = [];
  _$jscoverage['/features.js'].branchData['182'][1] = new BranchData();
}
_$jscoverage['/features.js'].branchData['182'][1].init(67, 61, '!Config.simulateCss3Selector && isQuerySelectorSupportedState');
function visit39_182_1(result) {
  _$jscoverage['/features.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['162'][5].init(769, 16, 'has3d !== \'none\'');
function visit38_162_5(result) {
  _$jscoverage['/features.js'].branchData['162'][5].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['162'][4].init(749, 16, 'has3d.length > 0');
function visit37_162_4(result) {
  _$jscoverage['/features.js'].branchData['162'][4].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['162'][3].init(749, 36, 'has3d.length > 0 && has3d !== \'none\'');
function visit36_162_3(result) {
  _$jscoverage['/features.js'].branchData['162'][3].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['162'][2].init(726, 19, 'has3d !== undefined');
function visit35_162_2(result) {
  _$jscoverage['/features.js'].branchData['162'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['162'][1].init(726, 59, 'has3d !== undefined && has3d.length > 0 && has3d !== \'none\'');
function visit34_162_1(result) {
  _$jscoverage['/features.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['160'][1].init(548, 85, 'computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty]');
function visit33_160_1(result) {
  _$jscoverage['/features.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['149'][2].init(154, 43, 'getVendorInfo(\'transform\').prefix === false');
function visit32_149_2(result) {
  _$jscoverage['/features.js'].branchData['149'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['149'][1].init(134, 63, '!documentElement || getVendorInfo(\'transform\').prefix === false');
function visit31_149_1(result) {
  _$jscoverage['/features.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['146'][1].init(17, 36, 'isTransform3dSupported !== undefined');
function visit30_146_1(result) {
  _$jscoverage['/features.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['138'][4].init(80, 6, 'ie > 9');
function visit29_138_4(result) {
  _$jscoverage['/features.js'].branchData['138'][4].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['138'][3].init(73, 13, '!ie || ie > 9');
function visit28_138_3(result) {
  _$jscoverage['/features.js'].branchData['138'][3].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['138'][2].init(51, 36, '(\'oninput\' in win) && (!ie || ie > 9)');
function visit27_138_2(result) {
  _$jscoverage['/features.js'].branchData['138'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['138'][1].init(20, 67, '!Config.simulateInputEvent && (\'oninput\' in win) && (!ie || ie > 9)');
function visit26_138_1(result) {
  _$jscoverage['/features.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['134'][3].init(192, 6, 'ie > 7');
function visit25_134_3(result) {
  _$jscoverage['/features.js'].branchData['134'][3].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['134'][2].init(185, 13, '!ie || ie > 7');
function visit24_134_2(result) {
  _$jscoverage['/features.js'].branchData['134'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['134'][1].init(158, 41, '(\'onhashchange\' in win) && (!ie || ie > 7)');
function visit23_134_1(result) {
  _$jscoverage['/features.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['115'][2].init(50, 42, 'isPointerSupported || isMsPointerSupported');
function visit22_115_2(result) {
  _$jscoverage['/features.js'].branchData['115'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['115'][1].init(20, 72, 'isTouchEventSupportedState || isPointerSupported || isMsPointerSupported');
function visit21_115_1(result) {
  _$jscoverage['/features.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['72'][1].init(502, 94, 'vendorInfos[name] || {\n  name: name, \n  prefix: false}');
function visit20_72_1(result) {
  _$jscoverage['/features.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['64'][1].init(79, 34, 'vendorName in documentElementStyle');
function visit19_64_1(result) {
  _$jscoverage['/features.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['52'][1].init(147, 53, '!documentElementStyle || name in documentElementStyle');
function visit18_52_1(result) {
  _$jscoverage['/features.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['48'][1].init(13, 17, 'vendorInfos[name]');
function visit17_48_1(result) {
  _$jscoverage['/features.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['41'][1].init(282, 19, 'win.navigator || {}');
function visit16_41_1(result) {
  _$jscoverage['/features.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['36'][2].init(68, 8, 'ie !== 8');
function visit15_36_2(result) {
  _$jscoverage['/features.js'].branchData['36'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['36'][1].init(35, 41, 'documentElement.querySelector && ie !== 8');
function visit14_36_1(result) {
  _$jscoverage['/features.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['34'][1].init(795, 15, 'documentElement');
function visit13_34_1(result) {
  _$jscoverage['/features.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['30'][1].init(687, 41, '(\'ontouchstart\' in doc) && !(UA.phantomjs)');
function visit12_30_1(result) {
  _$jscoverage['/features.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['24'][1].init(403, 26, 'doc && doc.documentElement');
function visit11_24_1(result) {
  _$jscoverage['/features.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['18'][1].init(241, 18, 'win.document || {}');
function visit10_18_1(result) {
  _$jscoverage['/features.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/features.js'].functionData[0]++;
  _$jscoverage['/features.js'].lineData[7]++;
  var win = S.Env.host, Config = S.Config, UA = S.UA, VENDORS = ['Webkit', 'Moz', 'O', 'ms'], doc = visit10_18_1(win.document || {}), isMsPointerSupported, isPointerSupported, isTransform3dSupported, documentElement = visit11_24_1(doc && doc.documentElement), navigator, documentElementStyle, isClassListSupportedState = true, isQuerySelectorSupportedState = false, isTouchEventSupportedState = visit12_30_1(('ontouchstart' in doc) && !(UA.phantomjs)), vendorInfos = {}, ie = UA.ieMode;
  _$jscoverage['/features.js'].lineData[34]++;
  if (visit13_34_1(documentElement)) {
    _$jscoverage['/features.js'].lineData[36]++;
    if (visit14_36_1(documentElement.querySelector && visit15_36_2(ie !== 8))) {
      _$jscoverage['/features.js'].lineData[37]++;
      isQuerySelectorSupportedState = true;
    }
    _$jscoverage['/features.js'].lineData[39]++;
    documentElementStyle = documentElement.style;
    _$jscoverage['/features.js'].lineData[40]++;
    isClassListSupportedState = 'classList' in documentElement;
    _$jscoverage['/features.js'].lineData[41]++;
    navigator = visit16_41_1(win.navigator || {});
    _$jscoverage['/features.js'].lineData[42]++;
    isMsPointerSupported = 'msPointerEnabled' in navigator;
    _$jscoverage['/features.js'].lineData[43]++;
    isPointerSupported = 'pointerEnabled' in navigator;
  }
  _$jscoverage['/features.js'].lineData[47]++;
  function getVendorInfo(name) {
    _$jscoverage['/features.js'].functionData[1]++;
    _$jscoverage['/features.js'].lineData[48]++;
    if (visit17_48_1(vendorInfos[name])) {
      _$jscoverage['/features.js'].lineData[49]++;
      return vendorInfos[name];
    }
    _$jscoverage['/features.js'].lineData[52]++;
    if (visit18_52_1(!documentElementStyle || name in documentElementStyle)) {
      _$jscoverage['/features.js'].lineData[53]++;
      vendorInfos[name] = {
  name: name, 
  prefix: ''};
    } else {
      _$jscoverage['/features.js'].lineData[58]++;
      var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1), vendorName, i = VENDORS.length;
      _$jscoverage['/features.js'].lineData[62]++;
      while (i--) {
        _$jscoverage['/features.js'].lineData[63]++;
        vendorName = VENDORS[i] + upperFirstName;
        _$jscoverage['/features.js'].lineData[64]++;
        if (visit19_64_1(vendorName in documentElementStyle)) {
          _$jscoverage['/features.js'].lineData[65]++;
          vendorInfos[name] = {
  name: vendorName, 
  prefix: VENDORS[i]};
        }
      }
      _$jscoverage['/features.js'].lineData[72]++;
      vendorInfos[name] = visit20_72_1(vendorInfos[name] || {
  name: name, 
  prefix: false});
    }
    _$jscoverage['/features.js'].lineData[77]++;
    return vendorInfos[name];
  }
  _$jscoverage['/features.js'].lineData[86]++;
  S.Features = {
  isMsPointerSupported: function() {
  _$jscoverage['/features.js'].functionData[2]++;
  _$jscoverage['/features.js'].lineData[94]++;
  return isMsPointerSupported;
}, 
  isPointerSupported: function() {
  _$jscoverage['/features.js'].functionData[3]++;
  _$jscoverage['/features.js'].lineData[103]++;
  return isPointerSupported;
}, 
  isTouchEventSupported: function() {
  _$jscoverage['/features.js'].functionData[4]++;
  _$jscoverage['/features.js'].lineData[111]++;
  return isTouchEventSupportedState;
}, 
  isTouchGestureSupported: function() {
  _$jscoverage['/features.js'].functionData[5]++;
  _$jscoverage['/features.js'].lineData[115]++;
  return visit21_115_1(isTouchEventSupportedState || visit22_115_2(isPointerSupported || isMsPointerSupported));
}, 
  isDeviceMotionSupported: function() {
  _$jscoverage['/features.js'].functionData[6]++;
  _$jscoverage['/features.js'].lineData[123]++;
  return !!win.DeviceMotionEvent;
}, 
  isHashChangeSupported: function() {
  _$jscoverage['/features.js'].functionData[7]++;
  _$jscoverage['/features.js'].lineData[134]++;
  return visit23_134_1(('onhashchange' in win) && (visit24_134_2(!ie || visit25_134_3(ie > 7))));
}, 
  isInputEventSupported: function() {
  _$jscoverage['/features.js'].functionData[8]++;
  _$jscoverage['/features.js'].lineData[138]++;
  return visit26_138_1(!Config.simulateInputEvent && visit27_138_2(('oninput' in win) && (visit28_138_3(!ie || visit29_138_4(ie > 9)))));
}, 
  isTransform3dSupported: function() {
  _$jscoverage['/features.js'].functionData[9]++;
  _$jscoverage['/features.js'].lineData[146]++;
  if (visit30_146_1(isTransform3dSupported !== undefined)) {
    _$jscoverage['/features.js'].lineData[147]++;
    return isTransform3dSupported;
  }
  _$jscoverage['/features.js'].lineData[149]++;
  if (visit31_149_1(!documentElement || visit32_149_2(getVendorInfo('transform').prefix === false))) {
    _$jscoverage['/features.js'].lineData[150]++;
    isTransform3dSupported = false;
  } else {
    _$jscoverage['/features.js'].lineData[155]++;
    var el = doc.createElement('p');
    _$jscoverage['/features.js'].lineData[156]++;
    var transformProperty = getVendorInfo('transform').name;
    _$jscoverage['/features.js'].lineData[157]++;
    documentElement.insertBefore(el, documentElement.firstChild);
    _$jscoverage['/features.js'].lineData[158]++;
    el.style[transformProperty] = 'translate3d(1px,1px,1px)';
    _$jscoverage['/features.js'].lineData[159]++;
    var computedStyle = win.getComputedStyle(el);
    _$jscoverage['/features.js'].lineData[160]++;
    var has3d = visit33_160_1(computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty]);
    _$jscoverage['/features.js'].lineData[161]++;
    documentElement.removeChild(el);
    _$jscoverage['/features.js'].lineData[162]++;
    isTransform3dSupported = (visit34_162_1(visit35_162_2(has3d !== undefined) && visit36_162_3(visit37_162_4(has3d.length > 0) && visit38_162_5(has3d !== 'none'))));
  }
  _$jscoverage['/features.js'].lineData[165]++;
  return isTransform3dSupported;
}, 
  isClassListSupported: function() {
  _$jscoverage['/features.js'].functionData[10]++;
  _$jscoverage['/features.js'].lineData[173]++;
  return isClassListSupportedState;
}, 
  isQuerySelectorSupported: function() {
  _$jscoverage['/features.js'].functionData[11]++;
  _$jscoverage['/features.js'].lineData[182]++;
  return visit39_182_1(!Config.simulateCss3Selector && isQuerySelectorSupportedState);
}, 
  getVendorCssPropPrefix: function(name) {
  _$jscoverage['/features.js'].functionData[12]++;
  _$jscoverage['/features.js'].lineData[186]++;
  return getVendorInfo(name).prefix;
}, 
  getVendorCssPropName: function(name) {
  _$jscoverage['/features.js'].functionData[13]++;
  _$jscoverage['/features.js'].lineData[190]++;
  return getVendorInfo(name).name;
}};
})(KISSY);
