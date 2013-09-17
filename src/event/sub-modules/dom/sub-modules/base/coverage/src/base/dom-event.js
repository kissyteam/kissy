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
if (! _$jscoverage['/base/dom-event.js']) {
  _$jscoverage['/base/dom-event.js'] = {};
  _$jscoverage['/base/dom-event.js'].lineData = [];
  _$jscoverage['/base/dom-event.js'].lineData[6] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[7] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[9] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[11] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[12] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[17] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[20] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[21] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[24] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[27] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[28] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[33] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[34] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[37] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[39] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[40] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[44] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[47] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[49] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[51] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[52] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[53] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[54] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[55] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[57] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[59] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[62] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[63] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[67] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[69] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[70] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[75] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[78] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[80] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[83] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[85] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[87] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[89] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[91] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[94] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[95] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[99] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[100] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[101] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[103] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[106] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[108] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[109] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[118] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[134] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[136] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[137] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[138] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[139] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[140] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[141] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[145] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[164] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[166] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[168] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[174] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[176] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[177] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[178] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[180] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[181] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[182] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[183] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[190] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[205] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[222] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[240] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[242] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[248] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[250] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[252] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[257] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[260] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[261] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[263] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[267] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[269] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[272] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[274] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[275] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[276] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[279] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[280] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[285] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[286] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[287] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[288] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[294] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[309] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[321] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[323] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[324] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[326] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[327] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[330] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[332] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[333] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[334] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[338] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[344] = 0;
}
if (! _$jscoverage['/base/dom-event.js'].functionData) {
  _$jscoverage['/base/dom-event.js'].functionData = [];
  _$jscoverage['/base/dom-event.js'].functionData[0] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[1] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[2] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[3] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[4] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[5] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[6] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[7] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[8] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[9] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[10] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[11] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[12] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[13] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[14] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[15] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[16] = 0;
}
if (! _$jscoverage['/base/dom-event.js'].branchData) {
  _$jscoverage['/base/dom-event.js'].branchData = {};
  _$jscoverage['/base/dom-event.js'].branchData['12'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['17'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['39'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['47'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['47'][2] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['48'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['52'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['62'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['69'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['92'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['94'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['99'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['108'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['139'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['176'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['180'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['182'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['242'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['267'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['274'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['279'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['285'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['287'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['287'][2] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['287'][3] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['323'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['327'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['327'][2] = new BranchData();
}
_$jscoverage['/base/dom-event.js'].branchData['327'][2].init(307, 36, 'srcData === DomEventUtils.data(dest)');
function visit28_327_2(result) {
  _$jscoverage['/base/dom-event.js'].branchData['327'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['327'][1].init(296, 47, 'srcData && srcData === DomEventUtils.data(dest)');
function visit27_327_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['323'][1].init(100, 83, '!(domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(src))');
function visit26_323_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['287'][3].init(126, 15, 'r !== undefined');
function visit25_287_3(result) {
  _$jscoverage['/base/dom-event.js'].branchData['287'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['287'][2].init(109, 13, 'ret !== false');
function visit24_287_2(result) {
  _$jscoverage['/base/dom-event.js'].branchData['287'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['287'][1].init(109, 32, 'ret !== false && r !== undefined');
function visit23_287_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['285'][1].init(553, 18, 'domEventObservable');
function visit22_285_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['279'][1].init(265, 36, '!onlyHandlers && !domEventObservable');
function visit21_279_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['274'][1].init(700, 6, 'i >= 0');
function visit20_274_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['267'][1].init(485, 14, 's && s.typeFix');
function visit19_267_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['242'][1].init(115, 15, 'eventData || {}');
function visit18_242_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['182'][1].init(125, 6, 'j >= 0');
function visit17_182_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['180'][1].init(156, 34, 'cfg.deep && t.getElementsByTagName');
function visit16_180_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['176'][1].init(276, 6, 'i >= 0');
function visit15_176_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['139'][1].init(159, 6, 'i >= 0');
function visit14_139_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['108'][1].init(684, 11, 'customEvent');
function visit13_108_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['99'][1].init(456, 5, '!type');
function visit12_99_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['94'][1].init(317, 50, '!domEventObservablesHolder || !domEventObservables');
function visit11_94_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['92'][1].init(131, 31, 'domEventObservablesHolder || {}');
function visit10_92_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['69'][1].init(1690, 19, '!domEventObservable');
function visit9_69_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['62'][1].init(1393, 62, '!(domEventObservables = domEventObservablesHolder.observables)');
function visit8_62_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['52'][1].init(589, 18, 'domEventObservable');
function visit7_52_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['48'][1].init(65, 27, 'typeof KISSY == \'undefined\'');
function visit6_48_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['47'][2].init(312, 41, 'DomEventObservable.triggeredEvent == type');
function visit5_47_2(result) {
  _$jscoverage['/base/dom-event.js'].branchData['47'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['47'][1].init(312, 93, 'DomEventObservable.triggeredEvent == type || typeof KISSY == \'undefined\'');
function visit4_47_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['39'][1].init(336, 44, '!(handle = domEventObservablesHolder.handle)');
function visit3_39_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['17'][1].init(180, 42, '!cfg.originalType && (typeFix = s.typeFix)');
function visit2_17_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['12'][1].init(18, 19, 'Special[type] || {}');
function visit1_12_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].lineData[6]++;
KISSY.add('event/dom/base/dom-event', function(S, BaseEvent, DomEventUtils, Dom, Special, DomEventObservable, DomEventObject) {
  _$jscoverage['/base/dom-event.js'].functionData[0]++;
  _$jscoverage['/base/dom-event.js'].lineData[7]++;
  var BaseUtils = BaseEvent.Utils;
  _$jscoverage['/base/dom-event.js'].lineData[9]++;
  var undefined = undefined;
  _$jscoverage['/base/dom-event.js'].lineData[11]++;
  function fixType(cfg, type) {
    _$jscoverage['/base/dom-event.js'].functionData[1]++;
    _$jscoverage['/base/dom-event.js'].lineData[12]++;
    var s = visit1_12_1(Special[type] || {}), typeFix;
    _$jscoverage['/base/dom-event.js'].lineData[17]++;
    if (visit2_17_1(!cfg.originalType && (typeFix = s.typeFix))) {
      _$jscoverage['/base/dom-event.js'].lineData[20]++;
      cfg.originalType = type;
      _$jscoverage['/base/dom-event.js'].lineData[21]++;
      type = typeFix;
    }
    _$jscoverage['/base/dom-event.js'].lineData[24]++;
    return type;
  }
  _$jscoverage['/base/dom-event.js'].lineData[27]++;
  function addInternal(currentTarget, type, cfg) {
    _$jscoverage['/base/dom-event.js'].functionData[2]++;
    _$jscoverage['/base/dom-event.js'].lineData[28]++;
    var domEventObservablesHolder, domEventObservable, domEventObservables, handle;
    _$jscoverage['/base/dom-event.js'].lineData[33]++;
    cfg = S.merge(cfg);
    _$jscoverage['/base/dom-event.js'].lineData[34]++;
    type = fixType(cfg, type);
    _$jscoverage['/base/dom-event.js'].lineData[37]++;
    domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(currentTarget, 1);
    _$jscoverage['/base/dom-event.js'].lineData[39]++;
    if (visit3_39_1(!(handle = domEventObservablesHolder.handle))) {
      _$jscoverage['/base/dom-event.js'].lineData[40]++;
      handle = domEventObservablesHolder.handle = function(event) {
  _$jscoverage['/base/dom-event.js'].functionData[3]++;
  _$jscoverage['/base/dom-event.js'].lineData[44]++;
  var type = event.type, domEventObservable, currentTarget = handle.currentTarget;
  _$jscoverage['/base/dom-event.js'].lineData[47]++;
  if (visit4_47_1(visit5_47_2(DomEventObservable.triggeredEvent == type) || visit6_48_1(typeof KISSY == 'undefined'))) {
    _$jscoverage['/base/dom-event.js'].lineData[49]++;
    return undefined;
  }
  _$jscoverage['/base/dom-event.js'].lineData[51]++;
  domEventObservable = DomEventObservable.getDomEventObservable(currentTarget, type);
  _$jscoverage['/base/dom-event.js'].lineData[52]++;
  if (visit7_52_1(domEventObservable)) {
    _$jscoverage['/base/dom-event.js'].lineData[53]++;
    event.currentTarget = currentTarget;
    _$jscoverage['/base/dom-event.js'].lineData[54]++;
    event = new DomEventObject(event);
    _$jscoverage['/base/dom-event.js'].lineData[55]++;
    return domEventObservable.notify(event);
  }
  _$jscoverage['/base/dom-event.js'].lineData[57]++;
  return undefined;
};
      _$jscoverage['/base/dom-event.js'].lineData[59]++;
      handle.currentTarget = currentTarget;
    }
    _$jscoverage['/base/dom-event.js'].lineData[62]++;
    if (visit8_62_1(!(domEventObservables = domEventObservablesHolder.observables))) {
      _$jscoverage['/base/dom-event.js'].lineData[63]++;
      domEventObservables = domEventObservablesHolder.observables = {};
    }
    _$jscoverage['/base/dom-event.js'].lineData[67]++;
    domEventObservable = domEventObservables[type];
    _$jscoverage['/base/dom-event.js'].lineData[69]++;
    if (visit9_69_1(!domEventObservable)) {
      _$jscoverage['/base/dom-event.js'].lineData[70]++;
      domEventObservable = domEventObservables[type] = new DomEventObservable({
  type: type, 
  currentTarget: currentTarget});
      _$jscoverage['/base/dom-event.js'].lineData[75]++;
      domEventObservable.setup();
    }
    _$jscoverage['/base/dom-event.js'].lineData[78]++;
    domEventObservable.on(cfg);
    _$jscoverage['/base/dom-event.js'].lineData[80]++;
    currentTarget = null;
  }
  _$jscoverage['/base/dom-event.js'].lineData[83]++;
  function removeInternal(currentTarget, type, cfg) {
    _$jscoverage['/base/dom-event.js'].functionData[4]++;
    _$jscoverage['/base/dom-event.js'].lineData[85]++;
    cfg = S.merge(cfg);
    _$jscoverage['/base/dom-event.js'].lineData[87]++;
    var customEvent;
    _$jscoverage['/base/dom-event.js'].lineData[89]++;
    type = fixType(cfg, type);
    _$jscoverage['/base/dom-event.js'].lineData[91]++;
    var domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(currentTarget), domEventObservables = (visit10_92_1(domEventObservablesHolder || {})).observables;
    _$jscoverage['/base/dom-event.js'].lineData[94]++;
    if (visit11_94_1(!domEventObservablesHolder || !domEventObservables)) {
      _$jscoverage['/base/dom-event.js'].lineData[95]++;
      return;
    }
    _$jscoverage['/base/dom-event.js'].lineData[99]++;
    if (visit12_99_1(!type)) {
      _$jscoverage['/base/dom-event.js'].lineData[100]++;
      for (type in domEventObservables) {
        _$jscoverage['/base/dom-event.js'].lineData[101]++;
        domEventObservables[type].detach(cfg);
      }
      _$jscoverage['/base/dom-event.js'].lineData[103]++;
      return;
    }
    _$jscoverage['/base/dom-event.js'].lineData[106]++;
    customEvent = domEventObservables[type];
    _$jscoverage['/base/dom-event.js'].lineData[108]++;
    if (visit13_108_1(customEvent)) {
      _$jscoverage['/base/dom-event.js'].lineData[109]++;
      customEvent.detach(cfg);
    }
  }
  _$jscoverage['/base/dom-event.js'].lineData[118]++;
  var DomEvent = {
  on: function(targets, type, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[5]++;
  _$jscoverage['/base/dom-event.js'].lineData[134]++;
  targets = Dom.query(targets);
  _$jscoverage['/base/dom-event.js'].lineData[136]++;
  BaseUtils.batchForType(function(targets, type, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[6]++;
  _$jscoverage['/base/dom-event.js'].lineData[137]++;
  var cfg = BaseUtils.normalizeParam(type, fn, context), i, t;
  _$jscoverage['/base/dom-event.js'].lineData[138]++;
  type = cfg.type;
  _$jscoverage['/base/dom-event.js'].lineData[139]++;
  for (i = targets.length - 1; visit14_139_1(i >= 0); i--) {
    _$jscoverage['/base/dom-event.js'].lineData[140]++;
    t = targets[i];
    _$jscoverage['/base/dom-event.js'].lineData[141]++;
    addInternal(t, type, cfg);
  }
}, 1, targets, type, fn, context);
  _$jscoverage['/base/dom-event.js'].lineData[145]++;
  return targets;
}, 
  detach: function(targets, type, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[7]++;
  _$jscoverage['/base/dom-event.js'].lineData[164]++;
  targets = Dom.query(targets);
  _$jscoverage['/base/dom-event.js'].lineData[166]++;
  BaseUtils.batchForType(function(targets, singleType, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[8]++;
  _$jscoverage['/base/dom-event.js'].lineData[168]++;
  var cfg = BaseUtils.normalizeParam(singleType, fn, context), i, j, elChildren, t;
  _$jscoverage['/base/dom-event.js'].lineData[174]++;
  singleType = cfg.type;
  _$jscoverage['/base/dom-event.js'].lineData[176]++;
  for (i = targets.length - 1; visit15_176_1(i >= 0); i--) {
    _$jscoverage['/base/dom-event.js'].lineData[177]++;
    t = targets[i];
    _$jscoverage['/base/dom-event.js'].lineData[178]++;
    removeInternal(t, singleType, cfg);
    _$jscoverage['/base/dom-event.js'].lineData[180]++;
    if (visit16_180_1(cfg.deep && t.getElementsByTagName)) {
      _$jscoverage['/base/dom-event.js'].lineData[181]++;
      elChildren = t.getElementsByTagName('*');
      _$jscoverage['/base/dom-event.js'].lineData[182]++;
      for (j = elChildren.length - 1; visit17_182_1(j >= 0); j--) {
        _$jscoverage['/base/dom-event.js'].lineData[183]++;
        removeInternal(elChildren[j], singleType, cfg);
      }
    }
  }
}, 1, targets, type, fn, context);
  _$jscoverage['/base/dom-event.js'].lineData[190]++;
  return targets;
}, 
  delegate: function(targets, eventType, filter, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[9]++;
  _$jscoverage['/base/dom-event.js'].lineData[205]++;
  return DomEvent.on(targets, eventType, {
  fn: fn, 
  context: context, 
  filter: filter});
}, 
  undelegate: function(targets, eventType, filter, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[10]++;
  _$jscoverage['/base/dom-event.js'].lineData[222]++;
  return DomEvent.detach(targets, eventType, {
  fn: fn, 
  context: context, 
  filter: filter});
}, 
  fire: function(targets, eventType, eventData, onlyHandlers) {
  _$jscoverage['/base/dom-event.js'].functionData[11]++;
  _$jscoverage['/base/dom-event.js'].lineData[240]++;
  var ret = undefined;
  _$jscoverage['/base/dom-event.js'].lineData[242]++;
  eventData = visit18_242_1(eventData || {});
  _$jscoverage['/base/dom-event.js'].lineData[248]++;
  eventData.synthetic = 1;
  _$jscoverage['/base/dom-event.js'].lineData[250]++;
  BaseUtils.splitAndRun(eventType, function(eventType) {
  _$jscoverage['/base/dom-event.js'].functionData[12]++;
  _$jscoverage['/base/dom-event.js'].lineData[252]++;
  var r, i, target, domEventObservable;
  _$jscoverage['/base/dom-event.js'].lineData[257]++;
  BaseUtils.fillGroupsForEvent(eventType, eventData);
  _$jscoverage['/base/dom-event.js'].lineData[260]++;
  eventType = eventData.type;
  _$jscoverage['/base/dom-event.js'].lineData[261]++;
  var s = Special[eventType];
  _$jscoverage['/base/dom-event.js'].lineData[263]++;
  var originalType = eventType;
  _$jscoverage['/base/dom-event.js'].lineData[267]++;
  if (visit19_267_1(s && s.typeFix)) {
    _$jscoverage['/base/dom-event.js'].lineData[269]++;
    originalType = s.typeFix;
  }
  _$jscoverage['/base/dom-event.js'].lineData[272]++;
  targets = Dom.query(targets);
  _$jscoverage['/base/dom-event.js'].lineData[274]++;
  for (i = targets.length - 1; visit20_274_1(i >= 0); i--) {
    _$jscoverage['/base/dom-event.js'].lineData[275]++;
    target = targets[i];
    _$jscoverage['/base/dom-event.js'].lineData[276]++;
    domEventObservable = DomEventObservable.getDomEventObservable(target, originalType);
    _$jscoverage['/base/dom-event.js'].lineData[279]++;
    if (visit21_279_1(!onlyHandlers && !domEventObservable)) {
      _$jscoverage['/base/dom-event.js'].lineData[280]++;
      domEventObservable = new DomEventObservable({
  type: originalType, 
  currentTarget: target});
    }
    _$jscoverage['/base/dom-event.js'].lineData[285]++;
    if (visit22_285_1(domEventObservable)) {
      _$jscoverage['/base/dom-event.js'].lineData[286]++;
      r = domEventObservable.fire(eventData, onlyHandlers);
      _$jscoverage['/base/dom-event.js'].lineData[287]++;
      if (visit23_287_1(visit24_287_2(ret !== false) && visit25_287_3(r !== undefined))) {
        _$jscoverage['/base/dom-event.js'].lineData[288]++;
        ret = r;
      }
    }
  }
});
  _$jscoverage['/base/dom-event.js'].lineData[294]++;
  return ret;
}, 
  fireHandler: function(targets, eventType, eventData) {
  _$jscoverage['/base/dom-event.js'].functionData[13]++;
  _$jscoverage['/base/dom-event.js'].lineData[309]++;
  return DomEvent.fire(targets, eventType, eventData, 1);
}, 
  clone: function(src, dest) {
  _$jscoverage['/base/dom-event.js'].functionData[14]++;
  _$jscoverage['/base/dom-event.js'].lineData[321]++;
  var domEventObservablesHolder, domEventObservables;
  _$jscoverage['/base/dom-event.js'].lineData[323]++;
  if (visit26_323_1(!(domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(src)))) {
    _$jscoverage['/base/dom-event.js'].lineData[324]++;
    return;
  }
  _$jscoverage['/base/dom-event.js'].lineData[326]++;
  var srcData = DomEventUtils.data(src);
  _$jscoverage['/base/dom-event.js'].lineData[327]++;
  if (visit27_327_1(srcData && visit28_327_2(srcData === DomEventUtils.data(dest)))) {
    _$jscoverage['/base/dom-event.js'].lineData[330]++;
    DomEventUtils.removeData(dest);
  }
  _$jscoverage['/base/dom-event.js'].lineData[332]++;
  domEventObservables = domEventObservablesHolder.observables;
  _$jscoverage['/base/dom-event.js'].lineData[333]++;
  S.each(domEventObservables, function(customEvent, type) {
  _$jscoverage['/base/dom-event.js'].functionData[15]++;
  _$jscoverage['/base/dom-event.js'].lineData[334]++;
  S.each(customEvent.observers, function(observer) {
  _$jscoverage['/base/dom-event.js'].functionData[16]++;
  _$jscoverage['/base/dom-event.js'].lineData[338]++;
  addInternal(dest, type, observer);
});
});
}};
  _$jscoverage['/base/dom-event.js'].lineData[344]++;
  return DomEvent;
}, {
  requires: ['event/base', './utils', 'dom', './special', './observable', './object']});
