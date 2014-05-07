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
if (! _$jscoverage['/base.js']) {
  _$jscoverage['/base.js'] = {};
  _$jscoverage['/base.js'].lineData = [];
  _$jscoverage['/base.js'].lineData[6] = 0;
  _$jscoverage['/base.js'].lineData[7] = 0;
  _$jscoverage['/base.js'].lineData[9] = 0;
  _$jscoverage['/base.js'].lineData[13] = 0;
  _$jscoverage['/base.js'].lineData[14] = 0;
  _$jscoverage['/base.js'].lineData[15] = 0;
  _$jscoverage['/base.js'].lineData[16] = 0;
  _$jscoverage['/base.js'].lineData[17] = 0;
  _$jscoverage['/base.js'].lineData[18] = 0;
  _$jscoverage['/base.js'].lineData[19] = 0;
  _$jscoverage['/base.js'].lineData[22] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[27] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[31] = 0;
  _$jscoverage['/base.js'].lineData[32] = 0;
  _$jscoverage['/base.js'].lineData[34] = 0;
  _$jscoverage['/base.js'].lineData[35] = 0;
  _$jscoverage['/base.js'].lineData[53] = 0;
  _$jscoverage['/base.js'].lineData[55] = 0;
  _$jscoverage['/base.js'].lineData[56] = 0;
  _$jscoverage['/base.js'].lineData[58] = 0;
  _$jscoverage['/base.js'].lineData[59] = 0;
  _$jscoverage['/base.js'].lineData[60] = 0;
  _$jscoverage['/base.js'].lineData[61] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[67] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[70] = 0;
  _$jscoverage['/base.js'].lineData[72] = 0;
  _$jscoverage['/base.js'].lineData[86] = 0;
  _$jscoverage['/base.js'].lineData[90] = 0;
  _$jscoverage['/base.js'].lineData[91] = 0;
  _$jscoverage['/base.js'].lineData[92] = 0;
  _$jscoverage['/base.js'].lineData[94] = 0;
  _$jscoverage['/base.js'].lineData[104] = 0;
  _$jscoverage['/base.js'].lineData[110] = 0;
  _$jscoverage['/base.js'].lineData[111] = 0;
  _$jscoverage['/base.js'].lineData[112] = 0;
  _$jscoverage['/base.js'].lineData[115] = 0;
  _$jscoverage['/base.js'].lineData[118] = 0;
  _$jscoverage['/base.js'].lineData[119] = 0;
  _$jscoverage['/base.js'].lineData[120] = 0;
  _$jscoverage['/base.js'].lineData[121] = 0;
  _$jscoverage['/base.js'].lineData[122] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[126] = 0;
  _$jscoverage['/base.js'].lineData[131] = 0;
  _$jscoverage['/base.js'].lineData[144] = 0;
  _$jscoverage['/base.js'].lineData[145] = 0;
  _$jscoverage['/base.js'].lineData[146] = 0;
  _$jscoverage['/base.js'].lineData[147] = 0;
  _$jscoverage['/base.js'].lineData[151] = 0;
  _$jscoverage['/base.js'].lineData[153] = 0;
  _$jscoverage['/base.js'].lineData[155] = 0;
  _$jscoverage['/base.js'].lineData[156] = 0;
  _$jscoverage['/base.js'].lineData[166] = 0;
  _$jscoverage['/base.js'].lineData[170] = 0;
  _$jscoverage['/base.js'].lineData[171] = 0;
  _$jscoverage['/base.js'].lineData[172] = 0;
  _$jscoverage['/base.js'].lineData[173] = 0;
  _$jscoverage['/base.js'].lineData[175] = 0;
  _$jscoverage['/base.js'].lineData[176] = 0;
  _$jscoverage['/base.js'].lineData[177] = 0;
  _$jscoverage['/base.js'].lineData[178] = 0;
  _$jscoverage['/base.js'].lineData[181] = 0;
  _$jscoverage['/base.js'].lineData[182] = 0;
  _$jscoverage['/base.js'].lineData[183] = 0;
  _$jscoverage['/base.js'].lineData[188] = 0;
  _$jscoverage['/base.js'].lineData[189] = 0;
  _$jscoverage['/base.js'].lineData[193] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[203] = 0;
  _$jscoverage['/base.js'].lineData[204] = 0;
  _$jscoverage['/base.js'].lineData[206] = 0;
  _$jscoverage['/base.js'].lineData[207] = 0;
  _$jscoverage['/base.js'].lineData[208] = 0;
  _$jscoverage['/base.js'].lineData[209] = 0;
  _$jscoverage['/base.js'].lineData[211] = 0;
  _$jscoverage['/base.js'].lineData[213] = 0;
  _$jscoverage['/base.js'].lineData[219] = 0;
  _$jscoverage['/base.js'].lineData[221] = 0;
  _$jscoverage['/base.js'].lineData[222] = 0;
  _$jscoverage['/base.js'].lineData[223] = 0;
  _$jscoverage['/base.js'].lineData[224] = 0;
  _$jscoverage['/base.js'].lineData[225] = 0;
  _$jscoverage['/base.js'].lineData[226] = 0;
  _$jscoverage['/base.js'].lineData[231] = 0;
  _$jscoverage['/base.js'].lineData[247] = 0;
  _$jscoverage['/base.js'].lineData[304] = 0;
  _$jscoverage['/base.js'].lineData[305] = 0;
  _$jscoverage['/base.js'].lineData[306] = 0;
  _$jscoverage['/base.js'].lineData[307] = 0;
  _$jscoverage['/base.js'].lineData[309] = 0;
  _$jscoverage['/base.js'].lineData[310] = 0;
  _$jscoverage['/base.js'].lineData[312] = 0;
  _$jscoverage['/base.js'].lineData[314] = 0;
  _$jscoverage['/base.js'].lineData[315] = 0;
  _$jscoverage['/base.js'].lineData[319] = 0;
  _$jscoverage['/base.js'].lineData[320] = 0;
  _$jscoverage['/base.js'].lineData[330] = 0;
  _$jscoverage['/base.js'].lineData[331] = 0;
  _$jscoverage['/base.js'].lineData[332] = 0;
  _$jscoverage['/base.js'].lineData[335] = 0;
  _$jscoverage['/base.js'].lineData[337] = 0;
  _$jscoverage['/base.js'].lineData[339] = 0;
  _$jscoverage['/base.js'].lineData[340] = 0;
  _$jscoverage['/base.js'].lineData[345] = 0;
  _$jscoverage['/base.js'].lineData[346] = 0;
  _$jscoverage['/base.js'].lineData[347] = 0;
  _$jscoverage['/base.js'].lineData[349] = 0;
  _$jscoverage['/base.js'].lineData[350] = 0;
  _$jscoverage['/base.js'].lineData[351] = 0;
  _$jscoverage['/base.js'].lineData[355] = 0;
  _$jscoverage['/base.js'].lineData[357] = 0;
  _$jscoverage['/base.js'].lineData[358] = 0;
  _$jscoverage['/base.js'].lineData[359] = 0;
  _$jscoverage['/base.js'].lineData[362] = 0;
  _$jscoverage['/base.js'].lineData[364] = 0;
  _$jscoverage['/base.js'].lineData[366] = 0;
  _$jscoverage['/base.js'].lineData[367] = 0;
  _$jscoverage['/base.js'].lineData[369] = 0;
  _$jscoverage['/base.js'].lineData[372] = 0;
  _$jscoverage['/base.js'].lineData[399] = 0;
  _$jscoverage['/base.js'].lineData[400] = 0;
  _$jscoverage['/base.js'].lineData[403] = 0;
  _$jscoverage['/base.js'].lineData[404] = 0;
  _$jscoverage['/base.js'].lineData[405] = 0;
  _$jscoverage['/base.js'].lineData[409] = 0;
  _$jscoverage['/base.js'].lineData[410] = 0;
  _$jscoverage['/base.js'].lineData[411] = 0;
  _$jscoverage['/base.js'].lineData[412] = 0;
  _$jscoverage['/base.js'].lineData[413] = 0;
  _$jscoverage['/base.js'].lineData[414] = 0;
  _$jscoverage['/base.js'].lineData[419] = 0;
  _$jscoverage['/base.js'].lineData[420] = 0;
  _$jscoverage['/base.js'].lineData[423] = 0;
  _$jscoverage['/base.js'].lineData[424] = 0;
  _$jscoverage['/base.js'].lineData[425] = 0;
  _$jscoverage['/base.js'].lineData[426] = 0;
  _$jscoverage['/base.js'].lineData[427] = 0;
  _$jscoverage['/base.js'].lineData[428] = 0;
  _$jscoverage['/base.js'].lineData[429] = 0;
  _$jscoverage['/base.js'].lineData[435] = 0;
  _$jscoverage['/base.js'].lineData[436] = 0;
  _$jscoverage['/base.js'].lineData[437] = 0;
  _$jscoverage['/base.js'].lineData[438] = 0;
  _$jscoverage['/base.js'].lineData[439] = 0;
  _$jscoverage['/base.js'].lineData[444] = 0;
  _$jscoverage['/base.js'].lineData[445] = 0;
  _$jscoverage['/base.js'].lineData[451] = 0;
  _$jscoverage['/base.js'].lineData[453] = 0;
}
if (! _$jscoverage['/base.js'].functionData) {
  _$jscoverage['/base.js'].functionData = [];
  _$jscoverage['/base.js'].functionData[0] = 0;
  _$jscoverage['/base.js'].functionData[1] = 0;
  _$jscoverage['/base.js'].functionData[2] = 0;
  _$jscoverage['/base.js'].functionData[3] = 0;
  _$jscoverage['/base.js'].functionData[4] = 0;
  _$jscoverage['/base.js'].functionData[5] = 0;
  _$jscoverage['/base.js'].functionData[6] = 0;
  _$jscoverage['/base.js'].functionData[7] = 0;
  _$jscoverage['/base.js'].functionData[8] = 0;
  _$jscoverage['/base.js'].functionData[9] = 0;
  _$jscoverage['/base.js'].functionData[10] = 0;
  _$jscoverage['/base.js'].functionData[11] = 0;
  _$jscoverage['/base.js'].functionData[12] = 0;
  _$jscoverage['/base.js'].functionData[13] = 0;
  _$jscoverage['/base.js'].functionData[14] = 0;
  _$jscoverage['/base.js'].functionData[15] = 0;
  _$jscoverage['/base.js'].functionData[16] = 0;
  _$jscoverage['/base.js'].functionData[17] = 0;
  _$jscoverage['/base.js'].functionData[18] = 0;
  _$jscoverage['/base.js'].functionData[19] = 0;
  _$jscoverage['/base.js'].functionData[20] = 0;
  _$jscoverage['/base.js'].functionData[21] = 0;
  _$jscoverage['/base.js'].functionData[22] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['17'] = [];
  _$jscoverage['/base.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['18'] = [];
  _$jscoverage['/base.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['26'] = [];
  _$jscoverage['/base.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['27'] = [];
  _$jscoverage['/base.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['31'] = [];
  _$jscoverage['/base.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['34'] = [];
  _$jscoverage['/base.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['59'] = [];
  _$jscoverage['/base.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['92'] = [];
  _$jscoverage['/base.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['112'] = [];
  _$jscoverage['/base.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['118'] = [];
  _$jscoverage['/base.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['119'] = [];
  _$jscoverage['/base.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['121'] = [];
  _$jscoverage['/base.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['126'] = [];
  _$jscoverage['/base.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['129'] = [];
  _$jscoverage['/base.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['129'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['130'] = [];
  _$jscoverage['/base.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['145'] = [];
  _$jscoverage['/base.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['151'] = [];
  _$jscoverage['/base.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['168'] = [];
  _$jscoverage['/base.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['172'] = [];
  _$jscoverage['/base.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['173'] = [];
  _$jscoverage['/base.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['175'] = [];
  _$jscoverage['/base.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['175'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['176'] = [];
  _$jscoverage['/base.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['181'] = [];
  _$jscoverage['/base.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['188'] = [];
  _$jscoverage['/base.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['206'] = [];
  _$jscoverage['/base.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['206'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['207'] = [];
  _$jscoverage['/base.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['221'] = [];
  _$jscoverage['/base.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['304'] = [];
  _$jscoverage['/base.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['314'] = [];
  _$jscoverage['/base.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['320'] = [];
  _$jscoverage['/base.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['331'] = [];
  _$jscoverage['/base.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['339'] = [];
  _$jscoverage['/base.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['349'] = [];
  _$jscoverage['/base.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['349'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['362'] = [];
  _$jscoverage['/base.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['366'] = [];
  _$jscoverage['/base.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['369'] = [];
  _$jscoverage['/base.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['403'] = [];
  _$jscoverage['/base.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['412'] = [];
  _$jscoverage['/base.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['423'] = [];
  _$jscoverage['/base.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['426'] = [];
  _$jscoverage['/base.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['428'] = [];
  _$jscoverage['/base.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['437'] = [];
  _$jscoverage['/base.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['438'] = [];
  _$jscoverage['/base.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['439'] = [];
  _$jscoverage['/base.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['444'] = [];
  _$jscoverage['/base.js'].branchData['444'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['445'] = [];
  _$jscoverage['/base.js'].branchData['445'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['445'][1].init(37, 10, 'args || []');
function visit50_445_1(result) {
  _$jscoverage['/base.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['444'][1].init(220, 2, 'fn');
function visit49_444_1(result) {
  _$jscoverage['/base.js'].branchData['444'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['439'][1].init(27, 170, 'extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method])');
function visit48_439_1(result) {
  _$jscoverage['/base.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['438'][1].init(30, 7, 'i < len');
function visit47_438_1(result) {
  _$jscoverage['/base.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['437'][1].init(39, 31, 'extensions && extensions.length');
function visit46_437_1(result) {
  _$jscoverage['/base.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['428'][1].init(64, 2, 'fn');
function visit45_428_1(result) {
  _$jscoverage['/base.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['426'][1].init(30, 7, 'i < len');
function visit44_426_1(result) {
  _$jscoverage['/base.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['423'][1].init(109, 10, 'args || []');
function visit43_423_1(result) {
  _$jscoverage['/base.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['412'][1].init(18, 28, 'typeof plugin === \'function\'');
function visit42_412_1(result) {
  _$jscoverage['/base.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['403'][1].init(89, 17, 'e.target === self');
function visit41_403_1(result) {
  _$jscoverage['/base.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['369'][1].init(212, 13, 'px[h] || noop');
function visit40_369_1(result) {
  _$jscoverage['/base.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['366'][1].init(85, 48, 'proto.hasOwnProperty(h) && !px.hasOwnProperty(h)');
function visit39_366_1(result) {
  _$jscoverage['/base.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['362'][1].init(161, 26, 'extensions.length && hooks');
function visit38_362_1(result) {
  _$jscoverage['/base.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['349'][2].init(2011, 15, 'sx && sx.extend');
function visit37_349_2(result) {
  _$jscoverage['/base.js'].branchData['349'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['349'][1].init(2011, 25, 'sx && sx.extend || extend');
function visit36_349_1(result) {
  _$jscoverage['/base.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['339'][1].init(96, 21, 'exp.hasOwnProperty(p)');
function visit35_339_1(result) {
  _$jscoverage['/base.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['331'][1].init(53, 17, 'attrs[name] || {}');
function visit34_331_1(result) {
  _$jscoverage['/base.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['320'][1].init(26, 3, 'ext');
function visit33_320_1(result) {
  _$jscoverage['/base.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['314'][1].init(436, 17, 'extensions.length');
function visit32_314_1(result) {
  _$jscoverage['/base.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['304'][1].init(18, 22, '!S.isArray(extensions)');
function visit31_304_1(result) {
  _$jscoverage['/base.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['221'][1].init(96, 22, '!self.get(\'destroyed\')');
function visit30_221_1(result) {
  _$jscoverage['/base.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['207'][1].init(144, 15, 'pluginId === id');
function visit29_207_1(result) {
  _$jscoverage['/base.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['206'][2].init(81, 26, 'p.get && p.get(\'pluginId\')');
function visit28_206_2(result) {
  _$jscoverage['/base.js'].branchData['206'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['206'][1].init(81, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit27_206_1(result) {
  _$jscoverage['/base.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['188'][1].init(660, 5, '!keep');
function visit26_188_1(result) {
  _$jscoverage['/base.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['181'][1].init(30, 12, 'p !== plugin');
function visit25_181_1(result) {
  _$jscoverage['/base.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['176'][1].init(164, 19, 'pluginId !== plugin');
function visit24_176_1(result) {
  _$jscoverage['/base.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['175'][2].init(93, 26, 'p.get && p.get(\'pluginId\')');
function visit23_175_2(result) {
  _$jscoverage['/base.js'].branchData['175'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['175'][1].init(93, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit22_175_1(result) {
  _$jscoverage['/base.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['173'][1].init(26, 8, 'isString');
function visit21_173_1(result) {
  _$jscoverage['/base.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['172'][1].init(63, 6, 'plugin');
function visit20_172_1(result) {
  _$jscoverage['/base.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['168'][1].init(75, 26, 'typeof plugin === \'string\'');
function visit19_168_1(result) {
  _$jscoverage['/base.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['151'][1].init(273, 24, 'plugin.pluginInitializer');
function visit18_151_1(result) {
  _$jscoverage['/base.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['145'][1].init(48, 28, 'typeof plugin === \'function\'');
function visit17_145_1(result) {
  _$jscoverage['/base.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['130'][1].init(64, 55, '(attributeValue = self.get(attributeName)) !== undefined');
function visit16_130_1(result) {
  _$jscoverage['/base.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['129'][2].init(435, 31, 'attrs[attributeName].sync !== 0');
function visit15_129_2(result) {
  _$jscoverage['/base.js'].branchData['129'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['129'][1].init(177, 120, 'attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit14_129_1(result) {
  _$jscoverage['/base.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['126'][1].init(255, 298, '(onSetMethod = self[onSetMethodName]) && attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit13_126_1(result) {
  _$jscoverage['/base.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['121'][1].init(26, 22, 'attributeName in attrs');
function visit12_121_1(result) {
  _$jscoverage['/base.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['119'][1].init(30, 17, 'cs[i].ATTRS || {}');
function visit11_119_1(result) {
  _$jscoverage['/base.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['118'][1].init(394, 13, 'i < cs.length');
function visit10_118_1(result) {
  _$jscoverage['/base.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['112'][1].init(51, 40, 'c.superclass && c.superclass.constructor');
function visit9_112_1(result) {
  _$jscoverage['/base.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['92'][1].init(67, 7, 'self[m]');
function visit8_92_1(result) {
  _$jscoverage['/base.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['59'][1].init(184, 9, 'listeners');
function visit7_59_1(result) {
  _$jscoverage['/base.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['34'][1].init(26, 15, 'origFn !== noop');
function visit6_34_1(result) {
  _$jscoverage['/base.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['31'][1].init(657, 7, 'reverse');
function visit5_31_1(result) {
  _$jscoverage['/base.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['27'][1].init(487, 7, 'reverse');
function visit4_27_1(result) {
  _$jscoverage['/base.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['26'][1].init(417, 47, 'arguments.callee.__owner__.__extensions__ || []');
function visit3_26_1(result) {
  _$jscoverage['/base.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['18'][1].init(26, 15, 'origFn !== noop');
function visit2_18_1(result) {
  _$jscoverage['/base.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['17'][1].init(56, 7, 'reverse');
function visit1_17_1(result) {
  _$jscoverage['/base.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var Attribute = require('attribute');
  _$jscoverage['/base.js'].lineData[9]++;
  var ucfirst = S.ucfirst, ON_SET = '_onSet', noop = S.noop;
  _$jscoverage['/base.js'].lineData[13]++;
  function __getHook(method, reverse) {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[14]++;
    return function(origFn) {
  _$jscoverage['/base.js'].functionData[2]++;
  _$jscoverage['/base.js'].lineData[15]++;
  return function wrap() {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[16]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[17]++;
  if (visit1_17_1(reverse)) {
    _$jscoverage['/base.js'].lineData[18]++;
    if (visit2_18_1(origFn !== noop)) {
      _$jscoverage['/base.js'].lineData[19]++;
      origFn.apply(self, arguments);
    }
  } else {
    _$jscoverage['/base.js'].lineData[22]++;
    self.callSuper.apply(self, arguments);
  }
  _$jscoverage['/base.js'].lineData[26]++;
  var extensions = visit3_26_1(arguments.callee.__owner__.__extensions__ || []);
  _$jscoverage['/base.js'].lineData[27]++;
  if (visit4_27_1(reverse)) {
    _$jscoverage['/base.js'].lineData[28]++;
    extensions.reverse();
  }
  _$jscoverage['/base.js'].lineData[30]++;
  callExtensionsMethod(self, extensions, method, arguments);
  _$jscoverage['/base.js'].lineData[31]++;
  if (visit5_31_1(reverse)) {
    _$jscoverage['/base.js'].lineData[32]++;
    self.callSuper.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[34]++;
    if (visit6_34_1(origFn !== noop)) {
      _$jscoverage['/base.js'].lineData[35]++;
      origFn.apply(self, arguments);
    }
  }
};
};
  }
  _$jscoverage['/base.js'].lineData[53]++;
  var Base = Attribute.extend({
  constructor: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[55]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[56]++;
  self.callSuper.apply(self, arguments);
  _$jscoverage['/base.js'].lineData[58]++;
  var listeners = self.get('listeners');
  _$jscoverage['/base.js'].lineData[59]++;
  if (visit7_59_1(listeners)) {
    _$jscoverage['/base.js'].lineData[60]++;
    for (var n in listeners) {
      _$jscoverage['/base.js'].lineData[61]++;
      self.on(n, listeners[n]);
    }
  }
  _$jscoverage['/base.js'].lineData[65]++;
  self.initializer();
  _$jscoverage['/base.js'].lineData[67]++;
  constructPlugins(self);
  _$jscoverage['/base.js'].lineData[68]++;
  callPluginsMethod.call(self, 'pluginInitializer');
  _$jscoverage['/base.js'].lineData[70]++;
  self.bindInternal();
  _$jscoverage['/base.js'].lineData[72]++;
  self.syncInternal();
}, 
  initializer: noop, 
  __getHook: __getHook, 
  __callPluginsMethod: callPluginsMethod, 
  bindInternal: function() {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[86]++;
  var self = this, attrs = self.getAttrs(), attr, m;
  _$jscoverage['/base.js'].lineData[90]++;
  for (attr in attrs) {
    _$jscoverage['/base.js'].lineData[91]++;
    m = ON_SET + ucfirst(attr);
    _$jscoverage['/base.js'].lineData[92]++;
    if (visit8_92_1(self[m])) {
      _$jscoverage['/base.js'].lineData[94]++;
      self.on('after' + ucfirst(attr) + 'Change', onSetAttrChange);
    }
  }
}, 
  syncInternal: function() {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[104]++;
  var self = this, cs = [], i, c = self.constructor, attrs = self.getAttrs();
  _$jscoverage['/base.js'].lineData[110]++;
  while (c) {
    _$jscoverage['/base.js'].lineData[111]++;
    cs.push(c);
    _$jscoverage['/base.js'].lineData[112]++;
    c = visit9_112_1(c.superclass && c.superclass.constructor);
  }
  _$jscoverage['/base.js'].lineData[115]++;
  cs.reverse();
  _$jscoverage['/base.js'].lineData[118]++;
  for (i = 0; visit10_118_1(i < cs.length); i++) {
    _$jscoverage['/base.js'].lineData[119]++;
    var ATTRS = visit11_119_1(cs[i].ATTRS || {});
    _$jscoverage['/base.js'].lineData[120]++;
    for (var attributeName in ATTRS) {
      _$jscoverage['/base.js'].lineData[121]++;
      if (visit12_121_1(attributeName in attrs)) {
        _$jscoverage['/base.js'].lineData[122]++;
        var attributeValue, onSetMethod;
        _$jscoverage['/base.js'].lineData[124]++;
        var onSetMethodName = ON_SET + ucfirst(attributeName);
        _$jscoverage['/base.js'].lineData[126]++;
        if (visit13_126_1((onSetMethod = self[onSetMethodName]) && visit14_129_1(visit15_129_2(attrs[attributeName].sync !== 0) && visit16_130_1((attributeValue = self.get(attributeName)) !== undefined)))) {
          _$jscoverage['/base.js'].lineData[131]++;
          onSetMethod.call(self, attributeValue);
        }
      }
    }
  }
}, 
  plug: function(plugin) {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[144]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[145]++;
  if (visit17_145_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[146]++;
    var Plugin = plugin;
    _$jscoverage['/base.js'].lineData[147]++;
    plugin = new Plugin();
  }
  _$jscoverage['/base.js'].lineData[151]++;
  if (visit18_151_1(plugin.pluginInitializer)) {
    _$jscoverage['/base.js'].lineData[153]++;
    plugin.pluginInitializer(self);
  }
  _$jscoverage['/base.js'].lineData[155]++;
  self.get('plugins').push(plugin);
  _$jscoverage['/base.js'].lineData[156]++;
  return self;
}, 
  unplug: function(plugin) {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[166]++;
  var plugins = [], self = this, isString = visit19_168_1(typeof plugin === 'string');
  _$jscoverage['/base.js'].lineData[170]++;
  S.each(self.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[171]++;
  var keep = 0, pluginId;
  _$jscoverage['/base.js'].lineData[172]++;
  if (visit20_172_1(plugin)) {
    _$jscoverage['/base.js'].lineData[173]++;
    if (visit21_173_1(isString)) {
      _$jscoverage['/base.js'].lineData[175]++;
      pluginId = visit22_175_1(visit23_175_2(p.get && p.get('pluginId')) || p.pluginId);
      _$jscoverage['/base.js'].lineData[176]++;
      if (visit24_176_1(pluginId !== plugin)) {
        _$jscoverage['/base.js'].lineData[177]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[178]++;
        keep = 1;
      }
    } else {
      _$jscoverage['/base.js'].lineData[181]++;
      if (visit25_181_1(p !== plugin)) {
        _$jscoverage['/base.js'].lineData[182]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[183]++;
        keep = 1;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[188]++;
  if (visit26_188_1(!keep)) {
    _$jscoverage['/base.js'].lineData[189]++;
    p.pluginDestructor(self);
  }
});
  _$jscoverage['/base.js'].lineData[193]++;
  self.setInternal('plugins', plugins);
  _$jscoverage['/base.js'].lineData[194]++;
  return self;
}, 
  getPlugin: function(id) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[203]++;
  var plugin = null;
  _$jscoverage['/base.js'].lineData[204]++;
  S.each(this.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[206]++;
  var pluginId = visit27_206_1(visit28_206_2(p.get && p.get('pluginId')) || p.pluginId);
  _$jscoverage['/base.js'].lineData[207]++;
  if (visit29_207_1(pluginId === id)) {
    _$jscoverage['/base.js'].lineData[208]++;
    plugin = p;
    _$jscoverage['/base.js'].lineData[209]++;
    return false;
  }
  _$jscoverage['/base.js'].lineData[211]++;
  return undefined;
});
  _$jscoverage['/base.js'].lineData[213]++;
  return plugin;
}, 
  destructor: noop, 
  destroy: function() {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[219]++;
  var self = this, args = S.makeArray(arguments);
  _$jscoverage['/base.js'].lineData[221]++;
  if (visit30_221_1(!self.get('destroyed'))) {
    _$jscoverage['/base.js'].lineData[222]++;
    callPluginsMethod.call(self, 'pluginDestructor', args);
    _$jscoverage['/base.js'].lineData[223]++;
    self.destructor.apply(self, args);
    _$jscoverage['/base.js'].lineData[224]++;
    self.set('destroyed', true);
    _$jscoverage['/base.js'].lineData[225]++;
    self.fire('destroy');
    _$jscoverage['/base.js'].lineData[226]++;
    self.detach();
  }
}});
  _$jscoverage['/base.js'].lineData[231]++;
  S.mix(Base, {
  __hooks__: {
  initializer: __getHook(), 
  destructor: __getHook('__destructor', true)}, 
  ATTRS: {
  plugins: {
  valueFn: function() {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[247]++;
  return [];
}}, 
  destroyed: {
  value: false}, 
  listeners: {}}, 
  extend: function extend(extensions, px, sx) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[304]++;
  if (visit31_304_1(!S.isArray(extensions))) {
    _$jscoverage['/base.js'].lineData[305]++;
    sx = px;
    _$jscoverage['/base.js'].lineData[306]++;
    px = extensions;
    _$jscoverage['/base.js'].lineData[307]++;
    extensions = [];
  }
  _$jscoverage['/base.js'].lineData[309]++;
  var SubClass = Attribute.extend.call(this, px, sx);
  _$jscoverage['/base.js'].lineData[310]++;
  SubClass.__extensions__ = extensions;
  _$jscoverage['/base.js'].lineData[312]++;
  baseAddMembers.call(SubClass, {});
  _$jscoverage['/base.js'].lineData[314]++;
  if (visit32_314_1(extensions.length)) {
    _$jscoverage['/base.js'].lineData[315]++;
    var attrs = {}, prototype = {};
    _$jscoverage['/base.js'].lineData[319]++;
    S.each(extensions.concat(SubClass), function(ext) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[320]++;
  if (visit33_320_1(ext)) {
    _$jscoverage['/base.js'].lineData[330]++;
    S.each(ext.ATTRS, function(v, name) {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[331]++;
  var av = attrs[name] = visit34_331_1(attrs[name] || {});
  _$jscoverage['/base.js'].lineData[332]++;
  S.mix(av, v);
});
    _$jscoverage['/base.js'].lineData[335]++;
    var exp = ext.prototype, p;
    _$jscoverage['/base.js'].lineData[337]++;
    for (p in exp) {
      _$jscoverage['/base.js'].lineData[339]++;
      if (visit35_339_1(exp.hasOwnProperty(p))) {
        _$jscoverage['/base.js'].lineData[340]++;
        prototype[p] = exp[p];
      }
    }
  }
});
    _$jscoverage['/base.js'].lineData[345]++;
    SubClass.ATTRS = attrs;
    _$jscoverage['/base.js'].lineData[346]++;
    prototype.constructor = SubClass;
    _$jscoverage['/base.js'].lineData[347]++;
    S.augment(SubClass, prototype);
  }
  _$jscoverage['/base.js'].lineData[349]++;
  SubClass.extend = visit36_349_1(visit37_349_2(sx && sx.extend) || extend);
  _$jscoverage['/base.js'].lineData[350]++;
  SubClass.addMembers = baseAddMembers;
  _$jscoverage['/base.js'].lineData[351]++;
  return SubClass;
}});
  _$jscoverage['/base.js'].lineData[355]++;
  var addMembers = Base.addMembers;
  _$jscoverage['/base.js'].lineData[357]++;
  function baseAddMembers(px) {
    _$jscoverage['/base.js'].functionData[17]++;
    _$jscoverage['/base.js'].lineData[358]++;
    var self = this;
    _$jscoverage['/base.js'].lineData[359]++;
    var extensions = self.__extensions__, hooks = self.__hooks__, proto = self.prototype;
    _$jscoverage['/base.js'].lineData[362]++;
    if (visit38_362_1(extensions.length && hooks)) {
      _$jscoverage['/base.js'].lineData[364]++;
      for (var h in hooks) {
        _$jscoverage['/base.js'].lineData[366]++;
        if (visit39_366_1(proto.hasOwnProperty(h) && !px.hasOwnProperty(h))) {
          _$jscoverage['/base.js'].lineData[367]++;
          continue;
        }
        _$jscoverage['/base.js'].lineData[369]++;
        px[h] = visit40_369_1(px[h] || noop);
      }
    }
    _$jscoverage['/base.js'].lineData[372]++;
    return addMembers.call(self, px);
  }
  _$jscoverage['/base.js'].lineData[399]++;
  function onSetAttrChange(e) {
    _$jscoverage['/base.js'].functionData[18]++;
    _$jscoverage['/base.js'].lineData[400]++;
    var self = this, method;
    _$jscoverage['/base.js'].lineData[403]++;
    if (visit41_403_1(e.target === self)) {
      _$jscoverage['/base.js'].lineData[404]++;
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      _$jscoverage['/base.js'].lineData[405]++;
      method.call(self, e.newVal, e);
    }
  }
  _$jscoverage['/base.js'].lineData[409]++;
  function constructPlugins(self) {
    _$jscoverage['/base.js'].functionData[19]++;
    _$jscoverage['/base.js'].lineData[410]++;
    var plugins = self.get('plugins'), Plugin;
    _$jscoverage['/base.js'].lineData[411]++;
    S.each(plugins, function(plugin, i) {
  _$jscoverage['/base.js'].functionData[20]++;
  _$jscoverage['/base.js'].lineData[412]++;
  if (visit42_412_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[413]++;
    Plugin = plugin;
    _$jscoverage['/base.js'].lineData[414]++;
    plugins[i] = new Plugin();
  }
});
  }
  _$jscoverage['/base.js'].lineData[419]++;
  function callPluginsMethod(method, args) {
    _$jscoverage['/base.js'].functionData[21]++;
    _$jscoverage['/base.js'].lineData[420]++;
    var len, fn, self = this, plugins = self.get('plugins');
    _$jscoverage['/base.js'].lineData[423]++;
    args = visit43_423_1(args || []);
    _$jscoverage['/base.js'].lineData[424]++;
    args = [self].concat(args);
    _$jscoverage['/base.js'].lineData[425]++;
    if ((len = plugins.length)) {
      _$jscoverage['/base.js'].lineData[426]++;
      for (var i = 0; visit44_426_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[427]++;
        fn = plugins[i][method];
        _$jscoverage['/base.js'].lineData[428]++;
        if (visit45_428_1(fn)) {
          _$jscoverage['/base.js'].lineData[429]++;
          fn.apply(plugins[i], args);
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[435]++;
  function callExtensionsMethod(self, extensions, method, args) {
    _$jscoverage['/base.js'].functionData[22]++;
    _$jscoverage['/base.js'].lineData[436]++;
    var len;
    _$jscoverage['/base.js'].lineData[437]++;
    if ((len = visit46_437_1(extensions && extensions.length))) {
      _$jscoverage['/base.js'].lineData[438]++;
      for (var i = 0; visit47_438_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[439]++;
        var fn = visit48_439_1(extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method]));
        _$jscoverage['/base.js'].lineData[444]++;
        if (visit49_444_1(fn)) {
          _$jscoverage['/base.js'].lineData[445]++;
          fn.apply(self, visit50_445_1(args || []));
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[451]++;
  S.Base = Base;
  _$jscoverage['/base.js'].lineData[453]++;
  return Base;
});
