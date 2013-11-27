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
if (! _$jscoverage['/dialog.js']) {
  _$jscoverage['/dialog.js'] = {};
  _$jscoverage['/dialog.js'].lineData = [];
  _$jscoverage['/dialog.js'].lineData[6] = 0;
  _$jscoverage['/dialog.js'].lineData[7] = 0;
  _$jscoverage['/dialog.js'].lineData[8] = 0;
  _$jscoverage['/dialog.js'].lineData[9] = 0;
  _$jscoverage['/dialog.js'].lineData[12] = 0;
  _$jscoverage['/dialog.js'].lineData[13] = 0;
  _$jscoverage['/dialog.js'].lineData[14] = 0;
  _$jscoverage['/dialog.js'].lineData[15] = 0;
  _$jscoverage['/dialog.js'].lineData[17] = 0;
  _$jscoverage['/dialog.js'].lineData[18] = 0;
  _$jscoverage['/dialog.js'].lineData[20] = 0;
  _$jscoverage['/dialog.js'].lineData[22] = 0;
  _$jscoverage['/dialog.js'].lineData[23] = 0;
  _$jscoverage['/dialog.js'].lineData[25] = 0;
  _$jscoverage['/dialog.js'].lineData[27] = 0;
  _$jscoverage['/dialog.js'].lineData[28] = 0;
  _$jscoverage['/dialog.js'].lineData[31] = 0;
  _$jscoverage['/dialog.js'].lineData[37] = 0;
  _$jscoverage['/dialog.js'].lineData[39] = 0;
  _$jscoverage['/dialog.js'].lineData[40] = 0;
  _$jscoverage['/dialog.js'].lineData[41] = 0;
  _$jscoverage['/dialog.js'].lineData[42] = 0;
  _$jscoverage['/dialog.js'].lineData[43] = 0;
  _$jscoverage['/dialog.js'].lineData[47] = 0;
  _$jscoverage['/dialog.js'].lineData[48] = 0;
  _$jscoverage['/dialog.js'].lineData[49] = 0;
  _$jscoverage['/dialog.js'].lineData[50] = 0;
  _$jscoverage['/dialog.js'].lineData[51] = 0;
  _$jscoverage['/dialog.js'].lineData[53] = 0;
  _$jscoverage['/dialog.js'].lineData[55] = 0;
  _$jscoverage['/dialog.js'].lineData[56] = 0;
  _$jscoverage['/dialog.js'].lineData[57] = 0;
  _$jscoverage['/dialog.js'].lineData[63] = 0;
  _$jscoverage['/dialog.js'].lineData[65] = 0;
  _$jscoverage['/dialog.js'].lineData[66] = 0;
  _$jscoverage['/dialog.js'].lineData[67] = 0;
  _$jscoverage['/dialog.js'].lineData[68] = 0;
  _$jscoverage['/dialog.js'].lineData[69] = 0;
  _$jscoverage['/dialog.js'].lineData[70] = 0;
  _$jscoverage['/dialog.js'].lineData[71] = 0;
  _$jscoverage['/dialog.js'].lineData[73] = 0;
  _$jscoverage['/dialog.js'].lineData[74] = 0;
  _$jscoverage['/dialog.js'].lineData[76] = 0;
  _$jscoverage['/dialog.js'].lineData[79] = 0;
  _$jscoverage['/dialog.js'].lineData[80] = 0;
  _$jscoverage['/dialog.js'].lineData[82] = 0;
  _$jscoverage['/dialog.js'].lineData[83] = 0;
  _$jscoverage['/dialog.js'].lineData[86] = 0;
  _$jscoverage['/dialog.js'].lineData[90] = 0;
  _$jscoverage['/dialog.js'].lineData[91] = 0;
  _$jscoverage['/dialog.js'].lineData[92] = 0;
  _$jscoverage['/dialog.js'].lineData[93] = 0;
  _$jscoverage['/dialog.js'].lineData[95] = 0;
  _$jscoverage['/dialog.js'].lineData[96] = 0;
  _$jscoverage['/dialog.js'].lineData[97] = 0;
  _$jscoverage['/dialog.js'].lineData[98] = 0;
  _$jscoverage['/dialog.js'].lineData[99] = 0;
  _$jscoverage['/dialog.js'].lineData[100] = 0;
  _$jscoverage['/dialog.js'].lineData[101] = 0;
  _$jscoverage['/dialog.js'].lineData[102] = 0;
  _$jscoverage['/dialog.js'].lineData[105] = 0;
  _$jscoverage['/dialog.js'].lineData[109] = 0;
  _$jscoverage['/dialog.js'].lineData[110] = 0;
  _$jscoverage['/dialog.js'].lineData[111] = 0;
  _$jscoverage['/dialog.js'].lineData[112] = 0;
  _$jscoverage['/dialog.js'].lineData[115] = 0;
  _$jscoverage['/dialog.js'].lineData[116] = 0;
  _$jscoverage['/dialog.js'].lineData[117] = 0;
  _$jscoverage['/dialog.js'].lineData[122] = 0;
  _$jscoverage['/dialog.js'].lineData[125] = 0;
  _$jscoverage['/dialog.js'].lineData[127] = 0;
  _$jscoverage['/dialog.js'].lineData[152] = 0;
  _$jscoverage['/dialog.js'].lineData[153] = 0;
  _$jscoverage['/dialog.js'].lineData[154] = 0;
  _$jscoverage['/dialog.js'].lineData[157] = 0;
  _$jscoverage['/dialog.js'].lineData[159] = 0;
  _$jscoverage['/dialog.js'].lineData[161] = 0;
  _$jscoverage['/dialog.js'].lineData[165] = 0;
  _$jscoverage['/dialog.js'].lineData[176] = 0;
  _$jscoverage['/dialog.js'].lineData[186] = 0;
  _$jscoverage['/dialog.js'].lineData[187] = 0;
  _$jscoverage['/dialog.js'].lineData[189] = 0;
  _$jscoverage['/dialog.js'].lineData[190] = 0;
  _$jscoverage['/dialog.js'].lineData[191] = 0;
  _$jscoverage['/dialog.js'].lineData[194] = 0;
  _$jscoverage['/dialog.js'].lineData[195] = 0;
  _$jscoverage['/dialog.js'].lineData[198] = 0;
  _$jscoverage['/dialog.js'].lineData[202] = 0;
  _$jscoverage['/dialog.js'].lineData[203] = 0;
  _$jscoverage['/dialog.js'].lineData[204] = 0;
  _$jscoverage['/dialog.js'].lineData[205] = 0;
  _$jscoverage['/dialog.js'].lineData[206] = 0;
  _$jscoverage['/dialog.js'].lineData[208] = 0;
  _$jscoverage['/dialog.js'].lineData[212] = 0;
  _$jscoverage['/dialog.js'].lineData[213] = 0;
  _$jscoverage['/dialog.js'].lineData[214] = 0;
  _$jscoverage['/dialog.js'].lineData[216] = 0;
  _$jscoverage['/dialog.js'].lineData[217] = 0;
  _$jscoverage['/dialog.js'].lineData[218] = 0;
  _$jscoverage['/dialog.js'].lineData[219] = 0;
  _$jscoverage['/dialog.js'].lineData[220] = 0;
  _$jscoverage['/dialog.js'].lineData[221] = 0;
  _$jscoverage['/dialog.js'].lineData[222] = 0;
  _$jscoverage['/dialog.js'].lineData[223] = 0;
  _$jscoverage['/dialog.js'].lineData[226] = 0;
  _$jscoverage['/dialog.js'].lineData[228] = 0;
  _$jscoverage['/dialog.js'].lineData[229] = 0;
  _$jscoverage['/dialog.js'].lineData[230] = 0;
  _$jscoverage['/dialog.js'].lineData[231] = 0;
  _$jscoverage['/dialog.js'].lineData[235] = 0;
  _$jscoverage['/dialog.js'].lineData[242] = 0;
  _$jscoverage['/dialog.js'].lineData[244] = 0;
  _$jscoverage['/dialog.js'].lineData[248] = 0;
  _$jscoverage['/dialog.js'].lineData[249] = 0;
  _$jscoverage['/dialog.js'].lineData[252] = 0;
  _$jscoverage['/dialog.js'].lineData[255] = 0;
  _$jscoverage['/dialog.js'].lineData[259] = 0;
}
if (! _$jscoverage['/dialog.js'].functionData) {
  _$jscoverage['/dialog.js'].functionData = [];
  _$jscoverage['/dialog.js'].functionData[0] = 0;
  _$jscoverage['/dialog.js'].functionData[1] = 0;
  _$jscoverage['/dialog.js'].functionData[2] = 0;
  _$jscoverage['/dialog.js'].functionData[3] = 0;
  _$jscoverage['/dialog.js'].functionData[4] = 0;
  _$jscoverage['/dialog.js'].functionData[5] = 0;
  _$jscoverage['/dialog.js'].functionData[6] = 0;
  _$jscoverage['/dialog.js'].functionData[7] = 0;
  _$jscoverage['/dialog.js'].functionData[8] = 0;
  _$jscoverage['/dialog.js'].functionData[9] = 0;
  _$jscoverage['/dialog.js'].functionData[10] = 0;
  _$jscoverage['/dialog.js'].functionData[11] = 0;
  _$jscoverage['/dialog.js'].functionData[12] = 0;
  _$jscoverage['/dialog.js'].functionData[13] = 0;
  _$jscoverage['/dialog.js'].functionData[14] = 0;
  _$jscoverage['/dialog.js'].functionData[15] = 0;
  _$jscoverage['/dialog.js'].functionData[16] = 0;
  _$jscoverage['/dialog.js'].functionData[17] = 0;
  _$jscoverage['/dialog.js'].functionData[18] = 0;
  _$jscoverage['/dialog.js'].functionData[19] = 0;
  _$jscoverage['/dialog.js'].functionData[20] = 0;
  _$jscoverage['/dialog.js'].functionData[21] = 0;
  _$jscoverage['/dialog.js'].functionData[22] = 0;
  _$jscoverage['/dialog.js'].functionData[23] = 0;
  _$jscoverage['/dialog.js'].functionData[24] = 0;
  _$jscoverage['/dialog.js'].functionData[25] = 0;
}
if (! _$jscoverage['/dialog.js'].branchData) {
  _$jscoverage['/dialog.js'].branchData = {};
  _$jscoverage['/dialog.js'].branchData['13'] = [];
  _$jscoverage['/dialog.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['15'] = [];
  _$jscoverage['/dialog.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['20'] = [];
  _$jscoverage['/dialog.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['25'] = [];
  _$jscoverage['/dialog.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['28'] = [];
  _$jscoverage['/dialog.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['47'] = [];
  _$jscoverage['/dialog.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['67'] = [];
  _$jscoverage['/dialog.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['68'] = [];
  _$jscoverage['/dialog.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['79'] = [];
  _$jscoverage['/dialog.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['92'] = [];
  _$jscoverage['/dialog.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['95'] = [];
  _$jscoverage['/dialog.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['97'] = [];
  _$jscoverage['/dialog.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['98'] = [];
  _$jscoverage['/dialog.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['99'] = [];
  _$jscoverage['/dialog.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['101'] = [];
  _$jscoverage['/dialog.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['189'] = [];
  _$jscoverage['/dialog.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['204'] = [];
  _$jscoverage['/dialog.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['214'] = [];
  _$jscoverage['/dialog.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['219'] = [];
  _$jscoverage['/dialog.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['221'] = [];
  _$jscoverage['/dialog.js'].branchData['221'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['221'][1].init(85, 16, 'left.contains(t)');
function visit21_221_1(result) {
  _$jscoverage['/dialog.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['219'][1].init(95, 19, 't.nodeName() == "a"');
function visit20_219_1(result) {
  _$jscoverage['/dialog.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['214'][1].init(46, 15, 'ev && ev.halt()');
function visit19_214_1(result) {
  _$jscoverage['/dialog.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['204'][1].init(75, 35, '!/^#([a-f0-9]{1,2}){3,3}$/i.test(v)');
function visit18_204_1(result) {
  _$jscoverage['/dialog.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['189'][1].init(137, 35, '!/^#([a-f0-9]{1,2}){3,3}$/i.test(v)');
function visit17_189_1(result) {
  _$jscoverage['/dialog.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['101'][2].init(136, 9, 'i < n - 1');
function visit16_101_2(result) {
  _$jscoverage['/dialog.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['101'][1].init(136, 24, 'i < n - 1 && steps.pop()');
function visit15_101_1(result) {
  _$jscoverage['/dialog.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['99'][1].init(29, 15, 'step[i] || step');
function visit14_99_1(result) {
  _$jscoverage['/dialog.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['98'][1].init(46, 5, 'i < n');
function visit13_98_1(result) {
  _$jscoverage['/dialog.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['97'][1].init(238, 7, 'len > 1');
function visit12_97_1(result) {
  _$jscoverage['/dialog.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['95'][1].init(143, 8, 'len == 1');
function visit11_95_1(result) {
  _$jscoverage['/dialog.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['92'][1].init(64, 18, 'step === undefined');
function visit10_92_1(result) {
  _$jscoverage['/dialog.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['79'][1].init(389, 20, 'document.defaultView');
function visit9_79_1(result) {
  _$jscoverage['/dialog.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['68'][1].init(21, 5, '!frag');
function visit8_68_1(result) {
  _$jscoverage['/dialog.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['67'][1].init(55, 17, 'ret === undefined');
function visit7_67_1(result) {
  _$jscoverage['/dialog.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['47'][1].init(347, 8, 'i < step');
function visit6_47_1(result) {
  _$jscoverage['/dialog.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['28'][1].init(24, 18, 'x.indexOf("%") > 0');
function visit5_28_1(result) {
  _$jscoverage['/dialog.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['25'][1].init(536, 38, '/^rgb\\((.*),(.*),(.*)\\)$/i.test(color)');
function visit4_25_1(result) {
  _$jscoverage['/dialog.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['20'][1].init(313, 48, '/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.test(color)');
function visit3_20_1(result) {
  _$jscoverage['/dialog.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['15'][1].init(82, 57, '/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.test(color)');
function visit2_15_1(result) {
  _$jscoverage['/dialog.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['13'][1].init(13, 16, 'S.isArray(color)');
function visit1_13_1(result) {
  _$jscoverage['/dialog.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/dialog.js'].lineData[8]++;
  var Dialog4E = require('../dialog');
  _$jscoverage['/dialog.js'].lineData[9]++;
  var map = S.map, Dom = S.DOM;
  _$jscoverage['/dialog.js'].lineData[12]++;
  function getData(color) {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[13]++;
    if (visit1_13_1(S.isArray(color))) 
      return color;
    _$jscoverage['/dialog.js'].lineData[14]++;
    var re = RegExp;
    _$jscoverage['/dialog.js'].lineData[15]++;
    if (visit2_15_1(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.test(color))) {
      _$jscoverage['/dialog.js'].lineData[17]++;
      return map([re['$1'], re['$2'], re['$3']], function(x) {
  _$jscoverage['/dialog.js'].functionData[2]++;
  _$jscoverage['/dialog.js'].lineData[18]++;
  return parseInt(x, 16);
});
    } else {
      _$jscoverage['/dialog.js'].lineData[20]++;
      if (visit3_20_1(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.test(color))) {
        _$jscoverage['/dialog.js'].lineData[22]++;
        return map([re['$1'], re['$2'], re['$3']], function(x) {
  _$jscoverage['/dialog.js'].functionData[3]++;
  _$jscoverage['/dialog.js'].lineData[23]++;
  return parseInt(x + x, 16);
});
      } else {
        _$jscoverage['/dialog.js'].lineData[25]++;
        if (visit4_25_1(/^rgb\((.*),(.*),(.*)\)$/i.test(color))) {
          _$jscoverage['/dialog.js'].lineData[27]++;
          return map([re['$1'], re['$2'], re['$3']], function(x) {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[28]++;
  return visit5_28_1(x.indexOf("%") > 0) ? parseFloat(x, 10) * 2.55 : x | 0;
});
        }
      }
    }
    _$jscoverage['/dialog.js'].lineData[31]++;
    return undefined;
  }
  _$jscoverage['/dialog.js'].lineData[37]++;
  var ColorGrads = (function() {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[39]++;
  function getStep(start, end, step) {
    _$jscoverage['/dialog.js'].functionData[6]++;
    _$jscoverage['/dialog.js'].lineData[40]++;
    var colors = [];
    _$jscoverage['/dialog.js'].lineData[41]++;
    start = getColor(start);
    _$jscoverage['/dialog.js'].lineData[42]++;
    end = getColor(end);
    _$jscoverage['/dialog.js'].lineData[43]++;
    var stepR = (end[0] - start[0]) / step, stepG = (end[1] - start[1]) / step, stepB = (end[2] - start[2]) / step;
    _$jscoverage['/dialog.js'].lineData[47]++;
    for (var i = 0, r = start[0], g = start[1], b = start[2]; visit6_47_1(i < step); i++) {
      _$jscoverage['/dialog.js'].lineData[48]++;
      colors[i] = [r, g, b];
      _$jscoverage['/dialog.js'].lineData[49]++;
      r += stepR;
      _$jscoverage['/dialog.js'].lineData[50]++;
      g += stepG;
      _$jscoverage['/dialog.js'].lineData[51]++;
      b += stepB;
    }
    _$jscoverage['/dialog.js'].lineData[53]++;
    colors[i] = end;
    _$jscoverage['/dialog.js'].lineData[55]++;
    return map(colors, function(x) {
  _$jscoverage['/dialog.js'].functionData[7]++;
  _$jscoverage['/dialog.js'].lineData[56]++;
  return map(x, function(x) {
  _$jscoverage['/dialog.js'].functionData[8]++;
  _$jscoverage['/dialog.js'].lineData[57]++;
  return Math.min(Math.max(0, Math.floor(x)), 255);
});
});
  }
  _$jscoverage['/dialog.js'].lineData[63]++;
  var frag;
  _$jscoverage['/dialog.js'].lineData[65]++;
  function getColor(color) {
    _$jscoverage['/dialog.js'].functionData[9]++;
    _$jscoverage['/dialog.js'].lineData[66]++;
    var ret = getData(color);
    _$jscoverage['/dialog.js'].lineData[67]++;
    if (visit7_67_1(ret === undefined)) {
      _$jscoverage['/dialog.js'].lineData[68]++;
      if (visit8_68_1(!frag)) {
        _$jscoverage['/dialog.js'].lineData[69]++;
        frag = document.createElement('textarea');
        _$jscoverage['/dialog.js'].lineData[70]++;
        frag.style.display = "none";
        _$jscoverage['/dialog.js'].lineData[71]++;
        Dom.prepend(frag, document.body);
      }
      _$jscoverage['/dialog.js'].lineData[73]++;
      try {
        _$jscoverage['/dialog.js'].lineData[74]++;
        frag.style.color = color;
      }      catch (e) {
  _$jscoverage['/dialog.js'].lineData[76]++;
  return [0, 0, 0];
}
      _$jscoverage['/dialog.js'].lineData[79]++;
      if (visit9_79_1(document.defaultView)) {
        _$jscoverage['/dialog.js'].lineData[80]++;
        ret = getData(document.defaultView.getComputedStyle(frag, null).color);
      } else {
        _$jscoverage['/dialog.js'].lineData[82]++;
        color = frag.createTextRange()['queryCommandValue']("ForeColor");
        _$jscoverage['/dialog.js'].lineData[83]++;
        ret = [color & 0x0000ff, (color & 0x00ff00) >>> 8, (color & 0xff0000) >>> 16];
      }
    }
    _$jscoverage['/dialog.js'].lineData[86]++;
    return ret;
  }
  _$jscoverage['/dialog.js'].lineData[90]++;
  return function(colors, step) {
  _$jscoverage['/dialog.js'].functionData[10]++;
  _$jscoverage['/dialog.js'].lineData[91]++;
  var ret = [], len = colors.length;
  _$jscoverage['/dialog.js'].lineData[92]++;
  if (visit10_92_1(step === undefined)) {
    _$jscoverage['/dialog.js'].lineData[93]++;
    step = 20;
  }
  _$jscoverage['/dialog.js'].lineData[95]++;
  if (visit11_95_1(len == 1)) {
    _$jscoverage['/dialog.js'].lineData[96]++;
    ret = getStep(colors[0], colors[0], step);
  } else {
    _$jscoverage['/dialog.js'].lineData[97]++;
    if (visit12_97_1(len > 1)) {
      _$jscoverage['/dialog.js'].lineData[98]++;
      for (var i = 0, n = len - 1; visit13_98_1(i < n); i++) {
        _$jscoverage['/dialog.js'].lineData[99]++;
        var t = visit14_99_1(step[i] || step);
        _$jscoverage['/dialog.js'].lineData[100]++;
        var steps = getStep(colors[i], colors[i + 1], t);
        _$jscoverage['/dialog.js'].lineData[101]++;
        visit15_101_1(visit16_101_2(i < n - 1) && steps.pop());
        _$jscoverage['/dialog.js'].lineData[102]++;
        ret = ret.concat(steps);
      }
    }
  }
  _$jscoverage['/dialog.js'].lineData[105]++;
  return ret;
};
})();
  _$jscoverage['/dialog.js'].lineData[109]++;
  function padding2(x) {
    _$jscoverage['/dialog.js'].functionData[11]++;
    _$jscoverage['/dialog.js'].lineData[110]++;
    x = "0" + x;
    _$jscoverage['/dialog.js'].lineData[111]++;
    var l = x.length;
    _$jscoverage['/dialog.js'].lineData[112]++;
    return x.slice(l - 2, l);
  }
  _$jscoverage['/dialog.js'].lineData[115]++;
  function hex(c) {
    _$jscoverage['/dialog.js'].functionData[12]++;
    _$jscoverage['/dialog.js'].lineData[116]++;
    c = getData(c);
    _$jscoverage['/dialog.js'].lineData[117]++;
    return "#" + padding2(c[0].toString(16)) + padding2(c[1].toString(16)) + padding2(c[2].toString(16));
  }
  _$jscoverage['/dialog.js'].lineData[122]++;
  var pickerHTML = "<ul>" + map(ColorGrads(["red", "orange", "yellow", "green", "cyan", "blue", "purple"], 5), function(x) {
  _$jscoverage['/dialog.js'].functionData[13]++;
  _$jscoverage['/dialog.js'].lineData[125]++;
  return map(ColorGrads(["white", "rgb(" + x.join(",") + ")", "black"], 5), function(x) {
  _$jscoverage['/dialog.js'].functionData[14]++;
  _$jscoverage['/dialog.js'].lineData[127]++;
  return "<li><a style='background-color" + ":" + hex(x) + "' href='#'></a></li>";
}).join("");
}).join("</ul><ul>") + "</ul>", panelHTML = "<div class='{prefixCls}editor-color-advanced-picker'>" + "<div class='ks-clear'>" + "<div class='{prefixCls}editor-color-advanced-picker-left'>" + pickerHTML + "</div>" + "<div class='{prefixCls}editor-color-advanced-picker-right'>" + "</div>" + "</div>" + "<div style='padding:10px;'>" + "<label>" + "\u989c\u8272\u503c\uff1a " + "<input style='width:100px' class='{prefixCls}editor-color-advanced-value'/>" + "</label>" + "<span class='{prefixCls}editor-color-advanced-indicator'></span>" + "</div>" + "</div>", footHTML = "<div style='padding:5px 20px 20px;'>" + "<a class='{prefixCls}editor-button {prefixCls}editor-color-advanced-ok ks-inline-block'>\u786e\u5b9a</a>" + "&nbsp;&nbsp;&nbsp;" + "<a class='{prefixCls}editor-button  {prefixCls}editor-color-advanced-cancel ks-inline-block'>\u53d6\u6d88</a>" + "</div>";
  _$jscoverage['/dialog.js'].lineData[152]++;
  function ColorPicker(editor) {
    _$jscoverage['/dialog.js'].functionData[15]++;
    _$jscoverage['/dialog.js'].lineData[153]++;
    this.editor = editor;
    _$jscoverage['/dialog.js'].lineData[154]++;
    this._init();
  }
  _$jscoverage['/dialog.js'].lineData[157]++;
  var addRes = Editor.Utils.addRes, destroyRes = Editor.Utils.destroyRes;
  _$jscoverage['/dialog.js'].lineData[159]++;
  S.augment(ColorPicker, {
  _init: function() {
  _$jscoverage['/dialog.js'].functionData[16]++;
  _$jscoverage['/dialog.js'].lineData[161]++;
  var self = this, editor = self.editor, prefixCls = editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[165]++;
  self.dialog = new Dialog4E({
  mask: true, 
  headerContent: "\u989c\u8272\u62fe\u53d6\u5668", 
  bodyContent: S.substitute(panelHTML, {
  prefixCls: prefixCls}), 
  footerContent: S.substitute(footHTML, {
  prefixCls: prefixCls}), 
  width: "550px"}).render();
  _$jscoverage['/dialog.js'].lineData[176]++;
  var win = self.dialog, body = win.get("body"), foot = win.get("footer"), indicator = body.one("." + prefixCls + "editor-color-advanced-indicator"), indicatorValue = body.one("." + prefixCls + "editor-color-advanced-value"), left = body.one("." + prefixCls + "editor-color-advanced-picker-left"), right = body.one("." + prefixCls + "editor-color-advanced-picker-right"), ok = foot.one("." + prefixCls + "editor-color-advanced-ok"), cancel = foot.one("." + prefixCls + "editor-color-advanced-cancel");
  _$jscoverage['/dialog.js'].lineData[186]++;
  ok.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[17]++;
  _$jscoverage['/dialog.js'].lineData[187]++;
  var v = S.trim(indicatorValue.val()), colorButtonArrow = self.colorButtonArrow;
  _$jscoverage['/dialog.js'].lineData[189]++;
  if (visit17_189_1(!/^#([a-f0-9]{1,2}){3,3}$/i.test(v))) {
    _$jscoverage['/dialog.js'].lineData[190]++;
    alert("\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u989c\u8272\u4ee3\u7801");
    _$jscoverage['/dialog.js'].lineData[191]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[194]++;
  self.hide();
  _$jscoverage['/dialog.js'].lineData[195]++;
  colorButtonArrow.fire('selectColor', {
  color: indicatorValue.val()});
  _$jscoverage['/dialog.js'].lineData[198]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[202]++;
  indicatorValue.on("change", function() {
  _$jscoverage['/dialog.js'].functionData[18]++;
  _$jscoverage['/dialog.js'].lineData[203]++;
  var v = S.trim(indicatorValue.val());
  _$jscoverage['/dialog.js'].lineData[204]++;
  if (visit18_204_1(!/^#([a-f0-9]{1,2}){3,3}$/i.test(v))) {
    _$jscoverage['/dialog.js'].lineData[205]++;
    alert("\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u989c\u8272\u4ee3\u7801");
    _$jscoverage['/dialog.js'].lineData[206]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[208]++;
  indicator.css("background-color", v);
});
  _$jscoverage['/dialog.js'].lineData[212]++;
  cancel.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[19]++;
  _$jscoverage['/dialog.js'].lineData[213]++;
  self.hide();
  _$jscoverage['/dialog.js'].lineData[214]++;
  visit19_214_1(ev && ev.halt());
});
  _$jscoverage['/dialog.js'].lineData[216]++;
  body.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[20]++;
  _$jscoverage['/dialog.js'].lineData[217]++;
  ev.halt();
  _$jscoverage['/dialog.js'].lineData[218]++;
  var t = new S.Node(ev.target);
  _$jscoverage['/dialog.js'].lineData[219]++;
  if (visit20_219_1(t.nodeName() == "a")) {
    _$jscoverage['/dialog.js'].lineData[220]++;
    var c = hex(t.css("background-color"));
    _$jscoverage['/dialog.js'].lineData[221]++;
    if (visit21_221_1(left.contains(t))) 
      self._detailColor(c);
    _$jscoverage['/dialog.js'].lineData[222]++;
    indicatorValue.val(c);
    _$jscoverage['/dialog.js'].lineData[223]++;
    indicator.css("background-color", c);
  }
});
  _$jscoverage['/dialog.js'].lineData[226]++;
  addRes.call(self, ok, indicatorValue, cancel, body, self.dialog);
  _$jscoverage['/dialog.js'].lineData[228]++;
  var defaultColor = "#FF9900";
  _$jscoverage['/dialog.js'].lineData[229]++;
  self._detailColor(defaultColor);
  _$jscoverage['/dialog.js'].lineData[230]++;
  indicatorValue.val(defaultColor);
  _$jscoverage['/dialog.js'].lineData[231]++;
  indicator.css("background-color", defaultColor);
}, 
  _detailColor: function(color) {
  _$jscoverage['/dialog.js'].functionData[21]++;
  _$jscoverage['/dialog.js'].lineData[235]++;
  var self = this, win = self.dialog, body = win.get("body"), editor = self.editor, prefixCls = editor.get('prefixCls'), detailPanel = body.one("." + prefixCls + "editor-color-advanced-picker-right");
  _$jscoverage['/dialog.js'].lineData[242]++;
  detailPanel.html(map(ColorGrads(["#ffffff", color, "#000000"], 40), function(x) {
  _$jscoverage['/dialog.js'].functionData[22]++;
  _$jscoverage['/dialog.js'].lineData[244]++;
  return "<a style='background-color:" + hex(x) + "'></a>";
}).join(""));
}, 
  show: function(colorButtonArrow) {
  _$jscoverage['/dialog.js'].functionData[23]++;
  _$jscoverage['/dialog.js'].lineData[248]++;
  this.colorButtonArrow = colorButtonArrow;
  _$jscoverage['/dialog.js'].lineData[249]++;
  this.dialog.show();
}, 
  hide: function() {
  _$jscoverage['/dialog.js'].functionData[24]++;
  _$jscoverage['/dialog.js'].lineData[252]++;
  this.dialog.hide();
}, 
  destroy: function() {
  _$jscoverage['/dialog.js'].functionData[25]++;
  _$jscoverage['/dialog.js'].lineData[255]++;
  destroyRes.call(this);
}});
  _$jscoverage['/dialog.js'].lineData[259]++;
  return ColorPicker;
});
