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
  _$jscoverage['/compiler.js'].lineData[10] = 0;
  _$jscoverage['/compiler.js'].lineData[12] = 0;
  _$jscoverage['/compiler.js'].lineData[18] = 0;
  _$jscoverage['/compiler.js'].lineData[19] = 0;
  _$jscoverage['/compiler.js'].lineData[22] = 0;
  _$jscoverage['/compiler.js'].lineData[23] = 0;
  _$jscoverage['/compiler.js'].lineData[24] = 0;
  _$jscoverage['/compiler.js'].lineData[26] = 0;
  _$jscoverage['/compiler.js'].lineData[28] = 0;
  _$jscoverage['/compiler.js'].lineData[30] = 0;
  _$jscoverage['/compiler.js'].lineData[33] = 0;
  _$jscoverage['/compiler.js'].lineData[34] = 0;
  _$jscoverage['/compiler.js'].lineData[36] = 0;
  _$jscoverage['/compiler.js'].lineData[37] = 0;
  _$jscoverage['/compiler.js'].lineData[39] = 0;
  _$jscoverage['/compiler.js'].lineData[43] = 0;
  _$jscoverage['/compiler.js'].lineData[44] = 0;
  _$jscoverage['/compiler.js'].lineData[47] = 0;
  _$jscoverage['/compiler.js'].lineData[48] = 0;
  _$jscoverage['/compiler.js'].lineData[51] = 0;
  _$jscoverage['/compiler.js'].lineData[54] = 0;
  _$jscoverage['/compiler.js'].lineData[55] = 0;
  _$jscoverage['/compiler.js'].lineData[56] = 0;
  _$jscoverage['/compiler.js'].lineData[58] = 0;
  _$jscoverage['/compiler.js'].lineData[59] = 0;
  _$jscoverage['/compiler.js'].lineData[60] = 0;
  _$jscoverage['/compiler.js'].lineData[66] = 0;
  _$jscoverage['/compiler.js'].lineData[68] = 0;
  _$jscoverage['/compiler.js'].lineData[72] = 0;
  _$jscoverage['/compiler.js'].lineData[73] = 0;
  _$jscoverage['/compiler.js'].lineData[76] = 0;
  _$jscoverage['/compiler.js'].lineData[77] = 0;
  _$jscoverage['/compiler.js'].lineData[80] = 0;
  _$jscoverage['/compiler.js'].lineData[81] = 0;
  _$jscoverage['/compiler.js'].lineData[82] = 0;
  _$jscoverage['/compiler.js'].lineData[85] = 0;
  _$jscoverage['/compiler.js'].lineData[86] = 0;
  _$jscoverage['/compiler.js'].lineData[87] = 0;
  _$jscoverage['/compiler.js'].lineData[88] = 0;
  _$jscoverage['/compiler.js'].lineData[90] = 0;
  _$jscoverage['/compiler.js'].lineData[98] = 0;
  _$jscoverage['/compiler.js'].lineData[106] = 0;
  _$jscoverage['/compiler.js'].lineData[107] = 0;
  _$jscoverage['/compiler.js'].lineData[108] = 0;
  _$jscoverage['/compiler.js'].lineData[109] = 0;
  _$jscoverage['/compiler.js'].lineData[110] = 0;
  _$jscoverage['/compiler.js'].lineData[111] = 0;
  _$jscoverage['/compiler.js'].lineData[116] = 0;
  _$jscoverage['/compiler.js'].lineData[119] = 0;
  _$jscoverage['/compiler.js'].lineData[121] = 0;
  _$jscoverage['/compiler.js'].lineData[126] = 0;
  _$jscoverage['/compiler.js'].lineData[134] = 0;
  _$jscoverage['/compiler.js'].lineData[138] = 0;
  _$jscoverage['/compiler.js'].lineData[144] = 0;
  _$jscoverage['/compiler.js'].lineData[145] = 0;
  _$jscoverage['/compiler.js'].lineData[147] = 0;
  _$jscoverage['/compiler.js'].lineData[148] = 0;
  _$jscoverage['/compiler.js'].lineData[149] = 0;
  _$jscoverage['/compiler.js'].lineData[150] = 0;
  _$jscoverage['/compiler.js'].lineData[151] = 0;
  _$jscoverage['/compiler.js'].lineData[154] = 0;
  _$jscoverage['/compiler.js'].lineData[155] = 0;
  _$jscoverage['/compiler.js'].lineData[156] = 0;
  _$jscoverage['/compiler.js'].lineData[157] = 0;
  _$jscoverage['/compiler.js'].lineData[162] = 0;
  _$jscoverage['/compiler.js'].lineData[165] = 0;
  _$jscoverage['/compiler.js'].lineData[166] = 0;
  _$jscoverage['/compiler.js'].lineData[167] = 0;
  _$jscoverage['/compiler.js'].lineData[168] = 0;
  _$jscoverage['/compiler.js'].lineData[172] = 0;
  _$jscoverage['/compiler.js'].lineData[175] = 0;
  _$jscoverage['/compiler.js'].lineData[176] = 0;
  _$jscoverage['/compiler.js'].lineData[177] = 0;
  _$jscoverage['/compiler.js'].lineData[178] = 0;
  _$jscoverage['/compiler.js'].lineData[182] = 0;
  _$jscoverage['/compiler.js'].lineData[185] = 0;
  _$jscoverage['/compiler.js'].lineData[189] = 0;
  _$jscoverage['/compiler.js'].lineData[195] = 0;
  _$jscoverage['/compiler.js'].lineData[196] = 0;
  _$jscoverage['/compiler.js'].lineData[197] = 0;
  _$jscoverage['/compiler.js'].lineData[199] = 0;
  _$jscoverage['/compiler.js'].lineData[200] = 0;
  _$jscoverage['/compiler.js'].lineData[201] = 0;
  _$jscoverage['/compiler.js'].lineData[204] = 0;
  _$jscoverage['/compiler.js'].lineData[205] = 0;
  _$jscoverage['/compiler.js'].lineData[206] = 0;
  _$jscoverage['/compiler.js'].lineData[207] = 0;
  _$jscoverage['/compiler.js'].lineData[208] = 0;
  _$jscoverage['/compiler.js'].lineData[209] = 0;
  _$jscoverage['/compiler.js'].lineData[210] = 0;
  _$jscoverage['/compiler.js'].lineData[211] = 0;
  _$jscoverage['/compiler.js'].lineData[213] = 0;
  _$jscoverage['/compiler.js'].lineData[214] = 0;
  _$jscoverage['/compiler.js'].lineData[217] = 0;
  _$jscoverage['/compiler.js'].lineData[220] = 0;
  _$jscoverage['/compiler.js'].lineData[221] = 0;
  _$jscoverage['/compiler.js'].lineData[222] = 0;
  _$jscoverage['/compiler.js'].lineData[223] = 0;
  _$jscoverage['/compiler.js'].lineData[224] = 0;
  _$jscoverage['/compiler.js'].lineData[225] = 0;
  _$jscoverage['/compiler.js'].lineData[226] = 0;
  _$jscoverage['/compiler.js'].lineData[227] = 0;
  _$jscoverage['/compiler.js'].lineData[229] = 0;
  _$jscoverage['/compiler.js'].lineData[230] = 0;
  _$jscoverage['/compiler.js'].lineData[233] = 0;
  _$jscoverage['/compiler.js'].lineData[237] = 0;
  _$jscoverage['/compiler.js'].lineData[242] = 0;
  _$jscoverage['/compiler.js'].lineData[246] = 0;
  _$jscoverage['/compiler.js'].lineData[250] = 0;
  _$jscoverage['/compiler.js'].lineData[254] = 0;
  _$jscoverage['/compiler.js'].lineData[258] = 0;
  _$jscoverage['/compiler.js'].lineData[262] = 0;
  _$jscoverage['/compiler.js'].lineData[266] = 0;
  _$jscoverage['/compiler.js'].lineData[269] = 0;
  _$jscoverage['/compiler.js'].lineData[270] = 0;
  _$jscoverage['/compiler.js'].lineData[271] = 0;
  _$jscoverage['/compiler.js'].lineData[273] = 0;
  _$jscoverage['/compiler.js'].lineData[275] = 0;
  _$jscoverage['/compiler.js'].lineData[280] = 0;
  _$jscoverage['/compiler.js'].lineData[284] = 0;
  _$jscoverage['/compiler.js'].lineData[288] = 0;
  _$jscoverage['/compiler.js'].lineData[293] = 0;
  _$jscoverage['/compiler.js'].lineData[297] = 0;
  _$jscoverage['/compiler.js'].lineData[307] = 0;
  _$jscoverage['/compiler.js'].lineData[309] = 0;
  _$jscoverage['/compiler.js'].lineData[310] = 0;
  _$jscoverage['/compiler.js'].lineData[311] = 0;
  _$jscoverage['/compiler.js'].lineData[314] = 0;
  _$jscoverage['/compiler.js'].lineData[317] = 0;
  _$jscoverage['/compiler.js'].lineData[318] = 0;
  _$jscoverage['/compiler.js'].lineData[319] = 0;
  _$jscoverage['/compiler.js'].lineData[324] = 0;
  _$jscoverage['/compiler.js'].lineData[325] = 0;
  _$jscoverage['/compiler.js'].lineData[326] = 0;
  _$jscoverage['/compiler.js'].lineData[327] = 0;
  _$jscoverage['/compiler.js'].lineData[328] = 0;
  _$jscoverage['/compiler.js'].lineData[331] = 0;
  _$jscoverage['/compiler.js'].lineData[332] = 0;
  _$jscoverage['/compiler.js'].lineData[333] = 0;
  _$jscoverage['/compiler.js'].lineData[335] = 0;
  _$jscoverage['/compiler.js'].lineData[336] = 0;
  _$jscoverage['/compiler.js'].lineData[337] = 0;
  _$jscoverage['/compiler.js'].lineData[342] = 0;
  _$jscoverage['/compiler.js'].lineData[346] = 0;
  _$jscoverage['/compiler.js'].lineData[350] = 0;
  _$jscoverage['/compiler.js'].lineData[354] = 0;
  _$jscoverage['/compiler.js'].lineData[356] = 0;
  _$jscoverage['/compiler.js'].lineData[357] = 0;
  _$jscoverage['/compiler.js'].lineData[358] = 0;
  _$jscoverage['/compiler.js'].lineData[362] = 0;
  _$jscoverage['/compiler.js'].lineData[365] = 0;
  _$jscoverage['/compiler.js'].lineData[366] = 0;
  _$jscoverage['/compiler.js'].lineData[367] = 0;
  _$jscoverage['/compiler.js'].lineData[368] = 0;
  _$jscoverage['/compiler.js'].lineData[370] = 0;
  _$jscoverage['/compiler.js'].lineData[371] = 0;
  _$jscoverage['/compiler.js'].lineData[373] = 0;
  _$jscoverage['/compiler.js'].lineData[374] = 0;
  _$jscoverage['/compiler.js'].lineData[379] = 0;
  _$jscoverage['/compiler.js'].lineData[386] = 0;
  _$jscoverage['/compiler.js'].lineData[387] = 0;
  _$jscoverage['/compiler.js'].lineData[388] = 0;
  _$jscoverage['/compiler.js'].lineData[389] = 0;
  _$jscoverage['/compiler.js'].lineData[390] = 0;
  _$jscoverage['/compiler.js'].lineData[392] = 0;
  _$jscoverage['/compiler.js'].lineData[393] = 0;
  _$jscoverage['/compiler.js'].lineData[394] = 0;
  _$jscoverage['/compiler.js'].lineData[395] = 0;
  _$jscoverage['/compiler.js'].lineData[396] = 0;
  _$jscoverage['/compiler.js'].lineData[397] = 0;
  _$jscoverage['/compiler.js'].lineData[401] = 0;
  _$jscoverage['/compiler.js'].lineData[402] = 0;
  _$jscoverage['/compiler.js'].lineData[405] = 0;
  _$jscoverage['/compiler.js'].lineData[409] = 0;
  _$jscoverage['/compiler.js'].lineData[416] = 0;
  _$jscoverage['/compiler.js'].lineData[423] = 0;
  _$jscoverage['/compiler.js'].lineData[431] = 0;
  _$jscoverage['/compiler.js'].lineData[432] = 0;
  _$jscoverage['/compiler.js'].lineData[442] = 0;
  _$jscoverage['/compiler.js'].lineData[443] = 0;
  _$jscoverage['/compiler.js'].lineData[444] = 0;
  _$jscoverage['/compiler.js'].lineData[454] = 0;
  _$jscoverage['/compiler.js'].lineData[455] = 0;
  _$jscoverage['/compiler.js'].lineData[456] = 0;
  _$jscoverage['/compiler.js'].lineData[461] = 0;
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
  _$jscoverage['/compiler.js'].functionData[26] = 0;
  _$jscoverage['/compiler.js'].functionData[27] = 0;
  _$jscoverage['/compiler.js'].functionData[28] = 0;
  _$jscoverage['/compiler.js'].functionData[29] = 0;
  _$jscoverage['/compiler.js'].functionData[30] = 0;
  _$jscoverage['/compiler.js'].functionData[31] = 0;
  _$jscoverage['/compiler.js'].functionData[32] = 0;
}
if (! _$jscoverage['/compiler.js'].branchData) {
  _$jscoverage['/compiler.js'].branchData = {};
  _$jscoverage['/compiler.js'].branchData['23'] = [];
  _$jscoverage['/compiler.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['36'] = [];
  _$jscoverage['/compiler.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['55'] = [];
  _$jscoverage['/compiler.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['59'] = [];
  _$jscoverage['/compiler.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['76'] = [];
  _$jscoverage['/compiler.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['80'] = [];
  _$jscoverage['/compiler.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['81'] = [];
  _$jscoverage['/compiler.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['86'] = [];
  _$jscoverage['/compiler.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['106'] = [];
  _$jscoverage['/compiler.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['107'] = [];
  _$jscoverage['/compiler.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['109'] = [];
  _$jscoverage['/compiler.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['119'] = [];
  _$jscoverage['/compiler.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['128'] = [];
  _$jscoverage['/compiler.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['131'] = [];
  _$jscoverage['/compiler.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['147'] = [];
  _$jscoverage['/compiler.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['154'] = [];
  _$jscoverage['/compiler.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['165'] = [];
  _$jscoverage['/compiler.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['175'] = [];
  _$jscoverage['/compiler.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['195'] = [];
  _$jscoverage['/compiler.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['199'] = [];
  _$jscoverage['/compiler.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['204'] = [];
  _$jscoverage['/compiler.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['209'] = [];
  _$jscoverage['/compiler.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['220'] = [];
  _$jscoverage['/compiler.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['225'] = [];
  _$jscoverage['/compiler.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['270'] = [];
  _$jscoverage['/compiler.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['309'] = [];
  _$jscoverage['/compiler.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['317'] = [];
  _$jscoverage['/compiler.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['324'] = [];
  _$jscoverage['/compiler.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['331'] = [];
  _$jscoverage['/compiler.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['333'] = [];
  _$jscoverage['/compiler.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['335'] = [];
  _$jscoverage['/compiler.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['366'] = [];
  _$jscoverage['/compiler.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['386'] = [];
  _$jscoverage['/compiler.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['389'] = [];
  _$jscoverage['/compiler.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['392'] = [];
  _$jscoverage['/compiler.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['394'] = [];
  _$jscoverage['/compiler.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['455'] = [];
  _$jscoverage['/compiler.js'].branchData['455'][1] = new BranchData();
}
_$jscoverage['/compiler.js'].branchData['455'][1].init(68, 12, 'config || {}');
function visit81_455_1(result) {
  _$jscoverage['/compiler.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['394'][1].init(88, 17, 'nextIdNameCode[0]');
function visit80_394_1(result) {
  _$jscoverage['/compiler.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['392'][1].init(185, 10, 'idPartType');
function visit79_392_1(result) {
  _$jscoverage['/compiler.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['389'][1].init(100, 6, '!first');
function visit78_389_1(result) {
  _$jscoverage['/compiler.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['386'][1].init(218, 18, 'i < idParts.length');
function visit77_386_1(result) {
  _$jscoverage['/compiler.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['366'][1].init(186, 7, 'code[0]');
function visit76_366_1(result) {
  _$jscoverage['/compiler.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['335'][1].init(57, 27, 'typeof parts[i] != \'string\'');
function visit75_335_1(result) {
  _$jscoverage['/compiler.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['333'][1].init(76, 16, 'i < parts.length');
function visit74_333_1(result) {
  _$jscoverage['/compiler.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['331'][1].init(1293, 32, '!tplNode.hash && !tplNode.params');
function visit73_331_1(result) {
  _$jscoverage['/compiler.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['324'][1].init(978, 18, 'tplNode.isInverted');
function visit72_324_1(result) {
  _$jscoverage['/compiler.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['317'][1].init(706, 19, 'programNode.inverse');
function visit71_317_1(result) {
  _$jscoverage['/compiler.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['309'][1].init(429, 11, '!configName');
function visit70_309_1(result) {
  _$jscoverage['/compiler.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['270'][1].init(166, 14, 'name = code[0]');
function visit69_270_1(result) {
  _$jscoverage['/compiler.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['225'][1].init(91, 17, 'nextIdNameCode[0]');
function visit68_225_1(result) {
  _$jscoverage['/compiler.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['220'][1].init(1113, 4, 'hash');
function visit67_220_1(result) {
  _$jscoverage['/compiler.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['209'][1].init(99, 17, 'nextIdNameCode[0]');
function visit66_209_1(result) {
  _$jscoverage['/compiler.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['204'][1].init(271, 6, 'params');
function visit65_204_1(result) {
  _$jscoverage['/compiler.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['199'][1].init(100, 14, 'params || hash');
function visit64_199_1(result) {
  _$jscoverage['/compiler.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['195'][1].init(150, 7, 'tplNode');
function visit63_195_1(result) {
  _$jscoverage['/compiler.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['175'][1].init(1211, 15, '!name1 && name2');
function visit62_175_1(result) {
  _$jscoverage['/compiler.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['165'][1].init(878, 15, 'name1 && !name2');
function visit61_165_1(result) {
  _$jscoverage['/compiler.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['154'][1].init(483, 16, '!name1 && !name2');
function visit60_154_1(result) {
  _$jscoverage['/compiler.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['147'][1].init(252, 14, 'name1 && name2');
function visit59_147_1(result) {
  _$jscoverage['/compiler.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['131'][1].init(236, 26, 'tplNode && tplNode.escaped');
function visit58_131_1(result) {
  _$jscoverage['/compiler.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['128'][1].init(100, 18, 'configName || \'{}\'');
function visit57_128_1(result) {
  _$jscoverage['/compiler.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['119'][1].init(745, 21, 'idString == \'include\'');
function visit56_119_1(result) {
  _$jscoverage['/compiler.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['109'][1].init(126, 14, 'configNameCode');
function visit55_109_1(result) {
  _$jscoverage['/compiler.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['107'][1].init(38, 34, 'tplNode && self.genConfig(tplNode)');
function visit54_107_1(result) {
  _$jscoverage['/compiler.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['106'][1].init(265, 10, 'depth == 0');
function visit53_106_1(result) {
  _$jscoverage['/compiler.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['86'][1].init(1198, 7, '!global');
function visit52_86_1(result) {
  _$jscoverage['/compiler.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['81'][1].init(58, 7, 'i < len');
function visit51_81_1(result) {
  _$jscoverage['/compiler.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['80'][1].init(938, 10, 'statements');
function visit50_80_1(result) {
  _$jscoverage['/compiler.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['76'][1].init(579, 7, 'natives');
function visit49_76_1(result) {
  _$jscoverage['/compiler.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['59'][1].init(205, 6, 'global');
function visit48_59_1(result) {
  _$jscoverage['/compiler.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['55'][1].init(46, 7, '!global');
function visit47_55_1(result) {
  _$jscoverage['/compiler.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['36'][1].init(87, 12, 'm.length % 2');
function visit46_36_1(result) {
  _$jscoverage['/compiler.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['23'][1].init(13, 6, 'isCode');
function visit45_23_1(result) {
  _$jscoverage['/compiler.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/compiler.js'].functionData[0]++;
  _$jscoverage['/compiler.js'].lineData[7]++;
  var XTemplateRuntime = require('xtemplate/runtime');
  _$jscoverage['/compiler.js'].lineData[8]++;
  var parser = require('./compiler/parser');
  _$jscoverage['/compiler.js'].lineData[10]++;
  parser.yy = require('./compiler/ast');
  _$jscoverage['/compiler.js'].lineData[12]++;
  var doubleReg = /\\*"/g, singleReg = /\\*'/g, arrayPush = [].push, variableId = 0, xtemplateId = 0;
  _$jscoverage['/compiler.js'].lineData[18]++;
  function guid(str) {
    _$jscoverage['/compiler.js'].functionData[1]++;
    _$jscoverage['/compiler.js'].lineData[19]++;
    return str + (variableId++);
  }
  _$jscoverage['/compiler.js'].lineData[22]++;
  function escapeString(str, isCode) {
    _$jscoverage['/compiler.js'].functionData[2]++;
    _$jscoverage['/compiler.js'].lineData[23]++;
    if (visit45_23_1(isCode)) {
      _$jscoverage['/compiler.js'].lineData[24]++;
      str = escapeSingleQuoteInCodeString(str, false);
    } else {
      _$jscoverage['/compiler.js'].lineData[26]++;
      str = str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }
    _$jscoverage['/compiler.js'].lineData[28]++;
    str = str.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    _$jscoverage['/compiler.js'].lineData[30]++;
    return str;
  }
  _$jscoverage['/compiler.js'].lineData[33]++;
  function escapeSingleQuoteInCodeString(str, isDouble) {
    _$jscoverage['/compiler.js'].functionData[3]++;
    _$jscoverage['/compiler.js'].lineData[34]++;
    return str.replace(isDouble ? doubleReg : singleReg, function(m) {
  _$jscoverage['/compiler.js'].functionData[4]++;
  _$jscoverage['/compiler.js'].lineData[36]++;
  if (visit46_36_1(m.length % 2)) {
    _$jscoverage['/compiler.js'].lineData[37]++;
    m = '\\' + m;
  }
  _$jscoverage['/compiler.js'].lineData[39]++;
  return m;
});
  }
  _$jscoverage['/compiler.js'].lineData[43]++;
  function pushToArray(to, from) {
    _$jscoverage['/compiler.js'].functionData[5]++;
    _$jscoverage['/compiler.js'].lineData[44]++;
    arrayPush.apply(to, from);
  }
  _$jscoverage['/compiler.js'].lineData[47]++;
  function lastOfArray(arr) {
    _$jscoverage['/compiler.js'].functionData[6]++;
    _$jscoverage['/compiler.js'].lineData[48]++;
    return arr[arr.length - 1];
  }
  _$jscoverage['/compiler.js'].lineData[51]++;
  var gen = {
  genFunction: function(statements, global) {
  _$jscoverage['/compiler.js'].functionData[7]++;
  _$jscoverage['/compiler.js'].lineData[54]++;
  var source = [];
  _$jscoverage['/compiler.js'].lineData[55]++;
  if (visit47_55_1(!global)) {
    _$jscoverage['/compiler.js'].lineData[56]++;
    source.push('function(scopes) {');
  }
  _$jscoverage['/compiler.js'].lineData[58]++;
  source.push('var buffer = ""' + (global ? ',' : ';'));
  _$jscoverage['/compiler.js'].lineData[59]++;
  if (visit48_59_1(global)) {
    _$jscoverage['/compiler.js'].lineData[60]++;
    source.push('config = this.config,' + 'engine = this,' + 'moduleWrap, ' + 'utils = config.utils;');
    _$jscoverage['/compiler.js'].lineData[66]++;
    source.push('if (typeof module!="undefined" && module.kissy) {moduleWrap = module;}');
    _$jscoverage['/compiler.js'].lineData[68]++;
    var natives = '', c, utils = XTemplateRuntime.utils;
    _$jscoverage['/compiler.js'].lineData[72]++;
    for (c in utils) {
      _$jscoverage['/compiler.js'].lineData[73]++;
      natives += c + 'Util = utils["' + c + '"],';
    }
    _$jscoverage['/compiler.js'].lineData[76]++;
    if (visit49_76_1(natives)) {
      _$jscoverage['/compiler.js'].lineData[77]++;
      source.push('var ' + natives.slice(0, natives.length - 1) + ';');
    }
  }
  _$jscoverage['/compiler.js'].lineData[80]++;
  if (visit50_80_1(statements)) {
    _$jscoverage['/compiler.js'].lineData[81]++;
    for (var i = 0, len = statements.length; visit51_81_1(i < len); i++) {
      _$jscoverage['/compiler.js'].lineData[82]++;
      pushToArray(source, this[statements[i].type](statements[i]));
    }
  }
  _$jscoverage['/compiler.js'].lineData[85]++;
  source.push('return buffer;');
  _$jscoverage['/compiler.js'].lineData[86]++;
  if (visit52_86_1(!global)) {
    _$jscoverage['/compiler.js'].lineData[87]++;
    source.push('}');
    _$jscoverage['/compiler.js'].lineData[88]++;
    return source;
  } else {
    _$jscoverage['/compiler.js'].lineData[90]++;
    return {
  params: ['scopes', 'S', 'undefined'], 
  source: source};
  }
}, 
  genId: function(idNode, tplNode, preserveUndefined) {
  _$jscoverage['/compiler.js'].functionData[8]++;
  _$jscoverage['/compiler.js'].lineData[98]++;
  var source = [], depth = idNode.depth, idParts = idNode.parts, idName = guid('id'), self = this;
  _$jscoverage['/compiler.js'].lineData[106]++;
  if (visit53_106_1(depth == 0)) {
    _$jscoverage['/compiler.js'].lineData[107]++;
    var configNameCode = visit54_107_1(tplNode && self.genConfig(tplNode));
    _$jscoverage['/compiler.js'].lineData[108]++;
    var configName;
    _$jscoverage['/compiler.js'].lineData[109]++;
    if (visit55_109_1(configNameCode)) {
      _$jscoverage['/compiler.js'].lineData[110]++;
      configName = configNameCode[0];
      _$jscoverage['/compiler.js'].lineData[111]++;
      pushToArray(source, configNameCode[1]);
    }
  }
  _$jscoverage['/compiler.js'].lineData[116]++;
  var idString = self.getIdStringFromIdParts(source, idParts);
  _$jscoverage['/compiler.js'].lineData[119]++;
  if (visit56_119_1(idString == 'include')) {
    _$jscoverage['/compiler.js'].lineData[121]++;
    source.push('if(moduleWrap) {re' + 'quire("' + tplNode.params[0].value + '");' + configName + '.params[0]=moduleWrap.resolveByName(' + configName + '.params[0])' + '}');
  }
  _$jscoverage['/compiler.js'].lineData[126]++;
  source.push('var ' + idName + ' = getPropertyOrRunCommandUtil(engine,scopes,' + (visit57_128_1(configName || '{}')) + ',"' + idString + '",' + depth + ',' + idNode.lineNumber + ',' + (visit58_131_1(tplNode && tplNode.escaped)) + ',' + preserveUndefined + ');');
  _$jscoverage['/compiler.js'].lineData[134]++;
  return [idName, source];
}, 
  genOpExpression: function(e, type) {
  _$jscoverage['/compiler.js'].functionData[9]++;
  _$jscoverage['/compiler.js'].lineData[138]++;
  var source = [], name1, name2, code1 = this[e.op1.type](e.op1), code2 = this[e.op2.type](e.op2);
  _$jscoverage['/compiler.js'].lineData[144]++;
  name1 = code1[0];
  _$jscoverage['/compiler.js'].lineData[145]++;
  name2 = code2[0];
  _$jscoverage['/compiler.js'].lineData[147]++;
  if (visit59_147_1(name1 && name2)) {
    _$jscoverage['/compiler.js'].lineData[148]++;
    pushToArray(source, code1[1]);
    _$jscoverage['/compiler.js'].lineData[149]++;
    pushToArray(source, code2[1]);
    _$jscoverage['/compiler.js'].lineData[150]++;
    source.push(name1 + type + name2);
    _$jscoverage['/compiler.js'].lineData[151]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[154]++;
  if (visit60_154_1(!name1 && !name2)) {
    _$jscoverage['/compiler.js'].lineData[155]++;
    pushToArray(source, code1[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[156]++;
    pushToArray(source, code2[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[157]++;
    source.push('(' + lastOfArray(code1[1]) + ')' + type + '(' + lastOfArray(code2[1]) + ')');
    _$jscoverage['/compiler.js'].lineData[162]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[165]++;
  if (visit61_165_1(name1 && !name2)) {
    _$jscoverage['/compiler.js'].lineData[166]++;
    pushToArray(source, code1[1]);
    _$jscoverage['/compiler.js'].lineData[167]++;
    pushToArray(source, code2[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[168]++;
    source.push(name1 + type + '(' + lastOfArray(code2[1]) + ')');
    _$jscoverage['/compiler.js'].lineData[172]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[175]++;
  if (visit62_175_1(!name1 && name2)) {
    _$jscoverage['/compiler.js'].lineData[176]++;
    pushToArray(source, code1[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[177]++;
    pushToArray(source, code2[1]);
    _$jscoverage['/compiler.js'].lineData[178]++;
    source.push('(' + lastOfArray(code1[1]) + ')' + type + name2);
    _$jscoverage['/compiler.js'].lineData[182]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[185]++;
  return undefined;
}, 
  genConfig: function(tplNode) {
  _$jscoverage['/compiler.js'].functionData[10]++;
  _$jscoverage['/compiler.js'].lineData[189]++;
  var source = [], configName, params, hash, self = this;
  _$jscoverage['/compiler.js'].lineData[195]++;
  if (visit63_195_1(tplNode)) {
    _$jscoverage['/compiler.js'].lineData[196]++;
    params = tplNode.params;
    _$jscoverage['/compiler.js'].lineData[197]++;
    hash = tplNode.hash;
    _$jscoverage['/compiler.js'].lineData[199]++;
    if (visit64_199_1(params || hash)) {
      _$jscoverage['/compiler.js'].lineData[200]++;
      configName = guid('config');
      _$jscoverage['/compiler.js'].lineData[201]++;
      source.push('var ' + configName + ' = {};');
    }
    _$jscoverage['/compiler.js'].lineData[204]++;
    if (visit65_204_1(params)) {
      _$jscoverage['/compiler.js'].lineData[205]++;
      var paramsName = guid('params');
      _$jscoverage['/compiler.js'].lineData[206]++;
      source.push('var ' + paramsName + ' = [];');
      _$jscoverage['/compiler.js'].lineData[207]++;
      S.each(params, function(param) {
  _$jscoverage['/compiler.js'].functionData[11]++;
  _$jscoverage['/compiler.js'].lineData[208]++;
  var nextIdNameCode = self[param.type](param);
  _$jscoverage['/compiler.js'].lineData[209]++;
  if (visit66_209_1(nextIdNameCode[0])) {
    _$jscoverage['/compiler.js'].lineData[210]++;
    pushToArray(source, nextIdNameCode[1]);
    _$jscoverage['/compiler.js'].lineData[211]++;
    source.push(paramsName + '.push(' + nextIdNameCode[0] + ');');
  } else {
    _$jscoverage['/compiler.js'].lineData[213]++;
    pushToArray(source, nextIdNameCode[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[214]++;
    source.push(paramsName + '.push(' + lastOfArray(nextIdNameCode[1]) + ');');
  }
});
      _$jscoverage['/compiler.js'].lineData[217]++;
      source.push(configName + '.params=' + paramsName + ';');
    }
    _$jscoverage['/compiler.js'].lineData[220]++;
    if (visit67_220_1(hash)) {
      _$jscoverage['/compiler.js'].lineData[221]++;
      var hashName = guid('hash');
      _$jscoverage['/compiler.js'].lineData[222]++;
      source.push('var ' + hashName + ' = {};');
      _$jscoverage['/compiler.js'].lineData[223]++;
      S.each(hash.value, function(v, key) {
  _$jscoverage['/compiler.js'].functionData[12]++;
  _$jscoverage['/compiler.js'].lineData[224]++;
  var nextIdNameCode = self[v.type](v);
  _$jscoverage['/compiler.js'].lineData[225]++;
  if (visit68_225_1(nextIdNameCode[0])) {
    _$jscoverage['/compiler.js'].lineData[226]++;
    pushToArray(source, nextIdNameCode[1]);
    _$jscoverage['/compiler.js'].lineData[227]++;
    source.push(hashName + '["' + key + '"] = ' + nextIdNameCode[0] + ';');
  } else {
    _$jscoverage['/compiler.js'].lineData[229]++;
    pushToArray(source, nextIdNameCode[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[230]++;
    source.push(hashName + '["' + key + '"] = ' + lastOfArray(nextIdNameCode[1]) + ';');
  }
});
      _$jscoverage['/compiler.js'].lineData[233]++;
      source.push(configName + '.hash=' + hashName + ';');
    }
  }
  _$jscoverage['/compiler.js'].lineData[237]++;
  return [configName, source];
}, 
  conditionalOrExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[13]++;
  _$jscoverage['/compiler.js'].lineData[242]++;
  return this.genOpExpression(e, '||');
}, 
  conditionalAndExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[14]++;
  _$jscoverage['/compiler.js'].lineData[246]++;
  return this.genOpExpression(e, '&&');
}, 
  relationalExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[15]++;
  _$jscoverage['/compiler.js'].lineData[250]++;
  return this.genOpExpression(e, e.opType);
}, 
  equalityExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[16]++;
  _$jscoverage['/compiler.js'].lineData[254]++;
  return this.genOpExpression(e, e.opType);
}, 
  additiveExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[17]++;
  _$jscoverage['/compiler.js'].lineData[258]++;
  return this.genOpExpression(e, e.opType);
}, 
  multiplicativeExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[18]++;
  _$jscoverage['/compiler.js'].lineData[262]++;
  return this.genOpExpression(e, e.opType);
}, 
  unaryExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[19]++;
  _$jscoverage['/compiler.js'].lineData[266]++;
  var source = [], name, code = this[e.value.type](e.value);
  _$jscoverage['/compiler.js'].lineData[269]++;
  arrayPush.apply(source, code[1]);
  _$jscoverage['/compiler.js'].lineData[270]++;
  if (visit69_270_1(name = code[0])) {
    _$jscoverage['/compiler.js'].lineData[271]++;
    source.push(name + '=!' + name + ';');
  } else {
    _$jscoverage['/compiler.js'].lineData[273]++;
    source[source.length - 1] = '!' + lastOfArray(source);
  }
  _$jscoverage['/compiler.js'].lineData[275]++;
  return [name, source];
}, 
  'string': function(e) {
  _$jscoverage['/compiler.js'].functionData[20]++;
  _$jscoverage['/compiler.js'].lineData[280]++;
  return ['', ["'" + escapeString(e.value, true) + "'"]];
}, 
  'number': function(e) {
  _$jscoverage['/compiler.js'].functionData[21]++;
  _$jscoverage['/compiler.js'].lineData[284]++;
  return ['', [e.value]];
}, 
  'boolean': function(e) {
  _$jscoverage['/compiler.js'].functionData[22]++;
  _$jscoverage['/compiler.js'].lineData[288]++;
  return ['', [e.value]];
}, 
  'id': function(e, topLevel) {
  _$jscoverage['/compiler.js'].functionData[23]++;
  _$jscoverage['/compiler.js'].lineData[293]++;
  return this.genId(e, undefined, !topLevel);
}, 
  'block': function(block) {
  _$jscoverage['/compiler.js'].functionData[24]++;
  _$jscoverage['/compiler.js'].lineData[297]++;
  var programNode = block.program, source = [], self = this, tplNode = block.tpl, configNameCode = self.genConfig(tplNode), configName = configNameCode[0], tplPath = tplNode.path, pathString = tplPath.string, inverseFn;
  _$jscoverage['/compiler.js'].lineData[307]++;
  pushToArray(source, configNameCode[1]);
  _$jscoverage['/compiler.js'].lineData[309]++;
  if (visit70_309_1(!configName)) {
    _$jscoverage['/compiler.js'].lineData[310]++;
    configName = S.guid('config');
    _$jscoverage['/compiler.js'].lineData[311]++;
    source.push('var ' + configName + ' = {};');
  }
  _$jscoverage['/compiler.js'].lineData[314]++;
  source.push(configName + '.fn=' + self.genFunction(programNode.statements).join('\n') + ';');
  _$jscoverage['/compiler.js'].lineData[317]++;
  if (visit71_317_1(programNode.inverse)) {
    _$jscoverage['/compiler.js'].lineData[318]++;
    inverseFn = self.genFunction(programNode.inverse).join('\n');
    _$jscoverage['/compiler.js'].lineData[319]++;
    source.push(configName + '.inverse=' + inverseFn + ';');
  }
  _$jscoverage['/compiler.js'].lineData[324]++;
  if (visit72_324_1(tplNode.isInverted)) {
    _$jscoverage['/compiler.js'].lineData[325]++;
    var tmp = guid('inverse');
    _$jscoverage['/compiler.js'].lineData[326]++;
    source.push('var ' + tmp + '=' + configName + '.fn;');
    _$jscoverage['/compiler.js'].lineData[327]++;
    source.push(configName + '.fn = ' + configName + '.inverse;');
    _$jscoverage['/compiler.js'].lineData[328]++;
    source.push(configName + '.inverse = ' + tmp + ';');
  }
  _$jscoverage['/compiler.js'].lineData[331]++;
  if (visit73_331_1(!tplNode.hash && !tplNode.params)) {
    _$jscoverage['/compiler.js'].lineData[332]++;
    var parts = tplPath.parts;
    _$jscoverage['/compiler.js'].lineData[333]++;
    for (var i = 0; visit74_333_1(i < parts.length); i++) {
      _$jscoverage['/compiler.js'].lineData[335]++;
      if (visit75_335_1(typeof parts[i] != 'string')) {
        _$jscoverage['/compiler.js'].lineData[336]++;
        pathString = self.getIdStringFromIdParts(source, parts);
        _$jscoverage['/compiler.js'].lineData[337]++;
        break;
      }
    }
  }
  _$jscoverage['/compiler.js'].lineData[342]++;
  source.push('buffer += runBlockCommandUtil(engine, scopes, ' + configName + ', ' + '"' + pathString + '", ' + tplPath.lineNumber + ');');
  _$jscoverage['/compiler.js'].lineData[346]++;
  return source;
}, 
  'content': function(contentNode) {
  _$jscoverage['/compiler.js'].functionData[25]++;
  _$jscoverage['/compiler.js'].lineData[350]++;
  return ['buffer += \'' + escapeString(contentNode.value, false) + '\';'];
}, 
  'tpl': function(tplNode) {
  _$jscoverage['/compiler.js'].functionData[26]++;
  _$jscoverage['/compiler.js'].lineData[354]++;
  var source = [], genIdCode = this.genId(tplNode.path, tplNode);
  _$jscoverage['/compiler.js'].lineData[356]++;
  pushToArray(source, genIdCode[1]);
  _$jscoverage['/compiler.js'].lineData[357]++;
  source.push('buffer += ' + genIdCode[0] + ';');
  _$jscoverage['/compiler.js'].lineData[358]++;
  return source;
}, 
  'tplExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[27]++;
  _$jscoverage['/compiler.js'].lineData[362]++;
  var source = [], escaped = e.escaped, expressionOrVariable;
  _$jscoverage['/compiler.js'].lineData[365]++;
  var code = this[e.expression.type](e.expression, 1);
  _$jscoverage['/compiler.js'].lineData[366]++;
  if (visit76_366_1(code[0])) {
    _$jscoverage['/compiler.js'].lineData[367]++;
    pushToArray(source, code[1]);
    _$jscoverage['/compiler.js'].lineData[368]++;
    expressionOrVariable = code[0];
  } else {
    _$jscoverage['/compiler.js'].lineData[370]++;
    pushToArray(source, code[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[371]++;
    expressionOrVariable = lastOfArray(code[1]);
  }
  _$jscoverage['/compiler.js'].lineData[373]++;
  source.push('buffer += getExpressionUtil(' + expressionOrVariable + ',' + escaped + ');');
  _$jscoverage['/compiler.js'].lineData[374]++;
  return source;
}, 
  'getIdStringFromIdParts': function(source, idParts) {
  _$jscoverage['/compiler.js'].functionData[28]++;
  _$jscoverage['/compiler.js'].lineData[379]++;
  var idString = '', self = this, i, idPart, idPartType, nextIdNameCode, first = true;
  _$jscoverage['/compiler.js'].lineData[386]++;
  for (i = 0; visit77_386_1(i < idParts.length); i++) {
    _$jscoverage['/compiler.js'].lineData[387]++;
    idPart = idParts[i];
    _$jscoverage['/compiler.js'].lineData[388]++;
    idPartType = idPart.type;
    _$jscoverage['/compiler.js'].lineData[389]++;
    if (visit78_389_1(!first)) {
      _$jscoverage['/compiler.js'].lineData[390]++;
      idString += '.';
    }
    _$jscoverage['/compiler.js'].lineData[392]++;
    if (visit79_392_1(idPartType)) {
      _$jscoverage['/compiler.js'].lineData[393]++;
      nextIdNameCode = self[idPartType](idPart);
      _$jscoverage['/compiler.js'].lineData[394]++;
      if (visit80_394_1(nextIdNameCode[0])) {
        _$jscoverage['/compiler.js'].lineData[395]++;
        pushToArray(source, nextIdNameCode[1]);
        _$jscoverage['/compiler.js'].lineData[396]++;
        idString += '"+' + nextIdNameCode[0] + '+"';
        _$jscoverage['/compiler.js'].lineData[397]++;
        first = true;
      }
    } else {
      _$jscoverage['/compiler.js'].lineData[401]++;
      idString += idPart;
      _$jscoverage['/compiler.js'].lineData[402]++;
      first = false;
    }
  }
  _$jscoverage['/compiler.js'].lineData[405]++;
  return idString;
}};
  _$jscoverage['/compiler.js'].lineData[409]++;
  var compiler;
  _$jscoverage['/compiler.js'].lineData[416]++;
  return compiler = {
  parse: function(tpl) {
  _$jscoverage['/compiler.js'].functionData[29]++;
  _$jscoverage['/compiler.js'].lineData[423]++;
  return parser.parse(tpl);
}, 
  compileToStr: function(tpl) {
  _$jscoverage['/compiler.js'].functionData[30]++;
  _$jscoverage['/compiler.js'].lineData[431]++;
  var func = this.compile(tpl);
  _$jscoverage['/compiler.js'].lineData[432]++;
  return 'function(' + func.params.join(',') + '){\n' + func.source.join('\n') + '}';
}, 
  compile: function(tpl) {
  _$jscoverage['/compiler.js'].functionData[31]++;
  _$jscoverage['/compiler.js'].lineData[442]++;
  var root = this.parse(tpl);
  _$jscoverage['/compiler.js'].lineData[443]++;
  variableId = 0;
  _$jscoverage['/compiler.js'].lineData[444]++;
  return gen.genFunction(root.statements, true);
}, 
  compileToFn: function(tpl, config) {
  _$jscoverage['/compiler.js'].functionData[32]++;
  _$jscoverage['/compiler.js'].lineData[454]++;
  var code = compiler.compile(tpl);
  _$jscoverage['/compiler.js'].lineData[455]++;
  config = visit81_455_1(config || {});
  _$jscoverage['/compiler.js'].lineData[456]++;
  var sourceURL = 'sourceURL=' + (config.name ? config.name : ('xtemplate' + (xtemplateId++))) + '.js';
  _$jscoverage['/compiler.js'].lineData[461]++;
  return Function.apply(null, [].concat(code.params).concat(code.source.join('\n') + '\n//@ ' + sourceURL + '\n//# ' + sourceURL));
}};
});
