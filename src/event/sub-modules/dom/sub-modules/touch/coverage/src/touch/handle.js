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
if (! _$jscoverage['/touch/handle.js']) {
  _$jscoverage['/touch/handle.js'] = {};
  _$jscoverage['/touch/handle.js'].lineData = [];
  _$jscoverage['/touch/handle.js'].lineData[6] = 0;
  _$jscoverage['/touch/handle.js'].lineData[7] = 0;
  _$jscoverage['/touch/handle.js'].lineData[8] = 0;
  _$jscoverage['/touch/handle.js'].lineData[9] = 0;
  _$jscoverage['/touch/handle.js'].lineData[10] = 0;
  _$jscoverage['/touch/handle.js'].lineData[11] = 0;
  _$jscoverage['/touch/handle.js'].lineData[12] = 0;
  _$jscoverage['/touch/handle.js'].lineData[13] = 0;
  _$jscoverage['/touch/handle.js'].lineData[15] = 0;
  _$jscoverage['/touch/handle.js'].lineData[21] = 0;
  _$jscoverage['/touch/handle.js'].lineData[22] = 0;
  _$jscoverage['/touch/handle.js'].lineData[25] = 0;
  _$jscoverage['/touch/handle.js'].lineData[26] = 0;
  _$jscoverage['/touch/handle.js'].lineData[29] = 0;
  _$jscoverage['/touch/handle.js'].lineData[30] = 0;
  _$jscoverage['/touch/handle.js'].lineData[34] = 0;
  _$jscoverage['/touch/handle.js'].lineData[36] = 0;
  _$jscoverage['/touch/handle.js'].lineData[38] = 0;
  _$jscoverage['/touch/handle.js'].lineData[39] = 0;
  _$jscoverage['/touch/handle.js'].lineData[41] = 0;
  _$jscoverage['/touch/handle.js'].lineData[42] = 0;
  _$jscoverage['/touch/handle.js'].lineData[43] = 0;
  _$jscoverage['/touch/handle.js'].lineData[45] = 0;
  _$jscoverage['/touch/handle.js'].lineData[47] = 0;
  _$jscoverage['/touch/handle.js'].lineData[48] = 0;
  _$jscoverage['/touch/handle.js'].lineData[50] = 0;
  _$jscoverage['/touch/handle.js'].lineData[53] = 0;
  _$jscoverage['/touch/handle.js'].lineData[54] = 0;
  _$jscoverage['/touch/handle.js'].lineData[55] = 0;
  _$jscoverage['/touch/handle.js'].lineData[56] = 0;
  _$jscoverage['/touch/handle.js'].lineData[57] = 0;
  _$jscoverage['/touch/handle.js'].lineData[58] = 0;
  _$jscoverage['/touch/handle.js'].lineData[59] = 0;
  _$jscoverage['/touch/handle.js'].lineData[61] = 0;
  _$jscoverage['/touch/handle.js'].lineData[62] = 0;
  _$jscoverage['/touch/handle.js'].lineData[63] = 0;
  _$jscoverage['/touch/handle.js'].lineData[66] = 0;
  _$jscoverage['/touch/handle.js'].lineData[67] = 0;
  _$jscoverage['/touch/handle.js'].lineData[68] = 0;
  _$jscoverage['/touch/handle.js'].lineData[69] = 0;
  _$jscoverage['/touch/handle.js'].lineData[70] = 0;
  _$jscoverage['/touch/handle.js'].lineData[72] = 0;
  _$jscoverage['/touch/handle.js'].lineData[74] = 0;
  _$jscoverage['/touch/handle.js'].lineData[77] = 0;
  _$jscoverage['/touch/handle.js'].lineData[85] = 0;
  _$jscoverage['/touch/handle.js'].lineData[87] = 0;
  _$jscoverage['/touch/handle.js'].lineData[89] = 0;
  _$jscoverage['/touch/handle.js'].lineData[90] = 0;
  _$jscoverage['/touch/handle.js'].lineData[92] = 0;
  _$jscoverage['/touch/handle.js'].lineData[96] = 0;
  _$jscoverage['/touch/handle.js'].lineData[97] = 0;
  _$jscoverage['/touch/handle.js'].lineData[101] = 0;
  _$jscoverage['/touch/handle.js'].lineData[106] = 0;
  _$jscoverage['/touch/handle.js'].lineData[107] = 0;
  _$jscoverage['/touch/handle.js'].lineData[108] = 0;
  _$jscoverage['/touch/handle.js'].lineData[109] = 0;
  _$jscoverage['/touch/handle.js'].lineData[110] = 0;
  _$jscoverage['/touch/handle.js'].lineData[116] = 0;
  _$jscoverage['/touch/handle.js'].lineData[121] = 0;
  _$jscoverage['/touch/handle.js'].lineData[122] = 0;
  _$jscoverage['/touch/handle.js'].lineData[123] = 0;
  _$jscoverage['/touch/handle.js'].lineData[124] = 0;
  _$jscoverage['/touch/handle.js'].lineData[130] = 0;
  _$jscoverage['/touch/handle.js'].lineData[134] = 0;
  _$jscoverage['/touch/handle.js'].lineData[135] = 0;
  _$jscoverage['/touch/handle.js'].lineData[140] = 0;
  _$jscoverage['/touch/handle.js'].lineData[141] = 0;
  _$jscoverage['/touch/handle.js'].lineData[147] = 0;
  _$jscoverage['/touch/handle.js'].lineData[148] = 0;
  _$jscoverage['/touch/handle.js'].lineData[150] = 0;
  _$jscoverage['/touch/handle.js'].lineData[152] = 0;
  _$jscoverage['/touch/handle.js'].lineData[153] = 0;
  _$jscoverage['/touch/handle.js'].lineData[154] = 0;
  _$jscoverage['/touch/handle.js'].lineData[155] = 0;
  _$jscoverage['/touch/handle.js'].lineData[156] = 0;
  _$jscoverage['/touch/handle.js'].lineData[157] = 0;
  _$jscoverage['/touch/handle.js'].lineData[165] = 0;
  _$jscoverage['/touch/handle.js'].lineData[166] = 0;
  _$jscoverage['/touch/handle.js'].lineData[168] = 0;
  _$jscoverage['/touch/handle.js'].lineData[170] = 0;
  _$jscoverage['/touch/handle.js'].lineData[172] = 0;
  _$jscoverage['/touch/handle.js'].lineData[173] = 0;
  _$jscoverage['/touch/handle.js'].lineData[176] = 0;
  _$jscoverage['/touch/handle.js'].lineData[180] = 0;
  _$jscoverage['/touch/handle.js'].lineData[184] = 0;
  _$jscoverage['/touch/handle.js'].lineData[185] = 0;
  _$jscoverage['/touch/handle.js'].lineData[188] = 0;
  _$jscoverage['/touch/handle.js'].lineData[190] = 0;
  _$jscoverage['/touch/handle.js'].lineData[191] = 0;
  _$jscoverage['/touch/handle.js'].lineData[192] = 0;
  _$jscoverage['/touch/handle.js'].lineData[193] = 0;
  _$jscoverage['/touch/handle.js'].lineData[196] = 0;
  _$jscoverage['/touch/handle.js'].lineData[198] = 0;
  _$jscoverage['/touch/handle.js'].lineData[199] = 0;
  _$jscoverage['/touch/handle.js'].lineData[200] = 0;
  _$jscoverage['/touch/handle.js'].lineData[201] = 0;
  _$jscoverage['/touch/handle.js'].lineData[203] = 0;
  _$jscoverage['/touch/handle.js'].lineData[204] = 0;
  _$jscoverage['/touch/handle.js'].lineData[206] = 0;
  _$jscoverage['/touch/handle.js'].lineData[207] = 0;
  _$jscoverage['/touch/handle.js'].lineData[208] = 0;
  _$jscoverage['/touch/handle.js'].lineData[209] = 0;
  _$jscoverage['/touch/handle.js'].lineData[210] = 0;
  _$jscoverage['/touch/handle.js'].lineData[214] = 0;
  _$jscoverage['/touch/handle.js'].lineData[218] = 0;
  _$jscoverage['/touch/handle.js'].lineData[219] = 0;
  _$jscoverage['/touch/handle.js'].lineData[220] = 0;
  _$jscoverage['/touch/handle.js'].lineData[221] = 0;
  _$jscoverage['/touch/handle.js'].lineData[222] = 0;
  _$jscoverage['/touch/handle.js'].lineData[223] = 0;
  _$jscoverage['/touch/handle.js'].lineData[225] = 0;
  _$jscoverage['/touch/handle.js'].lineData[226] = 0;
  _$jscoverage['/touch/handle.js'].lineData[227] = 0;
  _$jscoverage['/touch/handle.js'].lineData[228] = 0;
  _$jscoverage['/touch/handle.js'].lineData[229] = 0;
  _$jscoverage['/touch/handle.js'].lineData[232] = 0;
  _$jscoverage['/touch/handle.js'].lineData[235] = 0;
  _$jscoverage['/touch/handle.js'].lineData[236] = 0;
  _$jscoverage['/touch/handle.js'].lineData[237] = 0;
  _$jscoverage['/touch/handle.js'].lineData[240] = 0;
  _$jscoverage['/touch/handle.js'].lineData[244] = 0;
  _$jscoverage['/touch/handle.js'].lineData[246] = 0;
  _$jscoverage['/touch/handle.js'].lineData[247] = 0;
  _$jscoverage['/touch/handle.js'].lineData[248] = 0;
  _$jscoverage['/touch/handle.js'].lineData[250] = 0;
  _$jscoverage['/touch/handle.js'].lineData[251] = 0;
  _$jscoverage['/touch/handle.js'].lineData[252] = 0;
  _$jscoverage['/touch/handle.js'].lineData[253] = 0;
  _$jscoverage['/touch/handle.js'].lineData[254] = 0;
  _$jscoverage['/touch/handle.js'].lineData[257] = 0;
  _$jscoverage['/touch/handle.js'].lineData[261] = 0;
  _$jscoverage['/touch/handle.js'].lineData[263] = 0;
  _$jscoverage['/touch/handle.js'].lineData[264] = 0;
  _$jscoverage['/touch/handle.js'].lineData[265] = 0;
  _$jscoverage['/touch/handle.js'].lineData[269] = 0;
  _$jscoverage['/touch/handle.js'].lineData[270] = 0;
  _$jscoverage['/touch/handle.js'].lineData[271] = 0;
  _$jscoverage['/touch/handle.js'].lineData[272] = 0;
  _$jscoverage['/touch/handle.js'].lineData[273] = 0;
  _$jscoverage['/touch/handle.js'].lineData[275] = 0;
  _$jscoverage['/touch/handle.js'].lineData[276] = 0;
  _$jscoverage['/touch/handle.js'].lineData[277] = 0;
  _$jscoverage['/touch/handle.js'].lineData[278] = 0;
  _$jscoverage['/touch/handle.js'].lineData[279] = 0;
  _$jscoverage['/touch/handle.js'].lineData[280] = 0;
  _$jscoverage['/touch/handle.js'].lineData[286] = 0;
  _$jscoverage['/touch/handle.js'].lineData[290] = 0;
  _$jscoverage['/touch/handle.js'].lineData[292] = 0;
  _$jscoverage['/touch/handle.js'].lineData[293] = 0;
  _$jscoverage['/touch/handle.js'].lineData[295] = 0;
  _$jscoverage['/touch/handle.js'].lineData[297] = 0;
  _$jscoverage['/touch/handle.js'].lineData[298] = 0;
  _$jscoverage['/touch/handle.js'].lineData[299] = 0;
  _$jscoverage['/touch/handle.js'].lineData[301] = 0;
  _$jscoverage['/touch/handle.js'].lineData[303] = 0;
  _$jscoverage['/touch/handle.js'].lineData[304] = 0;
  _$jscoverage['/touch/handle.js'].lineData[308] = 0;
  _$jscoverage['/touch/handle.js'].lineData[309] = 0;
  _$jscoverage['/touch/handle.js'].lineData[310] = 0;
  _$jscoverage['/touch/handle.js'].lineData[315] = 0;
  _$jscoverage['/touch/handle.js'].lineData[318] = 0;
  _$jscoverage['/touch/handle.js'].lineData[319] = 0;
  _$jscoverage['/touch/handle.js'].lineData[321] = 0;
  _$jscoverage['/touch/handle.js'].lineData[329] = 0;
  _$jscoverage['/touch/handle.js'].lineData[330] = 0;
  _$jscoverage['/touch/handle.js'].lineData[331] = 0;
  _$jscoverage['/touch/handle.js'].lineData[332] = 0;
  _$jscoverage['/touch/handle.js'].lineData[333] = 0;
  _$jscoverage['/touch/handle.js'].lineData[339] = 0;
  _$jscoverage['/touch/handle.js'].lineData[341] = 0;
  _$jscoverage['/touch/handle.js'].lineData[342] = 0;
  _$jscoverage['/touch/handle.js'].lineData[343] = 0;
  _$jscoverage['/touch/handle.js'].lineData[347] = 0;
  _$jscoverage['/touch/handle.js'].lineData[349] = 0;
  _$jscoverage['/touch/handle.js'].lineData[351] = 0;
  _$jscoverage['/touch/handle.js'].lineData[352] = 0;
  _$jscoverage['/touch/handle.js'].lineData[354] = 0;
  _$jscoverage['/touch/handle.js'].lineData[355] = 0;
  _$jscoverage['/touch/handle.js'].lineData[360] = 0;
  _$jscoverage['/touch/handle.js'].lineData[362] = 0;
  _$jscoverage['/touch/handle.js'].lineData[363] = 0;
  _$jscoverage['/touch/handle.js'].lineData[364] = 0;
  _$jscoverage['/touch/handle.js'].lineData[366] = 0;
  _$jscoverage['/touch/handle.js'].lineData[367] = 0;
  _$jscoverage['/touch/handle.js'].lineData[368] = 0;
}
if (! _$jscoverage['/touch/handle.js'].functionData) {
  _$jscoverage['/touch/handle.js'].functionData = [];
  _$jscoverage['/touch/handle.js'].functionData[0] = 0;
  _$jscoverage['/touch/handle.js'].functionData[1] = 0;
  _$jscoverage['/touch/handle.js'].functionData[2] = 0;
  _$jscoverage['/touch/handle.js'].functionData[3] = 0;
  _$jscoverage['/touch/handle.js'].functionData[4] = 0;
  _$jscoverage['/touch/handle.js'].functionData[5] = 0;
  _$jscoverage['/touch/handle.js'].functionData[6] = 0;
  _$jscoverage['/touch/handle.js'].functionData[7] = 0;
  _$jscoverage['/touch/handle.js'].functionData[8] = 0;
  _$jscoverage['/touch/handle.js'].functionData[9] = 0;
  _$jscoverage['/touch/handle.js'].functionData[10] = 0;
  _$jscoverage['/touch/handle.js'].functionData[11] = 0;
  _$jscoverage['/touch/handle.js'].functionData[12] = 0;
  _$jscoverage['/touch/handle.js'].functionData[13] = 0;
  _$jscoverage['/touch/handle.js'].functionData[14] = 0;
  _$jscoverage['/touch/handle.js'].functionData[15] = 0;
  _$jscoverage['/touch/handle.js'].functionData[16] = 0;
  _$jscoverage['/touch/handle.js'].functionData[17] = 0;
  _$jscoverage['/touch/handle.js'].functionData[18] = 0;
  _$jscoverage['/touch/handle.js'].functionData[19] = 0;
  _$jscoverage['/touch/handle.js'].functionData[20] = 0;
  _$jscoverage['/touch/handle.js'].functionData[21] = 0;
  _$jscoverage['/touch/handle.js'].functionData[22] = 0;
  _$jscoverage['/touch/handle.js'].functionData[23] = 0;
  _$jscoverage['/touch/handle.js'].functionData[24] = 0;
  _$jscoverage['/touch/handle.js'].functionData[25] = 0;
}
if (! _$jscoverage['/touch/handle.js'].branchData) {
  _$jscoverage['/touch/handle.js'].branchData = {};
  _$jscoverage['/touch/handle.js'].branchData['30'] = [];
  _$jscoverage['/touch/handle.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['38'] = [];
  _$jscoverage['/touch/handle.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['39'] = [];
  _$jscoverage['/touch/handle.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['50'] = [];
  _$jscoverage['/touch/handle.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['56'] = [];
  _$jscoverage['/touch/handle.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['89'] = [];
  _$jscoverage['/touch/handle.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['106'] = [];
  _$jscoverage['/touch/handle.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['108'] = [];
  _$jscoverage['/touch/handle.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['121'] = [];
  _$jscoverage['/touch/handle.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['123'] = [];
  _$jscoverage['/touch/handle.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['130'] = [];
  _$jscoverage['/touch/handle.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['134'] = [];
  _$jscoverage['/touch/handle.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['140'] = [];
  _$jscoverage['/touch/handle.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['150'] = [];
  _$jscoverage['/touch/handle.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['156'] = [];
  _$jscoverage['/touch/handle.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['168'] = [];
  _$jscoverage['/touch/handle.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['168'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['172'] = [];
  _$jscoverage['/touch/handle.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['172'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['172'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['185'] = [];
  _$jscoverage['/touch/handle.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['185'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['185'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['190'] = [];
  _$jscoverage['/touch/handle.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['192'] = [];
  _$jscoverage['/touch/handle.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['198'] = [];
  _$jscoverage['/touch/handle.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['198'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['203'] = [];
  _$jscoverage['/touch/handle.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['218'] = [];
  _$jscoverage['/touch/handle.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['221'] = [];
  _$jscoverage['/touch/handle.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['222'] = [];
  _$jscoverage['/touch/handle.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['226'] = [];
  _$jscoverage['/touch/handle.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['228'] = [];
  _$jscoverage['/touch/handle.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['246'] = [];
  _$jscoverage['/touch/handle.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['247'] = [];
  _$jscoverage['/touch/handle.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['251'] = [];
  _$jscoverage['/touch/handle.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['253'] = [];
  _$jscoverage['/touch/handle.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['263'] = [];
  _$jscoverage['/touch/handle.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['264'] = [];
  _$jscoverage['/touch/handle.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['270'] = [];
  _$jscoverage['/touch/handle.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['275'] = [];
  _$jscoverage['/touch/handle.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['277'] = [];
  _$jscoverage['/touch/handle.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['279'] = [];
  _$jscoverage['/touch/handle.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['292'] = [];
  _$jscoverage['/touch/handle.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['298'] = [];
  _$jscoverage['/touch/handle.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['303'] = [];
  _$jscoverage['/touch/handle.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['303'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['303'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['318'] = [];
  _$jscoverage['/touch/handle.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['330'] = [];
  _$jscoverage['/touch/handle.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['332'] = [];
  _$jscoverage['/touch/handle.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['351'] = [];
  _$jscoverage['/touch/handle.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['354'] = [];
  _$jscoverage['/touch/handle.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['362'] = [];
  _$jscoverage['/touch/handle.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['363'] = [];
  _$jscoverage['/touch/handle.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['366'] = [];
  _$jscoverage['/touch/handle.js'].branchData['366'][1] = new BranchData();
}
_$jscoverage['/touch/handle.js'].branchData['366'][1].init(121, 35, 'S.isEmptyObject(handle.eventHandle)');
function visit56_366_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['363'][1].init(21, 5, 'event');
function visit55_363_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['362'][1].init(105, 6, 'handle');
function visit54_362_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['354'][1].init(217, 5, 'event');
function visit53_354_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['351'][1].init(105, 7, '!handle');
function visit52_351_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['332'][1].init(65, 25, '!eventHandle[event].count');
function visit51_332_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['330'][1].init(65, 18, 'eventHandle[event]');
function visit50_330_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['318'][1].init(149, 18, 'eventHandle[event]');
function visit49_318_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['303'][3].init(303, 26, 'h[method](event) === false');
function visit48_303_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['303'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['303'][2].init(290, 39, 'h[method] && h[method](event) === false');
function visit47_303_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['303'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['303'][1].init(276, 53, 'h.isActive && h[method] && h[method](event) === false');
function visit46_303_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['298'][1].init(125, 11, 'h.processed');
function visit45_298_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['292'][1].init(238, 28, '!event.changedTouches.length');
function visit44_292_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['279'][1].init(76, 20, '!self.touches.length');
function visit43_279_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['277'][1].init(610, 20, 'isPointerEvent(type)');
function visit42_277_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['275'][1].init(529, 18, 'isMouseEvent(type)');
function visit41_275_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['270'][1].init(296, 18, 'isTouchEvent(type)');
function visit40_270_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['264'][1].init(21, 37, 'self.isEventSimulatedFromTouch(event)');
function visit39_264_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['263'][1].init(81, 18, 'isMouseEvent(type)');
function visit38_263_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['253'][1].init(390, 19, '!isTouchEvent(type)');
function visit37_253_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['251'][1].init(287, 20, 'isPointerEvent(type)');
function visit36_251_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['247'][1].init(21, 36, 'self.isEventSimulatedFromTouch(type)');
function visit35_247_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['246'][1].init(81, 18, 'isMouseEvent(type)');
function visit34_246_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['228'][1].init(73, 25, 'self.touches.length === 1');
function visit33_228_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['226'][1].init(505, 20, 'isPointerEvent(type)');
function visit32_226_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['222'][1].init(21, 37, 'self.isEventSimulatedFromTouch(event)');
function visit31_222_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['221'][1].init(298, 18, 'isMouseEvent(type)');
function visit30_221_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['218'][1].init(151, 18, 'isTouchEvent(type)');
function visit29_218_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['203'][1].init(866, 10, 'touchEvent');
function visit28_203_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['198'][2].init(689, 22, 'touchList.length === 1');
function visit27_198_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['198'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['198'][1].init(676, 35, 'touchList && touchList.length === 1');
function visit26_198_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['192'][1].init(92, 23, 'pointerType === \'touch\'');
function visit25_192_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['190'][1].init(21, 20, 'isPointerEvent(type)');
function visit24_190_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['185'][3].init(53, 22, 'type === \'touchcancel\'');
function visit23_185_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['185'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['185'][2].init(30, 19, 'type === \'touchend\'');
function visit22_185_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['185'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['185'][1].init(30, 45, 'type === \'touchend\' || type === \'touchcancel\'');
function visit21_185_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['172'][3].init(211, 14, 'dy <= DUP_DIST');
function visit20_172_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['172'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['172'][2].init(193, 14, 'dx <= DUP_DIST');
function visit19_172_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['172'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['172'][1].init(193, 32, 'dx <= DUP_DIST && dy <= DUP_DIST');
function visit18_172_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['168'][2].init(162, 5, 'i < l');
function visit17_168_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['168'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['168'][1].init(162, 21, 'i < l && (t = lts[i])');
function visit16_168_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['156'][1].init(70, 6, 'i > -1');
function visit15_156_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['150'][1].init(165, 22, 'this.isPrimaryTouch(t)');
function visit14_150_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['140'][1].init(17, 28, 'this.isPrimaryTouch(inTouch)');
function visit13_140_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['134'][1].init(17, 24, 'this.firstTouch === null');
function visit12_134_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['130'][1].init(20, 38, 'this.firstTouch === inTouch.identifier');
function visit11_130_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['123'][1].init(57, 29, 'touch.pointerId === pointerId');
function visit10_123_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['121'][1].init(195, 5, 'i < l');
function visit9_121_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['108'][1].init(57, 29, 'touch.pointerId === pointerId');
function visit8_108_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['106'][1].init(195, 5, 'i < l');
function visit7_106_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['89'][1].init(219, 33, '!isPointerEvent(gestureMoveEvent)');
function visit6_89_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['56'][1].init(1643, 31, 'Features.isMsPointerSupported()');
function visit5_56_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['50'][1].init(1364, 29, 'Features.isPointerSupported()');
function visit4_50_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['39'][1].init(13, 8, 'S.UA.ios');
function visit3_39_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['38'][1].init(864, 32, 'Features.isTouchEventSupported()');
function visit2_38_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['30'][1].init(16, 64, 'S.startsWith(type, \'MSPointer\') || S.startsWith(type, \'pointer\')');
function visit1_30_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/touch/handle.js'].functionData[0]++;
  _$jscoverage['/touch/handle.js'].lineData[7]++;
  var Dom = require('dom');
  _$jscoverage['/touch/handle.js'].lineData[8]++;
  var eventHandleMap = require('./handle-map');
  _$jscoverage['/touch/handle.js'].lineData[9]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/touch/handle.js'].lineData[10]++;
  require('./tap');
  _$jscoverage['/touch/handle.js'].lineData[11]++;
  require('./swipe');
  _$jscoverage['/touch/handle.js'].lineData[12]++;
  require('./pinch');
  _$jscoverage['/touch/handle.js'].lineData[13]++;
  require('./rotate');
  _$jscoverage['/touch/handle.js'].lineData[15]++;
  var key = S.guid('touch-handle'), Features = S.Features, gestureStartEvent, gestureMoveEvent, gestureEndEvent;
  _$jscoverage['/touch/handle.js'].lineData[21]++;
  function isTouchEvent(type) {
    _$jscoverage['/touch/handle.js'].functionData[1]++;
    _$jscoverage['/touch/handle.js'].lineData[22]++;
    return S.startsWith(type, 'touch');
  }
  _$jscoverage['/touch/handle.js'].lineData[25]++;
  function isMouseEvent(type) {
    _$jscoverage['/touch/handle.js'].functionData[2]++;
    _$jscoverage['/touch/handle.js'].lineData[26]++;
    return S.startsWith(type, 'mouse');
  }
  _$jscoverage['/touch/handle.js'].lineData[29]++;
  function isPointerEvent(type) {
    _$jscoverage['/touch/handle.js'].functionData[3]++;
    _$jscoverage['/touch/handle.js'].lineData[30]++;
    return visit1_30_1(S.startsWith(type, 'MSPointer') || S.startsWith(type, 'pointer'));
  }
  _$jscoverage['/touch/handle.js'].lineData[34]++;
  var DUP_TIMEOUT = 2500;
  _$jscoverage['/touch/handle.js'].lineData[36]++;
  var DUP_DIST = 25;
  _$jscoverage['/touch/handle.js'].lineData[38]++;
  if (visit2_38_1(Features.isTouchEventSupported())) {
    _$jscoverage['/touch/handle.js'].lineData[39]++;
    if (visit3_39_1(S.UA.ios)) {
      _$jscoverage['/touch/handle.js'].lineData[41]++;
      gestureEndEvent = 'touchend touchcancel';
      _$jscoverage['/touch/handle.js'].lineData[42]++;
      gestureStartEvent = 'touchstart';
      _$jscoverage['/touch/handle.js'].lineData[43]++;
      gestureMoveEvent = 'touchmove';
    } else {
      _$jscoverage['/touch/handle.js'].lineData[45]++;
      gestureEndEvent = 'touchend touchcancel mouseup';
      _$jscoverage['/touch/handle.js'].lineData[47]++;
      gestureStartEvent = 'touchstart mousedown';
      _$jscoverage['/touch/handle.js'].lineData[48]++;
      gestureMoveEvent = 'touchmove mousemove';
    }
  } else {
    _$jscoverage['/touch/handle.js'].lineData[50]++;
    if (visit4_50_1(Features.isPointerSupported())) {
      _$jscoverage['/touch/handle.js'].lineData[53]++;
      gestureStartEvent = 'pointerdown';
      _$jscoverage['/touch/handle.js'].lineData[54]++;
      gestureMoveEvent = 'pointermove';
      _$jscoverage['/touch/handle.js'].lineData[55]++;
      gestureEndEvent = 'pointerup pointercancel';
    } else {
      _$jscoverage['/touch/handle.js'].lineData[56]++;
      if (visit5_56_1(Features.isMsPointerSupported())) {
        _$jscoverage['/touch/handle.js'].lineData[57]++;
        gestureStartEvent = 'MSPointerDown';
        _$jscoverage['/touch/handle.js'].lineData[58]++;
        gestureMoveEvent = 'MSPointerMove';
        _$jscoverage['/touch/handle.js'].lineData[59]++;
        gestureEndEvent = 'MSPointerUp MSPointerCancel';
      } else {
        _$jscoverage['/touch/handle.js'].lineData[61]++;
        gestureStartEvent = 'mousedown';
        _$jscoverage['/touch/handle.js'].lineData[62]++;
        gestureMoveEvent = 'mousemove';
        _$jscoverage['/touch/handle.js'].lineData[63]++;
        gestureEndEvent = 'mouseup';
      }
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[66]++;
  function DocumentHandler(doc) {
    _$jscoverage['/touch/handle.js'].functionData[4]++;
    _$jscoverage['/touch/handle.js'].lineData[67]++;
    var self = this;
    _$jscoverage['/touch/handle.js'].lineData[68]++;
    self.doc = doc;
    _$jscoverage['/touch/handle.js'].lineData[69]++;
    self.eventHandle = {};
    _$jscoverage['/touch/handle.js'].lineData[70]++;
    self.init();
    _$jscoverage['/touch/handle.js'].lineData[72]++;
    self.touches = [];
    _$jscoverage['/touch/handle.js'].lineData[74]++;
    self.inTouch = 0;
  }
  _$jscoverage['/touch/handle.js'].lineData[77]++;
  DocumentHandler.prototype = {
  constructor: DocumentHandler, 
  lastTouches: [], 
  firstTouch: null, 
  init: function() {
  _$jscoverage['/touch/handle.js'].functionData[5]++;
  _$jscoverage['/touch/handle.js'].lineData[85]++;
  var self = this, doc = self.doc;
  _$jscoverage['/touch/handle.js'].lineData[87]++;
  DomEvent.on(doc, gestureStartEvent, self.onTouchStart, self);
  _$jscoverage['/touch/handle.js'].lineData[89]++;
  if (visit6_89_1(!isPointerEvent(gestureMoveEvent))) {
    _$jscoverage['/touch/handle.js'].lineData[90]++;
    DomEvent.on(doc, gestureMoveEvent, self.onTouchMove, self);
  }
  _$jscoverage['/touch/handle.js'].lineData[92]++;
  DomEvent.on(doc, gestureEndEvent, self.onTouchEnd, self);
}, 
  addTouch: function(originalEvent) {
  _$jscoverage['/touch/handle.js'].functionData[6]++;
  _$jscoverage['/touch/handle.js'].lineData[96]++;
  originalEvent.identifier = originalEvent.pointerId;
  _$jscoverage['/touch/handle.js'].lineData[97]++;
  this.touches.push(originalEvent);
}, 
  removeTouch: function(originalEvent) {
  _$jscoverage['/touch/handle.js'].functionData[7]++;
  _$jscoverage['/touch/handle.js'].lineData[101]++;
  var i = 0, touch, pointerId = originalEvent.pointerId, touches = this.touches, l = touches.length;
  _$jscoverage['/touch/handle.js'].lineData[106]++;
  for (; visit7_106_1(i < l); i++) {
    _$jscoverage['/touch/handle.js'].lineData[107]++;
    touch = touches[i];
    _$jscoverage['/touch/handle.js'].lineData[108]++;
    if (visit8_108_1(touch.pointerId === pointerId)) {
      _$jscoverage['/touch/handle.js'].lineData[109]++;
      touches.splice(i, 1);
      _$jscoverage['/touch/handle.js'].lineData[110]++;
      break;
    }
  }
}, 
  updateTouch: function(originalEvent) {
  _$jscoverage['/touch/handle.js'].functionData[8]++;
  _$jscoverage['/touch/handle.js'].lineData[116]++;
  var i = 0, touch, pointerId = originalEvent.pointerId, touches = this.touches, l = touches.length;
  _$jscoverage['/touch/handle.js'].lineData[121]++;
  for (; visit9_121_1(i < l); i++) {
    _$jscoverage['/touch/handle.js'].lineData[122]++;
    touch = touches[i];
    _$jscoverage['/touch/handle.js'].lineData[123]++;
    if (visit10_123_1(touch.pointerId === pointerId)) {
      _$jscoverage['/touch/handle.js'].lineData[124]++;
      touches[i] = originalEvent;
    }
  }
}, 
  isPrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[9]++;
  _$jscoverage['/touch/handle.js'].lineData[130]++;
  return visit11_130_1(this.firstTouch === inTouch.identifier);
}, 
  setPrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[10]++;
  _$jscoverage['/touch/handle.js'].lineData[134]++;
  if (visit12_134_1(this.firstTouch === null)) {
    _$jscoverage['/touch/handle.js'].lineData[135]++;
    this.firstTouch = inTouch.identifier;
  }
}, 
  removePrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[11]++;
  _$jscoverage['/touch/handle.js'].lineData[140]++;
  if (visit13_140_1(this.isPrimaryTouch(inTouch))) {
    _$jscoverage['/touch/handle.js'].lineData[141]++;
    this.firstTouch = null;
  }
}, 
  dupMouse: function(inEvent) {
  _$jscoverage['/touch/handle.js'].functionData[12]++;
  _$jscoverage['/touch/handle.js'].lineData[147]++;
  var lts = this.lastTouches;
  _$jscoverage['/touch/handle.js'].lineData[148]++;
  var t = inEvent.changedTouches[0];
  _$jscoverage['/touch/handle.js'].lineData[150]++;
  if (visit14_150_1(this.isPrimaryTouch(t))) {
    _$jscoverage['/touch/handle.js'].lineData[152]++;
    var lt = {
  x: t.clientX, 
  y: t.clientY};
    _$jscoverage['/touch/handle.js'].lineData[153]++;
    lts.push(lt);
    _$jscoverage['/touch/handle.js'].lineData[154]++;
    setTimeout(function() {
  _$jscoverage['/touch/handle.js'].functionData[13]++;
  _$jscoverage['/touch/handle.js'].lineData[155]++;
  var i = lts.indexOf(lt);
  _$jscoverage['/touch/handle.js'].lineData[156]++;
  if (visit15_156_1(i > -1)) {
    _$jscoverage['/touch/handle.js'].lineData[157]++;
    lts.splice(i, 1);
  }
}, DUP_TIMEOUT);
  }
}, 
  isEventSimulatedFromTouch: function(inEvent) {
  _$jscoverage['/touch/handle.js'].functionData[14]++;
  _$jscoverage['/touch/handle.js'].lineData[165]++;
  var lts = this.lastTouches;
  _$jscoverage['/touch/handle.js'].lineData[166]++;
  var x = inEvent.clientX, y = inEvent.clientY;
  _$jscoverage['/touch/handle.js'].lineData[168]++;
  for (var i = 0, l = lts.length, t; visit16_168_1(visit17_168_2(i < l) && (t = lts[i])); i++) {
    _$jscoverage['/touch/handle.js'].lineData[170]++;
    var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
    _$jscoverage['/touch/handle.js'].lineData[172]++;
    if (visit18_172_1(visit19_172_2(dx <= DUP_DIST) && visit20_172_3(dy <= DUP_DIST))) {
      _$jscoverage['/touch/handle.js'].lineData[173]++;
      return true;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[176]++;
  return 0;
}, 
  normalize: function(e) {
  _$jscoverage['/touch/handle.js'].functionData[15]++;
  _$jscoverage['/touch/handle.js'].lineData[180]++;
  var type = e.type, notUp, touchEvent, touchList;
  _$jscoverage['/touch/handle.js'].lineData[184]++;
  if ((touchEvent = isTouchEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[185]++;
    touchList = (visit21_185_1(visit22_185_2(type === 'touchend') || visit23_185_3(type === 'touchcancel'))) ? e.changedTouches : e.touches;
    _$jscoverage['/touch/handle.js'].lineData[188]++;
    e.isTouch = 1;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[190]++;
    if (visit24_190_1(isPointerEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[191]++;
      var pointerType = e.originalEvent.pointerType;
      _$jscoverage['/touch/handle.js'].lineData[192]++;
      if (visit25_192_1(pointerType === 'touch')) {
        _$jscoverage['/touch/handle.js'].lineData[193]++;
        e.isTouch = 1;
      }
    }
    _$jscoverage['/touch/handle.js'].lineData[196]++;
    touchList = this.touches;
  }
  _$jscoverage['/touch/handle.js'].lineData[198]++;
  if (visit26_198_1(touchList && visit27_198_2(touchList.length === 1))) {
    _$jscoverage['/touch/handle.js'].lineData[199]++;
    e.which = 1;
    _$jscoverage['/touch/handle.js'].lineData[200]++;
    e.pageX = touchList[0].pageX;
    _$jscoverage['/touch/handle.js'].lineData[201]++;
    e.pageY = touchList[0].pageY;
  }
  _$jscoverage['/touch/handle.js'].lineData[203]++;
  if (visit28_203_1(touchEvent)) {
    _$jscoverage['/touch/handle.js'].lineData[204]++;
    return e;
  }
  _$jscoverage['/touch/handle.js'].lineData[206]++;
  notUp = !type.match(/(up|cancel)$/i);
  _$jscoverage['/touch/handle.js'].lineData[207]++;
  e.touches = notUp ? touchList : [];
  _$jscoverage['/touch/handle.js'].lineData[208]++;
  e.targetTouches = notUp ? touchList : [];
  _$jscoverage['/touch/handle.js'].lineData[209]++;
  e.changedTouches = touchList;
  _$jscoverage['/touch/handle.js'].lineData[210]++;
  return e;
}, 
  onTouchStart: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[16]++;
  _$jscoverage['/touch/handle.js'].lineData[214]++;
  var e, h, self = this, type = event.type, eventHandle = self.eventHandle;
  _$jscoverage['/touch/handle.js'].lineData[218]++;
  if (visit29_218_1(isTouchEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[219]++;
    self.setPrimaryTouch(event.changedTouches[0]);
    _$jscoverage['/touch/handle.js'].lineData[220]++;
    self.dupMouse(event);
  } else {
    _$jscoverage['/touch/handle.js'].lineData[221]++;
    if (visit30_221_1(isMouseEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[222]++;
      if (visit31_222_1(self.isEventSimulatedFromTouch(event))) {
        _$jscoverage['/touch/handle.js'].lineData[223]++;
        return;
      }
      _$jscoverage['/touch/handle.js'].lineData[225]++;
      self.touches = [event.originalEvent];
    } else {
      _$jscoverage['/touch/handle.js'].lineData[226]++;
      if (visit32_226_1(isPointerEvent(type))) {
        _$jscoverage['/touch/handle.js'].lineData[227]++;
        self.addTouch(event.originalEvent);
        _$jscoverage['/touch/handle.js'].lineData[228]++;
        if (visit33_228_1(self.touches.length === 1)) {
          _$jscoverage['/touch/handle.js'].lineData[229]++;
          DomEvent.on(self.doc, gestureMoveEvent, self.onTouchMove, self);
        }
      } else {
        _$jscoverage['/touch/handle.js'].lineData[232]++;
        throw new Error('unrecognized touch event: ' + event.type);
      }
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[235]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[236]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[237]++;
    h.isActive = 1;
  }
  _$jscoverage['/touch/handle.js'].lineData[240]++;
  self.callEventHandle('onTouchStart', event);
}, 
  onTouchMove: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[17]++;
  _$jscoverage['/touch/handle.js'].lineData[244]++;
  var self = this, type = event.type;
  _$jscoverage['/touch/handle.js'].lineData[246]++;
  if (visit34_246_1(isMouseEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[247]++;
    if (visit35_247_1(self.isEventSimulatedFromTouch(type))) {
      _$jscoverage['/touch/handle.js'].lineData[248]++;
      return;
    }
    _$jscoverage['/touch/handle.js'].lineData[250]++;
    self.touches = [event.originalEvent];
  } else {
    _$jscoverage['/touch/handle.js'].lineData[251]++;
    if (visit36_251_1(isPointerEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[252]++;
      self.updateTouch(event.originalEvent);
    } else {
      _$jscoverage['/touch/handle.js'].lineData[253]++;
      if (visit37_253_1(!isTouchEvent(type))) {
        _$jscoverage['/touch/handle.js'].lineData[254]++;
        throw new Error('unrecognized touch event: ' + event.type);
      }
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[257]++;
  self.callEventHandle('onTouchMove', event);
}, 
  onTouchEnd: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[18]++;
  _$jscoverage['/touch/handle.js'].lineData[261]++;
  var self = this, type = event.type;
  _$jscoverage['/touch/handle.js'].lineData[263]++;
  if (visit38_263_1(isMouseEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[264]++;
    if (visit39_264_1(self.isEventSimulatedFromTouch(event))) {
      _$jscoverage['/touch/handle.js'].lineData[265]++;
      return;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[269]++;
  self.callEventHandle('onTouchEnd', event);
  _$jscoverage['/touch/handle.js'].lineData[270]++;
  if (visit40_270_1(isTouchEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[271]++;
    self.dupMouse(event);
    _$jscoverage['/touch/handle.js'].lineData[272]++;
    S.makeArray(event.changedTouches).forEach(function(touch) {
  _$jscoverage['/touch/handle.js'].functionData[19]++;
  _$jscoverage['/touch/handle.js'].lineData[273]++;
  self.removePrimaryTouch(touch);
});
  } else {
    _$jscoverage['/touch/handle.js'].lineData[275]++;
    if (visit41_275_1(isMouseEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[276]++;
      self.touches = [];
    } else {
      _$jscoverage['/touch/handle.js'].lineData[277]++;
      if (visit42_277_1(isPointerEvent(type))) {
        _$jscoverage['/touch/handle.js'].lineData[278]++;
        self.removeTouch(event.originalEvent);
        _$jscoverage['/touch/handle.js'].lineData[279]++;
        if (visit43_279_1(!self.touches.length)) {
          _$jscoverage['/touch/handle.js'].lineData[280]++;
          DomEvent.detach(self.doc, gestureMoveEvent, self.onTouchMove, self);
        }
      }
    }
  }
}, 
  callEventHandle: function(method, event) {
  _$jscoverage['/touch/handle.js'].functionData[20]++;
  _$jscoverage['/touch/handle.js'].lineData[286]++;
  var self = this, eventHandle = self.eventHandle, e, h;
  _$jscoverage['/touch/handle.js'].lineData[290]++;
  event = self.normalize(event);
  _$jscoverage['/touch/handle.js'].lineData[292]++;
  if (visit44_292_1(!event.changedTouches.length)) {
    _$jscoverage['/touch/handle.js'].lineData[293]++;
    return;
  }
  _$jscoverage['/touch/handle.js'].lineData[295]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[297]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[298]++;
    if (visit45_298_1(h.processed)) {
      _$jscoverage['/touch/handle.js'].lineData[299]++;
      continue;
    }
    _$jscoverage['/touch/handle.js'].lineData[301]++;
    h.processed = 1;
    _$jscoverage['/touch/handle.js'].lineData[303]++;
    if (visit46_303_1(h.isActive && visit47_303_2(h[method] && visit48_303_3(h[method](event) === false)))) {
      _$jscoverage['/touch/handle.js'].lineData[304]++;
      h.isActive = 0;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[308]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[309]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[310]++;
    h.processed = 0;
  }
}, 
  addEventHandle: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[21]++;
  _$jscoverage['/touch/handle.js'].lineData[315]++;
  var self = this, eventHandle = self.eventHandle, handle = eventHandleMap[event].handle;
  _$jscoverage['/touch/handle.js'].lineData[318]++;
  if (visit49_318_1(eventHandle[event])) {
    _$jscoverage['/touch/handle.js'].lineData[319]++;
    eventHandle[event].count++;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[321]++;
    eventHandle[event] = {
  count: 1, 
  handle: handle};
  }
}, 
  'removeEventHandle': function(event) {
  _$jscoverage['/touch/handle.js'].functionData[22]++;
  _$jscoverage['/touch/handle.js'].lineData[329]++;
  var eventHandle = this.eventHandle;
  _$jscoverage['/touch/handle.js'].lineData[330]++;
  if (visit50_330_1(eventHandle[event])) {
    _$jscoverage['/touch/handle.js'].lineData[331]++;
    eventHandle[event].count--;
    _$jscoverage['/touch/handle.js'].lineData[332]++;
    if (visit51_332_1(!eventHandle[event].count)) {
      _$jscoverage['/touch/handle.js'].lineData[333]++;
      delete eventHandle[event];
    }
  }
}, 
  destroy: function() {
  _$jscoverage['/touch/handle.js'].functionData[23]++;
  _$jscoverage['/touch/handle.js'].lineData[339]++;
  var self = this, doc = self.doc;
  _$jscoverage['/touch/handle.js'].lineData[341]++;
  DomEvent.detach(doc, gestureStartEvent, self.onTouchStart, self);
  _$jscoverage['/touch/handle.js'].lineData[342]++;
  DomEvent.detach(doc, gestureMoveEvent, self.onTouchMove, self);
  _$jscoverage['/touch/handle.js'].lineData[343]++;
  DomEvent.detach(doc, gestureEndEvent, self.onTouchEnd, self);
}};
  _$jscoverage['/touch/handle.js'].lineData[347]++;
  return {
  addDocumentHandle: function(el, event) {
  _$jscoverage['/touch/handle.js'].functionData[24]++;
  _$jscoverage['/touch/handle.js'].lineData[349]++;
  var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
  _$jscoverage['/touch/handle.js'].lineData[351]++;
  if (visit52_351_1(!handle)) {
    _$jscoverage['/touch/handle.js'].lineData[352]++;
    Dom.data(doc, key, handle = new DocumentHandler(doc));
  }
  _$jscoverage['/touch/handle.js'].lineData[354]++;
  if (visit53_354_1(event)) {
    _$jscoverage['/touch/handle.js'].lineData[355]++;
    handle.addEventHandle(event);
  }
}, 
  removeDocumentHandle: function(el, event) {
  _$jscoverage['/touch/handle.js'].functionData[25]++;
  _$jscoverage['/touch/handle.js'].lineData[360]++;
  var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
  _$jscoverage['/touch/handle.js'].lineData[362]++;
  if (visit54_362_1(handle)) {
    _$jscoverage['/touch/handle.js'].lineData[363]++;
    if (visit55_363_1(event)) {
      _$jscoverage['/touch/handle.js'].lineData[364]++;
      handle.removeEventHandle(event);
    }
    _$jscoverage['/touch/handle.js'].lineData[366]++;
    if (visit56_366_1(S.isEmptyObject(handle.eventHandle))) {
      _$jscoverage['/touch/handle.js'].lineData[367]++;
      handle.destroy();
      _$jscoverage['/touch/handle.js'].lineData[368]++;
      Dom.removeData(doc, key);
    }
  }
}};
});
