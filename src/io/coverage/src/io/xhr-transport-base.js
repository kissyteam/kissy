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
  _$jscoverage['/io/xhr-transport-base.js'].lineData[20] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[21] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[23] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[24] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[25] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[28] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[31] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[32] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[33] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[36] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[39] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[41] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[42] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[45] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[49] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[51] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[54] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[55] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[58] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[59] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[61] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[62] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[63] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[64] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[67] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[69] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[71] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[74] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[76] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[92] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[99] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[100] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[102] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[103] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[107] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[110] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[111] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[112] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[116] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[117] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[119] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[122] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[123] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[124] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[126] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[130] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[131] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[134] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[136] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[137] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[141] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[142] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[143] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[147] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[150] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[151] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[153] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[154] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[156] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[157] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[158] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[159] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[160] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[161] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[164] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[169] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[171] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[172] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[175] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[176] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[177] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[178] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[179] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[181] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[182] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[183] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[184] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[187] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[188] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[195] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[202] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[211] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[213] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[215] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[216] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[217] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[220] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[223] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[225] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[226] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[229] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[231] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[234] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[235] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[238] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[239] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[240] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[243] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[244] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[246] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[247] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[251] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[254] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[255] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[258] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[261] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[262] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[263] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[264] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[265] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[266] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[268] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[271] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[276] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[277] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[279] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[280] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[282] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[289] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[290] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[292] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[293] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[296] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[301] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[302] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[304] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[305] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[306] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[313] = 0;
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
  _$jscoverage['/io/xhr-transport-base.js'].branchData['11'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['11'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['25'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['33'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['41'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['41'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['45'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['45'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['55'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['61'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['63'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['85'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['92'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['99'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['102'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['107'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['110'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['111'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['116'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['130'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['136'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['141'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['147'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['147'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['150'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['153'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['159'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['171'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['171'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['175'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['213'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['213'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['215'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['223'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['225'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['234'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['238'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['243'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['246'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['254'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['261'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['263'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['265'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['289'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['289'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['292'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['305'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['305'][1] = new BranchData();
}
_$jscoverage['/io/xhr-transport-base.js'].branchData['305'][1].init(214, 6, '!abort');
function visit189_305_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['292'][1].init(3289, 27, 'status === NO_CONTENT_CODE2');
function visit188_292_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['289'][2].init(3049, 28, 'IO.isLocal && !c.crossDomain');
function visit187_289_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['289'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['289'][1].init(3038, 39, '!status && IO.isLocal && !c.crossDomain');
function visit186_289_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['265'][1].init(116, 19, 'lastBodyIndex == -1');
function visit185_265_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['263'][1].init(94, 41, '(bodyIndex = text.indexOf(\'<body>\')) != -1');
function visit184_263_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['261'][1].init(1485, 15, 'c.files && text');
function visit183_261_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['254'][1].init(1195, 26, 'xml && xml.documentElement');
function visit182_254_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['246'][1].init(521, 4, 'eTag');
function visit181_246_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['243'][1].init(358, 12, 'lastModified');
function visit180_243_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['238'][1].init(395, 13, 'ifModifiedKey');
function visit179_238_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['234'][1].init(204, 38, '!isInstanceOfXDomainRequest(nativeXhr)');
function visit178_234_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['225'][1].init(74, 26, 'nativeXhr.readyState !== 4');
function visit177_225_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['223'][1].init(434, 5, 'abort');
function visit176_223_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['215'][1].init(79, 37, 'isInstanceOfXDomainRequest(nativeXhr)');
function visit175_215_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['213'][2].init(68, 25, 'nativeXhr.readyState == 4');
function visit174_213_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['213'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['213'][1].init(59, 34, 'abort || nativeXhr.readyState == 4');
function visit173_213_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['175'][1].init(66, 37, 'isInstanceOfXDomainRequest(nativeXhr)');
function visit172_175_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['171'][2].init(3577, 25, 'nativeXhr.readyState == 4');
function visit171_171_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['171'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['171'][1].init(3567, 35, '!async || nativeXhr.readyState == 4');
function visit170_171_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['159'][1].init(26, 13, 'S.isArray(vs)');
function visit169_159_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['153'][1].init(110, 19, 'originalSentContent');
function visit168_153_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['150'][1].init(2793, 5, 'files');
function visit167_150_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['147'][2].init(2696, 22, 'c.hasContent && c.data');
function visit166_147_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['147'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['147'][1].init(2696, 30, 'c.hasContent && c.data || null');
function visit165_147_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['141'][1].init(2458, 49, 'typeof nativeXhr.setRequestHeader !== \'undefined\'');
function visit164_141_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['136'][1].init(2265, 24, 'xRequestHeader === false');
function visit163_136_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['130'][1].init(2062, 38, 'mimeType && nativeXhr.overrideMimeType');
function visit162_130_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['116'][1].init(1591, 24, 'username = c[\'username\']');
function visit161_116_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['111'][1].init(22, 12, '!supportCORS');
function visit160_111_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['110'][1].init(1412, 30, '\'withCredentials\' in xhrFields');
function visit159_110_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['107'][1].init(1324, 20, 'c[\'xhrFields\'] || {}');
function visit158_107_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['102'][1].init(561, 38, 'cacheValue = eTagCached[ifModifiedKey]');
function visit157_102_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['99'][1].init(400, 46, 'cacheValue = lastModifiedCached[ifModifiedKey]');
function visit156_99_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['92'][1].init(577, 13, 'ifModifiedKey');
function visit155_92_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['85'][1].init(343, 23, 'io.requestHeaders || {}');
function visit154_85_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['63'][1].init(54, 17, 'c.cache === false');
function visit153_63_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['61'][1].init(82, 10, 'ifModified');
function visit152_61_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['55'][1].init(17, 51, '_XDomainRequest && (xhr instanceof _XDomainRequest)');
function visit151_55_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['45'][2].init(200, 53, '!IO.isLocal && createStandardXHR(crossDomain, refWin)');
function visit150_45_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['45'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['45'][1].init(200, 106, '!IO.isLocal && createStandardXHR(crossDomain, refWin) || createActiveXHR(crossDomain, refWin)');
function visit149_45_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['41'][2].init(56, 30, 'crossDomain && _XDomainRequest');
function visit148_41_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['41'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['41'][1].init(40, 46, '!supportCORS && crossDomain && _XDomainRequest');
function visit147_41_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['33'][1].init(26, 13, 'refWin || win');
function visit146_33_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['25'][1].init(26, 13, 'refWin || win');
function visit145_25_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['11'][2].init(182, 11, 'S.UA.ie > 7');
function visit144_11_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['11'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['11'][1].init(182, 36, 'S.UA.ie > 7 && win[\'XDomainRequest\']');
function visit143_11_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].lineData[6]++;
KISSY.add('io/xhr-transport-base', function(S, IO) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[0]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[7]++;
  var OK_CODE = 200, win = S.Env.host, logger = S.getLogger('s/io'), _XDomainRequest = visit143_11_1(visit144_11_2(S.UA.ie > 7) && win['XDomainRequest']), NO_CONTENT_CODE = 204, NOT_FOUND_CODE = 404, NO_CONTENT_CODE2 = 1223, XhrTransportBase = {
  proto: {}}, lastModifiedCached = {}, eTagCached = {};
  _$jscoverage['/io/xhr-transport-base.js'].lineData[20]++;
  IO.__lastModifiedCached = lastModifiedCached;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[21]++;
  IO.__eTagCached = eTagCached;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[23]++;
  function createStandardXHR(_, refWin) {
    _$jscoverage['/io/xhr-transport-base.js'].functionData[1]++;
    _$jscoverage['/io/xhr-transport-base.js'].lineData[24]++;
    try {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[25]++;
      return new (visit145_25_1(refWin || win))['XMLHttpRequest']();
    }    catch (e) {
}
    _$jscoverage['/io/xhr-transport-base.js'].lineData[28]++;
    return undefined;
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[31]++;
  function createActiveXHR(_, refWin) {
    _$jscoverage['/io/xhr-transport-base.js'].functionData[2]++;
    _$jscoverage['/io/xhr-transport-base.js'].lineData[32]++;
    try {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[33]++;
      return new (visit146_33_1(refWin || win))['ActiveXObject']('Microsoft.XMLHTTP');
    }    catch (e) {
}
    _$jscoverage['/io/xhr-transport-base.js'].lineData[36]++;
    return undefined;
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[39]++;
  XhrTransportBase.nativeXhr = win['ActiveXObject'] ? function(crossDomain, refWin) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[3]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[41]++;
  if (visit147_41_1(!supportCORS && visit148_41_2(crossDomain && _XDomainRequest))) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[42]++;
    return new _XDomainRequest();
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[45]++;
  return visit149_45_1(visit150_45_2(!IO.isLocal && createStandardXHR(crossDomain, refWin)) || createActiveXHR(crossDomain, refWin));
} : createStandardXHR;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[49]++;
  XhrTransportBase._XDomainRequest = _XDomainRequest;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[51]++;
  var supportCORS = XhrTransportBase.supportCORS = ('withCredentials' in XhrTransportBase.nativeXhr());
  _$jscoverage['/io/xhr-transport-base.js'].lineData[54]++;
  function isInstanceOfXDomainRequest(xhr) {
    _$jscoverage['/io/xhr-transport-base.js'].functionData[4]++;
    _$jscoverage['/io/xhr-transport-base.js'].lineData[55]++;
    return visit151_55_1(_XDomainRequest && (xhr instanceof _XDomainRequest));
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[58]++;
  function getIfModifiedKey(c) {
    _$jscoverage['/io/xhr-transport-base.js'].functionData[5]++;
    _$jscoverage['/io/xhr-transport-base.js'].lineData[59]++;
    var ifModified = c.ifModified, ifModifiedKey;
    _$jscoverage['/io/xhr-transport-base.js'].lineData[61]++;
    if (visit152_61_1(ifModified)) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[62]++;
      ifModifiedKey = c.uri;
      _$jscoverage['/io/xhr-transport-base.js'].lineData[63]++;
      if (visit153_63_1(c.cache === false)) {
        _$jscoverage['/io/xhr-transport-base.js'].lineData[64]++;
        ifModifiedKey = ifModifiedKey.clone();
        _$jscoverage['/io/xhr-transport-base.js'].lineData[67]++;
        ifModifiedKey.query.remove('_ksTS');
      }
      _$jscoverage['/io/xhr-transport-base.js'].lineData[69]++;
      ifModifiedKey = ifModifiedKey.toString();
    }
    _$jscoverage['/io/xhr-transport-base.js'].lineData[71]++;
    return ifModifiedKey;
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[74]++;
  S.mix(XhrTransportBase.proto, {
  sendInternal: function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[6]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[76]++;
  var self = this, io = self.io, c = io.config, nativeXhr = self.nativeXhr, files = c.files, type = files ? 'post' : c.type, async = c.async, username, mimeType = io.mimeType, requestHeaders = visit154_85_1(io.requestHeaders || {}), url = io._getUrlForSend(), xhrFields, ifModifiedKey = getIfModifiedKey(c), cacheValue, i;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[92]++;
  if (visit155_92_1(ifModifiedKey)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[99]++;
    if (visit156_99_1(cacheValue = lastModifiedCached[ifModifiedKey])) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[100]++;
      requestHeaders['If-Modified-Since'] = cacheValue;
    }
    _$jscoverage['/io/xhr-transport-base.js'].lineData[102]++;
    if (visit157_102_1(cacheValue = eTagCached[ifModifiedKey])) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[103]++;
      requestHeaders['If-None-Match'] = cacheValue;
    }
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[107]++;
  xhrFields = visit158_107_1(c['xhrFields'] || {});
  _$jscoverage['/io/xhr-transport-base.js'].lineData[110]++;
  if (visit159_110_1('withCredentials' in xhrFields)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[111]++;
    if (visit160_111_1(!supportCORS)) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[112]++;
      delete xhrFields.withCredentials;
    }
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[116]++;
  if (visit161_116_1(username = c['username'])) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[117]++;
    nativeXhr.open(type, url, async, username, c.password);
  } else {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[119]++;
    nativeXhr.open(type, url, async);
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
  if (visit162_130_1(mimeType && nativeXhr.overrideMimeType)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[131]++;
    nativeXhr.overrideMimeType(mimeType);
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[134]++;
  var xRequestHeader = requestHeaders['X-Requested-With'];
  _$jscoverage['/io/xhr-transport-base.js'].lineData[136]++;
  if (visit163_136_1(xRequestHeader === false)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[137]++;
    delete requestHeaders['X-Requested-With'];
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[141]++;
  if (visit164_141_1(typeof nativeXhr.setRequestHeader !== 'undefined')) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[142]++;
    for (i in requestHeaders) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[143]++;
      nativeXhr.setRequestHeader(i, requestHeaders[i]);
    }
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[147]++;
  var sendContent = visit165_147_1(visit166_147_2(c.hasContent && c.data) || null);
  _$jscoverage['/io/xhr-transport-base.js'].lineData[150]++;
  if (visit167_150_1(files)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[151]++;
    var originalSentContent = sendContent, data = {};
    _$jscoverage['/io/xhr-transport-base.js'].lineData[153]++;
    if (visit168_153_1(originalSentContent)) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[154]++;
      data = S.unparam(originalSentContent);
    }
    _$jscoverage['/io/xhr-transport-base.js'].lineData[156]++;
    data = S.mix(data, files);
    _$jscoverage['/io/xhr-transport-base.js'].lineData[157]++;
    sendContent = new FormData();
    _$jscoverage['/io/xhr-transport-base.js'].lineData[158]++;
    S.each(data, function(vs, k) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[7]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[159]++;
  if (visit169_159_1(S.isArray(vs))) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[160]++;
    S.each(vs, function(v) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[8]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[161]++;
  sendContent.append(k + (c.serializeArray ? '[]' : ''), v);
});
  } else {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[164]++;
    sendContent.append(k, vs);
  }
});
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[169]++;
  nativeXhr.send(sendContent);
  _$jscoverage['/io/xhr-transport-base.js'].lineData[171]++;
  if (visit170_171_1(!async || visit171_171_2(nativeXhr.readyState == 4))) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[172]++;
    self._callback();
  } else {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[175]++;
    if (visit172_175_1(isInstanceOfXDomainRequest(nativeXhr))) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[176]++;
      nativeXhr.onload = function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[9]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[177]++;
  nativeXhr.readyState = 4;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[178]++;
  nativeXhr.status = 200;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[179]++;
  self._callback();
};
      _$jscoverage['/io/xhr-transport-base.js'].lineData[181]++;
      nativeXhr.onerror = function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[10]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[182]++;
  nativeXhr.readyState = 4;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[183]++;
  nativeXhr.status = 500;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[184]++;
  self._callback();
};
    } else {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[187]++;
      nativeXhr.onreadystatechange = function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[11]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[188]++;
  self._callback();
};
    }
  }
}, 
  abort: function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[12]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[195]++;
  this._callback(0, 1);
}, 
  _callback: function(event, abort) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[13]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[202]++;
  var self = this, nativeXhr = self.nativeXhr, io = self.io, ifModifiedKey, lastModified, eTag, statusText, xml, c = io.config;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[211]++;
  try {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[213]++;
    if (visit173_213_1(abort || visit174_213_2(nativeXhr.readyState == 4))) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[215]++;
      if (visit175_215_1(isInstanceOfXDomainRequest(nativeXhr))) {
        _$jscoverage['/io/xhr-transport-base.js'].lineData[216]++;
        nativeXhr.onerror = S.noop;
        _$jscoverage['/io/xhr-transport-base.js'].lineData[217]++;
        nativeXhr.onload = S.noop;
      } else {
        _$jscoverage['/io/xhr-transport-base.js'].lineData[220]++;
        nativeXhr.onreadystatechange = S.noop;
      }
      _$jscoverage['/io/xhr-transport-base.js'].lineData[223]++;
      if (visit176_223_1(abort)) {
        _$jscoverage['/io/xhr-transport-base.js'].lineData[225]++;
        if (visit177_225_1(nativeXhr.readyState !== 4)) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[226]++;
          nativeXhr.abort();
        }
      } else {
        _$jscoverage['/io/xhr-transport-base.js'].lineData[229]++;
        ifModifiedKey = getIfModifiedKey(c);
        _$jscoverage['/io/xhr-transport-base.js'].lineData[231]++;
        var status = nativeXhr.status;
        _$jscoverage['/io/xhr-transport-base.js'].lineData[234]++;
        if (visit178_234_1(!isInstanceOfXDomainRequest(nativeXhr))) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[235]++;
          io.responseHeadersString = nativeXhr.getAllResponseHeaders();
        }
        _$jscoverage['/io/xhr-transport-base.js'].lineData[238]++;
        if (visit179_238_1(ifModifiedKey)) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[239]++;
          lastModified = nativeXhr.getResponseHeader('Last-Modified');
          _$jscoverage['/io/xhr-transport-base.js'].lineData[240]++;
          eTag = nativeXhr.getResponseHeader('ETag');
          _$jscoverage['/io/xhr-transport-base.js'].lineData[243]++;
          if (visit180_243_1(lastModified)) {
            _$jscoverage['/io/xhr-transport-base.js'].lineData[244]++;
            lastModifiedCached[ifModifiedKey] = lastModified;
          }
          _$jscoverage['/io/xhr-transport-base.js'].lineData[246]++;
          if (visit181_246_1(eTag)) {
            _$jscoverage['/io/xhr-transport-base.js'].lineData[247]++;
            eTagCached[eTag] = eTag;
          }
        }
        _$jscoverage['/io/xhr-transport-base.js'].lineData[251]++;
        xml = nativeXhr.responseXML;
        _$jscoverage['/io/xhr-transport-base.js'].lineData[254]++;
        if (visit182_254_1(xml && xml.documentElement)) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[255]++;
          io.responseXML = xml;
        }
        _$jscoverage['/io/xhr-transport-base.js'].lineData[258]++;
        var text = io.responseText = nativeXhr.responseText;
        _$jscoverage['/io/xhr-transport-base.js'].lineData[261]++;
        if (visit183_261_1(c.files && text)) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[262]++;
          var bodyIndex, lastBodyIndex;
          _$jscoverage['/io/xhr-transport-base.js'].lineData[263]++;
          if (visit184_263_1((bodyIndex = text.indexOf('<body>')) != -1)) {
            _$jscoverage['/io/xhr-transport-base.js'].lineData[264]++;
            lastBodyIndex = text.lastIndexOf('</body>');
            _$jscoverage['/io/xhr-transport-base.js'].lineData[265]++;
            if (visit185_265_1(lastBodyIndex == -1)) {
              _$jscoverage['/io/xhr-transport-base.js'].lineData[266]++;
              lastBodyIndex = text.length;
            }
            _$jscoverage['/io/xhr-transport-base.js'].lineData[268]++;
            text = text.slice(bodyIndex + 6, lastBodyIndex);
          }
          _$jscoverage['/io/xhr-transport-base.js'].lineData[271]++;
          io.responseText = S.unEscapeHtml(text);
        }
        _$jscoverage['/io/xhr-transport-base.js'].lineData[276]++;
        try {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[277]++;
          statusText = nativeXhr.statusText;
        }        catch (e) {
  _$jscoverage['/io/xhr-transport-base.js'].lineData[279]++;
  logger.error('xhr statusText error: ');
  _$jscoverage['/io/xhr-transport-base.js'].lineData[280]++;
  logger.error(e);
  _$jscoverage['/io/xhr-transport-base.js'].lineData[282]++;
  statusText = '';
}
        _$jscoverage['/io/xhr-transport-base.js'].lineData[289]++;
        if (visit186_289_1(!status && visit187_289_2(IO.isLocal && !c.crossDomain))) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[290]++;
          status = io.responseText ? OK_CODE : NOT_FOUND_CODE;
        } else {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[292]++;
          if (visit188_292_1(status === NO_CONTENT_CODE2)) {
            _$jscoverage['/io/xhr-transport-base.js'].lineData[293]++;
            status = NO_CONTENT_CODE;
          }
        }
        _$jscoverage['/io/xhr-transport-base.js'].lineData[296]++;
        io._ioReady(status, statusText);
      }
    }
  }  catch (e) {
  _$jscoverage['/io/xhr-transport-base.js'].lineData[301]++;
  setTimeout(function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[14]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[302]++;
  throw e;
}, 0);
  _$jscoverage['/io/xhr-transport-base.js'].lineData[304]++;
  nativeXhr.onreadystatechange = S.noop;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[305]++;
  if (visit189_305_1(!abort)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[306]++;
    io._ioReady(-1, e);
  }
}
}});
  _$jscoverage['/io/xhr-transport-base.js'].lineData[313]++;
  return XhrTransportBase;
}, {
  requires: ['./base']});
