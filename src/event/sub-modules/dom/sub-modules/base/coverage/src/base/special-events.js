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
if (! _$jscoverage['/base/special-events.js']) {
  _$jscoverage['/base/special-events.js'] = {};
  _$jscoverage['/base/special-events.js'].lineData = [];
  _$jscoverage['/base/special-events.js'].lineData[6] = 0;
  _$jscoverage['/base/special-events.js'].lineData[7] = 0;
  _$jscoverage['/base/special-events.js'].lineData[8] = 0;
  _$jscoverage['/base/special-events.js'].lineData[10] = 0;
  _$jscoverage['/base/special-events.js'].lineData[14] = 0;
  _$jscoverage['/base/special-events.js'].lineData[26] = 0;
  _$jscoverage['/base/special-events.js'].lineData[27] = 0;
  _$jscoverage['/base/special-events.js'].lineData[29] = 0;
  _$jscoverage['/base/special-events.js'].lineData[30] = 0;
  _$jscoverage['/base/special-events.js'].lineData[32] = 0;
  _$jscoverage['/base/special-events.js'].lineData[39] = 0;
  _$jscoverage['/base/special-events.js'].lineData[40] = 0;
  _$jscoverage['/base/special-events.js'].lineData[45] = 0;
  _$jscoverage['/base/special-events.js'].lineData[46] = 0;
  _$jscoverage['/base/special-events.js'].lineData[47] = 0;
  _$jscoverage['/base/special-events.js'].lineData[48] = 0;
  _$jscoverage['/base/special-events.js'].lineData[49] = 0;
  _$jscoverage['/base/special-events.js'].lineData[52] = 0;
  _$jscoverage['/base/special-events.js'].lineData[59] = 0;
  _$jscoverage['/base/special-events.js'].lineData[60] = 0;
  _$jscoverage['/base/special-events.js'].lineData[65] = 0;
  _$jscoverage['/base/special-events.js'].lineData[66] = 0;
  _$jscoverage['/base/special-events.js'].lineData[67] = 0;
  _$jscoverage['/base/special-events.js'].lineData[68] = 0;
  _$jscoverage['/base/special-events.js'].lineData[69] = 0;
  _$jscoverage['/base/special-events.js'].lineData[72] = 0;
}
if (! _$jscoverage['/base/special-events.js'].functionData) {
  _$jscoverage['/base/special-events.js'].functionData = [];
  _$jscoverage['/base/special-events.js'].functionData[0] = 0;
  _$jscoverage['/base/special-events.js'].functionData[1] = 0;
  _$jscoverage['/base/special-events.js'].functionData[2] = 0;
  _$jscoverage['/base/special-events.js'].functionData[3] = 0;
  _$jscoverage['/base/special-events.js'].functionData[4] = 0;
  _$jscoverage['/base/special-events.js'].functionData[5] = 0;
}
if (! _$jscoverage['/base/special-events.js'].branchData) {
  _$jscoverage['/base/special-events.js'].branchData = {};
  _$jscoverage['/base/special-events.js'].branchData['27'] = [];
  _$jscoverage['/base/special-events.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['27'][2] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['27'][3] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['28'] = [];
  _$jscoverage['/base/special-events.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['28'][2] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['39'] = [];
  _$jscoverage['/base/special-events.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['46'] = [];
  _$jscoverage['/base/special-events.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['47'] = [];
  _$jscoverage['/base/special-events.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['47'][2] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['59'] = [];
  _$jscoverage['/base/special-events.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['66'] = [];
  _$jscoverage['/base/special-events.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['67'] = [];
  _$jscoverage['/base/special-events.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['67'][2] = new BranchData();
}
_$jscoverage['/base/special-events.js'].branchData['67'][2].init(25, 45, 'target === target.ownerDocument.activeElement');
function visit201_67_2(result) {
  _$jscoverage['/base/special-events.js'].branchData['67'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['67'][1].init(25, 60, 'target === target.ownerDocument.activeElement && target.blur');
function visit200_67_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['66'][1].init(56, 37, '!onlyHandlers && target.ownerDocument');
function visit199_66_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['59'][1].init(21, 13, '!onlyHandlers');
function visit198_59_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['47'][2].init(25, 45, 'target !== target.ownerDocument.activeElement');
function visit197_47_2(result) {
  _$jscoverage['/base/special-events.js'].branchData['47'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['47'][1].init(25, 61, 'target !== target.ownerDocument.activeElement && target.focus');
function visit196_47_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['46'][1].init(56, 37, '!onlyHandlers && target.ownerDocument');
function visit195_46_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['39'][1].init(21, 13, '!onlyHandlers');
function visit194_39_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['28'][2].init(150, 40, 'target.nodeName.toLowerCase() == \'input\'');
function visit193_28_2(result) {
  _$jscoverage['/base/special-events.js'].branchData['28'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['28'][1].init(57, 56, 'target.click && target.nodeName.toLowerCase() == \'input\'');
function visit192_28_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['27'][3].init(73, 34, 'String(target.type) === "checkbox"');
function visit191_27_3(result) {
  _$jscoverage['/base/special-events.js'].branchData['27'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['27'][2].init(73, 114, 'String(target.type) === "checkbox" && target.click && target.nodeName.toLowerCase() == \'input\'');
function visit190_27_2(result) {
  _$jscoverage['/base/special-events.js'].branchData['27'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['27'][1].init(56, 131, '!onlyHandlers && String(target.type) === "checkbox" && target.click && target.nodeName.toLowerCase() == \'input\'');
function visit189_27_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/special-events.js'].functionData[0]++;
  _$jscoverage['/base/special-events.js'].lineData[7]++;
  var DomEvent = require('./dom-event');
  _$jscoverage['/base/special-events.js'].lineData[8]++;
  var Special = require('./special');
  _$jscoverage['/base/special-events.js'].lineData[10]++;
  var undefined = undefined, UA = S.UA, MOUSE_WHEEL = UA.gecko ? 'DOMMouseScroll' : 'mousewheel';
  _$jscoverage['/base/special-events.js'].lineData[14]++;
  return S.mix(Special, {
  mousewheel: {
  typeFix: MOUSE_WHEEL}, 
  load: {
  bubbles: false}, 
  click: {
  fire: function(onlyHandlers) {
  _$jscoverage['/base/special-events.js'].functionData[1]++;
  _$jscoverage['/base/special-events.js'].lineData[26]++;
  var target = this;
  _$jscoverage['/base/special-events.js'].lineData[27]++;
  if (visit189_27_1(!onlyHandlers && visit190_27_2(visit191_27_3(String(target.type) === "checkbox") && visit192_28_1(target.click && visit193_28_2(target.nodeName.toLowerCase() == 'input'))))) {
    _$jscoverage['/base/special-events.js'].lineData[29]++;
    target.click();
    _$jscoverage['/base/special-events.js'].lineData[30]++;
    return false;
  }
  _$jscoverage['/base/special-events.js'].lineData[32]++;
  return undefined;
}}, 
  focus: {
  bubbles: false, 
  preFire: function(event, onlyHandlers) {
  _$jscoverage['/base/special-events.js'].functionData[2]++;
  _$jscoverage['/base/special-events.js'].lineData[39]++;
  if (visit194_39_1(!onlyHandlers)) {
    _$jscoverage['/base/special-events.js'].lineData[40]++;
    return DomEvent.fire(this, 'focusin');
  }
}, 
  fire: function(onlyHandlers) {
  _$jscoverage['/base/special-events.js'].functionData[3]++;
  _$jscoverage['/base/special-events.js'].lineData[45]++;
  var target = this;
  _$jscoverage['/base/special-events.js'].lineData[46]++;
  if (visit195_46_1(!onlyHandlers && target.ownerDocument)) {
    _$jscoverage['/base/special-events.js'].lineData[47]++;
    if (visit196_47_1(visit197_47_2(target !== target.ownerDocument.activeElement) && target.focus)) {
      _$jscoverage['/base/special-events.js'].lineData[48]++;
      target.focus();
      _$jscoverage['/base/special-events.js'].lineData[49]++;
      return false;
    }
  }
  _$jscoverage['/base/special-events.js'].lineData[52]++;
  return undefined;
}}, 
  blur: {
  bubbles: false, 
  preFire: function(event, onlyHandlers) {
  _$jscoverage['/base/special-events.js'].functionData[4]++;
  _$jscoverage['/base/special-events.js'].lineData[59]++;
  if (visit198_59_1(!onlyHandlers)) {
    _$jscoverage['/base/special-events.js'].lineData[60]++;
    return DomEvent.fire(this, 'focusout');
  }
}, 
  fire: function(onlyHandlers) {
  _$jscoverage['/base/special-events.js'].functionData[5]++;
  _$jscoverage['/base/special-events.js'].lineData[65]++;
  var target = this;
  _$jscoverage['/base/special-events.js'].lineData[66]++;
  if (visit199_66_1(!onlyHandlers && target.ownerDocument)) {
    _$jscoverage['/base/special-events.js'].lineData[67]++;
    if (visit200_67_1(visit201_67_2(target === target.ownerDocument.activeElement) && target.blur)) {
      _$jscoverage['/base/special-events.js'].lineData[68]++;
      target.blur();
      _$jscoverage['/base/special-events.js'].lineData[69]++;
      return false;
    }
  }
  _$jscoverage['/base/special-events.js'].lineData[72]++;
  return undefined;
}}});
});
