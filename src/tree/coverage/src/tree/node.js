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
if (! _$jscoverage['/tree/node.js']) {
  _$jscoverage['/tree/node.js'] = {};
  _$jscoverage['/tree/node.js'].lineData = [];
  _$jscoverage['/tree/node.js'].lineData[5] = 0;
  _$jscoverage['/tree/node.js'].lineData[6] = 0;
  _$jscoverage['/tree/node.js'].lineData[17] = 0;
  _$jscoverage['/tree/node.js'].lineData[19] = 0;
  _$jscoverage['/tree/node.js'].lineData[20] = 0;
  _$jscoverage['/tree/node.js'].lineData[21] = 0;
  _$jscoverage['/tree/node.js'].lineData[26] = 0;
  _$jscoverage['/tree/node.js'].lineData[27] = 0;
  _$jscoverage['/tree/node.js'].lineData[33] = 0;
  _$jscoverage['/tree/node.js'].lineData[43] = 0;
  _$jscoverage['/tree/node.js'].lineData[45] = 0;
  _$jscoverage['/tree/node.js'].lineData[46] = 0;
  _$jscoverage['/tree/node.js'].lineData[51] = 0;
  _$jscoverage['/tree/node.js'].lineData[52] = 0;
  _$jscoverage['/tree/node.js'].lineData[57] = 0;
  _$jscoverage['/tree/node.js'].lineData[58] = 0;
  _$jscoverage['/tree/node.js'].lineData[63] = 0;
  _$jscoverage['/tree/node.js'].lineData[64] = 0;
  _$jscoverage['/tree/node.js'].lineData[69] = 0;
  _$jscoverage['/tree/node.js'].lineData[70] = 0;
  _$jscoverage['/tree/node.js'].lineData[75] = 0;
  _$jscoverage['/tree/node.js'].lineData[76] = 0;
  _$jscoverage['/tree/node.js'].lineData[78] = 0;
  _$jscoverage['/tree/node.js'].lineData[80] = 0;
  _$jscoverage['/tree/node.js'].lineData[85] = 0;
  _$jscoverage['/tree/node.js'].lineData[86] = 0;
  _$jscoverage['/tree/node.js'].lineData[87] = 0;
  _$jscoverage['/tree/node.js'].lineData[89] = 0;
  _$jscoverage['/tree/node.js'].lineData[92] = 0;
  _$jscoverage['/tree/node.js'].lineData[95] = 0;
  _$jscoverage['/tree/node.js'].lineData[96] = 0;
  _$jscoverage['/tree/node.js'].lineData[99] = 0;
  _$jscoverage['/tree/node.js'].lineData[100] = 0;
  _$jscoverage['/tree/node.js'].lineData[103] = 0;
  _$jscoverage['/tree/node.js'].lineData[107] = 0;
  _$jscoverage['/tree/node.js'].lineData[111] = 0;
  _$jscoverage['/tree/node.js'].lineData[112] = 0;
  _$jscoverage['/tree/node.js'].lineData[114] = 0;
  _$jscoverage['/tree/node.js'].lineData[115] = 0;
  _$jscoverage['/tree/node.js'].lineData[116] = 0;
  _$jscoverage['/tree/node.js'].lineData[117] = 0;
  _$jscoverage['/tree/node.js'].lineData[119] = 0;
  _$jscoverage['/tree/node.js'].lineData[123] = 0;
  _$jscoverage['/tree/node.js'].lineData[127] = 0;
  _$jscoverage['/tree/node.js'].lineData[128] = 0;
  _$jscoverage['/tree/node.js'].lineData[130] = 0;
  _$jscoverage['/tree/node.js'].lineData[131] = 0;
  _$jscoverage['/tree/node.js'].lineData[132] = 0;
  _$jscoverage['/tree/node.js'].lineData[133] = 0;
  _$jscoverage['/tree/node.js'].lineData[135] = 0;
  _$jscoverage['/tree/node.js'].lineData[142] = 0;
  _$jscoverage['/tree/node.js'].lineData[146] = 0;
  _$jscoverage['/tree/node.js'].lineData[150] = 0;
  _$jscoverage['/tree/node.js'].lineData[151] = 0;
  _$jscoverage['/tree/node.js'].lineData[152] = 0;
  _$jscoverage['/tree/node.js'].lineData[154] = 0;
  _$jscoverage['/tree/node.js'].lineData[155] = 0;
  _$jscoverage['/tree/node.js'].lineData[157] = 0;
  _$jscoverage['/tree/node.js'].lineData[164] = 0;
  _$jscoverage['/tree/node.js'].lineData[165] = 0;
  _$jscoverage['/tree/node.js'].lineData[167] = 0;
  _$jscoverage['/tree/node.js'].lineData[168] = 0;
  _$jscoverage['/tree/node.js'].lineData[173] = 0;
  _$jscoverage['/tree/node.js'].lineData[174] = 0;
  _$jscoverage['/tree/node.js'].lineData[175] = 0;
  _$jscoverage['/tree/node.js'].lineData[179] = 0;
  _$jscoverage['/tree/node.js'].lineData[180] = 0;
  _$jscoverage['/tree/node.js'].lineData[182] = 0;
  _$jscoverage['/tree/node.js'].lineData[190] = 0;
  _$jscoverage['/tree/node.js'].lineData[191] = 0;
  _$jscoverage['/tree/node.js'].lineData[192] = 0;
  _$jscoverage['/tree/node.js'].lineData[193] = 0;
  _$jscoverage['/tree/node.js'].lineData[201] = 0;
  _$jscoverage['/tree/node.js'].lineData[202] = 0;
  _$jscoverage['/tree/node.js'].lineData[203] = 0;
  _$jscoverage['/tree/node.js'].lineData[204] = 0;
  _$jscoverage['/tree/node.js'].lineData[281] = 0;
  _$jscoverage['/tree/node.js'].lineData[282] = 0;
  _$jscoverage['/tree/node.js'].lineData[283] = 0;
  _$jscoverage['/tree/node.js'].lineData[285] = 0;
  _$jscoverage['/tree/node.js'].lineData[312] = 0;
  _$jscoverage['/tree/node.js'].lineData[313] = 0;
  _$jscoverage['/tree/node.js'].lineData[314] = 0;
  _$jscoverage['/tree/node.js'].lineData[315] = 0;
  _$jscoverage['/tree/node.js'].lineData[319] = 0;
  _$jscoverage['/tree/node.js'].lineData[320] = 0;
  _$jscoverage['/tree/node.js'].lineData[321] = 0;
  _$jscoverage['/tree/node.js'].lineData[322] = 0;
  _$jscoverage['/tree/node.js'].lineData[323] = 0;
  _$jscoverage['/tree/node.js'].lineData[327] = 0;
  _$jscoverage['/tree/node.js'].lineData[328] = 0;
  _$jscoverage['/tree/node.js'].lineData[329] = 0;
  _$jscoverage['/tree/node.js'].lineData[330] = 0;
  _$jscoverage['/tree/node.js'].lineData[335] = 0;
  _$jscoverage['/tree/node.js'].lineData[336] = 0;
  _$jscoverage['/tree/node.js'].lineData[342] = 0;
  _$jscoverage['/tree/node.js'].lineData[345] = 0;
  _$jscoverage['/tree/node.js'].lineData[346] = 0;
  _$jscoverage['/tree/node.js'].lineData[348] = 0;
  _$jscoverage['/tree/node.js'].lineData[351] = 0;
  _$jscoverage['/tree/node.js'].lineData[352] = 0;
  _$jscoverage['/tree/node.js'].lineData[354] = 0;
  _$jscoverage['/tree/node.js'].lineData[355] = 0;
  _$jscoverage['/tree/node.js'].lineData[358] = 0;
  _$jscoverage['/tree/node.js'].lineData[362] = 0;
  _$jscoverage['/tree/node.js'].lineData[363] = 0;
  _$jscoverage['/tree/node.js'].lineData[364] = 0;
  _$jscoverage['/tree/node.js'].lineData[365] = 0;
  _$jscoverage['/tree/node.js'].lineData[367] = 0;
  _$jscoverage['/tree/node.js'].lineData[369] = 0;
  _$jscoverage['/tree/node.js'].lineData[373] = 0;
  _$jscoverage['/tree/node.js'].lineData[374] = 0;
  _$jscoverage['/tree/node.js'].lineData[377] = 0;
  _$jscoverage['/tree/node.js'].lineData[378] = 0;
  _$jscoverage['/tree/node.js'].lineData[382] = 0;
  _$jscoverage['/tree/node.js'].lineData[383] = 0;
  _$jscoverage['/tree/node.js'].lineData[384] = 0;
  _$jscoverage['/tree/node.js'].lineData[385] = 0;
  _$jscoverage['/tree/node.js'].lineData[387] = 0;
  _$jscoverage['/tree/node.js'].lineData[394] = 0;
  _$jscoverage['/tree/node.js'].lineData[395] = 0;
  _$jscoverage['/tree/node.js'].lineData[396] = 0;
  _$jscoverage['/tree/node.js'].lineData[400] = 0;
  _$jscoverage['/tree/node.js'].lineData[401] = 0;
  _$jscoverage['/tree/node.js'].lineData[402] = 0;
  _$jscoverage['/tree/node.js'].lineData[403] = 0;
  _$jscoverage['/tree/node.js'].lineData[404] = 0;
  _$jscoverage['/tree/node.js'].lineData[408] = 0;
  _$jscoverage['/tree/node.js'].lineData[409] = 0;
  _$jscoverage['/tree/node.js'].lineData[410] = 0;
  _$jscoverage['/tree/node.js'].lineData[412] = 0;
  _$jscoverage['/tree/node.js'].lineData[413] = 0;
  _$jscoverage['/tree/node.js'].lineData[414] = 0;
  _$jscoverage['/tree/node.js'].lineData[416] = 0;
  _$jscoverage['/tree/node.js'].lineData[421] = 0;
  _$jscoverage['/tree/node.js'].lineData[422] = 0;
  _$jscoverage['/tree/node.js'].lineData[423] = 0;
  _$jscoverage['/tree/node.js'].lineData[424] = 0;
  _$jscoverage['/tree/node.js'].lineData[427] = 0;
  _$jscoverage['/tree/node.js'].lineData[428] = 0;
  _$jscoverage['/tree/node.js'].lineData[429] = 0;
  _$jscoverage['/tree/node.js'].lineData[430] = 0;
}
if (! _$jscoverage['/tree/node.js'].functionData) {
  _$jscoverage['/tree/node.js'].functionData = [];
  _$jscoverage['/tree/node.js'].functionData[0] = 0;
  _$jscoverage['/tree/node.js'].functionData[1] = 0;
  _$jscoverage['/tree/node.js'].functionData[2] = 0;
  _$jscoverage['/tree/node.js'].functionData[3] = 0;
  _$jscoverage['/tree/node.js'].functionData[4] = 0;
  _$jscoverage['/tree/node.js'].functionData[5] = 0;
  _$jscoverage['/tree/node.js'].functionData[6] = 0;
  _$jscoverage['/tree/node.js'].functionData[7] = 0;
  _$jscoverage['/tree/node.js'].functionData[8] = 0;
  _$jscoverage['/tree/node.js'].functionData[9] = 0;
  _$jscoverage['/tree/node.js'].functionData[10] = 0;
  _$jscoverage['/tree/node.js'].functionData[11] = 0;
  _$jscoverage['/tree/node.js'].functionData[12] = 0;
  _$jscoverage['/tree/node.js'].functionData[13] = 0;
  _$jscoverage['/tree/node.js'].functionData[14] = 0;
  _$jscoverage['/tree/node.js'].functionData[15] = 0;
  _$jscoverage['/tree/node.js'].functionData[16] = 0;
  _$jscoverage['/tree/node.js'].functionData[17] = 0;
  _$jscoverage['/tree/node.js'].functionData[18] = 0;
  _$jscoverage['/tree/node.js'].functionData[19] = 0;
  _$jscoverage['/tree/node.js'].functionData[20] = 0;
  _$jscoverage['/tree/node.js'].functionData[21] = 0;
  _$jscoverage['/tree/node.js'].functionData[22] = 0;
  _$jscoverage['/tree/node.js'].functionData[23] = 0;
  _$jscoverage['/tree/node.js'].functionData[24] = 0;
  _$jscoverage['/tree/node.js'].functionData[25] = 0;
  _$jscoverage['/tree/node.js'].functionData[26] = 0;
  _$jscoverage['/tree/node.js'].functionData[27] = 0;
  _$jscoverage['/tree/node.js'].functionData[28] = 0;
}
if (! _$jscoverage['/tree/node.js'].branchData) {
  _$jscoverage['/tree/node.js'].branchData = {};
  _$jscoverage['/tree/node.js'].branchData['75'] = [];
  _$jscoverage['/tree/node.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['75'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['75'][3] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['85'] = [];
  _$jscoverage['/tree/node.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['85'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['86'] = [];
  _$jscoverage['/tree/node.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['99'] = [];
  _$jscoverage['/tree/node.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['111'] = [];
  _$jscoverage['/tree/node.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['116'] = [];
  _$jscoverage['/tree/node.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['127'] = [];
  _$jscoverage['/tree/node.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['132'] = [];
  _$jscoverage['/tree/node.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['151'] = [];
  _$jscoverage['/tree/node.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['167'] = [];
  _$jscoverage['/tree/node.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['180'] = [];
  _$jscoverage['/tree/node.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['282'] = [];
  _$jscoverage['/tree/node.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['314'] = [];
  _$jscoverage['/tree/node.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['321'] = [];
  _$jscoverage['/tree/node.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['329'] = [];
  _$jscoverage['/tree/node.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['337'] = [];
  _$jscoverage['/tree/node.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['338'] = [];
  _$jscoverage['/tree/node.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['342'] = [];
  _$jscoverage['/tree/node.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['342'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['348'] = [];
  _$jscoverage['/tree/node.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['348'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['348'][3] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['348'][4] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['354'] = [];
  _$jscoverage['/tree/node.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['364'] = [];
  _$jscoverage['/tree/node.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['377'] = [];
  _$jscoverage['/tree/node.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['384'] = [];
  _$jscoverage['/tree/node.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['395'] = [];
  _$jscoverage['/tree/node.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['402'] = [];
  _$jscoverage['/tree/node.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['409'] = [];
  _$jscoverage['/tree/node.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['413'] = [];
  _$jscoverage['/tree/node.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['427'] = [];
  _$jscoverage['/tree/node.js'].branchData['427'][1] = new BranchData();
}
_$jscoverage['/tree/node.js'].branchData['427'][1].init(183, 11, 'index < len');
function visit60_427_1(result) {
  _$jscoverage['/tree/node.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['413'][1].init(18, 27, 'typeof setDepth == \'number\'');
function visit59_413_1(result) {
  _$jscoverage['/tree/node.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['409'][1].init(14, 22, 'setDepth !== undefined');
function visit58_409_1(result) {
  _$jscoverage['/tree/node.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['402'][1].init(52, 4, 'tree');
function visit57_402_1(result) {
  _$jscoverage['/tree/node.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['395'][1].init(14, 21, 'self.get && self.view');
function visit56_395_1(result) {
  _$jscoverage['/tree/node.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['384'][1].init(298, 37, '!n && (parent = parent.get(\'parent\'))');
function visit55_384_1(result) {
  _$jscoverage['/tree/node.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['377'][1].init(97, 39, 'self.get("expanded") && children.length');
function visit54_377_1(result) {
  _$jscoverage['/tree/node.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['364'][1].init(47, 5, '!prev');
function visit53_364_1(result) {
  _$jscoverage['/tree/node.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['354'][1].init(95, 41, '!self.get("expanded") || !children.length');
function visit52_354_1(result) {
  _$jscoverage['/tree/node.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['348'][4].init(122, 20, 'isLeaf === undefined');
function visit51_348_4(result) {
  _$jscoverage['/tree/node.js'].branchData['348'][4].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['348'][3].init(122, 51, 'isLeaf === undefined && self.get("children").length');
function visit50_348_3(result) {
  _$jscoverage['/tree/node.js'].branchData['348'][3].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['348'][2].init(101, 16, 'isLeaf === false');
function visit49_348_2(result) {
  _$jscoverage['/tree/node.js'].branchData['348'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['348'][1].init(101, 73, 'isLeaf === false || (isLeaf === undefined && self.get("children").length)');
function visit48_348_1(result) {
  _$jscoverage['/tree/node.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['342'][2].init(253, 17, 'lastChild == self');
function visit47_342_2(result) {
  _$jscoverage['/tree/node.js'].branchData['342'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['342'][1].init(239, 31, '!lastChild || lastChild == self');
function visit46_342_1(result) {
  _$jscoverage['/tree/node.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['338'][1].init(115, 41, 'children && children[children.length - 1]');
function visit45_338_1(result) {
  _$jscoverage['/tree/node.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['337'][1].init(56, 32, 'parent && parent.get("children")');
function visit44_337_1(result) {
  _$jscoverage['/tree/node.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['329'][1].init(40, 17, 'e.target === self');
function visit43_329_1(result) {
  _$jscoverage['/tree/node.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['321'][1].init(40, 16, 'e.target == self');
function visit42_321_1(result) {
  _$jscoverage['/tree/node.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['314'][1].init(40, 16, 'e.target == self');
function visit41_314_1(result) {
  _$jscoverage['/tree/node.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['282'][1].init(67, 20, 'from && !from.isTree');
function visit40_282_1(result) {
  _$jscoverage['/tree/node.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['180'][1].init(60, 32, 'e && e.byPassSetTreeSelectedItem');
function visit39_180_1(result) {
  _$jscoverage['/tree/node.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['167'][1].init(158, 25, 'self === self.get(\'tree\')');
function visit38_167_1(result) {
  _$jscoverage['/tree/node.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['151'][1].init(206, 39, 'target.equals(self.get("expandIconEl"))');
function visit37_151_1(result) {
  _$jscoverage['/tree/node.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['132'][1].init(314, 11, 'index === 0');
function visit36_132_1(result) {
  _$jscoverage['/tree/node.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['127'][1].init(145, 7, '!parent');
function visit35_127_1(result) {
  _$jscoverage['/tree/node.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['116'][1].init(314, 28, 'index == siblings.length - 1');
function visit34_116_1(result) {
  _$jscoverage['/tree/node.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['111'][1].init(145, 7, '!parent');
function visit33_111_1(result) {
  _$jscoverage['/tree/node.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['99'][1].init(2193, 16, 'nodeToBeSelected');
function visit32_99_1(result) {
  _$jscoverage['/tree/node.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['86'][1].init(30, 9, '!expanded');
function visit31_86_1(result) {
  _$jscoverage['/tree/node.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['85'][2].init(63, 16, 'isLeaf === false');
function visit30_85_2(result) {
  _$jscoverage['/tree/node.js'].branchData['85'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['85'][1].init(44, 35, 'children.length || isLeaf === false');
function visit29_85_1(result) {
  _$jscoverage['/tree/node.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['75'][3].init(75, 16, 'isLeaf === false');
function visit28_75_3(result) {
  _$jscoverage['/tree/node.js'].branchData['75'][3].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['75'][2].init(56, 35, 'children.length || isLeaf === false');
function visit27_75_2(result) {
  _$jscoverage['/tree/node.js'].branchData['75'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['75'][1].init(43, 49, 'expanded && (children.length || isLeaf === false)');
function visit26_75_1(result) {
  _$jscoverage['/tree/node.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].lineData[5]++;
KISSY.add("tree/node", function(S, Node, Container, TreeNodeRender) {
  _$jscoverage['/tree/node.js'].functionData[0]++;
  _$jscoverage['/tree/node.js'].lineData[6]++;
  var $ = Node.all, KeyCode = Node.KeyCode;
  _$jscoverage['/tree/node.js'].lineData[17]++;
  return Container.extend({
  bindUI: function() {
  _$jscoverage['/tree/node.js'].functionData[1]++;
  _$jscoverage['/tree/node.js'].lineData[19]++;
  this.on('afterAddChild', onAddChild);
  _$jscoverage['/tree/node.js'].lineData[20]++;
  this.on('afterRemoveChild', onRemoveChild);
  _$jscoverage['/tree/node.js'].lineData[21]++;
  this.on('afterAddChild afterRemoveChild', syncAriaSetSize);
}, 
  syncUI: function() {
  _$jscoverage['/tree/node.js'].functionData[2]++;
  _$jscoverage['/tree/node.js'].lineData[26]++;
  refreshCss(this);
  _$jscoverage['/tree/node.js'].lineData[27]++;
  syncAriaSetSize.call(this, {
  target: this});
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/tree/node.js'].functionData[3]++;
  _$jscoverage['/tree/node.js'].lineData[33]++;
  var self = this, processed = true, tree = self.get("tree"), expanded = self.get("expanded"), nodeToBeSelected, isLeaf = self.get("isLeaf"), children = self.get("children"), keyCode = e.keyCode;
  _$jscoverage['/tree/node.js'].lineData[43]++;
  switch (keyCode) {
    case KeyCode.ENTER:
      _$jscoverage['/tree/node.js'].lineData[45]++;
      return self.handleClickInternal(e);
      _$jscoverage['/tree/node.js'].lineData[46]++;
      break;
    case KeyCode.HOME:
      _$jscoverage['/tree/node.js'].lineData[51]++;
      nodeToBeSelected = tree;
      _$jscoverage['/tree/node.js'].lineData[52]++;
      break;
    case KeyCode.END:
      _$jscoverage['/tree/node.js'].lineData[57]++;
      nodeToBeSelected = getLastVisibleDescendant(tree);
      _$jscoverage['/tree/node.js'].lineData[58]++;
      break;
    case KeyCode.UP:
      _$jscoverage['/tree/node.js'].lineData[63]++;
      nodeToBeSelected = getPreviousVisibleNode(self);
      _$jscoverage['/tree/node.js'].lineData[64]++;
      break;
    case KeyCode.DOWN:
      _$jscoverage['/tree/node.js'].lineData[69]++;
      nodeToBeSelected = getNextVisibleNode(self);
      _$jscoverage['/tree/node.js'].lineData[70]++;
      break;
    case KeyCode.LEFT:
      _$jscoverage['/tree/node.js'].lineData[75]++;
      if (visit26_75_1(expanded && (visit27_75_2(children.length || visit28_75_3(isLeaf === false))))) {
        _$jscoverage['/tree/node.js'].lineData[76]++;
        self.set("expanded", false);
      } else {
        _$jscoverage['/tree/node.js'].lineData[78]++;
        nodeToBeSelected = self.get('parent');
      }
      _$jscoverage['/tree/node.js'].lineData[80]++;
      break;
    case KeyCode.RIGHT:
      _$jscoverage['/tree/node.js'].lineData[85]++;
      if (visit29_85_1(children.length || visit30_85_2(isLeaf === false))) {
        _$jscoverage['/tree/node.js'].lineData[86]++;
        if (visit31_86_1(!expanded)) {
          _$jscoverage['/tree/node.js'].lineData[87]++;
          self.set("expanded", true);
        } else {
          _$jscoverage['/tree/node.js'].lineData[89]++;
          nodeToBeSelected = children[0];
        }
      }
      _$jscoverage['/tree/node.js'].lineData[92]++;
      break;
    default:
      _$jscoverage['/tree/node.js'].lineData[95]++;
      processed = false;
      _$jscoverage['/tree/node.js'].lineData[96]++;
      break;
  }
  _$jscoverage['/tree/node.js'].lineData[99]++;
  if (visit32_99_1(nodeToBeSelected)) {
    _$jscoverage['/tree/node.js'].lineData[100]++;
    nodeToBeSelected.select();
  }
  _$jscoverage['/tree/node.js'].lineData[103]++;
  return processed;
}, 
  next: function() {
  _$jscoverage['/tree/node.js'].functionData[4]++;
  _$jscoverage['/tree/node.js'].lineData[107]++;
  var self = this, parent = self.get('parent'), siblings, index;
  _$jscoverage['/tree/node.js'].lineData[111]++;
  if (visit33_111_1(!parent)) {
    _$jscoverage['/tree/node.js'].lineData[112]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[114]++;
  siblings = parent.get('children');
  _$jscoverage['/tree/node.js'].lineData[115]++;
  index = S.indexOf(self, siblings);
  _$jscoverage['/tree/node.js'].lineData[116]++;
  if (visit34_116_1(index == siblings.length - 1)) {
    _$jscoverage['/tree/node.js'].lineData[117]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[119]++;
  return siblings[index + 1];
}, 
  prev: function() {
  _$jscoverage['/tree/node.js'].functionData[5]++;
  _$jscoverage['/tree/node.js'].lineData[123]++;
  var self = this, parent = self.get('parent'), siblings, index;
  _$jscoverage['/tree/node.js'].lineData[127]++;
  if (visit35_127_1(!parent)) {
    _$jscoverage['/tree/node.js'].lineData[128]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[130]++;
  siblings = parent.get('children');
  _$jscoverage['/tree/node.js'].lineData[131]++;
  index = S.indexOf(self, siblings);
  _$jscoverage['/tree/node.js'].lineData[132]++;
  if (visit36_132_1(index === 0)) {
    _$jscoverage['/tree/node.js'].lineData[133]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[135]++;
  return siblings[index - 1];
}, 
  select: function() {
  _$jscoverage['/tree/node.js'].functionData[6]++;
  _$jscoverage['/tree/node.js'].lineData[142]++;
  this.set('selected', true);
}, 
  handleClickInternal: function(e) {
  _$jscoverage['/tree/node.js'].functionData[7]++;
  _$jscoverage['/tree/node.js'].lineData[146]++;
  var self = this, target = $(e.target), expanded = self.get("expanded"), tree = self.get("tree");
  _$jscoverage['/tree/node.js'].lineData[150]++;
  tree.focus();
  _$jscoverage['/tree/node.js'].lineData[151]++;
  if (visit37_151_1(target.equals(self.get("expandIconEl")))) {
    _$jscoverage['/tree/node.js'].lineData[152]++;
    self.set("expanded", !expanded);
  } else {
    _$jscoverage['/tree/node.js'].lineData[154]++;
    self.select();
    _$jscoverage['/tree/node.js'].lineData[155]++;
    self.fire("click");
  }
  _$jscoverage['/tree/node.js'].lineData[157]++;
  return true;
}, 
  createChildren: function() {
  _$jscoverage['/tree/node.js'].functionData[8]++;
  _$jscoverage['/tree/node.js'].lineData[164]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[165]++;
  self.renderChildren.apply(self, arguments);
  _$jscoverage['/tree/node.js'].lineData[167]++;
  if (visit38_167_1(self === self.get('tree'))) {
    _$jscoverage['/tree/node.js'].lineData[168]++;
    updateSubTreeStatus(self, self, -1, 0);
  }
}, 
  _onSetExpanded: function(v) {
  _$jscoverage['/tree/node.js'].functionData[9]++;
  _$jscoverage['/tree/node.js'].lineData[173]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[174]++;
  refreshCss(self);
  _$jscoverage['/tree/node.js'].lineData[175]++;
  self.fire(v ? "expand" : "collapse");
}, 
  _onSetSelected: function(v, e) {
  _$jscoverage['/tree/node.js'].functionData[10]++;
  _$jscoverage['/tree/node.js'].lineData[179]++;
  var tree = this.get("tree");
  _$jscoverage['/tree/node.js'].lineData[180]++;
  if (visit39_180_1(e && e.byPassSetTreeSelectedItem)) {
  } else {
    _$jscoverage['/tree/node.js'].lineData[182]++;
    tree.set('selectedItem', v ? this : null);
  }
}, 
  expandAll: function() {
  _$jscoverage['/tree/node.js'].functionData[11]++;
  _$jscoverage['/tree/node.js'].lineData[190]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[191]++;
  self.set("expanded", true);
  _$jscoverage['/tree/node.js'].lineData[192]++;
  S.each(self.get("children"), function(c) {
  _$jscoverage['/tree/node.js'].functionData[12]++;
  _$jscoverage['/tree/node.js'].lineData[193]++;
  c.expandAll();
});
}, 
  collapseAll: function() {
  _$jscoverage['/tree/node.js'].functionData[13]++;
  _$jscoverage['/tree/node.js'].lineData[201]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[202]++;
  self.set("expanded", false);
  _$jscoverage['/tree/node.js'].lineData[203]++;
  S.each(self.get("children"), function(c) {
  _$jscoverage['/tree/node.js'].functionData[14]++;
  _$jscoverage['/tree/node.js'].lineData[204]++;
  c.collapseAll();
});
}}, {
  ATTRS: {
  xrender: {
  value: TreeNodeRender}, 
  checkable: {
  value: false, 
  view: 1}, 
  handleMouseEvents: {
  value: false}, 
  isLeaf: {
  view: 1}, 
  expandIconEl: {}, 
  iconEl: {}, 
  selected: {
  view: 1}, 
  expanded: {
  sync: 0, 
  value: false, 
  view: 1}, 
  tooltip: {
  view: 1}, 
  tree: {
  getter: function() {
  _$jscoverage['/tree/node.js'].functionData[15]++;
  _$jscoverage['/tree/node.js'].lineData[281]++;
  var from = this;
  _$jscoverage['/tree/node.js'].lineData[282]++;
  while (visit40_282_1(from && !from.isTree)) {
    _$jscoverage['/tree/node.js'].lineData[283]++;
    from = from.get('parent');
  }
  _$jscoverage['/tree/node.js'].lineData[285]++;
  return from;
}}, 
  depth: {
  view: 1}, 
  focusable: {
  value: false}, 
  defaultChildCfg: {
  value: {
  xclass: 'tree-node'}}}, 
  xclass: 'tree-node'});
  _$jscoverage['/tree/node.js'].lineData[312]++;
  function onAddChild(e) {
    _$jscoverage['/tree/node.js'].functionData[16]++;
    _$jscoverage['/tree/node.js'].lineData[313]++;
    var self = this;
    _$jscoverage['/tree/node.js'].lineData[314]++;
    if (visit41_314_1(e.target == self)) {
      _$jscoverage['/tree/node.js'].lineData[315]++;
      updateSubTreeStatus(self, e.component, self.get('depth'), e.index);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[319]++;
  function onRemoveChild(e) {
    _$jscoverage['/tree/node.js'].functionData[17]++;
    _$jscoverage['/tree/node.js'].lineData[320]++;
    var self = this;
    _$jscoverage['/tree/node.js'].lineData[321]++;
    if (visit42_321_1(e.target == self)) {
      _$jscoverage['/tree/node.js'].lineData[322]++;
      recursiveSetDepth(self.get('tree'), e.component);
      _$jscoverage['/tree/node.js'].lineData[323]++;
      refreshCssForSelfAndChildren(self, e.index);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[327]++;
  function syncAriaSetSize(e) {
    _$jscoverage['/tree/node.js'].functionData[18]++;
    _$jscoverage['/tree/node.js'].lineData[328]++;
    var self = this;
    _$jscoverage['/tree/node.js'].lineData[329]++;
    if (visit43_329_1(e.target === self)) {
      _$jscoverage['/tree/node.js'].lineData[330]++;
      self.el.setAttribute('aria-setsize', self.get('children').length);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[335]++;
  function isNodeSingleOrLast(self) {
    _$jscoverage['/tree/node.js'].functionData[19]++;
    _$jscoverage['/tree/node.js'].lineData[336]++;
    var parent = self.get('parent'), children = visit44_337_1(parent && parent.get("children")), lastChild = visit45_338_1(children && children[children.length - 1]);
    _$jscoverage['/tree/node.js'].lineData[342]++;
    return visit46_342_1(!lastChild || visit47_342_2(lastChild == self));
  }
  _$jscoverage['/tree/node.js'].lineData[345]++;
  function isNodeLeaf(self) {
    _$jscoverage['/tree/node.js'].functionData[20]++;
    _$jscoverage['/tree/node.js'].lineData[346]++;
    var isLeaf = self.get("isLeaf");
    _$jscoverage['/tree/node.js'].lineData[348]++;
    return !(visit48_348_1(visit49_348_2(isLeaf === false) || (visit50_348_3(visit51_348_4(isLeaf === undefined) && self.get("children").length))));
  }
  _$jscoverage['/tree/node.js'].lineData[351]++;
  function getLastVisibleDescendant(self) {
    _$jscoverage['/tree/node.js'].functionData[21]++;
    _$jscoverage['/tree/node.js'].lineData[352]++;
    var children = self.get("children");
    _$jscoverage['/tree/node.js'].lineData[354]++;
    if (visit52_354_1(!self.get("expanded") || !children.length)) {
      _$jscoverage['/tree/node.js'].lineData[355]++;
      return self;
    }
    _$jscoverage['/tree/node.js'].lineData[358]++;
    return getLastVisibleDescendant(children[children.length - 1]);
  }
  _$jscoverage['/tree/node.js'].lineData[362]++;
  function getPreviousVisibleNode(self) {
    _$jscoverage['/tree/node.js'].functionData[22]++;
    _$jscoverage['/tree/node.js'].lineData[363]++;
    var prev = self.prev();
    _$jscoverage['/tree/node.js'].lineData[364]++;
    if (visit53_364_1(!prev)) {
      _$jscoverage['/tree/node.js'].lineData[365]++;
      prev = self.get('parent');
    } else {
      _$jscoverage['/tree/node.js'].lineData[367]++;
      prev = getLastVisibleDescendant(prev);
    }
    _$jscoverage['/tree/node.js'].lineData[369]++;
    return prev;
  }
  _$jscoverage['/tree/node.js'].lineData[373]++;
  function getNextVisibleNode(self) {
    _$jscoverage['/tree/node.js'].functionData[23]++;
    _$jscoverage['/tree/node.js'].lineData[374]++;
    var children = self.get("children"), n, parent;
    _$jscoverage['/tree/node.js'].lineData[377]++;
    if (visit54_377_1(self.get("expanded") && children.length)) {
      _$jscoverage['/tree/node.js'].lineData[378]++;
      return children[0];
    }
    _$jscoverage['/tree/node.js'].lineData[382]++;
    n = self.next();
    _$jscoverage['/tree/node.js'].lineData[383]++;
    parent = self;
    _$jscoverage['/tree/node.js'].lineData[384]++;
    while (visit55_384_1(!n && (parent = parent.get('parent')))) {
      _$jscoverage['/tree/node.js'].lineData[385]++;
      n = parent.next();
    }
    _$jscoverage['/tree/node.js'].lineData[387]++;
    return n;
  }
  _$jscoverage['/tree/node.js'].lineData[394]++;
  function refreshCss(self) {
    _$jscoverage['/tree/node.js'].functionData[24]++;
    _$jscoverage['/tree/node.js'].lineData[395]++;
    if (visit56_395_1(self.get && self.view)) {
      _$jscoverage['/tree/node.js'].lineData[396]++;
      self.view.refreshCss(isNodeSingleOrLast(self), isNodeLeaf(self));
    }
  }
  _$jscoverage['/tree/node.js'].lineData[400]++;
  function updateSubTreeStatus(self, c, depth, index) {
    _$jscoverage['/tree/node.js'].functionData[25]++;
    _$jscoverage['/tree/node.js'].lineData[401]++;
    var tree = self.get("tree");
    _$jscoverage['/tree/node.js'].lineData[402]++;
    if (visit57_402_1(tree)) {
      _$jscoverage['/tree/node.js'].lineData[403]++;
      recursiveSetDepth(tree, c, depth + 1);
      _$jscoverage['/tree/node.js'].lineData[404]++;
      refreshCssForSelfAndChildren(self, index);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[408]++;
  function recursiveSetDepth(tree, c, setDepth) {
    _$jscoverage['/tree/node.js'].functionData[26]++;
    _$jscoverage['/tree/node.js'].lineData[409]++;
    if (visit58_409_1(setDepth !== undefined)) {
      _$jscoverage['/tree/node.js'].lineData[410]++;
      c.set("depth", setDepth);
    }
    _$jscoverage['/tree/node.js'].lineData[412]++;
    S.each(c.get("children"), function(child) {
  _$jscoverage['/tree/node.js'].functionData[27]++;
  _$jscoverage['/tree/node.js'].lineData[413]++;
  if (visit59_413_1(typeof setDepth == 'number')) {
    _$jscoverage['/tree/node.js'].lineData[414]++;
    recursiveSetDepth(tree, child, setDepth + 1);
  } else {
    _$jscoverage['/tree/node.js'].lineData[416]++;
    recursiveSetDepth(tree, child);
  }
});
  }
  _$jscoverage['/tree/node.js'].lineData[421]++;
  function refreshCssForSelfAndChildren(self, index) {
    _$jscoverage['/tree/node.js'].functionData[28]++;
    _$jscoverage['/tree/node.js'].lineData[422]++;
    refreshCss(self);
    _$jscoverage['/tree/node.js'].lineData[423]++;
    index = Math.max(0, index - 1);
    _$jscoverage['/tree/node.js'].lineData[424]++;
    var children = self.get('children'), c, len = children.length;
    _$jscoverage['/tree/node.js'].lineData[427]++;
    for (; visit60_427_1(index < len); index++) {
      _$jscoverage['/tree/node.js'].lineData[428]++;
      c = children[index];
      _$jscoverage['/tree/node.js'].lineData[429]++;
      refreshCss(c);
      _$jscoverage['/tree/node.js'].lineData[430]++;
      c.el.setAttribute("aria-posinset", index + 1);
    }
  }
}, {
  requires: ['node', 'component/container', './node-render']});
