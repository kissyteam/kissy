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
if (! _$jscoverage['/ie/transform.js']) {
  _$jscoverage['/ie/transform.js'] = {};
  _$jscoverage['/ie/transform.js'].lineData = [];
  _$jscoverage['/ie/transform.js'].lineData[6] = 0;
  _$jscoverage['/ie/transform.js'].lineData[7] = 0;
  _$jscoverage['/ie/transform.js'].lineData[8] = 0;
  _$jscoverage['/ie/transform.js'].lineData[9] = 0;
  _$jscoverage['/ie/transform.js'].lineData[11] = 0;
  _$jscoverage['/ie/transform.js'].lineData[13] = 0;
  _$jscoverage['/ie/transform.js'].lineData[15] = 0;
  _$jscoverage['/ie/transform.js'].lineData[16] = 0;
  _$jscoverage['/ie/transform.js'].lineData[17] = 0;
  _$jscoverage['/ie/transform.js'].lineData[19] = 0;
  _$jscoverage['/ie/transform.js'].lineData[20] = 0;
  _$jscoverage['/ie/transform.js'].lineData[21] = 0;
  _$jscoverage['/ie/transform.js'].lineData[22] = 0;
  _$jscoverage['/ie/transform.js'].lineData[24] = 0;
  _$jscoverage['/ie/transform.js'].lineData[25] = 0;
  _$jscoverage['/ie/transform.js'].lineData[27] = 0;
  _$jscoverage['/ie/transform.js'].lineData[36] = 0;
  _$jscoverage['/ie/transform.js'].lineData[38] = 0;
  _$jscoverage['/ie/transform.js'].lineData[42] = 0;
  _$jscoverage['/ie/transform.js'].lineData[57] = 0;
  _$jscoverage['/ie/transform.js'].lineData[58] = 0;
  _$jscoverage['/ie/transform.js'].lineData[59] = 0;
  _$jscoverage['/ie/transform.js'].lineData[60] = 0;
  _$jscoverage['/ie/transform.js'].lineData[61] = 0;
  _$jscoverage['/ie/transform.js'].lineData[62] = 0;
  _$jscoverage['/ie/transform.js'].lineData[63] = 0;
  _$jscoverage['/ie/transform.js'].lineData[77] = 0;
  _$jscoverage['/ie/transform.js'].lineData[79] = 0;
  _$jscoverage['/ie/transform.js'].lineData[81] = 0;
  _$jscoverage['/ie/transform.js'].lineData[85] = 0;
  _$jscoverage['/ie/transform.js'].lineData[86] = 0;
  _$jscoverage['/ie/transform.js'].lineData[90] = 0;
  _$jscoverage['/ie/transform.js'].lineData[96] = 0;
  _$jscoverage['/ie/transform.js'].lineData[100] = 0;
  _$jscoverage['/ie/transform.js'].lineData[101] = 0;
  _$jscoverage['/ie/transform.js'].lineData[105] = 0;
  _$jscoverage['/ie/transform.js'].lineData[106] = 0;
  _$jscoverage['/ie/transform.js'].lineData[108] = 0;
  _$jscoverage['/ie/transform.js'].lineData[114] = 0;
  _$jscoverage['/ie/transform.js'].lineData[115] = 0;
  _$jscoverage['/ie/transform.js'].lineData[117] = 0;
  _$jscoverage['/ie/transform.js'].lineData[132] = 0;
  _$jscoverage['/ie/transform.js'].lineData[133] = 0;
  _$jscoverage['/ie/transform.js'].lineData[134] = 0;
  _$jscoverage['/ie/transform.js'].lineData[135] = 0;
  _$jscoverage['/ie/transform.js'].lineData[136] = 0;
  _$jscoverage['/ie/transform.js'].lineData[138] = 0;
  _$jscoverage['/ie/transform.js'].lineData[139] = 0;
  _$jscoverage['/ie/transform.js'].lineData[140] = 0;
  _$jscoverage['/ie/transform.js'].lineData[141] = 0;
  _$jscoverage['/ie/transform.js'].lineData[143] = 0;
  _$jscoverage['/ie/transform.js'].lineData[146] = 0;
  _$jscoverage['/ie/transform.js'].lineData[150] = 0;
  _$jscoverage['/ie/transform.js'].lineData[151] = 0;
  _$jscoverage['/ie/transform.js'].lineData[152] = 0;
  _$jscoverage['/ie/transform.js'].lineData[160] = 0;
  _$jscoverage['/ie/transform.js'].lineData[161] = 0;
  _$jscoverage['/ie/transform.js'].lineData[162] = 0;
  _$jscoverage['/ie/transform.js'].lineData[163] = 0;
  _$jscoverage['/ie/transform.js'].lineData[164] = 0;
  _$jscoverage['/ie/transform.js'].lineData[165] = 0;
  _$jscoverage['/ie/transform.js'].lineData[167] = 0;
  _$jscoverage['/ie/transform.js'].lineData[168] = 0;
  _$jscoverage['/ie/transform.js'].lineData[171] = 0;
  _$jscoverage['/ie/transform.js'].lineData[172] = 0;
  _$jscoverage['/ie/transform.js'].lineData[175] = 0;
  _$jscoverage['/ie/transform.js'].lineData[176] = 0;
  _$jscoverage['/ie/transform.js'].lineData[177] = 0;
  _$jscoverage['/ie/transform.js'].lineData[178] = 0;
  _$jscoverage['/ie/transform.js'].lineData[181] = 0;
  _$jscoverage['/ie/transform.js'].lineData[182] = 0;
  _$jscoverage['/ie/transform.js'].lineData[183] = 0;
  _$jscoverage['/ie/transform.js'].lineData[184] = 0;
  _$jscoverage['/ie/transform.js'].lineData[185] = 0;
  _$jscoverage['/ie/transform.js'].lineData[186] = 0;
  _$jscoverage['/ie/transform.js'].lineData[189] = 0;
  _$jscoverage['/ie/transform.js'].lineData[190] = 0;
  _$jscoverage['/ie/transform.js'].lineData[193] = 0;
  _$jscoverage['/ie/transform.js'].lineData[194] = 0;
  _$jscoverage['/ie/transform.js'].lineData[197] = 0;
  _$jscoverage['/ie/transform.js'].lineData[198] = 0;
  _$jscoverage['/ie/transform.js'].lineData[199] = 0;
  _$jscoverage['/ie/transform.js'].lineData[200] = 0;
  _$jscoverage['/ie/transform.js'].lineData[203] = 0;
  _$jscoverage['/ie/transform.js'].lineData[204] = 0;
  _$jscoverage['/ie/transform.js'].lineData[207] = 0;
  _$jscoverage['/ie/transform.js'].lineData[208] = 0;
  _$jscoverage['/ie/transform.js'].lineData[211] = 0;
  _$jscoverage['/ie/transform.js'].lineData[212] = 0;
  _$jscoverage['/ie/transform.js'].lineData[213] = 0;
  _$jscoverage['/ie/transform.js'].lineData[214] = 0;
  _$jscoverage['/ie/transform.js'].lineData[216] = 0;
  _$jscoverage['/ie/transform.js'].lineData[219] = 0;
  _$jscoverage['/ie/transform.js'].lineData[220] = 0;
  _$jscoverage['/ie/transform.js'].lineData[221] = 0;
  _$jscoverage['/ie/transform.js'].lineData[222] = 0;
  _$jscoverage['/ie/transform.js'].lineData[223] = 0;
  _$jscoverage['/ie/transform.js'].lineData[224] = 0;
  _$jscoverage['/ie/transform.js'].lineData[225] = 0;
  _$jscoverage['/ie/transform.js'].lineData[226] = 0;
  _$jscoverage['/ie/transform.js'].lineData[228] = 0;
  _$jscoverage['/ie/transform.js'].lineData[231] = 0;
  _$jscoverage['/ie/transform.js'].lineData[234] = 0;
  _$jscoverage['/ie/transform.js'].lineData[235] = 0;
  _$jscoverage['/ie/transform.js'].lineData[242] = 0;
  _$jscoverage['/ie/transform.js'].lineData[243] = 0;
  _$jscoverage['/ie/transform.js'].lineData[244] = 0;
  _$jscoverage['/ie/transform.js'].lineData[246] = 0;
  _$jscoverage['/ie/transform.js'].lineData[249] = 0;
  _$jscoverage['/ie/transform.js'].lineData[250] = 0;
  _$jscoverage['/ie/transform.js'].lineData[251] = 0;
  _$jscoverage['/ie/transform.js'].lineData[252] = 0;
  _$jscoverage['/ie/transform.js'].lineData[253] = 0;
  _$jscoverage['/ie/transform.js'].lineData[254] = 0;
  _$jscoverage['/ie/transform.js'].lineData[256] = 0;
  _$jscoverage['/ie/transform.js'].lineData[259] = 0;
  _$jscoverage['/ie/transform.js'].lineData[264] = 0;
  _$jscoverage['/ie/transform.js'].lineData[265] = 0;
  _$jscoverage['/ie/transform.js'].lineData[266] = 0;
  _$jscoverage['/ie/transform.js'].lineData[267] = 0;
  _$jscoverage['/ie/transform.js'].lineData[268] = 0;
  _$jscoverage['/ie/transform.js'].lineData[270] = 0;
  _$jscoverage['/ie/transform.js'].lineData[274] = 0;
  _$jscoverage['/ie/transform.js'].lineData[278] = 0;
  _$jscoverage['/ie/transform.js'].lineData[279] = 0;
}
if (! _$jscoverage['/ie/transform.js'].functionData) {
  _$jscoverage['/ie/transform.js'].functionData = [];
  _$jscoverage['/ie/transform.js'].functionData[0] = 0;
  _$jscoverage['/ie/transform.js'].functionData[1] = 0;
  _$jscoverage['/ie/transform.js'].functionData[2] = 0;
  _$jscoverage['/ie/transform.js'].functionData[3] = 0;
  _$jscoverage['/ie/transform.js'].functionData[4] = 0;
  _$jscoverage['/ie/transform.js'].functionData[5] = 0;
  _$jscoverage['/ie/transform.js'].functionData[6] = 0;
  _$jscoverage['/ie/transform.js'].functionData[7] = 0;
  _$jscoverage['/ie/transform.js'].functionData[8] = 0;
  _$jscoverage['/ie/transform.js'].functionData[9] = 0;
}
if (! _$jscoverage['/ie/transform.js'].branchData) {
  _$jscoverage['/ie/transform.js'].branchData = {};
  _$jscoverage['/ie/transform.js'].branchData['15'] = [];
  _$jscoverage['/ie/transform.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['19'] = [];
  _$jscoverage['/ie/transform.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['20'] = [];
  _$jscoverage['/ie/transform.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['21'] = [];
  _$jscoverage['/ie/transform.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['21'][2] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['24'] = [];
  _$jscoverage['/ie/transform.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['24'][2] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['58'] = [];
  _$jscoverage['/ie/transform.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['79'] = [];
  _$jscoverage['/ie/transform.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['79'][2] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['79'][3] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['81'] = [];
  _$jscoverage['/ie/transform.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['87'] = [];
  _$jscoverage['/ie/transform.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['89'] = [];
  _$jscoverage['/ie/transform.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['100'] = [];
  _$jscoverage['/ie/transform.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['133'] = [];
  _$jscoverage['/ie/transform.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['135'] = [];
  _$jscoverage['/ie/transform.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['138'] = [];
  _$jscoverage['/ie/transform.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['140'] = [];
  _$jscoverage['/ie/transform.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['160'] = [];
  _$jscoverage['/ie/transform.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['177'] = [];
  _$jscoverage['/ie/transform.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['199'] = [];
  _$jscoverage['/ie/transform.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['213'] = [];
  _$jscoverage['/ie/transform.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['243'] = [];
  _$jscoverage['/ie/transform.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['251'] = [];
  _$jscoverage['/ie/transform.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['253'] = [];
  _$jscoverage['/ie/transform.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['264'] = [];
  _$jscoverage['/ie/transform.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['265'] = [];
  _$jscoverage['/ie/transform.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['267'] = [];
  _$jscoverage['/ie/transform.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['279'] = [];
  _$jscoverage['/ie/transform.js'].branchData['279'][1] = new BranchData();
}
_$jscoverage['/ie/transform.js'].branchData['279'][1].init(17, 25, 'value.indexOf(\'deg\') > -1');
function visit115_279_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['267'][1].init(64, 6, 'j < r2');
function visit114_267_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['265'][1].init(30, 6, 'k < c2');
function visit113_265_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['264'][1].init(380, 6, 'i < r1');
function visit112_264_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['253'][1].init(53, 20, 'i < arguments.length');
function visit111_253_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['251'][1].init(30, 20, 'arguments.length > 2');
function visit110_251_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['243'][1].init(14, 5, '!m[x]');
function visit109_243_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['213'][1].init(139, 14, 'val.length > 1');
function visit108_213_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['199'][1].init(127, 14, 'val.length > 1');
function visit107_199_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['177'][1].init(153, 11, 'val[1] || 0');
function visit106_177_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['160'][1].init(343, 7, '++i < l');
function visit105_160_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['140'][1].init(64, 26, 'S.endsWith(origin[i], \'%\')');
function visit104_140_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['138'][1].init(187, 17, 'i < origin.length');
function visit103_138_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['135'][1].init(92, 19, 'origin.length === 1');
function visit102_135_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['133'][1].init(19, 19, 'origin || \'50% 50%\'');
function visit101_133_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['100'][1].init(2609, 9, 'matrixVal');
function visit100_100_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['89'][1].init(129, 36, 'currentStyle && !currentStyle.filter');
function visit99_89_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['87'][1].init(48, 166, '!matrixVal || currentStyle && !currentStyle.filter');
function visit98_87_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['81'][1].init(1635, 50, '!matrixVal && !S.trim(filter.replace(rMatrix, \'\'))');
function visit97_81_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['79'][3].init(1592, 22, 'elemStyle.filter || \'\'');
function visit96_79_3(result) {
  _$jscoverage['/ie/transform.js'].branchData['79'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['79'][2].init(1553, 35, 'currentStyle && currentStyle.filter');
function visit95_79_2(result) {
  _$jscoverage['/ie/transform.js'].branchData['79'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['79'][1].init(1553, 61, 'currentStyle && currentStyle.filter || elemStyle.filter || \'\'');
function visit94_79_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['58'][1].init(612, 5, 'value');
function visit93_58_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['24'][2].init(386, 29, 'dys[0].toLowerCase() === \'dy\'');
function visit92_24_2(result) {
  _$jscoverage['/ie/transform.js'].branchData['24'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['24'][1].init(379, 36, 'dys && dys[0].toLowerCase() === \'dy\'');
function visit91_24_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['21'][2].init(260, 29, 'dxs[0].toLowerCase() === \'dx\'');
function visit90_21_2(result) {
  _$jscoverage['/ie/transform.js'].branchData['21'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['21'][1].init(253, 36, 'dxs && dxs[0].toLowerCase() === \'dx\'');
function visit89_21_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['20'][1].init(197, 33, 'matrix[5] && matrix[5].split(\'=\')');
function visit88_20_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['19'][1].init(135, 33, 'matrix[4] && matrix[4].split(\'=\')');
function visit87_19_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['15'][1].init(115, 43, 'elemStyle && rMatrix.test(elemStyle.filter)');
function visit86_15_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/ie/transform.js'].functionData[0]++;
  _$jscoverage['/ie/transform.js'].lineData[7]++;
  var Dom = require('dom/base');
  _$jscoverage['/ie/transform.js'].lineData[8]++;
  var cssHooks = Dom._cssHooks;
  _$jscoverage['/ie/transform.js'].lineData[9]++;
  var rMatrix = /progid:DXImageTransform.Microsoft.Matrix\(([^)]*)\)/;
  _$jscoverage['/ie/transform.js'].lineData[11]++;
  cssHooks.transform = {
  get: function(elem, computed) {
  _$jscoverage['/ie/transform.js'].functionData[1]++;
  _$jscoverage['/ie/transform.js'].lineData[13]++;
  var elemStyle = elem[computed ? 'currentStyle' : 'style'], matrix;
  _$jscoverage['/ie/transform.js'].lineData[15]++;
  if (visit86_15_1(elemStyle && rMatrix.test(elemStyle.filter))) {
    _$jscoverage['/ie/transform.js'].lineData[16]++;
    matrix = RegExp.$1.split(',');
    _$jscoverage['/ie/transform.js'].lineData[17]++;
    var dx = 0, dy = 0;
    _$jscoverage['/ie/transform.js'].lineData[19]++;
    var dxs = visit87_19_1(matrix[4] && matrix[4].split('='));
    _$jscoverage['/ie/transform.js'].lineData[20]++;
    var dys = visit88_20_1(matrix[5] && matrix[5].split('='));
    _$jscoverage['/ie/transform.js'].lineData[21]++;
    if (visit89_21_1(dxs && visit90_21_2(dxs[0].toLowerCase() === 'dx'))) {
      _$jscoverage['/ie/transform.js'].lineData[22]++;
      dx = parseFloat(dxs[1]);
    }
    _$jscoverage['/ie/transform.js'].lineData[24]++;
    if (visit91_24_1(dys && visit92_24_2(dys[0].toLowerCase() === 'dy'))) {
      _$jscoverage['/ie/transform.js'].lineData[25]++;
      dy = parseFloat(dys[1]);
    }
    _$jscoverage['/ie/transform.js'].lineData[27]++;
    matrix = [matrix[0].split('=')[1], matrix[2].split('=')[1], matrix[1].split('=')[1], matrix[3].split('=')[1], dx, dy];
  } else {
    _$jscoverage['/ie/transform.js'].lineData[36]++;
    return computed ? 'none' : '';
  }
  _$jscoverage['/ie/transform.js'].lineData[38]++;
  return 'matrix(' + matrix.join(',') + ')';
}, 
  set: function(elem, value) {
  _$jscoverage['/ie/transform.js'].functionData[2]++;
  _$jscoverage['/ie/transform.js'].lineData[42]++;
  var elemStyle = elem.style, afterCenter, currentStyle = elem.currentStyle, matrixVal, region = {
  width: elem.clientWidth, 
  height: elem.clientHeight}, center = {
  x: region.width / 2, 
  y: region.height / 2}, origin = parseOrigin(elem.style.transformOrigin, region), filter;
  _$jscoverage['/ie/transform.js'].lineData[57]++;
  elemStyle.zoom = 1;
  _$jscoverage['/ie/transform.js'].lineData[58]++;
  if (visit93_58_1(value)) {
    _$jscoverage['/ie/transform.js'].lineData[59]++;
    value = matrix(value);
    _$jscoverage['/ie/transform.js'].lineData[60]++;
    afterCenter = getCenterByOrigin(value, origin, center);
    _$jscoverage['/ie/transform.js'].lineData[61]++;
    afterCenter.x = afterCenter[0][0];
    _$jscoverage['/ie/transform.js'].lineData[62]++;
    afterCenter.y = afterCenter[1][0];
    _$jscoverage['/ie/transform.js'].lineData[63]++;
    matrixVal = ['progid:DXImageTransform.Microsoft.Matrix(' + 'M11=' + value[0][0], 'M12=' + value[0][1], 'M21=' + value[1][0], 'M22=' + value[1][1], 'Dx=' + value[0][2], 'Dy=' + value[1][2], 'SizingMethod="auto expand"'].join(',') + ')';
  } else {
    _$jscoverage['/ie/transform.js'].lineData[77]++;
    matrixVal = '';
  }
  _$jscoverage['/ie/transform.js'].lineData[79]++;
  filter = visit94_79_1(visit95_79_2(currentStyle && currentStyle.filter) || visit96_79_3(elemStyle.filter || ''));
  _$jscoverage['/ie/transform.js'].lineData[81]++;
  if (visit97_81_1(!matrixVal && !S.trim(filter.replace(rMatrix, '')))) {
    _$jscoverage['/ie/transform.js'].lineData[85]++;
    elemStyle.removeAttribute('filter');
    _$jscoverage['/ie/transform.js'].lineData[86]++;
    if (visit98_87_1(!matrixVal || visit99_89_1(currentStyle && !currentStyle.filter))) {
      _$jscoverage['/ie/transform.js'].lineData[90]++;
      return;
    }
  }
  _$jscoverage['/ie/transform.js'].lineData[96]++;
  elemStyle.filter = rMatrix.test(filter) ? filter.replace(rMatrix, matrixVal) : filter + (filter ? ', ' : '') + matrixVal;
  _$jscoverage['/ie/transform.js'].lineData[100]++;
  if (visit100_100_1(matrixVal)) {
    _$jscoverage['/ie/transform.js'].lineData[101]++;
    var realCenter = {
  x: elem.offsetWidth / 2, 
  y: elem.offsetHeight / 2};
    _$jscoverage['/ie/transform.js'].lineData[105]++;
    elemStyle.marginLeft = afterCenter.x - realCenter.x + 'px';
    _$jscoverage['/ie/transform.js'].lineData[106]++;
    elemStyle.marginTop = afterCenter.y - realCenter.y + 'px';
  } else {
    _$jscoverage['/ie/transform.js'].lineData[108]++;
    elemStyle.marginLeft = elemStyle.marginTop = 0;
  }
}};
  _$jscoverage['/ie/transform.js'].lineData[114]++;
  function getCenterByOrigin(m, origin, center) {
    _$jscoverage['/ie/transform.js'].functionData[3]++;
    _$jscoverage['/ie/transform.js'].lineData[115]++;
    var w = origin[0], h = origin[1];
    _$jscoverage['/ie/transform.js'].lineData[117]++;
    return multipleMatrix([[1, 0, w], [0, 1, h], [0, 0, 1]], m, [[1, 0, -w], [0, 1, -h], [0, 0, 1]], [[center.x], [center.y], [1]]);
  }
  _$jscoverage['/ie/transform.js'].lineData[132]++;
  function parseOrigin(origin, region) {
    _$jscoverage['/ie/transform.js'].functionData[4]++;
    _$jscoverage['/ie/transform.js'].lineData[133]++;
    origin = visit101_133_1(origin || '50% 50%');
    _$jscoverage['/ie/transform.js'].lineData[134]++;
    origin = origin.split(/\s+/);
    _$jscoverage['/ie/transform.js'].lineData[135]++;
    if (visit102_135_1(origin.length === 1)) {
      _$jscoverage['/ie/transform.js'].lineData[136]++;
      origin[1] = origin[0];
    }
    _$jscoverage['/ie/transform.js'].lineData[138]++;
    for (var i = 0; visit103_138_1(i < origin.length); i++) {
      _$jscoverage['/ie/transform.js'].lineData[139]++;
      var val = parseFloat(origin[i]);
      _$jscoverage['/ie/transform.js'].lineData[140]++;
      if (visit104_140_1(S.endsWith(origin[i], '%'))) {
        _$jscoverage['/ie/transform.js'].lineData[141]++;
        origin[i] = val * region[i ? 'height' : 'width'] / 100;
      } else {
        _$jscoverage['/ie/transform.js'].lineData[143]++;
        origin[i] = val;
      }
    }
    _$jscoverage['/ie/transform.js'].lineData[146]++;
    return origin;
  }
  _$jscoverage['/ie/transform.js'].lineData[150]++;
  function matrix(transform) {
    _$jscoverage['/ie/transform.js'].functionData[5]++;
    _$jscoverage['/ie/transform.js'].lineData[151]++;
    transform = transform.split(')');
    _$jscoverage['/ie/transform.js'].lineData[152]++;
    var trim = S.trim, i = -1, l = transform.length - 1, split, prop, val, ret = cssMatrixToComputableMatrix([1, 0, 0, 1, 0, 0]), curr;
    _$jscoverage['/ie/transform.js'].lineData[160]++;
    while (visit105_160_1(++i < l)) {
      _$jscoverage['/ie/transform.js'].lineData[161]++;
      split = transform[i].split('(');
      _$jscoverage['/ie/transform.js'].lineData[162]++;
      prop = trim(split[0]);
      _$jscoverage['/ie/transform.js'].lineData[163]++;
      val = split[1];
      _$jscoverage['/ie/transform.js'].lineData[164]++;
      curr = [1, 0, 0, 1, 0, 0];
      _$jscoverage['/ie/transform.js'].lineData[165]++;
      switch (prop) {
        case 'translateX':
          _$jscoverage['/ie/transform.js'].lineData[167]++;
          curr[4] = parseInt(val, 10);
          _$jscoverage['/ie/transform.js'].lineData[168]++;
          break;
        case 'translateY':
          _$jscoverage['/ie/transform.js'].lineData[171]++;
          curr[5] = parseInt(val, 10);
          _$jscoverage['/ie/transform.js'].lineData[172]++;
          break;
        case 'translate':
          _$jscoverage['/ie/transform.js'].lineData[175]++;
          val = val.split(',');
          _$jscoverage['/ie/transform.js'].lineData[176]++;
          curr[4] = parseInt(val[0], 10);
          _$jscoverage['/ie/transform.js'].lineData[177]++;
          curr[5] = parseInt(visit106_177_1(val[1] || 0), 10);
          _$jscoverage['/ie/transform.js'].lineData[178]++;
          break;
        case 'rotate':
          _$jscoverage['/ie/transform.js'].lineData[181]++;
          val = toRadian(val);
          _$jscoverage['/ie/transform.js'].lineData[182]++;
          curr[0] = Math.cos(val);
          _$jscoverage['/ie/transform.js'].lineData[183]++;
          curr[1] = Math.sin(val);
          _$jscoverage['/ie/transform.js'].lineData[184]++;
          curr[2] = -Math.sin(val);
          _$jscoverage['/ie/transform.js'].lineData[185]++;
          curr[3] = Math.cos(val);
          _$jscoverage['/ie/transform.js'].lineData[186]++;
          break;
        case 'scaleX':
          _$jscoverage['/ie/transform.js'].lineData[189]++;
          curr[0] = +val;
          _$jscoverage['/ie/transform.js'].lineData[190]++;
          break;
        case 'scaleY':
          _$jscoverage['/ie/transform.js'].lineData[193]++;
          curr[3] = +val;
          _$jscoverage['/ie/transform.js'].lineData[194]++;
          break;
        case 'scale':
          _$jscoverage['/ie/transform.js'].lineData[197]++;
          val = val.split(',');
          _$jscoverage['/ie/transform.js'].lineData[198]++;
          curr[0] = +val[0];
          _$jscoverage['/ie/transform.js'].lineData[199]++;
          curr[3] = visit107_199_1(val.length > 1) ? +val[1] : +val[0];
          _$jscoverage['/ie/transform.js'].lineData[200]++;
          break;
        case 'skewX':
          _$jscoverage['/ie/transform.js'].lineData[203]++;
          curr[2] = Math.tan(toRadian(val));
          _$jscoverage['/ie/transform.js'].lineData[204]++;
          break;
        case 'skewY':
          _$jscoverage['/ie/transform.js'].lineData[207]++;
          curr[1] = Math.tan(toRadian(val));
          _$jscoverage['/ie/transform.js'].lineData[208]++;
          break;
        case 'skew':
          _$jscoverage['/ie/transform.js'].lineData[211]++;
          val = val.split(',');
          _$jscoverage['/ie/transform.js'].lineData[212]++;
          curr[2] = Math.tan(toRadian(val[0]));
          _$jscoverage['/ie/transform.js'].lineData[213]++;
          if (visit108_213_1(val.length > 1)) {
            _$jscoverage['/ie/transform.js'].lineData[214]++;
            curr[1] = Math.tan(toRadian(val[1]));
          }
          _$jscoverage['/ie/transform.js'].lineData[216]++;
          break;
        case 'matrix':
          _$jscoverage['/ie/transform.js'].lineData[219]++;
          val = val.split(',');
          _$jscoverage['/ie/transform.js'].lineData[220]++;
          curr[0] = +val[0];
          _$jscoverage['/ie/transform.js'].lineData[221]++;
          curr[1] = +val[1];
          _$jscoverage['/ie/transform.js'].lineData[222]++;
          curr[2] = +val[2];
          _$jscoverage['/ie/transform.js'].lineData[223]++;
          curr[3] = +val[3];
          _$jscoverage['/ie/transform.js'].lineData[224]++;
          curr[4] = parseInt(val[4], 10);
          _$jscoverage['/ie/transform.js'].lineData[225]++;
          curr[5] = parseInt(val[5], 10);
          _$jscoverage['/ie/transform.js'].lineData[226]++;
          break;
      }
      _$jscoverage['/ie/transform.js'].lineData[228]++;
      ret = multipleMatrix(ret, cssMatrixToComputableMatrix(curr));
    }
    _$jscoverage['/ie/transform.js'].lineData[231]++;
    return ret;
  }
  _$jscoverage['/ie/transform.js'].lineData[234]++;
  function cssMatrixToComputableMatrix(matrix) {
    _$jscoverage['/ie/transform.js'].functionData[6]++;
    _$jscoverage['/ie/transform.js'].lineData[235]++;
    return [[matrix[0], matrix[2], matrix[4]], [matrix[1], matrix[3], matrix[5]], [0, 0, 1]];
  }
  _$jscoverage['/ie/transform.js'].lineData[242]++;
  function setMatrix(m, x, y, v) {
    _$jscoverage['/ie/transform.js'].functionData[7]++;
    _$jscoverage['/ie/transform.js'].lineData[243]++;
    if (visit109_243_1(!m[x])) {
      _$jscoverage['/ie/transform.js'].lineData[244]++;
      m[x] = [];
    }
    _$jscoverage['/ie/transform.js'].lineData[246]++;
    m[x][y] = v;
  }
  _$jscoverage['/ie/transform.js'].lineData[249]++;
  function multipleMatrix(m1, m2) {
    _$jscoverage['/ie/transform.js'].functionData[8]++;
    _$jscoverage['/ie/transform.js'].lineData[250]++;
    var i;
    _$jscoverage['/ie/transform.js'].lineData[251]++;
    if (visit110_251_1(arguments.length > 2)) {
      _$jscoverage['/ie/transform.js'].lineData[252]++;
      var ret = m1;
      _$jscoverage['/ie/transform.js'].lineData[253]++;
      for (i = 1; visit111_253_1(i < arguments.length); i++) {
        _$jscoverage['/ie/transform.js'].lineData[254]++;
        ret = multipleMatrix(ret, arguments[i]);
      }
      _$jscoverage['/ie/transform.js'].lineData[256]++;
      return ret;
    }
    _$jscoverage['/ie/transform.js'].lineData[259]++;
    var m = [], r1 = m1.length, r2 = m2.length, c2 = m2[0].length;
    _$jscoverage['/ie/transform.js'].lineData[264]++;
    for (i = 0; visit112_264_1(i < r1); i++) {
      _$jscoverage['/ie/transform.js'].lineData[265]++;
      for (var k = 0; visit113_265_1(k < c2); k++) {
        _$jscoverage['/ie/transform.js'].lineData[266]++;
        var sum = 0;
        _$jscoverage['/ie/transform.js'].lineData[267]++;
        for (var j = 0; visit114_267_1(j < r2); j++) {
          _$jscoverage['/ie/transform.js'].lineData[268]++;
          sum += m1[i][j] * m2[j][k];
        }
        _$jscoverage['/ie/transform.js'].lineData[270]++;
        setMatrix(m, i, k, sum);
      }
    }
    _$jscoverage['/ie/transform.js'].lineData[274]++;
    return m;
  }
  _$jscoverage['/ie/transform.js'].lineData[278]++;
  function toRadian(value) {
    _$jscoverage['/ie/transform.js'].functionData[9]++;
    _$jscoverage['/ie/transform.js'].lineData[279]++;
    return visit115_279_1(value.indexOf('deg') > -1) ? parseInt(value, 10) * (Math.PI * 2 / 360) : parseFloat(value);
  }
});
