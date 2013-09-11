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
  _$jscoverage['/dialog.js'].lineData[10] = 0;
  _$jscoverage['/dialog.js'].lineData[11] = 0;
  _$jscoverage['/dialog.js'].lineData[12] = 0;
  _$jscoverage['/dialog.js'].lineData[13] = 0;
  _$jscoverage['/dialog.js'].lineData[15] = 0;
  _$jscoverage['/dialog.js'].lineData[16] = 0;
  _$jscoverage['/dialog.js'].lineData[18] = 0;
  _$jscoverage['/dialog.js'].lineData[20] = 0;
  _$jscoverage['/dialog.js'].lineData[21] = 0;
  _$jscoverage['/dialog.js'].lineData[23] = 0;
  _$jscoverage['/dialog.js'].lineData[25] = 0;
  _$jscoverage['/dialog.js'].lineData[26] = 0;
  _$jscoverage['/dialog.js'].lineData[29] = 0;
  _$jscoverage['/dialog.js'].lineData[35] = 0;
  _$jscoverage['/dialog.js'].lineData[37] = 0;
  _$jscoverage['/dialog.js'].lineData[38] = 0;
  _$jscoverage['/dialog.js'].lineData[39] = 0;
  _$jscoverage['/dialog.js'].lineData[40] = 0;
  _$jscoverage['/dialog.js'].lineData[41] = 0;
  _$jscoverage['/dialog.js'].lineData[45] = 0;
  _$jscoverage['/dialog.js'].lineData[46] = 0;
  _$jscoverage['/dialog.js'].lineData[47] = 0;
  _$jscoverage['/dialog.js'].lineData[48] = 0;
  _$jscoverage['/dialog.js'].lineData[49] = 0;
  _$jscoverage['/dialog.js'].lineData[51] = 0;
  _$jscoverage['/dialog.js'].lineData[53] = 0;
  _$jscoverage['/dialog.js'].lineData[54] = 0;
  _$jscoverage['/dialog.js'].lineData[55] = 0;
  _$jscoverage['/dialog.js'].lineData[61] = 0;
  _$jscoverage['/dialog.js'].lineData[63] = 0;
  _$jscoverage['/dialog.js'].lineData[64] = 0;
  _$jscoverage['/dialog.js'].lineData[65] = 0;
  _$jscoverage['/dialog.js'].lineData[66] = 0;
  _$jscoverage['/dialog.js'].lineData[67] = 0;
  _$jscoverage['/dialog.js'].lineData[68] = 0;
  _$jscoverage['/dialog.js'].lineData[69] = 0;
  _$jscoverage['/dialog.js'].lineData[71] = 0;
  _$jscoverage['/dialog.js'].lineData[72] = 0;
  _$jscoverage['/dialog.js'].lineData[74] = 0;
  _$jscoverage['/dialog.js'].lineData[77] = 0;
  _$jscoverage['/dialog.js'].lineData[78] = 0;
  _$jscoverage['/dialog.js'].lineData[80] = 0;
  _$jscoverage['/dialog.js'].lineData[81] = 0;
  _$jscoverage['/dialog.js'].lineData[84] = 0;
  _$jscoverage['/dialog.js'].lineData[88] = 0;
  _$jscoverage['/dialog.js'].lineData[89] = 0;
  _$jscoverage['/dialog.js'].lineData[90] = 0;
  _$jscoverage['/dialog.js'].lineData[91] = 0;
  _$jscoverage['/dialog.js'].lineData[93] = 0;
  _$jscoverage['/dialog.js'].lineData[94] = 0;
  _$jscoverage['/dialog.js'].lineData[95] = 0;
  _$jscoverage['/dialog.js'].lineData[96] = 0;
  _$jscoverage['/dialog.js'].lineData[97] = 0;
  _$jscoverage['/dialog.js'].lineData[98] = 0;
  _$jscoverage['/dialog.js'].lineData[99] = 0;
  _$jscoverage['/dialog.js'].lineData[100] = 0;
  _$jscoverage['/dialog.js'].lineData[103] = 0;
  _$jscoverage['/dialog.js'].lineData[107] = 0;
  _$jscoverage['/dialog.js'].lineData[108] = 0;
  _$jscoverage['/dialog.js'].lineData[109] = 0;
  _$jscoverage['/dialog.js'].lineData[110] = 0;
  _$jscoverage['/dialog.js'].lineData[113] = 0;
  _$jscoverage['/dialog.js'].lineData[114] = 0;
  _$jscoverage['/dialog.js'].lineData[115] = 0;
  _$jscoverage['/dialog.js'].lineData[120] = 0;
  _$jscoverage['/dialog.js'].lineData[123] = 0;
  _$jscoverage['/dialog.js'].lineData[125] = 0;
  _$jscoverage['/dialog.js'].lineData[150] = 0;
  _$jscoverage['/dialog.js'].lineData[151] = 0;
  _$jscoverage['/dialog.js'].lineData[152] = 0;
  _$jscoverage['/dialog.js'].lineData[155] = 0;
  _$jscoverage['/dialog.js'].lineData[157] = 0;
  _$jscoverage['/dialog.js'].lineData[159] = 0;
  _$jscoverage['/dialog.js'].lineData[163] = 0;
  _$jscoverage['/dialog.js'].lineData[174] = 0;
  _$jscoverage['/dialog.js'].lineData[184] = 0;
  _$jscoverage['/dialog.js'].lineData[185] = 0;
  _$jscoverage['/dialog.js'].lineData[187] = 0;
  _$jscoverage['/dialog.js'].lineData[188] = 0;
  _$jscoverage['/dialog.js'].lineData[189] = 0;
  _$jscoverage['/dialog.js'].lineData[192] = 0;
  _$jscoverage['/dialog.js'].lineData[193] = 0;
  _$jscoverage['/dialog.js'].lineData[196] = 0;
  _$jscoverage['/dialog.js'].lineData[200] = 0;
  _$jscoverage['/dialog.js'].lineData[201] = 0;
  _$jscoverage['/dialog.js'].lineData[202] = 0;
  _$jscoverage['/dialog.js'].lineData[203] = 0;
  _$jscoverage['/dialog.js'].lineData[204] = 0;
  _$jscoverage['/dialog.js'].lineData[206] = 0;
  _$jscoverage['/dialog.js'].lineData[210] = 0;
  _$jscoverage['/dialog.js'].lineData[211] = 0;
  _$jscoverage['/dialog.js'].lineData[212] = 0;
  _$jscoverage['/dialog.js'].lineData[214] = 0;
  _$jscoverage['/dialog.js'].lineData[215] = 0;
  _$jscoverage['/dialog.js'].lineData[216] = 0;
  _$jscoverage['/dialog.js'].lineData[217] = 0;
  _$jscoverage['/dialog.js'].lineData[218] = 0;
  _$jscoverage['/dialog.js'].lineData[219] = 0;
  _$jscoverage['/dialog.js'].lineData[220] = 0;
  _$jscoverage['/dialog.js'].lineData[221] = 0;
  _$jscoverage['/dialog.js'].lineData[224] = 0;
  _$jscoverage['/dialog.js'].lineData[226] = 0;
  _$jscoverage['/dialog.js'].lineData[227] = 0;
  _$jscoverage['/dialog.js'].lineData[228] = 0;
  _$jscoverage['/dialog.js'].lineData[229] = 0;
  _$jscoverage['/dialog.js'].lineData[233] = 0;
  _$jscoverage['/dialog.js'].lineData[240] = 0;
  _$jscoverage['/dialog.js'].lineData[242] = 0;
  _$jscoverage['/dialog.js'].lineData[246] = 0;
  _$jscoverage['/dialog.js'].lineData[247] = 0;
  _$jscoverage['/dialog.js'].lineData[250] = 0;
  _$jscoverage['/dialog.js'].lineData[253] = 0;
  _$jscoverage['/dialog.js'].lineData[257] = 0;
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
  _$jscoverage['/dialog.js'].branchData['11'] = [];
  _$jscoverage['/dialog.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['13'] = [];
  _$jscoverage['/dialog.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['18'] = [];
  _$jscoverage['/dialog.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['23'] = [];
  _$jscoverage['/dialog.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['26'] = [];
  _$jscoverage['/dialog.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['45'] = [];
  _$jscoverage['/dialog.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['65'] = [];
  _$jscoverage['/dialog.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['66'] = [];
  _$jscoverage['/dialog.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['77'] = [];
  _$jscoverage['/dialog.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['90'] = [];
  _$jscoverage['/dialog.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['93'] = [];
  _$jscoverage['/dialog.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['95'] = [];
  _$jscoverage['/dialog.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['96'] = [];
  _$jscoverage['/dialog.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['97'] = [];
  _$jscoverage['/dialog.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['99'] = [];
  _$jscoverage['/dialog.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['99'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['187'] = [];
  _$jscoverage['/dialog.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['202'] = [];
  _$jscoverage['/dialog.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['212'] = [];
  _$jscoverage['/dialog.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['217'] = [];
  _$jscoverage['/dialog.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['219'] = [];
  _$jscoverage['/dialog.js'].branchData['219'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['219'][1].init(87, 16, 'left.contains(t)');
function visit21_219_1(result) {
  _$jscoverage['/dialog.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['217'][1].init(98, 19, 't.nodeName() == "a"');
function visit20_217_1(result) {
  _$jscoverage['/dialog.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['212'][1].init(48, 15, 'ev && ev.halt()');
function visit19_212_1(result) {
  _$jscoverage['/dialog.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['202'][1].init(77, 35, '!/^#([a-f0-9]{1,2}){3,3}$/i.test(v)');
function visit18_202_1(result) {
  _$jscoverage['/dialog.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['187'][1].init(140, 35, '!/^#([a-f0-9]{1,2}){3,3}$/i.test(v)');
function visit17_187_1(result) {
  _$jscoverage['/dialog.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['99'][2].init(139, 9, 'i < n - 1');
function visit16_99_2(result) {
  _$jscoverage['/dialog.js'].branchData['99'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['99'][1].init(139, 24, 'i < n - 1 && steps.pop()');
function visit15_99_1(result) {
  _$jscoverage['/dialog.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['97'][1].init(30, 15, 'step[i] || step');
function visit14_97_1(result) {
  _$jscoverage['/dialog.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['96'][1].init(47, 5, 'i < n');
function visit13_96_1(result) {
  _$jscoverage['/dialog.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['95'][1].init(245, 7, 'len > 1');
function visit12_95_1(result) {
  _$jscoverage['/dialog.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['93'][1].init(148, 8, 'len == 1');
function visit11_93_1(result) {
  _$jscoverage['/dialog.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['90'][1].init(66, 18, 'step === undefined');
function visit10_90_1(result) {
  _$jscoverage['/dialog.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['77'][1].init(401, 20, 'document.defaultView');
function visit9_77_1(result) {
  _$jscoverage['/dialog.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['66'][1].init(22, 5, '!frag');
function visit8_66_1(result) {
  _$jscoverage['/dialog.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['65'][1].init(57, 17, 'ret === undefined');
function visit7_65_1(result) {
  _$jscoverage['/dialog.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['45'][1].init(355, 8, 'i < step');
function visit6_45_1(result) {
  _$jscoverage['/dialog.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['26'][1].init(25, 18, 'x.indexOf("%") > 0');
function visit5_26_1(result) {
  _$jscoverage['/dialog.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['23'][1].init(549, 38, '/^rgb\\((.*),(.*),(.*)\\)$/i.test(color)');
function visit4_23_1(result) {
  _$jscoverage['/dialog.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['18'][1].init(321, 48, '/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.test(color)');
function visit3_18_1(result) {
  _$jscoverage['/dialog.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['13'][1].init(85, 57, '/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.test(color)');
function visit2_13_1(result) {
  _$jscoverage['/dialog.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['11'][1].init(14, 16, 'S.isArray(color)');
function visit1_11_1(result) {
  _$jscoverage['/dialog.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[6]++;
KISSY.add("editor/plugin/color/dialog", function(S, Editor, Dialog4E) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[7]++;
  var map = S.map, Dom = S.DOM;
  _$jscoverage['/dialog.js'].lineData[10]++;
  function getData(color) {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[11]++;
    if (visit1_11_1(S.isArray(color))) 
      return color;
    _$jscoverage['/dialog.js'].lineData[12]++;
    var re = RegExp;
    _$jscoverage['/dialog.js'].lineData[13]++;
    if (visit2_13_1(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.test(color))) {
      _$jscoverage['/dialog.js'].lineData[15]++;
      return map([re['$1'], re['$2'], re['$3']], function(x) {
  _$jscoverage['/dialog.js'].functionData[2]++;
  _$jscoverage['/dialog.js'].lineData[16]++;
  return parseInt(x, 16);
});
    } else {
      _$jscoverage['/dialog.js'].lineData[18]++;
      if (visit3_18_1(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.test(color))) {
        _$jscoverage['/dialog.js'].lineData[20]++;
        return map([re['$1'], re['$2'], re['$3']], function(x) {
  _$jscoverage['/dialog.js'].functionData[3]++;
  _$jscoverage['/dialog.js'].lineData[21]++;
  return parseInt(x + x, 16);
});
      } else {
        _$jscoverage['/dialog.js'].lineData[23]++;
        if (visit4_23_1(/^rgb\((.*),(.*),(.*)\)$/i.test(color))) {
          _$jscoverage['/dialog.js'].lineData[25]++;
          return map([re['$1'], re['$2'], re['$3']], function(x) {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[26]++;
  return visit5_26_1(x.indexOf("%") > 0) ? parseFloat(x, 10) * 2.55 : x | 0;
});
        }
      }
    }
    _$jscoverage['/dialog.js'].lineData[29]++;
    return undefined;
  }
  _$jscoverage['/dialog.js'].lineData[35]++;
  var ColorGrads = (function() {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[37]++;
  function getStep(start, end, step) {
    _$jscoverage['/dialog.js'].functionData[6]++;
    _$jscoverage['/dialog.js'].lineData[38]++;
    var colors = [];
    _$jscoverage['/dialog.js'].lineData[39]++;
    start = getColor(start);
    _$jscoverage['/dialog.js'].lineData[40]++;
    end = getColor(end);
    _$jscoverage['/dialog.js'].lineData[41]++;
    var stepR = (end[0] - start[0]) / step, stepG = (end[1] - start[1]) / step, stepB = (end[2] - start[2]) / step;
    _$jscoverage['/dialog.js'].lineData[45]++;
    for (var i = 0, r = start[0], g = start[1], b = start[2]; visit6_45_1(i < step); i++) {
      _$jscoverage['/dialog.js'].lineData[46]++;
      colors[i] = [r, g, b];
      _$jscoverage['/dialog.js'].lineData[47]++;
      r += stepR;
      _$jscoverage['/dialog.js'].lineData[48]++;
      g += stepG;
      _$jscoverage['/dialog.js'].lineData[49]++;
      b += stepB;
    }
    _$jscoverage['/dialog.js'].lineData[51]++;
    colors[i] = end;
    _$jscoverage['/dialog.js'].lineData[53]++;
    return map(colors, function(x) {
  _$jscoverage['/dialog.js'].functionData[7]++;
  _$jscoverage['/dialog.js'].lineData[54]++;
  return map(x, function(x) {
  _$jscoverage['/dialog.js'].functionData[8]++;
  _$jscoverage['/dialog.js'].lineData[55]++;
  return Math.min(Math.max(0, Math.floor(x)), 255);
});
});
  }
  _$jscoverage['/dialog.js'].lineData[61]++;
  var frag;
  _$jscoverage['/dialog.js'].lineData[63]++;
  function getColor(color) {
    _$jscoverage['/dialog.js'].functionData[9]++;
    _$jscoverage['/dialog.js'].lineData[64]++;
    var ret = getData(color);
    _$jscoverage['/dialog.js'].lineData[65]++;
    if (visit7_65_1(ret === undefined)) {
      _$jscoverage['/dialog.js'].lineData[66]++;
      if (visit8_66_1(!frag)) {
        _$jscoverage['/dialog.js'].lineData[67]++;
        frag = document.createElement("textarea");
        _$jscoverage['/dialog.js'].lineData[68]++;
        frag.style.display = "none";
        _$jscoverage['/dialog.js'].lineData[69]++;
        Dom.prepend(frag, document.body);
      }
      _$jscoverage['/dialog.js'].lineData[71]++;
      try {
        _$jscoverage['/dialog.js'].lineData[72]++;
        frag.style.color = color;
      }      catch (e) {
  _$jscoverage['/dialog.js'].lineData[74]++;
  return [0, 0, 0];
}
      _$jscoverage['/dialog.js'].lineData[77]++;
      if (visit9_77_1(document.defaultView)) {
        _$jscoverage['/dialog.js'].lineData[78]++;
        ret = getData(document.defaultView.getComputedStyle(frag, null).color);
      } else {
        _$jscoverage['/dialog.js'].lineData[80]++;
        color = frag.createTextRange()['queryCommandValue']("ForeColor");
        _$jscoverage['/dialog.js'].lineData[81]++;
        ret = [color & 0x0000ff, (color & 0x00ff00) >>> 8, (color & 0xff0000) >>> 16];
      }
    }
    _$jscoverage['/dialog.js'].lineData[84]++;
    return ret;
  }
  _$jscoverage['/dialog.js'].lineData[88]++;
  return function(colors, step) {
  _$jscoverage['/dialog.js'].functionData[10]++;
  _$jscoverage['/dialog.js'].lineData[89]++;
  var ret = [], len = colors.length;
  _$jscoverage['/dialog.js'].lineData[90]++;
  if (visit10_90_1(step === undefined)) {
    _$jscoverage['/dialog.js'].lineData[91]++;
    step = 20;
  }
  _$jscoverage['/dialog.js'].lineData[93]++;
  if (visit11_93_1(len == 1)) {
    _$jscoverage['/dialog.js'].lineData[94]++;
    ret = getStep(colors[0], colors[0], step);
  } else {
    _$jscoverage['/dialog.js'].lineData[95]++;
    if (visit12_95_1(len > 1)) {
      _$jscoverage['/dialog.js'].lineData[96]++;
      for (var i = 0, n = len - 1; visit13_96_1(i < n); i++) {
        _$jscoverage['/dialog.js'].lineData[97]++;
        var t = visit14_97_1(step[i] || step);
        _$jscoverage['/dialog.js'].lineData[98]++;
        var steps = getStep(colors[i], colors[i + 1], t);
        _$jscoverage['/dialog.js'].lineData[99]++;
        visit15_99_1(visit16_99_2(i < n - 1) && steps.pop());
        _$jscoverage['/dialog.js'].lineData[100]++;
        ret = ret.concat(steps);
      }
    }
  }
  _$jscoverage['/dialog.js'].lineData[103]++;
  return ret;
};
})();
  _$jscoverage['/dialog.js'].lineData[107]++;
  function padding2(x) {
    _$jscoverage['/dialog.js'].functionData[11]++;
    _$jscoverage['/dialog.js'].lineData[108]++;
    x = "0" + x;
    _$jscoverage['/dialog.js'].lineData[109]++;
    var l = x.length;
    _$jscoverage['/dialog.js'].lineData[110]++;
    return x.slice(l - 2, l);
  }
  _$jscoverage['/dialog.js'].lineData[113]++;
  function hex(c) {
    _$jscoverage['/dialog.js'].functionData[12]++;
    _$jscoverage['/dialog.js'].lineData[114]++;
    c = getData(c);
    _$jscoverage['/dialog.js'].lineData[115]++;
    return "#" + padding2(c[0].toString(16)) + padding2(c[1].toString(16)) + padding2(c[2].toString(16));
  }
  _$jscoverage['/dialog.js'].lineData[120]++;
  var pickerHTML = "<ul>" + map(ColorGrads(["red", "orange", "yellow", "green", "cyan", "blue", "purple"], 5), function(x) {
  _$jscoverage['/dialog.js'].functionData[13]++;
  _$jscoverage['/dialog.js'].lineData[123]++;
  return map(ColorGrads(["white", "rgb(" + x.join(",") + ")", "black"], 5), function(x) {
  _$jscoverage['/dialog.js'].functionData[14]++;
  _$jscoverage['/dialog.js'].lineData[125]++;
  return "<li><a style='background-color" + ":" + hex(x) + "' href='#'></a></li>";
}).join("");
}).join("</ul><ul>") + "</ul>", panelHTML = "<div class='{prefixCls}editor-color-advanced-picker'>" + "<div class='ks-clear'>" + "<div class='{prefixCls}editor-color-advanced-picker-left'>" + pickerHTML + "</div>" + "<div class='{prefixCls}editor-color-advanced-picker-right'>" + "</div>" + "</div>" + "<div style='padding:10px;'>" + "<label>" + "\u989c\u8272\u503c\uff1a " + "<input style='width:100px' class='{prefixCls}editor-color-advanced-value'/>" + "</label>" + "<span class='{prefixCls}editor-color-advanced-indicator'></span>" + "</div>" + "</div>", footHTML = "<div style='padding:5px 20px 20px;'>" + "<a class='{prefixCls}editor-button {prefixCls}editor-color-advanced-ok ks-inline-block'>\u786e\u5b9a</a>" + "&nbsp;&nbsp;&nbsp;" + "<a class='{prefixCls}editor-button  {prefixCls}editor-color-advanced-cancel ks-inline-block'>\u53d6\u6d88</a>" + "</div>";
  _$jscoverage['/dialog.js'].lineData[150]++;
  function ColorPicker(editor) {
    _$jscoverage['/dialog.js'].functionData[15]++;
    _$jscoverage['/dialog.js'].lineData[151]++;
    this.editor = editor;
    _$jscoverage['/dialog.js'].lineData[152]++;
    this._init();
  }
  _$jscoverage['/dialog.js'].lineData[155]++;
  var addRes = Editor.Utils.addRes, destroyRes = Editor.Utils.destroyRes;
  _$jscoverage['/dialog.js'].lineData[157]++;
  S.augment(ColorPicker, {
  _init: function() {
  _$jscoverage['/dialog.js'].functionData[16]++;
  _$jscoverage['/dialog.js'].lineData[159]++;
  var self = this, editor = self.editor, prefixCls = editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[163]++;
  self.dialog = new Dialog4E({
  mask: true, 
  headerContent: "\u989c\u8272\u62fe\u53d6\u5668", 
  bodyContent: S.substitute(panelHTML, {
  prefixCls: prefixCls}), 
  footerContent: S.substitute(footHTML, {
  prefixCls: prefixCls}), 
  width: "550px"}).render();
  _$jscoverage['/dialog.js'].lineData[174]++;
  var win = self.dialog, body = win.get("body"), foot = win.get("footer"), indicator = body.one("." + prefixCls + "editor-color-advanced-indicator"), indicatorValue = body.one("." + prefixCls + "editor-color-advanced-value"), left = body.one("." + prefixCls + "editor-color-advanced-picker-left"), right = body.one("." + prefixCls + "editor-color-advanced-picker-right"), ok = foot.one("." + prefixCls + "editor-color-advanced-ok"), cancel = foot.one("." + prefixCls + "editor-color-advanced-cancel");
  _$jscoverage['/dialog.js'].lineData[184]++;
  ok.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[17]++;
  _$jscoverage['/dialog.js'].lineData[185]++;
  var v = S.trim(indicatorValue.val()), colorButtonArrow = self.colorButtonArrow;
  _$jscoverage['/dialog.js'].lineData[187]++;
  if (visit17_187_1(!/^#([a-f0-9]{1,2}){3,3}$/i.test(v))) {
    _$jscoverage['/dialog.js'].lineData[188]++;
    alert("\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u989c\u8272\u4ee3\u7801");
    _$jscoverage['/dialog.js'].lineData[189]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[192]++;
  self.hide();
  _$jscoverage['/dialog.js'].lineData[193]++;
  colorButtonArrow.fire('selectColor', {
  color: indicatorValue.val()});
  _$jscoverage['/dialog.js'].lineData[196]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[200]++;
  indicatorValue.on("change", function() {
  _$jscoverage['/dialog.js'].functionData[18]++;
  _$jscoverage['/dialog.js'].lineData[201]++;
  var v = S.trim(indicatorValue.val());
  _$jscoverage['/dialog.js'].lineData[202]++;
  if (visit18_202_1(!/^#([a-f0-9]{1,2}){3,3}$/i.test(v))) {
    _$jscoverage['/dialog.js'].lineData[203]++;
    alert("\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u989c\u8272\u4ee3\u7801");
    _$jscoverage['/dialog.js'].lineData[204]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[206]++;
  indicator.css("background-color", v);
});
  _$jscoverage['/dialog.js'].lineData[210]++;
  cancel.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[19]++;
  _$jscoverage['/dialog.js'].lineData[211]++;
  self.hide();
  _$jscoverage['/dialog.js'].lineData[212]++;
  visit19_212_1(ev && ev.halt());
});
  _$jscoverage['/dialog.js'].lineData[214]++;
  body.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[20]++;
  _$jscoverage['/dialog.js'].lineData[215]++;
  ev.halt();
  _$jscoverage['/dialog.js'].lineData[216]++;
  var t = new S.Node(ev.target);
  _$jscoverage['/dialog.js'].lineData[217]++;
  if (visit20_217_1(t.nodeName() == "a")) {
    _$jscoverage['/dialog.js'].lineData[218]++;
    var c = hex(t.css("background-color"));
    _$jscoverage['/dialog.js'].lineData[219]++;
    if (visit21_219_1(left.contains(t))) 
      self._detailColor(c);
    _$jscoverage['/dialog.js'].lineData[220]++;
    indicatorValue.val(c);
    _$jscoverage['/dialog.js'].lineData[221]++;
    indicator.css("background-color", c);
  }
});
  _$jscoverage['/dialog.js'].lineData[224]++;
  addRes.call(self, ok, indicatorValue, cancel, body, self.dialog);
  _$jscoverage['/dialog.js'].lineData[226]++;
  var defaultColor = "#FF9900";
  _$jscoverage['/dialog.js'].lineData[227]++;
  self._detailColor(defaultColor);
  _$jscoverage['/dialog.js'].lineData[228]++;
  indicatorValue.val(defaultColor);
  _$jscoverage['/dialog.js'].lineData[229]++;
  indicator.css("background-color", defaultColor);
}, 
  _detailColor: function(color) {
  _$jscoverage['/dialog.js'].functionData[21]++;
  _$jscoverage['/dialog.js'].lineData[233]++;
  var self = this, win = self.dialog, body = win.get("body"), editor = self.editor, prefixCls = editor.get('prefixCls'), detailPanel = body.one("." + prefixCls + "editor-color-advanced-picker-right");
  _$jscoverage['/dialog.js'].lineData[240]++;
  detailPanel.html(map(ColorGrads(["#ffffff", color, "#000000"], 40), function(x) {
  _$jscoverage['/dialog.js'].functionData[22]++;
  _$jscoverage['/dialog.js'].lineData[242]++;
  return "<a style='background-color:" + hex(x) + "'></a>";
}).join(""));
}, 
  show: function(colorButtonArrow) {
  _$jscoverage['/dialog.js'].functionData[23]++;
  _$jscoverage['/dialog.js'].lineData[246]++;
  this.colorButtonArrow = colorButtonArrow;
  _$jscoverage['/dialog.js'].lineData[247]++;
  this.dialog.show();
}, 
  hide: function() {
  _$jscoverage['/dialog.js'].functionData[24]++;
  _$jscoverage['/dialog.js'].lineData[250]++;
  this.dialog.hide();
}, 
  destroy: function() {
  _$jscoverage['/dialog.js'].functionData[25]++;
  _$jscoverage['/dialog.js'].lineData[253]++;
  destroyRes.call(this);
}});
  _$jscoverage['/dialog.js'].lineData[257]++;
  return ColorPicker;
}, {
  requires: ['editor', '../dialog']});
