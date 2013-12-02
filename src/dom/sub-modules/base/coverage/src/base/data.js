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
if (! _$jscoverage['/base/data.js']) {
  _$jscoverage['/base/data.js'] = {};
  _$jscoverage['/base/data.js'].lineData = [];
  _$jscoverage['/base/data.js'].lineData[6] = 0;
  _$jscoverage['/base/data.js'].lineData[7] = 0;
  _$jscoverage['/base/data.js'].lineData[8] = 0;
  _$jscoverage['/base/data.js'].lineData[19] = 0;
  _$jscoverage['/base/data.js'].lineData[21] = 0;
  _$jscoverage['/base/data.js'].lineData[22] = 0;
  _$jscoverage['/base/data.js'].lineData[23] = 0;
  _$jscoverage['/base/data.js'].lineData[24] = 0;
  _$jscoverage['/base/data.js'].lineData[26] = 0;
  _$jscoverage['/base/data.js'].lineData[27] = 0;
  _$jscoverage['/base/data.js'].lineData[30] = 0;
  _$jscoverage['/base/data.js'].lineData[34] = 0;
  _$jscoverage['/base/data.js'].lineData[37] = 0;
  _$jscoverage['/base/data.js'].lineData[38] = 0;
  _$jscoverage['/base/data.js'].lineData[41] = 0;
  _$jscoverage['/base/data.js'].lineData[42] = 0;
  _$jscoverage['/base/data.js'].lineData[46] = 0;
  _$jscoverage['/base/data.js'].lineData[47] = 0;
  _$jscoverage['/base/data.js'].lineData[49] = 0;
  _$jscoverage['/base/data.js'].lineData[50] = 0;
  _$jscoverage['/base/data.js'].lineData[51] = 0;
  _$jscoverage['/base/data.js'].lineData[52] = 0;
  _$jscoverage['/base/data.js'].lineData[54] = 0;
  _$jscoverage['/base/data.js'].lineData[55] = 0;
  _$jscoverage['/base/data.js'].lineData[57] = 0;
  _$jscoverage['/base/data.js'].lineData[58] = 0;
  _$jscoverage['/base/data.js'].lineData[63] = 0;
  _$jscoverage['/base/data.js'].lineData[64] = 0;
  _$jscoverage['/base/data.js'].lineData[66] = 0;
  _$jscoverage['/base/data.js'].lineData[67] = 0;
  _$jscoverage['/base/data.js'].lineData[68] = 0;
  _$jscoverage['/base/data.js'].lineData[69] = 0;
  _$jscoverage['/base/data.js'].lineData[70] = 0;
  _$jscoverage['/base/data.js'].lineData[73] = 0;
  _$jscoverage['/base/data.js'].lineData[76] = 0;
  _$jscoverage['/base/data.js'].lineData[78] = 0;
  _$jscoverage['/base/data.js'].lineData[84] = 0;
  _$jscoverage['/base/data.js'].lineData[86] = 0;
  _$jscoverage['/base/data.js'].lineData[87] = 0;
  _$jscoverage['/base/data.js'].lineData[88] = 0;
  _$jscoverage['/base/data.js'].lineData[90] = 0;
  _$jscoverage['/base/data.js'].lineData[91] = 0;
  _$jscoverage['/base/data.js'].lineData[95] = 0;
  _$jscoverage['/base/data.js'].lineData[96] = 0;
  _$jscoverage['/base/data.js'].lineData[98] = 0;
  _$jscoverage['/base/data.js'].lineData[99] = 0;
  _$jscoverage['/base/data.js'].lineData[101] = 0;
  _$jscoverage['/base/data.js'].lineData[103] = 0;
  _$jscoverage['/base/data.js'].lineData[106] = 0;
  _$jscoverage['/base/data.js'].lineData[108] = 0;
  _$jscoverage['/base/data.js'].lineData[109] = 0;
  _$jscoverage['/base/data.js'].lineData[111] = 0;
  _$jscoverage['/base/data.js'].lineData[112] = 0;
  _$jscoverage['/base/data.js'].lineData[114] = 0;
  _$jscoverage['/base/data.js'].lineData[115] = 0;
  _$jscoverage['/base/data.js'].lineData[118] = 0;
  _$jscoverage['/base/data.js'].lineData[119] = 0;
  _$jscoverage['/base/data.js'].lineData[125] = 0;
  _$jscoverage['/base/data.js'].lineData[126] = 0;
  _$jscoverage['/base/data.js'].lineData[127] = 0;
  _$jscoverage['/base/data.js'].lineData[129] = 0;
  _$jscoverage['/base/data.js'].lineData[130] = 0;
  _$jscoverage['/base/data.js'].lineData[131] = 0;
  _$jscoverage['/base/data.js'].lineData[132] = 0;
  _$jscoverage['/base/data.js'].lineData[133] = 0;
  _$jscoverage['/base/data.js'].lineData[136] = 0;
  _$jscoverage['/base/data.js'].lineData[137] = 0;
  _$jscoverage['/base/data.js'].lineData[138] = 0;
  _$jscoverage['/base/data.js'].lineData[140] = 0;
  _$jscoverage['/base/data.js'].lineData[142] = 0;
  _$jscoverage['/base/data.js'].lineData[143] = 0;
  _$jscoverage['/base/data.js'].lineData[150] = 0;
  _$jscoverage['/base/data.js'].lineData[167] = 0;
  _$jscoverage['/base/data.js'].lineData[169] = 0;
  _$jscoverage['/base/data.js'].lineData[170] = 0;
  _$jscoverage['/base/data.js'].lineData[171] = 0;
  _$jscoverage['/base/data.js'].lineData[172] = 0;
  _$jscoverage['/base/data.js'].lineData[175] = 0;
  _$jscoverage['/base/data.js'].lineData[177] = 0;
  _$jscoverage['/base/data.js'].lineData[178] = 0;
  _$jscoverage['/base/data.js'].lineData[181] = 0;
  _$jscoverage['/base/data.js'].lineData[196] = 0;
  _$jscoverage['/base/data.js'].lineData[199] = 0;
  _$jscoverage['/base/data.js'].lineData[200] = 0;
  _$jscoverage['/base/data.js'].lineData[201] = 0;
  _$jscoverage['/base/data.js'].lineData[203] = 0;
  _$jscoverage['/base/data.js'].lineData[207] = 0;
  _$jscoverage['/base/data.js'].lineData[208] = 0;
  _$jscoverage['/base/data.js'].lineData[209] = 0;
  _$jscoverage['/base/data.js'].lineData[210] = 0;
  _$jscoverage['/base/data.js'].lineData[213] = 0;
  _$jscoverage['/base/data.js'].lineData[219] = 0;
  _$jscoverage['/base/data.js'].lineData[220] = 0;
  _$jscoverage['/base/data.js'].lineData[221] = 0;
  _$jscoverage['/base/data.js'].lineData[222] = 0;
  _$jscoverage['/base/data.js'].lineData[225] = 0;
  _$jscoverage['/base/data.js'].lineData[229] = 0;
  _$jscoverage['/base/data.js'].lineData[240] = 0;
  _$jscoverage['/base/data.js'].lineData[241] = 0;
  _$jscoverage['/base/data.js'].lineData[242] = 0;
  _$jscoverage['/base/data.js'].lineData[243] = 0;
  _$jscoverage['/base/data.js'].lineData[244] = 0;
  _$jscoverage['/base/data.js'].lineData[247] = 0;
  _$jscoverage['/base/data.js'].lineData[257] = 0;
  _$jscoverage['/base/data.js'].lineData[258] = 0;
  _$jscoverage['/base/data.js'].lineData[259] = 0;
  _$jscoverage['/base/data.js'].lineData[260] = 0;
  _$jscoverage['/base/data.js'].lineData[261] = 0;
  _$jscoverage['/base/data.js'].lineData[262] = 0;
  _$jscoverage['/base/data.js'].lineData[263] = 0;
  _$jscoverage['/base/data.js'].lineData[264] = 0;
  _$jscoverage['/base/data.js'].lineData[265] = 0;
  _$jscoverage['/base/data.js'].lineData[267] = 0;
  _$jscoverage['/base/data.js'].lineData[268] = 0;
  _$jscoverage['/base/data.js'].lineData[272] = 0;
  _$jscoverage['/base/data.js'].lineData[278] = 0;
}
if (! _$jscoverage['/base/data.js'].functionData) {
  _$jscoverage['/base/data.js'].functionData = [];
  _$jscoverage['/base/data.js'].functionData[0] = 0;
  _$jscoverage['/base/data.js'].functionData[1] = 0;
  _$jscoverage['/base/data.js'].functionData[2] = 0;
  _$jscoverage['/base/data.js'].functionData[3] = 0;
  _$jscoverage['/base/data.js'].functionData[4] = 0;
  _$jscoverage['/base/data.js'].functionData[5] = 0;
  _$jscoverage['/base/data.js'].functionData[6] = 0;
  _$jscoverage['/base/data.js'].functionData[7] = 0;
  _$jscoverage['/base/data.js'].functionData[8] = 0;
  _$jscoverage['/base/data.js'].functionData[9] = 0;
  _$jscoverage['/base/data.js'].functionData[10] = 0;
  _$jscoverage['/base/data.js'].functionData[11] = 0;
}
if (! _$jscoverage['/base/data.js'].branchData) {
  _$jscoverage['/base/data.js'].branchData = {};
  _$jscoverage['/base/data.js'].branchData['21'] = [];
  _$jscoverage['/base/data.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['22'] = [];
  _$jscoverage['/base/data.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['23'] = [];
  _$jscoverage['/base/data.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['26'] = [];
  _$jscoverage['/base/data.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['37'] = [];
  _$jscoverage['/base/data.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['46'] = [];
  _$jscoverage['/base/data.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['50'] = [];
  _$jscoverage['/base/data.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['51'] = [];
  _$jscoverage['/base/data.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['54'] = [];
  _$jscoverage['/base/data.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['55'] = [];
  _$jscoverage['/base/data.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['57'] = [];
  _$jscoverage['/base/data.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['63'] = [];
  _$jscoverage['/base/data.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['67'] = [];
  _$jscoverage['/base/data.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['69'] = [];
  _$jscoverage['/base/data.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['87'] = [];
  _$jscoverage['/base/data.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['95'] = [];
  _$jscoverage['/base/data.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['99'] = [];
  _$jscoverage['/base/data.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['101'] = [];
  _$jscoverage['/base/data.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['102'] = [];
  _$jscoverage['/base/data.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['109'] = [];
  _$jscoverage['/base/data.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['111'] = [];
  _$jscoverage['/base/data.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['114'] = [];
  _$jscoverage['/base/data.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['115'] = [];
  _$jscoverage['/base/data.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['118'] = [];
  _$jscoverage['/base/data.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['126'] = [];
  _$jscoverage['/base/data.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['130'] = [];
  _$jscoverage['/base/data.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['132'] = [];
  _$jscoverage['/base/data.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['142'] = [];
  _$jscoverage['/base/data.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['169'] = [];
  _$jscoverage['/base/data.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['171'] = [];
  _$jscoverage['/base/data.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['177'] = [];
  _$jscoverage['/base/data.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['199'] = [];
  _$jscoverage['/base/data.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['207'] = [];
  _$jscoverage['/base/data.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['208'] = [];
  _$jscoverage['/base/data.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['209'] = [];
  _$jscoverage['/base/data.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['219'] = [];
  _$jscoverage['/base/data.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['221'] = [];
  _$jscoverage['/base/data.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['241'] = [];
  _$jscoverage['/base/data.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['243'] = [];
  _$jscoverage['/base/data.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['259'] = [];
  _$jscoverage['/base/data.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['261'] = [];
  _$jscoverage['/base/data.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['262'] = [];
  _$jscoverage['/base/data.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['262'][2] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['264'] = [];
  _$jscoverage['/base/data.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/base/data.js'].branchData['267'] = [];
  _$jscoverage['/base/data.js'].branchData['267'][1] = new BranchData();
}
_$jscoverage['/base/data.js'].branchData['267'][1].init(349, 8, 'DOMEvent');
function visit229_267_1(result) {
  _$jscoverage['/base/data.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['264'][1].init(216, 7, 'j < len');
function visit228_264_1(result) {
  _$jscoverage['/base/data.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['262'][2].init(43, 51, 'deep && S.makeArray(elem.getElementsByTagName(\'*\'))');
function visit227_262_2(result) {
  _$jscoverage['/base/data.js'].branchData['262'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['262'][1].init(43, 57, 'deep && S.makeArray(elem.getElementsByTagName(\'*\')) || []');
function visit226_262_1(result) {
  _$jscoverage['/base/data.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['261'][1].init(60, 13, 'elem.nodeType');
function visit225_261_1(result) {
  _$jscoverage['/base/data.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['259'][1].init(153, 6, 'i >= 0');
function visit224_259_1(result) {
  _$jscoverage['/base/data.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['243'][1].init(60, 13, 'elem.nodeType');
function visit223_243_1(result) {
  _$jscoverage['/base/data.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['241'][1].init(98, 6, 'i >= 0');
function visit222_241_1(result) {
  _$jscoverage['/base/data.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['221'][1].init(70, 13, 'elem.nodeType');
function visit221_221_1(result) {
  _$jscoverage['/base/data.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['219'][1].init(52, 6, 'i >= 0');
function visit220_219_1(result) {
  _$jscoverage['/base/data.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['209'][1].init(29, 13, 'elem.nodeType');
function visit219_209_1(result) {
  _$jscoverage['/base/data.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['208'][1].init(25, 4, 'elem');
function visit218_208_1(result) {
  _$jscoverage['/base/data.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['207'][1].init(366, 18, 'data === undefined');
function visit217_207_1(result) {
  _$jscoverage['/base/data.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['199'][1].init(121, 21, 'S.isPlainObject(name)');
function visit216_199_1(result) {
  _$jscoverage['/base/data.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['177'][1].init(311, 3, 'ret');
function visit215_177_1(result) {
  _$jscoverage['/base/data.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['171'][1].init(66, 13, 'elem.nodeType');
function visit214_171_1(result) {
  _$jscoverage['/base/data.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['169'][1].init(115, 16, 'i < elems.length');
function visit213_169_1(result) {
  _$jscoverage['/base/data.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['142'][1].init(219, 20, 'elem.removeAttribute');
function visit212_142_1(result) {
  _$jscoverage['/base/data.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['132'][1].init(57, 22, 'S.isEmptyObject(cache)');
function visit211_132_1(result) {
  _$jscoverage['/base/data.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['130'][1].init(159, 18, 'name !== undefined');
function visit210_130_1(result) {
  _$jscoverage['/base/data.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['126'][1].init(61, 4, '!key');
function visit209_126_1(result) {
  _$jscoverage['/base/data.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['118'][1].init(74, 20, 'dataCache[key] || {}');
function visit208_118_1(result) {
  _$jscoverage['/base/data.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['115'][1].init(28, 20, 'cache && cache[name]');
function visit207_115_1(result) {
  _$jscoverage['/base/data.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['114'][1].init(21, 18, 'name !== undefined');
function visit206_114_1(result) {
  _$jscoverage['/base/data.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['111'][1].init(66, 20, 'dataCache[key] || {}');
function visit205_111_1(result) {
  _$jscoverage['/base/data.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['109'][1].init(485, 19, 'value !== undefined');
function visit204_109_1(result) {
  _$jscoverage['/base/data.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['102'][1].init(41, 19, 'value === undefined');
function visit203_102_1(result) {
  _$jscoverage['/base/data.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['101'][2].init(49, 18, 'name !== undefined');
function visit202_101_2(result) {
  _$jscoverage['/base/data.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['101'][1].init(49, 61, 'name !== undefined && value === undefined');
function visit201_101_1(result) {
  _$jscoverage['/base/data.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['99'][1].init(164, 4, '!key');
function visit200_99_1(result) {
  _$jscoverage['/base/data.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['95'][1].init(17, 35, 'noData[elem.nodeName.toLowerCase()]');
function visit199_95_1(result) {
  _$jscoverage['/base/data.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['87'][1].init(54, 4, '!key');
function visit198_87_1(result) {
  _$jscoverage['/base/data.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['69'][1].init(57, 22, 'S.isEmptyObject(cache)');
function visit197_69_1(result) {
  _$jscoverage['/base/data.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['67'][1].init(163, 18, 'name !== undefined');
function visit196_67_1(result) {
  _$jscoverage['/base/data.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['63'][1].init(17, 10, 'ob === win');
function visit195_63_1(result) {
  _$jscoverage['/base/data.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['57'][1].init(43, 17, 'ob[EXPANDO] || {}');
function visit194_57_1(result) {
  _$jscoverage['/base/data.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['55'][1].init(28, 20, 'cache && cache[name]');
function visit193_55_1(result) {
  _$jscoverage['/base/data.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['54'][1].init(21, 18, 'name !== undefined');
function visit192_54_1(result) {
  _$jscoverage['/base/data.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['51'][1].init(39, 17, 'ob[EXPANDO] || {}');
function visit191_51_1(result) {
  _$jscoverage['/base/data.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['50'][1].init(164, 19, 'value !== undefined');
function visit190_50_1(result) {
  _$jscoverage['/base/data.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['46'][1].init(17, 10, 'ob === win');
function visit189_46_1(result) {
  _$jscoverage['/base/data.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['37'][1].init(61, 10, 'ob === win');
function visit188_37_1(result) {
  _$jscoverage['/base/data.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['26'][1].init(171, 23, '!S.isEmptyObject(cache)');
function visit187_26_1(result) {
  _$jscoverage['/base/data.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['23'][1].init(25, 13, 'name in cache');
function visit186_23_1(result) {
  _$jscoverage['/base/data.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['22'][1].init(21, 18, 'name !== undefined');
function visit185_22_1(result) {
  _$jscoverage['/base/data.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].branchData['21'][1].init(17, 5, 'cache');
function visit184_21_1(result) {
  _$jscoverage['/base/data.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/data.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/data.js'].functionData[0]++;
  _$jscoverage['/base/data.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/data.js'].lineData[8]++;
  var win = S.Env.host, EXPANDO = '_ks_data_' + S.now(), dataCache = {}, winDataCache = {}, noData = {
  applet: 1, 
  object: 1, 
  embed: 1};
  _$jscoverage['/base/data.js'].lineData[19]++;
  var commonOps = {
  hasData: function(cache, name) {
  _$jscoverage['/base/data.js'].functionData[1]++;
  _$jscoverage['/base/data.js'].lineData[21]++;
  if (visit184_21_1(cache)) {
    _$jscoverage['/base/data.js'].lineData[22]++;
    if (visit185_22_1(name !== undefined)) {
      _$jscoverage['/base/data.js'].lineData[23]++;
      if (visit186_23_1(name in cache)) {
        _$jscoverage['/base/data.js'].lineData[24]++;
        return true;
      }
    } else {
      _$jscoverage['/base/data.js'].lineData[26]++;
      if (visit187_26_1(!S.isEmptyObject(cache))) {
        _$jscoverage['/base/data.js'].lineData[27]++;
        return true;
      }
    }
  }
  _$jscoverage['/base/data.js'].lineData[30]++;
  return false;
}};
  _$jscoverage['/base/data.js'].lineData[34]++;
  var objectOps = {
  hasData: function(ob, name) {
  _$jscoverage['/base/data.js'].functionData[2]++;
  _$jscoverage['/base/data.js'].lineData[37]++;
  if (visit188_37_1(ob === win)) {
    _$jscoverage['/base/data.js'].lineData[38]++;
    return objectOps.hasData(winDataCache, name);
  }
  _$jscoverage['/base/data.js'].lineData[41]++;
  var thisCache = ob[EXPANDO];
  _$jscoverage['/base/data.js'].lineData[42]++;
  return commonOps.hasData(thisCache, name);
}, 
  data: function(ob, name, value) {
  _$jscoverage['/base/data.js'].functionData[3]++;
  _$jscoverage['/base/data.js'].lineData[46]++;
  if (visit189_46_1(ob === win)) {
    _$jscoverage['/base/data.js'].lineData[47]++;
    return objectOps.data(winDataCache, name, value);
  }
  _$jscoverage['/base/data.js'].lineData[49]++;
  var cache = ob[EXPANDO];
  _$jscoverage['/base/data.js'].lineData[50]++;
  if (visit190_50_1(value !== undefined)) {
    _$jscoverage['/base/data.js'].lineData[51]++;
    cache = ob[EXPANDO] = visit191_51_1(ob[EXPANDO] || {});
    _$jscoverage['/base/data.js'].lineData[52]++;
    cache[name] = value;
  } else {
    _$jscoverage['/base/data.js'].lineData[54]++;
    if (visit192_54_1(name !== undefined)) {
      _$jscoverage['/base/data.js'].lineData[55]++;
      return visit193_55_1(cache && cache[name]);
    } else {
      _$jscoverage['/base/data.js'].lineData[57]++;
      cache = ob[EXPANDO] = visit194_57_1(ob[EXPANDO] || {});
      _$jscoverage['/base/data.js'].lineData[58]++;
      return cache;
    }
  }
}, 
  removeData: function(ob, name) {
  _$jscoverage['/base/data.js'].functionData[4]++;
  _$jscoverage['/base/data.js'].lineData[63]++;
  if (visit195_63_1(ob === win)) {
    _$jscoverage['/base/data.js'].lineData[64]++;
    return objectOps.removeData(winDataCache, name);
  }
  _$jscoverage['/base/data.js'].lineData[66]++;
  var cache = ob[EXPANDO];
  _$jscoverage['/base/data.js'].lineData[67]++;
  if (visit196_67_1(name !== undefined)) {
    _$jscoverage['/base/data.js'].lineData[68]++;
    delete cache[name];
    _$jscoverage['/base/data.js'].lineData[69]++;
    if (visit197_69_1(S.isEmptyObject(cache))) {
      _$jscoverage['/base/data.js'].lineData[70]++;
      objectOps.removeData(ob);
    }
  } else {
    _$jscoverage['/base/data.js'].lineData[73]++;
    try {
      _$jscoverage['/base/data.js'].lineData[76]++;
      delete ob[EXPANDO];
    }    catch (e) {
  _$jscoverage['/base/data.js'].lineData[78]++;
  ob[EXPANDO] = undefined;
}
  }
}};
  _$jscoverage['/base/data.js'].lineData[84]++;
  var domOps = {
  hasData: function(elem, name) {
  _$jscoverage['/base/data.js'].functionData[5]++;
  _$jscoverage['/base/data.js'].lineData[86]++;
  var key = elem[EXPANDO];
  _$jscoverage['/base/data.js'].lineData[87]++;
  if (visit198_87_1(!key)) {
    _$jscoverage['/base/data.js'].lineData[88]++;
    return false;
  }
  _$jscoverage['/base/data.js'].lineData[90]++;
  var thisCache = dataCache[key];
  _$jscoverage['/base/data.js'].lineData[91]++;
  return commonOps.hasData(thisCache, name);
}, 
  data: function(elem, name, value) {
  _$jscoverage['/base/data.js'].functionData[6]++;
  _$jscoverage['/base/data.js'].lineData[95]++;
  if (visit199_95_1(noData[elem.nodeName.toLowerCase()])) {
    _$jscoverage['/base/data.js'].lineData[96]++;
    return undefined;
  }
  _$jscoverage['/base/data.js'].lineData[98]++;
  var key = elem[EXPANDO], cache;
  _$jscoverage['/base/data.js'].lineData[99]++;
  if (visit200_99_1(!key)) {
    _$jscoverage['/base/data.js'].lineData[101]++;
    if (visit201_101_1(visit202_101_2(name !== undefined) && visit203_102_1(value === undefined))) {
      _$jscoverage['/base/data.js'].lineData[103]++;
      return undefined;
    }
    _$jscoverage['/base/data.js'].lineData[106]++;
    key = elem[EXPANDO] = S.guid();
  }
  _$jscoverage['/base/data.js'].lineData[108]++;
  cache = dataCache[key];
  _$jscoverage['/base/data.js'].lineData[109]++;
  if (visit204_109_1(value !== undefined)) {
    _$jscoverage['/base/data.js'].lineData[111]++;
    cache = dataCache[key] = visit205_111_1(dataCache[key] || {});
    _$jscoverage['/base/data.js'].lineData[112]++;
    cache[name] = value;
  } else {
    _$jscoverage['/base/data.js'].lineData[114]++;
    if (visit206_114_1(name !== undefined)) {
      _$jscoverage['/base/data.js'].lineData[115]++;
      return visit207_115_1(cache && cache[name]);
    } else {
      _$jscoverage['/base/data.js'].lineData[118]++;
      cache = dataCache[key] = visit208_118_1(dataCache[key] || {});
      _$jscoverage['/base/data.js'].lineData[119]++;
      return cache;
    }
  }
}, 
  removeData: function(elem, name) {
  _$jscoverage['/base/data.js'].functionData[7]++;
  _$jscoverage['/base/data.js'].lineData[125]++;
  var key = elem[EXPANDO], cache;
  _$jscoverage['/base/data.js'].lineData[126]++;
  if (visit209_126_1(!key)) {
    _$jscoverage['/base/data.js'].lineData[127]++;
    return;
  }
  _$jscoverage['/base/data.js'].lineData[129]++;
  cache = dataCache[key];
  _$jscoverage['/base/data.js'].lineData[130]++;
  if (visit210_130_1(name !== undefined)) {
    _$jscoverage['/base/data.js'].lineData[131]++;
    delete cache[name];
    _$jscoverage['/base/data.js'].lineData[132]++;
    if (visit211_132_1(S.isEmptyObject(cache))) {
      _$jscoverage['/base/data.js'].lineData[133]++;
      domOps.removeData(elem);
    }
  } else {
    _$jscoverage['/base/data.js'].lineData[136]++;
    delete dataCache[key];
    _$jscoverage['/base/data.js'].lineData[137]++;
    try {
      _$jscoverage['/base/data.js'].lineData[138]++;
      delete elem[EXPANDO];
    }    catch (e) {
  _$jscoverage['/base/data.js'].lineData[140]++;
  elem[EXPANDO] = undefined;
}
    _$jscoverage['/base/data.js'].lineData[142]++;
    if (visit212_142_1(elem.removeAttribute)) {
      _$jscoverage['/base/data.js'].lineData[143]++;
      elem.removeAttribute(EXPANDO);
    }
  }
}};
  _$jscoverage['/base/data.js'].lineData[150]++;
  S.mix(Dom, {
  __EXPANDO: EXPANDO, 
  hasData: function(selector, name) {
  _$jscoverage['/base/data.js'].functionData[8]++;
  _$jscoverage['/base/data.js'].lineData[167]++;
  var ret = false, elems = Dom.query(selector);
  _$jscoverage['/base/data.js'].lineData[169]++;
  for (var i = 0; visit213_169_1(i < elems.length); i++) {
    _$jscoverage['/base/data.js'].lineData[170]++;
    var elem = elems[i];
    _$jscoverage['/base/data.js'].lineData[171]++;
    if (visit214_171_1(elem.nodeType)) {
      _$jscoverage['/base/data.js'].lineData[172]++;
      ret = domOps.hasData(elem, name);
    } else {
      _$jscoverage['/base/data.js'].lineData[175]++;
      ret = objectOps.hasData(elem, name);
    }
    _$jscoverage['/base/data.js'].lineData[177]++;
    if (visit215_177_1(ret)) {
      _$jscoverage['/base/data.js'].lineData[178]++;
      return ret;
    }
  }
  _$jscoverage['/base/data.js'].lineData[181]++;
  return ret;
}, 
  data: function(selector, name, data) {
  _$jscoverage['/base/data.js'].functionData[9]++;
  _$jscoverage['/base/data.js'].lineData[196]++;
  var elems = Dom.query(selector), elem = elems[0];
  _$jscoverage['/base/data.js'].lineData[199]++;
  if (visit216_199_1(S.isPlainObject(name))) {
    _$jscoverage['/base/data.js'].lineData[200]++;
    for (var k in name) {
      _$jscoverage['/base/data.js'].lineData[201]++;
      Dom.data(elems, k, name[k]);
    }
    _$jscoverage['/base/data.js'].lineData[203]++;
    return undefined;
  }
  _$jscoverage['/base/data.js'].lineData[207]++;
  if (visit217_207_1(data === undefined)) {
    _$jscoverage['/base/data.js'].lineData[208]++;
    if (visit218_208_1(elem)) {
      _$jscoverage['/base/data.js'].lineData[209]++;
      if (visit219_209_1(elem.nodeType)) {
        _$jscoverage['/base/data.js'].lineData[210]++;
        return domOps.data(elem, name);
      } else {
        _$jscoverage['/base/data.js'].lineData[213]++;
        return objectOps.data(elem, name);
      }
    }
  } else {
    _$jscoverage['/base/data.js'].lineData[219]++;
    for (var i = elems.length - 1; visit220_219_1(i >= 0); i--) {
      _$jscoverage['/base/data.js'].lineData[220]++;
      elem = elems[i];
      _$jscoverage['/base/data.js'].lineData[221]++;
      if (visit221_221_1(elem.nodeType)) {
        _$jscoverage['/base/data.js'].lineData[222]++;
        domOps.data(elem, name, data);
      } else {
        _$jscoverage['/base/data.js'].lineData[225]++;
        objectOps.data(elem, name, data);
      }
    }
  }
  _$jscoverage['/base/data.js'].lineData[229]++;
  return undefined;
}, 
  removeData: function(selector, name) {
  _$jscoverage['/base/data.js'].functionData[10]++;
  _$jscoverage['/base/data.js'].lineData[240]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/data.js'].lineData[241]++;
  for (i = els.length - 1; visit222_241_1(i >= 0); i--) {
    _$jscoverage['/base/data.js'].lineData[242]++;
    elem = els[i];
    _$jscoverage['/base/data.js'].lineData[243]++;
    if (visit223_243_1(elem.nodeType)) {
      _$jscoverage['/base/data.js'].lineData[244]++;
      domOps.removeData(elem, name);
    } else {
      _$jscoverage['/base/data.js'].lineData[247]++;
      objectOps.removeData(elem, name);
    }
  }
}, 
  cleanData: function(selector, deep) {
  _$jscoverage['/base/data.js'].functionData[11]++;
  _$jscoverage['/base/data.js'].lineData[257]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/data.js'].lineData[258]++;
  var DOMEvent = S.require('event/dom');
  _$jscoverage['/base/data.js'].lineData[259]++;
  for (i = els.length - 1; visit224_259_1(i >= 0); i--) {
    _$jscoverage['/base/data.js'].lineData[260]++;
    elem = els[i];
    _$jscoverage['/base/data.js'].lineData[261]++;
    if (visit225_261_1(elem.nodeType)) {
      _$jscoverage['/base/data.js'].lineData[262]++;
      var descendants = visit226_262_1(visit227_262_2(deep && S.makeArray(elem.getElementsByTagName('*'))) || []);
      _$jscoverage['/base/data.js'].lineData[263]++;
      descendants.push(elem);
      _$jscoverage['/base/data.js'].lineData[264]++;
      for (var j = 0, len = descendants.length; visit228_264_1(j < len); j++) {
        _$jscoverage['/base/data.js'].lineData[265]++;
        domOps.removeData(descendants[j]);
      }
      _$jscoverage['/base/data.js'].lineData[267]++;
      if (visit229_267_1(DOMEvent)) {
        _$jscoverage['/base/data.js'].lineData[268]++;
        DOMEvent.detach(descendants);
      }
    } else {
      _$jscoverage['/base/data.js'].lineData[272]++;
      objectOps.removeData(elem);
    }
  }
}});
  _$jscoverage['/base/data.js'].lineData[278]++;
  return Dom;
});
