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
  _$jscoverage['/data-structure.js'].lineData[125] = 0;
  _$jscoverage['/data-structure.js'].lineData[126] = 0;
  _$jscoverage['/data-structure.js'].lineData[130] = 0;
  _$jscoverage['/data-structure.js'].lineData[137] = 0;
  _$jscoverage['/data-structure.js'].lineData[141] = 0;
  _$jscoverage['/data-structure.js'].lineData[145] = 0;
  _$jscoverage['/data-structure.js'].lineData[149] = 0;
  _$jscoverage['/data-structure.js'].lineData[153] = 0;
  _$jscoverage['/data-structure.js'].lineData[154] = 0;
  _$jscoverage['/data-structure.js'].lineData[156] = 0;
  _$jscoverage['/data-structure.js'].lineData[164] = 0;
  _$jscoverage['/data-structure.js'].lineData[166] = 0;
  _$jscoverage['/data-structure.js'].lineData[167] = 0;
  _$jscoverage['/data-structure.js'].lineData[168] = 0;
  _$jscoverage['/data-structure.js'].lineData[170] = 0;
  _$jscoverage['/data-structure.js'].lineData[172] = 0;
  _$jscoverage['/data-structure.js'].lineData[174] = 0;
  _$jscoverage['/data-structure.js'].lineData[178] = 0;
  _$jscoverage['/data-structure.js'].lineData[182] = 0;
  _$jscoverage['/data-structure.js'].lineData[183] = 0;
  _$jscoverage['/data-structure.js'].lineData[185] = 0;
  _$jscoverage['/data-structure.js'].lineData[186] = 0;
  _$jscoverage['/data-structure.js'].lineData[187] = 0;
  _$jscoverage['/data-structure.js'].lineData[189] = 0;
  _$jscoverage['/data-structure.js'].lineData[190] = 0;
  _$jscoverage['/data-structure.js'].lineData[194] = 0;
  _$jscoverage['/data-structure.js'].lineData[195] = 0;
  _$jscoverage['/data-structure.js'].lineData[196] = 0;
  _$jscoverage['/data-structure.js'].lineData[198] = 0;
  _$jscoverage['/data-structure.js'].lineData[199] = 0;
  _$jscoverage['/data-structure.js'].lineData[200] = 0;
  _$jscoverage['/data-structure.js'].lineData[202] = 0;
  _$jscoverage['/data-structure.js'].lineData[203] = 0;
  _$jscoverage['/data-structure.js'].lineData[204] = 0;
  _$jscoverage['/data-structure.js'].lineData[205] = 0;
  _$jscoverage['/data-structure.js'].lineData[206] = 0;
  _$jscoverage['/data-structure.js'].lineData[207] = 0;
  _$jscoverage['/data-structure.js'].lineData[208] = 0;
  _$jscoverage['/data-structure.js'].lineData[210] = 0;
  _$jscoverage['/data-structure.js'].lineData[214] = 0;
  _$jscoverage['/data-structure.js'].lineData[215] = 0;
  _$jscoverage['/data-structure.js'].lineData[217] = 0;
  _$jscoverage['/data-structure.js'].lineData[218] = 0;
  _$jscoverage['/data-structure.js'].lineData[226] = 0;
  _$jscoverage['/data-structure.js'].lineData[227] = 0;
  _$jscoverage['/data-structure.js'].lineData[228] = 0;
  _$jscoverage['/data-structure.js'].lineData[230] = 0;
  _$jscoverage['/data-structure.js'].lineData[238] = 0;
  _$jscoverage['/data-structure.js'].lineData[246] = 0;
  _$jscoverage['/data-structure.js'].lineData[247] = 0;
  _$jscoverage['/data-structure.js'].lineData[248] = 0;
  _$jscoverage['/data-structure.js'].lineData[252] = 0;
  _$jscoverage['/data-structure.js'].lineData[253] = 0;
  _$jscoverage['/data-structure.js'].lineData[254] = 0;
  _$jscoverage['/data-structure.js'].lineData[257] = 0;
  _$jscoverage['/data-structure.js'].lineData[259] = 0;
  _$jscoverage['/data-structure.js'].lineData[268] = 0;
  _$jscoverage['/data-structure.js'].lineData[269] = 0;
  _$jscoverage['/data-structure.js'].lineData[277] = 0;
  _$jscoverage['/data-structure.js'].lineData[278] = 0;
  _$jscoverage['/data-structure.js'].lineData[286] = 0;
  _$jscoverage['/data-structure.js'].lineData[289] = 0;
  _$jscoverage['/data-structure.js'].lineData[290] = 0;
  _$jscoverage['/data-structure.js'].lineData[291] = 0;
  _$jscoverage['/data-structure.js'].lineData[292] = 0;
  _$jscoverage['/data-structure.js'].lineData[295] = 0;
  _$jscoverage['/data-structure.js'].lineData[303] = 0;
  _$jscoverage['/data-structure.js'].lineData[311] = 0;
  _$jscoverage['/data-structure.js'].lineData[316] = 0;
  _$jscoverage['/data-structure.js'].lineData[317] = 0;
  _$jscoverage['/data-structure.js'].lineData[318] = 0;
  _$jscoverage['/data-structure.js'].lineData[321] = 0;
  _$jscoverage['/data-structure.js'].lineData[323] = 0;
  _$jscoverage['/data-structure.js'].lineData[324] = 0;
  _$jscoverage['/data-structure.js'].lineData[325] = 0;
  _$jscoverage['/data-structure.js'].lineData[330] = 0;
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
}
if (! _$jscoverage['/data-structure.js'].branchData) {
  _$jscoverage['/data-structure.js'].branchData = {};
  _$jscoverage['/data-structure.js'].branchData['166'] = [];
  _$jscoverage['/data-structure.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['167'] = [];
  _$jscoverage['/data-structure.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['182'] = [];
  _$jscoverage['/data-structure.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['186'] = [];
  _$jscoverage['/data-structure.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['189'] = [];
  _$jscoverage['/data-structure.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['195'] = [];
  _$jscoverage['/data-structure.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['199'] = [];
  _$jscoverage['/data-structure.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['203'] = [];
  _$jscoverage['/data-structure.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['204'] = [];
  _$jscoverage['/data-structure.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['207'] = [];
  _$jscoverage['/data-structure.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['214'] = [];
  _$jscoverage['/data-structure.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['227'] = [];
  _$jscoverage['/data-structure.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['247'] = [];
  _$jscoverage['/data-structure.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['248'] = [];
  _$jscoverage['/data-structure.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['253'] = [];
  _$jscoverage['/data-structure.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['253'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['257'] = [];
  _$jscoverage['/data-structure.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['269'] = [];
  _$jscoverage['/data-structure.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['278'] = [];
  _$jscoverage['/data-structure.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['289'] = [];
  _$jscoverage['/data-structure.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['289'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['290'] = [];
  _$jscoverage['/data-structure.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['291'] = [];
  _$jscoverage['/data-structure.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['316'] = [];
  _$jscoverage['/data-structure.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['316'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['317'] = [];
  _$jscoverage['/data-structure.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['318'] = [];
  _$jscoverage['/data-structure.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['320'] = [];
  _$jscoverage['/data-structure.js'].branchData['320'][1] = new BranchData();
}
_$jscoverage['/data-structure.js'].branchData['320'][1].init(114, 35, 'normalizedRequiresStatus === status');
function visit139_320_1(result) {
  _$jscoverage['/data-structure.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['318'][1].init(346, 151, '(normalizedRequires = self.normalizedRequires) && (normalizedRequiresStatus === status)');
function visit138_318_1(result) {
  _$jscoverage['/data-structure.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['317'][1].init(25, 14, 'requires || []');
function visit137_317_1(result) {
  _$jscoverage['/data-structure.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['316'][2].init(255, 21, 'requires.length === 0');
function visit136_316_2(result) {
  _$jscoverage['/data-structure.js'].branchData['316'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['316'][1].init(242, 34, '!requires || requires.length === 0');
function visit135_316_1(result) {
  _$jscoverage['/data-structure.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['291'][1].init(255, 18, '!requiresWithAlias');
function visit134_291_1(result) {
  _$jscoverage['/data-structure.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['290'][1].init(25, 14, 'requires || []');
function visit133_290_1(result) {
  _$jscoverage['/data-structure.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['289'][2].init(165, 21, 'requires.length === 0');
function visit132_289_2(result) {
  _$jscoverage['/data-structure.js'].branchData['289'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['289'][1].init(152, 34, '!requires || requires.length === 0');
function visit131_289_1(result) {
  _$jscoverage['/data-structure.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['278'][1].init(51, 46, 'self.charset || self.getPackage().getCharset()');
function visit130_278_1(result) {
  _$jscoverage['/data-structure.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['269'][1].init(51, 38, 'self.tag || self.getPackage().getTag()');
function visit129_269_1(result) {
  _$jscoverage['/data-structure.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['257'][1].init(414, 37, 'packages[pName] || Config.corePackage');
function visit128_257_1(result) {
  _$jscoverage['/data-structure.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['253'][2].init(69, 23, 'p.length > pName.length');
function visit127_253_2(result) {
  _$jscoverage['/data-structure.js'].branchData['253'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['253'][1].init(26, 66, 'Utils.startsWith(modNameSlash, p + \'/\') && p.length > pName.length');
function visit126_253_1(result) {
  _$jscoverage['/data-structure.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['248'][1].init(33, 21, 'Config.packages || {}');
function visit125_248_1(result) {
  _$jscoverage['/data-structure.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['247'][1].init(48, 17, '!self.packageInfo');
function visit124_247_1(result) {
  _$jscoverage['/data-structure.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['227'][1].init(48, 9, '!self.url');
function visit123_227_1(result) {
  _$jscoverage['/data-structure.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['214'][1].init(769, 11, '!ret.length');
function visit122_214_1(result) {
  _$jscoverage['/data-structure.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['207'][1].init(156, 11, 'normalAlias');
function visit121_207_1(result) {
  _$jscoverage['/data-structure.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['204'][1].init(22, 8, 'alias[i]');
function visit120_204_1(result) {
  _$jscoverage['/data-structure.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['203'][1].init(344, 5, 'i < l');
function visit119_203_1(result) {
  _$jscoverage['/data-structure.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['199'][1].init(192, 25, 'typeof alias === \'string\'');
function visit118_199_1(result) {
  _$jscoverage['/data-structure.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['195'][1].init(48, 20, 'self.normalizedAlias');
function visit117_195_1(result) {
  _$jscoverage['/data-structure.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['189'][1].init(388, 11, 'alias || []');
function visit116_189_1(result) {
  _$jscoverage['/data-structure.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['186'][1].init(268, 17, 'packageInfo.alias');
function visit115_186_1(result) {
  _$jscoverage['/data-structure.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['182'][1].init(150, 5, 'alias');
function visit114_182_1(result) {
  _$jscoverage['/data-structure.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['167'][1].init(22, 33, 'Utils.endsWith(self.name, \'.css\')');
function visit113_167_1(result) {
  _$jscoverage['/data-structure.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['166'][1].init(80, 2, '!v');
function visit112_166_1(result) {
  _$jscoverage['/data-structure.js'].branchData['166'][1].ranCondition(result);
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
    _$jscoverage['/data-structure.js'].lineData[125]++;
    self.require = function(moduleName) {
  _$jscoverage['/data-structure.js'].functionData[12]++;
  _$jscoverage['/data-structure.js'].lineData[126]++;
  return S.require(moduleName, self.name);
};
  }
  _$jscoverage['/data-structure.js'].lineData[130]++;
  Module.prototype = {
  kissy: 1, 
  constructor: Module, 
  resolve: function(relativeName) {
  _$jscoverage['/data-structure.js'].functionData[13]++;
  _$jscoverage['/data-structure.js'].lineData[137]++;
  return Utils.normalizePath(this.name, relativeName);
}, 
  add: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[14]++;
  _$jscoverage['/data-structure.js'].lineData[141]++;
  this.waits[loader.id] = loader;
}, 
  remove: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[15]++;
  _$jscoverage['/data-structure.js'].lineData[145]++;
  delete this.waits[loader.id];
}, 
  contains: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[16]++;
  _$jscoverage['/data-structure.js'].lineData[149]++;
  return this.waits[loader.id];
}, 
  flush: function() {
  _$jscoverage['/data-structure.js'].functionData[17]++;
  _$jscoverage['/data-structure.js'].lineData[153]++;
  Utils.each(this.waits, function(loader) {
  _$jscoverage['/data-structure.js'].functionData[18]++;
  _$jscoverage['/data-structure.js'].lineData[154]++;
  loader.flush();
});
  _$jscoverage['/data-structure.js'].lineData[156]++;
  this.waits = {};
}, 
  getType: function() {
  _$jscoverage['/data-structure.js'].functionData[19]++;
  _$jscoverage['/data-structure.js'].lineData[164]++;
  var self = this, v = self.type;
  _$jscoverage['/data-structure.js'].lineData[166]++;
  if (visit112_166_1(!v)) {
    _$jscoverage['/data-structure.js'].lineData[167]++;
    if (visit113_167_1(Utils.endsWith(self.name, '.css'))) {
      _$jscoverage['/data-structure.js'].lineData[168]++;
      v = 'css';
    } else {
      _$jscoverage['/data-structure.js'].lineData[170]++;
      v = 'js';
    }
    _$jscoverage['/data-structure.js'].lineData[172]++;
    self.type = v;
  }
  _$jscoverage['/data-structure.js'].lineData[174]++;
  return v;
}, 
  getAlias: function() {
  _$jscoverage['/data-structure.js'].functionData[20]++;
  _$jscoverage['/data-structure.js'].lineData[178]++;
  var self = this, name = self.name, packageInfo, alias = self.alias;
  _$jscoverage['/data-structure.js'].lineData[182]++;
  if (visit114_182_1(alias)) {
    _$jscoverage['/data-structure.js'].lineData[183]++;
    return alias;
  }
  _$jscoverage['/data-structure.js'].lineData[185]++;
  packageInfo = self.getPackage();
  _$jscoverage['/data-structure.js'].lineData[186]++;
  if (visit115_186_1(packageInfo.alias)) {
    _$jscoverage['/data-structure.js'].lineData[187]++;
    alias = packageInfo.alias(name);
  }
  _$jscoverage['/data-structure.js'].lineData[189]++;
  alias = self.alias = visit116_189_1(alias || []);
  _$jscoverage['/data-structure.js'].lineData[190]++;
  return alias;
}, 
  getNormalizedAlias: function() {
  _$jscoverage['/data-structure.js'].functionData[21]++;
  _$jscoverage['/data-structure.js'].lineData[194]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[195]++;
  if (visit117_195_1(self.normalizedAlias)) {
    _$jscoverage['/data-structure.js'].lineData[196]++;
    return self.normalizedAlias;
  }
  _$jscoverage['/data-structure.js'].lineData[198]++;
  var alias = self.getAlias();
  _$jscoverage['/data-structure.js'].lineData[199]++;
  if (visit118_199_1(typeof alias === 'string')) {
    _$jscoverage['/data-structure.js'].lineData[200]++;
    alias = [alias];
  }
  _$jscoverage['/data-structure.js'].lineData[202]++;
  var ret = [];
  _$jscoverage['/data-structure.js'].lineData[203]++;
  for (var i = 0, l = alias.length; visit119_203_1(i < l); i++) {
    _$jscoverage['/data-structure.js'].lineData[204]++;
    if (visit120_204_1(alias[i])) {
      _$jscoverage['/data-structure.js'].lineData[205]++;
      var mod = Utils.createModuleInfo(alias[i]);
      _$jscoverage['/data-structure.js'].lineData[206]++;
      var normalAlias = mod.getNormalizedAlias();
      _$jscoverage['/data-structure.js'].lineData[207]++;
      if (visit121_207_1(normalAlias)) {
        _$jscoverage['/data-structure.js'].lineData[208]++;
        ret.push.apply(ret, normalAlias);
      } else {
        _$jscoverage['/data-structure.js'].lineData[210]++;
        ret.push(alias[i]);
      }
    }
  }
  _$jscoverage['/data-structure.js'].lineData[214]++;
  if (visit122_214_1(!ret.length)) {
    _$jscoverage['/data-structure.js'].lineData[215]++;
    ret.push(self.name);
  }
  _$jscoverage['/data-structure.js'].lineData[217]++;
  self.normalizedAlias = ret;
  _$jscoverage['/data-structure.js'].lineData[218]++;
  return ret;
}, 
  getUrl: function() {
  _$jscoverage['/data-structure.js'].functionData[22]++;
  _$jscoverage['/data-structure.js'].lineData[226]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[227]++;
  if (visit123_227_1(!self.url)) {
    _$jscoverage['/data-structure.js'].lineData[228]++;
    self.url = S.Config.resolveModFn(self);
  }
  _$jscoverage['/data-structure.js'].lineData[230]++;
  return self.url;
}, 
  getName: function() {
  _$jscoverage['/data-structure.js'].functionData[23]++;
  _$jscoverage['/data-structure.js'].lineData[238]++;
  return this.name;
}, 
  getPackage: function() {
  _$jscoverage['/data-structure.js'].functionData[24]++;
  _$jscoverage['/data-structure.js'].lineData[246]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[247]++;
  if (visit124_247_1(!self.packageInfo)) {
    _$jscoverage['/data-structure.js'].lineData[248]++;
    var packages = visit125_248_1(Config.packages || {}), modNameSlash = self.name + '/', pName = '', p;
    _$jscoverage['/data-structure.js'].lineData[252]++;
    for (p in packages) {
      _$jscoverage['/data-structure.js'].lineData[253]++;
      if (visit126_253_1(Utils.startsWith(modNameSlash, p + '/') && visit127_253_2(p.length > pName.length))) {
        _$jscoverage['/data-structure.js'].lineData[254]++;
        pName = p;
      }
    }
    _$jscoverage['/data-structure.js'].lineData[257]++;
    self.packageInfo = visit128_257_1(packages[pName] || Config.corePackage);
  }
  _$jscoverage['/data-structure.js'].lineData[259]++;
  return self.packageInfo;
}, 
  getTag: function() {
  _$jscoverage['/data-structure.js'].functionData[25]++;
  _$jscoverage['/data-structure.js'].lineData[268]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[269]++;
  return visit129_269_1(self.tag || self.getPackage().getTag());
}, 
  getCharset: function() {
  _$jscoverage['/data-structure.js'].functionData[26]++;
  _$jscoverage['/data-structure.js'].lineData[277]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[278]++;
  return visit130_278_1(self.charset || self.getPackage().getCharset());
}, 
  getRequiresWithAlias: function() {
  _$jscoverage['/data-structure.js'].functionData[27]++;
  _$jscoverage['/data-structure.js'].lineData[286]++;
  var self = this, requiresWithAlias = self.requiresWithAlias, requires = self.requires;
  _$jscoverage['/data-structure.js'].lineData[289]++;
  if (visit131_289_1(!requires || visit132_289_2(requires.length === 0))) {
    _$jscoverage['/data-structure.js'].lineData[290]++;
    return visit133_290_1(requires || []);
  } else {
    _$jscoverage['/data-structure.js'].lineData[291]++;
    if (visit134_291_1(!requiresWithAlias)) {
      _$jscoverage['/data-structure.js'].lineData[292]++;
      self.requiresWithAlias = requiresWithAlias = Utils.normalizeModNamesWithAlias(requires, self.name);
    }
  }
  _$jscoverage['/data-structure.js'].lineData[295]++;
  return requiresWithAlias;
}, 
  getRequiredMods: function() {
  _$jscoverage['/data-structure.js'].functionData[28]++;
  _$jscoverage['/data-structure.js'].lineData[303]++;
  return Utils.createModulesInfo(this.getNormalizedRequires());
}, 
  getNormalizedRequires: function() {
  _$jscoverage['/data-structure.js'].functionData[29]++;
  _$jscoverage['/data-structure.js'].lineData[311]++;
  var self = this, normalizedRequires, normalizedRequiresStatus = self.normalizedRequiresStatus, status = self.status, requires = self.requires;
  _$jscoverage['/data-structure.js'].lineData[316]++;
  if (visit135_316_1(!requires || visit136_316_2(requires.length === 0))) {
    _$jscoverage['/data-structure.js'].lineData[317]++;
    return visit137_317_1(requires || []);
  } else {
    _$jscoverage['/data-structure.js'].lineData[318]++;
    if (visit138_318_1((normalizedRequires = self.normalizedRequires) && (visit139_320_1(normalizedRequiresStatus === status)))) {
      _$jscoverage['/data-structure.js'].lineData[321]++;
      return normalizedRequires;
    } else {
      _$jscoverage['/data-structure.js'].lineData[323]++;
      self.normalizedRequiresStatus = status;
      _$jscoverage['/data-structure.js'].lineData[324]++;
      self.normalizedRequires = Utils.normalizeModNames(requires, self.name);
      _$jscoverage['/data-structure.js'].lineData[325]++;
      return self.normalizedRequires;
    }
  }
}};
  _$jscoverage['/data-structure.js'].lineData[330]++;
  Loader.Module = Module;
})(KISSY);
