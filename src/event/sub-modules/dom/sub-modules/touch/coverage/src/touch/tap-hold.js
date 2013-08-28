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
if (! _$jscoverage['/touch/tap-hold.js']) {
  _$jscoverage['/touch/tap-hold.js'] = {};
  _$jscoverage['/touch/tap-hold.js'].lineData = [];
  _$jscoverage['/touch/tap-hold.js'].lineData[6] = 0;
  _$jscoverage['/touch/tap-hold.js'].lineData[7] = 0;
  _$jscoverage['/touch/tap-hold.js'].lineData[9] = 0;
  _$jscoverage['/touch/tap-hold.js'].lineData[11] = 0;
  _$jscoverage['/touch/tap-hold.js'].lineData[14] = 0;
  _$jscoverage['/touch/tap-hold.js'].lineData[16] = 0;
  _$jscoverage['/touch/tap-hold.js'].lineData[17] = 0;
  _$jscoverage['/touch/tap-hold.js'].lineData[18] = 0;
  _$jscoverage['/touch/tap-hold.js'].lineData[20] = 0;
  _$jscoverage['/touch/tap-hold.js'].lineData[21] = 0;
  _$jscoverage['/touch/tap-hold.js'].lineData[22] = 0;
  _$jscoverage['/touch/tap-hold.js'].lineData[33] = 0;
  _$jscoverage['/touch/tap-hold.js'].lineData[34] = 0;
  _$jscoverage['/touch/tap-hold.js'].lineData[38] = 0;
  _$jscoverage['/touch/tap-hold.js'].lineData[42] = 0;
  _$jscoverage['/touch/tap-hold.js'].lineData[43] = 0;
  _$jscoverage['/touch/tap-hold.js'].lineData[44] = 0;
  _$jscoverage['/touch/tap-hold.js'].lineData[48] = 0;
  _$jscoverage['/touch/tap-hold.js'].lineData[51] = 0;
  _$jscoverage['/touch/tap-hold.js'].lineData[54] = 0;
  _$jscoverage['/touch/tap-hold.js'].lineData[59] = 0;
}
if (! _$jscoverage['/touch/tap-hold.js'].functionData) {
  _$jscoverage['/touch/tap-hold.js'].functionData = [];
  _$jscoverage['/touch/tap-hold.js'].functionData[0] = 0;
  _$jscoverage['/touch/tap-hold.js'].functionData[1] = 0;
  _$jscoverage['/touch/tap-hold.js'].functionData[2] = 0;
  _$jscoverage['/touch/tap-hold.js'].functionData[3] = 0;
  _$jscoverage['/touch/tap-hold.js'].functionData[4] = 0;
  _$jscoverage['/touch/tap-hold.js'].functionData[5] = 0;
  _$jscoverage['/touch/tap-hold.js'].functionData[6] = 0;
  _$jscoverage['/touch/tap-hold.js'].functionData[7] = 0;
  _$jscoverage['/touch/tap-hold.js'].functionData[8] = 0;
}
if (! _$jscoverage['/touch/tap-hold.js'].branchData) {
  _$jscoverage['/touch/tap-hold.js'].branchData = {};
  _$jscoverage['/touch/tap-hold.js'].branchData['17'] = [];
  _$jscoverage['/touch/tap-hold.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/touch/tap-hold.js'].branchData['43'] = [];
  _$jscoverage['/touch/tap-hold.js'].branchData['43'][1] = new BranchData();
}
_$jscoverage['/touch/tap-hold.js'].branchData['43'][1].init(14, 21, 'e.touches.length == 1');
function visit78_43_1(result) {
  _$jscoverage['/touch/tap-hold.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap-hold.js'].branchData['17'][1].init(48, 55, 'TapHold.superclass.onTouchStart.call(self, e) === false');
function visit77_17_1(result) {
  _$jscoverage['/touch/tap-hold.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/tap-hold.js'].lineData[6]++;
KISSY.add('event/dom/touch/tap-hold', function(S, eventHandleMap, SingleTouch, DomEvent) {
  _$jscoverage['/touch/tap-hold.js'].functionData[0]++;
  _$jscoverage['/touch/tap-hold.js'].lineData[7]++;
  var event = 'tapHold';
  _$jscoverage['/touch/tap-hold.js'].lineData[9]++;
  var duration = 1000;
  _$jscoverage['/touch/tap-hold.js'].lineData[11]++;
  function TapHold() {
    _$jscoverage['/touch/tap-hold.js'].functionData[1]++;
  }
  _$jscoverage['/touch/tap-hold.js'].lineData[14]++;
  S.extend(TapHold, SingleTouch, {
  onTouchStart: function(e) {
  _$jscoverage['/touch/tap-hold.js'].functionData[2]++;
  _$jscoverage['/touch/tap-hold.js'].lineData[16]++;
  var self = this;
  _$jscoverage['/touch/tap-hold.js'].lineData[17]++;
  if (visit77_17_1(TapHold.superclass.onTouchStart.call(self, e) === false)) {
    _$jscoverage['/touch/tap-hold.js'].lineData[18]++;
    return false;
  }
  _$jscoverage['/touch/tap-hold.js'].lineData[20]++;
  self.timer = setTimeout(function() {
  _$jscoverage['/touch/tap-hold.js'].functionData[3]++;
  _$jscoverage['/touch/tap-hold.js'].lineData[21]++;
  var touch = e.touches[0];
  _$jscoverage['/touch/tap-hold.js'].lineData[22]++;
  DomEvent.fire(e.target, event, {
  touch: touch, 
  pageX: touch.pageX, 
  pageY: touch.pageY, 
  which: 1, 
  duration: (S.now() - e.timeStamp) / 1000});
}, duration);
}, 
  onTouchMove: function() {
  _$jscoverage['/touch/tap-hold.js'].functionData[4]++;
  _$jscoverage['/touch/tap-hold.js'].lineData[33]++;
  clearTimeout(this.timer);
  _$jscoverage['/touch/tap-hold.js'].lineData[34]++;
  return false;
}, 
  onTouchEnd: function() {
  _$jscoverage['/touch/tap-hold.js'].functionData[5]++;
  _$jscoverage['/touch/tap-hold.js'].lineData[38]++;
  clearTimeout(this.timer);
}});
  _$jscoverage['/touch/tap-hold.js'].lineData[42]++;
  function prevent(e) {
    _$jscoverage['/touch/tap-hold.js'].functionData[6]++;
    _$jscoverage['/touch/tap-hold.js'].lineData[43]++;
    if (visit78_43_1(e.touches.length == 1)) {
      _$jscoverage['/touch/tap-hold.js'].lineData[44]++;
      e.preventDefault();
    }
  }
  _$jscoverage['/touch/tap-hold.js'].lineData[48]++;
  eventHandleMap[event] = {
  setup: function() {
  _$jscoverage['/touch/tap-hold.js'].functionData[7]++;
  _$jscoverage['/touch/tap-hold.js'].lineData[51]++;
  DomEvent.on(this, 'touchstart', prevent);
}, 
  tearDown: function() {
  _$jscoverage['/touch/tap-hold.js'].functionData[8]++;
  _$jscoverage['/touch/tap-hold.js'].lineData[54]++;
  DomEvent.detach(this, 'touchstart', prevent);
}, 
  handle: new TapHold()};
  _$jscoverage['/touch/tap-hold.js'].lineData[59]++;
  return TapHold;
}, {
  requires: ['./handle-map', './single-touch', 'event/dom/base']});
