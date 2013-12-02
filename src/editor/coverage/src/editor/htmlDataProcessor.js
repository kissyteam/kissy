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
if (! _$jscoverage['/editor/htmlDataProcessor.js']) {
  _$jscoverage['/editor/htmlDataProcessor.js'] = {};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[10] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[11] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[12] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[13] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[14] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[16] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[22] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[23] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[28] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[29] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[30] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[31] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[32] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[33] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[34] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[37] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[39] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[43] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[45] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[46] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[47] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[52] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[71] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[80] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[82] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[85] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[87] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[88] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[89] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[90] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[95] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[98] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[101] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[102] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[104] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[105] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[107] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[108] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[115] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[116] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[118] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[129] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[130] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[132] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[148] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[149] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[150] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[152] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[155] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[160] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[162] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[163] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[168] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[169] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[177] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[182] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[185] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[186] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[189] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[190] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[192] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[195] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[196] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[197] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[198] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[199] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[201] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[202] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[207] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[208] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[210] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[218] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[219] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[220] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[223] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[224] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[230] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[231] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[232] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[235] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[240] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[241] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[245] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[246] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[247] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[253] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[254] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[255] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[257] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[258] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[259] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[262] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[263] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[270] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[272] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[279] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[284] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[285] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[286] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[289] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[290] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[292] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[297] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[299] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[302] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[305] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[307] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[308] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[311] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[312] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[313] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[317] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[318] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[319] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[323] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[324] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[327] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[328] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[331] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[337] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[339] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[345] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[347] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[348] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[349] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[354] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[361] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[363] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[367] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[371] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[376] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[378] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[379] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[382] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[384] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[389] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[392] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[394] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[396] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[402] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[404] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[405] = 0;
}
if (! _$jscoverage['/editor/htmlDataProcessor.js'].functionData) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[0] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[1] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[2] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[3] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[4] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[5] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[6] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[7] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[8] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[9] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[10] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[11] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[12] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[13] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[14] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[15] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[16] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[17] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[18] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[19] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[20] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[21] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[22] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[23] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[24] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[25] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[26] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[27] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[28] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[29] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[30] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[31] = 0;
}
if (! _$jscoverage['/editor/htmlDataProcessor.js'].branchData) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData = {};
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['13'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['28'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['30'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['32'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['32'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['32'][3] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['82'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['87'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['89'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['101'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['104'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['107'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['115'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['129'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['148'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['155'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['189'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['189'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['189'][3] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['197'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['198'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['198'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['198'][3] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['201'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['201'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['210'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['213'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['213'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['214'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['220'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['223'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['232'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['246'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['289'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['337'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['354'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['354'][1] = new BranchData();
}
_$jscoverage['/editor/htmlDataProcessor.js'].branchData['354'][1].init(85, 25, '_dataFilter || dataFilter');
function visit374_354_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['337'][1].init(25, 9, 'UA.webkit');
function visit373_337_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['289'][1].init(183, 49, 'attributes.indexOf(\'_keSaved_\' + attrName) === -1');
function visit372_289_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['246'][1].init(25, 19, '!(\'br\' in dtd[i])');
function visit371_246_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['232'][1].init(65, 26, 'blockNeedsExtension(block)');
function visit370_232_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['223'][1].init(138, 7, '!OLD_IE');
function visit369_223_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['220'][1].init(65, 26, 'blockNeedsExtension(block)');
function visit368_220_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['214'][1].init(52, 30, 'lastChild.nodeName === \'input\'');
function visit367_214_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['213'][2].init(335, 25, 'block.nodeName === \'form\'');
function visit366_213_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['213'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['213'][1].init(188, 83, 'block.nodeName === \'form\' && lastChild.nodeName === \'input\'');
function visit365_213_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['210'][1].init(144, 272, '!lastChild || block.nodeName === \'form\' && lastChild.nodeName === \'input\'');
function visit364_210_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['201'][2].init(206, 24, 'lastChild.nodeType === 3');
function visit363_201_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['201'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['201'][1].init(206, 67, 'lastChild.nodeType === 3 && tailNbspRegex.test(lastChild.nodeValue)');
function visit362_201_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['198'][3].init(57, 27, 'lastChild.nodeName === \'br\'');
function visit361_198_3(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['198'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['198'][2].init(29, 24, 'lastChild.nodeType === 1');
function visit360_198_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['198'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['198'][1].init(29, 55, 'lastChild.nodeType === 1 && lastChild.nodeName === \'br\'');
function visit359_198_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['197'][1].init(88, 9, 'lastChild');
function visit358_197_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['189'][3].init(206, 19, 'last.nodeType === 3');
function visit357_189_3(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['189'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['189'][2].init(206, 46, 'last.nodeType === 3 && !S.trim(last.nodeValue)');
function visit356_189_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['189'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['189'][1].init(198, 54, 'last && last.nodeType === 3 && !S.trim(last.nodeValue)');
function visit355_189_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['155'][1].init(5205, 6, 'OLD_IE');
function visit354_155_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['148'][1].init(99, 74, 'contents.substr(0, protectedSourceMarker.length) === protectedSourceMarker');
function visit353_148_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['129'][1].init(33, 10, '!S.trim(v)');
function visit352_129_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['115'][1].init(33, 60, '!(element.childNodes.length) && !(element.attributes.length)');
function visit351_115_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['107'][1].init(364, 12, 'parentHeight');
function visit350_107_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['104'][1].init(199, 11, 'parentWidth');
function visit349_104_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['101'][2].init(251, 28, 'parent.nodeName === \'object\'');
function visit348_101_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['101'][1].init(241, 38, 'parent && parent.nodeName === \'object\'');
function visit347_101_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['89'][1].init(133, 40, 'element.getAttribute(savedAttributeName)');
function visit346_89_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['87'][1].init(324, 25, 'i < attributeNames.length');
function visit345_87_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['82'][1].init(99, 17, 'attributes.length');
function visit344_82_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['32'][3].init(78, 43, 'child.nodeType === S.DOM.NodeType.TEXT_NODE');
function visit343_32_3(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['32'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['32'][2].init(78, 63, 'child.nodeType === S.DOM.NodeType.TEXT_NODE && !child.nodeValue');
function visit342_32_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['32'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['32'][1].init(76, 66, '!(child.nodeType === S.DOM.NodeType.TEXT_NODE && !child.nodeValue)');
function visit341_32_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['30'][1].init(67, 5, 'i < l');
function visit340_30_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['28'][1].init(197, 1, 'l');
function visit339_28_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['13'][1].init(99, 16, 'S.UA.ieMode < 11');
function visit338_13_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[0]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[11]++;
  var Editor = require('./base');
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[12]++;
  var HtmlParser = require('html-parser');
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[13]++;
  var OLD_IE = visit338_13_1(S.UA.ieMode < 11);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[14]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[1]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[16]++;
  var Node = S.Node, UA = S.UA, htmlFilter = new HtmlParser.Filter(), dataFilter = new HtmlParser.Filter();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[22]++;
  function filterInline(element) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[2]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[23]++;
    var childNodes = element.childNodes, i, child, allEmpty, l = childNodes.length;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[28]++;
    if (visit339_28_1(l)) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[29]++;
      allEmpty = 1;
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[30]++;
      for (i = 0; visit340_30_1(i < l); i++) {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[31]++;
        child = childNodes[i];
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[32]++;
        if (visit341_32_1(!(visit342_32_2(visit343_32_3(child.nodeType === S.DOM.NodeType.TEXT_NODE) && !child.nodeValue)))) {
          _$jscoverage['/editor/htmlDataProcessor.js'].lineData[33]++;
          allEmpty = 0;
          _$jscoverage['/editor/htmlDataProcessor.js'].lineData[34]++;
          break;
        }
      }
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[37]++;
      return allEmpty ? false : undefined;
    } else {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[39]++;
      return false;
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[43]++;
  (function() {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[3]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[45]++;
  function wrapAsComment(element) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[4]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[46]++;
    var html = HtmlParser.serialize(element);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[47]++;
    return new HtmlParser.Comment(protectedSourceMarker + encodeURIComponent(html).replace(/--/g, '%2D%2D'));
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[52]++;
  var defaultDataFilterRules = {
  tagNames: [[/^\?xml.*$/i, ''], [/^.*namespace.*$/i, '']], 
  attributeNames: [[/^on/, 'ke_on'], [/^lang$/, '']], 
  tags: {
  script: wrapAsComment, 
  noscript: wrapAsComment, 
  span: filterInline}};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[71]++;
  var defaultHTMLFilterRules = {
  tagNames: [[(/^ke:/), ''], [(/^\?xml:namespace$/), '']], 
  tags: {
  $: function(element) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[5]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[80]++;
  var attributes = element.attributes;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[82]++;
  if (visit344_82_1(attributes.length)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[85]++;
    var attributeNames = ['name', 'href', 'src'], savedAttributeName;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[87]++;
    for (var i = 0; visit345_87_1(i < attributeNames.length); i++) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[88]++;
      savedAttributeName = '_keSaved_' + attributeNames[i];
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[89]++;
      if (visit346_89_1(element.getAttribute(savedAttributeName))) {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[90]++;
        element.removeAttribute(attributeNames[i]);
      }
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[95]++;
  return element;
}, 
  embed: function(element) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[6]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[98]++;
  var parent = element.parentNode;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[101]++;
  if (visit347_101_1(parent && visit348_101_2(parent.nodeName === 'object'))) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[102]++;
    var parentWidth = parent.getAttribute('width'), parentHeight = parent.getAttribute('height');
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[104]++;
    if (visit349_104_1(parentWidth)) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[105]++;
      element.setAttribute('width', parentWidth);
    }
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[107]++;
    if (visit350_107_1(parentHeight)) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[108]++;
      element.setAttribute('width', parentHeight);
    }
  }
}, 
  a: function(element) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[7]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[115]++;
  if (visit351_115_1(!(element.childNodes.length) && !(element.attributes.length))) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[116]++;
    return false;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[118]++;
  return undefined;
}, 
  span: filterInline, 
  strong: filterInline, 
  em: filterInline, 
  del: filterInline, 
  u: filterInline}, 
  attributes: {
  style: function(v) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[8]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[129]++;
  if (visit352_129_1(!S.trim(v))) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[130]++;
    return false;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[132]++;
  return undefined;
}}, 
  attributeNames: [[(/^_keSaved_/), ''], [(/^ke_on/), 'on'], [(/^_ke.*/), ''], [(/^ke:.*$/), ''], [(/^_ks.*/), '']], 
  comment: function(contents) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[9]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[148]++;
  if (visit353_148_1(contents.substr(0, protectedSourceMarker.length) === protectedSourceMarker)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[149]++;
    contents = S.trim(S.urlDecode(contents.substr(protectedSourceMarker.length)));
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[150]++;
    return HtmlParser.parse(contents).childNodes[0];
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[152]++;
  return undefined;
}};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[155]++;
  if (visit354_155_1(OLD_IE)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[160]++;
    defaultHTMLFilterRules.attributes.style = function(value) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[10]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[162]++;
  return value.replace(/(^|;)([^:]+)/g, function(match) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[11]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[163]++;
  return match.toLowerCase();
});
};
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[168]++;
  htmlFilter.addRules(defaultHTMLFilterRules);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[169]++;
  dataFilter.addRules(defaultDataFilterRules);
})();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[177]++;
  (function() {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[12]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[182]++;
  var tailNbspRegex = /^[\t\r\n ]*(?:&nbsp;|\xa0)[\t\r\n ]*$/;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[185]++;
  function lastNoneSpaceChild(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[13]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[186]++;
    var childNodes = block.childNodes, lastIndex = childNodes.length, last = childNodes[lastIndex - 1];
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[189]++;
    while (visit355_189_1(last && visit356_189_2(visit357_189_3(last.nodeType === 3) && !S.trim(last.nodeValue)))) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[190]++;
      last = childNodes[--lastIndex];
    }
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[192]++;
    return last;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[195]++;
  function trimFillers(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[14]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[196]++;
    var lastChild = lastNoneSpaceChild(block);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[197]++;
    if (visit358_197_1(lastChild)) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[198]++;
      if (visit359_198_1(visit360_198_2(lastChild.nodeType === 1) && visit361_198_3(lastChild.nodeName === 'br'))) {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[199]++;
        block.removeChild(lastChild);
      } else {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[201]++;
        if (visit362_201_1(visit363_201_2(lastChild.nodeType === 3) && tailNbspRegex.test(lastChild.nodeValue))) {
          _$jscoverage['/editor/htmlDataProcessor.js'].lineData[202]++;
          block.removeChild(lastChild);
        }
      }
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[207]++;
  function blockNeedsExtension(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[15]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[208]++;
    var lastChild = lastNoneSpaceChild(block);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[210]++;
    return visit364_210_1(!lastChild || visit365_213_1(visit366_213_2(block.nodeName === 'form') && visit367_214_1(lastChild.nodeName === 'input')));
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[218]++;
  function extendBlockForDisplay(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[16]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[219]++;
    trimFillers(block);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[220]++;
    if (visit368_220_1(blockNeedsExtension(block))) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[223]++;
      if (visit369_223_1(!OLD_IE)) {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[224]++;
        block.appendChild(new HtmlParser.Tag('br'));
      }
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[230]++;
  function extendBlockForOutput(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[17]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[231]++;
    trimFillers(block);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[232]++;
    if (visit370_232_1(blockNeedsExtension(block))) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[235]++;
      block.appendChild(new HtmlParser.Text('\xa0'));
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[240]++;
  var dtd = Editor.XHTML_DTD;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[241]++;
  var blockLikeTags = S.merge(dtd.$block, dtd.$listItem, dtd.$tableContent), i;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[245]++;
  for (i in blockLikeTags) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[246]++;
    if (visit371_246_1(!('br' in dtd[i]))) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[247]++;
      delete blockLikeTags[i];
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[253]++;
  delete blockLikeTags.pre;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[254]++;
  var defaultDataBlockFilterRules = {
  tags: {}};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[255]++;
  var defaultHTMLBlockFilterRules = {
  tags: {}};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[257]++;
  for (i in blockLikeTags) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[258]++;
    defaultDataBlockFilterRules.tags[i] = extendBlockForDisplay;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[259]++;
    defaultHTMLBlockFilterRules.tags[i] = extendBlockForOutput;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[262]++;
  dataFilter.addRules(defaultDataBlockFilterRules);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[263]++;
  htmlFilter.addRules(defaultHTMLBlockFilterRules);
})();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[270]++;
  htmlFilter.addRules({
  text: function(text) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[18]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[272]++;
  return text.replace(/\xa0/g, '&nbsp;');
}});
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[279]++;
  var protectElementRegex = /<(a|area|img|input)\b([^>]*)>/gi, protectAttributeRegex = /\b(href|src|name)\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|(?:[^ "'>]+))/gi;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[284]++;
  function protectAttributes(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[19]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[285]++;
    return html.replace(protectElementRegex, function(element, tag, attributes) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[20]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[286]++;
  return '<' + tag + attributes.replace(protectAttributeRegex, function(fullAttr, attrName) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[21]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[289]++;
  if (visit372_289_1(attributes.indexOf('_keSaved_' + attrName) === -1)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[290]++;
    return ' _keSaved_' + fullAttr + ' ' + fullAttr;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[292]++;
  return fullAttr;
}) + '>';
});
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[297]++;
  var protectedSourceMarker = '{ke_protected}';
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[299]++;
  var protectElementsRegex = /(?:<textarea[^>]*>[\s\S]*<\/textarea>)|(?:<style[^>]*>[\s\S]*<\/style>)|(?:<script[^>]*>[\s\S]*<\/script>)|(?:<(:?link|meta|base)[^>]*>)/gi, encodedElementsRegex = /<ke:encoded>([^<]*)<\/ke:encoded>/gi;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[302]++;
  var protectElementNamesRegex = /(<\/?)((?:object|embed|param|html|body|head|title|noscript)[^>]*>)/gi, unprotectElementNamesRegex = /(<\/?)ke:((?:object|embed|param|html|body|head|title|noscript)[^>]*>)/gi;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[305]++;
  var protectSelfClosingRegex = /<ke:(param|embed)([^>]*?)\/?>(?!\s*<\/ke:\1)/gi;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[307]++;
  function protectSelfClosingElements(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[22]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[308]++;
    return html.replace(protectSelfClosingRegex, '<ke:$1$2></ke:$1>');
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[311]++;
  function protectElements(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[23]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[312]++;
    return html.replace(protectElementsRegex, function(match) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[24]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[313]++;
  return '<ke:encoded>' + encodeURIComponent(match) + '</ke:encoded>';
});
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[317]++;
  function unprotectElements(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[25]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[318]++;
    return html.replace(encodedElementsRegex, function(match, encoded) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[26]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[319]++;
  return S.urlDecode(encoded);
});
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[323]++;
  function protectElementsNames(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[27]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[324]++;
    return html.replace(protectElementNamesRegex, '$1ke:$2');
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[327]++;
  function unprotectElementNames(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[28]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[328]++;
    return html.replace(unprotectElementNamesRegex, '$1$2');
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[331]++;
  editor.htmlDataProcessor = {
  dataFilter: dataFilter, 
  htmlFilter: htmlFilter, 
  toHtml: function(html) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[29]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[337]++;
  if (visit373_337_1(UA.webkit)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[339]++;
    html = html.replace(/\u200b/g, '');
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[345]++;
  var writer = new HtmlParser.BeautifyWriter(), n = new HtmlParser.Parser(html).parse();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[347]++;
  n.writeHtml(writer, htmlFilter);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[348]++;
  html = writer.getHtml();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[349]++;
  return html;
}, 
  toDataFormat: function(html, _dataFilter) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[30]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[354]++;
  _dataFilter = visit374_354_1(_dataFilter || dataFilter);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[361]++;
  html = protectElements(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[363]++;
  html = protectAttributes(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[367]++;
  html = protectElementsNames(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[371]++;
  html = protectSelfClosingElements(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[376]++;
  var div = new Node('<div>');
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[378]++;
  div.html('a' + html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[379]++;
  html = div.html().substr(1);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[382]++;
  html = unprotectElementNames(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[384]++;
  html = unprotectElements(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[389]++;
  var writer = new HtmlParser.BasicWriter(), n = new HtmlParser.Parser(html).parse();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[392]++;
  n.writeHtml(writer, _dataFilter);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[394]++;
  html = writer.getHtml();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[396]++;
  return html;
}, 
  toServer: function(html) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[31]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[402]++;
  var writer = new HtmlParser.MinifyWriter(), n = new HtmlParser.Parser(html).parse();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[404]++;
  n.writeHtml(writer, htmlFilter);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[405]++;
  return writer.getHtml();
}};
}};
});
