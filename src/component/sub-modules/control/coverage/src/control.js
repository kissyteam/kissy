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
  _$jscoverage['/control.js'].lineData[37] = 0;
  _$jscoverage['/control.js'].lineData[44] = 0;
  _$jscoverage['/control.js'].lineData[45] = 0;
  _$jscoverage['/control.js'].lineData[47] = 0;
  _$jscoverage['/control.js'].lineData[51] = 0;
  _$jscoverage['/control.js'].lineData[52] = 0;
  _$jscoverage['/control.js'].lineData[53] = 0;
  _$jscoverage['/control.js'].lineData[54] = 0;
  _$jscoverage['/control.js'].lineData[57] = 0;
  _$jscoverage['/control.js'].lineData[66] = 0;
  _$jscoverage['/control.js'].lineData[70] = 0;
  _$jscoverage['/control.js'].lineData[73] = 0;
  _$jscoverage['/control.js'].lineData[78] = 0;
  _$jscoverage['/control.js'].lineData[81] = 0;
  _$jscoverage['/control.js'].lineData[82] = 0;
  _$jscoverage['/control.js'].lineData[84] = 0;
  _$jscoverage['/control.js'].lineData[87] = 0;
  _$jscoverage['/control.js'].lineData[93] = 0;
  _$jscoverage['/control.js'].lineData[94] = 0;
  _$jscoverage['/control.js'].lineData[95] = 0;
  _$jscoverage['/control.js'].lineData[100] = 0;
  _$jscoverage['/control.js'].lineData[101] = 0;
  _$jscoverage['/control.js'].lineData[107] = 0;
  _$jscoverage['/control.js'].lineData[108] = 0;
  _$jscoverage['/control.js'].lineData[109] = 0;
  _$jscoverage['/control.js'].lineData[110] = 0;
  _$jscoverage['/control.js'].lineData[111] = 0;
  _$jscoverage['/control.js'].lineData[112] = 0;
  _$jscoverage['/control.js'].lineData[116] = 0;
  _$jscoverage['/control.js'].lineData[120] = 0;
  _$jscoverage['/control.js'].lineData[121] = 0;
  _$jscoverage['/control.js'].lineData[122] = 0;
  _$jscoverage['/control.js'].lineData[126] = 0;
  _$jscoverage['/control.js'].lineData[127] = 0;
  _$jscoverage['/control.js'].lineData[133] = 0;
  _$jscoverage['/control.js'].lineData[139] = 0;
  _$jscoverage['/control.js'].lineData[146] = 0;
  _$jscoverage['/control.js'].lineData[154] = 0;
  _$jscoverage['/control.js'].lineData[155] = 0;
  _$jscoverage['/control.js'].lineData[156] = 0;
  _$jscoverage['/control.js'].lineData[157] = 0;
  _$jscoverage['/control.js'].lineData[165] = 0;
  _$jscoverage['/control.js'].lineData[166] = 0;
  _$jscoverage['/control.js'].lineData[167] = 0;
  _$jscoverage['/control.js'].lineData[171] = 0;
  _$jscoverage['/control.js'].lineData[172] = 0;
  _$jscoverage['/control.js'].lineData[177] = 0;
  _$jscoverage['/control.js'].lineData[178] = 0;
  _$jscoverage['/control.js'].lineData[183] = 0;
  _$jscoverage['/control.js'].lineData[190] = 0;
  _$jscoverage['/control.js'].lineData[191] = 0;
  _$jscoverage['/control.js'].lineData[203] = 0;
  _$jscoverage['/control.js'].lineData[207] = 0;
  _$jscoverage['/control.js'].lineData[208] = 0;
  _$jscoverage['/control.js'].lineData[218] = 0;
  _$jscoverage['/control.js'].lineData[222] = 0;
  _$jscoverage['/control.js'].lineData[223] = 0;
  _$jscoverage['/control.js'].lineData[233] = 0;
  _$jscoverage['/control.js'].lineData[234] = 0;
  _$jscoverage['/control.js'].lineData[235] = 0;
  _$jscoverage['/control.js'].lineData[239] = 0;
  _$jscoverage['/control.js'].lineData[241] = 0;
  _$jscoverage['/control.js'].lineData[254] = 0;
  _$jscoverage['/control.js'].lineData[257] = 0;
  _$jscoverage['/control.js'].lineData[258] = 0;
  _$jscoverage['/control.js'].lineData[259] = 0;
  _$jscoverage['/control.js'].lineData[261] = 0;
  _$jscoverage['/control.js'].lineData[262] = 0;
  _$jscoverage['/control.js'].lineData[264] = 0;
  _$jscoverage['/control.js'].lineData[266] = 0;
  _$jscoverage['/control.js'].lineData[267] = 0;
  _$jscoverage['/control.js'].lineData[269] = 0;
  _$jscoverage['/control.js'].lineData[270] = 0;
  _$jscoverage['/control.js'].lineData[277] = 0;
  _$jscoverage['/control.js'].lineData[278] = 0;
  _$jscoverage['/control.js'].lineData[290] = 0;
  _$jscoverage['/control.js'].lineData[292] = 0;
  _$jscoverage['/control.js'].lineData[293] = 0;
  _$jscoverage['/control.js'].lineData[298] = 0;
  _$jscoverage['/control.js'].lineData[299] = 0;
  _$jscoverage['/control.js'].lineData[312] = 0;
  _$jscoverage['/control.js'].lineData[313] = 0;
  _$jscoverage['/control.js'].lineData[322] = 0;
  _$jscoverage['/control.js'].lineData[323] = 0;
  _$jscoverage['/control.js'].lineData[327] = 0;
  _$jscoverage['/control.js'].lineData[328] = 0;
  _$jscoverage['/control.js'].lineData[337] = 0;
  _$jscoverage['/control.js'].lineData[338] = 0;
  _$jscoverage['/control.js'].lineData[342] = 0;
  _$jscoverage['/control.js'].lineData[343] = 0;
  _$jscoverage['/control.js'].lineData[344] = 0;
  _$jscoverage['/control.js'].lineData[345] = 0;
  _$jscoverage['/control.js'].lineData[347] = 0;
  _$jscoverage['/control.js'].lineData[356] = 0;
  _$jscoverage['/control.js'].lineData[357] = 0;
  _$jscoverage['/control.js'].lineData[359] = 0;
  _$jscoverage['/control.js'].lineData[363] = 0;
  _$jscoverage['/control.js'].lineData[364] = 0;
  _$jscoverage['/control.js'].lineData[381] = 0;
  _$jscoverage['/control.js'].lineData[382] = 0;
  _$jscoverage['/control.js'].lineData[383] = 0;
  _$jscoverage['/control.js'].lineData[394] = 0;
  _$jscoverage['/control.js'].lineData[458] = 0;
  _$jscoverage['/control.js'].lineData[459] = 0;
  _$jscoverage['/control.js'].lineData[461] = 0;
  _$jscoverage['/control.js'].lineData[511] = 0;
  _$jscoverage['/control.js'].lineData[512] = 0;
  _$jscoverage['/control.js'].lineData[557] = 0;
  _$jscoverage['/control.js'].lineData[559] = 0;
  _$jscoverage['/control.js'].lineData[560] = 0;
  _$jscoverage['/control.js'].lineData[561] = 0;
  _$jscoverage['/control.js'].lineData[563] = 0;
  _$jscoverage['/control.js'].lineData[566] = 0;
  _$jscoverage['/control.js'].lineData[633] = 0;
  _$jscoverage['/control.js'].lineData[782] = 0;
  _$jscoverage['/control.js'].lineData[783] = 0;
  _$jscoverage['/control.js'].lineData[785] = 0;
  _$jscoverage['/control.js'].lineData[786] = 0;
  _$jscoverage['/control.js'].lineData[822] = 0;
  _$jscoverage['/control.js'].lineData[828] = 0;
  _$jscoverage['/control.js'].lineData[829] = 0;
  _$jscoverage['/control.js'].lineData[831] = 0;
  _$jscoverage['/control.js'].lineData[832] = 0;
  _$jscoverage['/control.js'].lineData[833] = 0;
  _$jscoverage['/control.js'].lineData[835] = 0;
  _$jscoverage['/control.js'].lineData[838] = 0;
  _$jscoverage['/control.js'].lineData[840] = 0;
  _$jscoverage['/control.js'].lineData[841] = 0;
  _$jscoverage['/control.js'].lineData[848] = 0;
  _$jscoverage['/control.js'].lineData[849] = 0;
  _$jscoverage['/control.js'].lineData[852] = 0;
  _$jscoverage['/control.js'].lineData[854] = 0;
  _$jscoverage['/control.js'].lineData[855] = 0;
  _$jscoverage['/control.js'].lineData[858] = 0;
  _$jscoverage['/control.js'].lineData[859] = 0;
  _$jscoverage['/control.js'].lineData[861] = 0;
  _$jscoverage['/control.js'].lineData[864] = 0;
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
  _$jscoverage['/control.js'].branchData['44'] = [];
  _$jscoverage['/control.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['53'] = [];
  _$jscoverage['/control.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['73'] = [];
  _$jscoverage['/control.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['81'] = [];
  _$jscoverage['/control.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['84'] = [];
  _$jscoverage['/control.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['94'] = [];
  _$jscoverage['/control.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['100'] = [];
  _$jscoverage['/control.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['100'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['116'] = [];
  _$jscoverage['/control.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['121'] = [];
  _$jscoverage['/control.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['126'] = [];
  _$jscoverage['/control.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['171'] = [];
  _$jscoverage['/control.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['177'] = [];
  _$jscoverage['/control.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['190'] = [];
  _$jscoverage['/control.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['207'] = [];
  _$jscoverage['/control.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['222'] = [];
  _$jscoverage['/control.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['239'] = [];
  _$jscoverage['/control.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['256'] = [];
  _$jscoverage['/control.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['257'] = [];
  _$jscoverage['/control.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['258'] = [];
  _$jscoverage['/control.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['261'] = [];
  _$jscoverage['/control.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['264'] = [];
  _$jscoverage['/control.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['267'] = [];
  _$jscoverage['/control.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['269'] = [];
  _$jscoverage['/control.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['269'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['269'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['277'] = [];
  _$jscoverage['/control.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['292'] = [];
  _$jscoverage['/control.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['292'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['292'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['298'] = [];
  _$jscoverage['/control.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['312'] = [];
  _$jscoverage['/control.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['327'] = [];
  _$jscoverage['/control.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['343'] = [];
  _$jscoverage['/control.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['356'] = [];
  _$jscoverage['/control.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['363'] = [];
  _$jscoverage['/control.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['382'] = [];
  _$jscoverage['/control.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['458'] = [];
  _$jscoverage['/control.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['461'] = [];
  _$jscoverage['/control.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['559'] = [];
  _$jscoverage['/control.js'].branchData['559'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['560'] = [];
  _$jscoverage['/control.js'].branchData['560'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['561'] = [];
  _$jscoverage['/control.js'].branchData['561'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['754'] = [];
  _$jscoverage['/control.js'].branchData['754'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['782'] = [];
  _$jscoverage['/control.js'].branchData['782'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['785'] = [];
  _$jscoverage['/control.js'].branchData['785'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['834'] = [];
  _$jscoverage['/control.js'].branchData['834'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['848'] = [];
  _$jscoverage['/control.js'].branchData['848'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['854'] = [];
  _$jscoverage['/control.js'].branchData['854'][1] = new BranchData();
}
_$jscoverage['/control.js'].branchData['854'][1].init(363, 6, 'xclass');
function visit103_854_1(result) {
  _$jscoverage['/control.js'].branchData['854'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['848'][1].init(210, 20, 'xclass = last.xclass');
function visit102_848_1(result) {
  _$jscoverage['/control.js'].branchData['848'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['834'][1].init(113, 24, '!attrs || !attrs.xrender');
function visit101_834_1(result) {
  _$jscoverage['/control.js'].branchData['834'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['785'][1].init(169, 1, 'p');
function visit100_785_1(result) {
  _$jscoverage['/control.js'].branchData['785'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['782'][1].init(30, 25, 'prev = this.get(\'parent\')');
function visit99_782_1(result) {
  _$jscoverage['/control.js'].branchData['782'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['754'][1].init(59, 40, 'S.config(\'component/prefixCls\') || \'ks-\'');
function visit98_754_1(result) {
  _$jscoverage['/control.js'].branchData['754'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['561'][1].init(90, 29, 'xy[1] && self.set("y", xy[1])');
function visit97_561_1(result) {
  _$jscoverage['/control.js'].branchData['561'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['560'][1].init(30, 29, 'xy[0] && self.set("x", xy[0])');
function visit96_560_1(result) {
  _$jscoverage['/control.js'].branchData['560'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['559'][1].init(122, 9, 'xy.length');
function visit95_559_1(result) {
  _$jscoverage['/control.js'].branchData['559'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['461'][1].init(162, 7, 'v || []');
function visit94_461_1(result) {
  _$jscoverage['/control.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['458'][1].init(30, 20, 'typeof v == \'string\'');
function visit93_458_1(result) {
  _$jscoverage['/control.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['382'][1].init(129, 9, 'this.view');
function visit92_382_1(result) {
  _$jscoverage['/control.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['363'][1].init(22, 21, '!this.get(\'disabled\')');
function visit91_363_1(result) {
  _$jscoverage['/control.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['356'][1].init(22, 35, 'ev[\'keyCode\'] == Node.KeyCode.ENTER');
function visit90_356_1(result) {
  _$jscoverage['/control.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['343'][1].init(56, 55, '!this.get(\'disabled\') && self.handleKeyDownInternal(ev)');
function visit89_343_1(result) {
  _$jscoverage['/control.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['327'][1].init(22, 21, '!this.get(\'disabled\')');
function visit88_327_1(result) {
  _$jscoverage['/control.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['312'][1].init(22, 21, '!this.get(\'disabled\')');
function visit87_312_1(result) {
  _$jscoverage['/control.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['298'][1].init(22, 21, '!this.get(\'disabled\')');
function visit86_298_1(result) {
  _$jscoverage['/control.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['292'][3].init(102, 16, 'ev[\'which\'] == 1');
function visit85_292_3(result) {
  _$jscoverage['/control.js'].branchData['292'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['292'][2].init(102, 41, 'ev[\'which\'] == 1 || isTouchEventSupported');
function visit84_292_2(result) {
  _$jscoverage['/control.js'].branchData['292'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['292'][1].init(79, 65, 'self.get("active") && (ev[\'which\'] == 1 || isTouchEventSupported)');
function visit83_292_1(result) {
  _$jscoverage['/control.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['277'][1].init(22, 21, '!this.get(\'disabled\')');
function visit82_277_1(result) {
  _$jscoverage['/control.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['269'][3].init(279, 15, 'n != "textarea"');
function visit81_269_3(result) {
  _$jscoverage['/control.js'].branchData['269'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['269'][2].init(263, 12, 'n != "input"');
function visit80_269_2(result) {
  _$jscoverage['/control.js'].branchData['269'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['269'][1].init(263, 31, 'n != "input" && n != "textarea"');
function visit79_269_1(result) {
  _$jscoverage['/control.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['267'][1].init(132, 20, 'n && n.toLowerCase()');
function visit78_267_1(result) {
  _$jscoverage['/control.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['264'][1].init(263, 31, '!self.get("allowTextSelection")');
function visit77_264_1(result) {
  _$jscoverage['/control.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['261'][1].init(151, 21, 'self.get("focusable")');
function visit76_261_1(result) {
  _$jscoverage['/control.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['258'][1].init(26, 22, 'self.get("activeable")');
function visit75_258_1(result) {
  _$jscoverage['/control.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['257'][1].init(141, 44, 'isMouseActionButton || isTouchEventSupported');
function visit74_257_1(result) {
  _$jscoverage['/control.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['256'][1].init(83, 16, 'ev[\'which\'] == 1');
function visit73_256_1(result) {
  _$jscoverage['/control.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['239'][1].init(22, 21, '!this.get(\'disabled\')');
function visit72_239_1(result) {
  _$jscoverage['/control.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['222'][1].init(22, 21, '!this.get(\'disabled\')');
function visit71_222_1(result) {
  _$jscoverage['/control.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['207'][1].init(22, 21, '!this.get(\'disabled\')');
function visit70_207_1(result) {
  _$jscoverage['/control.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['190'][1].init(22, 21, '!this.get(\'disabled\')');
function visit69_190_1(result) {
  _$jscoverage['/control.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['177'][1].init(22, 21, 'this.get(\'focusable\')');
function visit68_177_1(result) {
  _$jscoverage['/control.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['171'][1].init(22, 21, 'this.get(\'focusable\')');
function visit67_171_1(result) {
  _$jscoverage['/control.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['126'][1].init(186, 44, 'target.ownerDocument.activeElement == target');
function visit66_126_1(result) {
  _$jscoverage['/control.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['121'][1].init(86, 1, 'v');
function visit65_121_1(result) {
  _$jscoverage['/control.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['116'][1].init(54, 14, 'parent || this');
function visit64_116_1(result) {
  _$jscoverage['/control.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['100'][2].init(906, 6, 'ie < 9');
function visit63_100_2(result) {
  _$jscoverage['/control.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['100'][1].init(900, 12, 'ie && ie < 9');
function visit62_100_1(result) {
  _$jscoverage['/control.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['94'][1].init(628, 14, 'Gesture.cancel');
function visit61_94_1(result) {
  _$jscoverage['/control.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['84'][1].init(64, 22, '!isTouchEventSupported');
function visit60_84_1(result) {
  _$jscoverage['/control.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['81'][1].init(492, 29, 'self.get(\'handleMouseEvents\')');
function visit59_81_1(result) {
  _$jscoverage['/control.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['73'][1].init(115, 21, 'self.get(\'focusable\')');
function visit58_73_1(result) {
  _$jscoverage['/control.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['53'][1].init(640, 31, '!self.get("allowTextSelection")');
function visit57_53_1(result) {
  _$jscoverage['/control.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['44'][1].init(303, 4, 'view');
function visit56_44_1(result) {
  _$jscoverage['/control.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['7'][1].init(15, 43, 'S.Env.host.document.documentMode || S.UA.ie');
function visit55_7_1(result) {
  _$jscoverage['/control.js'].branchData['7'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].lineData[6]++;
KISSY.add("component/control", function(S, Node, ComponentProcess, Manager, Render, undefined) {
  _$jscoverage['/control.js'].functionData[0]++;
  _$jscoverage['/control.js'].lineData[7]++;
  var ie = visit55_7_1(S.Env.host.document.documentMode || S.UA.ie), Features = S.Features, Gesture = Node.Gesture, isTouchEventSupported = Features.isTouchEventSupported();
  _$jscoverage['/control.js'].lineData[17]++;
  var Control = ComponentProcess.extend({
  isControl: true, 
  createDom: function() {
  _$jscoverage['/control.js'].functionData[1]++;
  _$jscoverage['/control.js'].lineData[37]++;
  var self = this, Render = self.get('xrender'), view = self.get('view'), id = self.get("id"), el;
  _$jscoverage['/control.js'].lineData[44]++;
  if (visit56_44_1(view)) {
    _$jscoverage['/control.js'].lineData[45]++;
    view.set('control', self);
  } else {
    _$jscoverage['/control.js'].lineData[47]++;
    self.set('view', this.view = view = new Render({
  control: self}));
  }
  _$jscoverage['/control.js'].lineData[51]++;
  view.create();
  _$jscoverage['/control.js'].lineData[52]++;
  el = view.getKeyEventTarget();
  _$jscoverage['/control.js'].lineData[53]++;
  if (visit57_53_1(!self.get("allowTextSelection"))) {
    _$jscoverage['/control.js'].lineData[54]++;
    el.unselectable();
  }
  _$jscoverage['/control.js'].lineData[57]++;
  Manager.addComponent(id, self);
}, 
  renderUI: function() {
  _$jscoverage['/control.js'].functionData[2]++;
  _$jscoverage['/control.js'].lineData[66]++;
  this.view.render();
}, 
  bindUI: function() {
  _$jscoverage['/control.js'].functionData[3]++;
  _$jscoverage['/control.js'].lineData[70]++;
  var self = this, el = self.view.getKeyEventTarget();
  _$jscoverage['/control.js'].lineData[73]++;
  if (visit58_73_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[78]++;
    el.on("focus", self.handleFocus, self).on("blur", self.handleBlur, self).on("keydown", self.handleKeydown, self);
  }
  _$jscoverage['/control.js'].lineData[81]++;
  if (visit59_81_1(self.get('handleMouseEvents'))) {
    _$jscoverage['/control.js'].lineData[82]++;
    el = self.$el;
    _$jscoverage['/control.js'].lineData[84]++;
    if (visit60_84_1(!isTouchEventSupported)) {
      _$jscoverage['/control.js'].lineData[87]++;
      el.on("mouseenter", self.handleMouseEnter, self).on("mouseleave", self.handleMouseLeave, self).on("contextmenu", self.handleContextMenu, self);
    }
    _$jscoverage['/control.js'].lineData[93]++;
    el.on(Gesture.start, self.handleMouseDown, self).on(Gesture.end, self.handleMouseUp, self).on(Gesture.tap, self.handleClick, self);
    _$jscoverage['/control.js'].lineData[94]++;
    if (visit61_94_1(Gesture.cancel)) {
      _$jscoverage['/control.js'].lineData[95]++;
      el.on(Gesture.cancel, self.handleMouseUp, self);
    }
    _$jscoverage['/control.js'].lineData[100]++;
    if (visit62_100_1(ie && visit63_100_2(ie < 9))) {
      _$jscoverage['/control.js'].lineData[101]++;
      el.on("dblclick", self.handleDblClick, self);
    }
  }
}, 
  sync: function() {
  _$jscoverage['/control.js'].functionData[4]++;
  _$jscoverage['/control.js'].lineData[107]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[108]++;
  self.fire('beforeSyncUI');
  _$jscoverage['/control.js'].lineData[109]++;
  self.syncUI();
  _$jscoverage['/control.js'].lineData[110]++;
  self.view.sync();
  _$jscoverage['/control.js'].lineData[111]++;
  self.__callPluginsMethod("pluginSyncUI");
  _$jscoverage['/control.js'].lineData[112]++;
  self.fire('afterSyncUI');
}, 
  createComponent: function(cfg, parent) {
  _$jscoverage['/control.js'].functionData[5]++;
  _$jscoverage['/control.js'].lineData[116]++;
  return Manager.createComponent(cfg, visit64_116_1(parent || this));
}, 
  '_onSetFocused': function(v) {
  _$jscoverage['/control.js'].functionData[6]++;
  _$jscoverage['/control.js'].lineData[120]++;
  var target = this.view.getKeyEventTarget()[0];
  _$jscoverage['/control.js'].lineData[121]++;
  if (visit65_121_1(v)) {
    _$jscoverage['/control.js'].lineData[122]++;
    target.focus();
  } else {
    _$jscoverage['/control.js'].lineData[126]++;
    if (visit66_126_1(target.ownerDocument.activeElement == target)) {
      _$jscoverage['/control.js'].lineData[127]++;
      target.ownerDocument.body.focus();
    }
  }
}, 
  '_onSetX': function(x) {
  _$jscoverage['/control.js'].functionData[7]++;
  _$jscoverage['/control.js'].lineData[133]++;
  this.$el.offset({
  left: x});
}, 
  '_onSetY': function(y) {
  _$jscoverage['/control.js'].functionData[8]++;
  _$jscoverage['/control.js'].lineData[139]++;
  this.$el.offset({
  top: y});
}, 
  _onSetVisible: function(v) {
  _$jscoverage['/control.js'].functionData[9]++;
  _$jscoverage['/control.js'].lineData[146]++;
  this.fire(v ? "show" : "hide");
}, 
  show: function() {
  _$jscoverage['/control.js'].functionData[10]++;
  _$jscoverage['/control.js'].lineData[154]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[155]++;
  self.render();
  _$jscoverage['/control.js'].lineData[156]++;
  self.set("visible", true);
  _$jscoverage['/control.js'].lineData[157]++;
  return self;
}, 
  hide: function() {
  _$jscoverage['/control.js'].functionData[11]++;
  _$jscoverage['/control.js'].lineData[165]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[166]++;
  self.set("visible", false);
  _$jscoverage['/control.js'].lineData[167]++;
  return self;
}, 
  focus: function() {
  _$jscoverage['/control.js'].functionData[12]++;
  _$jscoverage['/control.js'].lineData[171]++;
  if (visit67_171_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[172]++;
    this.set('focused', true);
  }
}, 
  blur: function() {
  _$jscoverage['/control.js'].functionData[13]++;
  _$jscoverage['/control.js'].lineData[177]++;
  if (visit68_177_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[178]++;
    this.set('focused', false);
  }
}, 
  move: function(x, y) {
  _$jscoverage['/control.js'].functionData[14]++;
  _$jscoverage['/control.js'].lineData[183]++;
  this.set({
  x: x, 
  y: y});
}, 
  handleDblClick: function(ev) {
  _$jscoverage['/control.js'].functionData[15]++;
  _$jscoverage['/control.js'].lineData[190]++;
  if (visit69_190_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[191]++;
    this.handleDblClickInternal(ev);
  }
}, 
  handleDblClickInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[16]++;
  _$jscoverage['/control.js'].lineData[203]++;
  this.handleClickInternal(ev);
}, 
  handleMouseEnter: function(ev) {
  _$jscoverage['/control.js'].functionData[17]++;
  _$jscoverage['/control.js'].lineData[207]++;
  if (visit70_207_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[208]++;
    this.handleMouseEnterInternal(ev);
  }
}, 
  handleMouseEnterInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[18]++;
  _$jscoverage['/control.js'].lineData[218]++;
  this.set("highlighted", !!ev);
}, 
  handleMouseLeave: function(ev) {
  _$jscoverage['/control.js'].functionData[19]++;
  _$jscoverage['/control.js'].lineData[222]++;
  if (visit71_222_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[223]++;
    this.handleMouseLeaveInternal(ev);
  }
}, 
  handleMouseLeaveInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[20]++;
  _$jscoverage['/control.js'].lineData[233]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[234]++;
  self.set("active", false);
  _$jscoverage['/control.js'].lineData[235]++;
  self.set("highlighted", !ev);
}, 
  handleMouseDown: function(ev) {
  _$jscoverage['/control.js'].functionData[21]++;
  _$jscoverage['/control.js'].lineData[239]++;
  if (visit72_239_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[241]++;
    this.handleMouseDownInternal(ev);
  }
}, 
  handleMouseDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[22]++;
  _$jscoverage['/control.js'].lineData[254]++;
  var self = this, n, isMouseActionButton = visit73_256_1(ev['which'] == 1);
  _$jscoverage['/control.js'].lineData[257]++;
  if (visit74_257_1(isMouseActionButton || isTouchEventSupported)) {
    _$jscoverage['/control.js'].lineData[258]++;
    if (visit75_258_1(self.get("activeable"))) {
      _$jscoverage['/control.js'].lineData[259]++;
      self.set("active", true);
    }
    _$jscoverage['/control.js'].lineData[261]++;
    if (visit76_261_1(self.get("focusable"))) {
      _$jscoverage['/control.js'].lineData[262]++;
      self.focus();
    }
    _$jscoverage['/control.js'].lineData[264]++;
    if (visit77_264_1(!self.get("allowTextSelection"))) {
      _$jscoverage['/control.js'].lineData[266]++;
      n = ev.target.nodeName;
      _$jscoverage['/control.js'].lineData[267]++;
      n = visit78_267_1(n && n.toLowerCase());
      _$jscoverage['/control.js'].lineData[269]++;
      if (visit79_269_1(visit80_269_2(n != "input") && visit81_269_3(n != "textarea"))) {
        _$jscoverage['/control.js'].lineData[270]++;
        ev['preventDefault']();
      }
    }
  }
}, 
  handleMouseUp: function(ev) {
  _$jscoverage['/control.js'].functionData[23]++;
  _$jscoverage['/control.js'].lineData[277]++;
  if (visit82_277_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[278]++;
    this.handleMouseUpInternal(ev);
  }
}, 
  handleMouseUpInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[24]++;
  _$jscoverage['/control.js'].lineData[290]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[292]++;
  if (visit83_292_1(self.get("active") && (visit84_292_2(visit85_292_3(ev['which'] == 1) || isTouchEventSupported)))) {
    _$jscoverage['/control.js'].lineData[293]++;
    self.set("active", false);
  }
}, 
  handleContextMenu: function(ev) {
  _$jscoverage['/control.js'].functionData[25]++;
  _$jscoverage['/control.js'].lineData[298]++;
  if (visit86_298_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[299]++;
    this.handleContextMenuInternal(ev);
  }
}, 
  handleContextMenuInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[26]++;
}, 
  handleFocus: function() {
  _$jscoverage['/control.js'].functionData[27]++;
  _$jscoverage['/control.js'].lineData[312]++;
  if (visit87_312_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[313]++;
    this.handleFocusInternal();
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/control.js'].functionData[28]++;
  _$jscoverage['/control.js'].lineData[322]++;
  this.focus();
  _$jscoverage['/control.js'].lineData[323]++;
  this.fire("focus");
}, 
  handleBlur: function() {
  _$jscoverage['/control.js'].functionData[29]++;
  _$jscoverage['/control.js'].lineData[327]++;
  if (visit88_327_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[328]++;
    this.handleBlurInternal();
  }
}, 
  handleBlurInternal: function() {
  _$jscoverage['/control.js'].functionData[30]++;
  _$jscoverage['/control.js'].lineData[337]++;
  this.blur();
  _$jscoverage['/control.js'].lineData[338]++;
  this.fire("blur");
}, 
  handleKeydown: function(ev) {
  _$jscoverage['/control.js'].functionData[31]++;
  _$jscoverage['/control.js'].lineData[342]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[343]++;
  if (visit89_343_1(!this.get('disabled') && self.handleKeyDownInternal(ev))) {
    _$jscoverage['/control.js'].lineData[344]++;
    ev['halt']();
    _$jscoverage['/control.js'].lineData[345]++;
    return true;
  }
  _$jscoverage['/control.js'].lineData[347]++;
  return undefined;
}, 
  handleKeyDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[32]++;
  _$jscoverage['/control.js'].lineData[356]++;
  if (visit90_356_1(ev['keyCode'] == Node.KeyCode.ENTER)) {
    _$jscoverage['/control.js'].lineData[357]++;
    return this.handleClickInternal(ev);
  }
  _$jscoverage['/control.js'].lineData[359]++;
  return undefined;
}, 
  handleClick: function(ev) {
  _$jscoverage['/control.js'].functionData[33]++;
  _$jscoverage['/control.js'].lineData[363]++;
  if (visit91_363_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[364]++;
    this.handleClickInternal(ev);
  }
}, 
  handleClickInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[34]++;
}, 
  destructor: function() {
  _$jscoverage['/control.js'].functionData[35]++;
  _$jscoverage['/control.js'].lineData[381]++;
  Manager.removeComponent(this.get('id'));
  _$jscoverage['/control.js'].lineData[382]++;
  if (visit92_382_1(this.view)) {
    _$jscoverage['/control.js'].lineData[383]++;
    this.view.destroy();
  }
}}, {
  name: 'control', 
  ATTRS: {
  id: {
  view: 1, 
  valueFn: function() {
  _$jscoverage['/control.js'].functionData[36]++;
  _$jscoverage['/control.js'].lineData[394]++;
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
  _$jscoverage['/control.js'].lineData[458]++;
  if (visit93_458_1(typeof v == 'string')) {
    _$jscoverage['/control.js'].lineData[459]++;
    v = v.split(/\s+/);
  }
  _$jscoverage['/control.js'].lineData[461]++;
  return visit94_461_1(v || []);
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
  _$jscoverage['/control.js'].lineData[511]++;
  this.$el = el;
  _$jscoverage['/control.js'].lineData[512]++;
  this.el = el[0];
}}, 
  x: {}, 
  y: {}, 
  xy: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[39]++;
  _$jscoverage['/control.js'].lineData[557]++;
  var self = this, xy = S.makeArray(v);
  _$jscoverage['/control.js'].lineData[559]++;
  if (visit95_559_1(xy.length)) {
    _$jscoverage['/control.js'].lineData[560]++;
    visit96_560_1(xy[0] && self.set("x", xy[0]));
    _$jscoverage['/control.js'].lineData[561]++;
    visit97_561_1(xy[1] && self.set("y", xy[1]));
  }
  _$jscoverage['/control.js'].lineData[563]++;
  return v;
}, 
  getter: function() {
  _$jscoverage['/control.js'].functionData[40]++;
  _$jscoverage['/control.js'].lineData[566]++;
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
  _$jscoverage['/control.js'].lineData[633]++;
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
  value: visit98_754_1(S.config('component/prefixCls') || 'ks-')}, 
  prefixXClass: {}, 
  parent: {
  setter: function(p, prev) {
  _$jscoverage['/control.js'].functionData[42]++;
  _$jscoverage['/control.js'].lineData[782]++;
  if (visit99_782_1(prev = this.get('parent'))) {
    _$jscoverage['/control.js'].lineData[783]++;
    this.removeTarget(prev);
  }
  _$jscoverage['/control.js'].lineData[785]++;
  if (visit100_785_1(p)) {
    _$jscoverage['/control.js'].lineData[786]++;
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
  _$jscoverage['/control.js'].lineData[822]++;
  this.view = v;
}}}});
  _$jscoverage['/control.js'].lineData[828]++;
  function getDefaultRender() {
    _$jscoverage['/control.js'].functionData[44]++;
    _$jscoverage['/control.js'].lineData[829]++;
    var attrs, constructor = this;
    _$jscoverage['/control.js'].lineData[831]++;
    do {
      _$jscoverage['/control.js'].lineData[832]++;
      attrs = constructor.ATTRS;
      _$jscoverage['/control.js'].lineData[833]++;
      constructor = constructor.superclass;
    } while (visit101_834_1(!attrs || !attrs.xrender));
    _$jscoverage['/control.js'].lineData[835]++;
    return attrs.xrender.value;
  }
  _$jscoverage['/control.js'].lineData[838]++;
  Control.getDefaultRender = getDefaultRender;
  _$jscoverage['/control.js'].lineData[840]++;
  Control.extend = function extend(extensions, px, sx) {
  _$jscoverage['/control.js'].functionData[45]++;
  _$jscoverage['/control.js'].lineData[841]++;
  var args = S.makeArray(arguments), baseClass = this, xclass, newClass, argsLen = args.length, last = args[argsLen - 1];
  _$jscoverage['/control.js'].lineData[848]++;
  if (visit102_848_1(xclass = last.xclass)) {
    _$jscoverage['/control.js'].lineData[849]++;
    last.name = xclass;
  }
  _$jscoverage['/control.js'].lineData[852]++;
  newClass = ComponentProcess.extend.apply(baseClass, args);
  _$jscoverage['/control.js'].lineData[854]++;
  if (visit103_854_1(xclass)) {
    _$jscoverage['/control.js'].lineData[855]++;
    Manager.setConstructorByXClass(xclass, newClass);
  }
  _$jscoverage['/control.js'].lineData[858]++;
  newClass.extend = extend;
  _$jscoverage['/control.js'].lineData[859]++;
  newClass.getDefaultRender = getDefaultRender;
  _$jscoverage['/control.js'].lineData[861]++;
  return newClass;
};
  _$jscoverage['/control.js'].lineData[864]++;
  return Control;
}, {
  requires: ['node', './control/process', 'component/manager', './control/render']});
