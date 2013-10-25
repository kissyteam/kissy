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
  _$jscoverage['/io/xhr-transport-base.js'].lineData[114] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[116] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[119] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[120] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[122] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[125] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[126] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[127] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[129] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[133] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[134] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[137] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[139] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[140] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[144] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[145] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[146] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[150] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[153] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[154] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[156] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[157] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[159] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[160] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[161] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[162] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[163] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[164] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[167] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[172] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[174] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[175] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[178] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[179] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[180] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[181] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[182] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[184] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[185] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[186] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[187] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[190] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[191] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[198] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[205] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[214] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[216] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[218] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[219] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[220] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[223] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[226] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[228] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[229] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[232] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[234] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[237] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[238] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[241] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[242] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[243] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[246] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[247] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[249] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[250] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[254] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[257] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[258] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[261] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[264] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[265] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[266] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[267] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[268] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[269] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[271] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[274] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[279] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[280] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[282] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[283] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[285] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[292] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[293] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[295] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[296] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[299] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[303] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[304] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[305] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[312] = 0;
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
  _$jscoverage['/io/xhr-transport-base.js'].branchData['114'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['119'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['133'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['139'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['144'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['150'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['150'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['153'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['156'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['162'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['174'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['174'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['178'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['216'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['216'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['218'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['226'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['228'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['237'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['241'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['246'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['249'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['257'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['264'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['266'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['268'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['292'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['292'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['295'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['304'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['304'][1] = new BranchData();
}
_$jscoverage['/io/xhr-transport-base.js'].branchData['304'][1].init(78, 6, '!abort');
function visit192_304_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['295'][1].init(3289, 27, 'status === NO_CONTENT_CODE2');
function visit191_295_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['292'][2].init(3049, 28, 'IO.isLocal && !c.crossDomain');
function visit190_292_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['292'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['292'][1].init(3038, 39, '!status && IO.isLocal && !c.crossDomain');
function visit189_292_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['268'][1].init(116, 19, 'lastBodyIndex == -1');
function visit188_268_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['266'][1].init(94, 41, '(bodyIndex = text.indexOf(\'<body>\')) != -1');
function visit187_266_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['264'][1].init(1485, 15, 'c.files && text');
function visit186_264_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['257'][1].init(1195, 26, 'xml && xml.documentElement');
function visit185_257_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['249'][1].init(521, 4, 'eTag');
function visit184_249_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['246'][1].init(358, 12, 'lastModified');
function visit183_246_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['241'][1].init(395, 13, 'ifModifiedKey');
function visit182_241_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['237'][1].init(204, 38, '!isInstanceOfXDomainRequest(nativeXhr)');
function visit181_237_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['228'][1].init(74, 26, 'nativeXhr.readyState !== 4');
function visit180_228_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['226'][1].init(434, 5, 'abort');
function visit179_226_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['218'][1].init(79, 37, 'isInstanceOfXDomainRequest(nativeXhr)');
function visit178_218_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['216'][2].init(68, 25, 'nativeXhr.readyState == 4');
function visit177_216_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['216'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['216'][1].init(59, 34, 'abort || nativeXhr.readyState == 4');
function visit176_216_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['178'][1].init(66, 37, 'isInstanceOfXDomainRequest(nativeXhr)');
function visit175_178_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['174'][2].init(3720, 25, 'nativeXhr.readyState == 4');
function visit174_174_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['174'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['174'][1].init(3710, 35, '!async || nativeXhr.readyState == 4');
function visit173_174_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['162'][1].init(26, 13, 'S.isArray(vs)');
function visit172_162_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['156'][1].init(110, 19, 'originalSentContent');
function visit171_156_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['153'][1].init(2936, 5, 'files');
function visit170_153_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['150'][2].init(2839, 22, 'c.hasContent && c.data');
function visit169_150_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['150'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['150'][1].init(2839, 30, 'c.hasContent && c.data || null');
function visit168_150_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['144'][1].init(2601, 49, 'typeof nativeXhr.setRequestHeader !== \'undefined\'');
function visit167_144_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['139'][1].init(2408, 24, 'xRequestHeader === false');
function visit166_139_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['133'][1].init(2205, 38, 'mimeType && nativeXhr.overrideMimeType');
function visit165_133_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['119'][1].init(1734, 24, 'username = c[\'username\']');
function visit164_119_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['114'][1].init(1582, 11, 'supportCORS');
function visit163_114_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['111'][1].init(22, 12, '!supportCORS');
function visit162_111_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['110'][1].init(1412, 30, '\'withCredentials\' in xhrFields');
function visit161_110_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['107'][1].init(1324, 20, 'c[\'xhrFields\'] || {}');
function visit160_107_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['102'][1].init(561, 38, 'cacheValue = eTagCached[ifModifiedKey]');
function visit159_102_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['99'][1].init(400, 46, 'cacheValue = lastModifiedCached[ifModifiedKey]');
function visit158_99_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['92'][1].init(577, 13, 'ifModifiedKey');
function visit157_92_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['85'][1].init(343, 23, 'io.requestHeaders || {}');
function visit156_85_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['63'][1].init(54, 17, 'c.cache === false');
function visit155_63_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['61'][1].init(82, 10, 'ifModified');
function visit154_61_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['55'][1].init(17, 51, '_XDomainRequest && (xhr instanceof _XDomainRequest)');
function visit153_55_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['45'][2].init(200, 53, '!IO.isLocal && createStandardXHR(crossDomain, refWin)');
function visit152_45_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['45'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['45'][1].init(200, 106, '!IO.isLocal && createStandardXHR(crossDomain, refWin) || createActiveXHR(crossDomain, refWin)');
function visit151_45_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['41'][2].init(56, 30, 'crossDomain && _XDomainRequest');
function visit150_41_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['41'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['41'][1].init(40, 46, '!supportCORS && crossDomain && _XDomainRequest');
function visit149_41_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['33'][1].init(26, 13, 'refWin || win');
function visit148_33_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['25'][1].init(26, 13, 'refWin || win');
function visit147_25_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['11'][2].init(182, 11, 'S.UA.ie > 7');
function visit146_11_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['11'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['11'][1].init(182, 36, 'S.UA.ie > 7 && win[\'XDomainRequest\']');
function visit145_11_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].lineData[6]++;
KISSY.add('io/xhr-transport-base', function(S, IO) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[0]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[7]++;
  var OK_CODE = 200, win = S.Env.host, logger = S.getLogger('s/io'), _XDomainRequest = visit145_11_1(visit146_11_2(S.UA.ie > 7) && win['XDomainRequest']), NO_CONTENT_CODE = 204, NOT_FOUND_CODE = 404, NO_CONTENT_CODE2 = 1223, XhrTransportBase = {
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
      return new (visit147_25_1(refWin || win))['XMLHttpRequest']();
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
      return new (visit148_33_1(refWin || win))['ActiveXObject']('Microsoft.XMLHTTP');
    }    catch (e) {
}
    _$jscoverage['/io/xhr-transport-base.js'].lineData[36]++;
    return undefined;
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[39]++;
  XhrTransportBase.nativeXhr = win['ActiveXObject'] ? function(crossDomain, refWin) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[3]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[41]++;
  if (visit149_41_1(!supportCORS && visit150_41_2(crossDomain && _XDomainRequest))) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[42]++;
    return new _XDomainRequest();
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[45]++;
  return visit151_45_1(visit152_45_2(!IO.isLocal && createStandardXHR(crossDomain, refWin)) || createActiveXHR(crossDomain, refWin));
} : createStandardXHR;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[49]++;
  XhrTransportBase._XDomainRequest = _XDomainRequest;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[51]++;
  var supportCORS = XhrTransportBase.supportCORS = ('withCredentials' in XhrTransportBase.nativeXhr());
  _$jscoverage['/io/xhr-transport-base.js'].lineData[54]++;
  function isInstanceOfXDomainRequest(xhr) {
    _$jscoverage['/io/xhr-transport-base.js'].functionData[4]++;
    _$jscoverage['/io/xhr-transport-base.js'].lineData[55]++;
    return visit153_55_1(_XDomainRequest && (xhr instanceof _XDomainRequest));
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[58]++;
  function getIfModifiedKey(c) {
    _$jscoverage['/io/xhr-transport-base.js'].functionData[5]++;
    _$jscoverage['/io/xhr-transport-base.js'].lineData[59]++;
    var ifModified = c.ifModified, ifModifiedKey;
    _$jscoverage['/io/xhr-transport-base.js'].lineData[61]++;
    if (visit154_61_1(ifModified)) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[62]++;
      ifModifiedKey = c.uri;
      _$jscoverage['/io/xhr-transport-base.js'].lineData[63]++;
      if (visit155_63_1(c.cache === false)) {
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
  var self = this, io = self.io, c = io.config, nativeXhr = self.nativeXhr, files = c.files, type = files ? 'post' : c.type, async = c.async, username, mimeType = io.mimeType, requestHeaders = visit156_85_1(io.requestHeaders || {}), url = io._getUrlForSend(), xhrFields, ifModifiedKey = getIfModifiedKey(c), cacheValue, i;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[92]++;
  if (visit157_92_1(ifModifiedKey)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[99]++;
    if (visit158_99_1(cacheValue = lastModifiedCached[ifModifiedKey])) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[100]++;
      requestHeaders['If-Modified-Since'] = cacheValue;
    }
    _$jscoverage['/io/xhr-transport-base.js'].lineData[102]++;
    if (visit159_102_1(cacheValue = eTagCached[ifModifiedKey])) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[103]++;
      requestHeaders['If-None-Match'] = cacheValue;
    }
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[107]++;
  xhrFields = visit160_107_1(c['xhrFields'] || {});
  _$jscoverage['/io/xhr-transport-base.js'].lineData[110]++;
  if (visit161_110_1('withCredentials' in xhrFields)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[111]++;
    if (visit162_111_1(!supportCORS)) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[112]++;
      delete xhrFields.withCredentials;
    }
  } else {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[114]++;
    if (visit163_114_1(supportCORS)) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[116]++;
      xhrFields.withCredentials = true;
    }
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[119]++;
  if (visit164_119_1(username = c['username'])) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[120]++;
    nativeXhr.open(type, url, async, username, c.password);
  } else {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[122]++;
    nativeXhr.open(type, url, async);
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[125]++;
  for (i in xhrFields) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[126]++;
    try {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[127]++;
      nativeXhr[i] = xhrFields[i];
    }    catch (e) {
  _$jscoverage['/io/xhr-transport-base.js'].lineData[129]++;
  logger.error(e);
}
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[133]++;
  if (visit165_133_1(mimeType && nativeXhr.overrideMimeType)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[134]++;
    nativeXhr.overrideMimeType(mimeType);
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[137]++;
  var xRequestHeader = requestHeaders['X-Requested-With'];
  _$jscoverage['/io/xhr-transport-base.js'].lineData[139]++;
  if (visit166_139_1(xRequestHeader === false)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[140]++;
    delete requestHeaders['X-Requested-With'];
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[144]++;
  if (visit167_144_1(typeof nativeXhr.setRequestHeader !== 'undefined')) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[145]++;
    for (i in requestHeaders) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[146]++;
      nativeXhr.setRequestHeader(i, requestHeaders[i]);
    }
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[150]++;
  var sendContent = visit168_150_1(visit169_150_2(c.hasContent && c.data) || null);
  _$jscoverage['/io/xhr-transport-base.js'].lineData[153]++;
  if (visit170_153_1(files)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[154]++;
    var originalSentContent = sendContent, data = {};
    _$jscoverage['/io/xhr-transport-base.js'].lineData[156]++;
    if (visit171_156_1(originalSentContent)) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[157]++;
      data = S.unparam(originalSentContent);
    }
    _$jscoverage['/io/xhr-transport-base.js'].lineData[159]++;
    data = S.mix(data, files);
    _$jscoverage['/io/xhr-transport-base.js'].lineData[160]++;
    sendContent = new FormData();
    _$jscoverage['/io/xhr-transport-base.js'].lineData[161]++;
    S.each(data, function(vs, k) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[7]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[162]++;
  if (visit172_162_1(S.isArray(vs))) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[163]++;
    S.each(vs, function(v) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[8]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[164]++;
  sendContent.append(k + (c.serializeArray ? '[]' : ''), v);
});
  } else {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[167]++;
    sendContent.append(k, vs);
  }
});
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[172]++;
  nativeXhr.send(sendContent);
  _$jscoverage['/io/xhr-transport-base.js'].lineData[174]++;
  if (visit173_174_1(!async || visit174_174_2(nativeXhr.readyState == 4))) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[175]++;
    self._callback();
  } else {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[178]++;
    if (visit175_178_1(isInstanceOfXDomainRequest(nativeXhr))) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[179]++;
      nativeXhr.onload = function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[9]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[180]++;
  nativeXhr.readyState = 4;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[181]++;
  nativeXhr.status = 200;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[182]++;
  self._callback();
};
      _$jscoverage['/io/xhr-transport-base.js'].lineData[184]++;
      nativeXhr.onerror = function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[10]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[185]++;
  nativeXhr.readyState = 4;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[186]++;
  nativeXhr.status = 500;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[187]++;
  self._callback();
};
    } else {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[190]++;
      nativeXhr.onreadystatechange = function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[11]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[191]++;
  self._callback();
};
    }
  }
}, 
  abort: function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[12]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[198]++;
  this._callback(0, 1);
}, 
  _callback: function(event, abort) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[13]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[205]++;
  var self = this, nativeXhr = self.nativeXhr, io = self.io, ifModifiedKey, lastModified, eTag, statusText, xml, c = io.config;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[214]++;
  try {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[216]++;
    if (visit176_216_1(abort || visit177_216_2(nativeXhr.readyState == 4))) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[218]++;
      if (visit178_218_1(isInstanceOfXDomainRequest(nativeXhr))) {
        _$jscoverage['/io/xhr-transport-base.js'].lineData[219]++;
        nativeXhr.onerror = S.noop;
        _$jscoverage['/io/xhr-transport-base.js'].lineData[220]++;
        nativeXhr.onload = S.noop;
      } else {
        _$jscoverage['/io/xhr-transport-base.js'].lineData[223]++;
        nativeXhr.onreadystatechange = S.noop;
      }
      _$jscoverage['/io/xhr-transport-base.js'].lineData[226]++;
      if (visit179_226_1(abort)) {
        _$jscoverage['/io/xhr-transport-base.js'].lineData[228]++;
        if (visit180_228_1(nativeXhr.readyState !== 4)) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[229]++;
          nativeXhr.abort();
        }
      } else {
        _$jscoverage['/io/xhr-transport-base.js'].lineData[232]++;
        ifModifiedKey = getIfModifiedKey(c);
        _$jscoverage['/io/xhr-transport-base.js'].lineData[234]++;
        var status = nativeXhr.status;
        _$jscoverage['/io/xhr-transport-base.js'].lineData[237]++;
        if (visit181_237_1(!isInstanceOfXDomainRequest(nativeXhr))) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[238]++;
          io.responseHeadersString = nativeXhr.getAllResponseHeaders();
        }
        _$jscoverage['/io/xhr-transport-base.js'].lineData[241]++;
        if (visit182_241_1(ifModifiedKey)) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[242]++;
          lastModified = nativeXhr.getResponseHeader('Last-Modified');
          _$jscoverage['/io/xhr-transport-base.js'].lineData[243]++;
          eTag = nativeXhr.getResponseHeader('ETag');
          _$jscoverage['/io/xhr-transport-base.js'].lineData[246]++;
          if (visit183_246_1(lastModified)) {
            _$jscoverage['/io/xhr-transport-base.js'].lineData[247]++;
            lastModifiedCached[ifModifiedKey] = lastModified;
          }
          _$jscoverage['/io/xhr-transport-base.js'].lineData[249]++;
          if (visit184_249_1(eTag)) {
            _$jscoverage['/io/xhr-transport-base.js'].lineData[250]++;
            eTagCached[eTag] = eTag;
          }
        }
        _$jscoverage['/io/xhr-transport-base.js'].lineData[254]++;
        xml = nativeXhr.responseXML;
        _$jscoverage['/io/xhr-transport-base.js'].lineData[257]++;
        if (visit185_257_1(xml && xml.documentElement)) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[258]++;
          io.responseXML = xml;
        }
        _$jscoverage['/io/xhr-transport-base.js'].lineData[261]++;
        var text = io.responseText = nativeXhr.responseText;
        _$jscoverage['/io/xhr-transport-base.js'].lineData[264]++;
        if (visit186_264_1(c.files && text)) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[265]++;
          var bodyIndex, lastBodyIndex;
          _$jscoverage['/io/xhr-transport-base.js'].lineData[266]++;
          if (visit187_266_1((bodyIndex = text.indexOf('<body>')) != -1)) {
            _$jscoverage['/io/xhr-transport-base.js'].lineData[267]++;
            lastBodyIndex = text.lastIndexOf('</body>');
            _$jscoverage['/io/xhr-transport-base.js'].lineData[268]++;
            if (visit188_268_1(lastBodyIndex == -1)) {
              _$jscoverage['/io/xhr-transport-base.js'].lineData[269]++;
              lastBodyIndex = text.length;
            }
            _$jscoverage['/io/xhr-transport-base.js'].lineData[271]++;
            text = text.slice(bodyIndex + 6, lastBodyIndex);
          }
          _$jscoverage['/io/xhr-transport-base.js'].lineData[274]++;
          io.responseText = S.unEscapeHtml(text);
        }
        _$jscoverage['/io/xhr-transport-base.js'].lineData[279]++;
        try {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[280]++;
          statusText = nativeXhr.statusText;
        }        catch (e) {
  _$jscoverage['/io/xhr-transport-base.js'].lineData[282]++;
  logger.error('xhr statusText error: ');
  _$jscoverage['/io/xhr-transport-base.js'].lineData[283]++;
  logger.error(e);
  _$jscoverage['/io/xhr-transport-base.js'].lineData[285]++;
  statusText = '';
}
        _$jscoverage['/io/xhr-transport-base.js'].lineData[292]++;
        if (visit189_292_1(!status && visit190_292_2(IO.isLocal && !c.crossDomain))) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[293]++;
          status = io.responseText ? OK_CODE : NOT_FOUND_CODE;
        } else {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[295]++;
          if (visit191_295_1(status === NO_CONTENT_CODE2)) {
            _$jscoverage['/io/xhr-transport-base.js'].lineData[296]++;
            status = NO_CONTENT_CODE;
          }
        }
        _$jscoverage['/io/xhr-transport-base.js'].lineData[299]++;
        io._ioReady(status, statusText);
      }
    }
  }  catch (firefoxAccessException) {
  _$jscoverage['/io/xhr-transport-base.js'].lineData[303]++;
  nativeXhr.onreadystatechange = S.noop;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[304]++;
  if (visit192_304_1(!abort)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[305]++;
    io._ioReady(-1, firefoxAccessException);
  }
}
}});
  _$jscoverage['/io/xhr-transport-base.js'].lineData[312]++;
  return XhrTransportBase;
}, {
  requires: ['./base']});
