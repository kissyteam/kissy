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
if (! _$jscoverage['/touch/handle.js']) {
  _$jscoverage['/touch/handle.js'] = {};
  _$jscoverage['/touch/handle.js'].lineData = [];
  _$jscoverage['/touch/handle.js'].lineData[6] = 0;
  _$jscoverage['/touch/handle.js'].lineData[7] = 0;
  _$jscoverage['/touch/handle.js'].lineData[13] = 0;
  _$jscoverage['/touch/handle.js'].lineData[14] = 0;
  _$jscoverage['/touch/handle.js'].lineData[17] = 0;
  _$jscoverage['/touch/handle.js'].lineData[18] = 0;
  _$jscoverage['/touch/handle.js'].lineData[21] = 0;
  _$jscoverage['/touch/handle.js'].lineData[22] = 0;
  _$jscoverage['/touch/handle.js'].lineData[26] = 0;
  _$jscoverage['/touch/handle.js'].lineData[28] = 0;
  _$jscoverage['/touch/handle.js'].lineData[30] = 0;
  _$jscoverage['/touch/handle.js'].lineData[31] = 0;
  _$jscoverage['/touch/handle.js'].lineData[33] = 0;
  _$jscoverage['/touch/handle.js'].lineData[34] = 0;
  _$jscoverage['/touch/handle.js'].lineData[35] = 0;
  _$jscoverage['/touch/handle.js'].lineData[37] = 0;
  _$jscoverage['/touch/handle.js'].lineData[39] = 0;
  _$jscoverage['/touch/handle.js'].lineData[40] = 0;
  _$jscoverage['/touch/handle.js'].lineData[42] = 0;
  _$jscoverage['/touch/handle.js'].lineData[43] = 0;
  _$jscoverage['/touch/handle.js'].lineData[44] = 0;
  _$jscoverage['/touch/handle.js'].lineData[45] = 0;
  _$jscoverage['/touch/handle.js'].lineData[47] = 0;
  _$jscoverage['/touch/handle.js'].lineData[48] = 0;
  _$jscoverage['/touch/handle.js'].lineData[49] = 0;
  _$jscoverage['/touch/handle.js'].lineData[52] = 0;
  _$jscoverage['/touch/handle.js'].lineData[53] = 0;
  _$jscoverage['/touch/handle.js'].lineData[54] = 0;
  _$jscoverage['/touch/handle.js'].lineData[55] = 0;
  _$jscoverage['/touch/handle.js'].lineData[56] = 0;
  _$jscoverage['/touch/handle.js'].lineData[58] = 0;
  _$jscoverage['/touch/handle.js'].lineData[60] = 0;
  _$jscoverage['/touch/handle.js'].lineData[63] = 0;
  _$jscoverage['/touch/handle.js'].lineData[71] = 0;
  _$jscoverage['/touch/handle.js'].lineData[73] = 0;
  _$jscoverage['/touch/handle.js'].lineData[74] = 0;
  _$jscoverage['/touch/handle.js'].lineData[75] = 0;
  _$jscoverage['/touch/handle.js'].lineData[77] = 0;
  _$jscoverage['/touch/handle.js'].lineData[81] = 0;
  _$jscoverage['/touch/handle.js'].lineData[82] = 0;
  _$jscoverage['/touch/handle.js'].lineData[86] = 0;
  _$jscoverage['/touch/handle.js'].lineData[91] = 0;
  _$jscoverage['/touch/handle.js'].lineData[92] = 0;
  _$jscoverage['/touch/handle.js'].lineData[93] = 0;
  _$jscoverage['/touch/handle.js'].lineData[94] = 0;
  _$jscoverage['/touch/handle.js'].lineData[95] = 0;
  _$jscoverage['/touch/handle.js'].lineData[101] = 0;
  _$jscoverage['/touch/handle.js'].lineData[106] = 0;
  _$jscoverage['/touch/handle.js'].lineData[107] = 0;
  _$jscoverage['/touch/handle.js'].lineData[108] = 0;
  _$jscoverage['/touch/handle.js'].lineData[109] = 0;
  _$jscoverage['/touch/handle.js'].lineData[115] = 0;
  _$jscoverage['/touch/handle.js'].lineData[119] = 0;
  _$jscoverage['/touch/handle.js'].lineData[120] = 0;
  _$jscoverage['/touch/handle.js'].lineData[125] = 0;
  _$jscoverage['/touch/handle.js'].lineData[126] = 0;
  _$jscoverage['/touch/handle.js'].lineData[132] = 0;
  _$jscoverage['/touch/handle.js'].lineData[133] = 0;
  _$jscoverage['/touch/handle.js'].lineData[135] = 0;
  _$jscoverage['/touch/handle.js'].lineData[137] = 0;
  _$jscoverage['/touch/handle.js'].lineData[138] = 0;
  _$jscoverage['/touch/handle.js'].lineData[139] = 0;
  _$jscoverage['/touch/handle.js'].lineData[140] = 0;
  _$jscoverage['/touch/handle.js'].lineData[141] = 0;
  _$jscoverage['/touch/handle.js'].lineData[142] = 0;
  _$jscoverage['/touch/handle.js'].lineData[150] = 0;
  _$jscoverage['/touch/handle.js'].lineData[151] = 0;
  _$jscoverage['/touch/handle.js'].lineData[153] = 0;
  _$jscoverage['/touch/handle.js'].lineData[155] = 0;
  _$jscoverage['/touch/handle.js'].lineData[157] = 0;
  _$jscoverage['/touch/handle.js'].lineData[158] = 0;
  _$jscoverage['/touch/handle.js'].lineData[161] = 0;
  _$jscoverage['/touch/handle.js'].lineData[165] = 0;
  _$jscoverage['/touch/handle.js'].lineData[168] = 0;
  _$jscoverage['/touch/handle.js'].lineData[169] = 0;
  _$jscoverage['/touch/handle.js'].lineData[172] = 0;
  _$jscoverage['/touch/handle.js'].lineData[173] = 0;
  _$jscoverage['/touch/handle.js'].lineData[174] = 0;
  _$jscoverage['/touch/handle.js'].lineData[175] = 0;
  _$jscoverage['/touch/handle.js'].lineData[177] = 0;
  _$jscoverage['/touch/handle.js'].lineData[179] = 0;
  _$jscoverage['/touch/handle.js'].lineData[181] = 0;
  _$jscoverage['/touch/handle.js'].lineData[182] = 0;
  _$jscoverage['/touch/handle.js'].lineData[183] = 0;
  _$jscoverage['/touch/handle.js'].lineData[184] = 0;
  _$jscoverage['/touch/handle.js'].lineData[185] = 0;
  _$jscoverage['/touch/handle.js'].lineData[189] = 0;
  _$jscoverage['/touch/handle.js'].lineData[193] = 0;
  _$jscoverage['/touch/handle.js'].lineData[194] = 0;
  _$jscoverage['/touch/handle.js'].lineData[195] = 0;
  _$jscoverage['/touch/handle.js'].lineData[196] = 0;
  _$jscoverage['/touch/handle.js'].lineData[197] = 0;
  _$jscoverage['/touch/handle.js'].lineData[198] = 0;
  _$jscoverage['/touch/handle.js'].lineData[200] = 0;
  _$jscoverage['/touch/handle.js'].lineData[201] = 0;
  _$jscoverage['/touch/handle.js'].lineData[202] = 0;
  _$jscoverage['/touch/handle.js'].lineData[203] = 0;
  _$jscoverage['/touch/handle.js'].lineData[204] = 0;
  _$jscoverage['/touch/handle.js'].lineData[207] = 0;
  _$jscoverage['/touch/handle.js'].lineData[210] = 0;
  _$jscoverage['/touch/handle.js'].lineData[211] = 0;
  _$jscoverage['/touch/handle.js'].lineData[212] = 0;
  _$jscoverage['/touch/handle.js'].lineData[215] = 0;
  _$jscoverage['/touch/handle.js'].lineData[219] = 0;
  _$jscoverage['/touch/handle.js'].lineData[221] = 0;
  _$jscoverage['/touch/handle.js'].lineData[222] = 0;
  _$jscoverage['/touch/handle.js'].lineData[223] = 0;
  _$jscoverage['/touch/handle.js'].lineData[224] = 0;
  _$jscoverage['/touch/handle.js'].lineData[226] = 0;
  _$jscoverage['/touch/handle.js'].lineData[227] = 0;
  _$jscoverage['/touch/handle.js'].lineData[228] = 0;
  _$jscoverage['/touch/handle.js'].lineData[230] = 0;
  _$jscoverage['/touch/handle.js'].lineData[233] = 0;
  _$jscoverage['/touch/handle.js'].lineData[237] = 0;
  _$jscoverage['/touch/handle.js'].lineData[239] = 0;
  _$jscoverage['/touch/handle.js'].lineData[240] = 0;
  _$jscoverage['/touch/handle.js'].lineData[241] = 0;
  _$jscoverage['/touch/handle.js'].lineData[245] = 0;
  _$jscoverage['/touch/handle.js'].lineData[246] = 0;
  _$jscoverage['/touch/handle.js'].lineData[247] = 0;
  _$jscoverage['/touch/handle.js'].lineData[248] = 0;
  _$jscoverage['/touch/handle.js'].lineData[249] = 0;
  _$jscoverage['/touch/handle.js'].lineData[251] = 0;
  _$jscoverage['/touch/handle.js'].lineData[252] = 0;
  _$jscoverage['/touch/handle.js'].lineData[253] = 0;
  _$jscoverage['/touch/handle.js'].lineData[254] = 0;
  _$jscoverage['/touch/handle.js'].lineData[255] = 0;
  _$jscoverage['/touch/handle.js'].lineData[256] = 0;
  _$jscoverage['/touch/handle.js'].lineData[262] = 0;
  _$jscoverage['/touch/handle.js'].lineData[266] = 0;
  _$jscoverage['/touch/handle.js'].lineData[267] = 0;
  _$jscoverage['/touch/handle.js'].lineData[269] = 0;
  _$jscoverage['/touch/handle.js'].lineData[270] = 0;
  _$jscoverage['/touch/handle.js'].lineData[271] = 0;
  _$jscoverage['/touch/handle.js'].lineData[273] = 0;
  _$jscoverage['/touch/handle.js'].lineData[275] = 0;
  _$jscoverage['/touch/handle.js'].lineData[276] = 0;
  _$jscoverage['/touch/handle.js'].lineData[280] = 0;
  _$jscoverage['/touch/handle.js'].lineData[281] = 0;
  _$jscoverage['/touch/handle.js'].lineData[282] = 0;
  _$jscoverage['/touch/handle.js'].lineData[287] = 0;
  _$jscoverage['/touch/handle.js'].lineData[290] = 0;
  _$jscoverage['/touch/handle.js'].lineData[291] = 0;
  _$jscoverage['/touch/handle.js'].lineData[293] = 0;
  _$jscoverage['/touch/handle.js'].lineData[301] = 0;
  _$jscoverage['/touch/handle.js'].lineData[302] = 0;
  _$jscoverage['/touch/handle.js'].lineData[303] = 0;
  _$jscoverage['/touch/handle.js'].lineData[304] = 0;
  _$jscoverage['/touch/handle.js'].lineData[305] = 0;
  _$jscoverage['/touch/handle.js'].lineData[311] = 0;
  _$jscoverage['/touch/handle.js'].lineData[313] = 0;
  _$jscoverage['/touch/handle.js'].lineData[314] = 0;
  _$jscoverage['/touch/handle.js'].lineData[315] = 0;
  _$jscoverage['/touch/handle.js'].lineData[319] = 0;
  _$jscoverage['/touch/handle.js'].lineData[321] = 0;
  _$jscoverage['/touch/handle.js'].lineData[323] = 0;
  _$jscoverage['/touch/handle.js'].lineData[324] = 0;
  _$jscoverage['/touch/handle.js'].lineData[326] = 0;
  _$jscoverage['/touch/handle.js'].lineData[327] = 0;
  _$jscoverage['/touch/handle.js'].lineData[332] = 0;
  _$jscoverage['/touch/handle.js'].lineData[334] = 0;
  _$jscoverage['/touch/handle.js'].lineData[335] = 0;
  _$jscoverage['/touch/handle.js'].lineData[336] = 0;
  _$jscoverage['/touch/handle.js'].lineData[338] = 0;
  _$jscoverage['/touch/handle.js'].lineData[339] = 0;
  _$jscoverage['/touch/handle.js'].lineData[340] = 0;
}
if (! _$jscoverage['/touch/handle.js'].functionData) {
  _$jscoverage['/touch/handle.js'].functionData = [];
  _$jscoverage['/touch/handle.js'].functionData[0] = 0;
  _$jscoverage['/touch/handle.js'].functionData[1] = 0;
  _$jscoverage['/touch/handle.js'].functionData[2] = 0;
  _$jscoverage['/touch/handle.js'].functionData[3] = 0;
  _$jscoverage['/touch/handle.js'].functionData[4] = 0;
  _$jscoverage['/touch/handle.js'].functionData[5] = 0;
  _$jscoverage['/touch/handle.js'].functionData[6] = 0;
  _$jscoverage['/touch/handle.js'].functionData[7] = 0;
  _$jscoverage['/touch/handle.js'].functionData[8] = 0;
  _$jscoverage['/touch/handle.js'].functionData[9] = 0;
  _$jscoverage['/touch/handle.js'].functionData[10] = 0;
  _$jscoverage['/touch/handle.js'].functionData[11] = 0;
  _$jscoverage['/touch/handle.js'].functionData[12] = 0;
  _$jscoverage['/touch/handle.js'].functionData[13] = 0;
  _$jscoverage['/touch/handle.js'].functionData[14] = 0;
  _$jscoverage['/touch/handle.js'].functionData[15] = 0;
  _$jscoverage['/touch/handle.js'].functionData[16] = 0;
  _$jscoverage['/touch/handle.js'].functionData[17] = 0;
  _$jscoverage['/touch/handle.js'].functionData[18] = 0;
  _$jscoverage['/touch/handle.js'].functionData[19] = 0;
  _$jscoverage['/touch/handle.js'].functionData[20] = 0;
  _$jscoverage['/touch/handle.js'].functionData[21] = 0;
  _$jscoverage['/touch/handle.js'].functionData[22] = 0;
  _$jscoverage['/touch/handle.js'].functionData[23] = 0;
  _$jscoverage['/touch/handle.js'].functionData[24] = 0;
  _$jscoverage['/touch/handle.js'].functionData[25] = 0;
}
if (! _$jscoverage['/touch/handle.js'].branchData) {
  _$jscoverage['/touch/handle.js'].branchData = {};
  _$jscoverage['/touch/handle.js'].branchData['30'] = [];
  _$jscoverage['/touch/handle.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['31'] = [];
  _$jscoverage['/touch/handle.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['42'] = [];
  _$jscoverage['/touch/handle.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['74'] = [];
  _$jscoverage['/touch/handle.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['91'] = [];
  _$jscoverage['/touch/handle.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['93'] = [];
  _$jscoverage['/touch/handle.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['106'] = [];
  _$jscoverage['/touch/handle.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['108'] = [];
  _$jscoverage['/touch/handle.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['115'] = [];
  _$jscoverage['/touch/handle.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['119'] = [];
  _$jscoverage['/touch/handle.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['125'] = [];
  _$jscoverage['/touch/handle.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['135'] = [];
  _$jscoverage['/touch/handle.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['141'] = [];
  _$jscoverage['/touch/handle.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['153'] = [];
  _$jscoverage['/touch/handle.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['153'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['157'] = [];
  _$jscoverage['/touch/handle.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['157'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['157'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['168'] = [];
  _$jscoverage['/touch/handle.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['169'] = [];
  _$jscoverage['/touch/handle.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['169'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['169'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['172'] = [];
  _$jscoverage['/touch/handle.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['193'] = [];
  _$jscoverage['/touch/handle.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['196'] = [];
  _$jscoverage['/touch/handle.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['197'] = [];
  _$jscoverage['/touch/handle.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['201'] = [];
  _$jscoverage['/touch/handle.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['203'] = [];
  _$jscoverage['/touch/handle.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['221'] = [];
  _$jscoverage['/touch/handle.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['222'] = [];
  _$jscoverage['/touch/handle.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['223'] = [];
  _$jscoverage['/touch/handle.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['227'] = [];
  _$jscoverage['/touch/handle.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['239'] = [];
  _$jscoverage['/touch/handle.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['240'] = [];
  _$jscoverage['/touch/handle.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['246'] = [];
  _$jscoverage['/touch/handle.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['251'] = [];
  _$jscoverage['/touch/handle.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['253'] = [];
  _$jscoverage['/touch/handle.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['255'] = [];
  _$jscoverage['/touch/handle.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['270'] = [];
  _$jscoverage['/touch/handle.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['275'] = [];
  _$jscoverage['/touch/handle.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['275'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['275'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['290'] = [];
  _$jscoverage['/touch/handle.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['302'] = [];
  _$jscoverage['/touch/handle.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['304'] = [];
  _$jscoverage['/touch/handle.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['323'] = [];
  _$jscoverage['/touch/handle.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['326'] = [];
  _$jscoverage['/touch/handle.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['334'] = [];
  _$jscoverage['/touch/handle.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['335'] = [];
  _$jscoverage['/touch/handle.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['338'] = [];
  _$jscoverage['/touch/handle.js'].branchData['338'][1] = new BranchData();
}
_$jscoverage['/touch/handle.js'].branchData['338'][1].init(121, 35, 'S.isEmptyObject(handle.eventHandle)');
function visit55_338_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['335'][1].init(21, 5, 'event');
function visit54_335_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['334'][1].init(105, 6, 'handle');
function visit53_334_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['326'][1].init(217, 5, 'event');
function visit52_326_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['323'][1].init(105, 7, '!handle');
function visit51_323_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['304'][1].init(65, 25, '!eventHandle[event].count');
function visit50_304_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['302'][1].init(65, 18, 'eventHandle[event]');
function visit49_302_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['290'][1].init(149, 18, 'eventHandle[event]');
function visit48_290_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['275'][3].init(303, 26, 'h[method](event) === false');
function visit47_275_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['275'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['275'][2].init(290, 39, 'h[method] && h[method](event) === false');
function visit46_275_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['275'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['275'][1].init(276, 53, 'h.isActive && h[method] && h[method](event) === false');
function visit45_275_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['270'][1].init(125, 11, 'h.processed');
function visit44_270_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['255'][1].init(76, 20, '!self.touches.length');
function visit43_255_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['253'][1].init(610, 22, 'isMSPointerEvent(type)');
function visit42_253_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['251'][1].init(529, 18, 'isMouseEvent(type)');
function visit41_251_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['246'][1].init(296, 18, 'isTouchEvent(type)');
function visit40_246_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['240'][1].init(21, 37, 'self.isEventSimulatedFromTouch(event)');
function visit39_240_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['239'][1].init(81, 18, 'isMouseEvent(type)');
function visit38_239_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['227'][1].init(333, 22, 'isMSPointerEvent(type)');
function visit37_227_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['223'][1].init(21, 36, 'self.isEventSimulatedFromTouch(type)');
function visit36_223_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['222'][1].init(127, 18, 'isMouseEvent(type)');
function visit35_222_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['221'][1].init(81, 18, 'isTouchEvent(type)');
function visit34_221_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['203'][1].init(73, 24, 'self.touches.length == 1');
function visit33_203_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['201'][1].init(505, 22, 'isMSPointerEvent(type)');
function visit32_201_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['197'][1].init(21, 37, 'self.isEventSimulatedFromTouch(event)');
function visit31_197_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['196'][1].init(298, 18, 'isMouseEvent(type)');
function visit30_196_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['193'][1].init(151, 18, 'isTouchEvent(type)');
function visit29_193_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['172'][1].init(167, 21, 'touchList.length == 1');
function visit28_172_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['169'][3].init(52, 21, 'type == \'touchcancel\'');
function visit27_169_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['169'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['169'][2].init(30, 18, 'type == \'touchend\'');
function visit26_169_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['169'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['169'][1].init(30, 43, 'type == \'touchend\' || type == \'touchcancel\'');
function visit25_169_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['168'][1].init(98, 18, 'isTouchEvent(type)');
function visit24_168_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['157'][3].init(211, 14, 'dy <= DUP_DIST');
function visit23_157_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['157'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['157'][2].init(193, 14, 'dx <= DUP_DIST');
function visit22_157_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['157'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['157'][1].init(193, 32, 'dx <= DUP_DIST && dy <= DUP_DIST');
function visit21_157_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['153'][2].init(162, 5, 'i < l');
function visit20_153_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['153'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['153'][1].init(162, 21, 'i < l && (t = lts[i])');
function visit19_153_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['141'][1].init(70, 6, 'i > -1');
function visit18_141_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['135'][1].init(165, 22, 'this.isPrimaryTouch(t)');
function visit17_135_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['125'][1].init(17, 28, 'this.isPrimaryTouch(inTouch)');
function visit16_125_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['119'][1].init(17, 24, 'this.firstTouch === null');
function visit15_119_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['115'][1].init(20, 38, 'this.firstTouch === inTouch.identifier');
function visit14_115_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['108'][1].init(57, 32, 'touch[\'pointerId\'] === pointerId');
function visit13_108_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['106'][1].init(198, 5, 'i < l');
function visit12_106_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['93'][1].init(57, 32, 'touch[\'pointerId\'] === pointerId');
function visit11_93_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['91'][1].init(198, 5, 'i < l');
function visit10_91_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['74'][1].init(152, 35, '!isMSPointerEvent(gestureMoveEvent)');
function visit9_74_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['42'][1].init(1111, 31, 'Features.isMsPointerSupported()');
function visit8_42_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['31'][1].init(13, 8, 'S.UA.ios');
function visit7_31_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['30'][1].init(611, 32, 'Features.isTouchEventSupported()');
function visit6_30_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].lineData[6]++;
KISSY.add('event/dom/touch/handle', function(S, Dom, eventHandleMap, DomEvent) {
  _$jscoverage['/touch/handle.js'].functionData[0]++;
  _$jscoverage['/touch/handle.js'].lineData[7]++;
  var key = S.guid('touch-handle'), Features = S.Features, gestureStartEvent, gestureMoveEvent, gestureEndEvent;
  _$jscoverage['/touch/handle.js'].lineData[13]++;
  function isTouchEvent(type) {
    _$jscoverage['/touch/handle.js'].functionData[1]++;
    _$jscoverage['/touch/handle.js'].lineData[14]++;
    return S.startsWith(type, 'touch');
  }
  _$jscoverage['/touch/handle.js'].lineData[17]++;
  function isMouseEvent(type) {
    _$jscoverage['/touch/handle.js'].functionData[2]++;
    _$jscoverage['/touch/handle.js'].lineData[18]++;
    return S.startsWith(type, 'mouse');
  }
  _$jscoverage['/touch/handle.js'].lineData[21]++;
  function isMSPointerEvent(type) {
    _$jscoverage['/touch/handle.js'].functionData[3]++;
    _$jscoverage['/touch/handle.js'].lineData[22]++;
    return S.startsWith(type, 'MSPointer');
  }
  _$jscoverage['/touch/handle.js'].lineData[26]++;
  var DUP_TIMEOUT = 2500;
  _$jscoverage['/touch/handle.js'].lineData[28]++;
  var DUP_DIST = 25;
  _$jscoverage['/touch/handle.js'].lineData[30]++;
  if (visit6_30_1(Features.isTouchEventSupported())) {
    _$jscoverage['/touch/handle.js'].lineData[31]++;
    if (visit7_31_1(S.UA.ios)) {
      _$jscoverage['/touch/handle.js'].lineData[33]++;
      gestureEndEvent = 'touchend touchcancel';
      _$jscoverage['/touch/handle.js'].lineData[34]++;
      gestureStartEvent = 'touchstart';
      _$jscoverage['/touch/handle.js'].lineData[35]++;
      gestureMoveEvent = 'touchmove';
    } else {
      _$jscoverage['/touch/handle.js'].lineData[37]++;
      gestureEndEvent = 'touchend touchcancel mouseup';
      _$jscoverage['/touch/handle.js'].lineData[39]++;
      gestureStartEvent = 'touchstart mousedown';
      _$jscoverage['/touch/handle.js'].lineData[40]++;
      gestureMoveEvent = 'touchmove mousemove';
    }
  } else {
    _$jscoverage['/touch/handle.js'].lineData[42]++;
    if (visit8_42_1(Features.isMsPointerSupported())) {
      _$jscoverage['/touch/handle.js'].lineData[43]++;
      gestureStartEvent = 'MSPointerDown';
      _$jscoverage['/touch/handle.js'].lineData[44]++;
      gestureMoveEvent = 'MSPointerMove';
      _$jscoverage['/touch/handle.js'].lineData[45]++;
      gestureEndEvent = 'MSPointerUp MSPointerCancel';
    } else {
      _$jscoverage['/touch/handle.js'].lineData[47]++;
      gestureStartEvent = 'mousedown';
      _$jscoverage['/touch/handle.js'].lineData[48]++;
      gestureMoveEvent = 'mousemove';
      _$jscoverage['/touch/handle.js'].lineData[49]++;
      gestureEndEvent = 'mouseup';
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[52]++;
  function DocumentHandler(doc) {
    _$jscoverage['/touch/handle.js'].functionData[4]++;
    _$jscoverage['/touch/handle.js'].lineData[53]++;
    var self = this;
    _$jscoverage['/touch/handle.js'].lineData[54]++;
    self.doc = doc;
    _$jscoverage['/touch/handle.js'].lineData[55]++;
    self.eventHandle = {};
    _$jscoverage['/touch/handle.js'].lineData[56]++;
    self.init();
    _$jscoverage['/touch/handle.js'].lineData[58]++;
    self.touches = [];
    _$jscoverage['/touch/handle.js'].lineData[60]++;
    self.inTouch = 0;
  }
  _$jscoverage['/touch/handle.js'].lineData[63]++;
  DocumentHandler.prototype = {
  constructor: DocumentHandler, 
  lastTouches: [], 
  firstTouch: null, 
  init: function() {
  _$jscoverage['/touch/handle.js'].functionData[5]++;
  _$jscoverage['/touch/handle.js'].lineData[71]++;
  var self = this, doc = self.doc;
  _$jscoverage['/touch/handle.js'].lineData[73]++;
  DomEvent.on(doc, gestureStartEvent, self.onTouchStart, self);
  _$jscoverage['/touch/handle.js'].lineData[74]++;
  if (visit9_74_1(!isMSPointerEvent(gestureMoveEvent))) {
    _$jscoverage['/touch/handle.js'].lineData[75]++;
    DomEvent.on(doc, gestureMoveEvent, self.onTouchMove, self);
  }
  _$jscoverage['/touch/handle.js'].lineData[77]++;
  DomEvent.on(doc, gestureEndEvent, self.onTouchEnd, self);
}, 
  addTouch: function(originalEvent) {
  _$jscoverage['/touch/handle.js'].functionData[6]++;
  _$jscoverage['/touch/handle.js'].lineData[81]++;
  originalEvent.identifier = originalEvent['pointerId'];
  _$jscoverage['/touch/handle.js'].lineData[82]++;
  this.touches.push(originalEvent);
}, 
  removeTouch: function(originalEvent) {
  _$jscoverage['/touch/handle.js'].functionData[7]++;
  _$jscoverage['/touch/handle.js'].lineData[86]++;
  var i = 0, touch, pointerId = originalEvent['pointerId'], touches = this.touches, l = touches.length;
  _$jscoverage['/touch/handle.js'].lineData[91]++;
  for (; visit10_91_1(i < l); i++) {
    _$jscoverage['/touch/handle.js'].lineData[92]++;
    touch = touches[i];
    _$jscoverage['/touch/handle.js'].lineData[93]++;
    if (visit11_93_1(touch['pointerId'] === pointerId)) {
      _$jscoverage['/touch/handle.js'].lineData[94]++;
      touches.splice(i, 1);
      _$jscoverage['/touch/handle.js'].lineData[95]++;
      break;
    }
  }
}, 
  updateTouch: function(originalEvent) {
  _$jscoverage['/touch/handle.js'].functionData[8]++;
  _$jscoverage['/touch/handle.js'].lineData[101]++;
  var i = 0, touch, pointerId = originalEvent['pointerId'], touches = this.touches, l = touches.length;
  _$jscoverage['/touch/handle.js'].lineData[106]++;
  for (; visit12_106_1(i < l); i++) {
    _$jscoverage['/touch/handle.js'].lineData[107]++;
    touch = touches[i];
    _$jscoverage['/touch/handle.js'].lineData[108]++;
    if (visit13_108_1(touch['pointerId'] === pointerId)) {
      _$jscoverage['/touch/handle.js'].lineData[109]++;
      touches[i] = originalEvent;
    }
  }
}, 
  isPrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[9]++;
  _$jscoverage['/touch/handle.js'].lineData[115]++;
  return visit14_115_1(this.firstTouch === inTouch.identifier);
}, 
  setPrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[10]++;
  _$jscoverage['/touch/handle.js'].lineData[119]++;
  if (visit15_119_1(this.firstTouch === null)) {
    _$jscoverage['/touch/handle.js'].lineData[120]++;
    this.firstTouch = inTouch.identifier;
  }
}, 
  removePrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[11]++;
  _$jscoverage['/touch/handle.js'].lineData[125]++;
  if (visit16_125_1(this.isPrimaryTouch(inTouch))) {
    _$jscoverage['/touch/handle.js'].lineData[126]++;
    this.firstTouch = null;
  }
}, 
  dupMouse: function(inEvent) {
  _$jscoverage['/touch/handle.js'].functionData[12]++;
  _$jscoverage['/touch/handle.js'].lineData[132]++;
  var lts = this.lastTouches;
  _$jscoverage['/touch/handle.js'].lineData[133]++;
  var t = inEvent.changedTouches[0];
  _$jscoverage['/touch/handle.js'].lineData[135]++;
  if (visit17_135_1(this.isPrimaryTouch(t))) {
    _$jscoverage['/touch/handle.js'].lineData[137]++;
    var lt = {
  x: t.clientX, 
  y: t.clientY};
    _$jscoverage['/touch/handle.js'].lineData[138]++;
    lts.push(lt);
    _$jscoverage['/touch/handle.js'].lineData[139]++;
    setTimeout(function() {
  _$jscoverage['/touch/handle.js'].functionData[13]++;
  _$jscoverage['/touch/handle.js'].lineData[140]++;
  var i = lts.indexOf(lt);
  _$jscoverage['/touch/handle.js'].lineData[141]++;
  if (visit18_141_1(i > -1)) {
    _$jscoverage['/touch/handle.js'].lineData[142]++;
    lts.splice(i, 1);
  }
}, DUP_TIMEOUT);
  }
}, 
  isEventSimulatedFromTouch: function(inEvent) {
  _$jscoverage['/touch/handle.js'].functionData[14]++;
  _$jscoverage['/touch/handle.js'].lineData[150]++;
  var lts = this.lastTouches;
  _$jscoverage['/touch/handle.js'].lineData[151]++;
  var x = inEvent.clientX, y = inEvent.clientY;
  _$jscoverage['/touch/handle.js'].lineData[153]++;
  for (var i = 0, l = lts.length, t; visit19_153_1(visit20_153_2(i < l) && (t = lts[i])); i++) {
    _$jscoverage['/touch/handle.js'].lineData[155]++;
    var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
    _$jscoverage['/touch/handle.js'].lineData[157]++;
    if (visit21_157_1(visit22_157_2(dx <= DUP_DIST) && visit23_157_3(dy <= DUP_DIST))) {
      _$jscoverage['/touch/handle.js'].lineData[158]++;
      return true;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[161]++;
  return 0;
}, 
  normalize: function(e) {
  _$jscoverage['/touch/handle.js'].functionData[15]++;
  _$jscoverage['/touch/handle.js'].lineData[165]++;
  var type = e.type, notUp, touchList;
  _$jscoverage['/touch/handle.js'].lineData[168]++;
  if (visit24_168_1(isTouchEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[169]++;
    touchList = (visit25_169_1(visit26_169_2(type == 'touchend') || visit27_169_3(type == 'touchcancel'))) ? e.changedTouches : e.touches;
    _$jscoverage['/touch/handle.js'].lineData[172]++;
    if (visit28_172_1(touchList.length == 1)) {
      _$jscoverage['/touch/handle.js'].lineData[173]++;
      e.which = 1;
      _$jscoverage['/touch/handle.js'].lineData[174]++;
      e.pageX = touchList[0].pageX;
      _$jscoverage['/touch/handle.js'].lineData[175]++;
      e.pageY = touchList[0].pageY;
    }
    _$jscoverage['/touch/handle.js'].lineData[177]++;
    return e;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[179]++;
    touchList = this.touches;
  }
  _$jscoverage['/touch/handle.js'].lineData[181]++;
  notUp = !type.match(/(up|cancel)$/i);
  _$jscoverage['/touch/handle.js'].lineData[182]++;
  e.touches = notUp ? touchList : [];
  _$jscoverage['/touch/handle.js'].lineData[183]++;
  e.targetTouches = notUp ? touchList : [];
  _$jscoverage['/touch/handle.js'].lineData[184]++;
  e.changedTouches = touchList;
  _$jscoverage['/touch/handle.js'].lineData[185]++;
  return e;
}, 
  onTouchStart: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[16]++;
  _$jscoverage['/touch/handle.js'].lineData[189]++;
  var e, h, self = this, type = event.type, eventHandle = self.eventHandle;
  _$jscoverage['/touch/handle.js'].lineData[193]++;
  if (visit29_193_1(isTouchEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[194]++;
    self.setPrimaryTouch(event.changedTouches[0]);
    _$jscoverage['/touch/handle.js'].lineData[195]++;
    self.dupMouse(event);
  } else {
    _$jscoverage['/touch/handle.js'].lineData[196]++;
    if (visit30_196_1(isMouseEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[197]++;
      if (visit31_197_1(self.isEventSimulatedFromTouch(event))) {
        _$jscoverage['/touch/handle.js'].lineData[198]++;
        return;
      }
      _$jscoverage['/touch/handle.js'].lineData[200]++;
      self.touches = [event.originalEvent];
    } else {
      _$jscoverage['/touch/handle.js'].lineData[201]++;
      if (visit32_201_1(isMSPointerEvent(type))) {
        _$jscoverage['/touch/handle.js'].lineData[202]++;
        self.addTouch(event.originalEvent);
        _$jscoverage['/touch/handle.js'].lineData[203]++;
        if (visit33_203_1(self.touches.length == 1)) {
          _$jscoverage['/touch/handle.js'].lineData[204]++;
          DomEvent.on(self.doc, gestureMoveEvent, self.onTouchMove, self);
        }
      } else {
        _$jscoverage['/touch/handle.js'].lineData[207]++;
        throw new Error('unrecognized touch event: ' + event.type);
      }
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[210]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[211]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[212]++;
    h.isActive = 1;
  }
  _$jscoverage['/touch/handle.js'].lineData[215]++;
  self.callEventHandle('onTouchStart', event);
}, 
  onTouchMove: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[17]++;
  _$jscoverage['/touch/handle.js'].lineData[219]++;
  var self = this, type = event.type;
  _$jscoverage['/touch/handle.js'].lineData[221]++;
  if (visit34_221_1(isTouchEvent(type))) {
  } else {
    _$jscoverage['/touch/handle.js'].lineData[222]++;
    if (visit35_222_1(isMouseEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[223]++;
      if (visit36_223_1(self.isEventSimulatedFromTouch(type))) {
        _$jscoverage['/touch/handle.js'].lineData[224]++;
        return;
      }
      _$jscoverage['/touch/handle.js'].lineData[226]++;
      self.touches = [event.originalEvent];
    } else {
      _$jscoverage['/touch/handle.js'].lineData[227]++;
      if (visit37_227_1(isMSPointerEvent(type))) {
        _$jscoverage['/touch/handle.js'].lineData[228]++;
        self.updateTouch(event.originalEvent);
      } else {
        _$jscoverage['/touch/handle.js'].lineData[230]++;
        throw new Error('unrecognized touch event: ' + event.type);
      }
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[233]++;
  self.callEventHandle('onTouchMove', event);
}, 
  onTouchEnd: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[18]++;
  _$jscoverage['/touch/handle.js'].lineData[237]++;
  var self = this, type = event.type;
  _$jscoverage['/touch/handle.js'].lineData[239]++;
  if (visit38_239_1(isMouseEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[240]++;
    if (visit39_240_1(self.isEventSimulatedFromTouch(event))) {
      _$jscoverage['/touch/handle.js'].lineData[241]++;
      return;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[245]++;
  self.callEventHandle('onTouchEnd', event);
  _$jscoverage['/touch/handle.js'].lineData[246]++;
  if (visit40_246_1(isTouchEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[247]++;
    self.dupMouse(event);
    _$jscoverage['/touch/handle.js'].lineData[248]++;
    S.makeArray(event.changedTouches).forEach(function(touch) {
  _$jscoverage['/touch/handle.js'].functionData[19]++;
  _$jscoverage['/touch/handle.js'].lineData[249]++;
  self.removePrimaryTouch(touch);
});
  } else {
    _$jscoverage['/touch/handle.js'].lineData[251]++;
    if (visit41_251_1(isMouseEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[252]++;
      self.touches = [];
    } else {
      _$jscoverage['/touch/handle.js'].lineData[253]++;
      if (visit42_253_1(isMSPointerEvent(type))) {
        _$jscoverage['/touch/handle.js'].lineData[254]++;
        self.removeTouch(event.originalEvent);
        _$jscoverage['/touch/handle.js'].lineData[255]++;
        if (visit43_255_1(!self.touches.length)) {
          _$jscoverage['/touch/handle.js'].lineData[256]++;
          DomEvent.detach(self.doc, gestureMoveEvent, self.onTouchMove, self);
        }
      }
    }
  }
}, 
  callEventHandle: function(method, event) {
  _$jscoverage['/touch/handle.js'].functionData[20]++;
  _$jscoverage['/touch/handle.js'].lineData[262]++;
  var self = this, eventHandle = self.eventHandle, e, h;
  _$jscoverage['/touch/handle.js'].lineData[266]++;
  event = self.normalize(event);
  _$jscoverage['/touch/handle.js'].lineData[267]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[269]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[270]++;
    if (visit44_270_1(h.processed)) {
      _$jscoverage['/touch/handle.js'].lineData[271]++;
      continue;
    }
    _$jscoverage['/touch/handle.js'].lineData[273]++;
    h.processed = 1;
    _$jscoverage['/touch/handle.js'].lineData[275]++;
    if (visit45_275_1(h.isActive && visit46_275_2(h[method] && visit47_275_3(h[method](event) === false)))) {
      _$jscoverage['/touch/handle.js'].lineData[276]++;
      h.isActive = 0;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[280]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[281]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[282]++;
    h.processed = 0;
  }
}, 
  addEventHandle: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[21]++;
  _$jscoverage['/touch/handle.js'].lineData[287]++;
  var self = this, eventHandle = self.eventHandle, handle = eventHandleMap[event].handle;
  _$jscoverage['/touch/handle.js'].lineData[290]++;
  if (visit48_290_1(eventHandle[event])) {
    _$jscoverage['/touch/handle.js'].lineData[291]++;
    eventHandle[event].count++;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[293]++;
    eventHandle[event] = {
  count: 1, 
  handle: handle};
  }
}, 
  'removeEventHandle': function(event) {
  _$jscoverage['/touch/handle.js'].functionData[22]++;
  _$jscoverage['/touch/handle.js'].lineData[301]++;
  var eventHandle = this.eventHandle;
  _$jscoverage['/touch/handle.js'].lineData[302]++;
  if (visit49_302_1(eventHandle[event])) {
    _$jscoverage['/touch/handle.js'].lineData[303]++;
    eventHandle[event].count--;
    _$jscoverage['/touch/handle.js'].lineData[304]++;
    if (visit50_304_1(!eventHandle[event].count)) {
      _$jscoverage['/touch/handle.js'].lineData[305]++;
      delete eventHandle[event];
    }
  }
}, 
  destroy: function() {
  _$jscoverage['/touch/handle.js'].functionData[23]++;
  _$jscoverage['/touch/handle.js'].lineData[311]++;
  var self = this, doc = self.doc;
  _$jscoverage['/touch/handle.js'].lineData[313]++;
  DomEvent.detach(doc, gestureStartEvent, self.onTouchStart, self);
  _$jscoverage['/touch/handle.js'].lineData[314]++;
  DomEvent.detach(doc, gestureMoveEvent, self.onTouchMove, self);
  _$jscoverage['/touch/handle.js'].lineData[315]++;
  DomEvent.detach(doc, gestureEndEvent, self.onTouchEnd, self);
}};
  _$jscoverage['/touch/handle.js'].lineData[319]++;
  return {
  addDocumentHandle: function(el, event) {
  _$jscoverage['/touch/handle.js'].functionData[24]++;
  _$jscoverage['/touch/handle.js'].lineData[321]++;
  var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
  _$jscoverage['/touch/handle.js'].lineData[323]++;
  if (visit51_323_1(!handle)) {
    _$jscoverage['/touch/handle.js'].lineData[324]++;
    Dom.data(doc, key, handle = new DocumentHandler(doc));
  }
  _$jscoverage['/touch/handle.js'].lineData[326]++;
  if (visit52_326_1(event)) {
    _$jscoverage['/touch/handle.js'].lineData[327]++;
    handle.addEventHandle(event);
  }
}, 
  removeDocumentHandle: function(el, event) {
  _$jscoverage['/touch/handle.js'].functionData[25]++;
  _$jscoverage['/touch/handle.js'].lineData[332]++;
  var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
  _$jscoverage['/touch/handle.js'].lineData[334]++;
  if (visit53_334_1(handle)) {
    _$jscoverage['/touch/handle.js'].lineData[335]++;
    if (visit54_335_1(event)) {
      _$jscoverage['/touch/handle.js'].lineData[336]++;
      handle.removeEventHandle(event);
    }
    _$jscoverage['/touch/handle.js'].lineData[338]++;
    if (visit55_338_1(S.isEmptyObject(handle.eventHandle))) {
      _$jscoverage['/touch/handle.js'].lineData[339]++;
      handle.destroy();
      _$jscoverage['/touch/handle.js'].lineData[340]++;
      Dom.removeData(doc, key);
    }
  }
}};
}, {
  requires: ['dom', './handle-map', 'event/dom/base', './tap', './swipe', './double-tap', './pinch', './tap-hold', './rotate']});
