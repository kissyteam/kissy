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
if (! _$jscoverage['/cmd.js']) {
  _$jscoverage['/cmd.js'] = {};
  _$jscoverage['/cmd.js'].lineData = [];
  _$jscoverage['/cmd.js'].lineData[6] = 0;
  _$jscoverage['/cmd.js'].lineData[7] = 0;
  _$jscoverage['/cmd.js'].lineData[8] = 0;
  _$jscoverage['/cmd.js'].lineData[10] = 0;
  _$jscoverage['/cmd.js'].lineData[21] = 0;
  _$jscoverage['/cmd.js'].lineData[22] = 0;
  _$jscoverage['/cmd.js'].lineData[25] = 0;
  _$jscoverage['/cmd.js'].lineData[35] = 0;
  _$jscoverage['/cmd.js'].lineData[39] = 0;
  _$jscoverage['/cmd.js'].lineData[40] = 0;
  _$jscoverage['/cmd.js'].lineData[41] = 0;
  _$jscoverage['/cmd.js'].lineData[42] = 0;
  _$jscoverage['/cmd.js'].lineData[44] = 0;
  _$jscoverage['/cmd.js'].lineData[45] = 0;
  _$jscoverage['/cmd.js'].lineData[46] = 0;
  _$jscoverage['/cmd.js'].lineData[49] = 0;
  _$jscoverage['/cmd.js'].lineData[50] = 0;
  _$jscoverage['/cmd.js'].lineData[51] = 0;
  _$jscoverage['/cmd.js'].lineData[52] = 0;
  _$jscoverage['/cmd.js'].lineData[53] = 0;
  _$jscoverage['/cmd.js'].lineData[55] = 0;
  _$jscoverage['/cmd.js'].lineData[56] = 0;
  _$jscoverage['/cmd.js'].lineData[57] = 0;
  _$jscoverage['/cmd.js'].lineData[59] = 0;
  _$jscoverage['/cmd.js'].lineData[60] = 0;
  _$jscoverage['/cmd.js'].lineData[62] = 0;
  _$jscoverage['/cmd.js'].lineData[63] = 0;
  _$jscoverage['/cmd.js'].lineData[67] = 0;
  _$jscoverage['/cmd.js'].lineData[74] = 0;
  _$jscoverage['/cmd.js'].lineData[76] = 0;
  _$jscoverage['/cmd.js'].lineData[77] = 0;
  _$jscoverage['/cmd.js'].lineData[79] = 0;
  _$jscoverage['/cmd.js'].lineData[80] = 0;
  _$jscoverage['/cmd.js'].lineData[84] = 0;
  _$jscoverage['/cmd.js'].lineData[86] = 0;
  _$jscoverage['/cmd.js'].lineData[87] = 0;
  _$jscoverage['/cmd.js'].lineData[93] = 0;
  _$jscoverage['/cmd.js'].lineData[94] = 0;
  _$jscoverage['/cmd.js'].lineData[96] = 0;
  _$jscoverage['/cmd.js'].lineData[97] = 0;
  _$jscoverage['/cmd.js'].lineData[98] = 0;
  _$jscoverage['/cmd.js'].lineData[99] = 0;
  _$jscoverage['/cmd.js'].lineData[101] = 0;
  _$jscoverage['/cmd.js'].lineData[105] = 0;
  _$jscoverage['/cmd.js'].lineData[106] = 0;
  _$jscoverage['/cmd.js'].lineData[109] = 0;
  _$jscoverage['/cmd.js'].lineData[112] = 0;
  _$jscoverage['/cmd.js'].lineData[114] = 0;
  _$jscoverage['/cmd.js'].lineData[115] = 0;
  _$jscoverage['/cmd.js'].lineData[116] = 0;
  _$jscoverage['/cmd.js'].lineData[120] = 0;
  _$jscoverage['/cmd.js'].lineData[121] = 0;
  _$jscoverage['/cmd.js'].lineData[123] = 0;
  _$jscoverage['/cmd.js'].lineData[124] = 0;
  _$jscoverage['/cmd.js'].lineData[125] = 0;
  _$jscoverage['/cmd.js'].lineData[127] = 0;
  _$jscoverage['/cmd.js'].lineData[130] = 0;
  _$jscoverage['/cmd.js'].lineData[131] = 0;
  _$jscoverage['/cmd.js'].lineData[133] = 0;
  _$jscoverage['/cmd.js'].lineData[134] = 0;
  _$jscoverage['/cmd.js'].lineData[136] = 0;
  _$jscoverage['/cmd.js'].lineData[143] = 0;
  _$jscoverage['/cmd.js'].lineData[147] = 0;
  _$jscoverage['/cmd.js'].lineData[148] = 0;
  _$jscoverage['/cmd.js'].lineData[149] = 0;
  _$jscoverage['/cmd.js'].lineData[150] = 0;
  _$jscoverage['/cmd.js'].lineData[151] = 0;
  _$jscoverage['/cmd.js'].lineData[152] = 0;
  _$jscoverage['/cmd.js'].lineData[153] = 0;
  _$jscoverage['/cmd.js'].lineData[156] = 0;
  _$jscoverage['/cmd.js'].lineData[158] = 0;
  _$jscoverage['/cmd.js'].lineData[159] = 0;
  _$jscoverage['/cmd.js'].lineData[160] = 0;
  _$jscoverage['/cmd.js'].lineData[161] = 0;
  _$jscoverage['/cmd.js'].lineData[167] = 0;
  _$jscoverage['/cmd.js'].lineData[170] = 0;
  _$jscoverage['/cmd.js'].lineData[171] = 0;
  _$jscoverage['/cmd.js'].lineData[173] = 0;
  _$jscoverage['/cmd.js'].lineData[174] = 0;
  _$jscoverage['/cmd.js'].lineData[176] = 0;
  _$jscoverage['/cmd.js'].lineData[177] = 0;
  _$jscoverage['/cmd.js'].lineData[179] = 0;
  _$jscoverage['/cmd.js'].lineData[183] = 0;
  _$jscoverage['/cmd.js'].lineData[186] = 0;
  _$jscoverage['/cmd.js'].lineData[188] = 0;
  _$jscoverage['/cmd.js'].lineData[189] = 0;
  _$jscoverage['/cmd.js'].lineData[196] = 0;
  _$jscoverage['/cmd.js'].lineData[200] = 0;
  _$jscoverage['/cmd.js'].lineData[201] = 0;
  _$jscoverage['/cmd.js'].lineData[202] = 0;
  _$jscoverage['/cmd.js'].lineData[203] = 0;
  _$jscoverage['/cmd.js'].lineData[207] = 0;
  _$jscoverage['/cmd.js'].lineData[211] = 0;
  _$jscoverage['/cmd.js'].lineData[212] = 0;
  _$jscoverage['/cmd.js'].lineData[215] = 0;
  _$jscoverage['/cmd.js'].lineData[218] = 0;
  _$jscoverage['/cmd.js'].lineData[220] = 0;
  _$jscoverage['/cmd.js'].lineData[224] = 0;
  _$jscoverage['/cmd.js'].lineData[226] = 0;
  _$jscoverage['/cmd.js'].lineData[227] = 0;
  _$jscoverage['/cmd.js'].lineData[229] = 0;
  _$jscoverage['/cmd.js'].lineData[233] = 0;
  _$jscoverage['/cmd.js'].lineData[234] = 0;
  _$jscoverage['/cmd.js'].lineData[236] = 0;
  _$jscoverage['/cmd.js'].lineData[237] = 0;
  _$jscoverage['/cmd.js'].lineData[239] = 0;
  _$jscoverage['/cmd.js'].lineData[242] = 0;
  _$jscoverage['/cmd.js'].lineData[244] = 0;
  _$jscoverage['/cmd.js'].lineData[247] = 0;
  _$jscoverage['/cmd.js'].lineData[248] = 0;
  _$jscoverage['/cmd.js'].lineData[250] = 0;
  _$jscoverage['/cmd.js'].lineData[253] = 0;
  _$jscoverage['/cmd.js'].lineData[264] = 0;
  _$jscoverage['/cmd.js'].lineData[266] = 0;
  _$jscoverage['/cmd.js'].lineData[274] = 0;
  _$jscoverage['/cmd.js'].lineData[276] = 0;
  _$jscoverage['/cmd.js'].lineData[277] = 0;
  _$jscoverage['/cmd.js'].lineData[278] = 0;
  _$jscoverage['/cmd.js'].lineData[280] = 0;
  _$jscoverage['/cmd.js'].lineData[281] = 0;
  _$jscoverage['/cmd.js'].lineData[282] = 0;
  _$jscoverage['/cmd.js'].lineData[284] = 0;
  _$jscoverage['/cmd.js'].lineData[285] = 0;
  _$jscoverage['/cmd.js'].lineData[289] = 0;
  _$jscoverage['/cmd.js'].lineData[290] = 0;
  _$jscoverage['/cmd.js'].lineData[294] = 0;
  _$jscoverage['/cmd.js'].lineData[295] = 0;
  _$jscoverage['/cmd.js'].lineData[296] = 0;
  _$jscoverage['/cmd.js'].lineData[298] = 0;
  _$jscoverage['/cmd.js'].lineData[299] = 0;
  _$jscoverage['/cmd.js'].lineData[300] = 0;
  _$jscoverage['/cmd.js'].lineData[308] = 0;
  _$jscoverage['/cmd.js'].lineData[309] = 0;
  _$jscoverage['/cmd.js'].lineData[310] = 0;
  _$jscoverage['/cmd.js'].lineData[311] = 0;
  _$jscoverage['/cmd.js'].lineData[312] = 0;
  _$jscoverage['/cmd.js'].lineData[313] = 0;
  _$jscoverage['/cmd.js'].lineData[318] = 0;
  _$jscoverage['/cmd.js'].lineData[319] = 0;
  _$jscoverage['/cmd.js'].lineData[321] = 0;
  _$jscoverage['/cmd.js'].lineData[322] = 0;
  _$jscoverage['/cmd.js'].lineData[323] = 0;
  _$jscoverage['/cmd.js'].lineData[325] = 0;
  _$jscoverage['/cmd.js'].lineData[330] = 0;
  _$jscoverage['/cmd.js'].lineData[333] = 0;
  _$jscoverage['/cmd.js'].lineData[334] = 0;
  _$jscoverage['/cmd.js'].lineData[338] = 0;
  _$jscoverage['/cmd.js'].lineData[339] = 0;
  _$jscoverage['/cmd.js'].lineData[341] = 0;
  _$jscoverage['/cmd.js'].lineData[346] = 0;
  _$jscoverage['/cmd.js'].lineData[348] = 0;
  _$jscoverage['/cmd.js'].lineData[352] = 0;
  _$jscoverage['/cmd.js'].lineData[353] = 0;
  _$jscoverage['/cmd.js'].lineData[357] = 0;
  _$jscoverage['/cmd.js'].lineData[358] = 0;
  _$jscoverage['/cmd.js'].lineData[362] = 0;
  _$jscoverage['/cmd.js'].lineData[363] = 0;
  _$jscoverage['/cmd.js'].lineData[368] = 0;
  _$jscoverage['/cmd.js'].lineData[369] = 0;
  _$jscoverage['/cmd.js'].lineData[372] = 0;
  _$jscoverage['/cmd.js'].lineData[373] = 0;
  _$jscoverage['/cmd.js'].lineData[377] = 0;
  _$jscoverage['/cmd.js'].lineData[378] = 0;
  _$jscoverage['/cmd.js'].lineData[379] = 0;
  _$jscoverage['/cmd.js'].lineData[384] = 0;
  _$jscoverage['/cmd.js'].lineData[387] = 0;
}
if (! _$jscoverage['/cmd.js'].functionData) {
  _$jscoverage['/cmd.js'].functionData = [];
  _$jscoverage['/cmd.js'].functionData[0] = 0;
  _$jscoverage['/cmd.js'].functionData[1] = 0;
  _$jscoverage['/cmd.js'].functionData[2] = 0;
  _$jscoverage['/cmd.js'].functionData[3] = 0;
  _$jscoverage['/cmd.js'].functionData[4] = 0;
  _$jscoverage['/cmd.js'].functionData[5] = 0;
  _$jscoverage['/cmd.js'].functionData[6] = 0;
  _$jscoverage['/cmd.js'].functionData[7] = 0;
  _$jscoverage['/cmd.js'].functionData[8] = 0;
}
if (! _$jscoverage['/cmd.js'].branchData) {
  _$jscoverage['/cmd.js'].branchData = {};
  _$jscoverage['/cmd.js'].branchData['39'] = [];
  _$jscoverage['/cmd.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['42'] = [];
  _$jscoverage['/cmd.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['42'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['51'] = [];
  _$jscoverage['/cmd.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['57'] = [];
  _$jscoverage['/cmd.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['57'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['59'] = [];
  _$jscoverage['/cmd.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['74'] = [];
  _$jscoverage['/cmd.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['74'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['75'] = [];
  _$jscoverage['/cmd.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['77'] = [];
  _$jscoverage['/cmd.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['77'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['86'] = [];
  _$jscoverage['/cmd.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['93'] = [];
  _$jscoverage['/cmd.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['97'] = [];
  _$jscoverage['/cmd.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['105'] = [];
  _$jscoverage['/cmd.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['120'] = [];
  _$jscoverage['/cmd.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['130'] = [];
  _$jscoverage['/cmd.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['133'] = [];
  _$jscoverage['/cmd.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['147'] = [];
  _$jscoverage['/cmd.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['150'] = [];
  _$jscoverage['/cmd.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['158'] = [];
  _$jscoverage['/cmd.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['167'] = [];
  _$jscoverage['/cmd.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['170'] = [];
  _$jscoverage['/cmd.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['174'] = [];
  _$jscoverage['/cmd.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['175'] = [];
  _$jscoverage['/cmd.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['189'] = [];
  _$jscoverage['/cmd.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['190'] = [];
  _$jscoverage['/cmd.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['190'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['190'][3] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['192'] = [];
  _$jscoverage['/cmd.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['194'] = [];
  _$jscoverage['/cmd.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['194'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['208'] = [];
  _$jscoverage['/cmd.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['211'] = [];
  _$jscoverage['/cmd.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['211'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['226'] = [];
  _$jscoverage['/cmd.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['233'] = [];
  _$jscoverage['/cmd.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['233'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['233'][3] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['236'] = [];
  _$jscoverage['/cmd.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['236'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['236'][3] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['247'] = [];
  _$jscoverage['/cmd.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['264'] = [];
  _$jscoverage['/cmd.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['264'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['266'] = [];
  _$jscoverage['/cmd.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['277'] = [];
  _$jscoverage['/cmd.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['289'] = [];
  _$jscoverage['/cmd.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['294'] = [];
  _$jscoverage['/cmd.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['295'] = [];
  _$jscoverage['/cmd.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['309'] = [];
  _$jscoverage['/cmd.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['311'] = [];
  _$jscoverage['/cmd.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['312'] = [];
  _$jscoverage['/cmd.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['321'] = [];
  _$jscoverage['/cmd.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['322'] = [];
  _$jscoverage['/cmd.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['333'] = [];
  _$jscoverage['/cmd.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['341'] = [];
  _$jscoverage['/cmd.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['342'] = [];
  _$jscoverage['/cmd.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['343'] = [];
  _$jscoverage['/cmd.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['343'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['345'] = [];
  _$jscoverage['/cmd.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['368'] = [];
  _$jscoverage['/cmd.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['372'] = [];
  _$jscoverage['/cmd.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['373'] = [];
  _$jscoverage['/cmd.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['373'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['374'] = [];
  _$jscoverage['/cmd.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['375'] = [];
  _$jscoverage['/cmd.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['377'] = [];
  _$jscoverage['/cmd.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['378'] = [];
  _$jscoverage['/cmd.js'].branchData['378'][1] = new BranchData();
}
_$jscoverage['/cmd.js'].branchData['378'][1].init(25, 12, 'name == type');
function visit70_378_1(result) {
  _$jscoverage['/cmd.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['377'][1].init(21, 40, 'listNodeNames[name = element.nodeName()]');
function visit69_377_1(result) {
  _$jscoverage['/cmd.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['375'][1].init(44, 28, 'element[0] !== blockLimit[0]');
function visit68_375_1(result) {
  _$jscoverage['/cmd.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['374'][1].init(40, 73, '(element = elements[i]) && element[0] !== blockLimit[0]');
function visit67_374_1(result) {
  _$jscoverage['/cmd.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['373'][2].init(25, 19, 'i < elements.length');
function visit66_373_2(result) {
  _$jscoverage['/cmd.js'].branchData['373'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['373'][1].init(25, 114, 'i < elements.length && (element = elements[i]) && element[0] !== blockLimit[0]');
function visit65_373_1(result) {
  _$jscoverage['/cmd.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['372'][1].init(289, 8, 'elements');
function visit64_372_1(result) {
  _$jscoverage['/cmd.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['368'][1].init(161, 11, '!blockLimit');
function visit63_368_1(result) {
  _$jscoverage['/cmd.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['345'][1].init(123, 47, 'sibling.css(\'list-style-type\') == listStyleType');
function visit62_345_1(result) {
  _$jscoverage['/cmd.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['343'][2].init(223, 31, 'sibling.nodeName() == self.type');
function visit61_343_2(result) {
  _$jscoverage['/cmd.js'].branchData['343'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['343'][1].init(37, 171, 'sibling.nodeName() == self.type && sibling.css(\'list-style-type\') == listStyleType');
function visit60_343_1(result) {
  _$jscoverage['/cmd.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['342'][1].init(34, 209, 'sibling[0] && sibling.nodeName() == self.type && sibling.css(\'list-style-type\') == listStyleType');
function visit59_342_1(result) {
  _$jscoverage['/cmd.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['341'][1].init(147, 244, 'sibling && sibling[0] && sibling.nodeName() == self.type && sibling.css(\'list-style-type\') == listStyleType');
function visit58_341_1(result) {
  _$jscoverage['/cmd.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['333'][1].init(5926, 23, 'i < listsCreated.length');
function visit57_333_1(result) {
  _$jscoverage['/cmd.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['322'][1].init(25, 53, 'groupObj.root.css(\'list-style-type\') == listStyleType');
function visit56_322_1(result) {
  _$jscoverage['/cmd.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['321'][1].init(618, 41, 'listNodeNames[groupObj.root.nodeName()]');
function visit55_321_1(result) {
  _$jscoverage['/cmd.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['312'][1].init(25, 41, 'listNodeNames[groupObj.root.nodeName()]');
function visit54_312_1(result) {
  _$jscoverage['/cmd.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['311'][1].init(68, 6, '!state');
function visit53_311_1(result) {
  _$jscoverage['/cmd.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['309'][1].init(4801, 21, 'listGroups.length > 0');
function visit52_309_1(result) {
  _$jscoverage['/cmd.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['295'][1].init(2442, 30, 'root.data(\'list_group_object\')');
function visit51_295_1(result) {
  _$jscoverage['/cmd.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['294'][1].init(2392, 24, 'blockLimit || path.block');
function visit50_294_1(result) {
  _$jscoverage['/cmd.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['289'][1].init(2224, 13, 'processedFlag');
function visit49_289_1(result) {
  _$jscoverage['/cmd.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['277'][1].init(574, 8, 'groupObj');
function visit48_277_1(result) {
  _$jscoverage['/cmd.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['266'][1].init(29, 95, 'listNodeNames[element.nodeName()] && blockLimit.contains(element)');
function visit47_266_1(result) {
  _$jscoverage['/cmd.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['264'][2].init(834, 6, 'i >= 0');
function visit46_264_2(result) {
  _$jscoverage['/cmd.js'].branchData['264'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['264'][1].init(834, 65, 'i >= 0 && (element = pathElements[i])');
function visit45_264_1(result) {
  _$jscoverage['/cmd.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['247'][1].init(101, 24, 'block.data(\'list_block\')');
function visit44_247_1(result) {
  _$jscoverage['/cmd.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['236'][3].init(485, 26, 'endNode.nodeName() == \'td\'');
function visit43_236_3(result) {
  _$jscoverage['/cmd.js'].branchData['236'][3].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['236'][2].init(433, 48, 'endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit42_236_2(result) {
  _$jscoverage['/cmd.js'].branchData['236'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['236'][1].init(433, 78, 'endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && endNode.nodeName() == \'td\'');
function visit41_236_1(result) {
  _$jscoverage['/cmd.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['233'][3].init(293, 28, 'startNode.nodeName() == \'td\'');
function visit40_233_3(result) {
  _$jscoverage['/cmd.js'].branchData['233'][3].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['233'][2].init(239, 50, 'startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit39_233_2(result) {
  _$jscoverage['/cmd.js'].branchData['233'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['233'][1].init(239, 82, 'startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && startNode.nodeName() == \'td\'');
function visit38_233_1(result) {
  _$jscoverage['/cmd.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['226'][1].init(742, 17, 'ranges.length > 0');
function visit37_226_1(result) {
  _$jscoverage['/cmd.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['211'][2].init(201, 17, 'ranges.length < 1');
function visit36_211_2(result) {
  _$jscoverage['/cmd.js'].branchData['211'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['211'][1].init(190, 28, '!ranges || ranges.length < 1');
function visit35_211_1(result) {
  _$jscoverage['/cmd.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['208'][1].init(63, 34, 'selection && selection.getRanges()');
function visit34_208_1(result) {
  _$jscoverage['/cmd.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['194'][2].init(134, 53, 'boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit33_194_2(result) {
  _$jscoverage['/cmd.js'].branchData['194'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['194'][1].init(134, 130, 'boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && siblingNode._4eIsBlockBoundary({\n  br: 1}, undefined)');
function visit32_194_1(result) {
  _$jscoverage['/cmd.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['192'][1].init(161, 267, '(siblingNode = groupObj.root[isStart ? \'prev\' : \'next\'](Walker.whitespaces(true), 1)) && !(boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && siblingNode._4eIsBlockBoundary({\n  br: 1}, undefined))');
function visit31_192_1(result) {
  _$jscoverage['/cmd.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['190'][3].init(130, 53, 'boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit30_190_3(result) {
  _$jscoverage['/cmd.js'].branchData['190'][3].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['190'][2].init(130, 131, 'boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && boundaryNode._4eIsBlockBoundary(undefined, undefined)');
function visit29_190_2(result) {
  _$jscoverage['/cmd.js'].branchData['190'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['190'][1].init(101, 429, '!(boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && boundaryNode._4eIsBlockBoundary(undefined, undefined)) && (siblingNode = groupObj.root[isStart ? \'prev\' : \'next\'](Walker.whitespaces(true), 1)) && !(boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && siblingNode._4eIsBlockBoundary({\n  br: 1}, undefined))');
function visit28_190_1(result) {
  _$jscoverage['/cmd.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['189'][1].init(23, 531, '(boundaryNode = new Node(docFragment[isStart ? \'firstChild\' : \'lastChild\'])) && !(boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && boundaryNode._4eIsBlockBoundary(undefined, undefined)) && (siblingNode = groupObj.root[isStart ? \'prev\' : \'next\'](Walker.whitespaces(true), 1)) && !(boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && siblingNode._4eIsBlockBoundary({\n  br: 1}, undefined))');
function visit27_189_1(result) {
  _$jscoverage['/cmd.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['175'][1].init(39, 32, 'listArray[i].indent >= oldIndent');
function visit26_175_1(result) {
  _$jscoverage['/cmd.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['174'][1].init(199, 72, 'listArray[i] && listArray[i].indent >= oldIndent');
function visit25_174_1(result) {
  _$jscoverage['/cmd.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['170'][1].init(135, 58, 'listArray[i].indent > Math.max(listArray[i - 1].indent, 0)');
function visit24_170_1(result) {
  _$jscoverage['/cmd.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['167'][1].init(1379, 20, 'i < listArray.length');
function visit23_167_1(result) {
  _$jscoverage['/cmd.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['158'][1].init(834, 28, 'i < selectedListItems.length');
function visit22_158_1(result) {
  _$jscoverage['/cmd.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['150'][1].init(136, 49, '!itemNode || itemNode.data(\'list_item_processed\')');
function visit21_150_1(result) {
  _$jscoverage['/cmd.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['147'][1].init(363, 28, 'i < groupObj.contents.length');
function visit20_147_1(result) {
  _$jscoverage['/cmd.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['133'][1].init(3015, 15, 'insertAnchor[0]');
function visit19_133_1(result) {
  _$jscoverage['/cmd.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['130'][1].init(746, 9, '!UA[\'ie\']');
function visit18_130_1(result) {
  _$jscoverage['/cmd.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['120'][1].init(229, 44, 'headerTagRegex.test(contentBlock.nodeName())');
function visit17_120_1(result) {
  _$jscoverage['/cmd.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['105'][1].init(1765, 23, 'listContents.length < 1');
function visit16_105_1(result) {
  _$jscoverage['/cmd.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['97'][1].init(25, 33, 'parentNode[0] === commonParent[0]');
function visit15_97_1(result) {
  _$jscoverage['/cmd.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['93'][1].init(1329, 19, 'i < contents.length');
function visit14_93_1(result) {
  _$jscoverage['/cmd.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['86'][1].init(968, 19, 'i < contents.length');
function visit13_86_1(result) {
  _$jscoverage['/cmd.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['77'][2].init(84, 49, 'contents[0][0].nodeType != Dom.NodeType.TEXT_NODE');
function visit12_77_2(result) {
  _$jscoverage['/cmd.js'].branchData['77'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['77'][1].init(84, 129, 'contents[0][0].nodeType != Dom.NodeType.TEXT_NODE && contents[0]._4eMoveChildren(divBlock, undefined, undefined)');
function visit11_77_1(result) {
  _$jscoverage['/cmd.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['75'][1].init(39, 35, 'contents[0][0] === groupObj.root[0]');
function visit10_75_1(result) {
  _$jscoverage['/cmd.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['74'][2].init(401, 20, 'contents.length == 1');
function visit9_74_2(result) {
  _$jscoverage['/cmd.js'].branchData['74'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['74'][1].init(401, 75, 'contents.length == 1 && contents[0][0] === groupObj.root[0]');
function visit8_74_1(result) {
  _$jscoverage['/cmd.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['59'][1].init(21, 29, 'child.nodeName() == this.type');
function visit7_59_1(result) {
  _$jscoverage['/cmd.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['57'][2].init(1503, 10, 'i < length');
function visit6_57_2(result) {
  _$jscoverage['/cmd.js'].branchData['57'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['57'][1].init(1503, 82, 'i < length && (child = new Node(newList.listNode.childNodes[i]))');
function visit5_57_1(result) {
  _$jscoverage['/cmd.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['51'][1].init(1143, 28, 'i < selectedListItems.length');
function visit4_51_1(result) {
  _$jscoverage['/cmd.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['42'][2].init(137, 25, '!itemNode || !itemNode[0]');
function visit3_42_2(result) {
  _$jscoverage['/cmd.js'].branchData['42'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['42'][1].init(137, 86, '(!itemNode || !itemNode[0]) || itemNode.data(\'list_item_processed\')');
function visit2_42_1(result) {
  _$jscoverage['/cmd.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['39'][1].init(515, 28, 'i < groupObj.contents.length');
function visit1_39_1(result) {
  _$jscoverage['/cmd.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/cmd.js'].functionData[0]++;
  _$jscoverage['/cmd.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/cmd.js'].lineData[8]++;
  var ListUtils = require('../list-utils');
  _$jscoverage['/cmd.js'].lineData[10]++;
  var insertUnorderedList = "insertUnorderedList", insertOrderedList = "insertOrderedList", listNodeNames = {
  "ol": insertOrderedList, 
  "ul": insertUnorderedList}, KER = Editor.RangeType, ElementPath = Editor.ElementPath, Walker = Editor.Walker, UA = S.UA, Node = S.Node, Dom = S.DOM, headerTagRegex = /^h[1-6]$/;
  _$jscoverage['/cmd.js'].lineData[21]++;
  function ListCommand(type) {
    _$jscoverage['/cmd.js'].functionData[1]++;
    _$jscoverage['/cmd.js'].lineData[22]++;
    this.type = type;
  }
  _$jscoverage['/cmd.js'].lineData[25]++;
  ListCommand.prototype = {
  constructor: ListCommand, 
  changeListType: function(editor, groupObj, database, listsCreated, listStyleType) {
  _$jscoverage['/cmd.js'].functionData[2]++;
  _$jscoverage['/cmd.js'].lineData[35]++;
  var listArray = ListUtils.listToArray(groupObj.root, database, undefined, undefined, undefined), selectedListItems = [];
  _$jscoverage['/cmd.js'].lineData[39]++;
  for (var i = 0; visit1_39_1(i < groupObj.contents.length); i++) {
    _$jscoverage['/cmd.js'].lineData[40]++;
    var itemNode = groupObj.contents[i];
    _$jscoverage['/cmd.js'].lineData[41]++;
    itemNode = itemNode.closest('li', undefined);
    _$jscoverage['/cmd.js'].lineData[42]++;
    if (visit2_42_1((visit3_42_2(!itemNode || !itemNode[0])) || itemNode.data('list_item_processed'))) {
      _$jscoverage['/cmd.js'].lineData[44]++;
      continue;
    }
    _$jscoverage['/cmd.js'].lineData[45]++;
    selectedListItems.push(itemNode);
    _$jscoverage['/cmd.js'].lineData[46]++;
    itemNode._4eSetMarker(database, 'list_item_processed', true, undefined);
  }
  _$jscoverage['/cmd.js'].lineData[49]++;
  var fakeParent = new Node(groupObj.root[0].ownerDocument.createElement(this.type));
  _$jscoverage['/cmd.js'].lineData[50]++;
  fakeParent.css('list-style-type', listStyleType);
  _$jscoverage['/cmd.js'].lineData[51]++;
  for (i = 0; visit4_51_1(i < selectedListItems.length); i++) {
    _$jscoverage['/cmd.js'].lineData[52]++;
    var listIndex = selectedListItems[i].data('listarray_index');
    _$jscoverage['/cmd.js'].lineData[53]++;
    listArray[listIndex].parent = fakeParent;
  }
  _$jscoverage['/cmd.js'].lineData[55]++;
  var newList = ListUtils.arrayToList(listArray, database, null, "p");
  _$jscoverage['/cmd.js'].lineData[56]++;
  var child, length = newList.listNode.childNodes.length;
  _$jscoverage['/cmd.js'].lineData[57]++;
  for (i = 0; visit5_57_1(visit6_57_2(i < length) && (child = new Node(newList.listNode.childNodes[i]))); i++) {
    _$jscoverage['/cmd.js'].lineData[59]++;
    if (visit7_59_1(child.nodeName() == this.type)) {
      _$jscoverage['/cmd.js'].lineData[60]++;
      listsCreated.push(child);
    }
  }
  _$jscoverage['/cmd.js'].lineData[62]++;
  groupObj.root.before(newList.listNode);
  _$jscoverage['/cmd.js'].lineData[63]++;
  groupObj.root.remove();
}, 
  createList: function(editor, groupObj, listsCreated, listStyleType) {
  _$jscoverage['/cmd.js'].functionData[3]++;
  _$jscoverage['/cmd.js'].lineData[67]++;
  var contents = groupObj.contents, doc = groupObj.root[0].ownerDocument, listContents = [];
  _$jscoverage['/cmd.js'].lineData[74]++;
  if (visit8_74_1(visit9_74_2(contents.length == 1) && visit10_75_1(contents[0][0] === groupObj.root[0]))) {
    _$jscoverage['/cmd.js'].lineData[76]++;
    var divBlock = new Node(doc.createElement('div'));
    _$jscoverage['/cmd.js'].lineData[77]++;
    visit11_77_1(visit12_77_2(contents[0][0].nodeType != Dom.NodeType.TEXT_NODE) && contents[0]._4eMoveChildren(divBlock, undefined, undefined));
    _$jscoverage['/cmd.js'].lineData[79]++;
    contents[0][0].appendChild(divBlock[0]);
    _$jscoverage['/cmd.js'].lineData[80]++;
    contents[0] = divBlock;
  }
  _$jscoverage['/cmd.js'].lineData[84]++;
  var commonParent = groupObj.contents[0].parent();
  _$jscoverage['/cmd.js'].lineData[86]++;
  for (var i = 0; visit13_86_1(i < contents.length); i++) {
    _$jscoverage['/cmd.js'].lineData[87]++;
    commonParent = commonParent._4eCommonAncestor(contents[i].parent(), undefined);
  }
  _$jscoverage['/cmd.js'].lineData[93]++;
  for (i = 0; visit14_93_1(i < contents.length); i++) {
    _$jscoverage['/cmd.js'].lineData[94]++;
    var contentNode = contents[i], parentNode;
    _$jscoverage['/cmd.js'].lineData[96]++;
    while ((parentNode = contentNode.parent())) {
      _$jscoverage['/cmd.js'].lineData[97]++;
      if (visit15_97_1(parentNode[0] === commonParent[0])) {
        _$jscoverage['/cmd.js'].lineData[98]++;
        listContents.push(contentNode);
        _$jscoverage['/cmd.js'].lineData[99]++;
        break;
      }
      _$jscoverage['/cmd.js'].lineData[101]++;
      contentNode = parentNode;
    }
  }
  _$jscoverage['/cmd.js'].lineData[105]++;
  if (visit16_105_1(listContents.length < 1)) {
    _$jscoverage['/cmd.js'].lineData[106]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[109]++;
  var insertAnchor = new Node(listContents[listContents.length - 1][0].nextSibling), listNode = new Node(doc.createElement(this.type));
  _$jscoverage['/cmd.js'].lineData[112]++;
  listNode.css('list-style-type', listStyleType);
  _$jscoverage['/cmd.js'].lineData[114]++;
  listsCreated.push(listNode);
  _$jscoverage['/cmd.js'].lineData[115]++;
  while (listContents.length) {
    _$jscoverage['/cmd.js'].lineData[116]++;
    var contentBlock = listContents.shift(), listItem = new Node(doc.createElement('li'));
    _$jscoverage['/cmd.js'].lineData[120]++;
    if (visit17_120_1(headerTagRegex.test(contentBlock.nodeName()))) {
      _$jscoverage['/cmd.js'].lineData[121]++;
      listItem[0].appendChild(contentBlock[0]);
    } else {
      _$jscoverage['/cmd.js'].lineData[123]++;
      contentBlock._4eCopyAttributes(listItem, undefined, undefined);
      _$jscoverage['/cmd.js'].lineData[124]++;
      contentBlock._4eMoveChildren(listItem, undefined, undefined);
      _$jscoverage['/cmd.js'].lineData[125]++;
      contentBlock.remove();
    }
    _$jscoverage['/cmd.js'].lineData[127]++;
    listNode[0].appendChild(listItem[0]);
    _$jscoverage['/cmd.js'].lineData[130]++;
    if (visit18_130_1(!UA.ie)) {
      _$jscoverage['/cmd.js'].lineData[131]++;
      listItem._4eAppendBogus(undefined);
    }
  }
  _$jscoverage['/cmd.js'].lineData[133]++;
  if (visit19_133_1(insertAnchor[0])) {
    _$jscoverage['/cmd.js'].lineData[134]++;
    listNode.insertBefore(insertAnchor, undefined);
  } else {
    _$jscoverage['/cmd.js'].lineData[136]++;
    commonParent.append(listNode);
  }
}, 
  removeList: function(editor, groupObj, database) {
  _$jscoverage['/cmd.js'].functionData[4]++;
  _$jscoverage['/cmd.js'].lineData[143]++;
  var listArray = ListUtils.listToArray(groupObj.root, database, undefined, undefined, undefined), selectedListItems = [];
  _$jscoverage['/cmd.js'].lineData[147]++;
  for (var i = 0; visit20_147_1(i < groupObj.contents.length); i++) {
    _$jscoverage['/cmd.js'].lineData[148]++;
    var itemNode = groupObj.contents[i];
    _$jscoverage['/cmd.js'].lineData[149]++;
    itemNode = itemNode.closest('li', undefined);
    _$jscoverage['/cmd.js'].lineData[150]++;
    if (visit21_150_1(!itemNode || itemNode.data('list_item_processed'))) {
      _$jscoverage['/cmd.js'].lineData[151]++;
      continue;
    }
    _$jscoverage['/cmd.js'].lineData[152]++;
    selectedListItems.push(itemNode);
    _$jscoverage['/cmd.js'].lineData[153]++;
    itemNode._4eSetMarker(database, 'list_item_processed', true, undefined);
  }
  _$jscoverage['/cmd.js'].lineData[156]++;
  var lastListIndex = null;
  _$jscoverage['/cmd.js'].lineData[158]++;
  for (i = 0; visit22_158_1(i < selectedListItems.length); i++) {
    _$jscoverage['/cmd.js'].lineData[159]++;
    var listIndex = selectedListItems[i].data('listarray_index');
    _$jscoverage['/cmd.js'].lineData[160]++;
    listArray[listIndex].indent = -1;
    _$jscoverage['/cmd.js'].lineData[161]++;
    lastListIndex = listIndex;
  }
  _$jscoverage['/cmd.js'].lineData[167]++;
  for (i = lastListIndex + 1; visit23_167_1(i < listArray.length); i++) {
    _$jscoverage['/cmd.js'].lineData[170]++;
    if (visit24_170_1(listArray[i].indent > Math.max(listArray[i - 1].indent, 0))) {
      _$jscoverage['/cmd.js'].lineData[171]++;
      var indentOffset = listArray[i - 1].indent + 1 - listArray[i].indent;
      _$jscoverage['/cmd.js'].lineData[173]++;
      var oldIndent = listArray[i].indent;
      _$jscoverage['/cmd.js'].lineData[174]++;
      while (visit25_174_1(listArray[i] && visit26_175_1(listArray[i].indent >= oldIndent))) {
        _$jscoverage['/cmd.js'].lineData[176]++;
        listArray[i].indent += indentOffset;
        _$jscoverage['/cmd.js'].lineData[177]++;
        i++;
      }
      _$jscoverage['/cmd.js'].lineData[179]++;
      i--;
    }
  }
  _$jscoverage['/cmd.js'].lineData[183]++;
  var newList = ListUtils.arrayToList(listArray, database, null, "p");
  _$jscoverage['/cmd.js'].lineData[186]++;
  var docFragment = newList.listNode, boundaryNode, siblingNode;
  _$jscoverage['/cmd.js'].lineData[188]++;
  function compensateBrs(isStart) {
    _$jscoverage['/cmd.js'].functionData[5]++;
    _$jscoverage['/cmd.js'].lineData[189]++;
    if (visit27_189_1((boundaryNode = new Node(docFragment[isStart ? 'firstChild' : 'lastChild'])) && visit28_190_1(!(visit29_190_2(visit30_190_3(boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && boundaryNode._4eIsBlockBoundary(undefined, undefined))) && visit31_192_1((siblingNode = groupObj.root[isStart ? 'prev' : 'next'](Walker.whitespaces(true), 1)) && !(visit32_194_1(visit33_194_2(boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && siblingNode._4eIsBlockBoundary({
  br: 1}, undefined))))))) {
      _$jscoverage['/cmd.js'].lineData[196]++;
      boundaryNode[isStart ? 'before' : 'after'](editor.get('document')[0].createElement('br'));
    }
  }
  _$jscoverage['/cmd.js'].lineData[200]++;
  compensateBrs(true);
  _$jscoverage['/cmd.js'].lineData[201]++;
  compensateBrs(undefined);
  _$jscoverage['/cmd.js'].lineData[202]++;
  groupObj.root.before(docFragment);
  _$jscoverage['/cmd.js'].lineData[203]++;
  groupObj.root.remove();
}, 
  exec: function(editor, listStyleType) {
  _$jscoverage['/cmd.js'].functionData[6]++;
  _$jscoverage['/cmd.js'].lineData[207]++;
  var selection = editor.getSelection(), ranges = visit34_208_1(selection && selection.getRanges());
  _$jscoverage['/cmd.js'].lineData[211]++;
  if (visit35_211_1(!ranges || visit36_211_2(ranges.length < 1))) {
    _$jscoverage['/cmd.js'].lineData[212]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[215]++;
  var startElement = selection.getStartElement(), currentPath = new Editor.ElementPath(startElement);
  _$jscoverage['/cmd.js'].lineData[218]++;
  var state = queryActive(this.type, currentPath);
  _$jscoverage['/cmd.js'].lineData[220]++;
  var bookmarks = selection.createBookmarks(true);
  _$jscoverage['/cmd.js'].lineData[224]++;
  var listGroups = [], database = {};
  _$jscoverage['/cmd.js'].lineData[226]++;
  while (visit37_226_1(ranges.length > 0)) {
    _$jscoverage['/cmd.js'].lineData[227]++;
    var range = ranges.shift();
    _$jscoverage['/cmd.js'].lineData[229]++;
    var boundaryNodes = range.getBoundaryNodes(), startNode = boundaryNodes.startNode, endNode = boundaryNodes.endNode;
    _$jscoverage['/cmd.js'].lineData[233]++;
    if (visit38_233_1(visit39_233_2(startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && visit40_233_3(startNode.nodeName() == 'td'))) {
      _$jscoverage['/cmd.js'].lineData[234]++;
      range.setStartAt(boundaryNodes.startNode, KER.POSITION_AFTER_START);
    }
    _$jscoverage['/cmd.js'].lineData[236]++;
    if (visit41_236_1(visit42_236_2(endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && visit43_236_3(endNode.nodeName() == 'td'))) {
      _$jscoverage['/cmd.js'].lineData[237]++;
      range.setEndAt(boundaryNodes.endNode, KER.POSITION_BEFORE_END);
    }
    _$jscoverage['/cmd.js'].lineData[239]++;
    var iterator = range.createIterator(), block;
    _$jscoverage['/cmd.js'].lineData[242]++;
    iterator.forceBrBreak = false;
    _$jscoverage['/cmd.js'].lineData[244]++;
    while ((block = iterator.getNextParagraph())) {
      _$jscoverage['/cmd.js'].lineData[247]++;
      if (visit44_247_1(block.data('list_block'))) {
        _$jscoverage['/cmd.js'].lineData[248]++;
        continue;
      } else {
        _$jscoverage['/cmd.js'].lineData[250]++;
        block._4eSetMarker(database, 'list_block', 1, undefined);
      }
      _$jscoverage['/cmd.js'].lineData[253]++;
      var path = new ElementPath(block), pathElements = path.elements, pathElementsCount = pathElements.length, listNode = null, processedFlag = false, blockLimit = path.blockLimit, element;
      _$jscoverage['/cmd.js'].lineData[264]++;
      for (var i = pathElementsCount - 1; visit45_264_1(visit46_264_2(i >= 0) && (element = pathElements[i])); i--) {
        _$jscoverage['/cmd.js'].lineData[266]++;
        if (visit47_266_1(listNodeNames[element.nodeName()] && blockLimit.contains(element))) {
          _$jscoverage['/cmd.js'].lineData[274]++;
          blockLimit.removeData('list_group_object');
          _$jscoverage['/cmd.js'].lineData[276]++;
          var groupObj = element.data('list_group_object');
          _$jscoverage['/cmd.js'].lineData[277]++;
          if (visit48_277_1(groupObj)) {
            _$jscoverage['/cmd.js'].lineData[278]++;
            groupObj.contents.push(block);
          } else {
            _$jscoverage['/cmd.js'].lineData[280]++;
            groupObj = {
  root: element, 
  contents: [block]};
            _$jscoverage['/cmd.js'].lineData[281]++;
            listGroups.push(groupObj);
            _$jscoverage['/cmd.js'].lineData[282]++;
            element._4eSetMarker(database, 'list_group_object', groupObj, undefined);
          }
          _$jscoverage['/cmd.js'].lineData[284]++;
          processedFlag = true;
          _$jscoverage['/cmd.js'].lineData[285]++;
          break;
        }
      }
      _$jscoverage['/cmd.js'].lineData[289]++;
      if (visit49_289_1(processedFlag)) {
        _$jscoverage['/cmd.js'].lineData[290]++;
        continue;
      }
      _$jscoverage['/cmd.js'].lineData[294]++;
      var root = visit50_294_1(blockLimit || path.block);
      _$jscoverage['/cmd.js'].lineData[295]++;
      if (visit51_295_1(root.data('list_group_object'))) {
        _$jscoverage['/cmd.js'].lineData[296]++;
        root.data('list_group_object').contents.push(block);
      } else {
        _$jscoverage['/cmd.js'].lineData[298]++;
        groupObj = {
  root: root, 
  contents: [block]};
        _$jscoverage['/cmd.js'].lineData[299]++;
        root._4eSetMarker(database, 'list_group_object', groupObj, undefined);
        _$jscoverage['/cmd.js'].lineData[300]++;
        listGroups.push(groupObj);
      }
    }
  }
  _$jscoverage['/cmd.js'].lineData[308]++;
  var listsCreated = [];
  _$jscoverage['/cmd.js'].lineData[309]++;
  while (visit52_309_1(listGroups.length > 0)) {
    _$jscoverage['/cmd.js'].lineData[310]++;
    groupObj = listGroups.shift();
    _$jscoverage['/cmd.js'].lineData[311]++;
    if (visit53_311_1(!state)) {
      _$jscoverage['/cmd.js'].lineData[312]++;
      if (visit54_312_1(listNodeNames[groupObj.root.nodeName()])) {
        _$jscoverage['/cmd.js'].lineData[313]++;
        this.changeListType(editor, groupObj, database, listsCreated, listStyleType);
      } else {
        _$jscoverage['/cmd.js'].lineData[318]++;
        Editor.Utils.clearAllMarkers(database);
        _$jscoverage['/cmd.js'].lineData[319]++;
        this.createList(editor, groupObj, listsCreated, listStyleType);
      }
    } else {
      _$jscoverage['/cmd.js'].lineData[321]++;
      if (visit55_321_1(listNodeNames[groupObj.root.nodeName()])) {
        _$jscoverage['/cmd.js'].lineData[322]++;
        if (visit56_322_1(groupObj.root.css('list-style-type') == listStyleType)) {
          _$jscoverage['/cmd.js'].lineData[323]++;
          this.removeList(editor, groupObj, database);
        } else {
          _$jscoverage['/cmd.js'].lineData[325]++;
          groupObj.root.css('list-style-type', listStyleType);
        }
      }
    }
  }
  _$jscoverage['/cmd.js'].lineData[330]++;
  var self = this;
  _$jscoverage['/cmd.js'].lineData[333]++;
  for (i = 0; visit57_333_1(i < listsCreated.length); i++) {
    _$jscoverage['/cmd.js'].lineData[334]++;
    listNode = listsCreated[i];
    _$jscoverage['/cmd.js'].lineData[338]++;
    function mergeSibling(rtl, listNode) {
      _$jscoverage['/cmd.js'].functionData[7]++;
      _$jscoverage['/cmd.js'].lineData[339]++;
      var sibling = listNode[rtl ? 'prev' : 'next'](Walker.whitespaces(true), 1);
      _$jscoverage['/cmd.js'].lineData[341]++;
      if (visit58_341_1(sibling && visit59_342_1(sibling[0] && visit60_343_1(visit61_343_2(sibling.nodeName() == self.type) && visit62_345_1(sibling.css('list-style-type') == listStyleType))))) {
        _$jscoverage['/cmd.js'].lineData[346]++;
        sibling.remove();
        _$jscoverage['/cmd.js'].lineData[348]++;
        sibling._4eMoveChildren(listNode, rtl ? true : false, undefined);
      }
    }    _$jscoverage['/cmd.js'].lineData[352]++;
    mergeSibling(undefined, listNode);
    _$jscoverage['/cmd.js'].lineData[353]++;
    mergeSibling(true, listNode);
  }
  _$jscoverage['/cmd.js'].lineData[357]++;
  Editor.Utils.clearAllMarkers(database);
  _$jscoverage['/cmd.js'].lineData[358]++;
  selection.selectBookmarks(bookmarks);
}};
  _$jscoverage['/cmd.js'].lineData[362]++;
  function queryActive(type, elementPath) {
    _$jscoverage['/cmd.js'].functionData[8]++;
    _$jscoverage['/cmd.js'].lineData[363]++;
    var element, name, i, blockLimit = elementPath.blockLimit, elements = elementPath.elements;
    _$jscoverage['/cmd.js'].lineData[368]++;
    if (visit63_368_1(!blockLimit)) {
      _$jscoverage['/cmd.js'].lineData[369]++;
      return false;
    }
    _$jscoverage['/cmd.js'].lineData[372]++;
    if (visit64_372_1(elements)) {
      _$jscoverage['/cmd.js'].lineData[373]++;
      for (i = 0; visit65_373_1(visit66_373_2(i < elements.length) && visit67_374_1((element = elements[i]) && visit68_375_1(element[0] !== blockLimit[0]))); i++) {
        _$jscoverage['/cmd.js'].lineData[377]++;
        if (visit69_377_1(listNodeNames[name = element.nodeName()])) {
          _$jscoverage['/cmd.js'].lineData[378]++;
          if (visit70_378_1(name == type)) {
            _$jscoverage['/cmd.js'].lineData[379]++;
            return element.css('list-style-type');
          }
        }
      }
    }
    _$jscoverage['/cmd.js'].lineData[384]++;
    return false;
  }
  _$jscoverage['/cmd.js'].lineData[387]++;
  return {
  ListCommand: ListCommand, 
  queryActive: queryActive};
});
