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
if (! _$jscoverage['/editor/selectionFix.js']) {
  _$jscoverage['/editor/selectionFix.js'] = {};
  _$jscoverage['/editor/selectionFix.js'].lineData = [];
  _$jscoverage['/editor/selectionFix.js'].lineData[10] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[12] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[25] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[26] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[32] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[33] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[35] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[36] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[39] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[42] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[46] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[47] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[50] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[51] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[53] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[54] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[55] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[59] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[60] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[63] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[65] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[67] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[69] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[70] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[72] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[74] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[77] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[83] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[84] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[85] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[86] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[87] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[90] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[91] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[94] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[96] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[97] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[99] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[100] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[102] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[103] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[110] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[111] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[119] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[124] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[125] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[126] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[127] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[138] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[147] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[152] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[155] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[156] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[176] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[177] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[180] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[181] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[185] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[187] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[190] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[191] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[197] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[201] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[204] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[205] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[208] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[211] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[212] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[216] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[217] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[241] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[243] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[245] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[247] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[248] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[249] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[257] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[259] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[260] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[273] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[278] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[279] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[281] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[283] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[288] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[289] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[294] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[296] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[299] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[303] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[304] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[306] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[307] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[308] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[309] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[314] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[315] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[319] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[321] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[324] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[337] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[340] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[344] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[345] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[348] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[351] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[352] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[356] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[357] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[358] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[361] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[362] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[368] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[370] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[379] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[380] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[382] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[391] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[395] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[396] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[400] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[401] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[402] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[408] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[409] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[410] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[413] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[414] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[416] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[417] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[420] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[423] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[430] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[432] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[439] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[444] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[446] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[448] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[449] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[450] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[451] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[457] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[459] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[461] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[462] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[463] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[465] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[470] = 0;
}
if (! _$jscoverage['/editor/selectionFix.js'].functionData) {
  _$jscoverage['/editor/selectionFix.js'].functionData = [];
  _$jscoverage['/editor/selectionFix.js'].functionData[0] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[1] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[2] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[3] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[4] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[5] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[6] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[7] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[8] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[9] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[10] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[11] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[12] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[13] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[14] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[15] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[16] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[17] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[18] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[19] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[20] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[21] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[22] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[23] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[24] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[25] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[26] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[27] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[28] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[29] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[30] = 0;
}
if (! _$jscoverage['/editor/selectionFix.js'].branchData) {
  _$jscoverage['/editor/selectionFix.js'].branchData = {};
  _$jscoverage['/editor/selectionFix.js'].branchData['50'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['50'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['50'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['63'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['67'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['69'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['85'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['86'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['90'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['97'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['120'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['126'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['180'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['185'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['190'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['211'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['259'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['261'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['262'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['273'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['273'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['273'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['278'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['289'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['289'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['289'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['289'][4] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['290'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['291'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['292'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['296'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['352'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['352'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['358'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['362'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['373'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['379'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['380'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['381'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['382'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['384'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['386'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['386'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['386'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['386'][4] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['388'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['388'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['395'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['395'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['400'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['402'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['406'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['408'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['410'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['411'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['411'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['417'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['418'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['418'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['448'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['450'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['461'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['461'][1] = new BranchData();
}
_$jscoverage['/editor/selectionFix.js'].branchData['461'][1].init(86, 5, 'UA.ie');
function visit807_461_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['450'][1].init(100, 9, '!UA[\'ie\']');
function visit806_450_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['448'][1].init(3723, 41, 'lastPath.blockLimit.nodeName() !== \'body\'');
function visit805_448_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['418'][2].init(152, 48, 'element[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit804_418_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['418'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['418'][1].init(43, 113, 'element[0].nodeType == Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit803_418_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['417'][1].init(106, 157, 'element && element[0].nodeType == Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit802_417_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['411'][2].init(144, 48, 'element[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit801_411_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['411'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['411'][1].init(39, 111, 'element[0].nodeType == Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit800_411_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['410'][1].init(102, 151, 'element && element[0].nodeType == Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit799_410_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['408'][1].init(82, 28, 'isBlankParagraph(fixedBlock)');
function visit798_408_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['406'][1].init(220, 34, 'fixedBlock[0] != body[0].lastChild');
function visit797_406_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['402'][1].init(83, 255, 'fixedBlock && fixedBlock[0] != body[0].lastChild');
function visit796_402_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['400'][1].init(1426, 31, 'blockLimit.nodeName() == "body"');
function visit795_400_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['395'][2].init(1301, 30, '!range.collapsed || path.block');
function visit794_395_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['395'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['395'][1].init(1291, 40, '!range || !range.collapsed || path.block');
function visit793_395_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['388'][2].init(471, 29, 'pathBlock.nodeName() != \'pre\'');
function visit792_388_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['388'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['388'][1].init(132, 123, 'pathBlock.nodeName() != \'pre\' && !pathBlock._4e_getBogus()');
function visit791_388_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['386'][4].init(352, 25, 'lastNode[0].nodeType == 1');
function visit790_386_4(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['386'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['386'][3].init(352, 59, 'lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary()');
function visit789_386_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['386'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['386'][2].init(340, 71, 'lastNode && lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary()');
function visit788_386_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['386'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['386'][1].init(101, 256, '!(lastNode && lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary()) && pathBlock.nodeName() != \'pre\' && !pathBlock._4e_getBogus()');
function visit787_386_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['384'][1].init(72, 358, 'pathBlock._4e_isBlockBoundary() && !(lastNode && lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary()) && pathBlock.nodeName() != \'pre\' && !pathBlock._4e_getBogus()');
function visit786_384_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['382'][1].init(159, 431, 'pathBlock && pathBlock._4e_isBlockBoundary() && !(lastNode && lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary()) && pathBlock.nodeName() != \'pre\' && !pathBlock._4e_getBogus()');
function visit785_382_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['381'][1].init(78, 39, 'pathBlock && pathBlock.last(isNotEmpty)');
function visit784_381_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['380'][1].init(34, 29, 'path.block || path.blockLimit');
function visit783_380_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['379'][1].init(580, 11, 'UA[\'gecko\']');
function visit782_379_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['373'][1].init(153, 37, 'selection && selection.getRanges()[0]');
function visit781_373_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['362'][1].init(21, 44, 'isNotWhitespace(node) && isNotBookmark(node)');
function visit780_362_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['358'][1].init(62, 65, 'element._4e_isBlockBoundary() && dtd.$empty[element.nodeName()]');
function visit779_358_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['352'][2].init(46, 18, 'node.nodeType != 8');
function visit778_352_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['352'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['352'][1].init(21, 43, 'isNotWhitespace(node) && node.nodeType != 8');
function visit777_352_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['296'][1].init(1875, 33, 'nativeSel && sel.getRanges()[0]');
function visit776_296_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['292'][1].init(65, 109, '(parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit775_292_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['291'][1].init(63, 175, '(parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit774_291_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['290'][1].init(53, 239, '(parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit773_290_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['289'][4].init(1500, 27, 'nativeSel.type != \'Control\'');
function visit772_289_4(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['289'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['289'][3].init(1500, 293, 'nativeSel.type != \'Control\' && (parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit771_289_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['289'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['289'][2].init(1482, 311, 'nativeSel.type && nativeSel.type != \'Control\' && (parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit770_289_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['289'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['289'][1].init(1469, 324, 'nativeSel && nativeSel.type && nativeSel.type != \'Control\' && (parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit769_289_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['278'][1].init(281, 42, '!doc[\'queryCommandEnabled\'](\'InsertImage\')');
function visit768_278_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['273'][3].init(728, 26, 'type == KES.SELECTION_NONE');
function visit767_273_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['273'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['273'][2].init(715, 39, 'nativeSel && type == KES.SELECTION_NONE');
function visit766_273_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['273'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['273'][1].init(705, 49, 'testIt && nativeSel && type == KES.SELECTION_NONE');
function visit765_273_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['262'][1].init(115, 20, 'sel && doc.selection');
function visit764_262_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['261'][1].init(60, 20, 'sel && sel.getType()');
function visit763_261_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['259'][1].init(58, 11, 'saveEnabled');
function visit762_259_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['211'][1].init(181, 17, 'evt.relatedTarget');
function visit761_211_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['190'][1].init(122, 14, 'restoreEnabled');
function visit760_190_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['185'][1].init(356, 10, 'savedRange');
function visit759_185_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['180'][1].init(204, 22, 't.nodeName() != \'body\'');
function visit758_180_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['126'][1].init(69, 23, 't.nodeName() === "html"');
function visit757_126_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['120'][1].init(31, 25, 'Editor.Utils.ieEngine < 8');
function visit756_120_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['97'][1].init(518, 8, 'startRng');
function visit755_97_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['90'][1].init(233, 37, 'html.scrollHeight > html.clientHeight');
function visit754_90_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['86'][1].init(22, 7, 'started');
function visit753_86_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['85'][1].init(63, 17, 'e.target === html');
function visit752_85_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['69'][1].init(121, 55, 'pointRng.compareEndPoints(\'StartToStart\', startRng) > 0');
function visit751_69_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['67'][1].init(137, 8, 'pointRng');
function visit750_67_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['63'][1].init(98, 8, 'e.button');
function visit749_63_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['50'][3].init(169, 45, 'rng.compareEndPoints(\'StartToEnd\', rng) === 0');
function visit748_50_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['50'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['50'][2].init(156, 58, '!rng.item && rng.compareEndPoints(\'StartToEnd\', rng) === 0');
function visit747_50_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['50'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['50'][1].init(144, 70, 'startRng && !rng.item && rng.compareEndPoints(\'StartToEnd\', rng) === 0');
function visit746_50_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].lineData[10]++;
KISSY.add("editor/selectionFix", function(S, Editor) {
  _$jscoverage['/editor/selectionFix.js'].functionData[0]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[12]++;
  var TRUE = true, FALSE = false, NULL = null, UA = S.UA, Event = S.Event, Dom = S.DOM, Node = S.Node, KES = Editor.SelectionType;
  _$jscoverage['/editor/selectionFix.js'].lineData[25]++;
  function fixCursorForIE(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[1]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[26]++;
    var started, win = editor.get("window")[0], doc = editor.get("document")[0], startRng;
    _$jscoverage['/editor/selectionFix.js'].lineData[32]++;
    function rngFromPoint(x, y) {
      _$jscoverage['/editor/selectionFix.js'].functionData[2]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[33]++;
      var rng = doc.body.createTextRange();
      _$jscoverage['/editor/selectionFix.js'].lineData[35]++;
      try {
        _$jscoverage['/editor/selectionFix.js'].lineData[36]++;
        rng['moveToPoint'](x, y);
      }      catch (ex) {
  _$jscoverage['/editor/selectionFix.js'].lineData[39]++;
  rng = NULL;
}
      _$jscoverage['/editor/selectionFix.js'].lineData[42]++;
      return rng;
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[46]++;
    function endSelection() {
      _$jscoverage['/editor/selectionFix.js'].functionData[3]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[47]++;
      var rng = doc.selection.createRange();
      _$jscoverage['/editor/selectionFix.js'].lineData[50]++;
      if (visit746_50_1(startRng && visit747_50_2(!rng.item && visit748_50_3(rng.compareEndPoints('StartToEnd', rng) === 0)))) {
        _$jscoverage['/editor/selectionFix.js'].lineData[51]++;
        startRng.select();
      }
      _$jscoverage['/editor/selectionFix.js'].lineData[53]++;
      Event.remove(doc, 'mouseup', endSelection);
      _$jscoverage['/editor/selectionFix.js'].lineData[54]++;
      Event.remove(doc, 'mousemove', selectionChange);
      _$jscoverage['/editor/selectionFix.js'].lineData[55]++;
      startRng = started = 0;
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[59]++;
    function selectionChange(e) {
      _$jscoverage['/editor/selectionFix.js'].functionData[4]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[60]++;
      var pointRng;
      _$jscoverage['/editor/selectionFix.js'].lineData[63]++;
      if (visit749_63_1(e.button)) {
        _$jscoverage['/editor/selectionFix.js'].lineData[65]++;
        pointRng = rngFromPoint(e.pageX, e.pageY);
        _$jscoverage['/editor/selectionFix.js'].lineData[67]++;
        if (visit750_67_1(pointRng)) {
          _$jscoverage['/editor/selectionFix.js'].lineData[69]++;
          if (visit751_69_1(pointRng.compareEndPoints('StartToStart', startRng) > 0)) {
            _$jscoverage['/editor/selectionFix.js'].lineData[70]++;
            pointRng.setEndPoint('StartToStart', startRng);
          } else {
            _$jscoverage['/editor/selectionFix.js'].lineData[72]++;
            pointRng.setEndPoint('EndToEnd', startRng);
          }
          _$jscoverage['/editor/selectionFix.js'].lineData[74]++;
          pointRng.select();
        }
      } else {
        _$jscoverage['/editor/selectionFix.js'].lineData[77]++;
        endSelection();
      }
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[83]++;
    Event.on(doc, "mousedown contextmenu", function(e) {
  _$jscoverage['/editor/selectionFix.js'].functionData[5]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[84]++;
  var html = doc.documentElement;
  _$jscoverage['/editor/selectionFix.js'].lineData[85]++;
  if (visit752_85_1(e.target === html)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[86]++;
    if (visit753_86_1(started)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[87]++;
      endSelection();
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[90]++;
    if (visit754_90_1(html.scrollHeight > html.clientHeight)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[91]++;
      return;
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[94]++;
    started = 1;
    _$jscoverage['/editor/selectionFix.js'].lineData[96]++;
    startRng = rngFromPoint(e.pageX, e.pageY);
    _$jscoverage['/editor/selectionFix.js'].lineData[97]++;
    if (visit755_97_1(startRng)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[99]++;
      Event.on(doc, 'mouseup', endSelection);
      _$jscoverage['/editor/selectionFix.js'].lineData[100]++;
      Event.on(doc, 'mousemove', selectionChange);
      _$jscoverage['/editor/selectionFix.js'].lineData[102]++;
      win.focus();
      _$jscoverage['/editor/selectionFix.js'].lineData[103]++;
      startRng.select();
    }
  }
});
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[110]++;
  function fixSelectionForIEWhenDocReady(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[6]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[111]++;
    var doc = editor.get("document")[0], body = new Node(doc.body), html = new Node(doc.documentElement);
    _$jscoverage['/editor/selectionFix.js'].lineData[119]++;
    if (visit756_120_1(Editor.Utils.ieEngine < 8)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[124]++;
      html.on('click', function(evt) {
  _$jscoverage['/editor/selectionFix.js'].functionData[7]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[125]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor/selectionFix.js'].lineData[126]++;
  if (visit757_126_1(t.nodeName() === "html")) {
    _$jscoverage['/editor/selectionFix.js'].lineData[127]++;
    editor.getSelection().getNative().createRange().select();
  }
});
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[138]++;
    var savedRange, saveEnabled, restoreEnabled = TRUE;
    _$jscoverage['/editor/selectionFix.js'].lineData[147]++;
    html.on('mousedown', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[8]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[152]++;
  restoreEnabled = FALSE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[155]++;
    html.on('mouseup', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[9]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[156]++;
  restoreEnabled = TRUE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[176]++;
    body.on('focusin', function(evt) {
  _$jscoverage['/editor/selectionFix.js'].functionData[10]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[177]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor/selectionFix.js'].lineData[180]++;
  if (visit758_180_1(t.nodeName() != 'body')) {
    _$jscoverage['/editor/selectionFix.js'].lineData[181]++;
    return;
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[185]++;
  if (visit759_185_1(savedRange)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[187]++;
    try {
      _$jscoverage['/editor/selectionFix.js'].lineData[190]++;
      if (visit760_190_1(restoreEnabled)) {
        _$jscoverage['/editor/selectionFix.js'].lineData[191]++;
        savedRange.select();
      }
    }    catch (e) {
}
    _$jscoverage['/editor/selectionFix.js'].lineData[197]++;
    savedRange = NULL;
  }
});
    _$jscoverage['/editor/selectionFix.js'].lineData[201]++;
    body.on('focus', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[11]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[204]++;
  saveEnabled = TRUE;
  _$jscoverage['/editor/selectionFix.js'].lineData[205]++;
  saveSelection();
});
    _$jscoverage['/editor/selectionFix.js'].lineData[208]++;
    body.on('beforedeactivate', function(evt) {
  _$jscoverage['/editor/selectionFix.js'].functionData[12]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[211]++;
  if (visit761_211_1(evt.relatedTarget)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[212]++;
    return;
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[216]++;
  saveEnabled = FALSE;
  _$jscoverage['/editor/selectionFix.js'].lineData[217]++;
  restoreEnabled = TRUE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[241]++;
    body.on('mousedown', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[13]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[243]++;
  saveEnabled = FALSE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[245]++;
    body.on('mouseup', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[14]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[247]++;
  saveEnabled = TRUE;
  _$jscoverage['/editor/selectionFix.js'].lineData[248]++;
  setTimeout(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[15]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[249]++;
  saveSelection(TRUE);
}, 0);
});
    _$jscoverage['/editor/selectionFix.js'].lineData[257]++;
    function saveSelection(testIt) {
      _$jscoverage['/editor/selectionFix.js'].functionData[16]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[259]++;
      if (visit762_259_1(saveEnabled)) {
        _$jscoverage['/editor/selectionFix.js'].lineData[260]++;
        var sel = editor.getSelection(), type = visit763_261_1(sel && sel.getType()), nativeSel = visit764_262_1(sel && doc.selection);
        _$jscoverage['/editor/selectionFix.js'].lineData[273]++;
        if (visit765_273_1(testIt && visit766_273_2(nativeSel && visit767_273_3(type == KES.SELECTION_NONE)))) {
          _$jscoverage['/editor/selectionFix.js'].lineData[278]++;
          if (visit768_278_1(!doc['queryCommandEnabled']('InsertImage'))) {
            _$jscoverage['/editor/selectionFix.js'].lineData[279]++;
            setTimeout(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[17]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[281]++;
  saveSelection(TRUE);
}, 50);
            _$jscoverage['/editor/selectionFix.js'].lineData[283]++;
            return;
          }
        }
        _$jscoverage['/editor/selectionFix.js'].lineData[288]++;
        var parentTag;
        _$jscoverage['/editor/selectionFix.js'].lineData[289]++;
        if (visit769_289_1(nativeSel && visit770_289_2(nativeSel.type && visit771_289_3(visit772_289_4(nativeSel.type != 'Control') && visit773_290_1((parentTag = nativeSel.createRange()) && visit774_291_1((parentTag = parentTag.parentElement()) && visit775_292_1((parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {
  input: 1, 
  textarea: 1}))))))) {
          _$jscoverage['/editor/selectionFix.js'].lineData[294]++;
          return;
        }
        _$jscoverage['/editor/selectionFix.js'].lineData[296]++;
        savedRange = visit776_296_1(nativeSel && sel.getRanges()[0]);
        _$jscoverage['/editor/selectionFix.js'].lineData[299]++;
        editor.checkSelectionChange();
      }
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[303]++;
    body.on('keydown', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[18]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[304]++;
  saveEnabled = FALSE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[306]++;
    body.on('keyup', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[19]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[307]++;
  saveEnabled = TRUE;
  _$jscoverage['/editor/selectionFix.js'].lineData[308]++;
  setTimeout(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[20]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[309]++;
  saveSelection();
}, 0);
});
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[314]++;
  function fireSelectionChangeForNonIE(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[21]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[315]++;
    var doc = editor.get("document")[0];
    _$jscoverage['/editor/selectionFix.js'].lineData[319]++;
    function monitor() {
      _$jscoverage['/editor/selectionFix.js'].functionData[22]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[321]++;
      editor.checkSelectionChange();
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[324]++;
    Event.on(doc, 'mouseup keyup ' + 'selectionchange', monitor);
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[337]++;
  function monitorSelectionChange(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[23]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[340]++;
    var emptyParagraphRegexp = /\s*<(p|div|address|h\d|center)[^>]*>\s*(?:<br[^>]*>|&nbsp;|\u00A0|&#160;|(<!--[\s\S]*?-->))?\s*(:?<\/\1>)?(?=\s*$|<\/body>)/gi;
    _$jscoverage['/editor/selectionFix.js'].lineData[344]++;
    function isBlankParagraph(block) {
      _$jscoverage['/editor/selectionFix.js'].functionData[24]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[345]++;
      return block.outerHtml().match(emptyParagraphRegexp);
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[348]++;
    var isNotWhitespace = Editor.Walker.whitespaces(TRUE), isNotBookmark = Editor.Walker.bookmark(FALSE, TRUE);
    _$jscoverage['/editor/selectionFix.js'].lineData[351]++;
    var nextValidEl = function(node) {
  _$jscoverage['/editor/selectionFix.js'].functionData[25]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[352]++;
  return visit777_352_1(isNotWhitespace(node) && visit778_352_2(node.nodeType != 8));
};
    _$jscoverage['/editor/selectionFix.js'].lineData[356]++;
    function cannotCursorPlaced(element) {
      _$jscoverage['/editor/selectionFix.js'].functionData[26]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[357]++;
      var dtd = Editor.XHTML_DTD;
      _$jscoverage['/editor/selectionFix.js'].lineData[358]++;
      return visit779_358_1(element._4e_isBlockBoundary() && dtd.$empty[element.nodeName()]);
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[361]++;
    function isNotEmpty(node) {
      _$jscoverage['/editor/selectionFix.js'].functionData[27]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[362]++;
      return visit780_362_1(isNotWhitespace(node) && isNotBookmark(node));
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[368]++;
    editor.on("selectionChange", function(ev) {
  _$jscoverage['/editor/selectionFix.js'].functionData[28]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[370]++;
  var path = ev.path, body = new Node(editor.get("document")[0].body), selection = ev.selection, range = visit781_373_1(selection && selection.getRanges()[0]), blockLimit = path.blockLimit;
  _$jscoverage['/editor/selectionFix.js'].lineData[379]++;
  if (visit782_379_1(UA['gecko'])) {
    _$jscoverage['/editor/selectionFix.js'].lineData[380]++;
    var pathBlock = visit783_380_1(path.block || path.blockLimit), lastNode = visit784_381_1(pathBlock && pathBlock.last(isNotEmpty));
    _$jscoverage['/editor/selectionFix.js'].lineData[382]++;
    if (visit785_382_1(pathBlock && visit786_384_1(pathBlock._4e_isBlockBoundary() && visit787_386_1(!(visit788_386_2(lastNode && visit789_386_3(visit790_386_4(lastNode[0].nodeType == 1) && lastNode._4e_isBlockBoundary()))) && visit791_388_1(visit792_388_2(pathBlock.nodeName() != 'pre') && !pathBlock._4e_getBogus()))))) {
      _$jscoverage['/editor/selectionFix.js'].lineData[391]++;
      pathBlock._4e_appendBogus();
    }
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[395]++;
  if (visit793_395_1(!range || visit794_395_2(!range.collapsed || path.block))) {
    _$jscoverage['/editor/selectionFix.js'].lineData[396]++;
    return;
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[400]++;
  if (visit795_400_1(blockLimit.nodeName() == "body")) {
    _$jscoverage['/editor/selectionFix.js'].lineData[401]++;
    var fixedBlock = range.fixBlock(TRUE, "p");
    _$jscoverage['/editor/selectionFix.js'].lineData[402]++;
    if (visit796_402_1(fixedBlock && visit797_406_1(fixedBlock[0] != body[0].lastChild))) {
      _$jscoverage['/editor/selectionFix.js'].lineData[408]++;
      if (visit798_408_1(isBlankParagraph(fixedBlock))) {
        _$jscoverage['/editor/selectionFix.js'].lineData[409]++;
        var element = fixedBlock.next(nextValidEl, 1);
        _$jscoverage['/editor/selectionFix.js'].lineData[410]++;
        if (visit799_410_1(element && visit800_411_1(visit801_411_2(element[0].nodeType == Dom.NodeType.ELEMENT_NODE) && !cannotCursorPlaced[element]))) {
          _$jscoverage['/editor/selectionFix.js'].lineData[413]++;
          range.moveToElementEditablePosition(element);
          _$jscoverage['/editor/selectionFix.js'].lineData[414]++;
          fixedBlock._4e_remove();
        } else {
          _$jscoverage['/editor/selectionFix.js'].lineData[416]++;
          element = fixedBlock.prev(nextValidEl, 1);
          _$jscoverage['/editor/selectionFix.js'].lineData[417]++;
          if (visit802_417_1(element && visit803_418_1(visit804_418_2(element[0].nodeType == Dom.NodeType.ELEMENT_NODE) && !cannotCursorPlaced[element]))) {
            _$jscoverage['/editor/selectionFix.js'].lineData[420]++;
            range.moveToElementEditablePosition(element, isBlankParagraph(element) ? FALSE : TRUE);
            _$jscoverage['/editor/selectionFix.js'].lineData[423]++;
            fixedBlock._4e_remove();
          } else {
          }
        }
      }
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[430]++;
    range.select();
    _$jscoverage['/editor/selectionFix.js'].lineData[432]++;
    editor.notifySelectionChange();
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[439]++;
  var doc = editor.get("document")[0], lastRange = new Editor.Range(doc), lastPath, editBlock;
  _$jscoverage['/editor/selectionFix.js'].lineData[444]++;
  lastRange.moveToElementEditablePosition(body, TRUE);
  _$jscoverage['/editor/selectionFix.js'].lineData[446]++;
  lastPath = new Editor.ElementPath(lastRange.startContainer);
  _$jscoverage['/editor/selectionFix.js'].lineData[448]++;
  if (visit805_448_1(lastPath.blockLimit.nodeName() !== 'body')) {
    _$jscoverage['/editor/selectionFix.js'].lineData[449]++;
    editBlock = new Node(doc.createElement('p')).appendTo(body);
    _$jscoverage['/editor/selectionFix.js'].lineData[450]++;
    if (visit806_450_1(!UA['ie'])) {
      _$jscoverage['/editor/selectionFix.js'].lineData[451]++;
      editBlock._4e_appendBogus();
    }
  }
});
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[457]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/selectionFix.js'].functionData[29]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[459]++;
  editor.docReady(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[30]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[461]++;
  if (visit807_461_1(UA.ie)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[462]++;
    fixCursorForIE(editor);
    _$jscoverage['/editor/selectionFix.js'].lineData[463]++;
    fixSelectionForIEWhenDocReady(editor);
  } else {
    _$jscoverage['/editor/selectionFix.js'].lineData[465]++;
    fireSelectionChangeForNonIE(editor);
  }
});
  _$jscoverage['/editor/selectionFix.js'].lineData[470]++;
  monitorSelectionChange(editor);
}};
}, {
  requires: ['./base', './selection', 'node']});
