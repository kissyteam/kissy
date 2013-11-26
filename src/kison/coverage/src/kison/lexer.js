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
if (! _$jscoverage['/kison/lexer.js']) {
  _$jscoverage['/kison/lexer.js'] = {};
  _$jscoverage['/kison/lexer.js'].lineData = [];
  _$jscoverage['/kison/lexer.js'].lineData[6] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[7] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[8] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[15] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[31] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[33] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[40] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[44] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[50] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[54] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[70] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[77] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[79] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[80] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[81] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[84] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[85] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[88] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[90] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[92] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[94] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[96] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[97] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[101] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[102] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[104] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[109] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[110] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[111] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[114] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[115] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[117] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[119] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[122] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[124] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[126] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[127] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[128] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[132] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[136] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[139] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[140] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[141] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[142] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[143] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[144] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[146] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[147] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[150] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[154] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[158] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[162] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[166] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[171] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[172] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[175] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[177] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[181] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[183] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[184] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[186] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[190] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[194] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[195] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[196] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[197] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[200] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[201] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[203] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[208] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[210] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[211] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[213] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[217] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[226] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[228] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[229] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[232] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[233] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[234] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[237] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[238] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[239] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[240] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[242] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[250] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[252] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[255] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[257] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[259] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[260] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[261] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[262] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[264] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[266] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[267] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[269] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[270] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[273] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[278] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[279] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[283] = 0;
}
if (! _$jscoverage['/kison/lexer.js'].functionData) {
  _$jscoverage['/kison/lexer.js'].functionData = [];
  _$jscoverage['/kison/lexer.js'].functionData[0] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[1] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[2] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[3] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[4] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[5] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[6] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[7] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[8] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[9] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[10] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[11] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[12] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[13] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[14] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[15] = 0;
}
if (! _$jscoverage['/kison/lexer.js'].branchData) {
  _$jscoverage['/kison/lexer.js'].branchData = {};
  _$jscoverage['/kison/lexer.js'].branchData['79'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['84'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['95'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['96'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['100'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['101'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['107'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['109'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['114'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['124'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['127'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['141'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['142'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['143'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['146'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['172'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['176'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['183'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['186'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['194'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['200'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['210'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['213'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['228'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['232'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['234'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['235'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['236'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['236'][2] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['237'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['239'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['260'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['261'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['269'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['269'][1] = new BranchData();
}
_$jscoverage['/kison/lexer.js'].branchData['269'][1].init(1269, 3, 'ret');
function visit122_269_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['261'][1].init(990, 16, 'ret == undefined');
function visit121_261_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['260'][1].init(937, 27, 'action && action.call(self)');
function visit120_260_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['239'][1].init(74, 5, 'lines');
function visit119_239_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['237'][1].init(224, 23, 'm = input.match(regexp)');
function visit118_237_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['236'][2].init(131, 20, 'rule[2] || undefined');
function visit117_236_2(result) {
  _$jscoverage['/kison/lexer.js'].branchData['236'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['236'][1].init(116, 35, 'rule.action || rule[2] || undefined');
function visit116_236_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['235'][1].init(64, 21, 'rule.token || rule[0]');
function visit115_235_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['234'][1].init(63, 22, 'rule.regexp || rule[1]');
function visit114_234_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['232'][1].init(387, 16, 'i < rules.length');
function visit113_232_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['228'][1].init(277, 6, '!input');
function visit112_228_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['213'][1].init(160, 47, 'stateMap[s] || (stateMap[s] = (++self.stateId))');
function visit111_213_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['210'][1].init(88, 9, '!stateMap');
function visit110_210_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['200'][1].init(407, 16, 'reverseSymbolMap');
function visit109_200_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['194'][1].init(167, 30, '!reverseSymbolMap && symbolMap');
function visit108_194_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['186'][1].init(163, 50, 'symbolMap[t] || (symbolMap[t] = (++self.symbolId))');
function visit107_186_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['183'][1].init(90, 10, '!symbolMap');
function visit106_183_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['176'][1].init(53, 33, 'next.length > DEBUG_CONTEXT_LIMIT');
function visit105_176_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['172'][1].init(309, 36, 'matched.length > DEBUG_CONTEXT_LIMIT');
function visit104_172_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['146'][1].init(229, 30, 'S.inArray(currentState, state)');
function visit103_146_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['143'][1].init(25, 36, 'currentState == Lexer.STATIC.INITIAL');
function visit102_143_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['142'][1].init(66, 6, '!state');
function visit101_142_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['141'][1].init(29, 15, 'r.state || r[3]');
function visit100_141_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['127'][1].init(113, 13, 'compressState');
function visit99_127_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['124'][1].init(1928, 31, 'compressState || compressSymbol');
function visit98_124_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['114'][1].init(731, 5, 'state');
function visit97_114_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['109'][1].init(498, 22, 'compressState && state');
function visit96_109_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['107'][1].init(102, 11, 'action || 0');
function visit95_107_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['101'][1].init(204, 5, 'token');
function visit94_101_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['100'][1].init(136, 12, 'v.token || 0');
function visit93_100_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['96'][1].init(25, 13, 'v && v.regexp');
function visit92_96_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['95'][1].init(53, 31, 'compressState || compressSymbol');
function visit91_95_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['84'][1].init(430, 13, 'compressState');
function visit90_84_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['79'][1].init(296, 14, 'compressSymbol');
function visit89_79_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/kison/lexer.js'].functionData[0]++;
  _$jscoverage['/kison/lexer.js'].lineData[7]++;
  var Utils = require('./utils');
  _$jscoverage['/kison/lexer.js'].lineData[8]++;
  var serializeObject = Utils.serializeObject, Lexer = function(cfg) {
  _$jscoverage['/kison/lexer.js'].functionData[1]++;
  _$jscoverage['/kison/lexer.js'].lineData[15]++;
  var self = this;
  _$jscoverage['/kison/lexer.js'].lineData[31]++;
  self.rules = [];
  _$jscoverage['/kison/lexer.js'].lineData[33]++;
  S.mix(self, cfg);
  _$jscoverage['/kison/lexer.js'].lineData[40]++;
  self.resetInput(self.input);
};
  _$jscoverage['/kison/lexer.js'].lineData[44]++;
  Lexer.STATIC = {
  INITIAL: 'I', 
  DEBUG_CONTEXT_LIMIT: 20, 
  END_TAG: '$EOF'};
  _$jscoverage['/kison/lexer.js'].lineData[50]++;
  Lexer.prototype = {
  constructor: Lexer, 
  resetInput: function(input) {
  _$jscoverage['/kison/lexer.js'].functionData[2]++;
  _$jscoverage['/kison/lexer.js'].lineData[54]++;
  S.mix(this, {
  input: input, 
  matched: "", 
  stateStack: [Lexer.STATIC.INITIAL], 
  match: "", 
  text: "", 
  firstLine: 1, 
  lineNumber: 1, 
  lastLine: 1, 
  firstColumn: 1, 
  lastColumn: 1});
}, 
  genCode: function(cfg) {
  _$jscoverage['/kison/lexer.js'].functionData[3]++;
  _$jscoverage['/kison/lexer.js'].lineData[70]++;
  var STATIC = Lexer.STATIC, self = this, compressSymbol = cfg.compressSymbol, compressState = cfg.compressLexerState, code = [], stateMap;
  _$jscoverage['/kison/lexer.js'].lineData[77]++;
  self.symbolId = self.stateId = 0;
  _$jscoverage['/kison/lexer.js'].lineData[79]++;
  if (visit89_79_1(compressSymbol)) {
    _$jscoverage['/kison/lexer.js'].lineData[80]++;
    self.symbolMap = {};
    _$jscoverage['/kison/lexer.js'].lineData[81]++;
    self.mapSymbol(STATIC.END_TAG);
  }
  _$jscoverage['/kison/lexer.js'].lineData[84]++;
  if (visit90_84_1(compressState)) {
    _$jscoverage['/kison/lexer.js'].lineData[85]++;
    stateMap = self.stateMap = {};
  }
  _$jscoverage['/kison/lexer.js'].lineData[88]++;
  code.push("var Lexer = " + Lexer.toString() + ';');
  _$jscoverage['/kison/lexer.js'].lineData[90]++;
  code.push("Lexer.prototype= " + serializeObject(Lexer.prototype, /genCode/) + ";");
  _$jscoverage['/kison/lexer.js'].lineData[92]++;
  code.push("Lexer.STATIC= " + serializeObject(STATIC) + ";");
  _$jscoverage['/kison/lexer.js'].lineData[94]++;
  var newCfg = serializeObject({
  rules: self.rules}, (visit91_95_1(compressState || compressSymbol)) ? function(v) {
  _$jscoverage['/kison/lexer.js'].functionData[4]++;
  _$jscoverage['/kison/lexer.js'].lineData[96]++;
  if (visit92_96_1(v && v.regexp)) {
    _$jscoverage['/kison/lexer.js'].lineData[97]++;
    var state = v.state, ret, action = v.action, token = visit93_100_1(v.token || 0);
    _$jscoverage['/kison/lexer.js'].lineData[101]++;
    if (visit94_101_1(token)) {
      _$jscoverage['/kison/lexer.js'].lineData[102]++;
      token = self.mapSymbol(token);
    }
    _$jscoverage['/kison/lexer.js'].lineData[104]++;
    ret = [token, v.regexp, visit95_107_1(action || 0)];
    _$jscoverage['/kison/lexer.js'].lineData[109]++;
    if (visit96_109_1(compressState && state)) {
      _$jscoverage['/kison/lexer.js'].lineData[110]++;
      state = S.map(state, function(s) {
  _$jscoverage['/kison/lexer.js'].functionData[5]++;
  _$jscoverage['/kison/lexer.js'].lineData[111]++;
  return self.mapState(s);
});
    }
    _$jscoverage['/kison/lexer.js'].lineData[114]++;
    if (visit97_114_1(state)) {
      _$jscoverage['/kison/lexer.js'].lineData[115]++;
      ret.push(state);
    }
    _$jscoverage['/kison/lexer.js'].lineData[117]++;
    return ret;
  }
  _$jscoverage['/kison/lexer.js'].lineData[119]++;
  return undefined;
} : 0);
  _$jscoverage['/kison/lexer.js'].lineData[122]++;
  code.push("var lexer = new Lexer(" + newCfg + ");");
  _$jscoverage['/kison/lexer.js'].lineData[124]++;
  if (visit98_124_1(compressState || compressSymbol)) {
    _$jscoverage['/kison/lexer.js'].lineData[126]++;
    self.rules = eval('(' + newCfg + ')').rules;
    _$jscoverage['/kison/lexer.js'].lineData[127]++;
    if (visit99_127_1(compressState)) {
      _$jscoverage['/kison/lexer.js'].lineData[128]++;
      code.push('lexer.stateMap = ' + serializeObject(stateMap) + ';');
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[132]++;
  return code.join("\n");
}, 
  getCurrentRules: function() {
  _$jscoverage['/kison/lexer.js'].functionData[6]++;
  _$jscoverage['/kison/lexer.js'].lineData[136]++;
  var self = this, currentState = self.stateStack[self.stateStack.length - 1], rules = [];
  _$jscoverage['/kison/lexer.js'].lineData[139]++;
  currentState = self.mapState(currentState);
  _$jscoverage['/kison/lexer.js'].lineData[140]++;
  S.each(self.rules, function(r) {
  _$jscoverage['/kison/lexer.js'].functionData[7]++;
  _$jscoverage['/kison/lexer.js'].lineData[141]++;
  var state = visit100_141_1(r.state || r[3]);
  _$jscoverage['/kison/lexer.js'].lineData[142]++;
  if (visit101_142_1(!state)) {
    _$jscoverage['/kison/lexer.js'].lineData[143]++;
    if (visit102_143_1(currentState == Lexer.STATIC.INITIAL)) {
      _$jscoverage['/kison/lexer.js'].lineData[144]++;
      rules.push(r);
    }
  } else {
    _$jscoverage['/kison/lexer.js'].lineData[146]++;
    if (visit103_146_1(S.inArray(currentState, state))) {
      _$jscoverage['/kison/lexer.js'].lineData[147]++;
      rules.push(r);
    }
  }
});
  _$jscoverage['/kison/lexer.js'].lineData[150]++;
  return rules;
}, 
  pushState: function(state) {
  _$jscoverage['/kison/lexer.js'].functionData[8]++;
  _$jscoverage['/kison/lexer.js'].lineData[154]++;
  this.stateStack.push(state);
}, 
  popState: function() {
  _$jscoverage['/kison/lexer.js'].functionData[9]++;
  _$jscoverage['/kison/lexer.js'].lineData[158]++;
  return this.stateStack.pop();
}, 
  getStateStack: function() {
  _$jscoverage['/kison/lexer.js'].functionData[10]++;
  _$jscoverage['/kison/lexer.js'].lineData[162]++;
  return this.stateStack;
}, 
  showDebugInfo: function() {
  _$jscoverage['/kison/lexer.js'].functionData[11]++;
  _$jscoverage['/kison/lexer.js'].lineData[166]++;
  var self = this, DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT, matched = self.matched, match = self.match, input = self.input;
  _$jscoverage['/kison/lexer.js'].lineData[171]++;
  matched = matched.slice(0, matched.length - match.length);
  _$jscoverage['/kison/lexer.js'].lineData[172]++;
  var past = (visit104_172_1(matched.length > DEBUG_CONTEXT_LIMIT) ? "..." : "") + matched.slice(-DEBUG_CONTEXT_LIMIT).replace(/\n/, " "), next = match + input;
  _$jscoverage['/kison/lexer.js'].lineData[175]++;
  next = next.slice(0, DEBUG_CONTEXT_LIMIT) + (visit105_176_1(next.length > DEBUG_CONTEXT_LIMIT) ? "..." : "");
  _$jscoverage['/kison/lexer.js'].lineData[177]++;
  return past + next + "\n" + new Array(past.length + 1).join("-") + "^";
}, 
  mapSymbol: function(t) {
  _$jscoverage['/kison/lexer.js'].functionData[12]++;
  _$jscoverage['/kison/lexer.js'].lineData[181]++;
  var self = this, symbolMap = self.symbolMap;
  _$jscoverage['/kison/lexer.js'].lineData[183]++;
  if (visit106_183_1(!symbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[184]++;
    return t;
  }
  _$jscoverage['/kison/lexer.js'].lineData[186]++;
  return visit107_186_1(symbolMap[t] || (symbolMap[t] = (++self.symbolId)));
}, 
  mapReverseSymbol: function(rs) {
  _$jscoverage['/kison/lexer.js'].functionData[13]++;
  _$jscoverage['/kison/lexer.js'].lineData[190]++;
  var self = this, symbolMap = self.symbolMap, i, reverseSymbolMap = self.reverseSymbolMap;
  _$jscoverage['/kison/lexer.js'].lineData[194]++;
  if (visit108_194_1(!reverseSymbolMap && symbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[195]++;
    reverseSymbolMap = self.reverseSymbolMap = {};
    _$jscoverage['/kison/lexer.js'].lineData[196]++;
    for (i in symbolMap) {
      _$jscoverage['/kison/lexer.js'].lineData[197]++;
      reverseSymbolMap[symbolMap[i]] = i;
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[200]++;
  if (visit109_200_1(reverseSymbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[201]++;
    return reverseSymbolMap[rs];
  } else {
    _$jscoverage['/kison/lexer.js'].lineData[203]++;
    return rs;
  }
}, 
  mapState: function(s) {
  _$jscoverage['/kison/lexer.js'].functionData[14]++;
  _$jscoverage['/kison/lexer.js'].lineData[208]++;
  var self = this, stateMap = self.stateMap;
  _$jscoverage['/kison/lexer.js'].lineData[210]++;
  if (visit110_210_1(!stateMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[211]++;
    return s;
  }
  _$jscoverage['/kison/lexer.js'].lineData[213]++;
  return visit111_213_1(stateMap[s] || (stateMap[s] = (++self.stateId)));
}, 
  lex: function() {
  _$jscoverage['/kison/lexer.js'].functionData[15]++;
  _$jscoverage['/kison/lexer.js'].lineData[217]++;
  var self = this, input = self.input, i, rule, m, ret, lines, rules = self.getCurrentRules();
  _$jscoverage['/kison/lexer.js'].lineData[226]++;
  self.match = self.text = "";
  _$jscoverage['/kison/lexer.js'].lineData[228]++;
  if (visit112_228_1(!input)) {
    _$jscoverage['/kison/lexer.js'].lineData[229]++;
    return self.mapSymbol(Lexer.STATIC.END_TAG);
  }
  _$jscoverage['/kison/lexer.js'].lineData[232]++;
  for (i = 0; visit113_232_1(i < rules.length); i++) {
    _$jscoverage['/kison/lexer.js'].lineData[233]++;
    rule = rules[i];
    _$jscoverage['/kison/lexer.js'].lineData[234]++;
    var regexp = visit114_234_1(rule.regexp || rule[1]), token = visit115_235_1(rule.token || rule[0]), action = visit116_236_1(rule.action || visit117_236_2(rule[2] || undefined));
    _$jscoverage['/kison/lexer.js'].lineData[237]++;
    if (visit118_237_1(m = input.match(regexp))) {
      _$jscoverage['/kison/lexer.js'].lineData[238]++;
      lines = m[0].match(/\n.*/g);
      _$jscoverage['/kison/lexer.js'].lineData[239]++;
      if (visit119_239_1(lines)) {
        _$jscoverage['/kison/lexer.js'].lineData[240]++;
        self.lineNumber += lines.length;
      }
      _$jscoverage['/kison/lexer.js'].lineData[242]++;
      S.mix(self, {
  firstLine: self.lastLine, 
  lastLine: self.lineNumber + 1, 
  firstColumn: self.lastColumn, 
  lastColumn: lines ? lines[lines.length - 1].length - 1 : self.lastColumn + m[0].length});
      _$jscoverage['/kison/lexer.js'].lineData[250]++;
      var match;
      _$jscoverage['/kison/lexer.js'].lineData[252]++;
      match = self.match = m[0];
      _$jscoverage['/kison/lexer.js'].lineData[255]++;
      self.matches = m;
      _$jscoverage['/kison/lexer.js'].lineData[257]++;
      self.text = match;
      _$jscoverage['/kison/lexer.js'].lineData[259]++;
      self.matched += match;
      _$jscoverage['/kison/lexer.js'].lineData[260]++;
      ret = visit120_260_1(action && action.call(self));
      _$jscoverage['/kison/lexer.js'].lineData[261]++;
      if (visit121_261_1(ret == undefined)) {
        _$jscoverage['/kison/lexer.js'].lineData[262]++;
        ret = token;
      } else {
        _$jscoverage['/kison/lexer.js'].lineData[264]++;
        ret = self.mapSymbol(ret);
      }
      _$jscoverage['/kison/lexer.js'].lineData[266]++;
      input = input.slice(match.length);
      _$jscoverage['/kison/lexer.js'].lineData[267]++;
      self.input = input;
      _$jscoverage['/kison/lexer.js'].lineData[269]++;
      if (visit122_269_1(ret)) {
        _$jscoverage['/kison/lexer.js'].lineData[270]++;
        return ret;
      } else {
        _$jscoverage['/kison/lexer.js'].lineData[273]++;
        return self.lex();
      }
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[278]++;
  S.error("lex error at line " + self.lineNumber + ":\n" + self.showDebugInfo());
  _$jscoverage['/kison/lexer.js'].lineData[279]++;
  return undefined;
}};
  _$jscoverage['/kison/lexer.js'].lineData[283]++;
  return Lexer;
});
