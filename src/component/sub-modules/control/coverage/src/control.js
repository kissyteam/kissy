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
if (! _$jscoverage['/control.js']) {
  _$jscoverage['/control.js'] = {};
  _$jscoverage['/control.js'].lineData = [];
  _$jscoverage['/control.js'].lineData[6] = 0;
  _$jscoverage['/control.js'].lineData[7] = 0;
  _$jscoverage['/control.js'].lineData[17] = 0;
  _$jscoverage['/control.js'].lineData[38] = 0;
  _$jscoverage['/control.js'].lineData[45] = 0;
  _$jscoverage['/control.js'].lineData[46] = 0;
  _$jscoverage['/control.js'].lineData[48] = 0;
  _$jscoverage['/control.js'].lineData[52] = 0;
  _$jscoverage['/control.js'].lineData[53] = 0;
  _$jscoverage['/control.js'].lineData[54] = 0;
  _$jscoverage['/control.js'].lineData[55] = 0;
  _$jscoverage['/control.js'].lineData[58] = 0;
  _$jscoverage['/control.js'].lineData[67] = 0;
  _$jscoverage['/control.js'].lineData[71] = 0;
  _$jscoverage['/control.js'].lineData[74] = 0;
  _$jscoverage['/control.js'].lineData[79] = 0;
  _$jscoverage['/control.js'].lineData[82] = 0;
  _$jscoverage['/control.js'].lineData[83] = 0;
  _$jscoverage['/control.js'].lineData[85] = 0;
  _$jscoverage['/control.js'].lineData[88] = 0;
  _$jscoverage['/control.js'].lineData[94] = 0;
  _$jscoverage['/control.js'].lineData[95] = 0;
  _$jscoverage['/control.js'].lineData[96] = 0;
  _$jscoverage['/control.js'].lineData[101] = 0;
  _$jscoverage['/control.js'].lineData[102] = 0;
  _$jscoverage['/control.js'].lineData[108] = 0;
  _$jscoverage['/control.js'].lineData[109] = 0;
  _$jscoverage['/control.js'].lineData[110] = 0;
  _$jscoverage['/control.js'].lineData[111] = 0;
  _$jscoverage['/control.js'].lineData[112] = 0;
  _$jscoverage['/control.js'].lineData[113] = 0;
  _$jscoverage['/control.js'].lineData[117] = 0;
  _$jscoverage['/control.js'].lineData[121] = 0;
  _$jscoverage['/control.js'].lineData[122] = 0;
  _$jscoverage['/control.js'].lineData[123] = 0;
  _$jscoverage['/control.js'].lineData[127] = 0;
  _$jscoverage['/control.js'].lineData[128] = 0;
  _$jscoverage['/control.js'].lineData[134] = 0;
  _$jscoverage['/control.js'].lineData[140] = 0;
  _$jscoverage['/control.js'].lineData[147] = 0;
  _$jscoverage['/control.js'].lineData[155] = 0;
  _$jscoverage['/control.js'].lineData[156] = 0;
  _$jscoverage['/control.js'].lineData[157] = 0;
  _$jscoverage['/control.js'].lineData[158] = 0;
  _$jscoverage['/control.js'].lineData[166] = 0;
  _$jscoverage['/control.js'].lineData[167] = 0;
  _$jscoverage['/control.js'].lineData[168] = 0;
  _$jscoverage['/control.js'].lineData[172] = 0;
  _$jscoverage['/control.js'].lineData[173] = 0;
  _$jscoverage['/control.js'].lineData[178] = 0;
  _$jscoverage['/control.js'].lineData[179] = 0;
  _$jscoverage['/control.js'].lineData[184] = 0;
  _$jscoverage['/control.js'].lineData[191] = 0;
  _$jscoverage['/control.js'].lineData[192] = 0;
  _$jscoverage['/control.js'].lineData[204] = 0;
  _$jscoverage['/control.js'].lineData[208] = 0;
  _$jscoverage['/control.js'].lineData[209] = 0;
  _$jscoverage['/control.js'].lineData[219] = 0;
  _$jscoverage['/control.js'].lineData[223] = 0;
  _$jscoverage['/control.js'].lineData[224] = 0;
  _$jscoverage['/control.js'].lineData[234] = 0;
  _$jscoverage['/control.js'].lineData[235] = 0;
  _$jscoverage['/control.js'].lineData[236] = 0;
  _$jscoverage['/control.js'].lineData[240] = 0;
  _$jscoverage['/control.js'].lineData[242] = 0;
  _$jscoverage['/control.js'].lineData[255] = 0;
  _$jscoverage['/control.js'].lineData[258] = 0;
  _$jscoverage['/control.js'].lineData[259] = 0;
  _$jscoverage['/control.js'].lineData[260] = 0;
  _$jscoverage['/control.js'].lineData[262] = 0;
  _$jscoverage['/control.js'].lineData[263] = 0;
  _$jscoverage['/control.js'].lineData[265] = 0;
  _$jscoverage['/control.js'].lineData[267] = 0;
  _$jscoverage['/control.js'].lineData[268] = 0;
  _$jscoverage['/control.js'].lineData[270] = 0;
  _$jscoverage['/control.js'].lineData[271] = 0;
  _$jscoverage['/control.js'].lineData[278] = 0;
  _$jscoverage['/control.js'].lineData[279] = 0;
  _$jscoverage['/control.js'].lineData[291] = 0;
  _$jscoverage['/control.js'].lineData[293] = 0;
  _$jscoverage['/control.js'].lineData[294] = 0;
  _$jscoverage['/control.js'].lineData[299] = 0;
  _$jscoverage['/control.js'].lineData[300] = 0;
  _$jscoverage['/control.js'].lineData[313] = 0;
  _$jscoverage['/control.js'].lineData[314] = 0;
  _$jscoverage['/control.js'].lineData[323] = 0;
  _$jscoverage['/control.js'].lineData[324] = 0;
  _$jscoverage['/control.js'].lineData[328] = 0;
  _$jscoverage['/control.js'].lineData[329] = 0;
  _$jscoverage['/control.js'].lineData[338] = 0;
  _$jscoverage['/control.js'].lineData[339] = 0;
  _$jscoverage['/control.js'].lineData[343] = 0;
  _$jscoverage['/control.js'].lineData[344] = 0;
  _$jscoverage['/control.js'].lineData[345] = 0;
  _$jscoverage['/control.js'].lineData[346] = 0;
  _$jscoverage['/control.js'].lineData[348] = 0;
  _$jscoverage['/control.js'].lineData[357] = 0;
  _$jscoverage['/control.js'].lineData[358] = 0;
  _$jscoverage['/control.js'].lineData[360] = 0;
  _$jscoverage['/control.js'].lineData[364] = 0;
  _$jscoverage['/control.js'].lineData[365] = 0;
  _$jscoverage['/control.js'].lineData[382] = 0;
  _$jscoverage['/control.js'].lineData[383] = 0;
  _$jscoverage['/control.js'].lineData[384] = 0;
  _$jscoverage['/control.js'].lineData[395] = 0;
  _$jscoverage['/control.js'].lineData[459] = 0;
  _$jscoverage['/control.js'].lineData[460] = 0;
  _$jscoverage['/control.js'].lineData[462] = 0;
  _$jscoverage['/control.js'].lineData[512] = 0;
  _$jscoverage['/control.js'].lineData[513] = 0;
  _$jscoverage['/control.js'].lineData[558] = 0;
  _$jscoverage['/control.js'].lineData[560] = 0;
  _$jscoverage['/control.js'].lineData[561] = 0;
  _$jscoverage['/control.js'].lineData[562] = 0;
  _$jscoverage['/control.js'].lineData[564] = 0;
  _$jscoverage['/control.js'].lineData[567] = 0;
  _$jscoverage['/control.js'].lineData[634] = 0;
  _$jscoverage['/control.js'].lineData[787] = 0;
  _$jscoverage['/control.js'].lineData[788] = 0;
  _$jscoverage['/control.js'].lineData[790] = 0;
  _$jscoverage['/control.js'].lineData[791] = 0;
  _$jscoverage['/control.js'].lineData[827] = 0;
  _$jscoverage['/control.js'].lineData[833] = 0;
  _$jscoverage['/control.js'].lineData[834] = 0;
  _$jscoverage['/control.js'].lineData[836] = 0;
  _$jscoverage['/control.js'].lineData[837] = 0;
  _$jscoverage['/control.js'].lineData[838] = 0;
  _$jscoverage['/control.js'].lineData[840] = 0;
  _$jscoverage['/control.js'].lineData[843] = 0;
  _$jscoverage['/control.js'].lineData[845] = 0;
  _$jscoverage['/control.js'].lineData[846] = 0;
  _$jscoverage['/control.js'].lineData[853] = 0;
  _$jscoverage['/control.js'].lineData[854] = 0;
  _$jscoverage['/control.js'].lineData[857] = 0;
  _$jscoverage['/control.js'].lineData[859] = 0;
  _$jscoverage['/control.js'].lineData[860] = 0;
  _$jscoverage['/control.js'].lineData[863] = 0;
  _$jscoverage['/control.js'].lineData[864] = 0;
  _$jscoverage['/control.js'].lineData[866] = 0;
  _$jscoverage['/control.js'].lineData[869] = 0;
}
if (! _$jscoverage['/control.js'].functionData) {
  _$jscoverage['/control.js'].functionData = [];
  _$jscoverage['/control.js'].functionData[0] = 0;
  _$jscoverage['/control.js'].functionData[1] = 0;
  _$jscoverage['/control.js'].functionData[2] = 0;
  _$jscoverage['/control.js'].functionData[3] = 0;
  _$jscoverage['/control.js'].functionData[4] = 0;
  _$jscoverage['/control.js'].functionData[5] = 0;
  _$jscoverage['/control.js'].functionData[6] = 0;
  _$jscoverage['/control.js'].functionData[7] = 0;
  _$jscoverage['/control.js'].functionData[8] = 0;
  _$jscoverage['/control.js'].functionData[9] = 0;
  _$jscoverage['/control.js'].functionData[10] = 0;
  _$jscoverage['/control.js'].functionData[11] = 0;
  _$jscoverage['/control.js'].functionData[12] = 0;
  _$jscoverage['/control.js'].functionData[13] = 0;
  _$jscoverage['/control.js'].functionData[14] = 0;
  _$jscoverage['/control.js'].functionData[15] = 0;
  _$jscoverage['/control.js'].functionData[16] = 0;
  _$jscoverage['/control.js'].functionData[17] = 0;
  _$jscoverage['/control.js'].functionData[18] = 0;
  _$jscoverage['/control.js'].functionData[19] = 0;
  _$jscoverage['/control.js'].functionData[20] = 0;
  _$jscoverage['/control.js'].functionData[21] = 0;
  _$jscoverage['/control.js'].functionData[22] = 0;
  _$jscoverage['/control.js'].functionData[23] = 0;
  _$jscoverage['/control.js'].functionData[24] = 0;
  _$jscoverage['/control.js'].functionData[25] = 0;
  _$jscoverage['/control.js'].functionData[26] = 0;
  _$jscoverage['/control.js'].functionData[27] = 0;
  _$jscoverage['/control.js'].functionData[28] = 0;
  _$jscoverage['/control.js'].functionData[29] = 0;
  _$jscoverage['/control.js'].functionData[30] = 0;
  _$jscoverage['/control.js'].functionData[31] = 0;
  _$jscoverage['/control.js'].functionData[32] = 0;
  _$jscoverage['/control.js'].functionData[33] = 0;
  _$jscoverage['/control.js'].functionData[34] = 0;
  _$jscoverage['/control.js'].functionData[35] = 0;
  _$jscoverage['/control.js'].functionData[36] = 0;
  _$jscoverage['/control.js'].functionData[37] = 0;
  _$jscoverage['/control.js'].functionData[38] = 0;
  _$jscoverage['/control.js'].functionData[39] = 0;
  _$jscoverage['/control.js'].functionData[40] = 0;
  _$jscoverage['/control.js'].functionData[41] = 0;
  _$jscoverage['/control.js'].functionData[42] = 0;
  _$jscoverage['/control.js'].functionData[43] = 0;
  _$jscoverage['/control.js'].functionData[44] = 0;
  _$jscoverage['/control.js'].functionData[45] = 0;
}
if (! _$jscoverage['/control.js'].branchData) {
  _$jscoverage['/control.js'].branchData = {};
  _$jscoverage['/control.js'].branchData['7'] = [];
  _$jscoverage['/control.js'].branchData['7'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['45'] = [];
  _$jscoverage['/control.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['54'] = [];
  _$jscoverage['/control.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['74'] = [];
  _$jscoverage['/control.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['82'] = [];
  _$jscoverage['/control.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['85'] = [];
  _$jscoverage['/control.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['95'] = [];
  _$jscoverage['/control.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['101'] = [];
  _$jscoverage['/control.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['117'] = [];
  _$jscoverage['/control.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['122'] = [];
  _$jscoverage['/control.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['127'] = [];
  _$jscoverage['/control.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['172'] = [];
  _$jscoverage['/control.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['178'] = [];
  _$jscoverage['/control.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['191'] = [];
  _$jscoverage['/control.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['208'] = [];
  _$jscoverage['/control.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['223'] = [];
  _$jscoverage['/control.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['240'] = [];
  _$jscoverage['/control.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['257'] = [];
  _$jscoverage['/control.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['258'] = [];
  _$jscoverage['/control.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['259'] = [];
  _$jscoverage['/control.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['262'] = [];
  _$jscoverage['/control.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['265'] = [];
  _$jscoverage['/control.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['268'] = [];
  _$jscoverage['/control.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['270'] = [];
  _$jscoverage['/control.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['270'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['270'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['278'] = [];
  _$jscoverage['/control.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['293'] = [];
  _$jscoverage['/control.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['293'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['293'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['299'] = [];
  _$jscoverage['/control.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['313'] = [];
  _$jscoverage['/control.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['328'] = [];
  _$jscoverage['/control.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['344'] = [];
  _$jscoverage['/control.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['357'] = [];
  _$jscoverage['/control.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['364'] = [];
  _$jscoverage['/control.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['383'] = [];
  _$jscoverage['/control.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['459'] = [];
  _$jscoverage['/control.js'].branchData['459'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['462'] = [];
  _$jscoverage['/control.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['560'] = [];
  _$jscoverage['/control.js'].branchData['560'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['561'] = [];
  _$jscoverage['/control.js'].branchData['561'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['562'] = [];
  _$jscoverage['/control.js'].branchData['562'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['755'] = [];
  _$jscoverage['/control.js'].branchData['755'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['787'] = [];
  _$jscoverage['/control.js'].branchData['787'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['790'] = [];
  _$jscoverage['/control.js'].branchData['790'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['839'] = [];
  _$jscoverage['/control.js'].branchData['839'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['853'] = [];
  _$jscoverage['/control.js'].branchData['853'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['859'] = [];
  _$jscoverage['/control.js'].branchData['859'][1] = new BranchData();
}
_$jscoverage['/control.js'].branchData['859'][1].init(363, 6, 'xclass');
function visit101_859_1(result) {
  _$jscoverage['/control.js'].branchData['859'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['853'][1].init(210, 20, 'xclass = last.xclass');
function visit100_853_1(result) {
  _$jscoverage['/control.js'].branchData['853'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['839'][1].init(113, 24, '!attrs || !attrs.xrender');
function visit99_839_1(result) {
  _$jscoverage['/control.js'].branchData['839'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['790'][1].init(169, 1, 'p');
function visit98_790_1(result) {
  _$jscoverage['/control.js'].branchData['790'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['787'][1].init(30, 25, 'prev = this.get(\'parent\')');
function visit97_787_1(result) {
  _$jscoverage['/control.js'].branchData['787'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['755'][1].init(59, 40, 'S.config(\'component/prefixCls\') || \'ks-\'');
function visit96_755_1(result) {
  _$jscoverage['/control.js'].branchData['755'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['562'][1].init(90, 29, 'xy[1] && self.set("y", xy[1])');
function visit95_562_1(result) {
  _$jscoverage['/control.js'].branchData['562'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['561'][1].init(30, 29, 'xy[0] && self.set("x", xy[0])');
function visit94_561_1(result) {
  _$jscoverage['/control.js'].branchData['561'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['560'][1].init(122, 9, 'xy.length');
function visit93_560_1(result) {
  _$jscoverage['/control.js'].branchData['560'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['462'][1].init(162, 7, 'v || []');
function visit92_462_1(result) {
  _$jscoverage['/control.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['459'][1].init(30, 20, 'typeof v == \'string\'');
function visit91_459_1(result) {
  _$jscoverage['/control.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['383'][1].init(129, 9, 'this.view');
function visit90_383_1(result) {
  _$jscoverage['/control.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['364'][1].init(22, 21, '!this.get(\'disabled\')');
function visit89_364_1(result) {
  _$jscoverage['/control.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['357'][1].init(22, 35, 'ev[\'keyCode\'] == Node.KeyCode.ENTER');
function visit88_357_1(result) {
  _$jscoverage['/control.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['344'][1].init(56, 55, '!this.get(\'disabled\') && self.handleKeyDownInternal(ev)');
function visit87_344_1(result) {
  _$jscoverage['/control.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['328'][1].init(22, 21, '!this.get(\'disabled\')');
function visit86_328_1(result) {
  _$jscoverage['/control.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['313'][1].init(22, 21, '!this.get(\'disabled\')');
function visit85_313_1(result) {
  _$jscoverage['/control.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['299'][1].init(22, 21, '!this.get(\'disabled\')');
function visit84_299_1(result) {
  _$jscoverage['/control.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['293'][3].init(102, 16, 'ev[\'which\'] == 1');
function visit83_293_3(result) {
  _$jscoverage['/control.js'].branchData['293'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['293'][2].init(102, 41, 'ev[\'which\'] == 1 || isTouchEventSupported');
function visit82_293_2(result) {
  _$jscoverage['/control.js'].branchData['293'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['293'][1].init(79, 65, 'self.get("active") && (ev[\'which\'] == 1 || isTouchEventSupported)');
function visit81_293_1(result) {
  _$jscoverage['/control.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['278'][1].init(22, 21, '!this.get(\'disabled\')');
function visit80_278_1(result) {
  _$jscoverage['/control.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['270'][3].init(279, 15, 'n != "textarea"');
function visit79_270_3(result) {
  _$jscoverage['/control.js'].branchData['270'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['270'][2].init(263, 12, 'n != "input"');
function visit78_270_2(result) {
  _$jscoverage['/control.js'].branchData['270'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['270'][1].init(263, 31, 'n != "input" && n != "textarea"');
function visit77_270_1(result) {
  _$jscoverage['/control.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['268'][1].init(132, 20, 'n && n.toLowerCase()');
function visit76_268_1(result) {
  _$jscoverage['/control.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['265'][1].init(263, 31, '!self.get("allowTextSelection")');
function visit75_265_1(result) {
  _$jscoverage['/control.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['262'][1].init(151, 21, 'self.get("focusable")');
function visit74_262_1(result) {
  _$jscoverage['/control.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['259'][1].init(26, 22, 'self.get("activeable")');
function visit73_259_1(result) {
  _$jscoverage['/control.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['258'][1].init(141, 44, 'isMouseActionButton || isTouchEventSupported');
function visit72_258_1(result) {
  _$jscoverage['/control.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['257'][1].init(83, 16, 'ev[\'which\'] == 1');
function visit71_257_1(result) {
  _$jscoverage['/control.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['240'][1].init(22, 21, '!this.get(\'disabled\')');
function visit70_240_1(result) {
  _$jscoverage['/control.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['223'][1].init(22, 21, '!this.get(\'disabled\')');
function visit69_223_1(result) {
  _$jscoverage['/control.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['208'][1].init(22, 21, '!this.get(\'disabled\')');
function visit68_208_1(result) {
  _$jscoverage['/control.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['191'][1].init(22, 21, '!this.get(\'disabled\')');
function visit67_191_1(result) {
  _$jscoverage['/control.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['178'][1].init(22, 21, 'this.get(\'focusable\')');
function visit66_178_1(result) {
  _$jscoverage['/control.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['172'][1].init(22, 21, 'this.get(\'focusable\')');
function visit65_172_1(result) {
  _$jscoverage['/control.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['127'][1].init(186, 44, 'target.ownerDocument.activeElement == target');
function visit64_127_1(result) {
  _$jscoverage['/control.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['122'][1].init(86, 1, 'v');
function visit63_122_1(result) {
  _$jscoverage['/control.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['117'][1].init(54, 14, 'parent || this');
function visit62_117_1(result) {
  _$jscoverage['/control.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['101'][2].init(906, 6, 'ie < 9');
function visit61_101_2(result) {
  _$jscoverage['/control.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['101'][1].init(900, 12, 'ie && ie < 9');
function visit60_101_1(result) {
  _$jscoverage['/control.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['95'][1].init(628, 14, 'Gesture.cancel');
function visit59_95_1(result) {
  _$jscoverage['/control.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['85'][1].init(64, 22, '!isTouchEventSupported');
function visit58_85_1(result) {
  _$jscoverage['/control.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['82'][1].init(492, 29, 'self.get(\'handleMouseEvents\')');
function visit57_82_1(result) {
  _$jscoverage['/control.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['74'][1].init(115, 21, 'self.get(\'focusable\')');
function visit56_74_1(result) {
  _$jscoverage['/control.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['54'][1].init(640, 31, '!self.get("allowTextSelection")');
function visit55_54_1(result) {
  _$jscoverage['/control.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['45'][1].init(303, 4, 'view');
function visit54_45_1(result) {
  _$jscoverage['/control.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['7'][1].init(15, 43, 'S.Env.host.document.documentMode || S.UA.ie');
function visit53_7_1(result) {
  _$jscoverage['/control.js'].branchData['7'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].lineData[6]++;
KISSY.add("component/control", function(S, Node, ComponentProcess, Manager, Render, undefined) {
  _$jscoverage['/control.js'].functionData[0]++;
  _$jscoverage['/control.js'].lineData[7]++;
  var ie = visit53_7_1(S.Env.host.document.documentMode || S.UA.ie), Features = S.Features, Gesture = Node.Gesture, isTouchEventSupported = Features.isTouchEventSupported();
  _$jscoverage['/control.js'].lineData[17]++;
  var Control = ComponentProcess.extend({
  isControl: true, 
  createDom: function() {
  _$jscoverage['/control.js'].functionData[1]++;
  _$jscoverage['/control.js'].lineData[38]++;
  var self = this, Render = self.get('xrender'), view = self.get('view'), id = self.get("id"), el;
  _$jscoverage['/control.js'].lineData[45]++;
  if (visit54_45_1(view)) {
    _$jscoverage['/control.js'].lineData[46]++;
    view.set('control', self);
  } else {
    _$jscoverage['/control.js'].lineData[48]++;
    self.set('view', this.view = view = new Render({
  control: self}));
  }
  _$jscoverage['/control.js'].lineData[52]++;
  view.create();
  _$jscoverage['/control.js'].lineData[53]++;
  el = view.getKeyEventTarget();
  _$jscoverage['/control.js'].lineData[54]++;
  if (visit55_54_1(!self.get("allowTextSelection"))) {
    _$jscoverage['/control.js'].lineData[55]++;
    el.unselectable();
  }
  _$jscoverage['/control.js'].lineData[58]++;
  Manager.addComponent(id, self);
}, 
  renderUI: function() {
  _$jscoverage['/control.js'].functionData[2]++;
  _$jscoverage['/control.js'].lineData[67]++;
  this.view.render();
}, 
  bindUI: function() {
  _$jscoverage['/control.js'].functionData[3]++;
  _$jscoverage['/control.js'].lineData[71]++;
  var self = this, el = self.view.getKeyEventTarget();
  _$jscoverage['/control.js'].lineData[74]++;
  if (visit56_74_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[79]++;
    el.on("focus", self.handleFocus, self).on("blur", self.handleBlur, self).on("keydown", self.handleKeydown, self);
  }
  _$jscoverage['/control.js'].lineData[82]++;
  if (visit57_82_1(self.get('handleMouseEvents'))) {
    _$jscoverage['/control.js'].lineData[83]++;
    el = self.$el;
    _$jscoverage['/control.js'].lineData[85]++;
    if (visit58_85_1(!isTouchEventSupported)) {
      _$jscoverage['/control.js'].lineData[88]++;
      el.on("mouseenter", self.handleMouseEnter, self).on("mouseleave", self.handleMouseLeave, self).on("contextmenu", self.handleContextMenu, self);
    }
    _$jscoverage['/control.js'].lineData[94]++;
    el.on(Gesture.start, self.handleMouseDown, self).on(Gesture.end, self.handleMouseUp, self).on(Gesture.tap, self.handleClick, self);
    _$jscoverage['/control.js'].lineData[95]++;
    if (visit59_95_1(Gesture.cancel)) {
      _$jscoverage['/control.js'].lineData[96]++;
      el.on(Gesture.cancel, self.handleMouseUp, self);
    }
    _$jscoverage['/control.js'].lineData[101]++;
    if (visit60_101_1(ie && visit61_101_2(ie < 9))) {
      _$jscoverage['/control.js'].lineData[102]++;
      el.on("dblclick", self.handleDblClick, self);
    }
  }
}, 
  sync: function() {
  _$jscoverage['/control.js'].functionData[4]++;
  _$jscoverage['/control.js'].lineData[108]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[109]++;
  self.fire('beforeSyncUI');
  _$jscoverage['/control.js'].lineData[110]++;
  self.syncUI();
  _$jscoverage['/control.js'].lineData[111]++;
  self.view.sync();
  _$jscoverage['/control.js'].lineData[112]++;
  self.__callPluginsMethod("pluginSyncUI");
  _$jscoverage['/control.js'].lineData[113]++;
  self.fire('afterSyncUI');
}, 
  createComponent: function(cfg, parent) {
  _$jscoverage['/control.js'].functionData[5]++;
  _$jscoverage['/control.js'].lineData[117]++;
  return Manager.createComponent(cfg, visit62_117_1(parent || this));
}, 
  '_onSetFocused': function(v) {
  _$jscoverage['/control.js'].functionData[6]++;
  _$jscoverage['/control.js'].lineData[121]++;
  var target = this.view.getKeyEventTarget()[0];
  _$jscoverage['/control.js'].lineData[122]++;
  if (visit63_122_1(v)) {
    _$jscoverage['/control.js'].lineData[123]++;
    target.focus();
  } else {
    _$jscoverage['/control.js'].lineData[127]++;
    if (visit64_127_1(target.ownerDocument.activeElement == target)) {
      _$jscoverage['/control.js'].lineData[128]++;
      target.ownerDocument.body.focus();
    }
  }
}, 
  '_onSetX': function(x) {
  _$jscoverage['/control.js'].functionData[7]++;
  _$jscoverage['/control.js'].lineData[134]++;
  this.$el.offset({
  left: x});
}, 
  '_onSetY': function(y) {
  _$jscoverage['/control.js'].functionData[8]++;
  _$jscoverage['/control.js'].lineData[140]++;
  this.$el.offset({
  top: y});
}, 
  _onSetVisible: function(v) {
  _$jscoverage['/control.js'].functionData[9]++;
  _$jscoverage['/control.js'].lineData[147]++;
  this.fire(v ? "show" : "hide");
}, 
  show: function() {
  _$jscoverage['/control.js'].functionData[10]++;
  _$jscoverage['/control.js'].lineData[155]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[156]++;
  self.render();
  _$jscoverage['/control.js'].lineData[157]++;
  self.set("visible", true);
  _$jscoverage['/control.js'].lineData[158]++;
  return self;
}, 
  hide: function() {
  _$jscoverage['/control.js'].functionData[11]++;
  _$jscoverage['/control.js'].lineData[166]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[167]++;
  self.set("visible", false);
  _$jscoverage['/control.js'].lineData[168]++;
  return self;
}, 
  focus: function() {
  _$jscoverage['/control.js'].functionData[12]++;
  _$jscoverage['/control.js'].lineData[172]++;
  if (visit65_172_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[173]++;
    this.set('focused', true);
  }
}, 
  blur: function() {
  _$jscoverage['/control.js'].functionData[13]++;
  _$jscoverage['/control.js'].lineData[178]++;
  if (visit66_178_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[179]++;
    this.set('focused', false);
  }
}, 
  move: function(x, y) {
  _$jscoverage['/control.js'].functionData[14]++;
  _$jscoverage['/control.js'].lineData[184]++;
  this.set({
  x: x, 
  y: y});
}, 
  handleDblClick: function(ev) {
  _$jscoverage['/control.js'].functionData[15]++;
  _$jscoverage['/control.js'].lineData[191]++;
  if (visit67_191_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[192]++;
    this.handleDblClickInternal(ev);
  }
}, 
  handleDblClickInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[16]++;
  _$jscoverage['/control.js'].lineData[204]++;
  this.handleClickInternal(ev);
}, 
  handleMouseEnter: function(ev) {
  _$jscoverage['/control.js'].functionData[17]++;
  _$jscoverage['/control.js'].lineData[208]++;
  if (visit68_208_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[209]++;
    this.handleMouseEnterInternal(ev);
  }
}, 
  handleMouseEnterInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[18]++;
  _$jscoverage['/control.js'].lineData[219]++;
  this.set("highlighted", !!ev);
}, 
  handleMouseLeave: function(ev) {
  _$jscoverage['/control.js'].functionData[19]++;
  _$jscoverage['/control.js'].lineData[223]++;
  if (visit69_223_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[224]++;
    this.handleMouseLeaveInternal(ev);
  }
}, 
  handleMouseLeaveInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[20]++;
  _$jscoverage['/control.js'].lineData[234]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[235]++;
  self.set("active", false);
  _$jscoverage['/control.js'].lineData[236]++;
  self.set("highlighted", !ev);
}, 
  handleMouseDown: function(ev) {
  _$jscoverage['/control.js'].functionData[21]++;
  _$jscoverage['/control.js'].lineData[240]++;
  if (visit70_240_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[242]++;
    this.handleMouseDownInternal(ev);
  }
}, 
  handleMouseDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[22]++;
  _$jscoverage['/control.js'].lineData[255]++;
  var self = this, n, isMouseActionButton = visit71_257_1(ev['which'] == 1);
  _$jscoverage['/control.js'].lineData[258]++;
  if (visit72_258_1(isMouseActionButton || isTouchEventSupported)) {
    _$jscoverage['/control.js'].lineData[259]++;
    if (visit73_259_1(self.get("activeable"))) {
      _$jscoverage['/control.js'].lineData[260]++;
      self.set("active", true);
    }
    _$jscoverage['/control.js'].lineData[262]++;
    if (visit74_262_1(self.get("focusable"))) {
      _$jscoverage['/control.js'].lineData[263]++;
      self.focus();
    }
    _$jscoverage['/control.js'].lineData[265]++;
    if (visit75_265_1(!self.get("allowTextSelection"))) {
      _$jscoverage['/control.js'].lineData[267]++;
      n = ev.target.nodeName;
      _$jscoverage['/control.js'].lineData[268]++;
      n = visit76_268_1(n && n.toLowerCase());
      _$jscoverage['/control.js'].lineData[270]++;
      if (visit77_270_1(visit78_270_2(n != "input") && visit79_270_3(n != "textarea"))) {
        _$jscoverage['/control.js'].lineData[271]++;
        ev['preventDefault']();
      }
    }
  }
}, 
  handleMouseUp: function(ev) {
  _$jscoverage['/control.js'].functionData[23]++;
  _$jscoverage['/control.js'].lineData[278]++;
  if (visit80_278_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[279]++;
    this.handleMouseUpInternal(ev);
  }
}, 
  handleMouseUpInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[24]++;
  _$jscoverage['/control.js'].lineData[291]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[293]++;
  if (visit81_293_1(self.get("active") && (visit82_293_2(visit83_293_3(ev['which'] == 1) || isTouchEventSupported)))) {
    _$jscoverage['/control.js'].lineData[294]++;
    self.set("active", false);
  }
}, 
  handleContextMenu: function(ev) {
  _$jscoverage['/control.js'].functionData[25]++;
  _$jscoverage['/control.js'].lineData[299]++;
  if (visit84_299_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[300]++;
    this.handleContextMenuInternal(ev);
  }
}, 
  handleContextMenuInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[26]++;
}, 
  handleFocus: function() {
  _$jscoverage['/control.js'].functionData[27]++;
  _$jscoverage['/control.js'].lineData[313]++;
  if (visit85_313_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[314]++;
    this.handleFocusInternal();
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/control.js'].functionData[28]++;
  _$jscoverage['/control.js'].lineData[323]++;
  this.focus();
  _$jscoverage['/control.js'].lineData[324]++;
  this.fire("focus");
}, 
  handleBlur: function() {
  _$jscoverage['/control.js'].functionData[29]++;
  _$jscoverage['/control.js'].lineData[328]++;
  if (visit86_328_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[329]++;
    this.handleBlurInternal();
  }
}, 
  handleBlurInternal: function() {
  _$jscoverage['/control.js'].functionData[30]++;
  _$jscoverage['/control.js'].lineData[338]++;
  this.blur();
  _$jscoverage['/control.js'].lineData[339]++;
  this.fire("blur");
}, 
  handleKeydown: function(ev) {
  _$jscoverage['/control.js'].functionData[31]++;
  _$jscoverage['/control.js'].lineData[343]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[344]++;
  if (visit87_344_1(!this.get('disabled') && self.handleKeyDownInternal(ev))) {
    _$jscoverage['/control.js'].lineData[345]++;
    ev['halt']();
    _$jscoverage['/control.js'].lineData[346]++;
    return true;
  }
  _$jscoverage['/control.js'].lineData[348]++;
  return undefined;
}, 
  handleKeyDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[32]++;
  _$jscoverage['/control.js'].lineData[357]++;
  if (visit88_357_1(ev['keyCode'] == Node.KeyCode.ENTER)) {
    _$jscoverage['/control.js'].lineData[358]++;
    return this.handleClickInternal(ev);
  }
  _$jscoverage['/control.js'].lineData[360]++;
  return undefined;
}, 
  handleClick: function(ev) {
  _$jscoverage['/control.js'].functionData[33]++;
  _$jscoverage['/control.js'].lineData[364]++;
  if (visit89_364_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[365]++;
    this.handleClickInternal(ev);
  }
}, 
  handleClickInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[34]++;
}, 
  destructor: function() {
  _$jscoverage['/control.js'].functionData[35]++;
  _$jscoverage['/control.js'].lineData[382]++;
  Manager.removeComponent(this.get('id'));
  _$jscoverage['/control.js'].lineData[383]++;
  if (visit90_383_1(this.view)) {
    _$jscoverage['/control.js'].lineData[384]++;
    this.view.destroy();
  }
}}, {
  name: 'control', 
  ATTRS: {
  id: {
  view: 1, 
  valueFn: function() {
  _$jscoverage['/control.js'].functionData[36]++;
  _$jscoverage['/control.js'].lineData[395]++;
  return S.guid('ks-component');
}}, 
  content: {
  view: 1, 
  value: ''}, 
  width: {
  view: 1}, 
  height: {
  view: 1}, 
  elCls: {
  view: 1, 
  value: [], 
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[37]++;
  _$jscoverage['/control.js'].lineData[459]++;
  if (visit91_459_1(typeof v == 'string')) {
    _$jscoverage['/control.js'].lineData[460]++;
    v = v.split(/\s+/);
  }
  _$jscoverage['/control.js'].lineData[462]++;
  return visit92_462_1(v || []);
}}, 
  elStyle: {
  view: 1, 
  value: {}}, 
  elAttrs: {
  view: 1, 
  value: {}}, 
  elBefore: {}, 
  el: {
  setter: function(el) {
  _$jscoverage['/control.js'].functionData[38]++;
  _$jscoverage['/control.js'].lineData[512]++;
  this.$el = el;
  _$jscoverage['/control.js'].lineData[513]++;
  this.el = el[0];
}}, 
  x: {}, 
  y: {}, 
  xy: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[39]++;
  _$jscoverage['/control.js'].lineData[558]++;
  var self = this, xy = S.makeArray(v);
  _$jscoverage['/control.js'].lineData[560]++;
  if (visit93_560_1(xy.length)) {
    _$jscoverage['/control.js'].lineData[561]++;
    visit94_561_1(xy[0] && self.set("x", xy[0]));
    _$jscoverage['/control.js'].lineData[562]++;
    visit95_562_1(xy[1] && self.set("y", xy[1]));
  }
  _$jscoverage['/control.js'].lineData[564]++;
  return v;
}, 
  getter: function() {
  _$jscoverage['/control.js'].functionData[40]++;
  _$jscoverage['/control.js'].lineData[567]++;
  return [this.get("x"), this.get("y")];
}}, 
  zIndex: {
  view: 1}, 
  render: {}, 
  visible: {
  sync: 0, 
  value: true, 
  view: 1}, 
  srcNode: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[41]++;
  _$jscoverage['/control.js'].lineData[634]++;
  return Node.all(v);
}}, 
  handleMouseEvents: {
  value: true}, 
  focusable: {
  value: true, 
  view: 1}, 
  allowTextSelection: {
  value: false}, 
  activeable: {
  value: true}, 
  focused: {
  view: 1}, 
  active: {
  view: 1, 
  value: false}, 
  highlighted: {
  view: 1, 
  value: false}, 
  prefixCls: {
  view: 1, 
  value: visit96_755_1(S.config('component/prefixCls') || 'ks-')}, 
  prefixXClass: {}, 
  parent: {
  setter: function(p, prev) {
  _$jscoverage['/control.js'].functionData[42]++;
  _$jscoverage['/control.js'].lineData[787]++;
  if (visit97_787_1(prev = this.get('parent'))) {
    _$jscoverage['/control.js'].lineData[788]++;
    this.removeTarget(prev);
  }
  _$jscoverage['/control.js'].lineData[790]++;
  if (visit98_790_1(p)) {
    _$jscoverage['/control.js'].lineData[791]++;
    this.addTarget(p);
  }
}}, 
  disabled: {
  view: 1, 
  value: false}, 
  xrender: {
  value: Render}, 
  view: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[43]++;
  _$jscoverage['/control.js'].lineData[827]++;
  this.view = v;
}}}});
  _$jscoverage['/control.js'].lineData[833]++;
  function getDefaultRender() {
    _$jscoverage['/control.js'].functionData[44]++;
    _$jscoverage['/control.js'].lineData[834]++;
    var attrs, constructor = this;
    _$jscoverage['/control.js'].lineData[836]++;
    do {
      _$jscoverage['/control.js'].lineData[837]++;
      attrs = constructor.ATTRS;
      _$jscoverage['/control.js'].lineData[838]++;
      constructor = constructor.superclass;
    } while (visit99_839_1(!attrs || !attrs.xrender));
    _$jscoverage['/control.js'].lineData[840]++;
    return attrs.xrender.value;
  }
  _$jscoverage['/control.js'].lineData[843]++;
  Control.getDefaultRender = getDefaultRender;
  _$jscoverage['/control.js'].lineData[845]++;
  Control.extend = function extend(extensions, px, sx) {
  _$jscoverage['/control.js'].functionData[45]++;
  _$jscoverage['/control.js'].lineData[846]++;
  var args = S.makeArray(arguments), baseClass = this, xclass, newClass, argsLen = args.length, last = args[argsLen - 1];
  _$jscoverage['/control.js'].lineData[853]++;
  if (visit100_853_1(xclass = last.xclass)) {
    _$jscoverage['/control.js'].lineData[854]++;
    last.name = xclass;
  }
  _$jscoverage['/control.js'].lineData[857]++;
  newClass = ComponentProcess.extend.apply(baseClass, args);
  _$jscoverage['/control.js'].lineData[859]++;
  if (visit101_859_1(xclass)) {
    _$jscoverage['/control.js'].lineData[860]++;
    Manager.setConstructorByXClass(xclass, newClass);
  }
  _$jscoverage['/control.js'].lineData[863]++;
  newClass.extend = extend;
  _$jscoverage['/control.js'].lineData[864]++;
  newClass.getDefaultRender = getDefaultRender;
  _$jscoverage['/control.js'].lineData[866]++;
  return newClass;
};
  _$jscoverage['/control.js'].lineData[869]++;
  return Control;
}, {
  requires: ['node', './control/process', 'component/manager', './control/render']});
