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
if (! _$jscoverage['/ua.js']) {
  _$jscoverage['/ua.js'] = {};
  _$jscoverage['/ua.js'].lineData = [];
  _$jscoverage['/ua.js'].lineData[5] = 0;
  _$jscoverage['/ua.js'].lineData[8] = 0;
  _$jscoverage['/ua.js'].lineData[13] = 0;
  _$jscoverage['/ua.js'].lineData[14] = 0;
  _$jscoverage['/ua.js'].lineData[16] = 0;
  _$jscoverage['/ua.js'].lineData[17] = 0;
  _$jscoverage['/ua.js'].lineData[21] = 0;
  _$jscoverage['/ua.js'].lineData[22] = 0;
  _$jscoverage['/ua.js'].lineData[23] = 0;
  _$jscoverage['/ua.js'].lineData[26] = 0;
  _$jscoverage['/ua.js'].lineData[27] = 0;
  _$jscoverage['/ua.js'].lineData[30] = 0;
  _$jscoverage['/ua.js'].lineData[33] = 0;
  _$jscoverage['/ua.js'].lineData[34] = 0;
  _$jscoverage['/ua.js'].lineData[35] = 0;
  _$jscoverage['/ua.js'].lineData[37] = 0;
  _$jscoverage['/ua.js'].lineData[39] = 0;
  _$jscoverage['/ua.js'].lineData[42] = 0;
  _$jscoverage['/ua.js'].lineData[43] = 0;
  _$jscoverage['/ua.js'].lineData[60] = 0;
  _$jscoverage['/ua.js'].lineData[195] = 0;
  _$jscoverage['/ua.js'].lineData[198] = 0;
  _$jscoverage['/ua.js'].lineData[199] = 0;
  _$jscoverage['/ua.js'].lineData[202] = 0;
  _$jscoverage['/ua.js'].lineData[204] = 0;
  _$jscoverage['/ua.js'].lineData[212] = 0;
  _$jscoverage['/ua.js'].lineData[213] = 0;
  _$jscoverage['/ua.js'].lineData[214] = 0;
  _$jscoverage['/ua.js'].lineData[215] = 0;
  _$jscoverage['/ua.js'].lineData[216] = 0;
  _$jscoverage['/ua.js'].lineData[222] = 0;
  _$jscoverage['/ua.js'].lineData[223] = 0;
  _$jscoverage['/ua.js'].lineData[228] = 0;
  _$jscoverage['/ua.js'].lineData[229] = 0;
  _$jscoverage['/ua.js'].lineData[231] = 0;
  _$jscoverage['/ua.js'].lineData[232] = 0;
  _$jscoverage['/ua.js'].lineData[235] = 0;
  _$jscoverage['/ua.js'].lineData[236] = 0;
  _$jscoverage['/ua.js'].lineData[239] = 0;
  _$jscoverage['/ua.js'].lineData[240] = 0;
  _$jscoverage['/ua.js'].lineData[244] = 0;
  _$jscoverage['/ua.js'].lineData[245] = 0;
  _$jscoverage['/ua.js'].lineData[247] = 0;
  _$jscoverage['/ua.js'].lineData[248] = 0;
  _$jscoverage['/ua.js'].lineData[249] = 0;
  _$jscoverage['/ua.js'].lineData[251] = 0;
  _$jscoverage['/ua.js'].lineData[252] = 0;
  _$jscoverage['/ua.js'].lineData[253] = 0;
  _$jscoverage['/ua.js'].lineData[254] = 0;
  _$jscoverage['/ua.js'].lineData[256] = 0;
  _$jscoverage['/ua.js'].lineData[257] = 0;
  _$jscoverage['/ua.js'].lineData[258] = 0;
  _$jscoverage['/ua.js'].lineData[260] = 0;
  _$jscoverage['/ua.js'].lineData[261] = 0;
  _$jscoverage['/ua.js'].lineData[262] = 0;
  _$jscoverage['/ua.js'].lineData[266] = 0;
  _$jscoverage['/ua.js'].lineData[267] = 0;
  _$jscoverage['/ua.js'].lineData[270] = 0;
  _$jscoverage['/ua.js'].lineData[271] = 0;
  _$jscoverage['/ua.js'].lineData[278] = 0;
  _$jscoverage['/ua.js'].lineData[279] = 0;
  _$jscoverage['/ua.js'].lineData[282] = 0;
  _$jscoverage['/ua.js'].lineData[283] = 0;
  _$jscoverage['/ua.js'].lineData[285] = 0;
  _$jscoverage['/ua.js'].lineData[286] = 0;
  _$jscoverage['/ua.js'].lineData[290] = 0;
  _$jscoverage['/ua.js'].lineData[291] = 0;
  _$jscoverage['/ua.js'].lineData[296] = 0;
  _$jscoverage['/ua.js'].lineData[297] = 0;
  _$jscoverage['/ua.js'].lineData[306] = 0;
  _$jscoverage['/ua.js'].lineData[307] = 0;
  _$jscoverage['/ua.js'].lineData[308] = 0;
  _$jscoverage['/ua.js'].lineData[312] = 0;
  _$jscoverage['/ua.js'].lineData[313] = 0;
  _$jscoverage['/ua.js'].lineData[314] = 0;
  _$jscoverage['/ua.js'].lineData[315] = 0;
  _$jscoverage['/ua.js'].lineData[316] = 0;
  _$jscoverage['/ua.js'].lineData[317] = 0;
  _$jscoverage['/ua.js'].lineData[321] = 0;
  _$jscoverage['/ua.js'].lineData[322] = 0;
  _$jscoverage['/ua.js'].lineData[330] = 0;
  _$jscoverage['/ua.js'].lineData[331] = 0;
  _$jscoverage['/ua.js'].lineData[332] = 0;
  _$jscoverage['/ua.js'].lineData[333] = 0;
  _$jscoverage['/ua.js'].lineData[334] = 0;
  _$jscoverage['/ua.js'].lineData[335] = 0;
  _$jscoverage['/ua.js'].lineData[336] = 0;
  _$jscoverage['/ua.js'].lineData[337] = 0;
  _$jscoverage['/ua.js'].lineData[338] = 0;
  _$jscoverage['/ua.js'].lineData[342] = 0;
  _$jscoverage['/ua.js'].lineData[343] = 0;
  _$jscoverage['/ua.js'].lineData[344] = 0;
  _$jscoverage['/ua.js'].lineData[345] = 0;
  _$jscoverage['/ua.js'].lineData[347] = 0;
  _$jscoverage['/ua.js'].lineData[350] = 0;
  _$jscoverage['/ua.js'].lineData[353] = 0;
  _$jscoverage['/ua.js'].lineData[354] = 0;
  _$jscoverage['/ua.js'].lineData[356] = 0;
  _$jscoverage['/ua.js'].lineData[357] = 0;
  _$jscoverage['/ua.js'].lineData[358] = 0;
  _$jscoverage['/ua.js'].lineData[363] = 0;
  _$jscoverage['/ua.js'].lineData[365] = 0;
  _$jscoverage['/ua.js'].lineData[380] = 0;
  _$jscoverage['/ua.js'].lineData[381] = 0;
  _$jscoverage['/ua.js'].lineData[382] = 0;
  _$jscoverage['/ua.js'].lineData[383] = 0;
  _$jscoverage['/ua.js'].lineData[384] = 0;
  _$jscoverage['/ua.js'].lineData[385] = 0;
  _$jscoverage['/ua.js'].lineData[388] = 0;
  _$jscoverage['/ua.js'].lineData[389] = 0;
}
if (! _$jscoverage['/ua.js'].functionData) {
  _$jscoverage['/ua.js'].functionData = [];
  _$jscoverage['/ua.js'].functionData[0] = 0;
  _$jscoverage['/ua.js'].functionData[1] = 0;
  _$jscoverage['/ua.js'].functionData[2] = 0;
  _$jscoverage['/ua.js'].functionData[3] = 0;
  _$jscoverage['/ua.js'].functionData[4] = 0;
  _$jscoverage['/ua.js'].functionData[5] = 0;
  _$jscoverage['/ua.js'].functionData[6] = 0;
}
if (! _$jscoverage['/ua.js'].branchData) {
  _$jscoverage['/ua.js'].branchData = {};
  _$jscoverage['/ua.js'].branchData['11'] = [];
  _$jscoverage['/ua.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['11'][2] = new BranchData();
  _$jscoverage['/ua.js'].branchData['17'] = [];
  _$jscoverage['/ua.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['26'] = [];
  _$jscoverage['/ua.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['35'] = [];
  _$jscoverage['/ua.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['36'] = [];
  _$jscoverage['/ua.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['53'] = [];
  _$jscoverage['/ua.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['195'] = [];
  _$jscoverage['/ua.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['202'] = [];
  _$jscoverage['/ua.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['212'] = [];
  _$jscoverage['/ua.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['214'] = [];
  _$jscoverage['/ua.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['222'] = [];
  _$jscoverage['/ua.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['228'] = [];
  _$jscoverage['/ua.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['231'] = [];
  _$jscoverage['/ua.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['235'] = [];
  _$jscoverage['/ua.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['239'] = [];
  _$jscoverage['/ua.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['244'] = [];
  _$jscoverage['/ua.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['248'] = [];
  _$jscoverage['/ua.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['253'] = [];
  _$jscoverage['/ua.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['256'] = [];
  _$jscoverage['/ua.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['257'] = [];
  _$jscoverage['/ua.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['261'] = [];
  _$jscoverage['/ua.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['270'] = [];
  _$jscoverage['/ua.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['278'] = [];
  _$jscoverage['/ua.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['282'] = [];
  _$jscoverage['/ua.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['285'] = [];
  _$jscoverage['/ua.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['290'] = [];
  _$jscoverage['/ua.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['296'] = [];
  _$jscoverage['/ua.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['314'] = [];
  _$jscoverage['/ua.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['316'] = [];
  _$jscoverage['/ua.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['321'] = [];
  _$jscoverage['/ua.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['330'] = [];
  _$jscoverage['/ua.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['331'] = [];
  _$jscoverage['/ua.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['333'] = [];
  _$jscoverage['/ua.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['335'] = [];
  _$jscoverage['/ua.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['337'] = [];
  _$jscoverage['/ua.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['343'] = [];
  _$jscoverage['/ua.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['345'] = [];
  _$jscoverage['/ua.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['345'][2] = new BranchData();
  _$jscoverage['/ua.js'].branchData['353'] = [];
  _$jscoverage['/ua.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['356'] = [];
  _$jscoverage['/ua.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['378'] = [];
  _$jscoverage['/ua.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['380'] = [];
  _$jscoverage['/ua.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['383'] = [];
  _$jscoverage['/ua.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['388'] = [];
  _$jscoverage['/ua.js'].branchData['388'][1] = new BranchData();
}
_$jscoverage['/ua.js'].branchData['388'][1].init(238, 17, 'S.trim(className)');
function visit606_388_1(result) {
  _$jscoverage['/ua.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['383'][1].init(46, 1, 'v');
function visit605_383_1(result) {
  _$jscoverage['/ua.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['380'][1].init(12088, 15, 'documentElement');
function visit604_380_1(result) {
  _$jscoverage['/ua.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['378'][1].init(307, 26, 'doc && doc.documentElement');
function visit603_378_1(result) {
  _$jscoverage['/ua.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['356'][1].init(50, 61, '(versions = process.versions) && (nodeVersion = versions.node)');
function visit602_356_1(result) {
  _$jscoverage['/ua.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['353'][1].init(11364, 27, 'typeof process === \'object\'');
function visit601_353_1(result) {
  _$jscoverage['/ua.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['345'][2].init(10247, 25, 'UA.ie && doc.documentMode');
function visit600_345_2(result) {
  _$jscoverage['/ua.js'].branchData['345'][2].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['345'][1].init(10247, 34, 'UA.ie && doc.documentMode || UA.ie');
function visit599_345_1(result) {
  _$jscoverage['/ua.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['343'][1].init(10184, 15, 'UA.core || core');
function visit598_343_1(result) {
  _$jscoverage['/ua.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['337'][1].init(279, 18, '(/rhino/i).test(ua)');
function visit597_337_1(result) {
  _$jscoverage['/ua.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['335'][1].init(202, 18, '(/linux/i).test(ua)');
function visit596_335_1(result) {
  _$jscoverage['/ua.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['333'][1].init(105, 34, '(/macintosh|mac_powerpc/i).test(ua)');
function visit595_333_1(result) {
  _$jscoverage['/ua.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['331'][1].init(18, 26, '(/windows|win32/i).test(ua)');
function visit594_331_1(result) {
  _$jscoverage['/ua.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['330'][1].init(9787, 3, '!os');
function visit593_330_1(result) {
  _$jscoverage['/ua.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['321'][1].init(484, 42, '(m = ua.match(/Firefox\\/([\\d.]*)/)) && m[1]');
function visit592_321_1(result) {
  _$jscoverage['/ua.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['316'][1].init(97, 24, '/Mobile|Tablet/.test(ua)');
function visit591_316_1(result) {
  _$jscoverage['/ua.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['314'][1].init(125, 36, '(m = ua.match(/rv:([\\d.]*)/)) && m[1]');
function visit590_314_1(result) {
  _$jscoverage['/ua.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['296'][1].init(787, 37, '(m = ua.match(/Opera Mobi[^;]*/)) && m');
function visit589_296_1(result) {
  _$jscoverage['/ua.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['290'][1].init(338, 37, '(m = ua.match(/Opera Mini[^;]*/)) && m');
function visit588_290_1(result) {
  _$jscoverage['/ua.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['285'][1].init(131, 52, '(m = ua.match(/Opera\\/.* Version\\/([\\d.]*)/)) && m[1]');
function visit587_285_1(result) {
  _$jscoverage['/ua.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['282'][1].init(115, 40, '(m = ua.match(/Opera\\/([\\d.]*)/)) && m[1]');
function visit586_282_1(result) {
  _$jscoverage['/ua.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['278'][1].init(129, 41, '(m = ua.match(/Presto\\/([\\d.]*)/)) && m[1]');
function visit585_278_1(result) {
  _$jscoverage['/ua.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['270'][1].init(1741, 44, '(m = ua.match(/PhantomJS\\/([^\\s]*)/)) && m[1]');
function visit584_270_1(result) {
  _$jscoverage['/ua.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['261'][1].init(199, 9, 'm && m[1]');
function visit583_261_1(result) {
  _$jscoverage['/ua.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['257'][1].init(25, 17, '/Mobile/.test(ua)');
function visit582_257_1(result) {
  _$jscoverage['/ua.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['256'][1].init(1137, 20, '/ Android/i.test(ua)');
function visit581_256_1(result) {
  _$jscoverage['/ua.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['253'][1].init(359, 9, 'm && m[0]');
function visit580_253_1(result) {
  _$jscoverage['/ua.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['248'][1].init(146, 9, 'm && m[1]');
function visit579_248_1(result) {
  _$jscoverage['/ua.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['244'][1].init(603, 52, '/ Mobile\\//.test(ua) && ua.match(/iPad|iPod|iPhone/)');
function visit578_244_1(result) {
  _$jscoverage['/ua.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['239'][1].init(428, 42, '(m = ua.match(/\\/([\\d.]*) Safari/)) && m[1]');
function visit577_239_1(result) {
  _$jscoverage['/ua.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['235'][1].init(252, 41, '(m = ua.match(/Chrome\\/([\\d.]*)/)) && m[1]');
function visit576_235_1(result) {
  _$jscoverage['/ua.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['231'][1].init(78, 40, '(m = ua.match(/OPR\\/(\\d+\\.\\d+)/)) && m[1]');
function visit575_231_1(result) {
  _$jscoverage['/ua.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['228'][1].init(40, 46, '(m = ua.match(/AppleWebKit\\/([\\d.]*)/)) && m[1]');
function visit574_228_1(result) {
  _$jscoverage['/ua.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['222'][1].init(745, 40, '!UA.ie && (ieVersion = getIEVersion(ua))');
function visit573_222_1(result) {
  _$jscoverage['/ua.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['214'][1].init(100, 12, 's.length > 0');
function visit572_214_1(result) {
  _$jscoverage['/ua.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['212'][1].init(404, 8, 'v <= end');
function visit571_212_1(result) {
  _$jscoverage['/ua.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['202'][1].init(4366, 12, 's.length > 0');
function visit570_202_1(result) {
  _$jscoverage['/ua.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['195'][1].init(3982, 31, 'div && div.getElementsByTagName');
function visit569_195_1(result) {
  _$jscoverage['/ua.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['53'][1].init(343, 31, 'doc && doc.createElement(\'div\')');
function visit568_53_1(result) {
  _$jscoverage['/ua.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['36'][1].init(82, 12, 'm[1] || m[2]');
function visit567_36_1(result) {
  _$jscoverage['/ua.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['35'][1].init(32, 97, '(m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\\s|:)?([0-9.]+)/)) && (v = (m[1] || m[2]))');
function visit566_35_1(result) {
  _$jscoverage['/ua.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['26'][1].init(157, 42, '(m = ua.match(/Trident\\/([\\d.]*)/)) && m[1]');
function visit565_26_1(result) {
  _$jscoverage['/ua.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['17'][1].init(21, 9, 'c++ === 0');
function visit564_17_1(result) {
  _$jscoverage['/ua.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['11'][2].init(97, 32, 'navigator && navigator.userAgent');
function visit563_11_2(result) {
  _$jscoverage['/ua.js'].branchData['11'][2].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['11'][1].init(97, 38, 'navigator && navigator.userAgent || \'\'');
function visit562_11_1(result) {
  _$jscoverage['/ua.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].lineData[5]++;
(function(S, undefined) {
  _$jscoverage['/ua.js'].functionData[0]++;
  _$jscoverage['/ua.js'].lineData[8]++;
  var win = S.Env.host, doc = win.document, navigator = win.navigator, ua = visit562_11_1(visit563_11_2(navigator && navigator.userAgent) || '');
  _$jscoverage['/ua.js'].lineData[13]++;
  function numberify(s) {
    _$jscoverage['/ua.js'].functionData[1]++;
    _$jscoverage['/ua.js'].lineData[14]++;
    var c = 0;
    _$jscoverage['/ua.js'].lineData[16]++;
    return parseFloat(s.replace(/\./g, function() {
  _$jscoverage['/ua.js'].functionData[2]++;
  _$jscoverage['/ua.js'].lineData[17]++;
  return (visit564_17_1(c++ === 0)) ? '.' : '';
}));
  }
  _$jscoverage['/ua.js'].lineData[21]++;
  function setTridentVersion(ua, UA) {
    _$jscoverage['/ua.js'].functionData[3]++;
    _$jscoverage['/ua.js'].lineData[22]++;
    var core, m;
    _$jscoverage['/ua.js'].lineData[23]++;
    UA[core = 'trident'] = 0.1;
    _$jscoverage['/ua.js'].lineData[26]++;
    if (visit565_26_1((m = ua.match(/Trident\/([\d.]*)/)) && m[1])) {
      _$jscoverage['/ua.js'].lineData[27]++;
      UA[core] = numberify(m[1]);
    }
    _$jscoverage['/ua.js'].lineData[30]++;
    UA.core = core;
  }
  _$jscoverage['/ua.js'].lineData[33]++;
  function getIEVersion(ua) {
    _$jscoverage['/ua.js'].functionData[4]++;
    _$jscoverage['/ua.js'].lineData[34]++;
    var m, v;
    _$jscoverage['/ua.js'].lineData[35]++;
    if (visit566_35_1((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) && (v = (visit567_36_1(m[1] || m[2]))))) {
      _$jscoverage['/ua.js'].lineData[37]++;
      return numberify(v);
    }
    _$jscoverage['/ua.js'].lineData[39]++;
    return 0;
  }
  _$jscoverage['/ua.js'].lineData[42]++;
  function getDescriptorFromUserAgent(ua) {
    _$jscoverage['/ua.js'].functionData[5]++;
    _$jscoverage['/ua.js'].lineData[43]++;
    var EMPTY = '', os, core = EMPTY, shell = EMPTY, m, IE_DETECT_RANGE = [6, 9], ieVersion, v, end, VERSION_PLACEHOLDER = '{{version}}', IE_DETECT_TPL = '<!--[if IE ' + VERSION_PLACEHOLDER + ']><' + 's></s><![endif]-->', div = visit568_53_1(doc && doc.createElement('div')), s = [];
    _$jscoverage['/ua.js'].lineData[60]++;
    var UA = {
  webkit: undefined, 
  trident: undefined, 
  gecko: undefined, 
  presto: undefined, 
  chrome: undefined, 
  safari: undefined, 
  firefox: undefined, 
  ie: undefined, 
  ieMode: undefined, 
  opera: undefined, 
  mobile: undefined, 
  core: undefined, 
  shell: undefined, 
  phantomjs: undefined, 
  os: undefined, 
  ipad: undefined, 
  iphone: undefined, 
  ipod: undefined, 
  ios: undefined, 
  android: undefined, 
  nodejs: undefined};
    _$jscoverage['/ua.js'].lineData[195]++;
    if (visit569_195_1(div && div.getElementsByTagName)) {
      _$jscoverage['/ua.js'].lineData[198]++;
      div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, '');
      _$jscoverage['/ua.js'].lineData[199]++;
      s = div.getElementsByTagName('s');
    }
    _$jscoverage['/ua.js'].lineData[202]++;
    if (visit570_202_1(s.length > 0)) {
      _$jscoverage['/ua.js'].lineData[204]++;
      setTridentVersion(ua, UA);
      _$jscoverage['/ua.js'].lineData[212]++;
      for (v = IE_DETECT_RANGE[0] , end = IE_DETECT_RANGE[1]; visit571_212_1(v <= end); v++) {
        _$jscoverage['/ua.js'].lineData[213]++;
        div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, v);
        _$jscoverage['/ua.js'].lineData[214]++;
        if (visit572_214_1(s.length > 0)) {
          _$jscoverage['/ua.js'].lineData[215]++;
          UA[shell = 'ie'] = v;
          _$jscoverage['/ua.js'].lineData[216]++;
          break;
        }
      }
      _$jscoverage['/ua.js'].lineData[222]++;
      if (visit573_222_1(!UA.ie && (ieVersion = getIEVersion(ua)))) {
        _$jscoverage['/ua.js'].lineData[223]++;
        UA[shell = 'ie'] = ieVersion;
      }
    } else {
      _$jscoverage['/ua.js'].lineData[228]++;
      if (visit574_228_1((m = ua.match(/AppleWebKit\/([\d.]*)/)) && m[1])) {
        _$jscoverage['/ua.js'].lineData[229]++;
        UA[core = 'webkit'] = numberify(m[1]);
        _$jscoverage['/ua.js'].lineData[231]++;
        if (visit575_231_1((m = ua.match(/OPR\/(\d+\.\d+)/)) && m[1])) {
          _$jscoverage['/ua.js'].lineData[232]++;
          UA[shell = 'opera'] = numberify(m[1]);
        } else {
          _$jscoverage['/ua.js'].lineData[235]++;
          if (visit576_235_1((m = ua.match(/Chrome\/([\d.]*)/)) && m[1])) {
            _$jscoverage['/ua.js'].lineData[236]++;
            UA[shell = 'chrome'] = numberify(m[1]);
          } else {
            _$jscoverage['/ua.js'].lineData[239]++;
            if (visit577_239_1((m = ua.match(/\/([\d.]*) Safari/)) && m[1])) {
              _$jscoverage['/ua.js'].lineData[240]++;
              UA[shell = 'safari'] = numberify(m[1]);
            }
          }
        }
        _$jscoverage['/ua.js'].lineData[244]++;
        if (visit578_244_1(/ Mobile\//.test(ua) && ua.match(/iPad|iPod|iPhone/))) {
          _$jscoverage['/ua.js'].lineData[245]++;
          UA.mobile = 'apple';
          _$jscoverage['/ua.js'].lineData[247]++;
          m = ua.match(/OS ([^\s]*)/);
          _$jscoverage['/ua.js'].lineData[248]++;
          if (visit579_248_1(m && m[1])) {
            _$jscoverage['/ua.js'].lineData[249]++;
            UA.ios = numberify(m[1].replace('_', '.'));
          }
          _$jscoverage['/ua.js'].lineData[251]++;
          os = 'ios';
          _$jscoverage['/ua.js'].lineData[252]++;
          m = ua.match(/iPad|iPod|iPhone/);
          _$jscoverage['/ua.js'].lineData[253]++;
          if (visit580_253_1(m && m[0])) {
            _$jscoverage['/ua.js'].lineData[254]++;
            UA[m[0].toLowerCase()] = UA.ios;
          }
        } else {
          _$jscoverage['/ua.js'].lineData[256]++;
          if (visit581_256_1(/ Android/i.test(ua))) {
            _$jscoverage['/ua.js'].lineData[257]++;
            if (visit582_257_1(/Mobile/.test(ua))) {
              _$jscoverage['/ua.js'].lineData[258]++;
              os = UA.mobile = 'android';
            }
            _$jscoverage['/ua.js'].lineData[260]++;
            m = ua.match(/Android ([^\s]*);/);
            _$jscoverage['/ua.js'].lineData[261]++;
            if (visit583_261_1(m && m[1])) {
              _$jscoverage['/ua.js'].lineData[262]++;
              UA.android = numberify(m[1]);
            }
          } else {
            _$jscoverage['/ua.js'].lineData[266]++;
            if ((m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))) {
              _$jscoverage['/ua.js'].lineData[267]++;
              UA.mobile = m[0].toLowerCase();
            }
          }
        }
        _$jscoverage['/ua.js'].lineData[270]++;
        if (visit584_270_1((m = ua.match(/PhantomJS\/([^\s]*)/)) && m[1])) {
          _$jscoverage['/ua.js'].lineData[271]++;
          UA.phantomjs = numberify(m[1]);
        }
      } else {
        _$jscoverage['/ua.js'].lineData[278]++;
        if (visit585_278_1((m = ua.match(/Presto\/([\d.]*)/)) && m[1])) {
          _$jscoverage['/ua.js'].lineData[279]++;
          UA[core = 'presto'] = numberify(m[1]);
          _$jscoverage['/ua.js'].lineData[282]++;
          if (visit586_282_1((m = ua.match(/Opera\/([\d.]*)/)) && m[1])) {
            _$jscoverage['/ua.js'].lineData[283]++;
            UA[shell = 'opera'] = numberify(m[1]);
            _$jscoverage['/ua.js'].lineData[285]++;
            if (visit587_285_1((m = ua.match(/Opera\/.* Version\/([\d.]*)/)) && m[1])) {
              _$jscoverage['/ua.js'].lineData[286]++;
              UA[shell] = numberify(m[1]);
            }
            _$jscoverage['/ua.js'].lineData[290]++;
            if (visit588_290_1((m = ua.match(/Opera Mini[^;]*/)) && m)) {
              _$jscoverage['/ua.js'].lineData[291]++;
              UA.mobile = m[0].toLowerCase();
            } else {
              _$jscoverage['/ua.js'].lineData[296]++;
              if (visit589_296_1((m = ua.match(/Opera Mobi[^;]*/)) && m)) {
                _$jscoverage['/ua.js'].lineData[297]++;
                UA.mobile = m[0];
              }
            }
          }
        } else {
          _$jscoverage['/ua.js'].lineData[306]++;
          if ((ieVersion = getIEVersion(ua))) {
            _$jscoverage['/ua.js'].lineData[307]++;
            UA[shell = 'ie'] = ieVersion;
            _$jscoverage['/ua.js'].lineData[308]++;
            setTridentVersion(ua, UA);
          } else {
            _$jscoverage['/ua.js'].lineData[312]++;
            if ((m = ua.match(/Gecko/))) {
              _$jscoverage['/ua.js'].lineData[313]++;
              UA[core = 'gecko'] = 0.1;
              _$jscoverage['/ua.js'].lineData[314]++;
              if (visit590_314_1((m = ua.match(/rv:([\d.]*)/)) && m[1])) {
                _$jscoverage['/ua.js'].lineData[315]++;
                UA[core] = numberify(m[1]);
                _$jscoverage['/ua.js'].lineData[316]++;
                if (visit591_316_1(/Mobile|Tablet/.test(ua))) {
                  _$jscoverage['/ua.js'].lineData[317]++;
                  UA.mobile = 'firefox';
                }
              }
              _$jscoverage['/ua.js'].lineData[321]++;
              if (visit592_321_1((m = ua.match(/Firefox\/([\d.]*)/)) && m[1])) {
                _$jscoverage['/ua.js'].lineData[322]++;
                UA[shell = 'firefox'] = numberify(m[1]);
              }
            }
          }
        }
      }
    }
    _$jscoverage['/ua.js'].lineData[330]++;
    if (visit593_330_1(!os)) {
      _$jscoverage['/ua.js'].lineData[331]++;
      if (visit594_331_1((/windows|win32/i).test(ua))) {
        _$jscoverage['/ua.js'].lineData[332]++;
        os = 'windows';
      } else {
        _$jscoverage['/ua.js'].lineData[333]++;
        if (visit595_333_1((/macintosh|mac_powerpc/i).test(ua))) {
          _$jscoverage['/ua.js'].lineData[334]++;
          os = 'macintosh';
        } else {
          _$jscoverage['/ua.js'].lineData[335]++;
          if (visit596_335_1((/linux/i).test(ua))) {
            _$jscoverage['/ua.js'].lineData[336]++;
            os = 'linux';
          } else {
            _$jscoverage['/ua.js'].lineData[337]++;
            if (visit597_337_1((/rhino/i).test(ua))) {
              _$jscoverage['/ua.js'].lineData[338]++;
              os = 'rhino';
            }
          }
        }
      }
    }
    _$jscoverage['/ua.js'].lineData[342]++;
    UA.os = os;
    _$jscoverage['/ua.js'].lineData[343]++;
    UA.core = visit598_343_1(UA.core || core);
    _$jscoverage['/ua.js'].lineData[344]++;
    UA.shell = shell;
    _$jscoverage['/ua.js'].lineData[345]++;
    UA.ieMode = visit599_345_1(visit600_345_2(UA.ie && doc.documentMode) || UA.ie);
    _$jscoverage['/ua.js'].lineData[347]++;
    return UA;
  }
  _$jscoverage['/ua.js'].lineData[350]++;
  var UA = KISSY.UA = getDescriptorFromUserAgent(ua);
  _$jscoverage['/ua.js'].lineData[353]++;
  if (visit601_353_1(typeof process === 'object')) {
    _$jscoverage['/ua.js'].lineData[354]++;
    var versions, nodeVersion;
    _$jscoverage['/ua.js'].lineData[356]++;
    if (visit602_356_1((versions = process.versions) && (nodeVersion = versions.node))) {
      _$jscoverage['/ua.js'].lineData[357]++;
      UA.os = process.platform;
      _$jscoverage['/ua.js'].lineData[358]++;
      UA.nodejs = numberify(nodeVersion);
    }
  }
  _$jscoverage['/ua.js'].lineData[363]++;
  UA.getDescriptorFromUserAgent = getDescriptorFromUserAgent;
  _$jscoverage['/ua.js'].lineData[365]++;
  var browsers = ['webkit', 'trident', 'gecko', 'presto', 'chrome', 'safari', 'firefox', 'ie', 'opera'], documentElement = visit603_378_1(doc && doc.documentElement), className = '';
  _$jscoverage['/ua.js'].lineData[380]++;
  if (visit604_380_1(documentElement)) {
    _$jscoverage['/ua.js'].lineData[381]++;
    S.each(browsers, function(key) {
  _$jscoverage['/ua.js'].functionData[6]++;
  _$jscoverage['/ua.js'].lineData[382]++;
  var v = UA[key];
  _$jscoverage['/ua.js'].lineData[383]++;
  if (visit605_383_1(v)) {
    _$jscoverage['/ua.js'].lineData[384]++;
    className += ' ks-' + key + (parseInt(v) + '');
    _$jscoverage['/ua.js'].lineData[385]++;
    className += ' ks-' + key;
  }
});
    _$jscoverage['/ua.js'].lineData[388]++;
    if (visit606_388_1(S.trim(className))) {
      _$jscoverage['/ua.js'].lineData[389]++;
      documentElement.className = S.trim(documentElement.className + className);
    }
  }
})(KISSY);
