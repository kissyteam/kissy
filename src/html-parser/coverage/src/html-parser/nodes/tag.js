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
if (! _$jscoverage['/html-parser/nodes/tag.js']) {
  _$jscoverage['/html-parser/nodes/tag.js'] = {};
  _$jscoverage['/html-parser/nodes/tag.js'].lineData = [];
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[6] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[7] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[8] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[9] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[10] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[12] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[13] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[14] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[15] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[16] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[28] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[29] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[31] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[32] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[33] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[34] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[35] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[37] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[38] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[40] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[42] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[45] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[46] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[48] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[49] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[50] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[53] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[56] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[57] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[61] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[65] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[67] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[68] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[71] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[72] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[73] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[74] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[75] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[76] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[77] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[79] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[80] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[81] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[82] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[83] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[85] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[89] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[91] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[93] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[94] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[95] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[97] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[101] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[103] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[104] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[106] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[119] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[123] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[124] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[125] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[126] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[132] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[134] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[135] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[137] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[138] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[140] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[141] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[142] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[145] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[149] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[153] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[154] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[158] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[160] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[161] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[165] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[167] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[168] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[169] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[173] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[174] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[178] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[180] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[181] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[185] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[187] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[188] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[190] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[195] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[196] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[200] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[202] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[203] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[207] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[208] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[212] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[213] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[214] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[216] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[221] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[222] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[223] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[224] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[232] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[233] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[234] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[235] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[236] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[238] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[239] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[240] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[242] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[252] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[258] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[259] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[260] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[263] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[264] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[267] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[269] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[270] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[273] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[275] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[277] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[278] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[282] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[283] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[287] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[288] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[289] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[293] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[294] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[295] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[299] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[302] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[303] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[304] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[305] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[306] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[308] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[309] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[311] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[313] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[314] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[317] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[321] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[323] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[324] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[326] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[335] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[338] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[339] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[344] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[345] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[346] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[350] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[351] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[352] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[353] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[354] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[358] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[361] = 0;
}
if (! _$jscoverage['/html-parser/nodes/tag.js'].functionData) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData = [];
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[0] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[1] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[2] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[3] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[4] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[5] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[6] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[7] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[8] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[9] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[10] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[11] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[12] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[13] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[14] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[15] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[16] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[17] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[18] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[19] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[20] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[21] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[22] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[23] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[24] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[25] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[26] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[27] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[28] = 0;
}
if (! _$jscoverage['/html-parser/nodes/tag.js'].branchData) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData = {};
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['34'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['37'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['45'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['54'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['56'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['61'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['75'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['79'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['80'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['94'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['125'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['131'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['131'][2] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['134'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['137'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['140'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['141'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['187'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['208'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['213'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['222'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['233'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['258'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['267'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['269'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['277'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['282'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['287'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['293'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['303'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['306'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['308'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['313'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['323'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['351'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['352'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['353'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['353'][1] = new BranchData();
}
_$jscoverage['/html-parser/nodes/tag.js'].branchData['353'][1].init(22, 27, 'attributes[i].name === name');
function visit232_353_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['352'][1].init(30, 21, 'i < attributes.length');
function visit231_352_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['351'][1].init(14, 31, 'attributes && attributes.length');
function visit230_351_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['323'][1].init(2200, 18, '!self.isSelfClosed');
function visit229_323_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['313'][1].init(309, 40, 'filter.onAttribute(attr, self) === false');
function visit228_313_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['308'][1].init(76, 52, '!(attrName = filter.onAttributeName(attrName, self))');
function visit227_308_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['306'][1].init(104, 6, 'filter');
function visit226_306_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['303'][1].init(1470, 21, 'i < attributes.length');
function visit225_303_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['293'][1].init(734, 13, '!self.tagName');
function visit224_293_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['287'][1].init(531, 19, 'self.nodeType !== 1');
function visit223_287_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['282'][1].init(398, 3, 'tmp');
function visit222_282_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['277'][1].init(281, 13, 'tmp === false');
function visit221_277_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['269'][1].init(80, 38, '!(tagName = filter.onTagName(tagName))');
function visit220_269_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['267'][1].init(439, 6, 'filter');
function visit219_267_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['258'][1].init(182, 22, 'tagName === \'!doctype\'');
function visit218_258_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['233'][1].init(48, 24, '!self.isChildrenFiltered');
function visit217_233_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['222'][1].init(86, 4, 'attr');
function visit216_222_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['213'][1].init(86, 4, 'attr');
function visit215_213_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['208'][1].init(89, 18, 'attr && attr.value');
function visit214_208_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['187'][1].init(125, 28, 'index === sibling.length - 1');
function visit213_187_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['141'][1].init(22, 45, '!this.attributes[i].equals(tag.attributes[i])');
function visit212_141_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['140'][1].init(335, 26, 'i < this.attributes.length');
function visit211_140_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['137'][1].init(212, 48, 'this.attributes.length !== tag.attributes.length');
function visit210_137_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['134'][1].init(119, 30, 'this.nodeType !== tag.nodeType');
function visit209_134_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['131'][2].init(26, 30, 'this.nodeName !== tag.nodeName');
function visit208_131_2(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['131'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['131'][1].init(18, 38, '!tag || this.nodeName !== tag.nodeName');
function visit207_131_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['125'][1].init(95, 1, 'v');
function visit206_125_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['94'][1].init(181, 18, '!self.isSelfClosed');
function visit205_94_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['80'][1].init(30, 16, 'i < c.length - 1');
function visit204_80_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['79'][1].init(259, 12, 'c.length > 1');
function visit203_79_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['75'][1].init(124, 13, 'c.length >= 1');
function visit202_75_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['61'][1].init(838, 30, 'self.isSelfClosed || lastSlash');
function visit201_61_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['56'][1].init(681, 9, 'lastSlash');
function visit200_56_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['54'][1].init(81, 37, 'lastAttr && /\\/$/.test(lastAttr.name)');
function visit199_54_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['45'][1].init(182, 13, 'attributes[0]');
function visit198_45_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['37'][1].init(213, 24, 'typeof page === \'string\'');
function visit197_37_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['34'][1].init(152, 16, 'attributes || []');
function visit196_34_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[0]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[7]++;
  var Node = require('./node');
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[8]++;
  var Attribute = require('./attribute');
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[9]++;
  var Dtd = require('../dtd');
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[10]++;
  var util = require('util');
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[12]++;
  function createTag(self, tagName, attrs) {
    _$jscoverage['/html-parser/nodes/tag.js'].functionData[1]++;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[13]++;
    self.nodeName = self.tagName = tagName.toLowerCase();
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[14]++;
    self._updateSelfClosed();
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[15]++;
    util.each(attrs, function(v, n) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[2]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[16]++;
  self.setAttribute(n, v);
});
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[28]++;
  function Tag(page, startPosition, endPosition, attributes) {
    _$jscoverage['/html-parser/nodes/tag.js'].functionData[3]++;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[29]++;
    var self = this;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[31]++;
    self.childNodes = [];
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[32]++;
    self.firstChild = null;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[33]++;
    self.lastChild = null;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[34]++;
    self.attributes = visit196_34_1(attributes || []);
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[35]++;
    self.nodeType = 1;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[37]++;
    if (visit197_37_1(typeof page === 'string')) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[38]++;
      createTag.apply(null, [self].concat(util.makeArray(arguments)));
    } else {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[40]++;
      Tag.superclass.constructor.apply(self, arguments);
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[42]++;
      attributes = self.attributes;
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[45]++;
      if (visit198_45_1(attributes[0])) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[46]++;
        self.nodeName = attributes[0].name.toLowerCase();
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[48]++;
        self.tagName = self.nodeName.replace(/\//, '');
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[49]++;
        self._updateSelfClosed();
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[50]++;
        attributes.splice(0, 1);
      }
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[53]++;
      var lastAttr = attributes[attributes.length - 1], lastSlash = !!(visit199_54_1(lastAttr && /\/$/.test(lastAttr.name)));
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[56]++;
      if (visit200_56_1(lastSlash)) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[57]++;
        attributes.length = attributes.length - 1;
      }
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[61]++;
      self.isSelfClosed = visit201_61_1(self.isSelfClosed || lastSlash);
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[65]++;
      self.closed = self.isSelfClosed;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[67]++;
    self.closedStartPosition = -1;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[68]++;
    self.closedEndPosition = -1;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[71]++;
  function refreshChildNodes(self) {
    _$jscoverage['/html-parser/nodes/tag.js'].functionData[4]++;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[72]++;
    var c = self.childNodes;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[73]++;
    self.firstChild = c[0];
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[74]++;
    self.lastChild = c[c.length - 1];
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[75]++;
    if (visit202_75_1(c.length >= 1)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[76]++;
      c[0].nextSibling = c[0].nextSibling = null;
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[77]++;
      c[0].parentNode = self;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[79]++;
    if (visit203_79_1(c.length > 1)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[80]++;
      for (var i = 0; visit204_80_1(i < c.length - 1); i++) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[81]++;
        c[i].nextSibling = c[i + 1];
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[82]++;
        c[i + 1].previousSibling = c[i];
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[83]++;
        c[i + 1].parentNode = self;
      }
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[85]++;
      c[c.length - 1].nextSibling = null;
    }
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[89]++;
  util.extend(Tag, Node, {
  _updateSelfClosed: function() {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[5]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[91]++;
  var self = this;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[93]++;
  self.isSelfClosed = !!(Dtd.$empty[self.nodeName]);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[94]++;
  if (visit205_94_1(!self.isSelfClosed)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[95]++;
    self.isSelfClosed = /\/$/.test(self.nodeName);
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[97]++;
  self.closed = self.isSelfClosed;
}, 
  clone: function() {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[6]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[101]++;
  var ret = new Tag(), attrs = [];
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[103]++;
  util.each(this.attributes, function(a) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[7]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[104]++;
  attrs.push(a.clone());
});
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[106]++;
  util.mix(ret, {
  childNodes: [], 
  firstChild: null, 
  lastChild: null, 
  attributes: attrs, 
  nodeType: this.nodeType, 
  nodeName: this.nodeName, 
  tagName: this.tagName, 
  isSelfClosed: this.isSelfClosed, 
  closed: this.closed, 
  closedStartPosition: this.closedStartPosition, 
  closedEndPosition: this.closedEndPosition});
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[119]++;
  return ret;
}, 
  setTagName: function(v) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[8]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[123]++;
  var self = this;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[124]++;
  self.nodeName = self.tagName = v;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[125]++;
  if (visit206_125_1(v)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[126]++;
    self._updateSelfClosed();
  }
}, 
  equals: function(tag) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[9]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[131]++;
  if (visit207_131_1(!tag || visit208_131_2(this.nodeName !== tag.nodeName))) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[132]++;
    return 0;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[134]++;
  if (visit209_134_1(this.nodeType !== tag.nodeType)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[135]++;
    return 0;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[137]++;
  if (visit210_137_1(this.attributes.length !== tag.attributes.length)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[138]++;
    return 0;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[140]++;
  for (var i = 0; visit211_140_1(i < this.attributes.length); i++) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[141]++;
    if (visit212_141_1(!this.attributes[i].equals(tag.attributes[i]))) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[142]++;
      return 0;
    }
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[145]++;
  return 1;
}, 
  isEndTag: function() {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[10]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[149]++;
  return (/^\//).test(this.nodeName);
}, 
  appendChild: function(node) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[11]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[153]++;
  this.childNodes.push(node);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[154]++;
  refreshChildNodes(this);
}, 
  replace: function(ref) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[12]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[158]++;
  var sibling = ref.parentNode.childNodes, index = util.indexOf(ref, sibling);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[160]++;
  sibling[index] = this;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[161]++;
  refreshChildNodes(ref.parentNode);
}, 
  replaceChild: function(newC, refC) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[13]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[165]++;
  var self = this, childNodes = self.childNodes;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[167]++;
  var index = util.indexOf(refC, childNodes);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[168]++;
  childNodes[index] = newC;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[169]++;
  refreshChildNodes(self);
}, 
  prepend: function(node) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[14]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[173]++;
  this.childNodes.unshift(node);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[174]++;
  refreshChildNodes(this);
}, 
  insertBefore: function(ref) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[15]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[178]++;
  var sibling = ref.parentNode.childNodes, index = util.indexOf(ref, sibling);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[180]++;
  sibling.splice(index, 0, this);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[181]++;
  refreshChildNodes(ref.parentNode);
}, 
  insertAfter: function(ref) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[16]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[185]++;
  var sibling = ref.parentNode.childNodes, index = util.indexOf(ref, sibling);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[187]++;
  if (visit213_187_1(index === sibling.length - 1)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[188]++;
    ref.parentNode.appendChild(this);
  } else {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[190]++;
    this.insertBefore(ref.parentNode.childNodes[[index + 1]]);
  }
}, 
  empty: function() {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[17]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[195]++;
  this.childNodes = [];
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[196]++;
  refreshChildNodes(this);
}, 
  removeChild: function(node) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[18]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[200]++;
  var sibling = node.parentNode.childNodes, index = util.indexOf(node, sibling);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[202]++;
  sibling.splice(index, 1);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[203]++;
  refreshChildNodes(node.parentNode);
}, 
  getAttribute: function(name) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[19]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[207]++;
  var attr = findAttributeByName(this.attributes, name);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[208]++;
  return visit214_208_1(attr && attr.value);
}, 
  setAttribute: function(name, value) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[20]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[212]++;
  var attr = findAttributeByName(this.attributes, name);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[213]++;
  if (visit215_213_1(attr)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[214]++;
    attr.value = value;
  } else {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[216]++;
    this.attributes.push(new Attribute(name, '=', value, '"'));
  }
}, 
  removeAttribute: function(name) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[21]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[221]++;
  var attr = findAttributeByName(this.attributes, name);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[222]++;
  if (visit216_222_1(attr)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[223]++;
    var index = util.indexOf(attr, this.attributes);
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[224]++;
    this.attributes.splice(index, 1);
  }
}, 
  filterChildren: function() {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[22]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[232]++;
  var self = this;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[233]++;
  if (visit217_233_1(!self.isChildrenFiltered)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[234]++;
    var writer = new (S.require('html-parser/writer/basic'))();
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[235]++;
    self._writeChildrenHTML(writer);
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[236]++;
    var parser = new (S.require('html-parser/parser'))(writer.getHtml()), children = parser.parse().childNodes;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[238]++;
    self.empty();
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[239]++;
    util.each(children, function(c) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[23]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[240]++;
  self.appendChild(c);
});
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[242]++;
    self.isChildrenFiltered = 1;
  }
}, 
  writeHtml: function(writer, filter) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[24]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[252]++;
  var self = this, tmp, attrName, tagName = self.tagName;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[258]++;
  if (visit218_258_1(tagName === '!doctype')) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[259]++;
    writer.append(this.toHtml() + '\n');
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[260]++;
    return;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[263]++;
  self.__filter = filter;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[264]++;
  self.isChildrenFiltered = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[267]++;
  if (visit219_267_1(filter)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[269]++;
    if (visit220_269_1(!(tagName = filter.onTagName(tagName)))) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[270]++;
      return;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[273]++;
    self.tagName = tagName;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[275]++;
    tmp = filter.onTag(self);
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[277]++;
    if (visit221_277_1(tmp === false)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[278]++;
      return;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[282]++;
    if (visit222_282_1(tmp)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[283]++;
      self = tmp;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[287]++;
    if (visit223_287_1(self.nodeType !== 1)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[288]++;
      self.writeHtml(writer, filter);
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[289]++;
      return;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[293]++;
    if (visit224_293_1(!self.tagName)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[294]++;
      self._writeChildrenHTML(writer);
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[295]++;
      return;
    }
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[299]++;
  writer.openTag(self);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[302]++;
  var attributes = self.attributes;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[303]++;
  for (var i = 0; visit225_303_1(i < attributes.length); i++) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[304]++;
    var attr = attributes[i];
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[305]++;
    attrName = attr.name;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[306]++;
    if (visit226_306_1(filter)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[308]++;
      if (visit227_308_1(!(attrName = filter.onAttributeName(attrName, self)))) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[309]++;
        continue;
      }
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[311]++;
      attr.name = attrName;
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[313]++;
      if (visit228_313_1(filter.onAttribute(attr, self) === false)) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[314]++;
        continue;
      }
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[317]++;
    writer.attribute(attr, self);
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[321]++;
  writer.openTagClose(self);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[323]++;
  if (visit229_323_1(!self.isSelfClosed)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[324]++;
    self._writeChildrenHTML(writer);
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[326]++;
    writer.closeTag(self);
  }
}, 
  _writeChildrenHTML: function(writer) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[25]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[335]++;
  var self = this, filter = self.isChildrenFiltered ? 0 : self.__filter;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[338]++;
  util.each(self.childNodes, function(child) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[26]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[339]++;
  child.writeHtml(writer, filter);
});
}, 
  outerHtml: function() {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[27]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[344]++;
  var writer = new (S.require('html-parser/writer/basic'))();
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[345]++;
  this.writeHtml(writer);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[346]++;
  return writer.getHtml();
}});
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[350]++;
  function findAttributeByName(attributes, name) {
    _$jscoverage['/html-parser/nodes/tag.js'].functionData[28]++;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[351]++;
    if (visit230_351_1(attributes && attributes.length)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[352]++;
      for (var i = 0; visit231_352_1(i < attributes.length); i++) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[353]++;
        if (visit232_353_1(attributes[i].name === name)) {
          _$jscoverage['/html-parser/nodes/tag.js'].lineData[354]++;
          return attributes[i];
        }
      }
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[358]++;
    return null;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[361]++;
  return Tag;
});
