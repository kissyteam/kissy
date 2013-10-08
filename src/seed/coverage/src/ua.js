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
  _$jscoverage['/ua.js'].lineData[187] = 0;
  _$jscoverage['/ua.js'].lineData[190] = 0;
  _$jscoverage['/ua.js'].lineData[191] = 0;
  _$jscoverage['/ua.js'].lineData[194] = 0;
  _$jscoverage['/ua.js'].lineData[196] = 0;
  _$jscoverage['/ua.js'].lineData[204] = 0;
  _$jscoverage['/ua.js'].lineData[205] = 0;
  _$jscoverage['/ua.js'].lineData[206] = 0;
  _$jscoverage['/ua.js'].lineData[207] = 0;
  _$jscoverage['/ua.js'].lineData[208] = 0;
  _$jscoverage['/ua.js'].lineData[214] = 0;
  _$jscoverage['/ua.js'].lineData[215] = 0;
  _$jscoverage['/ua.js'].lineData[220] = 0;
  _$jscoverage['/ua.js'].lineData[221] = 0;
  _$jscoverage['/ua.js'].lineData[223] = 0;
  _$jscoverage['/ua.js'].lineData[224] = 0;
  _$jscoverage['/ua.js'].lineData[227] = 0;
  _$jscoverage['/ua.js'].lineData[228] = 0;
  _$jscoverage['/ua.js'].lineData[231] = 0;
  _$jscoverage['/ua.js'].lineData[232] = 0;
  _$jscoverage['/ua.js'].lineData[236] = 0;
  _$jscoverage['/ua.js'].lineData[237] = 0;
  _$jscoverage['/ua.js'].lineData[239] = 0;
  _$jscoverage['/ua.js'].lineData[240] = 0;
  _$jscoverage['/ua.js'].lineData[241] = 0;
  _$jscoverage['/ua.js'].lineData[243] = 0;
  _$jscoverage['/ua.js'].lineData[244] = 0;
  _$jscoverage['/ua.js'].lineData[245] = 0;
  _$jscoverage['/ua.js'].lineData[246] = 0;
  _$jscoverage['/ua.js'].lineData[248] = 0;
  _$jscoverage['/ua.js'].lineData[249] = 0;
  _$jscoverage['/ua.js'].lineData[250] = 0;
  _$jscoverage['/ua.js'].lineData[252] = 0;
  _$jscoverage['/ua.js'].lineData[253] = 0;
  _$jscoverage['/ua.js'].lineData[254] = 0;
  _$jscoverage['/ua.js'].lineData[258] = 0;
  _$jscoverage['/ua.js'].lineData[259] = 0;
  _$jscoverage['/ua.js'].lineData[262] = 0;
  _$jscoverage['/ua.js'].lineData[263] = 0;
  _$jscoverage['/ua.js'].lineData[270] = 0;
  _$jscoverage['/ua.js'].lineData[271] = 0;
  _$jscoverage['/ua.js'].lineData[274] = 0;
  _$jscoverage['/ua.js'].lineData[275] = 0;
  _$jscoverage['/ua.js'].lineData[277] = 0;
  _$jscoverage['/ua.js'].lineData[278] = 0;
  _$jscoverage['/ua.js'].lineData[282] = 0;
  _$jscoverage['/ua.js'].lineData[283] = 0;
  _$jscoverage['/ua.js'].lineData[288] = 0;
  _$jscoverage['/ua.js'].lineData[289] = 0;
  _$jscoverage['/ua.js'].lineData[298] = 0;
  _$jscoverage['/ua.js'].lineData[299] = 0;
  _$jscoverage['/ua.js'].lineData[300] = 0;
  _$jscoverage['/ua.js'].lineData[304] = 0;
  _$jscoverage['/ua.js'].lineData[305] = 0;
  _$jscoverage['/ua.js'].lineData[306] = 0;
  _$jscoverage['/ua.js'].lineData[307] = 0;
  _$jscoverage['/ua.js'].lineData[308] = 0;
  _$jscoverage['/ua.js'].lineData[309] = 0;
  _$jscoverage['/ua.js'].lineData[313] = 0;
  _$jscoverage['/ua.js'].lineData[314] = 0;
  _$jscoverage['/ua.js'].lineData[322] = 0;
  _$jscoverage['/ua.js'].lineData[323] = 0;
  _$jscoverage['/ua.js'].lineData[324] = 0;
  _$jscoverage['/ua.js'].lineData[325] = 0;
  _$jscoverage['/ua.js'].lineData[326] = 0;
  _$jscoverage['/ua.js'].lineData[327] = 0;
  _$jscoverage['/ua.js'].lineData[328] = 0;
  _$jscoverage['/ua.js'].lineData[329] = 0;
  _$jscoverage['/ua.js'].lineData[330] = 0;
  _$jscoverage['/ua.js'].lineData[334] = 0;
  _$jscoverage['/ua.js'].lineData[335] = 0;
  _$jscoverage['/ua.js'].lineData[336] = 0;
  _$jscoverage['/ua.js'].lineData[338] = 0;
  _$jscoverage['/ua.js'].lineData[341] = 0;
  _$jscoverage['/ua.js'].lineData[344] = 0;
  _$jscoverage['/ua.js'].lineData[345] = 0;
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
  _$jscoverage['/ua.js'].branchData['187'] = [];
  _$jscoverage['/ua.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['194'] = [];
  _$jscoverage['/ua.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['204'] = [];
  _$jscoverage['/ua.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['206'] = [];
  _$jscoverage['/ua.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['214'] = [];
  _$jscoverage['/ua.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['220'] = [];
  _$jscoverage['/ua.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['223'] = [];
  _$jscoverage['/ua.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['227'] = [];
  _$jscoverage['/ua.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['231'] = [];
  _$jscoverage['/ua.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['236'] = [];
  _$jscoverage['/ua.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['240'] = [];
  _$jscoverage['/ua.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['245'] = [];
  _$jscoverage['/ua.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['248'] = [];
  _$jscoverage['/ua.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['249'] = [];
  _$jscoverage['/ua.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['253'] = [];
  _$jscoverage['/ua.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['262'] = [];
  _$jscoverage['/ua.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['270'] = [];
  _$jscoverage['/ua.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['274'] = [];
  _$jscoverage['/ua.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['277'] = [];
  _$jscoverage['/ua.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['282'] = [];
  _$jscoverage['/ua.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['288'] = [];
  _$jscoverage['/ua.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['298'] = [];
  _$jscoverage['/ua.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['306'] = [];
  _$jscoverage['/ua.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['308'] = [];
  _$jscoverage['/ua.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['313'] = [];
  _$jscoverage['/ua.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['322'] = [];
  _$jscoverage['/ua.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['323'] = [];
  _$jscoverage['/ua.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['325'] = [];
  _$jscoverage['/ua.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['327'] = [];
  _$jscoverage['/ua.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['329'] = [];
  _$jscoverage['/ua.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['335'] = [];
  _$jscoverage['/ua.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['344'] = [];
  _$jscoverage['/ua.js'].branchData['344'][1] = new BranchData();
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
_$jscoverage['/ua.js'].branchData['378'][1].init(239, 17, 'S.trim(className)');
function visit617_378_1(result) {
  _$jscoverage['/ua.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['373'][1].init(48, 1, 'v');
function visit616_373_1(result) {
  _$jscoverage['/ua.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['370'][1].init(12197, 15, 'documentElement');
function visit615_370_1(result) {
  _$jscoverage['/ua.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['368'][1].init(313, 26, 'doc && doc.documentElement');
function visit614_368_1(result) {
  _$jscoverage['/ua.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['346'][1].init(51, 61, '(versions = process.versions) && (nodeVersion = versions.node)');
function visit613_346_1(result) {
  _$jscoverage['/ua.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['344'][1].init(11455, 27, 'typeof process === \'object\'');
function visit612_344_1(result) {
  _$jscoverage['/ua.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['335'][1].init(10311, 15, 'UA.core || core');
function visit611_335_1(result) {
  _$jscoverage['/ua.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['329'][1].init(286, 18, '(/rhino/i).test(ua)');
function visit610_329_1(result) {
  _$jscoverage['/ua.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['327'][1].init(207, 18, '(/linux/i).test(ua)');
function visit609_327_1(result) {
  _$jscoverage['/ua.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['325'][1].init(108, 34, '(/macintosh|mac_powerpc/i).test(ua)');
function visit608_325_1(result) {
  _$jscoverage['/ua.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['323'][1].init(19, 26, '(/windows|win32/i).test(ua)');
function visit607_323_1(result) {
  _$jscoverage['/ua.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['322'][1].init(9901, 3, '!os');
function visit606_322_1(result) {
  _$jscoverage['/ua.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['313'][1].init(492, 42, '(m = ua.match(/Firefox\\/([\\d.]*)/)) && m[1]');
function visit605_313_1(result) {
  _$jscoverage['/ua.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['308'][1].init(99, 24, '/Mobile|Tablet/.test(ua)');
function visit604_308_1(result) {
  _$jscoverage['/ua.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['306'][1].init(127, 36, '(m = ua.match(/rv:([\\d.]*)/)) && m[1]');
function visit603_306_1(result) {
  _$jscoverage['/ua.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['298'][1].init(174, 28, 'ieVersion = getIEVersion(ua)');
function visit602_298_1(result) {
  _$jscoverage['/ua.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['288'][1].init(801, 37, '(m = ua.match(/Opera Mobi[^;]*/)) && m');
function visit601_288_1(result) {
  _$jscoverage['/ua.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['282'][1].init(346, 37, '(m = ua.match(/Opera Mini[^;]*/)) && m');
function visit600_282_1(result) {
  _$jscoverage['/ua.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['277'][1].init(134, 52, '(m = ua.match(/Opera\\/.* Version\\/([\\d.]*)/)) && m[1]');
function visit599_277_1(result) {
  _$jscoverage['/ua.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['274'][1].init(119, 40, '(m = ua.match(/Opera\\/([\\d.]*)/)) && m[1]');
function visit598_274_1(result) {
  _$jscoverage['/ua.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['270'][1].init(132, 41, '(m = ua.match(/Presto\\/([\\d.]*)/)) && m[1]');
function visit597_270_1(result) {
  _$jscoverage['/ua.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['262'][1].init(1783, 44, '(m = ua.match(/PhantomJS\\/([^\\s]*)/)) && m[1]');
function visit596_262_1(result) {
  _$jscoverage['/ua.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['253'][1].init(204, 9, 'm && m[1]');
function visit595_253_1(result) {
  _$jscoverage['/ua.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['249'][1].init(26, 17, '/Mobile/.test(ua)');
function visit594_249_1(result) {
  _$jscoverage['/ua.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['248'][1].init(1165, 20, '/ Android/i.test(ua)');
function visit593_248_1(result) {
  _$jscoverage['/ua.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['245'][1].init(368, 9, 'm && m[0]');
function visit592_245_1(result) {
  _$jscoverage['/ua.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['240'][1].init(150, 9, 'm && m[1]');
function visit591_240_1(result) {
  _$jscoverage['/ua.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['236'][1].init(619, 52, '/ Mobile\\//.test(ua) && ua.match(/iPad|iPod|iPhone/)');
function visit590_236_1(result) {
  _$jscoverage['/ua.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['231'][1].init(439, 42, '(m = ua.match(/\\/([\\d.]*) Safari/)) && m[1]');
function visit589_231_1(result) {
  _$jscoverage['/ua.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['227'][1].init(259, 41, '(m = ua.match(/Chrome\\/([\\d.]*)/)) && m[1]');
function visit588_227_1(result) {
  _$jscoverage['/ua.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['223'][1].init(81, 40, '(m = ua.match(/OPR\\/(\\d+\\.\\d+)/)) && m[1]');
function visit587_223_1(result) {
  _$jscoverage['/ua.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['220'][1].init(42, 46, '(m = ua.match(/AppleWebKit\\/([\\d.]*)/)) && m[1]');
function visit586_220_1(result) {
  _$jscoverage['/ua.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['214'][1].init(765, 40, '!UA.ie && (ieVersion = getIEVersion(ua))');
function visit585_214_1(result) {
  _$jscoverage['/ua.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['206'][1].init(102, 12, 's.length > 0');
function visit584_206_1(result) {
  _$jscoverage['/ua.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['204'][1].init(414, 8, 'v <= end');
function visit583_204_1(result) {
  _$jscoverage['/ua.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['194'][1].init(4355, 12, 's.length > 0');
function visit582_194_1(result) {
  _$jscoverage['/ua.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['187'][1].init(3964, 31, 'div && div.getElementsByTagName');
function visit581_187_1(result) {
  _$jscoverage['/ua.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['51'][1].init(353, 31, 'doc && doc.createElement(\'div\')');
function visit580_51_1(result) {
  _$jscoverage['/ua.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['34'][1].init(83, 12, 'm[1] || m[2]');
function visit579_34_1(result) {
  _$jscoverage['/ua.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['33'][1].init(34, 98, '(m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\\s|:)?([0-9.]+)/)) && (v = (m[1] || m[2]))');
function visit578_33_1(result) {
  _$jscoverage['/ua.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['24'][1].init(162, 42, '(m = ua.match(/Trident\\/([\\d.]*)/)) && m[1]');
function visit577_24_1(result) {
  _$jscoverage['/ua.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['15'][1].init(22, 9, 'c++ === 0');
function visit576_15_1(result) {
  _$jscoverage['/ua.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['9'][2].init(100, 32, 'navigator && navigator.userAgent');
function visit575_9_2(result) {
  _$jscoverage['/ua.js'].branchData['9'][2].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['9'][1].init(100, 38, 'navigator && navigator.userAgent || ""');
function visit574_9_1(result) {
  _$jscoverage['/ua.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].lineData[5]++;
(function(S, undefined) {
  _$jscoverage['/ua.js'].functionData[0]++;
  _$jscoverage['/ua.js'].lineData[6]++;
  var win = S.Env.host, doc = win.document, navigator = win.navigator, ua = visit574_9_1(visit575_9_2(navigator && navigator.userAgent) || "");
  _$jscoverage['/ua.js'].lineData[11]++;
  function numberify(s) {
    _$jscoverage['/ua.js'].functionData[1]++;
    _$jscoverage['/ua.js'].lineData[12]++;
    var c = 0;
    _$jscoverage['/ua.js'].lineData[14]++;
    return parseFloat(s.replace(/\./g, function() {
  _$jscoverage['/ua.js'].functionData[2]++;
  _$jscoverage['/ua.js'].lineData[15]++;
  return (visit576_15_1(c++ === 0)) ? '.' : '';
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
    if (visit577_24_1((m = ua.match(/Trident\/([\d.]*)/)) && m[1])) {
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
    if (visit578_33_1((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) && (v = (visit579_34_1(m[1] || m[2]))))) {
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
    var EMPTY = '', os, core = EMPTY, shell = EMPTY, m, IE_DETECT_RANGE = [6, 9], ieVersion, v, end, VERSION_PLACEHOLDER = '{{version}}', IE_DETECT_TPL = '<!--[if IE ' + VERSION_PLACEHOLDER + ']><' + 's></s><![endif]-->', div = visit580_51_1(doc && doc.createElement('div')), s = [];
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
    _$jscoverage['/ua.js'].lineData[187]++;
    if (visit581_187_1(div && div.getElementsByTagName)) {
      _$jscoverage['/ua.js'].lineData[190]++;
      div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, '');
      _$jscoverage['/ua.js'].lineData[191]++;
      s = div.getElementsByTagName('s');
    }
    _$jscoverage['/ua.js'].lineData[194]++;
    if (visit582_194_1(s.length > 0)) {
      _$jscoverage['/ua.js'].lineData[196]++;
      setTridentVersion(ua, UA);
      _$jscoverage['/ua.js'].lineData[204]++;
      for (v = IE_DETECT_RANGE[0] , end = IE_DETECT_RANGE[1]; visit583_204_1(v <= end); v++) {
        _$jscoverage['/ua.js'].lineData[205]++;
        div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, v);
        _$jscoverage['/ua.js'].lineData[206]++;
        if (visit584_206_1(s.length > 0)) {
          _$jscoverage['/ua.js'].lineData[207]++;
          UA[shell = 'ie'] = v;
          _$jscoverage['/ua.js'].lineData[208]++;
          break;
        }
      }
      _$jscoverage['/ua.js'].lineData[214]++;
      if (visit585_214_1(!UA.ie && (ieVersion = getIEVersion(ua)))) {
        _$jscoverage['/ua.js'].lineData[215]++;
        UA[shell = 'ie'] = ieVersion;
      }
    } else {
      _$jscoverage['/ua.js'].lineData[220]++;
      if (visit586_220_1((m = ua.match(/AppleWebKit\/([\d.]*)/)) && m[1])) {
        _$jscoverage['/ua.js'].lineData[221]++;
        UA[core = 'webkit'] = numberify(m[1]);
        _$jscoverage['/ua.js'].lineData[223]++;
        if (visit587_223_1((m = ua.match(/OPR\/(\d+\.\d+)/)) && m[1])) {
          _$jscoverage['/ua.js'].lineData[224]++;
          UA[shell = 'opera'] = numberify(m[1]);
        } else {
          _$jscoverage['/ua.js'].lineData[227]++;
          if (visit588_227_1((m = ua.match(/Chrome\/([\d.]*)/)) && m[1])) {
            _$jscoverage['/ua.js'].lineData[228]++;
            UA[shell = 'chrome'] = numberify(m[1]);
          } else {
            _$jscoverage['/ua.js'].lineData[231]++;
            if (visit589_231_1((m = ua.match(/\/([\d.]*) Safari/)) && m[1])) {
              _$jscoverage['/ua.js'].lineData[232]++;
              UA[shell = 'safari'] = numberify(m[1]);
            }
          }
        }
        _$jscoverage['/ua.js'].lineData[236]++;
        if (visit590_236_1(/ Mobile\//.test(ua) && ua.match(/iPad|iPod|iPhone/))) {
          _$jscoverage['/ua.js'].lineData[237]++;
          UA.mobile = 'apple';
          _$jscoverage['/ua.js'].lineData[239]++;
          m = ua.match(/OS ([^\s]*)/);
          _$jscoverage['/ua.js'].lineData[240]++;
          if (visit591_240_1(m && m[1])) {
            _$jscoverage['/ua.js'].lineData[241]++;
            UA.ios = numberify(m[1].replace('_', '.'));
          }
          _$jscoverage['/ua.js'].lineData[243]++;
          os = 'ios';
          _$jscoverage['/ua.js'].lineData[244]++;
          m = ua.match(/iPad|iPod|iPhone/);
          _$jscoverage['/ua.js'].lineData[245]++;
          if (visit592_245_1(m && m[0])) {
            _$jscoverage['/ua.js'].lineData[246]++;
            UA[m[0].toLowerCase()] = UA.ios;
          }
        } else {
          _$jscoverage['/ua.js'].lineData[248]++;
          if (visit593_248_1(/ Android/i.test(ua))) {
            _$jscoverage['/ua.js'].lineData[249]++;
            if (visit594_249_1(/Mobile/.test(ua))) {
              _$jscoverage['/ua.js'].lineData[250]++;
              os = UA.mobile = 'android';
            }
            _$jscoverage['/ua.js'].lineData[252]++;
            m = ua.match(/Android ([^\s]*);/);
            _$jscoverage['/ua.js'].lineData[253]++;
            if (visit595_253_1(m && m[1])) {
              _$jscoverage['/ua.js'].lineData[254]++;
              UA.android = numberify(m[1]);
            }
          } else {
            _$jscoverage['/ua.js'].lineData[258]++;
            if ((m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))) {
              _$jscoverage['/ua.js'].lineData[259]++;
              UA.mobile = m[0].toLowerCase();
            }
          }
        }
        _$jscoverage['/ua.js'].lineData[262]++;
        if (visit596_262_1((m = ua.match(/PhantomJS\/([^\s]*)/)) && m[1])) {
          _$jscoverage['/ua.js'].lineData[263]++;
          UA.phantomjs = numberify(m[1]);
        }
      } else {
        _$jscoverage['/ua.js'].lineData[270]++;
        if (visit597_270_1((m = ua.match(/Presto\/([\d.]*)/)) && m[1])) {
          _$jscoverage['/ua.js'].lineData[271]++;
          UA[core = 'presto'] = numberify(m[1]);
          _$jscoverage['/ua.js'].lineData[274]++;
          if (visit598_274_1((m = ua.match(/Opera\/([\d.]*)/)) && m[1])) {
            _$jscoverage['/ua.js'].lineData[275]++;
            UA[shell = 'opera'] = numberify(m[1]);
            _$jscoverage['/ua.js'].lineData[277]++;
            if (visit599_277_1((m = ua.match(/Opera\/.* Version\/([\d.]*)/)) && m[1])) {
              _$jscoverage['/ua.js'].lineData[278]++;
              UA[shell] = numberify(m[1]);
            }
            _$jscoverage['/ua.js'].lineData[282]++;
            if (visit600_282_1((m = ua.match(/Opera Mini[^;]*/)) && m)) {
              _$jscoverage['/ua.js'].lineData[283]++;
              UA.mobile = m[0].toLowerCase();
            } else {
              _$jscoverage['/ua.js'].lineData[288]++;
              if (visit601_288_1((m = ua.match(/Opera Mobi[^;]*/)) && m)) {
                _$jscoverage['/ua.js'].lineData[289]++;
                UA.mobile = m[0];
              }
            }
          }
        } else {
          _$jscoverage['/ua.js'].lineData[298]++;
          if (visit602_298_1(ieVersion = getIEVersion(ua))) {
            _$jscoverage['/ua.js'].lineData[299]++;
            UA[shell = 'ie'] = ieVersion;
            _$jscoverage['/ua.js'].lineData[300]++;
            setTridentVersion(ua, UA);
          } else {
            _$jscoverage['/ua.js'].lineData[304]++;
            if ((m = ua.match(/Gecko/))) {
              _$jscoverage['/ua.js'].lineData[305]++;
              UA[core = 'gecko'] = 0.1;
              _$jscoverage['/ua.js'].lineData[306]++;
              if (visit603_306_1((m = ua.match(/rv:([\d.]*)/)) && m[1])) {
                _$jscoverage['/ua.js'].lineData[307]++;
                UA[core] = numberify(m[1]);
                _$jscoverage['/ua.js'].lineData[308]++;
                if (visit604_308_1(/Mobile|Tablet/.test(ua))) {
                  _$jscoverage['/ua.js'].lineData[309]++;
                  o.mobile = "firefox";
                }
              }
              _$jscoverage['/ua.js'].lineData[313]++;
              if (visit605_313_1((m = ua.match(/Firefox\/([\d.]*)/)) && m[1])) {
                _$jscoverage['/ua.js'].lineData[314]++;
                UA[shell = 'firefox'] = numberify(m[1]);
              }
            }
          }
        }
      }
    }
    _$jscoverage['/ua.js'].lineData[322]++;
    if (visit606_322_1(!os)) {
      _$jscoverage['/ua.js'].lineData[323]++;
      if (visit607_323_1((/windows|win32/i).test(ua))) {
        _$jscoverage['/ua.js'].lineData[324]++;
        os = 'windows';
      } else {
        _$jscoverage['/ua.js'].lineData[325]++;
        if (visit608_325_1((/macintosh|mac_powerpc/i).test(ua))) {
          _$jscoverage['/ua.js'].lineData[326]++;
          os = 'macintosh';
        } else {
          _$jscoverage['/ua.js'].lineData[327]++;
          if (visit609_327_1((/linux/i).test(ua))) {
            _$jscoverage['/ua.js'].lineData[328]++;
            os = 'linux';
          } else {
            _$jscoverage['/ua.js'].lineData[329]++;
            if (visit610_329_1((/rhino/i).test(ua))) {
              _$jscoverage['/ua.js'].lineData[330]++;
              os = 'rhino';
            }
          }
        }
      }
    }
    _$jscoverage['/ua.js'].lineData[334]++;
    UA.os = os;
    _$jscoverage['/ua.js'].lineData[335]++;
    UA.core = visit611_335_1(UA.core || core);
    _$jscoverage['/ua.js'].lineData[336]++;
    UA.shell = shell;
    _$jscoverage['/ua.js'].lineData[338]++;
    return UA;
  }
  _$jscoverage['/ua.js'].lineData[341]++;
  var UA = KISSY.UA = getDescriptorFromUserAgent(ua);
  _$jscoverage['/ua.js'].lineData[344]++;
  if (visit612_344_1(typeof process === 'object')) {
    _$jscoverage['/ua.js'].lineData[345]++;
    var versions, nodeVersion;
    _$jscoverage['/ua.js'].lineData[346]++;
    if (visit613_346_1((versions = process.versions) && (nodeVersion = versions.node))) {
      _$jscoverage['/ua.js'].lineData[347]++;
      UA.os = process.platform;
      _$jscoverage['/ua.js'].lineData[348]++;
      UA.nodejs = numberify(nodeVersion);
    }
  }
  _$jscoverage['/ua.js'].lineData[353]++;
  UA.getDescriptorFromUserAgent = getDescriptorFromUserAgent;
  _$jscoverage['/ua.js'].lineData[355]++;
  var o = ['webkit', 'trident', 'gecko', 'presto', 'chrome', 'safari', 'firefox', 'ie', 'opera'], documentElement = visit614_368_1(doc && doc.documentElement), className = '';
  _$jscoverage['/ua.js'].lineData[370]++;
  if (visit615_370_1(documentElement)) {
    _$jscoverage['/ua.js'].lineData[371]++;
    S.each(o, function(key) {
  _$jscoverage['/ua.js'].functionData[6]++;
  _$jscoverage['/ua.js'].lineData[372]++;
  var v = UA[key];
  _$jscoverage['/ua.js'].lineData[373]++;
  if (visit616_373_1(v)) {
    _$jscoverage['/ua.js'].lineData[374]++;
    className += ' ks-' + key + (parseInt(v) + '');
    _$jscoverage['/ua.js'].lineData[375]++;
    className += ' ks-' + key;
  }
});
    _$jscoverage['/ua.js'].lineData[378]++;
    if (visit617_378_1(S.trim(className))) {
      _$jscoverage['/ua.js'].lineData[379]++;
      documentElement.className = S.trim(documentElement.className + className);
    }
  }
})(KISSY);
