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
if (! _$jscoverage['/feature.js']) {
  _$jscoverage['/feature.js'] = {};
  _$jscoverage['/feature.js'].lineData = [];
  _$jscoverage['/feature.js'].lineData[6] = 0;
  _$jscoverage['/feature.js'].lineData[7] = 0;
  _$jscoverage['/feature.js'].lineData[34] = 0;
  _$jscoverage['/feature.js'].lineData[36] = 0;
  _$jscoverage['/feature.js'].lineData[37] = 0;
  _$jscoverage['/feature.js'].lineData[39] = 0;
  _$jscoverage['/feature.js'].lineData[40] = 0;
  _$jscoverage['/feature.js'].lineData[41] = 0;
  _$jscoverage['/feature.js'].lineData[42] = 0;
  _$jscoverage['/feature.js'].lineData[43] = 0;
  _$jscoverage['/feature.js'].lineData[47] = 0;
  _$jscoverage['/feature.js'].lineData[48] = 0;
  _$jscoverage['/feature.js'].lineData[49] = 0;
  _$jscoverage['/feature.js'].lineData[52] = 0;
  _$jscoverage['/feature.js'].lineData[53] = 0;
  _$jscoverage['/feature.js'].lineData[58] = 0;
  _$jscoverage['/feature.js'].lineData[62] = 0;
  _$jscoverage['/feature.js'].lineData[63] = 0;
  _$jscoverage['/feature.js'].lineData[64] = 0;
  _$jscoverage['/feature.js'].lineData[65] = 0;
  _$jscoverage['/feature.js'].lineData[72] = 0;
  _$jscoverage['/feature.js'].lineData[77] = 0;
  _$jscoverage['/feature.js'].lineData[86] = 0;
  _$jscoverage['/feature.js'].lineData[94] = 0;
  _$jscoverage['/feature.js'].lineData[103] = 0;
  _$jscoverage['/feature.js'].lineData[111] = 0;
  _$jscoverage['/feature.js'].lineData[115] = 0;
  _$jscoverage['/feature.js'].lineData[123] = 0;
  _$jscoverage['/feature.js'].lineData[134] = 0;
  _$jscoverage['/feature.js'].lineData[138] = 0;
  _$jscoverage['/feature.js'].lineData[146] = 0;
  _$jscoverage['/feature.js'].lineData[147] = 0;
  _$jscoverage['/feature.js'].lineData[149] = 0;
  _$jscoverage['/feature.js'].lineData[150] = 0;
  _$jscoverage['/feature.js'].lineData[155] = 0;
  _$jscoverage['/feature.js'].lineData[156] = 0;
  _$jscoverage['/feature.js'].lineData[157] = 0;
  _$jscoverage['/feature.js'].lineData[158] = 0;
  _$jscoverage['/feature.js'].lineData[159] = 0;
  _$jscoverage['/feature.js'].lineData[160] = 0;
  _$jscoverage['/feature.js'].lineData[161] = 0;
  _$jscoverage['/feature.js'].lineData[162] = 0;
  _$jscoverage['/feature.js'].lineData[165] = 0;
  _$jscoverage['/feature.js'].lineData[173] = 0;
  _$jscoverage['/feature.js'].lineData[182] = 0;
  _$jscoverage['/feature.js'].lineData[186] = 0;
  _$jscoverage['/feature.js'].lineData[190] = 0;
  _$jscoverage['/feature.js'].lineData[194] = 0;
}
if (! _$jscoverage['/feature.js'].functionData) {
  _$jscoverage['/feature.js'].functionData = [];
  _$jscoverage['/feature.js'].functionData[0] = 0;
  _$jscoverage['/feature.js'].functionData[1] = 0;
  _$jscoverage['/feature.js'].functionData[2] = 0;
  _$jscoverage['/feature.js'].functionData[3] = 0;
  _$jscoverage['/feature.js'].functionData[4] = 0;
  _$jscoverage['/feature.js'].functionData[5] = 0;
  _$jscoverage['/feature.js'].functionData[6] = 0;
  _$jscoverage['/feature.js'].functionData[7] = 0;
  _$jscoverage['/feature.js'].functionData[8] = 0;
  _$jscoverage['/feature.js'].functionData[9] = 0;
  _$jscoverage['/feature.js'].functionData[10] = 0;
  _$jscoverage['/feature.js'].functionData[11] = 0;
  _$jscoverage['/feature.js'].functionData[12] = 0;
  _$jscoverage['/feature.js'].functionData[13] = 0;
}
if (! _$jscoverage['/feature.js'].branchData) {
  _$jscoverage['/feature.js'].branchData = {};
  _$jscoverage['/feature.js'].branchData['18'] = [];
  _$jscoverage['/feature.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['24'] = [];
  _$jscoverage['/feature.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['30'] = [];
  _$jscoverage['/feature.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['34'] = [];
  _$jscoverage['/feature.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['36'] = [];
  _$jscoverage['/feature.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['36'][2] = new BranchData();
  _$jscoverage['/feature.js'].branchData['41'] = [];
  _$jscoverage['/feature.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['48'] = [];
  _$jscoverage['/feature.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['52'] = [];
  _$jscoverage['/feature.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['64'] = [];
  _$jscoverage['/feature.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['72'] = [];
  _$jscoverage['/feature.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['115'] = [];
  _$jscoverage['/feature.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['115'][2] = new BranchData();
  _$jscoverage['/feature.js'].branchData['134'] = [];
  _$jscoverage['/feature.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['134'][2] = new BranchData();
  _$jscoverage['/feature.js'].branchData['134'][3] = new BranchData();
  _$jscoverage['/feature.js'].branchData['138'] = [];
  _$jscoverage['/feature.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['138'][2] = new BranchData();
  _$jscoverage['/feature.js'].branchData['138'][3] = new BranchData();
  _$jscoverage['/feature.js'].branchData['138'][4] = new BranchData();
  _$jscoverage['/feature.js'].branchData['146'] = [];
  _$jscoverage['/feature.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['149'] = [];
  _$jscoverage['/feature.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['149'][2] = new BranchData();
  _$jscoverage['/feature.js'].branchData['160'] = [];
  _$jscoverage['/feature.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['162'] = [];
  _$jscoverage['/feature.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['162'][2] = new BranchData();
  _$jscoverage['/feature.js'].branchData['162'][3] = new BranchData();
  _$jscoverage['/feature.js'].branchData['162'][4] = new BranchData();
  _$jscoverage['/feature.js'].branchData['162'][5] = new BranchData();
  _$jscoverage['/feature.js'].branchData['182'] = [];
  _$jscoverage['/feature.js'].branchData['182'][1] = new BranchData();
}
_$jscoverage['/feature.js'].branchData['182'][1].init(67, 61, '!Config.simulateCss3Selector && isQuerySelectorSupportedState');
function visit30_182_1(result) {
  _$jscoverage['/feature.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['162'][5].init(769, 16, 'has3d !== \'none\'');
function visit29_162_5(result) {
  _$jscoverage['/feature.js'].branchData['162'][5].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['162'][4].init(749, 16, 'has3d.length > 0');
function visit28_162_4(result) {
  _$jscoverage['/feature.js'].branchData['162'][4].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['162'][3].init(749, 36, 'has3d.length > 0 && has3d !== \'none\'');
function visit27_162_3(result) {
  _$jscoverage['/feature.js'].branchData['162'][3].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['162'][2].init(726, 19, 'has3d !== undefined');
function visit26_162_2(result) {
  _$jscoverage['/feature.js'].branchData['162'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['162'][1].init(726, 59, 'has3d !== undefined && has3d.length > 0 && has3d !== \'none\'');
function visit25_162_1(result) {
  _$jscoverage['/feature.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['160'][1].init(548, 85, 'computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty]');
function visit24_160_1(result) {
  _$jscoverage['/feature.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['149'][2].init(154, 43, 'getVendorInfo(\'transform\').prefix === false');
function visit23_149_2(result) {
  _$jscoverage['/feature.js'].branchData['149'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['149'][1].init(134, 63, '!documentElement || getVendorInfo(\'transform\').prefix === false');
function visit22_149_1(result) {
  _$jscoverage['/feature.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['146'][1].init(17, 36, 'isTransform3dSupported !== undefined');
function visit21_146_1(result) {
  _$jscoverage['/feature.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['138'][4].init(80, 6, 'ie > 9');
function visit20_138_4(result) {
  _$jscoverage['/feature.js'].branchData['138'][4].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['138'][3].init(73, 13, '!ie || ie > 9');
function visit19_138_3(result) {
  _$jscoverage['/feature.js'].branchData['138'][3].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['138'][2].init(51, 36, '(\'oninput\' in win) && (!ie || ie > 9)');
function visit18_138_2(result) {
  _$jscoverage['/feature.js'].branchData['138'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['138'][1].init(20, 67, '!Config.simulateInputEvent && (\'oninput\' in win) && (!ie || ie > 9)');
function visit17_138_1(result) {
  _$jscoverage['/feature.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['134'][3].init(192, 6, 'ie > 7');
function visit16_134_3(result) {
  _$jscoverage['/feature.js'].branchData['134'][3].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['134'][2].init(185, 13, '!ie || ie > 7');
function visit15_134_2(result) {
  _$jscoverage['/feature.js'].branchData['134'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['134'][1].init(158, 41, '(\'onhashchange\' in win) && (!ie || ie > 7)');
function visit14_134_1(result) {
  _$jscoverage['/feature.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['115'][2].init(50, 42, 'isPointerSupported || isMsPointerSupported');
function visit13_115_2(result) {
  _$jscoverage['/feature.js'].branchData['115'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['115'][1].init(20, 72, 'isTouchEventSupportedState || isPointerSupported || isMsPointerSupported');
function visit12_115_1(result) {
  _$jscoverage['/feature.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['72'][1].init(502, 94, 'vendorInfos[name] || {\n  name: name, \n  prefix: false}');
function visit11_72_1(result) {
  _$jscoverage['/feature.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['64'][1].init(79, 34, 'vendorName in documentElementStyle');
function visit10_64_1(result) {
  _$jscoverage['/feature.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['52'][1].init(147, 53, '!documentElementStyle || name in documentElementStyle');
function visit9_52_1(result) {
  _$jscoverage['/feature.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['48'][1].init(13, 17, 'vendorInfos[name]');
function visit8_48_1(result) {
  _$jscoverage['/feature.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['41'][1].init(282, 19, 'win.navigator || {}');
function visit7_41_1(result) {
  _$jscoverage['/feature.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['36'][2].init(68, 8, 'ie !== 8');
function visit6_36_2(result) {
  _$jscoverage['/feature.js'].branchData['36'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['36'][1].init(35, 41, 'documentElement.querySelector && ie !== 8');
function visit5_36_1(result) {
  _$jscoverage['/feature.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['34'][1].init(804, 15, 'documentElement');
function visit4_34_1(result) {
  _$jscoverage['/feature.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['30'][1].init(696, 41, '(\'ontouchstart\' in doc) && !(UA.phantomjs)');
function visit3_30_1(result) {
  _$jscoverage['/feature.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['24'][1].init(412, 26, 'doc && doc.documentElement');
function visit2_24_1(result) {
  _$jscoverage['/feature.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['18'][1].init(250, 18, 'win.document || {}');
function visit1_18_1(result) {
  _$jscoverage['/feature.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/feature.js'].functionData[0]++;
  _$jscoverage['/feature.js'].lineData[7]++;
  var win = S.Env.host, Config = S.Config, UA = require('ua'), VENDORS = ['Webkit', 'Moz', 'O', 'ms'], doc = visit1_18_1(win.document || {}), isMsPointerSupported, isPointerSupported, isTransform3dSupported, documentElement = visit2_24_1(doc && doc.documentElement), navigator, documentElementStyle, isClassListSupportedState = true, isQuerySelectorSupportedState = false, isTouchEventSupportedState = visit3_30_1(('ontouchstart' in doc) && !(UA.phantomjs)), vendorInfos = {}, ie = UA.ieMode;
  _$jscoverage['/feature.js'].lineData[34]++;
  if (visit4_34_1(documentElement)) {
    _$jscoverage['/feature.js'].lineData[36]++;
    if (visit5_36_1(documentElement.querySelector && visit6_36_2(ie !== 8))) {
      _$jscoverage['/feature.js'].lineData[37]++;
      isQuerySelectorSupportedState = true;
    }
    _$jscoverage['/feature.js'].lineData[39]++;
    documentElementStyle = documentElement.style;
    _$jscoverage['/feature.js'].lineData[40]++;
    isClassListSupportedState = 'classList' in documentElement;
    _$jscoverage['/feature.js'].lineData[41]++;
    navigator = visit7_41_1(win.navigator || {});
    _$jscoverage['/feature.js'].lineData[42]++;
    isMsPointerSupported = 'msPointerEnabled' in navigator;
    _$jscoverage['/feature.js'].lineData[43]++;
    isPointerSupported = 'pointerEnabled' in navigator;
  }
  _$jscoverage['/feature.js'].lineData[47]++;
  function getVendorInfo(name) {
    _$jscoverage['/feature.js'].functionData[1]++;
    _$jscoverage['/feature.js'].lineData[48]++;
    if (visit8_48_1(vendorInfos[name])) {
      _$jscoverage['/feature.js'].lineData[49]++;
      return vendorInfos[name];
    }
    _$jscoverage['/feature.js'].lineData[52]++;
    if (visit9_52_1(!documentElementStyle || name in documentElementStyle)) {
      _$jscoverage['/feature.js'].lineData[53]++;
      vendorInfos[name] = {
  name: name, 
  prefix: ''};
    } else {
      _$jscoverage['/feature.js'].lineData[58]++;
      var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1), vendorName, i = VENDORS.length;
      _$jscoverage['/feature.js'].lineData[62]++;
      while (i--) {
        _$jscoverage['/feature.js'].lineData[63]++;
        vendorName = VENDORS[i] + upperFirstName;
        _$jscoverage['/feature.js'].lineData[64]++;
        if (visit10_64_1(vendorName in documentElementStyle)) {
          _$jscoverage['/feature.js'].lineData[65]++;
          vendorInfos[name] = {
  name: vendorName, 
  prefix: VENDORS[i]};
        }
      }
      _$jscoverage['/feature.js'].lineData[72]++;
      vendorInfos[name] = visit11_72_1(vendorInfos[name] || {
  name: name, 
  prefix: false});
    }
    _$jscoverage['/feature.js'].lineData[77]++;
    return vendorInfos[name];
  }
  _$jscoverage['/feature.js'].lineData[86]++;
  S.Feature = {
  isMsPointerSupported: function() {
  _$jscoverage['/feature.js'].functionData[2]++;
  _$jscoverage['/feature.js'].lineData[94]++;
  return isMsPointerSupported;
}, 
  isPointerSupported: function() {
  _$jscoverage['/feature.js'].functionData[3]++;
  _$jscoverage['/feature.js'].lineData[103]++;
  return isPointerSupported;
}, 
  isTouchEventSupported: function() {
  _$jscoverage['/feature.js'].functionData[4]++;
  _$jscoverage['/feature.js'].lineData[111]++;
  return isTouchEventSupportedState;
}, 
  isTouchGestureSupported: function() {
  _$jscoverage['/feature.js'].functionData[5]++;
  _$jscoverage['/feature.js'].lineData[115]++;
  return visit12_115_1(isTouchEventSupportedState || visit13_115_2(isPointerSupported || isMsPointerSupported));
}, 
  isDeviceMotionSupported: function() {
  _$jscoverage['/feature.js'].functionData[6]++;
  _$jscoverage['/feature.js'].lineData[123]++;
  return !!win.DeviceMotionEvent;
}, 
  isHashChangeSupported: function() {
  _$jscoverage['/feature.js'].functionData[7]++;
  _$jscoverage['/feature.js'].lineData[134]++;
  return visit14_134_1(('onhashchange' in win) && (visit15_134_2(!ie || visit16_134_3(ie > 7))));
}, 
  isInputEventSupported: function() {
  _$jscoverage['/feature.js'].functionData[8]++;
  _$jscoverage['/feature.js'].lineData[138]++;
  return visit17_138_1(!Config.simulateInputEvent && visit18_138_2(('oninput' in win) && (visit19_138_3(!ie || visit20_138_4(ie > 9)))));
}, 
  isTransform3dSupported: function() {
  _$jscoverage['/feature.js'].functionData[9]++;
  _$jscoverage['/feature.js'].lineData[146]++;
  if (visit21_146_1(isTransform3dSupported !== undefined)) {
    _$jscoverage['/feature.js'].lineData[147]++;
    return isTransform3dSupported;
  }
  _$jscoverage['/feature.js'].lineData[149]++;
  if (visit22_149_1(!documentElement || visit23_149_2(getVendorInfo('transform').prefix === false))) {
    _$jscoverage['/feature.js'].lineData[150]++;
    isTransform3dSupported = false;
  } else {
    _$jscoverage['/feature.js'].lineData[155]++;
    var el = doc.createElement('p');
    _$jscoverage['/feature.js'].lineData[156]++;
    var transformProperty = getVendorInfo('transform').name;
    _$jscoverage['/feature.js'].lineData[157]++;
    documentElement.insertBefore(el, documentElement.firstChild);
    _$jscoverage['/feature.js'].lineData[158]++;
    el.style[transformProperty] = 'translate3d(1px,1px,1px)';
    _$jscoverage['/feature.js'].lineData[159]++;
    var computedStyle = win.getComputedStyle(el);
    _$jscoverage['/feature.js'].lineData[160]++;
    var has3d = visit24_160_1(computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty]);
    _$jscoverage['/feature.js'].lineData[161]++;
    documentElement.removeChild(el);
    _$jscoverage['/feature.js'].lineData[162]++;
    isTransform3dSupported = (visit25_162_1(visit26_162_2(has3d !== undefined) && visit27_162_3(visit28_162_4(has3d.length > 0) && visit29_162_5(has3d !== 'none'))));
  }
  _$jscoverage['/feature.js'].lineData[165]++;
  return isTransform3dSupported;
}, 
  isClassListSupported: function() {
  _$jscoverage['/feature.js'].functionData[10]++;
  _$jscoverage['/feature.js'].lineData[173]++;
  return isClassListSupportedState;
}, 
  isQuerySelectorSupported: function() {
  _$jscoverage['/feature.js'].functionData[11]++;
  _$jscoverage['/feature.js'].lineData[182]++;
  return visit30_182_1(!Config.simulateCss3Selector && isQuerySelectorSupportedState);
}, 
  getVendorCssPropPrefix: function(name) {
  _$jscoverage['/feature.js'].functionData[12]++;
  _$jscoverage['/feature.js'].lineData[186]++;
  return getVendorInfo(name).prefix;
}, 
  getVendorCssPropName: function(name) {
  _$jscoverage['/feature.js'].functionData[13]++;
  _$jscoverage['/feature.js'].lineData[190]++;
  return getVendorInfo(name).name;
}};
  _$jscoverage['/feature.js'].lineData[194]++;
  return S.Feature;
});
