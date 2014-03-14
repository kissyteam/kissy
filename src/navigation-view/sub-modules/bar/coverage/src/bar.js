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
if (! _$jscoverage['/bar.js']) {
  _$jscoverage['/bar.js'] = {};
  _$jscoverage['/bar.js'].lineData = [];
  _$jscoverage['/bar.js'].lineData[5] = 0;
  _$jscoverage['/bar.js'].lineData[6] = 0;
  _$jscoverage['/bar.js'].lineData[7] = 0;
  _$jscoverage['/bar.js'].lineData[8] = 0;
  _$jscoverage['/bar.js'].lineData[10] = 0;
  _$jscoverage['/bar.js'].lineData[11] = 0;
  _$jscoverage['/bar.js'].lineData[13] = 0;
  _$jscoverage['/bar.js'].lineData[14] = 0;
  _$jscoverage['/bar.js'].lineData[16] = 0;
  _$jscoverage['/bar.js'].lineData[18] = 0;
  _$jscoverage['/bar.js'].lineData[20] = 0;
  _$jscoverage['/bar.js'].lineData[21] = 0;
  _$jscoverage['/bar.js'].lineData[22] = 0;
  _$jscoverage['/bar.js'].lineData[27] = 0;
  _$jscoverage['/bar.js'].lineData[30] = 0;
  _$jscoverage['/bar.js'].lineData[31] = 0;
  _$jscoverage['/bar.js'].lineData[38] = 0;
  _$jscoverage['/bar.js'].lineData[39] = 0;
  _$jscoverage['/bar.js'].lineData[49] = 0;
  _$jscoverage['/bar.js'].lineData[50] = 0;
  _$jscoverage['/bar.js'].lineData[51] = 0;
  _$jscoverage['/bar.js'].lineData[54] = 0;
  _$jscoverage['/bar.js'].lineData[55] = 0;
  _$jscoverage['/bar.js'].lineData[59] = 0;
  _$jscoverage['/bar.js'].lineData[77] = 0;
  _$jscoverage['/bar.js'].lineData[78] = 0;
  _$jscoverage['/bar.js'].lineData[79] = 0;
  _$jscoverage['/bar.js'].lineData[82] = 0;
  _$jscoverage['/bar.js'].lineData[83] = 0;
  _$jscoverage['/bar.js'].lineData[85] = 0;
  _$jscoverage['/bar.js'].lineData[86] = 0;
  _$jscoverage['/bar.js'].lineData[89] = 0;
  _$jscoverage['/bar.js'].lineData[92] = 0;
  _$jscoverage['/bar.js'].lineData[94] = 0;
  _$jscoverage['/bar.js'].lineData[95] = 0;
  _$jscoverage['/bar.js'].lineData[98] = 0;
  _$jscoverage['/bar.js'].lineData[101] = 0;
  _$jscoverage['/bar.js'].lineData[103] = 0;
  _$jscoverage['/bar.js'].lineData[121] = 0;
  _$jscoverage['/bar.js'].lineData[127] = 0;
  _$jscoverage['/bar.js'].lineData[128] = 0;
  _$jscoverage['/bar.js'].lineData[131] = 0;
  _$jscoverage['/bar.js'].lineData[132] = 0;
  _$jscoverage['/bar.js'].lineData[135] = 0;
  _$jscoverage['/bar.js'].lineData[136] = 0;
  _$jscoverage['/bar.js'].lineData[139] = 0;
  _$jscoverage['/bar.js'].lineData[140] = 0;
  _$jscoverage['/bar.js'].lineData[141] = 0;
  _$jscoverage['/bar.js'].lineData[142] = 0;
  _$jscoverage['/bar.js'].lineData[143] = 0;
  _$jscoverage['/bar.js'].lineData[144] = 0;
  _$jscoverage['/bar.js'].lineData[145] = 0;
  _$jscoverage['/bar.js'].lineData[149] = 0;
  _$jscoverage['/bar.js'].lineData[151] = 0;
  _$jscoverage['/bar.js'].lineData[152] = 0;
  _$jscoverage['/bar.js'].lineData[153] = 0;
  _$jscoverage['/bar.js'].lineData[160] = 0;
  _$jscoverage['/bar.js'].lineData[162] = 0;
  _$jscoverage['/bar.js'].lineData[163] = 0;
  _$jscoverage['/bar.js'].lineData[164] = 0;
  _$jscoverage['/bar.js'].lineData[175] = 0;
  _$jscoverage['/bar.js'].lineData[176] = 0;
  _$jscoverage['/bar.js'].lineData[178] = 0;
  _$jscoverage['/bar.js'].lineData[179] = 0;
  _$jscoverage['/bar.js'].lineData[180] = 0;
  _$jscoverage['/bar.js'].lineData[184] = 0;
  _$jscoverage['/bar.js'].lineData[186] = 0;
  _$jscoverage['/bar.js'].lineData[187] = 0;
  _$jscoverage['/bar.js'].lineData[188] = 0;
  _$jscoverage['/bar.js'].lineData[189] = 0;
  _$jscoverage['/bar.js'].lineData[190] = 0;
  _$jscoverage['/bar.js'].lineData[191] = 0;
  _$jscoverage['/bar.js'].lineData[192] = 0;
  _$jscoverage['/bar.js'].lineData[194] = 0;
  _$jscoverage['/bar.js'].lineData[196] = 0;
  _$jscoverage['/bar.js'].lineData[197] = 0;
  _$jscoverage['/bar.js'].lineData[201] = 0;
  _$jscoverage['/bar.js'].lineData[202] = 0;
  _$jscoverage['/bar.js'].lineData[206] = 0;
  _$jscoverage['/bar.js'].lineData[207] = 0;
  _$jscoverage['/bar.js'].lineData[211] = 0;
  _$jscoverage['/bar.js'].lineData[215] = 0;
  _$jscoverage['/bar.js'].lineData[216] = 0;
  _$jscoverage['/bar.js'].lineData[220] = 0;
  _$jscoverage['/bar.js'].lineData[221] = 0;
  _$jscoverage['/bar.js'].lineData[223] = 0;
  _$jscoverage['/bar.js'].lineData[224] = 0;
  _$jscoverage['/bar.js'].lineData[225] = 0;
  _$jscoverage['/bar.js'].lineData[227] = 0;
  _$jscoverage['/bar.js'].lineData[228] = 0;
  _$jscoverage['/bar.js'].lineData[230] = 0;
  _$jscoverage['/bar.js'].lineData[233] = 0;
  _$jscoverage['/bar.js'].lineData[234] = 0;
  _$jscoverage['/bar.js'].lineData[235] = 0;
  _$jscoverage['/bar.js'].lineData[236] = 0;
  _$jscoverage['/bar.js'].lineData[238] = 0;
  _$jscoverage['/bar.js'].lineData[241] = 0;
  _$jscoverage['/bar.js'].lineData[242] = 0;
  _$jscoverage['/bar.js'].lineData[243] = 0;
  _$jscoverage['/bar.js'].lineData[244] = 0;
  _$jscoverage['/bar.js'].lineData[245] = 0;
  _$jscoverage['/bar.js'].lineData[246] = 0;
  _$jscoverage['/bar.js'].lineData[248] = 0;
  _$jscoverage['/bar.js'].lineData[249] = 0;
  _$jscoverage['/bar.js'].lineData[250] = 0;
  _$jscoverage['/bar.js'].lineData[251] = 0;
  _$jscoverage['/bar.js'].lineData[253] = 0;
  _$jscoverage['/bar.js'].lineData[254] = 0;
  _$jscoverage['/bar.js'].lineData[255] = 0;
  _$jscoverage['/bar.js'].lineData[256] = 0;
  _$jscoverage['/bar.js'].lineData[259] = 0;
  _$jscoverage['/bar.js'].lineData[260] = 0;
  _$jscoverage['/bar.js'].lineData[263] = 0;
  _$jscoverage['/bar.js'].lineData[264] = 0;
  _$jscoverage['/bar.js'].lineData[265] = 0;
  _$jscoverage['/bar.js'].lineData[266] = 0;
  _$jscoverage['/bar.js'].lineData[267] = 0;
  _$jscoverage['/bar.js'].lineData[268] = 0;
  _$jscoverage['/bar.js'].lineData[269] = 0;
  _$jscoverage['/bar.js'].lineData[270] = 0;
  _$jscoverage['/bar.js'].lineData[271] = 0;
  _$jscoverage['/bar.js'].lineData[272] = 0;
  _$jscoverage['/bar.js'].lineData[273] = 0;
  _$jscoverage['/bar.js'].lineData[278] = 0;
  _$jscoverage['/bar.js'].lineData[279] = 0;
  _$jscoverage['/bar.js'].lineData[280] = 0;
}
if (! _$jscoverage['/bar.js'].functionData) {
  _$jscoverage['/bar.js'].functionData = [];
  _$jscoverage['/bar.js'].functionData[0] = 0;
  _$jscoverage['/bar.js'].functionData[1] = 0;
  _$jscoverage['/bar.js'].functionData[2] = 0;
  _$jscoverage['/bar.js'].functionData[3] = 0;
  _$jscoverage['/bar.js'].functionData[4] = 0;
  _$jscoverage['/bar.js'].functionData[5] = 0;
  _$jscoverage['/bar.js'].functionData[6] = 0;
  _$jscoverage['/bar.js'].functionData[7] = 0;
  _$jscoverage['/bar.js'].functionData[8] = 0;
  _$jscoverage['/bar.js'].functionData[9] = 0;
  _$jscoverage['/bar.js'].functionData[10] = 0;
  _$jscoverage['/bar.js'].functionData[11] = 0;
  _$jscoverage['/bar.js'].functionData[12] = 0;
  _$jscoverage['/bar.js'].functionData[13] = 0;
  _$jscoverage['/bar.js'].functionData[14] = 0;
  _$jscoverage['/bar.js'].functionData[15] = 0;
  _$jscoverage['/bar.js'].functionData[16] = 0;
  _$jscoverage['/bar.js'].functionData[17] = 0;
  _$jscoverage['/bar.js'].functionData[18] = 0;
  _$jscoverage['/bar.js'].functionData[19] = 0;
}
if (! _$jscoverage['/bar.js'].branchData) {
  _$jscoverage['/bar.js'].branchData = {};
  _$jscoverage['/bar.js'].branchData['49'] = [];
  _$jscoverage['/bar.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['78'] = [];
  _$jscoverage['/bar.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['82'] = [];
  _$jscoverage['/bar.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['85'] = [];
  _$jscoverage['/bar.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['94'] = [];
  _$jscoverage['/bar.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['136'] = [];
  _$jscoverage['/bar.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['144'] = [];
  _$jscoverage['/bar.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['145'] = [];
  _$jscoverage['/bar.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['163'] = [];
  _$jscoverage['/bar.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['175'] = [];
  _$jscoverage['/bar.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['187'] = [];
  _$jscoverage['/bar.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['188'] = [];
  _$jscoverage['/bar.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['189'] = [];
  _$jscoverage['/bar.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['191'] = [];
  _$jscoverage['/bar.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['223'] = [];
  _$jscoverage['/bar.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['223'][2] = new BranchData();
  _$jscoverage['/bar.js'].branchData['224'] = [];
  _$jscoverage['/bar.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['227'] = [];
  _$jscoverage['/bar.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['235'] = [];
  _$jscoverage['/bar.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['245'] = [];
  _$jscoverage['/bar.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['250'] = [];
  _$jscoverage['/bar.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['253'] = [];
  _$jscoverage['/bar.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['278'] = [];
  _$jscoverage['/bar.js'].branchData['278'][1] = new BranchData();
}
_$jscoverage['/bar.js'].branchData['278'][1].init(18, 18, 'this._stack.length');
function visit28_278_1(result) {
  _$jscoverage['/bar.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['253'][1].init(1207, 37, 'ghostBackEl.css(\'display\') !== \'none\'');
function visit27_253_1(result) {
  _$jscoverage['/bar.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['250'][1].init(1095, 22, 'backBtn.get(\'visible\')');
function visit26_250_1(result) {
  _$jscoverage['/bar.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['245'][1].init(872, 16, 'self.ghostBackEl');
function visit25_245_1(result) {
  _$jscoverage['/bar.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['235'][1].init(488, 16, 'self.ghostBackEl');
function visit24_235_1(result) {
  _$jscoverage['/bar.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['227'][1].init(135, 7, 'backBtn');
function visit23_227_1(result) {
  _$jscoverage['/bar.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['224'][1].init(22, 15, 'self._withTitle');
function visit22_224_1(result) {
  _$jscoverage['/bar.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['223'][2].init(94, 26, 'backBtn && self._withTitle');
function visit21_223_2(result) {
  _$jscoverage['/bar.js'].branchData['223'][2].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['223'][1].init(92, 29, '!(backBtn && self._withTitle)');
function visit20_223_1(result) {
  _$jscoverage['/bar.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['191'][1].init(200, 17, 'align === \'right\'');
function visit19_191_1(result) {
  _$jscoverage['/bar.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['189'][1].init(90, 16, 'align === \'left\'');
function visit18_189_1(result) {
  _$jscoverage['/bar.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['188'][1].init(45, 22, 'config.align || \'left\'');
function visit17_188_1(result) {
  _$jscoverage['/bar.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['187'][1].init(163, 34, '!config.elBefore && !config.render');
function visit16_187_1(result) {
  _$jscoverage['/bar.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['175'][1].init(18, 13, 'this._backBtn');
function visit15_175_1(result) {
  _$jscoverage['/bar.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['163'][1].init(133, 26, 'self.get(\'withBackButton\')');
function visit14_163_1(result) {
  _$jscoverage['/bar.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['145'][1].init(54, 26, 'newView.get(\'title\') || \'\'');
function visit13_145_1(result) {
  _$jscoverage['/bar.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['144'][1].init(144, 7, 'oldView');
function visit12_144_1(result) {
  _$jscoverage['/bar.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['136'][1].init(28, 28, 'e.newView.get(\'title\') || \'\'');
function visit11_136_1(result) {
  _$jscoverage['/bar.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['94'][1].init(77, 19, 'omega !== undefined');
function visit10_94_1(result) {
  _$jscoverage['/bar.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['85'][1].init(77, 19, 'omega !== undefined');
function visit9_85_1(result) {
  _$jscoverage['/bar.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['82'][1].init(1468, 7, 'reverse');
function visit8_82_1(result) {
  _$jscoverage['/bar.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['78'][1].init(1376, 19, 'titleWidth > titleX');
function visit7_78_1(result) {
  _$jscoverage['/bar.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['49'][1].init(533, 7, 'reverse');
function visit6_49_1(result) {
  _$jscoverage['/bar.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/bar.js'].functionData[0]++;
  _$jscoverage['/bar.js'].lineData[6]++;
  var Control = require('component/control');
  _$jscoverage['/bar.js'].lineData[7]++;
  var BarRender = require('./bar/bar-render');
  _$jscoverage['/bar.js'].lineData[8]++;
  var Button = require('button');
  _$jscoverage['/bar.js'].lineData[10]++;
  function createGhost(elem) {
    _$jscoverage['/bar.js'].functionData[1]++;
    _$jscoverage['/bar.js'].lineData[11]++;
    var ghost, width;
    _$jscoverage['/bar.js'].lineData[13]++;
    ghost = elem.clone(true);
    _$jscoverage['/bar.js'].lineData[14]++;
    ghost[0].id = elem[0].id + '-proxy';
    _$jscoverage['/bar.js'].lineData[16]++;
    elem.parent().append(ghost);
    _$jscoverage['/bar.js'].lineData[18]++;
    var offset = elem.offset();
    _$jscoverage['/bar.js'].lineData[20]++;
    ghost.css('position', 'absolute');
    _$jscoverage['/bar.js'].lineData[21]++;
    ghost.offset(offset);
    _$jscoverage['/bar.js'].lineData[22]++;
    ghost.css({
  width: width = elem.css('width'), 
  height: elem.css('height')});
    _$jscoverage['/bar.js'].lineData[27]++;
    return ghost;
  }
  _$jscoverage['/bar.js'].lineData[30]++;
  function anim(el, props, complete) {
    _$jscoverage['/bar.js'].functionData[2]++;
    _$jscoverage['/bar.js'].lineData[31]++;
    el.animate(props, {
  duration: 0.25, 
  easing: 'ease-in-out', 
  complete: complete});
  }
  _$jscoverage['/bar.js'].lineData[38]++;
  function getAnimProps(self, backEl, backElProps, reverse) {
    _$jscoverage['/bar.js'].functionData[3]++;
    _$jscoverage['/bar.js'].lineData[39]++;
    var barElement = self.get('el'), titleElement = self.get('titleEl'), minOffset = Math.min(barElement[0].offsetWidth / 3, 200), newLeftWidth = backEl[0].offsetWidth, barWidth = barElement[0].offsetWidth, titleX = titleElement.offset().left - barElement.offset().left, titleWidth = titleElement[0].offsetWidth, oldBackWidth = backElProps.width, newOffset, oldOffset, backElAnims, titleAnims, omega, theta;
    _$jscoverage['/bar.js'].lineData[49]++;
    if (visit6_49_1(reverse)) {
      _$jscoverage['/bar.js'].lineData[50]++;
      newOffset = -oldBackWidth;
      _$jscoverage['/bar.js'].lineData[51]++;
      oldOffset = Math.min(titleX - oldBackWidth, minOffset);
    } else {
      _$jscoverage['/bar.js'].lineData[54]++;
      oldOffset = -oldBackWidth;
      _$jscoverage['/bar.js'].lineData[55]++;
      newOffset = Math.min(titleX, minOffset);
    }
    _$jscoverage['/bar.js'].lineData[59]++;
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
    _$jscoverage['/bar.js'].lineData[77]++;
    theta = -titleX + newLeftWidth;
    _$jscoverage['/bar.js'].lineData[78]++;
    if (visit7_78_1(titleWidth > titleX)) {
      _$jscoverage['/bar.js'].lineData[79]++;
      omega = -titleX - titleWidth;
    }
    _$jscoverage['/bar.js'].lineData[82]++;
    if (visit8_82_1(reverse)) {
      _$jscoverage['/bar.js'].lineData[83]++;
      oldOffset = barWidth - titleX - titleWidth;
      _$jscoverage['/bar.js'].lineData[85]++;
      if (visit9_85_1(omega !== undefined)) {
        _$jscoverage['/bar.js'].lineData[86]++;
        newOffset = omega;
      } else {
        _$jscoverage['/bar.js'].lineData[89]++;
        newOffset = theta;
      }
    } else {
      _$jscoverage['/bar.js'].lineData[92]++;
      newOffset = barWidth - titleX - titleWidth;
      _$jscoverage['/bar.js'].lineData[94]++;
      if (visit10_94_1(omega !== undefined)) {
        _$jscoverage['/bar.js'].lineData[95]++;
        oldOffset = omega;
      } else {
        _$jscoverage['/bar.js'].lineData[98]++;
        oldOffset = theta;
      }
      _$jscoverage['/bar.js'].lineData[101]++;
      newOffset = Math.max(0, newOffset);
    }
    _$jscoverage['/bar.js'].lineData[103]++;
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
    _$jscoverage['/bar.js'].lineData[121]++;
    return {
  back: backElAnims, 
  title: titleAnims};
  }
  _$jscoverage['/bar.js'].lineData[127]++;
  function onBackButtonClick() {
    _$jscoverage['/bar.js'].functionData[4]++;
    _$jscoverage['/bar.js'].lineData[128]++;
    this.fire('backward');
  }
  _$jscoverage['/bar.js'].lineData[131]++;
  function onBack() {
    _$jscoverage['/bar.js'].functionData[5]++;
    _$jscoverage['/bar.js'].lineData[132]++;
    this.get('navigationView').pop();
  }
  _$jscoverage['/bar.js'].lineData[135]++;
  function afterInnerViewChange(e) {
    _$jscoverage['/bar.js'].functionData[6]++;
    _$jscoverage['/bar.js'].lineData[136]++;
    this.set('title', visit11_136_1(e.newView.get('title') || ''));
  }
  _$jscoverage['/bar.js'].lineData[139]++;
  function beforeInnerViewChange(e) {
    _$jscoverage['/bar.js'].functionData[7]++;
    _$jscoverage['/bar.js'].lineData[140]++;
    var self = this;
    _$jscoverage['/bar.js'].lineData[141]++;
    var oldView = e.oldView;
    _$jscoverage['/bar.js'].lineData[142]++;
    var newView = e.newView;
    _$jscoverage['/bar.js'].lineData[143]++;
    var backward = e.backward;
    _$jscoverage['/bar.js'].lineData[144]++;
    if (visit12_144_1(oldView)) {
      _$jscoverage['/bar.js'].lineData[145]++;
      self[backward ? 'backward' : 'forward'](visit13_145_1(newView.get('title') || ''));
    }
  }
  _$jscoverage['/bar.js'].lineData[149]++;
  return Control.extend({
  initializer: function() {
  _$jscoverage['/bar.js'].functionData[8]++;
  _$jscoverage['/bar.js'].lineData[151]++;
  this._withTitle = this.get('withTitle');
  _$jscoverage['/bar.js'].lineData[152]++;
  this._stack = [];
  _$jscoverage['/bar.js'].lineData[153]++;
  this.publish('backward', {
  defaultFn: onBack, 
  defaultTargetOnly: true});
}, 
  renderUI: function() {
  _$jscoverage['/bar.js'].functionData[9]++;
  _$jscoverage['/bar.js'].lineData[160]++;
  var self = this, prefixCls = self.get('prefixCls');
  _$jscoverage['/bar.js'].lineData[162]++;
  self._buttons = {};
  _$jscoverage['/bar.js'].lineData[163]++;
  if (visit14_163_1(self.get('withBackButton'))) {
    _$jscoverage['/bar.js'].lineData[164]++;
    self._backBtn = new Button({
  prefixCls: prefixCls + 'navigation-bar-', 
  elCls: prefixCls + 'navigation-bar-backward', 
  elBefore: self.get('contentEl')[0].firstChild, 
  visible: false, 
  content: self.get('backText')}).render();
  }
}, 
  bindUI: function() {
  _$jscoverage['/bar.js'].functionData[10]++;
  _$jscoverage['/bar.js'].lineData[175]++;
  if (visit15_175_1(this._backBtn)) {
    _$jscoverage['/bar.js'].lineData[176]++;
    this._backBtn.on('click', onBackButtonClick, this);
  }
  _$jscoverage['/bar.js'].lineData[178]++;
  var navigationView = this.get('navigationView');
  _$jscoverage['/bar.js'].lineData[179]++;
  navigationView.on('afterInnerViewChange', afterInnerViewChange, this);
  _$jscoverage['/bar.js'].lineData[180]++;
  navigationView.on('beforeInnerViewChange', beforeInnerViewChange, this);
}, 
  addButton: function(name, config) {
  _$jscoverage['/bar.js'].functionData[11]++;
  _$jscoverage['/bar.js'].lineData[184]++;
  var self = this, prefixCls = self.get('prefixCls');
  _$jscoverage['/bar.js'].lineData[186]++;
  config.prefixCls = prefixCls + 'navigation-bar-';
  _$jscoverage['/bar.js'].lineData[187]++;
  if (visit16_187_1(!config.elBefore && !config.render)) {
    _$jscoverage['/bar.js'].lineData[188]++;
    var align = config.align = visit17_188_1(config.align || 'left');
    _$jscoverage['/bar.js'].lineData[189]++;
    if (visit18_189_1(align === 'left')) {
      _$jscoverage['/bar.js'].lineData[190]++;
      config.elBefore = self.get('centerEl');
    } else {
      _$jscoverage['/bar.js'].lineData[191]++;
      if (visit19_191_1(align === 'right')) {
        _$jscoverage['/bar.js'].lineData[192]++;
        config.render = self.get('contentEl');
      }
    }
    _$jscoverage['/bar.js'].lineData[194]++;
    delete config.align;
  }
  _$jscoverage['/bar.js'].lineData[196]++;
  self._buttons[name] = new Button(config).render();
  _$jscoverage['/bar.js'].lineData[197]++;
  return self._buttons[name];
}, 
  insertButtonBefore: function(name, config, button) {
  _$jscoverage['/bar.js'].functionData[12]++;
  _$jscoverage['/bar.js'].lineData[201]++;
  config.elBefore = button.get('el');
  _$jscoverage['/bar.js'].lineData[202]++;
  return this.addButton(name, config);
}, 
  removeButton: function(name) {
  _$jscoverage['/bar.js'].functionData[13]++;
  _$jscoverage['/bar.js'].lineData[206]++;
  this._buttons[name].destroy();
  _$jscoverage['/bar.js'].lineData[207]++;
  delete this._buttons[name];
}, 
  getButton: function(name) {
  _$jscoverage['/bar.js'].functionData[14]++;
  _$jscoverage['/bar.js'].lineData[211]++;
  return this._buttons[name];
}, 
  forward: function(title) {
  _$jscoverage['/bar.js'].functionData[15]++;
  _$jscoverage['/bar.js'].lineData[215]++;
  this._stack.push(title);
  _$jscoverage['/bar.js'].lineData[216]++;
  this.go(title, true);
}, 
  go: function(title, hasPrevious, reverse) {
  _$jscoverage['/bar.js'].functionData[16]++;
  _$jscoverage['/bar.js'].lineData[220]++;
  var self = this;
  _$jscoverage['/bar.js'].lineData[221]++;
  var backBtn = self._backBtn;
  _$jscoverage['/bar.js'].lineData[223]++;
  if (visit20_223_1(!(visit21_223_2(backBtn && self._withTitle)))) {
    _$jscoverage['/bar.js'].lineData[224]++;
    if (visit22_224_1(self._withTitle)) {
      _$jscoverage['/bar.js'].lineData[225]++;
      self.get('titleEl').html(title);
    }
    _$jscoverage['/bar.js'].lineData[227]++;
    if (visit23_227_1(backBtn)) {
      _$jscoverage['/bar.js'].lineData[228]++;
      backBtn[hasPrevious ? 'show' : 'hide']();
    }
    _$jscoverage['/bar.js'].lineData[230]++;
    return;
  }
  _$jscoverage['/bar.js'].lineData[233]++;
  var backEl = backBtn.get('el');
  _$jscoverage['/bar.js'].lineData[234]++;
  backEl.stop(true);
  _$jscoverage['/bar.js'].lineData[235]++;
  if (visit24_235_1(self.ghostBackEl)) {
    _$jscoverage['/bar.js'].lineData[236]++;
    self.ghostBackEl.stop(true);
  }
  _$jscoverage['/bar.js'].lineData[238]++;
  var backElProps = {
  width: backEl[0].offsetWidth};
  _$jscoverage['/bar.js'].lineData[241]++;
  var ghostBackEl = createGhost(backEl);
  _$jscoverage['/bar.js'].lineData[242]++;
  self.ghostBackEl = ghostBackEl;
  _$jscoverage['/bar.js'].lineData[243]++;
  backEl.css('opacity', 0);
  _$jscoverage['/bar.js'].lineData[244]++;
  backBtn[hasPrevious ? 'show' : 'hide']();
  _$jscoverage['/bar.js'].lineData[245]++;
  if (visit25_245_1(self.ghostBackEl)) {
    _$jscoverage['/bar.js'].lineData[246]++;
    self.ghostBackEl.stop(true);
  }
  _$jscoverage['/bar.js'].lineData[248]++;
  var anims = getAnimProps(self, backEl, backElProps, reverse);
  _$jscoverage['/bar.js'].lineData[249]++;
  backEl.css(anims.back.element.from);
  _$jscoverage['/bar.js'].lineData[250]++;
  if (visit26_250_1(backBtn.get('visible'))) {
    _$jscoverage['/bar.js'].lineData[251]++;
    anim(backEl, anims.back.element.to);
  }
  _$jscoverage['/bar.js'].lineData[253]++;
  if (visit27_253_1(ghostBackEl.css('display') !== 'none')) {
    _$jscoverage['/bar.js'].lineData[254]++;
    anim(ghostBackEl, anims.back.ghost.to, function() {
  _$jscoverage['/bar.js'].functionData[17]++;
  _$jscoverage['/bar.js'].lineData[255]++;
  ghostBackEl.remove();
  _$jscoverage['/bar.js'].lineData[256]++;
  self.ghostBackEl = null;
});
  } else {
    _$jscoverage['/bar.js'].lineData[259]++;
    ghostBackEl.remove();
    _$jscoverage['/bar.js'].lineData[260]++;
    self.ghostBackEl = null;
  }
  _$jscoverage['/bar.js'].lineData[263]++;
  var titleEl = self.get('titleEl');
  _$jscoverage['/bar.js'].lineData[264]++;
  titleEl.stop(true);
  _$jscoverage['/bar.js'].lineData[265]++;
  var ghostTitleEl = createGhost(titleEl.parent());
  _$jscoverage['/bar.js'].lineData[266]++;
  self.ghostTitleEl = ghostTitleEl;
  _$jscoverage['/bar.js'].lineData[267]++;
  titleEl.css('opacity', 0);
  _$jscoverage['/bar.js'].lineData[268]++;
  self.set('title', title);
  _$jscoverage['/bar.js'].lineData[269]++;
  titleEl.css(anims.title.element.from);
  _$jscoverage['/bar.js'].lineData[270]++;
  anim(titleEl, anims.title.element.to);
  _$jscoverage['/bar.js'].lineData[271]++;
  anim(ghostTitleEl, anims.title.ghost.to, function() {
  _$jscoverage['/bar.js'].functionData[18]++;
  _$jscoverage['/bar.js'].lineData[272]++;
  ghostTitleEl.remove();
  _$jscoverage['/bar.js'].lineData[273]++;
  self.ghostTitleEl = null;
});
}, 
  backward: function(title) {
  _$jscoverage['/bar.js'].functionData[19]++;
  _$jscoverage['/bar.js'].lineData[278]++;
  if (visit28_278_1(this._stack.length)) {
    _$jscoverage['/bar.js'].lineData[279]++;
    this._stack.pop();
    _$jscoverage['/bar.js'].lineData[280]++;
    this.go(title, this._stack.length, true);
  }
}}, {
  xclass: 'navigation-bar', 
  ATTRS: {
  handleGestureEvents: {
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
