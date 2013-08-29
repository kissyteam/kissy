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
  _$jscoverage['/base/special-events.js'].lineData[11] = 0;
  _$jscoverage['/base/special-events.js'].lineData[24] = 0;
  _$jscoverage['/base/special-events.js'].lineData[25] = 0;
  _$jscoverage['/base/special-events.js'].lineData[27] = 0;
  _$jscoverage['/base/special-events.js'].lineData[28] = 0;
  _$jscoverage['/base/special-events.js'].lineData[30] = 0;
  _$jscoverage['/base/special-events.js'].lineData[37] = 0;
  _$jscoverage['/base/special-events.js'].lineData[38] = 0;
  _$jscoverage['/base/special-events.js'].lineData[43] = 0;
  _$jscoverage['/base/special-events.js'].lineData[44] = 0;
  _$jscoverage['/base/special-events.js'].lineData[45] = 0;
  _$jscoverage['/base/special-events.js'].lineData[46] = 0;
  _$jscoverage['/base/special-events.js'].lineData[47] = 0;
  _$jscoverage['/base/special-events.js'].lineData[50] = 0;
  _$jscoverage['/base/special-events.js'].lineData[57] = 0;
  _$jscoverage['/base/special-events.js'].lineData[58] = 0;
  _$jscoverage['/base/special-events.js'].lineData[63] = 0;
  _$jscoverage['/base/special-events.js'].lineData[64] = 0;
  _$jscoverage['/base/special-events.js'].lineData[65] = 0;
  _$jscoverage['/base/special-events.js'].lineData[66] = 0;
  _$jscoverage['/base/special-events.js'].lineData[67] = 0;
  _$jscoverage['/base/special-events.js'].lineData[70] = 0;
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
  _$jscoverage['/base/special-events.js'].branchData['25'] = [];
  _$jscoverage['/base/special-events.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['25'][2] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['25'][3] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['26'] = [];
  _$jscoverage['/base/special-events.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['26'][2] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['37'] = [];
  _$jscoverage['/base/special-events.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['44'] = [];
  _$jscoverage['/base/special-events.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['45'] = [];
  _$jscoverage['/base/special-events.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['45'][2] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['57'] = [];
  _$jscoverage['/base/special-events.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['64'] = [];
  _$jscoverage['/base/special-events.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['65'] = [];
  _$jscoverage['/base/special-events.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['65'][2] = new BranchData();
}
_$jscoverage['/base/special-events.js'].branchData['65'][2].init(26, 45, 'target === target.ownerDocument.activeElement');
function visit201_65_2(result) {
  _$jscoverage['/base/special-events.js'].branchData['65'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['65'][1].init(26, 60, 'target === target.ownerDocument.activeElement && target.blur');
function visit200_65_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['64'][1].init(58, 37, '!onlyHandlers && target.ownerDocument');
function visit199_64_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['57'][1].init(22, 13, '!onlyHandlers');
function visit198_57_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['45'][2].init(26, 45, 'target !== target.ownerDocument.activeElement');
function visit197_45_2(result) {
  _$jscoverage['/base/special-events.js'].branchData['45'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['45'][1].init(26, 61, 'target !== target.ownerDocument.activeElement && target.focus');
function visit196_45_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['44'][1].init(58, 37, '!onlyHandlers && target.ownerDocument');
function visit195_44_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['37'][1].init(22, 13, '!onlyHandlers');
function visit194_37_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['26'][2].init(153, 40, 'target.nodeName.toLowerCase() == \'input\'');
function visit193_26_2(result) {
  _$jscoverage['/base/special-events.js'].branchData['26'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['26'][1].init(58, 56, 'target.click && target.nodeName.toLowerCase() == \'input\'');
function visit192_26_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['25'][3].init(75, 34, 'String(target.type) === "checkbox"');
function visit191_25_3(result) {
  _$jscoverage['/base/special-events.js'].branchData['25'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['25'][2].init(75, 115, 'String(target.type) === "checkbox" && target.click && target.nodeName.toLowerCase() == \'input\'');
function visit190_25_2(result) {
  _$jscoverage['/base/special-events.js'].branchData['25'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['25'][1].init(58, 132, '!onlyHandlers && String(target.type) === "checkbox" && target.click && target.nodeName.toLowerCase() == \'input\'');
function visit189_25_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].lineData[6]++;
KISSY.add('event/dom/base/special-events', function(S, DomEvent, Special) {
  _$jscoverage['/base/special-events.js'].functionData[0]++;
  _$jscoverage['/base/special-events.js'].lineData[7]++;
  var undefined = undefined, UA = S.UA, MOUSE_WHEEL = UA.gecko ? 'DOMMouseScroll' : 'mousewheel';
  _$jscoverage['/base/special-events.js'].lineData[11]++;
  return S.mix(Special, {
  mousewheel: {
  typeFix: MOUSE_WHEEL}, 
  load: {
  bubbles: false}, 
  click: {
  fire: function(onlyHandlers) {
  _$jscoverage['/base/special-events.js'].functionData[1]++;
  _$jscoverage['/base/special-events.js'].lineData[24]++;
  var target = this;
  _$jscoverage['/base/special-events.js'].lineData[25]++;
  if (visit189_25_1(!onlyHandlers && visit190_25_2(visit191_25_3(String(target.type) === "checkbox") && visit192_26_1(target.click && visit193_26_2(target.nodeName.toLowerCase() == 'input'))))) {
    _$jscoverage['/base/special-events.js'].lineData[27]++;
    target.click();
    _$jscoverage['/base/special-events.js'].lineData[28]++;
    return false;
  }
  _$jscoverage['/base/special-events.js'].lineData[30]++;
  return undefined;
}}, 
  focus: {
  bubbles: false, 
  preFire: function(event, onlyHandlers) {
  _$jscoverage['/base/special-events.js'].functionData[2]++;
  _$jscoverage['/base/special-events.js'].lineData[37]++;
  if (visit194_37_1(!onlyHandlers)) {
    _$jscoverage['/base/special-events.js'].lineData[38]++;
    return DomEvent.fire(this, 'focusin');
  }
}, 
  fire: function(onlyHandlers) {
  _$jscoverage['/base/special-events.js'].functionData[3]++;
  _$jscoverage['/base/special-events.js'].lineData[43]++;
  var target = this;
  _$jscoverage['/base/special-events.js'].lineData[44]++;
  if (visit195_44_1(!onlyHandlers && target.ownerDocument)) {
    _$jscoverage['/base/special-events.js'].lineData[45]++;
    if (visit196_45_1(visit197_45_2(target !== target.ownerDocument.activeElement) && target.focus)) {
      _$jscoverage['/base/special-events.js'].lineData[46]++;
      target.focus();
      _$jscoverage['/base/special-events.js'].lineData[47]++;
      return false;
    }
  }
  _$jscoverage['/base/special-events.js'].lineData[50]++;
  return undefined;
}}, 
  blur: {
  bubbles: false, 
  preFire: function(event, onlyHandlers) {
  _$jscoverage['/base/special-events.js'].functionData[4]++;
  _$jscoverage['/base/special-events.js'].lineData[57]++;
  if (visit198_57_1(!onlyHandlers)) {
    _$jscoverage['/base/special-events.js'].lineData[58]++;
    return DomEvent.fire(this, 'focusout');
  }
}, 
  fire: function(onlyHandlers) {
  _$jscoverage['/base/special-events.js'].functionData[5]++;
  _$jscoverage['/base/special-events.js'].lineData[63]++;
  var target = this;
  _$jscoverage['/base/special-events.js'].lineData[64]++;
  if (visit199_64_1(!onlyHandlers && target.ownerDocument)) {
    _$jscoverage['/base/special-events.js'].lineData[65]++;
    if (visit200_65_1(visit201_65_2(target === target.ownerDocument.activeElement) && target.blur)) {
      _$jscoverage['/base/special-events.js'].lineData[66]++;
      target.blur();
      _$jscoverage['/base/special-events.js'].lineData[67]++;
      return false;
    }
  }
  _$jscoverage['/base/special-events.js'].lineData[70]++;
  return undefined;
}}});
}, {
  requires: ['./dom-event', './special']});
