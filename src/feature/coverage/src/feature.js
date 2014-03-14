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
  _$jscoverage['/feature.js'].lineData[35] = 0;
  _$jscoverage['/feature.js'].lineData[37] = 0;
  _$jscoverage['/feature.js'].lineData[38] = 0;
  _$jscoverage['/feature.js'].lineData[40] = 0;
  _$jscoverage['/feature.js'].lineData[41] = 0;
  _$jscoverage['/feature.js'].lineData[42] = 0;
  _$jscoverage['/feature.js'].lineData[43] = 0;
  _$jscoverage['/feature.js'].lineData[44] = 0;
  _$jscoverage['/feature.js'].lineData[48] = 0;
  _$jscoverage['/feature.js'].lineData[49] = 0;
  _$jscoverage['/feature.js'].lineData[50] = 0;
  _$jscoverage['/feature.js'].lineData[52] = 0;
  _$jscoverage['/feature.js'].lineData[53] = 0;
  _$jscoverage['/feature.js'].lineData[56] = 0;
  _$jscoverage['/feature.js'].lineData[57] = 0;
  _$jscoverage['/feature.js'].lineData[62] = 0;
  _$jscoverage['/feature.js'].lineData[65] = 0;
  _$jscoverage['/feature.js'].lineData[66] = 0;
  _$jscoverage['/feature.js'].lineData[67] = 0;
  _$jscoverage['/feature.js'].lineData[68] = 0;
  _$jscoverage['/feature.js'].lineData[69] = 0;
  _$jscoverage['/feature.js'].lineData[76] = 0;
  _$jscoverage['/feature.js'].lineData[78] = 0;
  _$jscoverage['/feature.js'].lineData[87] = 0;
  _$jscoverage['/feature.js'].lineData[95] = 0;
  _$jscoverage['/feature.js'].lineData[104] = 0;
  _$jscoverage['/feature.js'].lineData[112] = 0;
  _$jscoverage['/feature.js'].lineData[116] = 0;
  _$jscoverage['/feature.js'].lineData[124] = 0;
  _$jscoverage['/feature.js'].lineData[135] = 0;
  _$jscoverage['/feature.js'].lineData[139] = 0;
  _$jscoverage['/feature.js'].lineData[147] = 0;
  _$jscoverage['/feature.js'].lineData[148] = 0;
  _$jscoverage['/feature.js'].lineData[150] = 0;
  _$jscoverage['/feature.js'].lineData[151] = 0;
  _$jscoverage['/feature.js'].lineData[156] = 0;
  _$jscoverage['/feature.js'].lineData[157] = 0;
  _$jscoverage['/feature.js'].lineData[158] = 0;
  _$jscoverage['/feature.js'].lineData[159] = 0;
  _$jscoverage['/feature.js'].lineData[160] = 0;
  _$jscoverage['/feature.js'].lineData[161] = 0;
  _$jscoverage['/feature.js'].lineData[162] = 0;
  _$jscoverage['/feature.js'].lineData[163] = 0;
  _$jscoverage['/feature.js'].lineData[166] = 0;
  _$jscoverage['/feature.js'].lineData[174] = 0;
  _$jscoverage['/feature.js'].lineData[183] = 0;
  _$jscoverage['/feature.js'].lineData[187] = 0;
  _$jscoverage['/feature.js'].lineData[191] = 0;
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
}
if (! _$jscoverage['/feature.js'].branchData) {
  _$jscoverage['/feature.js'].branchData = {};
  _$jscoverage['/feature.js'].branchData['19'] = [];
  _$jscoverage['/feature.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['25'] = [];
  _$jscoverage['/feature.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['31'] = [];
  _$jscoverage['/feature.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['35'] = [];
  _$jscoverage['/feature.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['37'] = [];
  _$jscoverage['/feature.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['37'][2] = new BranchData();
  _$jscoverage['/feature.js'].branchData['42'] = [];
  _$jscoverage['/feature.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['49'] = [];
  _$jscoverage['/feature.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['52'] = [];
  _$jscoverage['/feature.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['56'] = [];
  _$jscoverage['/feature.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['65'] = [];
  _$jscoverage['/feature.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['68'] = [];
  _$jscoverage['/feature.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['76'] = [];
  _$jscoverage['/feature.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['116'] = [];
  _$jscoverage['/feature.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['116'][2] = new BranchData();
  _$jscoverage['/feature.js'].branchData['135'] = [];
  _$jscoverage['/feature.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['135'][2] = new BranchData();
  _$jscoverage['/feature.js'].branchData['135'][3] = new BranchData();
  _$jscoverage['/feature.js'].branchData['139'] = [];
  _$jscoverage['/feature.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['139'][2] = new BranchData();
  _$jscoverage['/feature.js'].branchData['139'][3] = new BranchData();
  _$jscoverage['/feature.js'].branchData['139'][4] = new BranchData();
  _$jscoverage['/feature.js'].branchData['147'] = [];
  _$jscoverage['/feature.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['150'] = [];
  _$jscoverage['/feature.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['150'][2] = new BranchData();
  _$jscoverage['/feature.js'].branchData['161'] = [];
  _$jscoverage['/feature.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['163'] = [];
  _$jscoverage['/feature.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['163'][2] = new BranchData();
  _$jscoverage['/feature.js'].branchData['163'][3] = new BranchData();
  _$jscoverage['/feature.js'].branchData['163'][4] = new BranchData();
  _$jscoverage['/feature.js'].branchData['163'][5] = new BranchData();
  _$jscoverage['/feature.js'].branchData['183'] = [];
  _$jscoverage['/feature.js'].branchData['183'][1] = new BranchData();
}
_$jscoverage['/feature.js'].branchData['183'][1].init(67, 61, '!Config.simulateCss3Selector && isQuerySelectorSupportedState');
function visit32_183_1(result) {
  _$jscoverage['/feature.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['163'][5].init(769, 16, 'has3d !== \'none\'');
function visit31_163_5(result) {
  _$jscoverage['/feature.js'].branchData['163'][5].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['163'][4].init(749, 16, 'has3d.length > 0');
function visit30_163_4(result) {
  _$jscoverage['/feature.js'].branchData['163'][4].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['163'][3].init(749, 36, 'has3d.length > 0 && has3d !== \'none\'');
function visit29_163_3(result) {
  _$jscoverage['/feature.js'].branchData['163'][3].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['163'][2].init(726, 19, 'has3d !== undefined');
function visit28_163_2(result) {
  _$jscoverage['/feature.js'].branchData['163'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['163'][1].init(726, 59, 'has3d !== undefined && has3d.length > 0 && has3d !== \'none\'');
function visit27_163_1(result) {
  _$jscoverage['/feature.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['161'][1].init(548, 85, 'computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty]');
function visit26_161_1(result) {
  _$jscoverage['/feature.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['150'][2].init(154, 43, 'getVendorInfo(\'transform\').prefix === false');
function visit25_150_2(result) {
  _$jscoverage['/feature.js'].branchData['150'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['150'][1].init(134, 63, '!documentElement || getVendorInfo(\'transform\').prefix === false');
function visit24_150_1(result) {
  _$jscoverage['/feature.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['147'][1].init(17, 36, 'isTransform3dSupported !== undefined');
function visit23_147_1(result) {
  _$jscoverage['/feature.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['139'][4].init(80, 6, 'ie > 9');
function visit22_139_4(result) {
  _$jscoverage['/feature.js'].branchData['139'][4].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['139'][3].init(73, 13, '!ie || ie > 9');
function visit21_139_3(result) {
  _$jscoverage['/feature.js'].branchData['139'][3].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['139'][2].init(51, 36, '(\'oninput\' in win) && (!ie || ie > 9)');
function visit20_139_2(result) {
  _$jscoverage['/feature.js'].branchData['139'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['139'][1].init(20, 67, '!Config.simulateInputEvent && (\'oninput\' in win) && (!ie || ie > 9)');
function visit19_139_1(result) {
  _$jscoverage['/feature.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['135'][3].init(192, 6, 'ie > 7');
function visit18_135_3(result) {
  _$jscoverage['/feature.js'].branchData['135'][3].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['135'][2].init(185, 13, '!ie || ie > 7');
function visit17_135_2(result) {
  _$jscoverage['/feature.js'].branchData['135'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['135'][1].init(158, 41, '(\'onhashchange\' in win) && (!ie || ie > 7)');
function visit16_135_1(result) {
  _$jscoverage['/feature.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['116'][2].init(50, 42, 'isPointerSupported || isMsPointerSupported');
function visit15_116_2(result) {
  _$jscoverage['/feature.js'].branchData['116'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['116'][1].init(20, 72, 'isTouchEventSupportedState || isPointerSupported || isMsPointerSupported');
function visit14_116_1(result) {
  _$jscoverage['/feature.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['76'][1].init(601, 25, 'vendorInfos[name] || null');
function visit13_76_1(result) {
  _$jscoverage['/feature.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['68'][1].init(149, 34, 'vendorName in documentElementStyle');
function visit12_68_1(result) {
  _$jscoverage['/feature.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['65'][1].init(137, 26, 'i < propertyPrefixesLength');
function visit11_65_1(result) {
  _$jscoverage['/feature.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['56'][1].init(237, 53, '!documentElementStyle || name in documentElementStyle');
function visit10_56_1(result) {
  _$jscoverage['/feature.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['52'][1].init(101, 19, 'name in vendorInfos');
function visit9_52_1(result) {
  _$jscoverage['/feature.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['49'][1].init(13, 24, 'name.indexOf(\'-\') !== -1');
function visit8_49_1(result) {
  _$jscoverage['/feature.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['42'][1].init(282, 19, 'win.navigator || {}');
function visit7_42_1(result) {
  _$jscoverage['/feature.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['37'][2].init(68, 8, 'ie !== 8');
function visit6_37_2(result) {
  _$jscoverage['/feature.js'].branchData['37'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['37'][1].init(35, 41, 'documentElement.querySelector && ie !== 8');
function visit5_37_1(result) {
  _$jscoverage['/feature.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['35'][1].init(871, 15, 'documentElement');
function visit4_35_1(result) {
  _$jscoverage['/feature.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['31'][1].init(763, 41, '(\'ontouchstart\' in doc) && !(UA.phantomjs)');
function visit3_31_1(result) {
  _$jscoverage['/feature.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['25'][1].init(479, 26, 'doc && doc.documentElement');
function visit2_25_1(result) {
  _$jscoverage['/feature.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['19'][1].init(317, 18, 'win.document || {}');
function visit1_19_1(result) {
  _$jscoverage['/feature.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/feature.js'].functionData[0]++;
  _$jscoverage['/feature.js'].lineData[7]++;
  var win = S.Env.host, Config = S.Config, UA = require('ua'), propertyPrefixes = ['Webkit', 'Moz', 'O', 'ms'], propertyPrefixesLength = propertyPrefixes.length, doc = visit1_19_1(win.document || {}), isMsPointerSupported, isPointerSupported, isTransform3dSupported, documentElement = visit2_25_1(doc && doc.documentElement), navigator, documentElementStyle, isClassListSupportedState = true, isQuerySelectorSupportedState = false, isTouchEventSupportedState = visit3_31_1(('ontouchstart' in doc) && !(UA.phantomjs)), vendorInfos = {}, ie = UA.ieMode;
  _$jscoverage['/feature.js'].lineData[35]++;
  if (visit4_35_1(documentElement)) {
    _$jscoverage['/feature.js'].lineData[37]++;
    if (visit5_37_1(documentElement.querySelector && visit6_37_2(ie !== 8))) {
      _$jscoverage['/feature.js'].lineData[38]++;
      isQuerySelectorSupportedState = true;
    }
    _$jscoverage['/feature.js'].lineData[40]++;
    documentElementStyle = documentElement.style;
    _$jscoverage['/feature.js'].lineData[41]++;
    isClassListSupportedState = 'classList' in documentElement;
    _$jscoverage['/feature.js'].lineData[42]++;
    navigator = visit7_42_1(win.navigator || {});
    _$jscoverage['/feature.js'].lineData[43]++;
    isMsPointerSupported = 'msPointerEnabled' in navigator;
    _$jscoverage['/feature.js'].lineData[44]++;
    isPointerSupported = 'pointerEnabled' in navigator;
  }
  _$jscoverage['/feature.js'].lineData[48]++;
  function getVendorInfo(name) {
    _$jscoverage['/feature.js'].functionData[1]++;
    _$jscoverage['/feature.js'].lineData[49]++;
    if (visit8_49_1(name.indexOf('-') !== -1)) {
      _$jscoverage['/feature.js'].lineData[50]++;
      name = S.camelCase(name);
    }
    _$jscoverage['/feature.js'].lineData[52]++;
    if (visit9_52_1(name in vendorInfos)) {
      _$jscoverage['/feature.js'].lineData[53]++;
      return vendorInfos[name];
    }
    _$jscoverage['/feature.js'].lineData[56]++;
    if (visit10_56_1(!documentElementStyle || name in documentElementStyle)) {
      _$jscoverage['/feature.js'].lineData[57]++;
      vendorInfos[name] = {
  propertyName: name, 
  propertyNamePrefix: ''};
    } else {
      _$jscoverage['/feature.js'].lineData[62]++;
      var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1), vendorName;
      _$jscoverage['/feature.js'].lineData[65]++;
      for (var i = 0; visit11_65_1(i < propertyPrefixesLength); i++) {
        _$jscoverage['/feature.js'].lineData[66]++;
        var propertyNamePrefix = propertyPrefixes[i];
        _$jscoverage['/feature.js'].lineData[67]++;
        vendorName = propertyNamePrefix + upperFirstName;
        _$jscoverage['/feature.js'].lineData[68]++;
        if (visit12_68_1(vendorName in documentElementStyle)) {
          _$jscoverage['/feature.js'].lineData[69]++;
          vendorInfos[name] = {
  propertyName: vendorName, 
  propertyNamePrefix: propertyNamePrefix};
        }
      }
      _$jscoverage['/feature.js'].lineData[76]++;
      vendorInfos[name] = visit13_76_1(vendorInfos[name] || null);
    }
    _$jscoverage['/feature.js'].lineData[78]++;
    return vendorInfos[name];
  }
  _$jscoverage['/feature.js'].lineData[87]++;
  S.Feature = {
  isMsPointerSupported: function() {
  _$jscoverage['/feature.js'].functionData[2]++;
  _$jscoverage['/feature.js'].lineData[95]++;
  return isMsPointerSupported;
}, 
  isPointerSupported: function() {
  _$jscoverage['/feature.js'].functionData[3]++;
  _$jscoverage['/feature.js'].lineData[104]++;
  return isPointerSupported;
}, 
  isTouchEventSupported: function() {
  _$jscoverage['/feature.js'].functionData[4]++;
  _$jscoverage['/feature.js'].lineData[112]++;
  return isTouchEventSupportedState;
}, 
  isTouchGestureSupported: function() {
  _$jscoverage['/feature.js'].functionData[5]++;
  _$jscoverage['/feature.js'].lineData[116]++;
  return visit14_116_1(isTouchEventSupportedState || visit15_116_2(isPointerSupported || isMsPointerSupported));
}, 
  isDeviceMotionSupported: function() {
  _$jscoverage['/feature.js'].functionData[6]++;
  _$jscoverage['/feature.js'].lineData[124]++;
  return !!win.DeviceMotionEvent;
}, 
  isHashChangeSupported: function() {
  _$jscoverage['/feature.js'].functionData[7]++;
  _$jscoverage['/feature.js'].lineData[135]++;
  return visit16_135_1(('onhashchange' in win) && (visit17_135_2(!ie || visit18_135_3(ie > 7))));
}, 
  isInputEventSupported: function() {
  _$jscoverage['/feature.js'].functionData[8]++;
  _$jscoverage['/feature.js'].lineData[139]++;
  return visit19_139_1(!Config.simulateInputEvent && visit20_139_2(('oninput' in win) && (visit21_139_3(!ie || visit22_139_4(ie > 9)))));
}, 
  isTransform3dSupported: function() {
  _$jscoverage['/feature.js'].functionData[9]++;
  _$jscoverage['/feature.js'].lineData[147]++;
  if (visit23_147_1(isTransform3dSupported !== undefined)) {
    _$jscoverage['/feature.js'].lineData[148]++;
    return isTransform3dSupported;
  }
  _$jscoverage['/feature.js'].lineData[150]++;
  if (visit24_150_1(!documentElement || visit25_150_2(getVendorInfo('transform').prefix === false))) {
    _$jscoverage['/feature.js'].lineData[151]++;
    isTransform3dSupported = false;
  } else {
    _$jscoverage['/feature.js'].lineData[156]++;
    var el = doc.createElement('p');
    _$jscoverage['/feature.js'].lineData[157]++;
    var transformProperty = getVendorInfo('transform').name;
    _$jscoverage['/feature.js'].lineData[158]++;
    documentElement.insertBefore(el, documentElement.firstChild);
    _$jscoverage['/feature.js'].lineData[159]++;
    el.style[transformProperty] = 'translate3d(1px,1px,1px)';
    _$jscoverage['/feature.js'].lineData[160]++;
    var computedStyle = win.getComputedStyle(el);
    _$jscoverage['/feature.js'].lineData[161]++;
    var has3d = visit26_161_1(computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty]);
    _$jscoverage['/feature.js'].lineData[162]++;
    documentElement.removeChild(el);
    _$jscoverage['/feature.js'].lineData[163]++;
    isTransform3dSupported = (visit27_163_1(visit28_163_2(has3d !== undefined) && visit29_163_3(visit30_163_4(has3d.length > 0) && visit31_163_5(has3d !== 'none'))));
  }
  _$jscoverage['/feature.js'].lineData[166]++;
  return isTransform3dSupported;
}, 
  isClassListSupported: function() {
  _$jscoverage['/feature.js'].functionData[10]++;
  _$jscoverage['/feature.js'].lineData[174]++;
  return isClassListSupportedState;
}, 
  isQuerySelectorSupported: function() {
  _$jscoverage['/feature.js'].functionData[11]++;
  _$jscoverage['/feature.js'].lineData[183]++;
  return visit32_183_1(!Config.simulateCss3Selector && isQuerySelectorSupportedState);
}, 
  getCssVendorInfo: function(name) {
  _$jscoverage['/feature.js'].functionData[12]++;
  _$jscoverage['/feature.js'].lineData[187]++;
  return getVendorInfo(name);
}};
  _$jscoverage['/feature.js'].lineData[191]++;
  return S.Feature;
});
