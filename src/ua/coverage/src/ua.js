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
  _$jscoverage['/ua.js'].lineData[9] = 0;
  _$jscoverage['/ua.js'].lineData[14] = 0;
  _$jscoverage['/ua.js'].lineData[15] = 0;
  _$jscoverage['/ua.js'].lineData[17] = 0;
  _$jscoverage['/ua.js'].lineData[18] = 0;
  _$jscoverage['/ua.js'].lineData[22] = 0;
  _$jscoverage['/ua.js'].lineData[23] = 0;
  _$jscoverage['/ua.js'].lineData[24] = 0;
  _$jscoverage['/ua.js'].lineData[27] = 0;
  _$jscoverage['/ua.js'].lineData[28] = 0;
  _$jscoverage['/ua.js'].lineData[31] = 0;
  _$jscoverage['/ua.js'].lineData[34] = 0;
  _$jscoverage['/ua.js'].lineData[35] = 0;
  _$jscoverage['/ua.js'].lineData[36] = 0;
  _$jscoverage['/ua.js'].lineData[38] = 0;
  _$jscoverage['/ua.js'].lineData[40] = 0;
  _$jscoverage['/ua.js'].lineData[43] = 0;
  _$jscoverage['/ua.js'].lineData[44] = 0;
  _$jscoverage['/ua.js'].lineData[62] = 0;
  _$jscoverage['/ua.js'].lineData[197] = 0;
  _$jscoverage['/ua.js'].lineData[200] = 0;
  _$jscoverage['/ua.js'].lineData[201] = 0;
  _$jscoverage['/ua.js'].lineData[204] = 0;
  _$jscoverage['/ua.js'].lineData[205] = 0;
  _$jscoverage['/ua.js'].lineData[213] = 0;
  _$jscoverage['/ua.js'].lineData[214] = 0;
  _$jscoverage['/ua.js'].lineData[215] = 0;
  _$jscoverage['/ua.js'].lineData[216] = 0;
  _$jscoverage['/ua.js'].lineData[217] = 0;
  _$jscoverage['/ua.js'].lineData[223] = 0;
  _$jscoverage['/ua.js'].lineData[224] = 0;
  _$jscoverage['/ua.js'].lineData[229] = 0;
  _$jscoverage['/ua.js'].lineData[230] = 0;
  _$jscoverage['/ua.js'].lineData[232] = 0;
  _$jscoverage['/ua.js'].lineData[233] = 0;
  _$jscoverage['/ua.js'].lineData[234] = 0;
  _$jscoverage['/ua.js'].lineData[235] = 0;
  _$jscoverage['/ua.js'].lineData[236] = 0;
  _$jscoverage['/ua.js'].lineData[237] = 0;
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
  _$jscoverage['/ua.js'].lineData[264] = 0;
  _$jscoverage['/ua.js'].lineData[265] = 0;
  _$jscoverage['/ua.js'].lineData[268] = 0;
  _$jscoverage['/ua.js'].lineData[269] = 0;
  _$jscoverage['/ua.js'].lineData[274] = 0;
  _$jscoverage['/ua.js'].lineData[275] = 0;
  _$jscoverage['/ua.js'].lineData[278] = 0;
  _$jscoverage['/ua.js'].lineData[279] = 0;
  _$jscoverage['/ua.js'].lineData[281] = 0;
  _$jscoverage['/ua.js'].lineData[282] = 0;
  _$jscoverage['/ua.js'].lineData[286] = 0;
  _$jscoverage['/ua.js'].lineData[287] = 0;
  _$jscoverage['/ua.js'].lineData[288] = 0;
  _$jscoverage['/ua.js'].lineData[292] = 0;
  _$jscoverage['/ua.js'].lineData[300] = 0;
  _$jscoverage['/ua.js'].lineData[301] = 0;
  _$jscoverage['/ua.js'].lineData[302] = 0;
  _$jscoverage['/ua.js'].lineData[306] = 0;
  _$jscoverage['/ua.js'].lineData[307] = 0;
  _$jscoverage['/ua.js'].lineData[308] = 0;
  _$jscoverage['/ua.js'].lineData[309] = 0;
  _$jscoverage['/ua.js'].lineData[310] = 0;
  _$jscoverage['/ua.js'].lineData[311] = 0;
  _$jscoverage['/ua.js'].lineData[315] = 0;
  _$jscoverage['/ua.js'].lineData[316] = 0;
  _$jscoverage['/ua.js'].lineData[324] = 0;
  _$jscoverage['/ua.js'].lineData[325] = 0;
  _$jscoverage['/ua.js'].lineData[326] = 0;
  _$jscoverage['/ua.js'].lineData[327] = 0;
  _$jscoverage['/ua.js'].lineData[328] = 0;
  _$jscoverage['/ua.js'].lineData[329] = 0;
  _$jscoverage['/ua.js'].lineData[330] = 0;
  _$jscoverage['/ua.js'].lineData[331] = 0;
  _$jscoverage['/ua.js'].lineData[332] = 0;
  _$jscoverage['/ua.js'].lineData[336] = 0;
  _$jscoverage['/ua.js'].lineData[337] = 0;
  _$jscoverage['/ua.js'].lineData[338] = 0;
  _$jscoverage['/ua.js'].lineData[339] = 0;
  _$jscoverage['/ua.js'].lineData[341] = 0;
  _$jscoverage['/ua.js'].lineData[344] = 0;
  _$jscoverage['/ua.js'].lineData[347] = 0;
  _$jscoverage['/ua.js'].lineData[348] = 0;
  _$jscoverage['/ua.js'].lineData[350] = 0;
  _$jscoverage['/ua.js'].lineData[351] = 0;
  _$jscoverage['/ua.js'].lineData[352] = 0;
  _$jscoverage['/ua.js'].lineData[357] = 0;
  _$jscoverage['/ua.js'].lineData[359] = 0;
  _$jscoverage['/ua.js'].lineData[374] = 0;
  _$jscoverage['/ua.js'].lineData[375] = 0;
  _$jscoverage['/ua.js'].lineData[376] = 0;
  _$jscoverage['/ua.js'].lineData[377] = 0;
  _$jscoverage['/ua.js'].lineData[378] = 0;
  _$jscoverage['/ua.js'].lineData[379] = 0;
  _$jscoverage['/ua.js'].lineData[382] = 0;
  _$jscoverage['/ua.js'].lineData[383] = 0;
  _$jscoverage['/ua.js'].lineData[387] = 0;
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
  _$jscoverage['/ua.js'].branchData['12'] = [];
  _$jscoverage['/ua.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['12'][2] = new BranchData();
  _$jscoverage['/ua.js'].branchData['18'] = [];
  _$jscoverage['/ua.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['27'] = [];
  _$jscoverage['/ua.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['36'] = [];
  _$jscoverage['/ua.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['37'] = [];
  _$jscoverage['/ua.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['54'] = [];
  _$jscoverage['/ua.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['197'] = [];
  _$jscoverage['/ua.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['204'] = [];
  _$jscoverage['/ua.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['213'] = [];
  _$jscoverage['/ua.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['215'] = [];
  _$jscoverage['/ua.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['223'] = [];
  _$jscoverage['/ua.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['229'] = [];
  _$jscoverage['/ua.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['229'][2] = new BranchData();
  _$jscoverage['/ua.js'].branchData['232'] = [];
  _$jscoverage['/ua.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['234'] = [];
  _$jscoverage['/ua.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['236'] = [];
  _$jscoverage['/ua.js'].branchData['236'][1] = new BranchData();
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
  _$jscoverage['/ua.js'].branchData['268'] = [];
  _$jscoverage['/ua.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['274'] = [];
  _$jscoverage['/ua.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['278'] = [];
  _$jscoverage['/ua.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['281'] = [];
  _$jscoverage['/ua.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['286'] = [];
  _$jscoverage['/ua.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['288'] = [];
  _$jscoverage['/ua.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['308'] = [];
  _$jscoverage['/ua.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['310'] = [];
  _$jscoverage['/ua.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['315'] = [];
  _$jscoverage['/ua.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['324'] = [];
  _$jscoverage['/ua.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['325'] = [];
  _$jscoverage['/ua.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['327'] = [];
  _$jscoverage['/ua.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['329'] = [];
  _$jscoverage['/ua.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['331'] = [];
  _$jscoverage['/ua.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['337'] = [];
  _$jscoverage['/ua.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['339'] = [];
  _$jscoverage['/ua.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['339'][2] = new BranchData();
  _$jscoverage['/ua.js'].branchData['347'] = [];
  _$jscoverage['/ua.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['350'] = [];
  _$jscoverage['/ua.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['372'] = [];
  _$jscoverage['/ua.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['374'] = [];
  _$jscoverage['/ua.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['377'] = [];
  _$jscoverage['/ua.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['382'] = [];
  _$jscoverage['/ua.js'].branchData['382'][1] = new BranchData();
}
_$jscoverage['/ua.js'].branchData['382'][1].init(242, 17, 'S.trim(className)');
function visit46_382_1(result) {
  _$jscoverage['/ua.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['377'][1].init(46, 1, 'v');
function visit45_377_1(result) {
  _$jscoverage['/ua.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['374'][1].init(12122, 15, 'documentElement');
function visit44_374_1(result) {
  _$jscoverage['/ua.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['372'][1].init(307, 26, 'doc && doc.documentElement');
function visit43_372_1(result) {
  _$jscoverage['/ua.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['350'][1].init(50, 61, '(versions = process.versions) && (nodeVersion = versions.node)');
function visit42_350_1(result) {
  _$jscoverage['/ua.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['347'][1].init(11398, 27, 'typeof process === \'object\'');
function visit41_347_1(result) {
  _$jscoverage['/ua.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['339'][2].init(10264, 25, 'UA.ie && doc.documentMode');
function visit40_339_2(result) {
  _$jscoverage['/ua.js'].branchData['339'][2].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['339'][1].init(10264, 34, 'UA.ie && doc.documentMode || UA.ie');
function visit39_339_1(result) {
  _$jscoverage['/ua.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['337'][1].init(10201, 15, 'UA.core || core');
function visit38_337_1(result) {
  _$jscoverage['/ua.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['331'][1].init(279, 18, '(/rhino/i).test(ua)');
function visit37_331_1(result) {
  _$jscoverage['/ua.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['329'][1].init(202, 18, '(/linux/i).test(ua)');
function visit36_329_1(result) {
  _$jscoverage['/ua.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['327'][1].init(105, 34, '(/macintosh|mac_powerpc/i).test(ua)');
function visit35_327_1(result) {
  _$jscoverage['/ua.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['325'][1].init(18, 26, '(/windows|win32/i).test(ua)');
function visit34_325_1(result) {
  _$jscoverage['/ua.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['324'][1].init(9804, 3, '!os');
function visit33_324_1(result) {
  _$jscoverage['/ua.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['315'][1].init(484, 42, '(m = ua.match(/Firefox\\/([\\d.]*)/)) && m[1]');
function visit32_315_1(result) {
  _$jscoverage['/ua.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['310'][1].init(97, 24, '/Mobile|Tablet/.test(ua)');
function visit31_310_1(result) {
  _$jscoverage['/ua.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['308'][1].init(125, 36, '(m = ua.match(/rv:([\\d.]*)/)) && m[1]');
function visit30_308_1(result) {
  _$jscoverage['/ua.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['288'][1].init(508, 37, '(m = ua.match(/Opera Mobi[^;]*/)) && m');
function visit29_288_1(result) {
  _$jscoverage['/ua.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['286'][1].init(338, 37, '(m = ua.match(/Opera Mini[^;]*/)) && m');
function visit28_286_1(result) {
  _$jscoverage['/ua.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['281'][1].init(131, 52, '(m = ua.match(/Opera\\/.* Version\\/([\\d.]*)/)) && m[1]');
function visit27_281_1(result) {
  _$jscoverage['/ua.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['278'][1].init(115, 40, '(m = ua.match(/Opera\\/([\\d.]*)/)) && m[1]');
function visit26_278_1(result) {
  _$jscoverage['/ua.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['274'][1].init(129, 41, '(m = ua.match(/Presto\\/([\\d.]*)/)) && m[1]');
function visit25_274_1(result) {
  _$jscoverage['/ua.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['268'][1].init(1709, 44, '(m = ua.match(/PhantomJS\\/([^\\s]*)/)) && m[1]');
function visit24_268_1(result) {
  _$jscoverage['/ua.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['261'][1].init(199, 9, 'm && m[1]');
function visit23_261_1(result) {
  _$jscoverage['/ua.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['257'][1].init(25, 17, '/Mobile/.test(ua)');
function visit22_257_1(result) {
  _$jscoverage['/ua.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['256'][1].init(1169, 20, '/ Android/i.test(ua)');
function visit21_256_1(result) {
  _$jscoverage['/ua.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['253'][1].init(359, 9, 'm && m[0]');
function visit20_253_1(result) {
  _$jscoverage['/ua.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['248'][1].init(146, 9, 'm && m[1]');
function visit19_248_1(result) {
  _$jscoverage['/ua.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['244'][1].init(635, 52, '/ Mobile\\//.test(ua) && ua.match(/iPad|iPod|iPhone/)');
function visit18_244_1(result) {
  _$jscoverage['/ua.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['236'][1].init(344, 42, '(m = ua.match(/\\/([\\d.]*) Safari/)) && m[1]');
function visit17_236_1(result) {
  _$jscoverage['/ua.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['234'][1].init(210, 41, '(m = ua.match(/Chrome\\/([\\d.]*)/)) && m[1]');
function visit16_234_1(result) {
  _$jscoverage['/ua.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['232'][1].init(78, 40, '(m = ua.match(/OPR\\/(\\d+\\.\\d+)/)) && m[1]');
function visit15_232_1(result) {
  _$jscoverage['/ua.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['229'][2].init(102, 76, '(m = ua.match(/AppleWebKit\\/([\\d.]*)/)) || (m = ua.match(/Safari\\/([\\d.]*)/))');
function visit14_229_2(result) {
  _$jscoverage['/ua.js'].branchData['229'][2].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['229'][1].init(102, 85, '((m = ua.match(/AppleWebKit\\/([\\d.]*)/)) || (m = ua.match(/Safari\\/([\\d.]*)/))) && m[1]');
function visit13_229_1(result) {
  _$jscoverage['/ua.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['223'][1].init(744, 40, '!UA.ie && (ieVersion = getIEVersion(ua))');
function visit12_223_1(result) {
  _$jscoverage['/ua.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['215'][1].init(100, 12, 's.length > 0');
function visit11_215_1(result) {
  _$jscoverage['/ua.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['213'][1].init(403, 8, 'v <= end');
function visit10_213_1(result) {
  _$jscoverage['/ua.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['204'][1].init(4367, 12, 's.length > 0');
function visit9_204_1(result) {
  _$jscoverage['/ua.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['197'][1].init(3983, 31, 'div && div.getElementsByTagName');
function visit8_197_1(result) {
  _$jscoverage['/ua.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['54'][1].init(343, 31, 'doc && doc.createElement(\'div\')');
function visit7_54_1(result) {
  _$jscoverage['/ua.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['37'][1].init(82, 12, 'm[1] || m[2]');
function visit6_37_1(result) {
  _$jscoverage['/ua.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['36'][1].init(32, 97, '(m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\\s|:)?([0-9.]+)/)) && (v = (m[1] || m[2]))');
function visit5_36_1(result) {
  _$jscoverage['/ua.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['27'][1].init(157, 42, '(m = ua.match(/Trident\\/([\\d.]*)/)) && m[1]');
function visit4_27_1(result) {
  _$jscoverage['/ua.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['18'][1].init(21, 9, 'c++ === 0');
function visit3_18_1(result) {
  _$jscoverage['/ua.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['12'][2].init(97, 32, 'navigator && navigator.userAgent');
function visit2_12_2(result) {
  _$jscoverage['/ua.js'].branchData['12'][2].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['12'][1].init(97, 38, 'navigator && navigator.userAgent || \'\'');
function visit1_12_1(result) {
  _$jscoverage['/ua.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].lineData[5]++;
KISSY.add(function(S, require, module, exports, undefined) {
  _$jscoverage['/ua.js'].functionData[0]++;
  _$jscoverage['/ua.js'].lineData[6]++;
  require('util');
  _$jscoverage['/ua.js'].lineData[9]++;
  var win = S.Env.host, doc = win.document, navigator = win.navigator, ua = visit1_12_1(visit2_12_2(navigator && navigator.userAgent) || '');
  _$jscoverage['/ua.js'].lineData[14]++;
  function numberify(s) {
    _$jscoverage['/ua.js'].functionData[1]++;
    _$jscoverage['/ua.js'].lineData[15]++;
    var c = 0;
    _$jscoverage['/ua.js'].lineData[17]++;
    return parseFloat(s.replace(/\./g, function() {
  _$jscoverage['/ua.js'].functionData[2]++;
  _$jscoverage['/ua.js'].lineData[18]++;
  return (visit3_18_1(c++ === 0)) ? '.' : '';
}));
  }
  _$jscoverage['/ua.js'].lineData[22]++;
  function setTridentVersion(ua, UA) {
    _$jscoverage['/ua.js'].functionData[3]++;
    _$jscoverage['/ua.js'].lineData[23]++;
    var core, m;
    _$jscoverage['/ua.js'].lineData[24]++;
    UA[core = 'trident'] = 0.1;
    _$jscoverage['/ua.js'].lineData[27]++;
    if (visit4_27_1((m = ua.match(/Trident\/([\d.]*)/)) && m[1])) {
      _$jscoverage['/ua.js'].lineData[28]++;
      UA[core] = numberify(m[1]);
    }
    _$jscoverage['/ua.js'].lineData[31]++;
    UA.core = core;
  }
  _$jscoverage['/ua.js'].lineData[34]++;
  function getIEVersion(ua) {
    _$jscoverage['/ua.js'].functionData[4]++;
    _$jscoverage['/ua.js'].lineData[35]++;
    var m, v;
    _$jscoverage['/ua.js'].lineData[36]++;
    if (visit5_36_1((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) && (v = (visit6_37_1(m[1] || m[2]))))) {
      _$jscoverage['/ua.js'].lineData[38]++;
      return numberify(v);
    }
    _$jscoverage['/ua.js'].lineData[40]++;
    return 0;
  }
  _$jscoverage['/ua.js'].lineData[43]++;
  function getDescriptorFromUserAgent(ua) {
    _$jscoverage['/ua.js'].functionData[5]++;
    _$jscoverage['/ua.js'].lineData[44]++;
    var EMPTY = '', os, core = EMPTY, shell = EMPTY, m, IE_DETECT_RANGE = [6, 9], ieVersion, v, end, VERSION_PLACEHOLDER = '{{version}}', IE_DETECT_TPL = '<!--[if IE ' + VERSION_PLACEHOLDER + ']><' + 's></s><![endif]-->', div = visit7_54_1(doc && doc.createElement('div')), s = [];
    _$jscoverage['/ua.js'].lineData[62]++;
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
    _$jscoverage['/ua.js'].lineData[197]++;
    if (visit8_197_1(div && div.getElementsByTagName)) {
      _$jscoverage['/ua.js'].lineData[200]++;
      div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, '');
      _$jscoverage['/ua.js'].lineData[201]++;
      s = div.getElementsByTagName('s');
    }
    _$jscoverage['/ua.js'].lineData[204]++;
    if (visit9_204_1(s.length > 0)) {
      _$jscoverage['/ua.js'].lineData[205]++;
      setTridentVersion(ua, UA);
      _$jscoverage['/ua.js'].lineData[213]++;
      for (v = IE_DETECT_RANGE[0] , end = IE_DETECT_RANGE[1]; visit10_213_1(v <= end); v++) {
        _$jscoverage['/ua.js'].lineData[214]++;
        div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, v);
        _$jscoverage['/ua.js'].lineData[215]++;
        if (visit11_215_1(s.length > 0)) {
          _$jscoverage['/ua.js'].lineData[216]++;
          UA[shell = 'ie'] = v;
          _$jscoverage['/ua.js'].lineData[217]++;
          break;
        }
      }
      _$jscoverage['/ua.js'].lineData[223]++;
      if (visit12_223_1(!UA.ie && (ieVersion = getIEVersion(ua)))) {
        _$jscoverage['/ua.js'].lineData[224]++;
        UA[shell = 'ie'] = ieVersion;
      }
    } else {
      _$jscoverage['/ua.js'].lineData[229]++;
      if (visit13_229_1((visit14_229_2((m = ua.match(/AppleWebKit\/([\d.]*)/)) || (m = ua.match(/Safari\/([\d.]*)/)))) && m[1])) {
        _$jscoverage['/ua.js'].lineData[230]++;
        UA[core = 'webkit'] = numberify(m[1]);
        _$jscoverage['/ua.js'].lineData[232]++;
        if (visit15_232_1((m = ua.match(/OPR\/(\d+\.\d+)/)) && m[1])) {
          _$jscoverage['/ua.js'].lineData[233]++;
          UA[shell = 'opera'] = numberify(m[1]);
        } else {
          _$jscoverage['/ua.js'].lineData[234]++;
          if (visit16_234_1((m = ua.match(/Chrome\/([\d.]*)/)) && m[1])) {
            _$jscoverage['/ua.js'].lineData[235]++;
            UA[shell = 'chrome'] = numberify(m[1]);
          } else {
            _$jscoverage['/ua.js'].lineData[236]++;
            if (visit17_236_1((m = ua.match(/\/([\d.]*) Safari/)) && m[1])) {
              _$jscoverage['/ua.js'].lineData[237]++;
              UA[shell = 'safari'] = numberify(m[1]);
            } else {
              _$jscoverage['/ua.js'].lineData[240]++;
              UA.safari = UA.webkit;
            }
          }
        }
        _$jscoverage['/ua.js'].lineData[244]++;
        if (visit18_244_1(/ Mobile\//.test(ua) && ua.match(/iPad|iPod|iPhone/))) {
          _$jscoverage['/ua.js'].lineData[245]++;
          UA.mobile = 'apple';
          _$jscoverage['/ua.js'].lineData[247]++;
          m = ua.match(/OS ([^\s]*)/);
          _$jscoverage['/ua.js'].lineData[248]++;
          if (visit19_248_1(m && m[1])) {
            _$jscoverage['/ua.js'].lineData[249]++;
            UA.ios = numberify(m[1].replace('_', '.'));
          }
          _$jscoverage['/ua.js'].lineData[251]++;
          os = 'ios';
          _$jscoverage['/ua.js'].lineData[252]++;
          m = ua.match(/iPad|iPod|iPhone/);
          _$jscoverage['/ua.js'].lineData[253]++;
          if (visit20_253_1(m && m[0])) {
            _$jscoverage['/ua.js'].lineData[254]++;
            UA[m[0].toLowerCase()] = UA.ios;
          }
        } else {
          _$jscoverage['/ua.js'].lineData[256]++;
          if (visit21_256_1(/ Android/i.test(ua))) {
            _$jscoverage['/ua.js'].lineData[257]++;
            if (visit22_257_1(/Mobile/.test(ua))) {
              _$jscoverage['/ua.js'].lineData[258]++;
              os = UA.mobile = 'android';
            }
            _$jscoverage['/ua.js'].lineData[260]++;
            m = ua.match(/Android ([^\s]*);/);
            _$jscoverage['/ua.js'].lineData[261]++;
            if (visit23_261_1(m && m[1])) {
              _$jscoverage['/ua.js'].lineData[262]++;
              UA.android = numberify(m[1]);
            }
          } else {
            _$jscoverage['/ua.js'].lineData[264]++;
            if ((m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))) {
              _$jscoverage['/ua.js'].lineData[265]++;
              UA.mobile = m[0].toLowerCase();
            }
          }
        }
        _$jscoverage['/ua.js'].lineData[268]++;
        if (visit24_268_1((m = ua.match(/PhantomJS\/([^\s]*)/)) && m[1])) {
          _$jscoverage['/ua.js'].lineData[269]++;
          UA.phantomjs = numberify(m[1]);
        }
      } else {
        _$jscoverage['/ua.js'].lineData[274]++;
        if (visit25_274_1((m = ua.match(/Presto\/([\d.]*)/)) && m[1])) {
          _$jscoverage['/ua.js'].lineData[275]++;
          UA[core = 'presto'] = numberify(m[1]);
          _$jscoverage['/ua.js'].lineData[278]++;
          if (visit26_278_1((m = ua.match(/Opera\/([\d.]*)/)) && m[1])) {
            _$jscoverage['/ua.js'].lineData[279]++;
            UA[shell = 'opera'] = numberify(m[1]);
            _$jscoverage['/ua.js'].lineData[281]++;
            if (visit27_281_1((m = ua.match(/Opera\/.* Version\/([\d.]*)/)) && m[1])) {
              _$jscoverage['/ua.js'].lineData[282]++;
              UA[shell] = numberify(m[1]);
            }
            _$jscoverage['/ua.js'].lineData[286]++;
            if (visit28_286_1((m = ua.match(/Opera Mini[^;]*/)) && m)) {
              _$jscoverage['/ua.js'].lineData[287]++;
              UA.mobile = m[0].toLowerCase();
            } else {
              _$jscoverage['/ua.js'].lineData[288]++;
              if (visit29_288_1((m = ua.match(/Opera Mobi[^;]*/)) && m)) {
                _$jscoverage['/ua.js'].lineData[292]++;
                UA.mobile = m[0];
              }
            }
          }
        } else {
          _$jscoverage['/ua.js'].lineData[300]++;
          if ((ieVersion = getIEVersion(ua))) {
            _$jscoverage['/ua.js'].lineData[301]++;
            UA[shell = 'ie'] = ieVersion;
            _$jscoverage['/ua.js'].lineData[302]++;
            setTridentVersion(ua, UA);
          } else {
            _$jscoverage['/ua.js'].lineData[306]++;
            if ((m = ua.match(/Gecko/))) {
              _$jscoverage['/ua.js'].lineData[307]++;
              UA[core = 'gecko'] = 0.1;
              _$jscoverage['/ua.js'].lineData[308]++;
              if (visit30_308_1((m = ua.match(/rv:([\d.]*)/)) && m[1])) {
                _$jscoverage['/ua.js'].lineData[309]++;
                UA[core] = numberify(m[1]);
                _$jscoverage['/ua.js'].lineData[310]++;
                if (visit31_310_1(/Mobile|Tablet/.test(ua))) {
                  _$jscoverage['/ua.js'].lineData[311]++;
                  UA.mobile = 'firefox';
                }
              }
              _$jscoverage['/ua.js'].lineData[315]++;
              if (visit32_315_1((m = ua.match(/Firefox\/([\d.]*)/)) && m[1])) {
                _$jscoverage['/ua.js'].lineData[316]++;
                UA[shell = 'firefox'] = numberify(m[1]);
              }
            }
          }
        }
      }
    }
    _$jscoverage['/ua.js'].lineData[324]++;
    if (visit33_324_1(!os)) {
      _$jscoverage['/ua.js'].lineData[325]++;
      if (visit34_325_1((/windows|win32/i).test(ua))) {
        _$jscoverage['/ua.js'].lineData[326]++;
        os = 'windows';
      } else {
        _$jscoverage['/ua.js'].lineData[327]++;
        if (visit35_327_1((/macintosh|mac_powerpc/i).test(ua))) {
          _$jscoverage['/ua.js'].lineData[328]++;
          os = 'macintosh';
        } else {
          _$jscoverage['/ua.js'].lineData[329]++;
          if (visit36_329_1((/linux/i).test(ua))) {
            _$jscoverage['/ua.js'].lineData[330]++;
            os = 'linux';
          } else {
            _$jscoverage['/ua.js'].lineData[331]++;
            if (visit37_331_1((/rhino/i).test(ua))) {
              _$jscoverage['/ua.js'].lineData[332]++;
              os = 'rhino';
            }
          }
        }
      }
    }
    _$jscoverage['/ua.js'].lineData[336]++;
    UA.os = os;
    _$jscoverage['/ua.js'].lineData[337]++;
    UA.core = visit38_337_1(UA.core || core);
    _$jscoverage['/ua.js'].lineData[338]++;
    UA.shell = shell;
    _$jscoverage['/ua.js'].lineData[339]++;
    UA.ieMode = visit39_339_1(visit40_339_2(UA.ie && doc.documentMode) || UA.ie);
    _$jscoverage['/ua.js'].lineData[341]++;
    return UA;
  }
  _$jscoverage['/ua.js'].lineData[344]++;
  var UA = S.UA = getDescriptorFromUserAgent(ua);
  _$jscoverage['/ua.js'].lineData[347]++;
  if (visit41_347_1(typeof process === 'object')) {
    _$jscoverage['/ua.js'].lineData[348]++;
    var versions, nodeVersion;
    _$jscoverage['/ua.js'].lineData[350]++;
    if (visit42_350_1((versions = process.versions) && (nodeVersion = versions.node))) {
      _$jscoverage['/ua.js'].lineData[351]++;
      UA.os = process.platform;
      _$jscoverage['/ua.js'].lineData[352]++;
      UA.nodejs = numberify(nodeVersion);
    }
  }
  _$jscoverage['/ua.js'].lineData[357]++;
  UA.getDescriptorFromUserAgent = getDescriptorFromUserAgent;
  _$jscoverage['/ua.js'].lineData[359]++;
  var browsers = ['webkit', 'trident', 'gecko', 'presto', 'chrome', 'safari', 'firefox', 'ie', 'opera'], documentElement = visit43_372_1(doc && doc.documentElement), className = '';
  _$jscoverage['/ua.js'].lineData[374]++;
  if (visit44_374_1(documentElement)) {
    _$jscoverage['/ua.js'].lineData[375]++;
    S.each(browsers, function(key) {
  _$jscoverage['/ua.js'].functionData[6]++;
  _$jscoverage['/ua.js'].lineData[376]++;
  var v = UA[key];
  _$jscoverage['/ua.js'].lineData[377]++;
  if (visit45_377_1(v)) {
    _$jscoverage['/ua.js'].lineData[378]++;
    className += ' ks-' + key + (parseInt(v, 10) + '');
    _$jscoverage['/ua.js'].lineData[379]++;
    className += ' ks-' + key;
  }
});
    _$jscoverage['/ua.js'].lineData[382]++;
    if (visit46_382_1(S.trim(className))) {
      _$jscoverage['/ua.js'].lineData[383]++;
      documentElement.className = S.trim(documentElement.className + className);
    }
  }
  _$jscoverage['/ua.js'].lineData[387]++;
  return UA;
});
