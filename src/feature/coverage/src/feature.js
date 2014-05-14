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
  _$jscoverage['/feature.js'].lineData[47] = 0;
  _$jscoverage['/feature.js'].lineData[49] = 0;
  _$jscoverage['/feature.js'].lineData[50] = 0;
  _$jscoverage['/feature.js'].lineData[54] = 0;
  _$jscoverage['/feature.js'].lineData[55] = 0;
  _$jscoverage['/feature.js'].lineData[56] = 0;
  _$jscoverage['/feature.js'].lineData[58] = 0;
  _$jscoverage['/feature.js'].lineData[59] = 0;
  _$jscoverage['/feature.js'].lineData[62] = 0;
  _$jscoverage['/feature.js'].lineData[63] = 0;
  _$jscoverage['/feature.js'].lineData[68] = 0;
  _$jscoverage['/feature.js'].lineData[71] = 0;
  _$jscoverage['/feature.js'].lineData[72] = 0;
  _$jscoverage['/feature.js'].lineData[73] = 0;
  _$jscoverage['/feature.js'].lineData[74] = 0;
  _$jscoverage['/feature.js'].lineData[75] = 0;
  _$jscoverage['/feature.js'].lineData[82] = 0;
  _$jscoverage['/feature.js'].lineData[84] = 0;
  _$jscoverage['/feature.js'].lineData[93] = 0;
  _$jscoverage['/feature.js'].lineData[101] = 0;
  _$jscoverage['/feature.js'].lineData[110] = 0;
  _$jscoverage['/feature.js'].lineData[118] = 0;
  _$jscoverage['/feature.js'].lineData[122] = 0;
  _$jscoverage['/feature.js'].lineData[130] = 0;
  _$jscoverage['/feature.js'].lineData[141] = 0;
  _$jscoverage['/feature.js'].lineData[145] = 0;
  _$jscoverage['/feature.js'].lineData[153] = 0;
  _$jscoverage['/feature.js'].lineData[154] = 0;
  _$jscoverage['/feature.js'].lineData[157] = 0;
  _$jscoverage['/feature.js'].lineData[158] = 0;
  _$jscoverage['/feature.js'].lineData[163] = 0;
  _$jscoverage['/feature.js'].lineData[164] = 0;
  _$jscoverage['/feature.js'].lineData[165] = 0;
  _$jscoverage['/feature.js'].lineData[166] = 0;
  _$jscoverage['/feature.js'].lineData[167] = 0;
  _$jscoverage['/feature.js'].lineData[168] = 0;
  _$jscoverage['/feature.js'].lineData[169] = 0;
  _$jscoverage['/feature.js'].lineData[170] = 0;
  _$jscoverage['/feature.js'].lineData[173] = 0;
  _$jscoverage['/feature.js'].lineData[181] = 0;
  _$jscoverage['/feature.js'].lineData[190] = 0;
  _$jscoverage['/feature.js'].lineData[194] = 0;
  _$jscoverage['/feature.js'].lineData[198] = 0;
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
  _$jscoverage['/feature.js'].branchData['55'] = [];
  _$jscoverage['/feature.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['58'] = [];
  _$jscoverage['/feature.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['62'] = [];
  _$jscoverage['/feature.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['71'] = [];
  _$jscoverage['/feature.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['74'] = [];
  _$jscoverage['/feature.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['82'] = [];
  _$jscoverage['/feature.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['122'] = [];
  _$jscoverage['/feature.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['122'][2] = new BranchData();
  _$jscoverage['/feature.js'].branchData['141'] = [];
  _$jscoverage['/feature.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['141'][2] = new BranchData();
  _$jscoverage['/feature.js'].branchData['141'][3] = new BranchData();
  _$jscoverage['/feature.js'].branchData['145'] = [];
  _$jscoverage['/feature.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['145'][2] = new BranchData();
  _$jscoverage['/feature.js'].branchData['145'][3] = new BranchData();
  _$jscoverage['/feature.js'].branchData['145'][4] = new BranchData();
  _$jscoverage['/feature.js'].branchData['153'] = [];
  _$jscoverage['/feature.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['157'] = [];
  _$jscoverage['/feature.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['168'] = [];
  _$jscoverage['/feature.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['170'] = [];
  _$jscoverage['/feature.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['170'][2] = new BranchData();
  _$jscoverage['/feature.js'].branchData['170'][3] = new BranchData();
  _$jscoverage['/feature.js'].branchData['170'][4] = new BranchData();
  _$jscoverage['/feature.js'].branchData['170'][5] = new BranchData();
  _$jscoverage['/feature.js'].branchData['190'] = [];
  _$jscoverage['/feature.js'].branchData['190'][1] = new BranchData();
}
_$jscoverage['/feature.js'].branchData['190'][1].init(69, 61, '!Config.simulateCss3Selector && isQuerySelectorSupportedState');
function visit31_190_1(result) {
  _$jscoverage['/feature.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['170'][5].init(780, 16, 'has3d !== \'none\'');
function visit30_170_5(result) {
  _$jscoverage['/feature.js'].branchData['170'][5].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['170'][4].init(760, 16, 'has3d.length > 0');
function visit29_170_4(result) {
  _$jscoverage['/feature.js'].branchData['170'][4].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['170'][3].init(760, 36, 'has3d.length > 0 && has3d !== \'none\'');
function visit28_170_3(result) {
  _$jscoverage['/feature.js'].branchData['170'][3].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['170'][2].init(737, 19, 'has3d !== undefined');
function visit27_170_2(result) {
  _$jscoverage['/feature.js'].branchData['170'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['170'][1].init(737, 59, 'has3d !== undefined && has3d.length > 0 && has3d !== \'none\'');
function visit26_170_1(result) {
  _$jscoverage['/feature.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['168'][1].init(557, 85, 'computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty]');
function visit25_168_1(result) {
  _$jscoverage['/feature.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['157'][1].init(140, 47, '!documentElement || !getVendorInfo(\'transform\')');
function visit24_157_1(result) {
  _$jscoverage['/feature.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['153'][1].init(18, 36, 'isTransform3dSupported !== undefined');
function visit23_153_1(result) {
  _$jscoverage['/feature.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['145'][4].init(81, 6, 'ie > 9');
function visit22_145_4(result) {
  _$jscoverage['/feature.js'].branchData['145'][4].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['145'][3].init(74, 13, '!ie || ie > 9');
function visit21_145_3(result) {
  _$jscoverage['/feature.js'].branchData['145'][3].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['145'][2].init(52, 36, '(\'oninput\' in win) && (!ie || ie > 9)');
function visit20_145_2(result) {
  _$jscoverage['/feature.js'].branchData['145'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['145'][1].init(21, 67, '!Config.simulateInputEvent && (\'oninput\' in win) && (!ie || ie > 9)');
function visit19_145_1(result) {
  _$jscoverage['/feature.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['141'][3].init(196, 6, 'ie > 7');
function visit18_141_3(result) {
  _$jscoverage['/feature.js'].branchData['141'][3].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['141'][2].init(189, 13, '!ie || ie > 7');
function visit17_141_2(result) {
  _$jscoverage['/feature.js'].branchData['141'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['141'][1].init(162, 41, '(\'onhashchange\' in win) && (!ie || ie > 7)');
function visit16_141_1(result) {
  _$jscoverage['/feature.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['122'][2].init(51, 42, 'isPointerSupported || isMsPointerSupported');
function visit15_122_2(result) {
  _$jscoverage['/feature.js'].branchData['122'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['122'][1].init(21, 72, 'isTouchEventSupportedState || isPointerSupported || isMsPointerSupported');
function visit14_122_1(result) {
  _$jscoverage['/feature.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['82'][1].init(616, 25, 'vendorInfos[name] || null');
function visit13_82_1(result) {
  _$jscoverage['/feature.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['74'][1].init(152, 34, 'vendorName in documentElementStyle');
function visit12_74_1(result) {
  _$jscoverage['/feature.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['71'][1].init(141, 26, 'i < propertyPrefixesLength');
function visit11_71_1(result) {
  _$jscoverage['/feature.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['62'][1].init(260, 53, '!documentElementStyle || name in documentElementStyle');
function visit10_62_1(result) {
  _$jscoverage['/feature.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['58'][1].init(120, 19, 'name in vendorInfos');
function visit9_58_1(result) {
  _$jscoverage['/feature.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['55'][1].init(14, 24, 'name.indexOf(\'-\') !== -1');
function visit8_55_1(result) {
  _$jscoverage['/feature.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['42'][1].init(289, 19, 'win.navigator || {}');
function visit7_42_1(result) {
  _$jscoverage['/feature.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['37'][2].init(70, 8, 'ie !== 8');
function visit6_37_2(result) {
  _$jscoverage['/feature.js'].branchData['37'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['37'][1].init(37, 41, 'documentElement.querySelector && ie !== 8');
function visit5_37_1(result) {
  _$jscoverage['/feature.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['35'][1].init(900, 15, 'documentElement');
function visit4_35_1(result) {
  _$jscoverage['/feature.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['31'][1].init(787, 41, '(\'ontouchstart\' in doc) && !(UA.phantomjs)');
function visit3_31_1(result) {
  _$jscoverage['/feature.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['25'][1].init(497, 26, 'doc && doc.documentElement');
function visit2_25_1(result) {
  _$jscoverage['/feature.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['19'][1].init(329, 18, 'win.document || {}');
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
  _$jscoverage['/feature.js'].lineData[47]++;
  var RE_DASH = /-([a-z])/ig;
  _$jscoverage['/feature.js'].lineData[49]++;
  function upperCase() {
    _$jscoverage['/feature.js'].functionData[1]++;
    _$jscoverage['/feature.js'].lineData[50]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/feature.js'].lineData[54]++;
  function getVendorInfo(name) {
    _$jscoverage['/feature.js'].functionData[2]++;
    _$jscoverage['/feature.js'].lineData[55]++;
    if (visit8_55_1(name.indexOf('-') !== -1)) {
      _$jscoverage['/feature.js'].lineData[56]++;
      name = name.replace(RE_DASH, upperCase);
    }
    _$jscoverage['/feature.js'].lineData[58]++;
    if (visit9_58_1(name in vendorInfos)) {
      _$jscoverage['/feature.js'].lineData[59]++;
      return vendorInfos[name];
    }
    _$jscoverage['/feature.js'].lineData[62]++;
    if (visit10_62_1(!documentElementStyle || name in documentElementStyle)) {
      _$jscoverage['/feature.js'].lineData[63]++;
      vendorInfos[name] = {
  propertyName: name, 
  propertyNamePrefix: ''};
    } else {
      _$jscoverage['/feature.js'].lineData[68]++;
      var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1), vendorName;
      _$jscoverage['/feature.js'].lineData[71]++;
      for (var i = 0; visit11_71_1(i < propertyPrefixesLength); i++) {
        _$jscoverage['/feature.js'].lineData[72]++;
        var propertyNamePrefix = propertyPrefixes[i];
        _$jscoverage['/feature.js'].lineData[73]++;
        vendorName = propertyNamePrefix + upperFirstName;
        _$jscoverage['/feature.js'].lineData[74]++;
        if (visit12_74_1(vendorName in documentElementStyle)) {
          _$jscoverage['/feature.js'].lineData[75]++;
          vendorInfos[name] = {
  propertyName: vendorName, 
  propertyNamePrefix: propertyNamePrefix};
        }
      }
      _$jscoverage['/feature.js'].lineData[82]++;
      vendorInfos[name] = visit13_82_1(vendorInfos[name] || null);
    }
    _$jscoverage['/feature.js'].lineData[84]++;
    return vendorInfos[name];
  }
  _$jscoverage['/feature.js'].lineData[93]++;
  S.Feature = {
  isMsPointerSupported: function() {
  _$jscoverage['/feature.js'].functionData[3]++;
  _$jscoverage['/feature.js'].lineData[101]++;
  return isMsPointerSupported;
}, 
  isPointerSupported: function() {
  _$jscoverage['/feature.js'].functionData[4]++;
  _$jscoverage['/feature.js'].lineData[110]++;
  return isPointerSupported;
}, 
  isTouchEventSupported: function() {
  _$jscoverage['/feature.js'].functionData[5]++;
  _$jscoverage['/feature.js'].lineData[118]++;
  return isTouchEventSupportedState;
}, 
  isTouchGestureSupported: function() {
  _$jscoverage['/feature.js'].functionData[6]++;
  _$jscoverage['/feature.js'].lineData[122]++;
  return visit14_122_1(isTouchEventSupportedState || visit15_122_2(isPointerSupported || isMsPointerSupported));
}, 
  isDeviceMotionSupported: function() {
  _$jscoverage['/feature.js'].functionData[7]++;
  _$jscoverage['/feature.js'].lineData[130]++;
  return !!win.DeviceMotionEvent;
}, 
  isHashChangeSupported: function() {
  _$jscoverage['/feature.js'].functionData[8]++;
  _$jscoverage['/feature.js'].lineData[141]++;
  return visit16_141_1(('onhashchange' in win) && (visit17_141_2(!ie || visit18_141_3(ie > 7))));
}, 
  isInputEventSupported: function() {
  _$jscoverage['/feature.js'].functionData[9]++;
  _$jscoverage['/feature.js'].lineData[145]++;
  return visit19_145_1(!Config.simulateInputEvent && visit20_145_2(('oninput' in win) && (visit21_145_3(!ie || visit22_145_4(ie > 9)))));
}, 
  isTransform3dSupported: function() {
  _$jscoverage['/feature.js'].functionData[10]++;
  _$jscoverage['/feature.js'].lineData[153]++;
  if (visit23_153_1(isTransform3dSupported !== undefined)) {
    _$jscoverage['/feature.js'].lineData[154]++;
    return isTransform3dSupported;
  }
  _$jscoverage['/feature.js'].lineData[157]++;
  if (visit24_157_1(!documentElement || !getVendorInfo('transform'))) {
    _$jscoverage['/feature.js'].lineData[158]++;
    isTransform3dSupported = false;
  } else {
    _$jscoverage['/feature.js'].lineData[163]++;
    var el = doc.createElement('p');
    _$jscoverage['/feature.js'].lineData[164]++;
    var transformProperty = getVendorInfo('transform').name;
    _$jscoverage['/feature.js'].lineData[165]++;
    documentElement.insertBefore(el, documentElement.firstChild);
    _$jscoverage['/feature.js'].lineData[166]++;
    el.style[transformProperty] = 'translate3d(1px,1px,1px)';
    _$jscoverage['/feature.js'].lineData[167]++;
    var computedStyle = win.getComputedStyle(el);
    _$jscoverage['/feature.js'].lineData[168]++;
    var has3d = visit25_168_1(computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty]);
    _$jscoverage['/feature.js'].lineData[169]++;
    documentElement.removeChild(el);
    _$jscoverage['/feature.js'].lineData[170]++;
    isTransform3dSupported = (visit26_170_1(visit27_170_2(has3d !== undefined) && visit28_170_3(visit29_170_4(has3d.length > 0) && visit30_170_5(has3d !== 'none'))));
  }
  _$jscoverage['/feature.js'].lineData[173]++;
  return isTransform3dSupported;
}, 
  isClassListSupported: function() {
  _$jscoverage['/feature.js'].functionData[11]++;
  _$jscoverage['/feature.js'].lineData[181]++;
  return isClassListSupportedState;
}, 
  isQuerySelectorSupported: function() {
  _$jscoverage['/feature.js'].functionData[12]++;
  _$jscoverage['/feature.js'].lineData[190]++;
  return visit31_190_1(!Config.simulateCss3Selector && isQuerySelectorSupportedState);
}, 
  getCssVendorInfo: function(name) {
  _$jscoverage['/feature.js'].functionData[13]++;
  _$jscoverage['/feature.js'].lineData[194]++;
  return getVendorInfo(name);
}};
  _$jscoverage['/feature.js'].lineData[198]++;
  return S.Feature;
});
