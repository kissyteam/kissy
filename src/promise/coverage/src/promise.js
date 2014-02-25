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
if (! _$jscoverage['/promise.js']) {
  _$jscoverage['/promise.js'] = {};
  _$jscoverage['/promise.js'].lineData = [];
  _$jscoverage['/promise.js'].lineData[6] = 0;
  _$jscoverage['/promise.js'].lineData[7] = 0;
  _$jscoverage['/promise.js'].lineData[8] = 0;
  _$jscoverage['/promise.js'].lineData[13] = 0;
  _$jscoverage['/promise.js'].lineData[15] = 0;
  _$jscoverage['/promise.js'].lineData[16] = 0;
  _$jscoverage['/promise.js'].lineData[25] = 0;
  _$jscoverage['/promise.js'].lineData[27] = 0;
  _$jscoverage['/promise.js'].lineData[29] = 0;
  _$jscoverage['/promise.js'].lineData[30] = 0;
  _$jscoverage['/promise.js'].lineData[33] = 0;
  _$jscoverage['/promise.js'].lineData[36] = 0;
  _$jscoverage['/promise.js'].lineData[37] = 0;
  _$jscoverage['/promise.js'].lineData[42] = 0;
  _$jscoverage['/promise.js'].lineData[43] = 0;
  _$jscoverage['/promise.js'].lineData[46] = 0;
  _$jscoverage['/promise.js'].lineData[47] = 0;
  _$jscoverage['/promise.js'].lineData[53] = 0;
  _$jscoverage['/promise.js'].lineData[54] = 0;
  _$jscoverage['/promise.js'].lineData[55] = 0;
  _$jscoverage['/promise.js'].lineData[66] = 0;
  _$jscoverage['/promise.js'].lineData[67] = 0;
  _$jscoverage['/promise.js'].lineData[68] = 0;
  _$jscoverage['/promise.js'].lineData[69] = 0;
  _$jscoverage['/promise.js'].lineData[77] = 0;
  _$jscoverage['/promise.js'].lineData[78] = 0;
  _$jscoverage['/promise.js'].lineData[81] = 0;
  _$jscoverage['/promise.js'].lineData[90] = 0;
  _$jscoverage['/promise.js'].lineData[92] = 0;
  _$jscoverage['/promise.js'].lineData[93] = 0;
  _$jscoverage['/promise.js'].lineData[97] = 0;
  _$jscoverage['/promise.js'].lineData[98] = 0;
  _$jscoverage['/promise.js'].lineData[99] = 0;
  _$jscoverage['/promise.js'].lineData[100] = 0;
  _$jscoverage['/promise.js'].lineData[101] = 0;
  _$jscoverage['/promise.js'].lineData[102] = 0;
  _$jscoverage['/promise.js'].lineData[104] = 0;
  _$jscoverage['/promise.js'].lineData[112] = 0;
  _$jscoverage['/promise.js'].lineData[119] = 0;
  _$jscoverage['/promise.js'].lineData[120] = 0;
  _$jscoverage['/promise.js'].lineData[121] = 0;
  _$jscoverage['/promise.js'].lineData[127] = 0;
  _$jscoverage['/promise.js'].lineData[128] = 0;
  _$jscoverage['/promise.js'].lineData[131] = 0;
  _$jscoverage['/promise.js'].lineData[132] = 0;
  _$jscoverage['/promise.js'].lineData[133] = 0;
  _$jscoverage['/promise.js'].lineData[144] = 0;
  _$jscoverage['/promise.js'].lineData[145] = 0;
  _$jscoverage['/promise.js'].lineData[146] = 0;
  _$jscoverage['/promise.js'].lineData[147] = 0;
  _$jscoverage['/promise.js'].lineData[148] = 0;
  _$jscoverage['/promise.js'].lineData[149] = 0;
  _$jscoverage['/promise.js'].lineData[150] = 0;
  _$jscoverage['/promise.js'].lineData[151] = 0;
  _$jscoverage['/promise.js'].lineData[153] = 0;
  _$jscoverage['/promise.js'].lineData[154] = 0;
  _$jscoverage['/promise.js'].lineData[159] = 0;
  _$jscoverage['/promise.js'].lineData[172] = 0;
  _$jscoverage['/promise.js'].lineData[173] = 0;
  _$jscoverage['/promise.js'].lineData[175] = 0;
  _$jscoverage['/promise.js'].lineData[182] = 0;
  _$jscoverage['/promise.js'].lineData[184] = 0;
  _$jscoverage['/promise.js'].lineData[185] = 0;
  _$jscoverage['/promise.js'].lineData[187] = 0;
  _$jscoverage['/promise.js'].lineData[188] = 0;
  _$jscoverage['/promise.js'].lineData[190] = 0;
  _$jscoverage['/promise.js'].lineData[191] = 0;
  _$jscoverage['/promise.js'].lineData[199] = 0;
  _$jscoverage['/promise.js'].lineData[208] = 0;
  _$jscoverage['/promise.js'].lineData[209] = 0;
  _$jscoverage['/promise.js'].lineData[211] = 0;
  _$jscoverage['/promise.js'].lineData[227] = 0;
  _$jscoverage['/promise.js'].lineData[229] = 0;
  _$jscoverage['/promise.js'].lineData[230] = 0;
  _$jscoverage['/promise.js'].lineData[231] = 0;
  _$jscoverage['/promise.js'].lineData[237] = 0;
  _$jscoverage['/promise.js'].lineData[247] = 0;
  _$jscoverage['/promise.js'].lineData[253] = 0;
  _$jscoverage['/promise.js'].lineData[262] = 0;
  _$jscoverage['/promise.js'].lineData[271] = 0;
  _$jscoverage['/promise.js'].lineData[272] = 0;
  _$jscoverage['/promise.js'].lineData[273] = 0;
  _$jscoverage['/promise.js'].lineData[275] = 0;
  _$jscoverage['/promise.js'].lineData[276] = 0;
  _$jscoverage['/promise.js'].lineData[277] = 0;
  _$jscoverage['/promise.js'].lineData[278] = 0;
  _$jscoverage['/promise.js'].lineData[282] = 0;
  _$jscoverage['/promise.js'].lineData[285] = 0;
  _$jscoverage['/promise.js'].lineData[289] = 0;
  _$jscoverage['/promise.js'].lineData[290] = 0;
  _$jscoverage['/promise.js'].lineData[294] = 0;
  _$jscoverage['/promise.js'].lineData[295] = 0;
  _$jscoverage['/promise.js'].lineData[296] = 0;
  _$jscoverage['/promise.js'].lineData[303] = 0;
  _$jscoverage['/promise.js'].lineData[304] = 0;
  _$jscoverage['/promise.js'].lineData[308] = 0;
  _$jscoverage['/promise.js'].lineData[309] = 0;
  _$jscoverage['/promise.js'].lineData[310] = 0;
  _$jscoverage['/promise.js'].lineData[317] = 0;
  _$jscoverage['/promise.js'].lineData[318] = 0;
  _$jscoverage['/promise.js'].lineData[322] = 0;
  _$jscoverage['/promise.js'].lineData[323] = 0;
  _$jscoverage['/promise.js'].lineData[324] = 0;
  _$jscoverage['/promise.js'].lineData[325] = 0;
  _$jscoverage['/promise.js'].lineData[327] = 0;
  _$jscoverage['/promise.js'].lineData[328] = 0;
  _$jscoverage['/promise.js'].lineData[329] = 0;
  _$jscoverage['/promise.js'].lineData[331] = 0;
  _$jscoverage['/promise.js'].lineData[332] = 0;
  _$jscoverage['/promise.js'].lineData[335] = 0;
  _$jscoverage['/promise.js'].lineData[336] = 0;
  _$jscoverage['/promise.js'].lineData[337] = 0;
  _$jscoverage['/promise.js'].lineData[338] = 0;
  _$jscoverage['/promise.js'].lineData[339] = 0;
  _$jscoverage['/promise.js'].lineData[341] = 0;
  _$jscoverage['/promise.js'].lineData[343] = 0;
  _$jscoverage['/promise.js'].lineData[346] = 0;
  _$jscoverage['/promise.js'].lineData[351] = 0;
  _$jscoverage['/promise.js'].lineData[354] = 0;
  _$jscoverage['/promise.js'].lineData[356] = 0;
  _$jscoverage['/promise.js'].lineData[371] = 0;
  _$jscoverage['/promise.js'].lineData[374] = 0;
  _$jscoverage['/promise.js'].lineData[377] = 0;
  _$jscoverage['/promise.js'].lineData[378] = 0;
  _$jscoverage['/promise.js'].lineData[379] = 0;
  _$jscoverage['/promise.js'].lineData[381] = 0;
  _$jscoverage['/promise.js'].lineData[419] = 0;
  _$jscoverage['/promise.js'].lineData[420] = 0;
  _$jscoverage['/promise.js'].lineData[422] = 0;
  _$jscoverage['/promise.js'].lineData[429] = 0;
  _$jscoverage['/promise.js'].lineData[438] = 0;
  _$jscoverage['/promise.js'].lineData[481] = 0;
  _$jscoverage['/promise.js'].lineData[482] = 0;
  _$jscoverage['/promise.js'].lineData[483] = 0;
  _$jscoverage['/promise.js'].lineData[485] = 0;
  _$jscoverage['/promise.js'].lineData[486] = 0;
  _$jscoverage['/promise.js'].lineData[488] = 0;
  _$jscoverage['/promise.js'].lineData[489] = 0;
  _$jscoverage['/promise.js'].lineData[490] = 0;
  _$jscoverage['/promise.js'].lineData[491] = 0;
  _$jscoverage['/promise.js'].lineData[494] = 0;
  _$jscoverage['/promise.js'].lineData[499] = 0;
  _$jscoverage['/promise.js'].lineData[503] = 0;
  _$jscoverage['/promise.js'].lineData[511] = 0;
  _$jscoverage['/promise.js'].lineData[512] = 0;
  _$jscoverage['/promise.js'].lineData[514] = 0;
  _$jscoverage['/promise.js'].lineData[515] = 0;
  _$jscoverage['/promise.js'].lineData[517] = 0;
  _$jscoverage['/promise.js'].lineData[518] = 0;
  _$jscoverage['/promise.js'].lineData[520] = 0;
  _$jscoverage['/promise.js'].lineData[522] = 0;
  _$jscoverage['/promise.js'].lineData[523] = 0;
  _$jscoverage['/promise.js'].lineData[525] = 0;
  _$jscoverage['/promise.js'].lineData[528] = 0;
  _$jscoverage['/promise.js'].lineData[529] = 0;
  _$jscoverage['/promise.js'].lineData[532] = 0;
  _$jscoverage['/promise.js'].lineData[533] = 0;
  _$jscoverage['/promise.js'].lineData[536] = 0;
  _$jscoverage['/promise.js'].lineData[540] = 0;
}
if (! _$jscoverage['/promise.js'].functionData) {
  _$jscoverage['/promise.js'].functionData = [];
  _$jscoverage['/promise.js'].functionData[0] = 0;
  _$jscoverage['/promise.js'].functionData[1] = 0;
  _$jscoverage['/promise.js'].functionData[2] = 0;
  _$jscoverage['/promise.js'].functionData[3] = 0;
  _$jscoverage['/promise.js'].functionData[4] = 0;
  _$jscoverage['/promise.js'].functionData[5] = 0;
  _$jscoverage['/promise.js'].functionData[6] = 0;
  _$jscoverage['/promise.js'].functionData[7] = 0;
  _$jscoverage['/promise.js'].functionData[8] = 0;
  _$jscoverage['/promise.js'].functionData[9] = 0;
  _$jscoverage['/promise.js'].functionData[10] = 0;
  _$jscoverage['/promise.js'].functionData[11] = 0;
  _$jscoverage['/promise.js'].functionData[12] = 0;
  _$jscoverage['/promise.js'].functionData[13] = 0;
  _$jscoverage['/promise.js'].functionData[14] = 0;
  _$jscoverage['/promise.js'].functionData[15] = 0;
  _$jscoverage['/promise.js'].functionData[16] = 0;
  _$jscoverage['/promise.js'].functionData[17] = 0;
  _$jscoverage['/promise.js'].functionData[18] = 0;
  _$jscoverage['/promise.js'].functionData[19] = 0;
  _$jscoverage['/promise.js'].functionData[20] = 0;
  _$jscoverage['/promise.js'].functionData[21] = 0;
  _$jscoverage['/promise.js'].functionData[22] = 0;
  _$jscoverage['/promise.js'].functionData[23] = 0;
  _$jscoverage['/promise.js'].functionData[24] = 0;
  _$jscoverage['/promise.js'].functionData[25] = 0;
  _$jscoverage['/promise.js'].functionData[26] = 0;
  _$jscoverage['/promise.js'].functionData[27] = 0;
  _$jscoverage['/promise.js'].functionData[28] = 0;
  _$jscoverage['/promise.js'].functionData[29] = 0;
  _$jscoverage['/promise.js'].functionData[30] = 0;
  _$jscoverage['/promise.js'].functionData[31] = 0;
  _$jscoverage['/promise.js'].functionData[32] = 0;
  _$jscoverage['/promise.js'].functionData[33] = 0;
  _$jscoverage['/promise.js'].functionData[34] = 0;
  _$jscoverage['/promise.js'].functionData[35] = 0;
  _$jscoverage['/promise.js'].functionData[36] = 0;
  _$jscoverage['/promise.js'].functionData[37] = 0;
  _$jscoverage['/promise.js'].functionData[38] = 0;
  _$jscoverage['/promise.js'].functionData[39] = 0;
  _$jscoverage['/promise.js'].functionData[40] = 0;
  _$jscoverage['/promise.js'].functionData[41] = 0;
  _$jscoverage['/promise.js'].functionData[42] = 0;
  _$jscoverage['/promise.js'].functionData[43] = 0;
  _$jscoverage['/promise.js'].functionData[44] = 0;
  _$jscoverage['/promise.js'].functionData[45] = 0;
  _$jscoverage['/promise.js'].functionData[46] = 0;
}
if (! _$jscoverage['/promise.js'].branchData) {
  _$jscoverage['/promise.js'].branchData = {};
  _$jscoverage['/promise.js'].branchData['15'] = [];
  _$jscoverage['/promise.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['15'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['27'] = [];
  _$jscoverage['/promise.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['36'] = [];
  _$jscoverage['/promise.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['42'] = [];
  _$jscoverage['/promise.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['46'] = [];
  _$jscoverage['/promise.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['53'] = [];
  _$jscoverage['/promise.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['68'] = [];
  _$jscoverage['/promise.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['77'] = [];
  _$jscoverage['/promise.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['92'] = [];
  _$jscoverage['/promise.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['128'] = [];
  _$jscoverage['/promise.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['146'] = [];
  _$jscoverage['/promise.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['153'] = [];
  _$jscoverage['/promise.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['172'] = [];
  _$jscoverage['/promise.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['184'] = [];
  _$jscoverage['/promise.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['187'] = [];
  _$jscoverage['/promise.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['229'] = [];
  _$jscoverage['/promise.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['234'] = [];
  _$jscoverage['/promise.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['272'] = [];
  _$jscoverage['/promise.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['303'] = [];
  _$jscoverage['/promise.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['317'] = [];
  _$jscoverage['/promise.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['323'] = [];
  _$jscoverage['/promise.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['327'] = [];
  _$jscoverage['/promise.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['335'] = [];
  _$jscoverage['/promise.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['337'] = [];
  _$jscoverage['/promise.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['356'] = [];
  _$jscoverage['/promise.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['356'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['360'] = [];
  _$jscoverage['/promise.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['360'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['364'] = [];
  _$jscoverage['/promise.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['374'] = [];
  _$jscoverage['/promise.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['374'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['419'] = [];
  _$jscoverage['/promise.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['482'] = [];
  _$jscoverage['/promise.js'].branchData['482'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['486'] = [];
  _$jscoverage['/promise.js'].branchData['486'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['491'] = [];
  _$jscoverage['/promise.js'].branchData['491'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['522'] = [];
  _$jscoverage['/promise.js'].branchData['522'][1] = new BranchData();
}
_$jscoverage['/promise.js'].branchData['522'][1].init(296, 11, 'result.done');
function visit37_522_1(result) {
  _$jscoverage['/promise.js'].branchData['522'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['491'][1].init(76, 13, '--count === 0');
function visit36_491_1(result) {
  _$jscoverage['/promise.js'].branchData['491'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['486'][1].init(182, 19, 'i < promises.length');
function visit35_486_1(result) {
  _$jscoverage['/promise.js'].branchData['486'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['482'][1].init(60, 6, '!count');
function visit34_482_1(result) {
  _$jscoverage['/promise.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['419'][1].init(18, 22, 'obj instanceof Promise');
function visit33_419_1(result) {
  _$jscoverage['/promise.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['374'][2].init(98, 61, 'obj instanceof Reject || obj[PROMISE_VALUE] instanceof Reject');
function visit32_374_2(result) {
  _$jscoverage['/promise.js'].branchData['374'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['374'][1].init(90, 70, 'obj && (obj instanceof Reject || obj[PROMISE_VALUE] instanceof Reject)');
function visit31_374_1(result) {
  _$jscoverage['/promise.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['364'][1].init(-1, 206, '!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE])');
function visit30_364_1(result) {
  _$jscoverage['/promise.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['360'][2].init(224, 31, 'obj[PROMISE_PENDINGS] === false');
function visit29_360_2(result) {
  _$jscoverage['/promise.js'].branchData['360'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['360'][1].init(160, 401, '(obj[PROMISE_PENDINGS] === false) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit28_360_1(result) {
  _$jscoverage['/promise.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['356'][2].init(60, 562, '!isRejected(obj) && (obj[PROMISE_PENDINGS] === false) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit27_356_2(result) {
  _$jscoverage['/promise.js'].branchData['356'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['356'][1].init(53, 569, 'obj && !isRejected(obj) && (obj[PROMISE_PENDINGS] === false) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit26_356_1(result) {
  _$jscoverage['/promise.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['337'][1].init(22, 4, 'done');
function visit25_337_1(result) {
  _$jscoverage['/promise.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['335'][1].init(1457, 25, 'value instanceof Promise');
function visit24_335_1(result) {
  _$jscoverage['/promise.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['327'][1].init(143, 24, 'value instanceof Promise');
function visit23_327_1(result) {
  _$jscoverage['/promise.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['323'][1].init(18, 4, 'done');
function visit22_323_1(result) {
  _$jscoverage['/promise.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['317'][1].init(83, 12, 'e.stack || e');
function visit21_317_1(result) {
  _$jscoverage['/promise.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['303'][1].init(168, 12, 'e.stack || e');
function visit20_303_1(result) {
  _$jscoverage['/promise.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['272'][1].init(14, 24, 'reason instanceof Reject');
function visit19_272_1(result) {
  _$jscoverage['/promise.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['234'][1].init(281, 21, 'fulfilled || rejected');
function visit18_234_1(result) {
  _$jscoverage['/promise.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['229'][1].init(28, 12, 'e.stack || e');
function visit17_229_1(result) {
  _$jscoverage['/promise.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['187'][1].init(196, 10, '!listeners');
function visit16_187_1(result) {
  _$jscoverage['/promise.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['184'][1].init(111, 19, 'listeners === false');
function visit15_184_1(result) {
  _$jscoverage['/promise.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['172'][1].init(18, 16, 'progressListener');
function visit14_172_1(result) {
  _$jscoverage['/promise.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['153'][1].init(27, 12, 'e.stack || e');
function visit13_153_1(result) {
  _$jscoverage['/promise.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['146'][1].init(40, 23, 'typeof v === \'function\'');
function visit12_146_1(result) {
  _$jscoverage['/promise.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['128'][1].init(18, 29, 'obj && obj instanceof Promise');
function visit11_128_1(result) {
  _$jscoverage['/promise.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['92'][1].init(87, 47, '(pendings = promise[PROMISE_PENDINGS]) === false');
function visit10_92_1(result) {
  _$jscoverage['/promise.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['77'][1].init(344, 24, 'promise || new Promise()');
function visit9_77_1(result) {
  _$jscoverage['/promise.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['68'][1].init(40, 24, '!(self instanceof Defer)');
function visit8_68_1(result) {
  _$jscoverage['/promise.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['53'][1].init(208, 9, 'fulfilled');
function visit7_53_1(result) {
  _$jscoverage['/promise.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['46'][1].init(454, 12, 'isPromise(v)');
function visit6_46_1(result) {
  _$jscoverage['/promise.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['42'][1].init(306, 8, 'pendings');
function visit5_42_1(result) {
  _$jscoverage['/promise.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['36'][1].init(120, 22, 'pendings === undefined');
function visit4_36_1(result) {
  _$jscoverage['/promise.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['27'][1].init(47, 25, 'promise instanceof Reject');
function visit3_27_1(result) {
  _$jscoverage['/promise.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['15'][2].init(42, 30, 'typeof console !== \'undefined\'');
function visit2_15_2(result) {
  _$jscoverage['/promise.js'].branchData['15'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['15'][1].init(42, 47, 'typeof console !== \'undefined\' && console.error');
function visit1_15_1(result) {
  _$jscoverage['/promise.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/promise.js'].functionData[0]++;
  _$jscoverage['/promise.js'].lineData[7]++;
  var logger = S.getLogger('s/promise');
  _$jscoverage['/promise.js'].lineData[8]++;
  var PROMISE_VALUE = '__promise_value', processImmediate = S.setImmediate, PROMISE_PROGRESS_LISTENERS = '__promise_progress_listeners', PROMISE_PENDINGS = '__promise_pendings';
  _$jscoverage['/promise.js'].lineData[13]++;
  function logError(str) {
    _$jscoverage['/promise.js'].functionData[1]++;
    _$jscoverage['/promise.js'].lineData[15]++;
    if (visit1_15_1(visit2_15_2(typeof console !== 'undefined') && console.error)) {
      _$jscoverage['/promise.js'].lineData[16]++;
      console.error(str);
    }
  }
  _$jscoverage['/promise.js'].lineData[25]++;
  function promiseWhen(promise, fulfilled, rejected) {
    _$jscoverage['/promise.js'].functionData[2]++;
    _$jscoverage['/promise.js'].lineData[27]++;
    if (visit3_27_1(promise instanceof Reject)) {
      _$jscoverage['/promise.js'].lineData[29]++;
      processImmediate(function() {
  _$jscoverage['/promise.js'].functionData[3]++;
  _$jscoverage['/promise.js'].lineData[30]++;
  rejected.call(promise, promise[PROMISE_VALUE]);
});
    } else {
      _$jscoverage['/promise.js'].lineData[33]++;
      var v = promise[PROMISE_VALUE], pendings = promise[PROMISE_PENDINGS];
      _$jscoverage['/promise.js'].lineData[36]++;
      if (visit4_36_1(pendings === undefined)) {
        _$jscoverage['/promise.js'].lineData[37]++;
        pendings = promise[PROMISE_PENDINGS] = [];
      }
      _$jscoverage['/promise.js'].lineData[42]++;
      if (visit5_42_1(pendings)) {
        _$jscoverage['/promise.js'].lineData[43]++;
        pendings.push([fulfilled, rejected]);
      } else {
        _$jscoverage['/promise.js'].lineData[46]++;
        if (visit6_46_1(isPromise(v))) {
          _$jscoverage['/promise.js'].lineData[47]++;
          promiseWhen(v, fulfilled, rejected);
        } else {
          _$jscoverage['/promise.js'].lineData[53]++;
          if (visit7_53_1(fulfilled)) {
            _$jscoverage['/promise.js'].lineData[54]++;
            processImmediate(function() {
  _$jscoverage['/promise.js'].functionData[4]++;
  _$jscoverage['/promise.js'].lineData[55]++;
  fulfilled.call(promise, v);
});
          }
        }
      }
    }
  }
  _$jscoverage['/promise.js'].lineData[66]++;
  function Defer(promise) {
    _$jscoverage['/promise.js'].functionData[5]++;
    _$jscoverage['/promise.js'].lineData[67]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[68]++;
    if (visit8_68_1(!(self instanceof Defer))) {
      _$jscoverage['/promise.js'].lineData[69]++;
      return new Defer(promise);
    }
    _$jscoverage['/promise.js'].lineData[77]++;
    self.promise = visit9_77_1(promise || new Promise());
    _$jscoverage['/promise.js'].lineData[78]++;
    self.promise.defer = self;
  }
  _$jscoverage['/promise.js'].lineData[81]++;
  Defer.prototype = {
  constructor: Defer, 
  resolve: function(value) {
  _$jscoverage['/promise.js'].functionData[6]++;
  _$jscoverage['/promise.js'].lineData[90]++;
  var promise = this.promise, pendings;
  _$jscoverage['/promise.js'].lineData[92]++;
  if (visit10_92_1((pendings = promise[PROMISE_PENDINGS]) === false)) {
    _$jscoverage['/promise.js'].lineData[93]++;
    return null;
  }
  _$jscoverage['/promise.js'].lineData[97]++;
  promise[PROMISE_VALUE] = value;
  _$jscoverage['/promise.js'].lineData[98]++;
  pendings = pendings ? [].concat(pendings) : [];
  _$jscoverage['/promise.js'].lineData[99]++;
  promise[PROMISE_PENDINGS] = false;
  _$jscoverage['/promise.js'].lineData[100]++;
  promise[PROMISE_PROGRESS_LISTENERS] = false;
  _$jscoverage['/promise.js'].lineData[101]++;
  S.each(pendings, function(p) {
  _$jscoverage['/promise.js'].functionData[7]++;
  _$jscoverage['/promise.js'].lineData[102]++;
  promiseWhen(promise, p[0], p[1]);
});
  _$jscoverage['/promise.js'].lineData[104]++;
  return value;
}, 
  reject: function(reason) {
  _$jscoverage['/promise.js'].functionData[8]++;
  _$jscoverage['/promise.js'].lineData[112]++;
  return this.resolve(new Reject(reason));
}, 
  notify: function(message) {
  _$jscoverage['/promise.js'].functionData[9]++;
  _$jscoverage['/promise.js'].lineData[119]++;
  S.each(this.promise[PROMISE_PROGRESS_LISTENERS], function(listener) {
  _$jscoverage['/promise.js'].functionData[10]++;
  _$jscoverage['/promise.js'].lineData[120]++;
  processImmediate(function() {
  _$jscoverage['/promise.js'].functionData[11]++;
  _$jscoverage['/promise.js'].lineData[121]++;
  listener(message);
});
});
}};
  _$jscoverage['/promise.js'].lineData[127]++;
  function isPromise(obj) {
    _$jscoverage['/promise.js'].functionData[12]++;
    _$jscoverage['/promise.js'].lineData[128]++;
    return visit11_128_1(obj && obj instanceof Promise);
  }
  _$jscoverage['/promise.js'].lineData[131]++;
  function bind(fn, context) {
    _$jscoverage['/promise.js'].functionData[13]++;
    _$jscoverage['/promise.js'].lineData[132]++;
    return function() {
  _$jscoverage['/promise.js'].functionData[14]++;
  _$jscoverage['/promise.js'].lineData[133]++;
  return fn.apply(context, arguments);
};
  }
  _$jscoverage['/promise.js'].lineData[144]++;
  function Promise(v) {
    _$jscoverage['/promise.js'].functionData[15]++;
    _$jscoverage['/promise.js'].lineData[145]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[146]++;
    if (visit12_146_1(typeof v === 'function')) {
      _$jscoverage['/promise.js'].lineData[147]++;
      var defer = new Defer(self);
      _$jscoverage['/promise.js'].lineData[148]++;
      var resolve = bind(defer.resolve, defer);
      _$jscoverage['/promise.js'].lineData[149]++;
      var reject = bind(defer.reject, defer);
      _$jscoverage['/promise.js'].lineData[150]++;
      try {
        _$jscoverage['/promise.js'].lineData[151]++;
        v(resolve, reject);
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[153]++;
  logError(visit13_153_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[154]++;
  reject(e);
}
    }
  }
  _$jscoverage['/promise.js'].lineData[159]++;
  Promise.prototype = {
  constructor: Promise, 
  then: function(fulfilled, rejected, progressListener) {
  _$jscoverage['/promise.js'].functionData[16]++;
  _$jscoverage['/promise.js'].lineData[172]++;
  if (visit14_172_1(progressListener)) {
    _$jscoverage['/promise.js'].lineData[173]++;
    this.progress(progressListener);
  }
  _$jscoverage['/promise.js'].lineData[175]++;
  return when(this, fulfilled, rejected);
}, 
  progress: function(progressListener) {
  _$jscoverage['/promise.js'].functionData[17]++;
  _$jscoverage['/promise.js'].lineData[182]++;
  var self = this, listeners = self[PROMISE_PROGRESS_LISTENERS];
  _$jscoverage['/promise.js'].lineData[184]++;
  if (visit15_184_1(listeners === false)) {
    _$jscoverage['/promise.js'].lineData[185]++;
    return self;
  }
  _$jscoverage['/promise.js'].lineData[187]++;
  if (visit16_187_1(!listeners)) {
    _$jscoverage['/promise.js'].lineData[188]++;
    listeners = self[PROMISE_PROGRESS_LISTENERS] = [];
  }
  _$jscoverage['/promise.js'].lineData[190]++;
  listeners.push(progressListener);
  _$jscoverage['/promise.js'].lineData[191]++;
  return self;
}, 
  fail: function(rejected) {
  _$jscoverage['/promise.js'].functionData[18]++;
  _$jscoverage['/promise.js'].lineData[199]++;
  return when(this, 0, rejected);
}, 
  fin: function(callback) {
  _$jscoverage['/promise.js'].functionData[19]++;
  _$jscoverage['/promise.js'].lineData[208]++;
  return when(this, function(value) {
  _$jscoverage['/promise.js'].functionData[20]++;
  _$jscoverage['/promise.js'].lineData[209]++;
  return callback(value, true);
}, function(reason) {
  _$jscoverage['/promise.js'].functionData[21]++;
  _$jscoverage['/promise.js'].lineData[211]++;
  return callback(reason, false);
});
}, 
  done: function(fulfilled, rejected) {
  _$jscoverage['/promise.js'].functionData[22]++;
  _$jscoverage['/promise.js'].lineData[227]++;
  var self = this, onUnhandledError = function(e) {
  _$jscoverage['/promise.js'].functionData[23]++;
  _$jscoverage['/promise.js'].lineData[229]++;
  S.log(visit17_229_1(e.stack || e), 'error');
  _$jscoverage['/promise.js'].lineData[230]++;
  setTimeout(function() {
  _$jscoverage['/promise.js'].functionData[24]++;
  _$jscoverage['/promise.js'].lineData[231]++;
  throw e;
}, 0);
}, promiseToHandle = visit18_234_1(fulfilled || rejected) ? self.then(fulfilled, rejected) : self;
  _$jscoverage['/promise.js'].lineData[237]++;
  promiseToHandle.fail(onUnhandledError);
}, 
  isResolved: function() {
  _$jscoverage['/promise.js'].functionData[25]++;
  _$jscoverage['/promise.js'].lineData[247]++;
  return isResolved(this);
}, 
  isRejected: function() {
  _$jscoverage['/promise.js'].functionData[26]++;
  _$jscoverage['/promise.js'].lineData[253]++;
  return isRejected(this);
}};
  _$jscoverage['/promise.js'].lineData[262]++;
  Promise.prototype['catch'] = Promise.prototype.fail;
  _$jscoverage['/promise.js'].lineData[271]++;
  function Reject(reason) {
    _$jscoverage['/promise.js'].functionData[27]++;
    _$jscoverage['/promise.js'].lineData[272]++;
    if (visit19_272_1(reason instanceof Reject)) {
      _$jscoverage['/promise.js'].lineData[273]++;
      return reason;
    }
    _$jscoverage['/promise.js'].lineData[275]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[276]++;
    self[PROMISE_VALUE] = reason;
    _$jscoverage['/promise.js'].lineData[277]++;
    self[PROMISE_PENDINGS] = false;
    _$jscoverage['/promise.js'].lineData[278]++;
    self[PROMISE_PROGRESS_LISTENERS] = false;
    _$jscoverage['/promise.js'].lineData[282]++;
    return self;
  }
  _$jscoverage['/promise.js'].lineData[285]++;
  S.extend(Reject, Promise);
  _$jscoverage['/promise.js'].lineData[289]++;
  function when(value, fulfilled, rejected) {
    _$jscoverage['/promise.js'].functionData[28]++;
    _$jscoverage['/promise.js'].lineData[290]++;
    var defer = new Defer(), done = 0;
    _$jscoverage['/promise.js'].lineData[294]++;
    function _fulfilled(value) {
      _$jscoverage['/promise.js'].functionData[29]++;
      _$jscoverage['/promise.js'].lineData[295]++;
      try {
        _$jscoverage['/promise.js'].lineData[296]++;
        return fulfilled ? fulfilled.call(this, value) : value;
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[303]++;
  logError(visit20_303_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[304]++;
  return new Reject(e);
}
    }
    _$jscoverage['/promise.js'].lineData[308]++;
    function _rejected(reason) {
      _$jscoverage['/promise.js'].functionData[30]++;
      _$jscoverage['/promise.js'].lineData[309]++;
      try {
        _$jscoverage['/promise.js'].lineData[310]++;
        return rejected ? rejected.call(this, reason) : new Reject(reason);
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[317]++;
  logError(visit21_317_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[318]++;
  return new Reject(e);
}
    }
    _$jscoverage['/promise.js'].lineData[322]++;
    function finalFulfill(value) {
      _$jscoverage['/promise.js'].functionData[31]++;
      _$jscoverage['/promise.js'].lineData[323]++;
      if (visit22_323_1(done)) {
        _$jscoverage['/promise.js'].lineData[324]++;
        logger.error('already done at fulfilled');
        _$jscoverage['/promise.js'].lineData[325]++;
        return;
      }
      _$jscoverage['/promise.js'].lineData[327]++;
      if (visit23_327_1(value instanceof Promise)) {
        _$jscoverage['/promise.js'].lineData[328]++;
        logger.error('assert.not(value instanceof Promise) in when');
        _$jscoverage['/promise.js'].lineData[329]++;
        return;
      }
      _$jscoverage['/promise.js'].lineData[331]++;
      done = 1;
      _$jscoverage['/promise.js'].lineData[332]++;
      defer.resolve(_fulfilled.call(this, value));
    }
    _$jscoverage['/promise.js'].lineData[335]++;
    if (visit24_335_1(value instanceof Promise)) {
      _$jscoverage['/promise.js'].lineData[336]++;
      promiseWhen(value, finalFulfill, function(reason) {
  _$jscoverage['/promise.js'].functionData[32]++;
  _$jscoverage['/promise.js'].lineData[337]++;
  if (visit25_337_1(done)) {
    _$jscoverage['/promise.js'].lineData[338]++;
    logger.error('already done at rejected');
    _$jscoverage['/promise.js'].lineData[339]++;
    return;
  }
  _$jscoverage['/promise.js'].lineData[341]++;
  done = 1;
  _$jscoverage['/promise.js'].lineData[343]++;
  defer.resolve(_rejected.call(this, reason));
});
    } else {
      _$jscoverage['/promise.js'].lineData[346]++;
      finalFulfill(value);
    }
    _$jscoverage['/promise.js'].lineData[351]++;
    return defer.promise;
  }
  _$jscoverage['/promise.js'].lineData[354]++;
  function isResolved(obj) {
    _$jscoverage['/promise.js'].functionData[33]++;
    _$jscoverage['/promise.js'].lineData[356]++;
    return visit26_356_1(obj && visit27_356_2(!isRejected(obj) && visit28_360_1((visit29_360_2(obj[PROMISE_PENDINGS] === false)) && (visit30_364_1(!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))))));
  }
  _$jscoverage['/promise.js'].lineData[371]++;
  function isRejected(obj) {
    _$jscoverage['/promise.js'].functionData[34]++;
    _$jscoverage['/promise.js'].lineData[374]++;
    return visit31_374_1(obj && (visit32_374_2(obj instanceof Reject || obj[PROMISE_VALUE] instanceof Reject)));
  }
  _$jscoverage['/promise.js'].lineData[377]++;
  KISSY.Defer = Defer;
  _$jscoverage['/promise.js'].lineData[378]++;
  KISSY.Promise = Promise;
  _$jscoverage['/promise.js'].lineData[379]++;
  Promise.Defer = Defer;
  _$jscoverage['/promise.js'].lineData[381]++;
  S.mix(Promise, {
  when: when, 
  'cast': function(obj) {
  _$jscoverage['/promise.js'].functionData[35]++;
  _$jscoverage['/promise.js'].lineData[419]++;
  if (visit33_419_1(obj instanceof Promise)) {
    _$jscoverage['/promise.js'].lineData[420]++;
    return obj;
  }
  _$jscoverage['/promise.js'].lineData[422]++;
  return when(obj);
}, 
  resolve: function(obj) {
  _$jscoverage['/promise.js'].functionData[36]++;
  _$jscoverage['/promise.js'].lineData[429]++;
  return when(obj);
}, 
  reject: function(obj) {
  _$jscoverage['/promise.js'].functionData[37]++;
  _$jscoverage['/promise.js'].lineData[438]++;
  return new Reject(obj);
}, 
  isPromise: isPromise, 
  isResolved: isResolved, 
  isRejected: isRejected, 
  all: function(promises) {
  _$jscoverage['/promise.js'].functionData[38]++;
  _$jscoverage['/promise.js'].lineData[481]++;
  var count = promises.length;
  _$jscoverage['/promise.js'].lineData[482]++;
  if (visit34_482_1(!count)) {
    _$jscoverage['/promise.js'].lineData[483]++;
    return null;
  }
  _$jscoverage['/promise.js'].lineData[485]++;
  var defer = new Defer();
  _$jscoverage['/promise.js'].lineData[486]++;
  for (var i = 0; visit35_486_1(i < promises.length); i++) {
    _$jscoverage['/promise.js'].lineData[488]++;
    (function(promise, i) {
  _$jscoverage['/promise.js'].functionData[39]++;
  _$jscoverage['/promise.js'].lineData[489]++;
  when(promise, function(value) {
  _$jscoverage['/promise.js'].functionData[40]++;
  _$jscoverage['/promise.js'].lineData[490]++;
  promises[i] = value;
  _$jscoverage['/promise.js'].lineData[491]++;
  if (visit36_491_1(--count === 0)) {
    _$jscoverage['/promise.js'].lineData[494]++;
    defer.resolve(promises);
  }
}, function(r) {
  _$jscoverage['/promise.js'].functionData[41]++;
  _$jscoverage['/promise.js'].lineData[499]++;
  defer.reject(r);
});
})(promises[i], i);
  }
  _$jscoverage['/promise.js'].lineData[503]++;
  return defer.promise;
}, 
  async: function(generatorFunc) {
  _$jscoverage['/promise.js'].functionData[42]++;
  _$jscoverage['/promise.js'].lineData[511]++;
  return function() {
  _$jscoverage['/promise.js'].functionData[43]++;
  _$jscoverage['/promise.js'].lineData[512]++;
  var generator = generatorFunc.apply(this, arguments);
  _$jscoverage['/promise.js'].lineData[514]++;
  function doAction(action, arg) {
    _$jscoverage['/promise.js'].functionData[44]++;
    _$jscoverage['/promise.js'].lineData[515]++;
    var result;
    _$jscoverage['/promise.js'].lineData[517]++;
    try {
      _$jscoverage['/promise.js'].lineData[518]++;
      result = generator[action](arg);
    }    catch (e) {
  _$jscoverage['/promise.js'].lineData[520]++;
  return new Reject(e);
}
    _$jscoverage['/promise.js'].lineData[522]++;
    if (visit37_522_1(result.done)) {
      _$jscoverage['/promise.js'].lineData[523]++;
      return result.value;
    }
    _$jscoverage['/promise.js'].lineData[525]++;
    return when(result.value, next, throwEx);
  }
  _$jscoverage['/promise.js'].lineData[528]++;
  function next(v) {
    _$jscoverage['/promise.js'].functionData[45]++;
    _$jscoverage['/promise.js'].lineData[529]++;
    return doAction('next', v);
  }
  _$jscoverage['/promise.js'].lineData[532]++;
  function throwEx(e) {
    _$jscoverage['/promise.js'].functionData[46]++;
    _$jscoverage['/promise.js'].lineData[533]++;
    return doAction('throw', e);
  }
  _$jscoverage['/promise.js'].lineData[536]++;
  return next();
};
}});
  _$jscoverage['/promise.js'].lineData[540]++;
  return Promise;
});
