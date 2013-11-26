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
if (! _$jscoverage['/color.js']) {
  _$jscoverage['/color.js'] = {};
  _$jscoverage['/color.js'].lineData = [];
  _$jscoverage['/color.js'].lineData[6] = 0;
  _$jscoverage['/color.js'].lineData[7] = 0;
  _$jscoverage['/color.js'].lineData[10] = 0;
  _$jscoverage['/color.js'].lineData[16] = 0;
  _$jscoverage['/color.js'].lineData[22] = 0;
  _$jscoverage['/color.js'].lineData[23] = 0;
  _$jscoverage['/color.js'].lineData[30] = 0;
  _$jscoverage['/color.js'].lineData[31] = 0;
  _$jscoverage['/color.js'].lineData[40] = 0;
  _$jscoverage['/color.js'].lineData[41] = 0;
  _$jscoverage['/color.js'].lineData[48] = 0;
  _$jscoverage['/color.js'].lineData[49] = 0;
  _$jscoverage['/color.js'].lineData[57] = 0;
  _$jscoverage['/color.js'].lineData[58] = 0;
  _$jscoverage['/color.js'].lineData[66] = 0;
  _$jscoverage['/color.js'].lineData[73] = 0;
  _$jscoverage['/color.js'].lineData[85] = 0;
  _$jscoverage['/color.js'].lineData[86] = 0;
  _$jscoverage['/color.js'].lineData[87] = 0;
  _$jscoverage['/color.js'].lineData[88] = 0;
  _$jscoverage['/color.js'].lineData[89] = 0;
  _$jscoverage['/color.js'].lineData[90] = 0;
  _$jscoverage['/color.js'].lineData[92] = 0;
  _$jscoverage['/color.js'].lineData[95] = 0;
  _$jscoverage['/color.js'].lineData[97] = 0;
  _$jscoverage['/color.js'].lineData[109] = 0;
  _$jscoverage['/color.js'].lineData[124] = 0;
  _$jscoverage['/color.js'].lineData[126] = 0;
  _$jscoverage['/color.js'].lineData[128] = 0;
  _$jscoverage['/color.js'].lineData[129] = 0;
  _$jscoverage['/color.js'].lineData[130] = 0;
  _$jscoverage['/color.js'].lineData[131] = 0;
  _$jscoverage['/color.js'].lineData[134] = 0;
  _$jscoverage['/color.js'].lineData[136] = 0;
  _$jscoverage['/color.js'].lineData[148] = 0;
  _$jscoverage['/color.js'].lineData[150] = 0;
  _$jscoverage['/color.js'].lineData[152] = 0;
  _$jscoverage['/color.js'].lineData[153] = 0;
  _$jscoverage['/color.js'].lineData[154] = 0;
  _$jscoverage['/color.js'].lineData[155] = 0;
  _$jscoverage['/color.js'].lineData[158] = 0;
  _$jscoverage['/color.js'].lineData[162] = 0;
  _$jscoverage['/color.js'].lineData[166] = 0;
  _$jscoverage['/color.js'].lineData[182] = 0;
  _$jscoverage['/color.js'].lineData[185] = 0;
  _$jscoverage['/color.js'].lineData[202] = 0;
  _$jscoverage['/color.js'].lineData[205] = 0;
  _$jscoverage['/color.js'].lineData[222] = 0;
  _$jscoverage['/color.js'].lineData[225] = 0;
  _$jscoverage['/color.js'].lineData[244] = 0;
  _$jscoverage['/color.js'].lineData[255] = 0;
  _$jscoverage['/color.js'].lineData[260] = 0;
  _$jscoverage['/color.js'].lineData[261] = 0;
  _$jscoverage['/color.js'].lineData[262] = 0;
  _$jscoverage['/color.js'].lineData[263] = 0;
  _$jscoverage['/color.js'].lineData[264] = 0;
  _$jscoverage['/color.js'].lineData[265] = 0;
  _$jscoverage['/color.js'].lineData[266] = 0;
  _$jscoverage['/color.js'].lineData[267] = 0;
  _$jscoverage['/color.js'].lineData[268] = 0;
  _$jscoverage['/color.js'].lineData[269] = 0;
  _$jscoverage['/color.js'].lineData[274] = 0;
  _$jscoverage['/color.js'].lineData[275] = 0;
  _$jscoverage['/color.js'].lineData[276] = 0;
  _$jscoverage['/color.js'].lineData[277] = 0;
  _$jscoverage['/color.js'].lineData[278] = 0;
  _$jscoverage['/color.js'].lineData[279] = 0;
  _$jscoverage['/color.js'].lineData[283] = 0;
  _$jscoverage['/color.js'].lineData[301] = 0;
  _$jscoverage['/color.js'].lineData[302] = 0;
  _$jscoverage['/color.js'].lineData[303] = 0;
  _$jscoverage['/color.js'].lineData[315] = 0;
  _$jscoverage['/color.js'].lineData[316] = 0;
  _$jscoverage['/color.js'].lineData[317] = 0;
  _$jscoverage['/color.js'].lineData[323] = 0;
  _$jscoverage['/color.js'].lineData[324] = 0;
  _$jscoverage['/color.js'].lineData[327] = 0;
  _$jscoverage['/color.js'].lineData[328] = 0;
  _$jscoverage['/color.js'].lineData[338] = 0;
  _$jscoverage['/color.js'].lineData[340] = 0;
  _$jscoverage['/color.js'].lineData[341] = 0;
  _$jscoverage['/color.js'].lineData[342] = 0;
  _$jscoverage['/color.js'].lineData[343] = 0;
  _$jscoverage['/color.js'].lineData[345] = 0;
  _$jscoverage['/color.js'].lineData[346] = 0;
  _$jscoverage['/color.js'].lineData[347] = 0;
  _$jscoverage['/color.js'].lineData[348] = 0;
  _$jscoverage['/color.js'].lineData[350] = 0;
  _$jscoverage['/color.js'].lineData[351] = 0;
  _$jscoverage['/color.js'].lineData[352] = 0;
  _$jscoverage['/color.js'].lineData[353] = 0;
  _$jscoverage['/color.js'].lineData[355] = 0;
  _$jscoverage['/color.js'].lineData[356] = 0;
  _$jscoverage['/color.js'].lineData[357] = 0;
  _$jscoverage['/color.js'].lineData[358] = 0;
  _$jscoverage['/color.js'].lineData[360] = 0;
  _$jscoverage['/color.js'].lineData[361] = 0;
  _$jscoverage['/color.js'].lineData[362] = 0;
  _$jscoverage['/color.js'].lineData[363] = 0;
  _$jscoverage['/color.js'].lineData[365] = 0;
  _$jscoverage['/color.js'].lineData[366] = 0;
  _$jscoverage['/color.js'].lineData[367] = 0;
  _$jscoverage['/color.js'].lineData[368] = 0;
  _$jscoverage['/color.js'].lineData[371] = 0;
  _$jscoverage['/color.js'].lineData[374] = 0;
  _$jscoverage['/color.js'].lineData[375] = 0;
  _$jscoverage['/color.js'].lineData[379] = 0;
  _$jscoverage['/color.js'].lineData[385] = 0;
  _$jscoverage['/color.js'].lineData[387] = 0;
  _$jscoverage['/color.js'].lineData[388] = 0;
  _$jscoverage['/color.js'].lineData[390] = 0;
  _$jscoverage['/color.js'].lineData[391] = 0;
  _$jscoverage['/color.js'].lineData[392] = 0;
  _$jscoverage['/color.js'].lineData[394] = 0;
  _$jscoverage['/color.js'].lineData[396] = 0;
  _$jscoverage['/color.js'].lineData[397] = 0;
  _$jscoverage['/color.js'].lineData[399] = 0;
  _$jscoverage['/color.js'].lineData[400] = 0;
  _$jscoverage['/color.js'].lineData[403] = 0;
  _$jscoverage['/color.js'].lineData[405] = 0;
  _$jscoverage['/color.js'].lineData[411] = 0;
  _$jscoverage['/color.js'].lineData[414] = 0;
  _$jscoverage['/color.js'].lineData[415] = 0;
  _$jscoverage['/color.js'].lineData[422] = 0;
  _$jscoverage['/color.js'].lineData[424] = 0;
  _$jscoverage['/color.js'].lineData[430] = 0;
  _$jscoverage['/color.js'].lineData[431] = 0;
  _$jscoverage['/color.js'].lineData[432] = 0;
  _$jscoverage['/color.js'].lineData[433] = 0;
  _$jscoverage['/color.js'].lineData[434] = 0;
  _$jscoverage['/color.js'].lineData[436] = 0;
  _$jscoverage['/color.js'].lineData[437] = 0;
  _$jscoverage['/color.js'].lineData[439] = 0;
  _$jscoverage['/color.js'].lineData[440] = 0;
  _$jscoverage['/color.js'].lineData[442] = 0;
  _$jscoverage['/color.js'].lineData[443] = 0;
  _$jscoverage['/color.js'].lineData[445] = 0;
  _$jscoverage['/color.js'].lineData[446] = 0;
  _$jscoverage['/color.js'].lineData[448] = 0;
  _$jscoverage['/color.js'].lineData[449] = 0;
  _$jscoverage['/color.js'].lineData[451] = 0;
  _$jscoverage['/color.js'].lineData[452] = 0;
  _$jscoverage['/color.js'].lineData[454] = 0;
  _$jscoverage['/color.js'].lineData[456] = 0;
  _$jscoverage['/color.js'].lineData[457] = 0;
  _$jscoverage['/color.js'].lineData[459] = 0;
  _$jscoverage['/color.js'].lineData[466] = 0;
  _$jscoverage['/color.js'].lineData[467] = 0;
  _$jscoverage['/color.js'].lineData[470] = 0;
  _$jscoverage['/color.js'].lineData[471] = 0;
  _$jscoverage['/color.js'].lineData[474] = 0;
  _$jscoverage['/color.js'].lineData[475] = 0;
  _$jscoverage['/color.js'].lineData[476] = 0;
  _$jscoverage['/color.js'].lineData[478] = 0;
  _$jscoverage['/color.js'].lineData[481] = 0;
  _$jscoverage['/color.js'].lineData[482] = 0;
  _$jscoverage['/color.js'].lineData[485] = 0;
  _$jscoverage['/color.js'].lineData[486] = 0;
  _$jscoverage['/color.js'].lineData[489] = 0;
  _$jscoverage['/color.js'].lineData[490] = 0;
}
if (! _$jscoverage['/color.js'].functionData) {
  _$jscoverage['/color.js'].functionData = [];
  _$jscoverage['/color.js'].functionData[0] = 0;
  _$jscoverage['/color.js'].functionData[1] = 0;
  _$jscoverage['/color.js'].functionData[2] = 0;
  _$jscoverage['/color.js'].functionData[3] = 0;
  _$jscoverage['/color.js'].functionData[4] = 0;
  _$jscoverage['/color.js'].functionData[5] = 0;
  _$jscoverage['/color.js'].functionData[6] = 0;
  _$jscoverage['/color.js'].functionData[7] = 0;
  _$jscoverage['/color.js'].functionData[8] = 0;
  _$jscoverage['/color.js'].functionData[9] = 0;
  _$jscoverage['/color.js'].functionData[10] = 0;
  _$jscoverage['/color.js'].functionData[11] = 0;
  _$jscoverage['/color.js'].functionData[12] = 0;
  _$jscoverage['/color.js'].functionData[13] = 0;
  _$jscoverage['/color.js'].functionData[14] = 0;
  _$jscoverage['/color.js'].functionData[15] = 0;
  _$jscoverage['/color.js'].functionData[16] = 0;
  _$jscoverage['/color.js'].functionData[17] = 0;
  _$jscoverage['/color.js'].functionData[18] = 0;
  _$jscoverage['/color.js'].functionData[19] = 0;
  _$jscoverage['/color.js'].functionData[20] = 0;
  _$jscoverage['/color.js'].functionData[21] = 0;
  _$jscoverage['/color.js'].functionData[22] = 0;
  _$jscoverage['/color.js'].functionData[23] = 0;
  _$jscoverage['/color.js'].functionData[24] = 0;
  _$jscoverage['/color.js'].functionData[25] = 0;
  _$jscoverage['/color.js'].functionData[26] = 0;
  _$jscoverage['/color.js'].functionData[27] = 0;
  _$jscoverage['/color.js'].functionData[28] = 0;
  _$jscoverage['/color.js'].functionData[29] = 0;
  _$jscoverage['/color.js'].functionData[30] = 0;
  _$jscoverage['/color.js'].functionData[31] = 0;
  _$jscoverage['/color.js'].functionData[32] = 0;
  _$jscoverage['/color.js'].functionData[33] = 0;
}
if (! _$jscoverage['/color.js'].branchData) {
  _$jscoverage['/color.js'].branchData = {};
  _$jscoverage['/color.js'].branchData['23'] = [];
  _$jscoverage['/color.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['31'] = [];
  _$jscoverage['/color.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['85'] = [];
  _$jscoverage['/color.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['86'] = [];
  _$jscoverage['/color.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['87'] = [];
  _$jscoverage['/color.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['89'] = [];
  _$jscoverage['/color.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['126'] = [];
  _$jscoverage['/color.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['126'][2] = new BranchData();
  _$jscoverage['/color.js'].branchData['130'] = [];
  _$jscoverage['/color.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['150'] = [];
  _$jscoverage['/color.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['150'][2] = new BranchData();
  _$jscoverage['/color.js'].branchData['154'] = [];
  _$jscoverage['/color.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['260'] = [];
  _$jscoverage['/color.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['260'][2] = new BranchData();
  _$jscoverage['/color.js'].branchData['260'][3] = new BranchData();
  _$jscoverage['/color.js'].branchData['260'][4] = new BranchData();
  _$jscoverage['/color.js'].branchData['260'][5] = new BranchData();
  _$jscoverage['/color.js'].branchData['262'] = [];
  _$jscoverage['/color.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['266'] = [];
  _$jscoverage['/color.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['275'] = [];
  _$jscoverage['/color.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['279'] = [];
  _$jscoverage['/color.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['283'] = [];
  _$jscoverage['/color.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['391'] = [];
  _$jscoverage['/color.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['403'] = [];
  _$jscoverage['/color.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['422'] = [];
  _$jscoverage['/color.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['422'][2] = new BranchData();
  _$jscoverage['/color.js'].branchData['422'][3] = new BranchData();
  _$jscoverage['/color.js'].branchData['475'] = [];
  _$jscoverage['/color.js'].branchData['475'][1] = new BranchData();
}
_$jscoverage['/color.js'].branchData['475'][1].init(13, 13, 'v.length != 2');
function visit28_475_1(result) {
  _$jscoverage['/color.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['422'][3].init(263, 9, 'h == null');
function visit27_422_3(result) {
  _$jscoverage['/color.js'].branchData['422'][3].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['422'][2].init(253, 6, 's == 0');
function visit26_422_2(result) {
  _$jscoverage['/color.js'].branchData['422'][2].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['422'][1].init(253, 19, 's == 0 || h == null');
function visit25_422_1(result) {
  _$jscoverage['/color.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['403'][1].init(713, 9, 'max === 0');
function visit24_403_1(result) {
  _$jscoverage['/color.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['391'][1].init(69, 5, 'g < b');
function visit23_391_1(result) {
  _$jscoverage['/color.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['283'][1].init(941, 23, 'typeof r == \'undefined\'');
function visit22_283_1(result) {
  _$jscoverage['/color.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['279'][1].init(160, 26, 'parseFloat(values[4]) || 1');
function visit21_279_1(result) {
  _$jscoverage['/color.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['275'][1].init(65, 6, 'values');
function visit20_275_1(result) {
  _$jscoverage['/color.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['266'][1].init(160, 15, 'str.length == 4');
function visit19_266_1(result) {
  _$jscoverage['/color.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['262'][1].init(64, 6, 'values');
function visit18_262_1(result) {
  _$jscoverage['/color.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['260'][5].init(146, 24, 'str.substr(0, 1) === \'#\'');
function visit17_260_5(result) {
  _$jscoverage['/color.js'].branchData['260'][5].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['260'][4].init(126, 15, 'str.length == 7');
function visit16_260_4(result) {
  _$jscoverage['/color.js'].branchData['260'][4].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['260'][3].init(107, 15, 'str.length == 4');
function visit15_260_3(result) {
  _$jscoverage['/color.js'].branchData['260'][3].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['260'][2].init(107, 34, 'str.length == 4 || str.length == 7');
function visit14_260_2(result) {
  _$jscoverage['/color.js'].branchData['260'][2].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['260'][1].init(107, 63, '(str.length == 4 || str.length == 7) && str.substr(0, 1) === \'#\'');
function visit13_260_1(result) {
  _$jscoverage['/color.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['154'][1].init(25, 8, 'x in cfg');
function visit12_154_1(result) {
  _$jscoverage['/color.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['150'][2].init(85, 24, '"s" in cfg && "l" in cfg');
function visit11_150_2(result) {
  _$jscoverage['/color.js'].branchData['150'][2].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['150'][1].init(71, 38, '"h" in cfg && "s" in cfg && "l" in cfg');
function visit10_150_1(result) {
  _$jscoverage['/color.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['130'][1].init(25, 8, 'x in cfg');
function visit9_130_1(result) {
  _$jscoverage['/color.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['126'][2].init(85, 24, '"s" in cfg && "v" in cfg');
function visit8_126_2(result) {
  _$jscoverage['/color.js'].branchData['126'][2].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['126'][1].init(71, 38, '"h" in cfg && "s" in cfg && "v" in cfg');
function visit7_126_1(result) {
  _$jscoverage['/color.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['89'][1].init(186, 8, 'g == max');
function visit6_89_1(result) {
  _$jscoverage['/color.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['87'][1].init(100, 8, 'r == max');
function visit5_87_1(result) {
  _$jscoverage['/color.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['86'][1].init(22, 7, 'l < 0.5');
function visit4_86_1(result) {
  _$jscoverage['/color.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['85'][1].init(428, 10, 'min != max');
function visit3_85_1(result) {
  _$jscoverage['/color.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['31'][1].init(79, 10, 'hsl.h || 0');
function visit2_31_1(result) {
  _$jscoverage['/color.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['23'][1].init(78, 10, 'hsl.h || 0');
function visit1_23_1(result) {
  _$jscoverage['/color.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].lineData[6]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/color.js'].functionData[0]++;
  _$jscoverage['/color.js'].lineData[7]++;
  var rgbaRe = /\s*rgba?\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*(?:,\s*([\d\.]+))?\)\s*/, hexRe = /\s*#([0-9a-fA-F][0-9a-fA-F]?)([0-9a-fA-F][0-9a-fA-F]?)([0-9a-fA-F][0-9a-fA-F]?)\s*/;
  _$jscoverage['/color.js'].lineData[10]++;
  var Attribute = require('attribute');
  _$jscoverage['/color.js'].lineData[16]++;
  var Color = module.exports = Attribute.extend({
  toHSL: function() {
  _$jscoverage['/color.js'].functionData[1]++;
  _$jscoverage['/color.js'].lineData[22]++;
  var hsl = this.getHSL();
  _$jscoverage['/color.js'].lineData[23]++;
  return "hsl(" + (Math.round(visit1_23_1(hsl.h || 0))) + ", " + percentage(hsl.s) + ", " + percentage(hsl.l) + ")";
}, 
  'toHSLA': function() {
  _$jscoverage['/color.js'].functionData[2]++;
  _$jscoverage['/color.js'].lineData[30]++;
  var hsl = this.getHSL();
  _$jscoverage['/color.js'].lineData[31]++;
  return "hsla(" + (Math.round(visit2_31_1(hsl.h || 0))) + ", " + percentage(hsl.s) + ", " + percentage(hsl.l) + ", " + this.get('a') + ")";
}, 
  toRGB: function() {
  _$jscoverage['/color.js'].functionData[3]++;
  _$jscoverage['/color.js'].lineData[40]++;
  var self = this;
  _$jscoverage['/color.js'].lineData[41]++;
  return "rgb(" + self.get("r") + ", " + self.get("g") + ", " + self.get("b") + ")";
}, 
  toRGBA: function() {
  _$jscoverage['/color.js'].functionData[4]++;
  _$jscoverage['/color.js'].lineData[48]++;
  var self = this;
  _$jscoverage['/color.js'].lineData[49]++;
  return "rgba(" + self.get("r") + ", " + self.get("g") + ", " + self.get("b") + ", " + self.get("a") + ")";
}, 
  toHex: function() {
  _$jscoverage['/color.js'].functionData[5]++;
  _$jscoverage['/color.js'].lineData[57]++;
  var self = this;
  _$jscoverage['/color.js'].lineData[58]++;
  return "#" + padding2(Number(self.get("r")).toString(16)) + padding2(Number(self.get("g")).toString(16)) + padding2(Number(self.get("b")).toString(16));
}, 
  toString: function() {
  _$jscoverage['/color.js'].functionData[6]++;
  _$jscoverage['/color.js'].lineData[66]++;
  return this.toRGBA();
}, 
  getHSL: function() {
  _$jscoverage['/color.js'].functionData[7]++;
  _$jscoverage['/color.js'].lineData[73]++;
  var self = this, r = self.get("r") / 255, g = self.get("g") / 255, b = self.get("b") / 255, max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min, h, s = 0, l = 0.5 * (max + min);
  _$jscoverage['/color.js'].lineData[85]++;
  if (visit3_85_1(min != max)) {
    _$jscoverage['/color.js'].lineData[86]++;
    s = (visit4_86_1(l < 0.5)) ? delta / (max + min) : delta / (2 - max - min);
    _$jscoverage['/color.js'].lineData[87]++;
    if (visit5_87_1(r == max)) {
      _$jscoverage['/color.js'].lineData[88]++;
      h = 60 * (g - b) / delta;
    } else {
      _$jscoverage['/color.js'].lineData[89]++;
      if (visit6_89_1(g == max)) {
        _$jscoverage['/color.js'].lineData[90]++;
        h = 120 + 60 * (b - r) / delta;
      } else {
        _$jscoverage['/color.js'].lineData[92]++;
        h = 240 + 60 * (r - g) / delta;
      }
    }
    _$jscoverage['/color.js'].lineData[95]++;
    h = (h + 360) % 360;
  }
  _$jscoverage['/color.js'].lineData[97]++;
  return {
  h: h, 
  s: s, 
  l: l};
}, 
  getHSV: function() {
  _$jscoverage['/color.js'].functionData[8]++;
  _$jscoverage['/color.js'].lineData[109]++;
  return rgb2hsv({
  r: this.get("r"), 
  g: this.get("g"), 
  b: this.get("b")});
}, 
  setHSV: function(cfg) {
  _$jscoverage['/color.js'].functionData[9]++;
  _$jscoverage['/color.js'].lineData[124]++;
  var self = this, current;
  _$jscoverage['/color.js'].lineData[126]++;
  if (visit7_126_1("h" in cfg && visit8_126_2("s" in cfg && "v" in cfg))) {
  } else {
    _$jscoverage['/color.js'].lineData[128]++;
    current = self.getHSV();
    _$jscoverage['/color.js'].lineData[129]++;
    S.each(["h", "s", "v"], function(x) {
  _$jscoverage['/color.js'].functionData[10]++;
  _$jscoverage['/color.js'].lineData[130]++;
  if (visit9_130_1(x in cfg)) {
    _$jscoverage['/color.js'].lineData[131]++;
    current[x] = cfg[x];
  }
});
    _$jscoverage['/color.js'].lineData[134]++;
    cfg = current;
  }
  _$jscoverage['/color.js'].lineData[136]++;
  self.set(hsv2rgb(cfg));
}, 
  'setHSL': function(cfg) {
  _$jscoverage['/color.js'].functionData[11]++;
  _$jscoverage['/color.js'].lineData[148]++;
  var self = this, current;
  _$jscoverage['/color.js'].lineData[150]++;
  if (visit10_150_1("h" in cfg && visit11_150_2("s" in cfg && "l" in cfg))) {
  } else {
    _$jscoverage['/color.js'].lineData[152]++;
    current = self.getHSL();
    _$jscoverage['/color.js'].lineData[153]++;
    S.each(["h", "s", "l"], function(x) {
  _$jscoverage['/color.js'].functionData[12]++;
  _$jscoverage['/color.js'].lineData[154]++;
  if (visit12_154_1(x in cfg)) {
    _$jscoverage['/color.js'].lineData[155]++;
    current[x] = cfg[x];
  }
});
    _$jscoverage['/color.js'].lineData[158]++;
    cfg = current;
  }
  _$jscoverage['/color.js'].lineData[162]++;
  self.set(hsl2rgb(cfg));
}});
  _$jscoverage['/color.js'].lineData[166]++;
  S.mix(Color, {
  ATTRS: {
  r: {
  getter: function(v) {
  _$jscoverage['/color.js'].functionData[13]++;
  _$jscoverage['/color.js'].lineData[182]++;
  return Math.round(v);
}, 
  setter: function(v) {
  _$jscoverage['/color.js'].functionData[14]++;
  _$jscoverage['/color.js'].lineData[185]++;
  return constrain255(v);
}}, 
  g: {
  getter: function(v) {
  _$jscoverage['/color.js'].functionData[15]++;
  _$jscoverage['/color.js'].lineData[202]++;
  return Math.round(v);
}, 
  setter: function(v) {
  _$jscoverage['/color.js'].functionData[16]++;
  _$jscoverage['/color.js'].lineData[205]++;
  return constrain255(v);
}}, 
  b: {
  getter: function(v) {
  _$jscoverage['/color.js'].functionData[17]++;
  _$jscoverage['/color.js'].lineData[222]++;
  return Math.round(v);
}, 
  setter: function(v) {
  _$jscoverage['/color.js'].functionData[18]++;
  _$jscoverage['/color.js'].lineData[225]++;
  return constrain255(v);
}}, 
  a: {
  value: 1, 
  setter: function(v) {
  _$jscoverage['/color.js'].functionData[19]++;
  _$jscoverage['/color.js'].lineData[244]++;
  return constrain1(v);
}}}, 
  parse: function(str) {
  _$jscoverage['/color.js'].functionData[20]++;
  _$jscoverage['/color.js'].lineData[255]++;
  var values, r, g, b, a = 1;
  _$jscoverage['/color.js'].lineData[260]++;
  if (visit13_260_1((visit14_260_2(visit15_260_3(str.length == 4) || visit16_260_4(str.length == 7))) && visit17_260_5(str.substr(0, 1) === '#'))) {
    _$jscoverage['/color.js'].lineData[261]++;
    values = str.match(hexRe);
    _$jscoverage['/color.js'].lineData[262]++;
    if (visit18_262_1(values)) {
      _$jscoverage['/color.js'].lineData[263]++;
      r = parseHex(values[1]);
      _$jscoverage['/color.js'].lineData[264]++;
      g = parseHex(values[2]);
      _$jscoverage['/color.js'].lineData[265]++;
      b = parseHex(values[3]);
      _$jscoverage['/color.js'].lineData[266]++;
      if (visit19_266_1(str.length == 4)) {
        _$jscoverage['/color.js'].lineData[267]++;
        r = paddingHex(r);
        _$jscoverage['/color.js'].lineData[268]++;
        g = paddingHex(g);
        _$jscoverage['/color.js'].lineData[269]++;
        b = paddingHex(b);
      }
    }
  } else {
    _$jscoverage['/color.js'].lineData[274]++;
    values = str.match(rgbaRe);
    _$jscoverage['/color.js'].lineData[275]++;
    if (visit20_275_1(values)) {
      _$jscoverage['/color.js'].lineData[276]++;
      r = parseInt(values[1]);
      _$jscoverage['/color.js'].lineData[277]++;
      g = parseInt(values[2]);
      _$jscoverage['/color.js'].lineData[278]++;
      b = parseInt(values[3]);
      _$jscoverage['/color.js'].lineData[279]++;
      a = visit21_279_1(parseFloat(values[4]) || 1);
    }
  }
  _$jscoverage['/color.js'].lineData[283]++;
  return (visit22_283_1(typeof r == 'undefined')) ? undefined : new Color({
  r: r, 
  g: g, 
  b: b, 
  a: a});
}, 
  'fromHSL': function(cfg) {
  _$jscoverage['/color.js'].functionData[21]++;
  _$jscoverage['/color.js'].lineData[301]++;
  var rgb = hsl2rgb(cfg);
  _$jscoverage['/color.js'].lineData[302]++;
  rgb.a = cfg.a;
  _$jscoverage['/color.js'].lineData[303]++;
  return new Color(rgb);
}, 
  fromHSV: function(cfg) {
  _$jscoverage['/color.js'].functionData[22]++;
  _$jscoverage['/color.js'].lineData[315]++;
  var rgb = hsv2rgb(cfg);
  _$jscoverage['/color.js'].lineData[316]++;
  rgb.a = cfg.a;
  _$jscoverage['/color.js'].lineData[317]++;
  return new Color(rgb);
}});
  _$jscoverage['/color.js'].lineData[323]++;
  function to255(v) {
    _$jscoverage['/color.js'].functionData[23]++;
    _$jscoverage['/color.js'].lineData[324]++;
    return v * 255;
  }
  _$jscoverage['/color.js'].lineData[327]++;
  function hsv2rgb(cfg) {
    _$jscoverage['/color.js'].functionData[24]++;
    _$jscoverage['/color.js'].lineData[328]++;
    var h = Math.min(Math.round(cfg.h), 359), s = Math.max(0, Math.min(1, cfg.s)), v = Math.max(0, Math.min(1, cfg.v)), r, g, b, i = Math.floor((h / 60) % 6), f = (h / 60) - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    _$jscoverage['/color.js'].lineData[338]++;
    switch (i) {
      case 0:
        _$jscoverage['/color.js'].lineData[340]++;
        r = v;
        _$jscoverage['/color.js'].lineData[341]++;
        g = t;
        _$jscoverage['/color.js'].lineData[342]++;
        b = p;
        _$jscoverage['/color.js'].lineData[343]++;
        break;
      case 1:
        _$jscoverage['/color.js'].lineData[345]++;
        r = q;
        _$jscoverage['/color.js'].lineData[346]++;
        g = v;
        _$jscoverage['/color.js'].lineData[347]++;
        b = p;
        _$jscoverage['/color.js'].lineData[348]++;
        break;
      case 2:
        _$jscoverage['/color.js'].lineData[350]++;
        r = p;
        _$jscoverage['/color.js'].lineData[351]++;
        g = v;
        _$jscoverage['/color.js'].lineData[352]++;
        b = t;
        _$jscoverage['/color.js'].lineData[353]++;
        break;
      case 3:
        _$jscoverage['/color.js'].lineData[355]++;
        r = p;
        _$jscoverage['/color.js'].lineData[356]++;
        g = q;
        _$jscoverage['/color.js'].lineData[357]++;
        b = v;
        _$jscoverage['/color.js'].lineData[358]++;
        break;
      case 4:
        _$jscoverage['/color.js'].lineData[360]++;
        r = t;
        _$jscoverage['/color.js'].lineData[361]++;
        g = p;
        _$jscoverage['/color.js'].lineData[362]++;
        b = v;
        _$jscoverage['/color.js'].lineData[363]++;
        break;
      case 5:
        _$jscoverage['/color.js'].lineData[365]++;
        r = v;
        _$jscoverage['/color.js'].lineData[366]++;
        g = p;
        _$jscoverage['/color.js'].lineData[367]++;
        b = q;
        _$jscoverage['/color.js'].lineData[368]++;
        break;
    }
    _$jscoverage['/color.js'].lineData[371]++;
    return {
  r: constrain255(to255(r)), 
  g: constrain255(to255(g)), 
  b: constrain255(to255(b))};
  }
  _$jscoverage['/color.js'].lineData[374]++;
  function rgb2hsv(cfg) {
    _$jscoverage['/color.js'].functionData[25]++;
    _$jscoverage['/color.js'].lineData[375]++;
    var r = cfg.r / 255, g = cfg.g / 255, b = cfg.b / 255;
    _$jscoverage['/color.js'].lineData[379]++;
    var h, s, min = Math.min(Math.min(r, g), b), max = Math.max(Math.max(r, g), b), delta = max - min, hsv;
    _$jscoverage['/color.js'].lineData[385]++;
    switch (max) {
      case min:
        _$jscoverage['/color.js'].lineData[387]++;
        h = 0;
        _$jscoverage['/color.js'].lineData[388]++;
        break;
      case r:
        _$jscoverage['/color.js'].lineData[390]++;
        h = 60 * (g - b) / delta;
        _$jscoverage['/color.js'].lineData[391]++;
        if (visit23_391_1(g < b)) {
          _$jscoverage['/color.js'].lineData[392]++;
          h += 360;
        }
        _$jscoverage['/color.js'].lineData[394]++;
        break;
      case g:
        _$jscoverage['/color.js'].lineData[396]++;
        h = (60 * (b - r) / delta) + 120;
        _$jscoverage['/color.js'].lineData[397]++;
        break;
      case b:
        _$jscoverage['/color.js'].lineData[399]++;
        h = (60 * (r - g) / delta) + 240;
        _$jscoverage['/color.js'].lineData[400]++;
        break;
    }
    _$jscoverage['/color.js'].lineData[403]++;
    s = (visit24_403_1(max === 0)) ? 0 : 1 - (min / max);
    _$jscoverage['/color.js'].lineData[405]++;
    hsv = {
  h: Math.round(h), 
  s: s, 
  v: max};
    _$jscoverage['/color.js'].lineData[411]++;
    return hsv;
  }
  _$jscoverage['/color.js'].lineData[414]++;
  function hsl2rgb(cfg) {
    _$jscoverage['/color.js'].functionData[26]++;
    _$jscoverage['/color.js'].lineData[415]++;
    var h = Math.min(Math.round(cfg.h), 359), s = Math.max(0, Math.min(1, cfg.s)), l = Math.max(0, Math.min(1, cfg.l)), C, X, m, rgb = [], abs = Math.abs, floor = Math.floor;
    _$jscoverage['/color.js'].lineData[422]++;
    if (visit25_422_1(visit26_422_2(s == 0) || visit27_422_3(h == null))) {
      _$jscoverage['/color.js'].lineData[424]++;
      rgb = [l, l, l];
    } else {
      _$jscoverage['/color.js'].lineData[430]++;
      h /= 60;
      _$jscoverage['/color.js'].lineData[431]++;
      C = s * (1 - abs(2 * l - 1));
      _$jscoverage['/color.js'].lineData[432]++;
      X = C * (1 - abs(h - 2 * floor(h / 2) - 1));
      _$jscoverage['/color.js'].lineData[433]++;
      m = l - C / 2;
      _$jscoverage['/color.js'].lineData[434]++;
      switch (floor(h)) {
        case 0:
          _$jscoverage['/color.js'].lineData[436]++;
          rgb = [C, X, 0];
          _$jscoverage['/color.js'].lineData[437]++;
          break;
        case 1:
          _$jscoverage['/color.js'].lineData[439]++;
          rgb = [X, C, 0];
          _$jscoverage['/color.js'].lineData[440]++;
          break;
        case 2:
          _$jscoverage['/color.js'].lineData[442]++;
          rgb = [0, C, X];
          _$jscoverage['/color.js'].lineData[443]++;
          break;
        case 3:
          _$jscoverage['/color.js'].lineData[445]++;
          rgb = [0, X, C];
          _$jscoverage['/color.js'].lineData[446]++;
          break;
        case 4:
          _$jscoverage['/color.js'].lineData[448]++;
          rgb = [X, 0, C];
          _$jscoverage['/color.js'].lineData[449]++;
          break;
        case 5:
          _$jscoverage['/color.js'].lineData[451]++;
          rgb = [C, 0, X];
          _$jscoverage['/color.js'].lineData[452]++;
          break;
      }
      _$jscoverage['/color.js'].lineData[454]++;
      rgb = [rgb[0] + m, rgb[1] + m, rgb[2] + m];
    }
    _$jscoverage['/color.js'].lineData[456]++;
    S.each(rgb, function(v, index) {
  _$jscoverage['/color.js'].functionData[27]++;
  _$jscoverage['/color.js'].lineData[457]++;
  rgb[index] = to255(v);
});
    _$jscoverage['/color.js'].lineData[459]++;
    return {
  r: rgb[0], 
  g: rgb[1], 
  b: rgb[2]};
  }
  _$jscoverage['/color.js'].lineData[466]++;
  function parseHex(v) {
    _$jscoverage['/color.js'].functionData[28]++;
    _$jscoverage['/color.js'].lineData[467]++;
    return parseInt(v, 16);
  }
  _$jscoverage['/color.js'].lineData[470]++;
  function paddingHex(v) {
    _$jscoverage['/color.js'].functionData[29]++;
    _$jscoverage['/color.js'].lineData[471]++;
    return v + v * 16;
  }
  _$jscoverage['/color.js'].lineData[474]++;
  function padding2(v) {
    _$jscoverage['/color.js'].functionData[30]++;
    _$jscoverage['/color.js'].lineData[475]++;
    if (visit28_475_1(v.length != 2)) {
      _$jscoverage['/color.js'].lineData[476]++;
      v = "0" + v;
    }
    _$jscoverage['/color.js'].lineData[478]++;
    return v;
  }
  _$jscoverage['/color.js'].lineData[481]++;
  function percentage(v) {
    _$jscoverage['/color.js'].functionData[31]++;
    _$jscoverage['/color.js'].lineData[482]++;
    return Math.round(v * 100) + "%";
  }
  _$jscoverage['/color.js'].lineData[485]++;
  function constrain255(v) {
    _$jscoverage['/color.js'].functionData[32]++;
    _$jscoverage['/color.js'].lineData[486]++;
    return Math.max(0, Math.min(v, 255));
  }
  _$jscoverage['/color.js'].lineData[489]++;
  function constrain1(v) {
    _$jscoverage['/color.js'].functionData[33]++;
    _$jscoverage['/color.js'].lineData[490]++;
    return Math.max(0, Math.min(v, 1));
  }
});
