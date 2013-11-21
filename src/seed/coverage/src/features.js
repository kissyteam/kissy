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
  _$jscoverage['/features.js'].lineData[36] = 0;
  _$jscoverage['/features.js'].lineData[37] = 0;
  _$jscoverage['/features.js'].lineData[40] = 0;
  _$jscoverage['/features.js'].lineData[42] = 0;
  _$jscoverage['/features.js'].lineData[44] = 0;
  _$jscoverage['/features.js'].lineData[45] = 0;
  _$jscoverage['/features.js'].lineData[47] = 0;
  _$jscoverage['/features.js'].lineData[49] = 0;
  _$jscoverage['/features.js'].lineData[50] = 0;
  _$jscoverage['/features.js'].lineData[52] = 0;
  _$jscoverage['/features.js'].lineData[54] = 0;
  _$jscoverage['/features.js'].lineData[55] = 0;
  _$jscoverage['/features.js'].lineData[59] = 0;
  _$jscoverage['/features.js'].lineData[60] = 0;
  _$jscoverage['/features.js'].lineData[61] = 0;
  _$jscoverage['/features.js'].lineData[62] = 0;
  _$jscoverage['/features.js'].lineData[71] = 0;
  _$jscoverage['/features.js'].lineData[79] = 0;
  _$jscoverage['/features.js'].lineData[88] = 0;
  _$jscoverage['/features.js'].lineData[96] = 0;
  _$jscoverage['/features.js'].lineData[104] = 0;
  _$jscoverage['/features.js'].lineData[115] = 0;
  _$jscoverage['/features.js'].lineData[123] = 0;
  _$jscoverage['/features.js'].lineData[131] = 0;
  _$jscoverage['/features.js'].lineData[139] = 0;
  _$jscoverage['/features.js'].lineData[148] = 0;
  _$jscoverage['/features.js'].lineData[158] = 0;
  _$jscoverage['/features.js'].lineData[166] = 0;
  _$jscoverage['/features.js'].lineData[174] = 0;
  _$jscoverage['/features.js'].lineData[182] = 0;
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
  _$jscoverage['/features.js'].functionData[14] = 0;
  _$jscoverage['/features.js'].functionData[15] = 0;
}
if (! _$jscoverage['/features.js'].branchData) {
  _$jscoverage['/features.js'].branchData = {};
  _$jscoverage['/features.js'].branchData['19'] = [];
  _$jscoverage['/features.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['33'] = [];
  _$jscoverage['/features.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['34'] = [];
  _$jscoverage['/features.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['36'] = [];
  _$jscoverage['/features.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['37'] = [];
  _$jscoverage['/features.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['39'] = [];
  _$jscoverage['/features.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['47'] = [];
  _$jscoverage['/features.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['47'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['52'] = [];
  _$jscoverage['/features.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['52'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['60'] = [];
  _$jscoverage['/features.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['115'] = [];
  _$jscoverage['/features.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['115'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['115'][3] = new BranchData();
  _$jscoverage['/features.js'].branchData['123'] = [];
  _$jscoverage['/features.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['131'] = [];
  _$jscoverage['/features.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['148'] = [];
  _$jscoverage['/features.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['158'] = [];
  _$jscoverage['/features.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['158'][2] = new BranchData();
}
_$jscoverage['/features.js'].branchData['158'][2].init(29, 6, 'ie < v');
function visit30_158_2(result) {
  _$jscoverage['/features.js'].branchData['158'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['158'][1].init(23, 12, 'ie && ie < v');
function visit29_158_1(result) {
  _$jscoverage['/features.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['148'][1].init(67, 74, '!S.config(\'dom/selector\') && isQuerySelectorSupportedState');
function visit28_148_1(result) {
  _$jscoverage['/features.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['131'][1].init(20, 29, 'transformPrefix !== undefined');
function visit27_131_1(result) {
  _$jscoverage['/features.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['123'][1].init(20, 30, 'transitionPrefix !== undefined');
function visit26_123_1(result) {
  _$jscoverage['/features.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['115'][3].init(193, 6, 'ie > 7');
function visit25_115_3(result) {
  _$jscoverage['/features.js'].branchData['115'][3].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['115'][2].init(186, 13, '!ie || ie > 7');
function visit24_115_2(result) {
  _$jscoverage['/features.js'].branchData['115'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['115'][1].init(159, 41, '(\'onhashchange\' in win) && (!ie || ie > 7)');
function visit23_115_1(result) {
  _$jscoverage['/features.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['60'][1].init(903, 19, 'win.navigator || {}');
function visit22_60_1(result) {
  _$jscoverage['/features.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['52'][2].init(361, 29, 'transformPrefix === undefined');
function visit21_52_2(result) {
  _$jscoverage['/features.js'].branchData['52'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['52'][1].init(361, 82, 'transformPrefix === undefined && transform in documentElementStyle');
function visit20_52_1(result) {
  _$jscoverage['/features.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['47'][2].init(154, 30, 'transitionPrefix === undefined');
function visit19_47_2(result) {
  _$jscoverage['/features.js'].branchData['47'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['47'][1].init(154, 84, 'transitionPrefix === undefined && transition in documentElementStyle');
function visit18_47_1(result) {
  _$jscoverage['/features.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['39'][1].init(70, 7, 'ie != 8');
function visit17_39_1(result) {
  _$jscoverage['/features.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['37'][1].init(13, 78, 'documentElement.querySelector && ie != 8');
function visit16_37_1(result) {
  _$jscoverage['/features.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['36'][1].init(860, 15, 'documentElement');
function visit15_36_1(result) {
  _$jscoverage['/features.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['34'][1].init(822, 21, 'documentMode || UA.ie');
function visit14_34_1(result) {
  _$jscoverage['/features.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['33'][1].init(766, 41, '(\'ontouchstart\' in doc) && !(UA.phantomjs)');
function visit13_33_1(result) {
  _$jscoverage['/features.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['19'][1].init(245, 18, 'win.document || {}');
function visit12_19_1(result) {
  _$jscoverage['/features.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/features.js'].functionData[0]++;
  _$jscoverage['/features.js'].lineData[7]++;
  var Env = S.Env, win = Env.host, UA = S.UA, VENDORS = ['', 'Webkit', 'Moz', 'O', 'ms'], doc = visit12_19_1(win.document || {}), documentMode = doc.documentMode, isMsPointerSupported, isPointerSupported, transitionProperty, transformProperty, transitionPrefix, transformPrefix, documentElement = doc.documentElement, documentElementStyle, isClassListSupportedState = true, isQuerySelectorSupportedState = false, isTouchEventSupportedState = visit13_33_1(('ontouchstart' in doc) && !(UA.phantomjs)), ie = visit14_34_1(documentMode || UA.ie);
  _$jscoverage['/features.js'].lineData[36]++;
  if (visit15_36_1(documentElement)) {
    _$jscoverage['/features.js'].lineData[37]++;
    if (visit16_37_1(documentElement.querySelector && visit17_39_1(ie != 8))) {
      _$jscoverage['/features.js'].lineData[40]++;
      isQuerySelectorSupportedState = true;
    }
    _$jscoverage['/features.js'].lineData[42]++;
    documentElementStyle = documentElement.style;
    _$jscoverage['/features.js'].lineData[44]++;
    S.each(VENDORS, function(val) {
  _$jscoverage['/features.js'].functionData[1]++;
  _$jscoverage['/features.js'].lineData[45]++;
  var transition = val ? val + 'Transition' : 'transition', transform = val ? val + 'Transform' : 'transform';
  _$jscoverage['/features.js'].lineData[47]++;
  if (visit18_47_1(visit19_47_2(transitionPrefix === undefined) && transition in documentElementStyle)) {
    _$jscoverage['/features.js'].lineData[49]++;
    transitionPrefix = val;
    _$jscoverage['/features.js'].lineData[50]++;
    transitionProperty = transition;
  }
  _$jscoverage['/features.js'].lineData[52]++;
  if (visit20_52_1(visit21_52_2(transformPrefix === undefined) && transform in documentElementStyle)) {
    _$jscoverage['/features.js'].lineData[54]++;
    transformPrefix = val;
    _$jscoverage['/features.js'].lineData[55]++;
    transformProperty = transform;
  }
});
    _$jscoverage['/features.js'].lineData[59]++;
    isClassListSupportedState = 'classList' in documentElement;
    _$jscoverage['/features.js'].lineData[60]++;
    var navigator = (visit22_60_1(win.navigator || {}));
    _$jscoverage['/features.js'].lineData[61]++;
    isMsPointerSupported = "msPointerEnabled" in navigator;
    _$jscoverage['/features.js'].lineData[62]++;
    isPointerSupported = "pointerEnabled" in navigator;
  }
  _$jscoverage['/features.js'].lineData[71]++;
  S.Features = {
  isMsPointerSupported: function() {
  _$jscoverage['/features.js'].functionData[2]++;
  _$jscoverage['/features.js'].lineData[79]++;
  return isMsPointerSupported;
}, 
  isPointerSupported: function() {
  _$jscoverage['/features.js'].functionData[3]++;
  _$jscoverage['/features.js'].lineData[88]++;
  return isPointerSupported;
}, 
  isTouchEventSupported: function() {
  _$jscoverage['/features.js'].functionData[4]++;
  _$jscoverage['/features.js'].lineData[96]++;
  return isTouchEventSupportedState;
}, 
  isDeviceMotionSupported: function() {
  _$jscoverage['/features.js'].functionData[5]++;
  _$jscoverage['/features.js'].lineData[104]++;
  return !!win['DeviceMotionEvent'];
}, 
  'isHashChangeSupported': function() {
  _$jscoverage['/features.js'].functionData[6]++;
  _$jscoverage['/features.js'].lineData[115]++;
  return visit23_115_1(('onhashchange' in win) && (visit24_115_2(!ie || visit25_115_3(ie > 7))));
}, 
  'isTransitionSupported': function() {
  _$jscoverage['/features.js'].functionData[7]++;
  _$jscoverage['/features.js'].lineData[123]++;
  return visit26_123_1(transitionPrefix !== undefined);
}, 
  'isTransformSupported': function() {
  _$jscoverage['/features.js'].functionData[8]++;
  _$jscoverage['/features.js'].lineData[131]++;
  return visit27_131_1(transformPrefix !== undefined);
}, 
  'isClassListSupported': function() {
  _$jscoverage['/features.js'].functionData[9]++;
  _$jscoverage['/features.js'].lineData[139]++;
  return isClassListSupportedState;
}, 
  'isQuerySelectorSupported': function() {
  _$jscoverage['/features.js'].functionData[10]++;
  _$jscoverage['/features.js'].lineData[148]++;
  return visit28_148_1(!S.config('dom/selector') && isQuerySelectorSupportedState);
}, 
  'isIELessThan': function(v) {
  _$jscoverage['/features.js'].functionData[11]++;
  _$jscoverage['/features.js'].lineData[158]++;
  return !!(visit29_158_1(ie && visit30_158_2(ie < v)));
}, 
  'getTransitionPrefix': function() {
  _$jscoverage['/features.js'].functionData[12]++;
  _$jscoverage['/features.js'].lineData[166]++;
  return transitionPrefix;
}, 
  'getTransformPrefix': function() {
  _$jscoverage['/features.js'].functionData[13]++;
  _$jscoverage['/features.js'].lineData[174]++;
  return transformPrefix;
}, 
  'getTransitionProperty': function() {
  _$jscoverage['/features.js'].functionData[14]++;
  _$jscoverage['/features.js'].lineData[182]++;
  return transitionProperty;
}, 
  'getTransformProperty': function() {
  _$jscoverage['/features.js'].functionData[15]++;
  _$jscoverage['/features.js'].lineData[190]++;
  return transformProperty;
}};
})(KISSY);
