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
  _$jscoverage['/dialog.js'].lineData[5] = 0;
  _$jscoverage['/dialog.js'].lineData[6] = 0;
  _$jscoverage['/dialog.js'].lineData[9] = 0;
  _$jscoverage['/dialog.js'].lineData[10] = 0;
  _$jscoverage['/dialog.js'].lineData[11] = 0;
  _$jscoverage['/dialog.js'].lineData[12] = 0;
  _$jscoverage['/dialog.js'].lineData[14] = 0;
  _$jscoverage['/dialog.js'].lineData[15] = 0;
  _$jscoverage['/dialog.js'].lineData[17] = 0;
  _$jscoverage['/dialog.js'].lineData[19] = 0;
  _$jscoverage['/dialog.js'].lineData[20] = 0;
  _$jscoverage['/dialog.js'].lineData[22] = 0;
  _$jscoverage['/dialog.js'].lineData[24] = 0;
  _$jscoverage['/dialog.js'].lineData[25] = 0;
  _$jscoverage['/dialog.js'].lineData[28] = 0;
  _$jscoverage['/dialog.js'].lineData[34] = 0;
  _$jscoverage['/dialog.js'].lineData[36] = 0;
  _$jscoverage['/dialog.js'].lineData[37] = 0;
  _$jscoverage['/dialog.js'].lineData[38] = 0;
  _$jscoverage['/dialog.js'].lineData[39] = 0;
  _$jscoverage['/dialog.js'].lineData[40] = 0;
  _$jscoverage['/dialog.js'].lineData[44] = 0;
  _$jscoverage['/dialog.js'].lineData[45] = 0;
  _$jscoverage['/dialog.js'].lineData[46] = 0;
  _$jscoverage['/dialog.js'].lineData[47] = 0;
  _$jscoverage['/dialog.js'].lineData[48] = 0;
  _$jscoverage['/dialog.js'].lineData[50] = 0;
  _$jscoverage['/dialog.js'].lineData[52] = 0;
  _$jscoverage['/dialog.js'].lineData[53] = 0;
  _$jscoverage['/dialog.js'].lineData[54] = 0;
  _$jscoverage['/dialog.js'].lineData[60] = 0;
  _$jscoverage['/dialog.js'].lineData[62] = 0;
  _$jscoverage['/dialog.js'].lineData[63] = 0;
  _$jscoverage['/dialog.js'].lineData[64] = 0;
  _$jscoverage['/dialog.js'].lineData[65] = 0;
  _$jscoverage['/dialog.js'].lineData[66] = 0;
  _$jscoverage['/dialog.js'].lineData[67] = 0;
  _$jscoverage['/dialog.js'].lineData[68] = 0;
  _$jscoverage['/dialog.js'].lineData[70] = 0;
  _$jscoverage['/dialog.js'].lineData[71] = 0;
  _$jscoverage['/dialog.js'].lineData[73] = 0;
  _$jscoverage['/dialog.js'].lineData[76] = 0;
  _$jscoverage['/dialog.js'].lineData[77] = 0;
  _$jscoverage['/dialog.js'].lineData[79] = 0;
  _$jscoverage['/dialog.js'].lineData[80] = 0;
  _$jscoverage['/dialog.js'].lineData[83] = 0;
  _$jscoverage['/dialog.js'].lineData[87] = 0;
  _$jscoverage['/dialog.js'].lineData[88] = 0;
  _$jscoverage['/dialog.js'].lineData[89] = 0;
  _$jscoverage['/dialog.js'].lineData[90] = 0;
  _$jscoverage['/dialog.js'].lineData[92] = 0;
  _$jscoverage['/dialog.js'].lineData[93] = 0;
  _$jscoverage['/dialog.js'].lineData[94] = 0;
  _$jscoverage['/dialog.js'].lineData[95] = 0;
  _$jscoverage['/dialog.js'].lineData[96] = 0;
  _$jscoverage['/dialog.js'].lineData[97] = 0;
  _$jscoverage['/dialog.js'].lineData[98] = 0;
  _$jscoverage['/dialog.js'].lineData[99] = 0;
  _$jscoverage['/dialog.js'].lineData[102] = 0;
  _$jscoverage['/dialog.js'].lineData[106] = 0;
  _$jscoverage['/dialog.js'].lineData[107] = 0;
  _$jscoverage['/dialog.js'].lineData[108] = 0;
  _$jscoverage['/dialog.js'].lineData[109] = 0;
  _$jscoverage['/dialog.js'].lineData[112] = 0;
  _$jscoverage['/dialog.js'].lineData[113] = 0;
  _$jscoverage['/dialog.js'].lineData[114] = 0;
  _$jscoverage['/dialog.js'].lineData[119] = 0;
  _$jscoverage['/dialog.js'].lineData[122] = 0;
  _$jscoverage['/dialog.js'].lineData[124] = 0;
  _$jscoverage['/dialog.js'].lineData[149] = 0;
  _$jscoverage['/dialog.js'].lineData[150] = 0;
  _$jscoverage['/dialog.js'].lineData[151] = 0;
  _$jscoverage['/dialog.js'].lineData[154] = 0;
  _$jscoverage['/dialog.js'].lineData[156] = 0;
  _$jscoverage['/dialog.js'].lineData[158] = 0;
  _$jscoverage['/dialog.js'].lineData[162] = 0;
  _$jscoverage['/dialog.js'].lineData[173] = 0;
  _$jscoverage['/dialog.js'].lineData[183] = 0;
  _$jscoverage['/dialog.js'].lineData[184] = 0;
  _$jscoverage['/dialog.js'].lineData[186] = 0;
  _$jscoverage['/dialog.js'].lineData[187] = 0;
  _$jscoverage['/dialog.js'].lineData[188] = 0;
  _$jscoverage['/dialog.js'].lineData[191] = 0;
  _$jscoverage['/dialog.js'].lineData[192] = 0;
  _$jscoverage['/dialog.js'].lineData[195] = 0;
  _$jscoverage['/dialog.js'].lineData[199] = 0;
  _$jscoverage['/dialog.js'].lineData[200] = 0;
  _$jscoverage['/dialog.js'].lineData[201] = 0;
  _$jscoverage['/dialog.js'].lineData[202] = 0;
  _$jscoverage['/dialog.js'].lineData[203] = 0;
  _$jscoverage['/dialog.js'].lineData[205] = 0;
  _$jscoverage['/dialog.js'].lineData[209] = 0;
  _$jscoverage['/dialog.js'].lineData[210] = 0;
  _$jscoverage['/dialog.js'].lineData[211] = 0;
  _$jscoverage['/dialog.js'].lineData[213] = 0;
  _$jscoverage['/dialog.js'].lineData[214] = 0;
  _$jscoverage['/dialog.js'].lineData[215] = 0;
  _$jscoverage['/dialog.js'].lineData[216] = 0;
  _$jscoverage['/dialog.js'].lineData[217] = 0;
  _$jscoverage['/dialog.js'].lineData[218] = 0;
  _$jscoverage['/dialog.js'].lineData[219] = 0;
  _$jscoverage['/dialog.js'].lineData[220] = 0;
  _$jscoverage['/dialog.js'].lineData[223] = 0;
  _$jscoverage['/dialog.js'].lineData[225] = 0;
  _$jscoverage['/dialog.js'].lineData[226] = 0;
  _$jscoverage['/dialog.js'].lineData[227] = 0;
  _$jscoverage['/dialog.js'].lineData[228] = 0;
  _$jscoverage['/dialog.js'].lineData[232] = 0;
  _$jscoverage['/dialog.js'].lineData[239] = 0;
  _$jscoverage['/dialog.js'].lineData[241] = 0;
  _$jscoverage['/dialog.js'].lineData[245] = 0;
  _$jscoverage['/dialog.js'].lineData[246] = 0;
  _$jscoverage['/dialog.js'].lineData[249] = 0;
  _$jscoverage['/dialog.js'].lineData[252] = 0;
  _$jscoverage['/dialog.js'].lineData[256] = 0;
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
  _$jscoverage['/dialog.js'].branchData['10'] = [];
  _$jscoverage['/dialog.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['12'] = [];
  _$jscoverage['/dialog.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['17'] = [];
  _$jscoverage['/dialog.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['22'] = [];
  _$jscoverage['/dialog.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['25'] = [];
  _$jscoverage['/dialog.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['44'] = [];
  _$jscoverage['/dialog.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['64'] = [];
  _$jscoverage['/dialog.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['65'] = [];
  _$jscoverage['/dialog.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['76'] = [];
  _$jscoverage['/dialog.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['89'] = [];
  _$jscoverage['/dialog.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['92'] = [];
  _$jscoverage['/dialog.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['94'] = [];
  _$jscoverage['/dialog.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['95'] = [];
  _$jscoverage['/dialog.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['96'] = [];
  _$jscoverage['/dialog.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['98'] = [];
  _$jscoverage['/dialog.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['98'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['186'] = [];
  _$jscoverage['/dialog.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['201'] = [];
  _$jscoverage['/dialog.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['211'] = [];
  _$jscoverage['/dialog.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['216'] = [];
  _$jscoverage['/dialog.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['218'] = [];
  _$jscoverage['/dialog.js'].branchData['218'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['218'][1].init(87, 16, 'left.contains(t)');
function visit21_218_1(result) {
  _$jscoverage['/dialog.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['216'][1].init(98, 19, 't.nodeName() == "a"');
function visit20_216_1(result) {
  _$jscoverage['/dialog.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['211'][1].init(48, 15, 'ev && ev.halt()');
function visit19_211_1(result) {
  _$jscoverage['/dialog.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['201'][1].init(77, 35, '!/^#([a-f0-9]{1,2}){3,3}$/i.test(v)');
function visit18_201_1(result) {
  _$jscoverage['/dialog.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['186'][1].init(140, 35, '!/^#([a-f0-9]{1,2}){3,3}$/i.test(v)');
function visit17_186_1(result) {
  _$jscoverage['/dialog.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['98'][2].init(139, 9, 'i < n - 1');
function visit16_98_2(result) {
  _$jscoverage['/dialog.js'].branchData['98'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['98'][1].init(139, 24, 'i < n - 1 && steps.pop()');
function visit15_98_1(result) {
  _$jscoverage['/dialog.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['96'][1].init(30, 15, 'step[i] || step');
function visit14_96_1(result) {
  _$jscoverage['/dialog.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['95'][1].init(47, 5, 'i < n');
function visit13_95_1(result) {
  _$jscoverage['/dialog.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['94'][1].init(245, 7, 'len > 1');
function visit12_94_1(result) {
  _$jscoverage['/dialog.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['92'][1].init(148, 8, 'len == 1');
function visit11_92_1(result) {
  _$jscoverage['/dialog.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['89'][1].init(66, 18, 'step === undefined');
function visit10_89_1(result) {
  _$jscoverage['/dialog.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['76'][1].init(401, 20, 'document.defaultView');
function visit9_76_1(result) {
  _$jscoverage['/dialog.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['65'][1].init(22, 5, '!frag');
function visit8_65_1(result) {
  _$jscoverage['/dialog.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['64'][1].init(57, 17, 'ret === undefined');
function visit7_64_1(result) {
  _$jscoverage['/dialog.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['44'][1].init(355, 8, 'i < step');
function visit6_44_1(result) {
  _$jscoverage['/dialog.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['25'][1].init(25, 18, 'x.indexOf("%") > 0');
function visit5_25_1(result) {
  _$jscoverage['/dialog.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['22'][1].init(549, 38, '/^rgb\\((.*),(.*),(.*)\\)$/i.test(color)');
function visit4_22_1(result) {
  _$jscoverage['/dialog.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['17'][1].init(321, 48, '/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.test(color)');
function visit3_17_1(result) {
  _$jscoverage['/dialog.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['12'][1].init(85, 57, '/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.test(color)');
function visit2_12_1(result) {
  _$jscoverage['/dialog.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['10'][1].init(14, 16, 'S.isArray(color)');
function visit1_10_1(result) {
  _$jscoverage['/dialog.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[5]++;
KISSY.add("editor/plugin/color/dialog", function(S, Editor, Dialog4E) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[6]++;
  var map = S.map, Dom = S.DOM;
  _$jscoverage['/dialog.js'].lineData[9]++;
  function getData(color) {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[10]++;
    if (visit1_10_1(S.isArray(color))) 
      return color;
    _$jscoverage['/dialog.js'].lineData[11]++;
    var re = RegExp;
    _$jscoverage['/dialog.js'].lineData[12]++;
    if (visit2_12_1(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.test(color))) {
      _$jscoverage['/dialog.js'].lineData[14]++;
      return map([re['$1'], re['$2'], re['$3']], function(x) {
  _$jscoverage['/dialog.js'].functionData[2]++;
  _$jscoverage['/dialog.js'].lineData[15]++;
  return parseInt(x, 16);
});
    } else {
      _$jscoverage['/dialog.js'].lineData[17]++;
      if (visit3_17_1(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.test(color))) {
        _$jscoverage['/dialog.js'].lineData[19]++;
        return map([re['$1'], re['$2'], re['$3']], function(x) {
  _$jscoverage['/dialog.js'].functionData[3]++;
  _$jscoverage['/dialog.js'].lineData[20]++;
  return parseInt(x + x, 16);
});
      } else {
        _$jscoverage['/dialog.js'].lineData[22]++;
        if (visit4_22_1(/^rgb\((.*),(.*),(.*)\)$/i.test(color))) {
          _$jscoverage['/dialog.js'].lineData[24]++;
          return map([re['$1'], re['$2'], re['$3']], function(x) {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[25]++;
  return visit5_25_1(x.indexOf("%") > 0) ? parseFloat(x, 10) * 2.55 : x | 0;
});
        }
      }
    }
    _$jscoverage['/dialog.js'].lineData[28]++;
    return undefined;
  }
  _$jscoverage['/dialog.js'].lineData[34]++;
  var ColorGrads = (function() {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[36]++;
  function getStep(start, end, step) {
    _$jscoverage['/dialog.js'].functionData[6]++;
    _$jscoverage['/dialog.js'].lineData[37]++;
    var colors = [];
    _$jscoverage['/dialog.js'].lineData[38]++;
    start = getColor(start);
    _$jscoverage['/dialog.js'].lineData[39]++;
    end = getColor(end);
    _$jscoverage['/dialog.js'].lineData[40]++;
    var stepR = (end[0] - start[0]) / step, stepG = (end[1] - start[1]) / step, stepB = (end[2] - start[2]) / step;
    _$jscoverage['/dialog.js'].lineData[44]++;
    for (var i = 0, r = start[0], g = start[1], b = start[2]; visit6_44_1(i < step); i++) {
      _$jscoverage['/dialog.js'].lineData[45]++;
      colors[i] = [r, g, b];
      _$jscoverage['/dialog.js'].lineData[46]++;
      r += stepR;
      _$jscoverage['/dialog.js'].lineData[47]++;
      g += stepG;
      _$jscoverage['/dialog.js'].lineData[48]++;
      b += stepB;
    }
    _$jscoverage['/dialog.js'].lineData[50]++;
    colors[i] = end;
    _$jscoverage['/dialog.js'].lineData[52]++;
    return map(colors, function(x) {
  _$jscoverage['/dialog.js'].functionData[7]++;
  _$jscoverage['/dialog.js'].lineData[53]++;
  return map(x, function(x) {
  _$jscoverage['/dialog.js'].functionData[8]++;
  _$jscoverage['/dialog.js'].lineData[54]++;
  return Math.min(Math.max(0, Math.floor(x)), 255);
});
});
  }
  _$jscoverage['/dialog.js'].lineData[60]++;
  var frag;
  _$jscoverage['/dialog.js'].lineData[62]++;
  function getColor(color) {
    _$jscoverage['/dialog.js'].functionData[9]++;
    _$jscoverage['/dialog.js'].lineData[63]++;
    var ret = getData(color);
    _$jscoverage['/dialog.js'].lineData[64]++;
    if (visit7_64_1(ret === undefined)) {
      _$jscoverage['/dialog.js'].lineData[65]++;
      if (visit8_65_1(!frag)) {
        _$jscoverage['/dialog.js'].lineData[66]++;
        frag = document.createElement("textarea");
        _$jscoverage['/dialog.js'].lineData[67]++;
        frag.style.display = "none";
        _$jscoverage['/dialog.js'].lineData[68]++;
        Dom.prepend(frag, document.body);
      }
      _$jscoverage['/dialog.js'].lineData[70]++;
      try {
        _$jscoverage['/dialog.js'].lineData[71]++;
        frag.style.color = color;
      }      catch (e) {
  _$jscoverage['/dialog.js'].lineData[73]++;
  return [0, 0, 0];
}
      _$jscoverage['/dialog.js'].lineData[76]++;
      if (visit9_76_1(document.defaultView)) {
        _$jscoverage['/dialog.js'].lineData[77]++;
        ret = getData(document.defaultView.getComputedStyle(frag, null).color);
      } else {
        _$jscoverage['/dialog.js'].lineData[79]++;
        color = frag.createTextRange()['queryCommandValue']("ForeColor");
        _$jscoverage['/dialog.js'].lineData[80]++;
        ret = [color & 0x0000ff, (color & 0x00ff00) >>> 8, (color & 0xff0000) >>> 16];
      }
    }
    _$jscoverage['/dialog.js'].lineData[83]++;
    return ret;
  }
  _$jscoverage['/dialog.js'].lineData[87]++;
  return function(colors, step) {
  _$jscoverage['/dialog.js'].functionData[10]++;
  _$jscoverage['/dialog.js'].lineData[88]++;
  var ret = [], len = colors.length;
  _$jscoverage['/dialog.js'].lineData[89]++;
  if (visit10_89_1(step === undefined)) {
    _$jscoverage['/dialog.js'].lineData[90]++;
    step = 20;
  }
  _$jscoverage['/dialog.js'].lineData[92]++;
  if (visit11_92_1(len == 1)) {
    _$jscoverage['/dialog.js'].lineData[93]++;
    ret = getStep(colors[0], colors[0], step);
  } else {
    _$jscoverage['/dialog.js'].lineData[94]++;
    if (visit12_94_1(len > 1)) {
      _$jscoverage['/dialog.js'].lineData[95]++;
      for (var i = 0, n = len - 1; visit13_95_1(i < n); i++) {
        _$jscoverage['/dialog.js'].lineData[96]++;
        var t = visit14_96_1(step[i] || step);
        _$jscoverage['/dialog.js'].lineData[97]++;
        var steps = getStep(colors[i], colors[i + 1], t);
        _$jscoverage['/dialog.js'].lineData[98]++;
        visit15_98_1(visit16_98_2(i < n - 1) && steps.pop());
        _$jscoverage['/dialog.js'].lineData[99]++;
        ret = ret.concat(steps);
      }
    }
  }
  _$jscoverage['/dialog.js'].lineData[102]++;
  return ret;
};
})();
  _$jscoverage['/dialog.js'].lineData[106]++;
  function padding2(x) {
    _$jscoverage['/dialog.js'].functionData[11]++;
    _$jscoverage['/dialog.js'].lineData[107]++;
    x = "0" + x;
    _$jscoverage['/dialog.js'].lineData[108]++;
    var l = x.length;
    _$jscoverage['/dialog.js'].lineData[109]++;
    return x.slice(l - 2, l);
  }
  _$jscoverage['/dialog.js'].lineData[112]++;
  function hex(c) {
    _$jscoverage['/dialog.js'].functionData[12]++;
    _$jscoverage['/dialog.js'].lineData[113]++;
    c = getData(c);
    _$jscoverage['/dialog.js'].lineData[114]++;
    return "#" + padding2(c[0].toString(16)) + padding2(c[1].toString(16)) + padding2(c[2].toString(16));
  }
  _$jscoverage['/dialog.js'].lineData[119]++;
  var pickerHTML = "<ul>" + map(ColorGrads(["red", "orange", "yellow", "green", "cyan", "blue", "purple"], 5), function(x) {
  _$jscoverage['/dialog.js'].functionData[13]++;
  _$jscoverage['/dialog.js'].lineData[122]++;
  return map(ColorGrads(["white", "rgb(" + x.join(",") + ")", "black"], 5), function(x) {
  _$jscoverage['/dialog.js'].functionData[14]++;
  _$jscoverage['/dialog.js'].lineData[124]++;
  return "<li><a style='background-color" + ":" + hex(x) + "' href='#'></a></li>";
}).join("");
}).join("</ul><ul>") + "</ul>", panelHTML = "<div class='{prefixCls}editor-color-advanced-picker'>" + "<div class='ks-clear'>" + "<div class='{prefixCls}editor-color-advanced-picker-left'>" + pickerHTML + "</div>" + "<div class='{prefixCls}editor-color-advanced-picker-right'>" + "</div>" + "</div>" + "<div style='padding:10px;'>" + "<label>" + "\u989c\u8272\u503c\uff1a " + "<input style='width:100px' class='{prefixCls}editor-color-advanced-value'/>" + "</label>" + "<span class='{prefixCls}editor-color-advanced-indicator'></span>" + "</div>" + "</div>", footHTML = "<div style='padding:5px 20px 20px;'>" + "<a class='{prefixCls}editor-button {prefixCls}editor-color-advanced-ok ks-inline-block'>\u786e\u5b9a</a>" + "&nbsp;&nbsp;&nbsp;" + "<a class='{prefixCls}editor-button  {prefixCls}editor-color-advanced-cancel ks-inline-block'>\u53d6\u6d88</a>" + "</div>";
  _$jscoverage['/dialog.js'].lineData[149]++;
  function ColorPicker(editor) {
    _$jscoverage['/dialog.js'].functionData[15]++;
    _$jscoverage['/dialog.js'].lineData[150]++;
    this.editor = editor;
    _$jscoverage['/dialog.js'].lineData[151]++;
    this._init();
  }
  _$jscoverage['/dialog.js'].lineData[154]++;
  var addRes = Editor.Utils.addRes, destroyRes = Editor.Utils.destroyRes;
  _$jscoverage['/dialog.js'].lineData[156]++;
  S.augment(ColorPicker, {
  _init: function() {
  _$jscoverage['/dialog.js'].functionData[16]++;
  _$jscoverage['/dialog.js'].lineData[158]++;
  var self = this, editor = self.editor, prefixCls = editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[162]++;
  self.dialog = new Dialog4E({
  mask: true, 
  headerContent: "\u989c\u8272\u62fe\u53d6\u5668", 
  bodyContent: S.substitute(panelHTML, {
  prefixCls: prefixCls}), 
  footerContent: S.substitute(footHTML, {
  prefixCls: prefixCls}), 
  width: "550px"}).render();
  _$jscoverage['/dialog.js'].lineData[173]++;
  var win = self.dialog, body = win.get("body"), foot = win.get("footer"), indicator = body.one("." + prefixCls + "editor-color-advanced-indicator"), indicatorValue = body.one("." + prefixCls + "editor-color-advanced-value"), left = body.one("." + prefixCls + "editor-color-advanced-picker-left"), right = body.one("." + prefixCls + "editor-color-advanced-picker-right"), ok = foot.one("." + prefixCls + "editor-color-advanced-ok"), cancel = foot.one("." + prefixCls + "editor-color-advanced-cancel");
  _$jscoverage['/dialog.js'].lineData[183]++;
  ok.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[17]++;
  _$jscoverage['/dialog.js'].lineData[184]++;
  var v = S.trim(indicatorValue.val()), colorButtonArrow = self.colorButtonArrow;
  _$jscoverage['/dialog.js'].lineData[186]++;
  if (visit17_186_1(!/^#([a-f0-9]{1,2}){3,3}$/i.test(v))) {
    _$jscoverage['/dialog.js'].lineData[187]++;
    alert("\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u989c\u8272\u4ee3\u7801");
    _$jscoverage['/dialog.js'].lineData[188]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[191]++;
  self.hide();
  _$jscoverage['/dialog.js'].lineData[192]++;
  colorButtonArrow.fire('selectColor', {
  color: indicatorValue.val()});
  _$jscoverage['/dialog.js'].lineData[195]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[199]++;
  indicatorValue.on("change", function() {
  _$jscoverage['/dialog.js'].functionData[18]++;
  _$jscoverage['/dialog.js'].lineData[200]++;
  var v = S.trim(indicatorValue.val());
  _$jscoverage['/dialog.js'].lineData[201]++;
  if (visit18_201_1(!/^#([a-f0-9]{1,2}){3,3}$/i.test(v))) {
    _$jscoverage['/dialog.js'].lineData[202]++;
    alert("\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u989c\u8272\u4ee3\u7801");
    _$jscoverage['/dialog.js'].lineData[203]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[205]++;
  indicator.css("background-color", v);
});
  _$jscoverage['/dialog.js'].lineData[209]++;
  cancel.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[19]++;
  _$jscoverage['/dialog.js'].lineData[210]++;
  self.hide();
  _$jscoverage['/dialog.js'].lineData[211]++;
  visit19_211_1(ev && ev.halt());
});
  _$jscoverage['/dialog.js'].lineData[213]++;
  body.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[20]++;
  _$jscoverage['/dialog.js'].lineData[214]++;
  ev.halt();
  _$jscoverage['/dialog.js'].lineData[215]++;
  var t = new S.Node(ev.target);
  _$jscoverage['/dialog.js'].lineData[216]++;
  if (visit20_216_1(t.nodeName() == "a")) {
    _$jscoverage['/dialog.js'].lineData[217]++;
    var c = hex(t.css("background-color"));
    _$jscoverage['/dialog.js'].lineData[218]++;
    if (visit21_218_1(left.contains(t))) 
      self._detailColor(c);
    _$jscoverage['/dialog.js'].lineData[219]++;
    indicatorValue.val(c);
    _$jscoverage['/dialog.js'].lineData[220]++;
    indicator.css("background-color", c);
  }
});
  _$jscoverage['/dialog.js'].lineData[223]++;
  addRes.call(self, ok, indicatorValue, cancel, body, self.dialog);
  _$jscoverage['/dialog.js'].lineData[225]++;
  var defaultColor = "#FF9900";
  _$jscoverage['/dialog.js'].lineData[226]++;
  self._detailColor(defaultColor);
  _$jscoverage['/dialog.js'].lineData[227]++;
  indicatorValue.val(defaultColor);
  _$jscoverage['/dialog.js'].lineData[228]++;
  indicator.css("background-color", defaultColor);
}, 
  _detailColor: function(color) {
  _$jscoverage['/dialog.js'].functionData[21]++;
  _$jscoverage['/dialog.js'].lineData[232]++;
  var self = this, win = self.dialog, body = win.get("body"), editor = self.editor, prefixCls = editor.get('prefixCls'), detailPanel = body.one("." + prefixCls + "editor-color-advanced-picker-right");
  _$jscoverage['/dialog.js'].lineData[239]++;
  detailPanel.html(map(ColorGrads(["#ffffff", color, "#000000"], 40), function(x) {
  _$jscoverage['/dialog.js'].functionData[22]++;
  _$jscoverage['/dialog.js'].lineData[241]++;
  return "<a style='background-color:" + hex(x) + "'></a>";
}).join(""));
}, 
  show: function(colorButtonArrow) {
  _$jscoverage['/dialog.js'].functionData[23]++;
  _$jscoverage['/dialog.js'].lineData[245]++;
  this.colorButtonArrow = colorButtonArrow;
  _$jscoverage['/dialog.js'].lineData[246]++;
  this.dialog.show();
}, 
  hide: function() {
  _$jscoverage['/dialog.js'].functionData[24]++;
  _$jscoverage['/dialog.js'].lineData[249]++;
  this.dialog.hide();
}, 
  destroy: function() {
  _$jscoverage['/dialog.js'].functionData[25]++;
  _$jscoverage['/dialog.js'].lineData[252]++;
  destroyRes.call(this);
}});
  _$jscoverage['/dialog.js'].lineData[256]++;
  return ColorPicker;
}, {
  requires: ['editor', '../dialog']});
