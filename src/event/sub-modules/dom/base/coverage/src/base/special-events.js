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
  _$jscoverage['/base/special-events.js'].lineData[13] = 0;
  _$jscoverage['/base/special-events.js'].lineData[25] = 0;
  _$jscoverage['/base/special-events.js'].lineData[26] = 0;
  _$jscoverage['/base/special-events.js'].lineData[28] = 0;
  _$jscoverage['/base/special-events.js'].lineData[29] = 0;
  _$jscoverage['/base/special-events.js'].lineData[31] = 0;
  _$jscoverage['/base/special-events.js'].lineData[38] = 0;
  _$jscoverage['/base/special-events.js'].lineData[39] = 0;
  _$jscoverage['/base/special-events.js'].lineData[44] = 0;
  _$jscoverage['/base/special-events.js'].lineData[45] = 0;
  _$jscoverage['/base/special-events.js'].lineData[46] = 0;
  _$jscoverage['/base/special-events.js'].lineData[47] = 0;
  _$jscoverage['/base/special-events.js'].lineData[48] = 0;
  _$jscoverage['/base/special-events.js'].lineData[51] = 0;
  _$jscoverage['/base/special-events.js'].lineData[58] = 0;
  _$jscoverage['/base/special-events.js'].lineData[59] = 0;
  _$jscoverage['/base/special-events.js'].lineData[64] = 0;
  _$jscoverage['/base/special-events.js'].lineData[65] = 0;
  _$jscoverage['/base/special-events.js'].lineData[66] = 0;
  _$jscoverage['/base/special-events.js'].lineData[67] = 0;
  _$jscoverage['/base/special-events.js'].lineData[68] = 0;
  _$jscoverage['/base/special-events.js'].lineData[71] = 0;
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
  _$jscoverage['/base/special-events.js'].branchData['26'] = [];
  _$jscoverage['/base/special-events.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['26'][2] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['26'][3] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['27'] = [];
  _$jscoverage['/base/special-events.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['27'][2] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['38'] = [];
  _$jscoverage['/base/special-events.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['45'] = [];
  _$jscoverage['/base/special-events.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['46'] = [];
  _$jscoverage['/base/special-events.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['46'][2] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['58'] = [];
  _$jscoverage['/base/special-events.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['65'] = [];
  _$jscoverage['/base/special-events.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['66'] = [];
  _$jscoverage['/base/special-events.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/base/special-events.js'].branchData['66'][2] = new BranchData();
}
_$jscoverage['/base/special-events.js'].branchData['66'][2].init(26, 41, 'self === self.ownerDocument.activeElement');
function visit202_66_2(result) {
  _$jscoverage['/base/special-events.js'].branchData['66'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['66'][1].init(26, 54, 'self === self.ownerDocument.activeElement && self.blur');
function visit201_66_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['65'][1].init(56, 35, '!onlyHandlers && self.ownerDocument');
function visit200_65_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['58'][1].init(22, 13, '!onlyHandlers');
function visit199_58_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['46'][2].init(26, 41, 'self !== self.ownerDocument.activeElement');
function visit198_46_2(result) {
  _$jscoverage['/base/special-events.js'].branchData['46'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['46'][1].init(26, 55, 'self !== self.ownerDocument.activeElement && self.focus');
function visit197_46_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['45'][1].init(56, 35, '!onlyHandlers && self.ownerDocument');
function visit196_45_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['38'][1].init(22, 13, '!onlyHandlers');
function visit195_38_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['27'][2].init(147, 39, 'self.nodeName.toLowerCase() === \'input\'');
function visit194_27_2(result) {
  _$jscoverage['/base/special-events.js'].branchData['27'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['27'][1].init(56, 53, 'self.click && self.nodeName.toLowerCase() === \'input\'');
function visit193_27_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['26'][3].init(73, 32, 'String(self.type) === \'checkbox\'');
function visit192_26_3(result) {
  _$jscoverage['/base/special-events.js'].branchData['26'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['26'][2].init(73, 110, 'String(self.type) === \'checkbox\' && self.click && self.nodeName.toLowerCase() === \'input\'');
function visit191_26_2(result) {
  _$jscoverage['/base/special-events.js'].branchData['26'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].branchData['26'][1].init(56, 127, '!onlyHandlers && String(self.type) === \'checkbox\' && self.click && self.nodeName.toLowerCase() === \'input\'');
function visit190_26_1(result) {
  _$jscoverage['/base/special-events.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/special-events.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/special-events.js'].functionData[0]++;
  _$jscoverage['/base/special-events.js'].lineData[7]++;
  var DomEvent = require('./dom-event');
  _$jscoverage['/base/special-events.js'].lineData[8]++;
  var Special = require('./special');
  _$jscoverage['/base/special-events.js'].lineData[10]++;
  var UA = require('ua'), MOUSE_WHEEL = UA.gecko ? 'DOMMouseScroll' : 'mousewheel';
  _$jscoverage['/base/special-events.js'].lineData[13]++;
  return S.mix(Special, {
  mousewheel: {
  typeFix: MOUSE_WHEEL}, 
  load: {
  bubbles: false}, 
  click: {
  fire: function(onlyHandlers) {
  _$jscoverage['/base/special-events.js'].functionData[1]++;
  _$jscoverage['/base/special-events.js'].lineData[25]++;
  var self = this;
  _$jscoverage['/base/special-events.js'].lineData[26]++;
  if (visit190_26_1(!onlyHandlers && visit191_26_2(visit192_26_3(String(self.type) === 'checkbox') && visit193_27_1(self.click && visit194_27_2(self.nodeName.toLowerCase() === 'input'))))) {
    _$jscoverage['/base/special-events.js'].lineData[28]++;
    self.click();
    _$jscoverage['/base/special-events.js'].lineData[29]++;
    return false;
  }
  _$jscoverage['/base/special-events.js'].lineData[31]++;
  return undefined;
}}, 
  focus: {
  bubbles: false, 
  preFire: function(event, onlyHandlers) {
  _$jscoverage['/base/special-events.js'].functionData[2]++;
  _$jscoverage['/base/special-events.js'].lineData[38]++;
  if (visit195_38_1(!onlyHandlers)) {
    _$jscoverage['/base/special-events.js'].lineData[39]++;
    return DomEvent.fire(this, 'focusin');
  }
}, 
  fire: function(onlyHandlers) {
  _$jscoverage['/base/special-events.js'].functionData[3]++;
  _$jscoverage['/base/special-events.js'].lineData[44]++;
  var self = this;
  _$jscoverage['/base/special-events.js'].lineData[45]++;
  if (visit196_45_1(!onlyHandlers && self.ownerDocument)) {
    _$jscoverage['/base/special-events.js'].lineData[46]++;
    if (visit197_46_1(visit198_46_2(self !== self.ownerDocument.activeElement) && self.focus)) {
      _$jscoverage['/base/special-events.js'].lineData[47]++;
      self.focus();
      _$jscoverage['/base/special-events.js'].lineData[48]++;
      return false;
    }
  }
  _$jscoverage['/base/special-events.js'].lineData[51]++;
  return undefined;
}}, 
  blur: {
  bubbles: false, 
  preFire: function(event, onlyHandlers) {
  _$jscoverage['/base/special-events.js'].functionData[4]++;
  _$jscoverage['/base/special-events.js'].lineData[58]++;
  if (visit199_58_1(!onlyHandlers)) {
    _$jscoverage['/base/special-events.js'].lineData[59]++;
    return DomEvent.fire(this, 'focusout');
  }
}, 
  fire: function(onlyHandlers) {
  _$jscoverage['/base/special-events.js'].functionData[5]++;
  _$jscoverage['/base/special-events.js'].lineData[64]++;
  var self = this;
  _$jscoverage['/base/special-events.js'].lineData[65]++;
  if (visit200_65_1(!onlyHandlers && self.ownerDocument)) {
    _$jscoverage['/base/special-events.js'].lineData[66]++;
    if (visit201_66_1(visit202_66_2(self === self.ownerDocument.activeElement) && self.blur)) {
      _$jscoverage['/base/special-events.js'].lineData[67]++;
      self.blur();
      _$jscoverage['/base/special-events.js'].lineData[68]++;
      return false;
    }
  }
  _$jscoverage['/base/special-events.js'].lineData[71]++;
  return undefined;
}}});
});
