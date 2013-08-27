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
if (! _$jscoverage['/shake.js']) {
  _$jscoverage['/shake.js'] = {};
  _$jscoverage['/shake.js'].lineData = [];
  _$jscoverage['/shake.js'].lineData[6] = 0;
  _$jscoverage['/shake.js'].lineData[7] = 0;
  _$jscoverage['/shake.js'].lineData[17] = 0;
  _$jscoverage['/shake.js'].lineData[18] = 0;
  _$jscoverage['/shake.js'].lineData[25] = 0;
  _$jscoverage['/shake.js'].lineData[30] = 0;
  _$jscoverage['/shake.js'].lineData[32] = 0;
  _$jscoverage['/shake.js'].lineData[33] = 0;
  _$jscoverage['/shake.js'].lineData[35] = 0;
  _$jscoverage['/shake.js'].lineData[38] = 0;
  _$jscoverage['/shake.js'].lineData[39] = 0;
  _$jscoverage['/shake.js'].lineData[41] = 0;
  _$jscoverage['/shake.js'].lineData[42] = 0;
  _$jscoverage['/shake.js'].lineData[43] = 0;
  _$jscoverage['/shake.js'].lineData[47] = 0;
  _$jscoverage['/shake.js'].lineData[48] = 0;
  _$jscoverage['/shake.js'].lineData[49] = 0;
  _$jscoverage['/shake.js'].lineData[52] = 0;
  _$jscoverage['/shake.js'].lineData[53] = 0;
  _$jscoverage['/shake.js'].lineData[58] = 0;
  _$jscoverage['/shake.js'].lineData[59] = 0;
  _$jscoverage['/shake.js'].lineData[60] = 0;
  _$jscoverage['/shake.js'].lineData[61] = 0;
  _$jscoverage['/shake.js'].lineData[63] = 0;
  _$jscoverage['/shake.js'].lineData[66] = 0;
  _$jscoverage['/shake.js'].lineData[70] = 0;
  _$jscoverage['/shake.js'].lineData[71] = 0;
  _$jscoverage['/shake.js'].lineData[72] = 0;
}
if (! _$jscoverage['/shake.js'].functionData) {
  _$jscoverage['/shake.js'].functionData = [];
  _$jscoverage['/shake.js'].functionData[0] = 0;
  _$jscoverage['/shake.js'].functionData[1] = 0;
  _$jscoverage['/shake.js'].functionData[2] = 0;
  _$jscoverage['/shake.js'].functionData[3] = 0;
  _$jscoverage['/shake.js'].functionData[4] = 0;
  _$jscoverage['/shake.js'].functionData[5] = 0;
}
if (! _$jscoverage['/shake.js'].branchData) {
  _$jscoverage['/shake.js'].branchData = {};
  _$jscoverage['/shake.js'].branchData['17'] = [];
  _$jscoverage['/shake.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/shake.js'].branchData['32'] = [];
  _$jscoverage['/shake.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/shake.js'].branchData['38'] = [];
  _$jscoverage['/shake.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/shake.js'].branchData['58'] = [];
  _$jscoverage['/shake.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/shake.js'].branchData['60'] = [];
  _$jscoverage['/shake.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/shake.js'].branchData['63'] = [];
  _$jscoverage['/shake.js'].branchData['63'][1] = new BranchData();
}
_$jscoverage['/shake.js'].branchData['63'][1].init(170, 13, 'diff > enough');
function visit6_63_1(result) {
  _$jscoverage['/shake.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/shake.js'].branchData['60'][1].init(91, 12, 'diff > start');
function visit5_60_1(result) {
  _$jscoverage['/shake.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/shake.js'].branchData['58'][1].init(256, 19, 'lastX !== undefined');
function visit4_58_1(result) {
  _$jscoverage['/shake.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/shake.js'].branchData['38'][1].init(18, 11, 'this != win');
function visit3_38_1(result) {
  _$jscoverage['/shake.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/shake.js'].branchData['32'][1].init(18, 11, 'this != win');
function visit2_32_1(result) {
  _$jscoverage['/shake.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/shake.js'].branchData['17'][1].init(18, 7, 'shaking');
function visit1_17_1(result) {
  _$jscoverage['/shake.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/shake.js'].lineData[6]++;
KISSY.add('event/dom/shake', function(S, DomEvent, undefined) {
  _$jscoverage['/shake.js'].functionData[0]++;
  _$jscoverage['/shake.js'].lineData[7]++;
  var Special = DomEvent.Special, start = 5, enough = 20, shaking = 0, lastX, lastY, lastZ, max = Math.max, abs = Math.abs, win = S.Env.host, devicemotion = 'devicemotion', checkShake = S.buffer(function() {
  _$jscoverage['/shake.js'].functionData[1]++;
  _$jscoverage['/shake.js'].lineData[17]++;
  if (visit1_17_1(shaking)) {
    _$jscoverage['/shake.js'].lineData[18]++;
    DomEvent.fireHandler(win, 'shake', {
  accelerationIncludingGravity: {
  x: lastX, 
  y: lastY, 
  z: lastZ}});
    _$jscoverage['/shake.js'].lineData[25]++;
    clear();
  }
}, 250);
  _$jscoverage['/shake.js'].lineData[30]++;
  Special['shake'] = {
  setup: function() {
  _$jscoverage['/shake.js'].functionData[2]++;
  _$jscoverage['/shake.js'].lineData[32]++;
  if (visit2_32_1(this != win)) {
    _$jscoverage['/shake.js'].lineData[33]++;
    return;
  }
  _$jscoverage['/shake.js'].lineData[35]++;
  win.addEventListener(devicemotion, shake, false);
}, 
  tearDown: function() {
  _$jscoverage['/shake.js'].functionData[3]++;
  _$jscoverage['/shake.js'].lineData[38]++;
  if (visit3_38_1(this != win)) {
    _$jscoverage['/shake.js'].lineData[39]++;
    return;
  }
  _$jscoverage['/shake.js'].lineData[41]++;
  checkShake.stop();
  _$jscoverage['/shake.js'].lineData[42]++;
  clear();
  _$jscoverage['/shake.js'].lineData[43]++;
  win.removeEventListener(devicemotion, shake, false);
}};
  _$jscoverage['/shake.js'].lineData[47]++;
  function clear() {
    _$jscoverage['/shake.js'].functionData[4]++;
    _$jscoverage['/shake.js'].lineData[48]++;
    lastX = undefined;
    _$jscoverage['/shake.js'].lineData[49]++;
    shaking = 0;
  }
  _$jscoverage['/shake.js'].lineData[52]++;
  function shake(e) {
    _$jscoverage['/shake.js'].functionData[5]++;
    _$jscoverage['/shake.js'].lineData[53]++;
    var accelerationIncludingGravity = e.accelerationIncludingGravity, x = accelerationIncludingGravity.x, y = accelerationIncludingGravity.y, z = accelerationIncludingGravity.z, diff;
    _$jscoverage['/shake.js'].lineData[58]++;
    if (visit4_58_1(lastX !== undefined)) {
      _$jscoverage['/shake.js'].lineData[59]++;
      diff = max(abs(x - lastX), abs(y - lastY), abs(z - lastZ));
      _$jscoverage['/shake.js'].lineData[60]++;
      if (visit5_60_1(diff > start)) {
        _$jscoverage['/shake.js'].lineData[61]++;
        checkShake();
      }
      _$jscoverage['/shake.js'].lineData[63]++;
      if (visit6_63_1(diff > enough)) {
        _$jscoverage['/shake.js'].lineData[66]++;
        shaking = 1;
      }
    }
    _$jscoverage['/shake.js'].lineData[70]++;
    lastX = x;
    _$jscoverage['/shake.js'].lineData[71]++;
    lastY = y;
    _$jscoverage['/shake.js'].lineData[72]++;
    lastZ = z;
  }
}, {
  requires: ['event/dom/base']});
