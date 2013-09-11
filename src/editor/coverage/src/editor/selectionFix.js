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
if (! _$jscoverage['/editor/selectionFix.js']) {
  _$jscoverage['/editor/selectionFix.js'] = {};
  _$jscoverage['/editor/selectionFix.js'].lineData = [];
  _$jscoverage['/editor/selectionFix.js'].lineData[10] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[11] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[24] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[25] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[31] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[32] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[34] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[35] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[38] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[41] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[45] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[46] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[49] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[50] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[52] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[53] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[54] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[58] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[59] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[62] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[64] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[66] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[68] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[69] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[71] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[73] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[76] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[82] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[83] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[84] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[85] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[86] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[89] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[90] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[93] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[95] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[96] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[98] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[99] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[101] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[102] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[109] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[110] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[118] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[123] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[124] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[125] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[126] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[137] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[146] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[151] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[154] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[155] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[175] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[176] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[179] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[180] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[184] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[186] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[189] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[190] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[196] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[200] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[203] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[204] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[207] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[210] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[211] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[215] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[216] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[240] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[242] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[244] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[246] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[247] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[248] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[252] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[254] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[255] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[268] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[273] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[274] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[276] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[278] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[283] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[284] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[289] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[291] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[294] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[298] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[299] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[301] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[302] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[303] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[304] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[309] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[310] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[314] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[316] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[319] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[331] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[334] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[338] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[339] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[342] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[345] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[346] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[350] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[351] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[352] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[355] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[356] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[362] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[364] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[373] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[374] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[376] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[385] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[389] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[390] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[394] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[395] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[396] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[402] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[403] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[404] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[407] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[408] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[410] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[411] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[414] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[417] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[424] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[426] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[433] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[438] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[440] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[442] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[443] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[444] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[445] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[451] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[453] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[455] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[456] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[457] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[459] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[464] = 0;
}
if (! _$jscoverage['/editor/selectionFix.js'].functionData) {
  _$jscoverage['/editor/selectionFix.js'].functionData = [];
  _$jscoverage['/editor/selectionFix.js'].functionData[0] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[1] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[2] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[3] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[4] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[5] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[6] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[7] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[8] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[9] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[10] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[11] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[12] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[13] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[14] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[15] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[16] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[17] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[18] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[19] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[20] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[21] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[22] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[23] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[24] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[25] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[26] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[27] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[28] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[29] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[30] = 0;
}
if (! _$jscoverage['/editor/selectionFix.js'].branchData) {
  _$jscoverage['/editor/selectionFix.js'].branchData = {};
  _$jscoverage['/editor/selectionFix.js'].branchData['49'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['49'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['49'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['62'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['66'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['68'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['84'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['85'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['89'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['96'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['119'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['125'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['179'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['184'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['189'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['210'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['254'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['256'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['257'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['268'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['268'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['268'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['273'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['284'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['284'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['284'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['284'][4] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['285'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['286'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['287'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['291'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['346'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['346'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['352'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['356'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['367'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['373'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['374'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['375'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['376'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['378'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['380'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['380'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['380'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['380'][4] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['382'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['382'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['389'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['389'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['394'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['396'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['400'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['402'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['404'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['405'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['405'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['411'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['412'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['412'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['442'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['442'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['444'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['444'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['455'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['455'][1] = new BranchData();
}
_$jscoverage['/editor/selectionFix.js'].branchData['455'][1].init(86, 5, 'UA.ie');
function visit807_455_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['444'][1].init(100, 9, '!UA[\'ie\']');
function visit806_444_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['444'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['442'][1].init(3720, 41, 'lastPath.blockLimit.nodeName() !== \'body\'');
function visit805_442_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['442'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['412'][2].init(152, 48, 'element[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit804_412_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['412'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['412'][1].init(43, 113, 'element[0].nodeType == Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit803_412_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['411'][1].init(106, 157, 'element && element[0].nodeType == Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit802_411_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['405'][2].init(144, 48, 'element[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit801_405_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['405'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['405'][1].init(39, 111, 'element[0].nodeType == Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit800_405_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['404'][1].init(102, 151, 'element && element[0].nodeType == Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit799_404_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['402'][1].init(82, 28, 'isBlankParagraph(fixedBlock)');
function visit798_402_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['400'][1].init(220, 34, 'fixedBlock[0] != body[0].lastChild');
function visit797_400_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['396'][1].init(83, 255, 'fixedBlock && fixedBlock[0] != body[0].lastChild');
function visit796_396_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['394'][1].init(1426, 31, 'blockLimit.nodeName() == "body"');
function visit795_394_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['389'][2].init(1301, 30, '!range.collapsed || path.block');
function visit794_389_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['389'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['389'][1].init(1291, 40, '!range || !range.collapsed || path.block');
function visit793_389_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['382'][2].init(471, 29, 'pathBlock.nodeName() != \'pre\'');
function visit792_382_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['382'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['382'][1].init(132, 123, 'pathBlock.nodeName() != \'pre\' && !pathBlock._4e_getBogus()');
function visit791_382_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['380'][4].init(352, 25, 'lastNode[0].nodeType == 1');
function visit790_380_4(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['380'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['380'][3].init(352, 59, 'lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary()');
function visit789_380_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['380'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['380'][2].init(340, 71, 'lastNode && lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary()');
function visit788_380_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['380'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['380'][1].init(101, 256, '!(lastNode && lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary()) && pathBlock.nodeName() != \'pre\' && !pathBlock._4e_getBogus()');
function visit787_380_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['378'][1].init(72, 358, 'pathBlock._4e_isBlockBoundary() && !(lastNode && lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary()) && pathBlock.nodeName() != \'pre\' && !pathBlock._4e_getBogus()');
function visit786_378_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['376'][1].init(159, 431, 'pathBlock && pathBlock._4e_isBlockBoundary() && !(lastNode && lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary()) && pathBlock.nodeName() != \'pre\' && !pathBlock._4e_getBogus()');
function visit785_376_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['375'][1].init(78, 39, 'pathBlock && pathBlock.last(isNotEmpty)');
function visit784_375_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['374'][1].init(34, 29, 'path.block || path.blockLimit');
function visit783_374_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['373'][1].init(580, 11, 'UA[\'gecko\']');
function visit782_373_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['367'][1].init(153, 37, 'selection && selection.getRanges()[0]');
function visit781_367_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['356'][1].init(21, 44, 'isNotWhitespace(node) && isNotBookmark(node)');
function visit780_356_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['352'][1].init(62, 65, 'element._4e_isBlockBoundary() && dtd.$empty[element.nodeName()]');
function visit779_352_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['346'][2].init(46, 18, 'node.nodeType != 8');
function visit778_346_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['346'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['346'][1].init(21, 43, 'isNotWhitespace(node) && node.nodeType != 8');
function visit777_346_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['291'][1].init(1875, 33, 'nativeSel && sel.getRanges()[0]');
function visit776_291_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['287'][1].init(65, 109, '(parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit775_287_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['286'][1].init(63, 175, '(parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit774_286_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['285'][1].init(53, 239, '(parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit773_285_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['284'][4].init(1500, 27, 'nativeSel.type != \'Control\'');
function visit772_284_4(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['284'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['284'][3].init(1500, 293, 'nativeSel.type != \'Control\' && (parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit771_284_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['284'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['284'][2].init(1482, 311, 'nativeSel.type && nativeSel.type != \'Control\' && (parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit770_284_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['284'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['284'][1].init(1469, 324, 'nativeSel && nativeSel.type && nativeSel.type != \'Control\' && (parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit769_284_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['273'][1].init(281, 42, '!doc[\'queryCommandEnabled\'](\'InsertImage\')');
function visit768_273_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['268'][3].init(728, 26, 'type == KES.SELECTION_NONE');
function visit767_268_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['268'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['268'][2].init(715, 39, 'nativeSel && type == KES.SELECTION_NONE');
function visit766_268_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['268'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['268'][1].init(705, 49, 'testIt && nativeSel && type == KES.SELECTION_NONE');
function visit765_268_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['257'][1].init(115, 20, 'sel && doc.selection');
function visit764_257_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['256'][1].init(60, 20, 'sel && sel.getType()');
function visit763_256_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['254'][1].init(58, 11, 'saveEnabled');
function visit762_254_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['210'][1].init(181, 17, 'evt.relatedTarget');
function visit761_210_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['189'][1].init(122, 14, 'restoreEnabled');
function visit760_189_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['184'][1].init(356, 10, 'savedRange');
function visit759_184_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['179'][1].init(204, 22, 't.nodeName() != \'body\'');
function visit758_179_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['125'][1].init(69, 23, 't.nodeName() === "html"');
function visit757_125_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['119'][1].init(31, 25, 'Editor.Utils.ieEngine < 8');
function visit756_119_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['96'][1].init(518, 8, 'startRng');
function visit755_96_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['89'][1].init(233, 37, 'html.scrollHeight > html.clientHeight');
function visit754_89_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['85'][1].init(22, 7, 'started');
function visit753_85_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['84'][1].init(63, 17, 'e.target === html');
function visit752_84_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['68'][1].init(121, 55, 'pointRng.compareEndPoints(\'StartToStart\', startRng) > 0');
function visit751_68_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['66'][1].init(137, 8, 'pointRng');
function visit750_66_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['62'][1].init(98, 8, 'e.button');
function visit749_62_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['49'][3].init(169, 45, 'rng.compareEndPoints(\'StartToEnd\', rng) === 0');
function visit748_49_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['49'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['49'][2].init(156, 58, '!rng.item && rng.compareEndPoints(\'StartToEnd\', rng) === 0');
function visit747_49_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['49'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['49'][1].init(144, 70, 'startRng && !rng.item && rng.compareEndPoints(\'StartToEnd\', rng) === 0');
function visit746_49_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].lineData[10]++;
KISSY.add("editor/selectionFix", function(S, Editor) {
  _$jscoverage['/editor/selectionFix.js'].functionData[0]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[11]++;
  var TRUE = true, FALSE = false, NULL = null, UA = S.UA, Event = S.Event, Dom = S.DOM, Node = S.Node, KES = Editor.SelectionType;
  _$jscoverage['/editor/selectionFix.js'].lineData[24]++;
  function fixCursorForIE(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[1]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[25]++;
    var started, win = editor.get("window")[0], doc = editor.get("document")[0], startRng;
    _$jscoverage['/editor/selectionFix.js'].lineData[31]++;
    function rngFromPoint(x, y) {
      _$jscoverage['/editor/selectionFix.js'].functionData[2]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[32]++;
      var rng = doc.body.createTextRange();
      _$jscoverage['/editor/selectionFix.js'].lineData[34]++;
      try {
        _$jscoverage['/editor/selectionFix.js'].lineData[35]++;
        rng['moveToPoint'](x, y);
      }      catch (ex) {
  _$jscoverage['/editor/selectionFix.js'].lineData[38]++;
  rng = NULL;
}
      _$jscoverage['/editor/selectionFix.js'].lineData[41]++;
      return rng;
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[45]++;
    function endSelection() {
      _$jscoverage['/editor/selectionFix.js'].functionData[3]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[46]++;
      var rng = doc.selection.createRange();
      _$jscoverage['/editor/selectionFix.js'].lineData[49]++;
      if (visit746_49_1(startRng && visit747_49_2(!rng.item && visit748_49_3(rng.compareEndPoints('StartToEnd', rng) === 0)))) {
        _$jscoverage['/editor/selectionFix.js'].lineData[50]++;
        startRng.select();
      }
      _$jscoverage['/editor/selectionFix.js'].lineData[52]++;
      Event.remove(doc, 'mouseup', endSelection);
      _$jscoverage['/editor/selectionFix.js'].lineData[53]++;
      Event.remove(doc, 'mousemove', selectionChange);
      _$jscoverage['/editor/selectionFix.js'].lineData[54]++;
      startRng = started = 0;
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[58]++;
    function selectionChange(e) {
      _$jscoverage['/editor/selectionFix.js'].functionData[4]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[59]++;
      var pointRng;
      _$jscoverage['/editor/selectionFix.js'].lineData[62]++;
      if (visit749_62_1(e.button)) {
        _$jscoverage['/editor/selectionFix.js'].lineData[64]++;
        pointRng = rngFromPoint(e.pageX, e.pageY);
        _$jscoverage['/editor/selectionFix.js'].lineData[66]++;
        if (visit750_66_1(pointRng)) {
          _$jscoverage['/editor/selectionFix.js'].lineData[68]++;
          if (visit751_68_1(pointRng.compareEndPoints('StartToStart', startRng) > 0)) {
            _$jscoverage['/editor/selectionFix.js'].lineData[69]++;
            pointRng.setEndPoint('StartToStart', startRng);
          } else {
            _$jscoverage['/editor/selectionFix.js'].lineData[71]++;
            pointRng.setEndPoint('EndToEnd', startRng);
          }
          _$jscoverage['/editor/selectionFix.js'].lineData[73]++;
          pointRng.select();
        }
      } else {
        _$jscoverage['/editor/selectionFix.js'].lineData[76]++;
        endSelection();
      }
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[82]++;
    Event.on(doc, "mousedown contextmenu", function(e) {
  _$jscoverage['/editor/selectionFix.js'].functionData[5]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[83]++;
  var html = doc.documentElement;
  _$jscoverage['/editor/selectionFix.js'].lineData[84]++;
  if (visit752_84_1(e.target === html)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[85]++;
    if (visit753_85_1(started)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[86]++;
      endSelection();
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[89]++;
    if (visit754_89_1(html.scrollHeight > html.clientHeight)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[90]++;
      return;
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[93]++;
    started = 1;
    _$jscoverage['/editor/selectionFix.js'].lineData[95]++;
    startRng = rngFromPoint(e.pageX, e.pageY);
    _$jscoverage['/editor/selectionFix.js'].lineData[96]++;
    if (visit755_96_1(startRng)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[98]++;
      Event.on(doc, 'mouseup', endSelection);
      _$jscoverage['/editor/selectionFix.js'].lineData[99]++;
      Event.on(doc, 'mousemove', selectionChange);
      _$jscoverage['/editor/selectionFix.js'].lineData[101]++;
      win.focus();
      _$jscoverage['/editor/selectionFix.js'].lineData[102]++;
      startRng.select();
    }
  }
});
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[109]++;
  function fixSelectionForIEWhenDocReady(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[6]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[110]++;
    var doc = editor.get("document")[0], body = new Node(doc.body), html = new Node(doc.documentElement);
    _$jscoverage['/editor/selectionFix.js'].lineData[118]++;
    if (visit756_119_1(Editor.Utils.ieEngine < 8)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[123]++;
      html.on('click', function(evt) {
  _$jscoverage['/editor/selectionFix.js'].functionData[7]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[124]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor/selectionFix.js'].lineData[125]++;
  if (visit757_125_1(t.nodeName() === "html")) {
    _$jscoverage['/editor/selectionFix.js'].lineData[126]++;
    editor.getSelection().getNative().createRange().select();
  }
});
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[137]++;
    var savedRange, saveEnabled, restoreEnabled = TRUE;
    _$jscoverage['/editor/selectionFix.js'].lineData[146]++;
    html.on('mousedown', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[8]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[151]++;
  restoreEnabled = FALSE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[154]++;
    html.on('mouseup', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[9]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[155]++;
  restoreEnabled = TRUE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[175]++;
    body.on('focusin', function(evt) {
  _$jscoverage['/editor/selectionFix.js'].functionData[10]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[176]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor/selectionFix.js'].lineData[179]++;
  if (visit758_179_1(t.nodeName() != 'body')) {
    _$jscoverage['/editor/selectionFix.js'].lineData[180]++;
    return;
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[184]++;
  if (visit759_184_1(savedRange)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[186]++;
    try {
      _$jscoverage['/editor/selectionFix.js'].lineData[189]++;
      if (visit760_189_1(restoreEnabled)) {
        _$jscoverage['/editor/selectionFix.js'].lineData[190]++;
        savedRange.select();
      }
    }    catch (e) {
}
    _$jscoverage['/editor/selectionFix.js'].lineData[196]++;
    savedRange = NULL;
  }
});
    _$jscoverage['/editor/selectionFix.js'].lineData[200]++;
    body.on('focus', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[11]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[203]++;
  saveEnabled = TRUE;
  _$jscoverage['/editor/selectionFix.js'].lineData[204]++;
  saveSelection();
});
    _$jscoverage['/editor/selectionFix.js'].lineData[207]++;
    body.on('beforedeactivate', function(evt) {
  _$jscoverage['/editor/selectionFix.js'].functionData[12]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[210]++;
  if (visit761_210_1(evt.relatedTarget)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[211]++;
    return;
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[215]++;
  saveEnabled = FALSE;
  _$jscoverage['/editor/selectionFix.js'].lineData[216]++;
  restoreEnabled = TRUE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[240]++;
    body.on('mousedown', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[13]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[242]++;
  saveEnabled = FALSE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[244]++;
    body.on('mouseup', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[14]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[246]++;
  saveEnabled = TRUE;
  _$jscoverage['/editor/selectionFix.js'].lineData[247]++;
  setTimeout(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[15]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[248]++;
  saveSelection(TRUE);
}, 0);
});
    _$jscoverage['/editor/selectionFix.js'].lineData[252]++;
    function saveSelection(testIt) {
      _$jscoverage['/editor/selectionFix.js'].functionData[16]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[254]++;
      if (visit762_254_1(saveEnabled)) {
        _$jscoverage['/editor/selectionFix.js'].lineData[255]++;
        var sel = editor.getSelection(), type = visit763_256_1(sel && sel.getType()), nativeSel = visit764_257_1(sel && doc.selection);
        _$jscoverage['/editor/selectionFix.js'].lineData[268]++;
        if (visit765_268_1(testIt && visit766_268_2(nativeSel && visit767_268_3(type == KES.SELECTION_NONE)))) {
          _$jscoverage['/editor/selectionFix.js'].lineData[273]++;
          if (visit768_273_1(!doc['queryCommandEnabled']('InsertImage'))) {
            _$jscoverage['/editor/selectionFix.js'].lineData[274]++;
            setTimeout(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[17]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[276]++;
  saveSelection(TRUE);
}, 50);
            _$jscoverage['/editor/selectionFix.js'].lineData[278]++;
            return;
          }
        }
        _$jscoverage['/editor/selectionFix.js'].lineData[283]++;
        var parentTag;
        _$jscoverage['/editor/selectionFix.js'].lineData[284]++;
        if (visit769_284_1(nativeSel && visit770_284_2(nativeSel.type && visit771_284_3(visit772_284_4(nativeSel.type != 'Control') && visit773_285_1((parentTag = nativeSel.createRange()) && visit774_286_1((parentTag = parentTag.parentElement()) && visit775_287_1((parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {
  input: 1, 
  textarea: 1}))))))) {
          _$jscoverage['/editor/selectionFix.js'].lineData[289]++;
          return;
        }
        _$jscoverage['/editor/selectionFix.js'].lineData[291]++;
        savedRange = visit776_291_1(nativeSel && sel.getRanges()[0]);
        _$jscoverage['/editor/selectionFix.js'].lineData[294]++;
        editor.checkSelectionChange();
      }
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[298]++;
    body.on('keydown', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[18]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[299]++;
  saveEnabled = FALSE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[301]++;
    body.on('keyup', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[19]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[302]++;
  saveEnabled = TRUE;
  _$jscoverage['/editor/selectionFix.js'].lineData[303]++;
  setTimeout(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[20]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[304]++;
  saveSelection();
}, 0);
});
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[309]++;
  function fireSelectionChangeForNonIE(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[21]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[310]++;
    var doc = editor.get("document")[0];
    _$jscoverage['/editor/selectionFix.js'].lineData[314]++;
    function monitor() {
      _$jscoverage['/editor/selectionFix.js'].functionData[22]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[316]++;
      editor.checkSelectionChange();
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[319]++;
    Event.on(doc, 'mouseup keyup ' + 'selectionchange', monitor);
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[331]++;
  function monitorSelectionChange(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[23]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[334]++;
    var emptyParagraphRegexp = /\s*<(p|div|address|h\d|center)[^>]*>\s*(?:<br[^>]*>|&nbsp;|\u00A0|&#160;|(<!--[\s\S]*?-->))?\s*(:?<\/\1>)?(?=\s*$|<\/body>)/gi;
    _$jscoverage['/editor/selectionFix.js'].lineData[338]++;
    function isBlankParagraph(block) {
      _$jscoverage['/editor/selectionFix.js'].functionData[24]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[339]++;
      return block.outerHtml().match(emptyParagraphRegexp);
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[342]++;
    var isNotWhitespace = Editor.Walker.whitespaces(TRUE), isNotBookmark = Editor.Walker.bookmark(FALSE, TRUE);
    _$jscoverage['/editor/selectionFix.js'].lineData[345]++;
    var nextValidEl = function(node) {
  _$jscoverage['/editor/selectionFix.js'].functionData[25]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[346]++;
  return visit777_346_1(isNotWhitespace(node) && visit778_346_2(node.nodeType != 8));
};
    _$jscoverage['/editor/selectionFix.js'].lineData[350]++;
    function cannotCursorPlaced(element) {
      _$jscoverage['/editor/selectionFix.js'].functionData[26]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[351]++;
      var dtd = Editor.XHTML_DTD;
      _$jscoverage['/editor/selectionFix.js'].lineData[352]++;
      return visit779_352_1(element._4e_isBlockBoundary() && dtd.$empty[element.nodeName()]);
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[355]++;
    function isNotEmpty(node) {
      _$jscoverage['/editor/selectionFix.js'].functionData[27]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[356]++;
      return visit780_356_1(isNotWhitespace(node) && isNotBookmark(node));
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[362]++;
    editor.on("selectionChange", function(ev) {
  _$jscoverage['/editor/selectionFix.js'].functionData[28]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[364]++;
  var path = ev.path, body = new Node(editor.get("document")[0].body), selection = ev.selection, range = visit781_367_1(selection && selection.getRanges()[0]), blockLimit = path.blockLimit;
  _$jscoverage['/editor/selectionFix.js'].lineData[373]++;
  if (visit782_373_1(UA['gecko'])) {
    _$jscoverage['/editor/selectionFix.js'].lineData[374]++;
    var pathBlock = visit783_374_1(path.block || path.blockLimit), lastNode = visit784_375_1(pathBlock && pathBlock.last(isNotEmpty));
    _$jscoverage['/editor/selectionFix.js'].lineData[376]++;
    if (visit785_376_1(pathBlock && visit786_378_1(pathBlock._4e_isBlockBoundary() && visit787_380_1(!(visit788_380_2(lastNode && visit789_380_3(visit790_380_4(lastNode[0].nodeType == 1) && lastNode._4e_isBlockBoundary()))) && visit791_382_1(visit792_382_2(pathBlock.nodeName() != 'pre') && !pathBlock._4e_getBogus()))))) {
      _$jscoverage['/editor/selectionFix.js'].lineData[385]++;
      pathBlock._4e_appendBogus();
    }
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[389]++;
  if (visit793_389_1(!range || visit794_389_2(!range.collapsed || path.block))) {
    _$jscoverage['/editor/selectionFix.js'].lineData[390]++;
    return;
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[394]++;
  if (visit795_394_1(blockLimit.nodeName() == "body")) {
    _$jscoverage['/editor/selectionFix.js'].lineData[395]++;
    var fixedBlock = range.fixBlock(TRUE, "p");
    _$jscoverage['/editor/selectionFix.js'].lineData[396]++;
    if (visit796_396_1(fixedBlock && visit797_400_1(fixedBlock[0] != body[0].lastChild))) {
      _$jscoverage['/editor/selectionFix.js'].lineData[402]++;
      if (visit798_402_1(isBlankParagraph(fixedBlock))) {
        _$jscoverage['/editor/selectionFix.js'].lineData[403]++;
        var element = fixedBlock.next(nextValidEl, 1);
        _$jscoverage['/editor/selectionFix.js'].lineData[404]++;
        if (visit799_404_1(element && visit800_405_1(visit801_405_2(element[0].nodeType == Dom.NodeType.ELEMENT_NODE) && !cannotCursorPlaced[element]))) {
          _$jscoverage['/editor/selectionFix.js'].lineData[407]++;
          range.moveToElementEditablePosition(element);
          _$jscoverage['/editor/selectionFix.js'].lineData[408]++;
          fixedBlock._4e_remove();
        } else {
          _$jscoverage['/editor/selectionFix.js'].lineData[410]++;
          element = fixedBlock.prev(nextValidEl, 1);
          _$jscoverage['/editor/selectionFix.js'].lineData[411]++;
          if (visit802_411_1(element && visit803_412_1(visit804_412_2(element[0].nodeType == Dom.NodeType.ELEMENT_NODE) && !cannotCursorPlaced[element]))) {
            _$jscoverage['/editor/selectionFix.js'].lineData[414]++;
            range.moveToElementEditablePosition(element, isBlankParagraph(element) ? FALSE : TRUE);
            _$jscoverage['/editor/selectionFix.js'].lineData[417]++;
            fixedBlock._4e_remove();
          } else {
          }
        }
      }
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[424]++;
    range.select();
    _$jscoverage['/editor/selectionFix.js'].lineData[426]++;
    editor.notifySelectionChange();
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[433]++;
  var doc = editor.get("document")[0], lastRange = new Editor.Range(doc), lastPath, editBlock;
  _$jscoverage['/editor/selectionFix.js'].lineData[438]++;
  lastRange.moveToElementEditablePosition(body, TRUE);
  _$jscoverage['/editor/selectionFix.js'].lineData[440]++;
  lastPath = new Editor.ElementPath(lastRange.startContainer);
  _$jscoverage['/editor/selectionFix.js'].lineData[442]++;
  if (visit805_442_1(lastPath.blockLimit.nodeName() !== 'body')) {
    _$jscoverage['/editor/selectionFix.js'].lineData[443]++;
    editBlock = new Node(doc.createElement('p')).appendTo(body);
    _$jscoverage['/editor/selectionFix.js'].lineData[444]++;
    if (visit806_444_1(!UA['ie'])) {
      _$jscoverage['/editor/selectionFix.js'].lineData[445]++;
      editBlock._4e_appendBogus();
    }
  }
});
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[451]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/selectionFix.js'].functionData[29]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[453]++;
  editor.docReady(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[30]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[455]++;
  if (visit807_455_1(UA.ie)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[456]++;
    fixCursorForIE(editor);
    _$jscoverage['/editor/selectionFix.js'].lineData[457]++;
    fixSelectionForIEWhenDocReady(editor);
  } else {
    _$jscoverage['/editor/selectionFix.js'].lineData[459]++;
    fireSelectionChangeForNonIE(editor);
  }
});
  _$jscoverage['/editor/selectionFix.js'].lineData[464]++;
  monitorSelectionChange(editor);
}};
}, {
  requires: ['./base', './selection', 'node']});
