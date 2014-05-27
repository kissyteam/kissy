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
if (! _$jscoverage['/io/xhr-transport-base.js']) {
  _$jscoverage['/io/xhr-transport-base.js'] = {};
  _$jscoverage['/io/xhr-transport-base.js'].lineData = [];
  _$jscoverage['/io/xhr-transport-base.js'].lineData[6] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[7] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[8] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[9] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[21] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[22] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[24] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[25] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[26] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[29] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[32] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[33] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[34] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[37] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[40] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[42] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[43] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[46] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[50] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[52] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[55] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[56] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[59] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[60] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[62] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[63] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[64] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[65] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[68] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[70] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[72] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[75] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[77] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[93] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[100] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[101] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[103] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[104] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[108] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[109] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[111] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[114] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[116] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[117] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[118] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[122] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[123] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[124] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[126] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[130] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[131] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[134] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[137] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[138] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[142] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[143] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[144] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[148] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[151] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[152] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[154] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[155] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[157] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[158] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[159] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[160] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[161] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[162] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[165] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[170] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[172] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[173] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[176] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[177] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[178] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[179] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[180] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[182] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[183] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[184] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[185] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[188] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[189] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[196] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[203] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[212] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[214] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[216] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[217] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[218] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[221] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[224] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[226] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[227] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[230] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[232] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[235] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[236] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[239] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[240] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[241] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[244] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[245] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[247] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[248] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[252] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[255] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[256] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[259] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[262] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[263] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[264] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[265] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[266] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[267] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[269] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[272] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[277] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[278] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[280] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[281] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[283] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[290] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[291] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[293] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[294] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[296] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[300] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[301] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[302] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[303] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[306] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[307] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[308] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[314] = 0;
}
if (! _$jscoverage['/io/xhr-transport-base.js'].functionData) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData = [];
  _$jscoverage['/io/xhr-transport-base.js'].functionData[0] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[1] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[2] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[3] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[4] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[5] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[6] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[7] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[8] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[9] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[10] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[11] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[12] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[13] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[14] = 0;
}
if (! _$jscoverage['/io/xhr-transport-base.js'].branchData) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData = {};
  _$jscoverage['/io/xhr-transport-base.js'].branchData['12'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['12'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['26'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['34'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['42'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['42'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['46'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['46'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['56'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['62'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['64'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['86'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['93'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['114'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['116'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['117'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['130'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['137'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['142'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['148'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['148'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['151'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['154'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['160'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['172'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['172'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['176'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['214'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['214'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['216'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['224'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['226'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['235'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['239'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['244'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['247'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['255'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['262'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['264'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['266'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['290'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['290'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['293'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['300'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['301'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['307'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['308'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['308'][1] = new BranchData();
}
_$jscoverage['/io/xhr-transport-base.js'].branchData['308'][1].init(37, 28, 'e.message || \'process error\'');
function visit182_308_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['307'][1].init(278, 6, '!abort');
function visit181_307_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['301'][1].init(67, 9, '\'@DEBUG@\'');
function visit180_301_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['300'][1].init(23, 12, 'e.stack || e');
function visit179_300_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['293'][1].init(3227, 27, 'status === NO_CONTENT_CODE2');
function visit178_293_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['290'][2].init(2990, 28, 'IO.isLocal && !c.crossDomain');
function visit177_290_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['290'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['290'][1].init(2979, 39, '!status && IO.isLocal && !c.crossDomain');
function visit176_290_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['266'][1].init(114, 20, 'lastBodyIndex === -1');
function visit175_266_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['264'][1].init(92, 42, '(bodyIndex = text.indexOf(\'<body>\')) !== -1');
function visit174_264_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['262'][1].init(1452, 15, 'c.files && text');
function visit173_262_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['255'][1].init(1169, 26, 'xml && xml.documentElement');
function visit172_255_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['247'][1].init(513, 4, 'eTag');
function visit171_247_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['244'][1].init(353, 12, 'lastModified');
function visit170_244_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['239'][1].init(385, 13, 'ifModifiedKey');
function visit169_239_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['235'][1].init(198, 38, '!isInstanceOfXDomainRequest(nativeXhr)');
function visit168_235_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['226'][1].init(72, 26, 'nativeXhr.readyState !== 4');
function visit167_226_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['224'][1].init(424, 5, 'abort');
function visit166_224_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['216'][1].init(77, 37, 'isInstanceOfXDomainRequest(nativeXhr)');
function visit165_216_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['214'][2].init(66, 26, 'nativeXhr.readyState === 4');
function visit164_214_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['214'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['214'][1].init(57, 35, 'abort || nativeXhr.readyState === 4');
function visit163_214_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['176'][1].init(64, 37, 'isInstanceOfXDomainRequest(nativeXhr)');
function visit162_176_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['172'][2].init(3451, 26, 'nativeXhr.readyState === 4');
function visit161_172_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['172'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['172'][1].init(3441, 36, '!async || nativeXhr.readyState === 4');
function visit160_172_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['160'][1].init(25, 13, 'S.isArray(vs)');
function visit159_160_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['154'][1].init(107, 19, 'originalSentContent');
function visit158_154_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['151'][1].init(2688, 5, 'files');
function visit157_151_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['148'][2].init(2594, 22, 'c.hasContent && c.data');
function visit156_148_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['148'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['148'][1].init(2594, 30, 'c.hasContent && c.data || null');
function visit155_148_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['142'][1].init(2362, 49, 'typeof nativeXhr.setRequestHeader !== \'undefined\'');
function visit154_142_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['137'][1].init(2174, 24, 'xRequestHeader === false');
function visit153_137_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['130'][1].init(1962, 38, 'mimeType && nativeXhr.overrideMimeType');
function visit152_130_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['117'][1].init(21, 12, '!supportCORS');
function visit151_117_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['116'][1].init(1533, 30, '\'withCredentials\' in xhrFields');
function visit150_116_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['114'][1].init(1497, 17, 'c.xhrFields || {}');
function visit149_114_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['93'][1].init(560, 13, 'ifModifiedKey');
function visit148_93_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['86'][1].init(334, 23, 'io.requestHeaders || {}');
function visit147_86_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['64'][1].init(52, 17, 'c.cache === false');
function visit146_64_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['62'][1].init(79, 10, 'ifModified');
function visit145_62_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['56'][1].init(16, 51, 'XDomainRequest_ && (xhr instanceof XDomainRequest_)');
function visit144_56_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['46'][2].init(194, 53, '!IO.isLocal && createStandardXHR(crossDomain, refWin)');
function visit143_46_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['46'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['46'][1].init(194, 105, '!IO.isLocal && createStandardXHR(crossDomain, refWin) || createActiveXHR(crossDomain, refWin)');
function visit142_46_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['42'][2].init(54, 30, 'crossDomain && XDomainRequest_');
function visit141_42_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['42'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['42'][1].init(38, 46, '!supportCORS && crossDomain && XDomainRequest_');
function visit140_42_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['34'][1].init(25, 13, 'refWin || win');
function visit139_34_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['26'][1].init(25, 13, 'refWin || win');
function visit138_26_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['12'][2].init(140, 15, 'S.UA.ieMode > 7');
function visit137_12_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['12'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['12'][1].init(140, 37, 'S.UA.ieMode > 7 && win.XDomainRequest');
function visit136_12_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[0]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[7]++;
  var IO = require('./base');
  _$jscoverage['/io/xhr-transport-base.js'].lineData[8]++;
  var logger = S.getLogger('s/io');
  _$jscoverage['/io/xhr-transport-base.js'].lineData[9]++;
  var OK_CODE = 200, win = S.Env.host, XDomainRequest_ = visit136_12_1(visit137_12_2(S.UA.ieMode > 7) && win.XDomainRequest), NO_CONTENT_CODE = 204, NOT_FOUND_CODE = 404, NO_CONTENT_CODE2 = 1223, XhrTransportBase = {
  proto: {}}, lastModifiedCached = {}, eTagCached = {};
  _$jscoverage['/io/xhr-transport-base.js'].lineData[21]++;
  IO.__lastModifiedCached = lastModifiedCached;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[22]++;
  IO.__eTagCached = eTagCached;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[24]++;
  function createStandardXHR(_, refWin) {
    _$jscoverage['/io/xhr-transport-base.js'].functionData[1]++;
    _$jscoverage['/io/xhr-transport-base.js'].lineData[25]++;
    try {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[26]++;
      return new (visit138_26_1(refWin || win)).XMLHttpRequest();
    }    catch (e) {
}
    _$jscoverage['/io/xhr-transport-base.js'].lineData[29]++;
    return undefined;
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[32]++;
  function createActiveXHR(_, refWin) {
    _$jscoverage['/io/xhr-transport-base.js'].functionData[2]++;
    _$jscoverage['/io/xhr-transport-base.js'].lineData[33]++;
    try {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[34]++;
      return new (visit139_34_1(refWin || win)).ActiveXObject('Microsoft.XMLHTTP');
    }    catch (e) {
}
    _$jscoverage['/io/xhr-transport-base.js'].lineData[37]++;
    return undefined;
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[40]++;
  XhrTransportBase.nativeXhr = win.ActiveXObject ? function(crossDomain, refWin) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[3]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[42]++;
  if (visit140_42_1(!supportCORS && visit141_42_2(crossDomain && XDomainRequest_))) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[43]++;
    return new XDomainRequest_();
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[46]++;
  return visit142_46_1(visit143_46_2(!IO.isLocal && createStandardXHR(crossDomain, refWin)) || createActiveXHR(crossDomain, refWin));
} : createStandardXHR;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[50]++;
  XhrTransportBase.XDomainRequest_ = XDomainRequest_;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[52]++;
  var supportCORS = XhrTransportBase.supportCORS = ('withCredentials' in XhrTransportBase.nativeXhr());
  _$jscoverage['/io/xhr-transport-base.js'].lineData[55]++;
  function isInstanceOfXDomainRequest(xhr) {
    _$jscoverage['/io/xhr-transport-base.js'].functionData[4]++;
    _$jscoverage['/io/xhr-transport-base.js'].lineData[56]++;
    return visit144_56_1(XDomainRequest_ && (xhr instanceof XDomainRequest_));
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[59]++;
  function getIfModifiedKey(c) {
    _$jscoverage['/io/xhr-transport-base.js'].functionData[5]++;
    _$jscoverage['/io/xhr-transport-base.js'].lineData[60]++;
    var ifModified = c.ifModified, ifModifiedKey;
    _$jscoverage['/io/xhr-transport-base.js'].lineData[62]++;
    if (visit145_62_1(ifModified)) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[63]++;
      ifModifiedKey = c.uri;
      _$jscoverage['/io/xhr-transport-base.js'].lineData[64]++;
      if (visit146_64_1(c.cache === false)) {
        _$jscoverage['/io/xhr-transport-base.js'].lineData[65]++;
        ifModifiedKey = ifModifiedKey.clone();
        _$jscoverage['/io/xhr-transport-base.js'].lineData[68]++;
        ifModifiedKey.query.remove('_ksTS');
      }
      _$jscoverage['/io/xhr-transport-base.js'].lineData[70]++;
      ifModifiedKey = ifModifiedKey.toString();
    }
    _$jscoverage['/io/xhr-transport-base.js'].lineData[72]++;
    return ifModifiedKey;
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[75]++;
  S.mix(XhrTransportBase.proto, {
  sendInternal: function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[6]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[77]++;
  var self = this, io = self.io, c = io.config, nativeXhr = self.nativeXhr, files = c.files, type = files ? 'post' : c.type, async = c.async, username, mimeType = io.mimeType, requestHeaders = visit147_86_1(io.requestHeaders || {}), url = io._getUrlForSend(), xhrFields, ifModifiedKey = getIfModifiedKey(c), cacheValue, i;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[93]++;
  if (visit148_93_1(ifModifiedKey)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[100]++;
    if ((cacheValue = lastModifiedCached[ifModifiedKey])) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[101]++;
      requestHeaders['If-Modified-Since'] = cacheValue;
    }
    _$jscoverage['/io/xhr-transport-base.js'].lineData[103]++;
    if ((cacheValue = eTagCached[ifModifiedKey])) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[104]++;
      requestHeaders['If-None-Match'] = cacheValue;
    }
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[108]++;
  if ((username = c.username)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[109]++;
    nativeXhr.open(type, url, async, username, c.password);
  } else {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[111]++;
    nativeXhr.open(type, url, async);
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[114]++;
  xhrFields = visit149_114_1(c.xhrFields || {});
  _$jscoverage['/io/xhr-transport-base.js'].lineData[116]++;
  if (visit150_116_1('withCredentials' in xhrFields)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[117]++;
    if (visit151_117_1(!supportCORS)) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[118]++;
      delete xhrFields.withCredentials;
    }
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[122]++;
  for (i in xhrFields) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[123]++;
    try {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[124]++;
      nativeXhr[i] = xhrFields[i];
    }    catch (e) {
  _$jscoverage['/io/xhr-transport-base.js'].lineData[126]++;
  logger.error(e);
}
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[130]++;
  if (visit152_130_1(mimeType && nativeXhr.overrideMimeType)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[131]++;
    nativeXhr.overrideMimeType(mimeType);
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[134]++;
  var xRequestHeader = requestHeaders['X-Requested-With'];
  _$jscoverage['/io/xhr-transport-base.js'].lineData[137]++;
  if (visit153_137_1(xRequestHeader === false)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[138]++;
    delete requestHeaders['X-Requested-With'];
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[142]++;
  if (visit154_142_1(typeof nativeXhr.setRequestHeader !== 'undefined')) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[143]++;
    for (i in requestHeaders) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[144]++;
      nativeXhr.setRequestHeader(i, requestHeaders[i]);
    }
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[148]++;
  var sendContent = visit155_148_1(visit156_148_2(c.hasContent && c.data) || null);
  _$jscoverage['/io/xhr-transport-base.js'].lineData[151]++;
  if (visit157_151_1(files)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[152]++;
    var originalSentContent = sendContent, data = {};
    _$jscoverage['/io/xhr-transport-base.js'].lineData[154]++;
    if (visit158_154_1(originalSentContent)) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[155]++;
      data = S.unparam(originalSentContent);
    }
    _$jscoverage['/io/xhr-transport-base.js'].lineData[157]++;
    data = S.mix(data, files);
    _$jscoverage['/io/xhr-transport-base.js'].lineData[158]++;
    sendContent = new FormData();
    _$jscoverage['/io/xhr-transport-base.js'].lineData[159]++;
    S.each(data, function(vs, k) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[7]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[160]++;
  if (visit159_160_1(S.isArray(vs))) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[161]++;
    S.each(vs, function(v) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[8]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[162]++;
  sendContent.append(k + (c.serializeArray ? '[]' : ''), v);
});
  } else {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[165]++;
    sendContent.append(k, vs);
  }
});
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[170]++;
  nativeXhr.send(sendContent);
  _$jscoverage['/io/xhr-transport-base.js'].lineData[172]++;
  if (visit160_172_1(!async || visit161_172_2(nativeXhr.readyState === 4))) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[173]++;
    self._callback();
  } else {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[176]++;
    if (visit162_176_1(isInstanceOfXDomainRequest(nativeXhr))) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[177]++;
      nativeXhr.onload = function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[9]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[178]++;
  nativeXhr.readyState = 4;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[179]++;
  nativeXhr.status = 200;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[180]++;
  self._callback();
};
      _$jscoverage['/io/xhr-transport-base.js'].lineData[182]++;
      nativeXhr.onerror = function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[10]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[183]++;
  nativeXhr.readyState = 4;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[184]++;
  nativeXhr.status = 500;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[185]++;
  self._callback();
};
    } else {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[188]++;
      nativeXhr.onreadystatechange = function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[11]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[189]++;
  self._callback();
};
    }
  }
}, 
  abort: function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[12]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[196]++;
  this._callback(0, 1);
}, 
  _callback: function(event, abort) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[13]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[203]++;
  var self = this, nativeXhr = self.nativeXhr, io = self.io, ifModifiedKey, lastModified, eTag, statusText, xml, c = io.config;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[212]++;
  try {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[214]++;
    if (visit163_214_1(abort || visit164_214_2(nativeXhr.readyState === 4))) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[216]++;
      if (visit165_216_1(isInstanceOfXDomainRequest(nativeXhr))) {
        _$jscoverage['/io/xhr-transport-base.js'].lineData[217]++;
        nativeXhr.onerror = S.noop;
        _$jscoverage['/io/xhr-transport-base.js'].lineData[218]++;
        nativeXhr.onload = S.noop;
      } else {
        _$jscoverage['/io/xhr-transport-base.js'].lineData[221]++;
        nativeXhr.onreadystatechange = S.noop;
      }
      _$jscoverage['/io/xhr-transport-base.js'].lineData[224]++;
      if (visit166_224_1(abort)) {
        _$jscoverage['/io/xhr-transport-base.js'].lineData[226]++;
        if (visit167_226_1(nativeXhr.readyState !== 4)) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[227]++;
          nativeXhr.abort();
        }
      } else {
        _$jscoverage['/io/xhr-transport-base.js'].lineData[230]++;
        ifModifiedKey = getIfModifiedKey(c);
        _$jscoverage['/io/xhr-transport-base.js'].lineData[232]++;
        var status = nativeXhr.status;
        _$jscoverage['/io/xhr-transport-base.js'].lineData[235]++;
        if (visit168_235_1(!isInstanceOfXDomainRequest(nativeXhr))) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[236]++;
          io.responseHeadersString = nativeXhr.getAllResponseHeaders();
        }
        _$jscoverage['/io/xhr-transport-base.js'].lineData[239]++;
        if (visit169_239_1(ifModifiedKey)) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[240]++;
          lastModified = nativeXhr.getResponseHeader('Last-Modified');
          _$jscoverage['/io/xhr-transport-base.js'].lineData[241]++;
          eTag = nativeXhr.getResponseHeader('ETag');
          _$jscoverage['/io/xhr-transport-base.js'].lineData[244]++;
          if (visit170_244_1(lastModified)) {
            _$jscoverage['/io/xhr-transport-base.js'].lineData[245]++;
            lastModifiedCached[ifModifiedKey] = lastModified;
          }
          _$jscoverage['/io/xhr-transport-base.js'].lineData[247]++;
          if (visit171_247_1(eTag)) {
            _$jscoverage['/io/xhr-transport-base.js'].lineData[248]++;
            eTagCached[eTag] = eTag;
          }
        }
        _$jscoverage['/io/xhr-transport-base.js'].lineData[252]++;
        xml = nativeXhr.responseXML;
        _$jscoverage['/io/xhr-transport-base.js'].lineData[255]++;
        if (visit172_255_1(xml && xml.documentElement)) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[256]++;
          io.responseXML = xml;
        }
        _$jscoverage['/io/xhr-transport-base.js'].lineData[259]++;
        var text = io.responseText = nativeXhr.responseText;
        _$jscoverage['/io/xhr-transport-base.js'].lineData[262]++;
        if (visit173_262_1(c.files && text)) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[263]++;
          var bodyIndex, lastBodyIndex;
          _$jscoverage['/io/xhr-transport-base.js'].lineData[264]++;
          if (visit174_264_1((bodyIndex = text.indexOf('<body>')) !== -1)) {
            _$jscoverage['/io/xhr-transport-base.js'].lineData[265]++;
            lastBodyIndex = text.lastIndexOf('</body>');
            _$jscoverage['/io/xhr-transport-base.js'].lineData[266]++;
            if (visit175_266_1(lastBodyIndex === -1)) {
              _$jscoverage['/io/xhr-transport-base.js'].lineData[267]++;
              lastBodyIndex = text.length;
            }
            _$jscoverage['/io/xhr-transport-base.js'].lineData[269]++;
            text = text.slice(bodyIndex + 6, lastBodyIndex);
          }
          _$jscoverage['/io/xhr-transport-base.js'].lineData[272]++;
          io.responseText = S.unEscapeHtml(text);
        }
        _$jscoverage['/io/xhr-transport-base.js'].lineData[277]++;
        try {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[278]++;
          statusText = nativeXhr.statusText;
        }        catch (e) {
  _$jscoverage['/io/xhr-transport-base.js'].lineData[280]++;
  logger.error('xhr statusText error: ');
  _$jscoverage['/io/xhr-transport-base.js'].lineData[281]++;
  logger.error(e);
  _$jscoverage['/io/xhr-transport-base.js'].lineData[283]++;
  statusText = '';
}
        _$jscoverage['/io/xhr-transport-base.js'].lineData[290]++;
        if (visit176_290_1(!status && visit177_290_2(IO.isLocal && !c.crossDomain))) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[291]++;
          status = io.responseText ? OK_CODE : NOT_FOUND_CODE;
        } else {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[293]++;
          if (visit178_293_1(status === NO_CONTENT_CODE2)) {
            _$jscoverage['/io/xhr-transport-base.js'].lineData[294]++;
            status = NO_CONTENT_CODE;
          }
        }
        _$jscoverage['/io/xhr-transport-base.js'].lineData[296]++;
        io._ioReady(status, statusText);
      }
    }
  }  catch (e) {
  _$jscoverage['/io/xhr-transport-base.js'].lineData[300]++;
  S.log(visit179_300_1(e.stack || e), 'error');
  _$jscoverage['/io/xhr-transport-base.js'].lineData[301]++;
  if (visit180_301_1('@DEBUG@')) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[302]++;
    setTimeout(function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[14]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[303]++;
  throw e;
}, 0);
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[306]++;
  nativeXhr.onreadystatechange = S.noop;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[307]++;
  if (visit181_307_1(!abort)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[308]++;
    io._ioReady(-1, visit182_308_1(e.message || 'process error'));
  }
}
}});
  _$jscoverage['/io/xhr-transport-base.js'].lineData[314]++;
  return XhrTransportBase;
});
