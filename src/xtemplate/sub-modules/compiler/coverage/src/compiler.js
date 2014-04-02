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
if (! _$jscoverage['/compiler.js']) {
  _$jscoverage['/compiler.js'] = {};
  _$jscoverage['/compiler.js'].lineData = [];
  _$jscoverage['/compiler.js'].lineData[6] = 0;
  _$jscoverage['/compiler.js'].lineData[7] = 0;
  _$jscoverage['/compiler.js'].lineData[8] = 0;
  _$jscoverage['/compiler.js'].lineData[9] = 0;
  _$jscoverage['/compiler.js'].lineData[10] = 0;
  _$jscoverage['/compiler.js'].lineData[11] = 0;
  _$jscoverage['/compiler.js'].lineData[12] = 0;
  _$jscoverage['/compiler.js'].lineData[13] = 0;
  _$jscoverage['/compiler.js'].lineData[14] = 0;
  _$jscoverage['/compiler.js'].lineData[15] = 0;
  _$jscoverage['/compiler.js'].lineData[17] = 0;
  _$jscoverage['/compiler.js'].lineData[18] = 0;
  _$jscoverage['/compiler.js'].lineData[21] = 0;
  _$jscoverage['/compiler.js'].lineData[22] = 0;
  _$jscoverage['/compiler.js'].lineData[27] = 0;
  _$jscoverage['/compiler.js'].lineData[29] = 0;
  _$jscoverage['/compiler.js'].lineData[35] = 0;
  _$jscoverage['/compiler.js'].lineData[36] = 0;
  _$jscoverage['/compiler.js'].lineData[39] = 0;
  _$jscoverage['/compiler.js'].lineData[40] = 0;
  _$jscoverage['/compiler.js'].lineData[42] = 0;
  _$jscoverage['/compiler.js'].lineData[43] = 0;
  _$jscoverage['/compiler.js'].lineData[45] = 0;
  _$jscoverage['/compiler.js'].lineData[49] = 0;
  _$jscoverage['/compiler.js'].lineData[50] = 0;
  _$jscoverage['/compiler.js'].lineData[51] = 0;
  _$jscoverage['/compiler.js'].lineData[54] = 0;
  _$jscoverage['/compiler.js'].lineData[57] = 0;
  _$jscoverage['/compiler.js'].lineData[60] = 0;
  _$jscoverage['/compiler.js'].lineData[63] = 0;
  _$jscoverage['/compiler.js'].lineData[64] = 0;
  _$jscoverage['/compiler.js'].lineData[67] = 0;
  _$jscoverage['/compiler.js'].lineData[68] = 0;
  _$jscoverage['/compiler.js'].lineData[76] = 0;
  _$jscoverage['/compiler.js'].lineData[77] = 0;
  _$jscoverage['/compiler.js'].lineData[78] = 0;
  _$jscoverage['/compiler.js'].lineData[79] = 0;
  _$jscoverage['/compiler.js'].lineData[80] = 0;
  _$jscoverage['/compiler.js'].lineData[81] = 0;
  _$jscoverage['/compiler.js'].lineData[82] = 0;
  _$jscoverage['/compiler.js'].lineData[83] = 0;
  _$jscoverage['/compiler.js'].lineData[84] = 0;
  _$jscoverage['/compiler.js'].lineData[85] = 0;
  _$jscoverage['/compiler.js'].lineData[86] = 0;
  _$jscoverage['/compiler.js'].lineData[87] = 0;
  _$jscoverage['/compiler.js'].lineData[89] = 0;
  _$jscoverage['/compiler.js'].lineData[90] = 0;
  _$jscoverage['/compiler.js'].lineData[92] = 0;
  _$jscoverage['/compiler.js'].lineData[99] = 0;
  _$jscoverage['/compiler.js'].lineData[100] = 0;
  _$jscoverage['/compiler.js'].lineData[101] = 0;
  _$jscoverage['/compiler.js'].lineData[103] = 0;
  _$jscoverage['/compiler.js'].lineData[106] = 0;
  _$jscoverage['/compiler.js'].lineData[107] = 0;
  _$jscoverage['/compiler.js'].lineData[108] = 0;
  _$jscoverage['/compiler.js'].lineData[109] = 0;
  _$jscoverage['/compiler.js'].lineData[112] = 0;
  _$jscoverage['/compiler.js'].lineData[113] = 0;
  _$jscoverage['/compiler.js'].lineData[114] = 0;
  _$jscoverage['/compiler.js'].lineData[115] = 0;
  _$jscoverage['/compiler.js'].lineData[116] = 0;
  _$jscoverage['/compiler.js'].lineData[117] = 0;
  _$jscoverage['/compiler.js'].lineData[118] = 0;
  _$jscoverage['/compiler.js'].lineData[119] = 0;
  _$jscoverage['/compiler.js'].lineData[120] = 0;
  _$jscoverage['/compiler.js'].lineData[123] = 0;
  _$jscoverage['/compiler.js'].lineData[126] = 0;
  _$jscoverage['/compiler.js'].lineData[128] = 0;
  _$jscoverage['/compiler.js'].lineData[132] = 0;
  _$jscoverage['/compiler.js'].lineData[133] = 0;
  _$jscoverage['/compiler.js'].lineData[134] = 0;
  _$jscoverage['/compiler.js'].lineData[135] = 0;
  _$jscoverage['/compiler.js'].lineData[136] = 0;
  _$jscoverage['/compiler.js'].lineData[138] = 0;
  _$jscoverage['/compiler.js'].lineData[139] = 0;
  _$jscoverage['/compiler.js'].lineData[142] = 0;
  _$jscoverage['/compiler.js'].lineData[143] = 0;
  _$jscoverage['/compiler.js'].lineData[144] = 0;
  _$jscoverage['/compiler.js'].lineData[150] = 0;
  _$jscoverage['/compiler.js'].lineData[154] = 0;
  _$jscoverage['/compiler.js'].lineData[157] = 0;
  _$jscoverage['/compiler.js'].lineData[158] = 0;
  _$jscoverage['/compiler.js'].lineData[159] = 0;
  _$jscoverage['/compiler.js'].lineData[161] = 0;
  _$jscoverage['/compiler.js'].lineData[162] = 0;
  _$jscoverage['/compiler.js'].lineData[168] = 0;
  _$jscoverage['/compiler.js'].lineData[169] = 0;
  _$jscoverage['/compiler.js'].lineData[174] = 0;
  _$jscoverage['/compiler.js'].lineData[175] = 0;
  _$jscoverage['/compiler.js'].lineData[177] = 0;
  _$jscoverage['/compiler.js'].lineData[178] = 0;
  _$jscoverage['/compiler.js'].lineData[180] = 0;
  _$jscoverage['/compiler.js'].lineData[181] = 0;
  _$jscoverage['/compiler.js'].lineData[182] = 0;
  _$jscoverage['/compiler.js'].lineData[183] = 0;
  _$jscoverage['/compiler.js'].lineData[184] = 0;
  _$jscoverage['/compiler.js'].lineData[185] = 0;
  _$jscoverage['/compiler.js'].lineData[186] = 0;
  _$jscoverage['/compiler.js'].lineData[188] = 0;
  _$jscoverage['/compiler.js'].lineData[191] = 0;
  _$jscoverage['/compiler.js'].lineData[192] = 0;
  _$jscoverage['/compiler.js'].lineData[193] = 0;
  _$jscoverage['/compiler.js'].lineData[194] = 0;
  _$jscoverage['/compiler.js'].lineData[195] = 0;
  _$jscoverage['/compiler.js'].lineData[196] = 0;
  _$jscoverage['/compiler.js'].lineData[197] = 0;
  _$jscoverage['/compiler.js'].lineData[199] = 0;
  _$jscoverage['/compiler.js'].lineData[202] = 0;
  _$jscoverage['/compiler.js'].lineData[208] = 0;
  _$jscoverage['/compiler.js'].lineData[209] = 0;
  _$jscoverage['/compiler.js'].lineData[217] = 0;
  _$jscoverage['/compiler.js'].lineData[218] = 0;
  _$jscoverage['/compiler.js'].lineData[219] = 0;
  _$jscoverage['/compiler.js'].lineData[221] = 0;
  _$jscoverage['/compiler.js'].lineData[222] = 0;
  _$jscoverage['/compiler.js'].lineData[223] = 0;
  _$jscoverage['/compiler.js'].lineData[224] = 0;
  _$jscoverage['/compiler.js'].lineData[225] = 0;
  _$jscoverage['/compiler.js'].lineData[226] = 0;
  _$jscoverage['/compiler.js'].lineData[231] = 0;
  _$jscoverage['/compiler.js'].lineData[233] = 0;
  _$jscoverage['/compiler.js'].lineData[238] = 0;
  _$jscoverage['/compiler.js'].lineData[239] = 0;
  _$jscoverage['/compiler.js'].lineData[242] = 0;
  _$jscoverage['/compiler.js'].lineData[243] = 0;
  _$jscoverage['/compiler.js'].lineData[244] = 0;
  _$jscoverage['/compiler.js'].lineData[246] = 0;
  _$jscoverage['/compiler.js'].lineData[248] = 0;
  _$jscoverage['/compiler.js'].lineData[249] = 0;
  _$jscoverage['/compiler.js'].lineData[252] = 0;
  _$jscoverage['/compiler.js'].lineData[256] = 0;
  _$jscoverage['/compiler.js'].lineData[257] = 0;
  _$jscoverage['/compiler.js'].lineData[263] = 0;
  _$jscoverage['/compiler.js'].lineData[269] = 0;
  _$jscoverage['/compiler.js'].lineData[283] = 0;
  _$jscoverage['/compiler.js'].lineData[284] = 0;
  _$jscoverage['/compiler.js'].lineData[293] = 0;
  _$jscoverage['/compiler.js'].lineData[300] = 0;
  _$jscoverage['/compiler.js'].lineData[307] = 0;
  _$jscoverage['/compiler.js'].lineData[312] = 0;
  _$jscoverage['/compiler.js'].lineData[313] = 0;
  _$jscoverage['/compiler.js'].lineData[315] = 0;
  _$jscoverage['/compiler.js'].lineData[316] = 0;
  _$jscoverage['/compiler.js'].lineData[318] = 0;
  _$jscoverage['/compiler.js'].lineData[320] = 0;
  _$jscoverage['/compiler.js'].lineData[329] = 0;
  _$jscoverage['/compiler.js'].lineData[333] = 0;
  _$jscoverage['/compiler.js'].lineData[340] = 0;
  _$jscoverage['/compiler.js'].lineData[342] = 0;
  _$jscoverage['/compiler.js'].lineData[343] = 0;
  _$jscoverage['/compiler.js'].lineData[345] = 0;
  _$jscoverage['/compiler.js'].lineData[347] = 0;
  _$jscoverage['/compiler.js'].lineData[355] = 0;
  _$jscoverage['/compiler.js'].lineData[362] = 0;
  _$jscoverage['/compiler.js'].lineData[363] = 0;
  _$jscoverage['/compiler.js'].lineData[369] = 0;
  _$jscoverage['/compiler.js'].lineData[376] = 0;
  _$jscoverage['/compiler.js'].lineData[384] = 0;
  _$jscoverage['/compiler.js'].lineData[393] = 0;
  _$jscoverage['/compiler.js'].lineData[394] = 0;
  _$jscoverage['/compiler.js'].lineData[405] = 0;
  _$jscoverage['/compiler.js'].lineData[406] = 0;
  _$jscoverage['/compiler.js'].lineData[407] = 0;
  _$jscoverage['/compiler.js'].lineData[416] = 0;
  _$jscoverage['/compiler.js'].lineData[417] = 0;
  _$jscoverage['/compiler.js'].lineData[419] = 0;
  _$jscoverage['/compiler.js'].lineData[420] = 0;
  _$jscoverage['/compiler.js'].lineData[422] = 0;
  _$jscoverage['/compiler.js'].lineData[432] = 0;
}
if (! _$jscoverage['/compiler.js'].functionData) {
  _$jscoverage['/compiler.js'].functionData = [];
  _$jscoverage['/compiler.js'].functionData[0] = 0;
  _$jscoverage['/compiler.js'].functionData[1] = 0;
  _$jscoverage['/compiler.js'].functionData[2] = 0;
  _$jscoverage['/compiler.js'].functionData[3] = 0;
  _$jscoverage['/compiler.js'].functionData[4] = 0;
  _$jscoverage['/compiler.js'].functionData[5] = 0;
  _$jscoverage['/compiler.js'].functionData[6] = 0;
  _$jscoverage['/compiler.js'].functionData[7] = 0;
  _$jscoverage['/compiler.js'].functionData[8] = 0;
  _$jscoverage['/compiler.js'].functionData[9] = 0;
  _$jscoverage['/compiler.js'].functionData[10] = 0;
  _$jscoverage['/compiler.js'].functionData[11] = 0;
  _$jscoverage['/compiler.js'].functionData[12] = 0;
  _$jscoverage['/compiler.js'].functionData[13] = 0;
  _$jscoverage['/compiler.js'].functionData[14] = 0;
  _$jscoverage['/compiler.js'].functionData[15] = 0;
  _$jscoverage['/compiler.js'].functionData[16] = 0;
  _$jscoverage['/compiler.js'].functionData[17] = 0;
  _$jscoverage['/compiler.js'].functionData[18] = 0;
  _$jscoverage['/compiler.js'].functionData[19] = 0;
  _$jscoverage['/compiler.js'].functionData[20] = 0;
  _$jscoverage['/compiler.js'].functionData[21] = 0;
  _$jscoverage['/compiler.js'].functionData[22] = 0;
  _$jscoverage['/compiler.js'].functionData[23] = 0;
  _$jscoverage['/compiler.js'].functionData[24] = 0;
  _$jscoverage['/compiler.js'].functionData[25] = 0;
}
if (! _$jscoverage['/compiler.js'].branchData) {
  _$jscoverage['/compiler.js'].branchData = {};
  _$jscoverage['/compiler.js'].branchData['22'] = [];
  _$jscoverage['/compiler.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['42'] = [];
  _$jscoverage['/compiler.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['50'] = [];
  _$jscoverage['/compiler.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['83'] = [];
  _$jscoverage['/compiler.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['83'][2] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['83'][3] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['84'] = [];
  _$jscoverage['/compiler.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['100'] = [];
  _$jscoverage['/compiler.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['106'] = [];
  _$jscoverage['/compiler.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['107'] = [];
  _$jscoverage['/compiler.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['112'] = [];
  _$jscoverage['/compiler.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['114'] = [];
  _$jscoverage['/compiler.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['117'] = [];
  _$jscoverage['/compiler.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['135'] = [];
  _$jscoverage['/compiler.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['158'] = [];
  _$jscoverage['/compiler.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['180'] = [];
  _$jscoverage['/compiler.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['191'] = [];
  _$jscoverage['/compiler.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['221'] = [];
  _$jscoverage['/compiler.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['224'] = [];
  _$jscoverage['/compiler.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['231'] = [];
  _$jscoverage['/compiler.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['231'][2] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['231'][3] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['238'] = [];
  _$jscoverage['/compiler.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['242'] = [];
  _$jscoverage['/compiler.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['243'] = [];
  _$jscoverage['/compiler.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['248'] = [];
  _$jscoverage['/compiler.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['256'] = [];
  _$jscoverage['/compiler.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['315'] = [];
  _$jscoverage['/compiler.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['416'] = [];
  _$jscoverage['/compiler.js'].branchData['416'][1] = new BranchData();
}
_$jscoverage['/compiler.js'].branchData['416'][1].init(17, 5, '!name');
function visit71_416_1(result) {
  _$jscoverage['/compiler.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['315'][1].init(370, 8, 'newParts');
function visit70_315_1(result) {
  _$jscoverage['/compiler.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['256'][1].init(1981, 6, 'idName');
function visit69_256_1(result) {
  _$jscoverage['/compiler.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['248'][1].init(1599, 5, 'block');
function visit68_248_1(result) {
  _$jscoverage['/compiler.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['243'][1].init(17, 5, 'block');
function visit67_243_1(result) {
  _$jscoverage['/compiler.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['242'][1].init(1185, 26, 'idString in nativeCommands');
function visit66_242_1(result) {
  _$jscoverage['/compiler.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['238'][1].init(1111, 6, '!block');
function visit65_238_1(result) {
  _$jscoverage['/compiler.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['231'][3].init(812, 21, 'idString === \'extend\'');
function visit64_231_3(result) {
  _$jscoverage['/compiler.js'].branchData['231'][3].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['231'][2].init(786, 22, 'idString === \'include\'');
function visit63_231_2(result) {
  _$jscoverage['/compiler.js'].branchData['231'][2].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['231'][1].init(786, 47, 'idString === \'include\' || idString === \'extend\'');
function visit62_231_1(result) {
  _$jscoverage['/compiler.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['224'][1].init(163, 19, 'programNode.inverse');
function visit61_224_1(result) {
  _$jscoverage['/compiler.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['221'][1].init(367, 5, 'block');
function visit60_221_1(result) {
  _$jscoverage['/compiler.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['191'][1].init(764, 4, 'hash');
function visit59_191_1(result) {
  _$jscoverage['/compiler.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['180'][1].init(289, 6, 'params');
function visit58_180_1(result) {
  _$jscoverage['/compiler.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['158'][1].init(708, 7, 'i < len');
function visit57_158_1(result) {
  _$jscoverage['/compiler.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['135'][1].init(127, 7, 'i < len');
function visit56_135_1(result) {
  _$jscoverage['/compiler.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['117'][1].init(100, 10, 'idPartType');
function visit55_117_1(result) {
  _$jscoverage['/compiler.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['114'][1].init(71, 5, 'i < l');
function visit54_114_1(result) {
  _$jscoverage['/compiler.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['112'][1].init(336, 5, 'check');
function visit53_112_1(result) {
  _$jscoverage['/compiler.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['107'][1].init(17, 15, 'idParts[i].type');
function visit52_107_1(result) {
  _$jscoverage['/compiler.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['106'][1].init(201, 5, 'i < l');
function visit51_106_1(result) {
  _$jscoverage['/compiler.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['100'][1].init(13, 20, 'idParts.length === 1');
function visit50_100_1(result) {
  _$jscoverage['/compiler.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['84'][1].init(34, 13, 'type === \'&&\'');
function visit49_84_1(result) {
  _$jscoverage['/compiler.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['83'][3].init(527, 13, 'type === \'||\'');
function visit48_83_3(result) {
  _$jscoverage['/compiler.js'].branchData['83'][3].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['83'][2].init(510, 13, 'type === \'&&\'');
function visit47_83_2(result) {
  _$jscoverage['/compiler.js'].branchData['83'][2].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['83'][1].init(510, 30, 'type === \'&&\' || type === \'||\'');
function visit46_83_1(result) {
  _$jscoverage['/compiler.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['50'][1].init(13, 6, 'isCode');
function visit45_50_1(result) {
  _$jscoverage['/compiler.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['42'][1].init(87, 12, 'm.length % 2');
function visit44_42_1(result) {
  _$jscoverage['/compiler.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['22'][1].init(28, 27, 'S.indexOf(t, keywords) > -1');
function visit43_22_1(result) {
  _$jscoverage['/compiler.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/compiler.js'].functionData[0]++;
  _$jscoverage['/compiler.js'].lineData[7]++;
  require('util');
  _$jscoverage['/compiler.js'].lineData[8]++;
  var XTemplateRuntime = require('xtemplate/runtime');
  _$jscoverage['/compiler.js'].lineData[9]++;
  var parser = require('./compiler/parser');
  _$jscoverage['/compiler.js'].lineData[10]++;
  parser.yy = require('./compiler/ast');
  _$jscoverage['/compiler.js'].lineData[11]++;
  var nativeCode = '';
  _$jscoverage['/compiler.js'].lineData[12]++;
  var t;
  _$jscoverage['/compiler.js'].lineData[13]++;
  var keywords = ['if', 'with', 'debugger'];
  _$jscoverage['/compiler.js'].lineData[14]++;
  var nativeCommands = XTemplateRuntime.nativeCommands;
  _$jscoverage['/compiler.js'].lineData[15]++;
  var nativeUtils = XTemplateRuntime.utils;
  _$jscoverage['/compiler.js'].lineData[17]++;
  for (t in nativeUtils) {
    _$jscoverage['/compiler.js'].lineData[18]++;
    nativeCode += t + 'Util = utils.' + t + ',';
  }
  _$jscoverage['/compiler.js'].lineData[21]++;
  for (t in nativeCommands) {
    _$jscoverage['/compiler.js'].lineData[22]++;
    nativeCode += t + (visit43_22_1(S.indexOf(t, keywords) > -1) ? ('Command = nativeCommands["' + t + '"]') : ('Command = nativeCommands.' + t)) + ',';
  }
  _$jscoverage['/compiler.js'].lineData[27]++;
  nativeCode = nativeCode.slice(0, -1);
  _$jscoverage['/compiler.js'].lineData[29]++;
  var doubleReg = /\\*"/g, singleReg = /\\*'/g, arrayPush = [].push, variableId = 0, xtemplateId = 0;
  _$jscoverage['/compiler.js'].lineData[35]++;
  function guid(str) {
    _$jscoverage['/compiler.js'].functionData[1]++;
    _$jscoverage['/compiler.js'].lineData[36]++;
    return str + (variableId++);
  }
  _$jscoverage['/compiler.js'].lineData[39]++;
  function escapeSingleQuoteInCodeString(str, isDouble) {
    _$jscoverage['/compiler.js'].functionData[2]++;
    _$jscoverage['/compiler.js'].lineData[40]++;
    return str.replace(isDouble ? doubleReg : singleReg, function(m) {
  _$jscoverage['/compiler.js'].functionData[3]++;
  _$jscoverage['/compiler.js'].lineData[42]++;
  if (visit44_42_1(m.length % 2)) {
    _$jscoverage['/compiler.js'].lineData[43]++;
    m = '\\' + m;
  }
  _$jscoverage['/compiler.js'].lineData[45]++;
  return m;
});
  }
  _$jscoverage['/compiler.js'].lineData[49]++;
  function escapeString(str, isCode) {
    _$jscoverage['/compiler.js'].functionData[4]++;
    _$jscoverage['/compiler.js'].lineData[50]++;
    if (visit45_50_1(isCode)) {
      _$jscoverage['/compiler.js'].lineData[51]++;
      str = escapeSingleQuoteInCodeString(str, 0);
    } else {
      _$jscoverage['/compiler.js'].lineData[54]++;
      str = str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }
    _$jscoverage['/compiler.js'].lineData[57]++;
    str = str.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    _$jscoverage['/compiler.js'].lineData[60]++;
    return str;
  }
  _$jscoverage['/compiler.js'].lineData[63]++;
  function pushToArray(to, from) {
    _$jscoverage['/compiler.js'].functionData[5]++;
    _$jscoverage['/compiler.js'].lineData[64]++;
    arrayPush.apply(to, from);
  }
  _$jscoverage['/compiler.js'].lineData[67]++;
  function opExpression(e) {
    _$jscoverage['/compiler.js'].functionData[6]++;
    _$jscoverage['/compiler.js'].lineData[68]++;
    var source = [], type = e.opType, exp1, exp2, code1Source, code2Source, code1 = xtplAstToJs[e.op1.type](e.op1), code2 = xtplAstToJs[e.op2.type](e.op2);
    _$jscoverage['/compiler.js'].lineData[76]++;
    exp1 = code1.exp;
    _$jscoverage['/compiler.js'].lineData[77]++;
    exp2 = code2.exp;
    _$jscoverage['/compiler.js'].lineData[78]++;
    var exp = guid('exp');
    _$jscoverage['/compiler.js'].lineData[79]++;
    code1Source = code1.source;
    _$jscoverage['/compiler.js'].lineData[80]++;
    code2Source = code2.source;
    _$jscoverage['/compiler.js'].lineData[81]++;
    pushToArray(source, code1Source);
    _$jscoverage['/compiler.js'].lineData[82]++;
    source.push('var ' + exp + ' = ' + exp1 + ';');
    _$jscoverage['/compiler.js'].lineData[83]++;
    if (visit46_83_1(visit47_83_2(type === '&&') || visit48_83_3(type === '||'))) {
      _$jscoverage['/compiler.js'].lineData[84]++;
      source.push('if(' + (visit49_84_1(type === '&&') ? '' : '!') + '(' + exp1 + ')){');
      _$jscoverage['/compiler.js'].lineData[85]++;
      pushToArray(source, code2Source);
      _$jscoverage['/compiler.js'].lineData[86]++;
      source.push(exp + ' = ' + exp2 + ';');
      _$jscoverage['/compiler.js'].lineData[87]++;
      source.push('}');
    } else {
      _$jscoverage['/compiler.js'].lineData[89]++;
      pushToArray(source, code2Source);
      _$jscoverage['/compiler.js'].lineData[90]++;
      source.push(exp + ' = ' + '(' + exp1 + ')' + type + '(' + exp2 + ');');
    }
    _$jscoverage['/compiler.js'].lineData[92]++;
    return {
  exp: exp, 
  source: source};
  }
  _$jscoverage['/compiler.js'].lineData[99]++;
  function getIdStringFromIdParts(source, idParts) {
    _$jscoverage['/compiler.js'].functionData[7]++;
    _$jscoverage['/compiler.js'].lineData[100]++;
    if (visit50_100_1(idParts.length === 1)) {
      _$jscoverage['/compiler.js'].lineData[101]++;
      return null;
    }
    _$jscoverage['/compiler.js'].lineData[103]++;
    var i, l, idPart, idPartType, check = 0, nextIdNameCode;
    _$jscoverage['/compiler.js'].lineData[106]++;
    for (i = 0 , l = idParts.length; visit51_106_1(i < l); i++) {
      _$jscoverage['/compiler.js'].lineData[107]++;
      if (visit52_107_1(idParts[i].type)) {
        _$jscoverage['/compiler.js'].lineData[108]++;
        check = 1;
        _$jscoverage['/compiler.js'].lineData[109]++;
        break;
      }
    }
    _$jscoverage['/compiler.js'].lineData[112]++;
    if (visit53_112_1(check)) {
      _$jscoverage['/compiler.js'].lineData[113]++;
      var ret = [];
      _$jscoverage['/compiler.js'].lineData[114]++;
      for (i = 0 , l = idParts.length; visit54_114_1(i < l); i++) {
        _$jscoverage['/compiler.js'].lineData[115]++;
        idPart = idParts[i];
        _$jscoverage['/compiler.js'].lineData[116]++;
        idPartType = idPart.type;
        _$jscoverage['/compiler.js'].lineData[117]++;
        if (visit55_117_1(idPartType)) {
          _$jscoverage['/compiler.js'].lineData[118]++;
          nextIdNameCode = xtplAstToJs[idPartType](idPart);
          _$jscoverage['/compiler.js'].lineData[119]++;
          pushToArray(source, nextIdNameCode.source);
          _$jscoverage['/compiler.js'].lineData[120]++;
          ret.push(nextIdNameCode.exp);
        } else {
          _$jscoverage['/compiler.js'].lineData[123]++;
          ret.push('"' + idPart + '"');
        }
      }
      _$jscoverage['/compiler.js'].lineData[126]++;
      return ret;
    } else {
      _$jscoverage['/compiler.js'].lineData[128]++;
      return null;
    }
  }
  _$jscoverage['/compiler.js'].lineData[132]++;
  function genFunction(statements) {
    _$jscoverage['/compiler.js'].functionData[8]++;
    _$jscoverage['/compiler.js'].lineData[133]++;
    var source = [];
    _$jscoverage['/compiler.js'].lineData[134]++;
    source.push('function(scope, buffer) {\n');
    _$jscoverage['/compiler.js'].lineData[135]++;
    for (var i = 0, len = statements.length; visit56_135_1(i < len); i++) {
      _$jscoverage['/compiler.js'].lineData[136]++;
      pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
    }
    _$jscoverage['/compiler.js'].lineData[138]++;
    source.push('\n return buffer; }');
    _$jscoverage['/compiler.js'].lineData[139]++;
    return source;
  }
  _$jscoverage['/compiler.js'].lineData[142]++;
  function genTopFunction(statements) {
    _$jscoverage['/compiler.js'].functionData[9]++;
    _$jscoverage['/compiler.js'].lineData[143]++;
    var source = [];
    _$jscoverage['/compiler.js'].lineData[144]++;
    source.push('var engine = this,' + 'moduleWrap,' + 'nativeCommands = engine.nativeCommands,' + 'utils = engine.utils;');
    _$jscoverage['/compiler.js'].lineData[150]++;
    source.push('if("' + S.version + '" !== S.version){' + 'throw new Error("current xtemplate file("+engine.name+")(v' + S.version + ') ' + 'need to be recompiled using current kissy(v"+ S.version+")!");' + '}');
    _$jscoverage['/compiler.js'].lineData[154]++;
    source.push('if (typeof module !== "undefined" && module.kissy) {' + 'moduleWrap = module;' + '}');
    _$jscoverage['/compiler.js'].lineData[157]++;
    source.push('var ' + nativeCode + ';');
    _$jscoverage['/compiler.js'].lineData[158]++;
    for (var i = 0, len = statements.length; visit57_158_1(i < len); i++) {
      _$jscoverage['/compiler.js'].lineData[159]++;
      pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
    }
    _$jscoverage['/compiler.js'].lineData[161]++;
    source.push('return buffer;');
    _$jscoverage['/compiler.js'].lineData[162]++;
    return {
  params: ['scope', 'S', 'buffer', 'payload', 'undefined'], 
  source: source};
  }
  _$jscoverage['/compiler.js'].lineData[168]++;
  function genOptionFromCommand(command, escape) {
    _$jscoverage['/compiler.js'].functionData[10]++;
    _$jscoverage['/compiler.js'].lineData[169]++;
    var source = [], optionName, params, hash;
    _$jscoverage['/compiler.js'].lineData[174]++;
    params = command.params;
    _$jscoverage['/compiler.js'].lineData[175]++;
    hash = command.hash;
    _$jscoverage['/compiler.js'].lineData[177]++;
    optionName = guid('option');
    _$jscoverage['/compiler.js'].lineData[178]++;
    source.push('var ' + optionName + ' = {' + (escape ? 'escape:1' : '') + '};');
    _$jscoverage['/compiler.js'].lineData[180]++;
    if (visit58_180_1(params)) {
      _$jscoverage['/compiler.js'].lineData[181]++;
      var paramsName = guid('params');
      _$jscoverage['/compiler.js'].lineData[182]++;
      source.push('var ' + paramsName + ' = [];');
      _$jscoverage['/compiler.js'].lineData[183]++;
      S.each(params, function(param) {
  _$jscoverage['/compiler.js'].functionData[11]++;
  _$jscoverage['/compiler.js'].lineData[184]++;
  var nextIdNameCode = xtplAstToJs[param.type](param);
  _$jscoverage['/compiler.js'].lineData[185]++;
  pushToArray(source, nextIdNameCode.source);
  _$jscoverage['/compiler.js'].lineData[186]++;
  source.push(paramsName + '.push(' + nextIdNameCode.exp + ');');
});
      _$jscoverage['/compiler.js'].lineData[188]++;
      source.push(optionName + '.params=' + paramsName + ';');
    }
    _$jscoverage['/compiler.js'].lineData[191]++;
    if (visit59_191_1(hash)) {
      _$jscoverage['/compiler.js'].lineData[192]++;
      var hashName = guid('hash');
      _$jscoverage['/compiler.js'].lineData[193]++;
      source.push('var ' + hashName + ' = {};');
      _$jscoverage['/compiler.js'].lineData[194]++;
      S.each(hash.value, function(v, key) {
  _$jscoverage['/compiler.js'].functionData[12]++;
  _$jscoverage['/compiler.js'].lineData[195]++;
  var nextIdNameCode = xtplAstToJs[v.type](v);
  _$jscoverage['/compiler.js'].lineData[196]++;
  pushToArray(source, nextIdNameCode.source);
  _$jscoverage['/compiler.js'].lineData[197]++;
  source.push(hashName + '["' + key + '"] = ' + nextIdNameCode.exp + ';');
});
      _$jscoverage['/compiler.js'].lineData[199]++;
      source.push(optionName + '.hash=' + hashName + ';');
    }
    _$jscoverage['/compiler.js'].lineData[202]++;
    return {
  exp: optionName, 
  source: source};
  }
  _$jscoverage['/compiler.js'].lineData[208]++;
  function generateCommand(command, escape, block) {
    _$jscoverage['/compiler.js'].functionData[13]++;
    _$jscoverage['/compiler.js'].lineData[209]++;
    var source = [], commandConfigCode, optionName, id = command.id, idName, idString = id.string, inverseFn;
    _$jscoverage['/compiler.js'].lineData[217]++;
    commandConfigCode = genOptionFromCommand(command, escape);
    _$jscoverage['/compiler.js'].lineData[218]++;
    optionName = commandConfigCode.exp;
    _$jscoverage['/compiler.js'].lineData[219]++;
    pushToArray(source, commandConfigCode.source);
    _$jscoverage['/compiler.js'].lineData[221]++;
    if (visit60_221_1(block)) {
      _$jscoverage['/compiler.js'].lineData[222]++;
      var programNode = block.program;
      _$jscoverage['/compiler.js'].lineData[223]++;
      source.push(optionName + '.fn=' + genFunction(programNode.statements).join('\n') + ';');
      _$jscoverage['/compiler.js'].lineData[224]++;
      if (visit61_224_1(programNode.inverse)) {
        _$jscoverage['/compiler.js'].lineData[225]++;
        inverseFn = genFunction(programNode.inverse).join('\n');
        _$jscoverage['/compiler.js'].lineData[226]++;
        source.push(optionName + '.inverse=' + inverseFn + ';');
      }
    }
    _$jscoverage['/compiler.js'].lineData[231]++;
    if (visit62_231_1(visit63_231_2(idString === 'include') || visit64_231_3(idString === 'extend'))) {
      _$jscoverage['/compiler.js'].lineData[233]++;
      source.push('if(moduleWrap) {re' + 'quire("' + command.params[0].value + '");' + optionName + '.params[0] = moduleWrap.resolve(' + optionName + '.params[0]);' + '}');
    }
    _$jscoverage['/compiler.js'].lineData[238]++;
    if (visit65_238_1(!block)) {
      _$jscoverage['/compiler.js'].lineData[239]++;
      idName = guid('commandRet');
    }
    _$jscoverage['/compiler.js'].lineData[242]++;
    if (visit66_242_1(idString in nativeCommands)) {
      _$jscoverage['/compiler.js'].lineData[243]++;
      if (visit67_243_1(block)) {
        _$jscoverage['/compiler.js'].lineData[244]++;
        source.push('buffer = ' + idString + 'Command.call(engine, scope, ' + optionName + ', buffer, ' + id.lineNumber + ', payload);');
      } else {
        _$jscoverage['/compiler.js'].lineData[246]++;
        source.push('var ' + idName + ' = ' + idString + 'Command.call(engine, scope, ' + optionName + ', buffer, ' + id.lineNumber + ', payload);');
      }
    } else {
      _$jscoverage['/compiler.js'].lineData[248]++;
      if (visit68_248_1(block)) {
        _$jscoverage['/compiler.js'].lineData[249]++;
        source.push('buffer = callCommandUtil(engine, scope, ' + optionName + ', buffer, ' + '"' + idString + '", ' + id.lineNumber + ');');
      } else {
        _$jscoverage['/compiler.js'].lineData[252]++;
        source.push('var ' + idName + ' = callCommandUtil(engine, scope, ' + optionName + ', buffer, ' + '"' + idString + '", ' + id.lineNumber + ');');
      }
    }
    _$jscoverage['/compiler.js'].lineData[256]++;
    if (visit69_256_1(idName)) {
      _$jscoverage['/compiler.js'].lineData[257]++;
      source.push('if(' + idName + ' && ' + idName + '.isBuffer){' + 'buffer = ' + idName + ';' + idName + ' = undefined;' + '}');
    }
    _$jscoverage['/compiler.js'].lineData[263]++;
    return {
  exp: idName, 
  source: source};
  }
  _$jscoverage['/compiler.js'].lineData[269]++;
  var xtplAstToJs = {
  conditionalOrExpression: opExpression, 
  conditionalAndExpression: opExpression, 
  relationalExpression: opExpression, 
  equalityExpression: opExpression, 
  additiveExpression: opExpression, 
  multiplicativeExpression: opExpression, 
  unaryExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[14]++;
  _$jscoverage['/compiler.js'].lineData[283]++;
  var code = xtplAstToJs[e.value.type](e.value);
  _$jscoverage['/compiler.js'].lineData[284]++;
  return {
  exp: e.unaryType + '(' + code.exp + ')', 
  source: code.source};
}, 
  string: function(e) {
  _$jscoverage['/compiler.js'].functionData[15]++;
  _$jscoverage['/compiler.js'].lineData[293]++;
  return {
  exp: "'" + escapeString(e.value, true) + "'", 
  source: []};
}, 
  number: function(e) {
  _$jscoverage['/compiler.js'].functionData[16]++;
  _$jscoverage['/compiler.js'].lineData[300]++;
  return {
  exp: e.value, 
  source: []};
}, 
  id: function(idNode) {
  _$jscoverage['/compiler.js'].functionData[17]++;
  _$jscoverage['/compiler.js'].lineData[307]++;
  var source = [], depth = idNode.depth, idParts = idNode.parts, idName = guid('id');
  _$jscoverage['/compiler.js'].lineData[312]++;
  var newParts = getIdStringFromIdParts(source, idParts);
  _$jscoverage['/compiler.js'].lineData[313]++;
  var depthParam = depth ? (',' + depth) : '';
  _$jscoverage['/compiler.js'].lineData[315]++;
  if (visit70_315_1(newParts)) {
    _$jscoverage['/compiler.js'].lineData[316]++;
    source.push('var ' + idName + ' = scope.resolve([' + newParts.join(',') + ']' + depthParam + ');');
  } else {
    _$jscoverage['/compiler.js'].lineData[318]++;
    source.push('var ' + idName + ' = scope.resolve(["' + idParts.join('","') + '"]' + depthParam + ');');
  }
  _$jscoverage['/compiler.js'].lineData[320]++;
  return {
  exp: idName, 
  source: source};
}, 
  command: generateCommand, 
  blockStatement: function(block) {
  _$jscoverage['/compiler.js'].functionData[18]++;
  _$jscoverage['/compiler.js'].lineData[329]++;
  return generateCommand(block.command, block.escape, block);
}, 
  expressionStatement: function(expressionStatement) {
  _$jscoverage['/compiler.js'].functionData[19]++;
  _$jscoverage['/compiler.js'].lineData[333]++;
  var source = [], escape = expressionStatement.escape, code, expression = expressionStatement.value, type = expression.type, expressionOrVariable;
  _$jscoverage['/compiler.js'].lineData[340]++;
  code = xtplAstToJs[type](expression, escape);
  _$jscoverage['/compiler.js'].lineData[342]++;
  pushToArray(source, code.source);
  _$jscoverage['/compiler.js'].lineData[343]++;
  expressionOrVariable = code.exp;
  _$jscoverage['/compiler.js'].lineData[345]++;
  source.push('buffer.write(' + expressionOrVariable + ',' + !!escape + ');');
  _$jscoverage['/compiler.js'].lineData[347]++;
  return {
  exp: '', 
  source: source};
}, 
  contentStatement: function(contentStatement) {
  _$jscoverage['/compiler.js'].functionData[20]++;
  _$jscoverage['/compiler.js'].lineData[355]++;
  return {
  exp: '', 
  source: ["buffer.write('" + escapeString(contentStatement.value, 0) + "');"]};
}};
  _$jscoverage['/compiler.js'].lineData[362]++;
  xtplAstToJs['boolean'] = function(e) {
  _$jscoverage['/compiler.js'].functionData[21]++;
  _$jscoverage['/compiler.js'].lineData[363]++;
  return {
  exp: e.value, 
  source: []};
};
  _$jscoverage['/compiler.js'].lineData[369]++;
  var compiler;
  _$jscoverage['/compiler.js'].lineData[376]++;
  compiler = {
  parse: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[22]++;
  _$jscoverage['/compiler.js'].lineData[384]++;
  return parser.parse(name, tpl);
}, 
  compileToStr: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[23]++;
  _$jscoverage['/compiler.js'].lineData[393]++;
  var func = compiler.compile(tpl, name);
  _$jscoverage['/compiler.js'].lineData[394]++;
  return 'function(' + func.params.join(',') + '){\n' + func.source.join('\n') + '}';
}, 
  compile: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[24]++;
  _$jscoverage['/compiler.js'].lineData[405]++;
  var root = compiler.parse(name, tpl);
  _$jscoverage['/compiler.js'].lineData[406]++;
  variableId = 0;
  _$jscoverage['/compiler.js'].lineData[407]++;
  return genTopFunction(root.statements);
}, 
  compileToFn: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[25]++;
  _$jscoverage['/compiler.js'].lineData[416]++;
  if (visit71_416_1(!name)) {
    _$jscoverage['/compiler.js'].lineData[417]++;
    name = 'xtemplate' + (xtemplateId++);
  }
  _$jscoverage['/compiler.js'].lineData[419]++;
  var code = compiler.compile(tpl, name);
  _$jscoverage['/compiler.js'].lineData[420]++;
  var sourceURL = 'sourceURL=' + name + '.js';
  _$jscoverage['/compiler.js'].lineData[422]++;
  return Function.apply(null, [].concat(code.params).concat(code.source.join('\n') + '\n//@ ' + sourceURL + '\n//# ' + sourceURL));
}};
  _$jscoverage['/compiler.js'].lineData[432]++;
  return compiler;
});
