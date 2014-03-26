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
if (! _$jscoverage['/control.js']) {
  _$jscoverage['/control.js'] = {};
  _$jscoverage['/control.js'].lineData = [];
  _$jscoverage['/control.js'].lineData[6] = 0;
  _$jscoverage['/control.js'].lineData[7] = 0;
  _$jscoverage['/control.js'].lineData[8] = 0;
  _$jscoverage['/control.js'].lineData[9] = 0;
  _$jscoverage['/control.js'].lineData[10] = 0;
  _$jscoverage['/control.js'].lineData[11] = 0;
  _$jscoverage['/control.js'].lineData[12] = 0;
  _$jscoverage['/control.js'].lineData[22] = 0;
  _$jscoverage['/control.js'].lineData[42] = 0;
  _$jscoverage['/control.js'].lineData[49] = 0;
  _$jscoverage['/control.js'].lineData[50] = 0;
  _$jscoverage['/control.js'].lineData[52] = 0;
  _$jscoverage['/control.js'].lineData[56] = 0;
  _$jscoverage['/control.js'].lineData[57] = 0;
  _$jscoverage['/control.js'].lineData[58] = 0;
  _$jscoverage['/control.js'].lineData[59] = 0;
  _$jscoverage['/control.js'].lineData[62] = 0;
  _$jscoverage['/control.js'].lineData[71] = 0;
  _$jscoverage['/control.js'].lineData[73] = 0;
  _$jscoverage['/control.js'].lineData[77] = 0;
  _$jscoverage['/control.js'].lineData[80] = 0;
  _$jscoverage['/control.js'].lineData[85] = 0;
  _$jscoverage['/control.js'].lineData[88] = 0;
  _$jscoverage['/control.js'].lineData[89] = 0;
  _$jscoverage['/control.js'].lineData[94] = 0;
  _$jscoverage['/control.js'].lineData[99] = 0;
  _$jscoverage['/control.js'].lineData[100] = 0;
  _$jscoverage['/control.js'].lineData[101] = 0;
  _$jscoverage['/control.js'].lineData[106] = 0;
  _$jscoverage['/control.js'].lineData[107] = 0;
  _$jscoverage['/control.js'].lineData[113] = 0;
  _$jscoverage['/control.js'].lineData[120] = 0;
  _$jscoverage['/control.js'].lineData[122] = 0;
  _$jscoverage['/control.js'].lineData[123] = 0;
  _$jscoverage['/control.js'].lineData[124] = 0;
  _$jscoverage['/control.js'].lineData[125] = 0;
  _$jscoverage['/control.js'].lineData[126] = 0;
  _$jscoverage['/control.js'].lineData[131] = 0;
  _$jscoverage['/control.js'].lineData[135] = 0;
  _$jscoverage['/control.js'].lineData[136] = 0;
  _$jscoverage['/control.js'].lineData[137] = 0;
  _$jscoverage['/control.js'].lineData[138] = 0;
  _$jscoverage['/control.js'].lineData[140] = 0;
  _$jscoverage['/control.js'].lineData[141] = 0;
  _$jscoverage['/control.js'].lineData[146] = 0;
  _$jscoverage['/control.js'].lineData[147] = 0;
  _$jscoverage['/control.js'].lineData[153] = 0;
  _$jscoverage['/control.js'].lineData[159] = 0;
  _$jscoverage['/control.js'].lineData[166] = 0;
  _$jscoverage['/control.js'].lineData[174] = 0;
  _$jscoverage['/control.js'].lineData[175] = 0;
  _$jscoverage['/control.js'].lineData[176] = 0;
  _$jscoverage['/control.js'].lineData[177] = 0;
  _$jscoverage['/control.js'].lineData[185] = 0;
  _$jscoverage['/control.js'].lineData[186] = 0;
  _$jscoverage['/control.js'].lineData[187] = 0;
  _$jscoverage['/control.js'].lineData[191] = 0;
  _$jscoverage['/control.js'].lineData[192] = 0;
  _$jscoverage['/control.js'].lineData[197] = 0;
  _$jscoverage['/control.js'].lineData[198] = 0;
  _$jscoverage['/control.js'].lineData[203] = 0;
  _$jscoverage['/control.js'].lineData[210] = 0;
  _$jscoverage['/control.js'].lineData[211] = 0;
  _$jscoverage['/control.js'].lineData[223] = 0;
  _$jscoverage['/control.js'].lineData[227] = 0;
  _$jscoverage['/control.js'].lineData[228] = 0;
  _$jscoverage['/control.js'].lineData[238] = 0;
  _$jscoverage['/control.js'].lineData[242] = 0;
  _$jscoverage['/control.js'].lineData[243] = 0;
  _$jscoverage['/control.js'].lineData[253] = 0;
  _$jscoverage['/control.js'].lineData[254] = 0;
  _$jscoverage['/control.js'].lineData[255] = 0;
  _$jscoverage['/control.js'].lineData[259] = 0;
  _$jscoverage['/control.js'].lineData[260] = 0;
  _$jscoverage['/control.js'].lineData[273] = 0;
  _$jscoverage['/control.js'].lineData[276] = 0;
  _$jscoverage['/control.js'].lineData[277] = 0;
  _$jscoverage['/control.js'].lineData[278] = 0;
  _$jscoverage['/control.js'].lineData[280] = 0;
  _$jscoverage['/control.js'].lineData[281] = 0;
  _$jscoverage['/control.js'].lineData[285] = 0;
  _$jscoverage['/control.js'].lineData[288] = 0;
  _$jscoverage['/control.js'].lineData[289] = 0;
  _$jscoverage['/control.js'].lineData[291] = 0;
  _$jscoverage['/control.js'].lineData[292] = 0;
  _$jscoverage['/control.js'].lineData[299] = 0;
  _$jscoverage['/control.js'].lineData[300] = 0;
  _$jscoverage['/control.js'].lineData[312] = 0;
  _$jscoverage['/control.js'].lineData[314] = 0;
  _$jscoverage['/control.js'].lineData[315] = 0;
  _$jscoverage['/control.js'].lineData[320] = 0;
  _$jscoverage['/control.js'].lineData[321] = 0;
  _$jscoverage['/control.js'].lineData[333] = 0;
  _$jscoverage['/control.js'].lineData[334] = 0;
  _$jscoverage['/control.js'].lineData[343] = 0;
  _$jscoverage['/control.js'].lineData[344] = 0;
  _$jscoverage['/control.js'].lineData[348] = 0;
  _$jscoverage['/control.js'].lineData[349] = 0;
  _$jscoverage['/control.js'].lineData[358] = 0;
  _$jscoverage['/control.js'].lineData[359] = 0;
  _$jscoverage['/control.js'].lineData[363] = 0;
  _$jscoverage['/control.js'].lineData[364] = 0;
  _$jscoverage['/control.js'].lineData[365] = 0;
  _$jscoverage['/control.js'].lineData[366] = 0;
  _$jscoverage['/control.js'].lineData[368] = 0;
  _$jscoverage['/control.js'].lineData[377] = 0;
  _$jscoverage['/control.js'].lineData[378] = 0;
  _$jscoverage['/control.js'].lineData[380] = 0;
  _$jscoverage['/control.js'].lineData[384] = 0;
  _$jscoverage['/control.js'].lineData[385] = 0;
  _$jscoverage['/control.js'].lineData[395] = 0;
  _$jscoverage['/control.js'].lineData[396] = 0;
  _$jscoverage['/control.js'].lineData[397] = 0;
  _$jscoverage['/control.js'].lineData[408] = 0;
  _$jscoverage['/control.js'].lineData[472] = 0;
  _$jscoverage['/control.js'].lineData[473] = 0;
  _$jscoverage['/control.js'].lineData[475] = 0;
  _$jscoverage['/control.js'].lineData[525] = 0;
  _$jscoverage['/control.js'].lineData[526] = 0;
  _$jscoverage['/control.js'].lineData[571] = 0;
  _$jscoverage['/control.js'].lineData[573] = 0;
  _$jscoverage['/control.js'].lineData[574] = 0;
  _$jscoverage['/control.js'].lineData[575] = 0;
  _$jscoverage['/control.js'].lineData[577] = 0;
  _$jscoverage['/control.js'].lineData[578] = 0;
  _$jscoverage['/control.js'].lineData[581] = 0;
  _$jscoverage['/control.js'].lineData[584] = 0;
  _$jscoverage['/control.js'].lineData[651] = 0;
  _$jscoverage['/control.js'].lineData[800] = 0;
  _$jscoverage['/control.js'].lineData[801] = 0;
  _$jscoverage['/control.js'].lineData[803] = 0;
  _$jscoverage['/control.js'].lineData[804] = 0;
  _$jscoverage['/control.js'].lineData[840] = 0;
  _$jscoverage['/control.js'].lineData[846] = 0;
  _$jscoverage['/control.js'].lineData[847] = 0;
  _$jscoverage['/control.js'].lineData[849] = 0;
  _$jscoverage['/control.js'].lineData[850] = 0;
  _$jscoverage['/control.js'].lineData[851] = 0;
  _$jscoverage['/control.js'].lineData[853] = 0;
  _$jscoverage['/control.js'].lineData[856] = 0;
  _$jscoverage['/control.js'].lineData[877] = 0;
  _$jscoverage['/control.js'].lineData[879] = 0;
  _$jscoverage['/control.js'].lineData[886] = 0;
  _$jscoverage['/control.js'].lineData[887] = 0;
  _$jscoverage['/control.js'].lineData[890] = 0;
  _$jscoverage['/control.js'].lineData[892] = 0;
  _$jscoverage['/control.js'].lineData[893] = 0;
  _$jscoverage['/control.js'].lineData[896] = 0;
  _$jscoverage['/control.js'].lineData[897] = 0;
  _$jscoverage['/control.js'].lineData[899] = 0;
  _$jscoverage['/control.js'].lineData[902] = 0;
}
if (! _$jscoverage['/control.js'].functionData) {
  _$jscoverage['/control.js'].functionData = [];
  _$jscoverage['/control.js'].functionData[0] = 0;
  _$jscoverage['/control.js'].functionData[1] = 0;
  _$jscoverage['/control.js'].functionData[2] = 0;
  _$jscoverage['/control.js'].functionData[3] = 0;
  _$jscoverage['/control.js'].functionData[4] = 0;
  _$jscoverage['/control.js'].functionData[5] = 0;
  _$jscoverage['/control.js'].functionData[6] = 0;
  _$jscoverage['/control.js'].functionData[7] = 0;
  _$jscoverage['/control.js'].functionData[8] = 0;
  _$jscoverage['/control.js'].functionData[9] = 0;
  _$jscoverage['/control.js'].functionData[10] = 0;
  _$jscoverage['/control.js'].functionData[11] = 0;
  _$jscoverage['/control.js'].functionData[12] = 0;
  _$jscoverage['/control.js'].functionData[13] = 0;
  _$jscoverage['/control.js'].functionData[14] = 0;
  _$jscoverage['/control.js'].functionData[15] = 0;
  _$jscoverage['/control.js'].functionData[16] = 0;
  _$jscoverage['/control.js'].functionData[17] = 0;
  _$jscoverage['/control.js'].functionData[18] = 0;
  _$jscoverage['/control.js'].functionData[19] = 0;
  _$jscoverage['/control.js'].functionData[20] = 0;
  _$jscoverage['/control.js'].functionData[21] = 0;
  _$jscoverage['/control.js'].functionData[22] = 0;
  _$jscoverage['/control.js'].functionData[23] = 0;
  _$jscoverage['/control.js'].functionData[24] = 0;
  _$jscoverage['/control.js'].functionData[25] = 0;
  _$jscoverage['/control.js'].functionData[26] = 0;
  _$jscoverage['/control.js'].functionData[27] = 0;
  _$jscoverage['/control.js'].functionData[28] = 0;
  _$jscoverage['/control.js'].functionData[29] = 0;
  _$jscoverage['/control.js'].functionData[30] = 0;
  _$jscoverage['/control.js'].functionData[31] = 0;
  _$jscoverage['/control.js'].functionData[32] = 0;
  _$jscoverage['/control.js'].functionData[33] = 0;
  _$jscoverage['/control.js'].functionData[34] = 0;
  _$jscoverage['/control.js'].functionData[35] = 0;
  _$jscoverage['/control.js'].functionData[36] = 0;
  _$jscoverage['/control.js'].functionData[37] = 0;
  _$jscoverage['/control.js'].functionData[38] = 0;
  _$jscoverage['/control.js'].functionData[39] = 0;
  _$jscoverage['/control.js'].functionData[40] = 0;
  _$jscoverage['/control.js'].functionData[41] = 0;
  _$jscoverage['/control.js'].functionData[42] = 0;
  _$jscoverage['/control.js'].functionData[43] = 0;
  _$jscoverage['/control.js'].functionData[44] = 0;
  _$jscoverage['/control.js'].functionData[45] = 0;
}
if (! _$jscoverage['/control.js'].branchData) {
  _$jscoverage['/control.js'].branchData = {};
  _$jscoverage['/control.js'].branchData['49'] = [];
  _$jscoverage['/control.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['58'] = [];
  _$jscoverage['/control.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['80'] = [];
  _$jscoverage['/control.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['88'] = [];
  _$jscoverage['/control.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['100'] = [];
  _$jscoverage['/control.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['106'] = [];
  _$jscoverage['/control.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['123'] = [];
  _$jscoverage['/control.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['125'] = [];
  _$jscoverage['/control.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['131'] = [];
  _$jscoverage['/control.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['136'] = [];
  _$jscoverage['/control.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['146'] = [];
  _$jscoverage['/control.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['191'] = [];
  _$jscoverage['/control.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['197'] = [];
  _$jscoverage['/control.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['210'] = [];
  _$jscoverage['/control.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['227'] = [];
  _$jscoverage['/control.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['242'] = [];
  _$jscoverage['/control.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['259'] = [];
  _$jscoverage['/control.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['275'] = [];
  _$jscoverage['/control.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['276'] = [];
  _$jscoverage['/control.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['277'] = [];
  _$jscoverage['/control.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['280'] = [];
  _$jscoverage['/control.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['285'] = [];
  _$jscoverage['/control.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['285'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['289'] = [];
  _$jscoverage['/control.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['291'] = [];
  _$jscoverage['/control.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['291'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['291'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['291'][4] = new BranchData();
  _$jscoverage['/control.js'].branchData['291'][5] = new BranchData();
  _$jscoverage['/control.js'].branchData['299'] = [];
  _$jscoverage['/control.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['314'] = [];
  _$jscoverage['/control.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['314'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['314'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['320'] = [];
  _$jscoverage['/control.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['333'] = [];
  _$jscoverage['/control.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['348'] = [];
  _$jscoverage['/control.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['364'] = [];
  _$jscoverage['/control.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['377'] = [];
  _$jscoverage['/control.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['384'] = [];
  _$jscoverage['/control.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['396'] = [];
  _$jscoverage['/control.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['472'] = [];
  _$jscoverage['/control.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['475'] = [];
  _$jscoverage['/control.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['573'] = [];
  _$jscoverage['/control.js'].branchData['573'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['574'] = [];
  _$jscoverage['/control.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['577'] = [];
  _$jscoverage['/control.js'].branchData['577'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['772'] = [];
  _$jscoverage['/control.js'].branchData['772'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['803'] = [];
  _$jscoverage['/control.js'].branchData['803'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['852'] = [];
  _$jscoverage['/control.js'].branchData['852'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['886'] = [];
  _$jscoverage['/control.js'].branchData['886'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['892'] = [];
  _$jscoverage['/control.js'].branchData['892'][1] = new BranchData();
}
_$jscoverage['/control.js'].branchData['892'][1].init(405, 6, 'xclass');
function visit105_892_1(result) {
  _$jscoverage['/control.js'].branchData['892'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['886'][1].init(244, 30, 'last && (xclass = last.xclass)');
function visit104_886_1(result) {
  _$jscoverage['/control.js'].branchData['886'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['852'][1].init(113, 24, '!attrs || !attrs.xrender');
function visit103_852_1(result) {
  _$jscoverage['/control.js'].branchData['852'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['803'][1].init(171, 1, 'p');
function visit102_803_1(result) {
  _$jscoverage['/control.js'].branchData['803'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['772'][1].init(59, 40, 'S.config(\'component/prefixCls\') || \'ks-\'');
function visit101_772_1(result) {
  _$jscoverage['/control.js'].branchData['772'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['577'][1].init(176, 19, 'xy[1] !== undefined');
function visit100_577_1(result) {
  _$jscoverage['/control.js'].branchData['577'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['574'][1].init(34, 19, 'xy[0] !== undefined');
function visit99_574_1(result) {
  _$jscoverage['/control.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['573'][1].init(122, 9, 'xy.length');
function visit98_573_1(result) {
  _$jscoverage['/control.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['475'][1].init(163, 7, 'v || []');
function visit97_475_1(result) {
  _$jscoverage['/control.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['472'][1].init(30, 21, 'typeof v === \'string\'');
function visit96_472_1(result) {
  _$jscoverage['/control.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['396'][1].init(102, 21, 'self.get(\'focusable\')');
function visit95_396_1(result) {
  _$jscoverage['/control.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['384'][1].init(22, 21, '!this.get(\'disabled\')');
function visit94_384_1(result) {
  _$jscoverage['/control.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['377'][1].init(22, 33, 'ev.keyCode === Node.KeyCode.ENTER');
function visit93_377_1(result) {
  _$jscoverage['/control.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['364'][1].init(56, 55, '!this.get(\'disabled\') && self.handleKeyDownInternal(ev)');
function visit92_364_1(result) {
  _$jscoverage['/control.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['348'][1].init(22, 21, '!this.get(\'disabled\')');
function visit91_348_1(result) {
  _$jscoverage['/control.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['333'][1].init(22, 21, '!this.get(\'disabled\')');
function visit90_333_1(result) {
  _$jscoverage['/control.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['320'][1].init(22, 21, '!this.get(\'disabled\')');
function visit89_320_1(result) {
  _$jscoverage['/control.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['314'][3].init(102, 14, 'ev.which === 1');
function visit88_314_3(result) {
  _$jscoverage['/control.js'].branchData['314'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['314'][2].init(102, 41, 'ev.which === 1 || isTouchGestureSupported');
function visit87_314_2(result) {
  _$jscoverage['/control.js'].branchData['314'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['314'][1].init(79, 65, 'self.get(\'active\') && (ev.which === 1 || isTouchGestureSupported)');
function visit86_314_1(result) {
  _$jscoverage['/control.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['299'][1].init(22, 21, '!this.get(\'disabled\')');
function visit85_299_1(result) {
  _$jscoverage['/control.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['291'][5].init(360, 14, 'n !== \'button\'');
function visit84_291_5(result) {
  _$jscoverage['/control.js'].branchData['291'][5].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['291'][4].init(340, 16, 'n !== \'textarea\'');
function visit83_291_4(result) {
  _$jscoverage['/control.js'].branchData['291'][4].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['291'][3].init(340, 34, 'n !== \'textarea\' && n !== \'button\'');
function visit82_291_3(result) {
  _$jscoverage['/control.js'].branchData['291'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['291'][2].init(323, 13, 'n !== \'input\'');
function visit81_291_2(result) {
  _$jscoverage['/control.js'].branchData['291'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['291'][1].init(323, 51, 'n !== \'input\' && n !== \'textarea\' && n !== \'button\'');
function visit80_291_1(result) {
  _$jscoverage['/control.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['289'][1].init(192, 20, 'n && n.toLowerCase()');
function visit79_289_1(result) {
  _$jscoverage['/control.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['285'][2].init(417, 26, 'ev.gestureType === \'mouse\'');
function visit78_285_2(result) {
  _$jscoverage['/control.js'].branchData['285'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['285'][1].init(382, 61, '!self.get(\'allowTextSelection\') && ev.gestureType === \'mouse\'');
function visit77_285_1(result) {
  _$jscoverage['/control.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['280'][1].init(151, 21, 'self.get(\'focusable\')');
function visit76_280_1(result) {
  _$jscoverage['/control.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['277'][1].init(26, 22, 'self.get(\'activeable\')');
function visit75_277_1(result) {
  _$jscoverage['/control.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['276'][1].init(139, 46, 'isMouseActionButton || isTouchGestureSupported');
function visit74_276_1(result) {
  _$jscoverage['/control.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['275'][1].init(83, 14, 'ev.which === 1');
function visit73_275_1(result) {
  _$jscoverage['/control.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['259'][1].init(22, 21, '!this.get(\'disabled\')');
function visit72_259_1(result) {
  _$jscoverage['/control.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['242'][1].init(22, 21, '!this.get(\'disabled\')');
function visit71_242_1(result) {
  _$jscoverage['/control.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['227'][1].init(22, 21, '!this.get(\'disabled\')');
function visit70_227_1(result) {
  _$jscoverage['/control.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['210'][1].init(22, 21, '!this.get(\'disabled\')');
function visit69_210_1(result) {
  _$jscoverage['/control.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['197'][1].init(22, 21, 'this.get(\'focusable\')');
function visit68_197_1(result) {
  _$jscoverage['/control.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['191'][1].init(22, 21, 'this.get(\'focusable\')');
function visit67_191_1(result) {
  _$jscoverage['/control.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['146'][1].init(186, 45, 'target.ownerDocument.activeElement === target');
function visit66_146_1(result) {
  _$jscoverage['/control.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['136'][1].init(86, 1, 'v');
function visit65_136_1(result) {
  _$jscoverage['/control.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['131'][1].init(54, 14, 'parent || this');
function visit64_131_1(result) {
  _$jscoverage['/control.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['125'][1].init(247, 19, 'self.get(\'srcNode\')');
function visit63_125_1(result) {
  _$jscoverage['/control.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['123'][1].init(163, 9, 'self.view');
function visit62_123_1(result) {
  _$jscoverage['/control.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['106'][1].init(889, 6, 'ie < 9');
function visit61_106_1(result) {
  _$jscoverage['/control.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['100'][1].init(617, 14, 'Gesture.cancel');
function visit60_100_1(result) {
  _$jscoverage['/control.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['88'][1].init(492, 31, 'self.get(\'handleGestureEvents\')');
function visit59_88_1(result) {
  _$jscoverage['/control.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['80'][1].init(115, 21, 'self.get(\'focusable\')');
function visit58_80_1(result) {
  _$jscoverage['/control.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['58'][1].init(640, 31, '!self.get(\'allowTextSelection\')');
function visit57_58_1(result) {
  _$jscoverage['/control.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['49'][1].init(303, 4, 'view');
function visit56_49_1(result) {
  _$jscoverage['/control.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/control.js'].functionData[0]++;
  _$jscoverage['/control.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/control.js'].lineData[8]++;
  var ControlProcess = require('./control/process');
  _$jscoverage['/control.js'].lineData[9]++;
  var Manager = require('component/manager');
  _$jscoverage['/control.js'].lineData[10]++;
  var Render = require('./control/render');
  _$jscoverage['/control.js'].lineData[11]++;
  var UA = require('ua');
  _$jscoverage['/control.js'].lineData[12]++;
  var ie = UA.ieMode, Feature = S.Feature, Gesture = Node.Gesture, isTouchGestureSupported = Feature.isTouchGestureSupported();
  _$jscoverage['/control.js'].lineData[22]++;
  var Control = ControlProcess.extend({
  isControl: true, 
  createDom: function() {
  _$jscoverage['/control.js'].functionData[1]++;
  _$jscoverage['/control.js'].lineData[42]++;
  var self = this, Render = self.get('xrender'), view = self.get('view'), id = self.get('id'), el;
  _$jscoverage['/control.js'].lineData[49]++;
  if (visit56_49_1(view)) {
    _$jscoverage['/control.js'].lineData[50]++;
    view.set('control', self);
  } else {
    _$jscoverage['/control.js'].lineData[52]++;
    self.set('view', this.view = view = new Render({
  control: self}));
  }
  _$jscoverage['/control.js'].lineData[56]++;
  view.create();
  _$jscoverage['/control.js'].lineData[57]++;
  el = view.getKeyEventTarget();
  _$jscoverage['/control.js'].lineData[58]++;
  if (visit57_58_1(!self.get('allowTextSelection'))) {
    _$jscoverage['/control.js'].lineData[59]++;
    el.unselectable();
  }
  _$jscoverage['/control.js'].lineData[62]++;
  Manager.addComponent(id, self);
}, 
  renderUI: function() {
  _$jscoverage['/control.js'].functionData[2]++;
  _$jscoverage['/control.js'].lineData[71]++;
  this.view.renderUI();
  _$jscoverage['/control.js'].lineData[73]++;
  this.view.bindUI();
}, 
  bindUI: function() {
  _$jscoverage['/control.js'].functionData[3]++;
  _$jscoverage['/control.js'].lineData[77]++;
  var self = this, el = self.view.getKeyEventTarget();
  _$jscoverage['/control.js'].lineData[80]++;
  if (visit58_80_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[85]++;
    el.on('focus', self.handleFocus, self).on('blur', self.handleBlur, self).on('keydown', self.handleKeydown, self);
  }
  _$jscoverage['/control.js'].lineData[88]++;
  if (visit59_88_1(self.get('handleGestureEvents'))) {
    _$jscoverage['/control.js'].lineData[89]++;
    el = self.$el;
    _$jscoverage['/control.js'].lineData[94]++;
    el.on('mouseenter', self.handleMouseEnter, self).on('mouseleave', self.handleMouseLeave, self).on('contextmenu', self.handleContextMenu, self);
    _$jscoverage['/control.js'].lineData[99]++;
    el.on(Gesture.start, self.handleMouseDown, self).on(Gesture.end, self.handleMouseUp, self).on(Gesture.tap, self.handleClick, self);
    _$jscoverage['/control.js'].lineData[100]++;
    if (visit60_100_1(Gesture.cancel)) {
      _$jscoverage['/control.js'].lineData[101]++;
      el.on(Gesture.cancel, self.handleMouseUp, self);
    }
    _$jscoverage['/control.js'].lineData[106]++;
    if (visit61_106_1(ie < 9)) {
      _$jscoverage['/control.js'].lineData[107]++;
      el.on('dblclick', self.handleDblClick, self);
    }
  }
}, 
  syncUI: function() {
  _$jscoverage['/control.js'].functionData[4]++;
  _$jscoverage['/control.js'].lineData[113]++;
  this.view.syncUI();
}, 
  destructor: function() {
  _$jscoverage['/control.js'].functionData[5]++;
  _$jscoverage['/control.js'].lineData[120]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[122]++;
  Manager.removeComponent(self.get('id'));
  _$jscoverage['/control.js'].lineData[123]++;
  if (visit62_123_1(self.view)) {
    _$jscoverage['/control.js'].lineData[124]++;
    self.view.destroy();
  } else {
    _$jscoverage['/control.js'].lineData[125]++;
    if (visit63_125_1(self.get('srcNode'))) {
      _$jscoverage['/control.js'].lineData[126]++;
      self.get('srcNode').remove();
    }
  }
}, 
  createComponent: function(cfg, parent) {
  _$jscoverage['/control.js'].functionData[6]++;
  _$jscoverage['/control.js'].lineData[131]++;
  return Manager.createComponent(cfg, visit64_131_1(parent || this));
}, 
  '_onSetFocused': function(v) {
  _$jscoverage['/control.js'].functionData[7]++;
  _$jscoverage['/control.js'].lineData[135]++;
  var target = this.view.getKeyEventTarget()[0];
  _$jscoverage['/control.js'].lineData[136]++;
  if (visit65_136_1(v)) {
    _$jscoverage['/control.js'].lineData[137]++;
    try {
      _$jscoverage['/control.js'].lineData[138]++;
      target.focus();
    }    catch (e) {
  _$jscoverage['/control.js'].lineData[140]++;
  S.log(target);
  _$jscoverage['/control.js'].lineData[141]++;
  S.log('focus error', 'warn');
}
  } else {
    _$jscoverage['/control.js'].lineData[146]++;
    if (visit66_146_1(target.ownerDocument.activeElement === target)) {
      _$jscoverage['/control.js'].lineData[147]++;
      target.ownerDocument.body.focus();
    }
  }
}, 
  '_onSetX': function(x) {
  _$jscoverage['/control.js'].functionData[8]++;
  _$jscoverage['/control.js'].lineData[153]++;
  this.$el.offset({
  left: x});
}, 
  '_onSetY': function(y) {
  _$jscoverage['/control.js'].functionData[9]++;
  _$jscoverage['/control.js'].lineData[159]++;
  this.$el.offset({
  top: y});
}, 
  _onSetVisible: function(v) {
  _$jscoverage['/control.js'].functionData[10]++;
  _$jscoverage['/control.js'].lineData[166]++;
  this.fire(v ? 'show' : 'hide');
}, 
  show: function() {
  _$jscoverage['/control.js'].functionData[11]++;
  _$jscoverage['/control.js'].lineData[174]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[175]++;
  self.render();
  _$jscoverage['/control.js'].lineData[176]++;
  self.set('visible', true);
  _$jscoverage['/control.js'].lineData[177]++;
  return self;
}, 
  hide: function() {
  _$jscoverage['/control.js'].functionData[12]++;
  _$jscoverage['/control.js'].lineData[185]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[186]++;
  self.set('visible', false);
  _$jscoverage['/control.js'].lineData[187]++;
  return self;
}, 
  focus: function() {
  _$jscoverage['/control.js'].functionData[13]++;
  _$jscoverage['/control.js'].lineData[191]++;
  if (visit67_191_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[192]++;
    this.set('focused', true);
  }
}, 
  blur: function() {
  _$jscoverage['/control.js'].functionData[14]++;
  _$jscoverage['/control.js'].lineData[197]++;
  if (visit68_197_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[198]++;
    this.set('focused', false);
  }
}, 
  move: function(x, y) {
  _$jscoverage['/control.js'].functionData[15]++;
  _$jscoverage['/control.js'].lineData[203]++;
  this.set({
  x: x, 
  y: y});
}, 
  handleDblClick: function(ev) {
  _$jscoverage['/control.js'].functionData[16]++;
  _$jscoverage['/control.js'].lineData[210]++;
  if (visit69_210_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[211]++;
    this.handleDblClickInternal(ev);
  }
}, 
  handleDblClickInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[17]++;
  _$jscoverage['/control.js'].lineData[223]++;
  this.handleClickInternal(ev);
}, 
  handleMouseEnter: function(ev) {
  _$jscoverage['/control.js'].functionData[18]++;
  _$jscoverage['/control.js'].lineData[227]++;
  if (visit70_227_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[228]++;
    this.handleMouseEnterInternal(ev);
  }
}, 
  handleMouseEnterInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[19]++;
  _$jscoverage['/control.js'].lineData[238]++;
  this.set('highlighted', !!ev);
}, 
  handleMouseLeave: function(ev) {
  _$jscoverage['/control.js'].functionData[20]++;
  _$jscoverage['/control.js'].lineData[242]++;
  if (visit71_242_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[243]++;
    this.handleMouseLeaveInternal(ev);
  }
}, 
  handleMouseLeaveInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[21]++;
  _$jscoverage['/control.js'].lineData[253]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[254]++;
  self.set('active', false);
  _$jscoverage['/control.js'].lineData[255]++;
  self.set('highlighted', !ev);
}, 
  handleMouseDown: function(ev) {
  _$jscoverage['/control.js'].functionData[22]++;
  _$jscoverage['/control.js'].lineData[259]++;
  if (visit72_259_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[260]++;
    this.handleMouseDownInternal(ev);
  }
}, 
  handleMouseDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[23]++;
  _$jscoverage['/control.js'].lineData[273]++;
  var self = this, n, isMouseActionButton = visit73_275_1(ev.which === 1);
  _$jscoverage['/control.js'].lineData[276]++;
  if (visit74_276_1(isMouseActionButton || isTouchGestureSupported)) {
    _$jscoverage['/control.js'].lineData[277]++;
    if (visit75_277_1(self.get('activeable'))) {
      _$jscoverage['/control.js'].lineData[278]++;
      self.set('active', true);
    }
    _$jscoverage['/control.js'].lineData[280]++;
    if (visit76_280_1(self.get('focusable'))) {
      _$jscoverage['/control.js'].lineData[281]++;
      self.focus();
    }
    _$jscoverage['/control.js'].lineData[285]++;
    if (visit77_285_1(!self.get('allowTextSelection') && visit78_285_2(ev.gestureType === 'mouse'))) {
      _$jscoverage['/control.js'].lineData[288]++;
      n = ev.target.nodeName;
      _$jscoverage['/control.js'].lineData[289]++;
      n = visit79_289_1(n && n.toLowerCase());
      _$jscoverage['/control.js'].lineData[291]++;
      if (visit80_291_1(visit81_291_2(n !== 'input') && visit82_291_3(visit83_291_4(n !== 'textarea') && visit84_291_5(n !== 'button')))) {
        _$jscoverage['/control.js'].lineData[292]++;
        ev.preventDefault();
      }
    }
  }
}, 
  handleMouseUp: function(ev) {
  _$jscoverage['/control.js'].functionData[24]++;
  _$jscoverage['/control.js'].lineData[299]++;
  if (visit85_299_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[300]++;
    this.handleMouseUpInternal(ev);
  }
}, 
  handleMouseUpInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[25]++;
  _$jscoverage['/control.js'].lineData[312]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[314]++;
  if (visit86_314_1(self.get('active') && (visit87_314_2(visit88_314_3(ev.which === 1) || isTouchGestureSupported)))) {
    _$jscoverage['/control.js'].lineData[315]++;
    self.set('active', false);
  }
}, 
  handleContextMenu: function(ev) {
  _$jscoverage['/control.js'].functionData[26]++;
  _$jscoverage['/control.js'].lineData[320]++;
  if (visit89_320_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[321]++;
    this.handleContextMenuInternal(ev);
  }
}, 
  handleContextMenuInternal: function() {
  _$jscoverage['/control.js'].functionData[27]++;
}, 
  handleFocus: function() {
  _$jscoverage['/control.js'].functionData[28]++;
  _$jscoverage['/control.js'].lineData[333]++;
  if (visit90_333_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[334]++;
    this.handleFocusInternal();
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/control.js'].functionData[29]++;
  _$jscoverage['/control.js'].lineData[343]++;
  this.focus();
  _$jscoverage['/control.js'].lineData[344]++;
  this.fire('focus');
}, 
  handleBlur: function() {
  _$jscoverage['/control.js'].functionData[30]++;
  _$jscoverage['/control.js'].lineData[348]++;
  if (visit91_348_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[349]++;
    this.handleBlurInternal();
  }
}, 
  handleBlurInternal: function() {
  _$jscoverage['/control.js'].functionData[31]++;
  _$jscoverage['/control.js'].lineData[358]++;
  this.blur();
  _$jscoverage['/control.js'].lineData[359]++;
  this.fire('blur');
}, 
  handleKeydown: function(ev) {
  _$jscoverage['/control.js'].functionData[32]++;
  _$jscoverage['/control.js'].lineData[363]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[364]++;
  if (visit92_364_1(!this.get('disabled') && self.handleKeyDownInternal(ev))) {
    _$jscoverage['/control.js'].lineData[365]++;
    ev.halt();
    _$jscoverage['/control.js'].lineData[366]++;
    return true;
  }
  _$jscoverage['/control.js'].lineData[368]++;
  return undefined;
}, 
  handleKeyDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[33]++;
  _$jscoverage['/control.js'].lineData[377]++;
  if (visit93_377_1(ev.keyCode === Node.KeyCode.ENTER)) {
    _$jscoverage['/control.js'].lineData[378]++;
    return this.handleClickInternal(ev);
  }
  _$jscoverage['/control.js'].lineData[380]++;
  return undefined;
}, 
  handleClick: function(ev) {
  _$jscoverage['/control.js'].functionData[34]++;
  _$jscoverage['/control.js'].lineData[384]++;
  if (visit94_384_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[385]++;
    this.handleClickInternal(ev);
  }
}, 
  handleClickInternal: function() {
  _$jscoverage['/control.js'].functionData[35]++;
  _$jscoverage['/control.js'].lineData[395]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[396]++;
  if (visit95_396_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[397]++;
    self.focus();
  }
}}, {
  name: 'control', 
  ATTRS: {
  id: {
  view: 1, 
  valueFn: function() {
  _$jscoverage['/control.js'].functionData[36]++;
  _$jscoverage['/control.js'].lineData[408]++;
  return S.guid('ks-component');
}}, 
  content: {
  view: 1, 
  value: ''}, 
  width: {
  view: 1}, 
  height: {
  view: 1}, 
  elCls: {
  view: 1, 
  value: [], 
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[37]++;
  _$jscoverage['/control.js'].lineData[472]++;
  if (visit96_472_1(typeof v === 'string')) {
    _$jscoverage['/control.js'].lineData[473]++;
    v = v.split(/\s+/);
  }
  _$jscoverage['/control.js'].lineData[475]++;
  return visit97_475_1(v || []);
}}, 
  elStyle: {
  view: 1, 
  value: {}}, 
  elAttrs: {
  view: 1, 
  value: {}}, 
  elBefore: {}, 
  el: {
  setter: function(el) {
  _$jscoverage['/control.js'].functionData[38]++;
  _$jscoverage['/control.js'].lineData[525]++;
  this.$el = el;
  _$jscoverage['/control.js'].lineData[526]++;
  this.el = el[0];
}}, 
  x: {}, 
  y: {}, 
  xy: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[39]++;
  _$jscoverage['/control.js'].lineData[571]++;
  var self = this, xy = S.makeArray(v);
  _$jscoverage['/control.js'].lineData[573]++;
  if (visit98_573_1(xy.length)) {
    _$jscoverage['/control.js'].lineData[574]++;
    if (visit99_574_1(xy[0] !== undefined)) {
      _$jscoverage['/control.js'].lineData[575]++;
      self.set('x', xy[0]);
    }
    _$jscoverage['/control.js'].lineData[577]++;
    if (visit100_577_1(xy[1] !== undefined)) {
      _$jscoverage['/control.js'].lineData[578]++;
      self.set('y', xy[1]);
    }
  }
  _$jscoverage['/control.js'].lineData[581]++;
  return v;
}, 
  getter: function() {
  _$jscoverage['/control.js'].functionData[40]++;
  _$jscoverage['/control.js'].lineData[584]++;
  return [this.get('x'), this.get('y')];
}}, 
  zIndex: {
  view: 1}, 
  render: {}, 
  visible: {
  sync: 0, 
  value: true, 
  view: 1}, 
  srcNode: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[41]++;
  _$jscoverage['/control.js'].lineData[651]++;
  return Node.all(v);
}}, 
  handleGestureEvents: {
  value: true}, 
  focusable: {
  value: true, 
  view: 1}, 
  allowTextSelection: {
  value: false}, 
  activeable: {
  value: true}, 
  focused: {
  view: 1}, 
  active: {
  view: 1, 
  value: false}, 
  highlighted: {
  view: 1, 
  value: false}, 
  prefixCls: {
  view: 1, 
  value: visit101_772_1(S.config('component/prefixCls') || 'ks-')}, 
  prefixXClass: {}, 
  parent: {
  setter: function(p, prev) {
  _$jscoverage['/control.js'].functionData[42]++;
  _$jscoverage['/control.js'].lineData[800]++;
  if ((prev = this.get('parent'))) {
    _$jscoverage['/control.js'].lineData[801]++;
    this.removeTarget(prev);
  }
  _$jscoverage['/control.js'].lineData[803]++;
  if (visit102_803_1(p)) {
    _$jscoverage['/control.js'].lineData[804]++;
    this.addTarget(p);
  }
}}, 
  disabled: {
  view: 1, 
  value: false}, 
  xrender: {
  value: Render}, 
  view: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[43]++;
  _$jscoverage['/control.js'].lineData[840]++;
  this.view = v;
}}}});
  _$jscoverage['/control.js'].lineData[846]++;
  function getDefaultRender() {
    _$jscoverage['/control.js'].functionData[44]++;
    _$jscoverage['/control.js'].lineData[847]++;
    var attrs, constructor = this;
    _$jscoverage['/control.js'].lineData[849]++;
    do {
      _$jscoverage['/control.js'].lineData[850]++;
      attrs = constructor.ATTRS;
      _$jscoverage['/control.js'].lineData[851]++;
      constructor = constructor.superclass;
    } while (visit103_852_1(!attrs || !attrs.xrender));
    _$jscoverage['/control.js'].lineData[853]++;
    return attrs.xrender.value;
  }
  _$jscoverage['/control.js'].lineData[856]++;
  Control.getDefaultRender = getDefaultRender;
  _$jscoverage['/control.js'].lineData[877]++;
  Control.extend = function extend(extensions, px, sx) {
  _$jscoverage['/control.js'].functionData[45]++;
  _$jscoverage['/control.js'].lineData[879]++;
  var args = S.makeArray(arguments), baseClass = this, xclass, newClass, argsLen = args.length, last = args[argsLen - 1];
  _$jscoverage['/control.js'].lineData[886]++;
  if (visit104_886_1(last && (xclass = last.xclass))) {
    _$jscoverage['/control.js'].lineData[887]++;
    last.name = xclass;
  }
  _$jscoverage['/control.js'].lineData[890]++;
  newClass = ControlProcess.extend.apply(baseClass, args);
  _$jscoverage['/control.js'].lineData[892]++;
  if (visit105_892_1(xclass)) {
    _$jscoverage['/control.js'].lineData[893]++;
    Manager.setConstructorByXClass(xclass, newClass);
  }
  _$jscoverage['/control.js'].lineData[896]++;
  newClass.extend = extend;
  _$jscoverage['/control.js'].lineData[897]++;
  newClass.getDefaultRender = getDefaultRender;
  _$jscoverage['/control.js'].lineData[899]++;
  return newClass;
};
  _$jscoverage['/control.js'].lineData[902]++;
  return Control;
});
