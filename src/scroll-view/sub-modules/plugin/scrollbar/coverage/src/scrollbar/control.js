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
if (! _$jscoverage['/scrollbar/control.js']) {
  _$jscoverage['/scrollbar/control.js'] = {};
  _$jscoverage['/scrollbar/control.js'].lineData = [];
  _$jscoverage['/scrollbar/control.js'].lineData[6] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[7] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[8] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[9] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[10] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[11] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[13] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[15] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[17] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[18] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[21] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[22] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[23] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[24] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[27] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[28] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[33] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[34] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[37] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[38] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[49] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[50] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[51] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[53] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[54] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[55] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[56] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[57] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[58] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[60] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[64] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[65] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[68] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[69] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[70] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[71] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[75] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[77] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[78] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[79] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[80] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[82] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[83] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[84] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[85] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[87] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[90] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[91] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[92] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[99] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[100] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[101] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[102] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[103] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[106] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[107] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[110] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[111] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[112] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[113] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[114] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[115] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[116] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[118] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[127] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[128] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[130] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[133] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[134] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[137] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[138] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[151] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[152] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[153] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[155] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[156] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[157] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[158] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[159] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[161] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[162] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[163] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[167] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[168] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[169] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[172] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[173] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[174] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[175] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[179] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[180] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[181] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[183] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[185] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[187] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[188] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[189] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[190] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[191] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[192] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[193] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[194] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[196] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[197] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[199] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[200] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[202] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[206] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[210] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[211] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[212] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[213] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[214] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[215] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[216] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[217] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[218] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[222] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[225] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[226] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[232] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[236] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[240] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[244] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[248] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[252] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[256] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[257] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[258] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[261] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[262] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[264] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[266] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[271] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[272] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[276] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[277] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[279] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[280] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[285] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[286] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[297] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[332] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[349] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[351] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[352] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[354] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[361] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[362] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[363] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[365] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[382] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[388] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[394] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[400] = 0;
}
if (! _$jscoverage['/scrollbar/control.js'].functionData) {
  _$jscoverage['/scrollbar/control.js'].functionData = [];
  _$jscoverage['/scrollbar/control.js'].functionData[0] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[1] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[2] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[3] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[4] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[5] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[6] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[7] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[8] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[9] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[10] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[11] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[12] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[13] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[14] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[15] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[16] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[17] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[18] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[19] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[20] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[21] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[22] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[23] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[24] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[25] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[26] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[27] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[28] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[29] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[30] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[31] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[32] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[33] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[34] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[35] = 0;
}
if (! _$jscoverage['/scrollbar/control.js'].branchData) {
  _$jscoverage['/scrollbar/control.js'].branchData = {};
  _$jscoverage['/scrollbar/control.js'].branchData['29'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['49'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['52'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['70'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['79'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['84'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['98'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['98'][2] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['115'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['115'][2] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['151'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['156'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['173'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['188'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['190'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['191'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['225'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['258'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['276'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['351'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['362'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['362'][1] = new BranchData();
}
_$jscoverage['/scrollbar/control.js'].branchData['362'][1].init(84, 13, 'v < minLength');
function visit21_362_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['351'][1].init(85, 13, 'v < minLength');
function visit20_351_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['276'][1].init(9556, 11, 'supportCss3');
function visit19_276_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['258'][1].init(92, 21, '!self.get(\'autoHide\')');
function visit18_258_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['225'][1].init(141, 8, 'autoHide');
function visit17_225_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['191'][1].init(290, 21, 'scrollType === \'left\'');
function visit16_191_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['190'][1].init(208, 21, 'scrollType === \'left\'');
function visit15_190_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['188'][1].init(77, 24, 'self.get(\'axis\') === \'x\'');
function visit14_188_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['173'][1].init(13, 14, 'self.hideTimer');
function visit13_173_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['156'][1].init(934, 15, 'val < minScroll');
function visit12_156_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['151'][1].init(632, 15, 'val > maxScroll');
function visit11_151_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['115'][2].init(139, 17, 'dragEl === target');
function visit10_115_2(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['115'][2].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['115'][1].init(139, 45, 'dragEl === target || $dragEl.contains(target)');
function visit9_115_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['98'][2].init(270, 23, 'target === self.downBtn');
function visit8_98_2(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['98'][2].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['98'][1].init(270, 57, 'target === self.downBtn || self.$downBtn.contains(target)');
function visit7_98_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['84'][1].init(264, 38, 'self.hideFn && !scrollView.isScrolling');
function visit6_84_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['79'][1].init(113, 40, '!scrollView.allowScroll[self.scrollType]');
function visit5_79_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['70'][1].init(38, 11, 'self.hideFn');
function visit4_70_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['52'][1].init(38, 22, 'whProperty === \'width\'');
function visit3_52_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['49'][1].init(382, 39, 'scrollView.allowScroll[self.scrollType]');
function visit2_49_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['29'][1].init(35, 31, 'self.pageXyProperty === \'pageX\'');
function visit1_29_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/scrollbar/control.js'].functionData[0]++;
  _$jscoverage['/scrollbar/control.js'].lineData[7]++;
  var UA = require('ua');
  _$jscoverage['/scrollbar/control.js'].lineData[8]++;
  var Control = require('component/control');
  _$jscoverage['/scrollbar/control.js'].lineData[9]++;
  var BaseGesture = require('event/gesture/base');
  _$jscoverage['/scrollbar/control.js'].lineData[10]++;
  var DragType = require('event/gesture/drag');
  _$jscoverage['/scrollbar/control.js'].lineData[11]++;
  var ScrollBarTpl = require('./scrollbar-xtpl');
  _$jscoverage['/scrollbar/control.js'].lineData[13]++;
  var MIN_BAR_LENGTH = 20;
  _$jscoverage['/scrollbar/control.js'].lineData[15]++;
  var SCROLLBAR_EVENT_NS = '.ks-scrollbar';
  _$jscoverage['/scrollbar/control.js'].lineData[17]++;
  function preventDefault(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[1]++;
    _$jscoverage['/scrollbar/control.js'].lineData[18]++;
    e.preventDefault();
  }
  _$jscoverage['/scrollbar/control.js'].lineData[21]++;
  function onDragStartHandler(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[2]++;
    _$jscoverage['/scrollbar/control.js'].lineData[22]++;
    e.stopPropagation();
    _$jscoverage['/scrollbar/control.js'].lineData[23]++;
    var self = this;
    _$jscoverage['/scrollbar/control.js'].lineData[24]++;
    self.startScroll = self.scrollView.get(self.scrollProperty);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[27]++;
  function onDragHandler(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[3]++;
    _$jscoverage['/scrollbar/control.js'].lineData[28]++;
    var self = this, diff = visit1_29_1(self.pageXyProperty === 'pageX') ? e.deltaX : e.deltaY, scrollView = self.scrollView, scrollType = self.scrollType, scrollCfg = {};
    _$jscoverage['/scrollbar/control.js'].lineData[33]++;
    scrollCfg[scrollType] = self.startScroll + diff / self.trackElSize * self.scrollLength;
    _$jscoverage['/scrollbar/control.js'].lineData[34]++;
    scrollView.scrollToWithBounds(scrollCfg);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[37]++;
  function onScrollViewReflow() {
    _$jscoverage['/scrollbar/control.js'].functionData[4]++;
    _$jscoverage['/scrollbar/control.js'].lineData[38]++;
    var self = this, scrollView = self.scrollView, trackEl = self.trackEl, scrollWHProperty = self.scrollWHProperty, whProperty = self.whProperty, clientWHProperty = self.clientWHProperty, dragWHProperty = self.dragWHProperty, ratio, trackElSize, barSize;
    _$jscoverage['/scrollbar/control.js'].lineData[49]++;
    if (visit2_49_1(scrollView.allowScroll[self.scrollType])) {
      _$jscoverage['/scrollbar/control.js'].lineData[50]++;
      self.scrollLength = scrollView[scrollWHProperty];
      _$jscoverage['/scrollbar/control.js'].lineData[51]++;
      trackElSize = self.trackElSize = visit3_52_1(whProperty === 'width') ? trackEl.offsetWidth : trackEl.offsetHeight;
      _$jscoverage['/scrollbar/control.js'].lineData[53]++;
      ratio = scrollView[clientWHProperty] / self.scrollLength;
      _$jscoverage['/scrollbar/control.js'].lineData[54]++;
      barSize = ratio * trackElSize;
      _$jscoverage['/scrollbar/control.js'].lineData[55]++;
      self.set(dragWHProperty, barSize);
      _$jscoverage['/scrollbar/control.js'].lineData[56]++;
      self.barSize = barSize;
      _$jscoverage['/scrollbar/control.js'].lineData[57]++;
      syncOnScroll(self);
      _$jscoverage['/scrollbar/control.js'].lineData[58]++;
      self.set('visible', true);
    } else {
      _$jscoverage['/scrollbar/control.js'].lineData[60]++;
      self.set('visible', false);
    }
  }
  _$jscoverage['/scrollbar/control.js'].lineData[64]++;
  function onScrollViewDisabled(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[5]++;
    _$jscoverage['/scrollbar/control.js'].lineData[65]++;
    this.set('disabled', e.newVal);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[68]++;
  function onScrollEnd() {
    _$jscoverage['/scrollbar/control.js'].functionData[6]++;
    _$jscoverage['/scrollbar/control.js'].lineData[69]++;
    var self = this;
    _$jscoverage['/scrollbar/control.js'].lineData[70]++;
    if (visit4_70_1(self.hideFn)) {
      _$jscoverage['/scrollbar/control.js'].lineData[71]++;
      startHideTimer(self);
    }
  }
  _$jscoverage['/scrollbar/control.js'].lineData[75]++;
  function afterScrollChange() {
    _$jscoverage['/scrollbar/control.js'].functionData[7]++;
    _$jscoverage['/scrollbar/control.js'].lineData[77]++;
    var self = this;
    _$jscoverage['/scrollbar/control.js'].lineData[78]++;
    var scrollView = self.scrollView;
    _$jscoverage['/scrollbar/control.js'].lineData[79]++;
    if (visit5_79_1(!scrollView.allowScroll[self.scrollType])) {
      _$jscoverage['/scrollbar/control.js'].lineData[80]++;
      return;
    }
    _$jscoverage['/scrollbar/control.js'].lineData[82]++;
    clearHideTimer(self);
    _$jscoverage['/scrollbar/control.js'].lineData[83]++;
    self.set('visible', true);
    _$jscoverage['/scrollbar/control.js'].lineData[84]++;
    if (visit6_84_1(self.hideFn && !scrollView.isScrolling)) {
      _$jscoverage['/scrollbar/control.js'].lineData[85]++;
      startHideTimer(self);
    }
    _$jscoverage['/scrollbar/control.js'].lineData[87]++;
    syncOnScroll(self);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[90]++;
  function onUpDownBtnMouseDown(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[8]++;
    _$jscoverage['/scrollbar/control.js'].lineData[91]++;
    e.halt();
    _$jscoverage['/scrollbar/control.js'].lineData[92]++;
    var self = this, scrollView = self.scrollView, scrollProperty = self.scrollProperty, scrollType = self.scrollType, step = scrollView.getScrollStep()[self.scrollType], target = e.target, direction = (visit7_98_1(visit8_98_2(target === self.downBtn) || self.$downBtn.contains(target))) ? 1 : -1;
    _$jscoverage['/scrollbar/control.js'].lineData[99]++;
    clearInterval(self.mouseInterval);
    _$jscoverage['/scrollbar/control.js'].lineData[100]++;
    function doScroll() {
      _$jscoverage['/scrollbar/control.js'].functionData[9]++;
      _$jscoverage['/scrollbar/control.js'].lineData[101]++;
      var scrollCfg = {};
      _$jscoverage['/scrollbar/control.js'].lineData[102]++;
      scrollCfg[scrollType] = scrollView.get(scrollProperty) + direction * step;
      _$jscoverage['/scrollbar/control.js'].lineData[103]++;
      scrollView.scrollToWithBounds(scrollCfg);
    }
    _$jscoverage['/scrollbar/control.js'].lineData[106]++;
    self.mouseInterval = setInterval(doScroll, 100);
    _$jscoverage['/scrollbar/control.js'].lineData[107]++;
    doScroll();
  }
  _$jscoverage['/scrollbar/control.js'].lineData[110]++;
  function onTrackElMouseDown(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[10]++;
    _$jscoverage['/scrollbar/control.js'].lineData[111]++;
    var self = this;
    _$jscoverage['/scrollbar/control.js'].lineData[112]++;
    var target = e.target;
    _$jscoverage['/scrollbar/control.js'].lineData[113]++;
    var dragEl = self.dragEl;
    _$jscoverage['/scrollbar/control.js'].lineData[114]++;
    var $dragEl = self.$dragEl;
    _$jscoverage['/scrollbar/control.js'].lineData[115]++;
    if (visit9_115_1(visit10_115_2(dragEl === target) || $dragEl.contains(target))) {
      _$jscoverage['/scrollbar/control.js'].lineData[116]++;
      return;
    }
    _$jscoverage['/scrollbar/control.js'].lineData[118]++;
    var scrollType = self.scrollType, pageXy = self.pageXyProperty, trackEl = self.$trackEl, scrollView = self.scrollView, per = Math.max(0, (e[pageXy] - trackEl.offset()[scrollType] - self.barSize / 2) / self.trackElSize), scrollCfg = {};
    _$jscoverage['/scrollbar/control.js'].lineData[127]++;
    scrollCfg[scrollType] = per * self.scrollLength;
    _$jscoverage['/scrollbar/control.js'].lineData[128]++;
    scrollView.scrollToWithBounds(scrollCfg);
    _$jscoverage['/scrollbar/control.js'].lineData[130]++;
    e.halt();
  }
  _$jscoverage['/scrollbar/control.js'].lineData[133]++;
  function onUpDownBtnMouseUp() {
    _$jscoverage['/scrollbar/control.js'].functionData[11]++;
    _$jscoverage['/scrollbar/control.js'].lineData[134]++;
    clearInterval(this.mouseInterval);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[137]++;
  function syncOnScroll(control) {
    _$jscoverage['/scrollbar/control.js'].functionData[12]++;
    _$jscoverage['/scrollbar/control.js'].lineData[138]++;
    var scrollType = control.scrollType, scrollView = control.scrollView, dragLTProperty = control.dragLTProperty, dragWHProperty = control.dragWHProperty, trackElSize = control.trackElSize, barSize = control.barSize, contentSize = control.scrollLength, val = scrollView.get(control.scrollProperty), maxScrollOffset = scrollView.maxScroll, minScrollOffset = scrollView.minScroll, minScroll = minScrollOffset[scrollType], maxScroll = maxScrollOffset[scrollType], dragVal;
    _$jscoverage['/scrollbar/control.js'].lineData[151]++;
    if (visit11_151_1(val > maxScroll)) {
      _$jscoverage['/scrollbar/control.js'].lineData[152]++;
      dragVal = maxScroll / contentSize * trackElSize;
      _$jscoverage['/scrollbar/control.js'].lineData[153]++;
      control.set(dragWHProperty, barSize - (val - maxScroll));
      _$jscoverage['/scrollbar/control.js'].lineData[155]++;
      control.set(dragLTProperty, dragVal + barSize - control.get(dragWHProperty));
    } else {
      _$jscoverage['/scrollbar/control.js'].lineData[156]++;
      if (visit12_156_1(val < minScroll)) {
        _$jscoverage['/scrollbar/control.js'].lineData[157]++;
        dragVal = minScroll / contentSize * trackElSize;
        _$jscoverage['/scrollbar/control.js'].lineData[158]++;
        control.set(dragWHProperty, barSize - (minScroll - val));
        _$jscoverage['/scrollbar/control.js'].lineData[159]++;
        control.set(dragLTProperty, dragVal);
      } else {
        _$jscoverage['/scrollbar/control.js'].lineData[161]++;
        dragVal = val / contentSize * trackElSize;
        _$jscoverage['/scrollbar/control.js'].lineData[162]++;
        control.set(dragLTProperty, dragVal);
        _$jscoverage['/scrollbar/control.js'].lineData[163]++;
        control.set(dragWHProperty, barSize);
      }
    }
  }
  _$jscoverage['/scrollbar/control.js'].lineData[167]++;
  function startHideTimer(self) {
    _$jscoverage['/scrollbar/control.js'].functionData[13]++;
    _$jscoverage['/scrollbar/control.js'].lineData[168]++;
    clearHideTimer(self);
    _$jscoverage['/scrollbar/control.js'].lineData[169]++;
    self.hideTimer = setTimeout(self.hideFn, self.get('hideDelay') * 1000);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[172]++;
  function clearHideTimer(self) {
    _$jscoverage['/scrollbar/control.js'].functionData[14]++;
    _$jscoverage['/scrollbar/control.js'].lineData[173]++;
    if (visit13_173_1(self.hideTimer)) {
      _$jscoverage['/scrollbar/control.js'].lineData[174]++;
      clearTimeout(self.hideTimer);
      _$jscoverage['/scrollbar/control.js'].lineData[175]++;
      self.hideTimer = null;
    }
  }
  _$jscoverage['/scrollbar/control.js'].lineData[179]++;
  var Feature = S.Feature;
  _$jscoverage['/scrollbar/control.js'].lineData[180]++;
  var isTransform3dSupported = Feature.isTransform3dSupported();
  _$jscoverage['/scrollbar/control.js'].lineData[181]++;
  var transformVendorInfo = Feature.getCssVendorInfo('transform');
  _$jscoverage['/scrollbar/control.js'].lineData[183]++;
  var supportCss3 = !!transformVendorInfo;
  _$jscoverage['/scrollbar/control.js'].lineData[185]++;
  var methods = {
  initializer: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[15]++;
  _$jscoverage['/scrollbar/control.js'].lineData[187]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[188]++;
  var scrollType = self.scrollType = visit14_188_1(self.get('axis') === 'x') ? 'left' : 'top';
  _$jscoverage['/scrollbar/control.js'].lineData[189]++;
  var ucScrollType = S.ucfirst(scrollType);
  _$jscoverage['/scrollbar/control.js'].lineData[190]++;
  self.pageXyProperty = visit15_190_1(scrollType === 'left') ? 'pageX' : 'pageY';
  _$jscoverage['/scrollbar/control.js'].lineData[191]++;
  var wh = self.whProperty = visit16_191_1(scrollType === 'left') ? 'width' : 'height';
  _$jscoverage['/scrollbar/control.js'].lineData[192]++;
  var ucWH = S.ucfirst(wh);
  _$jscoverage['/scrollbar/control.js'].lineData[193]++;
  self.afterScrollChangeEvent = 'afterScroll' + ucScrollType + 'Change';
  _$jscoverage['/scrollbar/control.js'].lineData[194]++;
  self.scrollProperty = 'scroll' + ucScrollType;
  _$jscoverage['/scrollbar/control.js'].lineData[196]++;
  self.dragWHProperty = 'drag' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[197]++;
  self.dragLTProperty = 'drag' + ucScrollType;
  _$jscoverage['/scrollbar/control.js'].lineData[199]++;
  self.clientWHProperty = 'client' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[200]++;
  self.scrollWHProperty = 'scroll' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[202]++;
  self.scrollView = self.get('scrollView');
}, 
  beforeCreateDom: function(renderData) {
  _$jscoverage['/scrollbar/control.js'].functionData[16]++;
  _$jscoverage['/scrollbar/control.js'].lineData[206]++;
  renderData.elCls.push(renderData.prefixCls + 'scrollbar-' + renderData.axis);
}, 
  createDom: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[17]++;
  _$jscoverage['/scrollbar/control.js'].lineData[210]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[211]++;
  self.$dragEl = self.get('dragEl');
  _$jscoverage['/scrollbar/control.js'].lineData[212]++;
  self.$trackEl = self.get('trackEl');
  _$jscoverage['/scrollbar/control.js'].lineData[213]++;
  self.$downBtn = self.get('downBtn');
  _$jscoverage['/scrollbar/control.js'].lineData[214]++;
  self.$upBtn = self.get('upBtn');
  _$jscoverage['/scrollbar/control.js'].lineData[215]++;
  self.dragEl = self.$dragEl[0];
  _$jscoverage['/scrollbar/control.js'].lineData[216]++;
  self.trackEl = self.$trackEl[0];
  _$jscoverage['/scrollbar/control.js'].lineData[217]++;
  self.downBtn = self.$downBtn[0];
  _$jscoverage['/scrollbar/control.js'].lineData[218]++;
  self.upBtn = self.$upBtn[0];
}, 
  bindUI: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[18]++;
  _$jscoverage['/scrollbar/control.js'].lineData[222]++;
  var self = this, autoHide = self.get('autoHide'), scrollView = self.scrollView;
  _$jscoverage['/scrollbar/control.js'].lineData[225]++;
  if (visit17_225_1(autoHide)) {
    _$jscoverage['/scrollbar/control.js'].lineData[226]++;
    self.hideFn = S.bind(self.hide, self);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[232]++;
  scrollView.on(self.afterScrollChangeEvent + SCROLLBAR_EVENT_NS, afterScrollChange, self).on('scrollTouchEnd' + SCROLLBAR_EVENT_NS, onScrollEnd, self).on('afterDisabledChange' + SCROLLBAR_EVENT_NS, onScrollViewDisabled, self).on('reflow' + SCROLLBAR_EVENT_NS, onScrollViewReflow, self);
}, 
  syncUI: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[19]++;
  _$jscoverage['/scrollbar/control.js'].lineData[236]++;
  onScrollViewReflow.call(this);
}, 
  _onSetDragHeight: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[20]++;
  _$jscoverage['/scrollbar/control.js'].lineData[240]++;
  this.dragEl.style.height = v + 'px';
}, 
  _onSetDragWidth: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[21]++;
  _$jscoverage['/scrollbar/control.js'].lineData[244]++;
  this.dragEl.style.width = v + 'px';
}, 
  _onSetDragLeft: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[22]++;
  _$jscoverage['/scrollbar/control.js'].lineData[248]++;
  this.dragEl.style.left = v + 'px';
}, 
  _onSetDragTop: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[23]++;
  _$jscoverage['/scrollbar/control.js'].lineData[252]++;
  this.dragEl.style.top = v + 'px';
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[24]++;
  _$jscoverage['/scrollbar/control.js'].lineData[256]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[257]++;
  var action = v ? 'detach' : 'on';
  _$jscoverage['/scrollbar/control.js'].lineData[258]++;
  if (visit18_258_1(!self.get('autoHide'))) {
    _$jscoverage['/scrollbar/control.js'].lineData[261]++;
    self.$dragEl[action]('dragstart mousedown', preventDefault)[action](DragType.DRAG_START, onDragStartHandler, self)[action](DragType.DRAG, onDragHandler, self);
    _$jscoverage['/scrollbar/control.js'].lineData[262]++;
    S.each([self.$downBtn, self.$upBtn], function(b) {
  _$jscoverage['/scrollbar/control.js'].functionData[25]++;
  _$jscoverage['/scrollbar/control.js'].lineData[264]++;
  b[action](BaseGesture.START, onUpDownBtnMouseDown, self)[action](BaseGesture.END, onUpDownBtnMouseUp, self);
});
    _$jscoverage['/scrollbar/control.js'].lineData[266]++;
    self.$trackEl[action](BaseGesture.START, onTrackElMouseDown, self);
  }
}, 
  destructor: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[26]++;
  _$jscoverage['/scrollbar/control.js'].lineData[271]++;
  this.scrollView.detach(SCROLLBAR_EVENT_NS);
  _$jscoverage['/scrollbar/control.js'].lineData[272]++;
  clearHideTimer(this);
}};
  _$jscoverage['/scrollbar/control.js'].lineData[276]++;
  if (visit19_276_1(supportCss3)) {
    _$jscoverage['/scrollbar/control.js'].lineData[277]++;
    var transformProperty = transformVendorInfo.propertyName;
    _$jscoverage['/scrollbar/control.js'].lineData[279]++;
    methods._onSetDragLeft = function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[27]++;
  _$jscoverage['/scrollbar/control.js'].lineData[280]++;
  this.dragEl.style[transformProperty] = 'translateX(' + v + 'px)' + ' translateY(' + this.get('dragTop') + 'px)' + (isTransform3dSupported ? ' translateZ(0)' : '');
};
    _$jscoverage['/scrollbar/control.js'].lineData[285]++;
    methods._onSetDragTop = function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[28]++;
  _$jscoverage['/scrollbar/control.js'].lineData[286]++;
  this.dragEl.style[transformProperty] = 'translateX(' + this.get('dragLeft') + 'px)' + ' translateY(' + v + 'px)' + (isTransform3dSupported ? ' translateZ(0)' : '');
};
  }
  _$jscoverage['/scrollbar/control.js'].lineData[297]++;
  return Control.extend(methods, {
  ATTRS: {
  minLength: {
  value: MIN_BAR_LENGTH}, 
  scrollView: {}, 
  axis: {
  render: 1}, 
  autoHide: {
  value: UA.ios}, 
  visible: {
  valueFn: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[29]++;
  _$jscoverage['/scrollbar/control.js'].lineData[332]++;
  return !this.get('autoHide');
}}, 
  hideDelay: {
  value: 0.1}, 
  dragWidth: {
  setter: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[30]++;
  _$jscoverage['/scrollbar/control.js'].lineData[349]++;
  var minLength = this.get('minLength');
  _$jscoverage['/scrollbar/control.js'].lineData[351]++;
  if (visit20_351_1(v < minLength)) {
    _$jscoverage['/scrollbar/control.js'].lineData[352]++;
    return minLength;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[354]++;
  return v;
}, 
  render: 1}, 
  dragHeight: {
  setter: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[31]++;
  _$jscoverage['/scrollbar/control.js'].lineData[361]++;
  var minLength = this.get('minLength');
  _$jscoverage['/scrollbar/control.js'].lineData[362]++;
  if (visit21_362_1(v < minLength)) {
    _$jscoverage['/scrollbar/control.js'].lineData[363]++;
    return minLength;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[365]++;
  return v;
}, 
  render: 1}, 
  dragLeft: {
  render: 1, 
  value: 0}, 
  dragTop: {
  render: 1, 
  value: 0}, 
  dragEl: {
  selector: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[32]++;
  _$jscoverage['/scrollbar/control.js'].lineData[382]++;
  return '.' + this.getBaseCssClass('drag');
}}, 
  downBtn: {
  selector: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[33]++;
  _$jscoverage['/scrollbar/control.js'].lineData[388]++;
  return '.' + this.getBaseCssClass('arrow-down');
}}, 
  upBtn: {
  selector: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[34]++;
  _$jscoverage['/scrollbar/control.js'].lineData[394]++;
  return '.' + this.getBaseCssClass('arrow-up');
}}, 
  trackEl: {
  selector: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[35]++;
  _$jscoverage['/scrollbar/control.js'].lineData[400]++;
  return '.' + this.getBaseCssClass('track');
}}, 
  focusable: {
  value: false}, 
  contentTpl: {
  value: ScrollBarTpl}}, 
  xclass: 'scrollbar'});
});
