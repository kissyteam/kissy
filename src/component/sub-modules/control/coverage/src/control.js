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
  _$jscoverage['/control.js'].lineData[80] = 0;
  _$jscoverage['/control.js'].lineData[85] = 0;
  _$jscoverage['/control.js'].lineData[88] = 0;
  _$jscoverage['/control.js'].lineData[89] = 0;
  _$jscoverage['/control.js'].lineData[91] = 0;
  _$jscoverage['/control.js'].lineData[94] = 0;
  _$jscoverage['/control.js'].lineData[100] = 0;
  _$jscoverage['/control.js'].lineData[101] = 0;
  _$jscoverage['/control.js'].lineData[102] = 0;
  _$jscoverage['/control.js'].lineData[107] = 0;
  _$jscoverage['/control.js'].lineData[108] = 0;
  _$jscoverage['/control.js'].lineData[114] = 0;
  _$jscoverage['/control.js'].lineData[115] = 0;
  _$jscoverage['/control.js'].lineData[116] = 0;
  _$jscoverage['/control.js'].lineData[117] = 0;
  _$jscoverage['/control.js'].lineData[118] = 0;
  _$jscoverage['/control.js'].lineData[122] = 0;
  _$jscoverage['/control.js'].lineData[126] = 0;
  _$jscoverage['/control.js'].lineData[130] = 0;
  _$jscoverage['/control.js'].lineData[131] = 0;
  _$jscoverage['/control.js'].lineData[132] = 0;
  _$jscoverage['/control.js'].lineData[136] = 0;
  _$jscoverage['/control.js'].lineData[137] = 0;
  _$jscoverage['/control.js'].lineData[143] = 0;
  _$jscoverage['/control.js'].lineData[149] = 0;
  _$jscoverage['/control.js'].lineData[156] = 0;
  _$jscoverage['/control.js'].lineData[164] = 0;
  _$jscoverage['/control.js'].lineData[165] = 0;
  _$jscoverage['/control.js'].lineData[166] = 0;
  _$jscoverage['/control.js'].lineData[167] = 0;
  _$jscoverage['/control.js'].lineData[175] = 0;
  _$jscoverage['/control.js'].lineData[176] = 0;
  _$jscoverage['/control.js'].lineData[177] = 0;
  _$jscoverage['/control.js'].lineData[181] = 0;
  _$jscoverage['/control.js'].lineData[182] = 0;
  _$jscoverage['/control.js'].lineData[187] = 0;
  _$jscoverage['/control.js'].lineData[188] = 0;
  _$jscoverage['/control.js'].lineData[193] = 0;
  _$jscoverage['/control.js'].lineData[200] = 0;
  _$jscoverage['/control.js'].lineData[201] = 0;
  _$jscoverage['/control.js'].lineData[213] = 0;
  _$jscoverage['/control.js'].lineData[217] = 0;
  _$jscoverage['/control.js'].lineData[218] = 0;
  _$jscoverage['/control.js'].lineData[228] = 0;
  _$jscoverage['/control.js'].lineData[232] = 0;
  _$jscoverage['/control.js'].lineData[233] = 0;
  _$jscoverage['/control.js'].lineData[243] = 0;
  _$jscoverage['/control.js'].lineData[244] = 0;
  _$jscoverage['/control.js'].lineData[245] = 0;
  _$jscoverage['/control.js'].lineData[249] = 0;
  _$jscoverage['/control.js'].lineData[250] = 0;
  _$jscoverage['/control.js'].lineData[263] = 0;
  _$jscoverage['/control.js'].lineData[266] = 0;
  _$jscoverage['/control.js'].lineData[267] = 0;
  _$jscoverage['/control.js'].lineData[268] = 0;
  _$jscoverage['/control.js'].lineData[270] = 0;
  _$jscoverage['/control.js'].lineData[271] = 0;
  _$jscoverage['/control.js'].lineData[273] = 0;
  _$jscoverage['/control.js'].lineData[276] = 0;
  _$jscoverage['/control.js'].lineData[277] = 0;
  _$jscoverage['/control.js'].lineData[279] = 0;
  _$jscoverage['/control.js'].lineData[280] = 0;
  _$jscoverage['/control.js'].lineData[287] = 0;
  _$jscoverage['/control.js'].lineData[288] = 0;
  _$jscoverage['/control.js'].lineData[300] = 0;
  _$jscoverage['/control.js'].lineData[302] = 0;
  _$jscoverage['/control.js'].lineData[303] = 0;
  _$jscoverage['/control.js'].lineData[308] = 0;
  _$jscoverage['/control.js'].lineData[309] = 0;
  _$jscoverage['/control.js'].lineData[321] = 0;
  _$jscoverage['/control.js'].lineData[322] = 0;
  _$jscoverage['/control.js'].lineData[331] = 0;
  _$jscoverage['/control.js'].lineData[332] = 0;
  _$jscoverage['/control.js'].lineData[336] = 0;
  _$jscoverage['/control.js'].lineData[337] = 0;
  _$jscoverage['/control.js'].lineData[346] = 0;
  _$jscoverage['/control.js'].lineData[347] = 0;
  _$jscoverage['/control.js'].lineData[351] = 0;
  _$jscoverage['/control.js'].lineData[352] = 0;
  _$jscoverage['/control.js'].lineData[353] = 0;
  _$jscoverage['/control.js'].lineData[354] = 0;
  _$jscoverage['/control.js'].lineData[356] = 0;
  _$jscoverage['/control.js'].lineData[365] = 0;
  _$jscoverage['/control.js'].lineData[366] = 0;
  _$jscoverage['/control.js'].lineData[368] = 0;
  _$jscoverage['/control.js'].lineData[372] = 0;
  _$jscoverage['/control.js'].lineData[373] = 0;
  _$jscoverage['/control.js'].lineData[383] = 0;
  _$jscoverage['/control.js'].lineData[384] = 0;
  _$jscoverage['/control.js'].lineData[385] = 0;
  _$jscoverage['/control.js'].lineData[393] = 0;
  _$jscoverage['/control.js'].lineData[395] = 0;
  _$jscoverage['/control.js'].lineData[396] = 0;
  _$jscoverage['/control.js'].lineData[397] = 0;
  _$jscoverage['/control.js'].lineData[398] = 0;
  _$jscoverage['/control.js'].lineData[399] = 0;
  _$jscoverage['/control.js'].lineData[410] = 0;
  _$jscoverage['/control.js'].lineData[474] = 0;
  _$jscoverage['/control.js'].lineData[475] = 0;
  _$jscoverage['/control.js'].lineData[477] = 0;
  _$jscoverage['/control.js'].lineData[527] = 0;
  _$jscoverage['/control.js'].lineData[528] = 0;
  _$jscoverage['/control.js'].lineData[573] = 0;
  _$jscoverage['/control.js'].lineData[575] = 0;
  _$jscoverage['/control.js'].lineData[576] = 0;
  _$jscoverage['/control.js'].lineData[577] = 0;
  _$jscoverage['/control.js'].lineData[579] = 0;
  _$jscoverage['/control.js'].lineData[580] = 0;
  _$jscoverage['/control.js'].lineData[583] = 0;
  _$jscoverage['/control.js'].lineData[586] = 0;
  _$jscoverage['/control.js'].lineData[653] = 0;
  _$jscoverage['/control.js'].lineData[802] = 0;
  _$jscoverage['/control.js'].lineData[803] = 0;
  _$jscoverage['/control.js'].lineData[805] = 0;
  _$jscoverage['/control.js'].lineData[806] = 0;
  _$jscoverage['/control.js'].lineData[842] = 0;
  _$jscoverage['/control.js'].lineData[848] = 0;
  _$jscoverage['/control.js'].lineData[849] = 0;
  _$jscoverage['/control.js'].lineData[851] = 0;
  _$jscoverage['/control.js'].lineData[852] = 0;
  _$jscoverage['/control.js'].lineData[853] = 0;
  _$jscoverage['/control.js'].lineData[855] = 0;
  _$jscoverage['/control.js'].lineData[858] = 0;
  _$jscoverage['/control.js'].lineData[879] = 0;
  _$jscoverage['/control.js'].lineData[881] = 0;
  _$jscoverage['/control.js'].lineData[888] = 0;
  _$jscoverage['/control.js'].lineData[889] = 0;
  _$jscoverage['/control.js'].lineData[892] = 0;
  _$jscoverage['/control.js'].lineData[894] = 0;
  _$jscoverage['/control.js'].lineData[895] = 0;
  _$jscoverage['/control.js'].lineData[898] = 0;
  _$jscoverage['/control.js'].lineData[899] = 0;
  _$jscoverage['/control.js'].lineData[901] = 0;
  _$jscoverage['/control.js'].lineData[904] = 0;
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
  _$jscoverage['/control.js'].functionData[46] = 0;
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
  _$jscoverage['/control.js'].branchData['91'] = [];
  _$jscoverage['/control.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['101'] = [];
  _$jscoverage['/control.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['107'] = [];
  _$jscoverage['/control.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['126'] = [];
  _$jscoverage['/control.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['131'] = [];
  _$jscoverage['/control.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['136'] = [];
  _$jscoverage['/control.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['181'] = [];
  _$jscoverage['/control.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['187'] = [];
  _$jscoverage['/control.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['200'] = [];
  _$jscoverage['/control.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['217'] = [];
  _$jscoverage['/control.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['232'] = [];
  _$jscoverage['/control.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['249'] = [];
  _$jscoverage['/control.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['265'] = [];
  _$jscoverage['/control.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['266'] = [];
  _$jscoverage['/control.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['267'] = [];
  _$jscoverage['/control.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['270'] = [];
  _$jscoverage['/control.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['273'] = [];
  _$jscoverage['/control.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['277'] = [];
  _$jscoverage['/control.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['279'] = [];
  _$jscoverage['/control.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['279'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['279'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['279'][4] = new BranchData();
  _$jscoverage['/control.js'].branchData['279'][5] = new BranchData();
  _$jscoverage['/control.js'].branchData['287'] = [];
  _$jscoverage['/control.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['302'] = [];
  _$jscoverage['/control.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['302'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['302'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['308'] = [];
  _$jscoverage['/control.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['321'] = [];
  _$jscoverage['/control.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['336'] = [];
  _$jscoverage['/control.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['352'] = [];
  _$jscoverage['/control.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['365'] = [];
  _$jscoverage['/control.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['372'] = [];
  _$jscoverage['/control.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['384'] = [];
  _$jscoverage['/control.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['396'] = [];
  _$jscoverage['/control.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['398'] = [];
  _$jscoverage['/control.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['474'] = [];
  _$jscoverage['/control.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['477'] = [];
  _$jscoverage['/control.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['575'] = [];
  _$jscoverage['/control.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['576'] = [];
  _$jscoverage['/control.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['579'] = [];
  _$jscoverage['/control.js'].branchData['579'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['774'] = [];
  _$jscoverage['/control.js'].branchData['774'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['805'] = [];
  _$jscoverage['/control.js'].branchData['805'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['854'] = [];
  _$jscoverage['/control.js'].branchData['854'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['894'] = [];
  _$jscoverage['/control.js'].branchData['894'][1] = new BranchData();
}
_$jscoverage['/control.js'].branchData['894'][1].init(384, 6, 'xclass');
function visit102_894_1(result) {
  _$jscoverage['/control.js'].branchData['894'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['854'][1].init(110, 24, '!attrs || !attrs.xrender');
function visit101_854_1(result) {
  _$jscoverage['/control.js'].branchData['854'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['805'][1].init(167, 1, 'p');
function visit100_805_1(result) {
  _$jscoverage['/control.js'].branchData['805'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['774'][1].init(57, 40, 'S.config(\'component/prefixCls\') || \'ks-\'');
function visit99_774_1(result) {
  _$jscoverage['/control.js'].branchData['774'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['579'][1].init(172, 19, 'xy[1] !== undefined');
function visit98_579_1(result) {
  _$jscoverage['/control.js'].branchData['579'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['576'][1].init(33, 19, 'xy[0] !== undefined');
function visit97_576_1(result) {
  _$jscoverage['/control.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['575'][1].init(119, 9, 'xy.length');
function visit96_575_1(result) {
  _$jscoverage['/control.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['477'][1].init(159, 7, 'v || []');
function visit95_477_1(result) {
  _$jscoverage['/control.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['474'][1].init(29, 21, 'typeof v === \'string\'');
function visit94_474_1(result) {
  _$jscoverage['/control.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['398'][1].init(241, 19, 'self.get(\'srcNode\')');
function visit93_398_1(result) {
  _$jscoverage['/control.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['396'][1].init(159, 9, 'self.view');
function visit92_396_1(result) {
  _$jscoverage['/control.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['384'][1].init(99, 21, 'self.get(\'focusable\')');
function visit91_384_1(result) {
  _$jscoverage['/control.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['372'][1].init(21, 21, '!this.get(\'disabled\')');
function visit90_372_1(result) {
  _$jscoverage['/control.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['365'][1].init(21, 33, 'ev.keyCode === Node.KeyCode.ENTER');
function visit89_365_1(result) {
  _$jscoverage['/control.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['352'][1].init(54, 55, '!this.get(\'disabled\') && self.handleKeyDownInternal(ev)');
function visit88_352_1(result) {
  _$jscoverage['/control.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['336'][1].init(21, 21, '!this.get(\'disabled\')');
function visit87_336_1(result) {
  _$jscoverage['/control.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['321'][1].init(21, 21, '!this.get(\'disabled\')');
function visit86_321_1(result) {
  _$jscoverage['/control.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['308'][1].init(21, 21, '!this.get(\'disabled\')');
function visit85_308_1(result) {
  _$jscoverage['/control.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['302'][3].init(99, 14, 'ev.which === 1');
function visit84_302_3(result) {
  _$jscoverage['/control.js'].branchData['302'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['302'][2].init(99, 41, 'ev.which === 1 || isTouchGestureSupported');
function visit83_302_2(result) {
  _$jscoverage['/control.js'].branchData['302'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['302'][1].init(76, 65, 'self.get(\'active\') && (ev.which === 1 || isTouchGestureSupported)');
function visit82_302_1(result) {
  _$jscoverage['/control.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['287'][1].init(21, 21, '!this.get(\'disabled\')');
function visit81_287_1(result) {
  _$jscoverage['/control.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['279'][5].init(354, 14, 'n !== \'button\'');
function visit80_279_5(result) {
  _$jscoverage['/control.js'].branchData['279'][5].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['279'][4].init(334, 16, 'n !== \'textarea\'');
function visit79_279_4(result) {
  _$jscoverage['/control.js'].branchData['279'][4].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['279'][3].init(334, 34, 'n !== \'textarea\' && n !== \'button\'');
function visit78_279_3(result) {
  _$jscoverage['/control.js'].branchData['279'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['279'][2].init(317, 13, 'n !== \'input\'');
function visit77_279_2(result) {
  _$jscoverage['/control.js'].branchData['279'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['279'][1].init(317, 51, 'n !== \'input\' && n !== \'textarea\' && n !== \'button\'');
function visit76_279_1(result) {
  _$jscoverage['/control.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['277'][1].init(188, 20, 'n && n.toLowerCase()');
function visit75_277_1(result) {
  _$jscoverage['/control.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['273'][1].init(256, 31, '!self.get(\'allowTextSelection\')');
function visit74_273_1(result) {
  _$jscoverage['/control.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['270'][1].init(147, 21, 'self.get(\'focusable\')');
function visit73_270_1(result) {
  _$jscoverage['/control.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['267'][1].init(25, 22, 'self.get(\'activeable\')');
function visit72_267_1(result) {
  _$jscoverage['/control.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['266'][1].init(135, 46, 'isMouseActionButton || isTouchGestureSupported');
function visit71_266_1(result) {
  _$jscoverage['/control.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['265'][1].init(81, 14, 'ev.which === 1');
function visit70_265_1(result) {
  _$jscoverage['/control.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['249'][1].init(21, 21, '!this.get(\'disabled\')');
function visit69_249_1(result) {
  _$jscoverage['/control.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['232'][1].init(21, 21, '!this.get(\'disabled\')');
function visit68_232_1(result) {
  _$jscoverage['/control.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['217'][1].init(21, 21, '!this.get(\'disabled\')');
function visit67_217_1(result) {
  _$jscoverage['/control.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['200'][1].init(21, 21, '!this.get(\'disabled\')');
function visit66_200_1(result) {
  _$jscoverage['/control.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['187'][1].init(21, 21, 'this.get(\'focusable\')');
function visit65_187_1(result) {
  _$jscoverage['/control.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['181'][1].init(21, 21, 'this.get(\'focusable\')');
function visit64_181_1(result) {
  _$jscoverage['/control.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['136'][1].init(183, 45, 'target.ownerDocument.activeElement === target');
function visit63_136_1(result) {
  _$jscoverage['/control.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['131'][1].init(84, 1, 'v');
function visit62_131_1(result) {
  _$jscoverage['/control.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['126'][1].init(53, 14, 'parent || this');
function visit61_126_1(result) {
  _$jscoverage['/control.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['107'][1].init(882, 6, 'ie < 9');
function visit60_107_1(result) {
  _$jscoverage['/control.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['101'][1].init(616, 14, 'Gesture.cancel');
function visit59_101_1(result) {
  _$jscoverage['/control.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['91'][1].init(61, 22, '!isTouchEventSupported');
function visit58_91_1(result) {
  _$jscoverage['/control.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['88'][1].init(517, 29, 'self.get(\'handleMouseEvents\')');
function visit57_88_1(result) {
  _$jscoverage['/control.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['80'][1].init(148, 21, 'self.get(\'focusable\')');
function visit56_80_1(result) {
  _$jscoverage['/control.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['58'][1].init(631, 31, '!self.get(\'allowTextSelection\')');
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
  view.createInternal();
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
  this.view.renderUI();
}, 
  bindUI: function() {
  _$jscoverage['/control.js'].functionData[3]++;
  _$jscoverage['/control.js'].lineData[75]++;
  var self = this, el = self.view.getKeyEventTarget();
  _$jscoverage['/control.js'].lineData[78]++;
  self.view.bindUI();
  _$jscoverage['/control.js'].lineData[80]++;
  if (visit56_80_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[85]++;
    el.on('focus', self.handleFocus, self).on('blur', self.handleBlur, self).on('keydown', self.handleKeydown, self);
  }
  _$jscoverage['/control.js'].lineData[88]++;
  if (visit57_88_1(self.get('handleMouseEvents'))) {
    _$jscoverage['/control.js'].lineData[89]++;
    el = self.$el;
    _$jscoverage['/control.js'].lineData[91]++;
    if (visit58_91_1(!isTouchEventSupported)) {
      _$jscoverage['/control.js'].lineData[94]++;
      el.on('mouseenter', self.handleMouseEnter, self).on('mouseleave', self.handleMouseLeave, self).on('contextmenu', self.handleContextMenu, self);
    }
    _$jscoverage['/control.js'].lineData[100]++;
    el.on(Gesture.start, self.handleMouseDown, self).on(Gesture.end, self.handleMouseUp, self).on(Gesture.tap, self.handleClick, self);
    _$jscoverage['/control.js'].lineData[101]++;
    if (visit59_101_1(Gesture.cancel)) {
      _$jscoverage['/control.js'].lineData[102]++;
      el.on(Gesture.cancel, self.handleMouseUp, self);
    }
    _$jscoverage['/control.js'].lineData[107]++;
    if (visit60_107_1(ie < 9)) {
      _$jscoverage['/control.js'].lineData[108]++;
      el.on('dblclick', self.handleDblClick, self);
    }
  }
}, 
  sync: function() {
  _$jscoverage['/control.js'].functionData[4]++;
  _$jscoverage['/control.js'].lineData[114]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[115]++;
  self.fire('beforeSyncUI');
  _$jscoverage['/control.js'].lineData[116]++;
  self.syncUI();
  _$jscoverage['/control.js'].lineData[117]++;
  self.__callPluginsMethod('pluginSyncUI');
  _$jscoverage['/control.js'].lineData[118]++;
  self.fire('afterSyncUI');
}, 
  syncUI: function() {
  _$jscoverage['/control.js'].functionData[5]++;
  _$jscoverage['/control.js'].lineData[122]++;
  this.view.syncUI();
}, 
  createComponent: function(cfg, parent) {
  _$jscoverage['/control.js'].functionData[6]++;
  _$jscoverage['/control.js'].lineData[126]++;
  return Manager.createComponent(cfg, visit61_126_1(parent || this));
}, 
  '_onSetFocused': function(v) {
  _$jscoverage['/control.js'].functionData[7]++;
  _$jscoverage['/control.js'].lineData[130]++;
  var target = this.view.getKeyEventTarget()[0];
  _$jscoverage['/control.js'].lineData[131]++;
  if (visit62_131_1(v)) {
    _$jscoverage['/control.js'].lineData[132]++;
    target.focus();
  } else {
    _$jscoverage['/control.js'].lineData[136]++;
    if (visit63_136_1(target.ownerDocument.activeElement === target)) {
      _$jscoverage['/control.js'].lineData[137]++;
      target.ownerDocument.body.focus();
    }
  }
}, 
  '_onSetX': function(x) {
  _$jscoverage['/control.js'].functionData[8]++;
  _$jscoverage['/control.js'].lineData[143]++;
  this.$el.offset({
  left: x});
}, 
  '_onSetY': function(y) {
  _$jscoverage['/control.js'].functionData[9]++;
  _$jscoverage['/control.js'].lineData[149]++;
  this.$el.offset({
  top: y});
}, 
  _onSetVisible: function(v) {
  _$jscoverage['/control.js'].functionData[10]++;
  _$jscoverage['/control.js'].lineData[156]++;
  this.fire(v ? 'show' : 'hide');
}, 
  show: function() {
  _$jscoverage['/control.js'].functionData[11]++;
  _$jscoverage['/control.js'].lineData[164]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[165]++;
  self.render();
  _$jscoverage['/control.js'].lineData[166]++;
  self.set('visible', true);
  _$jscoverage['/control.js'].lineData[167]++;
  return self;
}, 
  hide: function() {
  _$jscoverage['/control.js'].functionData[12]++;
  _$jscoverage['/control.js'].lineData[175]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[176]++;
  self.set('visible', false);
  _$jscoverage['/control.js'].lineData[177]++;
  return self;
}, 
  focus: function() {
  _$jscoverage['/control.js'].functionData[13]++;
  _$jscoverage['/control.js'].lineData[181]++;
  if (visit64_181_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[182]++;
    this.set('focused', true);
  }
}, 
  blur: function() {
  _$jscoverage['/control.js'].functionData[14]++;
  _$jscoverage['/control.js'].lineData[187]++;
  if (visit65_187_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[188]++;
    this.set('focused', false);
  }
}, 
  move: function(x, y) {
  _$jscoverage['/control.js'].functionData[15]++;
  _$jscoverage['/control.js'].lineData[193]++;
  this.set({
  x: x, 
  y: y});
}, 
  handleDblClick: function(ev) {
  _$jscoverage['/control.js'].functionData[16]++;
  _$jscoverage['/control.js'].lineData[200]++;
  if (visit66_200_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[201]++;
    this.handleDblClickInternal(ev);
  }
}, 
  handleDblClickInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[17]++;
  _$jscoverage['/control.js'].lineData[213]++;
  this.handleClickInternal(ev);
}, 
  handleMouseEnter: function(ev) {
  _$jscoverage['/control.js'].functionData[18]++;
  _$jscoverage['/control.js'].lineData[217]++;
  if (visit67_217_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[218]++;
    this.handleMouseEnterInternal(ev);
  }
}, 
  handleMouseEnterInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[19]++;
  _$jscoverage['/control.js'].lineData[228]++;
  this.set('highlighted', !!ev);
}, 
  handleMouseLeave: function(ev) {
  _$jscoverage['/control.js'].functionData[20]++;
  _$jscoverage['/control.js'].lineData[232]++;
  if (visit68_232_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[233]++;
    this.handleMouseLeaveInternal(ev);
  }
}, 
  handleMouseLeaveInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[21]++;
  _$jscoverage['/control.js'].lineData[243]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[244]++;
  self.set('active', false);
  _$jscoverage['/control.js'].lineData[245]++;
  self.set('highlighted', !ev);
}, 
  handleMouseDown: function(ev) {
  _$jscoverage['/control.js'].functionData[22]++;
  _$jscoverage['/control.js'].lineData[249]++;
  if (visit69_249_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[250]++;
    this.handleMouseDownInternal(ev);
  }
}, 
  handleMouseDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[23]++;
  _$jscoverage['/control.js'].lineData[263]++;
  var self = this, n, isMouseActionButton = visit70_265_1(ev.which === 1);
  _$jscoverage['/control.js'].lineData[266]++;
  if (visit71_266_1(isMouseActionButton || isTouchGestureSupported)) {
    _$jscoverage['/control.js'].lineData[267]++;
    if (visit72_267_1(self.get('activeable'))) {
      _$jscoverage['/control.js'].lineData[268]++;
      self.set('active', true);
    }
    _$jscoverage['/control.js'].lineData[270]++;
    if (visit73_270_1(self.get('focusable'))) {
      _$jscoverage['/control.js'].lineData[271]++;
      self.focus();
    }
    _$jscoverage['/control.js'].lineData[273]++;
    if (visit74_273_1(!self.get('allowTextSelection'))) {
      _$jscoverage['/control.js'].lineData[276]++;
      n = ev.target.nodeName;
      _$jscoverage['/control.js'].lineData[277]++;
      n = visit75_277_1(n && n.toLowerCase());
      _$jscoverage['/control.js'].lineData[279]++;
      if (visit76_279_1(visit77_279_2(n !== 'input') && visit78_279_3(visit79_279_4(n !== 'textarea') && visit80_279_5(n !== 'button')))) {
        _$jscoverage['/control.js'].lineData[280]++;
        ev.preventDefault();
      }
    }
  }
}, 
  handleMouseUp: function(ev) {
  _$jscoverage['/control.js'].functionData[24]++;
  _$jscoverage['/control.js'].lineData[287]++;
  if (visit81_287_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[288]++;
    this.handleMouseUpInternal(ev);
  }
}, 
  handleMouseUpInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[25]++;
  _$jscoverage['/control.js'].lineData[300]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[302]++;
  if (visit82_302_1(self.get('active') && (visit83_302_2(visit84_302_3(ev.which === 1) || isTouchGestureSupported)))) {
    _$jscoverage['/control.js'].lineData[303]++;
    self.set('active', false);
  }
}, 
  handleContextMenu: function(ev) {
  _$jscoverage['/control.js'].functionData[26]++;
  _$jscoverage['/control.js'].lineData[308]++;
  if (visit85_308_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[309]++;
    this.handleContextMenuInternal(ev);
  }
}, 
  handleContextMenuInternal: function() {
  _$jscoverage['/control.js'].functionData[27]++;
}, 
  handleFocus: function() {
  _$jscoverage['/control.js'].functionData[28]++;
  _$jscoverage['/control.js'].lineData[321]++;
  if (visit86_321_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[322]++;
    this.handleFocusInternal();
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/control.js'].functionData[29]++;
  _$jscoverage['/control.js'].lineData[331]++;
  this.focus();
  _$jscoverage['/control.js'].lineData[332]++;
  this.fire('focus');
}, 
  handleBlur: function() {
  _$jscoverage['/control.js'].functionData[30]++;
  _$jscoverage['/control.js'].lineData[336]++;
  if (visit87_336_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[337]++;
    this.handleBlurInternal();
  }
}, 
  handleBlurInternal: function() {
  _$jscoverage['/control.js'].functionData[31]++;
  _$jscoverage['/control.js'].lineData[346]++;
  this.blur();
  _$jscoverage['/control.js'].lineData[347]++;
  this.fire('blur');
}, 
  handleKeydown: function(ev) {
  _$jscoverage['/control.js'].functionData[32]++;
  _$jscoverage['/control.js'].lineData[351]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[352]++;
  if (visit88_352_1(!this.get('disabled') && self.handleKeyDownInternal(ev))) {
    _$jscoverage['/control.js'].lineData[353]++;
    ev.halt();
    _$jscoverage['/control.js'].lineData[354]++;
    return true;
  }
  _$jscoverage['/control.js'].lineData[356]++;
  return undefined;
}, 
  handleKeyDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[33]++;
  _$jscoverage['/control.js'].lineData[365]++;
  if (visit89_365_1(ev.keyCode === Node.KeyCode.ENTER)) {
    _$jscoverage['/control.js'].lineData[366]++;
    return this.handleClickInternal(ev);
  }
  _$jscoverage['/control.js'].lineData[368]++;
  return undefined;
}, 
  handleClick: function(ev) {
  _$jscoverage['/control.js'].functionData[34]++;
  _$jscoverage['/control.js'].lineData[372]++;
  if (visit90_372_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[373]++;
    this.handleClickInternal(ev);
  }
}, 
  handleClickInternal: function() {
  _$jscoverage['/control.js'].functionData[35]++;
  _$jscoverage['/control.js'].lineData[383]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[384]++;
  if (visit91_384_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[385]++;
    self.focus();
  }
}, 
  destructor: function() {
  _$jscoverage['/control.js'].functionData[36]++;
  _$jscoverage['/control.js'].lineData[393]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[395]++;
  Manager.removeComponent(self.get('id'));
  _$jscoverage['/control.js'].lineData[396]++;
  if (visit92_396_1(self.view)) {
    _$jscoverage['/control.js'].lineData[397]++;
    self.view.destroy();
  } else {
    _$jscoverage['/control.js'].lineData[398]++;
    if (visit93_398_1(self.get('srcNode'))) {
      _$jscoverage['/control.js'].lineData[399]++;
      self.get('srcNode').remove();
    }
  }
}}, {
  name: 'control', 
  ATTRS: {
  id: {
  view: 1, 
  valueFn: function() {
  _$jscoverage['/control.js'].functionData[37]++;
  _$jscoverage['/control.js'].lineData[410]++;
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
  _$jscoverage['/control.js'].functionData[38]++;
  _$jscoverage['/control.js'].lineData[474]++;
  if (visit94_474_1(typeof v === 'string')) {
    _$jscoverage['/control.js'].lineData[475]++;
    v = v.split(/\s+/);
  }
  _$jscoverage['/control.js'].lineData[477]++;
  return visit95_477_1(v || []);
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
  _$jscoverage['/control.js'].functionData[39]++;
  _$jscoverage['/control.js'].lineData[527]++;
  this.$el = el;
  _$jscoverage['/control.js'].lineData[528]++;
  this.el = el[0];
}}, 
  x: {}, 
  y: {}, 
  xy: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[40]++;
  _$jscoverage['/control.js'].lineData[573]++;
  var self = this, xy = S.makeArray(v);
  _$jscoverage['/control.js'].lineData[575]++;
  if (visit96_575_1(xy.length)) {
    _$jscoverage['/control.js'].lineData[576]++;
    if (visit97_576_1(xy[0] !== undefined)) {
      _$jscoverage['/control.js'].lineData[577]++;
      self.set('x', xy[0]);
    }
    _$jscoverage['/control.js'].lineData[579]++;
    if (visit98_579_1(xy[1] !== undefined)) {
      _$jscoverage['/control.js'].lineData[580]++;
      self.set('y', xy[1]);
    }
  }
  _$jscoverage['/control.js'].lineData[583]++;
  return v;
}, 
  getter: function() {
  _$jscoverage['/control.js'].functionData[41]++;
  _$jscoverage['/control.js'].lineData[586]++;
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
  _$jscoverage['/control.js'].functionData[42]++;
  _$jscoverage['/control.js'].lineData[653]++;
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
  value: visit99_774_1(S.config('component/prefixCls') || 'ks-')}, 
  prefixXClass: {}, 
  parent: {
  setter: function(p, prev) {
  _$jscoverage['/control.js'].functionData[43]++;
  _$jscoverage['/control.js'].lineData[802]++;
  if ((prev = this.get('parent'))) {
    _$jscoverage['/control.js'].lineData[803]++;
    this.removeTarget(prev);
  }
  _$jscoverage['/control.js'].lineData[805]++;
  if (visit100_805_1(p)) {
    _$jscoverage['/control.js'].lineData[806]++;
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
  _$jscoverage['/control.js'].functionData[44]++;
  _$jscoverage['/control.js'].lineData[842]++;
  this.view = v;
}}}});
  _$jscoverage['/control.js'].lineData[848]++;
  function getDefaultRender() {
    _$jscoverage['/control.js'].functionData[45]++;
    _$jscoverage['/control.js'].lineData[849]++;
    var attrs, constructor = this;
    _$jscoverage['/control.js'].lineData[851]++;
    do {
      _$jscoverage['/control.js'].lineData[852]++;
      attrs = constructor.ATTRS;
      _$jscoverage['/control.js'].lineData[853]++;
      constructor = constructor.superclass;
    } while (visit101_854_1(!attrs || !attrs.xrender));
    _$jscoverage['/control.js'].lineData[855]++;
    return attrs.xrender.value;
  }
  _$jscoverage['/control.js'].lineData[858]++;
  Control.getDefaultRender = getDefaultRender;
  _$jscoverage['/control.js'].lineData[879]++;
  Control.extend = function extend(extensions, px, sx) {
  _$jscoverage['/control.js'].functionData[46]++;
  _$jscoverage['/control.js'].lineData[881]++;
  var args = S.makeArray(arguments), baseClass = this, xclass, newClass, argsLen = args.length, last = args[argsLen - 1];
  _$jscoverage['/control.js'].lineData[888]++;
  if ((xclass = last.xclass)) {
    _$jscoverage['/control.js'].lineData[889]++;
    last.name = xclass;
  }
  _$jscoverage['/control.js'].lineData[892]++;
  newClass = ComponentProcess.extend.apply(baseClass, args);
  _$jscoverage['/control.js'].lineData[894]++;
  if (visit102_894_1(xclass)) {
    _$jscoverage['/control.js'].lineData[895]++;
    Manager.setConstructorByXClass(xclass, newClass);
  }
  _$jscoverage['/control.js'].lineData[898]++;
  newClass.extend = extend;
  _$jscoverage['/control.js'].lineData[899]++;
  newClass.getDefaultRender = getDefaultRender;
  _$jscoverage['/control.js'].lineData[901]++;
  return newClass;
};
  _$jscoverage['/control.js'].lineData[904]++;
  return Control;
});
