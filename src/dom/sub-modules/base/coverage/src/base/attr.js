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
if (! _$jscoverage['/base/attr.js']) {
  _$jscoverage['/base/attr.js'] = {};
  _$jscoverage['/base/attr.js'].lineData = [];
  _$jscoverage['/base/attr.js'].lineData[6] = 0;
  _$jscoverage['/base/attr.js'].lineData[8] = 0;
  _$jscoverage['/base/attr.js'].lineData[40] = 0;
  _$jscoverage['/base/attr.js'].lineData[41] = 0;
  _$jscoverage['/base/attr.js'].lineData[75] = 0;
  _$jscoverage['/base/attr.js'].lineData[81] = 0;
  _$jscoverage['/base/attr.js'].lineData[82] = 0;
  _$jscoverage['/base/attr.js'].lineData[84] = 0;
  _$jscoverage['/base/attr.js'].lineData[87] = 0;
  _$jscoverage['/base/attr.js'].lineData[88] = 0;
  _$jscoverage['/base/attr.js'].lineData[90] = 0;
  _$jscoverage['/base/attr.js'].lineData[92] = 0;
  _$jscoverage['/base/attr.js'].lineData[94] = 0;
  _$jscoverage['/base/attr.js'].lineData[110] = 0;
  _$jscoverage['/base/attr.js'].lineData[118] = 0;
  _$jscoverage['/base/attr.js'].lineData[119] = 0;
  _$jscoverage['/base/attr.js'].lineData[120] = 0;
  _$jscoverage['/base/attr.js'].lineData[121] = 0;
  _$jscoverage['/base/attr.js'].lineData[125] = 0;
  _$jscoverage['/base/attr.js'].lineData[126] = 0;
  _$jscoverage['/base/attr.js'].lineData[127] = 0;
  _$jscoverage['/base/attr.js'].lineData[128] = 0;
  _$jscoverage['/base/attr.js'].lineData[129] = 0;
  _$jscoverage['/base/attr.js'].lineData[130] = 0;
  _$jscoverage['/base/attr.js'].lineData[134] = 0;
  _$jscoverage['/base/attr.js'].lineData[138] = 0;
  _$jscoverage['/base/attr.js'].lineData[140] = 0;
  _$jscoverage['/base/attr.js'].lineData[141] = 0;
  _$jscoverage['/base/attr.js'].lineData[144] = 0;
  _$jscoverage['/base/attr.js'].lineData[145] = 0;
  _$jscoverage['/base/attr.js'].lineData[147] = 0;
  _$jscoverage['/base/attr.js'].lineData[154] = 0;
  _$jscoverage['/base/attr.js'].lineData[155] = 0;
  _$jscoverage['/base/attr.js'].lineData[159] = 0;
  _$jscoverage['/base/attr.js'].lineData[162] = 0;
  _$jscoverage['/base/attr.js'].lineData[163] = 0;
  _$jscoverage['/base/attr.js'].lineData[165] = 0;
  _$jscoverage['/base/attr.js'].lineData[172] = 0;
  _$jscoverage['/base/attr.js'].lineData[174] = 0;
  _$jscoverage['/base/attr.js'].lineData[178] = 0;
  _$jscoverage['/base/attr.js'].lineData[179] = 0;
  _$jscoverage['/base/attr.js'].lineData[180] = 0;
  _$jscoverage['/base/attr.js'].lineData[181] = 0;
  _$jscoverage['/base/attr.js'].lineData[182] = 0;
  _$jscoverage['/base/attr.js'].lineData[184] = 0;
  _$jscoverage['/base/attr.js'].lineData[188] = 0;
  _$jscoverage['/base/attr.js'].lineData[221] = 0;
  _$jscoverage['/base/attr.js'].lineData[227] = 0;
  _$jscoverage['/base/attr.js'].lineData[228] = 0;
  _$jscoverage['/base/attr.js'].lineData[229] = 0;
  _$jscoverage['/base/attr.js'].lineData[231] = 0;
  _$jscoverage['/base/attr.js'].lineData[235] = 0;
  _$jscoverage['/base/attr.js'].lineData[236] = 0;
  _$jscoverage['/base/attr.js'].lineData[237] = 0;
  _$jscoverage['/base/attr.js'].lineData[238] = 0;
  _$jscoverage['/base/attr.js'].lineData[239] = 0;
  _$jscoverage['/base/attr.js'].lineData[240] = 0;
  _$jscoverage['/base/attr.js'].lineData[241] = 0;
  _$jscoverage['/base/attr.js'].lineData[243] = 0;
  _$jscoverage['/base/attr.js'].lineData[247] = 0;
  _$jscoverage['/base/attr.js'].lineData[248] = 0;
  _$jscoverage['/base/attr.js'].lineData[251] = 0;
  _$jscoverage['/base/attr.js'].lineData[261] = 0;
  _$jscoverage['/base/attr.js'].lineData[265] = 0;
  _$jscoverage['/base/attr.js'].lineData[266] = 0;
  _$jscoverage['/base/attr.js'].lineData[267] = 0;
  _$jscoverage['/base/attr.js'].lineData[268] = 0;
  _$jscoverage['/base/attr.js'].lineData[271] = 0;
  _$jscoverage['/base/attr.js'].lineData[280] = 0;
  _$jscoverage['/base/attr.js'].lineData[281] = 0;
  _$jscoverage['/base/attr.js'].lineData[284] = 0;
  _$jscoverage['/base/attr.js'].lineData[285] = 0;
  _$jscoverage['/base/attr.js'].lineData[286] = 0;
  _$jscoverage['/base/attr.js'].lineData[287] = 0;
  _$jscoverage['/base/attr.js'].lineData[288] = 0;
  _$jscoverage['/base/attr.js'].lineData[338] = 0;
  _$jscoverage['/base/attr.js'].lineData[345] = 0;
  _$jscoverage['/base/attr.js'].lineData[346] = 0;
  _$jscoverage['/base/attr.js'].lineData[347] = 0;
  _$jscoverage['/base/attr.js'].lineData[348] = 0;
  _$jscoverage['/base/attr.js'].lineData[350] = 0;
  _$jscoverage['/base/attr.js'].lineData[354] = 0;
  _$jscoverage['/base/attr.js'].lineData[355] = 0;
  _$jscoverage['/base/attr.js'].lineData[359] = 0;
  _$jscoverage['/base/attr.js'].lineData[361] = 0;
  _$jscoverage['/base/attr.js'].lineData[362] = 0;
  _$jscoverage['/base/attr.js'].lineData[366] = 0;
  _$jscoverage['/base/attr.js'].lineData[368] = 0;
  _$jscoverage['/base/attr.js'].lineData[369] = 0;
  _$jscoverage['/base/attr.js'].lineData[372] = 0;
  _$jscoverage['/base/attr.js'].lineData[373] = 0;
  _$jscoverage['/base/attr.js'].lineData[375] = 0;
  _$jscoverage['/base/attr.js'].lineData[378] = 0;
  _$jscoverage['/base/attr.js'].lineData[379] = 0;
  _$jscoverage['/base/attr.js'].lineData[381] = 0;
  _$jscoverage['/base/attr.js'].lineData[382] = 0;
  _$jscoverage['/base/attr.js'].lineData[384] = 0;
  _$jscoverage['/base/attr.js'].lineData[385] = 0;
  _$jscoverage['/base/attr.js'].lineData[388] = 0;
  _$jscoverage['/base/attr.js'].lineData[390] = 0;
  _$jscoverage['/base/attr.js'].lineData[391] = 0;
  _$jscoverage['/base/attr.js'].lineData[392] = 0;
  _$jscoverage['/base/attr.js'].lineData[393] = 0;
  _$jscoverage['/base/attr.js'].lineData[400] = 0;
  _$jscoverage['/base/attr.js'].lineData[403] = 0;
  _$jscoverage['/base/attr.js'].lineData[404] = 0;
  _$jscoverage['/base/attr.js'].lineData[405] = 0;
  _$jscoverage['/base/attr.js'].lineData[406] = 0;
  _$jscoverage['/base/attr.js'].lineData[407] = 0;
  _$jscoverage['/base/attr.js'].lineData[409] = 0;
  _$jscoverage['/base/attr.js'].lineData[410] = 0;
  _$jscoverage['/base/attr.js'].lineData[413] = 0;
  _$jscoverage['/base/attr.js'].lineData[418] = 0;
  _$jscoverage['/base/attr.js'].lineData[427] = 0;
  _$jscoverage['/base/attr.js'].lineData[428] = 0;
  _$jscoverage['/base/attr.js'].lineData[429] = 0;
  _$jscoverage['/base/attr.js'].lineData[432] = 0;
  _$jscoverage['/base/attr.js'].lineData[433] = 0;
  _$jscoverage['/base/attr.js'].lineData[434] = 0;
  _$jscoverage['/base/attr.js'].lineData[435] = 0;
  _$jscoverage['/base/attr.js'].lineData[437] = 0;
  _$jscoverage['/base/attr.js'].lineData[438] = 0;
  _$jscoverage['/base/attr.js'].lineData[453] = 0;
  _$jscoverage['/base/attr.js'].lineData[454] = 0;
  _$jscoverage['/base/attr.js'].lineData[460] = 0;
  _$jscoverage['/base/attr.js'].lineData[461] = 0;
  _$jscoverage['/base/attr.js'].lineData[462] = 0;
  _$jscoverage['/base/attr.js'].lineData[463] = 0;
  _$jscoverage['/base/attr.js'].lineData[464] = 0;
  _$jscoverage['/base/attr.js'].lineData[467] = 0;
  _$jscoverage['/base/attr.js'].lineData[470] = 0;
  _$jscoverage['/base/attr.js'].lineData[472] = 0;
  _$jscoverage['/base/attr.js'].lineData[474] = 0;
  _$jscoverage['/base/attr.js'].lineData[475] = 0;
  _$jscoverage['/base/attr.js'].lineData[478] = 0;
  _$jscoverage['/base/attr.js'].lineData[490] = 0;
  _$jscoverage['/base/attr.js'].lineData[493] = 0;
  _$jscoverage['/base/attr.js'].lineData[495] = 0;
  _$jscoverage['/base/attr.js'].lineData[497] = 0;
  _$jscoverage['/base/attr.js'].lineData[498] = 0;
  _$jscoverage['/base/attr.js'].lineData[500] = 0;
  _$jscoverage['/base/attr.js'].lineData[502] = 0;
  _$jscoverage['/base/attr.js'].lineData[505] = 0;
  _$jscoverage['/base/attr.js'].lineData[507] = 0;
  _$jscoverage['/base/attr.js'].lineData[514] = 0;
  _$jscoverage['/base/attr.js'].lineData[517] = 0;
  _$jscoverage['/base/attr.js'].lineData[518] = 0;
  _$jscoverage['/base/attr.js'].lineData[519] = 0;
  _$jscoverage['/base/attr.js'].lineData[520] = 0;
  _$jscoverage['/base/attr.js'].lineData[521] = 0;
  _$jscoverage['/base/attr.js'].lineData[524] = 0;
  _$jscoverage['/base/attr.js'].lineData[527] = 0;
  _$jscoverage['/base/attr.js'].lineData[528] = 0;
  _$jscoverage['/base/attr.js'].lineData[529] = 0;
  _$jscoverage['/base/attr.js'].lineData[530] = 0;
  _$jscoverage['/base/attr.js'].lineData[531] = 0;
  _$jscoverage['/base/attr.js'].lineData[532] = 0;
  _$jscoverage['/base/attr.js'].lineData[533] = 0;
  _$jscoverage['/base/attr.js'].lineData[537] = 0;
  _$jscoverage['/base/attr.js'].lineData[540] = 0;
  _$jscoverage['/base/attr.js'].lineData[541] = 0;
  _$jscoverage['/base/attr.js'].lineData[544] = 0;
  _$jscoverage['/base/attr.js'].lineData[556] = 0;
  _$jscoverage['/base/attr.js'].lineData[558] = 0;
  _$jscoverage['/base/attr.js'].lineData[560] = 0;
  _$jscoverage['/base/attr.js'].lineData[561] = 0;
  _$jscoverage['/base/attr.js'].lineData[563] = 0;
  _$jscoverage['/base/attr.js'].lineData[564] = 0;
  _$jscoverage['/base/attr.js'].lineData[565] = 0;
  _$jscoverage['/base/attr.js'].lineData[566] = 0;
  _$jscoverage['/base/attr.js'].lineData[567] = 0;
  _$jscoverage['/base/attr.js'].lineData[568] = 0;
  _$jscoverage['/base/attr.js'].lineData[569] = 0;
  _$jscoverage['/base/attr.js'].lineData[571] = 0;
  _$jscoverage['/base/attr.js'].lineData[572] = 0;
  _$jscoverage['/base/attr.js'].lineData[576] = 0;
  _$jscoverage['/base/attr.js'].lineData[580] = 0;
  _$jscoverage['/base/attr.js'].lineData[584] = 0;
}
if (! _$jscoverage['/base/attr.js'].functionData) {
  _$jscoverage['/base/attr.js'].functionData = [];
  _$jscoverage['/base/attr.js'].functionData[0] = 0;
  _$jscoverage['/base/attr.js'].functionData[1] = 0;
  _$jscoverage['/base/attr.js'].functionData[2] = 0;
  _$jscoverage['/base/attr.js'].functionData[3] = 0;
  _$jscoverage['/base/attr.js'].functionData[4] = 0;
  _$jscoverage['/base/attr.js'].functionData[5] = 0;
  _$jscoverage['/base/attr.js'].functionData[6] = 0;
  _$jscoverage['/base/attr.js'].functionData[7] = 0;
  _$jscoverage['/base/attr.js'].functionData[8] = 0;
  _$jscoverage['/base/attr.js'].functionData[9] = 0;
  _$jscoverage['/base/attr.js'].functionData[10] = 0;
  _$jscoverage['/base/attr.js'].functionData[11] = 0;
  _$jscoverage['/base/attr.js'].functionData[12] = 0;
  _$jscoverage['/base/attr.js'].functionData[13] = 0;
  _$jscoverage['/base/attr.js'].functionData[14] = 0;
  _$jscoverage['/base/attr.js'].functionData[15] = 0;
  _$jscoverage['/base/attr.js'].functionData[16] = 0;
  _$jscoverage['/base/attr.js'].functionData[17] = 0;
  _$jscoverage['/base/attr.js'].functionData[18] = 0;
  _$jscoverage['/base/attr.js'].functionData[19] = 0;
  _$jscoverage['/base/attr.js'].functionData[20] = 0;
  _$jscoverage['/base/attr.js'].functionData[21] = 0;
  _$jscoverage['/base/attr.js'].functionData[22] = 0;
  _$jscoverage['/base/attr.js'].functionData[23] = 0;
}
if (! _$jscoverage['/base/attr.js'].branchData) {
  _$jscoverage['/base/attr.js'].branchData = {};
  _$jscoverage['/base/attr.js'].branchData['10'] = [];
  _$jscoverage['/base/attr.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['41'] = [];
  _$jscoverage['/base/attr.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['43'] = [];
  _$jscoverage['/base/attr.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['44'] = [];
  _$jscoverage['/base/attr.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['82'] = [];
  _$jscoverage['/base/attr.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['87'] = [];
  _$jscoverage['/base/attr.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['88'] = [];
  _$jscoverage['/base/attr.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['115'] = [];
  _$jscoverage['/base/attr.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['118'] = [];
  _$jscoverage['/base/attr.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['120'] = [];
  _$jscoverage['/base/attr.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['128'] = [];
  _$jscoverage['/base/attr.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['129'] = [];
  _$jscoverage['/base/attr.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['144'] = [];
  _$jscoverage['/base/attr.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['159'] = [];
  _$jscoverage['/base/attr.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['162'] = [];
  _$jscoverage['/base/attr.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['179'] = [];
  _$jscoverage['/base/attr.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['181'] = [];
  _$jscoverage['/base/attr.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['227'] = [];
  _$jscoverage['/base/attr.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['235'] = [];
  _$jscoverage['/base/attr.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['237'] = [];
  _$jscoverage['/base/attr.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['238'] = [];
  _$jscoverage['/base/attr.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['240'] = [];
  _$jscoverage['/base/attr.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['247'] = [];
  _$jscoverage['/base/attr.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['265'] = [];
  _$jscoverage['/base/attr.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['267'] = [];
  _$jscoverage['/base/attr.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['280'] = [];
  _$jscoverage['/base/attr.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['284'] = [];
  _$jscoverage['/base/attr.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['345'] = [];
  _$jscoverage['/base/attr.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['354'] = [];
  _$jscoverage['/base/attr.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['361'] = [];
  _$jscoverage['/base/attr.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['366'] = [];
  _$jscoverage['/base/attr.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['368'] = [];
  _$jscoverage['/base/attr.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['372'] = [];
  _$jscoverage['/base/attr.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['378'] = [];
  _$jscoverage['/base/attr.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['379'] = [];
  _$jscoverage['/base/attr.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['379'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['381'] = [];
  _$jscoverage['/base/attr.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['384'] = [];
  _$jscoverage['/base/attr.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['390'] = [];
  _$jscoverage['/base/attr.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['392'] = [];
  _$jscoverage['/base/attr.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['400'] = [];
  _$jscoverage['/base/attr.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['403'] = [];
  _$jscoverage['/base/attr.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['405'] = [];
  _$jscoverage['/base/attr.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['405'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['406'] = [];
  _$jscoverage['/base/attr.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['409'] = [];
  _$jscoverage['/base/attr.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['428'] = [];
  _$jscoverage['/base/attr.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['432'] = [];
  _$jscoverage['/base/attr.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['434'] = [];
  _$jscoverage['/base/attr.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['437'] = [];
  _$jscoverage['/base/attr.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['437'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['451'] = [];
  _$jscoverage['/base/attr.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['460'] = [];
  _$jscoverage['/base/attr.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['463'] = [];
  _$jscoverage['/base/attr.js'].branchData['463'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['472'] = [];
  _$jscoverage['/base/attr.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['474'] = [];
  _$jscoverage['/base/attr.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['493'] = [];
  _$jscoverage['/base/attr.js'].branchData['493'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['497'] = [];
  _$jscoverage['/base/attr.js'].branchData['497'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['498'] = [];
  _$jscoverage['/base/attr.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['500'] = [];
  _$jscoverage['/base/attr.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['500'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['501'] = [];
  _$jscoverage['/base/attr.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['507'] = [];
  _$jscoverage['/base/attr.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['511'] = [];
  _$jscoverage['/base/attr.js'].branchData['511'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['518'] = [];
  _$jscoverage['/base/attr.js'].branchData['518'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['520'] = [];
  _$jscoverage['/base/attr.js'].branchData['520'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['527'] = [];
  _$jscoverage['/base/attr.js'].branchData['527'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['529'] = [];
  _$jscoverage['/base/attr.js'].branchData['529'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['531'] = [];
  _$jscoverage['/base/attr.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['533'] = [];
  _$jscoverage['/base/attr.js'].branchData['533'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['537'] = [];
  _$jscoverage['/base/attr.js'].branchData['537'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['540'] = [];
  _$jscoverage['/base/attr.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['540'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['540'][3] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['558'] = [];
  _$jscoverage['/base/attr.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['564'] = [];
  _$jscoverage['/base/attr.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['567'] = [];
  _$jscoverage['/base/attr.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['571'] = [];
  _$jscoverage['/base/attr.js'].branchData['571'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['571'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['571'][3] = new BranchData();
}
_$jscoverage['/base/attr.js'].branchData['571'][3].init(377, 39, 'nodeType == NodeType.CDATA_SECTION_NODE');
function visit99_571_3(result) {
  _$jscoverage['/base/attr.js'].branchData['571'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['571'][2].init(343, 30, 'nodeType == NodeType.TEXT_NODE');
function visit98_571_2(result) {
  _$jscoverage['/base/attr.js'].branchData['571'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['571'][1].init(343, 73, 'nodeType == NodeType.TEXT_NODE || nodeType == NodeType.CDATA_SECTION_NODE');
function visit97_571_1(result) {
  _$jscoverage['/base/attr.js'].branchData['571'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['567'][1].init(117, 33, 'nodeType == NodeType.ELEMENT_NODE');
function visit96_567_1(result) {
  _$jscoverage['/base/attr.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['564'][1].init(95, 6, 'i >= 0');
function visit95_564_1(result) {
  _$jscoverage['/base/attr.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['558'][1].init(92, 17, 'val === undefined');
function visit94_558_1(result) {
  _$jscoverage['/base/attr.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['540'][3].init(885, 42, 'hook.set(elem, val, \'value\') === undefined');
function visit93_540_3(result) {
  _$jscoverage['/base/attr.js'].branchData['540'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['540'][2].init(865, 62, '!(\'set\' in hook) || hook.set(elem, val, \'value\') === undefined');
function visit92_540_2(result) {
  _$jscoverage['/base/attr.js'].branchData['540'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['540'][1].init(856, 71, '!hook || !(\'set\' in hook) || hook.set(elem, val, \'value\') === undefined');
function visit91_540_1(result) {
  _$jscoverage['/base/attr.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['537'][1].init(699, 50, 'valHooks[nodeName(elem)] || valHooks[elem.type]');
function visit90_537_1(result) {
  _$jscoverage['/base/attr.js'].branchData['537'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['533'][1].init(37, 13, 'value == null');
function visit89_533_1(result) {
  _$jscoverage['/base/attr.js'].branchData['533'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['531'][1].init(471, 14, 'S.isArray(val)');
function visit88_531_1(result) {
  _$jscoverage['/base/attr.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['529'][1].init(375, 23, 'typeof val === \'number\'');
function visit87_529_1(result) {
  _$jscoverage['/base/attr.js'].branchData['529'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['527'][1].init(292, 11, 'val == null');
function visit86_527_1(result) {
  _$jscoverage['/base/attr.js'].branchData['527'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['520'][1].init(62, 19, 'elem.nodeType !== 1');
function visit85_520_1(result) {
  _$jscoverage['/base/attr.js'].branchData['520'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['518'][1].init(1030, 6, 'i >= 0');
function visit84_518_1(result) {
  _$jscoverage['/base/attr.js'].branchData['518'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['511'][1].init(260, 11, 'ret == null');
function visit83_511_1(result) {
  _$jscoverage['/base/attr.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['507'][1].init(367, 23, 'typeof ret === \'string\'');
function visit82_507_1(result) {
  _$jscoverage['/base/attr.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['501'][1].init(46, 44, '(ret = hook.get(elem, \'value\')) !== undefined');
function visit81_501_1(result) {
  _$jscoverage['/base/attr.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['500'][2].init(125, 91, '\'get\' in hook && (ret = hook.get(elem, \'value\')) !== undefined');
function visit80_500_2(result) {
  _$jscoverage['/base/attr.js'].branchData['500'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['500'][1].init(117, 99, 'hook && \'get\' in hook && (ret = hook.get(elem, \'value\')) !== undefined');
function visit79_500_1(result) {
  _$jscoverage['/base/attr.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['498'][1].init(33, 51, 'valHooks[nodeName(elem)] || valHooks[elem.type]');
function visit78_498_1(result) {
  _$jscoverage['/base/attr.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['497'][1].init(77, 4, 'elem');
function visit77_497_1(result) {
  _$jscoverage['/base/attr.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['493'][1].init(101, 19, 'value === undefined');
function visit76_493_1(result) {
  _$jscoverage['/base/attr.js'].branchData['493'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['474'][1].init(64, 27, 'elems[i].hasAttribute(name)');
function visit75_474_1(result) {
  _$jscoverage['/base/attr.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['472'][1].init(136, 7, 'i < len');
function visit74_472_1(result) {
  _$jscoverage['/base/attr.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['463'][1].init(133, 30, 'attrNode && attrNode.specified');
function visit73_463_1(result) {
  _$jscoverage['/base/attr.js'].branchData['463'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['460'][1].init(415, 16, 'i < elems.length');
function visit72_460_1(result) {
  _$jscoverage['/base/attr.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['451'][1].init(10618, 38, 'docElement && !docElement.hasAttribute');
function visit71_451_1(result) {
  _$jscoverage['/base/attr.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['437'][2].init(204, 23, 'propFix[name] || name');
function visit70_437_2(result) {
  _$jscoverage['/base/attr.js'].branchData['437'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['437'][1].init(168, 66, 'R_BOOLEAN.test(name) && (propName = propFix[name] || name) in el');
function visit69_437_1(result) {
  _$jscoverage['/base/attr.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['434'][1].init(60, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit68_434_1(result) {
  _$jscoverage['/base/attr.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['432'][1].init(241, 6, 'i >= 0');
function visit67_432_1(result) {
  _$jscoverage['/base/attr.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['428'][1].init(69, 21, 'attrFix[name] || name');
function visit66_428_1(result) {
  _$jscoverage['/base/attr.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['409'][1].init(188, 36, 'attrNormalizer && attrNormalizer.set');
function visit65_409_1(result) {
  _$jscoverage['/base/attr.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['406'][1].init(34, 22, 'nodeName(el) == \'form\'');
function visit64_406_1(result) {
  _$jscoverage['/base/attr.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['405'][2].init(74, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit63_405_2(result) {
  _$jscoverage['/base/attr.js'].branchData['405'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['405'][1].init(68, 43, 'el && el.nodeType === NodeType.ELEMENT_NODE');
function visit62_405_1(result) {
  _$jscoverage['/base/attr.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['403'][1].init(47, 6, 'i >= 0');
function visit61_403_1(result) {
  _$jscoverage['/base/attr.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['400'][1].init(1004, 12, 'ret === null');
function visit60_400_1(result) {
  _$jscoverage['/base/attr.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['392'][1].init(105, 32, '!attrNode || !attrNode.specified');
function visit59_392_1(result) {
  _$jscoverage['/base/attr.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['390'][1].init(494, 10, 'ret === ""');
function visit58_390_1(result) {
  _$jscoverage['/base/attr.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['384'][1].init(274, 36, 'attrNormalizer && attrNormalizer.get');
function visit57_384_1(result) {
  _$jscoverage['/base/attr.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['381'][1].init(132, 22, 'nodeName(el) == \'form\'');
function visit56_381_1(result) {
  _$jscoverage['/base/attr.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['379'][2].init(32, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit55_379_2(result) {
  _$jscoverage['/base/attr.js'].branchData['379'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['379'][1].init(26, 43, 'el && el.nodeType === NodeType.ELEMENT_NODE');
function visit54_379_1(result) {
  _$jscoverage['/base/attr.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['378'][1].init(2942, 17, 'val === undefined');
function visit53_378_1(result) {
  _$jscoverage['/base/attr.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['372'][1].init(2739, 25, 'R_INVALID_CHAR.test(name)');
function visit52_372_1(result) {
  _$jscoverage['/base/attr.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['368'][1].init(2588, 20, 'R_BOOLEAN.test(name)');
function visit51_368_1(result) {
  _$jscoverage['/base/attr.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['366'][1].init(2542, 21, 'attrFix[name] || name');
function visit50_366_1(result) {
  _$jscoverage['/base/attr.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['361'][1].init(2386, 20, 'pass && attrFn[name]');
function visit49_361_1(result) {
  _$jscoverage['/base/attr.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['354'][1].init(2189, 20, 'pass && attrFn[name]');
function visit48_354_1(result) {
  _$jscoverage['/base/attr.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['345'][1].init(1891, 21, 'S.isPlainObject(name)');
function visit47_345_1(result) {
  _$jscoverage['/base/attr.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['284'][1].init(193, 6, 'i >= 0');
function visit46_284_1(result) {
  _$jscoverage['/base/attr.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['280'][1].init(25, 23, 'propFix[name] || name');
function visit45_280_1(result) {
  _$jscoverage['/base/attr.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['267'][1].init(62, 31, 'getProp(el, name) !== undefined');
function visit44_267_1(result) {
  _$jscoverage['/base/attr.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['265'][1].init(170, 7, 'i < len');
function visit43_265_1(result) {
  _$jscoverage['/base/attr.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['247'][1].init(26, 12, 'elems.length');
function visit42_247_1(result) {
  _$jscoverage['/base/attr.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['240'][1].init(72, 16, 'hook && hook.set');
function visit41_240_1(result) {
  _$jscoverage['/base/attr.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['238'][1].init(49, 6, 'i >= 0');
function visit40_238_1(result) {
  _$jscoverage['/base/attr.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['237'][1].init(559, 19, 'value !== undefined');
function visit39_237_1(result) {
  _$jscoverage['/base/attr.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['235'][1].init(470, 23, 'propFix[name] || name');
function visit38_235_1(result) {
  _$jscoverage['/base/attr.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['227'][1].init(186, 21, 'S.isPlainObject(name)');
function visit37_227_1(result) {
  _$jscoverage['/base/attr.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['181'][1].init(90, 16, 'hook && hook.get');
function visit36_181_1(result) {
  _$jscoverage['/base/attr.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['179'][1].init(17, 21, 'propFix[name] || name');
function visit35_179_1(result) {
  _$jscoverage['/base/attr.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['162'][1].init(22, 16, 'S.isArray(value)');
function visit34_162_1(result) {
  _$jscoverage['/base/attr.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['159'][1].init(155, 35, 'elem.getAttribute(\'value\') === null');
function visit33_159_1(result) {
  _$jscoverage['/base/attr.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['144'][1].init(277, 14, '!values.length');
function visit32_144_1(result) {
  _$jscoverage['/base/attr.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['129'][1].init(30, 19, 'options[i].selected');
function visit31_129_1(result) {
  _$jscoverage['/base/attr.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['128'][1].init(696, 7, 'i < len');
function visit30_128_1(result) {
  _$jscoverage['/base/attr.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['120'][1].init(416, 3, 'one');
function visit29_120_1(result) {
  _$jscoverage['/base/attr.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['118'][1].init(332, 9, 'index < 0');
function visit28_118_1(result) {
  _$jscoverage['/base/attr.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['115'][1].init(200, 34, 'String(elem.type) === \'select-one\'');
function visit27_115_1(result) {
  _$jscoverage['/base/attr.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['88'][1].init(131, 16, 'propName in elem');
function visit26_88_1(result) {
  _$jscoverage['/base/attr.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['87'][1].init(81, 23, 'propFix[name] || name');
function visit25_87_1(result) {
  _$jscoverage['/base/attr.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['82'][1].init(53, 15, 'value === false');
function visit24_82_1(result) {
  _$jscoverage['/base/attr.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['44'][1].init(61, 40, 'R_CLICKABLE.test(el.nodeName) && el.href');
function visit23_44_1(result) {
  _$jscoverage['/base/attr.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['43'][1].init(-1, 102, 'R_FOCUSABLE.test(el.nodeName) || R_CLICKABLE.test(el.nodeName) && el.href');
function visit22_43_1(result) {
  _$jscoverage['/base/attr.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['41'][1].init(216, 40, 'attributeNode && attributeNode.specified');
function visit21_41_1(result) {
  _$jscoverage['/base/attr.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['10'][1].init(86, 26, 'doc && doc.documentElement');
function visit20_10_1(result) {
  _$jscoverage['/base/attr.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].lineData[6]++;
KISSY.add('dom/base/attr', function(S, Dom, undefined) {
  _$jscoverage['/base/attr.js'].functionData[0]++;
  _$jscoverage['/base/attr.js'].lineData[8]++;
  var doc = S.Env.host.document, NodeType = Dom.NodeType, docElement = visit20_10_1(doc && doc.documentElement), EMPTY = '', nodeName = Dom.nodeName, R_BOOLEAN = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i, R_FOCUSABLE = /^(?:button|input|object|select|textarea)$/i, R_CLICKABLE = /^a(?:rea)?$/i, R_INVALID_CHAR = /:|^on/, R_RETURN = /\r/g, attrFix = {}, attrFn = {
  val: 1, 
  css: 1, 
  html: 1, 
  text: 1, 
  data: 1, 
  width: 1, 
  height: 1, 
  offset: 1, 
  scrollTop: 1, 
  scrollLeft: 1}, attrHooks = {
  tabindex: {
  get: function(el) {
  _$jscoverage['/base/attr.js'].functionData[1]++;
  _$jscoverage['/base/attr.js'].lineData[40]++;
  var attributeNode = el.getAttributeNode('tabindex');
  _$jscoverage['/base/attr.js'].lineData[41]++;
  return visit21_41_1(attributeNode && attributeNode.specified) ? parseInt(attributeNode.value, 10) : visit22_43_1(R_FOCUSABLE.test(el.nodeName) || visit23_44_1(R_CLICKABLE.test(el.nodeName) && el.href)) ? 0 : undefined;
}}}, propFix = {
  'hidefocus': 'hideFocus', 
  tabindex: 'tabIndex', 
  readonly: 'readOnly', 
  'for': 'htmlFor', 
  'class': 'className', 
  maxlength: 'maxLength', 
  'cellspacing': 'cellSpacing', 
  'cellpadding': 'cellPadding', 
  rowspan: 'rowSpan', 
  colspan: 'colSpan', 
  usemap: 'useMap', 
  'frameborder': 'frameBorder', 
  'contenteditable': 'contentEditable'}, boolHook = {
  get: function(elem, name) {
  _$jscoverage['/base/attr.js'].functionData[2]++;
  _$jscoverage['/base/attr.js'].lineData[75]++;
  return Dom.prop(elem, name) ? name.toLowerCase() : undefined;
}, 
  set: function(elem, value, name) {
  _$jscoverage['/base/attr.js'].functionData[3]++;
  _$jscoverage['/base/attr.js'].lineData[81]++;
  var propName;
  _$jscoverage['/base/attr.js'].lineData[82]++;
  if (visit24_82_1(value === false)) {
    _$jscoverage['/base/attr.js'].lineData[84]++;
    Dom.removeAttr(elem, name);
  } else {
    _$jscoverage['/base/attr.js'].lineData[87]++;
    propName = visit25_87_1(propFix[name] || name);
    _$jscoverage['/base/attr.js'].lineData[88]++;
    if (visit26_88_1(propName in elem)) {
      _$jscoverage['/base/attr.js'].lineData[90]++;
      elem[propName] = true;
    }
    _$jscoverage['/base/attr.js'].lineData[92]++;
    elem.setAttribute(name, name.toLowerCase());
  }
  _$jscoverage['/base/attr.js'].lineData[94]++;
  return name;
}}, propHooks = {}, attrNodeHook = {}, valHooks = {
  select: {
  get: function(elem) {
  _$jscoverage['/base/attr.js'].functionData[4]++;
  _$jscoverage['/base/attr.js'].lineData[110]++;
  var index = elem.selectedIndex, options = elem.options, ret, i, len, one = (visit27_115_1(String(elem.type) === 'select-one'));
  _$jscoverage['/base/attr.js'].lineData[118]++;
  if (visit28_118_1(index < 0)) {
    _$jscoverage['/base/attr.js'].lineData[119]++;
    return null;
  } else {
    _$jscoverage['/base/attr.js'].lineData[120]++;
    if (visit29_120_1(one)) {
      _$jscoverage['/base/attr.js'].lineData[121]++;
      return Dom.val(options[index]);
    }
  }
  _$jscoverage['/base/attr.js'].lineData[125]++;
  ret = [];
  _$jscoverage['/base/attr.js'].lineData[126]++;
  i = 0;
  _$jscoverage['/base/attr.js'].lineData[127]++;
  len = options.length;
  _$jscoverage['/base/attr.js'].lineData[128]++;
  for (; visit30_128_1(i < len); ++i) {
    _$jscoverage['/base/attr.js'].lineData[129]++;
    if (visit31_129_1(options[i].selected)) {
      _$jscoverage['/base/attr.js'].lineData[130]++;
      ret.push(Dom.val(options[i]));
    }
  }
  _$jscoverage['/base/attr.js'].lineData[134]++;
  return ret;
}, 
  set: function(elem, value) {
  _$jscoverage['/base/attr.js'].functionData[5]++;
  _$jscoverage['/base/attr.js'].lineData[138]++;
  var values = S.makeArray(value), opts = elem.options;
  _$jscoverage['/base/attr.js'].lineData[140]++;
  S.each(opts, function(opt) {
  _$jscoverage['/base/attr.js'].functionData[6]++;
  _$jscoverage['/base/attr.js'].lineData[141]++;
  opt.selected = S.inArray(Dom.val(opt), values);
});
  _$jscoverage['/base/attr.js'].lineData[144]++;
  if (visit32_144_1(!values.length)) {
    _$jscoverage['/base/attr.js'].lineData[145]++;
    elem.selectedIndex = -1;
  }
  _$jscoverage['/base/attr.js'].lineData[147]++;
  return values;
}}};
  _$jscoverage['/base/attr.js'].lineData[154]++;
  S.each(['radio', 'checkbox'], function(r) {
  _$jscoverage['/base/attr.js'].functionData[7]++;
  _$jscoverage['/base/attr.js'].lineData[155]++;
  valHooks[r] = {
  get: function(elem) {
  _$jscoverage['/base/attr.js'].functionData[8]++;
  _$jscoverage['/base/attr.js'].lineData[159]++;
  return visit33_159_1(elem.getAttribute('value') === null) ? 'on' : elem.value;
}, 
  set: function(elem, value) {
  _$jscoverage['/base/attr.js'].functionData[9]++;
  _$jscoverage['/base/attr.js'].lineData[162]++;
  if (visit34_162_1(S.isArray(value))) {
    _$jscoverage['/base/attr.js'].lineData[163]++;
    return elem.checked = S.inArray(Dom.val(elem), value);
  }
  _$jscoverage['/base/attr.js'].lineData[165]++;
  return undefined;
}};
});
  _$jscoverage['/base/attr.js'].lineData[172]++;
  attrHooks['style'] = {
  get: function(el) {
  _$jscoverage['/base/attr.js'].functionData[10]++;
  _$jscoverage['/base/attr.js'].lineData[174]++;
  return el.style.cssText;
}};
  _$jscoverage['/base/attr.js'].lineData[178]++;
  function getProp(elem, name) {
    _$jscoverage['/base/attr.js'].functionData[11]++;
    _$jscoverage['/base/attr.js'].lineData[179]++;
    name = visit35_179_1(propFix[name] || name);
    _$jscoverage['/base/attr.js'].lineData[180]++;
    var hook = propHooks[name];
    _$jscoverage['/base/attr.js'].lineData[181]++;
    if (visit36_181_1(hook && hook.get)) {
      _$jscoverage['/base/attr.js'].lineData[182]++;
      return hook.get(elem, name);
    } else {
      _$jscoverage['/base/attr.js'].lineData[184]++;
      return elem[name];
    }
  }
  _$jscoverage['/base/attr.js'].lineData[188]++;
  S.mix(Dom, {
  _valHooks: valHooks, 
  _propFix: propFix, 
  _attrHooks: attrHooks, 
  _propHooks: propHooks, 
  _attrNodeHook: attrNodeHook, 
  _attrFix: attrFix, 
  prop: function(selector, name, value) {
  _$jscoverage['/base/attr.js'].functionData[12]++;
  _$jscoverage['/base/attr.js'].lineData[221]++;
  var elems = Dom.query(selector), i, elem, hook;
  _$jscoverage['/base/attr.js'].lineData[227]++;
  if (visit37_227_1(S.isPlainObject(name))) {
    _$jscoverage['/base/attr.js'].lineData[228]++;
    S.each(name, function(v, k) {
  _$jscoverage['/base/attr.js'].functionData[13]++;
  _$jscoverage['/base/attr.js'].lineData[229]++;
  Dom.prop(elems, k, v);
});
    _$jscoverage['/base/attr.js'].lineData[231]++;
    return undefined;
  }
  _$jscoverage['/base/attr.js'].lineData[235]++;
  name = visit38_235_1(propFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[236]++;
  hook = propHooks[name];
  _$jscoverage['/base/attr.js'].lineData[237]++;
  if (visit39_237_1(value !== undefined)) {
    _$jscoverage['/base/attr.js'].lineData[238]++;
    for (i = elems.length - 1; visit40_238_1(i >= 0); i--) {
      _$jscoverage['/base/attr.js'].lineData[239]++;
      elem = elems[i];
      _$jscoverage['/base/attr.js'].lineData[240]++;
      if (visit41_240_1(hook && hook.set)) {
        _$jscoverage['/base/attr.js'].lineData[241]++;
        hook.set(elem, value, name);
      } else {
        _$jscoverage['/base/attr.js'].lineData[243]++;
        elem[name] = value;
      }
    }
  } else {
    _$jscoverage['/base/attr.js'].lineData[247]++;
    if (visit42_247_1(elems.length)) {
      _$jscoverage['/base/attr.js'].lineData[248]++;
      return getProp(elems[0], name);
    }
  }
  _$jscoverage['/base/attr.js'].lineData[251]++;
  return undefined;
}, 
  hasProp: function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[14]++;
  _$jscoverage['/base/attr.js'].lineData[261]++;
  var elems = Dom.query(selector), i, len = elems.length, el;
  _$jscoverage['/base/attr.js'].lineData[265]++;
  for (i = 0; visit43_265_1(i < len); i++) {
    _$jscoverage['/base/attr.js'].lineData[266]++;
    el = elems[i];
    _$jscoverage['/base/attr.js'].lineData[267]++;
    if (visit44_267_1(getProp(el, name) !== undefined)) {
      _$jscoverage['/base/attr.js'].lineData[268]++;
      return true;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[271]++;
  return false;
}, 
  removeProp: function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[15]++;
  _$jscoverage['/base/attr.js'].lineData[280]++;
  name = visit45_280_1(propFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[281]++;
  var elems = Dom.query(selector), i, el;
  _$jscoverage['/base/attr.js'].lineData[284]++;
  for (i = elems.length - 1; visit46_284_1(i >= 0); i--) {
    _$jscoverage['/base/attr.js'].lineData[285]++;
    el = elems[i];
    _$jscoverage['/base/attr.js'].lineData[286]++;
    try {
      _$jscoverage['/base/attr.js'].lineData[287]++;
      el[name] = undefined;
      _$jscoverage['/base/attr.js'].lineData[288]++;
      delete el[name];
    }    catch (e) {
}
  }
}, 
  attr: function(selector, name, val, pass) {
  _$jscoverage['/base/attr.js'].functionData[16]++;
  _$jscoverage['/base/attr.js'].lineData[338]++;
  var els = Dom.query(selector), attrNormalizer, i, el = els[0], ret;
  _$jscoverage['/base/attr.js'].lineData[345]++;
  if (visit47_345_1(S.isPlainObject(name))) {
    _$jscoverage['/base/attr.js'].lineData[346]++;
    pass = val;
    _$jscoverage['/base/attr.js'].lineData[347]++;
    for (var k in name) {
      _$jscoverage['/base/attr.js'].lineData[348]++;
      Dom.attr(els, k, name[k], pass);
    }
    _$jscoverage['/base/attr.js'].lineData[350]++;
    return undefined;
  }
  _$jscoverage['/base/attr.js'].lineData[354]++;
  if (visit48_354_1(pass && attrFn[name])) {
    _$jscoverage['/base/attr.js'].lineData[355]++;
    return Dom[name](selector, val);
  }
  _$jscoverage['/base/attr.js'].lineData[359]++;
  name = name.toLowerCase();
  _$jscoverage['/base/attr.js'].lineData[361]++;
  if (visit49_361_1(pass && attrFn[name])) {
    _$jscoverage['/base/attr.js'].lineData[362]++;
    return Dom[name](selector, val);
  }
  _$jscoverage['/base/attr.js'].lineData[366]++;
  name = visit50_366_1(attrFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[368]++;
  if (visit51_368_1(R_BOOLEAN.test(name))) {
    _$jscoverage['/base/attr.js'].lineData[369]++;
    attrNormalizer = boolHook;
  } else {
    _$jscoverage['/base/attr.js'].lineData[372]++;
    if (visit52_372_1(R_INVALID_CHAR.test(name))) {
      _$jscoverage['/base/attr.js'].lineData[373]++;
      attrNormalizer = attrNodeHook;
    } else {
      _$jscoverage['/base/attr.js'].lineData[375]++;
      attrNormalizer = attrHooks[name];
    }
  }
  _$jscoverage['/base/attr.js'].lineData[378]++;
  if (visit53_378_1(val === undefined)) {
    _$jscoverage['/base/attr.js'].lineData[379]++;
    if (visit54_379_1(el && visit55_379_2(el.nodeType === NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/attr.js'].lineData[381]++;
      if (visit56_381_1(nodeName(el) == 'form')) {
        _$jscoverage['/base/attr.js'].lineData[382]++;
        attrNormalizer = attrNodeHook;
      }
      _$jscoverage['/base/attr.js'].lineData[384]++;
      if (visit57_384_1(attrNormalizer && attrNormalizer.get)) {
        _$jscoverage['/base/attr.js'].lineData[385]++;
        return attrNormalizer.get(el, name);
      }
      _$jscoverage['/base/attr.js'].lineData[388]++;
      ret = el.getAttribute(name);
      _$jscoverage['/base/attr.js'].lineData[390]++;
      if (visit58_390_1(ret === "")) {
        _$jscoverage['/base/attr.js'].lineData[391]++;
        var attrNode = el.getAttributeNode(name);
        _$jscoverage['/base/attr.js'].lineData[392]++;
        if (visit59_392_1(!attrNode || !attrNode.specified)) {
          _$jscoverage['/base/attr.js'].lineData[393]++;
          return undefined;
        }
      }
      _$jscoverage['/base/attr.js'].lineData[400]++;
      return visit60_400_1(ret === null) ? undefined : ret;
    }
  } else {
    _$jscoverage['/base/attr.js'].lineData[403]++;
    for (i = els.length - 1; visit61_403_1(i >= 0); i--) {
      _$jscoverage['/base/attr.js'].lineData[404]++;
      el = els[i];
      _$jscoverage['/base/attr.js'].lineData[405]++;
      if (visit62_405_1(el && visit63_405_2(el.nodeType === NodeType.ELEMENT_NODE))) {
        _$jscoverage['/base/attr.js'].lineData[406]++;
        if (visit64_406_1(nodeName(el) == 'form')) {
          _$jscoverage['/base/attr.js'].lineData[407]++;
          attrNormalizer = attrNodeHook;
        }
        _$jscoverage['/base/attr.js'].lineData[409]++;
        if (visit65_409_1(attrNormalizer && attrNormalizer.set)) {
          _$jscoverage['/base/attr.js'].lineData[410]++;
          attrNormalizer.set(el, val, name);
        } else {
          _$jscoverage['/base/attr.js'].lineData[413]++;
          el.setAttribute(name, EMPTY + val);
        }
      }
    }
  }
  _$jscoverage['/base/attr.js'].lineData[418]++;
  return undefined;
}, 
  removeAttr: function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[17]++;
  _$jscoverage['/base/attr.js'].lineData[427]++;
  name = name.toLowerCase();
  _$jscoverage['/base/attr.js'].lineData[428]++;
  name = visit66_428_1(attrFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[429]++;
  var els = Dom.query(selector), propName, el, i;
  _$jscoverage['/base/attr.js'].lineData[432]++;
  for (i = els.length - 1; visit67_432_1(i >= 0); i--) {
    _$jscoverage['/base/attr.js'].lineData[433]++;
    el = els[i];
    _$jscoverage['/base/attr.js'].lineData[434]++;
    if (visit68_434_1(el.nodeType == NodeType.ELEMENT_NODE)) {
      _$jscoverage['/base/attr.js'].lineData[435]++;
      el.removeAttribute(name);
      _$jscoverage['/base/attr.js'].lineData[437]++;
      if (visit69_437_1(R_BOOLEAN.test(name) && (propName = visit70_437_2(propFix[name] || name)) in el)) {
        _$jscoverage['/base/attr.js'].lineData[438]++;
        el[propName] = false;
      }
    }
  }
}, 
  hasAttr: visit71_451_1(docElement && !docElement.hasAttribute) ? function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[18]++;
  _$jscoverage['/base/attr.js'].lineData[453]++;
  name = name.toLowerCase();
  _$jscoverage['/base/attr.js'].lineData[454]++;
  var elems = Dom.query(selector), i, el, attrNode;
  _$jscoverage['/base/attr.js'].lineData[460]++;
  for (i = 0; visit72_460_1(i < elems.length); i++) {
    _$jscoverage['/base/attr.js'].lineData[461]++;
    el = elems[i];
    _$jscoverage['/base/attr.js'].lineData[462]++;
    attrNode = el.getAttributeNode(name);
    _$jscoverage['/base/attr.js'].lineData[463]++;
    if (visit73_463_1(attrNode && attrNode.specified)) {
      _$jscoverage['/base/attr.js'].lineData[464]++;
      return true;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[467]++;
  return false;
} : function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[19]++;
  _$jscoverage['/base/attr.js'].lineData[470]++;
  var elems = Dom.query(selector), i, len = elems.length;
  _$jscoverage['/base/attr.js'].lineData[472]++;
  for (i = 0; visit74_472_1(i < len); i++) {
    _$jscoverage['/base/attr.js'].lineData[474]++;
    if (visit75_474_1(elems[i].hasAttribute(name))) {
      _$jscoverage['/base/attr.js'].lineData[475]++;
      return true;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[478]++;
  return false;
}, 
  val: function(selector, value) {
  _$jscoverage['/base/attr.js'].functionData[20]++;
  _$jscoverage['/base/attr.js'].lineData[490]++;
  var hook, ret, elem, els, i, val;
  _$jscoverage['/base/attr.js'].lineData[493]++;
  if (visit76_493_1(value === undefined)) {
    _$jscoverage['/base/attr.js'].lineData[495]++;
    elem = Dom.get(selector);
    _$jscoverage['/base/attr.js'].lineData[497]++;
    if (visit77_497_1(elem)) {
      _$jscoverage['/base/attr.js'].lineData[498]++;
      hook = visit78_498_1(valHooks[nodeName(elem)] || valHooks[elem.type]);
      _$jscoverage['/base/attr.js'].lineData[500]++;
      if (visit79_500_1(hook && visit80_500_2('get' in hook && visit81_501_1((ret = hook.get(elem, 'value')) !== undefined)))) {
        _$jscoverage['/base/attr.js'].lineData[502]++;
        return ret;
      }
      _$jscoverage['/base/attr.js'].lineData[505]++;
      ret = elem.value;
      _$jscoverage['/base/attr.js'].lineData[507]++;
      return visit82_507_1(typeof ret === 'string') ? ret.replace(R_RETURN, '') : visit83_511_1(ret == null) ? '' : ret;
    }
    _$jscoverage['/base/attr.js'].lineData[514]++;
    return undefined;
  }
  _$jscoverage['/base/attr.js'].lineData[517]++;
  els = Dom.query(selector);
  _$jscoverage['/base/attr.js'].lineData[518]++;
  for (i = els.length - 1; visit84_518_1(i >= 0); i--) {
    _$jscoverage['/base/attr.js'].lineData[519]++;
    elem = els[i];
    _$jscoverage['/base/attr.js'].lineData[520]++;
    if (visit85_520_1(elem.nodeType !== 1)) {
      _$jscoverage['/base/attr.js'].lineData[521]++;
      return undefined;
    }
    _$jscoverage['/base/attr.js'].lineData[524]++;
    val = value;
    _$jscoverage['/base/attr.js'].lineData[527]++;
    if (visit86_527_1(val == null)) {
      _$jscoverage['/base/attr.js'].lineData[528]++;
      val = '';
    } else {
      _$jscoverage['/base/attr.js'].lineData[529]++;
      if (visit87_529_1(typeof val === 'number')) {
        _$jscoverage['/base/attr.js'].lineData[530]++;
        val += '';
      } else {
        _$jscoverage['/base/attr.js'].lineData[531]++;
        if (visit88_531_1(S.isArray(val))) {
          _$jscoverage['/base/attr.js'].lineData[532]++;
          val = S.map(val, function(value) {
  _$jscoverage['/base/attr.js'].functionData[21]++;
  _$jscoverage['/base/attr.js'].lineData[533]++;
  return visit89_533_1(value == null) ? '' : value + '';
});
        }
      }
    }
    _$jscoverage['/base/attr.js'].lineData[537]++;
    hook = visit90_537_1(valHooks[nodeName(elem)] || valHooks[elem.type]);
    _$jscoverage['/base/attr.js'].lineData[540]++;
    if (visit91_540_1(!hook || visit92_540_2(!('set' in hook) || visit93_540_3(hook.set(elem, val, 'value') === undefined)))) {
      _$jscoverage['/base/attr.js'].lineData[541]++;
      elem.value = val;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[544]++;
  return undefined;
}, 
  text: function(selector, val) {
  _$jscoverage['/base/attr.js'].functionData[22]++;
  _$jscoverage['/base/attr.js'].lineData[556]++;
  var el, els, i, nodeType;
  _$jscoverage['/base/attr.js'].lineData[558]++;
  if (visit94_558_1(val === undefined)) {
    _$jscoverage['/base/attr.js'].lineData[560]++;
    el = Dom.get(selector);
    _$jscoverage['/base/attr.js'].lineData[561]++;
    return Dom._getText(el);
  } else {
    _$jscoverage['/base/attr.js'].lineData[563]++;
    els = Dom.query(selector);
    _$jscoverage['/base/attr.js'].lineData[564]++;
    for (i = els.length - 1; visit95_564_1(i >= 0); i--) {
      _$jscoverage['/base/attr.js'].lineData[565]++;
      el = els[i];
      _$jscoverage['/base/attr.js'].lineData[566]++;
      nodeType = el.nodeType;
      _$jscoverage['/base/attr.js'].lineData[567]++;
      if (visit96_567_1(nodeType == NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/attr.js'].lineData[568]++;
        Dom.empty(el);
        _$jscoverage['/base/attr.js'].lineData[569]++;
        el.appendChild(el.ownerDocument.createTextNode(val));
      } else {
        _$jscoverage['/base/attr.js'].lineData[571]++;
        if (visit97_571_1(visit98_571_2(nodeType == NodeType.TEXT_NODE) || visit99_571_3(nodeType == NodeType.CDATA_SECTION_NODE))) {
          _$jscoverage['/base/attr.js'].lineData[572]++;
          el.nodeValue = val;
        }
      }
    }
  }
  _$jscoverage['/base/attr.js'].lineData[576]++;
  return undefined;
}, 
  _getText: function(el) {
  _$jscoverage['/base/attr.js'].functionData[23]++;
  _$jscoverage['/base/attr.js'].lineData[580]++;
  return el.textContent;
}});
  _$jscoverage['/base/attr.js'].lineData[584]++;
  return Dom;
}, {
  requires: ['./api']});
