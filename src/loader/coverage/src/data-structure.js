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
if (! _$jscoverage['/data-structure.js']) {
  _$jscoverage['/data-structure.js'] = {};
  _$jscoverage['/data-structure.js'].lineData = [];
  _$jscoverage['/data-structure.js'].lineData[6] = 0;
  _$jscoverage['/data-structure.js'].lineData[7] = 0;
  _$jscoverage['/data-structure.js'].lineData[14] = 0;
  _$jscoverage['/data-structure.js'].lineData[15] = 0;
  _$jscoverage['/data-structure.js'].lineData[25] = 0;
  _$jscoverage['/data-structure.js'].lineData[26] = 0;
  _$jscoverage['/data-structure.js'].lineData[29] = 0;
  _$jscoverage['/data-structure.js'].lineData[33] = 0;
  _$jscoverage['/data-structure.js'].lineData[42] = 0;
  _$jscoverage['/data-structure.js'].lineData[50] = 0;
  _$jscoverage['/data-structure.js'].lineData[54] = 0;
  _$jscoverage['/data-structure.js'].lineData[61] = 0;
  _$jscoverage['/data-structure.js'].lineData[69] = 0;
  _$jscoverage['/data-structure.js'].lineData[77] = 0;
  _$jscoverage['/data-structure.js'].lineData[85] = 0;
  _$jscoverage['/data-structure.js'].lineData[93] = 0;
  _$jscoverage['/data-structure.js'].lineData[97] = 0;
  _$jscoverage['/data-structure.js'].lineData[104] = 0;
  _$jscoverage['/data-structure.js'].lineData[105] = 0;
  _$jscoverage['/data-structure.js'].lineData[109] = 0;
  _$jscoverage['/data-structure.js'].lineData[114] = 0;
  _$jscoverage['/data-structure.js'].lineData[119] = 0;
  _$jscoverage['/data-structure.js'].lineData[124] = 0;
  _$jscoverage['/data-structure.js'].lineData[127] = 0;
  _$jscoverage['/data-structure.js'].lineData[128] = 0;
  _$jscoverage['/data-structure.js'].lineData[129] = 0;
  _$jscoverage['/data-structure.js'].lineData[132] = 0;
  _$jscoverage['/data-structure.js'].lineData[144] = 0;
  _$jscoverage['/data-structure.js'].lineData[145] = 0;
  _$jscoverage['/data-structure.js'].lineData[154] = 0;
  _$jscoverage['/data-structure.js'].lineData[159] = 0;
  _$jscoverage['/data-structure.js'].lineData[168] = 0;
  _$jscoverage['/data-structure.js'].lineData[172] = 0;
  _$jscoverage['/data-structure.js'].lineData[176] = 0;
  _$jscoverage['/data-structure.js'].lineData[177] = 0;
  _$jscoverage['/data-structure.js'].lineData[179] = 0;
  _$jscoverage['/data-structure.js'].lineData[180] = 0;
  _$jscoverage['/data-structure.js'].lineData[181] = 0;
  _$jscoverage['/data-structure.js'].lineData[182] = 0;
  _$jscoverage['/data-structure.js'].lineData[184] = 0;
  _$jscoverage['/data-structure.js'].lineData[186] = 0;
  _$jscoverage['/data-structure.js'].lineData[187] = 0;
  _$jscoverage['/data-structure.js'].lineData[191] = 0;
  _$jscoverage['/data-structure.js'].lineData[199] = 0;
  _$jscoverage['/data-structure.js'].lineData[201] = 0;
  _$jscoverage['/data-structure.js'].lineData[202] = 0;
  _$jscoverage['/data-structure.js'].lineData[203] = 0;
  _$jscoverage['/data-structure.js'].lineData[205] = 0;
  _$jscoverage['/data-structure.js'].lineData[207] = 0;
  _$jscoverage['/data-structure.js'].lineData[209] = 0;
  _$jscoverage['/data-structure.js'].lineData[213] = 0;
  _$jscoverage['/data-structure.js'].lineData[218] = 0;
  _$jscoverage['/data-structure.js'].lineData[219] = 0;
  _$jscoverage['/data-structure.js'].lineData[220] = 0;
  _$jscoverage['/data-structure.js'].lineData[221] = 0;
  _$jscoverage['/data-structure.js'].lineData[223] = 0;
  _$jscoverage['/data-structure.js'].lineData[224] = 0;
  _$jscoverage['/data-structure.js'].lineData[227] = 0;
  _$jscoverage['/data-structure.js'].lineData[235] = 0;
  _$jscoverage['/data-structure.js'].lineData[236] = 0;
  _$jscoverage['/data-structure.js'].lineData[238] = 0;
  _$jscoverage['/data-structure.js'].lineData[239] = 0;
  _$jscoverage['/data-structure.js'].lineData[241] = 0;
  _$jscoverage['/data-structure.js'].lineData[243] = 0;
  _$jscoverage['/data-structure.js'].lineData[245] = 0;
  _$jscoverage['/data-structure.js'].lineData[253] = 0;
  _$jscoverage['/data-structure.js'].lineData[254] = 0;
  _$jscoverage['/data-structure.js'].lineData[262] = 0;
  _$jscoverage['/data-structure.js'].lineData[270] = 0;
  _$jscoverage['/data-structure.js'].lineData[271] = 0;
  _$jscoverage['/data-structure.js'].lineData[281] = 0;
  _$jscoverage['/data-structure.js'].lineData[282] = 0;
  _$jscoverage['/data-structure.js'].lineData[290] = 0;
  _$jscoverage['/data-structure.js'].lineData[291] = 0;
  _$jscoverage['/data-structure.js'].lineData[299] = 0;
  _$jscoverage['/data-structure.js'].lineData[302] = 0;
  _$jscoverage['/data-structure.js'].lineData[303] = 0;
  _$jscoverage['/data-structure.js'].lineData[304] = 0;
  _$jscoverage['/data-structure.js'].lineData[305] = 0;
  _$jscoverage['/data-structure.js'].lineData[308] = 0;
  _$jscoverage['/data-structure.js'].lineData[316] = 0;
  _$jscoverage['/data-structure.js'].lineData[317] = 0;
  _$jscoverage['/data-structure.js'].lineData[318] = 0;
  _$jscoverage['/data-structure.js'].lineData[327] = 0;
  _$jscoverage['/data-structure.js'].lineData[332] = 0;
  _$jscoverage['/data-structure.js'].lineData[333] = 0;
  _$jscoverage['/data-structure.js'].lineData[334] = 0;
  _$jscoverage['/data-structure.js'].lineData[337] = 0;
  _$jscoverage['/data-structure.js'].lineData[339] = 0;
  _$jscoverage['/data-structure.js'].lineData[340] = 0;
  _$jscoverage['/data-structure.js'].lineData[341] = 0;
  _$jscoverage['/data-structure.js'].lineData[346] = 0;
  _$jscoverage['/data-structure.js'].lineData[348] = 0;
  _$jscoverage['/data-structure.js'].lineData[349] = 0;
  _$jscoverage['/data-structure.js'].lineData[353] = 0;
  _$jscoverage['/data-structure.js'].lineData[354] = 0;
  _$jscoverage['/data-structure.js'].lineData[355] = 0;
  _$jscoverage['/data-structure.js'].lineData[358] = 0;
}
if (! _$jscoverage['/data-structure.js'].functionData) {
  _$jscoverage['/data-structure.js'].functionData = [];
  _$jscoverage['/data-structure.js'].functionData[0] = 0;
  _$jscoverage['/data-structure.js'].functionData[1] = 0;
  _$jscoverage['/data-structure.js'].functionData[2] = 0;
  _$jscoverage['/data-structure.js'].functionData[3] = 0;
  _$jscoverage['/data-structure.js'].functionData[4] = 0;
  _$jscoverage['/data-structure.js'].functionData[5] = 0;
  _$jscoverage['/data-structure.js'].functionData[6] = 0;
  _$jscoverage['/data-structure.js'].functionData[7] = 0;
  _$jscoverage['/data-structure.js'].functionData[8] = 0;
  _$jscoverage['/data-structure.js'].functionData[9] = 0;
  _$jscoverage['/data-structure.js'].functionData[10] = 0;
  _$jscoverage['/data-structure.js'].functionData[11] = 0;
  _$jscoverage['/data-structure.js'].functionData[12] = 0;
  _$jscoverage['/data-structure.js'].functionData[13] = 0;
  _$jscoverage['/data-structure.js'].functionData[14] = 0;
  _$jscoverage['/data-structure.js'].functionData[15] = 0;
  _$jscoverage['/data-structure.js'].functionData[16] = 0;
  _$jscoverage['/data-structure.js'].functionData[17] = 0;
  _$jscoverage['/data-structure.js'].functionData[18] = 0;
  _$jscoverage['/data-structure.js'].functionData[19] = 0;
  _$jscoverage['/data-structure.js'].functionData[20] = 0;
  _$jscoverage['/data-structure.js'].functionData[21] = 0;
  _$jscoverage['/data-structure.js'].functionData[22] = 0;
  _$jscoverage['/data-structure.js'].functionData[23] = 0;
  _$jscoverage['/data-structure.js'].functionData[24] = 0;
  _$jscoverage['/data-structure.js'].functionData[25] = 0;
  _$jscoverage['/data-structure.js'].functionData[26] = 0;
  _$jscoverage['/data-structure.js'].functionData[27] = 0;
  _$jscoverage['/data-structure.js'].functionData[28] = 0;
  _$jscoverage['/data-structure.js'].functionData[29] = 0;
  _$jscoverage['/data-structure.js'].functionData[30] = 0;
  _$jscoverage['/data-structure.js'].functionData[31] = 0;
  _$jscoverage['/data-structure.js'].functionData[32] = 0;
}
if (! _$jscoverage['/data-structure.js'].branchData) {
  _$jscoverage['/data-structure.js'].branchData = {};
  _$jscoverage['/data-structure.js'].branchData['54'] = [];
  _$jscoverage['/data-structure.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['179'] = [];
  _$jscoverage['/data-structure.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['184'] = [];
  _$jscoverage['/data-structure.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['201'] = [];
  _$jscoverage['/data-structure.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['202'] = [];
  _$jscoverage['/data-structure.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['218'] = [];
  _$jscoverage['/data-structure.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['220'] = [];
  _$jscoverage['/data-structure.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['223'] = [];
  _$jscoverage['/data-structure.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['236'] = [];
  _$jscoverage['/data-structure.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['238'] = [];
  _$jscoverage['/data-structure.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['254'] = [];
  _$jscoverage['/data-structure.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['271'] = [];
  _$jscoverage['/data-structure.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['282'] = [];
  _$jscoverage['/data-structure.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['291'] = [];
  _$jscoverage['/data-structure.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['302'] = [];
  _$jscoverage['/data-structure.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['302'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['303'] = [];
  _$jscoverage['/data-structure.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['304'] = [];
  _$jscoverage['/data-structure.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['332'] = [];
  _$jscoverage['/data-structure.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['332'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['333'] = [];
  _$jscoverage['/data-structure.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['334'] = [];
  _$jscoverage['/data-structure.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['336'] = [];
  _$jscoverage['/data-structure.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['349'] = [];
  _$jscoverage['/data-structure.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['354'] = [];
  _$jscoverage['/data-structure.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['354'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['358'] = [];
  _$jscoverage['/data-structure.js'].branchData['358'][1] = new BranchData();
}
_$jscoverage['/data-structure.js'].branchData['358'][1].init(306, 34, 'packages[pName] || Env.corePackage');
function visit117_358_1(result) {
  _$jscoverage['/data-structure.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['354'][2].init(56, 23, 'p.length > pName.length');
function visit116_354_2(result) {
  _$jscoverage['/data-structure.js'].branchData['354'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['354'][1].init(17, 62, 'S.startsWith(modNameSlash, p + \'/\') && p.length > pName.length');
function visit115_354_1(result) {
  _$jscoverage['/data-structure.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['349'][1].init(24, 21, 'Config.packages || {}');
function visit114_349_1(result) {
  _$jscoverage['/data-structure.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['336'][1].init(112, 35, 'normalizedRequiresStatus === status');
function visit113_336_1(result) {
  _$jscoverage['/data-structure.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['334'][1].init(338, 149, '(normalizedRequires = self.normalizedRequires) && (normalizedRequiresStatus === status)');
function visit112_334_1(result) {
  _$jscoverage['/data-structure.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['333'][1].init(24, 14, 'requires || []');
function visit111_333_1(result) {
  _$jscoverage['/data-structure.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['332'][2].init(249, 21, 'requires.length === 0');
function visit110_332_2(result) {
  _$jscoverage['/data-structure.js'].branchData['332'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['332'][1].init(236, 34, '!requires || requires.length === 0');
function visit109_332_1(result) {
  _$jscoverage['/data-structure.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['304'][1].init(249, 18, '!requiresWithAlias');
function visit108_304_1(result) {
  _$jscoverage['/data-structure.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['303'][1].init(24, 14, 'requires || []');
function visit107_303_1(result) {
  _$jscoverage['/data-structure.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['302'][2].init(161, 21, 'requires.length === 0');
function visit106_302_2(result) {
  _$jscoverage['/data-structure.js'].branchData['302'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['302'][1].init(148, 34, '!requires || requires.length === 0');
function visit105_302_1(result) {
  _$jscoverage['/data-structure.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['291'][1].init(49, 46, 'self.charset || self.getPackage().getCharset()');
function visit104_291_1(result) {
  _$jscoverage['/data-structure.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['282'][1].init(49, 38, 'self.tag || self.getPackage().getTag()');
function visit103_282_1(result) {
  _$jscoverage['/data-structure.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['271'][1].init(49, 78, 'self.packageInfo || (self.packageInfo = getPackage(self.name))');
function visit102_271_1(result) {
  _$jscoverage['/data-structure.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['254'][1].init(49, 51, 'self.path || (self.path = self.getUri().toString())');
function visit101_254_1(result) {
  _$jscoverage['/data-structure.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['238'][1].init(62, 9, 'self.path');
function visit100_238_1(result) {
  _$jscoverage['/data-structure.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['236'][1].init(51, 9, '!self.uri');
function visit99_236_1(result) {
  _$jscoverage['/data-structure.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['223'][1].init(182, 34, '!alias && (aliasFn = Config.alias)');
function visit98_223_1(result) {
  _$jscoverage['/data-structure.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['220'][1].init(70, 17, 'packageInfo.alias');
function visit97_220_1(result) {
  _$jscoverage['/data-structure.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['218'][1].init(170, 18, '!(\'alias\' in self)');
function visit96_218_1(result) {
  _$jscoverage['/data-structure.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['202'][1].init(21, 48, 'Path.extname(self.name).toLowerCase() === \'.css\'');
function visit95_202_1(result) {
  _$jscoverage['/data-structure.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['201'][1].init(77, 2, '!v');
function visit94_201_1(result) {
  _$jscoverage['/data-structure.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['184'][1].init(27, 12, 'e.stack || e');
function visit93_184_1(result) {
  _$jscoverage['/data-structure.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['179'][1].init(120, 7, 'i < len');
function visit92_179_1(result) {
  _$jscoverage['/data-structure.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['54'][1].init(20, 51, 'this.path || (this.path = this.getUri().toString())');
function visit91_54_1(result) {
  _$jscoverage['/data-structure.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/data-structure.js'].functionData[0]++;
  _$jscoverage['/data-structure.js'].lineData[7]++;
  var Loader = S.Loader, Path = S.Path, Config = S.Config, Env = S.Env, Utils = Loader.Utils, mix = S.mix;
  _$jscoverage['/data-structure.js'].lineData[14]++;
  function checkGlobalIfNotExist(self, property) {
    _$jscoverage['/data-structure.js'].functionData[1]++;
    _$jscoverage['/data-structure.js'].lineData[15]++;
    return property in self ? self[property] : Config[property];
  }
  _$jscoverage['/data-structure.js'].lineData[25]++;
  function Package(cfg) {
    _$jscoverage['/data-structure.js'].functionData[2]++;
    _$jscoverage['/data-structure.js'].lineData[26]++;
    mix(this, cfg);
  }
  _$jscoverage['/data-structure.js'].lineData[29]++;
  Package.prototype = {
  constructor: Package, 
  reset: function(cfg) {
  _$jscoverage['/data-structure.js'].functionData[3]++;
  _$jscoverage['/data-structure.js'].lineData[33]++;
  mix(this, cfg);
}, 
  getTag: function() {
  _$jscoverage['/data-structure.js'].functionData[4]++;
  _$jscoverage['/data-structure.js'].lineData[42]++;
  return checkGlobalIfNotExist(this, 'tag');
}, 
  getName: function() {
  _$jscoverage['/data-structure.js'].functionData[5]++;
  _$jscoverage['/data-structure.js'].lineData[50]++;
  return this.name;
}, 
  getPath: function() {
  _$jscoverage['/data-structure.js'].functionData[6]++;
  _$jscoverage['/data-structure.js'].lineData[54]++;
  return visit91_54_1(this.path || (this.path = this.getUri().toString()));
}, 
  getUri: function() {
  _$jscoverage['/data-structure.js'].functionData[7]++;
  _$jscoverage['/data-structure.js'].lineData[61]++;
  return this.uri;
}, 
  isDebug: function() {
  _$jscoverage['/data-structure.js'].functionData[8]++;
  _$jscoverage['/data-structure.js'].lineData[69]++;
  return checkGlobalIfNotExist(this, 'debug');
}, 
  getCharset: function() {
  _$jscoverage['/data-structure.js'].functionData[9]++;
  _$jscoverage['/data-structure.js'].lineData[77]++;
  return checkGlobalIfNotExist(this, 'charset');
}, 
  isCombine: function() {
  _$jscoverage['/data-structure.js'].functionData[10]++;
  _$jscoverage['/data-structure.js'].lineData[85]++;
  return checkGlobalIfNotExist(this, 'combine');
}, 
  getGroup: function() {
  _$jscoverage['/data-structure.js'].functionData[11]++;
  _$jscoverage['/data-structure.js'].lineData[93]++;
  return checkGlobalIfNotExist(this, 'group');
}};
  _$jscoverage['/data-structure.js'].lineData[97]++;
  Loader.Package = Package;
  _$jscoverage['/data-structure.js'].lineData[104]++;
  function Module(cfg) {
    _$jscoverage['/data-structure.js'].functionData[12]++;
    _$jscoverage['/data-structure.js'].lineData[105]++;
    var self = this;
    _$jscoverage['/data-structure.js'].lineData[109]++;
    self.exports = {};
    _$jscoverage['/data-structure.js'].lineData[114]++;
    self.status = Loader.Status.INIT;
    _$jscoverage['/data-structure.js'].lineData[119]++;
    self.name = undefined;
    _$jscoverage['/data-structure.js'].lineData[124]++;
    self.factory = undefined;
    _$jscoverage['/data-structure.js'].lineData[127]++;
    self.cjs = 1;
    _$jscoverage['/data-structure.js'].lineData[128]++;
    mix(self, cfg);
    _$jscoverage['/data-structure.js'].lineData[129]++;
    self.waitedCallbacks = [];
  }
  _$jscoverage['/data-structure.js'].lineData[132]++;
  Module.prototype = {
  kissy: 1, 
  constructor: Module, 
  use: function(relativeName, fn) {
  _$jscoverage['/data-structure.js'].functionData[13]++;
  _$jscoverage['/data-structure.js'].lineData[144]++;
  relativeName = Utils.getModNamesAsArray(relativeName);
  _$jscoverage['/data-structure.js'].lineData[145]++;
  return KISSY.use(Utils.normalDepModuleName(this.name, relativeName), fn);
}, 
  resolve: function(relativePath) {
  _$jscoverage['/data-structure.js'].functionData[14]++;
  _$jscoverage['/data-structure.js'].lineData[154]++;
  return this.getUri().resolve(relativePath);
}, 
  resolveByName: function(relativeName) {
  _$jscoverage['/data-structure.js'].functionData[15]++;
  _$jscoverage['/data-structure.js'].lineData[159]++;
  return Utils.normalDepModuleName(this.name, relativeName);
}, 
  require: function(moduleName) {
  _$jscoverage['/data-structure.js'].functionData[16]++;
  _$jscoverage['/data-structure.js'].lineData[168]++;
  return S.require(moduleName, this.name);
}, 
  wait: function(callback) {
  _$jscoverage['/data-structure.js'].functionData[17]++;
  _$jscoverage['/data-structure.js'].lineData[172]++;
  this.waitedCallbacks.push(callback);
}, 
  notifyAll: function() {
  _$jscoverage['/data-structure.js'].functionData[18]++;
  _$jscoverage['/data-structure.js'].lineData[176]++;
  var callback;
  _$jscoverage['/data-structure.js'].lineData[177]++;
  var len = this.waitedCallbacks.length, i = 0;
  _$jscoverage['/data-structure.js'].lineData[179]++;
  for (; visit92_179_1(i < len); i++) {
    _$jscoverage['/data-structure.js'].lineData[180]++;
    callback = this.waitedCallbacks[i];
    _$jscoverage['/data-structure.js'].lineData[181]++;
    try {
      _$jscoverage['/data-structure.js'].lineData[182]++;
      callback(this);
    }    catch (e) {
  _$jscoverage['/data-structure.js'].lineData[184]++;
  S.log(visit93_184_1(e.stack || e), 'error');
  _$jscoverage['/data-structure.js'].lineData[186]++;
  setTimeout(function() {
  _$jscoverage['/data-structure.js'].functionData[19]++;
  _$jscoverage['/data-structure.js'].lineData[187]++;
  throw e;
}, 0);
}
  }
  _$jscoverage['/data-structure.js'].lineData[191]++;
  this.waitedCallbacks = [];
}, 
  getType: function() {
  _$jscoverage['/data-structure.js'].functionData[20]++;
  _$jscoverage['/data-structure.js'].lineData[199]++;
  var self = this, v = self.type;
  _$jscoverage['/data-structure.js'].lineData[201]++;
  if (visit94_201_1(!v)) {
    _$jscoverage['/data-structure.js'].lineData[202]++;
    if (visit95_202_1(Path.extname(self.name).toLowerCase() === '.css')) {
      _$jscoverage['/data-structure.js'].lineData[203]++;
      v = 'css';
    } else {
      _$jscoverage['/data-structure.js'].lineData[205]++;
      v = 'js';
    }
    _$jscoverage['/data-structure.js'].lineData[207]++;
    self.type = v;
  }
  _$jscoverage['/data-structure.js'].lineData[209]++;
  return v;
}, 
  getAlias: function() {
  _$jscoverage['/data-structure.js'].functionData[21]++;
  _$jscoverage['/data-structure.js'].lineData[213]++;
  var self = this, name = self.name, aliasFn, packageInfo, alias = self.alias;
  _$jscoverage['/data-structure.js'].lineData[218]++;
  if (visit96_218_1(!('alias' in self))) {
    _$jscoverage['/data-structure.js'].lineData[219]++;
    packageInfo = self.getPackage();
    _$jscoverage['/data-structure.js'].lineData[220]++;
    if (visit97_220_1(packageInfo.alias)) {
      _$jscoverage['/data-structure.js'].lineData[221]++;
      alias = packageInfo.alias(name);
    }
    _$jscoverage['/data-structure.js'].lineData[223]++;
    if (visit98_223_1(!alias && (aliasFn = Config.alias))) {
      _$jscoverage['/data-structure.js'].lineData[224]++;
      alias = aliasFn(name);
    }
  }
  _$jscoverage['/data-structure.js'].lineData[227]++;
  return alias;
}, 
  getUri: function() {
  _$jscoverage['/data-structure.js'].functionData[22]++;
  _$jscoverage['/data-structure.js'].lineData[235]++;
  var self = this, uri;
  _$jscoverage['/data-structure.js'].lineData[236]++;
  if (visit99_236_1(!self.uri)) {
    _$jscoverage['/data-structure.js'].lineData[238]++;
    if (visit100_238_1(self.path)) {
      _$jscoverage['/data-structure.js'].lineData[239]++;
      uri = new S.Uri(self.path);
    } else {
      _$jscoverage['/data-structure.js'].lineData[241]++;
      uri = S.Config.resolveModFn(self);
    }
    _$jscoverage['/data-structure.js'].lineData[243]++;
    self.uri = uri;
  }
  _$jscoverage['/data-structure.js'].lineData[245]++;
  return self.uri;
}, 
  getPath: function() {
  _$jscoverage['/data-structure.js'].functionData[23]++;
  _$jscoverage['/data-structure.js'].lineData[253]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[254]++;
  return visit101_254_1(self.path || (self.path = self.getUri().toString()));
}, 
  getName: function() {
  _$jscoverage['/data-structure.js'].functionData[24]++;
  _$jscoverage['/data-structure.js'].lineData[262]++;
  return this.name;
}, 
  getPackage: function() {
  _$jscoverage['/data-structure.js'].functionData[25]++;
  _$jscoverage['/data-structure.js'].lineData[270]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[271]++;
  return visit102_271_1(self.packageInfo || (self.packageInfo = getPackage(self.name)));
}, 
  getTag: function() {
  _$jscoverage['/data-structure.js'].functionData[26]++;
  _$jscoverage['/data-structure.js'].lineData[281]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[282]++;
  return visit103_282_1(self.tag || self.getPackage().getTag());
}, 
  getCharset: function() {
  _$jscoverage['/data-structure.js'].functionData[27]++;
  _$jscoverage['/data-structure.js'].lineData[290]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[291]++;
  return visit104_291_1(self.charset || self.getPackage().getCharset());
}, 
  getRequiresWithAlias: function() {
  _$jscoverage['/data-structure.js'].functionData[28]++;
  _$jscoverage['/data-structure.js'].lineData[299]++;
  var self = this, requiresWithAlias = self.requiresWithAlias, requires = self.requires;
  _$jscoverage['/data-structure.js'].lineData[302]++;
  if (visit105_302_1(!requires || visit106_302_2(requires.length === 0))) {
    _$jscoverage['/data-structure.js'].lineData[303]++;
    return visit107_303_1(requires || []);
  } else {
    _$jscoverage['/data-structure.js'].lineData[304]++;
    if (visit108_304_1(!requiresWithAlias)) {
      _$jscoverage['/data-structure.js'].lineData[305]++;
      self.requiresWithAlias = requiresWithAlias = Utils.normalizeModNamesWithAlias(requires, self.name);
    }
  }
  _$jscoverage['/data-structure.js'].lineData[308]++;
  return requiresWithAlias;
}, 
  getRequiredMods: function() {
  _$jscoverage['/data-structure.js'].functionData[29]++;
  _$jscoverage['/data-structure.js'].lineData[316]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[317]++;
  return S.map(self.getNormalizedRequires(), function(r) {
  _$jscoverage['/data-structure.js'].functionData[30]++;
  _$jscoverage['/data-structure.js'].lineData[318]++;
  return Utils.createModuleInfo(r);
});
}, 
  getNormalizedRequires: function() {
  _$jscoverage['/data-structure.js'].functionData[31]++;
  _$jscoverage['/data-structure.js'].lineData[327]++;
  var self = this, normalizedRequires, normalizedRequiresStatus = self.normalizedRequiresStatus, status = self.status, requires = self.requires;
  _$jscoverage['/data-structure.js'].lineData[332]++;
  if (visit109_332_1(!requires || visit110_332_2(requires.length === 0))) {
    _$jscoverage['/data-structure.js'].lineData[333]++;
    return visit111_333_1(requires || []);
  } else {
    _$jscoverage['/data-structure.js'].lineData[334]++;
    if (visit112_334_1((normalizedRequires = self.normalizedRequires) && (visit113_336_1(normalizedRequiresStatus === status)))) {
      _$jscoverage['/data-structure.js'].lineData[337]++;
      return normalizedRequires;
    } else {
      _$jscoverage['/data-structure.js'].lineData[339]++;
      self.normalizedRequiresStatus = status;
      _$jscoverage['/data-structure.js'].lineData[340]++;
      self.normalizedRequires = Utils.normalizeModNames(requires, self.name);
      _$jscoverage['/data-structure.js'].lineData[341]++;
      return self.normalizedRequires;
    }
  }
}};
  _$jscoverage['/data-structure.js'].lineData[346]++;
  Loader.Module = Module;
  _$jscoverage['/data-structure.js'].lineData[348]++;
  function getPackage(modName) {
    _$jscoverage['/data-structure.js'].functionData[32]++;
    _$jscoverage['/data-structure.js'].lineData[349]++;
    var packages = visit114_349_1(Config.packages || {}), modNameSlash = modName + '/', pName = '', p;
    _$jscoverage['/data-structure.js'].lineData[353]++;
    for (p in packages) {
      _$jscoverage['/data-structure.js'].lineData[354]++;
      if (visit115_354_1(S.startsWith(modNameSlash, p + '/') && visit116_354_2(p.length > pName.length))) {
        _$jscoverage['/data-structure.js'].lineData[355]++;
        pName = p;
      }
    }
    _$jscoverage['/data-structure.js'].lineData[358]++;
    return visit117_358_1(packages[pName] || Env.corePackage);
  }
})(KISSY);
