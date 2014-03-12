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
if (! _$jscoverage['/base/utils.js']) {
  _$jscoverage['/base/utils.js'] = {};
  _$jscoverage['/base/utils.js'].lineData = [];
  _$jscoverage['/base/utils.js'].lineData[7] = 0;
  _$jscoverage['/base/utils.js'].lineData[8] = 0;
  _$jscoverage['/base/utils.js'].lineData[9] = 0;
  _$jscoverage['/base/utils.js'].lineData[13] = 0;
  _$jscoverage['/base/utils.js'].lineData[14] = 0;
  _$jscoverage['/base/utils.js'].lineData[18] = 0;
  _$jscoverage['/base/utils.js'].lineData[19] = 0;
  _$jscoverage['/base/utils.js'].lineData[24] = 0;
  _$jscoverage['/base/utils.js'].lineData[25] = 0;
  _$jscoverage['/base/utils.js'].lineData[29] = 0;
  _$jscoverage['/base/utils.js'].lineData[30] = 0;
  _$jscoverage['/base/utils.js'].lineData[34] = 0;
  _$jscoverage['/base/utils.js'].lineData[40] = 0;
  _$jscoverage['/base/utils.js'].lineData[44] = 0;
}
if (! _$jscoverage['/base/utils.js'].functionData) {
  _$jscoverage['/base/utils.js'].functionData = [];
  _$jscoverage['/base/utils.js'].functionData[0] = 0;
  _$jscoverage['/base/utils.js'].functionData[1] = 0;
  _$jscoverage['/base/utils.js'].functionData[2] = 0;
  _$jscoverage['/base/utils.js'].functionData[3] = 0;
  _$jscoverage['/base/utils.js'].functionData[4] = 0;
  _$jscoverage['/base/utils.js'].functionData[5] = 0;
  _$jscoverage['/base/utils.js'].functionData[6] = 0;
}
if (! _$jscoverage['/base/utils.js'].branchData) {
  _$jscoverage['/base/utils.js'].branchData = {};
  _$jscoverage['/base/utils.js'].branchData['11'] = [];
  _$jscoverage['/base/utils.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['13'] = [];
  _$jscoverage['/base/utils.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['18'] = [];
  _$jscoverage['/base/utils.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['22'] = [];
  _$jscoverage['/base/utils.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['24'] = [];
  _$jscoverage['/base/utils.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/base/utils.js'].branchData['29'] = [];
  _$jscoverage['/base/utils.js'].branchData['29'][1] = new BranchData();
}
_$jscoverage['/base/utils.js'].branchData['29'][1].init(21, 14, 'el.detachEvent');
function visit206_29_1(result) {
  _$jscoverage['/base/utils.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['24'][1].init(21, 22, 'el.removeEventListener');
function visit205_24_1(result) {
  _$jscoverage['/base/utils.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['22'][1].init(502, 30, 'doc && doc.removeEventListener');
function visit204_22_1(result) {
  _$jscoverage['/base/utils.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['18'][1].init(21, 14, 'el.attachEvent');
function visit203_18_1(result) {
  _$jscoverage['/base/utils.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['13'][1].init(21, 19, 'el.addEventListener');
function visit202_13_1(result) {
  _$jscoverage['/base/utils.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].branchData['11'][1].init(101, 27, 'doc && doc.addEventListener');
function visit201_11_1(result) {
  _$jscoverage['/base/utils.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/utils.js'].lineData[7]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/utils.js'].functionData[0]++;
  _$jscoverage['/base/utils.js'].lineData[8]++;
  var Dom = require('dom');
  _$jscoverage['/base/utils.js'].lineData[9]++;
  var EVENT_GUID = 'ksEventTargetId_' + S.now(), doc = S.Env.host.document, simpleAdd = visit201_11_1(doc && doc.addEventListener) ? function(el, type, fn, capture) {
  _$jscoverage['/base/utils.js'].functionData[1]++;
  _$jscoverage['/base/utils.js'].lineData[13]++;
  if (visit202_13_1(el.addEventListener)) {
    _$jscoverage['/base/utils.js'].lineData[14]++;
    el.addEventListener(type, fn, !!capture);
  }
} : function(el, type, fn) {
  _$jscoverage['/base/utils.js'].functionData[2]++;
  _$jscoverage['/base/utils.js'].lineData[18]++;
  if (visit203_18_1(el.attachEvent)) {
    _$jscoverage['/base/utils.js'].lineData[19]++;
    el.attachEvent('on' + type, fn);
  }
}, simpleRemove = visit204_22_1(doc && doc.removeEventListener) ? function(el, type, fn, capture) {
  _$jscoverage['/base/utils.js'].functionData[3]++;
  _$jscoverage['/base/utils.js'].lineData[24]++;
  if (visit205_24_1(el.removeEventListener)) {
    _$jscoverage['/base/utils.js'].lineData[25]++;
    el.removeEventListener(type, fn, !!capture);
  }
} : function(el, type, fn) {
  _$jscoverage['/base/utils.js'].functionData[4]++;
  _$jscoverage['/base/utils.js'].lineData[29]++;
  if (visit206_29_1(el.detachEvent)) {
    _$jscoverage['/base/utils.js'].lineData[30]++;
    el.detachEvent('on' + type, fn);
  }
};
  _$jscoverage['/base/utils.js'].lineData[34]++;
  return {
  simpleAdd: simpleAdd, 
  simpleRemove: simpleRemove, 
  data: function(elem, v) {
  _$jscoverage['/base/utils.js'].functionData[5]++;
  _$jscoverage['/base/utils.js'].lineData[40]++;
  return Dom.data(elem, EVENT_GUID, v);
}, 
  removeData: function(elem) {
  _$jscoverage['/base/utils.js'].functionData[6]++;
  _$jscoverage['/base/utils.js'].lineData[44]++;
  return Dom.removeData(elem, EVENT_GUID);
}};
});
