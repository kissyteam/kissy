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
  _$jscoverage['/ua.js'].lineData[6] = 0;
  _$jscoverage['/ua.js'].lineData[11] = 0;
  _$jscoverage['/ua.js'].lineData[12] = 0;
  _$jscoverage['/ua.js'].lineData[14] = 0;
  _$jscoverage['/ua.js'].lineData[15] = 0;
  _$jscoverage['/ua.js'].lineData[19] = 0;
  _$jscoverage['/ua.js'].lineData[20] = 0;
  _$jscoverage['/ua.js'].lineData[21] = 0;
  _$jscoverage['/ua.js'].lineData[24] = 0;
  _$jscoverage['/ua.js'].lineData[25] = 0;
  _$jscoverage['/ua.js'].lineData[28] = 0;
  _$jscoverage['/ua.js'].lineData[31] = 0;
  _$jscoverage['/ua.js'].lineData[32] = 0;
  _$jscoverage['/ua.js'].lineData[33] = 0;
  _$jscoverage['/ua.js'].lineData[35] = 0;
  _$jscoverage['/ua.js'].lineData[37] = 0;
  _$jscoverage['/ua.js'].lineData[40] = 0;
  _$jscoverage['/ua.js'].lineData[41] = 0;
  _$jscoverage['/ua.js'].lineData[58] = 0;
  _$jscoverage['/ua.js'].lineData[186] = 0;
  _$jscoverage['/ua.js'].lineData[189] = 0;
  _$jscoverage['/ua.js'].lineData[190] = 0;
  _$jscoverage['/ua.js'].lineData[193] = 0;
  _$jscoverage['/ua.js'].lineData[195] = 0;
  _$jscoverage['/ua.js'].lineData[203] = 0;
  _$jscoverage['/ua.js'].lineData[204] = 0;
  _$jscoverage['/ua.js'].lineData[205] = 0;
  _$jscoverage['/ua.js'].lineData[206] = 0;
  _$jscoverage['/ua.js'].lineData[207] = 0;
  _$jscoverage['/ua.js'].lineData[213] = 0;
  _$jscoverage['/ua.js'].lineData[214] = 0;
  _$jscoverage['/ua.js'].lineData[219] = 0;
  _$jscoverage['/ua.js'].lineData[220] = 0;
  _$jscoverage['/ua.js'].lineData[222] = 0;
  _$jscoverage['/ua.js'].lineData[223] = 0;
  _$jscoverage['/ua.js'].lineData[226] = 0;
  _$jscoverage['/ua.js'].lineData[227] = 0;
  _$jscoverage['/ua.js'].lineData[230] = 0;
  _$jscoverage['/ua.js'].lineData[231] = 0;
  _$jscoverage['/ua.js'].lineData[235] = 0;
  _$jscoverage['/ua.js'].lineData[236] = 0;
  _$jscoverage['/ua.js'].lineData[238] = 0;
  _$jscoverage['/ua.js'].lineData[239] = 0;
  _$jscoverage['/ua.js'].lineData[240] = 0;
  _$jscoverage['/ua.js'].lineData[242] = 0;
  _$jscoverage['/ua.js'].lineData[243] = 0;
  _$jscoverage['/ua.js'].lineData[244] = 0;
  _$jscoverage['/ua.js'].lineData[245] = 0;
  _$jscoverage['/ua.js'].lineData[247] = 0;
  _$jscoverage['/ua.js'].lineData[248] = 0;
  _$jscoverage['/ua.js'].lineData[249] = 0;
  _$jscoverage['/ua.js'].lineData[251] = 0;
  _$jscoverage['/ua.js'].lineData[252] = 0;
  _$jscoverage['/ua.js'].lineData[253] = 0;
  _$jscoverage['/ua.js'].lineData[257] = 0;
  _$jscoverage['/ua.js'].lineData[258] = 0;
  _$jscoverage['/ua.js'].lineData[261] = 0;
  _$jscoverage['/ua.js'].lineData[262] = 0;
  _$jscoverage['/ua.js'].lineData[269] = 0;
  _$jscoverage['/ua.js'].lineData[270] = 0;
  _$jscoverage['/ua.js'].lineData[273] = 0;
  _$jscoverage['/ua.js'].lineData[274] = 0;
  _$jscoverage['/ua.js'].lineData[276] = 0;
  _$jscoverage['/ua.js'].lineData[277] = 0;
  _$jscoverage['/ua.js'].lineData[281] = 0;
  _$jscoverage['/ua.js'].lineData[282] = 0;
  _$jscoverage['/ua.js'].lineData[287] = 0;
  _$jscoverage['/ua.js'].lineData[288] = 0;
  _$jscoverage['/ua.js'].lineData[297] = 0;
  _$jscoverage['/ua.js'].lineData[298] = 0;
  _$jscoverage['/ua.js'].lineData[299] = 0;
  _$jscoverage['/ua.js'].lineData[303] = 0;
  _$jscoverage['/ua.js'].lineData[304] = 0;
  _$jscoverage['/ua.js'].lineData[305] = 0;
  _$jscoverage['/ua.js'].lineData[306] = 0;
  _$jscoverage['/ua.js'].lineData[307] = 0;
  _$jscoverage['/ua.js'].lineData[308] = 0;
  _$jscoverage['/ua.js'].lineData[312] = 0;
  _$jscoverage['/ua.js'].lineData[313] = 0;
  _$jscoverage['/ua.js'].lineData[321] = 0;
  _$jscoverage['/ua.js'].lineData[322] = 0;
  _$jscoverage['/ua.js'].lineData[323] = 0;
  _$jscoverage['/ua.js'].lineData[324] = 0;
  _$jscoverage['/ua.js'].lineData[325] = 0;
  _$jscoverage['/ua.js'].lineData[326] = 0;
  _$jscoverage['/ua.js'].lineData[327] = 0;
  _$jscoverage['/ua.js'].lineData[328] = 0;
  _$jscoverage['/ua.js'].lineData[329] = 0;
  _$jscoverage['/ua.js'].lineData[333] = 0;
  _$jscoverage['/ua.js'].lineData[334] = 0;
  _$jscoverage['/ua.js'].lineData[335] = 0;
  _$jscoverage['/ua.js'].lineData[337] = 0;
  _$jscoverage['/ua.js'].lineData[340] = 0;
  _$jscoverage['/ua.js'].lineData[343] = 0;
  _$jscoverage['/ua.js'].lineData[344] = 0;
  _$jscoverage['/ua.js'].lineData[345] = 0;
  _$jscoverage['/ua.js'].lineData[346] = 0;
  _$jscoverage['/ua.js'].lineData[347] = 0;
  _$jscoverage['/ua.js'].lineData[352] = 0;
  _$jscoverage['/ua.js'].lineData[354] = 0;
  _$jscoverage['/ua.js'].lineData[369] = 0;
  _$jscoverage['/ua.js'].lineData[370] = 0;
  _$jscoverage['/ua.js'].lineData[371] = 0;
  _$jscoverage['/ua.js'].lineData[372] = 0;
  _$jscoverage['/ua.js'].lineData[373] = 0;
  _$jscoverage['/ua.js'].lineData[374] = 0;
  _$jscoverage['/ua.js'].lineData[377] = 0;
  _$jscoverage['/ua.js'].lineData[378] = 0;
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
  _$jscoverage['/ua.js'].branchData['9'] = [];
  _$jscoverage['/ua.js'].branchData['9'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['9'][2] = new BranchData();
  _$jscoverage['/ua.js'].branchData['15'] = [];
  _$jscoverage['/ua.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['24'] = [];
  _$jscoverage['/ua.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['33'] = [];
  _$jscoverage['/ua.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['34'] = [];
  _$jscoverage['/ua.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['51'] = [];
  _$jscoverage['/ua.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['186'] = [];
  _$jscoverage['/ua.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['193'] = [];
  _$jscoverage['/ua.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['203'] = [];
  _$jscoverage['/ua.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['205'] = [];
  _$jscoverage['/ua.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['213'] = [];
  _$jscoverage['/ua.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['219'] = [];
  _$jscoverage['/ua.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['222'] = [];
  _$jscoverage['/ua.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['226'] = [];
  _$jscoverage['/ua.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['230'] = [];
  _$jscoverage['/ua.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['235'] = [];
  _$jscoverage['/ua.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['239'] = [];
  _$jscoverage['/ua.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['244'] = [];
  _$jscoverage['/ua.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['247'] = [];
  _$jscoverage['/ua.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['248'] = [];
  _$jscoverage['/ua.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['252'] = [];
  _$jscoverage['/ua.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['261'] = [];
  _$jscoverage['/ua.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['269'] = [];
  _$jscoverage['/ua.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['273'] = [];
  _$jscoverage['/ua.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['276'] = [];
  _$jscoverage['/ua.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['281'] = [];
  _$jscoverage['/ua.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['287'] = [];
  _$jscoverage['/ua.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['297'] = [];
  _$jscoverage['/ua.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['305'] = [];
  _$jscoverage['/ua.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['307'] = [];
  _$jscoverage['/ua.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['312'] = [];
  _$jscoverage['/ua.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['321'] = [];
  _$jscoverage['/ua.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['322'] = [];
  _$jscoverage['/ua.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['324'] = [];
  _$jscoverage['/ua.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['326'] = [];
  _$jscoverage['/ua.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['328'] = [];
  _$jscoverage['/ua.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['334'] = [];
  _$jscoverage['/ua.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['343'] = [];
  _$jscoverage['/ua.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['345'] = [];
  _$jscoverage['/ua.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['367'] = [];
  _$jscoverage['/ua.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['369'] = [];
  _$jscoverage['/ua.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['372'] = [];
  _$jscoverage['/ua.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['377'] = [];
  _$jscoverage['/ua.js'].branchData['377'][1] = new BranchData();
}
_$jscoverage['/ua.js'].branchData['377'][1].init(239, 17, 'S.trim(className)');
function visit601_377_1(result) {
  _$jscoverage['/ua.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['372'][1].init(48, 1, 'v');
function visit600_372_1(result) {
  _$jscoverage['/ua.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['369'][1].init(12150, 15, 'documentElement');
function visit599_369_1(result) {
  _$jscoverage['/ua.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['367'][1].init(313, 26, 'doc && doc.documentElement');
function visit598_367_1(result) {
  _$jscoverage['/ua.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['345'][1].init(51, 61, '(versions = process.versions) && (nodeVersion = versions.node)');
function visit597_345_1(result) {
  _$jscoverage['/ua.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['343'][1].init(11408, 27, 'typeof process === \'object\'');
function visit596_343_1(result) {
  _$jscoverage['/ua.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['334'][1].init(10264, 15, 'UA.core || core');
function visit595_334_1(result) {
  _$jscoverage['/ua.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['328'][1].init(286, 18, '(/rhino/i).test(ua)');
function visit594_328_1(result) {
  _$jscoverage['/ua.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['326'][1].init(207, 18, '(/linux/i).test(ua)');
function visit593_326_1(result) {
  _$jscoverage['/ua.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['324'][1].init(108, 34, '(/macintosh|mac_powerpc/i).test(ua)');
function visit592_324_1(result) {
  _$jscoverage['/ua.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['322'][1].init(19, 26, '(/windows|win32/i).test(ua)');
function visit591_322_1(result) {
  _$jscoverage['/ua.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['321'][1].init(9854, 3, '!os');
function visit590_321_1(result) {
  _$jscoverage['/ua.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['312'][1].init(492, 42, '(m = ua.match(/Firefox\\/([\\d.]*)/)) && m[1]');
function visit589_312_1(result) {
  _$jscoverage['/ua.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['307'][1].init(99, 24, '/Mobile|Tablet/.test(ua)');
function visit588_307_1(result) {
  _$jscoverage['/ua.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['305'][1].init(127, 36, '(m = ua.match(/rv:([\\d.]*)/)) && m[1]');
function visit587_305_1(result) {
  _$jscoverage['/ua.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['297'][1].init(174, 28, 'ieVersion = getIEVersion(ua)');
function visit586_297_1(result) {
  _$jscoverage['/ua.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['287'][1].init(801, 37, '(m = ua.match(/Opera Mobi[^;]*/)) && m');
function visit585_287_1(result) {
  _$jscoverage['/ua.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['281'][1].init(346, 37, '(m = ua.match(/Opera Mini[^;]*/)) && m');
function visit584_281_1(result) {
  _$jscoverage['/ua.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['276'][1].init(134, 52, '(m = ua.match(/Opera\\/.* Version\\/([\\d.]*)/)) && m[1]');
function visit583_276_1(result) {
  _$jscoverage['/ua.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['273'][1].init(119, 40, '(m = ua.match(/Opera\\/([\\d.]*)/)) && m[1]');
function visit582_273_1(result) {
  _$jscoverage['/ua.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['269'][1].init(132, 41, '(m = ua.match(/Presto\\/([\\d.]*)/)) && m[1]');
function visit581_269_1(result) {
  _$jscoverage['/ua.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['261'][1].init(1783, 44, '(m = ua.match(/PhantomJS\\/([^\\s]*)/)) && m[1]');
function visit580_261_1(result) {
  _$jscoverage['/ua.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['252'][1].init(204, 9, 'm && m[1]');
function visit579_252_1(result) {
  _$jscoverage['/ua.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['248'][1].init(26, 17, '/Mobile/.test(ua)');
function visit578_248_1(result) {
  _$jscoverage['/ua.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['247'][1].init(1165, 20, '/ Android/i.test(ua)');
function visit577_247_1(result) {
  _$jscoverage['/ua.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['244'][1].init(368, 9, 'm && m[0]');
function visit576_244_1(result) {
  _$jscoverage['/ua.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['239'][1].init(150, 9, 'm && m[1]');
function visit575_239_1(result) {
  _$jscoverage['/ua.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['235'][1].init(619, 52, '/ Mobile\\//.test(ua) && ua.match(/iPad|iPod|iPhone/)');
function visit574_235_1(result) {
  _$jscoverage['/ua.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['230'][1].init(439, 42, '(m = ua.match(/\\/([\\d.]*) Safari/)) && m[1]');
function visit573_230_1(result) {
  _$jscoverage['/ua.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['226'][1].init(259, 41, '(m = ua.match(/Chrome\\/([\\d.]*)/)) && m[1]');
function visit572_226_1(result) {
  _$jscoverage['/ua.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['222'][1].init(81, 40, '(m = ua.match(/OPR\\/(\\d+\\.\\d+)/)) && m[1]');
function visit571_222_1(result) {
  _$jscoverage['/ua.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['219'][1].init(42, 46, '(m = ua.match(/AppleWebKit\\/([\\d.]*)/)) && m[1]');
function visit570_219_1(result) {
  _$jscoverage['/ua.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['213'][1].init(765, 40, '!UA.ie && (ieVersion = getIEVersion(ua))');
function visit569_213_1(result) {
  _$jscoverage['/ua.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['205'][1].init(102, 12, 's.length > 0');
function visit568_205_1(result) {
  _$jscoverage['/ua.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['203'][1].init(414, 8, 'v <= end');
function visit567_203_1(result) {
  _$jscoverage['/ua.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['193'][1].init(4308, 12, 's.length > 0');
function visit566_193_1(result) {
  _$jscoverage['/ua.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['186'][1].init(3945, 3, 'div');
function visit565_186_1(result) {
  _$jscoverage['/ua.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['51'][1].init(353, 31, 'doc && doc.createElement(\'div\')');
function visit564_51_1(result) {
  _$jscoverage['/ua.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['34'][1].init(83, 12, 'm[1] || m[2]');
function visit563_34_1(result) {
  _$jscoverage['/ua.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['33'][1].init(34, 98, '(m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\\s|:)?([0-9.]+)/)) && (v = (m[1] || m[2]))');
function visit562_33_1(result) {
  _$jscoverage['/ua.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['24'][1].init(162, 42, '(m = ua.match(/Trident\\/([\\d.]*)/)) && m[1]');
function visit561_24_1(result) {
  _$jscoverage['/ua.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['15'][1].init(22, 9, 'c++ === 0');
function visit560_15_1(result) {
  _$jscoverage['/ua.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['9'][2].init(100, 32, 'navigator && navigator.userAgent');
function visit559_9_2(result) {
  _$jscoverage['/ua.js'].branchData['9'][2].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['9'][1].init(100, 38, 'navigator && navigator.userAgent || ""');
function visit558_9_1(result) {
  _$jscoverage['/ua.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].lineData[5]++;
(function(S, undefined) {
  _$jscoverage['/ua.js'].functionData[0]++;
  _$jscoverage['/ua.js'].lineData[6]++;
  var win = S.Env.host, doc = win.document, navigator = win.navigator, ua = visit558_9_1(visit559_9_2(navigator && navigator.userAgent) || "");
  _$jscoverage['/ua.js'].lineData[11]++;
  function numberify(s) {
    _$jscoverage['/ua.js'].functionData[1]++;
    _$jscoverage['/ua.js'].lineData[12]++;
    var c = 0;
    _$jscoverage['/ua.js'].lineData[14]++;
    return parseFloat(s.replace(/\./g, function() {
  _$jscoverage['/ua.js'].functionData[2]++;
  _$jscoverage['/ua.js'].lineData[15]++;
  return (visit560_15_1(c++ === 0)) ? '.' : '';
}));
  }
  _$jscoverage['/ua.js'].lineData[19]++;
  function setTridentVersion(ua, UA) {
    _$jscoverage['/ua.js'].functionData[3]++;
    _$jscoverage['/ua.js'].lineData[20]++;
    var core, m;
    _$jscoverage['/ua.js'].lineData[21]++;
    UA[core = 'trident'] = 0.1;
    _$jscoverage['/ua.js'].lineData[24]++;
    if (visit561_24_1((m = ua.match(/Trident\/([\d.]*)/)) && m[1])) {
      _$jscoverage['/ua.js'].lineData[25]++;
      UA[core] = numberify(m[1]);
    }
    _$jscoverage['/ua.js'].lineData[28]++;
    UA.core = core;
  }
  _$jscoverage['/ua.js'].lineData[31]++;
  function getIEVersion(ua) {
    _$jscoverage['/ua.js'].functionData[4]++;
    _$jscoverage['/ua.js'].lineData[32]++;
    var m, v;
    _$jscoverage['/ua.js'].lineData[33]++;
    if (visit562_33_1((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) && (v = (visit563_34_1(m[1] || m[2]))))) {
      _$jscoverage['/ua.js'].lineData[35]++;
      return numberify(v);
    }
    _$jscoverage['/ua.js'].lineData[37]++;
    return 0;
  }
  _$jscoverage['/ua.js'].lineData[40]++;
  function getDescriptorFromUserAgent(ua) {
    _$jscoverage['/ua.js'].functionData[5]++;
    _$jscoverage['/ua.js'].lineData[41]++;
    var EMPTY = '', os, core = EMPTY, shell = EMPTY, m, IE_DETECT_RANGE = [6, 9], ieVersion, v, end, VERSION_PLACEHOLDER = '{{version}}', IE_DETECT_TPL = '<!--[if IE ' + VERSION_PLACEHOLDER + ']><' + 's></s><![endif]-->', div = visit564_51_1(doc && doc.createElement('div')), s = [];
    _$jscoverage['/ua.js'].lineData[58]++;
    var UA = {
  webkit: undefined, 
  trident: undefined, 
  gecko: undefined, 
  presto: undefined, 
  chrome: undefined, 
  safari: undefined, 
  firefox: undefined, 
  ie: undefined, 
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
    _$jscoverage['/ua.js'].lineData[186]++;
    if (visit565_186_1(div)) {
      _$jscoverage['/ua.js'].lineData[189]++;
      div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, '');
      _$jscoverage['/ua.js'].lineData[190]++;
      s = div.getElementsByTagName('s');
    }
    _$jscoverage['/ua.js'].lineData[193]++;
    if (visit566_193_1(s.length > 0)) {
      _$jscoverage['/ua.js'].lineData[195]++;
      setTridentVersion(ua, UA);
      _$jscoverage['/ua.js'].lineData[203]++;
      for (v = IE_DETECT_RANGE[0] , end = IE_DETECT_RANGE[1]; visit567_203_1(v <= end); v++) {
        _$jscoverage['/ua.js'].lineData[204]++;
        div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, v);
        _$jscoverage['/ua.js'].lineData[205]++;
        if (visit568_205_1(s.length > 0)) {
          _$jscoverage['/ua.js'].lineData[206]++;
          UA[shell = 'ie'] = v;
          _$jscoverage['/ua.js'].lineData[207]++;
          break;
        }
      }
      _$jscoverage['/ua.js'].lineData[213]++;
      if (visit569_213_1(!UA.ie && (ieVersion = getIEVersion(ua)))) {
        _$jscoverage['/ua.js'].lineData[214]++;
        UA[shell = 'ie'] = ieVersion;
      }
    } else {
      _$jscoverage['/ua.js'].lineData[219]++;
      if (visit570_219_1((m = ua.match(/AppleWebKit\/([\d.]*)/)) && m[1])) {
        _$jscoverage['/ua.js'].lineData[220]++;
        UA[core = 'webkit'] = numberify(m[1]);
        _$jscoverage['/ua.js'].lineData[222]++;
        if (visit571_222_1((m = ua.match(/OPR\/(\d+\.\d+)/)) && m[1])) {
          _$jscoverage['/ua.js'].lineData[223]++;
          UA[shell = 'opera'] = numberify(m[1]);
        } else {
          _$jscoverage['/ua.js'].lineData[226]++;
          if (visit572_226_1((m = ua.match(/Chrome\/([\d.]*)/)) && m[1])) {
            _$jscoverage['/ua.js'].lineData[227]++;
            UA[shell = 'chrome'] = numberify(m[1]);
          } else {
            _$jscoverage['/ua.js'].lineData[230]++;
            if (visit573_230_1((m = ua.match(/\/([\d.]*) Safari/)) && m[1])) {
              _$jscoverage['/ua.js'].lineData[231]++;
              UA[shell = 'safari'] = numberify(m[1]);
            }
          }
        }
        _$jscoverage['/ua.js'].lineData[235]++;
        if (visit574_235_1(/ Mobile\//.test(ua) && ua.match(/iPad|iPod|iPhone/))) {
          _$jscoverage['/ua.js'].lineData[236]++;
          UA.mobile = 'apple';
          _$jscoverage['/ua.js'].lineData[238]++;
          m = ua.match(/OS ([^\s]*)/);
          _$jscoverage['/ua.js'].lineData[239]++;
          if (visit575_239_1(m && m[1])) {
            _$jscoverage['/ua.js'].lineData[240]++;
            UA.ios = numberify(m[1].replace('_', '.'));
          }
          _$jscoverage['/ua.js'].lineData[242]++;
          os = 'ios';
          _$jscoverage['/ua.js'].lineData[243]++;
          m = ua.match(/iPad|iPod|iPhone/);
          _$jscoverage['/ua.js'].lineData[244]++;
          if (visit576_244_1(m && m[0])) {
            _$jscoverage['/ua.js'].lineData[245]++;
            UA[m[0].toLowerCase()] = UA.ios;
          }
        } else {
          _$jscoverage['/ua.js'].lineData[247]++;
          if (visit577_247_1(/ Android/i.test(ua))) {
            _$jscoverage['/ua.js'].lineData[248]++;
            if (visit578_248_1(/Mobile/.test(ua))) {
              _$jscoverage['/ua.js'].lineData[249]++;
              os = UA.mobile = 'android';
            }
            _$jscoverage['/ua.js'].lineData[251]++;
            m = ua.match(/Android ([^\s]*);/);
            _$jscoverage['/ua.js'].lineData[252]++;
            if (visit579_252_1(m && m[1])) {
              _$jscoverage['/ua.js'].lineData[253]++;
              UA.android = numberify(m[1]);
            }
          } else {
            _$jscoverage['/ua.js'].lineData[257]++;
            if ((m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))) {
              _$jscoverage['/ua.js'].lineData[258]++;
              UA.mobile = m[0].toLowerCase();
            }
          }
        }
        _$jscoverage['/ua.js'].lineData[261]++;
        if (visit580_261_1((m = ua.match(/PhantomJS\/([^\s]*)/)) && m[1])) {
          _$jscoverage['/ua.js'].lineData[262]++;
          UA.phantomjs = numberify(m[1]);
        }
      } else {
        _$jscoverage['/ua.js'].lineData[269]++;
        if (visit581_269_1((m = ua.match(/Presto\/([\d.]*)/)) && m[1])) {
          _$jscoverage['/ua.js'].lineData[270]++;
          UA[core = 'presto'] = numberify(m[1]);
          _$jscoverage['/ua.js'].lineData[273]++;
          if (visit582_273_1((m = ua.match(/Opera\/([\d.]*)/)) && m[1])) {
            _$jscoverage['/ua.js'].lineData[274]++;
            UA[shell = 'opera'] = numberify(m[1]);
            _$jscoverage['/ua.js'].lineData[276]++;
            if (visit583_276_1((m = ua.match(/Opera\/.* Version\/([\d.]*)/)) && m[1])) {
              _$jscoverage['/ua.js'].lineData[277]++;
              UA[shell] = numberify(m[1]);
            }
            _$jscoverage['/ua.js'].lineData[281]++;
            if (visit584_281_1((m = ua.match(/Opera Mini[^;]*/)) && m)) {
              _$jscoverage['/ua.js'].lineData[282]++;
              UA.mobile = m[0].toLowerCase();
            } else {
              _$jscoverage['/ua.js'].lineData[287]++;
              if (visit585_287_1((m = ua.match(/Opera Mobi[^;]*/)) && m)) {
                _$jscoverage['/ua.js'].lineData[288]++;
                UA.mobile = m[0];
              }
            }
          }
        } else {
          _$jscoverage['/ua.js'].lineData[297]++;
          if (visit586_297_1(ieVersion = getIEVersion(ua))) {
            _$jscoverage['/ua.js'].lineData[298]++;
            UA[shell = 'ie'] = ieVersion;
            _$jscoverage['/ua.js'].lineData[299]++;
            setTridentVersion(ua, UA);
          } else {
            _$jscoverage['/ua.js'].lineData[303]++;
            if ((m = ua.match(/Gecko/))) {
              _$jscoverage['/ua.js'].lineData[304]++;
              UA[core = 'gecko'] = 0.1;
              _$jscoverage['/ua.js'].lineData[305]++;
              if (visit587_305_1((m = ua.match(/rv:([\d.]*)/)) && m[1])) {
                _$jscoverage['/ua.js'].lineData[306]++;
                UA[core] = numberify(m[1]);
                _$jscoverage['/ua.js'].lineData[307]++;
                if (visit588_307_1(/Mobile|Tablet/.test(ua))) {
                  _$jscoverage['/ua.js'].lineData[308]++;
                  o.mobile = "firefox";
                }
              }
              _$jscoverage['/ua.js'].lineData[312]++;
              if (visit589_312_1((m = ua.match(/Firefox\/([\d.]*)/)) && m[1])) {
                _$jscoverage['/ua.js'].lineData[313]++;
                UA[shell = 'firefox'] = numberify(m[1]);
              }
            }
          }
        }
      }
    }
    _$jscoverage['/ua.js'].lineData[321]++;
    if (visit590_321_1(!os)) {
      _$jscoverage['/ua.js'].lineData[322]++;
      if (visit591_322_1((/windows|win32/i).test(ua))) {
        _$jscoverage['/ua.js'].lineData[323]++;
        os = 'windows';
      } else {
        _$jscoverage['/ua.js'].lineData[324]++;
        if (visit592_324_1((/macintosh|mac_powerpc/i).test(ua))) {
          _$jscoverage['/ua.js'].lineData[325]++;
          os = 'macintosh';
        } else {
          _$jscoverage['/ua.js'].lineData[326]++;
          if (visit593_326_1((/linux/i).test(ua))) {
            _$jscoverage['/ua.js'].lineData[327]++;
            os = 'linux';
          } else {
            _$jscoverage['/ua.js'].lineData[328]++;
            if (visit594_328_1((/rhino/i).test(ua))) {
              _$jscoverage['/ua.js'].lineData[329]++;
              os = 'rhino';
            }
          }
        }
      }
    }
    _$jscoverage['/ua.js'].lineData[333]++;
    UA.os = os;
    _$jscoverage['/ua.js'].lineData[334]++;
    UA.core = visit595_334_1(UA.core || core);
    _$jscoverage['/ua.js'].lineData[335]++;
    UA.shell = shell;
    _$jscoverage['/ua.js'].lineData[337]++;
    return UA;
  }
  _$jscoverage['/ua.js'].lineData[340]++;
  var UA = KISSY.UA = getDescriptorFromUserAgent(ua);
  _$jscoverage['/ua.js'].lineData[343]++;
  if (visit596_343_1(typeof process === 'object')) {
    _$jscoverage['/ua.js'].lineData[344]++;
    var versions, nodeVersion;
    _$jscoverage['/ua.js'].lineData[345]++;
    if (visit597_345_1((versions = process.versions) && (nodeVersion = versions.node))) {
      _$jscoverage['/ua.js'].lineData[346]++;
      UA.os = process.platform;
      _$jscoverage['/ua.js'].lineData[347]++;
      UA.nodejs = numberify(nodeVersion);
    }
  }
  _$jscoverage['/ua.js'].lineData[352]++;
  UA.getDescriptorFromUserAgent = getDescriptorFromUserAgent;
  _$jscoverage['/ua.js'].lineData[354]++;
  var o = ['webkit', 'trident', 'gecko', 'presto', 'chrome', 'safari', 'firefox', 'ie', 'opera'], documentElement = visit598_367_1(doc && doc.documentElement), className = '';
  _$jscoverage['/ua.js'].lineData[369]++;
  if (visit599_369_1(documentElement)) {
    _$jscoverage['/ua.js'].lineData[370]++;
    S.each(o, function(key) {
  _$jscoverage['/ua.js'].functionData[6]++;
  _$jscoverage['/ua.js'].lineData[371]++;
  var v = UA[key];
  _$jscoverage['/ua.js'].lineData[372]++;
  if (visit600_372_1(v)) {
    _$jscoverage['/ua.js'].lineData[373]++;
    className += ' ks-' + key + (parseInt(v) + '');
    _$jscoverage['/ua.js'].lineData[374]++;
    className += ' ks-' + key;
  }
});
    _$jscoverage['/ua.js'].lineData[377]++;
    if (visit601_377_1(S.trim(className))) {
      _$jscoverage['/ua.js'].lineData[378]++;
      documentElement.className = S.trim(documentElement.className + className);
    }
  }
})(KISSY);
