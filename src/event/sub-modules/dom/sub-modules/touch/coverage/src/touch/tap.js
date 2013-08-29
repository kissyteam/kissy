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
if (! _$jscoverage['/touch/tap.js']) {
  _$jscoverage['/touch/tap.js'] = {};
  _$jscoverage['/touch/tap.js'].lineData = [];
  _$jscoverage['/touch/tap.js'].lineData[6] = 0;
  _$jscoverage['/touch/tap.js'].lineData[7] = 0;
  _$jscoverage['/touch/tap.js'].lineData[8] = 0;
  _$jscoverage['/touch/tap.js'].lineData[11] = 0;
  _$jscoverage['/touch/tap.js'].lineData[13] = 0;
  _$jscoverage['/touch/tap.js'].lineData[15] = 0;
  _$jscoverage['/touch/tap.js'].lineData[16] = 0;
  _$jscoverage['/touch/tap.js'].lineData[19] = 0;
  _$jscoverage['/touch/tap.js'].lineData[21] = 0;
  _$jscoverage['/touch/tap.js'].lineData[25] = 0;
  _$jscoverage['/touch/tap.js'].lineData[26] = 0;
  _$jscoverage['/touch/tap.js'].lineData[27] = 0;
  _$jscoverage['/touch/tap.js'].lineData[32] = 0;
  _$jscoverage['/touch/tap.js'].lineData[38] = 0;
  _$jscoverage['/touch/tap.js'].lineData[39] = 0;
  _$jscoverage['/touch/tap.js'].lineData[40] = 0;
  _$jscoverage['/touch/tap.js'].lineData[48] = 0;
  _$jscoverage['/touch/tap.js'].lineData[52] = 0;
}
if (! _$jscoverage['/touch/tap.js'].functionData) {
  _$jscoverage['/touch/tap.js'].functionData = [];
  _$jscoverage['/touch/tap.js'].functionData[0] = 0;
  _$jscoverage['/touch/tap.js'].functionData[1] = 0;
  _$jscoverage['/touch/tap.js'].functionData[2] = 0;
  _$jscoverage['/touch/tap.js'].functionData[3] = 0;
  _$jscoverage['/touch/tap.js'].functionData[4] = 0;
}
if (! _$jscoverage['/touch/tap.js'].branchData) {
  _$jscoverage['/touch/tap.js'].branchData = {};
  _$jscoverage['/touch/tap.js'].branchData['39'] = [];
  _$jscoverage['/touch/tap.js'].branchData['39'][1] = new BranchData();
}
_$jscoverage['/touch/tap.js'].branchData['39'][1].init(509, 32, 'eventObject.isDefaultPrevented()');
function visit84_39_1(result) {
  _$jscoverage['/touch/tap.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap.js'].lineData[6]++;
KISSY.add('event/dom/touch/tap', function(S, eventHandleMap, DomEvent, SingleTouch) {
  _$jscoverage['/touch/tap.js'].functionData[0]++;
  _$jscoverage['/touch/tap.js'].lineData[7]++;
  function preventDefault(e) {
    _$jscoverage['/touch/tap.js'].functionData[1]++;
    _$jscoverage['/touch/tap.js'].lineData[8]++;
    e.preventDefault();
  }
  _$jscoverage['/touch/tap.js'].lineData[11]++;
  var event = 'tap';
  _$jscoverage['/touch/tap.js'].lineData[13]++;
  var DomEventObject = DomEvent.Object;
  _$jscoverage['/touch/tap.js'].lineData[15]++;
  function Tap() {
    _$jscoverage['/touch/tap.js'].functionData[2]++;
    _$jscoverage['/touch/tap.js'].lineData[16]++;
    Tap.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/touch/tap.js'].lineData[19]++;
  S.extend(Tap, SingleTouch, {
  onTouchMove: function() {
  _$jscoverage['/touch/tap.js'].functionData[3]++;
  _$jscoverage['/touch/tap.js'].lineData[21]++;
  return false;
}, 
  onTouchEnd: function(e) {
  _$jscoverage['/touch/tap.js'].functionData[4]++;
  _$jscoverage['/touch/tap.js'].lineData[25]++;
  var touch = e.changedTouches[0];
  _$jscoverage['/touch/tap.js'].lineData[26]++;
  var target = e.target;
  _$jscoverage['/touch/tap.js'].lineData[27]++;
  var eventObject = new DomEventObject({
  type: event, 
  target: target, 
  currentTarget: target});
  _$jscoverage['/touch/tap.js'].lineData[32]++;
  S.mix(eventObject, {
  pageX: touch.pageX, 
  pageY: touch.pageY, 
  which: 1, 
  touch: touch});
  _$jscoverage['/touch/tap.js'].lineData[38]++;
  DomEvent.fire(target, event, eventObject);
  _$jscoverage['/touch/tap.js'].lineData[39]++;
  if (visit84_39_1(eventObject.isDefaultPrevented())) {
    _$jscoverage['/touch/tap.js'].lineData[40]++;
    DomEvent.on(target, 'click', {
  fn: preventDefault, 
  once: 1});
  }
}});
  _$jscoverage['/touch/tap.js'].lineData[48]++;
  eventHandleMap[event] = {
  handle: new Tap()};
  _$jscoverage['/touch/tap.js'].lineData[52]++;
  return Tap;
}, {
  requires: ['./handle-map', 'event/dom/base', './single-touch']});
