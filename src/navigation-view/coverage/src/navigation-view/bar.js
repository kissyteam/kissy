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
if (! _$jscoverage['/navigation-view/bar.js']) {
  _$jscoverage['/navigation-view/bar.js'] = {};
  _$jscoverage['/navigation-view/bar.js'].lineData = [];
  _$jscoverage['/navigation-view/bar.js'].lineData[5] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[6] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[7] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[8] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[10] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[11] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[13] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[14] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[16] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[18] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[20] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[21] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[22] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[27] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[30] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[31] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[39] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[40] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[50] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[51] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[52] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[55] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[56] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[60] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[78] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[79] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[80] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[83] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[84] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[86] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[87] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[90] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[93] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[95] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[96] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[99] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[102] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[104] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[122] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[128] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[129] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[132] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[134] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[138] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[140] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[141] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[142] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[153] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[154] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[159] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[161] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[162] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[163] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[164] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[165] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[166] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[167] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[169] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[171] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[172] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[176] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[177] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[181] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[182] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[186] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[190] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[194] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[195] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[197] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[198] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[199] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[201] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[202] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[204] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[207] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[208] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[209] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[210] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[212] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[215] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[216] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[217] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[218] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[219] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[220] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[222] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[223] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[224] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[225] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[227] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[228] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[229] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[230] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[233] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[234] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[237] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[238] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[239] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[240] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[241] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[242] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[243] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[244] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[245] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[246] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[247] = 0;
  _$jscoverage['/navigation-view/bar.js'].lineData[252] = 0;
}
if (! _$jscoverage['/navigation-view/bar.js'].functionData) {
  _$jscoverage['/navigation-view/bar.js'].functionData = [];
  _$jscoverage['/navigation-view/bar.js'].functionData[0] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[1] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[2] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[3] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[4] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[5] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[6] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[7] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[8] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[9] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[10] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[11] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[12] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[13] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[14] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[15] = 0;
  _$jscoverage['/navigation-view/bar.js'].functionData[16] = 0;
}
if (! _$jscoverage['/navigation-view/bar.js'].branchData) {
  _$jscoverage['/navigation-view/bar.js'].branchData = {};
  _$jscoverage['/navigation-view/bar.js'].branchData['50'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['79'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['83'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['86'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['95'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['141'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['153'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['162'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['163'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['164'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['166'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['197'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['197'][2] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['198'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['201'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['209'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['219'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['224'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/navigation-view/bar.js'].branchData['227'] = [];
  _$jscoverage['/navigation-view/bar.js'].branchData['227'][1] = new BranchData();
}
_$jscoverage['/navigation-view/bar.js'].branchData['227'][1].init(1207, 37, 'ghostBackEl.css(\'display\') !== \'none\'');
function visit24_227_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['224'][1].init(1095, 22, 'backBtn.get(\'visible\')');
function visit23_224_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['219'][1].init(872, 16, 'self.ghostBackEl');
function visit22_219_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['209'][1].init(488, 16, 'self.ghostBackEl');
function visit21_209_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['201'][1].init(135, 7, 'backBtn');
function visit20_201_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['198'][1].init(22, 15, 'self._withTitle');
function visit19_198_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['197'][2].init(94, 26, 'backBtn && self._withTitle');
function visit18_197_2(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['197'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['197'][1].init(92, 29, '!(backBtn && self._withTitle)');
function visit17_197_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['166'][1].init(200, 17, 'align === \'right\'');
function visit16_166_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['164'][1].init(90, 16, 'align === \'left\'');
function visit15_164_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['163'][1].init(45, 22, 'config.align || \'left\'');
function visit14_163_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['162'][1].init(163, 34, '!config.elBefore && !config.render');
function visit13_162_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['153'][1].init(18, 13, 'this._backBtn');
function visit12_153_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['141'][1].init(133, 26, 'self.get(\'withBackButton\')');
function visit11_141_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['95'][1].init(77, 19, 'omega !== undefined');
function visit10_95_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['86'][1].init(77, 19, 'omega !== undefined');
function visit9_86_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['83'][1].init(1468, 7, 'reverse');
function visit8_83_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['79'][1].init(1376, 19, 'titleWidth > titleX');
function visit7_79_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].branchData['50'][1].init(533, 7, 'reverse');
function visit6_50_1(result) {
  _$jscoverage['/navigation-view/bar.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/bar.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/navigation-view/bar.js'].functionData[0]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[6]++;
  var Control = require('component/control');
  _$jscoverage['/navigation-view/bar.js'].lineData[7]++;
  var BarRender = require('./bar-render');
  _$jscoverage['/navigation-view/bar.js'].lineData[8]++;
  var Button = require('button');
  _$jscoverage['/navigation-view/bar.js'].lineData[10]++;
  function createGhost(elem) {
    _$jscoverage['/navigation-view/bar.js'].functionData[1]++;
    _$jscoverage['/navigation-view/bar.js'].lineData[11]++;
    var ghost, width;
    _$jscoverage['/navigation-view/bar.js'].lineData[13]++;
    ghost = elem.clone(true);
    _$jscoverage['/navigation-view/bar.js'].lineData[14]++;
    ghost[0].id = elem[0].id + '-proxy';
    _$jscoverage['/navigation-view/bar.js'].lineData[16]++;
    elem.parent().append(ghost);
    _$jscoverage['/navigation-view/bar.js'].lineData[18]++;
    var offset = elem.offset();
    _$jscoverage['/navigation-view/bar.js'].lineData[20]++;
    ghost.css('position', 'absolute');
    _$jscoverage['/navigation-view/bar.js'].lineData[21]++;
    ghost.offset(offset);
    _$jscoverage['/navigation-view/bar.js'].lineData[22]++;
    ghost.css({
  width: width = elem.css('width'), 
  height: elem.css('height')});
    _$jscoverage['/navigation-view/bar.js'].lineData[27]++;
    return ghost;
  }
  _$jscoverage['/navigation-view/bar.js'].lineData[30]++;
  function anim(el, props, complete) {
    _$jscoverage['/navigation-view/bar.js'].functionData[2]++;
    _$jscoverage['/navigation-view/bar.js'].lineData[31]++;
    el.animate(props, {
  duration: 0.25, 
  useTransition: true, 
  easing: 'ease-in-out', 
  complete: complete});
  }
  _$jscoverage['/navigation-view/bar.js'].lineData[39]++;
  function getAnimProps(self, backEl, backElProps, reverse) {
    _$jscoverage['/navigation-view/bar.js'].functionData[3]++;
    _$jscoverage['/navigation-view/bar.js'].lineData[40]++;
    var barElement = self.get('el'), titleElement = self.get('titleEl'), minOffset = Math.min(barElement[0].offsetWidth / 3, 200), newLeftWidth = backEl[0].offsetWidth, barWidth = barElement[0].offsetWidth, titleX = titleElement.offset().left - barElement.offset().left, titleWidth = titleElement[0].offsetWidth, oldBackWidth = backElProps.width, newOffset, oldOffset, backElAnims, titleAnims, omega, theta;
    _$jscoverage['/navigation-view/bar.js'].lineData[50]++;
    if (visit6_50_1(reverse)) {
      _$jscoverage['/navigation-view/bar.js'].lineData[51]++;
      newOffset = -oldBackWidth;
      _$jscoverage['/navigation-view/bar.js'].lineData[52]++;
      oldOffset = Math.min(titleX - oldBackWidth, minOffset);
    } else {
      _$jscoverage['/navigation-view/bar.js'].lineData[55]++;
      oldOffset = -oldBackWidth;
      _$jscoverage['/navigation-view/bar.js'].lineData[56]++;
      newOffset = Math.min(titleX, minOffset);
    }
    _$jscoverage['/navigation-view/bar.js'].lineData[60]++;
    backElAnims = {
  element: {
  from: {
  transform: 'translateX(' + newOffset + 'px) translateZ(0)'}, 
  to: {
  transform: 'translateX(0) translateZ(0)', 
  opacity: 1}}, 
  ghost: {
  to: {
  transform: 'translateX(' + oldOffset + 'px) translateZ(0)', 
  opacity: 0}}};
    _$jscoverage['/navigation-view/bar.js'].lineData[78]++;
    theta = -titleX + newLeftWidth;
    _$jscoverage['/navigation-view/bar.js'].lineData[79]++;
    if (visit7_79_1(titleWidth > titleX)) {
      _$jscoverage['/navigation-view/bar.js'].lineData[80]++;
      omega = -titleX - titleWidth;
    }
    _$jscoverage['/navigation-view/bar.js'].lineData[83]++;
    if (visit8_83_1(reverse)) {
      _$jscoverage['/navigation-view/bar.js'].lineData[84]++;
      oldOffset = barWidth - titleX - titleWidth;
      _$jscoverage['/navigation-view/bar.js'].lineData[86]++;
      if (visit9_86_1(omega !== undefined)) {
        _$jscoverage['/navigation-view/bar.js'].lineData[87]++;
        newOffset = omega;
      } else {
        _$jscoverage['/navigation-view/bar.js'].lineData[90]++;
        newOffset = theta;
      }
    } else {
      _$jscoverage['/navigation-view/bar.js'].lineData[93]++;
      newOffset = barWidth - titleX - titleWidth;
      _$jscoverage['/navigation-view/bar.js'].lineData[95]++;
      if (visit10_95_1(omega !== undefined)) {
        _$jscoverage['/navigation-view/bar.js'].lineData[96]++;
        oldOffset = omega;
      } else {
        _$jscoverage['/navigation-view/bar.js'].lineData[99]++;
        oldOffset = theta;
      }
      _$jscoverage['/navigation-view/bar.js'].lineData[102]++;
      newOffset = Math.max(0, newOffset);
    }
    _$jscoverage['/navigation-view/bar.js'].lineData[104]++;
    titleAnims = {
  element: {
  from: {
  transform: 'translateX(' + newOffset + 'px) translateZ(0)'}, 
  to: {
  transform: 'translateX(0) translateZ(0)', 
  opacity: 1}}, 
  ghost: {
  to: {
  transform: 'translateX(' + oldOffset + 'px) translateZ(0)', 
  opacity: 0}}};
    _$jscoverage['/navigation-view/bar.js'].lineData[122]++;
    return {
  back: backElAnims, 
  title: titleAnims};
  }
  _$jscoverage['/navigation-view/bar.js'].lineData[128]++;
  function onBackButtonClick() {
    _$jscoverage['/navigation-view/bar.js'].functionData[4]++;
    _$jscoverage['/navigation-view/bar.js'].lineData[129]++;
    this.fire('back');
  }
  _$jscoverage['/navigation-view/bar.js'].lineData[132]++;
  return Control.extend({
  initializer: function() {
  _$jscoverage['/navigation-view/bar.js'].functionData[5]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[134]++;
  this._withTitle = this.get('withTitle');
}, 
  renderUI: function() {
  _$jscoverage['/navigation-view/bar.js'].functionData[6]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[138]++;
  var self = this, prefixCls = self.get('prefixCls');
  _$jscoverage['/navigation-view/bar.js'].lineData[140]++;
  self._buttons = {};
  _$jscoverage['/navigation-view/bar.js'].lineData[141]++;
  if (visit11_141_1(self.get('withBackButton'))) {
    _$jscoverage['/navigation-view/bar.js'].lineData[142]++;
    self._backBtn = new Button({
  prefixCls: prefixCls + 'navigation-bar-', 
  elCls: prefixCls + 'navigation-bar-back', 
  elBefore: self.get('contentEl')[0].firstChild, 
  visible: false, 
  content: self.get('backText')}).render();
  }
}, 
  bindUI: function() {
  _$jscoverage['/navigation-view/bar.js'].functionData[7]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[153]++;
  if (visit12_153_1(this._backBtn)) {
    _$jscoverage['/navigation-view/bar.js'].lineData[154]++;
    this._backBtn.on('click', onBackButtonClick, this);
  }
}, 
  addButton: function(name, config) {
  _$jscoverage['/navigation-view/bar.js'].functionData[8]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[159]++;
  var self = this, prefixCls = self.get('prefixCls');
  _$jscoverage['/navigation-view/bar.js'].lineData[161]++;
  config.prefixCls = prefixCls + 'navigation-bar-';
  _$jscoverage['/navigation-view/bar.js'].lineData[162]++;
  if (visit13_162_1(!config.elBefore && !config.render)) {
    _$jscoverage['/navigation-view/bar.js'].lineData[163]++;
    var align = config.align = visit14_163_1(config.align || 'left');
    _$jscoverage['/navigation-view/bar.js'].lineData[164]++;
    if (visit15_164_1(align === 'left')) {
      _$jscoverage['/navigation-view/bar.js'].lineData[165]++;
      config.elBefore = self.get('centerEl');
    } else {
      _$jscoverage['/navigation-view/bar.js'].lineData[166]++;
      if (visit16_166_1(align === 'right')) {
        _$jscoverage['/navigation-view/bar.js'].lineData[167]++;
        config.render = self.get('contentEl');
      }
    }
    _$jscoverage['/navigation-view/bar.js'].lineData[169]++;
    delete config.align;
  }
  _$jscoverage['/navigation-view/bar.js'].lineData[171]++;
  self._buttons[name] = new Button(config).render();
  _$jscoverage['/navigation-view/bar.js'].lineData[172]++;
  return self._buttons[name];
}, 
  insertButtonBefore: function(name, config, button) {
  _$jscoverage['/navigation-view/bar.js'].functionData[9]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[176]++;
  config.elBefore = button.get('el');
  _$jscoverage['/navigation-view/bar.js'].lineData[177]++;
  return this.addButton(name, config);
}, 
  removeButton: function(name) {
  _$jscoverage['/navigation-view/bar.js'].functionData[10]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[181]++;
  this._buttons[name].destroy();
  _$jscoverage['/navigation-view/bar.js'].lineData[182]++;
  delete this._buttons[name];
}, 
  getButton: function(name) {
  _$jscoverage['/navigation-view/bar.js'].functionData[11]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[186]++;
  return this._buttons[name];
}, 
  forward: function(title) {
  _$jscoverage['/navigation-view/bar.js'].functionData[12]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[190]++;
  this.go(title, true);
}, 
  go: function(title, hasPrevious, reverse) {
  _$jscoverage['/navigation-view/bar.js'].functionData[13]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[194]++;
  var self = this;
  _$jscoverage['/navigation-view/bar.js'].lineData[195]++;
  var backBtn = self._backBtn;
  _$jscoverage['/navigation-view/bar.js'].lineData[197]++;
  if (visit17_197_1(!(visit18_197_2(backBtn && self._withTitle)))) {
    _$jscoverage['/navigation-view/bar.js'].lineData[198]++;
    if (visit19_198_1(self._withTitle)) {
      _$jscoverage['/navigation-view/bar.js'].lineData[199]++;
      self.get('titleEl').html(title);
    }
    _$jscoverage['/navigation-view/bar.js'].lineData[201]++;
    if (visit20_201_1(backBtn)) {
      _$jscoverage['/navigation-view/bar.js'].lineData[202]++;
      backBtn[hasPrevious ? 'show' : 'hide']();
    }
    _$jscoverage['/navigation-view/bar.js'].lineData[204]++;
    return;
  }
  _$jscoverage['/navigation-view/bar.js'].lineData[207]++;
  var backEl = backBtn.get('el');
  _$jscoverage['/navigation-view/bar.js'].lineData[208]++;
  backEl.stop(true);
  _$jscoverage['/navigation-view/bar.js'].lineData[209]++;
  if (visit21_209_1(self.ghostBackEl)) {
    _$jscoverage['/navigation-view/bar.js'].lineData[210]++;
    self.ghostBackEl.stop(true);
  }
  _$jscoverage['/navigation-view/bar.js'].lineData[212]++;
  var backElProps = {
  width: backEl[0].offsetWidth};
  _$jscoverage['/navigation-view/bar.js'].lineData[215]++;
  var ghostBackEl = createGhost(backEl);
  _$jscoverage['/navigation-view/bar.js'].lineData[216]++;
  self.ghostBackEl = ghostBackEl;
  _$jscoverage['/navigation-view/bar.js'].lineData[217]++;
  backEl.css('opacity', 0);
  _$jscoverage['/navigation-view/bar.js'].lineData[218]++;
  backBtn[hasPrevious ? 'show' : 'hide']();
  _$jscoverage['/navigation-view/bar.js'].lineData[219]++;
  if (visit22_219_1(self.ghostBackEl)) {
    _$jscoverage['/navigation-view/bar.js'].lineData[220]++;
    self.ghostBackEl.stop(true);
  }
  _$jscoverage['/navigation-view/bar.js'].lineData[222]++;
  var anims = getAnimProps(self, backEl, backElProps, reverse);
  _$jscoverage['/navigation-view/bar.js'].lineData[223]++;
  backEl.css(anims.back.element.from);
  _$jscoverage['/navigation-view/bar.js'].lineData[224]++;
  if (visit23_224_1(backBtn.get('visible'))) {
    _$jscoverage['/navigation-view/bar.js'].lineData[225]++;
    anim(backEl, anims.back.element.to);
  }
  _$jscoverage['/navigation-view/bar.js'].lineData[227]++;
  if (visit24_227_1(ghostBackEl.css('display') !== 'none')) {
    _$jscoverage['/navigation-view/bar.js'].lineData[228]++;
    anim(ghostBackEl, anims.back.ghost.to, function() {
  _$jscoverage['/navigation-view/bar.js'].functionData[14]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[229]++;
  ghostBackEl.remove();
  _$jscoverage['/navigation-view/bar.js'].lineData[230]++;
  self.ghostBackEl = null;
});
  } else {
    _$jscoverage['/navigation-view/bar.js'].lineData[233]++;
    ghostBackEl.remove();
    _$jscoverage['/navigation-view/bar.js'].lineData[234]++;
    self.ghostBackEl = null;
  }
  _$jscoverage['/navigation-view/bar.js'].lineData[237]++;
  var titleEl = self.get('titleEl');
  _$jscoverage['/navigation-view/bar.js'].lineData[238]++;
  titleEl.stop(true);
  _$jscoverage['/navigation-view/bar.js'].lineData[239]++;
  var ghostTitleEl = createGhost(titleEl.parent());
  _$jscoverage['/navigation-view/bar.js'].lineData[240]++;
  self.ghostTitleEl = ghostTitleEl;
  _$jscoverage['/navigation-view/bar.js'].lineData[241]++;
  titleEl.css('opacity', 0);
  _$jscoverage['/navigation-view/bar.js'].lineData[242]++;
  self.set('title', title);
  _$jscoverage['/navigation-view/bar.js'].lineData[243]++;
  titleEl.css(anims.title.element.from);
  _$jscoverage['/navigation-view/bar.js'].lineData[244]++;
  anim(titleEl, anims.title.element.to);
  _$jscoverage['/navigation-view/bar.js'].lineData[245]++;
  anim(ghostTitleEl, anims.title.ghost.to, function() {
  _$jscoverage['/navigation-view/bar.js'].functionData[15]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[246]++;
  ghostTitleEl.remove();
  _$jscoverage['/navigation-view/bar.js'].lineData[247]++;
  self.ghostTitleEl = null;
});
}, 
  back: function(title, hasPrevious) {
  _$jscoverage['/navigation-view/bar.js'].functionData[16]++;
  _$jscoverage['/navigation-view/bar.js'].lineData[252]++;
  this.go(title, hasPrevious, true);
}}, {
  xclass: 'navigation-bar', 
  ATTRS: {
  handleMouseEvents: {
  value: false}, 
  focusable: {
  value: false}, 
  xrender: {
  value: BarRender}, 
  centerEl: {}, 
  contentEl: {}, 
  titleEl: {}, 
  title: {
  value: '', 
  view: 1}, 
  withBackButton: {
  value: 1}, 
  withTitle: {
  value: 1, 
  view: 1}, 
  backText: {
  value: 'Back', 
  view: 1}}});
});
