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
  _$jscoverage['/features.js'].lineData[33] = 0;
  _$jscoverage['/features.js'].lineData[35] = 0;
  _$jscoverage['/features.js'].lineData[36] = 0;
  _$jscoverage['/features.js'].lineData[38] = 0;
  _$jscoverage['/features.js'].lineData[39] = 0;
  _$jscoverage['/features.js'].lineData[40] = 0;
  _$jscoverage['/features.js'].lineData[41] = 0;
  _$jscoverage['/features.js'].lineData[42] = 0;
  _$jscoverage['/features.js'].lineData[46] = 0;
  _$jscoverage['/features.js'].lineData[47] = 0;
  _$jscoverage['/features.js'].lineData[48] = 0;
  _$jscoverage['/features.js'].lineData[51] = 0;
  _$jscoverage['/features.js'].lineData[52] = 0;
  _$jscoverage['/features.js'].lineData[57] = 0;
  _$jscoverage['/features.js'].lineData[61] = 0;
  _$jscoverage['/features.js'].lineData[62] = 0;
  _$jscoverage['/features.js'].lineData[63] = 0;
  _$jscoverage['/features.js'].lineData[64] = 0;
  _$jscoverage['/features.js'].lineData[71] = 0;
  _$jscoverage['/features.js'].lineData[76] = 0;
  _$jscoverage['/features.js'].lineData[85] = 0;
  _$jscoverage['/features.js'].lineData[93] = 0;
  _$jscoverage['/features.js'].lineData[102] = 0;
  _$jscoverage['/features.js'].lineData[110] = 0;
  _$jscoverage['/features.js'].lineData[114] = 0;
  _$jscoverage['/features.js'].lineData[122] = 0;
  _$jscoverage['/features.js'].lineData[133] = 0;
  _$jscoverage['/features.js'].lineData[141] = 0;
  _$jscoverage['/features.js'].lineData[142] = 0;
  _$jscoverage['/features.js'].lineData[144] = 0;
  _$jscoverage['/features.js'].lineData[145] = 0;
  _$jscoverage['/features.js'].lineData[150] = 0;
  _$jscoverage['/features.js'].lineData[151] = 0;
  _$jscoverage['/features.js'].lineData[152] = 0;
  _$jscoverage['/features.js'].lineData[153] = 0;
  _$jscoverage['/features.js'].lineData[154] = 0;
  _$jscoverage['/features.js'].lineData[155] = 0;
  _$jscoverage['/features.js'].lineData[156] = 0;
  _$jscoverage['/features.js'].lineData[157] = 0;
  _$jscoverage['/features.js'].lineData[160] = 0;
  _$jscoverage['/features.js'].lineData[168] = 0;
  _$jscoverage['/features.js'].lineData[177] = 0;
  _$jscoverage['/features.js'].lineData[181] = 0;
  _$jscoverage['/features.js'].lineData[185] = 0;
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
}
if (! _$jscoverage['/features.js'].branchData) {
  _$jscoverage['/features.js'].branchData = {};
  _$jscoverage['/features.js'].branchData['17'] = [];
  _$jscoverage['/features.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['23'] = [];
  _$jscoverage['/features.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['29'] = [];
  _$jscoverage['/features.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['33'] = [];
  _$jscoverage['/features.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['35'] = [];
  _$jscoverage['/features.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['35'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['40'] = [];
  _$jscoverage['/features.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['47'] = [];
  _$jscoverage['/features.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['51'] = [];
  _$jscoverage['/features.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['63'] = [];
  _$jscoverage['/features.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['71'] = [];
  _$jscoverage['/features.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['114'] = [];
  _$jscoverage['/features.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['114'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['133'] = [];
  _$jscoverage['/features.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['133'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['133'][3] = new BranchData();
  _$jscoverage['/features.js'].branchData['141'] = [];
  _$jscoverage['/features.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['144'] = [];
  _$jscoverage['/features.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['144'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['155'] = [];
  _$jscoverage['/features.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['157'] = [];
  _$jscoverage['/features.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['157'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['157'][3] = new BranchData();
  _$jscoverage['/features.js'].branchData['157'][4] = new BranchData();
  _$jscoverage['/features.js'].branchData['157'][5] = new BranchData();
  _$jscoverage['/features.js'].branchData['177'] = [];
  _$jscoverage['/features.js'].branchData['177'][1] = new BranchData();
}
_$jscoverage['/features.js'].branchData['177'][1].init(67, 58, '!S.config(\'dom/selector\') && isQuerySelectorSupportedState');
function visit35_177_1(result) {
  _$jscoverage['/features.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['157'][5].init(769, 16, 'has3d !== \'none\'');
function visit34_157_5(result) {
  _$jscoverage['/features.js'].branchData['157'][5].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['157'][4].init(749, 16, 'has3d.length > 0');
function visit33_157_4(result) {
  _$jscoverage['/features.js'].branchData['157'][4].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['157'][3].init(749, 36, 'has3d.length > 0 && has3d !== \'none\'');
function visit32_157_3(result) {
  _$jscoverage['/features.js'].branchData['157'][3].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['157'][2].init(726, 19, 'has3d !== undefined');
function visit31_157_2(result) {
  _$jscoverage['/features.js'].branchData['157'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['157'][1].init(726, 59, 'has3d !== undefined && has3d.length > 0 && has3d !== \'none\'');
function visit30_157_1(result) {
  _$jscoverage['/features.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['155'][1].init(548, 85, 'computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty]');
function visit29_155_1(result) {
  _$jscoverage['/features.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['144'][2].init(154, 43, 'getVendorInfo(\'transform\').prefix === false');
function visit28_144_2(result) {
  _$jscoverage['/features.js'].branchData['144'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['144'][1].init(134, 63, '!documentElement || getVendorInfo(\'transform\').prefix === false');
function visit27_144_1(result) {
  _$jscoverage['/features.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['141'][1].init(17, 36, 'isTransform3dSupported !== undefined');
function visit26_141_1(result) {
  _$jscoverage['/features.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['133'][3].init(192, 6, 'ie > 7');
function visit25_133_3(result) {
  _$jscoverage['/features.js'].branchData['133'][3].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['133'][2].init(185, 13, '!ie || ie > 7');
function visit24_133_2(result) {
  _$jscoverage['/features.js'].branchData['133'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['133'][1].init(158, 41, '(\'onhashchange\' in win) && (!ie || ie > 7)');
function visit23_133_1(result) {
  _$jscoverage['/features.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['114'][2].init(50, 42, 'isPointerSupported || isMsPointerSupported');
function visit22_114_2(result) {
  _$jscoverage['/features.js'].branchData['114'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['114'][1].init(20, 72, 'isTouchEventSupportedState || isPointerSupported || isMsPointerSupported');
function visit21_114_1(result) {
  _$jscoverage['/features.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['71'][1].init(502, 94, 'vendorInfos[name] || {\n  name: name, \n  prefix: false}');
function visit20_71_1(result) {
  _$jscoverage['/features.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['63'][1].init(79, 34, 'vendorName in documentElementStyle');
function visit19_63_1(result) {
  _$jscoverage['/features.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['51'][1].init(147, 53, '!documentElementStyle || name in documentElementStyle');
function visit18_51_1(result) {
  _$jscoverage['/features.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['47'][1].init(13, 17, 'vendorInfos[name]');
function visit17_47_1(result) {
  _$jscoverage['/features.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['40'][1].init(282, 19, 'win.navigator || {}');
function visit16_40_1(result) {
  _$jscoverage['/features.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['35'][2].init(68, 8, 'ie !== 8');
function visit15_35_2(result) {
  _$jscoverage['/features.js'].branchData['35'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['35'][1].init(35, 41, 'documentElement.querySelector && ie !== 8');
function visit14_35_1(result) {
  _$jscoverage['/features.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['33'][1].init(770, 15, 'documentElement');
function visit13_33_1(result) {
  _$jscoverage['/features.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['29'][1].init(662, 41, '(\'ontouchstart\' in doc) && !(UA.phantomjs)');
function visit12_29_1(result) {
  _$jscoverage['/features.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['23'][1].init(378, 26, 'doc && doc.documentElement');
function visit11_23_1(result) {
  _$jscoverage['/features.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['17'][1].init(218, 16, 'win.document || {}');
function visit10_17_1(result) {
  _$jscoverage['/features.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/features.js'].functionData[0]++;
  _$jscoverage['/features.js'].lineData[7]++;
  var win = S.Env.host, UA = S.UA, VENDORS = ['Webkit', 'Moz', 'O', 'ms'], doc = visit10_17_1(win.document || {}), isMsPointerSupported, isPointerSupported, isTransform3dSupported, documentElement = visit11_23_1(doc && doc.documentElement), navigator, documentElementStyle, isClassListSupportedState = true, isQuerySelectorSupportedState = false, isTouchEventSupportedState = visit12_29_1(('ontouchstart' in doc) && !(UA.phantomjs)), vendorInfos = {}, ie = UA.ieMode;
  _$jscoverage['/features.js'].lineData[33]++;
  if (visit13_33_1(documentElement)) {
    _$jscoverage['/features.js'].lineData[35]++;
    if (visit14_35_1(documentElement.querySelector && visit15_35_2(ie !== 8))) {
      _$jscoverage['/features.js'].lineData[36]++;
      isQuerySelectorSupportedState = true;
    }
    _$jscoverage['/features.js'].lineData[38]++;
    documentElementStyle = documentElement.style;
    _$jscoverage['/features.js'].lineData[39]++;
    isClassListSupportedState = 'classList' in documentElement;
    _$jscoverage['/features.js'].lineData[40]++;
    navigator = visit16_40_1(win.navigator || {});
    _$jscoverage['/features.js'].lineData[41]++;
    isMsPointerSupported = 'msPointerEnabled' in navigator;
    _$jscoverage['/features.js'].lineData[42]++;
    isPointerSupported = 'pointerEnabled' in navigator;
  }
  _$jscoverage['/features.js'].lineData[46]++;
  function getVendorInfo(name) {
    _$jscoverage['/features.js'].functionData[1]++;
    _$jscoverage['/features.js'].lineData[47]++;
    if (visit17_47_1(vendorInfos[name])) {
      _$jscoverage['/features.js'].lineData[48]++;
      return vendorInfos[name];
    }
    _$jscoverage['/features.js'].lineData[51]++;
    if (visit18_51_1(!documentElementStyle || name in documentElementStyle)) {
      _$jscoverage['/features.js'].lineData[52]++;
      vendorInfos[name] = {
  name: name, 
  prefix: ''};
    } else {
      _$jscoverage['/features.js'].lineData[57]++;
      var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1), vendorName, i = VENDORS.length;
      _$jscoverage['/features.js'].lineData[61]++;
      while (i--) {
        _$jscoverage['/features.js'].lineData[62]++;
        vendorName = VENDORS[i] + upperFirstName;
        _$jscoverage['/features.js'].lineData[63]++;
        if (visit19_63_1(vendorName in documentElementStyle)) {
          _$jscoverage['/features.js'].lineData[64]++;
          vendorInfos[name] = {
  name: vendorName, 
  prefix: VENDORS[i]};
        }
      }
      _$jscoverage['/features.js'].lineData[71]++;
      vendorInfos[name] = visit20_71_1(vendorInfos[name] || {
  name: name, 
  prefix: false});
    }
    _$jscoverage['/features.js'].lineData[76]++;
    return vendorInfos[name];
  }
  _$jscoverage['/features.js'].lineData[85]++;
  S.Features = {
  isMsPointerSupported: function() {
  _$jscoverage['/features.js'].functionData[2]++;
  _$jscoverage['/features.js'].lineData[93]++;
  return isMsPointerSupported;
}, 
  isPointerSupported: function() {
  _$jscoverage['/features.js'].functionData[3]++;
  _$jscoverage['/features.js'].lineData[102]++;
  return isPointerSupported;
}, 
  isTouchEventSupported: function() {
  _$jscoverage['/features.js'].functionData[4]++;
  _$jscoverage['/features.js'].lineData[110]++;
  return isTouchEventSupportedState;
}, 
  isTouchGestureSupported: function() {
  _$jscoverage['/features.js'].functionData[5]++;
  _$jscoverage['/features.js'].lineData[114]++;
  return visit21_114_1(isTouchEventSupportedState || visit22_114_2(isPointerSupported || isMsPointerSupported));
}, 
  isDeviceMotionSupported: function() {
  _$jscoverage['/features.js'].functionData[6]++;
  _$jscoverage['/features.js'].lineData[122]++;
  return !!win.DeviceMotionEvent;
}, 
  isHashChangeSupported: function() {
  _$jscoverage['/features.js'].functionData[7]++;
  _$jscoverage['/features.js'].lineData[133]++;
  return visit23_133_1(('onhashchange' in win) && (visit24_133_2(!ie || visit25_133_3(ie > 7))));
}, 
  isTransform3dSupported: function() {
  _$jscoverage['/features.js'].functionData[8]++;
  _$jscoverage['/features.js'].lineData[141]++;
  if (visit26_141_1(isTransform3dSupported !== undefined)) {
    _$jscoverage['/features.js'].lineData[142]++;
    return isTransform3dSupported;
  }
  _$jscoverage['/features.js'].lineData[144]++;
  if (visit27_144_1(!documentElement || visit28_144_2(getVendorInfo('transform').prefix === false))) {
    _$jscoverage['/features.js'].lineData[145]++;
    isTransform3dSupported = false;
  } else {
    _$jscoverage['/features.js'].lineData[150]++;
    var el = doc.createElement('p');
    _$jscoverage['/features.js'].lineData[151]++;
    var transformProperty = getVendorInfo('transform').name;
    _$jscoverage['/features.js'].lineData[152]++;
    documentElement.insertBefore(el, documentElement.firstChild);
    _$jscoverage['/features.js'].lineData[153]++;
    el.style[transformProperty] = 'translate3d(1px,1px,1px)';
    _$jscoverage['/features.js'].lineData[154]++;
    var computedStyle = win.getComputedStyle(el);
    _$jscoverage['/features.js'].lineData[155]++;
    var has3d = visit29_155_1(computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty]);
    _$jscoverage['/features.js'].lineData[156]++;
    documentElement.removeChild(el);
    _$jscoverage['/features.js'].lineData[157]++;
    isTransform3dSupported = (visit30_157_1(visit31_157_2(has3d !== undefined) && visit32_157_3(visit33_157_4(has3d.length > 0) && visit34_157_5(has3d !== 'none'))));
  }
  _$jscoverage['/features.js'].lineData[160]++;
  return isTransform3dSupported;
}, 
  isClassListSupported: function() {
  _$jscoverage['/features.js'].functionData[9]++;
  _$jscoverage['/features.js'].lineData[168]++;
  return isClassListSupportedState;
}, 
  isQuerySelectorSupported: function() {
  _$jscoverage['/features.js'].functionData[10]++;
  _$jscoverage['/features.js'].lineData[177]++;
  return visit35_177_1(!S.config('dom/selector') && isQuerySelectorSupportedState);
}, 
  getVendorCssPropPrefix: function(name) {
  _$jscoverage['/features.js'].functionData[11]++;
  _$jscoverage['/features.js'].lineData[181]++;
  return getVendorInfo(name).prefix;
}, 
  getVendorCssPropName: function(name) {
  _$jscoverage['/features.js'].functionData[12]++;
  _$jscoverage['/features.js'].lineData[185]++;
  return getVendorInfo(name).name;
}};
})(KISSY);
