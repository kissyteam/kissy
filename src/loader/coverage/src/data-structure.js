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
  _$jscoverage['/data-structure.js'].lineData[12] = 0;
  _$jscoverage['/data-structure.js'].lineData[13] = 0;
  _$jscoverage['/data-structure.js'].lineData[23] = 0;
  _$jscoverage['/data-structure.js'].lineData[24] = 0;
  _$jscoverage['/data-structure.js'].lineData[27] = 0;
  _$jscoverage['/data-structure.js'].lineData[31] = 0;
  _$jscoverage['/data-structure.js'].lineData[40] = 0;
  _$jscoverage['/data-structure.js'].lineData[48] = 0;
  _$jscoverage['/data-structure.js'].lineData[55] = 0;
  _$jscoverage['/data-structure.js'].lineData[63] = 0;
  _$jscoverage['/data-structure.js'].lineData[71] = 0;
  _$jscoverage['/data-structure.js'].lineData[79] = 0;
  _$jscoverage['/data-structure.js'].lineData[87] = 0;
  _$jscoverage['/data-structure.js'].lineData[91] = 0;
  _$jscoverage['/data-structure.js'].lineData[98] = 0;
  _$jscoverage['/data-structure.js'].lineData[99] = 0;
  _$jscoverage['/data-structure.js'].lineData[103] = 0;
  _$jscoverage['/data-structure.js'].lineData[108] = 0;
  _$jscoverage['/data-structure.js'].lineData[113] = 0;
  _$jscoverage['/data-structure.js'].lineData[118] = 0;
  _$jscoverage['/data-structure.js'].lineData[121] = 0;
  _$jscoverage['/data-structure.js'].lineData[122] = 0;
  _$jscoverage['/data-structure.js'].lineData[123] = 0;
  _$jscoverage['/data-structure.js'].lineData[126] = 0;
  _$jscoverage['/data-structure.js'].lineData[138] = 0;
  _$jscoverage['/data-structure.js'].lineData[139] = 0;
  _$jscoverage['/data-structure.js'].lineData[144] = 0;
  _$jscoverage['/data-structure.js'].lineData[153] = 0;
  _$jscoverage['/data-structure.js'].lineData[157] = 0;
  _$jscoverage['/data-structure.js'].lineData[161] = 0;
  _$jscoverage['/data-structure.js'].lineData[165] = 0;
  _$jscoverage['/data-structure.js'].lineData[169] = 0;
  _$jscoverage['/data-structure.js'].lineData[170] = 0;
  _$jscoverage['/data-structure.js'].lineData[172] = 0;
  _$jscoverage['/data-structure.js'].lineData[180] = 0;
  _$jscoverage['/data-structure.js'].lineData[182] = 0;
  _$jscoverage['/data-structure.js'].lineData[183] = 0;
  _$jscoverage['/data-structure.js'].lineData[184] = 0;
  _$jscoverage['/data-structure.js'].lineData[186] = 0;
  _$jscoverage['/data-structure.js'].lineData[188] = 0;
  _$jscoverage['/data-structure.js'].lineData[190] = 0;
  _$jscoverage['/data-structure.js'].lineData[194] = 0;
  _$jscoverage['/data-structure.js'].lineData[199] = 0;
  _$jscoverage['/data-structure.js'].lineData[200] = 0;
  _$jscoverage['/data-structure.js'].lineData[201] = 0;
  _$jscoverage['/data-structure.js'].lineData[202] = 0;
  _$jscoverage['/data-structure.js'].lineData[204] = 0;
  _$jscoverage['/data-structure.js'].lineData[205] = 0;
  _$jscoverage['/data-structure.js'].lineData[208] = 0;
  _$jscoverage['/data-structure.js'].lineData[216] = 0;
  _$jscoverage['/data-structure.js'].lineData[217] = 0;
  _$jscoverage['/data-structure.js'].lineData[218] = 0;
  _$jscoverage['/data-structure.js'].lineData[220] = 0;
  _$jscoverage['/data-structure.js'].lineData[228] = 0;
  _$jscoverage['/data-structure.js'].lineData[236] = 0;
  _$jscoverage['/data-structure.js'].lineData[237] = 0;
  _$jscoverage['/data-structure.js'].lineData[238] = 0;
  _$jscoverage['/data-structure.js'].lineData[242] = 0;
  _$jscoverage['/data-structure.js'].lineData[243] = 0;
  _$jscoverage['/data-structure.js'].lineData[244] = 0;
  _$jscoverage['/data-structure.js'].lineData[247] = 0;
  _$jscoverage['/data-structure.js'].lineData[249] = 0;
  _$jscoverage['/data-structure.js'].lineData[258] = 0;
  _$jscoverage['/data-structure.js'].lineData[259] = 0;
  _$jscoverage['/data-structure.js'].lineData[267] = 0;
  _$jscoverage['/data-structure.js'].lineData[268] = 0;
  _$jscoverage['/data-structure.js'].lineData[276] = 0;
  _$jscoverage['/data-structure.js'].lineData[279] = 0;
  _$jscoverage['/data-structure.js'].lineData[280] = 0;
  _$jscoverage['/data-structure.js'].lineData[281] = 0;
  _$jscoverage['/data-structure.js'].lineData[282] = 0;
  _$jscoverage['/data-structure.js'].lineData[285] = 0;
  _$jscoverage['/data-structure.js'].lineData[293] = 0;
  _$jscoverage['/data-structure.js'].lineData[294] = 0;
  _$jscoverage['/data-structure.js'].lineData[295] = 0;
  _$jscoverage['/data-structure.js'].lineData[296] = 0;
  _$jscoverage['/data-structure.js'].lineData[298] = 0;
  _$jscoverage['/data-structure.js'].lineData[306] = 0;
  _$jscoverage['/data-structure.js'].lineData[311] = 0;
  _$jscoverage['/data-structure.js'].lineData[312] = 0;
  _$jscoverage['/data-structure.js'].lineData[313] = 0;
  _$jscoverage['/data-structure.js'].lineData[316] = 0;
  _$jscoverage['/data-structure.js'].lineData[318] = 0;
  _$jscoverage['/data-structure.js'].lineData[319] = 0;
  _$jscoverage['/data-structure.js'].lineData[320] = 0;
  _$jscoverage['/data-structure.js'].lineData[325] = 0;
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
}
if (! _$jscoverage['/data-structure.js'].branchData) {
  _$jscoverage['/data-structure.js'].branchData = {};
  _$jscoverage['/data-structure.js'].branchData['182'] = [];
  _$jscoverage['/data-structure.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['183'] = [];
  _$jscoverage['/data-structure.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['199'] = [];
  _$jscoverage['/data-structure.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['201'] = [];
  _$jscoverage['/data-structure.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['204'] = [];
  _$jscoverage['/data-structure.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['217'] = [];
  _$jscoverage['/data-structure.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['237'] = [];
  _$jscoverage['/data-structure.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['238'] = [];
  _$jscoverage['/data-structure.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['243'] = [];
  _$jscoverage['/data-structure.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['243'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['247'] = [];
  _$jscoverage['/data-structure.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['259'] = [];
  _$jscoverage['/data-structure.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['268'] = [];
  _$jscoverage['/data-structure.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['279'] = [];
  _$jscoverage['/data-structure.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['279'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['280'] = [];
  _$jscoverage['/data-structure.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['281'] = [];
  _$jscoverage['/data-structure.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['311'] = [];
  _$jscoverage['/data-structure.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['311'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['312'] = [];
  _$jscoverage['/data-structure.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['313'] = [];
  _$jscoverage['/data-structure.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['315'] = [];
  _$jscoverage['/data-structure.js'].branchData['315'][1] = new BranchData();
}
_$jscoverage['/data-structure.js'].branchData['315'][1].init(112, 35, 'normalizedRequiresStatus === status');
function visit127_315_1(result) {
  _$jscoverage['/data-structure.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['313'][1].init(338, 149, '(normalizedRequires = self.normalizedRequires) && (normalizedRequiresStatus === status)');
function visit126_313_1(result) {
  _$jscoverage['/data-structure.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['312'][1].init(24, 14, 'requires || []');
function visit125_312_1(result) {
  _$jscoverage['/data-structure.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['311'][2].init(249, 21, 'requires.length === 0');
function visit124_311_2(result) {
  _$jscoverage['/data-structure.js'].branchData['311'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['311'][1].init(236, 34, '!requires || requires.length === 0');
function visit123_311_1(result) {
  _$jscoverage['/data-structure.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['281'][1].init(249, 18, '!requiresWithAlias');
function visit122_281_1(result) {
  _$jscoverage['/data-structure.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['280'][1].init(24, 14, 'requires || []');
function visit121_280_1(result) {
  _$jscoverage['/data-structure.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['279'][2].init(161, 21, 'requires.length === 0');
function visit120_279_2(result) {
  _$jscoverage['/data-structure.js'].branchData['279'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['279'][1].init(148, 34, '!requires || requires.length === 0');
function visit119_279_1(result) {
  _$jscoverage['/data-structure.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['268'][1].init(49, 46, 'self.charset || self.getPackage().getCharset()');
function visit118_268_1(result) {
  _$jscoverage['/data-structure.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['259'][1].init(49, 38, 'self.tag || self.getPackage().getTag()');
function visit117_259_1(result) {
  _$jscoverage['/data-structure.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['247'][1].init(404, 37, 'packages[pName] || Config.corePackage');
function visit116_247_1(result) {
  _$jscoverage['/data-structure.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['243'][2].init(68, 23, 'p.length > pName.length');
function visit115_243_2(result) {
  _$jscoverage['/data-structure.js'].branchData['243'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['243'][1].init(25, 66, 'Utils.startsWith(modNameSlash, p + \'/\') && p.length > pName.length');
function visit114_243_1(result) {
  _$jscoverage['/data-structure.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['238'][1].init(32, 21, 'Config.packages || {}');
function visit113_238_1(result) {
  _$jscoverage['/data-structure.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['237'][1].init(46, 17, '!self.packageInfo');
function visit112_237_1(result) {
  _$jscoverage['/data-structure.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['217'][1].init(46, 9, '!self.url');
function visit111_217_1(result) {
  _$jscoverage['/data-structure.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['204'][1].init(182, 34, '!alias && (aliasFn = Config.alias)');
function visit110_204_1(result) {
  _$jscoverage['/data-structure.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['201'][1].init(70, 17, 'packageInfo.alias');
function visit109_201_1(result) {
  _$jscoverage['/data-structure.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['199'][1].init(170, 18, '!(\'alias\' in self)');
function visit108_199_1(result) {
  _$jscoverage['/data-structure.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['183'][1].init(21, 33, 'Utils.endsWith(self.name, \'.css\')');
function visit107_183_1(result) {
  _$jscoverage['/data-structure.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['182'][1].init(77, 2, '!v');
function visit106_182_1(result) {
  _$jscoverage['/data-structure.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/data-structure.js'].functionData[0]++;
  _$jscoverage['/data-structure.js'].lineData[7]++;
  var Loader = S.Loader, Config = S.Config, Utils = Loader.Utils, mix = Utils.mix;
  _$jscoverage['/data-structure.js'].lineData[12]++;
  function checkGlobalIfNotExist(self, property) {
    _$jscoverage['/data-structure.js'].functionData[1]++;
    _$jscoverage['/data-structure.js'].lineData[13]++;
    return property in self ? self[property] : Config[property];
  }
  _$jscoverage['/data-structure.js'].lineData[23]++;
  function Package(cfg) {
    _$jscoverage['/data-structure.js'].functionData[2]++;
    _$jscoverage['/data-structure.js'].lineData[24]++;
    mix(this, cfg);
  }
  _$jscoverage['/data-structure.js'].lineData[27]++;
  Package.prototype = {
  constructor: Package, 
  reset: function(cfg) {
  _$jscoverage['/data-structure.js'].functionData[3]++;
  _$jscoverage['/data-structure.js'].lineData[31]++;
  mix(this, cfg);
}, 
  getTag: function() {
  _$jscoverage['/data-structure.js'].functionData[4]++;
  _$jscoverage['/data-structure.js'].lineData[40]++;
  return checkGlobalIfNotExist(this, 'tag');
}, 
  getName: function() {
  _$jscoverage['/data-structure.js'].functionData[5]++;
  _$jscoverage['/data-structure.js'].lineData[48]++;
  return this.name;
}, 
  getBase: function() {
  _$jscoverage['/data-structure.js'].functionData[6]++;
  _$jscoverage['/data-structure.js'].lineData[55]++;
  return this.base;
}, 
  isDebug: function() {
  _$jscoverage['/data-structure.js'].functionData[7]++;
  _$jscoverage['/data-structure.js'].lineData[63]++;
  return checkGlobalIfNotExist(this, 'debug');
}, 
  getCharset: function() {
  _$jscoverage['/data-structure.js'].functionData[8]++;
  _$jscoverage['/data-structure.js'].lineData[71]++;
  return checkGlobalIfNotExist(this, 'charset');
}, 
  isCombine: function() {
  _$jscoverage['/data-structure.js'].functionData[9]++;
  _$jscoverage['/data-structure.js'].lineData[79]++;
  return checkGlobalIfNotExist(this, 'combine');
}, 
  getGroup: function() {
  _$jscoverage['/data-structure.js'].functionData[10]++;
  _$jscoverage['/data-structure.js'].lineData[87]++;
  return checkGlobalIfNotExist(this, 'group');
}};
  _$jscoverage['/data-structure.js'].lineData[91]++;
  Loader.Package = Package;
  _$jscoverage['/data-structure.js'].lineData[98]++;
  function Module(cfg) {
    _$jscoverage['/data-structure.js'].functionData[11]++;
    _$jscoverage['/data-structure.js'].lineData[99]++;
    var self = this;
    _$jscoverage['/data-structure.js'].lineData[103]++;
    self.exports = {};
    _$jscoverage['/data-structure.js'].lineData[108]++;
    self.status = Loader.Status.INIT;
    _$jscoverage['/data-structure.js'].lineData[113]++;
    self.name = undefined;
    _$jscoverage['/data-structure.js'].lineData[118]++;
    self.factory = undefined;
    _$jscoverage['/data-structure.js'].lineData[121]++;
    self.cjs = 1;
    _$jscoverage['/data-structure.js'].lineData[122]++;
    mix(self, cfg);
    _$jscoverage['/data-structure.js'].lineData[123]++;
    self.waits = {};
  }
  _$jscoverage['/data-structure.js'].lineData[126]++;
  Module.prototype = {
  kissy: 1, 
  constructor: Module, 
  use: function(relativeName, fn) {
  _$jscoverage['/data-structure.js'].functionData[12]++;
  _$jscoverage['/data-structure.js'].lineData[138]++;
  relativeName = Utils.getModNamesAsArray(relativeName);
  _$jscoverage['/data-structure.js'].lineData[139]++;
  return KISSY.use(Utils.normalDepModuleName(this.name, relativeName), fn);
}, 
  resolve: function(relativeName) {
  _$jscoverage['/data-structure.js'].functionData[13]++;
  _$jscoverage['/data-structure.js'].lineData[144]++;
  return Utils.normalizePath(this.name, relativeName);
}, 
  require: function(moduleName) {
  _$jscoverage['/data-structure.js'].functionData[14]++;
  _$jscoverage['/data-structure.js'].lineData[153]++;
  return S.require(moduleName, this.name);
}, 
  add: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[15]++;
  _$jscoverage['/data-structure.js'].lineData[157]++;
  this.waits[loader.id] = loader;
}, 
  remove: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[16]++;
  _$jscoverage['/data-structure.js'].lineData[161]++;
  delete this.waits[loader.id];
}, 
  contains: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[17]++;
  _$jscoverage['/data-structure.js'].lineData[165]++;
  return this.waits[loader.id];
}, 
  flush: function() {
  _$jscoverage['/data-structure.js'].functionData[18]++;
  _$jscoverage['/data-structure.js'].lineData[169]++;
  Utils.each(this.waits, function(loader) {
  _$jscoverage['/data-structure.js'].functionData[19]++;
  _$jscoverage['/data-structure.js'].lineData[170]++;
  loader.flush();
});
  _$jscoverage['/data-structure.js'].lineData[172]++;
  this.waits = {};
}, 
  getType: function() {
  _$jscoverage['/data-structure.js'].functionData[20]++;
  _$jscoverage['/data-structure.js'].lineData[180]++;
  var self = this, v = self.type;
  _$jscoverage['/data-structure.js'].lineData[182]++;
  if (visit106_182_1(!v)) {
    _$jscoverage['/data-structure.js'].lineData[183]++;
    if (visit107_183_1(Utils.endsWith(self.name, '.css'))) {
      _$jscoverage['/data-structure.js'].lineData[184]++;
      v = 'css';
    } else {
      _$jscoverage['/data-structure.js'].lineData[186]++;
      v = 'js';
    }
    _$jscoverage['/data-structure.js'].lineData[188]++;
    self.type = v;
  }
  _$jscoverage['/data-structure.js'].lineData[190]++;
  return v;
}, 
  getAlias: function() {
  _$jscoverage['/data-structure.js'].functionData[21]++;
  _$jscoverage['/data-structure.js'].lineData[194]++;
  var self = this, name = self.name, aliasFn, packageInfo, alias = self.alias;
  _$jscoverage['/data-structure.js'].lineData[199]++;
  if (visit108_199_1(!('alias' in self))) {
    _$jscoverage['/data-structure.js'].lineData[200]++;
    packageInfo = self.getPackage();
    _$jscoverage['/data-structure.js'].lineData[201]++;
    if (visit109_201_1(packageInfo.alias)) {
      _$jscoverage['/data-structure.js'].lineData[202]++;
      alias = packageInfo.alias(name);
    }
    _$jscoverage['/data-structure.js'].lineData[204]++;
    if (visit110_204_1(!alias && (aliasFn = Config.alias))) {
      _$jscoverage['/data-structure.js'].lineData[205]++;
      alias = aliasFn(name);
    }
  }
  _$jscoverage['/data-structure.js'].lineData[208]++;
  return alias;
}, 
  getUrl: function() {
  _$jscoverage['/data-structure.js'].functionData[22]++;
  _$jscoverage['/data-structure.js'].lineData[216]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[217]++;
  if (visit111_217_1(!self.url)) {
    _$jscoverage['/data-structure.js'].lineData[218]++;
    self.url = S.Config.resolveModFn(self);
  }
  _$jscoverage['/data-structure.js'].lineData[220]++;
  return self.url;
}, 
  getName: function() {
  _$jscoverage['/data-structure.js'].functionData[23]++;
  _$jscoverage['/data-structure.js'].lineData[228]++;
  return this.name;
}, 
  getPackage: function() {
  _$jscoverage['/data-structure.js'].functionData[24]++;
  _$jscoverage['/data-structure.js'].lineData[236]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[237]++;
  if (visit112_237_1(!self.packageInfo)) {
    _$jscoverage['/data-structure.js'].lineData[238]++;
    var packages = visit113_238_1(Config.packages || {}), modNameSlash = self.name + '/', pName = '', p;
    _$jscoverage['/data-structure.js'].lineData[242]++;
    for (p in packages) {
      _$jscoverage['/data-structure.js'].lineData[243]++;
      if (visit114_243_1(Utils.startsWith(modNameSlash, p + '/') && visit115_243_2(p.length > pName.length))) {
        _$jscoverage['/data-structure.js'].lineData[244]++;
        pName = p;
      }
    }
    _$jscoverage['/data-structure.js'].lineData[247]++;
    self.packageInfo = visit116_247_1(packages[pName] || Config.corePackage);
  }
  _$jscoverage['/data-structure.js'].lineData[249]++;
  return self.packageInfo;
}, 
  getTag: function() {
  _$jscoverage['/data-structure.js'].functionData[25]++;
  _$jscoverage['/data-structure.js'].lineData[258]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[259]++;
  return visit117_259_1(self.tag || self.getPackage().getTag());
}, 
  getCharset: function() {
  _$jscoverage['/data-structure.js'].functionData[26]++;
  _$jscoverage['/data-structure.js'].lineData[267]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[268]++;
  return visit118_268_1(self.charset || self.getPackage().getCharset());
}, 
  getRequiresWithAlias: function() {
  _$jscoverage['/data-structure.js'].functionData[27]++;
  _$jscoverage['/data-structure.js'].lineData[276]++;
  var self = this, requiresWithAlias = self.requiresWithAlias, requires = self.requires;
  _$jscoverage['/data-structure.js'].lineData[279]++;
  if (visit119_279_1(!requires || visit120_279_2(requires.length === 0))) {
    _$jscoverage['/data-structure.js'].lineData[280]++;
    return visit121_280_1(requires || []);
  } else {
    _$jscoverage['/data-structure.js'].lineData[281]++;
    if (visit122_281_1(!requiresWithAlias)) {
      _$jscoverage['/data-structure.js'].lineData[282]++;
      self.requiresWithAlias = requiresWithAlias = Utils.normalizeModNamesWithAlias(requires, self.name);
    }
  }
  _$jscoverage['/data-structure.js'].lineData[285]++;
  return requiresWithAlias;
}, 
  getRequiredMods: function() {
  _$jscoverage['/data-structure.js'].functionData[28]++;
  _$jscoverage['/data-structure.js'].lineData[293]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[294]++;
  var mods = [];
  _$jscoverage['/data-structure.js'].lineData[295]++;
  Utils.each(self.getNormalizedRequires(), function(r, i) {
  _$jscoverage['/data-structure.js'].functionData[29]++;
  _$jscoverage['/data-structure.js'].lineData[296]++;
  mods[i] = Utils.createModuleInfo(r);
});
  _$jscoverage['/data-structure.js'].lineData[298]++;
  return mods;
}, 
  getNormalizedRequires: function() {
  _$jscoverage['/data-structure.js'].functionData[30]++;
  _$jscoverage['/data-structure.js'].lineData[306]++;
  var self = this, normalizedRequires, normalizedRequiresStatus = self.normalizedRequiresStatus, status = self.status, requires = self.requires;
  _$jscoverage['/data-structure.js'].lineData[311]++;
  if (visit123_311_1(!requires || visit124_311_2(requires.length === 0))) {
    _$jscoverage['/data-structure.js'].lineData[312]++;
    return visit125_312_1(requires || []);
  } else {
    _$jscoverage['/data-structure.js'].lineData[313]++;
    if (visit126_313_1((normalizedRequires = self.normalizedRequires) && (visit127_315_1(normalizedRequiresStatus === status)))) {
      _$jscoverage['/data-structure.js'].lineData[316]++;
      return normalizedRequires;
    } else {
      _$jscoverage['/data-structure.js'].lineData[318]++;
      self.normalizedRequiresStatus = status;
      _$jscoverage['/data-structure.js'].lineData[319]++;
      self.normalizedRequires = Utils.normalizeModNames(requires, self.name);
      _$jscoverage['/data-structure.js'].lineData[320]++;
      return self.normalizedRequires;
    }
  }
}};
  _$jscoverage['/data-structure.js'].lineData[325]++;
  Loader.Module = Module;
})(KISSY);
