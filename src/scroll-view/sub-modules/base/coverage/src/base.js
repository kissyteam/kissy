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
if (! _$jscoverage['/base.js']) {
  _$jscoverage['/base.js'] = {};
  _$jscoverage['/base.js'].lineData = [];
  _$jscoverage['/base.js'].lineData[6] = 0;
  _$jscoverage['/base.js'].lineData[7] = 0;
  _$jscoverage['/base.js'].lineData[8] = 0;
  _$jscoverage['/base.js'].lineData[9] = 0;
  _$jscoverage['/base.js'].lineData[10] = 0;
  _$jscoverage['/base.js'].lineData[12] = 0;
  _$jscoverage['/base.js'].lineData[15] = 0;
  _$jscoverage['/base.js'].lineData[16] = 0;
  _$jscoverage['/base.js'].lineData[20] = 0;
  _$jscoverage['/base.js'].lineData[21] = 0;
  _$jscoverage['/base.js'].lineData[23] = 0;
  _$jscoverage['/base.js'].lineData[24] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[29] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[39] = 0;
  _$jscoverage['/base.js'].lineData[41] = 0;
  _$jscoverage['/base.js'].lineData[45] = 0;
  _$jscoverage['/base.js'].lineData[50] = 0;
  _$jscoverage['/base.js'].lineData[55] = 0;
  _$jscoverage['/base.js'].lineData[59] = 0;
  _$jscoverage['/base.js'].lineData[63] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[69] = 0;
  _$jscoverage['/base.js'].lineData[70] = 0;
  _$jscoverage['/base.js'].lineData[71] = 0;
  _$jscoverage['/base.js'].lineData[72] = 0;
  _$jscoverage['/base.js'].lineData[75] = 0;
  _$jscoverage['/base.js'].lineData[76] = 0;
  _$jscoverage['/base.js'].lineData[79] = 0;
  _$jscoverage['/base.js'].lineData[80] = 0;
  _$jscoverage['/base.js'].lineData[81] = 0;
  _$jscoverage['/base.js'].lineData[82] = 0;
  _$jscoverage['/base.js'].lineData[83] = 0;
  _$jscoverage['/base.js'].lineData[84] = 0;
  _$jscoverage['/base.js'].lineData[85] = 0;
  _$jscoverage['/base.js'].lineData[86] = 0;
  _$jscoverage['/base.js'].lineData[87] = 0;
  _$jscoverage['/base.js'].lineData[88] = 0;
  _$jscoverage['/base.js'].lineData[91] = 0;
  _$jscoverage['/base.js'].lineData[92] = 0;
  _$jscoverage['/base.js'].lineData[93] = 0;
  _$jscoverage['/base.js'].lineData[94] = 0;
  _$jscoverage['/base.js'].lineData[95] = 0;
  _$jscoverage['/base.js'].lineData[96] = 0;
  _$jscoverage['/base.js'].lineData[97] = 0;
  _$jscoverage['/base.js'].lineData[98] = 0;
  _$jscoverage['/base.js'].lineData[99] = 0;
  _$jscoverage['/base.js'].lineData[102] = 0;
  _$jscoverage['/base.js'].lineData[106] = 0;
  _$jscoverage['/base.js'].lineData[107] = 0;
  _$jscoverage['/base.js'].lineData[108] = 0;
  _$jscoverage['/base.js'].lineData[110] = 0;
  _$jscoverage['/base.js'].lineData[111] = 0;
  _$jscoverage['/base.js'].lineData[112] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[117] = 0;
  _$jscoverage['/base.js'].lineData[121] = 0;
  _$jscoverage['/base.js'].lineData[122] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[133] = 0;
  _$jscoverage['/base.js'].lineData[134] = 0;
  _$jscoverage['/base.js'].lineData[135] = 0;
  _$jscoverage['/base.js'].lineData[136] = 0;
  _$jscoverage['/base.js'].lineData[137] = 0;
  _$jscoverage['/base.js'].lineData[138] = 0;
  _$jscoverage['/base.js'].lineData[139] = 0;
  _$jscoverage['/base.js'].lineData[143] = 0;
  _$jscoverage['/base.js'].lineData[144] = 0;
  _$jscoverage['/base.js'].lineData[145] = 0;
  _$jscoverage['/base.js'].lineData[146] = 0;
  _$jscoverage['/base.js'].lineData[147] = 0;
  _$jscoverage['/base.js'].lineData[148] = 0;
  _$jscoverage['/base.js'].lineData[149] = 0;
  _$jscoverage['/base.js'].lineData[155] = 0;
  _$jscoverage['/base.js'].lineData[159] = 0;
  _$jscoverage['/base.js'].lineData[160] = 0;
  _$jscoverage['/base.js'].lineData[161] = 0;
  _$jscoverage['/base.js'].lineData[162] = 0;
  _$jscoverage['/base.js'].lineData[164] = 0;
  _$jscoverage['/base.js'].lineData[166] = 0;
  _$jscoverage['/base.js'].lineData[173] = 0;
  _$jscoverage['/base.js'].lineData[177] = 0;
  _$jscoverage['/base.js'].lineData[178] = 0;
  _$jscoverage['/base.js'].lineData[179] = 0;
  _$jscoverage['/base.js'].lineData[180] = 0;
  _$jscoverage['/base.js'].lineData[181] = 0;
  _$jscoverage['/base.js'].lineData[183] = 0;
  _$jscoverage['/base.js'].lineData[184] = 0;
  _$jscoverage['/base.js'].lineData[185] = 0;
  _$jscoverage['/base.js'].lineData[186] = 0;
  _$jscoverage['/base.js'].lineData[187] = 0;
  _$jscoverage['/base.js'].lineData[191] = 0;
  _$jscoverage['/base.js'].lineData[192] = 0;
  _$jscoverage['/base.js'].lineData[193] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[198] = 0;
  _$jscoverage['/base.js'].lineData[202] = 0;
  _$jscoverage['/base.js'].lineData[204] = 0;
  _$jscoverage['/base.js'].lineData[205] = 0;
  _$jscoverage['/base.js'].lineData[206] = 0;
  _$jscoverage['/base.js'].lineData[211] = 0;
  _$jscoverage['/base.js'].lineData[212] = 0;
  _$jscoverage['/base.js'].lineData[213] = 0;
  _$jscoverage['/base.js'].lineData[214] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[217] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[220] = 0;
  _$jscoverage['/base.js'].lineData[224] = 0;
  _$jscoverage['/base.js'].lineData[227] = 0;
  _$jscoverage['/base.js'].lineData[228] = 0;
  _$jscoverage['/base.js'].lineData[230] = 0;
  _$jscoverage['/base.js'].lineData[231] = 0;
  _$jscoverage['/base.js'].lineData[232] = 0;
  _$jscoverage['/base.js'].lineData[234] = 0;
  _$jscoverage['/base.js'].lineData[235] = 0;
  _$jscoverage['/base.js'].lineData[236] = 0;
  _$jscoverage['/base.js'].lineData[238] = 0;
  _$jscoverage['/base.js'].lineData[239] = 0;
  _$jscoverage['/base.js'].lineData[240] = 0;
  _$jscoverage['/base.js'].lineData[241] = 0;
  _$jscoverage['/base.js'].lineData[242] = 0;
  _$jscoverage['/base.js'].lineData[243] = 0;
  _$jscoverage['/base.js'].lineData[244] = 0;
  _$jscoverage['/base.js'].lineData[246] = 0;
  _$jscoverage['/base.js'].lineData[247] = 0;
  _$jscoverage['/base.js'].lineData[249] = 0;
  _$jscoverage['/base.js'].lineData[250] = 0;
}
if (! _$jscoverage['/base.js'].functionData) {
  _$jscoverage['/base.js'].functionData = [];
  _$jscoverage['/base.js'].functionData[0] = 0;
  _$jscoverage['/base.js'].functionData[1] = 0;
  _$jscoverage['/base.js'].functionData[2] = 0;
  _$jscoverage['/base.js'].functionData[3] = 0;
  _$jscoverage['/base.js'].functionData[4] = 0;
  _$jscoverage['/base.js'].functionData[5] = 0;
  _$jscoverage['/base.js'].functionData[6] = 0;
  _$jscoverage['/base.js'].functionData[7] = 0;
  _$jscoverage['/base.js'].functionData[8] = 0;
  _$jscoverage['/base.js'].functionData[9] = 0;
  _$jscoverage['/base.js'].functionData[10] = 0;
  _$jscoverage['/base.js'].functionData[11] = 0;
  _$jscoverage['/base.js'].functionData[12] = 0;
  _$jscoverage['/base.js'].functionData[13] = 0;
  _$jscoverage['/base.js'].functionData[14] = 0;
  _$jscoverage['/base.js'].functionData[15] = 0;
  _$jscoverage['/base.js'].functionData[16] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['20'] = [];
  _$jscoverage['/base.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['23'] = [];
  _$jscoverage['/base.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['59'] = [];
  _$jscoverage['/base.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['59'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['60'] = [];
  _$jscoverage['/base.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['60'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['61'] = [];
  _$jscoverage['/base.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['61'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['71'] = [];
  _$jscoverage['/base.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['75'] = [];
  _$jscoverage['/base.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['80'] = [];
  _$jscoverage['/base.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['83'] = [];
  _$jscoverage['/base.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['86'] = [];
  _$jscoverage['/base.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['91'] = [];
  _$jscoverage['/base.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['94'] = [];
  _$jscoverage['/base.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['97'] = [];
  _$jscoverage['/base.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['107'] = [];
  _$jscoverage['/base.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['121'] = [];
  _$jscoverage['/base.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['133'] = [];
  _$jscoverage['/base.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['137'] = [];
  _$jscoverage['/base.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['137'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['137'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['137'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['137'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['137'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['137'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['137'][8] = new BranchData();
  _$jscoverage['/base.js'].branchData['143'] = [];
  _$jscoverage['/base.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['147'] = [];
  _$jscoverage['/base.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['147'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['147'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['147'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['147'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['147'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['147'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['147'][8] = new BranchData();
  _$jscoverage['/base.js'].branchData['155'] = [];
  _$jscoverage['/base.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['160'] = [];
  _$jscoverage['/base.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['183'] = [];
  _$jscoverage['/base.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['184'] = [];
  _$jscoverage['/base.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['186'] = [];
  _$jscoverage['/base.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['191'] = [];
  _$jscoverage['/base.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['193'] = [];
  _$jscoverage['/base.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['204'] = [];
  _$jscoverage['/base.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['214'] = [];
  _$jscoverage['/base.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['217'] = [];
  _$jscoverage['/base.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['227'] = [];
  _$jscoverage['/base.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['230'] = [];
  _$jscoverage['/base.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['234'] = [];
  _$jscoverage['/base.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['246'] = [];
  _$jscoverage['/base.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['249'] = [];
  _$jscoverage['/base.js'].branchData['249'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['249'][1].init(131, 17, 'top !== undefined');
function visit61_249_1(result) {
  _$jscoverage['/base.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['246'][1].init(21, 18, 'left !== undefined');
function visit60_246_1(result) {
  _$jscoverage['/base.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['234'][1].init(245, 17, 'top !== undefined');
function visit59_234_1(result) {
  _$jscoverage['/base.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['230'][1].init(81, 18, 'left !== undefined');
function visit58_230_1(result) {
  _$jscoverage['/base.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['227'][1].init(110, 7, 'animCfg');
function visit57_227_1(result) {
  _$jscoverage['/base.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['217'][1].init(265, 7, 'cfg.top');
function visit56_217_1(result) {
  _$jscoverage['/base.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['214'][1].init(134, 8, 'cfg.left');
function visit55_214_1(result) {
  _$jscoverage['/base.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['204'][1].init(75, 51, '(pageOffset = self.pagesOffset) && pageOffset[index]');
function visit54_204_1(result) {
  _$jscoverage['/base.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['193'][1].init(70, 15, 'offset[p2] <= v');
function visit53_193_1(result) {
  _$jscoverage['/base.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['191'][1].init(50, 6, 'i >= 0');
function visit52_191_1(result) {
  _$jscoverage['/base.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['186'][1].init(70, 15, 'offset[p2] >= v');
function visit51_186_1(result) {
  _$jscoverage['/base.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['184'][1].init(29, 22, 'i < pagesOffset.length');
function visit50_184_1(result) {
  _$jscoverage['/base.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['183'][1].init(254, 13, 'direction > 0');
function visit49_183_1(result) {
  _$jscoverage['/base.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['160'][1].init(46, 23, 'self.scrollAnims.length');
function visit48_160_1(result) {
  _$jscoverage['/base.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['155'][1].init(37, 12, 'axis === \'x\'');
function visit47_155_1(result) {
  _$jscoverage['/base.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['147'][8].init(212, 10, 'deltaX < 0');
function visit46_147_8(result) {
  _$jscoverage['/base.js'].branchData['147'][8].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['147'][7].init(191, 17, 'scrollLeft >= max');
function visit45_147_7(result) {
  _$jscoverage['/base.js'].branchData['147'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['147'][6].init(191, 31, 'scrollLeft >= max && deltaX < 0');
function visit44_147_6(result) {
  _$jscoverage['/base.js'].branchData['147'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['147'][5].init(177, 10, 'deltaX > 0');
function visit43_147_5(result) {
  _$jscoverage['/base.js'].branchData['147'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['147'][4].init(156, 17, 'scrollLeft <= min');
function visit42_147_4(result) {
  _$jscoverage['/base.js'].branchData['147'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['147'][3].init(156, 31, 'scrollLeft <= min && deltaX > 0');
function visit41_147_3(result) {
  _$jscoverage['/base.js'].branchData['147'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['147'][2].init(156, 66, 'scrollLeft <= min && deltaX > 0 || scrollLeft >= max && deltaX < 0');
function visit40_147_2(result) {
  _$jscoverage['/base.js'].branchData['147'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['147'][1].init(154, 69, '!(scrollLeft <= min && deltaX > 0 || scrollLeft >= max && deltaX < 0)');
function visit39_147_1(result) {
  _$jscoverage['/base.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['143'][1].init(802, 43, '(deltaX = e.deltaX) && self.allowScroll.left');
function visit38_143_1(result) {
  _$jscoverage['/base.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['137'][8].init(206, 10, 'deltaY < 0');
function visit37_137_8(result) {
  _$jscoverage['/base.js'].branchData['137'][8].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['137'][7].init(186, 16, 'scrollTop >= max');
function visit36_137_7(result) {
  _$jscoverage['/base.js'].branchData['137'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['137'][6].init(186, 30, 'scrollTop >= max && deltaY < 0');
function visit35_137_6(result) {
  _$jscoverage['/base.js'].branchData['137'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['137'][5].init(172, 10, 'deltaY > 0');
function visit34_137_5(result) {
  _$jscoverage['/base.js'].branchData['137'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['137'][4].init(152, 16, 'scrollTop <= min');
function visit33_137_4(result) {
  _$jscoverage['/base.js'].branchData['137'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['137'][3].init(152, 30, 'scrollTop <= min && deltaY > 0');
function visit32_137_3(result) {
  _$jscoverage['/base.js'].branchData['137'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['137'][2].init(152, 64, 'scrollTop <= min && deltaY > 0 || scrollTop >= max && deltaY < 0');
function visit31_137_2(result) {
  _$jscoverage['/base.js'].branchData['137'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['137'][1].init(150, 67, '!(scrollTop <= min && deltaY > 0 || scrollTop >= max && deltaY < 0)');
function visit30_137_1(result) {
  _$jscoverage['/base.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['133'][1].init(355, 42, '(deltaY = e.deltaY) && self.allowScroll.top');
function visit29_133_1(result) {
  _$jscoverage['/base.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['121'][1].init(17, 20, 'this.get(\'disabled\')');
function visit28_121_1(result) {
  _$jscoverage['/base.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['107'][1].init(49, 18, 'control.scrollStep');
function visit27_107_1(result) {
  _$jscoverage['/base.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['97'][1].init(296, 24, 'keyCode === KeyCode.LEFT');
function visit26_97_1(result) {
  _$jscoverage['/base.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['94'][1].init(129, 25, 'keyCode === KeyCode.RIGHT');
function visit25_94_1(result) {
  _$jscoverage['/base.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['91'][1].init(1618, 6, 'allowX');
function visit24_91_1(result) {
  _$jscoverage['/base.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['86'][1].init(722, 27, 'keyCode === KeyCode.PAGE_UP');
function visit23_86_1(result) {
  _$jscoverage['/base.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['83'][1].init(552, 29, 'keyCode === KeyCode.PAGE_DOWN');
function visit22_83_1(result) {
  _$jscoverage['/base.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['80'][1].init(390, 22, 'keyCode === KeyCode.UP');
function visit21_80_1(result) {
  _$jscoverage['/base.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['75'][1].init(180, 24, 'keyCode === KeyCode.DOWN');
function visit20_75_1(result) {
  _$jscoverage['/base.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['71'][1].init(702, 6, 'allowY');
function visit19_71_1(result) {
  _$jscoverage['/base.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['61'][2].init(330, 21, 'nodeName === \'select\'');
function visit18_61_2(result) {
  _$jscoverage['/base.js'].branchData['61'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['61'][1].init(42, 75, 'nodeName === \'select\' || $target.hasAttr(\'contenteditable\')');
function visit17_61_1(result) {
  _$jscoverage['/base.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['60'][2].init(286, 23, 'nodeName === \'textarea\'');
function visit16_60_2(result) {
  _$jscoverage['/base.js'].branchData['60'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['60'][1].init(39, 118, 'nodeName === \'textarea\' || nodeName === \'select\' || $target.hasAttr(\'contenteditable\')');
function visit15_60_1(result) {
  _$jscoverage['/base.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['59'][2].init(244, 20, 'nodeName === \'input\'');
function visit14_59_2(result) {
  _$jscoverage['/base.js'].branchData['59'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['59'][1].init(244, 158, 'nodeName === \'input\' || nodeName === \'textarea\' || nodeName === \'select\' || $target.hasAttr(\'contenteditable\')');
function visit13_59_1(result) {
  _$jscoverage['/base.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['23'][1].init(247, 10, 'scrollLeft');
function visit12_23_1(result) {
  _$jscoverage['/base.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['20'][1].init(142, 9, 'scrollTop');
function visit11_20_1(result) {
  _$jscoverage['/base.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/base.js'].lineData[8]++;
  var Anim = require('anim');
  _$jscoverage['/base.js'].lineData[9]++;
  var Container = require('component/container');
  _$jscoverage['/base.js'].lineData[10]++;
  var Render = require('./base/render');
  _$jscoverage['/base.js'].lineData[12]++;
  var $ = S.all, KeyCode = Node.KeyCode;
  _$jscoverage['/base.js'].lineData[15]++;
  function onElScroll() {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[16]++;
    var self = this, el = self.el, scrollTop = el.scrollTop, scrollLeft = el.scrollLeft;
    _$jscoverage['/base.js'].lineData[20]++;
    if (visit11_20_1(scrollTop)) {
      _$jscoverage['/base.js'].lineData[21]++;
      self.set('scrollTop', scrollTop + self.get('scrollTop'));
    }
    _$jscoverage['/base.js'].lineData[23]++;
    if (visit12_23_1(scrollLeft)) {
      _$jscoverage['/base.js'].lineData[24]++;
      self.set('scrollLeft', scrollLeft + self.get('scrollLeft'));
    }
    _$jscoverage['/base.js'].lineData[26]++;
    el.scrollTop = el.scrollLeft = 0;
  }
  _$jscoverage['/base.js'].lineData[29]++;
  function frame(anim, fx) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[30]++;
    anim.scrollView.set(fx.prop, fx.val);
  }
  _$jscoverage['/base.js'].lineData[39]++;
  return Container.extend({
  initializer: function() {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[41]++;
  this.scrollAnims = [];
}, 
  bindUI: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[45]++;
  var self = this, $el = self.$el;
  _$jscoverage['/base.js'].lineData[50]++;
  $el.on('mousewheel', self.handleMouseWheel, self).on('scroll', onElScroll, self);
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[55]++;
  var target = e.target, $target = $(target), nodeName = $target.nodeName();
  _$jscoverage['/base.js'].lineData[59]++;
  if (visit13_59_1(visit14_59_2(nodeName === 'input') || visit15_60_1(visit16_60_2(nodeName === 'textarea') || visit17_61_1(visit18_61_2(nodeName === 'select') || $target.hasAttr('contenteditable'))))) {
    _$jscoverage['/base.js'].lineData[63]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[65]++;
  var self = this, keyCode = e.keyCode, scrollStep = self.getScrollStep(), ok;
  _$jscoverage['/base.js'].lineData[69]++;
  var allowX = self.allowScroll.left;
  _$jscoverage['/base.js'].lineData[70]++;
  var allowY = self.allowScroll.top;
  _$jscoverage['/base.js'].lineData[71]++;
  if (visit19_71_1(allowY)) {
    _$jscoverage['/base.js'].lineData[72]++;
    var scrollStepY = scrollStep.top, clientHeight = self.clientHeight, scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[75]++;
    if (visit20_75_1(keyCode === KeyCode.DOWN)) {
      _$jscoverage['/base.js'].lineData[76]++;
      self.scrollToWithBounds({
  top: scrollTop + scrollStepY});
      _$jscoverage['/base.js'].lineData[79]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[80]++;
      if (visit21_80_1(keyCode === KeyCode.UP)) {
        _$jscoverage['/base.js'].lineData[81]++;
        self.scrollToWithBounds({
  top: scrollTop - scrollStepY});
        _$jscoverage['/base.js'].lineData[82]++;
        ok = true;
      } else {
        _$jscoverage['/base.js'].lineData[83]++;
        if (visit22_83_1(keyCode === KeyCode.PAGE_DOWN)) {
          _$jscoverage['/base.js'].lineData[84]++;
          self.scrollToWithBounds({
  top: scrollTop + clientHeight});
          _$jscoverage['/base.js'].lineData[85]++;
          ok = true;
        } else {
          _$jscoverage['/base.js'].lineData[86]++;
          if (visit23_86_1(keyCode === KeyCode.PAGE_UP)) {
            _$jscoverage['/base.js'].lineData[87]++;
            self.scrollToWithBounds({
  top: scrollTop - clientHeight});
            _$jscoverage['/base.js'].lineData[88]++;
            ok = true;
          }
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[91]++;
  if (visit24_91_1(allowX)) {
    _$jscoverage['/base.js'].lineData[92]++;
    var scrollStepX = scrollStep.left;
    _$jscoverage['/base.js'].lineData[93]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[94]++;
    if (visit25_94_1(keyCode === KeyCode.RIGHT)) {
      _$jscoverage['/base.js'].lineData[95]++;
      self.scrollToWithBounds({
  left: scrollLeft + scrollStepX});
      _$jscoverage['/base.js'].lineData[96]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[97]++;
      if (visit26_97_1(keyCode === KeyCode.LEFT)) {
        _$jscoverage['/base.js'].lineData[98]++;
        self.scrollToWithBounds({
  left: scrollLeft - scrollStepX});
        _$jscoverage['/base.js'].lineData[99]++;
        ok = true;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[102]++;
  return ok;
}, 
  getScrollStep: function() {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[106]++;
  var control = this;
  _$jscoverage['/base.js'].lineData[107]++;
  if (visit27_107_1(control.scrollStep)) {
    _$jscoverage['/base.js'].lineData[108]++;
    return control.scrollStep;
  }
  _$jscoverage['/base.js'].lineData[110]++;
  var elDoc = $(this.get('el')[0].ownerDocument);
  _$jscoverage['/base.js'].lineData[111]++;
  var clientHeight = control.clientHeight;
  _$jscoverage['/base.js'].lineData[112]++;
  var clientWidth = control.clientWidth;
  _$jscoverage['/base.js'].lineData[113]++;
  control.scrollStep = {
  top: Math.max(clientHeight * clientHeight * 0.7 / elDoc.height(), 20), 
  left: Math.max(clientWidth * clientWidth * 0.7 / elDoc.width(), 20)};
  _$jscoverage['/base.js'].lineData[117]++;
  return control.scrollStep;
}, 
  handleMouseWheel: function(e) {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[121]++;
  if (visit28_121_1(this.get('disabled'))) {
    _$jscoverage['/base.js'].lineData[122]++;
    return;
  }
  _$jscoverage['/base.js'].lineData[124]++;
  var max, min, self = this, scrollStep = self.getScrollStep(), deltaY, deltaX, maxScroll = self.maxScroll, minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[133]++;
  if (visit29_133_1((deltaY = e.deltaY) && self.allowScroll.top)) {
    _$jscoverage['/base.js'].lineData[134]++;
    var scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[135]++;
    max = maxScroll.top;
    _$jscoverage['/base.js'].lineData[136]++;
    min = minScroll.top;
    _$jscoverage['/base.js'].lineData[137]++;
    if (visit30_137_1(!(visit31_137_2(visit32_137_3(visit33_137_4(scrollTop <= min) && visit34_137_5(deltaY > 0)) || visit35_137_6(visit36_137_7(scrollTop >= max) && visit37_137_8(deltaY < 0)))))) {
      _$jscoverage['/base.js'].lineData[138]++;
      self.scrollToWithBounds({
  top: scrollTop - e.deltaY * scrollStep.top});
      _$jscoverage['/base.js'].lineData[139]++;
      e.preventDefault();
    }
  }
  _$jscoverage['/base.js'].lineData[143]++;
  if (visit38_143_1((deltaX = e.deltaX) && self.allowScroll.left)) {
    _$jscoverage['/base.js'].lineData[144]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[145]++;
    max = maxScroll.left;
    _$jscoverage['/base.js'].lineData[146]++;
    min = minScroll.left;
    _$jscoverage['/base.js'].lineData[147]++;
    if (visit39_147_1(!(visit40_147_2(visit41_147_3(visit42_147_4(scrollLeft <= min) && visit43_147_5(deltaX > 0)) || visit44_147_6(visit45_147_7(scrollLeft >= max) && visit46_147_8(deltaX < 0)))))) {
      _$jscoverage['/base.js'].lineData[148]++;
      self.scrollToWithBounds({
  left: scrollLeft - e.deltaX * scrollStep.left});
      _$jscoverage['/base.js'].lineData[149]++;
      e.preventDefault();
    }
  }
}, 
  'isAxisEnabled': function(axis) {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[155]++;
  return this.allowScroll[visit47_155_1(axis === 'x') ? 'left' : 'top'];
}, 
  stopAnimation: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[159]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[160]++;
  if (visit48_160_1(self.scrollAnims.length)) {
    _$jscoverage['/base.js'].lineData[161]++;
    S.each(self.scrollAnims, function(scrollAnim) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[162]++;
  scrollAnim.stop();
});
    _$jscoverage['/base.js'].lineData[164]++;
    self.scrollAnims = [];
  }
  _$jscoverage['/base.js'].lineData[166]++;
  self.scrollToWithBounds({
  left: self.get('scrollLeft'), 
  top: self.get('scrollTop')});
}, 
  '_uiSetPageIndex': function(v) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[173]++;
  this.scrollToPage(v);
}, 
  _getPageIndexFromXY: function(v, allowX, direction) {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[177]++;
  var pagesOffset = this.pagesOffset.concat([]);
  _$jscoverage['/base.js'].lineData[178]++;
  var p2 = allowX ? 'left' : 'top';
  _$jscoverage['/base.js'].lineData[179]++;
  var i, offset;
  _$jscoverage['/base.js'].lineData[180]++;
  pagesOffset.sort(function(e1, e2) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[181]++;
  return e1[p2] - e2[p2];
});
  _$jscoverage['/base.js'].lineData[183]++;
  if (visit49_183_1(direction > 0)) {
    _$jscoverage['/base.js'].lineData[184]++;
    for (i = 0; visit50_184_1(i < pagesOffset.length); i++) {
      _$jscoverage['/base.js'].lineData[185]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[186]++;
      if (visit51_186_1(offset[p2] >= v)) {
        _$jscoverage['/base.js'].lineData[187]++;
        return offset.index;
      }
    }
  } else {
    _$jscoverage['/base.js'].lineData[191]++;
    for (i = pagesOffset.length - 1; visit52_191_1(i >= 0); i--) {
      _$jscoverage['/base.js'].lineData[192]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[193]++;
      if (visit53_193_1(offset[p2] <= v)) {
        _$jscoverage['/base.js'].lineData[194]++;
        return offset.index;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[198]++;
  return undefined;
}, 
  scrollToPage: function(index, animCfg) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[202]++;
  var self = this, pageOffset;
  _$jscoverage['/base.js'].lineData[204]++;
  if (visit54_204_1((pageOffset = self.pagesOffset) && pageOffset[index])) {
    _$jscoverage['/base.js'].lineData[205]++;
    self.set('pageIndex', index);
    _$jscoverage['/base.js'].lineData[206]++;
    self.scrollTo(pageOffset[index], animCfg);
  }
}, 
  scrollToWithBounds: function(cfg, anim) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[211]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[212]++;
  var maxScroll = self.maxScroll;
  _$jscoverage['/base.js'].lineData[213]++;
  var minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[214]++;
  if (visit55_214_1(cfg.left)) {
    _$jscoverage['/base.js'].lineData[215]++;
    cfg.left = Math.min(Math.max(cfg.left, minScroll.left), maxScroll.left);
  }
  _$jscoverage['/base.js'].lineData[217]++;
  if (visit56_217_1(cfg.top)) {
    _$jscoverage['/base.js'].lineData[218]++;
    cfg.top = Math.min(Math.max(cfg.top, minScroll.top), maxScroll.top);
  }
  _$jscoverage['/base.js'].lineData[220]++;
  self.scrollTo(cfg, anim);
}, 
  scrollTo: function(cfg, animCfg) {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[224]++;
  var self = this, left = cfg.left, top = cfg.top;
  _$jscoverage['/base.js'].lineData[227]++;
  if (visit57_227_1(animCfg)) {
    _$jscoverage['/base.js'].lineData[228]++;
    var node = {}, to = {};
    _$jscoverage['/base.js'].lineData[230]++;
    if (visit58_230_1(left !== undefined)) {
      _$jscoverage['/base.js'].lineData[231]++;
      to.scrollLeft = left;
      _$jscoverage['/base.js'].lineData[232]++;
      node.scrollLeft = self.get('scrollLeft');
    }
    _$jscoverage['/base.js'].lineData[234]++;
    if (visit59_234_1(top !== undefined)) {
      _$jscoverage['/base.js'].lineData[235]++;
      to.scrollTop = top;
      _$jscoverage['/base.js'].lineData[236]++;
      node.scrollTop = self.get('scrollTop');
    }
    _$jscoverage['/base.js'].lineData[238]++;
    animCfg.frame = frame;
    _$jscoverage['/base.js'].lineData[239]++;
    animCfg.node = node;
    _$jscoverage['/base.js'].lineData[240]++;
    animCfg.to = to;
    _$jscoverage['/base.js'].lineData[241]++;
    var anim;
    _$jscoverage['/base.js'].lineData[242]++;
    self.scrollAnims.push(anim = new Anim(animCfg));
    _$jscoverage['/base.js'].lineData[243]++;
    anim.scrollView = self;
    _$jscoverage['/base.js'].lineData[244]++;
    anim.run();
  } else {
    _$jscoverage['/base.js'].lineData[246]++;
    if (visit60_246_1(left !== undefined)) {
      _$jscoverage['/base.js'].lineData[247]++;
      self.set('scrollLeft', left);
    }
    _$jscoverage['/base.js'].lineData[249]++;
    if (visit61_249_1(top !== undefined)) {
      _$jscoverage['/base.js'].lineData[250]++;
      self.set('scrollTop', top);
    }
  }
}}, {
  ATTRS: {
  contentEl: {}, 
  scrollLeft: {
  view: 1, 
  value: 0}, 
  scrollTop: {
  view: 1, 
  value: 0}, 
  focusable: {
  value: true}, 
  allowTextSelection: {
  value: true}, 
  handleGestureEvents: {
  value: false}, 
  snap: {
  value: false}, 
  pageIndex: {
  value: 0}, 
  xrender: {
  value: Render}}, 
  xclass: 'scroll-view'});
});
