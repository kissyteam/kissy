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
  _$jscoverage['/ua.js'].lineData[233] = 0;
  _$jscoverage['/ua.js'].lineData[234] = 0;
  _$jscoverage['/ua.js'].lineData[235] = 0;
  _$jscoverage['/ua.js'].lineData[236] = 0;
  _$jscoverage['/ua.js'].lineData[240] = 0;
  _$jscoverage['/ua.js'].lineData[241] = 0;
  _$jscoverage['/ua.js'].lineData[243] = 0;
  _$jscoverage['/ua.js'].lineData[244] = 0;
  _$jscoverage['/ua.js'].lineData[245] = 0;
  _$jscoverage['/ua.js'].lineData[247] = 0;
  _$jscoverage['/ua.js'].lineData[248] = 0;
  _$jscoverage['/ua.js'].lineData[249] = 0;
  _$jscoverage['/ua.js'].lineData[250] = 0;
  _$jscoverage['/ua.js'].lineData[252] = 0;
  _$jscoverage['/ua.js'].lineData[253] = 0;
  _$jscoverage['/ua.js'].lineData[254] = 0;
  _$jscoverage['/ua.js'].lineData[256] = 0;
  _$jscoverage['/ua.js'].lineData[257] = 0;
  _$jscoverage['/ua.js'].lineData[258] = 0;
  _$jscoverage['/ua.js'].lineData[260] = 0;
  _$jscoverage['/ua.js'].lineData[261] = 0;
  _$jscoverage['/ua.js'].lineData[264] = 0;
  _$jscoverage['/ua.js'].lineData[265] = 0;
  _$jscoverage['/ua.js'].lineData[270] = 0;
  _$jscoverage['/ua.js'].lineData[271] = 0;
  _$jscoverage['/ua.js'].lineData[274] = 0;
  _$jscoverage['/ua.js'].lineData[275] = 0;
  _$jscoverage['/ua.js'].lineData[277] = 0;
  _$jscoverage['/ua.js'].lineData[278] = 0;
  _$jscoverage['/ua.js'].lineData[282] = 0;
  _$jscoverage['/ua.js'].lineData[283] = 0;
  _$jscoverage['/ua.js'].lineData[284] = 0;
  _$jscoverage['/ua.js'].lineData[288] = 0;
  _$jscoverage['/ua.js'].lineData[296] = 0;
  _$jscoverage['/ua.js'].lineData[297] = 0;
  _$jscoverage['/ua.js'].lineData[298] = 0;
  _$jscoverage['/ua.js'].lineData[302] = 0;
  _$jscoverage['/ua.js'].lineData[303] = 0;
  _$jscoverage['/ua.js'].lineData[304] = 0;
  _$jscoverage['/ua.js'].lineData[305] = 0;
  _$jscoverage['/ua.js'].lineData[306] = 0;
  _$jscoverage['/ua.js'].lineData[307] = 0;
  _$jscoverage['/ua.js'].lineData[311] = 0;
  _$jscoverage['/ua.js'].lineData[312] = 0;
  _$jscoverage['/ua.js'].lineData[320] = 0;
  _$jscoverage['/ua.js'].lineData[321] = 0;
  _$jscoverage['/ua.js'].lineData[322] = 0;
  _$jscoverage['/ua.js'].lineData[323] = 0;
  _$jscoverage['/ua.js'].lineData[324] = 0;
  _$jscoverage['/ua.js'].lineData[325] = 0;
  _$jscoverage['/ua.js'].lineData[326] = 0;
  _$jscoverage['/ua.js'].lineData[327] = 0;
  _$jscoverage['/ua.js'].lineData[328] = 0;
  _$jscoverage['/ua.js'].lineData[332] = 0;
  _$jscoverage['/ua.js'].lineData[333] = 0;
  _$jscoverage['/ua.js'].lineData[334] = 0;
  _$jscoverage['/ua.js'].lineData[335] = 0;
  _$jscoverage['/ua.js'].lineData[337] = 0;
  _$jscoverage['/ua.js'].lineData[340] = 0;
  _$jscoverage['/ua.js'].lineData[343] = 0;
  _$jscoverage['/ua.js'].lineData[344] = 0;
  _$jscoverage['/ua.js'].lineData[346] = 0;
  _$jscoverage['/ua.js'].lineData[347] = 0;
  _$jscoverage['/ua.js'].lineData[348] = 0;
  _$jscoverage['/ua.js'].lineData[353] = 0;
  _$jscoverage['/ua.js'].lineData[355] = 0;
  _$jscoverage['/ua.js'].lineData[370] = 0;
  _$jscoverage['/ua.js'].lineData[371] = 0;
  _$jscoverage['/ua.js'].lineData[372] = 0;
  _$jscoverage['/ua.js'].lineData[373] = 0;
  _$jscoverage['/ua.js'].lineData[374] = 0;
  _$jscoverage['/ua.js'].lineData[375] = 0;
  _$jscoverage['/ua.js'].lineData[378] = 0;
  _$jscoverage['/ua.js'].lineData[379] = 0;
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
  _$jscoverage['/ua.js'].branchData['233'] = [];
  _$jscoverage['/ua.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['235'] = [];
  _$jscoverage['/ua.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['240'] = [];
  _$jscoverage['/ua.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['244'] = [];
  _$jscoverage['/ua.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['249'] = [];
  _$jscoverage['/ua.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['252'] = [];
  _$jscoverage['/ua.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['253'] = [];
  _$jscoverage['/ua.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['257'] = [];
  _$jscoverage['/ua.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['264'] = [];
  _$jscoverage['/ua.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['270'] = [];
  _$jscoverage['/ua.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['274'] = [];
  _$jscoverage['/ua.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['277'] = [];
  _$jscoverage['/ua.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['282'] = [];
  _$jscoverage['/ua.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['284'] = [];
  _$jscoverage['/ua.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['304'] = [];
  _$jscoverage['/ua.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['306'] = [];
  _$jscoverage['/ua.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['311'] = [];
  _$jscoverage['/ua.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['320'] = [];
  _$jscoverage['/ua.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['321'] = [];
  _$jscoverage['/ua.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['323'] = [];
  _$jscoverage['/ua.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['325'] = [];
  _$jscoverage['/ua.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['327'] = [];
  _$jscoverage['/ua.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['333'] = [];
  _$jscoverage['/ua.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['335'] = [];
  _$jscoverage['/ua.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['335'][2] = new BranchData();
  _$jscoverage['/ua.js'].branchData['343'] = [];
  _$jscoverage['/ua.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['346'] = [];
  _$jscoverage['/ua.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['368'] = [];
  _$jscoverage['/ua.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['370'] = [];
  _$jscoverage['/ua.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['373'] = [];
  _$jscoverage['/ua.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['378'] = [];
  _$jscoverage['/ua.js'].branchData['378'][1] = new BranchData();
}
_$jscoverage['/ua.js'].branchData['378'][1].init(241, 17, 'S.trim(className)');
function visit598_378_1(result) {
  _$jscoverage['/ua.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['373'][1].init(46, 1, 'v');
function visit597_373_1(result) {
  _$jscoverage['/ua.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['370'][1].init(11889, 15, 'documentElement');
function visit596_370_1(result) {
  _$jscoverage['/ua.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['368'][1].init(307, 26, 'doc && doc.documentElement');
function visit595_368_1(result) {
  _$jscoverage['/ua.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['346'][1].init(50, 61, '(versions = process.versions) && (nodeVersion = versions.node)');
function visit594_346_1(result) {
  _$jscoverage['/ua.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['343'][1].init(11165, 27, 'typeof process === \'object\'');
function visit593_343_1(result) {
  _$jscoverage['/ua.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['335'][2].init(10048, 25, 'UA.ie && doc.documentMode');
function visit592_335_2(result) {
  _$jscoverage['/ua.js'].branchData['335'][2].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['335'][1].init(10048, 34, 'UA.ie && doc.documentMode || UA.ie');
function visit591_335_1(result) {
  _$jscoverage['/ua.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['333'][1].init(9985, 15, 'UA.core || core');
function visit590_333_1(result) {
  _$jscoverage['/ua.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['327'][1].init(279, 18, '(/rhino/i).test(ua)');
function visit589_327_1(result) {
  _$jscoverage['/ua.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['325'][1].init(202, 18, '(/linux/i).test(ua)');
function visit588_325_1(result) {
  _$jscoverage['/ua.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['323'][1].init(105, 34, '(/macintosh|mac_powerpc/i).test(ua)');
function visit587_323_1(result) {
  _$jscoverage['/ua.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['321'][1].init(18, 26, '(/windows|win32/i).test(ua)');
function visit586_321_1(result) {
  _$jscoverage['/ua.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['320'][1].init(9588, 3, '!os');
function visit585_320_1(result) {
  _$jscoverage['/ua.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['311'][1].init(484, 42, '(m = ua.match(/Firefox\\/([\\d.]*)/)) && m[1]');
function visit584_311_1(result) {
  _$jscoverage['/ua.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['306'][1].init(97, 24, '/Mobile|Tablet/.test(ua)');
function visit583_306_1(result) {
  _$jscoverage['/ua.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['304'][1].init(125, 36, '(m = ua.match(/rv:([\\d.]*)/)) && m[1]');
function visit582_304_1(result) {
  _$jscoverage['/ua.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['284'][1].init(508, 37, '(m = ua.match(/Opera Mobi[^;]*/)) && m');
function visit581_284_1(result) {
  _$jscoverage['/ua.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['282'][1].init(338, 37, '(m = ua.match(/Opera Mini[^;]*/)) && m');
function visit580_282_1(result) {
  _$jscoverage['/ua.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['277'][1].init(131, 52, '(m = ua.match(/Opera\\/.* Version\\/([\\d.]*)/)) && m[1]');
function visit579_277_1(result) {
  _$jscoverage['/ua.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['274'][1].init(115, 40, '(m = ua.match(/Opera\\/([\\d.]*)/)) && m[1]');
function visit578_274_1(result) {
  _$jscoverage['/ua.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['270'][1].init(129, 41, '(m = ua.match(/Presto\\/([\\d.]*)/)) && m[1]');
function visit577_270_1(result) {
  _$jscoverage['/ua.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['264'][1].init(1593, 44, '(m = ua.match(/PhantomJS\\/([^\\s]*)/)) && m[1]');
function visit576_264_1(result) {
  _$jscoverage['/ua.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['257'][1].init(199, 9, 'm && m[1]');
function visit575_257_1(result) {
  _$jscoverage['/ua.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['253'][1].init(25, 17, '/Mobile/.test(ua)');
function visit574_253_1(result) {
  _$jscoverage['/ua.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['252'][1].init(1053, 20, '/ Android/i.test(ua)');
function visit573_252_1(result) {
  _$jscoverage['/ua.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['249'][1].init(359, 9, 'm && m[0]');
function visit572_249_1(result) {
  _$jscoverage['/ua.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['244'][1].init(146, 9, 'm && m[1]');
function visit571_244_1(result) {
  _$jscoverage['/ua.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['240'][1].init(519, 52, '/ Mobile\\//.test(ua) && ua.match(/iPad|iPod|iPhone/)');
function visit570_240_1(result) {
  _$jscoverage['/ua.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['235'][1].init(344, 42, '(m = ua.match(/\\/([\\d.]*) Safari/)) && m[1]');
function visit569_235_1(result) {
  _$jscoverage['/ua.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['233'][1].init(210, 41, '(m = ua.match(/Chrome\\/([\\d.]*)/)) && m[1]');
function visit568_233_1(result) {
  _$jscoverage['/ua.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['231'][1].init(78, 40, '(m = ua.match(/OPR\\/(\\d+\\.\\d+)/)) && m[1]');
function visit567_231_1(result) {
  _$jscoverage['/ua.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['228'][1].init(40, 46, '(m = ua.match(/AppleWebKit\\/([\\d.]*)/)) && m[1]');
function visit566_228_1(result) {
  _$jscoverage['/ua.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['222'][1].init(745, 40, '!UA.ie && (ieVersion = getIEVersion(ua))');
function visit565_222_1(result) {
  _$jscoverage['/ua.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['214'][1].init(100, 12, 's.length > 0');
function visit564_214_1(result) {
  _$jscoverage['/ua.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['212'][1].init(404, 8, 'v <= end');
function visit563_212_1(result) {
  _$jscoverage['/ua.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['202'][1].init(4366, 12, 's.length > 0');
function visit562_202_1(result) {
  _$jscoverage['/ua.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['195'][1].init(3982, 31, 'div && div.getElementsByTagName');
function visit561_195_1(result) {
  _$jscoverage['/ua.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['53'][1].init(343, 31, 'doc && doc.createElement(\'div\')');
function visit560_53_1(result) {
  _$jscoverage['/ua.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['36'][1].init(82, 12, 'm[1] || m[2]');
function visit559_36_1(result) {
  _$jscoverage['/ua.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['35'][1].init(32, 97, '(m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\\s|:)?([0-9.]+)/)) && (v = (m[1] || m[2]))');
function visit558_35_1(result) {
  _$jscoverage['/ua.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['26'][1].init(157, 42, '(m = ua.match(/Trident\\/([\\d.]*)/)) && m[1]');
function visit557_26_1(result) {
  _$jscoverage['/ua.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['17'][1].init(21, 9, 'c++ === 0');
function visit556_17_1(result) {
  _$jscoverage['/ua.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['11'][2].init(97, 32, 'navigator && navigator.userAgent');
function visit555_11_2(result) {
  _$jscoverage['/ua.js'].branchData['11'][2].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['11'][1].init(97, 38, 'navigator && navigator.userAgent || \'\'');
function visit554_11_1(result) {
  _$jscoverage['/ua.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].lineData[5]++;
(function(S, undefined) {
  _$jscoverage['/ua.js'].functionData[0]++;
  _$jscoverage['/ua.js'].lineData[8]++;
  var win = S.Env.host, doc = win.document, navigator = win.navigator, ua = visit554_11_1(visit555_11_2(navigator && navigator.userAgent) || '');
  _$jscoverage['/ua.js'].lineData[13]++;
  function numberify(s) {
    _$jscoverage['/ua.js'].functionData[1]++;
    _$jscoverage['/ua.js'].lineData[14]++;
    var c = 0;
    _$jscoverage['/ua.js'].lineData[16]++;
    return parseFloat(s.replace(/\./g, function() {
  _$jscoverage['/ua.js'].functionData[2]++;
  _$jscoverage['/ua.js'].lineData[17]++;
  return (visit556_17_1(c++ === 0)) ? '.' : '';
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
    if (visit557_26_1((m = ua.match(/Trident\/([\d.]*)/)) && m[1])) {
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
    if (visit558_35_1((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) && (v = (visit559_36_1(m[1] || m[2]))))) {
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
    var EMPTY = '', os, core = EMPTY, shell = EMPTY, m, IE_DETECT_RANGE = [6, 9], ieVersion, v, end, VERSION_PLACEHOLDER = '{{version}}', IE_DETECT_TPL = '<!--[if IE ' + VERSION_PLACEHOLDER + ']><' + 's></s><![endif]-->', div = visit560_53_1(doc && doc.createElement('div')), s = [];
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
    if (visit561_195_1(div && div.getElementsByTagName)) {
      _$jscoverage['/ua.js'].lineData[198]++;
      div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, '');
      _$jscoverage['/ua.js'].lineData[199]++;
      s = div.getElementsByTagName('s');
    }
    _$jscoverage['/ua.js'].lineData[202]++;
    if (visit562_202_1(s.length > 0)) {
      _$jscoverage['/ua.js'].lineData[204]++;
      setTridentVersion(ua, UA);
      _$jscoverage['/ua.js'].lineData[212]++;
      for (v = IE_DETECT_RANGE[0] , end = IE_DETECT_RANGE[1]; visit563_212_1(v <= end); v++) {
        _$jscoverage['/ua.js'].lineData[213]++;
        div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, v);
        _$jscoverage['/ua.js'].lineData[214]++;
        if (visit564_214_1(s.length > 0)) {
          _$jscoverage['/ua.js'].lineData[215]++;
          UA[shell = 'ie'] = v;
          _$jscoverage['/ua.js'].lineData[216]++;
          break;
        }
      }
      _$jscoverage['/ua.js'].lineData[222]++;
      if (visit565_222_1(!UA.ie && (ieVersion = getIEVersion(ua)))) {
        _$jscoverage['/ua.js'].lineData[223]++;
        UA[shell = 'ie'] = ieVersion;
      }
    } else {
      _$jscoverage['/ua.js'].lineData[228]++;
      if (visit566_228_1((m = ua.match(/AppleWebKit\/([\d.]*)/)) && m[1])) {
        _$jscoverage['/ua.js'].lineData[229]++;
        UA[core = 'webkit'] = numberify(m[1]);
        _$jscoverage['/ua.js'].lineData[231]++;
        if (visit567_231_1((m = ua.match(/OPR\/(\d+\.\d+)/)) && m[1])) {
          _$jscoverage['/ua.js'].lineData[232]++;
          UA[shell = 'opera'] = numberify(m[1]);
        } else {
          _$jscoverage['/ua.js'].lineData[233]++;
          if (visit568_233_1((m = ua.match(/Chrome\/([\d.]*)/)) && m[1])) {
            _$jscoverage['/ua.js'].lineData[234]++;
            UA[shell = 'chrome'] = numberify(m[1]);
          } else {
            _$jscoverage['/ua.js'].lineData[235]++;
            if (visit569_235_1((m = ua.match(/\/([\d.]*) Safari/)) && m[1])) {
              _$jscoverage['/ua.js'].lineData[236]++;
              UA[shell = 'safari'] = numberify(m[1]);
            }
          }
        }
        _$jscoverage['/ua.js'].lineData[240]++;
        if (visit570_240_1(/ Mobile\//.test(ua) && ua.match(/iPad|iPod|iPhone/))) {
          _$jscoverage['/ua.js'].lineData[241]++;
          UA.mobile = 'apple';
          _$jscoverage['/ua.js'].lineData[243]++;
          m = ua.match(/OS ([^\s]*)/);
          _$jscoverage['/ua.js'].lineData[244]++;
          if (visit571_244_1(m && m[1])) {
            _$jscoverage['/ua.js'].lineData[245]++;
            UA.ios = numberify(m[1].replace('_', '.'));
          }
          _$jscoverage['/ua.js'].lineData[247]++;
          os = 'ios';
          _$jscoverage['/ua.js'].lineData[248]++;
          m = ua.match(/iPad|iPod|iPhone/);
          _$jscoverage['/ua.js'].lineData[249]++;
          if (visit572_249_1(m && m[0])) {
            _$jscoverage['/ua.js'].lineData[250]++;
            UA[m[0].toLowerCase()] = UA.ios;
          }
        } else {
          _$jscoverage['/ua.js'].lineData[252]++;
          if (visit573_252_1(/ Android/i.test(ua))) {
            _$jscoverage['/ua.js'].lineData[253]++;
            if (visit574_253_1(/Mobile/.test(ua))) {
              _$jscoverage['/ua.js'].lineData[254]++;
              os = UA.mobile = 'android';
            }
            _$jscoverage['/ua.js'].lineData[256]++;
            m = ua.match(/Android ([^\s]*);/);
            _$jscoverage['/ua.js'].lineData[257]++;
            if (visit575_257_1(m && m[1])) {
              _$jscoverage['/ua.js'].lineData[258]++;
              UA.android = numberify(m[1]);
            }
          } else {
            _$jscoverage['/ua.js'].lineData[260]++;
            if ((m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))) {
              _$jscoverage['/ua.js'].lineData[261]++;
              UA.mobile = m[0].toLowerCase();
            }
          }
        }
        _$jscoverage['/ua.js'].lineData[264]++;
        if (visit576_264_1((m = ua.match(/PhantomJS\/([^\s]*)/)) && m[1])) {
          _$jscoverage['/ua.js'].lineData[265]++;
          UA.phantomjs = numberify(m[1]);
        }
      } else {
        _$jscoverage['/ua.js'].lineData[270]++;
        if (visit577_270_1((m = ua.match(/Presto\/([\d.]*)/)) && m[1])) {
          _$jscoverage['/ua.js'].lineData[271]++;
          UA[core = 'presto'] = numberify(m[1]);
          _$jscoverage['/ua.js'].lineData[274]++;
          if (visit578_274_1((m = ua.match(/Opera\/([\d.]*)/)) && m[1])) {
            _$jscoverage['/ua.js'].lineData[275]++;
            UA[shell = 'opera'] = numberify(m[1]);
            _$jscoverage['/ua.js'].lineData[277]++;
            if (visit579_277_1((m = ua.match(/Opera\/.* Version\/([\d.]*)/)) && m[1])) {
              _$jscoverage['/ua.js'].lineData[278]++;
              UA[shell] = numberify(m[1]);
            }
            _$jscoverage['/ua.js'].lineData[282]++;
            if (visit580_282_1((m = ua.match(/Opera Mini[^;]*/)) && m)) {
              _$jscoverage['/ua.js'].lineData[283]++;
              UA.mobile = m[0].toLowerCase();
            } else {
              _$jscoverage['/ua.js'].lineData[284]++;
              if (visit581_284_1((m = ua.match(/Opera Mobi[^;]*/)) && m)) {
                _$jscoverage['/ua.js'].lineData[288]++;
                UA.mobile = m[0];
              }
            }
          }
        } else {
          _$jscoverage['/ua.js'].lineData[296]++;
          if ((ieVersion = getIEVersion(ua))) {
            _$jscoverage['/ua.js'].lineData[297]++;
            UA[shell = 'ie'] = ieVersion;
            _$jscoverage['/ua.js'].lineData[298]++;
            setTridentVersion(ua, UA);
          } else {
            _$jscoverage['/ua.js'].lineData[302]++;
            if ((m = ua.match(/Gecko/))) {
              _$jscoverage['/ua.js'].lineData[303]++;
              UA[core = 'gecko'] = 0.1;
              _$jscoverage['/ua.js'].lineData[304]++;
              if (visit582_304_1((m = ua.match(/rv:([\d.]*)/)) && m[1])) {
                _$jscoverage['/ua.js'].lineData[305]++;
                UA[core] = numberify(m[1]);
                _$jscoverage['/ua.js'].lineData[306]++;
                if (visit583_306_1(/Mobile|Tablet/.test(ua))) {
                  _$jscoverage['/ua.js'].lineData[307]++;
                  UA.mobile = 'firefox';
                }
              }
              _$jscoverage['/ua.js'].lineData[311]++;
              if (visit584_311_1((m = ua.match(/Firefox\/([\d.]*)/)) && m[1])) {
                _$jscoverage['/ua.js'].lineData[312]++;
                UA[shell = 'firefox'] = numberify(m[1]);
              }
            }
          }
        }
      }
    }
    _$jscoverage['/ua.js'].lineData[320]++;
    if (visit585_320_1(!os)) {
      _$jscoverage['/ua.js'].lineData[321]++;
      if (visit586_321_1((/windows|win32/i).test(ua))) {
        _$jscoverage['/ua.js'].lineData[322]++;
        os = 'windows';
      } else {
        _$jscoverage['/ua.js'].lineData[323]++;
        if (visit587_323_1((/macintosh|mac_powerpc/i).test(ua))) {
          _$jscoverage['/ua.js'].lineData[324]++;
          os = 'macintosh';
        } else {
          _$jscoverage['/ua.js'].lineData[325]++;
          if (visit588_325_1((/linux/i).test(ua))) {
            _$jscoverage['/ua.js'].lineData[326]++;
            os = 'linux';
          } else {
            _$jscoverage['/ua.js'].lineData[327]++;
            if (visit589_327_1((/rhino/i).test(ua))) {
              _$jscoverage['/ua.js'].lineData[328]++;
              os = 'rhino';
            }
          }
        }
      }
    }
    _$jscoverage['/ua.js'].lineData[332]++;
    UA.os = os;
    _$jscoverage['/ua.js'].lineData[333]++;
    UA.core = visit590_333_1(UA.core || core);
    _$jscoverage['/ua.js'].lineData[334]++;
    UA.shell = shell;
    _$jscoverage['/ua.js'].lineData[335]++;
    UA.ieMode = visit591_335_1(visit592_335_2(UA.ie && doc.documentMode) || UA.ie);
    _$jscoverage['/ua.js'].lineData[337]++;
    return UA;
  }
  _$jscoverage['/ua.js'].lineData[340]++;
  var UA = KISSY.UA = getDescriptorFromUserAgent(ua);
  _$jscoverage['/ua.js'].lineData[343]++;
  if (visit593_343_1(typeof process === 'object')) {
    _$jscoverage['/ua.js'].lineData[344]++;
    var versions, nodeVersion;
    _$jscoverage['/ua.js'].lineData[346]++;
    if (visit594_346_1((versions = process.versions) && (nodeVersion = versions.node))) {
      _$jscoverage['/ua.js'].lineData[347]++;
      UA.os = process.platform;
      _$jscoverage['/ua.js'].lineData[348]++;
      UA.nodejs = numberify(nodeVersion);
    }
  }
  _$jscoverage['/ua.js'].lineData[353]++;
  UA.getDescriptorFromUserAgent = getDescriptorFromUserAgent;
  _$jscoverage['/ua.js'].lineData[355]++;
  var browsers = ['webkit', 'trident', 'gecko', 'presto', 'chrome', 'safari', 'firefox', 'ie', 'opera'], documentElement = visit595_368_1(doc && doc.documentElement), className = '';
  _$jscoverage['/ua.js'].lineData[370]++;
  if (visit596_370_1(documentElement)) {
    _$jscoverage['/ua.js'].lineData[371]++;
    S.each(browsers, function(key) {
  _$jscoverage['/ua.js'].functionData[6]++;
  _$jscoverage['/ua.js'].lineData[372]++;
  var v = UA[key];
  _$jscoverage['/ua.js'].lineData[373]++;
  if (visit597_373_1(v)) {
    _$jscoverage['/ua.js'].lineData[374]++;
    className += ' ks-' + key + (parseInt(v, 10) + '');
    _$jscoverage['/ua.js'].lineData[375]++;
    className += ' ks-' + key;
  }
});
    _$jscoverage['/ua.js'].lineData[378]++;
    if (visit598_378_1(S.trim(className))) {
      _$jscoverage['/ua.js'].lineData[379]++;
      documentElement.className = S.trim(documentElement.className + className);
    }
  }
})(KISSY);
