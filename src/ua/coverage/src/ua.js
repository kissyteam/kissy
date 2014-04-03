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
  _$jscoverage['/ua.js'].lineData[7] = 0;
  _$jscoverage['/ua.js'].lineData[12] = 0;
  _$jscoverage['/ua.js'].lineData[13] = 0;
  _$jscoverage['/ua.js'].lineData[15] = 0;
  _$jscoverage['/ua.js'].lineData[16] = 0;
  _$jscoverage['/ua.js'].lineData[20] = 0;
  _$jscoverage['/ua.js'].lineData[21] = 0;
  _$jscoverage['/ua.js'].lineData[22] = 0;
  _$jscoverage['/ua.js'].lineData[25] = 0;
  _$jscoverage['/ua.js'].lineData[26] = 0;
  _$jscoverage['/ua.js'].lineData[29] = 0;
  _$jscoverage['/ua.js'].lineData[32] = 0;
  _$jscoverage['/ua.js'].lineData[33] = 0;
  _$jscoverage['/ua.js'].lineData[34] = 0;
  _$jscoverage['/ua.js'].lineData[36] = 0;
  _$jscoverage['/ua.js'].lineData[38] = 0;
  _$jscoverage['/ua.js'].lineData[41] = 0;
  _$jscoverage['/ua.js'].lineData[42] = 0;
  _$jscoverage['/ua.js'].lineData[61] = 0;
  _$jscoverage['/ua.js'].lineData[196] = 0;
  _$jscoverage['/ua.js'].lineData[199] = 0;
  _$jscoverage['/ua.js'].lineData[200] = 0;
  _$jscoverage['/ua.js'].lineData[203] = 0;
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
  _$jscoverage['/ua.js'].lineData[233] = 0;
  _$jscoverage['/ua.js'].lineData[234] = 0;
  _$jscoverage['/ua.js'].lineData[235] = 0;
  _$jscoverage['/ua.js'].lineData[236] = 0;
  _$jscoverage['/ua.js'].lineData[239] = 0;
  _$jscoverage['/ua.js'].lineData[243] = 0;
  _$jscoverage['/ua.js'].lineData[244] = 0;
  _$jscoverage['/ua.js'].lineData[246] = 0;
  _$jscoverage['/ua.js'].lineData[247] = 0;
  _$jscoverage['/ua.js'].lineData[248] = 0;
  _$jscoverage['/ua.js'].lineData[250] = 0;
  _$jscoverage['/ua.js'].lineData[251] = 0;
  _$jscoverage['/ua.js'].lineData[252] = 0;
  _$jscoverage['/ua.js'].lineData[253] = 0;
  _$jscoverage['/ua.js'].lineData[255] = 0;
  _$jscoverage['/ua.js'].lineData[256] = 0;
  _$jscoverage['/ua.js'].lineData[257] = 0;
  _$jscoverage['/ua.js'].lineData[259] = 0;
  _$jscoverage['/ua.js'].lineData[260] = 0;
  _$jscoverage['/ua.js'].lineData[261] = 0;
  _$jscoverage['/ua.js'].lineData[263] = 0;
  _$jscoverage['/ua.js'].lineData[264] = 0;
  _$jscoverage['/ua.js'].lineData[267] = 0;
  _$jscoverage['/ua.js'].lineData[268] = 0;
  _$jscoverage['/ua.js'].lineData[273] = 0;
  _$jscoverage['/ua.js'].lineData[274] = 0;
  _$jscoverage['/ua.js'].lineData[277] = 0;
  _$jscoverage['/ua.js'].lineData[278] = 0;
  _$jscoverage['/ua.js'].lineData[280] = 0;
  _$jscoverage['/ua.js'].lineData[281] = 0;
  _$jscoverage['/ua.js'].lineData[285] = 0;
  _$jscoverage['/ua.js'].lineData[286] = 0;
  _$jscoverage['/ua.js'].lineData[287] = 0;
  _$jscoverage['/ua.js'].lineData[291] = 0;
  _$jscoverage['/ua.js'].lineData[299] = 0;
  _$jscoverage['/ua.js'].lineData[300] = 0;
  _$jscoverage['/ua.js'].lineData[301] = 0;
  _$jscoverage['/ua.js'].lineData[305] = 0;
  _$jscoverage['/ua.js'].lineData[306] = 0;
  _$jscoverage['/ua.js'].lineData[307] = 0;
  _$jscoverage['/ua.js'].lineData[308] = 0;
  _$jscoverage['/ua.js'].lineData[309] = 0;
  _$jscoverage['/ua.js'].lineData[310] = 0;
  _$jscoverage['/ua.js'].lineData[314] = 0;
  _$jscoverage['/ua.js'].lineData[315] = 0;
  _$jscoverage['/ua.js'].lineData[323] = 0;
  _$jscoverage['/ua.js'].lineData[324] = 0;
  _$jscoverage['/ua.js'].lineData[325] = 0;
  _$jscoverage['/ua.js'].lineData[326] = 0;
  _$jscoverage['/ua.js'].lineData[327] = 0;
  _$jscoverage['/ua.js'].lineData[328] = 0;
  _$jscoverage['/ua.js'].lineData[329] = 0;
  _$jscoverage['/ua.js'].lineData[330] = 0;
  _$jscoverage['/ua.js'].lineData[331] = 0;
  _$jscoverage['/ua.js'].lineData[335] = 0;
  _$jscoverage['/ua.js'].lineData[336] = 0;
  _$jscoverage['/ua.js'].lineData[337] = 0;
  _$jscoverage['/ua.js'].lineData[338] = 0;
  _$jscoverage['/ua.js'].lineData[340] = 0;
  _$jscoverage['/ua.js'].lineData[343] = 0;
  _$jscoverage['/ua.js'].lineData[346] = 0;
  _$jscoverage['/ua.js'].lineData[347] = 0;
  _$jscoverage['/ua.js'].lineData[349] = 0;
  _$jscoverage['/ua.js'].lineData[350] = 0;
  _$jscoverage['/ua.js'].lineData[351] = 0;
  _$jscoverage['/ua.js'].lineData[356] = 0;
  _$jscoverage['/ua.js'].lineData[358] = 0;
  _$jscoverage['/ua.js'].lineData[373] = 0;
  _$jscoverage['/ua.js'].lineData[374] = 0;
  _$jscoverage['/ua.js'].lineData[375] = 0;
  _$jscoverage['/ua.js'].lineData[376] = 0;
  _$jscoverage['/ua.js'].lineData[377] = 0;
  _$jscoverage['/ua.js'].lineData[378] = 0;
  _$jscoverage['/ua.js'].lineData[379] = 0;
  _$jscoverage['/ua.js'].lineData[382] = 0;
  _$jscoverage['/ua.js'].lineData[383] = 0;
  _$jscoverage['/ua.js'].lineData[388] = 0;
}
if (! _$jscoverage['/ua.js'].functionData) {
  _$jscoverage['/ua.js'].functionData = [];
  _$jscoverage['/ua.js'].functionData[0] = 0;
  _$jscoverage['/ua.js'].functionData[1] = 0;
  _$jscoverage['/ua.js'].functionData[2] = 0;
  _$jscoverage['/ua.js'].functionData[3] = 0;
  _$jscoverage['/ua.js'].functionData[4] = 0;
  _$jscoverage['/ua.js'].functionData[5] = 0;
}
if (! _$jscoverage['/ua.js'].branchData) {
  _$jscoverage['/ua.js'].branchData = {};
  _$jscoverage['/ua.js'].branchData['10'] = [];
  _$jscoverage['/ua.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['10'][2] = new BranchData();
  _$jscoverage['/ua.js'].branchData['16'] = [];
  _$jscoverage['/ua.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['25'] = [];
  _$jscoverage['/ua.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['34'] = [];
  _$jscoverage['/ua.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['35'] = [];
  _$jscoverage['/ua.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['53'] = [];
  _$jscoverage['/ua.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['196'] = [];
  _$jscoverage['/ua.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['203'] = [];
  _$jscoverage['/ua.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['212'] = [];
  _$jscoverage['/ua.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['214'] = [];
  _$jscoverage['/ua.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['222'] = [];
  _$jscoverage['/ua.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['228'] = [];
  _$jscoverage['/ua.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['228'][2] = new BranchData();
  _$jscoverage['/ua.js'].branchData['231'] = [];
  _$jscoverage['/ua.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['233'] = [];
  _$jscoverage['/ua.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['235'] = [];
  _$jscoverage['/ua.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['243'] = [];
  _$jscoverage['/ua.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['247'] = [];
  _$jscoverage['/ua.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['252'] = [];
  _$jscoverage['/ua.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['255'] = [];
  _$jscoverage['/ua.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['256'] = [];
  _$jscoverage['/ua.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['260'] = [];
  _$jscoverage['/ua.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['267'] = [];
  _$jscoverage['/ua.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['273'] = [];
  _$jscoverage['/ua.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['277'] = [];
  _$jscoverage['/ua.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['280'] = [];
  _$jscoverage['/ua.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['285'] = [];
  _$jscoverage['/ua.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['287'] = [];
  _$jscoverage['/ua.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['307'] = [];
  _$jscoverage['/ua.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['309'] = [];
  _$jscoverage['/ua.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['314'] = [];
  _$jscoverage['/ua.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['323'] = [];
  _$jscoverage['/ua.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['324'] = [];
  _$jscoverage['/ua.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['326'] = [];
  _$jscoverage['/ua.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['328'] = [];
  _$jscoverage['/ua.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['330'] = [];
  _$jscoverage['/ua.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['336'] = [];
  _$jscoverage['/ua.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['338'] = [];
  _$jscoverage['/ua.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['338'][2] = new BranchData();
  _$jscoverage['/ua.js'].branchData['346'] = [];
  _$jscoverage['/ua.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['349'] = [];
  _$jscoverage['/ua.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['371'] = [];
  _$jscoverage['/ua.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['373'] = [];
  _$jscoverage['/ua.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['374'] = [];
  _$jscoverage['/ua.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['377'] = [];
  _$jscoverage['/ua.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['382'] = [];
  _$jscoverage['/ua.js'].branchData['382'][1] = new BranchData();
}
_$jscoverage['/ua.js'].branchData['382'][1].init(285, 9, 'className');
function visit47_382_1(result) {
  _$jscoverage['/ua.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['377'][1].init(81, 1, 'v');
function visit46_377_1(result) {
  _$jscoverage['/ua.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['374'][1].init(25, 19, 'i < browsers.length');
function visit45_374_1(result) {
  _$jscoverage['/ua.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['373'][1].init(12112, 15, 'documentElement');
function visit44_373_1(result) {
  _$jscoverage['/ua.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['371'][1].init(307, 26, 'doc && doc.documentElement');
function visit43_371_1(result) {
  _$jscoverage['/ua.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['349'][1].init(50, 61, '(versions = process.versions) && (nodeVersion = versions.node)');
function visit42_349_1(result) {
  _$jscoverage['/ua.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['346'][1].init(11388, 27, 'typeof process === \'object\'');
function visit41_346_1(result) {
  _$jscoverage['/ua.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['338'][2].init(10276, 25, 'UA.ie && doc.documentMode');
function visit40_338_2(result) {
  _$jscoverage['/ua.js'].branchData['338'][2].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['338'][1].init(10276, 34, 'UA.ie && doc.documentMode || UA.ie');
function visit39_338_1(result) {
  _$jscoverage['/ua.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['336'][1].init(10213, 15, 'UA.core || core');
function visit38_336_1(result) {
  _$jscoverage['/ua.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['330'][1].init(279, 18, '(/rhino/i).test(ua)');
function visit37_330_1(result) {
  _$jscoverage['/ua.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['328'][1].init(202, 18, '(/linux/i).test(ua)');
function visit36_328_1(result) {
  _$jscoverage['/ua.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['326'][1].init(105, 34, '(/macintosh|mac_powerpc/i).test(ua)');
function visit35_326_1(result) {
  _$jscoverage['/ua.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['324'][1].init(18, 26, '(/windows|win32/i).test(ua)');
function visit34_324_1(result) {
  _$jscoverage['/ua.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['323'][1].init(9816, 3, '!os');
function visit33_323_1(result) {
  _$jscoverage['/ua.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['314'][1].init(484, 42, '(m = ua.match(/Firefox\\/([\\d.]*)/)) && m[1]');
function visit32_314_1(result) {
  _$jscoverage['/ua.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['309'][1].init(97, 24, '/Mobile|Tablet/.test(ua)');
function visit31_309_1(result) {
  _$jscoverage['/ua.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['307'][1].init(125, 36, '(m = ua.match(/rv:([\\d.]*)/)) && m[1]');
function visit30_307_1(result) {
  _$jscoverage['/ua.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['287'][1].init(508, 37, '(m = ua.match(/Opera Mobi[^;]*/)) && m');
function visit29_287_1(result) {
  _$jscoverage['/ua.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['285'][1].init(338, 37, '(m = ua.match(/Opera Mini[^;]*/)) && m');
function visit28_285_1(result) {
  _$jscoverage['/ua.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['280'][1].init(131, 52, '(m = ua.match(/Opera\\/.* Version\\/([\\d.]*)/)) && m[1]');
function visit27_280_1(result) {
  _$jscoverage['/ua.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['277'][1].init(115, 40, '(m = ua.match(/Opera\\/([\\d.]*)/)) && m[1]');
function visit26_277_1(result) {
  _$jscoverage['/ua.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['273'][1].init(129, 41, '(m = ua.match(/Presto\\/([\\d.]*)/)) && m[1]');
function visit25_273_1(result) {
  _$jscoverage['/ua.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['267'][1].init(1709, 44, '(m = ua.match(/PhantomJS\\/([^\\s]*)/)) && m[1]');
function visit24_267_1(result) {
  _$jscoverage['/ua.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['260'][1].init(199, 9, 'm && m[1]');
function visit23_260_1(result) {
  _$jscoverage['/ua.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['256'][1].init(25, 17, '/Mobile/.test(ua)');
function visit22_256_1(result) {
  _$jscoverage['/ua.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['255'][1].init(1169, 20, '/ Android/i.test(ua)');
function visit21_255_1(result) {
  _$jscoverage['/ua.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['252'][1].init(359, 9, 'm && m[0]');
function visit20_252_1(result) {
  _$jscoverage['/ua.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['247'][1].init(146, 9, 'm && m[1]');
function visit19_247_1(result) {
  _$jscoverage['/ua.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['243'][1].init(635, 52, '/ Mobile\\//.test(ua) && ua.match(/iPad|iPod|iPhone/)');
function visit18_243_1(result) {
  _$jscoverage['/ua.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['235'][1].init(344, 42, '(m = ua.match(/\\/([\\d.]*) Safari/)) && m[1]');
function visit17_235_1(result) {
  _$jscoverage['/ua.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['233'][1].init(210, 41, '(m = ua.match(/Chrome\\/([\\d.]*)/)) && m[1]');
function visit16_233_1(result) {
  _$jscoverage['/ua.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['231'][1].init(78, 40, '(m = ua.match(/OPR\\/(\\d+\\.\\d+)/)) && m[1]');
function visit15_231_1(result) {
  _$jscoverage['/ua.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['228'][2].init(102, 76, '(m = ua.match(/AppleWebKit\\/([\\d.]*)/)) || (m = ua.match(/Safari\\/([\\d.]*)/))');
function visit14_228_2(result) {
  _$jscoverage['/ua.js'].branchData['228'][2].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['228'][1].init(102, 85, '((m = ua.match(/AppleWebKit\\/([\\d.]*)/)) || (m = ua.match(/Safari\\/([\\d.]*)/))) && m[1]');
function visit13_228_1(result) {
  _$jscoverage['/ua.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['222'][1].init(744, 40, '!UA.ie && (ieVersion = getIEVersion(ua))');
function visit12_222_1(result) {
  _$jscoverage['/ua.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['214'][1].init(100, 12, 's.length > 0');
function visit11_214_1(result) {
  _$jscoverage['/ua.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['212'][1].init(403, 8, 'v <= end');
function visit10_212_1(result) {
  _$jscoverage['/ua.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['203'][1].init(4379, 12, 's.length > 0');
function visit9_203_1(result) {
  _$jscoverage['/ua.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['196'][1].init(3995, 31, 'div && div.getElementsByTagName');
function visit8_196_1(result) {
  _$jscoverage['/ua.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['53'][1].init(355, 31, 'doc && doc.createElement(\'div\')');
function visit7_53_1(result) {
  _$jscoverage['/ua.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['35'][1].init(82, 12, 'm[1] || m[2]');
function visit6_35_1(result) {
  _$jscoverage['/ua.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['34'][1].init(32, 97, '(m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\\s|:)?([0-9.]+)/)) && (v = (m[1] || m[2]))');
function visit5_34_1(result) {
  _$jscoverage['/ua.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['25'][1].init(157, 42, '(m = ua.match(/Trident\\/([\\d.]*)/)) && m[1]');
function visit4_25_1(result) {
  _$jscoverage['/ua.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['16'][1].init(21, 9, 'c++ === 0');
function visit3_16_1(result) {
  _$jscoverage['/ua.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['10'][2].init(97, 32, 'navigator && navigator.userAgent');
function visit2_10_2(result) {
  _$jscoverage['/ua.js'].branchData['10'][2].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['10'][1].init(97, 38, 'navigator && navigator.userAgent || \'\'');
function visit1_10_1(result) {
  _$jscoverage['/ua.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].lineData[5]++;
KISSY.add(function(S, require, exports, module, undefined) {
  _$jscoverage['/ua.js'].functionData[0]++;
  _$jscoverage['/ua.js'].lineData[7]++;
  var win = S.Env.host, doc = win.document, navigator = win.navigator, ua = visit1_10_1(visit2_10_2(navigator && navigator.userAgent) || '');
  _$jscoverage['/ua.js'].lineData[12]++;
  function numberify(s) {
    _$jscoverage['/ua.js'].functionData[1]++;
    _$jscoverage['/ua.js'].lineData[13]++;
    var c = 0;
    _$jscoverage['/ua.js'].lineData[15]++;
    return parseFloat(s.replace(/\./g, function() {
  _$jscoverage['/ua.js'].functionData[2]++;
  _$jscoverage['/ua.js'].lineData[16]++;
  return (visit3_16_1(c++ === 0)) ? '.' : '';
}));
  }
  _$jscoverage['/ua.js'].lineData[20]++;
  function setTridentVersion(ua, UA) {
    _$jscoverage['/ua.js'].functionData[3]++;
    _$jscoverage['/ua.js'].lineData[21]++;
    var core, m;
    _$jscoverage['/ua.js'].lineData[22]++;
    UA[core = 'trident'] = 0.1;
    _$jscoverage['/ua.js'].lineData[25]++;
    if (visit4_25_1((m = ua.match(/Trident\/([\d.]*)/)) && m[1])) {
      _$jscoverage['/ua.js'].lineData[26]++;
      UA[core] = numberify(m[1]);
    }
    _$jscoverage['/ua.js'].lineData[29]++;
    UA.core = core;
  }
  _$jscoverage['/ua.js'].lineData[32]++;
  function getIEVersion(ua) {
    _$jscoverage['/ua.js'].functionData[4]++;
    _$jscoverage['/ua.js'].lineData[33]++;
    var m, v;
    _$jscoverage['/ua.js'].lineData[34]++;
    if (visit5_34_1((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) && (v = (visit6_35_1(m[1] || m[2]))))) {
      _$jscoverage['/ua.js'].lineData[36]++;
      return numberify(v);
    }
    _$jscoverage['/ua.js'].lineData[38]++;
    return 0;
  }
  _$jscoverage['/ua.js'].lineData[41]++;
  function getDescriptorFromUserAgent(ua) {
    _$jscoverage['/ua.js'].functionData[5]++;
    _$jscoverage['/ua.js'].lineData[42]++;
    var EMPTY = '', os, core = EMPTY, shell = EMPTY, m, IE_DETECT_RANGE = [6, 9], ieVersion, v, end, VERSION_PLACEHOLDER = '{{version}}', IE_DETECT_TPL = '<!--[if IE ' + VERSION_PLACEHOLDER + ']><' + 's></s><![endif]-->', div = visit7_53_1(doc && doc.createElement('div')), s = [];
    _$jscoverage['/ua.js'].lineData[61]++;
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
    _$jscoverage['/ua.js'].lineData[196]++;
    if (visit8_196_1(div && div.getElementsByTagName)) {
      _$jscoverage['/ua.js'].lineData[199]++;
      div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, '');
      _$jscoverage['/ua.js'].lineData[200]++;
      s = div.getElementsByTagName('s');
    }
    _$jscoverage['/ua.js'].lineData[203]++;
    if (visit9_203_1(s.length > 0)) {
      _$jscoverage['/ua.js'].lineData[204]++;
      setTridentVersion(ua, UA);
      _$jscoverage['/ua.js'].lineData[212]++;
      for (v = IE_DETECT_RANGE[0] , end = IE_DETECT_RANGE[1]; visit10_212_1(v <= end); v++) {
        _$jscoverage['/ua.js'].lineData[213]++;
        div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, v);
        _$jscoverage['/ua.js'].lineData[214]++;
        if (visit11_214_1(s.length > 0)) {
          _$jscoverage['/ua.js'].lineData[215]++;
          UA[shell = 'ie'] = v;
          _$jscoverage['/ua.js'].lineData[216]++;
          break;
        }
      }
      _$jscoverage['/ua.js'].lineData[222]++;
      if (visit12_222_1(!UA.ie && (ieVersion = getIEVersion(ua)))) {
        _$jscoverage['/ua.js'].lineData[223]++;
        UA[shell = 'ie'] = ieVersion;
      }
    } else {
      _$jscoverage['/ua.js'].lineData[228]++;
      if (visit13_228_1((visit14_228_2((m = ua.match(/AppleWebKit\/([\d.]*)/)) || (m = ua.match(/Safari\/([\d.]*)/)))) && m[1])) {
        _$jscoverage['/ua.js'].lineData[229]++;
        UA[core = 'webkit'] = numberify(m[1]);
        _$jscoverage['/ua.js'].lineData[231]++;
        if (visit15_231_1((m = ua.match(/OPR\/(\d+\.\d+)/)) && m[1])) {
          _$jscoverage['/ua.js'].lineData[232]++;
          UA[shell = 'opera'] = numberify(m[1]);
        } else {
          _$jscoverage['/ua.js'].lineData[233]++;
          if (visit16_233_1((m = ua.match(/Chrome\/([\d.]*)/)) && m[1])) {
            _$jscoverage['/ua.js'].lineData[234]++;
            UA[shell = 'chrome'] = numberify(m[1]);
          } else {
            _$jscoverage['/ua.js'].lineData[235]++;
            if (visit17_235_1((m = ua.match(/\/([\d.]*) Safari/)) && m[1])) {
              _$jscoverage['/ua.js'].lineData[236]++;
              UA[shell = 'safari'] = numberify(m[1]);
            } else {
              _$jscoverage['/ua.js'].lineData[239]++;
              UA.safari = UA.webkit;
            }
          }
        }
        _$jscoverage['/ua.js'].lineData[243]++;
        if (visit18_243_1(/ Mobile\//.test(ua) && ua.match(/iPad|iPod|iPhone/))) {
          _$jscoverage['/ua.js'].lineData[244]++;
          UA.mobile = 'apple';
          _$jscoverage['/ua.js'].lineData[246]++;
          m = ua.match(/OS ([^\s]*)/);
          _$jscoverage['/ua.js'].lineData[247]++;
          if (visit19_247_1(m && m[1])) {
            _$jscoverage['/ua.js'].lineData[248]++;
            UA.ios = numberify(m[1].replace('_', '.'));
          }
          _$jscoverage['/ua.js'].lineData[250]++;
          os = 'ios';
          _$jscoverage['/ua.js'].lineData[251]++;
          m = ua.match(/iPad|iPod|iPhone/);
          _$jscoverage['/ua.js'].lineData[252]++;
          if (visit20_252_1(m && m[0])) {
            _$jscoverage['/ua.js'].lineData[253]++;
            UA[m[0].toLowerCase()] = UA.ios;
          }
        } else {
          _$jscoverage['/ua.js'].lineData[255]++;
          if (visit21_255_1(/ Android/i.test(ua))) {
            _$jscoverage['/ua.js'].lineData[256]++;
            if (visit22_256_1(/Mobile/.test(ua))) {
              _$jscoverage['/ua.js'].lineData[257]++;
              os = UA.mobile = 'android';
            }
            _$jscoverage['/ua.js'].lineData[259]++;
            m = ua.match(/Android ([^\s]*);/);
            _$jscoverage['/ua.js'].lineData[260]++;
            if (visit23_260_1(m && m[1])) {
              _$jscoverage['/ua.js'].lineData[261]++;
              UA.android = numberify(m[1]);
            }
          } else {
            _$jscoverage['/ua.js'].lineData[263]++;
            if ((m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))) {
              _$jscoverage['/ua.js'].lineData[264]++;
              UA.mobile = m[0].toLowerCase();
            }
          }
        }
        _$jscoverage['/ua.js'].lineData[267]++;
        if (visit24_267_1((m = ua.match(/PhantomJS\/([^\s]*)/)) && m[1])) {
          _$jscoverage['/ua.js'].lineData[268]++;
          UA.phantomjs = numberify(m[1]);
        }
      } else {
        _$jscoverage['/ua.js'].lineData[273]++;
        if (visit25_273_1((m = ua.match(/Presto\/([\d.]*)/)) && m[1])) {
          _$jscoverage['/ua.js'].lineData[274]++;
          UA[core = 'presto'] = numberify(m[1]);
          _$jscoverage['/ua.js'].lineData[277]++;
          if (visit26_277_1((m = ua.match(/Opera\/([\d.]*)/)) && m[1])) {
            _$jscoverage['/ua.js'].lineData[278]++;
            UA[shell = 'opera'] = numberify(m[1]);
            _$jscoverage['/ua.js'].lineData[280]++;
            if (visit27_280_1((m = ua.match(/Opera\/.* Version\/([\d.]*)/)) && m[1])) {
              _$jscoverage['/ua.js'].lineData[281]++;
              UA[shell] = numberify(m[1]);
            }
            _$jscoverage['/ua.js'].lineData[285]++;
            if (visit28_285_1((m = ua.match(/Opera Mini[^;]*/)) && m)) {
              _$jscoverage['/ua.js'].lineData[286]++;
              UA.mobile = m[0].toLowerCase();
            } else {
              _$jscoverage['/ua.js'].lineData[287]++;
              if (visit29_287_1((m = ua.match(/Opera Mobi[^;]*/)) && m)) {
                _$jscoverage['/ua.js'].lineData[291]++;
                UA.mobile = m[0];
              }
            }
          }
        } else {
          _$jscoverage['/ua.js'].lineData[299]++;
          if ((ieVersion = getIEVersion(ua))) {
            _$jscoverage['/ua.js'].lineData[300]++;
            UA[shell = 'ie'] = ieVersion;
            _$jscoverage['/ua.js'].lineData[301]++;
            setTridentVersion(ua, UA);
          } else {
            _$jscoverage['/ua.js'].lineData[305]++;
            if ((m = ua.match(/Gecko/))) {
              _$jscoverage['/ua.js'].lineData[306]++;
              UA[core = 'gecko'] = 0.1;
              _$jscoverage['/ua.js'].lineData[307]++;
              if (visit30_307_1((m = ua.match(/rv:([\d.]*)/)) && m[1])) {
                _$jscoverage['/ua.js'].lineData[308]++;
                UA[core] = numberify(m[1]);
                _$jscoverage['/ua.js'].lineData[309]++;
                if (visit31_309_1(/Mobile|Tablet/.test(ua))) {
                  _$jscoverage['/ua.js'].lineData[310]++;
                  UA.mobile = 'firefox';
                }
              }
              _$jscoverage['/ua.js'].lineData[314]++;
              if (visit32_314_1((m = ua.match(/Firefox\/([\d.]*)/)) && m[1])) {
                _$jscoverage['/ua.js'].lineData[315]++;
                UA[shell = 'firefox'] = numberify(m[1]);
              }
            }
          }
        }
      }
    }
    _$jscoverage['/ua.js'].lineData[323]++;
    if (visit33_323_1(!os)) {
      _$jscoverage['/ua.js'].lineData[324]++;
      if (visit34_324_1((/windows|win32/i).test(ua))) {
        _$jscoverage['/ua.js'].lineData[325]++;
        os = 'windows';
      } else {
        _$jscoverage['/ua.js'].lineData[326]++;
        if (visit35_326_1((/macintosh|mac_powerpc/i).test(ua))) {
          _$jscoverage['/ua.js'].lineData[327]++;
          os = 'macintosh';
        } else {
          _$jscoverage['/ua.js'].lineData[328]++;
          if (visit36_328_1((/linux/i).test(ua))) {
            _$jscoverage['/ua.js'].lineData[329]++;
            os = 'linux';
          } else {
            _$jscoverage['/ua.js'].lineData[330]++;
            if (visit37_330_1((/rhino/i).test(ua))) {
              _$jscoverage['/ua.js'].lineData[331]++;
              os = 'rhino';
            }
          }
        }
      }
    }
    _$jscoverage['/ua.js'].lineData[335]++;
    UA.os = os;
    _$jscoverage['/ua.js'].lineData[336]++;
    UA.core = visit38_336_1(UA.core || core);
    _$jscoverage['/ua.js'].lineData[337]++;
    UA.shell = shell;
    _$jscoverage['/ua.js'].lineData[338]++;
    UA.ieMode = visit39_338_1(visit40_338_2(UA.ie && doc.documentMode) || UA.ie);
    _$jscoverage['/ua.js'].lineData[340]++;
    return UA;
  }
  _$jscoverage['/ua.js'].lineData[343]++;
  var UA = S.UA = getDescriptorFromUserAgent(ua);
  _$jscoverage['/ua.js'].lineData[346]++;
  if (visit41_346_1(typeof process === 'object')) {
    _$jscoverage['/ua.js'].lineData[347]++;
    var versions, nodeVersion;
    _$jscoverage['/ua.js'].lineData[349]++;
    if (visit42_349_1((versions = process.versions) && (nodeVersion = versions.node))) {
      _$jscoverage['/ua.js'].lineData[350]++;
      UA.os = process.platform;
      _$jscoverage['/ua.js'].lineData[351]++;
      UA.nodejs = numberify(nodeVersion);
    }
  }
  _$jscoverage['/ua.js'].lineData[356]++;
  UA.getDescriptorFromUserAgent = getDescriptorFromUserAgent;
  _$jscoverage['/ua.js'].lineData[358]++;
  var browsers = ['webkit', 'trident', 'gecko', 'presto', 'chrome', 'safari', 'firefox', 'ie', 'opera'], documentElement = visit43_371_1(doc && doc.documentElement), className = '';
  _$jscoverage['/ua.js'].lineData[373]++;
  if (visit44_373_1(documentElement)) {
    _$jscoverage['/ua.js'].lineData[374]++;
    for (var i = 0; visit45_374_1(i < browsers.length); i++) {
      _$jscoverage['/ua.js'].lineData[375]++;
      var key = browsers[i];
      _$jscoverage['/ua.js'].lineData[376]++;
      var v = UA[key];
      _$jscoverage['/ua.js'].lineData[377]++;
      if (visit46_377_1(v)) {
        _$jscoverage['/ua.js'].lineData[378]++;
        className += ' ks-' + key + (parseInt(v, 10) + '');
        _$jscoverage['/ua.js'].lineData[379]++;
        className += ' ks-' + key;
      }
    }
    _$jscoverage['/ua.js'].lineData[382]++;
    if (visit47_382_1(className)) {
      _$jscoverage['/ua.js'].lineData[383]++;
      documentElement.className = (documentElement.className + className).replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
    }
  }
  _$jscoverage['/ua.js'].lineData[388]++;
  return UA;
});
