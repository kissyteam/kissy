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
if (! _$jscoverage['/navigation-view.js']) {
  _$jscoverage['/navigation-view.js'] = {};
  _$jscoverage['/navigation-view.js'].lineData = [];
  _$jscoverage['/navigation-view.js'].lineData[5] = 0;
  _$jscoverage['/navigation-view.js'].lineData[6] = 0;
  _$jscoverage['/navigation-view.js'].lineData[7] = 0;
  _$jscoverage['/navigation-view.js'].lineData[8] = 0;
  _$jscoverage['/navigation-view.js'].lineData[9] = 0;
  _$jscoverage['/navigation-view.js'].lineData[10] = 0;
  _$jscoverage['/navigation-view.js'].lineData[11] = 0;
  _$jscoverage['/navigation-view.js'].lineData[17] = 0;
  _$jscoverage['/navigation-view.js'].lineData[19] = 0;
  _$jscoverage['/navigation-view.js'].lineData[21] = 0;
  _$jscoverage['/navigation-view.js'].lineData[24] = 0;
  _$jscoverage['/navigation-view.js'].lineData[25] = 0;
  _$jscoverage['/navigation-view.js'].lineData[29] = 0;
  _$jscoverage['/navigation-view.js'].lineData[30] = 0;
  _$jscoverage['/navigation-view.js'].lineData[31] = 0;
  _$jscoverage['/navigation-view.js'].lineData[35] = 0;
  _$jscoverage['/navigation-view.js'].lineData[36] = 0;
  _$jscoverage['/navigation-view.js'].lineData[37] = 0;
  _$jscoverage['/navigation-view.js'].lineData[38] = 0;
  _$jscoverage['/navigation-view.js'].lineData[39] = 0;
  _$jscoverage['/navigation-view.js'].lineData[40] = 0;
  _$jscoverage['/navigation-view.js'].lineData[41] = 0;
  _$jscoverage['/navigation-view.js'].lineData[42] = 0;
  _$jscoverage['/navigation-view.js'].lineData[45] = 0;
  _$jscoverage['/navigation-view.js'].lineData[49] = 0;
  _$jscoverage['/navigation-view.js'].lineData[52] = 0;
  _$jscoverage['/navigation-view.js'].lineData[53] = 0;
  _$jscoverage['/navigation-view.js'].lineData[54] = 0;
  _$jscoverage['/navigation-view.js'].lineData[55] = 0;
  _$jscoverage['/navigation-view.js'].lineData[56] = 0;
  _$jscoverage['/navigation-view.js'].lineData[58] = 0;
  _$jscoverage['/navigation-view.js'].lineData[59] = 0;
  _$jscoverage['/navigation-view.js'].lineData[60] = 0;
  _$jscoverage['/navigation-view.js'].lineData[62] = 0;
  _$jscoverage['/navigation-view.js'].lineData[63] = 0;
  _$jscoverage['/navigation-view.js'].lineData[74] = 0;
  _$jscoverage['/navigation-view.js'].lineData[75] = 0;
  _$jscoverage['/navigation-view.js'].lineData[78] = 0;
  _$jscoverage['/navigation-view.js'].lineData[79] = 0;
  _$jscoverage['/navigation-view.js'].lineData[82] = 0;
  _$jscoverage['/navigation-view.js'].lineData[83] = 0;
  _$jscoverage['/navigation-view.js'].lineData[85] = 0;
  _$jscoverage['/navigation-view.js'].lineData[86] = 0;
  _$jscoverage['/navigation-view.js'].lineData[88] = 0;
  _$jscoverage['/navigation-view.js'].lineData[90] = 0;
  _$jscoverage['/navigation-view.js'].lineData[91] = 0;
  _$jscoverage['/navigation-view.js'].lineData[92] = 0;
  _$jscoverage['/navigation-view.js'].lineData[95] = 0;
  _$jscoverage['/navigation-view.js'].lineData[96] = 0;
  _$jscoverage['/navigation-view.js'].lineData[100] = 0;
  _$jscoverage['/navigation-view.js'].lineData[101] = 0;
  _$jscoverage['/navigation-view.js'].lineData[104] = 0;
  _$jscoverage['/navigation-view.js'].lineData[106] = 0;
  _$jscoverage['/navigation-view.js'].lineData[107] = 0;
  _$jscoverage['/navigation-view.js'].lineData[111] = 0;
  _$jscoverage['/navigation-view.js'].lineData[112] = 0;
  _$jscoverage['/navigation-view.js'].lineData[114] = 0;
  _$jscoverage['/navigation-view.js'].lineData[116] = 0;
  _$jscoverage['/navigation-view.js'].lineData[118] = 0;
  _$jscoverage['/navigation-view.js'].lineData[119] = 0;
  _$jscoverage['/navigation-view.js'].lineData[120] = 0;
  _$jscoverage['/navigation-view.js'].lineData[121] = 0;
  _$jscoverage['/navigation-view.js'].lineData[122] = 0;
  _$jscoverage['/navigation-view.js'].lineData[123] = 0;
  _$jscoverage['/navigation-view.js'].lineData[124] = 0;
  _$jscoverage['/navigation-view.js'].lineData[130] = 0;
  _$jscoverage['/navigation-view.js'].lineData[131] = 0;
  _$jscoverage['/navigation-view.js'].lineData[132] = 0;
  _$jscoverage['/navigation-view.js'].lineData[133] = 0;
  _$jscoverage['/navigation-view.js'].lineData[134] = 0;
  _$jscoverage['/navigation-view.js'].lineData[136] = 0;
  _$jscoverage['/navigation-view.js'].lineData[137] = 0;
  _$jscoverage['/navigation-view.js'].lineData[138] = 0;
  _$jscoverage['/navigation-view.js'].lineData[139] = 0;
  _$jscoverage['/navigation-view.js'].lineData[141] = 0;
  _$jscoverage['/navigation-view.js'].lineData[143] = 0;
  _$jscoverage['/navigation-view.js'].lineData[144] = 0;
  _$jscoverage['/navigation-view.js'].lineData[147] = 0;
  _$jscoverage['/navigation-view.js'].lineData[148] = 0;
  _$jscoverage['/navigation-view.js'].lineData[149] = 0;
  _$jscoverage['/navigation-view.js'].lineData[151] = 0;
  _$jscoverage['/navigation-view.js'].lineData[154] = 0;
  _$jscoverage['/navigation-view.js'].lineData[156] = 0;
  _$jscoverage['/navigation-view.js'].lineData[157] = 0;
  _$jscoverage['/navigation-view.js'].lineData[158] = 0;
  _$jscoverage['/navigation-view.js'].lineData[160] = 0;
  _$jscoverage['/navigation-view.js'].lineData[165] = 0;
  _$jscoverage['/navigation-view.js'].lineData[167] = 0;
  _$jscoverage['/navigation-view.js'].lineData[174] = 0;
  _$jscoverage['/navigation-view.js'].lineData[178] = 0;
  _$jscoverage['/navigation-view.js'].lineData[179] = 0;
  _$jscoverage['/navigation-view.js'].lineData[180] = 0;
  _$jscoverage['/navigation-view.js'].lineData[181] = 0;
  _$jscoverage['/navigation-view.js'].lineData[182] = 0;
  _$jscoverage['/navigation-view.js'].lineData[183] = 0;
  _$jscoverage['/navigation-view.js'].lineData[184] = 0;
  _$jscoverage['/navigation-view.js'].lineData[185] = 0;
  _$jscoverage['/navigation-view.js'].lineData[186] = 0;
  _$jscoverage['/navigation-view.js'].lineData[187] = 0;
  _$jscoverage['/navigation-view.js'].lineData[188] = 0;
  _$jscoverage['/navigation-view.js'].lineData[197] = 0;
  _$jscoverage['/navigation-view.js'].lineData[198] = 0;
  _$jscoverage['/navigation-view.js'].lineData[199] = 0;
  _$jscoverage['/navigation-view.js'].lineData[200] = 0;
  _$jscoverage['/navigation-view.js'].lineData[202] = 0;
  _$jscoverage['/navigation-view.js'].lineData[206] = 0;
  _$jscoverage['/navigation-view.js'].lineData[218] = 0;
  _$jscoverage['/navigation-view.js'].lineData[219] = 0;
  _$jscoverage['/navigation-view.js'].lineData[220] = 0;
  _$jscoverage['/navigation-view.js'].lineData[221] = 0;
  _$jscoverage['/navigation-view.js'].lineData[223] = 0;
  _$jscoverage['/navigation-view.js'].lineData[225] = 0;
  _$jscoverage['/navigation-view.js'].lineData[226] = 0;
  _$jscoverage['/navigation-view.js'].lineData[227] = 0;
  _$jscoverage['/navigation-view.js'].lineData[228] = 0;
  _$jscoverage['/navigation-view.js'].lineData[229] = 0;
  _$jscoverage['/navigation-view.js'].lineData[230] = 0;
  _$jscoverage['/navigation-view.js'].lineData[231] = 0;
  _$jscoverage['/navigation-view.js'].lineData[232] = 0;
  _$jscoverage['/navigation-view.js'].lineData[234] = 0;
  _$jscoverage['/navigation-view.js'].lineData[235] = 0;
  _$jscoverage['/navigation-view.js'].lineData[236] = 0;
  _$jscoverage['/navigation-view.js'].lineData[238] = 0;
  _$jscoverage['/navigation-view.js'].lineData[240] = 0;
  _$jscoverage['/navigation-view.js'].lineData[241] = 0;
  _$jscoverage['/navigation-view.js'].lineData[242] = 0;
  _$jscoverage['/navigation-view.js'].lineData[243] = 0;
  _$jscoverage['/navigation-view.js'].lineData[246] = 0;
  _$jscoverage['/navigation-view.js'].lineData[250] = 0;
  _$jscoverage['/navigation-view.js'].lineData[252] = 0;
  _$jscoverage['/navigation-view.js'].lineData[256] = 0;
  _$jscoverage['/navigation-view.js'].lineData[264] = 0;
  _$jscoverage['/navigation-view.js'].lineData[265] = 0;
  _$jscoverage['/navigation-view.js'].lineData[266] = 0;
  _$jscoverage['/navigation-view.js'].lineData[267] = 0;
  _$jscoverage['/navigation-view.js'].lineData[268] = 0;
  _$jscoverage['/navigation-view.js'].lineData[269] = 0;
  _$jscoverage['/navigation-view.js'].lineData[270] = 0;
  _$jscoverage['/navigation-view.js'].lineData[271] = 0;
  _$jscoverage['/navigation-view.js'].lineData[273] = 0;
  _$jscoverage['/navigation-view.js'].lineData[275] = 0;
  _$jscoverage['/navigation-view.js'].lineData[277] = 0;
}
if (! _$jscoverage['/navigation-view.js'].functionData) {
  _$jscoverage['/navigation-view.js'].functionData = [];
  _$jscoverage['/navigation-view.js'].functionData[0] = 0;
  _$jscoverage['/navigation-view.js'].functionData[1] = 0;
  _$jscoverage['/navigation-view.js'].functionData[2] = 0;
  _$jscoverage['/navigation-view.js'].functionData[3] = 0;
  _$jscoverage['/navigation-view.js'].functionData[4] = 0;
  _$jscoverage['/navigation-view.js'].functionData[5] = 0;
  _$jscoverage['/navigation-view.js'].functionData[6] = 0;
  _$jscoverage['/navigation-view.js'].functionData[7] = 0;
  _$jscoverage['/navigation-view.js'].functionData[8] = 0;
  _$jscoverage['/navigation-view.js'].functionData[9] = 0;
  _$jscoverage['/navigation-view.js'].functionData[10] = 0;
  _$jscoverage['/navigation-view.js'].functionData[11] = 0;
  _$jscoverage['/navigation-view.js'].functionData[12] = 0;
  _$jscoverage['/navigation-view.js'].functionData[13] = 0;
  _$jscoverage['/navigation-view.js'].functionData[14] = 0;
  _$jscoverage['/navigation-view.js'].functionData[15] = 0;
  _$jscoverage['/navigation-view.js'].functionData[16] = 0;
  _$jscoverage['/navigation-view.js'].functionData[17] = 0;
  _$jscoverage['/navigation-view.js'].functionData[18] = 0;
  _$jscoverage['/navigation-view.js'].functionData[19] = 0;
}
if (! _$jscoverage['/navigation-view.js'].branchData) {
  _$jscoverage['/navigation-view.js'].branchData = {};
  _$jscoverage['/navigation-view.js'].branchData['30'] = [];
  _$jscoverage['/navigation-view.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['38'] = [];
  _$jscoverage['/navigation-view.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['39'] = [];
  _$jscoverage['/navigation-view.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['40'] = [];
  _$jscoverage['/navigation-view.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['41'] = [];
  _$jscoverage['/navigation-view.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['55'] = [];
  _$jscoverage['/navigation-view.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['62'] = [];
  _$jscoverage['/navigation-view.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['85'] = [];
  _$jscoverage['/navigation-view.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['90'] = [];
  _$jscoverage['/navigation-view.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['91'] = [];
  _$jscoverage['/navigation-view.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['95'] = [];
  _$jscoverage['/navigation-view.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['106'] = [];
  _$jscoverage['/navigation-view.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['118'] = [];
  _$jscoverage['/navigation-view.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['121'] = [];
  _$jscoverage['/navigation-view.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['121'][2] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['122'] = [];
  _$jscoverage['/navigation-view.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['133'] = [];
  _$jscoverage['/navigation-view.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['138'] = [];
  _$jscoverage['/navigation-view.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['143'] = [];
  _$jscoverage['/navigation-view.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['147'] = [];
  _$jscoverage['/navigation-view.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['148'] = [];
  _$jscoverage['/navigation-view.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['156'] = [];
  _$jscoverage['/navigation-view.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['199'] = [];
  _$jscoverage['/navigation-view.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['220'] = [];
  _$jscoverage['/navigation-view.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['221'] = [];
  _$jscoverage['/navigation-view.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['231'] = [];
  _$jscoverage['/navigation-view.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['232'] = [];
  _$jscoverage['/navigation-view.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['240'] = [];
  _$jscoverage['/navigation-view.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['241'] = [];
  _$jscoverage['/navigation-view.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['242'] = [];
  _$jscoverage['/navigation-view.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['243'] = [];
  _$jscoverage['/navigation-view.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['264'] = [];
  _$jscoverage['/navigation-view.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['270'] = [];
  _$jscoverage['/navigation-view.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['275'] = [];
  _$jscoverage['/navigation-view.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['275'][2] = new BranchData();
}
_$jscoverage['/navigation-view.js'].branchData['275'][2].init(630, 20, 'viewStack.length > 1');
function visit59_275_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['275'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['275'][1].init(601, 27, 'nextView.get(\'title\') || \'\'');
function visit58_275_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['270'][1].init(296, 66, 'nextView.get(\'animation\').leave || activeView.get(\'animation\').leave');
function visit57_270_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['264'][1].init(248, 20, 'viewStack.length > 1');
function visit56_264_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['243'][1].init(35, 27, 'nextView.get(\'title\') || \'\'');
function visit55_243_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['242'][1].init(1436, 8, '!promise');
function visit54_242_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['241'][1].init(30, 27, 'nextView.get(\'title\') || \'\'');
function visit53_241_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['240'][1].init(1338, 10, 'activeView');
function visit52_240_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['232'][1].init(35, 51, 'activeView.get(\'animation\').leave || leaveAnimation');
function visit51_232_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['231'][1].init(926, 10, 'activeView');
function visit50_231_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['221'][1].init(526, 11, '!activeView');
function visit49_221_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['220'][1].init(466, 41, 'config.animation || self.get(\'animation\')');
function visit48_220_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['199'][1].init(107, 9, '!nextView');
function visit47_199_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['156'][1].init(18, 31, 'self.isLoading() || !activeView');
function visit46_156_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['148'][1].init(18, 10, 'activeView');
function visit45_148_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['147'][1].init(500, 7, 'promise');
function visit44_147_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['143'][1].init(389, 10, 'activeView');
function visit43_143_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['138'][1].init(273, 14, 'nextView.enter');
function visit42_138_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['133'][1].init(105, 30, 'activeView && activeView.leave');
function visit41_133_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['122'][1].init(51, 27, 'nextView.get(\'title\') || \'\'');
function visit40_122_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['121'][2].init(94, 33, 'activeView.uuid === nextView.uuid');
function visit39_121_2(result) {
  _$jscoverage['/navigation-view.js'].branchData['121'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['121'][1].init(80, 47, 'activeView && activeView.uuid === nextView.uuid');
function visit38_121_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['118'][1].init(123, 7, 'promise');
function visit37_118_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['106'][1].init(211, 31, 'className !== originalClassName');
function visit36_106_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['95'][1].init(464, 31, 'className !== originalClassName');
function visit35_95_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['91'][1].init(18, 44, 'className.indexOf(self.animatorClass) === -1');
function visit34_91_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['90'][1].init(297, 3, 'css');
function visit33_90_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['85'][1].init(100, 40, 'className.match(self.animateClassRegExp)');
function visit32_85_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['62'][1].init(387, 15, 'i < removedSize');
function visit31_62_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['55'][1].init(145, 32, 'children.length <= viewCacheSize');
function visit30_55_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['41'][1].init(26, 36, 'children[i].get(\'viewId\') === viewId');
function visit29_41_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['40'][1].init(22, 6, 'viewId');
function visit28_40_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['39'][1].init(18, 48, 'children[i].constructor.xclass === config.xclass');
function visit27_39_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['38'][1].init(119, 19, 'i < children.length');
function visit26_38_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['30'][1].init(14, 28, 'e.target === this.get(\'bar\')');
function visit25_30_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/navigation-view.js'].functionData[0]++;
  _$jscoverage['/navigation-view.js'].lineData[6]++;
  var $ = require('node').all;
  _$jscoverage['/navigation-view.js'].lineData[7]++;
  var Container = require('component/container');
  _$jscoverage['/navigation-view.js'].lineData[8]++;
  var Bar = require('navigation-view/bar');
  _$jscoverage['/navigation-view.js'].lineData[9]++;
  var ContentTpl = require('component/extension/content-xtpl');
  _$jscoverage['/navigation-view.js'].lineData[10]++;
  var ContentRender = require('component/extension/content-render');
  _$jscoverage['/navigation-view.js'].lineData[11]++;
  var LOADING_HTML = '<div class="{prefixCls}navigation-view-loading">' + '<div class="{prefixCls}navigation-view-loading-outer">' + '<div class="{prefixCls}navigation-view-loading-inner"></div>' + '</div>' + '</div>';
  _$jscoverage['/navigation-view.js'].lineData[17]++;
  var uuid = 0;
  _$jscoverage['/navigation-view.js'].lineData[19]++;
  var NavigationViewRender = Container.getDefaultRender().extend([ContentRender], {
  renderUI: function() {
  _$jscoverage['/navigation-view.js'].functionData[1]++;
  _$jscoverage['/navigation-view.js'].lineData[21]++;
  var loadingEl = $(S.substitute(LOADING_HTML, {
  prefixCls: this.control.get('prefixCls')}));
  _$jscoverage['/navigation-view.js'].lineData[24]++;
  this.control.get('contentEl').append(loadingEl);
  _$jscoverage['/navigation-view.js'].lineData[25]++;
  this.control.loadingEl = loadingEl;
}});
  _$jscoverage['/navigation-view.js'].lineData[29]++;
  function onBack(e) {
    _$jscoverage['/navigation-view.js'].functionData[2]++;
    _$jscoverage['/navigation-view.js'].lineData[30]++;
    if (visit25_30_1(e.target === this.get('bar'))) {
      _$jscoverage['/navigation-view.js'].lineData[31]++;
      this.pop();
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[35]++;
  function getViewInstance(navigationView, config) {
    _$jscoverage['/navigation-view.js'].functionData[3]++;
    _$jscoverage['/navigation-view.js'].lineData[36]++;
    var children = navigationView.get('children');
    _$jscoverage['/navigation-view.js'].lineData[37]++;
    var viewId = config.viewId;
    _$jscoverage['/navigation-view.js'].lineData[38]++;
    for (var i = 0; visit26_38_1(i < children.length); i++) {
      _$jscoverage['/navigation-view.js'].lineData[39]++;
      if (visit27_39_1(children[i].constructor.xclass === config.xclass)) {
        _$jscoverage['/navigation-view.js'].lineData[40]++;
        if (visit28_40_1(viewId)) {
          _$jscoverage['/navigation-view.js'].lineData[41]++;
          if (visit29_41_1(children[i].get('viewId') === viewId)) {
            _$jscoverage['/navigation-view.js'].lineData[42]++;
            return children[i];
          }
        } else {
          _$jscoverage['/navigation-view.js'].lineData[45]++;
          return children[i];
        }
      }
    }
    _$jscoverage['/navigation-view.js'].lineData[49]++;
    return null;
  }
  _$jscoverage['/navigation-view.js'].lineData[52]++;
  function gc(navigationView) {
    _$jscoverage['/navigation-view.js'].functionData[4]++;
    _$jscoverage['/navigation-view.js'].lineData[53]++;
    var children = navigationView.get('children').concat();
    _$jscoverage['/navigation-view.js'].lineData[54]++;
    var viewCacheSize = navigationView.get('viewCacheSize');
    _$jscoverage['/navigation-view.js'].lineData[55]++;
    if (visit30_55_1(children.length <= viewCacheSize)) {
      _$jscoverage['/navigation-view.js'].lineData[56]++;
      return;
    }
    _$jscoverage['/navigation-view.js'].lineData[58]++;
    var removedSize = Math.floor(viewCacheSize / 3);
    _$jscoverage['/navigation-view.js'].lineData[59]++;
    children.sort(function(a, b) {
  _$jscoverage['/navigation-view.js'].functionData[5]++;
  _$jscoverage['/navigation-view.js'].lineData[60]++;
  return a.uuid - b.uuid;
});
    _$jscoverage['/navigation-view.js'].lineData[62]++;
    for (var i = 0; visit31_62_1(i < removedSize); i++) {
      _$jscoverage['/navigation-view.js'].lineData[63]++;
      navigationView.removeChild(children[i]);
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[74]++;
  function getAnimCss(self, css, enter) {
    _$jscoverage['/navigation-view.js'].functionData[6]++;
    _$jscoverage['/navigation-view.js'].lineData[75]++;
    return self.view.getBaseCssClass('anim-' + css + '-' + (enter ? 'enter' : 'leave'));
  }
  _$jscoverage['/navigation-view.js'].lineData[78]++;
  function trimClassName(className) {
    _$jscoverage['/navigation-view.js'].functionData[7]++;
    _$jscoverage['/navigation-view.js'].lineData[79]++;
    return S.trim(className).replace(/\s+/, ' ');
  }
  _$jscoverage['/navigation-view.js'].lineData[82]++;
  function animateEl(el, self, css) {
    _$jscoverage['/navigation-view.js'].functionData[8]++;
    _$jscoverage['/navigation-view.js'].lineData[83]++;
    var className = el[0].className, originalClassName = className;
    _$jscoverage['/navigation-view.js'].lineData[85]++;
    if (visit32_85_1(className.match(self.animateClassRegExp))) {
      _$jscoverage['/navigation-view.js'].lineData[86]++;
      className = className.replace(self.animateClassRegExp, css);
    } else {
      _$jscoverage['/navigation-view.js'].lineData[88]++;
      className += ' ' + css;
    }
    _$jscoverage['/navigation-view.js'].lineData[90]++;
    if (visit33_90_1(css)) {
      _$jscoverage['/navigation-view.js'].lineData[91]++;
      if (visit34_91_1(className.indexOf(self.animatorClass) === -1)) {
        _$jscoverage['/navigation-view.js'].lineData[92]++;
        className += ' ' + self.animatorClass;
      }
    }
    _$jscoverage['/navigation-view.js'].lineData[95]++;
    if (visit35_95_1(className !== originalClassName)) {
      _$jscoverage['/navigation-view.js'].lineData[96]++;
      el[0].className = trimClassName(className);
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[100]++;
  function stopAnimateEl(el, self) {
    _$jscoverage['/navigation-view.js'].functionData[9]++;
    _$jscoverage['/navigation-view.js'].lineData[101]++;
    var className = el[0].className, originalClassName = className;
    _$jscoverage['/navigation-view.js'].lineData[104]++;
    className = className.replace(self.animateClassRegExp, '').replace(self.animatorClassRegExp, '');
    _$jscoverage['/navigation-view.js'].lineData[106]++;
    if (visit36_106_1(className !== originalClassName)) {
      _$jscoverage['/navigation-view.js'].lineData[107]++;
      el[0].className = trimClassName(className);
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[111]++;
  function postProcessSwitchView(self, nextView) {
    _$jscoverage['/navigation-view.js'].functionData[10]++;
    _$jscoverage['/navigation-view.js'].lineData[112]++;
    var promise = nextView.promise;
    _$jscoverage['/navigation-view.js'].lineData[114]++;
    self.set('activeView', nextView);
    _$jscoverage['/navigation-view.js'].lineData[116]++;
    gc(self);
    _$jscoverage['/navigation-view.js'].lineData[118]++;
    if (visit37_118_1(promise)) {
      _$jscoverage['/navigation-view.js'].lineData[119]++;
      promise.then(function() {
  _$jscoverage['/navigation-view.js'].functionData[11]++;
  _$jscoverage['/navigation-view.js'].lineData[120]++;
  var activeView = self.get('activeView');
  _$jscoverage['/navigation-view.js'].lineData[121]++;
  if (visit38_121_1(activeView && visit39_121_2(activeView.uuid === nextView.uuid))) {
    _$jscoverage['/navigation-view.js'].lineData[122]++;
    self.get('bar').set('title', visit40_122_1(nextView.get('title') || ''));
    _$jscoverage['/navigation-view.js'].lineData[123]++;
    stopAnimateEl(self.loadingEl, self);
    _$jscoverage['/navigation-view.js'].lineData[124]++;
    animateEl(nextView.get('el'), self, self.animateNoneEnterClass);
  }
});
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[130]++;
  function processSwitchView(self, config, nextView, enterAnimCssClass, leaveAnimCssClass) {
    _$jscoverage['/navigation-view.js'].functionData[12]++;
    _$jscoverage['/navigation-view.js'].lineData[131]++;
    var loadingEl = self.loadingEl;
    _$jscoverage['/navigation-view.js'].lineData[132]++;
    var activeView = self.get('activeView');
    _$jscoverage['/navigation-view.js'].lineData[133]++;
    if (visit41_133_1(activeView && activeView.leave)) {
      _$jscoverage['/navigation-view.js'].lineData[134]++;
      activeView.leave();
    }
    _$jscoverage['/navigation-view.js'].lineData[136]++;
    var nextViewEl = nextView.get('el');
    _$jscoverage['/navigation-view.js'].lineData[137]++;
    nextView.set(config);
    _$jscoverage['/navigation-view.js'].lineData[138]++;
    if (visit42_138_1(nextView.enter)) {
      _$jscoverage['/navigation-view.js'].lineData[139]++;
      nextView.enter();
    }
    _$jscoverage['/navigation-view.js'].lineData[141]++;
    var promise = nextView.promise;
    _$jscoverage['/navigation-view.js'].lineData[143]++;
    if (visit43_143_1(activeView)) {
      _$jscoverage['/navigation-view.js'].lineData[144]++;
      animateEl(activeView.get('el'), self, leaveAnimCssClass);
    }
    _$jscoverage['/navigation-view.js'].lineData[147]++;
    if (visit44_147_1(promise)) {
      _$jscoverage['/navigation-view.js'].lineData[148]++;
      if (visit45_148_1(activeView)) {
        _$jscoverage['/navigation-view.js'].lineData[149]++;
        animateEl(loadingEl, self, enterAnimCssClass);
      } else {
        _$jscoverage['/navigation-view.js'].lineData[151]++;
        animateEl(loadingEl, self, self.animateNoneEnterClass);
      }
      _$jscoverage['/navigation-view.js'].lineData[154]++;
      stopAnimateEl(nextViewEl, self);
    } else {
      _$jscoverage['/navigation-view.js'].lineData[156]++;
      if (visit46_156_1(self.isLoading() || !activeView)) {
        _$jscoverage['/navigation-view.js'].lineData[157]++;
        stopAnimateEl(loadingEl, self);
        _$jscoverage['/navigation-view.js'].lineData[158]++;
        animateEl(nextViewEl, self, self.animateNoneEnterClass);
      } else {
        _$jscoverage['/navigation-view.js'].lineData[160]++;
        animateEl(nextViewEl, self, enterAnimCssClass);
      }
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[165]++;
  return Container.extend({
  initializer: function() {
  _$jscoverage['/navigation-view.js'].functionData[13]++;
  _$jscoverage['/navigation-view.js'].lineData[167]++;
  this.publish('back', {
  defaultFn: onBack, 
  defaultTargetOnly: false});
}, 
  isLoading: function() {
  _$jscoverage['/navigation-view.js'].functionData[14]++;
  _$jscoverage['/navigation-view.js'].lineData[174]++;
  return this.loadingEl.hasClass(this.animatorClass);
}, 
  renderUI: function() {
  _$jscoverage['/navigation-view.js'].functionData[15]++;
  _$jscoverage['/navigation-view.js'].lineData[178]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[179]++;
  this.animateClassRegExp = new RegExp(this.view.getBaseCssClass() + '-anim-[^\\s]+');
  _$jscoverage['/navigation-view.js'].lineData[180]++;
  this.animatorClass = this.view.getBaseCssClass('animator');
  _$jscoverage['/navigation-view.js'].lineData[181]++;
  this.animateNoneEnterClass = getAnimCss(self, 'none', true);
  _$jscoverage['/navigation-view.js'].lineData[182]++;
  this.animatorClassRegExp = new RegExp(this.animatorClass);
  _$jscoverage['/navigation-view.js'].lineData[183]++;
  this.viewStack = [];
  _$jscoverage['/navigation-view.js'].lineData[184]++;
  var bar;
  _$jscoverage['/navigation-view.js'].lineData[185]++;
  var barCfg = this.get('barCfg');
  _$jscoverage['/navigation-view.js'].lineData[186]++;
  barCfg.elBefore = this.get('el')[0].firstChild;
  _$jscoverage['/navigation-view.js'].lineData[187]++;
  this.setInternal('bar', bar = new Bar(barCfg).render());
  _$jscoverage['/navigation-view.js'].lineData[188]++;
  bar.addTarget(this);
}, 
  createView: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[16]++;
  _$jscoverage['/navigation-view.js'].lineData[197]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[198]++;
  var nextView = getViewInstance(self, config);
  _$jscoverage['/navigation-view.js'].lineData[199]++;
  if (visit47_199_1(!nextView)) {
    _$jscoverage['/navigation-view.js'].lineData[200]++;
    nextView = self.addChild(config);
  }
  _$jscoverage['/navigation-view.js'].lineData[202]++;
  return nextView;
}, 
  push: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[17]++;
  _$jscoverage['/navigation-view.js'].lineData[206]++;
  var self = this, nextView, animation, enterAnimation, leaveAnimation, enterAnimCssClass, leaveAnimCssClass, bar, promise, activeView, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[218]++;
  activeView = self.get('activeView');
  _$jscoverage['/navigation-view.js'].lineData[219]++;
  bar = self.get('bar');
  _$jscoverage['/navigation-view.js'].lineData[220]++;
  config.animation = visit48_220_1(config.animation || self.get('animation'));
  _$jscoverage['/navigation-view.js'].lineData[221]++;
  if (visit49_221_1(!activeView)) {
    _$jscoverage['/navigation-view.js'].lineData[223]++;
    config.animation = {};
  }
  _$jscoverage['/navigation-view.js'].lineData[225]++;
  nextView = self.createView(config);
  _$jscoverage['/navigation-view.js'].lineData[226]++;
  nextView.uuid = uuid++;
  _$jscoverage['/navigation-view.js'].lineData[227]++;
  viewStack.push(config);
  _$jscoverage['/navigation-view.js'].lineData[228]++;
  animation = nextView.get('animation');
  _$jscoverage['/navigation-view.js'].lineData[229]++;
  enterAnimation = animation.enter;
  _$jscoverage['/navigation-view.js'].lineData[230]++;
  leaveAnimation = animation.leave;
  _$jscoverage['/navigation-view.js'].lineData[231]++;
  if (visit50_231_1(activeView)) {
    _$jscoverage['/navigation-view.js'].lineData[232]++;
    leaveAnimation = visit51_232_1(activeView.get('animation').leave || leaveAnimation);
  }
  _$jscoverage['/navigation-view.js'].lineData[234]++;
  promise = nextView.promise;
  _$jscoverage['/navigation-view.js'].lineData[235]++;
  enterAnimCssClass = getAnimCss(self, enterAnimation, true);
  _$jscoverage['/navigation-view.js'].lineData[236]++;
  leaveAnimCssClass = getAnimCss(self, leaveAnimation);
  _$jscoverage['/navigation-view.js'].lineData[238]++;
  processSwitchView(self, config, nextView, enterAnimCssClass, leaveAnimCssClass);
  _$jscoverage['/navigation-view.js'].lineData[240]++;
  if (visit52_240_1(activeView)) {
    _$jscoverage['/navigation-view.js'].lineData[241]++;
    bar.forward(visit53_241_1(nextView.get('title') || ''));
  } else {
    _$jscoverage['/navigation-view.js'].lineData[242]++;
    if (visit54_242_1(!promise)) {
      _$jscoverage['/navigation-view.js'].lineData[243]++;
      bar.set('title', visit55_243_1(nextView.get('title') || ''));
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[246]++;
  postProcessSwitchView(self, nextView);
}, 
  replace: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[18]++;
  _$jscoverage['/navigation-view.js'].lineData[250]++;
  var self = this, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[252]++;
  S.mix(viewStack[viewStack.length - 1], config);
}, 
  pop: function() {
  _$jscoverage['/navigation-view.js'].functionData[19]++;
  _$jscoverage['/navigation-view.js'].lineData[256]++;
  var self = this, activeView, config, nextView, enterAnimCssClass, leaveAnimCssClass, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[264]++;
  if (visit56_264_1(viewStack.length > 1)) {
    _$jscoverage['/navigation-view.js'].lineData[265]++;
    viewStack.pop();
    _$jscoverage['/navigation-view.js'].lineData[266]++;
    activeView = self.get('activeView');
    _$jscoverage['/navigation-view.js'].lineData[267]++;
    config = viewStack[viewStack.length - 1];
    _$jscoverage['/navigation-view.js'].lineData[268]++;
    nextView = self.createView(config);
    _$jscoverage['/navigation-view.js'].lineData[269]++;
    nextView.uuid = uuid++;
    _$jscoverage['/navigation-view.js'].lineData[270]++;
    enterAnimCssClass = getAnimCss(self, visit57_270_1(nextView.get('animation').leave || activeView.get('animation').leave), true);
    _$jscoverage['/navigation-view.js'].lineData[271]++;
    leaveAnimCssClass = getAnimCss(self, activeView.get('animation').enter);
    _$jscoverage['/navigation-view.js'].lineData[273]++;
    processSwitchView(self, config, nextView, enterAnimCssClass, leaveAnimCssClass);
    _$jscoverage['/navigation-view.js'].lineData[275]++;
    self.get('bar').back(visit58_275_1(nextView.get('title') || ''), visit59_275_2(viewStack.length > 1));
    _$jscoverage['/navigation-view.js'].lineData[277]++;
    postProcessSwitchView(self, nextView);
  }
}}, {
  xclass: 'navigation-view', 
  ATTRS: {
  barCfg: {
  value: {}}, 
  animation: {
  value: {
  'enter': 'slide-right', 
  'leave': 'slide-left'}}, 
  handleMouseEvents: {
  value: false}, 
  viewCacheSize: {
  value: 20}, 
  focusable: {
  value: false}, 
  allowTextSelection: {
  value: true}, 
  xrender: {
  value: NavigationViewRender}, 
  contentTpl: {
  value: ContentTpl}, 
  defaultChildCfg: {
  value: {
  handleMouseEvents: false, 
  allowTextSelection: true}}}});
});
