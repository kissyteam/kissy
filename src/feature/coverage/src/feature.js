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
  _$jscoverage['/feature.js'].lineData[8] = 0;
  _$jscoverage['/feature.js'].lineData[36] = 0;
  _$jscoverage['/feature.js'].lineData[38] = 0;
  _$jscoverage['/feature.js'].lineData[39] = 0;
  _$jscoverage['/feature.js'].lineData[41] = 0;
  _$jscoverage['/feature.js'].lineData[42] = 0;
  _$jscoverage['/feature.js'].lineData[43] = 0;
  _$jscoverage['/feature.js'].lineData[44] = 0;
  _$jscoverage['/feature.js'].lineData[45] = 0;
  _$jscoverage['/feature.js'].lineData[49] = 0;
  _$jscoverage['/feature.js'].lineData[50] = 0;
  _$jscoverage['/feature.js'].lineData[51] = 0;
  _$jscoverage['/feature.js'].lineData[53] = 0;
  _$jscoverage['/feature.js'].lineData[54] = 0;
  _$jscoverage['/feature.js'].lineData[57] = 0;
  _$jscoverage['/feature.js'].lineData[58] = 0;
  _$jscoverage['/feature.js'].lineData[63] = 0;
  _$jscoverage['/feature.js'].lineData[66] = 0;
  _$jscoverage['/feature.js'].lineData[67] = 0;
  _$jscoverage['/feature.js'].lineData[68] = 0;
  _$jscoverage['/feature.js'].lineData[69] = 0;
  _$jscoverage['/feature.js'].lineData[70] = 0;
  _$jscoverage['/feature.js'].lineData[77] = 0;
  _$jscoverage['/feature.js'].lineData[79] = 0;
  _$jscoverage['/feature.js'].lineData[88] = 0;
  _$jscoverage['/feature.js'].lineData[96] = 0;
  _$jscoverage['/feature.js'].lineData[105] = 0;
  _$jscoverage['/feature.js'].lineData[113] = 0;
  _$jscoverage['/feature.js'].lineData[117] = 0;
  _$jscoverage['/feature.js'].lineData[125] = 0;
  _$jscoverage['/feature.js'].lineData[136] = 0;
  _$jscoverage['/feature.js'].lineData[140] = 0;
  _$jscoverage['/feature.js'].lineData[148] = 0;
  _$jscoverage['/feature.js'].lineData[149] = 0;
  _$jscoverage['/feature.js'].lineData[152] = 0;
  _$jscoverage['/feature.js'].lineData[153] = 0;
  _$jscoverage['/feature.js'].lineData[158] = 0;
  _$jscoverage['/feature.js'].lineData[159] = 0;
  _$jscoverage['/feature.js'].lineData[160] = 0;
  _$jscoverage['/feature.js'].lineData[161] = 0;
  _$jscoverage['/feature.js'].lineData[162] = 0;
  _$jscoverage['/feature.js'].lineData[163] = 0;
  _$jscoverage['/feature.js'].lineData[164] = 0;
  _$jscoverage['/feature.js'].lineData[165] = 0;
  _$jscoverage['/feature.js'].lineData[168] = 0;
  _$jscoverage['/feature.js'].lineData[176] = 0;
  _$jscoverage['/feature.js'].lineData[185] = 0;
  _$jscoverage['/feature.js'].lineData[189] = 0;
  _$jscoverage['/feature.js'].lineData[193] = 0;
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
  _$jscoverage['/feature.js'].branchData['20'] = [];
  _$jscoverage['/feature.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['26'] = [];
  _$jscoverage['/feature.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['32'] = [];
  _$jscoverage['/feature.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['36'] = [];
  _$jscoverage['/feature.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['38'] = [];
  _$jscoverage['/feature.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['38'][2] = new BranchData();
  _$jscoverage['/feature.js'].branchData['43'] = [];
  _$jscoverage['/feature.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['50'] = [];
  _$jscoverage['/feature.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['53'] = [];
  _$jscoverage['/feature.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['57'] = [];
  _$jscoverage['/feature.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['66'] = [];
  _$jscoverage['/feature.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['69'] = [];
  _$jscoverage['/feature.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['77'] = [];
  _$jscoverage['/feature.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['117'] = [];
  _$jscoverage['/feature.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['117'][2] = new BranchData();
  _$jscoverage['/feature.js'].branchData['136'] = [];
  _$jscoverage['/feature.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['136'][2] = new BranchData();
  _$jscoverage['/feature.js'].branchData['136'][3] = new BranchData();
  _$jscoverage['/feature.js'].branchData['140'] = [];
  _$jscoverage['/feature.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['140'][2] = new BranchData();
  _$jscoverage['/feature.js'].branchData['140'][3] = new BranchData();
  _$jscoverage['/feature.js'].branchData['140'][4] = new BranchData();
  _$jscoverage['/feature.js'].branchData['148'] = [];
  _$jscoverage['/feature.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['152'] = [];
  _$jscoverage['/feature.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['163'] = [];
  _$jscoverage['/feature.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['165'] = [];
  _$jscoverage['/feature.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/feature.js'].branchData['165'][2] = new BranchData();
  _$jscoverage['/feature.js'].branchData['165'][3] = new BranchData();
  _$jscoverage['/feature.js'].branchData['165'][4] = new BranchData();
  _$jscoverage['/feature.js'].branchData['165'][5] = new BranchData();
  _$jscoverage['/feature.js'].branchData['185'] = [];
  _$jscoverage['/feature.js'].branchData['185'][1] = new BranchData();
}
_$jscoverage['/feature.js'].branchData['185'][1].init(67, 61, '!Config.simulateCss3Selector && isQuerySelectorSupportedState');
function visit31_185_1(result) {
  _$jscoverage['/feature.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['165'][5].init(769, 16, 'has3d !== \'none\'');
function visit30_165_5(result) {
  _$jscoverage['/feature.js'].branchData['165'][5].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['165'][4].init(749, 16, 'has3d.length > 0');
function visit29_165_4(result) {
  _$jscoverage['/feature.js'].branchData['165'][4].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['165'][3].init(749, 36, 'has3d.length > 0 && has3d !== \'none\'');
function visit28_165_3(result) {
  _$jscoverage['/feature.js'].branchData['165'][3].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['165'][2].init(726, 19, 'has3d !== undefined');
function visit27_165_2(result) {
  _$jscoverage['/feature.js'].branchData['165'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['165'][1].init(726, 59, 'has3d !== undefined && has3d.length > 0 && has3d !== \'none\'');
function visit26_165_1(result) {
  _$jscoverage['/feature.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['163'][1].init(548, 85, 'computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty]');
function visit25_163_1(result) {
  _$jscoverage['/feature.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['152'][1].init(135, 47, '!documentElement || !getVendorInfo(\'transform\')');
function visit24_152_1(result) {
  _$jscoverage['/feature.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['148'][1].init(17, 36, 'isTransform3dSupported !== undefined');
function visit23_148_1(result) {
  _$jscoverage['/feature.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['140'][4].init(80, 6, 'ie > 9');
function visit22_140_4(result) {
  _$jscoverage['/feature.js'].branchData['140'][4].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['140'][3].init(73, 13, '!ie || ie > 9');
function visit21_140_3(result) {
  _$jscoverage['/feature.js'].branchData['140'][3].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['140'][2].init(51, 36, '(\'oninput\' in win) && (!ie || ie > 9)');
function visit20_140_2(result) {
  _$jscoverage['/feature.js'].branchData['140'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['140'][1].init(20, 67, '!Config.simulateInputEvent && (\'oninput\' in win) && (!ie || ie > 9)');
function visit19_140_1(result) {
  _$jscoverage['/feature.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['136'][3].init(192, 6, 'ie > 7');
function visit18_136_3(result) {
  _$jscoverage['/feature.js'].branchData['136'][3].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['136'][2].init(185, 13, '!ie || ie > 7');
function visit17_136_2(result) {
  _$jscoverage['/feature.js'].branchData['136'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['136'][1].init(158, 41, '(\'onhashchange\' in win) && (!ie || ie > 7)');
function visit16_136_1(result) {
  _$jscoverage['/feature.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['117'][2].init(50, 42, 'isPointerSupported || isMsPointerSupported');
function visit15_117_2(result) {
  _$jscoverage['/feature.js'].branchData['117'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['117'][1].init(20, 72, 'isTouchEventSupportedState || isPointerSupported || isMsPointerSupported');
function visit14_117_1(result) {
  _$jscoverage['/feature.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['77'][1].init(601, 25, 'vendorInfos[name] || null');
function visit13_77_1(result) {
  _$jscoverage['/feature.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['69'][1].init(149, 34, 'vendorName in documentElementStyle');
function visit12_69_1(result) {
  _$jscoverage['/feature.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['66'][1].init(137, 26, 'i < propertyPrefixesLength');
function visit11_66_1(result) {
  _$jscoverage['/feature.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['57'][1].init(237, 53, '!documentElementStyle || name in documentElementStyle');
function visit10_57_1(result) {
  _$jscoverage['/feature.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['53'][1].init(101, 19, 'name in vendorInfos');
function visit9_53_1(result) {
  _$jscoverage['/feature.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['50'][1].init(13, 24, 'name.indexOf(\'-\') !== -1');
function visit8_50_1(result) {
  _$jscoverage['/feature.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['43'][1].init(282, 19, 'win.navigator || {}');
function visit7_43_1(result) {
  _$jscoverage['/feature.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['38'][2].init(68, 8, 'ie !== 8');
function visit6_38_2(result) {
  _$jscoverage['/feature.js'].branchData['38'][2].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['38'][1].init(35, 41, 'documentElement.querySelector && ie !== 8');
function visit5_38_1(result) {
  _$jscoverage['/feature.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['36'][1].init(892, 15, 'documentElement');
function visit4_36_1(result) {
  _$jscoverage['/feature.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['32'][1].init(763, 41, '(\'ontouchstart\' in doc) && !(UA.phantomjs)');
function visit3_32_1(result) {
  _$jscoverage['/feature.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['26'][1].init(479, 26, 'doc && doc.documentElement');
function visit2_26_1(result) {
  _$jscoverage['/feature.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].branchData['20'][1].init(317, 18, 'win.document || {}');
function visit1_20_1(result) {
  _$jscoverage['/feature.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/feature.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/feature.js'].functionData[0]++;
  _$jscoverage['/feature.js'].lineData[7]++;
  require('util');
  _$jscoverage['/feature.js'].lineData[8]++;
  var win = S.Env.host, Config = S.Config, UA = require('ua'), propertyPrefixes = ['Webkit', 'Moz', 'O', 'ms'], propertyPrefixesLength = propertyPrefixes.length, doc = visit1_20_1(win.document || {}), isMsPointerSupported, isPointerSupported, isTransform3dSupported, documentElement = visit2_26_1(doc && doc.documentElement), navigator, documentElementStyle, isClassListSupportedState = true, isQuerySelectorSupportedState = false, isTouchEventSupportedState = visit3_32_1(('ontouchstart' in doc) && !(UA.phantomjs)), vendorInfos = {}, ie = UA.ieMode;
  _$jscoverage['/feature.js'].lineData[36]++;
  if (visit4_36_1(documentElement)) {
    _$jscoverage['/feature.js'].lineData[38]++;
    if (visit5_38_1(documentElement.querySelector && visit6_38_2(ie !== 8))) {
      _$jscoverage['/feature.js'].lineData[39]++;
      isQuerySelectorSupportedState = true;
    }
    _$jscoverage['/feature.js'].lineData[41]++;
    documentElementStyle = documentElement.style;
    _$jscoverage['/feature.js'].lineData[42]++;
    isClassListSupportedState = 'classList' in documentElement;
    _$jscoverage['/feature.js'].lineData[43]++;
    navigator = visit7_43_1(win.navigator || {});
    _$jscoverage['/feature.js'].lineData[44]++;
    isMsPointerSupported = 'msPointerEnabled' in navigator;
    _$jscoverage['/feature.js'].lineData[45]++;
    isPointerSupported = 'pointerEnabled' in navigator;
  }
  _$jscoverage['/feature.js'].lineData[49]++;
  function getVendorInfo(name) {
    _$jscoverage['/feature.js'].functionData[1]++;
    _$jscoverage['/feature.js'].lineData[50]++;
    if (visit8_50_1(name.indexOf('-') !== -1)) {
      _$jscoverage['/feature.js'].lineData[51]++;
      name = S.camelCase(name);
    }
    _$jscoverage['/feature.js'].lineData[53]++;
    if (visit9_53_1(name in vendorInfos)) {
      _$jscoverage['/feature.js'].lineData[54]++;
      return vendorInfos[name];
    }
    _$jscoverage['/feature.js'].lineData[57]++;
    if (visit10_57_1(!documentElementStyle || name in documentElementStyle)) {
      _$jscoverage['/feature.js'].lineData[58]++;
      vendorInfos[name] = {
  propertyName: name, 
  propertyNamePrefix: ''};
    } else {
      _$jscoverage['/feature.js'].lineData[63]++;
      var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1), vendorName;
      _$jscoverage['/feature.js'].lineData[66]++;
      for (var i = 0; visit11_66_1(i < propertyPrefixesLength); i++) {
        _$jscoverage['/feature.js'].lineData[67]++;
        var propertyNamePrefix = propertyPrefixes[i];
        _$jscoverage['/feature.js'].lineData[68]++;
        vendorName = propertyNamePrefix + upperFirstName;
        _$jscoverage['/feature.js'].lineData[69]++;
        if (visit12_69_1(vendorName in documentElementStyle)) {
          _$jscoverage['/feature.js'].lineData[70]++;
          vendorInfos[name] = {
  propertyName: vendorName, 
  propertyNamePrefix: propertyNamePrefix};
        }
      }
      _$jscoverage['/feature.js'].lineData[77]++;
      vendorInfos[name] = visit13_77_1(vendorInfos[name] || null);
    }
    _$jscoverage['/feature.js'].lineData[79]++;
    return vendorInfos[name];
  }
  _$jscoverage['/feature.js'].lineData[88]++;
  S.Feature = {
  isMsPointerSupported: function() {
  _$jscoverage['/feature.js'].functionData[2]++;
  _$jscoverage['/feature.js'].lineData[96]++;
  return isMsPointerSupported;
}, 
  isPointerSupported: function() {
  _$jscoverage['/feature.js'].functionData[3]++;
  _$jscoverage['/feature.js'].lineData[105]++;
  return isPointerSupported;
}, 
  isTouchEventSupported: function() {
  _$jscoverage['/feature.js'].functionData[4]++;
  _$jscoverage['/feature.js'].lineData[113]++;
  return isTouchEventSupportedState;
}, 
  isTouchGestureSupported: function() {
  _$jscoverage['/feature.js'].functionData[5]++;
  _$jscoverage['/feature.js'].lineData[117]++;
  return visit14_117_1(isTouchEventSupportedState || visit15_117_2(isPointerSupported || isMsPointerSupported));
}, 
  isDeviceMotionSupported: function() {
  _$jscoverage['/feature.js'].functionData[6]++;
  _$jscoverage['/feature.js'].lineData[125]++;
  return !!win.DeviceMotionEvent;
}, 
  isHashChangeSupported: function() {
  _$jscoverage['/feature.js'].functionData[7]++;
  _$jscoverage['/feature.js'].lineData[136]++;
  return visit16_136_1(('onhashchange' in win) && (visit17_136_2(!ie || visit18_136_3(ie > 7))));
}, 
  isInputEventSupported: function() {
  _$jscoverage['/feature.js'].functionData[8]++;
  _$jscoverage['/feature.js'].lineData[140]++;
  return visit19_140_1(!Config.simulateInputEvent && visit20_140_2(('oninput' in win) && (visit21_140_3(!ie || visit22_140_4(ie > 9)))));
}, 
  isTransform3dSupported: function() {
  _$jscoverage['/feature.js'].functionData[9]++;
  _$jscoverage['/feature.js'].lineData[148]++;
  if (visit23_148_1(isTransform3dSupported !== undefined)) {
    _$jscoverage['/feature.js'].lineData[149]++;
    return isTransform3dSupported;
  }
  _$jscoverage['/feature.js'].lineData[152]++;
  if (visit24_152_1(!documentElement || !getVendorInfo('transform'))) {
    _$jscoverage['/feature.js'].lineData[153]++;
    isTransform3dSupported = false;
  } else {
    _$jscoverage['/feature.js'].lineData[158]++;
    var el = doc.createElement('p');
    _$jscoverage['/feature.js'].lineData[159]++;
    var transformProperty = getVendorInfo('transform').name;
    _$jscoverage['/feature.js'].lineData[160]++;
    documentElement.insertBefore(el, documentElement.firstChild);
    _$jscoverage['/feature.js'].lineData[161]++;
    el.style[transformProperty] = 'translate3d(1px,1px,1px)';
    _$jscoverage['/feature.js'].lineData[162]++;
    var computedStyle = win.getComputedStyle(el);
    _$jscoverage['/feature.js'].lineData[163]++;
    var has3d = visit25_163_1(computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty]);
    _$jscoverage['/feature.js'].lineData[164]++;
    documentElement.removeChild(el);
    _$jscoverage['/feature.js'].lineData[165]++;
    isTransform3dSupported = (visit26_165_1(visit27_165_2(has3d !== undefined) && visit28_165_3(visit29_165_4(has3d.length > 0) && visit30_165_5(has3d !== 'none'))));
  }
  _$jscoverage['/feature.js'].lineData[168]++;
  return isTransform3dSupported;
}, 
  isClassListSupported: function() {
  _$jscoverage['/feature.js'].functionData[10]++;
  _$jscoverage['/feature.js'].lineData[176]++;
  return isClassListSupportedState;
}, 
  isQuerySelectorSupported: function() {
  _$jscoverage['/feature.js'].functionData[11]++;
  _$jscoverage['/feature.js'].lineData[185]++;
  return visit31_185_1(!Config.simulateCss3Selector && isQuerySelectorSupportedState);
}, 
  getCssVendorInfo: function(name) {
  _$jscoverage['/feature.js'].functionData[12]++;
  _$jscoverage['/feature.js'].lineData[189]++;
  return getVendorInfo(name);
}};
  _$jscoverage['/feature.js'].lineData[193]++;
  return S.Feature;
});
