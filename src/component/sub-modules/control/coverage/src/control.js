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
  _$jscoverage['/control.js'].lineData[75] = 0;
  _$jscoverage['/control.js'].lineData[78] = 0;
  _$jscoverage['/control.js'].lineData[83] = 0;
  _$jscoverage['/control.js'].lineData[86] = 0;
  _$jscoverage['/control.js'].lineData[87] = 0;
  _$jscoverage['/control.js'].lineData[91] = 0;
  _$jscoverage['/control.js'].lineData[96] = 0;
  _$jscoverage['/control.js'].lineData[97] = 0;
  _$jscoverage['/control.js'].lineData[98] = 0;
  _$jscoverage['/control.js'].lineData[103] = 0;
  _$jscoverage['/control.js'].lineData[104] = 0;
  _$jscoverage['/control.js'].lineData[110] = 0;
  _$jscoverage['/control.js'].lineData[111] = 0;
  _$jscoverage['/control.js'].lineData[112] = 0;
  _$jscoverage['/control.js'].lineData[113] = 0;
  _$jscoverage['/control.js'].lineData[114] = 0;
  _$jscoverage['/control.js'].lineData[115] = 0;
  _$jscoverage['/control.js'].lineData[119] = 0;
  _$jscoverage['/control.js'].lineData[123] = 0;
  _$jscoverage['/control.js'].lineData[124] = 0;
  _$jscoverage['/control.js'].lineData[125] = 0;
  _$jscoverage['/control.js'].lineData[129] = 0;
  _$jscoverage['/control.js'].lineData[130] = 0;
  _$jscoverage['/control.js'].lineData[136] = 0;
  _$jscoverage['/control.js'].lineData[142] = 0;
  _$jscoverage['/control.js'].lineData[149] = 0;
  _$jscoverage['/control.js'].lineData[157] = 0;
  _$jscoverage['/control.js'].lineData[158] = 0;
  _$jscoverage['/control.js'].lineData[159] = 0;
  _$jscoverage['/control.js'].lineData[160] = 0;
  _$jscoverage['/control.js'].lineData[168] = 0;
  _$jscoverage['/control.js'].lineData[169] = 0;
  _$jscoverage['/control.js'].lineData[170] = 0;
  _$jscoverage['/control.js'].lineData[174] = 0;
  _$jscoverage['/control.js'].lineData[175] = 0;
  _$jscoverage['/control.js'].lineData[180] = 0;
  _$jscoverage['/control.js'].lineData[181] = 0;
  _$jscoverage['/control.js'].lineData[186] = 0;
  _$jscoverage['/control.js'].lineData[193] = 0;
  _$jscoverage['/control.js'].lineData[194] = 0;
  _$jscoverage['/control.js'].lineData[206] = 0;
  _$jscoverage['/control.js'].lineData[210] = 0;
  _$jscoverage['/control.js'].lineData[211] = 0;
  _$jscoverage['/control.js'].lineData[221] = 0;
  _$jscoverage['/control.js'].lineData[225] = 0;
  _$jscoverage['/control.js'].lineData[226] = 0;
  _$jscoverage['/control.js'].lineData[236] = 0;
  _$jscoverage['/control.js'].lineData[237] = 0;
  _$jscoverage['/control.js'].lineData[238] = 0;
  _$jscoverage['/control.js'].lineData[242] = 0;
  _$jscoverage['/control.js'].lineData[243] = 0;
  _$jscoverage['/control.js'].lineData[256] = 0;
  _$jscoverage['/control.js'].lineData[259] = 0;
  _$jscoverage['/control.js'].lineData[260] = 0;
  _$jscoverage['/control.js'].lineData[261] = 0;
  _$jscoverage['/control.js'].lineData[263] = 0;
  _$jscoverage['/control.js'].lineData[264] = 0;
  _$jscoverage['/control.js'].lineData[266] = 0;
  _$jscoverage['/control.js'].lineData[269] = 0;
  _$jscoverage['/control.js'].lineData[270] = 0;
  _$jscoverage['/control.js'].lineData[272] = 0;
  _$jscoverage['/control.js'].lineData[273] = 0;
  _$jscoverage['/control.js'].lineData[280] = 0;
  _$jscoverage['/control.js'].lineData[281] = 0;
  _$jscoverage['/control.js'].lineData[293] = 0;
  _$jscoverage['/control.js'].lineData[295] = 0;
  _$jscoverage['/control.js'].lineData[296] = 0;
  _$jscoverage['/control.js'].lineData[301] = 0;
  _$jscoverage['/control.js'].lineData[302] = 0;
  _$jscoverage['/control.js'].lineData[314] = 0;
  _$jscoverage['/control.js'].lineData[315] = 0;
  _$jscoverage['/control.js'].lineData[324] = 0;
  _$jscoverage['/control.js'].lineData[325] = 0;
  _$jscoverage['/control.js'].lineData[329] = 0;
  _$jscoverage['/control.js'].lineData[330] = 0;
  _$jscoverage['/control.js'].lineData[339] = 0;
  _$jscoverage['/control.js'].lineData[340] = 0;
  _$jscoverage['/control.js'].lineData[344] = 0;
  _$jscoverage['/control.js'].lineData[345] = 0;
  _$jscoverage['/control.js'].lineData[346] = 0;
  _$jscoverage['/control.js'].lineData[347] = 0;
  _$jscoverage['/control.js'].lineData[349] = 0;
  _$jscoverage['/control.js'].lineData[358] = 0;
  _$jscoverage['/control.js'].lineData[359] = 0;
  _$jscoverage['/control.js'].lineData[361] = 0;
  _$jscoverage['/control.js'].lineData[365] = 0;
  _$jscoverage['/control.js'].lineData[366] = 0;
  _$jscoverage['/control.js'].lineData[376] = 0;
  _$jscoverage['/control.js'].lineData[377] = 0;
  _$jscoverage['/control.js'].lineData[378] = 0;
  _$jscoverage['/control.js'].lineData[386] = 0;
  _$jscoverage['/control.js'].lineData[388] = 0;
  _$jscoverage['/control.js'].lineData[389] = 0;
  _$jscoverage['/control.js'].lineData[390] = 0;
  _$jscoverage['/control.js'].lineData[391] = 0;
  _$jscoverage['/control.js'].lineData[392] = 0;
  _$jscoverage['/control.js'].lineData[403] = 0;
  _$jscoverage['/control.js'].lineData[467] = 0;
  _$jscoverage['/control.js'].lineData[468] = 0;
  _$jscoverage['/control.js'].lineData[470] = 0;
  _$jscoverage['/control.js'].lineData[520] = 0;
  _$jscoverage['/control.js'].lineData[521] = 0;
  _$jscoverage['/control.js'].lineData[566] = 0;
  _$jscoverage['/control.js'].lineData[568] = 0;
  _$jscoverage['/control.js'].lineData[569] = 0;
  _$jscoverage['/control.js'].lineData[570] = 0;
  _$jscoverage['/control.js'].lineData[572] = 0;
  _$jscoverage['/control.js'].lineData[573] = 0;
  _$jscoverage['/control.js'].lineData[576] = 0;
  _$jscoverage['/control.js'].lineData[579] = 0;
  _$jscoverage['/control.js'].lineData[646] = 0;
  _$jscoverage['/control.js'].lineData[795] = 0;
  _$jscoverage['/control.js'].lineData[796] = 0;
  _$jscoverage['/control.js'].lineData[798] = 0;
  _$jscoverage['/control.js'].lineData[799] = 0;
  _$jscoverage['/control.js'].lineData[835] = 0;
  _$jscoverage['/control.js'].lineData[841] = 0;
  _$jscoverage['/control.js'].lineData[842] = 0;
  _$jscoverage['/control.js'].lineData[844] = 0;
  _$jscoverage['/control.js'].lineData[845] = 0;
  _$jscoverage['/control.js'].lineData[846] = 0;
  _$jscoverage['/control.js'].lineData[848] = 0;
  _$jscoverage['/control.js'].lineData[851] = 0;
  _$jscoverage['/control.js'].lineData[872] = 0;
  _$jscoverage['/control.js'].lineData[874] = 0;
  _$jscoverage['/control.js'].lineData[881] = 0;
  _$jscoverage['/control.js'].lineData[882] = 0;
  _$jscoverage['/control.js'].lineData[885] = 0;
  _$jscoverage['/control.js'].lineData[887] = 0;
  _$jscoverage['/control.js'].lineData[888] = 0;
  _$jscoverage['/control.js'].lineData[891] = 0;
  _$jscoverage['/control.js'].lineData[892] = 0;
  _$jscoverage['/control.js'].lineData[894] = 0;
  _$jscoverage['/control.js'].lineData[897] = 0;
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
  _$jscoverage['/control.js'].branchData['78'] = [];
  _$jscoverage['/control.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['86'] = [];
  _$jscoverage['/control.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['97'] = [];
  _$jscoverage['/control.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['103'] = [];
  _$jscoverage['/control.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['119'] = [];
  _$jscoverage['/control.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['124'] = [];
  _$jscoverage['/control.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['129'] = [];
  _$jscoverage['/control.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['174'] = [];
  _$jscoverage['/control.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['180'] = [];
  _$jscoverage['/control.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['193'] = [];
  _$jscoverage['/control.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['210'] = [];
  _$jscoverage['/control.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['225'] = [];
  _$jscoverage['/control.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['242'] = [];
  _$jscoverage['/control.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['258'] = [];
  _$jscoverage['/control.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['259'] = [];
  _$jscoverage['/control.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['260'] = [];
  _$jscoverage['/control.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['263'] = [];
  _$jscoverage['/control.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['266'] = [];
  _$jscoverage['/control.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['266'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['270'] = [];
  _$jscoverage['/control.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['272'] = [];
  _$jscoverage['/control.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['272'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['272'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['272'][4] = new BranchData();
  _$jscoverage['/control.js'].branchData['272'][5] = new BranchData();
  _$jscoverage['/control.js'].branchData['280'] = [];
  _$jscoverage['/control.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['295'] = [];
  _$jscoverage['/control.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['295'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['295'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['301'] = [];
  _$jscoverage['/control.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['314'] = [];
  _$jscoverage['/control.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['329'] = [];
  _$jscoverage['/control.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['345'] = [];
  _$jscoverage['/control.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['358'] = [];
  _$jscoverage['/control.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['365'] = [];
  _$jscoverage['/control.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['377'] = [];
  _$jscoverage['/control.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['389'] = [];
  _$jscoverage['/control.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['391'] = [];
  _$jscoverage['/control.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['467'] = [];
  _$jscoverage['/control.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['470'] = [];
  _$jscoverage['/control.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['568'] = [];
  _$jscoverage['/control.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['569'] = [];
  _$jscoverage['/control.js'].branchData['569'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['572'] = [];
  _$jscoverage['/control.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['767'] = [];
  _$jscoverage['/control.js'].branchData['767'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['798'] = [];
  _$jscoverage['/control.js'].branchData['798'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['847'] = [];
  _$jscoverage['/control.js'].branchData['847'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['887'] = [];
  _$jscoverage['/control.js'].branchData['887'][1] = new BranchData();
}
_$jscoverage['/control.js'].branchData['887'][1].init(384, 6, 'xclass');
function visit102_887_1(result) {
  _$jscoverage['/control.js'].branchData['887'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['847'][1].init(110, 24, '!attrs || !attrs.xrender');
function visit101_847_1(result) {
  _$jscoverage['/control.js'].branchData['847'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['798'][1].init(167, 1, 'p');
function visit100_798_1(result) {
  _$jscoverage['/control.js'].branchData['798'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['767'][1].init(57, 40, 'S.config(\'component/prefixCls\') || \'ks-\'');
function visit99_767_1(result) {
  _$jscoverage['/control.js'].branchData['767'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['572'][1].init(172, 19, 'xy[1] !== undefined');
function visit98_572_1(result) {
  _$jscoverage['/control.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['569'][1].init(33, 19, 'xy[0] !== undefined');
function visit97_569_1(result) {
  _$jscoverage['/control.js'].branchData['569'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['568'][1].init(119, 9, 'xy.length');
function visit96_568_1(result) {
  _$jscoverage['/control.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['470'][1].init(159, 7, 'v || []');
function visit95_470_1(result) {
  _$jscoverage['/control.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['467'][1].init(29, 21, 'typeof v === \'string\'');
function visit94_467_1(result) {
  _$jscoverage['/control.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['391'][1].init(241, 19, 'self.get(\'srcNode\')');
function visit93_391_1(result) {
  _$jscoverage['/control.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['389'][1].init(159, 9, 'self.view');
function visit92_389_1(result) {
  _$jscoverage['/control.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['377'][1].init(99, 21, 'self.get(\'focusable\')');
function visit91_377_1(result) {
  _$jscoverage['/control.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['365'][1].init(21, 21, '!this.get(\'disabled\')');
function visit90_365_1(result) {
  _$jscoverage['/control.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['358'][1].init(21, 33, 'ev.keyCode === Node.KeyCode.ENTER');
function visit89_358_1(result) {
  _$jscoverage['/control.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['345'][1].init(54, 55, '!this.get(\'disabled\') && self.handleKeyDownInternal(ev)');
function visit88_345_1(result) {
  _$jscoverage['/control.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['329'][1].init(21, 21, '!this.get(\'disabled\')');
function visit87_329_1(result) {
  _$jscoverage['/control.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['314'][1].init(21, 21, '!this.get(\'disabled\')');
function visit86_314_1(result) {
  _$jscoverage['/control.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['301'][1].init(21, 21, '!this.get(\'disabled\')');
function visit85_301_1(result) {
  _$jscoverage['/control.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['295'][3].init(99, 14, 'ev.which === 1');
function visit84_295_3(result) {
  _$jscoverage['/control.js'].branchData['295'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['295'][2].init(99, 41, 'ev.which === 1 || isTouchGestureSupported');
function visit83_295_2(result) {
  _$jscoverage['/control.js'].branchData['295'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['295'][1].init(76, 65, 'self.get(\'active\') && (ev.which === 1 || isTouchGestureSupported)');
function visit82_295_1(result) {
  _$jscoverage['/control.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['280'][1].init(21, 21, '!this.get(\'disabled\')');
function visit81_280_1(result) {
  _$jscoverage['/control.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['272'][5].init(354, 14, 'n !== \'button\'');
function visit80_272_5(result) {
  _$jscoverage['/control.js'].branchData['272'][5].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['272'][4].init(334, 16, 'n !== \'textarea\'');
function visit79_272_4(result) {
  _$jscoverage['/control.js'].branchData['272'][4].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['272'][3].init(334, 34, 'n !== \'textarea\' && n !== \'button\'');
function visit78_272_3(result) {
  _$jscoverage['/control.js'].branchData['272'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['272'][2].init(317, 13, 'n !== \'input\'');
function visit77_272_2(result) {
  _$jscoverage['/control.js'].branchData['272'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['272'][1].init(317, 51, 'n !== \'input\' && n !== \'textarea\' && n !== \'button\'');
function visit76_272_1(result) {
  _$jscoverage['/control.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['270'][1].init(188, 20, 'n && n.toLowerCase()');
function visit75_270_1(result) {
  _$jscoverage['/control.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['266'][2].init(291, 31, 'ev.type.indexOf(\'mouse\') !== -1');
function visit74_266_2(result) {
  _$jscoverage['/control.js'].branchData['266'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['266'][1].init(256, 66, '!self.get(\'allowTextSelection\') && ev.type.indexOf(\'mouse\') !== -1');
function visit73_266_1(result) {
  _$jscoverage['/control.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['263'][1].init(147, 21, 'self.get(\'focusable\')');
function visit72_263_1(result) {
  _$jscoverage['/control.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['260'][1].init(25, 22, 'self.get(\'activeable\')');
function visit71_260_1(result) {
  _$jscoverage['/control.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['259'][1].init(135, 46, 'isMouseActionButton || isTouchGestureSupported');
function visit70_259_1(result) {
  _$jscoverage['/control.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['258'][1].init(81, 14, 'ev.which === 1');
function visit69_258_1(result) {
  _$jscoverage['/control.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['242'][1].init(21, 21, '!this.get(\'disabled\')');
function visit68_242_1(result) {
  _$jscoverage['/control.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['225'][1].init(21, 21, '!this.get(\'disabled\')');
function visit67_225_1(result) {
  _$jscoverage['/control.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['210'][1].init(21, 21, '!this.get(\'disabled\')');
function visit66_210_1(result) {
  _$jscoverage['/control.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['193'][1].init(21, 21, '!this.get(\'disabled\')');
function visit65_193_1(result) {
  _$jscoverage['/control.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['180'][1].init(21, 21, 'this.get(\'focusable\')');
function visit64_180_1(result) {
  _$jscoverage['/control.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['174'][1].init(21, 21, 'this.get(\'focusable\')');
function visit63_174_1(result) {
  _$jscoverage['/control.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['129'][1].init(183, 45, 'target.ownerDocument.activeElement === target');
function visit62_129_1(result) {
  _$jscoverage['/control.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['124'][1].init(84, 1, 'v');
function visit61_124_1(result) {
  _$jscoverage['/control.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['119'][1].init(53, 14, 'parent || this');
function visit60_119_1(result) {
  _$jscoverage['/control.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['103'][1].init(798, 6, 'ie < 9');
function visit59_103_1(result) {
  _$jscoverage['/control.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['97'][1].init(532, 14, 'Gesture.cancel');
function visit58_97_1(result) {
  _$jscoverage['/control.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['86'][1].init(480, 29, 'self.get(\'handleMouseEvents\')');
function visit57_86_1(result) {
  _$jscoverage['/control.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['78'][1].init(111, 21, 'self.get(\'focusable\')');
function visit56_78_1(result) {
  _$jscoverage['/control.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['58'][1].init(623, 31, '!self.get(\'allowTextSelection\')');
function visit55_58_1(result) {
  _$jscoverage['/control.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['49'][1].init(295, 4, 'view');
function visit54_49_1(result) {
  _$jscoverage['/control.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/control.js'].functionData[0]++;
  _$jscoverage['/control.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/control.js'].lineData[8]++;
  var ComponentProcess = require('./control/process');
  _$jscoverage['/control.js'].lineData[9]++;
  var Manager = require('component/manager');
  _$jscoverage['/control.js'].lineData[10]++;
  var Render = require('./control/render');
  _$jscoverage['/control.js'].lineData[11]++;
  var ie = S.UA.ieMode, Features = S.Features, Gesture = Node.Gesture, isTouchGestureSupported = Features.isTouchGestureSupported(), isTouchEventSupported = Features.isTouchEventSupported();
  _$jscoverage['/control.js'].lineData[22]++;
  var Control = ComponentProcess.extend({
  isControl: true, 
  createDom: function() {
  _$jscoverage['/control.js'].functionData[1]++;
  _$jscoverage['/control.js'].lineData[42]++;
  var self = this, Render = self.get('xrender'), view = self.get('view'), id = self.get('id'), el;
  _$jscoverage['/control.js'].lineData[49]++;
  if (visit54_49_1(view)) {
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
  if (visit55_58_1(!self.get('allowTextSelection'))) {
    _$jscoverage['/control.js'].lineData[59]++;
    el.unselectable();
  }
  _$jscoverage['/control.js'].lineData[62]++;
  Manager.addComponent(id, self);
}, 
  renderUI: function() {
  _$jscoverage['/control.js'].functionData[2]++;
  _$jscoverage['/control.js'].lineData[71]++;
  this.view.render();
}, 
  bindUI: function() {
  _$jscoverage['/control.js'].functionData[3]++;
  _$jscoverage['/control.js'].lineData[75]++;
  var self = this, el = self.view.getKeyEventTarget();
  _$jscoverage['/control.js'].lineData[78]++;
  if (visit56_78_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[83]++;
    el.on('focus', self.handleFocus, self).on('blur', self.handleBlur, self).on('keydown', self.handleKeydown, self);
  }
  _$jscoverage['/control.js'].lineData[86]++;
  if (visit57_86_1(self.get('handleMouseEvents'))) {
    _$jscoverage['/control.js'].lineData[87]++;
    el = self.$el;
    _$jscoverage['/control.js'].lineData[91]++;
    el.on('mouseenter', self.handleMouseEnter, self).on('mouseleave', self.handleMouseLeave, self).on('contextmenu', self.handleContextMenu, self);
    _$jscoverage['/control.js'].lineData[96]++;
    el.on(Gesture.start, self.handleMouseDown, self).on(Gesture.end, self.handleMouseUp, self).on(Gesture.tap, self.handleClick, self);
    _$jscoverage['/control.js'].lineData[97]++;
    if (visit58_97_1(Gesture.cancel)) {
      _$jscoverage['/control.js'].lineData[98]++;
      el.on(Gesture.cancel, self.handleMouseUp, self);
    }
    _$jscoverage['/control.js'].lineData[103]++;
    if (visit59_103_1(ie < 9)) {
      _$jscoverage['/control.js'].lineData[104]++;
      el.on('dblclick', self.handleDblClick, self);
    }
  }
}, 
  sync: function() {
  _$jscoverage['/control.js'].functionData[4]++;
  _$jscoverage['/control.js'].lineData[110]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[111]++;
  self.fire('beforeSyncUI');
  _$jscoverage['/control.js'].lineData[112]++;
  self.syncUI();
  _$jscoverage['/control.js'].lineData[113]++;
  self.view.sync();
  _$jscoverage['/control.js'].lineData[114]++;
  self.__callPluginsMethod('pluginSyncUI');
  _$jscoverage['/control.js'].lineData[115]++;
  self.fire('afterSyncUI');
}, 
  createComponent: function(cfg, parent) {
  _$jscoverage['/control.js'].functionData[5]++;
  _$jscoverage['/control.js'].lineData[119]++;
  return Manager.createComponent(cfg, visit60_119_1(parent || this));
}, 
  '_onSetFocused': function(v) {
  _$jscoverage['/control.js'].functionData[6]++;
  _$jscoverage['/control.js'].lineData[123]++;
  var target = this.view.getKeyEventTarget()[0];
  _$jscoverage['/control.js'].lineData[124]++;
  if (visit61_124_1(v)) {
    _$jscoverage['/control.js'].lineData[125]++;
    target.focus();
  } else {
    _$jscoverage['/control.js'].lineData[129]++;
    if (visit62_129_1(target.ownerDocument.activeElement === target)) {
      _$jscoverage['/control.js'].lineData[130]++;
      target.ownerDocument.body.focus();
    }
  }
}, 
  '_onSetX': function(x) {
  _$jscoverage['/control.js'].functionData[7]++;
  _$jscoverage['/control.js'].lineData[136]++;
  this.$el.offset({
  left: x});
}, 
  '_onSetY': function(y) {
  _$jscoverage['/control.js'].functionData[8]++;
  _$jscoverage['/control.js'].lineData[142]++;
  this.$el.offset({
  top: y});
}, 
  _onSetVisible: function(v) {
  _$jscoverage['/control.js'].functionData[9]++;
  _$jscoverage['/control.js'].lineData[149]++;
  this.fire(v ? 'show' : 'hide');
}, 
  show: function() {
  _$jscoverage['/control.js'].functionData[10]++;
  _$jscoverage['/control.js'].lineData[157]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[158]++;
  self.render();
  _$jscoverage['/control.js'].lineData[159]++;
  self.set('visible', true);
  _$jscoverage['/control.js'].lineData[160]++;
  return self;
}, 
  hide: function() {
  _$jscoverage['/control.js'].functionData[11]++;
  _$jscoverage['/control.js'].lineData[168]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[169]++;
  self.set('visible', false);
  _$jscoverage['/control.js'].lineData[170]++;
  return self;
}, 
  focus: function() {
  _$jscoverage['/control.js'].functionData[12]++;
  _$jscoverage['/control.js'].lineData[174]++;
  if (visit63_174_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[175]++;
    this.set('focused', true);
  }
}, 
  blur: function() {
  _$jscoverage['/control.js'].functionData[13]++;
  _$jscoverage['/control.js'].lineData[180]++;
  if (visit64_180_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[181]++;
    this.set('focused', false);
  }
}, 
  move: function(x, y) {
  _$jscoverage['/control.js'].functionData[14]++;
  _$jscoverage['/control.js'].lineData[186]++;
  this.set({
  x: x, 
  y: y});
}, 
  handleDblClick: function(ev) {
  _$jscoverage['/control.js'].functionData[15]++;
  _$jscoverage['/control.js'].lineData[193]++;
  if (visit65_193_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[194]++;
    this.handleDblClickInternal(ev);
  }
}, 
  handleDblClickInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[16]++;
  _$jscoverage['/control.js'].lineData[206]++;
  this.handleClickInternal(ev);
}, 
  handleMouseEnter: function(ev) {
  _$jscoverage['/control.js'].functionData[17]++;
  _$jscoverage['/control.js'].lineData[210]++;
  if (visit66_210_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[211]++;
    this.handleMouseEnterInternal(ev);
  }
}, 
  handleMouseEnterInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[18]++;
  _$jscoverage['/control.js'].lineData[221]++;
  this.set('highlighted', !!ev);
}, 
  handleMouseLeave: function(ev) {
  _$jscoverage['/control.js'].functionData[19]++;
  _$jscoverage['/control.js'].lineData[225]++;
  if (visit67_225_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[226]++;
    this.handleMouseLeaveInternal(ev);
  }
}, 
  handleMouseLeaveInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[20]++;
  _$jscoverage['/control.js'].lineData[236]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[237]++;
  self.set('active', false);
  _$jscoverage['/control.js'].lineData[238]++;
  self.set('highlighted', !ev);
}, 
  handleMouseDown: function(ev) {
  _$jscoverage['/control.js'].functionData[21]++;
  _$jscoverage['/control.js'].lineData[242]++;
  if (visit68_242_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[243]++;
    this.handleMouseDownInternal(ev);
  }
}, 
  handleMouseDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[22]++;
  _$jscoverage['/control.js'].lineData[256]++;
  var self = this, n, isMouseActionButton = visit69_258_1(ev.which === 1);
  _$jscoverage['/control.js'].lineData[259]++;
  if (visit70_259_1(isMouseActionButton || isTouchGestureSupported)) {
    _$jscoverage['/control.js'].lineData[260]++;
    if (visit71_260_1(self.get('activeable'))) {
      _$jscoverage['/control.js'].lineData[261]++;
      self.set('active', true);
    }
    _$jscoverage['/control.js'].lineData[263]++;
    if (visit72_263_1(self.get('focusable'))) {
      _$jscoverage['/control.js'].lineData[264]++;
      self.focus();
    }
    _$jscoverage['/control.js'].lineData[266]++;
    if (visit73_266_1(!self.get('allowTextSelection') && visit74_266_2(ev.type.indexOf('mouse') !== -1))) {
      _$jscoverage['/control.js'].lineData[269]++;
      n = ev.target.nodeName;
      _$jscoverage['/control.js'].lineData[270]++;
      n = visit75_270_1(n && n.toLowerCase());
      _$jscoverage['/control.js'].lineData[272]++;
      if (visit76_272_1(visit77_272_2(n !== 'input') && visit78_272_3(visit79_272_4(n !== 'textarea') && visit80_272_5(n !== 'button')))) {
        _$jscoverage['/control.js'].lineData[273]++;
        ev.preventDefault();
      }
    }
  }
}, 
  handleMouseUp: function(ev) {
  _$jscoverage['/control.js'].functionData[23]++;
  _$jscoverage['/control.js'].lineData[280]++;
  if (visit81_280_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[281]++;
    this.handleMouseUpInternal(ev);
  }
}, 
  handleMouseUpInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[24]++;
  _$jscoverage['/control.js'].lineData[293]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[295]++;
  if (visit82_295_1(self.get('active') && (visit83_295_2(visit84_295_3(ev.which === 1) || isTouchGestureSupported)))) {
    _$jscoverage['/control.js'].lineData[296]++;
    self.set('active', false);
  }
}, 
  handleContextMenu: function(ev) {
  _$jscoverage['/control.js'].functionData[25]++;
  _$jscoverage['/control.js'].lineData[301]++;
  if (visit85_301_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[302]++;
    this.handleContextMenuInternal(ev);
  }
}, 
  handleContextMenuInternal: function() {
  _$jscoverage['/control.js'].functionData[26]++;
}, 
  handleFocus: function() {
  _$jscoverage['/control.js'].functionData[27]++;
  _$jscoverage['/control.js'].lineData[314]++;
  if (visit86_314_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[315]++;
    this.handleFocusInternal();
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/control.js'].functionData[28]++;
  _$jscoverage['/control.js'].lineData[324]++;
  this.focus();
  _$jscoverage['/control.js'].lineData[325]++;
  this.fire('focus');
}, 
  handleBlur: function() {
  _$jscoverage['/control.js'].functionData[29]++;
  _$jscoverage['/control.js'].lineData[329]++;
  if (visit87_329_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[330]++;
    this.handleBlurInternal();
  }
}, 
  handleBlurInternal: function() {
  _$jscoverage['/control.js'].functionData[30]++;
  _$jscoverage['/control.js'].lineData[339]++;
  this.blur();
  _$jscoverage['/control.js'].lineData[340]++;
  this.fire('blur');
}, 
  handleKeydown: function(ev) {
  _$jscoverage['/control.js'].functionData[31]++;
  _$jscoverage['/control.js'].lineData[344]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[345]++;
  if (visit88_345_1(!this.get('disabled') && self.handleKeyDownInternal(ev))) {
    _$jscoverage['/control.js'].lineData[346]++;
    ev.halt();
    _$jscoverage['/control.js'].lineData[347]++;
    return true;
  }
  _$jscoverage['/control.js'].lineData[349]++;
  return undefined;
}, 
  handleKeyDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[32]++;
  _$jscoverage['/control.js'].lineData[358]++;
  if (visit89_358_1(ev.keyCode === Node.KeyCode.ENTER)) {
    _$jscoverage['/control.js'].lineData[359]++;
    return this.handleClickInternal(ev);
  }
  _$jscoverage['/control.js'].lineData[361]++;
  return undefined;
}, 
  handleClick: function(ev) {
  _$jscoverage['/control.js'].functionData[33]++;
  _$jscoverage['/control.js'].lineData[365]++;
  if (visit90_365_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[366]++;
    this.handleClickInternal(ev);
  }
}, 
  handleClickInternal: function() {
  _$jscoverage['/control.js'].functionData[34]++;
  _$jscoverage['/control.js'].lineData[376]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[377]++;
  if (visit91_377_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[378]++;
    self.focus();
  }
}, 
  destructor: function() {
  _$jscoverage['/control.js'].functionData[35]++;
  _$jscoverage['/control.js'].lineData[386]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[388]++;
  Manager.removeComponent(self.get('id'));
  _$jscoverage['/control.js'].lineData[389]++;
  if (visit92_389_1(self.view)) {
    _$jscoverage['/control.js'].lineData[390]++;
    self.view.destroy();
  } else {
    _$jscoverage['/control.js'].lineData[391]++;
    if (visit93_391_1(self.get('srcNode'))) {
      _$jscoverage['/control.js'].lineData[392]++;
      self.get('srcNode').remove();
    }
  }
}}, {
  name: 'control', 
  ATTRS: {
  id: {
  view: 1, 
  valueFn: function() {
  _$jscoverage['/control.js'].functionData[36]++;
  _$jscoverage['/control.js'].lineData[403]++;
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
  _$jscoverage['/control.js'].lineData[467]++;
  if (visit94_467_1(typeof v === 'string')) {
    _$jscoverage['/control.js'].lineData[468]++;
    v = v.split(/\s+/);
  }
  _$jscoverage['/control.js'].lineData[470]++;
  return visit95_470_1(v || []);
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
  _$jscoverage['/control.js'].lineData[520]++;
  this.$el = el;
  _$jscoverage['/control.js'].lineData[521]++;
  this.el = el[0];
}}, 
  x: {}, 
  y: {}, 
  xy: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[39]++;
  _$jscoverage['/control.js'].lineData[566]++;
  var self = this, xy = S.makeArray(v);
  _$jscoverage['/control.js'].lineData[568]++;
  if (visit96_568_1(xy.length)) {
    _$jscoverage['/control.js'].lineData[569]++;
    if (visit97_569_1(xy[0] !== undefined)) {
      _$jscoverage['/control.js'].lineData[570]++;
      self.set('x', xy[0]);
    }
    _$jscoverage['/control.js'].lineData[572]++;
    if (visit98_572_1(xy[1] !== undefined)) {
      _$jscoverage['/control.js'].lineData[573]++;
      self.set('y', xy[1]);
    }
  }
  _$jscoverage['/control.js'].lineData[576]++;
  return v;
}, 
  getter: function() {
  _$jscoverage['/control.js'].functionData[40]++;
  _$jscoverage['/control.js'].lineData[579]++;
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
  _$jscoverage['/control.js'].lineData[646]++;
  return Node.all(v);
}}, 
  handleMouseEvents: {
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
  value: visit99_767_1(S.config('component/prefixCls') || 'ks-')}, 
  prefixXClass: {}, 
  parent: {
  setter: function(p, prev) {
  _$jscoverage['/control.js'].functionData[42]++;
  _$jscoverage['/control.js'].lineData[795]++;
  if ((prev = this.get('parent'))) {
    _$jscoverage['/control.js'].lineData[796]++;
    this.removeTarget(prev);
  }
  _$jscoverage['/control.js'].lineData[798]++;
  if (visit100_798_1(p)) {
    _$jscoverage['/control.js'].lineData[799]++;
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
  _$jscoverage['/control.js'].lineData[835]++;
  this.view = v;
}}}});
  _$jscoverage['/control.js'].lineData[841]++;
  function getDefaultRender() {
    _$jscoverage['/control.js'].functionData[44]++;
    _$jscoverage['/control.js'].lineData[842]++;
    var attrs, constructor = this;
    _$jscoverage['/control.js'].lineData[844]++;
    do {
      _$jscoverage['/control.js'].lineData[845]++;
      attrs = constructor.ATTRS;
      _$jscoverage['/control.js'].lineData[846]++;
      constructor = constructor.superclass;
    } while (visit101_847_1(!attrs || !attrs.xrender));
    _$jscoverage['/control.js'].lineData[848]++;
    return attrs.xrender.value;
  }
  _$jscoverage['/control.js'].lineData[851]++;
  Control.getDefaultRender = getDefaultRender;
  _$jscoverage['/control.js'].lineData[872]++;
  Control.extend = function extend(extensions, px, sx) {
  _$jscoverage['/control.js'].functionData[45]++;
  _$jscoverage['/control.js'].lineData[874]++;
  var args = S.makeArray(arguments), baseClass = this, xclass, newClass, argsLen = args.length, last = args[argsLen - 1];
  _$jscoverage['/control.js'].lineData[881]++;
  if ((xclass = last.xclass)) {
    _$jscoverage['/control.js'].lineData[882]++;
    last.name = xclass;
  }
  _$jscoverage['/control.js'].lineData[885]++;
  newClass = ComponentProcess.extend.apply(baseClass, args);
  _$jscoverage['/control.js'].lineData[887]++;
  if (visit102_887_1(xclass)) {
    _$jscoverage['/control.js'].lineData[888]++;
    Manager.setConstructorByXClass(xclass, newClass);
  }
  _$jscoverage['/control.js'].lineData[891]++;
  newClass.extend = extend;
  _$jscoverage['/control.js'].lineData[892]++;
  newClass.getDefaultRender = getDefaultRender;
  _$jscoverage['/control.js'].lineData[894]++;
  return newClass;
};
  _$jscoverage['/control.js'].lineData[897]++;
  return Control;
});
