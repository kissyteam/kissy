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
  _$jscoverage['/control.js'].lineData[8] = 0;
  _$jscoverage['/control.js'].lineData[9] = 0;
  _$jscoverage['/control.js'].lineData[10] = 0;
  _$jscoverage['/control.js'].lineData[11] = 0;
  _$jscoverage['/control.js'].lineData[21] = 0;
  _$jscoverage['/control.js'].lineData[41] = 0;
  _$jscoverage['/control.js'].lineData[48] = 0;
  _$jscoverage['/control.js'].lineData[49] = 0;
  _$jscoverage['/control.js'].lineData[51] = 0;
  _$jscoverage['/control.js'].lineData[55] = 0;
  _$jscoverage['/control.js'].lineData[56] = 0;
  _$jscoverage['/control.js'].lineData[57] = 0;
  _$jscoverage['/control.js'].lineData[58] = 0;
  _$jscoverage['/control.js'].lineData[61] = 0;
  _$jscoverage['/control.js'].lineData[70] = 0;
  _$jscoverage['/control.js'].lineData[72] = 0;
  _$jscoverage['/control.js'].lineData[76] = 0;
  _$jscoverage['/control.js'].lineData[79] = 0;
  _$jscoverage['/control.js'].lineData[84] = 0;
  _$jscoverage['/control.js'].lineData[87] = 0;
  _$jscoverage['/control.js'].lineData[88] = 0;
  _$jscoverage['/control.js'].lineData[93] = 0;
  _$jscoverage['/control.js'].lineData[98] = 0;
  _$jscoverage['/control.js'].lineData[99] = 0;
  _$jscoverage['/control.js'].lineData[100] = 0;
  _$jscoverage['/control.js'].lineData[105] = 0;
  _$jscoverage['/control.js'].lineData[106] = 0;
  _$jscoverage['/control.js'].lineData[112] = 0;
  _$jscoverage['/control.js'].lineData[119] = 0;
  _$jscoverage['/control.js'].lineData[121] = 0;
  _$jscoverage['/control.js'].lineData[122] = 0;
  _$jscoverage['/control.js'].lineData[123] = 0;
  _$jscoverage['/control.js'].lineData[124] = 0;
  _$jscoverage['/control.js'].lineData[125] = 0;
  _$jscoverage['/control.js'].lineData[130] = 0;
  _$jscoverage['/control.js'].lineData[134] = 0;
  _$jscoverage['/control.js'].lineData[135] = 0;
  _$jscoverage['/control.js'].lineData[136] = 0;
  _$jscoverage['/control.js'].lineData[137] = 0;
  _$jscoverage['/control.js'].lineData[139] = 0;
  _$jscoverage['/control.js'].lineData[140] = 0;
  _$jscoverage['/control.js'].lineData[145] = 0;
  _$jscoverage['/control.js'].lineData[146] = 0;
  _$jscoverage['/control.js'].lineData[152] = 0;
  _$jscoverage['/control.js'].lineData[158] = 0;
  _$jscoverage['/control.js'].lineData[165] = 0;
  _$jscoverage['/control.js'].lineData[173] = 0;
  _$jscoverage['/control.js'].lineData[174] = 0;
  _$jscoverage['/control.js'].lineData[175] = 0;
  _$jscoverage['/control.js'].lineData[176] = 0;
  _$jscoverage['/control.js'].lineData[184] = 0;
  _$jscoverage['/control.js'].lineData[185] = 0;
  _$jscoverage['/control.js'].lineData[186] = 0;
  _$jscoverage['/control.js'].lineData[190] = 0;
  _$jscoverage['/control.js'].lineData[191] = 0;
  _$jscoverage['/control.js'].lineData[196] = 0;
  _$jscoverage['/control.js'].lineData[197] = 0;
  _$jscoverage['/control.js'].lineData[202] = 0;
  _$jscoverage['/control.js'].lineData[209] = 0;
  _$jscoverage['/control.js'].lineData[210] = 0;
  _$jscoverage['/control.js'].lineData[222] = 0;
  _$jscoverage['/control.js'].lineData[226] = 0;
  _$jscoverage['/control.js'].lineData[227] = 0;
  _$jscoverage['/control.js'].lineData[237] = 0;
  _$jscoverage['/control.js'].lineData[241] = 0;
  _$jscoverage['/control.js'].lineData[242] = 0;
  _$jscoverage['/control.js'].lineData[252] = 0;
  _$jscoverage['/control.js'].lineData[253] = 0;
  _$jscoverage['/control.js'].lineData[254] = 0;
  _$jscoverage['/control.js'].lineData[258] = 0;
  _$jscoverage['/control.js'].lineData[259] = 0;
  _$jscoverage['/control.js'].lineData[272] = 0;
  _$jscoverage['/control.js'].lineData[275] = 0;
  _$jscoverage['/control.js'].lineData[276] = 0;
  _$jscoverage['/control.js'].lineData[277] = 0;
  _$jscoverage['/control.js'].lineData[279] = 0;
  _$jscoverage['/control.js'].lineData[280] = 0;
  _$jscoverage['/control.js'].lineData[284] = 0;
  _$jscoverage['/control.js'].lineData[287] = 0;
  _$jscoverage['/control.js'].lineData[288] = 0;
  _$jscoverage['/control.js'].lineData[290] = 0;
  _$jscoverage['/control.js'].lineData[291] = 0;
  _$jscoverage['/control.js'].lineData[298] = 0;
  _$jscoverage['/control.js'].lineData[299] = 0;
  _$jscoverage['/control.js'].lineData[311] = 0;
  _$jscoverage['/control.js'].lineData[313] = 0;
  _$jscoverage['/control.js'].lineData[314] = 0;
  _$jscoverage['/control.js'].lineData[319] = 0;
  _$jscoverage['/control.js'].lineData[320] = 0;
  _$jscoverage['/control.js'].lineData[332] = 0;
  _$jscoverage['/control.js'].lineData[333] = 0;
  _$jscoverage['/control.js'].lineData[342] = 0;
  _$jscoverage['/control.js'].lineData[343] = 0;
  _$jscoverage['/control.js'].lineData[347] = 0;
  _$jscoverage['/control.js'].lineData[348] = 0;
  _$jscoverage['/control.js'].lineData[357] = 0;
  _$jscoverage['/control.js'].lineData[358] = 0;
  _$jscoverage['/control.js'].lineData[362] = 0;
  _$jscoverage['/control.js'].lineData[363] = 0;
  _$jscoverage['/control.js'].lineData[364] = 0;
  _$jscoverage['/control.js'].lineData[365] = 0;
  _$jscoverage['/control.js'].lineData[367] = 0;
  _$jscoverage['/control.js'].lineData[376] = 0;
  _$jscoverage['/control.js'].lineData[377] = 0;
  _$jscoverage['/control.js'].lineData[379] = 0;
  _$jscoverage['/control.js'].lineData[383] = 0;
  _$jscoverage['/control.js'].lineData[384] = 0;
  _$jscoverage['/control.js'].lineData[394] = 0;
  _$jscoverage['/control.js'].lineData[395] = 0;
  _$jscoverage['/control.js'].lineData[396] = 0;
  _$jscoverage['/control.js'].lineData[407] = 0;
  _$jscoverage['/control.js'].lineData[471] = 0;
  _$jscoverage['/control.js'].lineData[472] = 0;
  _$jscoverage['/control.js'].lineData[474] = 0;
  _$jscoverage['/control.js'].lineData[524] = 0;
  _$jscoverage['/control.js'].lineData[525] = 0;
  _$jscoverage['/control.js'].lineData[570] = 0;
  _$jscoverage['/control.js'].lineData[572] = 0;
  _$jscoverage['/control.js'].lineData[573] = 0;
  _$jscoverage['/control.js'].lineData[574] = 0;
  _$jscoverage['/control.js'].lineData[576] = 0;
  _$jscoverage['/control.js'].lineData[577] = 0;
  _$jscoverage['/control.js'].lineData[580] = 0;
  _$jscoverage['/control.js'].lineData[583] = 0;
  _$jscoverage['/control.js'].lineData[650] = 0;
  _$jscoverage['/control.js'].lineData[799] = 0;
  _$jscoverage['/control.js'].lineData[800] = 0;
  _$jscoverage['/control.js'].lineData[802] = 0;
  _$jscoverage['/control.js'].lineData[803] = 0;
  _$jscoverage['/control.js'].lineData[839] = 0;
  _$jscoverage['/control.js'].lineData[845] = 0;
  _$jscoverage['/control.js'].lineData[846] = 0;
  _$jscoverage['/control.js'].lineData[848] = 0;
  _$jscoverage['/control.js'].lineData[849] = 0;
  _$jscoverage['/control.js'].lineData[850] = 0;
  _$jscoverage['/control.js'].lineData[852] = 0;
  _$jscoverage['/control.js'].lineData[855] = 0;
  _$jscoverage['/control.js'].lineData[876] = 0;
  _$jscoverage['/control.js'].lineData[878] = 0;
  _$jscoverage['/control.js'].lineData[885] = 0;
  _$jscoverage['/control.js'].lineData[886] = 0;
  _$jscoverage['/control.js'].lineData[889] = 0;
  _$jscoverage['/control.js'].lineData[891] = 0;
  _$jscoverage['/control.js'].lineData[892] = 0;
  _$jscoverage['/control.js'].lineData[895] = 0;
  _$jscoverage['/control.js'].lineData[896] = 0;
  _$jscoverage['/control.js'].lineData[898] = 0;
  _$jscoverage['/control.js'].lineData[901] = 0;
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
  _$jscoverage['/control.js'].branchData['48'] = [];
  _$jscoverage['/control.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['57'] = [];
  _$jscoverage['/control.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['79'] = [];
  _$jscoverage['/control.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['87'] = [];
  _$jscoverage['/control.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['99'] = [];
  _$jscoverage['/control.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['105'] = [];
  _$jscoverage['/control.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['122'] = [];
  _$jscoverage['/control.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['124'] = [];
  _$jscoverage['/control.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['130'] = [];
  _$jscoverage['/control.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['135'] = [];
  _$jscoverage['/control.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['145'] = [];
  _$jscoverage['/control.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['190'] = [];
  _$jscoverage['/control.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['196'] = [];
  _$jscoverage['/control.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['209'] = [];
  _$jscoverage['/control.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['226'] = [];
  _$jscoverage['/control.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['241'] = [];
  _$jscoverage['/control.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['258'] = [];
  _$jscoverage['/control.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['274'] = [];
  _$jscoverage['/control.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['275'] = [];
  _$jscoverage['/control.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['276'] = [];
  _$jscoverage['/control.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['279'] = [];
  _$jscoverage['/control.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['284'] = [];
  _$jscoverage['/control.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['284'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['288'] = [];
  _$jscoverage['/control.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['290'] = [];
  _$jscoverage['/control.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['290'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['290'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['290'][4] = new BranchData();
  _$jscoverage['/control.js'].branchData['290'][5] = new BranchData();
  _$jscoverage['/control.js'].branchData['298'] = [];
  _$jscoverage['/control.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['313'] = [];
  _$jscoverage['/control.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['313'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['313'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['319'] = [];
  _$jscoverage['/control.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['332'] = [];
  _$jscoverage['/control.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['347'] = [];
  _$jscoverage['/control.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['363'] = [];
  _$jscoverage['/control.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['376'] = [];
  _$jscoverage['/control.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['383'] = [];
  _$jscoverage['/control.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['395'] = [];
  _$jscoverage['/control.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['471'] = [];
  _$jscoverage['/control.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['474'] = [];
  _$jscoverage['/control.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['572'] = [];
  _$jscoverage['/control.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['573'] = [];
  _$jscoverage['/control.js'].branchData['573'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['576'] = [];
  _$jscoverage['/control.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['771'] = [];
  _$jscoverage['/control.js'].branchData['771'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['802'] = [];
  _$jscoverage['/control.js'].branchData['802'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['851'] = [];
  _$jscoverage['/control.js'].branchData['851'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['891'] = [];
  _$jscoverage['/control.js'].branchData['891'][1] = new BranchData();
}
_$jscoverage['/control.js'].branchData['891'][1].init(382, 6, 'xclass');
function visit103_891_1(result) {
  _$jscoverage['/control.js'].branchData['891'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['851'][1].init(110, 24, '!attrs || !attrs.xrender');
function visit102_851_1(result) {
  _$jscoverage['/control.js'].branchData['851'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['802'][1].init(167, 1, 'p');
function visit101_802_1(result) {
  _$jscoverage['/control.js'].branchData['802'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['771'][1].init(57, 40, 'S.config(\'component/prefixCls\') || \'ks-\'');
function visit100_771_1(result) {
  _$jscoverage['/control.js'].branchData['771'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['576'][1].init(172, 19, 'xy[1] !== undefined');
function visit99_576_1(result) {
  _$jscoverage['/control.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['573'][1].init(33, 19, 'xy[0] !== undefined');
function visit98_573_1(result) {
  _$jscoverage['/control.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['572'][1].init(119, 9, 'xy.length');
function visit97_572_1(result) {
  _$jscoverage['/control.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['474'][1].init(159, 7, 'v || []');
function visit96_474_1(result) {
  _$jscoverage['/control.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['471'][1].init(29, 21, 'typeof v === \'string\'');
function visit95_471_1(result) {
  _$jscoverage['/control.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['395'][1].init(99, 21, 'self.get(\'focusable\')');
function visit94_395_1(result) {
  _$jscoverage['/control.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['383'][1].init(21, 21, '!this.get(\'disabled\')');
function visit93_383_1(result) {
  _$jscoverage['/control.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['376'][1].init(21, 33, 'ev.keyCode === Node.KeyCode.ENTER');
function visit92_376_1(result) {
  _$jscoverage['/control.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['363'][1].init(54, 55, '!this.get(\'disabled\') && self.handleKeyDownInternal(ev)');
function visit91_363_1(result) {
  _$jscoverage['/control.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['347'][1].init(21, 21, '!this.get(\'disabled\')');
function visit90_347_1(result) {
  _$jscoverage['/control.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['332'][1].init(21, 21, '!this.get(\'disabled\')');
function visit89_332_1(result) {
  _$jscoverage['/control.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['319'][1].init(21, 21, '!this.get(\'disabled\')');
function visit88_319_1(result) {
  _$jscoverage['/control.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['313'][3].init(99, 14, 'ev.which === 1');
function visit87_313_3(result) {
  _$jscoverage['/control.js'].branchData['313'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['313'][2].init(99, 41, 'ev.which === 1 || isTouchGestureSupported');
function visit86_313_2(result) {
  _$jscoverage['/control.js'].branchData['313'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['313'][1].init(76, 65, 'self.get(\'active\') && (ev.which === 1 || isTouchGestureSupported)');
function visit85_313_1(result) {
  _$jscoverage['/control.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['298'][1].init(21, 21, '!this.get(\'disabled\')');
function visit84_298_1(result) {
  _$jscoverage['/control.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['290'][5].init(354, 14, 'n !== \'button\'');
function visit83_290_5(result) {
  _$jscoverage['/control.js'].branchData['290'][5].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['290'][4].init(334, 16, 'n !== \'textarea\'');
function visit82_290_4(result) {
  _$jscoverage['/control.js'].branchData['290'][4].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['290'][3].init(334, 34, 'n !== \'textarea\' && n !== \'button\'');
function visit81_290_3(result) {
  _$jscoverage['/control.js'].branchData['290'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['290'][2].init(317, 13, 'n !== \'input\'');
function visit80_290_2(result) {
  _$jscoverage['/control.js'].branchData['290'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['290'][1].init(317, 51, 'n !== \'input\' && n !== \'textarea\' && n !== \'button\'');
function visit79_290_1(result) {
  _$jscoverage['/control.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['288'][1].init(188, 20, 'n && n.toLowerCase()');
function visit78_288_1(result) {
  _$jscoverage['/control.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['284'][2].init(408, 31, 'ev.type.indexOf(\'mouse\') !== -1');
function visit77_284_2(result) {
  _$jscoverage['/control.js'].branchData['284'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['284'][1].init(373, 66, '!self.get(\'allowTextSelection\') && ev.type.indexOf(\'mouse\') !== -1');
function visit76_284_1(result) {
  _$jscoverage['/control.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['279'][1].init(147, 21, 'self.get(\'focusable\')');
function visit75_279_1(result) {
  _$jscoverage['/control.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['276'][1].init(25, 22, 'self.get(\'activeable\')');
function visit74_276_1(result) {
  _$jscoverage['/control.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['275'][1].init(135, 46, 'isMouseActionButton || isTouchGestureSupported');
function visit73_275_1(result) {
  _$jscoverage['/control.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['274'][1].init(81, 14, 'ev.which === 1');
function visit72_274_1(result) {
  _$jscoverage['/control.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['258'][1].init(21, 21, '!this.get(\'disabled\')');
function visit71_258_1(result) {
  _$jscoverage['/control.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['241'][1].init(21, 21, '!this.get(\'disabled\')');
function visit70_241_1(result) {
  _$jscoverage['/control.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['226'][1].init(21, 21, '!this.get(\'disabled\')');
function visit69_226_1(result) {
  _$jscoverage['/control.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['209'][1].init(21, 21, '!this.get(\'disabled\')');
function visit68_209_1(result) {
  _$jscoverage['/control.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['196'][1].init(21, 21, 'this.get(\'focusable\')');
function visit67_196_1(result) {
  _$jscoverage['/control.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['190'][1].init(21, 21, 'this.get(\'focusable\')');
function visit66_190_1(result) {
  _$jscoverage['/control.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['145'][1].init(183, 45, 'target.ownerDocument.activeElement === target');
function visit65_145_1(result) {
  _$jscoverage['/control.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['135'][1].init(84, 1, 'v');
function visit64_135_1(result) {
  _$jscoverage['/control.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['130'][1].init(53, 14, 'parent || this');
function visit63_130_1(result) {
  _$jscoverage['/control.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['124'][1].init(241, 19, 'self.get(\'srcNode\')');
function visit62_124_1(result) {
  _$jscoverage['/control.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['122'][1].init(159, 9, 'self.view');
function visit61_122_1(result) {
  _$jscoverage['/control.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['105'][1].init(871, 6, 'ie < 9');
function visit60_105_1(result) {
  _$jscoverage['/control.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['99'][1].init(605, 14, 'Gesture.cancel');
function visit59_99_1(result) {
  _$jscoverage['/control.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['87'][1].init(480, 31, 'self.get(\'handleGestureEvents\')');
function visit58_87_1(result) {
  _$jscoverage['/control.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['79'][1].init(111, 21, 'self.get(\'focusable\')');
function visit57_79_1(result) {
  _$jscoverage['/control.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['57'][1].init(623, 31, '!self.get(\'allowTextSelection\')');
function visit56_57_1(result) {
  _$jscoverage['/control.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['48'][1].init(295, 4, 'view');
function visit55_48_1(result) {
  _$jscoverage['/control.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/control.js'].functionData[0]++;
  _$jscoverage['/control.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/control.js'].lineData[8]++;
  var ControlProcess = require('./control/process');
  _$jscoverage['/control.js'].lineData[9]++;
  var Manager = require('component/manager');
  _$jscoverage['/control.js'].lineData[10]++;
  var Render = require('./control/render');
  _$jscoverage['/control.js'].lineData[11]++;
  var ie = S.UA.ieMode, Feature = S.Feature, Gesture = Node.Gesture, isTouchGestureSupported = Feature.isTouchGestureSupported();
  _$jscoverage['/control.js'].lineData[21]++;
  var Control = ControlProcess.extend({
  isControl: true, 
  createDom: function() {
  _$jscoverage['/control.js'].functionData[1]++;
  _$jscoverage['/control.js'].lineData[41]++;
  var self = this, Render = self.get('xrender'), view = self.get('view'), id = self.get('id'), el;
  _$jscoverage['/control.js'].lineData[48]++;
  if (visit55_48_1(view)) {
    _$jscoverage['/control.js'].lineData[49]++;
    view.set('control', self);
  } else {
    _$jscoverage['/control.js'].lineData[51]++;
    self.set('view', this.view = view = new Render({
  control: self}));
  }
  _$jscoverage['/control.js'].lineData[55]++;
  view.create();
  _$jscoverage['/control.js'].lineData[56]++;
  el = view.getKeyEventTarget();
  _$jscoverage['/control.js'].lineData[57]++;
  if (visit56_57_1(!self.get('allowTextSelection'))) {
    _$jscoverage['/control.js'].lineData[58]++;
    el.unselectable();
  }
  _$jscoverage['/control.js'].lineData[61]++;
  Manager.addComponent(id, self);
}, 
  renderUI: function() {
  _$jscoverage['/control.js'].functionData[2]++;
  _$jscoverage['/control.js'].lineData[70]++;
  this.view.renderUI();
  _$jscoverage['/control.js'].lineData[72]++;
  this.view.bindUI();
}, 
  bindUI: function() {
  _$jscoverage['/control.js'].functionData[3]++;
  _$jscoverage['/control.js'].lineData[76]++;
  var self = this, el = self.view.getKeyEventTarget();
  _$jscoverage['/control.js'].lineData[79]++;
  if (visit57_79_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[84]++;
    el.on('focus', self.handleFocus, self).on('blur', self.handleBlur, self).on('keydown', self.handleKeydown, self);
  }
  _$jscoverage['/control.js'].lineData[87]++;
  if (visit58_87_1(self.get('handleGestureEvents'))) {
    _$jscoverage['/control.js'].lineData[88]++;
    el = self.$el;
    _$jscoverage['/control.js'].lineData[93]++;
    el.on('mouseenter', self.handleMouseEnter, self).on('mouseleave', self.handleMouseLeave, self).on('contextmenu', self.handleContextMenu, self);
    _$jscoverage['/control.js'].lineData[98]++;
    el.on(Gesture.start, self.handleMouseDown, self).on(Gesture.end, self.handleMouseUp, self).on(Gesture.tap, self.handleClick, self);
    _$jscoverage['/control.js'].lineData[99]++;
    if (visit59_99_1(Gesture.cancel)) {
      _$jscoverage['/control.js'].lineData[100]++;
      el.on(Gesture.cancel, self.handleMouseUp, self);
    }
    _$jscoverage['/control.js'].lineData[105]++;
    if (visit60_105_1(ie < 9)) {
      _$jscoverage['/control.js'].lineData[106]++;
      el.on('dblclick', self.handleDblClick, self);
    }
  }
}, 
  syncUI: function() {
  _$jscoverage['/control.js'].functionData[4]++;
  _$jscoverage['/control.js'].lineData[112]++;
  this.view.syncUI();
}, 
  destructor: function() {
  _$jscoverage['/control.js'].functionData[5]++;
  _$jscoverage['/control.js'].lineData[119]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[121]++;
  Manager.removeComponent(self.get('id'));
  _$jscoverage['/control.js'].lineData[122]++;
  if (visit61_122_1(self.view)) {
    _$jscoverage['/control.js'].lineData[123]++;
    self.view.destroy();
  } else {
    _$jscoverage['/control.js'].lineData[124]++;
    if (visit62_124_1(self.get('srcNode'))) {
      _$jscoverage['/control.js'].lineData[125]++;
      self.get('srcNode').remove();
    }
  }
}, 
  createComponent: function(cfg, parent) {
  _$jscoverage['/control.js'].functionData[6]++;
  _$jscoverage['/control.js'].lineData[130]++;
  return Manager.createComponent(cfg, visit63_130_1(parent || this));
}, 
  '_onSetFocused': function(v) {
  _$jscoverage['/control.js'].functionData[7]++;
  _$jscoverage['/control.js'].lineData[134]++;
  var target = this.view.getKeyEventTarget()[0];
  _$jscoverage['/control.js'].lineData[135]++;
  if (visit64_135_1(v)) {
    _$jscoverage['/control.js'].lineData[136]++;
    try {
      _$jscoverage['/control.js'].lineData[137]++;
      target.focus();
    }    catch (e) {
  _$jscoverage['/control.js'].lineData[139]++;
  S.log(target);
  _$jscoverage['/control.js'].lineData[140]++;
  S.log('focus error', 'warn');
}
  } else {
    _$jscoverage['/control.js'].lineData[145]++;
    if (visit65_145_1(target.ownerDocument.activeElement === target)) {
      _$jscoverage['/control.js'].lineData[146]++;
      target.ownerDocument.body.focus();
    }
  }
}, 
  '_onSetX': function(x) {
  _$jscoverage['/control.js'].functionData[8]++;
  _$jscoverage['/control.js'].lineData[152]++;
  this.$el.offset({
  left: x});
}, 
  '_onSetY': function(y) {
  _$jscoverage['/control.js'].functionData[9]++;
  _$jscoverage['/control.js'].lineData[158]++;
  this.$el.offset({
  top: y});
}, 
  _onSetVisible: function(v) {
  _$jscoverage['/control.js'].functionData[10]++;
  _$jscoverage['/control.js'].lineData[165]++;
  this.fire(v ? 'show' : 'hide');
}, 
  show: function() {
  _$jscoverage['/control.js'].functionData[11]++;
  _$jscoverage['/control.js'].lineData[173]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[174]++;
  self.render();
  _$jscoverage['/control.js'].lineData[175]++;
  self.set('visible', true);
  _$jscoverage['/control.js'].lineData[176]++;
  return self;
}, 
  hide: function() {
  _$jscoverage['/control.js'].functionData[12]++;
  _$jscoverage['/control.js'].lineData[184]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[185]++;
  self.set('visible', false);
  _$jscoverage['/control.js'].lineData[186]++;
  return self;
}, 
  focus: function() {
  _$jscoverage['/control.js'].functionData[13]++;
  _$jscoverage['/control.js'].lineData[190]++;
  if (visit66_190_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[191]++;
    this.set('focused', true);
  }
}, 
  blur: function() {
  _$jscoverage['/control.js'].functionData[14]++;
  _$jscoverage['/control.js'].lineData[196]++;
  if (visit67_196_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[197]++;
    this.set('focused', false);
  }
}, 
  move: function(x, y) {
  _$jscoverage['/control.js'].functionData[15]++;
  _$jscoverage['/control.js'].lineData[202]++;
  this.set({
  x: x, 
  y: y});
}, 
  handleDblClick: function(ev) {
  _$jscoverage['/control.js'].functionData[16]++;
  _$jscoverage['/control.js'].lineData[209]++;
  if (visit68_209_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[210]++;
    this.handleDblClickInternal(ev);
  }
}, 
  handleDblClickInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[17]++;
  _$jscoverage['/control.js'].lineData[222]++;
  this.handleClickInternal(ev);
}, 
  handleMouseEnter: function(ev) {
  _$jscoverage['/control.js'].functionData[18]++;
  _$jscoverage['/control.js'].lineData[226]++;
  if (visit69_226_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[227]++;
    this.handleMouseEnterInternal(ev);
  }
}, 
  handleMouseEnterInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[19]++;
  _$jscoverage['/control.js'].lineData[237]++;
  this.set('highlighted', !!ev);
}, 
  handleMouseLeave: function(ev) {
  _$jscoverage['/control.js'].functionData[20]++;
  _$jscoverage['/control.js'].lineData[241]++;
  if (visit70_241_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[242]++;
    this.handleMouseLeaveInternal(ev);
  }
}, 
  handleMouseLeaveInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[21]++;
  _$jscoverage['/control.js'].lineData[252]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[253]++;
  self.set('active', false);
  _$jscoverage['/control.js'].lineData[254]++;
  self.set('highlighted', !ev);
}, 
  handleMouseDown: function(ev) {
  _$jscoverage['/control.js'].functionData[22]++;
  _$jscoverage['/control.js'].lineData[258]++;
  if (visit71_258_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[259]++;
    this.handleMouseDownInternal(ev);
  }
}, 
  handleMouseDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[23]++;
  _$jscoverage['/control.js'].lineData[272]++;
  var self = this, n, isMouseActionButton = visit72_274_1(ev.which === 1);
  _$jscoverage['/control.js'].lineData[275]++;
  if (visit73_275_1(isMouseActionButton || isTouchGestureSupported)) {
    _$jscoverage['/control.js'].lineData[276]++;
    if (visit74_276_1(self.get('activeable'))) {
      _$jscoverage['/control.js'].lineData[277]++;
      self.set('active', true);
    }
    _$jscoverage['/control.js'].lineData[279]++;
    if (visit75_279_1(self.get('focusable'))) {
      _$jscoverage['/control.js'].lineData[280]++;
      self.focus();
    }
    _$jscoverage['/control.js'].lineData[284]++;
    if (visit76_284_1(!self.get('allowTextSelection') && visit77_284_2(ev.type.indexOf('mouse') !== -1))) {
      _$jscoverage['/control.js'].lineData[287]++;
      n = ev.target.nodeName;
      _$jscoverage['/control.js'].lineData[288]++;
      n = visit78_288_1(n && n.toLowerCase());
      _$jscoverage['/control.js'].lineData[290]++;
      if (visit79_290_1(visit80_290_2(n !== 'input') && visit81_290_3(visit82_290_4(n !== 'textarea') && visit83_290_5(n !== 'button')))) {
        _$jscoverage['/control.js'].lineData[291]++;
        ev.preventDefault();
      }
    }
  }
}, 
  handleMouseUp: function(ev) {
  _$jscoverage['/control.js'].functionData[24]++;
  _$jscoverage['/control.js'].lineData[298]++;
  if (visit84_298_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[299]++;
    this.handleMouseUpInternal(ev);
  }
}, 
  handleMouseUpInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[25]++;
  _$jscoverage['/control.js'].lineData[311]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[313]++;
  if (visit85_313_1(self.get('active') && (visit86_313_2(visit87_313_3(ev.which === 1) || isTouchGestureSupported)))) {
    _$jscoverage['/control.js'].lineData[314]++;
    self.set('active', false);
  }
}, 
  handleContextMenu: function(ev) {
  _$jscoverage['/control.js'].functionData[26]++;
  _$jscoverage['/control.js'].lineData[319]++;
  if (visit88_319_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[320]++;
    this.handleContextMenuInternal(ev);
  }
}, 
  handleContextMenuInternal: function() {
  _$jscoverage['/control.js'].functionData[27]++;
}, 
  handleFocus: function() {
  _$jscoverage['/control.js'].functionData[28]++;
  _$jscoverage['/control.js'].lineData[332]++;
  if (visit89_332_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[333]++;
    this.handleFocusInternal();
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/control.js'].functionData[29]++;
  _$jscoverage['/control.js'].lineData[342]++;
  this.focus();
  _$jscoverage['/control.js'].lineData[343]++;
  this.fire('focus');
}, 
  handleBlur: function() {
  _$jscoverage['/control.js'].functionData[30]++;
  _$jscoverage['/control.js'].lineData[347]++;
  if (visit90_347_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[348]++;
    this.handleBlurInternal();
  }
}, 
  handleBlurInternal: function() {
  _$jscoverage['/control.js'].functionData[31]++;
  _$jscoverage['/control.js'].lineData[357]++;
  this.blur();
  _$jscoverage['/control.js'].lineData[358]++;
  this.fire('blur');
}, 
  handleKeydown: function(ev) {
  _$jscoverage['/control.js'].functionData[32]++;
  _$jscoverage['/control.js'].lineData[362]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[363]++;
  if (visit91_363_1(!this.get('disabled') && self.handleKeyDownInternal(ev))) {
    _$jscoverage['/control.js'].lineData[364]++;
    ev.halt();
    _$jscoverage['/control.js'].lineData[365]++;
    return true;
  }
  _$jscoverage['/control.js'].lineData[367]++;
  return undefined;
}, 
  handleKeyDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[33]++;
  _$jscoverage['/control.js'].lineData[376]++;
  if (visit92_376_1(ev.keyCode === Node.KeyCode.ENTER)) {
    _$jscoverage['/control.js'].lineData[377]++;
    return this.handleClickInternal(ev);
  }
  _$jscoverage['/control.js'].lineData[379]++;
  return undefined;
}, 
  handleClick: function(ev) {
  _$jscoverage['/control.js'].functionData[34]++;
  _$jscoverage['/control.js'].lineData[383]++;
  if (visit93_383_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[384]++;
    this.handleClickInternal(ev);
  }
}, 
  handleClickInternal: function() {
  _$jscoverage['/control.js'].functionData[35]++;
  _$jscoverage['/control.js'].lineData[394]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[395]++;
  if (visit94_395_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[396]++;
    self.focus();
  }
}}, {
  name: 'control', 
  ATTRS: {
  id: {
  view: 1, 
  valueFn: function() {
  _$jscoverage['/control.js'].functionData[36]++;
  _$jscoverage['/control.js'].lineData[407]++;
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
  _$jscoverage['/control.js'].lineData[471]++;
  if (visit95_471_1(typeof v === 'string')) {
    _$jscoverage['/control.js'].lineData[472]++;
    v = v.split(/\s+/);
  }
  _$jscoverage['/control.js'].lineData[474]++;
  return visit96_474_1(v || []);
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
  _$jscoverage['/control.js'].lineData[524]++;
  this.$el = el;
  _$jscoverage['/control.js'].lineData[525]++;
  this.el = el[0];
}}, 
  x: {}, 
  y: {}, 
  xy: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[39]++;
  _$jscoverage['/control.js'].lineData[570]++;
  var self = this, xy = S.makeArray(v);
  _$jscoverage['/control.js'].lineData[572]++;
  if (visit97_572_1(xy.length)) {
    _$jscoverage['/control.js'].lineData[573]++;
    if (visit98_573_1(xy[0] !== undefined)) {
      _$jscoverage['/control.js'].lineData[574]++;
      self.set('x', xy[0]);
    }
    _$jscoverage['/control.js'].lineData[576]++;
    if (visit99_576_1(xy[1] !== undefined)) {
      _$jscoverage['/control.js'].lineData[577]++;
      self.set('y', xy[1]);
    }
  }
  _$jscoverage['/control.js'].lineData[580]++;
  return v;
}, 
  getter: function() {
  _$jscoverage['/control.js'].functionData[40]++;
  _$jscoverage['/control.js'].lineData[583]++;
  return [this.get('x'), this.get('y')];
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
  _$jscoverage['/control.js'].lineData[650]++;
  return Node.all(v);
}}, 
  handleGestureEvents: {
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
  value: visit100_771_1(S.config('component/prefixCls') || 'ks-')}, 
  prefixXClass: {}, 
  parent: {
  setter: function(p, prev) {
  _$jscoverage['/control.js'].functionData[42]++;
  _$jscoverage['/control.js'].lineData[799]++;
  if ((prev = this.get('parent'))) {
    _$jscoverage['/control.js'].lineData[800]++;
    this.removeTarget(prev);
  }
  _$jscoverage['/control.js'].lineData[802]++;
  if (visit101_802_1(p)) {
    _$jscoverage['/control.js'].lineData[803]++;
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
  _$jscoverage['/control.js'].lineData[839]++;
  this.view = v;
}}}});
  _$jscoverage['/control.js'].lineData[845]++;
  function getDefaultRender() {
    _$jscoverage['/control.js'].functionData[44]++;
    _$jscoverage['/control.js'].lineData[846]++;
    var attrs, constructor = this;
    _$jscoverage['/control.js'].lineData[848]++;
    do {
      _$jscoverage['/control.js'].lineData[849]++;
      attrs = constructor.ATTRS;
      _$jscoverage['/control.js'].lineData[850]++;
      constructor = constructor.superclass;
    } while (visit102_851_1(!attrs || !attrs.xrender));
    _$jscoverage['/control.js'].lineData[852]++;
    return attrs.xrender.value;
  }
  _$jscoverage['/control.js'].lineData[855]++;
  Control.getDefaultRender = getDefaultRender;
  _$jscoverage['/control.js'].lineData[876]++;
  Control.extend = function extend(extensions, px, sx) {
  _$jscoverage['/control.js'].functionData[45]++;
  _$jscoverage['/control.js'].lineData[878]++;
  var args = S.makeArray(arguments), baseClass = this, xclass, newClass, argsLen = args.length, last = args[argsLen - 1];
  _$jscoverage['/control.js'].lineData[885]++;
  if ((xclass = last.xclass)) {
    _$jscoverage['/control.js'].lineData[886]++;
    last.name = xclass;
  }
  _$jscoverage['/control.js'].lineData[889]++;
  newClass = ControlProcess.extend.apply(baseClass, args);
  _$jscoverage['/control.js'].lineData[891]++;
  if (visit103_891_1(xclass)) {
    _$jscoverage['/control.js'].lineData[892]++;
    Manager.setConstructorByXClass(xclass, newClass);
  }
  _$jscoverage['/control.js'].lineData[895]++;
  newClass.extend = extend;
  _$jscoverage['/control.js'].lineData[896]++;
  newClass.getDefaultRender = getDefaultRender;
  _$jscoverage['/control.js'].lineData[898]++;
  return newClass;
};
  _$jscoverage['/control.js'].lineData[901]++;
  return Control;
});
