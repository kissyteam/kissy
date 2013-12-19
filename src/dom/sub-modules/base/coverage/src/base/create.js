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
if (! _$jscoverage['/base/create.js']) {
  _$jscoverage['/base/create.js'] = {};
  _$jscoverage['/base/create.js'].lineData = [];
  _$jscoverage['/base/create.js'].lineData[6] = 0;
  _$jscoverage['/base/create.js'].lineData[7] = 0;
  _$jscoverage['/base/create.js'].lineData[8] = 0;
  _$jscoverage['/base/create.js'].lineData[9] = 0;
  _$jscoverage['/base/create.js'].lineData[28] = 0;
  _$jscoverage['/base/create.js'].lineData[29] = 0;
  _$jscoverage['/base/create.js'].lineData[32] = 0;
  _$jscoverage['/base/create.js'].lineData[33] = 0;
  _$jscoverage['/base/create.js'].lineData[36] = 0;
  _$jscoverage['/base/create.js'].lineData[37] = 0;
  _$jscoverage['/base/create.js'].lineData[39] = 0;
  _$jscoverage['/base/create.js'].lineData[42] = 0;
  _$jscoverage['/base/create.js'].lineData[43] = 0;
  _$jscoverage['/base/create.js'].lineData[45] = 0;
  _$jscoverage['/base/create.js'].lineData[46] = 0;
  _$jscoverage['/base/create.js'].lineData[49] = 0;
  _$jscoverage['/base/create.js'].lineData[50] = 0;
  _$jscoverage['/base/create.js'].lineData[52] = 0;
  _$jscoverage['/base/create.js'].lineData[53] = 0;
  _$jscoverage['/base/create.js'].lineData[59] = 0;
  _$jscoverage['/base/create.js'].lineData[60] = 0;
  _$jscoverage['/base/create.js'].lineData[64] = 0;
  _$jscoverage['/base/create.js'].lineData[65] = 0;
  _$jscoverage['/base/create.js'].lineData[70] = 0;
  _$jscoverage['/base/create.js'].lineData[72] = 0;
  _$jscoverage['/base/create.js'].lineData[73] = 0;
  _$jscoverage['/base/create.js'].lineData[75] = 0;
  _$jscoverage['/base/create.js'].lineData[77] = 0;
  _$jscoverage['/base/create.js'].lineData[82] = 0;
  _$jscoverage['/base/create.js'].lineData[100] = 0;
  _$jscoverage['/base/create.js'].lineData[102] = 0;
  _$jscoverage['/base/create.js'].lineData[103] = 0;
  _$jscoverage['/base/create.js'].lineData[106] = 0;
  _$jscoverage['/base/create.js'].lineData[107] = 0;
  _$jscoverage['/base/create.js'].lineData[110] = 0;
  _$jscoverage['/base/create.js'].lineData[111] = 0;
  _$jscoverage['/base/create.js'].lineData[114] = 0;
  _$jscoverage['/base/create.js'].lineData[115] = 0;
  _$jscoverage['/base/create.js'].lineData[118] = 0;
  _$jscoverage['/base/create.js'].lineData[119] = 0;
  _$jscoverage['/base/create.js'].lineData[122] = 0;
  _$jscoverage['/base/create.js'].lineData[131] = 0;
  _$jscoverage['/base/create.js'].lineData[132] = 0;
  _$jscoverage['/base/create.js'].lineData[133] = 0;
  _$jscoverage['/base/create.js'].lineData[135] = 0;
  _$jscoverage['/base/create.js'].lineData[139] = 0;
  _$jscoverage['/base/create.js'].lineData[141] = 0;
  _$jscoverage['/base/create.js'].lineData[142] = 0;
  _$jscoverage['/base/create.js'].lineData[145] = 0;
  _$jscoverage['/base/create.js'].lineData[147] = 0;
  _$jscoverage['/base/create.js'].lineData[149] = 0;
  _$jscoverage['/base/create.js'].lineData[152] = 0;
  _$jscoverage['/base/create.js'].lineData[154] = 0;
  _$jscoverage['/base/create.js'].lineData[157] = 0;
  _$jscoverage['/base/create.js'].lineData[159] = 0;
  _$jscoverage['/base/create.js'].lineData[161] = 0;
  _$jscoverage['/base/create.js'].lineData[162] = 0;
  _$jscoverage['/base/create.js'].lineData[164] = 0;
  _$jscoverage['/base/create.js'].lineData[166] = 0;
  _$jscoverage['/base/create.js'].lineData[170] = 0;
  _$jscoverage['/base/create.js'].lineData[175] = 0;
  _$jscoverage['/base/create.js'].lineData[176] = 0;
  _$jscoverage['/base/create.js'].lineData[177] = 0;
  _$jscoverage['/base/create.js'].lineData[197] = 0;
  _$jscoverage['/base/create.js'].lineData[202] = 0;
  _$jscoverage['/base/create.js'].lineData[203] = 0;
  _$jscoverage['/base/create.js'].lineData[206] = 0;
  _$jscoverage['/base/create.js'].lineData[208] = 0;
  _$jscoverage['/base/create.js'].lineData[209] = 0;
  _$jscoverage['/base/create.js'].lineData[210] = 0;
  _$jscoverage['/base/create.js'].lineData[211] = 0;
  _$jscoverage['/base/create.js'].lineData[212] = 0;
  _$jscoverage['/base/create.js'].lineData[213] = 0;
  _$jscoverage['/base/create.js'].lineData[215] = 0;
  _$jscoverage['/base/create.js'].lineData[218] = 0;
  _$jscoverage['/base/create.js'].lineData[222] = 0;
  _$jscoverage['/base/create.js'].lineData[225] = 0;
  _$jscoverage['/base/create.js'].lineData[226] = 0;
  _$jscoverage['/base/create.js'].lineData[227] = 0;
  _$jscoverage['/base/create.js'].lineData[228] = 0;
  _$jscoverage['/base/create.js'].lineData[229] = 0;
  _$jscoverage['/base/create.js'].lineData[230] = 0;
  _$jscoverage['/base/create.js'].lineData[233] = 0;
  _$jscoverage['/base/create.js'].lineData[241] = 0;
  _$jscoverage['/base/create.js'].lineData[242] = 0;
  _$jscoverage['/base/create.js'].lineData[243] = 0;
  _$jscoverage['/base/create.js'].lineData[244] = 0;
  _$jscoverage['/base/create.js'].lineData[247] = 0;
  _$jscoverage['/base/create.js'].lineData[259] = 0;
  _$jscoverage['/base/create.js'].lineData[265] = 0;
  _$jscoverage['/base/create.js'].lineData[266] = 0;
  _$jscoverage['/base/create.js'].lineData[269] = 0;
  _$jscoverage['/base/create.js'].lineData[270] = 0;
  _$jscoverage['/base/create.js'].lineData[271] = 0;
  _$jscoverage['/base/create.js'].lineData[273] = 0;
  _$jscoverage['/base/create.js'].lineData[274] = 0;
  _$jscoverage['/base/create.js'].lineData[275] = 0;
  _$jscoverage['/base/create.js'].lineData[278] = 0;
  _$jscoverage['/base/create.js'].lineData[279] = 0;
  _$jscoverage['/base/create.js'].lineData[280] = 0;
  _$jscoverage['/base/create.js'].lineData[281] = 0;
  _$jscoverage['/base/create.js'].lineData[282] = 0;
  _$jscoverage['/base/create.js'].lineData[283] = 0;
  _$jscoverage['/base/create.js'].lineData[284] = 0;
  _$jscoverage['/base/create.js'].lineData[288] = 0;
  _$jscoverage['/base/create.js'].lineData[289] = 0;
  _$jscoverage['/base/create.js'].lineData[290] = 0;
  _$jscoverage['/base/create.js'].lineData[293] = 0;
  _$jscoverage['/base/create.js'].lineData[302] = 0;
  _$jscoverage['/base/create.js'].lineData[307] = 0;
  _$jscoverage['/base/create.js'].lineData[308] = 0;
  _$jscoverage['/base/create.js'].lineData[309] = 0;
  _$jscoverage['/base/create.js'].lineData[310] = 0;
  _$jscoverage['/base/create.js'].lineData[311] = 0;
  _$jscoverage['/base/create.js'].lineData[312] = 0;
  _$jscoverage['/base/create.js'].lineData[313] = 0;
  _$jscoverage['/base/create.js'].lineData[314] = 0;
  _$jscoverage['/base/create.js'].lineData[322] = 0;
  _$jscoverage['/base/create.js'].lineData[346] = 0;
  _$jscoverage['/base/create.js'].lineData[347] = 0;
  _$jscoverage['/base/create.js'].lineData[348] = 0;
  _$jscoverage['/base/create.js'].lineData[349] = 0;
  _$jscoverage['/base/create.js'].lineData[352] = 0;
  _$jscoverage['/base/create.js'].lineData[357] = 0;
  _$jscoverage['/base/create.js'].lineData[358] = 0;
  _$jscoverage['/base/create.js'].lineData[361] = 0;
  _$jscoverage['/base/create.js'].lineData[367] = 0;
  _$jscoverage['/base/create.js'].lineData[371] = 0;
  _$jscoverage['/base/create.js'].lineData[378] = 0;
  _$jscoverage['/base/create.js'].lineData[379] = 0;
  _$jscoverage['/base/create.js'].lineData[382] = 0;
  _$jscoverage['/base/create.js'].lineData[383] = 0;
  _$jscoverage['/base/create.js'].lineData[387] = 0;
  _$jscoverage['/base/create.js'].lineData[388] = 0;
  _$jscoverage['/base/create.js'].lineData[389] = 0;
  _$jscoverage['/base/create.js'].lineData[390] = 0;
  _$jscoverage['/base/create.js'].lineData[393] = 0;
  _$jscoverage['/base/create.js'].lineData[401] = 0;
  _$jscoverage['/base/create.js'].lineData[403] = 0;
  _$jscoverage['/base/create.js'].lineData[404] = 0;
  _$jscoverage['/base/create.js'].lineData[405] = 0;
  _$jscoverage['/base/create.js'].lineData[413] = 0;
  _$jscoverage['/base/create.js'].lineData[415] = 0;
  _$jscoverage['/base/create.js'].lineData[416] = 0;
  _$jscoverage['/base/create.js'].lineData[417] = 0;
  _$jscoverage['/base/create.js'].lineData[418] = 0;
  _$jscoverage['/base/create.js'].lineData[421] = 0;
  _$jscoverage['/base/create.js'].lineData[422] = 0;
  _$jscoverage['/base/create.js'].lineData[423] = 0;
  _$jscoverage['/base/create.js'].lineData[425] = 0;
  _$jscoverage['/base/create.js'].lineData[427] = 0;
  _$jscoverage['/base/create.js'].lineData[428] = 0;
  _$jscoverage['/base/create.js'].lineData[431] = 0;
  _$jscoverage['/base/create.js'].lineData[432] = 0;
  _$jscoverage['/base/create.js'].lineData[433] = 0;
  _$jscoverage['/base/create.js'].lineData[435] = 0;
  _$jscoverage['/base/create.js'].lineData[441] = 0;
  _$jscoverage['/base/create.js'].lineData[442] = 0;
  _$jscoverage['/base/create.js'].lineData[446] = 0;
  _$jscoverage['/base/create.js'].lineData[447] = 0;
  _$jscoverage['/base/create.js'].lineData[450] = 0;
  _$jscoverage['/base/create.js'].lineData[453] = 0;
  _$jscoverage['/base/create.js'].lineData[454] = 0;
  _$jscoverage['/base/create.js'].lineData[458] = 0;
  _$jscoverage['/base/create.js'].lineData[460] = 0;
  _$jscoverage['/base/create.js'].lineData[465] = 0;
  _$jscoverage['/base/create.js'].lineData[466] = 0;
  _$jscoverage['/base/create.js'].lineData[467] = 0;
  _$jscoverage['/base/create.js'].lineData[468] = 0;
  _$jscoverage['/base/create.js'].lineData[469] = 0;
  _$jscoverage['/base/create.js'].lineData[471] = 0;
  _$jscoverage['/base/create.js'].lineData[474] = 0;
  _$jscoverage['/base/create.js'].lineData[478] = 0;
  _$jscoverage['/base/create.js'].lineData[479] = 0;
  _$jscoverage['/base/create.js'].lineData[483] = 0;
  _$jscoverage['/base/create.js'].lineData[484] = 0;
  _$jscoverage['/base/create.js'].lineData[485] = 0;
  _$jscoverage['/base/create.js'].lineData[486] = 0;
  _$jscoverage['/base/create.js'].lineData[487] = 0;
  _$jscoverage['/base/create.js'].lineData[488] = 0;
  _$jscoverage['/base/create.js'].lineData[491] = 0;
  _$jscoverage['/base/create.js'].lineData[493] = 0;
  _$jscoverage['/base/create.js'].lineData[497] = 0;
  _$jscoverage['/base/create.js'].lineData[513] = 0;
  _$jscoverage['/base/create.js'].lineData[515] = 0;
  _$jscoverage['/base/create.js'].lineData[516] = 0;
  _$jscoverage['/base/create.js'].lineData[517] = 0;
  _$jscoverage['/base/create.js'].lineData[525] = 0;
  _$jscoverage['/base/create.js'].lineData[526] = 0;
  _$jscoverage['/base/create.js'].lineData[529] = 0;
}
if (! _$jscoverage['/base/create.js'].functionData) {
  _$jscoverage['/base/create.js'].functionData = [];
  _$jscoverage['/base/create.js'].functionData[0] = 0;
  _$jscoverage['/base/create.js'].functionData[1] = 0;
  _$jscoverage['/base/create.js'].functionData[2] = 0;
  _$jscoverage['/base/create.js'].functionData[3] = 0;
  _$jscoverage['/base/create.js'].functionData[4] = 0;
  _$jscoverage['/base/create.js'].functionData[5] = 0;
  _$jscoverage['/base/create.js'].functionData[6] = 0;
  _$jscoverage['/base/create.js'].functionData[7] = 0;
  _$jscoverage['/base/create.js'].functionData[8] = 0;
  _$jscoverage['/base/create.js'].functionData[9] = 0;
  _$jscoverage['/base/create.js'].functionData[10] = 0;
  _$jscoverage['/base/create.js'].functionData[11] = 0;
  _$jscoverage['/base/create.js'].functionData[12] = 0;
  _$jscoverage['/base/create.js'].functionData[13] = 0;
  _$jscoverage['/base/create.js'].functionData[14] = 0;
  _$jscoverage['/base/create.js'].functionData[15] = 0;
  _$jscoverage['/base/create.js'].functionData[16] = 0;
  _$jscoverage['/base/create.js'].functionData[17] = 0;
  _$jscoverage['/base/create.js'].functionData[18] = 0;
  _$jscoverage['/base/create.js'].functionData[19] = 0;
}
if (! _$jscoverage['/base/create.js'].branchData) {
  _$jscoverage['/base/create.js'].branchData = {};
  _$jscoverage['/base/create.js'].branchData['16'] = [];
  _$jscoverage['/base/create.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['21'] = [];
  _$jscoverage['/base/create.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['21'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['24'] = [];
  _$jscoverage['/base/create.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['33'] = [];
  _$jscoverage['/base/create.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['33'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['36'] = [];
  _$jscoverage['/base/create.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['65'] = [];
  _$jscoverage['/base/create.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['70'] = [];
  _$jscoverage['/base/create.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['70'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['72'] = [];
  _$jscoverage['/base/create.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['102'] = [];
  _$jscoverage['/base/create.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['106'] = [];
  _$jscoverage['/base/create.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['110'] = [];
  _$jscoverage['/base/create.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['114'] = [];
  _$jscoverage['/base/create.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['118'] = [];
  _$jscoverage['/base/create.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['125'] = [];
  _$jscoverage['/base/create.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['131'] = [];
  _$jscoverage['/base/create.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['141'] = [];
  _$jscoverage['/base/create.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['145'] = [];
  _$jscoverage['/base/create.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['147'] = [];
  _$jscoverage['/base/create.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['152'] = [];
  _$jscoverage['/base/create.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['152'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['159'] = [];
  _$jscoverage['/base/create.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['162'] = [];
  _$jscoverage['/base/create.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['175'] = [];
  _$jscoverage['/base/create.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['202'] = [];
  _$jscoverage['/base/create.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['206'] = [];
  _$jscoverage['/base/create.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['208'] = [];
  _$jscoverage['/base/create.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['210'] = [];
  _$jscoverage['/base/create.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['222'] = [];
  _$jscoverage['/base/create.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['223'] = [];
  _$jscoverage['/base/create.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['223'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['223'][3] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['226'] = [];
  _$jscoverage['/base/create.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['228'] = [];
  _$jscoverage['/base/create.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['241'] = [];
  _$jscoverage['/base/create.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['265'] = [];
  _$jscoverage['/base/create.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['269'] = [];
  _$jscoverage['/base/create.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['270'] = [];
  _$jscoverage['/base/create.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['270'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['279'] = [];
  _$jscoverage['/base/create.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['280'] = [];
  _$jscoverage['/base/create.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['282'] = [];
  _$jscoverage['/base/create.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['307'] = [];
  _$jscoverage['/base/create.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['309'] = [];
  _$jscoverage['/base/create.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['309'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['313'] = [];
  _$jscoverage['/base/create.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['346'] = [];
  _$jscoverage['/base/create.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['357'] = [];
  _$jscoverage['/base/create.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['371'] = [];
  _$jscoverage['/base/create.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['371'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['372'] = [];
  _$jscoverage['/base/create.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['378'] = [];
  _$jscoverage['/base/create.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['378'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['382'] = [];
  _$jscoverage['/base/create.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['387'] = [];
  _$jscoverage['/base/create.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['389'] = [];
  _$jscoverage['/base/create.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['403'] = [];
  _$jscoverage['/base/create.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['417'] = [];
  _$jscoverage['/base/create.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['422'] = [];
  _$jscoverage['/base/create.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['427'] = [];
  _$jscoverage['/base/create.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['432'] = [];
  _$jscoverage['/base/create.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['446'] = [];
  _$jscoverage['/base/create.js'].branchData['446'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['446'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['458'] = [];
  _$jscoverage['/base/create.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['466'] = [];
  _$jscoverage['/base/create.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['467'] = [];
  _$jscoverage['/base/create.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['469'] = [];
  _$jscoverage['/base/create.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['483'] = [];
  _$jscoverage['/base/create.js'].branchData['483'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['483'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['483'][3] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['487'] = [];
  _$jscoverage['/base/create.js'].branchData['487'][1] = new BranchData();
}
_$jscoverage['/base/create.js'].branchData['487'][1].init(185, 7, 'i < len');
function visit182_487_1(result) {
  _$jscoverage['/base/create.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['483'][3].init(101, 24, 'nodes.push || nodes.item');
function visit181_483_3(result) {
  _$jscoverage['/base/create.js'].branchData['483'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['483'][2].init(101, 37, '(nodes.push || nodes.item) && nodes[0]');
function visit180_483_2(result) {
  _$jscoverage['/base/create.js'].branchData['483'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['483'][1].init(91, 47, 'nodes && (nodes.push || nodes.item) && nodes[0]');
function visit179_483_1(result) {
  _$jscoverage['/base/create.js'].branchData['483'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['469'][1].init(129, 49, 'elem.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit178_469_1(result) {
  _$jscoverage['/base/create.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['467'][1].init(17, 39, 'elem.nodeType === NodeType.ELEMENT_NODE');
function visit177_467_1(result) {
  _$jscoverage['/base/create.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['466'][1].init(13, 22, 'S.isPlainObject(props)');
function visit176_466_1(result) {
  _$jscoverage['/base/create.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['458'][1].init(368, 8, 'DOMEvent');
function visit175_458_1(result) {
  _$jscoverage['/base/create.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['446'][2].init(97, 39, 'dest.nodeType === NodeType.ELEMENT_NODE');
function visit174_446_2(result) {
  _$jscoverage['/base/create.js'].branchData['446'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['446'][1].init(97, 60, 'dest.nodeType === NodeType.ELEMENT_NODE && !Dom.hasData(src)');
function visit173_446_1(result) {
  _$jscoverage['/base/create.js'].branchData['446'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['432'][1].init(21, 21, 'cloneChildren[cIndex]');
function visit172_432_1(result) {
  _$jscoverage['/base/create.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['427'][1].init(435, 38, 'elemNodeType === NodeType.ELEMENT_NODE');
function visit171_427_1(result) {
  _$jscoverage['/base/create.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['422'][1].init(21, 15, 'cloneCs[fIndex]');
function visit170_422_1(result) {
  _$jscoverage['/base/create.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['417'][1].init(55, 48, 'elemNodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit169_417_1(result) {
  _$jscoverage['/base/create.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['403'][1].init(116, 6, 'i >= 0');
function visit168_403_1(result) {
  _$jscoverage['/base/create.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['389'][1].init(81, 28, 'deep && deepWithDataAndEvent');
function visit167_389_1(result) {
  _$jscoverage['/base/create.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['387'][1].init(1730, 16, 'withDataAndEvent');
function visit166_387_1(result) {
  _$jscoverage['/base/create.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['382'][1].init(575, 27, 'deep && _fixCloneAttributes');
function visit165_382_1(result) {
  _$jscoverage['/base/create.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['378'][2].init(428, 38, 'elemNodeType === NodeType.ELEMENT_NODE');
function visit164_378_2(result) {
  _$jscoverage['/base/create.js'].branchData['378'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['378'][1].init(405, 61, '_fixCloneAttributes && elemNodeType === NodeType.ELEMENT_NODE');
function visit163_378_1(result) {
  _$jscoverage['/base/create.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['372'][1].init(61, 48, 'elemNodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit162_372_1(result) {
  _$jscoverage['/base/create.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['371'][2].init(847, 38, 'elemNodeType === NodeType.ELEMENT_NODE');
function visit161_371_2(result) {
  _$jscoverage['/base/create.js'].branchData['371'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['371'][1].init(847, 110, 'elemNodeType === NodeType.ELEMENT_NODE || elemNodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit160_371_1(result) {
  _$jscoverage['/base/create.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['357'][1].init(433, 5, '!elem');
function visit159_357_1(result) {
  _$jscoverage['/base/create.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['346'][1].init(21, 24, 'typeof deep === \'object\'');
function visit158_346_1(result) {
  _$jscoverage['/base/create.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['313'][1].init(186, 8, 'DOMEvent');
function visit157_313_1(result) {
  _$jscoverage['/base/create.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['309'][2].init(71, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit156_309_2(result) {
  _$jscoverage['/base/create.js'].branchData['309'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['309'][1].init(58, 50, '!keepData && el.nodeType === NodeType.ELEMENT_NODE');
function visit155_309_1(result) {
  _$jscoverage['/base/create.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['307'][1].init(216, 6, 'i >= 0');
function visit154_307_1(result) {
  _$jscoverage['/base/create.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['282'][1].init(74, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit153_282_1(result) {
  _$jscoverage['/base/create.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['280'][1].init(46, 6, 'i >= 0');
function visit152_280_1(result) {
  _$jscoverage['/base/create.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['279'][1].init(63, 64, '!htmlString.match(/<(?:script|style|link)/i) && supportOuterHTML');
function visit151_279_1(result) {
  _$jscoverage['/base/create.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['270'][2].init(45, 42, 'el.nodeType !== Dom.DOCUMENT_FRAGMENT_NODE');
function visit150_270_2(result) {
  _$jscoverage['/base/create.js'].branchData['270'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['270'][1].init(25, 62, 'supportOuterHTML && el.nodeType !== Dom.DOCUMENT_FRAGMENT_NODE');
function visit149_270_1(result) {
  _$jscoverage['/base/create.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['269'][1].init(326, 24, 'htmlString === undefined');
function visit148_269_1(result) {
  _$jscoverage['/base/create.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['265'][1].init(222, 3, '!el');
function visit147_265_1(result) {
  _$jscoverage['/base/create.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['241'][1].init(1090, 8, '!success');
function visit146_241_1(result) {
  _$jscoverage['/base/create.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['228'][1].init(84, 39, 'elem.nodeType === NodeType.ELEMENT_NODE');
function visit145_228_1(result) {
  _$jscoverage['/base/create.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['226'][1].init(54, 6, 'i >= 0');
function visit144_226_1(result) {
  _$jscoverage['/base/create.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['223'][3].init(341, 36, 'htmlString.match(RE_TAG) || [\'\', \'\']');
function visit143_223_3(result) {
  _$jscoverage['/base/create.js'].branchData['223'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['223'][2].init(252, 69, '!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)');
function visit142_223_2(result) {
  _$jscoverage['/base/create.js'].branchData['223'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['223'][1].init(72, 145, '(!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)) && !creatorsMap[(htmlString.match(RE_TAG) || [\'\', \'\'])[1].toLowerCase()]');
function visit141_223_1(result) {
  _$jscoverage['/base/create.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['222'][1].init(177, 218, '!htmlString.match(/<(?:script|style|link)/i) && (!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)) && !creatorsMap[(htmlString.match(RE_TAG) || [\'\', \'\'])[1].toLowerCase()]');
function visit140_222_1(result) {
  _$jscoverage['/base/create.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['210'][1].init(212, 47, 'el.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit139_210_1(result) {
  _$jscoverage['/base/create.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['208'][1].init(94, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit138_208_1(result) {
  _$jscoverage['/base/create.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['206'][1].init(355, 24, 'htmlString === undefined');
function visit137_206_1(result) {
  _$jscoverage['/base/create.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['202'][1].init(251, 3, '!el');
function visit136_202_1(result) {
  _$jscoverage['/base/create.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['175'][1].init(95, 32, 'Dom.nodeName(src) === \'textarea\'');
function visit135_175_1(result) {
  _$jscoverage['/base/create.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['162'][1].init(1294, 12, 'nodes.length');
function visit134_162_1(result) {
  _$jscoverage['/base/create.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['159'][1].init(1078, 18, 'nodes.length === 1');
function visit133_159_1(result) {
  _$jscoverage['/base/create.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['152'][2].init(799, 92, '/\\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))');
function visit132_152_2(result) {
  _$jscoverage['/base/create.js'].branchData['152'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['152'][1].init(770, 121, 'lostLeadingTailWhitespace && /\\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))');
function visit131_152_1(result) {
  _$jscoverage['/base/create.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['147'][1].init(479, 105, 'lostLeadingTailWhitespace && (whitespaceMatch = html.match(R_LEADING_WHITESPACE))');
function visit130_147_1(result) {
  _$jscoverage['/base/create.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['145'][1].init(371, 31, 'creators[tag] || defaultCreator');
function visit129_145_1(result) {
  _$jscoverage['/base/create.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['141'][1].init(231, 36, '(m = RE_TAG.exec(html)) && (k = m[1])');
function visit128_141_1(result) {
  _$jscoverage['/base/create.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['131'][1].init(781, 18, '!R_HTML.test(html)');
function visit127_131_1(result) {
  _$jscoverage['/base/create.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['125'][1].init(124, 15, 'ownerDoc || doc');
function visit126_125_1(result) {
  _$jscoverage['/base/create.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['118'][1].init(429, 5, '_trim');
function visit125_118_1(result) {
  _$jscoverage['/base/create.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['114'][1].init(333, 19, '_trim === undefined');
function visit124_114_1(result) {
  _$jscoverage['/base/create.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['110'][1].init(234, 24, 'typeof html !== \'string\'');
function visit123_110_1(result) {
  _$jscoverage['/base/create.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['106'][1].init(134, 13, 'html.nodeType');
function visit122_106_1(result) {
  _$jscoverage['/base/create.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['102'][1].init(54, 5, '!html');
function visit121_102_1(result) {
  _$jscoverage['/base/create.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['72'][1].init(135, 15, 'node.firstChild');
function visit120_72_1(result) {
  _$jscoverage['/base/create.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['70'][2].init(516, 46, 'parent.canHaveChildren && \'removeNode\' in node');
function visit119_70_2(result) {
  _$jscoverage['/base/create.js'].branchData['70'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['70'][1].init(507, 55, 'oldIE && parent.canHaveChildren && \'removeNode\' in node');
function visit118_70_1(result) {
  _$jscoverage['/base/create.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['65'][1].init(13, 6, 'parent');
function visit117_65_1(result) {
  _$jscoverage['/base/create.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['36'][1].init(132, 22, 'holder === DEFAULT_DIV');
function visit116_36_1(result) {
  _$jscoverage['/base/create.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['33'][2].init(34, 16, 'ownerDoc !== doc');
function visit115_33_2(result) {
  _$jscoverage['/base/create.js'].branchData['33'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['33'][1].init(22, 28, 'ownerDoc && ownerDoc !== doc');
function visit114_33_1(result) {
  _$jscoverage['/base/create.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['24'][1].init(553, 41, 'doc && \'outerHTML\' in doc.documentElement');
function visit113_24_1(result) {
  _$jscoverage['/base/create.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['21'][2].init(444, 6, 'ie < 9');
function visit112_21_2(result) {
  _$jscoverage['/base/create.js'].branchData['21'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['21'][1].init(438, 12, 'ie && ie < 9');
function visit111_21_1(result) {
  _$jscoverage['/base/create.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['16'][1].init(186, 29, 'doc && doc.createElement(DIV)');
function visit110_16_1(result) {
  _$jscoverage['/base/create.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/create.js'].functionData[0]++;
  _$jscoverage['/base/create.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/create.js'].lineData[8]++;
  var logger = S.getLogger('s/dom');
  _$jscoverage['/base/create.js'].lineData[9]++;
  var doc = S.Env.host.document, NodeType = Dom.NodeType, UA = S.UA, ie = UA.ieMode, DIV = 'div', PARENT_NODE = 'parentNode', DEFAULT_DIV = visit110_16_1(doc && doc.createElement(DIV)), R_XHTML_TAG = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig, RE_TAG = /<([\w:]+)/, R_LEADING_WHITESPACE = /^\s+/, R_TAIL_WHITESPACE = /\s+$/, oldIE = !!(visit111_21_1(ie && visit112_21_2(ie < 9))), lostLeadingTailWhitespace = oldIE, R_HTML = /<|&#?\w+;/, supportOuterHTML = visit113_24_1(doc && 'outerHTML' in doc.documentElement), RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;
  _$jscoverage['/base/create.js'].lineData[28]++;
  function getElementsByTagName(el, tag) {
    _$jscoverage['/base/create.js'].functionData[1]++;
    _$jscoverage['/base/create.js'].lineData[29]++;
    return el.getElementsByTagName(tag);
  }
  _$jscoverage['/base/create.js'].lineData[32]++;
  function getHolderDiv(ownerDoc) {
    _$jscoverage['/base/create.js'].functionData[2]++;
    _$jscoverage['/base/create.js'].lineData[33]++;
    var holder = visit114_33_1(ownerDoc && visit115_33_2(ownerDoc !== doc)) ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
    _$jscoverage['/base/create.js'].lineData[36]++;
    if (visit116_36_1(holder === DEFAULT_DIV)) {
      _$jscoverage['/base/create.js'].lineData[37]++;
      holder.innerHTML = '';
    }
    _$jscoverage['/base/create.js'].lineData[39]++;
    return holder;
  }
  _$jscoverage['/base/create.js'].lineData[42]++;
  function defaultCreator(html, ownerDoc) {
    _$jscoverage['/base/create.js'].functionData[3]++;
    _$jscoverage['/base/create.js'].lineData[43]++;
    var frag = getHolderDiv(ownerDoc);
    _$jscoverage['/base/create.js'].lineData[45]++;
    frag.innerHTML = 'm<div>' + html + '<' + '/div>';
    _$jscoverage['/base/create.js'].lineData[46]++;
    return frag.lastChild;
  }
  _$jscoverage['/base/create.js'].lineData[49]++;
  function _empty(node) {
    _$jscoverage['/base/create.js'].functionData[4]++;
    _$jscoverage['/base/create.js'].lineData[50]++;
    try {
      _$jscoverage['/base/create.js'].lineData[52]++;
      node.innerHTML = '';
      _$jscoverage['/base/create.js'].lineData[53]++;
      return;
    }    catch (e) {
}
    _$jscoverage['/base/create.js'].lineData[59]++;
    for (var c; (c = node.lastChild); ) {
      _$jscoverage['/base/create.js'].lineData[60]++;
      _destroy(c, node);
    }
  }
  _$jscoverage['/base/create.js'].lineData[64]++;
  function _destroy(node, parent) {
    _$jscoverage['/base/create.js'].functionData[5]++;
    _$jscoverage['/base/create.js'].lineData[65]++;
    if (visit117_65_1(parent)) {
      _$jscoverage['/base/create.js'].lineData[70]++;
      if (visit118_70_1(oldIE && visit119_70_2(parent.canHaveChildren && 'removeNode' in node))) {
        _$jscoverage['/base/create.js'].lineData[72]++;
        if (visit120_72_1(node.firstChild)) {
          _$jscoverage['/base/create.js'].lineData[73]++;
          _empty(node);
        }
        _$jscoverage['/base/create.js'].lineData[75]++;
        node.removeNode(false);
      } else {
        _$jscoverage['/base/create.js'].lineData[77]++;
        parent.removeChild(node);
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[82]++;
  S.mix(Dom, {
  create: function(html, props, ownerDoc, _trim) {
  _$jscoverage['/base/create.js'].functionData[6]++;
  _$jscoverage['/base/create.js'].lineData[100]++;
  var ret = null;
  _$jscoverage['/base/create.js'].lineData[102]++;
  if (visit121_102_1(!html)) {
    _$jscoverage['/base/create.js'].lineData[103]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[106]++;
  if (visit122_106_1(html.nodeType)) {
    _$jscoverage['/base/create.js'].lineData[107]++;
    return Dom.clone(html);
  }
  _$jscoverage['/base/create.js'].lineData[110]++;
  if (visit123_110_1(typeof html !== 'string')) {
    _$jscoverage['/base/create.js'].lineData[111]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[114]++;
  if (visit124_114_1(_trim === undefined)) {
    _$jscoverage['/base/create.js'].lineData[115]++;
    _trim = true;
  }
  _$jscoverage['/base/create.js'].lineData[118]++;
  if (visit125_118_1(_trim)) {
    _$jscoverage['/base/create.js'].lineData[119]++;
    html = S.trim(html);
  }
  _$jscoverage['/base/create.js'].lineData[122]++;
  var creators = Dom._creators, holder, whitespaceMatch, context = visit126_125_1(ownerDoc || doc), m, tag = DIV, k, nodes;
  _$jscoverage['/base/create.js'].lineData[131]++;
  if (visit127_131_1(!R_HTML.test(html))) {
    _$jscoverage['/base/create.js'].lineData[132]++;
    ret = context.createTextNode(html);
  } else {
    _$jscoverage['/base/create.js'].lineData[133]++;
    if ((m = RE_SIMPLE_TAG.exec(html))) {
      _$jscoverage['/base/create.js'].lineData[135]++;
      ret = context.createElement(m[1]);
    } else {
      _$jscoverage['/base/create.js'].lineData[139]++;
      html = html.replace(R_XHTML_TAG, '<$1><' + '/$2>');
      _$jscoverage['/base/create.js'].lineData[141]++;
      if (visit128_141_1((m = RE_TAG.exec(html)) && (k = m[1]))) {
        _$jscoverage['/base/create.js'].lineData[142]++;
        tag = k.toLowerCase();
      }
      _$jscoverage['/base/create.js'].lineData[145]++;
      holder = (visit129_145_1(creators[tag] || defaultCreator))(html, context);
      _$jscoverage['/base/create.js'].lineData[147]++;
      if (visit130_147_1(lostLeadingTailWhitespace && (whitespaceMatch = html.match(R_LEADING_WHITESPACE)))) {
        _$jscoverage['/base/create.js'].lineData[149]++;
        holder.insertBefore(context.createTextNode(whitespaceMatch[0]), holder.firstChild);
      }
      _$jscoverage['/base/create.js'].lineData[152]++;
      if (visit131_152_1(lostLeadingTailWhitespace && visit132_152_2(/\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))))) {
        _$jscoverage['/base/create.js'].lineData[154]++;
        holder.appendChild(context.createTextNode(whitespaceMatch[0]));
      }
      _$jscoverage['/base/create.js'].lineData[157]++;
      nodes = holder.childNodes;
      _$jscoverage['/base/create.js'].lineData[159]++;
      if (visit133_159_1(nodes.length === 1)) {
        _$jscoverage['/base/create.js'].lineData[161]++;
        ret = nodes[0][PARENT_NODE].removeChild(nodes[0]);
      } else {
        _$jscoverage['/base/create.js'].lineData[162]++;
        if (visit134_162_1(nodes.length)) {
          _$jscoverage['/base/create.js'].lineData[164]++;
          ret = nodeListToFragment(nodes);
        } else {
          _$jscoverage['/base/create.js'].lineData[166]++;
          S.error(html + ' : create node error');
        }
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[170]++;
  return attachProps(ret, props);
}, 
  _fixCloneAttributes: function(src, dest) {
  _$jscoverage['/base/create.js'].functionData[7]++;
  _$jscoverage['/base/create.js'].lineData[175]++;
  if (visit135_175_1(Dom.nodeName(src) === 'textarea')) {
    _$jscoverage['/base/create.js'].lineData[176]++;
    dest.defaultValue = src.defaultValue;
    _$jscoverage['/base/create.js'].lineData[177]++;
    dest.value = src.value;
  }
}, 
  _creators: {
  div: defaultCreator}, 
  _defaultCreator: defaultCreator, 
  html: function(selector, htmlString, loadScripts) {
  _$jscoverage['/base/create.js'].functionData[8]++;
  _$jscoverage['/base/create.js'].lineData[197]++;
  var els = Dom.query(selector), el = els[0], success = false, valNode, i, elem;
  _$jscoverage['/base/create.js'].lineData[202]++;
  if (visit136_202_1(!el)) {
    _$jscoverage['/base/create.js'].lineData[203]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[206]++;
  if (visit137_206_1(htmlString === undefined)) {
    _$jscoverage['/base/create.js'].lineData[208]++;
    if (visit138_208_1(el.nodeType === NodeType.ELEMENT_NODE)) {
      _$jscoverage['/base/create.js'].lineData[209]++;
      return el.innerHTML;
    } else {
      _$jscoverage['/base/create.js'].lineData[210]++;
      if (visit139_210_1(el.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[211]++;
        var holder = getHolderDiv(el.ownerDocument);
        _$jscoverage['/base/create.js'].lineData[212]++;
        holder.appendChild(el);
        _$jscoverage['/base/create.js'].lineData[213]++;
        return holder.innerHTML;
      } else {
        _$jscoverage['/base/create.js'].lineData[215]++;
        return null;
      }
    }
  } else {
    _$jscoverage['/base/create.js'].lineData[218]++;
    htmlString += '';
    _$jscoverage['/base/create.js'].lineData[222]++;
    if (visit140_222_1(!htmlString.match(/<(?:script|style|link)/i) && visit141_223_1((visit142_223_2(!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE))) && !creatorsMap[(visit143_223_3(htmlString.match(RE_TAG) || ['', '']))[1].toLowerCase()]))) {
      _$jscoverage['/base/create.js'].lineData[225]++;
      try {
        _$jscoverage['/base/create.js'].lineData[226]++;
        for (i = els.length - 1; visit144_226_1(i >= 0); i--) {
          _$jscoverage['/base/create.js'].lineData[227]++;
          elem = els[i];
          _$jscoverage['/base/create.js'].lineData[228]++;
          if (visit145_228_1(elem.nodeType === NodeType.ELEMENT_NODE)) {
            _$jscoverage['/base/create.js'].lineData[229]++;
            Dom.cleanData(getElementsByTagName(elem, '*'));
            _$jscoverage['/base/create.js'].lineData[230]++;
            elem.innerHTML = htmlString;
          }
        }
        _$jscoverage['/base/create.js'].lineData[233]++;
        success = true;
      }      catch (e) {
}
    }
    _$jscoverage['/base/create.js'].lineData[241]++;
    if (visit146_241_1(!success)) {
      _$jscoverage['/base/create.js'].lineData[242]++;
      valNode = Dom.create(htmlString, 0, el.ownerDocument, 0);
      _$jscoverage['/base/create.js'].lineData[243]++;
      Dom.empty(els);
      _$jscoverage['/base/create.js'].lineData[244]++;
      Dom.append(valNode, els, loadScripts);
    }
  }
  _$jscoverage['/base/create.js'].lineData[247]++;
  return undefined;
}, 
  outerHtml: function(selector, htmlString, loadScripts) {
  _$jscoverage['/base/create.js'].functionData[9]++;
  _$jscoverage['/base/create.js'].lineData[259]++;
  var els = Dom.query(selector), holder, i, valNode, length = els.length, el = els[0];
  _$jscoverage['/base/create.js'].lineData[265]++;
  if (visit147_265_1(!el)) {
    _$jscoverage['/base/create.js'].lineData[266]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[269]++;
  if (visit148_269_1(htmlString === undefined)) {
    _$jscoverage['/base/create.js'].lineData[270]++;
    if (visit149_270_1(supportOuterHTML && visit150_270_2(el.nodeType !== Dom.DOCUMENT_FRAGMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[271]++;
      return el.outerHTML;
    } else {
      _$jscoverage['/base/create.js'].lineData[273]++;
      holder = getHolderDiv(el.ownerDocument);
      _$jscoverage['/base/create.js'].lineData[274]++;
      holder.appendChild(Dom.clone(el, true));
      _$jscoverage['/base/create.js'].lineData[275]++;
      return holder.innerHTML;
    }
  } else {
    _$jscoverage['/base/create.js'].lineData[278]++;
    htmlString += '';
    _$jscoverage['/base/create.js'].lineData[279]++;
    if (visit151_279_1(!htmlString.match(/<(?:script|style|link)/i) && supportOuterHTML)) {
      _$jscoverage['/base/create.js'].lineData[280]++;
      for (i = length - 1; visit152_280_1(i >= 0); i--) {
        _$jscoverage['/base/create.js'].lineData[281]++;
        el = els[i];
        _$jscoverage['/base/create.js'].lineData[282]++;
        if (visit153_282_1(el.nodeType === NodeType.ELEMENT_NODE)) {
          _$jscoverage['/base/create.js'].lineData[283]++;
          Dom.cleanData(el, 1);
          _$jscoverage['/base/create.js'].lineData[284]++;
          el.outerHTML = htmlString;
        }
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[288]++;
      valNode = Dom.create(htmlString, 0, el.ownerDocument, 0);
      _$jscoverage['/base/create.js'].lineData[289]++;
      Dom.insertBefore(valNode, els, loadScripts);
      _$jscoverage['/base/create.js'].lineData[290]++;
      Dom.remove(els);
    }
  }
  _$jscoverage['/base/create.js'].lineData[293]++;
  return undefined;
}, 
  remove: function(selector, keepData) {
  _$jscoverage['/base/create.js'].functionData[10]++;
  _$jscoverage['/base/create.js'].lineData[302]++;
  var el, els = Dom.query(selector), all, DOMEvent = S.require('event/dom'), i;
  _$jscoverage['/base/create.js'].lineData[307]++;
  for (i = els.length - 1; visit154_307_1(i >= 0); i--) {
    _$jscoverage['/base/create.js'].lineData[308]++;
    el = els[i];
    _$jscoverage['/base/create.js'].lineData[309]++;
    if (visit155_309_1(!keepData && visit156_309_2(el.nodeType === NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[310]++;
      all = S.makeArray(getElementsByTagName(el, '*'));
      _$jscoverage['/base/create.js'].lineData[311]++;
      all.push(el);
      _$jscoverage['/base/create.js'].lineData[312]++;
      Dom.removeData(all);
      _$jscoverage['/base/create.js'].lineData[313]++;
      if (visit157_313_1(DOMEvent)) {
        _$jscoverage['/base/create.js'].lineData[314]++;
        DOMEvent.detach(all);
      }
    }
    _$jscoverage['/base/create.js'].lineData[322]++;
    _destroy(el, el.parentNode);
  }
}, 
  clone: function(selector, deep, withDataAndEvent, deepWithDataAndEvent) {
  _$jscoverage['/base/create.js'].functionData[11]++;
  _$jscoverage['/base/create.js'].lineData[346]++;
  if (visit158_346_1(typeof deep === 'object')) {
    _$jscoverage['/base/create.js'].lineData[347]++;
    deepWithDataAndEvent = deep.deepWithDataAndEvent;
    _$jscoverage['/base/create.js'].lineData[348]++;
    withDataAndEvent = deep.withDataAndEvent;
    _$jscoverage['/base/create.js'].lineData[349]++;
    deep = deep.deep;
  }
  _$jscoverage['/base/create.js'].lineData[352]++;
  var elem = Dom.get(selector), clone, _fixCloneAttributes = Dom._fixCloneAttributes, elemNodeType;
  _$jscoverage['/base/create.js'].lineData[357]++;
  if (visit159_357_1(!elem)) {
    _$jscoverage['/base/create.js'].lineData[358]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[361]++;
  elemNodeType = elem.nodeType;
  _$jscoverage['/base/create.js'].lineData[367]++;
  clone = elem.cloneNode(deep);
  _$jscoverage['/base/create.js'].lineData[371]++;
  if (visit160_371_1(visit161_371_2(elemNodeType === NodeType.ELEMENT_NODE) || visit162_372_1(elemNodeType === NodeType.DOCUMENT_FRAGMENT_NODE))) {
    _$jscoverage['/base/create.js'].lineData[378]++;
    if (visit163_378_1(_fixCloneAttributes && visit164_378_2(elemNodeType === NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[379]++;
      _fixCloneAttributes(elem, clone);
    }
    _$jscoverage['/base/create.js'].lineData[382]++;
    if (visit165_382_1(deep && _fixCloneAttributes)) {
      _$jscoverage['/base/create.js'].lineData[383]++;
      processAll(_fixCloneAttributes, elem, clone);
    }
  }
  _$jscoverage['/base/create.js'].lineData[387]++;
  if (visit166_387_1(withDataAndEvent)) {
    _$jscoverage['/base/create.js'].lineData[388]++;
    cloneWithDataAndEvent(elem, clone);
    _$jscoverage['/base/create.js'].lineData[389]++;
    if (visit167_389_1(deep && deepWithDataAndEvent)) {
      _$jscoverage['/base/create.js'].lineData[390]++;
      processAll(cloneWithDataAndEvent, elem, clone);
    }
  }
  _$jscoverage['/base/create.js'].lineData[393]++;
  return clone;
}, 
  empty: function(selector) {
  _$jscoverage['/base/create.js'].functionData[12]++;
  _$jscoverage['/base/create.js'].lineData[401]++;
  var els = Dom.query(selector), el, i;
  _$jscoverage['/base/create.js'].lineData[403]++;
  for (i = els.length - 1; visit168_403_1(i >= 0); i--) {
    _$jscoverage['/base/create.js'].lineData[404]++;
    el = els[i];
    _$jscoverage['/base/create.js'].lineData[405]++;
    Dom.remove(el.childNodes);
  }
}, 
  _nodeListToFragment: nodeListToFragment});
  _$jscoverage['/base/create.js'].lineData[413]++;
  Dom.outerHTML = Dom.outerHtml;
  _$jscoverage['/base/create.js'].lineData[415]++;
  function processAll(fn, elem, clone) {
    _$jscoverage['/base/create.js'].functionData[13]++;
    _$jscoverage['/base/create.js'].lineData[416]++;
    var elemNodeType = elem.nodeType;
    _$jscoverage['/base/create.js'].lineData[417]++;
    if (visit169_417_1(elemNodeType === NodeType.DOCUMENT_FRAGMENT_NODE)) {
      _$jscoverage['/base/create.js'].lineData[418]++;
      var eCs = elem.childNodes, cloneCs = clone.childNodes, fIndex = 0;
      _$jscoverage['/base/create.js'].lineData[421]++;
      while (eCs[fIndex]) {
        _$jscoverage['/base/create.js'].lineData[422]++;
        if (visit170_422_1(cloneCs[fIndex])) {
          _$jscoverage['/base/create.js'].lineData[423]++;
          processAll(fn, eCs[fIndex], cloneCs[fIndex]);
        }
        _$jscoverage['/base/create.js'].lineData[425]++;
        fIndex++;
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[427]++;
      if (visit171_427_1(elemNodeType === NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[428]++;
        var elemChildren = getElementsByTagName(elem, '*'), cloneChildren = getElementsByTagName(clone, '*'), cIndex = 0;
        _$jscoverage['/base/create.js'].lineData[431]++;
        while (elemChildren[cIndex]) {
          _$jscoverage['/base/create.js'].lineData[432]++;
          if (visit172_432_1(cloneChildren[cIndex])) {
            _$jscoverage['/base/create.js'].lineData[433]++;
            fn(elemChildren[cIndex], cloneChildren[cIndex]);
          }
          _$jscoverage['/base/create.js'].lineData[435]++;
          cIndex++;
        }
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[441]++;
  function cloneWithDataAndEvent(src, dest) {
    _$jscoverage['/base/create.js'].functionData[14]++;
    _$jscoverage['/base/create.js'].lineData[442]++;
    var DOMEvent = S.require('event/dom'), srcData, d;
    _$jscoverage['/base/create.js'].lineData[446]++;
    if (visit173_446_1(visit174_446_2(dest.nodeType === NodeType.ELEMENT_NODE) && !Dom.hasData(src))) {
      _$jscoverage['/base/create.js'].lineData[447]++;
      return;
    }
    _$jscoverage['/base/create.js'].lineData[450]++;
    srcData = Dom.data(src);
    _$jscoverage['/base/create.js'].lineData[453]++;
    for (d in srcData) {
      _$jscoverage['/base/create.js'].lineData[454]++;
      Dom.data(dest, d, srcData[d]);
    }
    _$jscoverage['/base/create.js'].lineData[458]++;
    if (visit175_458_1(DOMEvent)) {
      _$jscoverage['/base/create.js'].lineData[460]++;
      DOMEvent.clone(src, dest);
    }
  }
  _$jscoverage['/base/create.js'].lineData[465]++;
  function attachProps(elem, props) {
    _$jscoverage['/base/create.js'].functionData[15]++;
    _$jscoverage['/base/create.js'].lineData[466]++;
    if (visit176_466_1(S.isPlainObject(props))) {
      _$jscoverage['/base/create.js'].lineData[467]++;
      if (visit177_467_1(elem.nodeType === NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[468]++;
        Dom.attr(elem, props, true);
      } else {
        _$jscoverage['/base/create.js'].lineData[469]++;
        if (visit178_469_1(elem.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE)) {
          _$jscoverage['/base/create.js'].lineData[471]++;
          Dom.attr(elem.childNodes, props, true);
        }
      }
    }
    _$jscoverage['/base/create.js'].lineData[474]++;
    return elem;
  }
  _$jscoverage['/base/create.js'].lineData[478]++;
  function nodeListToFragment(nodes) {
    _$jscoverage['/base/create.js'].functionData[16]++;
    _$jscoverage['/base/create.js'].lineData[479]++;
    var ret = null, i, ownerDoc, len;
    _$jscoverage['/base/create.js'].lineData[483]++;
    if (visit179_483_1(nodes && visit180_483_2((visit181_483_3(nodes.push || nodes.item)) && nodes[0]))) {
      _$jscoverage['/base/create.js'].lineData[484]++;
      ownerDoc = nodes[0].ownerDocument;
      _$jscoverage['/base/create.js'].lineData[485]++;
      ret = ownerDoc.createDocumentFragment();
      _$jscoverage['/base/create.js'].lineData[486]++;
      nodes = S.makeArray(nodes);
      _$jscoverage['/base/create.js'].lineData[487]++;
      for (i = 0 , len = nodes.length; visit182_487_1(i < len); i++) {
        _$jscoverage['/base/create.js'].lineData[488]++;
        ret.appendChild(nodes[i]);
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[491]++;
      logger.error('Unable to convert ' + nodes + ' to fragment.');
    }
    _$jscoverage['/base/create.js'].lineData[493]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[497]++;
  var creators = Dom._creators, create = Dom.create, creatorsMap = {
  area: 'map', 
  thead: 'table', 
  td: 'tr', 
  th: 'tr', 
  tr: 'tbody', 
  tbody: 'table', 
  tfoot: 'table', 
  caption: 'table', 
  colgroup: 'table', 
  col: 'colgroup', 
  legend: 'fieldset'}, p;
  _$jscoverage['/base/create.js'].lineData[513]++;
  for (p in creatorsMap) {
    _$jscoverage['/base/create.js'].lineData[515]++;
    (function(tag) {
  _$jscoverage['/base/create.js'].functionData[17]++;
  _$jscoverage['/base/create.js'].lineData[516]++;
  creators[p] = function(html, ownerDoc) {
  _$jscoverage['/base/create.js'].functionData[18]++;
  _$jscoverage['/base/create.js'].lineData[517]++;
  return create('<' + tag + '>' + html + '<' + '/' + tag + '>', undefined, ownerDoc);
};
})(creatorsMap[p]);
  }
  _$jscoverage['/base/create.js'].lineData[525]++;
  creatorsMap.option = creatorsMap.optgroup = function(html, ownerDoc) {
  _$jscoverage['/base/create.js'].functionData[19]++;
  _$jscoverage['/base/create.js'].lineData[526]++;
  return create('<select multiple="multiple">' + html + '</select>', undefined, ownerDoc);
};
  _$jscoverage['/base/create.js'].lineData[529]++;
  return Dom;
});
