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
if (! _$jscoverage['/edge-drag.js']) {
  _$jscoverage['/edge-drag.js'] = {};
  _$jscoverage['/edge-drag.js'].lineData = [];
  _$jscoverage['/edge-drag.js'].lineData[5] = 0;
  _$jscoverage['/edge-drag.js'].lineData[6] = 0;
  _$jscoverage['/edge-drag.js'].lineData[7] = 0;
  _$jscoverage['/edge-drag.js'].lineData[8] = 0;
  _$jscoverage['/edge-drag.js'].lineData[9] = 0;
  _$jscoverage['/edge-drag.js'].lineData[10] = 0;
  _$jscoverage['/edge-drag.js'].lineData[16] = 0;
  _$jscoverage['/edge-drag.js'].lineData[17] = 0;
  _$jscoverage['/edge-drag.js'].lineData[29] = 0;
  _$jscoverage['/edge-drag.js'].lineData[30] = 0;
  _$jscoverage['/edge-drag.js'].lineData[33] = 0;
  _$jscoverage['/edge-drag.js'].lineData[34] = 0;
  _$jscoverage['/edge-drag.js'].lineData[37] = 0;
  _$jscoverage['/edge-drag.js'].lineData[38] = 0;
  _$jscoverage['/edge-drag.js'].lineData[39] = 0;
  _$jscoverage['/edge-drag.js'].lineData[41] = 0;
  _$jscoverage['/edge-drag.js'].lineData[45] = 0;
  _$jscoverage['/edge-drag.js'].lineData[46] = 0;
  _$jscoverage['/edge-drag.js'].lineData[47] = 0;
  _$jscoverage['/edge-drag.js'].lineData[48] = 0;
  _$jscoverage['/edge-drag.js'].lineData[50] = 0;
  _$jscoverage['/edge-drag.js'].lineData[53] = 0;
  _$jscoverage['/edge-drag.js'].lineData[54] = 0;
  _$jscoverage['/edge-drag.js'].lineData[56] = 0;
  _$jscoverage['/edge-drag.js'].lineData[59] = 0;
  _$jscoverage['/edge-drag.js'].lineData[62] = 0;
  _$jscoverage['/edge-drag.js'].lineData[64] = 0;
  _$jscoverage['/edge-drag.js'].lineData[65] = 0;
  _$jscoverage['/edge-drag.js'].lineData[66] = 0;
  _$jscoverage['/edge-drag.js'].lineData[67] = 0;
  _$jscoverage['/edge-drag.js'].lineData[69] = 0;
  _$jscoverage['/edge-drag.js'].lineData[71] = 0;
  _$jscoverage['/edge-drag.js'].lineData[72] = 0;
  _$jscoverage['/edge-drag.js'].lineData[74] = 0;
  _$jscoverage['/edge-drag.js'].lineData[75] = 0;
  _$jscoverage['/edge-drag.js'].lineData[76] = 0;
  _$jscoverage['/edge-drag.js'].lineData[83] = 0;
  _$jscoverage['/edge-drag.js'].lineData[84] = 0;
  _$jscoverage['/edge-drag.js'].lineData[85] = 0;
  _$jscoverage['/edge-drag.js'].lineData[86] = 0;
  _$jscoverage['/edge-drag.js'].lineData[87] = 0;
  _$jscoverage['/edge-drag.js'].lineData[88] = 0;
  _$jscoverage['/edge-drag.js'].lineData[89] = 0;
  _$jscoverage['/edge-drag.js'].lineData[90] = 0;
  _$jscoverage['/edge-drag.js'].lineData[92] = 0;
  _$jscoverage['/edge-drag.js'].lineData[93] = 0;
  _$jscoverage['/edge-drag.js'].lineData[96] = 0;
  _$jscoverage['/edge-drag.js'].lineData[149] = 0;
  _$jscoverage['/edge-drag.js'].lineData[152] = 0;
  _$jscoverage['/edge-drag.js'].lineData[155] = 0;
  _$jscoverage['/edge-drag.js'].lineData[159] = 0;
  _$jscoverage['/edge-drag.js'].lineData[160] = 0;
  _$jscoverage['/edge-drag.js'].lineData[161] = 0;
  _$jscoverage['/edge-drag.js'].lineData[162] = 0;
  _$jscoverage['/edge-drag.js'].lineData[163] = 0;
  _$jscoverage['/edge-drag.js'].lineData[164] = 0;
  _$jscoverage['/edge-drag.js'].lineData[165] = 0;
  _$jscoverage['/edge-drag.js'].lineData[169] = 0;
  _$jscoverage['/edge-drag.js'].lineData[170] = 0;
  _$jscoverage['/edge-drag.js'].lineData[174] = 0;
  _$jscoverage['/edge-drag.js'].lineData[175] = 0;
  _$jscoverage['/edge-drag.js'].lineData[179] = 0;
  _$jscoverage['/edge-drag.js'].lineData[183] = 0;
}
if (! _$jscoverage['/edge-drag.js'].functionData) {
  _$jscoverage['/edge-drag.js'].functionData = [];
  _$jscoverage['/edge-drag.js'].functionData[0] = 0;
  _$jscoverage['/edge-drag.js'].functionData[1] = 0;
  _$jscoverage['/edge-drag.js'].functionData[2] = 0;
  _$jscoverage['/edge-drag.js'].functionData[3] = 0;
  _$jscoverage['/edge-drag.js'].functionData[4] = 0;
  _$jscoverage['/edge-drag.js'].functionData[5] = 0;
}
if (! _$jscoverage['/edge-drag.js'].branchData) {
  _$jscoverage['/edge-drag.js'].branchData = {};
  _$jscoverage['/edge-drag.js'].branchData['29'] = [];
  _$jscoverage['/edge-drag.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['29'][2] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['33'] = [];
  _$jscoverage['/edge-drag.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['33'][2] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['37'] = [];
  _$jscoverage['/edge-drag.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['38'] = [];
  _$jscoverage['/edge-drag.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['45'] = [];
  _$jscoverage['/edge-drag.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['46'] = [];
  _$jscoverage['/edge-drag.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['47'] = [];
  _$jscoverage['/edge-drag.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['48'] = [];
  _$jscoverage['/edge-drag.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['53'] = [];
  _$jscoverage['/edge-drag.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['53'][2] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['53'][3] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['64'] = [];
  _$jscoverage['/edge-drag.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['66'] = [];
  _$jscoverage['/edge-drag.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['66'][2] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['66'][3] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['71'] = [];
  _$jscoverage['/edge-drag.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['83'] = [];
  _$jscoverage['/edge-drag.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['83'][2] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['83'][3] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['85'] = [];
  _$jscoverage['/edge-drag.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['85'][2] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['85'][3] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['87'] = [];
  _$jscoverage['/edge-drag.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['87'][2] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['87'][3] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['89'] = [];
  _$jscoverage['/edge-drag.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['89'][2] = new BranchData();
  _$jscoverage['/edge-drag.js'].branchData['89'][3] = new BranchData();
}
_$jscoverage['/edge-drag.js'].branchData['89'][3].init(757, 24, 'y < invalidRegion.bottom');
function visit30_89_3(result) {
  _$jscoverage['/edge-drag.js'].branchData['89'][3].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['89'][2].init(735, 18, 'direction === \'up\'');
function visit29_89_2(result) {
  _$jscoverage['/edge-drag.js'].branchData['89'][2].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['89'][1].init(735, 46, 'direction === \'up\' && y < invalidRegion.bottom');
function visit28_89_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['87'][3].init(654, 21, 'y > invalidRegion.top');
function visit27_87_3(result) {
  _$jscoverage['/edge-drag.js'].branchData['87'][3].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['87'][2].init(630, 20, 'direction === \'down\'');
function visit26_87_2(result) {
  _$jscoverage['/edge-drag.js'].branchData['87'][2].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['87'][1].init(630, 45, 'direction === \'down\' && y > invalidRegion.top');
function visit25_87_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['85'][3].init(547, 23, 'x < invalidRegion.right');
function visit24_85_3(result) {
  _$jscoverage['/edge-drag.js'].branchData['85'][3].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['85'][2].init(523, 20, 'direction === \'left\'');
function visit23_85_2(result) {
  _$jscoverage['/edge-drag.js'].branchData['85'][2].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['85'][1].init(523, 47, 'direction === \'left\' && x < invalidRegion.right');
function visit22_85_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['83'][3].init(441, 22, 'x > invalidRegion.left');
function visit21_83_3(result) {
  _$jscoverage['/edge-drag.js'].branchData['83'][3].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['83'][2].init(416, 21, 'direction === \'right\'');
function visit20_83_2(result) {
  _$jscoverage['/edge-drag.js'].branchData['83'][2].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['83'][1].init(416, 47, 'direction === \'right\' && x > invalidRegion.left');
function visit19_83_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['71'][1].init(1643, 14, 'self.isStarted');
function visit18_71_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['66'][3].init(78, 21, 'direction === \'right\'');
function visit17_66_3(result) {
  _$jscoverage['/edge-drag.js'].branchData['66'][3].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['66'][2].init(54, 20, 'direction === \'left\'');
function visit16_66_2(result) {
  _$jscoverage['/edge-drag.js'].branchData['66'][2].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['66'][1].init(54, 45, 'direction === \'left\' || direction === \'right\'');
function visit15_66_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['64'][1].init(1374, 5, '!move');
function visit14_64_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['53'][3].init(1128, 20, 'direction === \'down\'');
function visit13_53_3(result) {
  _$jscoverage['/edge-drag.js'].branchData['53'][3].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['53'][2].init(1106, 18, 'direction === \'up\'');
function visit12_53_2(result) {
  _$jscoverage['/edge-drag.js'].branchData['53'][2].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['53'][1].init(1106, 42, 'direction === \'up\' || direction === \'down\'');
function visit11_53_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['48'][1].init(43, 10, 'deltaY < 0');
function visit10_48_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['47'][1].init(933, 15, 'self.isVertical');
function visit9_47_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['46'][1].init(43, 10, 'deltaX < 0');
function visit8_46_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['45'][1].init(818, 17, 'self.isHorizontal');
function visit7_45_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['38'][1].init(18, 21, 'absDeltaY > absDeltaX');
function visit6_38_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['37'][1].init(595, 36, 'self.isVertical && self.isHorizontal');
function visit5_37_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['33'][2].init(507, 22, 'absDeltaY > MAX_OFFSET');
function visit4_33_2(result) {
  _$jscoverage['/edge-drag.js'].branchData['33'][2].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['33'][1].init(486, 43, 'self.isHorizontal && absDeltaY > MAX_OFFSET');
function visit3_33_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['29'][2].init(400, 22, 'absDeltaX > MAX_OFFSET');
function visit2_29_2(result) {
  _$jscoverage['/edge-drag.js'].branchData['29'][2].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].branchData['29'][1].init(381, 41, 'self.isVertical && absDeltaX > MAX_OFFSET');
function visit1_29_1(result) {
  _$jscoverage['/edge-drag.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/edge-drag.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/edge-drag.js'].functionData[0]++;
  _$jscoverage['/edge-drag.js'].lineData[6]++;
  var GestureUtil = require('event/gesture/util');
  _$jscoverage['/edge-drag.js'].lineData[7]++;
  var addGestureEvent = GestureUtil.addEvent;
  _$jscoverage['/edge-drag.js'].lineData[8]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/edge-drag.js'].lineData[9]++;
  var SingleTouch = GestureUtil.SingleTouch;
  _$jscoverage['/edge-drag.js'].lineData[10]++;
  var MAX_OFFSET = 35, EDGE_DRAG_START = 'edgeDragStart', EDGE_DRAG = 'edgeDrag', EDGE_DRAG_END = 'edgeDragEnd', MIN_EDGE_DISTANCE = 60;
  _$jscoverage['/edge-drag.js'].lineData[16]++;
  function fire(self, e, move) {
    _$jscoverage['/edge-drag.js'].functionData[1]++;
    _$jscoverage['/edge-drag.js'].lineData[17]++;
    var touches = self.lastTouches, touch = touches[0], x = touch.pageX, y = touch.pageY, deltaX = x - self.startX, deltaY = y - self.startY, absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY), distance, event, direction;
    _$jscoverage['/edge-drag.js'].lineData[29]++;
    if (visit1_29_1(self.isVertical && visit2_29_2(absDeltaX > MAX_OFFSET))) {
      _$jscoverage['/edge-drag.js'].lineData[30]++;
      self.isVertical = 0;
    }
    _$jscoverage['/edge-drag.js'].lineData[33]++;
    if (visit3_33_1(self.isHorizontal && visit4_33_2(absDeltaY > MAX_OFFSET))) {
      _$jscoverage['/edge-drag.js'].lineData[34]++;
      self.isHorizontal = 0;
    }
    _$jscoverage['/edge-drag.js'].lineData[37]++;
    if (visit5_37_1(self.isVertical && self.isHorizontal)) {
      _$jscoverage['/edge-drag.js'].lineData[38]++;
      if (visit6_38_1(absDeltaY > absDeltaX)) {
        _$jscoverage['/edge-drag.js'].lineData[39]++;
        self.isHorizontal = 0;
      } else {
        _$jscoverage['/edge-drag.js'].lineData[41]++;
        self.isVertical = 0;
      }
    }
    _$jscoverage['/edge-drag.js'].lineData[45]++;
    if (visit7_45_1(self.isHorizontal)) {
      _$jscoverage['/edge-drag.js'].lineData[46]++;
      direction = self.direction = visit8_46_1(deltaX < 0) ? 'left' : 'right';
    } else {
      _$jscoverage['/edge-drag.js'].lineData[47]++;
      if (visit9_47_1(self.isVertical)) {
        _$jscoverage['/edge-drag.js'].lineData[48]++;
        direction = self.direction = visit10_48_1(deltaY < 0) ? 'up' : 'down';
      } else {
        _$jscoverage['/edge-drag.js'].lineData[50]++;
        direction = self.direction;
      }
    }
    _$jscoverage['/edge-drag.js'].lineData[53]++;
    if (visit11_53_1(visit12_53_2(direction === 'up') || visit13_53_3(direction === 'down'))) {
      _$jscoverage['/edge-drag.js'].lineData[54]++;
      distance = absDeltaY;
    } else {
      _$jscoverage['/edge-drag.js'].lineData[56]++;
      distance = absDeltaX;
    }
    _$jscoverage['/edge-drag.js'].lineData[59]++;
    var velocityX, velocityY;
    _$jscoverage['/edge-drag.js'].lineData[62]++;
    var duration = (e.timeStamp - self.startTime);
    _$jscoverage['/edge-drag.js'].lineData[64]++;
    if (visit14_64_1(!move)) {
      _$jscoverage['/edge-drag.js'].lineData[65]++;
      event = EDGE_DRAG_END;
      _$jscoverage['/edge-drag.js'].lineData[66]++;
      if (visit15_66_1(visit16_66_2(direction === 'left') || visit17_66_3(direction === 'right'))) {
        _$jscoverage['/edge-drag.js'].lineData[67]++;
        velocityX = distance / duration;
      } else {
        _$jscoverage['/edge-drag.js'].lineData[69]++;
        velocityY = distance / duration;
      }
    } else {
      _$jscoverage['/edge-drag.js'].lineData[71]++;
      if (visit18_71_1(self.isStarted)) {
        _$jscoverage['/edge-drag.js'].lineData[72]++;
        event = EDGE_DRAG;
      } else {
        _$jscoverage['/edge-drag.js'].lineData[74]++;
        event = EDGE_DRAG_START;
        _$jscoverage['/edge-drag.js'].lineData[75]++;
        var win = window;
        _$jscoverage['/edge-drag.js'].lineData[76]++;
        var invalidRegion = {
  left: win.pageXOffset + MIN_EDGE_DISTANCE, 
  right: win.pageXOffset + win.innerWidth - MIN_EDGE_DISTANCE, 
  top: win.pageYOffset + MIN_EDGE_DISTANCE, 
  bottom: win.pageYOffset + win.innerHeight - MIN_EDGE_DISTANCE};
        _$jscoverage['/edge-drag.js'].lineData[83]++;
        if (visit19_83_1(visit20_83_2(direction === 'right') && visit21_83_3(x > invalidRegion.left))) {
          _$jscoverage['/edge-drag.js'].lineData[84]++;
          return false;
        } else {
          _$jscoverage['/edge-drag.js'].lineData[85]++;
          if (visit22_85_1(visit23_85_2(direction === 'left') && visit24_85_3(x < invalidRegion.right))) {
            _$jscoverage['/edge-drag.js'].lineData[86]++;
            return false;
          } else {
            _$jscoverage['/edge-drag.js'].lineData[87]++;
            if (visit25_87_1(visit26_87_2(direction === 'down') && visit27_87_3(y > invalidRegion.top))) {
              _$jscoverage['/edge-drag.js'].lineData[88]++;
              return false;
            } else {
              _$jscoverage['/edge-drag.js'].lineData[89]++;
              if (visit28_89_1(visit29_89_2(direction === 'up') && visit30_89_3(y < invalidRegion.bottom))) {
                _$jscoverage['/edge-drag.js'].lineData[90]++;
                return false;
              }
            }
          }
        }
        _$jscoverage['/edge-drag.js'].lineData[92]++;
        self.isStarted = 1;
        _$jscoverage['/edge-drag.js'].lineData[93]++;
        self.startTime = e.timeStamp;
      }
    }
    _$jscoverage['/edge-drag.js'].lineData[96]++;
    DomEvent.fire(touch.target, event, {
  originalEvent: e.originalEvent, 
  pageX: touch.pageX, 
  pageY: touch.pageY, 
  which: 1, 
  touch: touch, 
  direction: direction, 
  distance: distance, 
  duration: duration / 1000, 
  velocityX: velocityX, 
  velocityY: velocityY});
    _$jscoverage['/edge-drag.js'].lineData[149]++;
    return undefined;
  }
  _$jscoverage['/edge-drag.js'].lineData[152]++;
  function EdgeDrag() {
    _$jscoverage['/edge-drag.js'].functionData[2]++;
  }
  _$jscoverage['/edge-drag.js'].lineData[155]++;
  S.extend(EdgeDrag, SingleTouch, {
  requiredGestureType: 'touch', 
  start: function() {
  _$jscoverage['/edge-drag.js'].functionData[3]++;
  _$jscoverage['/edge-drag.js'].lineData[159]++;
  var self = this;
  _$jscoverage['/edge-drag.js'].lineData[160]++;
  EdgeDrag.superclass.start.apply(self, arguments);
  _$jscoverage['/edge-drag.js'].lineData[161]++;
  var touch = self.lastTouches[0];
  _$jscoverage['/edge-drag.js'].lineData[162]++;
  self.isHorizontal = 1;
  _$jscoverage['/edge-drag.js'].lineData[163]++;
  self.isVertical = 1;
  _$jscoverage['/edge-drag.js'].lineData[164]++;
  self.startX = touch.pageX;
  _$jscoverage['/edge-drag.js'].lineData[165]++;
  self.startY = touch.pageY;
}, 
  move: function(e) {
  _$jscoverage['/edge-drag.js'].functionData[4]++;
  _$jscoverage['/edge-drag.js'].lineData[169]++;
  EdgeDrag.superclass.move.apply(this, arguments);
  _$jscoverage['/edge-drag.js'].lineData[170]++;
  return fire(this, e, 1);
}, 
  end: function(e) {
  _$jscoverage['/edge-drag.js'].functionData[5]++;
  _$jscoverage['/edge-drag.js'].lineData[174]++;
  EdgeDrag.superclass.end.apply(this, arguments);
  _$jscoverage['/edge-drag.js'].lineData[175]++;
  return fire(this, e, 0);
}});
  _$jscoverage['/edge-drag.js'].lineData[179]++;
  addGestureEvent([EDGE_DRAG, EDGE_DRAG_END, EDGE_DRAG_START], {
  handle: new EdgeDrag()});
  _$jscoverage['/edge-drag.js'].lineData[183]++;
  return {
  EDGE_DRAG: EDGE_DRAG, 
  EDGE_DRAG_START: EDGE_DRAG_START, 
  EDGE_DRAG_END: EDGE_DRAG_END};
});
