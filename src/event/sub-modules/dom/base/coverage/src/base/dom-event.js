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
  _$jscoverage['/base/dom-event.js'].lineData[8] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[9] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[10] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[11] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[12] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[14] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[16] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[17] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[22] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[25] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[26] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[29] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[32] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[33] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[38] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[39] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[42] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[44] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[45] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[49] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[52] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[54] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[56] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[57] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[58] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[59] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[60] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[62] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[64] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[67] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[68] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[72] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[74] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[75] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[80] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[83] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[85] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[88] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[90] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[92] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[94] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[96] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[99] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[100] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[104] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[105] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[106] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[108] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[111] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[113] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[114] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[123] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[139] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[141] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[142] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[143] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[144] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[145] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[146] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[150] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[169] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[171] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[173] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[179] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[181] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[182] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[183] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[185] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[186] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[187] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[188] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[195] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[210] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[227] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[245] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[247] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[253] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[255] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[257] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[262] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[265] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[266] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[268] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[272] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[274] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[277] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[279] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[280] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[281] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[284] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[285] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[290] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[291] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[292] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[293] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[299] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[314] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[326] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[328] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[329] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[331] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[332] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[335] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[337] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[338] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[339] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[343] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[349] = 0;
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
  _$jscoverage['/base/dom-event.js'].branchData['17'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['22'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['44'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['52'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['52'][2] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['53'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['57'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['67'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['74'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['97'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['99'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['104'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['113'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['144'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['181'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['185'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['187'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['247'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['272'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['279'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['284'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['290'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['292'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['292'][2] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['292'][3] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['328'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['332'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['332'][2] = new BranchData();
}
_$jscoverage['/base/dom-event.js'].branchData['332'][2].init(300, 36, 'srcData === DomEventUtils.data(dest)');
function visit28_332_2(result) {
  _$jscoverage['/base/dom-event.js'].branchData['332'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['332'][1].init(289, 47, 'srcData && srcData === DomEventUtils.data(dest)');
function visit27_332_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['328'][1].init(97, 83, '!(domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(src))');
function visit26_328_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['292'][3].init(124, 15, 'r !== undefined');
function visit25_292_3(result) {
  _$jscoverage['/base/dom-event.js'].branchData['292'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['292'][2].init(107, 13, 'ret !== false');
function visit24_292_2(result) {
  _$jscoverage['/base/dom-event.js'].branchData['292'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['292'][1].init(107, 32, 'ret !== false && r !== undefined');
function visit23_292_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['290'][1].init(542, 18, 'domEventObservable');
function visit22_290_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['284'][1].init(260, 36, '!onlyHandlers && !domEventObservable');
function visit21_284_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['279'][1].init(676, 6, 'i >= 0');
function visit20_279_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['272'][1].init(468, 14, 's && s.typeFix');
function visit19_272_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['247'][1].init(100, 15, 'eventData || {}');
function visit18_247_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['187'][1].init(123, 6, 'j >= 0');
function visit17_187_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['185'][1].init(152, 34, 'cfg.deep && t.getElementsByTagName');
function visit16_185_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['181'][1].init(266, 6, 'i >= 0');
function visit15_181_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['144'][1].init(156, 6, 'i >= 0');
function visit14_144_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['113'][1].init(659, 11, 'customEvent');
function visit13_113_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['104'][1].init(440, 5, '!type');
function visit12_104_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['99'][1].init(306, 50, '!domEventObservablesHolder || !domEventObservables');
function visit11_99_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['97'][1].init(130, 31, 'domEventObservablesHolder || {}');
function visit10_97_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['74'][1].init(1650, 19, '!domEventObservable');
function visit9_74_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['67'][1].init(1360, 62, '!(domEventObservables = domEventObservablesHolder.observables)');
function visit8_67_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['57'][1].init(579, 18, 'domEventObservable');
function visit7_57_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['53'][1].init(65, 28, 'typeof KISSY === \'undefined\'');
function visit6_53_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['52'][2].init(305, 42, 'DomEventObservable.triggeredEvent === type');
function visit5_52_2(result) {
  _$jscoverage['/base/dom-event.js'].branchData['52'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['52'][1].init(305, 94, 'DomEventObservable.triggeredEvent === type || typeof KISSY === \'undefined\'');
function visit4_52_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['44'][1].init(324, 44, '!(handle = domEventObservablesHolder.handle)');
function visit3_44_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['22'][1].init(174, 42, '!cfg.originalType && (typeFix = s.typeFix)');
function visit2_22_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['17'][1].init(17, 19, 'Special[type] || {}');
function visit1_17_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/dom-event.js'].functionData[0]++;
  _$jscoverage['/base/dom-event.js'].lineData[7]++;
  var BaseEvent = require('event/base');
  _$jscoverage['/base/dom-event.js'].lineData[8]++;
  var DomEventUtils = require('./utils');
  _$jscoverage['/base/dom-event.js'].lineData[9]++;
  var Dom = require('dom');
  _$jscoverage['/base/dom-event.js'].lineData[10]++;
  var Special = require('./special');
  _$jscoverage['/base/dom-event.js'].lineData[11]++;
  var DomEventObservable = require('./observable');
  _$jscoverage['/base/dom-event.js'].lineData[12]++;
  var DomEventObject = require('./object');
  _$jscoverage['/base/dom-event.js'].lineData[14]++;
  var BaseUtils = BaseEvent.Utils;
  _$jscoverage['/base/dom-event.js'].lineData[16]++;
  function fixType(cfg, type) {
    _$jscoverage['/base/dom-event.js'].functionData[1]++;
    _$jscoverage['/base/dom-event.js'].lineData[17]++;
    var s = visit1_17_1(Special[type] || {}), typeFix;
    _$jscoverage['/base/dom-event.js'].lineData[22]++;
    if (visit2_22_1(!cfg.originalType && (typeFix = s.typeFix))) {
      _$jscoverage['/base/dom-event.js'].lineData[25]++;
      cfg.originalType = type;
      _$jscoverage['/base/dom-event.js'].lineData[26]++;
      type = typeFix;
    }
    _$jscoverage['/base/dom-event.js'].lineData[29]++;
    return type;
  }
  _$jscoverage['/base/dom-event.js'].lineData[32]++;
  function addInternal(currentTarget, type, cfg) {
    _$jscoverage['/base/dom-event.js'].functionData[2]++;
    _$jscoverage['/base/dom-event.js'].lineData[33]++;
    var domEventObservablesHolder, domEventObservable, domEventObservables, handle;
    _$jscoverage['/base/dom-event.js'].lineData[38]++;
    cfg = S.merge(cfg);
    _$jscoverage['/base/dom-event.js'].lineData[39]++;
    type = fixType(cfg, type);
    _$jscoverage['/base/dom-event.js'].lineData[42]++;
    domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(currentTarget, 1);
    _$jscoverage['/base/dom-event.js'].lineData[44]++;
    if (visit3_44_1(!(handle = domEventObservablesHolder.handle))) {
      _$jscoverage['/base/dom-event.js'].lineData[45]++;
      handle = domEventObservablesHolder.handle = function(event) {
  _$jscoverage['/base/dom-event.js'].functionData[3]++;
  _$jscoverage['/base/dom-event.js'].lineData[49]++;
  var type = event.type, domEventObservable, currentTarget = handle.currentTarget;
  _$jscoverage['/base/dom-event.js'].lineData[52]++;
  if (visit4_52_1(visit5_52_2(DomEventObservable.triggeredEvent === type) || visit6_53_1(typeof KISSY === 'undefined'))) {
    _$jscoverage['/base/dom-event.js'].lineData[54]++;
    return undefined;
  }
  _$jscoverage['/base/dom-event.js'].lineData[56]++;
  domEventObservable = DomEventObservable.getDomEventObservable(currentTarget, type);
  _$jscoverage['/base/dom-event.js'].lineData[57]++;
  if (visit7_57_1(domEventObservable)) {
    _$jscoverage['/base/dom-event.js'].lineData[58]++;
    event.currentTarget = currentTarget;
    _$jscoverage['/base/dom-event.js'].lineData[59]++;
    event = new DomEventObject(event);
    _$jscoverage['/base/dom-event.js'].lineData[60]++;
    return domEventObservable.notify(event);
  }
  _$jscoverage['/base/dom-event.js'].lineData[62]++;
  return undefined;
};
      _$jscoverage['/base/dom-event.js'].lineData[64]++;
      handle.currentTarget = currentTarget;
    }
    _$jscoverage['/base/dom-event.js'].lineData[67]++;
    if (visit8_67_1(!(domEventObservables = domEventObservablesHolder.observables))) {
      _$jscoverage['/base/dom-event.js'].lineData[68]++;
      domEventObservables = domEventObservablesHolder.observables = {};
    }
    _$jscoverage['/base/dom-event.js'].lineData[72]++;
    domEventObservable = domEventObservables[type];
    _$jscoverage['/base/dom-event.js'].lineData[74]++;
    if (visit9_74_1(!domEventObservable)) {
      _$jscoverage['/base/dom-event.js'].lineData[75]++;
      domEventObservable = domEventObservables[type] = new DomEventObservable({
  type: type, 
  currentTarget: currentTarget});
      _$jscoverage['/base/dom-event.js'].lineData[80]++;
      domEventObservable.setup();
    }
    _$jscoverage['/base/dom-event.js'].lineData[83]++;
    domEventObservable.on(cfg);
    _$jscoverage['/base/dom-event.js'].lineData[85]++;
    currentTarget = null;
  }
  _$jscoverage['/base/dom-event.js'].lineData[88]++;
  function removeInternal(currentTarget, type, cfg) {
    _$jscoverage['/base/dom-event.js'].functionData[4]++;
    _$jscoverage['/base/dom-event.js'].lineData[90]++;
    cfg = S.merge(cfg);
    _$jscoverage['/base/dom-event.js'].lineData[92]++;
    var customEvent;
    _$jscoverage['/base/dom-event.js'].lineData[94]++;
    type = fixType(cfg, type);
    _$jscoverage['/base/dom-event.js'].lineData[96]++;
    var domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(currentTarget), domEventObservables = (visit10_97_1(domEventObservablesHolder || {})).observables;
    _$jscoverage['/base/dom-event.js'].lineData[99]++;
    if (visit11_99_1(!domEventObservablesHolder || !domEventObservables)) {
      _$jscoverage['/base/dom-event.js'].lineData[100]++;
      return;
    }
    _$jscoverage['/base/dom-event.js'].lineData[104]++;
    if (visit12_104_1(!type)) {
      _$jscoverage['/base/dom-event.js'].lineData[105]++;
      for (type in domEventObservables) {
        _$jscoverage['/base/dom-event.js'].lineData[106]++;
        domEventObservables[type].detach(cfg);
      }
      _$jscoverage['/base/dom-event.js'].lineData[108]++;
      return;
    }
    _$jscoverage['/base/dom-event.js'].lineData[111]++;
    customEvent = domEventObservables[type];
    _$jscoverage['/base/dom-event.js'].lineData[113]++;
    if (visit13_113_1(customEvent)) {
      _$jscoverage['/base/dom-event.js'].lineData[114]++;
      customEvent.detach(cfg);
    }
  }
  _$jscoverage['/base/dom-event.js'].lineData[123]++;
  var DomEvent = {
  on: function(targets, type, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[5]++;
  _$jscoverage['/base/dom-event.js'].lineData[139]++;
  targets = Dom.query(targets);
  _$jscoverage['/base/dom-event.js'].lineData[141]++;
  BaseUtils.batchForType(function(targets, type, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[6]++;
  _$jscoverage['/base/dom-event.js'].lineData[142]++;
  var cfg = BaseUtils.normalizeParam(type, fn, context), i, t;
  _$jscoverage['/base/dom-event.js'].lineData[143]++;
  type = cfg.type;
  _$jscoverage['/base/dom-event.js'].lineData[144]++;
  for (i = targets.length - 1; visit14_144_1(i >= 0); i--) {
    _$jscoverage['/base/dom-event.js'].lineData[145]++;
    t = targets[i];
    _$jscoverage['/base/dom-event.js'].lineData[146]++;
    addInternal(t, type, cfg);
  }
}, 1, targets, type, fn, context);
  _$jscoverage['/base/dom-event.js'].lineData[150]++;
  return targets;
}, 
  detach: function(targets, type, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[7]++;
  _$jscoverage['/base/dom-event.js'].lineData[169]++;
  targets = Dom.query(targets);
  _$jscoverage['/base/dom-event.js'].lineData[171]++;
  BaseUtils.batchForType(function(targets, singleType, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[8]++;
  _$jscoverage['/base/dom-event.js'].lineData[173]++;
  var cfg = BaseUtils.normalizeParam(singleType, fn, context), i, j, elChildren, t;
  _$jscoverage['/base/dom-event.js'].lineData[179]++;
  singleType = cfg.type;
  _$jscoverage['/base/dom-event.js'].lineData[181]++;
  for (i = targets.length - 1; visit15_181_1(i >= 0); i--) {
    _$jscoverage['/base/dom-event.js'].lineData[182]++;
    t = targets[i];
    _$jscoverage['/base/dom-event.js'].lineData[183]++;
    removeInternal(t, singleType, cfg);
    _$jscoverage['/base/dom-event.js'].lineData[185]++;
    if (visit16_185_1(cfg.deep && t.getElementsByTagName)) {
      _$jscoverage['/base/dom-event.js'].lineData[186]++;
      elChildren = t.getElementsByTagName('*');
      _$jscoverage['/base/dom-event.js'].lineData[187]++;
      for (j = elChildren.length - 1; visit17_187_1(j >= 0); j--) {
        _$jscoverage['/base/dom-event.js'].lineData[188]++;
        removeInternal(elChildren[j], singleType, cfg);
      }
    }
  }
}, 1, targets, type, fn, context);
  _$jscoverage['/base/dom-event.js'].lineData[195]++;
  return targets;
}, 
  delegate: function(targets, eventType, filter, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[9]++;
  _$jscoverage['/base/dom-event.js'].lineData[210]++;
  return DomEvent.on(targets, eventType, {
  fn: fn, 
  context: context, 
  filter: filter});
}, 
  undelegate: function(targets, eventType, filter, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[10]++;
  _$jscoverage['/base/dom-event.js'].lineData[227]++;
  return DomEvent.detach(targets, eventType, {
  fn: fn, 
  context: context, 
  filter: filter});
}, 
  fire: function(targets, eventType, eventData, onlyHandlers) {
  _$jscoverage['/base/dom-event.js'].functionData[11]++;
  _$jscoverage['/base/dom-event.js'].lineData[245]++;
  var ret;
  _$jscoverage['/base/dom-event.js'].lineData[247]++;
  eventData = visit18_247_1(eventData || {});
  _$jscoverage['/base/dom-event.js'].lineData[253]++;
  eventData.synthetic = 1;
  _$jscoverage['/base/dom-event.js'].lineData[255]++;
  BaseUtils.splitAndRun(eventType, function(eventType) {
  _$jscoverage['/base/dom-event.js'].functionData[12]++;
  _$jscoverage['/base/dom-event.js'].lineData[257]++;
  var r, i, target, domEventObservable;
  _$jscoverage['/base/dom-event.js'].lineData[262]++;
  BaseUtils.fillGroupsForEvent(eventType, eventData);
  _$jscoverage['/base/dom-event.js'].lineData[265]++;
  eventType = eventData.type;
  _$jscoverage['/base/dom-event.js'].lineData[266]++;
  var s = Special[eventType];
  _$jscoverage['/base/dom-event.js'].lineData[268]++;
  var originalType = eventType;
  _$jscoverage['/base/dom-event.js'].lineData[272]++;
  if (visit19_272_1(s && s.typeFix)) {
    _$jscoverage['/base/dom-event.js'].lineData[274]++;
    originalType = s.typeFix;
  }
  _$jscoverage['/base/dom-event.js'].lineData[277]++;
  targets = Dom.query(targets);
  _$jscoverage['/base/dom-event.js'].lineData[279]++;
  for (i = targets.length - 1; visit20_279_1(i >= 0); i--) {
    _$jscoverage['/base/dom-event.js'].lineData[280]++;
    target = targets[i];
    _$jscoverage['/base/dom-event.js'].lineData[281]++;
    domEventObservable = DomEventObservable.getDomEventObservable(target, originalType);
    _$jscoverage['/base/dom-event.js'].lineData[284]++;
    if (visit21_284_1(!onlyHandlers && !domEventObservable)) {
      _$jscoverage['/base/dom-event.js'].lineData[285]++;
      domEventObservable = new DomEventObservable({
  type: originalType, 
  currentTarget: target});
    }
    _$jscoverage['/base/dom-event.js'].lineData[290]++;
    if (visit22_290_1(domEventObservable)) {
      _$jscoverage['/base/dom-event.js'].lineData[291]++;
      r = domEventObservable.fire(eventData, onlyHandlers);
      _$jscoverage['/base/dom-event.js'].lineData[292]++;
      if (visit23_292_1(visit24_292_2(ret !== false) && visit25_292_3(r !== undefined))) {
        _$jscoverage['/base/dom-event.js'].lineData[293]++;
        ret = r;
      }
    }
  }
});
  _$jscoverage['/base/dom-event.js'].lineData[299]++;
  return ret;
}, 
  fireHandler: function(targets, eventType, eventData) {
  _$jscoverage['/base/dom-event.js'].functionData[13]++;
  _$jscoverage['/base/dom-event.js'].lineData[314]++;
  return DomEvent.fire(targets, eventType, eventData, 1);
}, 
  clone: function(src, dest) {
  _$jscoverage['/base/dom-event.js'].functionData[14]++;
  _$jscoverage['/base/dom-event.js'].lineData[326]++;
  var domEventObservablesHolder, domEventObservables;
  _$jscoverage['/base/dom-event.js'].lineData[328]++;
  if (visit26_328_1(!(domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(src)))) {
    _$jscoverage['/base/dom-event.js'].lineData[329]++;
    return;
  }
  _$jscoverage['/base/dom-event.js'].lineData[331]++;
  var srcData = DomEventUtils.data(src);
  _$jscoverage['/base/dom-event.js'].lineData[332]++;
  if (visit27_332_1(srcData && visit28_332_2(srcData === DomEventUtils.data(dest)))) {
    _$jscoverage['/base/dom-event.js'].lineData[335]++;
    DomEventUtils.removeData(dest);
  }
  _$jscoverage['/base/dom-event.js'].lineData[337]++;
  domEventObservables = domEventObservablesHolder.observables;
  _$jscoverage['/base/dom-event.js'].lineData[338]++;
  S.each(domEventObservables, function(customEvent, type) {
  _$jscoverage['/base/dom-event.js'].functionData[15]++;
  _$jscoverage['/base/dom-event.js'].lineData[339]++;
  S.each(customEvent.observers, function(observer) {
  _$jscoverage['/base/dom-event.js'].functionData[16]++;
  _$jscoverage['/base/dom-event.js'].lineData[343]++;
  addInternal(dest, type, observer);
});
});
}};
  _$jscoverage['/base/dom-event.js'].lineData[349]++;
  return DomEvent;
});
