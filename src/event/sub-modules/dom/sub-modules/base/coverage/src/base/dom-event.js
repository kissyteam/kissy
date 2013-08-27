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
  _$jscoverage['/base/dom-event.js'].lineData[8] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[10] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[12] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[13] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[18] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[21] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[22] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[25] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[28] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[29] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[34] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[35] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[38] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[40] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[41] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[45] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[48] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[50] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[52] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[53] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[54] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[55] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[56] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[58] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[60] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[63] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[64] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[68] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[70] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[71] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[76] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[79] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[81] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[84] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[86] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[88] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[90] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[92] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[95] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[96] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[100] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[101] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[102] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[104] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[107] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[109] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[110] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[114] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[131] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[133] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[134] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[135] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[136] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[137] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[138] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[142] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[162] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[164] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[166] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[172] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[174] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[175] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[176] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[178] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[179] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[180] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[181] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[188] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[203] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[220] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[238] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[240] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[246] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[248] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[250] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[255] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[258] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[259] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[261] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[265] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[267] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[270] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[272] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[273] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[274] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[277] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[278] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[283] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[284] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[285] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[286] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[292] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[307] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[319] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[321] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[322] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[324] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[325] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[328] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[330] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[331] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[332] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[336] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[342] = 0;
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
  _$jscoverage['/base/dom-event.js'].branchData['13'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['18'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['40'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['48'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['48'][2] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['49'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['53'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['63'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['70'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['93'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['95'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['100'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['109'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['136'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['174'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['178'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['180'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['240'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['265'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['272'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['277'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['283'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['285'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['321'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['325'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['325'][2] = new BranchData();
}
_$jscoverage['/base/dom-event.js'].branchData['325'][2].init(307, 36, 'srcData === DomEventUtils.data(dest)');
function visit26_325_2(result) {
  _$jscoverage['/base/dom-event.js'].branchData['325'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['325'][1].init(296, 47, 'srcData && srcData === DomEventUtils.data(dest)');
function visit25_325_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['321'][1].init(100, 83, '!(domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(src))');
function visit24_321_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['285'][1].init(109, 13, 'ret !== false');
function visit23_285_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['283'][1].init(553, 18, 'domEventObservable');
function visit22_283_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['277'][1].init(265, 36, '!onlyHandlers && !domEventObservable');
function visit21_277_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['272'][1].init(700, 6, 'i >= 0');
function visit20_272_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['265'][1].init(485, 14, 's && s.typeFix');
function visit19_265_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['240'][1].init(115, 15, 'eventData || {}');
function visit18_240_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['180'][1].init(125, 6, 'j >= 0');
function visit17_180_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['178'][1].init(156, 34, 'cfg.deep && t.getElementsByTagName');
function visit16_178_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['174'][1].init(276, 6, 'i >= 0');
function visit15_174_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['136'][1].init(159, 6, 'i >= 0');
function visit14_136_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['109'][1].init(684, 11, 'customEvent');
function visit13_109_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['100'][1].init(456, 5, '!type');
function visit12_100_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['95'][1].init(317, 50, '!domEventObservablesHolder || !domEventObservables');
function visit11_95_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['93'][1].init(131, 31, 'domEventObservablesHolder || {}');
function visit10_93_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['70'][1].init(1690, 19, '!domEventObservable');
function visit9_70_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['63'][1].init(1393, 62, '!(domEventObservables = domEventObservablesHolder.observables)');
function visit8_63_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['53'][1].init(589, 18, 'domEventObservable');
function visit7_53_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['49'][1].init(65, 27, 'typeof KISSY == \'undefined\'');
function visit6_49_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['48'][2].init(312, 41, 'DomEventObservable.triggeredEvent == type');
function visit5_48_2(result) {
  _$jscoverage['/base/dom-event.js'].branchData['48'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['48'][1].init(312, 93, 'DomEventObservable.triggeredEvent == type || typeof KISSY == \'undefined\'');
function visit4_48_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['40'][1].init(336, 44, '!(handle = domEventObservablesHolder.handle)');
function visit3_40_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['18'][1].init(180, 42, '!cfg.originalType && (typeFix = s.typeFix)');
function visit2_18_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['13'][1].init(18, 19, 'Special[type] || {}');
function visit1_13_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].lineData[6]++;
KISSY.add('event/dom/base/dom-event', function(S, BaseEvent, DomEventUtils, Dom, Special, DomEventObservable, DomEventObject) {
  _$jscoverage['/base/dom-event.js'].functionData[0]++;
  _$jscoverage['/base/dom-event.js'].lineData[8]++;
  var BaseUtils = BaseEvent.Utils;
  _$jscoverage['/base/dom-event.js'].lineData[10]++;
  var DomEvent = {};
  _$jscoverage['/base/dom-event.js'].lineData[12]++;
  function fixType(cfg, type) {
    _$jscoverage['/base/dom-event.js'].functionData[1]++;
    _$jscoverage['/base/dom-event.js'].lineData[13]++;
    var s = visit1_13_1(Special[type] || {}), typeFix;
    _$jscoverage['/base/dom-event.js'].lineData[18]++;
    if (visit2_18_1(!cfg.originalType && (typeFix = s.typeFix))) {
      _$jscoverage['/base/dom-event.js'].lineData[21]++;
      cfg.originalType = type;
      _$jscoverage['/base/dom-event.js'].lineData[22]++;
      type = typeFix;
    }
    _$jscoverage['/base/dom-event.js'].lineData[25]++;
    return type;
  }
  _$jscoverage['/base/dom-event.js'].lineData[28]++;
  function addInternal(currentTarget, type, cfg) {
    _$jscoverage['/base/dom-event.js'].functionData[2]++;
    _$jscoverage['/base/dom-event.js'].lineData[29]++;
    var domEventObservablesHolder, domEventObservable, domEventObservables, handle;
    _$jscoverage['/base/dom-event.js'].lineData[34]++;
    cfg = S.merge(cfg);
    _$jscoverage['/base/dom-event.js'].lineData[35]++;
    type = fixType(cfg, type);
    _$jscoverage['/base/dom-event.js'].lineData[38]++;
    domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(currentTarget, 1);
    _$jscoverage['/base/dom-event.js'].lineData[40]++;
    if (visit3_40_1(!(handle = domEventObservablesHolder.handle))) {
      _$jscoverage['/base/dom-event.js'].lineData[41]++;
      handle = domEventObservablesHolder.handle = function(event) {
  _$jscoverage['/base/dom-event.js'].functionData[3]++;
  _$jscoverage['/base/dom-event.js'].lineData[45]++;
  var type = event.type, domEventObservable, currentTarget = handle.currentTarget;
  _$jscoverage['/base/dom-event.js'].lineData[48]++;
  if (visit4_48_1(visit5_48_2(DomEventObservable.triggeredEvent == type) || visit6_49_1(typeof KISSY == 'undefined'))) {
    _$jscoverage['/base/dom-event.js'].lineData[50]++;
    return undefined;
  }
  _$jscoverage['/base/dom-event.js'].lineData[52]++;
  domEventObservable = DomEventObservable.getDomEventObservable(currentTarget, type);
  _$jscoverage['/base/dom-event.js'].lineData[53]++;
  if (visit7_53_1(domEventObservable)) {
    _$jscoverage['/base/dom-event.js'].lineData[54]++;
    event.currentTarget = currentTarget;
    _$jscoverage['/base/dom-event.js'].lineData[55]++;
    event = new DomEventObject(event);
    _$jscoverage['/base/dom-event.js'].lineData[56]++;
    return domEventObservable.notify(event);
  }
  _$jscoverage['/base/dom-event.js'].lineData[58]++;
  return undefined;
};
      _$jscoverage['/base/dom-event.js'].lineData[60]++;
      handle.currentTarget = currentTarget;
    }
    _$jscoverage['/base/dom-event.js'].lineData[63]++;
    if (visit8_63_1(!(domEventObservables = domEventObservablesHolder.observables))) {
      _$jscoverage['/base/dom-event.js'].lineData[64]++;
      domEventObservables = domEventObservablesHolder.observables = {};
    }
    _$jscoverage['/base/dom-event.js'].lineData[68]++;
    domEventObservable = domEventObservables[type];
    _$jscoverage['/base/dom-event.js'].lineData[70]++;
    if (visit9_70_1(!domEventObservable)) {
      _$jscoverage['/base/dom-event.js'].lineData[71]++;
      domEventObservable = domEventObservables[type] = new DomEventObservable({
  type: type, 
  currentTarget: currentTarget});
      _$jscoverage['/base/dom-event.js'].lineData[76]++;
      domEventObservable.setup();
    }
    _$jscoverage['/base/dom-event.js'].lineData[79]++;
    domEventObservable.on(cfg);
    _$jscoverage['/base/dom-event.js'].lineData[81]++;
    currentTarget = null;
  }
  _$jscoverage['/base/dom-event.js'].lineData[84]++;
  function removeInternal(currentTarget, type, cfg) {
    _$jscoverage['/base/dom-event.js'].functionData[4]++;
    _$jscoverage['/base/dom-event.js'].lineData[86]++;
    cfg = S.merge(cfg);
    _$jscoverage['/base/dom-event.js'].lineData[88]++;
    var customEvent;
    _$jscoverage['/base/dom-event.js'].lineData[90]++;
    type = fixType(cfg, type);
    _$jscoverage['/base/dom-event.js'].lineData[92]++;
    var domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(currentTarget), domEventObservables = (visit10_93_1(domEventObservablesHolder || {})).observables;
    _$jscoverage['/base/dom-event.js'].lineData[95]++;
    if (visit11_95_1(!domEventObservablesHolder || !domEventObservables)) {
      _$jscoverage['/base/dom-event.js'].lineData[96]++;
      return;
    }
    _$jscoverage['/base/dom-event.js'].lineData[100]++;
    if (visit12_100_1(!type)) {
      _$jscoverage['/base/dom-event.js'].lineData[101]++;
      for (type in domEventObservables) {
        _$jscoverage['/base/dom-event.js'].lineData[102]++;
        domEventObservables[type].detach(cfg);
      }
      _$jscoverage['/base/dom-event.js'].lineData[104]++;
      return;
    }
    _$jscoverage['/base/dom-event.js'].lineData[107]++;
    customEvent = domEventObservables[type];
    _$jscoverage['/base/dom-event.js'].lineData[109]++;
    if (visit13_109_1(customEvent)) {
      _$jscoverage['/base/dom-event.js'].lineData[110]++;
      customEvent.detach(cfg);
    }
  }
  _$jscoverage['/base/dom-event.js'].lineData[114]++;
  S.mix(DomEvent, {
  on: function(targets, type, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[5]++;
  _$jscoverage['/base/dom-event.js'].lineData[131]++;
  targets = Dom.query(targets);
  _$jscoverage['/base/dom-event.js'].lineData[133]++;
  BaseUtils.batchForType(function(targets, type, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[6]++;
  _$jscoverage['/base/dom-event.js'].lineData[134]++;
  var cfg = BaseUtils.normalizeParam(type, fn, context), i, t;
  _$jscoverage['/base/dom-event.js'].lineData[135]++;
  type = cfg.type;
  _$jscoverage['/base/dom-event.js'].lineData[136]++;
  for (i = targets.length - 1; visit14_136_1(i >= 0); i--) {
    _$jscoverage['/base/dom-event.js'].lineData[137]++;
    t = targets[i];
    _$jscoverage['/base/dom-event.js'].lineData[138]++;
    addInternal(t, type, cfg);
  }
}, 1, targets, type, fn, context);
  _$jscoverage['/base/dom-event.js'].lineData[142]++;
  return targets;
}, 
  detach: function(targets, type, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[7]++;
  _$jscoverage['/base/dom-event.js'].lineData[162]++;
  targets = Dom.query(targets);
  _$jscoverage['/base/dom-event.js'].lineData[164]++;
  BaseUtils.batchForType(function(targets, singleType, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[8]++;
  _$jscoverage['/base/dom-event.js'].lineData[166]++;
  var cfg = BaseUtils.normalizeParam(singleType, fn, context), i, j, elChildren, t;
  _$jscoverage['/base/dom-event.js'].lineData[172]++;
  singleType = cfg.type;
  _$jscoverage['/base/dom-event.js'].lineData[174]++;
  for (i = targets.length - 1; visit15_174_1(i >= 0); i--) {
    _$jscoverage['/base/dom-event.js'].lineData[175]++;
    t = targets[i];
    _$jscoverage['/base/dom-event.js'].lineData[176]++;
    removeInternal(t, singleType, cfg);
    _$jscoverage['/base/dom-event.js'].lineData[178]++;
    if (visit16_178_1(cfg.deep && t.getElementsByTagName)) {
      _$jscoverage['/base/dom-event.js'].lineData[179]++;
      elChildren = t.getElementsByTagName('*');
      _$jscoverage['/base/dom-event.js'].lineData[180]++;
      for (j = elChildren.length - 1; visit17_180_1(j >= 0); j--) {
        _$jscoverage['/base/dom-event.js'].lineData[181]++;
        removeInternal(elChildren[j], singleType, cfg);
      }
    }
  }
}, 1, targets, type, fn, context);
  _$jscoverage['/base/dom-event.js'].lineData[188]++;
  return targets;
}, 
  delegate: function(targets, eventType, filter, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[9]++;
  _$jscoverage['/base/dom-event.js'].lineData[203]++;
  return DomEvent.on(targets, eventType, {
  fn: fn, 
  context: context, 
  filter: filter});
}, 
  undelegate: function(targets, eventType, filter, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[10]++;
  _$jscoverage['/base/dom-event.js'].lineData[220]++;
  return DomEvent.detach(targets, eventType, {
  fn: fn, 
  context: context, 
  filter: filter});
}, 
  fire: function(targets, eventType, eventData, onlyHandlers) {
  _$jscoverage['/base/dom-event.js'].functionData[11]++;
  _$jscoverage['/base/dom-event.js'].lineData[238]++;
  var ret = undefined;
  _$jscoverage['/base/dom-event.js'].lineData[240]++;
  eventData = visit18_240_1(eventData || {});
  _$jscoverage['/base/dom-event.js'].lineData[246]++;
  eventData.synthetic = 1;
  _$jscoverage['/base/dom-event.js'].lineData[248]++;
  BaseUtils.splitAndRun(eventType, function(eventType) {
  _$jscoverage['/base/dom-event.js'].functionData[12]++;
  _$jscoverage['/base/dom-event.js'].lineData[250]++;
  var r, i, target, domEventObservable;
  _$jscoverage['/base/dom-event.js'].lineData[255]++;
  BaseUtils.fillGroupsForEvent(eventType, eventData);
  _$jscoverage['/base/dom-event.js'].lineData[258]++;
  eventType = eventData.type;
  _$jscoverage['/base/dom-event.js'].lineData[259]++;
  var s = Special[eventType];
  _$jscoverage['/base/dom-event.js'].lineData[261]++;
  var originalType = eventType;
  _$jscoverage['/base/dom-event.js'].lineData[265]++;
  if (visit19_265_1(s && s.typeFix)) {
    _$jscoverage['/base/dom-event.js'].lineData[267]++;
    originalType = s.typeFix;
  }
  _$jscoverage['/base/dom-event.js'].lineData[270]++;
  targets = Dom.query(targets);
  _$jscoverage['/base/dom-event.js'].lineData[272]++;
  for (i = targets.length - 1; visit20_272_1(i >= 0); i--) {
    _$jscoverage['/base/dom-event.js'].lineData[273]++;
    target = targets[i];
    _$jscoverage['/base/dom-event.js'].lineData[274]++;
    domEventObservable = DomEventObservable.getDomEventObservable(target, originalType);
    _$jscoverage['/base/dom-event.js'].lineData[277]++;
    if (visit21_277_1(!onlyHandlers && !domEventObservable)) {
      _$jscoverage['/base/dom-event.js'].lineData[278]++;
      domEventObservable = new DomEventObservable({
  type: originalType, 
  currentTarget: target});
    }
    _$jscoverage['/base/dom-event.js'].lineData[283]++;
    if (visit22_283_1(domEventObservable)) {
      _$jscoverage['/base/dom-event.js'].lineData[284]++;
      r = domEventObservable.fire(eventData, onlyHandlers);
      _$jscoverage['/base/dom-event.js'].lineData[285]++;
      if (visit23_285_1(ret !== false)) {
        _$jscoverage['/base/dom-event.js'].lineData[286]++;
        ret = r;
      }
    }
  }
});
  _$jscoverage['/base/dom-event.js'].lineData[292]++;
  return ret;
}, 
  fireHandler: function(targets, eventType, eventData) {
  _$jscoverage['/base/dom-event.js'].functionData[13]++;
  _$jscoverage['/base/dom-event.js'].lineData[307]++;
  return DomEvent.fire(targets, eventType, eventData, 1);
}, 
  clone: function(src, dest) {
  _$jscoverage['/base/dom-event.js'].functionData[14]++;
  _$jscoverage['/base/dom-event.js'].lineData[319]++;
  var domEventObservablesHolder, domEventObservables;
  _$jscoverage['/base/dom-event.js'].lineData[321]++;
  if (visit24_321_1(!(domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(src)))) {
    _$jscoverage['/base/dom-event.js'].lineData[322]++;
    return;
  }
  _$jscoverage['/base/dom-event.js'].lineData[324]++;
  var srcData = DomEventUtils.data(src);
  _$jscoverage['/base/dom-event.js'].lineData[325]++;
  if (visit25_325_1(srcData && visit26_325_2(srcData === DomEventUtils.data(dest)))) {
    _$jscoverage['/base/dom-event.js'].lineData[328]++;
    DomEventUtils.removeData(dest);
  }
  _$jscoverage['/base/dom-event.js'].lineData[330]++;
  domEventObservables = domEventObservablesHolder.observables;
  _$jscoverage['/base/dom-event.js'].lineData[331]++;
  S.each(domEventObservables, function(customEvent, type) {
  _$jscoverage['/base/dom-event.js'].functionData[15]++;
  _$jscoverage['/base/dom-event.js'].lineData[332]++;
  S.each(customEvent.observers, function(observer) {
  _$jscoverage['/base/dom-event.js'].functionData[16]++;
  _$jscoverage['/base/dom-event.js'].lineData[336]++;
  addInternal(dest, type, observer);
});
});
}});
  _$jscoverage['/base/dom-event.js'].lineData[342]++;
  return DomEvent;
}, {
  requires: ['event/base', './utils', 'dom', './special', './observable', './object']});
