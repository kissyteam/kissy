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
  _$jscoverage['/features.js'].lineData[35] = 0;
  _$jscoverage['/features.js'].lineData[38] = 0;
  _$jscoverage['/features.js'].lineData[40] = 0;
  _$jscoverage['/features.js'].lineData[42] = 0;
  _$jscoverage['/features.js'].lineData[43] = 0;
  _$jscoverage['/features.js'].lineData[45] = 0;
  _$jscoverage['/features.js'].lineData[47] = 0;
  _$jscoverage['/features.js'].lineData[48] = 0;
  _$jscoverage['/features.js'].lineData[50] = 0;
  _$jscoverage['/features.js'].lineData[52] = 0;
  _$jscoverage['/features.js'].lineData[53] = 0;
  _$jscoverage['/features.js'].lineData[57] = 0;
  _$jscoverage['/features.js'].lineData[58] = 0;
  _$jscoverage['/features.js'].lineData[67] = 0;
  _$jscoverage['/features.js'].lineData[74] = 0;
  _$jscoverage['/features.js'].lineData[82] = 0;
  _$jscoverage['/features.js'].lineData[90] = 0;
  _$jscoverage['/features.js'].lineData[101] = 0;
  _$jscoverage['/features.js'].lineData[109] = 0;
  _$jscoverage['/features.js'].lineData[117] = 0;
  _$jscoverage['/features.js'].lineData[125] = 0;
  _$jscoverage['/features.js'].lineData[134] = 0;
  _$jscoverage['/features.js'].lineData[144] = 0;
  _$jscoverage['/features.js'].lineData[152] = 0;
  _$jscoverage['/features.js'].lineData[160] = 0;
  _$jscoverage['/features.js'].lineData[168] = 0;
  _$jscoverage['/features.js'].lineData[176] = 0;
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
}
if (! _$jscoverage['/features.js'].branchData) {
  _$jscoverage['/features.js'].branchData = {};
  _$jscoverage['/features.js'].branchData['19'] = [];
  _$jscoverage['/features.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['31'] = [];
  _$jscoverage['/features.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['32'] = [];
  _$jscoverage['/features.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['34'] = [];
  _$jscoverage['/features.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['35'] = [];
  _$jscoverage['/features.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['37'] = [];
  _$jscoverage['/features.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['45'] = [];
  _$jscoverage['/features.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['45'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['50'] = [];
  _$jscoverage['/features.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['50'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['58'] = [];
  _$jscoverage['/features.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['101'] = [];
  _$jscoverage['/features.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['101'][3] = new BranchData();
  _$jscoverage['/features.js'].branchData['109'] = [];
  _$jscoverage['/features.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['117'] = [];
  _$jscoverage['/features.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['134'] = [];
  _$jscoverage['/features.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['144'] = [];
  _$jscoverage['/features.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['144'][2] = new BranchData();
}
_$jscoverage['/features.js'].branchData['144'][2].init(30, 6, 'ie < v');
function visit30_144_2(result) {
  _$jscoverage['/features.js'].branchData['144'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['144'][1].init(24, 12, 'ie && ie < v');
function visit29_144_1(result) {
  _$jscoverage['/features.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['134'][1].init(69, 75, '!S.config(\'dom/selector\') && isQuerySelectorSupportedState');
function visit28_134_1(result) {
  _$jscoverage['/features.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['117'][1].init(21, 29, 'transformPrefix !== undefined');
function visit27_117_1(result) {
  _$jscoverage['/features.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['109'][1].init(21, 30, 'transitionPrefix !== undefined');
function visit26_109_1(result) {
  _$jscoverage['/features.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['101'][3].init(197, 6, 'ie > 7');
function visit25_101_3(result) {
  _$jscoverage['/features.js'].branchData['101'][3].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['101'][2].init(190, 13, '!ie || ie > 7');
function visit24_101_2(result) {
  _$jscoverage['/features.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['101'][1].init(163, 41, '(\'onhashchange\' in win) && (!ie || ie > 7)');
function visit23_101_1(result) {
  _$jscoverage['/features.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['58'][1].init(956, 19, 'win.navigator || {}');
function visit22_58_1(result) {
  _$jscoverage['/features.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['50'][2].init(369, 29, 'transformPrefix === undefined');
function visit21_50_2(result) {
  _$jscoverage['/features.js'].branchData['50'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['50'][1].init(369, 83, 'transformPrefix === undefined && transform in documentElementStyle');
function visit20_50_1(result) {
  _$jscoverage['/features.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['45'][2].init(157, 30, 'transitionPrefix === undefined');
function visit19_45_2(result) {
  _$jscoverage['/features.js'].branchData['45'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['45'][1].init(157, 85, 'transitionPrefix === undefined && transition in documentElementStyle');
function visit18_45_1(result) {
  _$jscoverage['/features.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['37'][1].init(72, 7, 'ie != 8');
function visit17_37_1(result) {
  _$jscoverage['/features.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['35'][1].init(14, 80, 'documentElement.querySelector && ie != 8');
function visit16_35_1(result) {
  _$jscoverage['/features.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['34'][1].init(848, 15, 'documentElement');
function visit15_34_1(result) {
  _$jscoverage['/features.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['32'][1].init(807, 21, 'documentMode || UA.ie');
function visit14_32_1(result) {
  _$jscoverage['/features.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['31'][1].init(750, 41, '(\'ontouchstart\' in doc) && !(UA.phantomjs)');
function visit13_31_1(result) {
  _$jscoverage['/features.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['19'][1].init(257, 18, 'win.document || {}');
function visit12_19_1(result) {
  _$jscoverage['/features.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/features.js'].functionData[0]++;
  _$jscoverage['/features.js'].lineData[7]++;
  var Env = S.Env, win = Env.host, UA = S.UA, VENDORS = ['', 'Webkit', 'Moz', 'O', 'ms'], doc = visit12_19_1(win.document || {}), documentMode = doc.documentMode, isMsPointerSupported, transitionProperty, transformProperty, transitionPrefix, transformPrefix, documentElement = doc.documentElement, documentElementStyle, isClassListSupportedState = true, isQuerySelectorSupportedState = false, isTouchEventSupportedState = visit13_31_1(('ontouchstart' in doc) && !(UA.phantomjs)), ie = visit14_32_1(documentMode || UA.ie);
  _$jscoverage['/features.js'].lineData[34]++;
  if (visit15_34_1(documentElement)) {
    _$jscoverage['/features.js'].lineData[35]++;
    if (visit16_35_1(documentElement.querySelector && visit17_37_1(ie != 8))) {
      _$jscoverage['/features.js'].lineData[38]++;
      isQuerySelectorSupportedState = true;
    }
    _$jscoverage['/features.js'].lineData[40]++;
    documentElementStyle = documentElement.style;
    _$jscoverage['/features.js'].lineData[42]++;
    S.each(VENDORS, function(val) {
  _$jscoverage['/features.js'].functionData[1]++;
  _$jscoverage['/features.js'].lineData[43]++;
  var transition = val ? val + 'Transition' : 'transition', transform = val ? val + 'Transform' : 'transform';
  _$jscoverage['/features.js'].lineData[45]++;
  if (visit18_45_1(visit19_45_2(transitionPrefix === undefined) && transition in documentElementStyle)) {
    _$jscoverage['/features.js'].lineData[47]++;
    transitionPrefix = val;
    _$jscoverage['/features.js'].lineData[48]++;
    transitionProperty = transition;
  }
  _$jscoverage['/features.js'].lineData[50]++;
  if (visit20_50_1(visit21_50_2(transformPrefix === undefined) && transform in documentElementStyle)) {
    _$jscoverage['/features.js'].lineData[52]++;
    transformPrefix = val;
    _$jscoverage['/features.js'].lineData[53]++;
    transformProperty = transform;
  }
});
    _$jscoverage['/features.js'].lineData[57]++;
    isClassListSupportedState = 'classList' in documentElement;
    _$jscoverage['/features.js'].lineData[58]++;
    isMsPointerSupported = "msPointerEnabled" in (visit22_58_1(win.navigator || {}));
  }
  _$jscoverage['/features.js'].lineData[67]++;
  S.Features = {
  isMsPointerSupported: function() {
  _$jscoverage['/features.js'].functionData[2]++;
  _$jscoverage['/features.js'].lineData[74]++;
  return isMsPointerSupported;
}, 
  isTouchEventSupported: function() {
  _$jscoverage['/features.js'].functionData[3]++;
  _$jscoverage['/features.js'].lineData[82]++;
  return isTouchEventSupportedState;
}, 
  isDeviceMotionSupported: function() {
  _$jscoverage['/features.js'].functionData[4]++;
  _$jscoverage['/features.js'].lineData[90]++;
  return !!win['DeviceMotionEvent'];
}, 
  'isHashChangeSupported': function() {
  _$jscoverage['/features.js'].functionData[5]++;
  _$jscoverage['/features.js'].lineData[101]++;
  return visit23_101_1(('onhashchange' in win) && (visit24_101_2(!ie || visit25_101_3(ie > 7))));
}, 
  'isTransitionSupported': function() {
  _$jscoverage['/features.js'].functionData[6]++;
  _$jscoverage['/features.js'].lineData[109]++;
  return visit26_109_1(transitionPrefix !== undefined);
}, 
  'isTransformSupported': function() {
  _$jscoverage['/features.js'].functionData[7]++;
  _$jscoverage['/features.js'].lineData[117]++;
  return visit27_117_1(transformPrefix !== undefined);
}, 
  'isClassListSupported': function() {
  _$jscoverage['/features.js'].functionData[8]++;
  _$jscoverage['/features.js'].lineData[125]++;
  return isClassListSupportedState;
}, 
  'isQuerySelectorSupported': function() {
  _$jscoverage['/features.js'].functionData[9]++;
  _$jscoverage['/features.js'].lineData[134]++;
  return visit28_134_1(!S.config('dom/selector') && isQuerySelectorSupportedState);
}, 
  'isIELessThan': function(v) {
  _$jscoverage['/features.js'].functionData[10]++;
  _$jscoverage['/features.js'].lineData[144]++;
  return !!(visit29_144_1(ie && visit30_144_2(ie < v)));
}, 
  'getTransitionPrefix': function() {
  _$jscoverage['/features.js'].functionData[11]++;
  _$jscoverage['/features.js'].lineData[152]++;
  return transitionPrefix;
}, 
  'getTransformPrefix': function() {
  _$jscoverage['/features.js'].functionData[12]++;
  _$jscoverage['/features.js'].lineData[160]++;
  return transformPrefix;
}, 
  'getTransitionProperty': function() {
  _$jscoverage['/features.js'].functionData[13]++;
  _$jscoverage['/features.js'].lineData[168]++;
  return transitionProperty;
}, 
  'getTransformProperty': function() {
  _$jscoverage['/features.js'].functionData[14]++;
  _$jscoverage['/features.js'].lineData[176]++;
  return transformProperty;
}};
})(KISSY);
