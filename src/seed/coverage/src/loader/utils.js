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
if (! _$jscoverage['/loader/utils.js']) {
  _$jscoverage['/loader/utils.js'] = {};
  _$jscoverage['/loader/utils.js'].lineData = [];
  _$jscoverage['/loader/utils.js'].lineData[6] = 0;
  _$jscoverage['/loader/utils.js'].lineData[7] = 0;
  _$jscoverage['/loader/utils.js'].lineData[30] = 0;
  _$jscoverage['/loader/utils.js'].lineData[31] = 0;
  _$jscoverage['/loader/utils.js'].lineData[32] = 0;
  _$jscoverage['/loader/utils.js'].lineData[34] = 0;
  _$jscoverage['/loader/utils.js'].lineData[37] = 0;
  _$jscoverage['/loader/utils.js'].lineData[38] = 0;
  _$jscoverage['/loader/utils.js'].lineData[40] = 0;
  _$jscoverage['/loader/utils.js'].lineData[44] = 0;
  _$jscoverage['/loader/utils.js'].lineData[46] = 0;
  _$jscoverage['/loader/utils.js'].lineData[47] = 0;
  _$jscoverage['/loader/utils.js'].lineData[49] = 0;
  _$jscoverage['/loader/utils.js'].lineData[52] = 0;
  _$jscoverage['/loader/utils.js'].lineData[53] = 0;
  _$jscoverage['/loader/utils.js'].lineData[54] = 0;
  _$jscoverage['/loader/utils.js'].lineData[55] = 0;
  _$jscoverage['/loader/utils.js'].lineData[56] = 0;
  _$jscoverage['/loader/utils.js'].lineData[57] = 0;
  _$jscoverage['/loader/utils.js'].lineData[60] = 0;
  _$jscoverage['/loader/utils.js'].lineData[62] = 0;
  _$jscoverage['/loader/utils.js'].lineData[67] = 0;
  _$jscoverage['/loader/utils.js'].lineData[70] = 0;
  _$jscoverage['/loader/utils.js'].lineData[76] = 0;
  _$jscoverage['/loader/utils.js'].lineData[86] = 0;
  _$jscoverage['/loader/utils.js'].lineData[88] = 0;
  _$jscoverage['/loader/utils.js'].lineData[89] = 0;
  _$jscoverage['/loader/utils.js'].lineData[92] = 0;
  _$jscoverage['/loader/utils.js'].lineData[93] = 0;
  _$jscoverage['/loader/utils.js'].lineData[95] = 0;
  _$jscoverage['/loader/utils.js'].lineData[98] = 0;
  _$jscoverage['/loader/utils.js'].lineData[101] = 0;
  _$jscoverage['/loader/utils.js'].lineData[102] = 0;
  _$jscoverage['/loader/utils.js'].lineData[104] = 0;
  _$jscoverage['/loader/utils.js'].lineData[113] = 0;
  _$jscoverage['/loader/utils.js'].lineData[114] = 0;
  _$jscoverage['/loader/utils.js'].lineData[126] = 0;
  _$jscoverage['/loader/utils.js'].lineData[128] = 0;
  _$jscoverage['/loader/utils.js'].lineData[131] = 0;
  _$jscoverage['/loader/utils.js'].lineData[132] = 0;
  _$jscoverage['/loader/utils.js'].lineData[136] = 0;
  _$jscoverage['/loader/utils.js'].lineData[141] = 0;
  _$jscoverage['/loader/utils.js'].lineData[151] = 0;
  _$jscoverage['/loader/utils.js'].lineData[157] = 0;
  _$jscoverage['/loader/utils.js'].lineData[158] = 0;
  _$jscoverage['/loader/utils.js'].lineData[159] = 0;
  _$jscoverage['/loader/utils.js'].lineData[160] = 0;
  _$jscoverage['/loader/utils.js'].lineData[161] = 0;
  _$jscoverage['/loader/utils.js'].lineData[162] = 0;
  _$jscoverage['/loader/utils.js'].lineData[164] = 0;
  _$jscoverage['/loader/utils.js'].lineData[166] = 0;
  _$jscoverage['/loader/utils.js'].lineData[167] = 0;
  _$jscoverage['/loader/utils.js'].lineData[169] = 0;
  _$jscoverage['/loader/utils.js'].lineData[172] = 0;
  _$jscoverage['/loader/utils.js'].lineData[176] = 0;
  _$jscoverage['/loader/utils.js'].lineData[185] = 0;
  _$jscoverage['/loader/utils.js'].lineData[187] = 0;
  _$jscoverage['/loader/utils.js'].lineData[188] = 0;
  _$jscoverage['/loader/utils.js'].lineData[194] = 0;
  _$jscoverage['/loader/utils.js'].lineData[196] = 0;
  _$jscoverage['/loader/utils.js'].lineData[197] = 0;
  _$jscoverage['/loader/utils.js'].lineData[201] = 0;
  _$jscoverage['/loader/utils.js'].lineData[202] = 0;
  _$jscoverage['/loader/utils.js'].lineData[203] = 0;
  _$jscoverage['/loader/utils.js'].lineData[205] = 0;
  _$jscoverage['/loader/utils.js'].lineData[209] = 0;
  _$jscoverage['/loader/utils.js'].lineData[212] = 0;
  _$jscoverage['/loader/utils.js'].lineData[213] = 0;
  _$jscoverage['/loader/utils.js'].lineData[215] = 0;
  _$jscoverage['/loader/utils.js'].lineData[216] = 0;
  _$jscoverage['/loader/utils.js'].lineData[217] = 0;
  _$jscoverage['/loader/utils.js'].lineData[219] = 0;
  _$jscoverage['/loader/utils.js'].lineData[220] = 0;
  _$jscoverage['/loader/utils.js'].lineData[221] = 0;
  _$jscoverage['/loader/utils.js'].lineData[222] = 0;
  _$jscoverage['/loader/utils.js'].lineData[223] = 0;
  _$jscoverage['/loader/utils.js'].lineData[225] = 0;
  _$jscoverage['/loader/utils.js'].lineData[226] = 0;
  _$jscoverage['/loader/utils.js'].lineData[227] = 0;
  _$jscoverage['/loader/utils.js'].lineData[229] = 0;
  _$jscoverage['/loader/utils.js'].lineData[230] = 0;
  _$jscoverage['/loader/utils.js'].lineData[231] = 0;
  _$jscoverage['/loader/utils.js'].lineData[233] = 0;
  _$jscoverage['/loader/utils.js'].lineData[234] = 0;
  _$jscoverage['/loader/utils.js'].lineData[235] = 0;
  _$jscoverage['/loader/utils.js'].lineData[236] = 0;
  _$jscoverage['/loader/utils.js'].lineData[237] = 0;
  _$jscoverage['/loader/utils.js'].lineData[239] = 0;
  _$jscoverage['/loader/utils.js'].lineData[242] = 0;
  _$jscoverage['/loader/utils.js'].lineData[244] = 0;
  _$jscoverage['/loader/utils.js'].lineData[245] = 0;
  _$jscoverage['/loader/utils.js'].lineData[246] = 0;
  _$jscoverage['/loader/utils.js'].lineData[249] = 0;
  _$jscoverage['/loader/utils.js'].lineData[250] = 0;
  _$jscoverage['/loader/utils.js'].lineData[259] = 0;
  _$jscoverage['/loader/utils.js'].lineData[262] = 0;
  _$jscoverage['/loader/utils.js'].lineData[264] = 0;
  _$jscoverage['/loader/utils.js'].lineData[265] = 0;
  _$jscoverage['/loader/utils.js'].lineData[267] = 0;
  _$jscoverage['/loader/utils.js'].lineData[268] = 0;
  _$jscoverage['/loader/utils.js'].lineData[270] = 0;
  _$jscoverage['/loader/utils.js'].lineData[272] = 0;
  _$jscoverage['/loader/utils.js'].lineData[273] = 0;
  _$jscoverage['/loader/utils.js'].lineData[283] = 0;
  _$jscoverage['/loader/utils.js'].lineData[286] = 0;
  _$jscoverage['/loader/utils.js'].lineData[289] = 0;
  _$jscoverage['/loader/utils.js'].lineData[290] = 0;
  _$jscoverage['/loader/utils.js'].lineData[291] = 0;
  _$jscoverage['/loader/utils.js'].lineData[296] = 0;
  _$jscoverage['/loader/utils.js'].lineData[299] = 0;
  _$jscoverage['/loader/utils.js'].lineData[301] = 0;
  _$jscoverage['/loader/utils.js'].lineData[305] = 0;
  _$jscoverage['/loader/utils.js'].lineData[308] = 0;
  _$jscoverage['/loader/utils.js'].lineData[317] = 0;
  _$jscoverage['/loader/utils.js'].lineData[318] = 0;
  _$jscoverage['/loader/utils.js'].lineData[320] = 0;
  _$jscoverage['/loader/utils.js'].lineData[335] = 0;
  _$jscoverage['/loader/utils.js'].lineData[346] = 0;
  _$jscoverage['/loader/utils.js'].lineData[353] = 0;
  _$jscoverage['/loader/utils.js'].lineData[354] = 0;
  _$jscoverage['/loader/utils.js'].lineData[355] = 0;
  _$jscoverage['/loader/utils.js'].lineData[356] = 0;
  _$jscoverage['/loader/utils.js'].lineData[357] = 0;
  _$jscoverage['/loader/utils.js'].lineData[358] = 0;
  _$jscoverage['/loader/utils.js'].lineData[359] = 0;
  _$jscoverage['/loader/utils.js'].lineData[360] = 0;
  _$jscoverage['/loader/utils.js'].lineData[362] = 0;
  _$jscoverage['/loader/utils.js'].lineData[363] = 0;
  _$jscoverage['/loader/utils.js'].lineData[364] = 0;
  _$jscoverage['/loader/utils.js'].lineData[367] = 0;
  _$jscoverage['/loader/utils.js'].lineData[371] = 0;
  _$jscoverage['/loader/utils.js'].lineData[382] = 0;
  _$jscoverage['/loader/utils.js'].lineData[383] = 0;
  _$jscoverage['/loader/utils.js'].lineData[385] = 0;
  _$jscoverage['/loader/utils.js'].lineData[388] = 0;
  _$jscoverage['/loader/utils.js'].lineData[389] = 0;
  _$jscoverage['/loader/utils.js'].lineData[394] = 0;
  _$jscoverage['/loader/utils.js'].lineData[395] = 0;
  _$jscoverage['/loader/utils.js'].lineData[397] = 0;
  _$jscoverage['/loader/utils.js'].lineData[408] = 0;
  _$jscoverage['/loader/utils.js'].lineData[410] = 0;
  _$jscoverage['/loader/utils.js'].lineData[413] = 0;
  _$jscoverage['/loader/utils.js'].lineData[414] = 0;
  _$jscoverage['/loader/utils.js'].lineData[415] = 0;
  _$jscoverage['/loader/utils.js'].lineData[419] = 0;
  _$jscoverage['/loader/utils.js'].lineData[421] = 0;
  _$jscoverage['/loader/utils.js'].lineData[425] = 0;
  _$jscoverage['/loader/utils.js'].lineData[431] = 0;
  _$jscoverage['/loader/utils.js'].lineData[440] = 0;
  _$jscoverage['/loader/utils.js'].lineData[442] = 0;
  _$jscoverage['/loader/utils.js'].lineData[443] = 0;
  _$jscoverage['/loader/utils.js'].lineData[446] = 0;
  _$jscoverage['/loader/utils.js'].lineData[450] = 0;
  _$jscoverage['/loader/utils.js'].lineData[456] = 0;
  _$jscoverage['/loader/utils.js'].lineData[457] = 0;
  _$jscoverage['/loader/utils.js'].lineData[459] = 0;
  _$jscoverage['/loader/utils.js'].lineData[463] = 0;
  _$jscoverage['/loader/utils.js'].lineData[466] = 0;
  _$jscoverage['/loader/utils.js'].lineData[467] = 0;
  _$jscoverage['/loader/utils.js'].lineData[469] = 0;
  _$jscoverage['/loader/utils.js'].lineData[470] = 0;
  _$jscoverage['/loader/utils.js'].lineData[472] = 0;
}
if (! _$jscoverage['/loader/utils.js'].functionData) {
  _$jscoverage['/loader/utils.js'].functionData = [];
  _$jscoverage['/loader/utils.js'].functionData[0] = 0;
  _$jscoverage['/loader/utils.js'].functionData[1] = 0;
  _$jscoverage['/loader/utils.js'].functionData[2] = 0;
  _$jscoverage['/loader/utils.js'].functionData[3] = 0;
  _$jscoverage['/loader/utils.js'].functionData[4] = 0;
  _$jscoverage['/loader/utils.js'].functionData[5] = 0;
  _$jscoverage['/loader/utils.js'].functionData[6] = 0;
  _$jscoverage['/loader/utils.js'].functionData[7] = 0;
  _$jscoverage['/loader/utils.js'].functionData[8] = 0;
  _$jscoverage['/loader/utils.js'].functionData[9] = 0;
  _$jscoverage['/loader/utils.js'].functionData[10] = 0;
  _$jscoverage['/loader/utils.js'].functionData[11] = 0;
  _$jscoverage['/loader/utils.js'].functionData[12] = 0;
  _$jscoverage['/loader/utils.js'].functionData[13] = 0;
  _$jscoverage['/loader/utils.js'].functionData[14] = 0;
  _$jscoverage['/loader/utils.js'].functionData[15] = 0;
  _$jscoverage['/loader/utils.js'].functionData[16] = 0;
  _$jscoverage['/loader/utils.js'].functionData[17] = 0;
  _$jscoverage['/loader/utils.js'].functionData[18] = 0;
  _$jscoverage['/loader/utils.js'].functionData[19] = 0;
  _$jscoverage['/loader/utils.js'].functionData[20] = 0;
  _$jscoverage['/loader/utils.js'].functionData[21] = 0;
  _$jscoverage['/loader/utils.js'].functionData[22] = 0;
  _$jscoverage['/loader/utils.js'].functionData[23] = 0;
  _$jscoverage['/loader/utils.js'].functionData[24] = 0;
  _$jscoverage['/loader/utils.js'].functionData[25] = 0;
  _$jscoverage['/loader/utils.js'].functionData[26] = 0;
}
if (! _$jscoverage['/loader/utils.js'].branchData) {
  _$jscoverage['/loader/utils.js'].branchData = {};
  _$jscoverage['/loader/utils.js'].branchData['31'] = [];
  _$jscoverage['/loader/utils.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['37'] = [];
  _$jscoverage['/loader/utils.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['46'] = [];
  _$jscoverage['/loader/utils.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['54'] = [];
  _$jscoverage['/loader/utils.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['60'] = [];
  _$jscoverage['/loader/utils.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['76'] = [];
  _$jscoverage['/loader/utils.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['88'] = [];
  _$jscoverage['/loader/utils.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['92'] = [];
  _$jscoverage['/loader/utils.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['93'] = [];
  _$jscoverage['/loader/utils.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['101'] = [];
  _$jscoverage['/loader/utils.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['131'] = [];
  _$jscoverage['/loader/utils.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['159'] = [];
  _$jscoverage['/loader/utils.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['159'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['164'] = [];
  _$jscoverage['/loader/utils.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['164'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['164'][3] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['166'] = [];
  _$jscoverage['/loader/utils.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['187'] = [];
  _$jscoverage['/loader/utils.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['194'] = [];
  _$jscoverage['/loader/utils.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['196'] = [];
  _$jscoverage['/loader/utils.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['201'] = [];
  _$jscoverage['/loader/utils.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['202'] = [];
  _$jscoverage['/loader/utils.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['212'] = [];
  _$jscoverage['/loader/utils.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['215'] = [];
  _$jscoverage['/loader/utils.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['220'] = [];
  _$jscoverage['/loader/utils.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['225'] = [];
  _$jscoverage['/loader/utils.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['229'] = [];
  _$jscoverage['/loader/utils.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['233'] = [];
  _$jscoverage['/loader/utils.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['234'] = [];
  _$jscoverage['/loader/utils.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['242'] = [];
  _$jscoverage['/loader/utils.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['264'] = [];
  _$jscoverage['/loader/utils.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['268'] = [];
  _$jscoverage['/loader/utils.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['286'] = [];
  _$jscoverage['/loader/utils.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['290'] = [];
  _$jscoverage['/loader/utils.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['299'] = [];
  _$jscoverage['/loader/utils.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['317'] = [];
  _$jscoverage['/loader/utils.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['355'] = [];
  _$jscoverage['/loader/utils.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['356'] = [];
  _$jscoverage['/loader/utils.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['359'] = [];
  _$jscoverage['/loader/utils.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['362'] = [];
  _$jscoverage['/loader/utils.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['363'] = [];
  _$jscoverage['/loader/utils.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['383'] = [];
  _$jscoverage['/loader/utils.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['385'] = [];
  _$jscoverage['/loader/utils.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['388'] = [];
  _$jscoverage['/loader/utils.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['394'] = [];
  _$jscoverage['/loader/utils.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['413'] = [];
  _$jscoverage['/loader/utils.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['413'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['442'] = [];
  _$jscoverage['/loader/utils.js'].branchData['442'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['469'] = [];
  _$jscoverage['/loader/utils.js'].branchData['469'][1] = new BranchData();
}
_$jscoverage['/loader/utils.js'].branchData['469'][1].init(56, 46, '!(m = str.match(/^\\s*["\']([^\'"\\s]+)["\']\\s*$/))');
function visit505_469_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['442'][1].init(85, 8, '--i > -1');
function visit504_442_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['442'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['413'][2].init(151, 28, 'module.factory !== undefined');
function visit503_413_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['413'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['413'][1].init(141, 38, 'module && module.factory !== undefined');
function visit502_413_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['394'][1].init(522, 10, 'refModName');
function visit501_394_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['388'][1].init(143, 11, 'modNames[i]');
function visit500_388_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['385'][1].init(84, 5, 'i < l');
function visit499_385_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['383'][1].init(51, 8, 'modNames');
function visit498_383_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['363'][1].init(34, 9, '!alias[j]');
function visit497_363_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['362'][1].init(259, 6, 'j >= 0');
function visit496_362_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['359'][1].init(105, 25, 'typeof alias === \'string\'');
function visit495_359_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['356'][1].init(27, 35, '(m = mods[ret[i]]) && (\'alias\' in m)');
function visit494_356_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['355'][1].init(68, 6, 'i >= 0');
function visit493_355_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['317'][1].init(18, 28, 'typeof modNames === \'string\'');
function visit492_317_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['299'][1].init(698, 21, 'exports !== undefined');
function visit491_299_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['290'][1].init(153, 41, 'module.requires && module.requires.length');
function visit490_290_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['286'][1].init(89, 29, 'typeof factory === \'function\'');
function visit489_286_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['268'][1].init(316, 5, 'm.cjs');
function visit488_268_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['264'][1].init(201, 19, 'status >= ATTACHING');
function visit487_264_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['242'][1].init(1088, 108, 'Utils.checkModsLoadRecursively(m.getNormalizedRequires(), runtime, stack, errorList, cache)');
function visit486_242_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['234'][1].init(22, 25, 'S.inArray(modName, stack)');
function visit485_234_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['233'][1].init(771, 9, '\'@DEBUG@\'');
function visit484_233_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['229'][1].init(646, 17, 'status !== LOADED');
function visit483_229_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['225'][1].init(515, 25, 'status >= READY_TO_ATTACH');
function visit482_225_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['220'][1].init(355, 16, 'status === ERROR');
function visit481_220_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['215'][1].init(213, 2, '!m');
function visit480_215_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['212'][1].init(121, 16, 'modName in cache');
function visit479_212_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['202'][1].init(22, 81, 's && Utils.checkModLoadRecursively(modNames[i], runtime, stack, errorList, cache)');
function visit478_202_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['201'][1].init(340, 5, 'i < l');
function visit477_201_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['196'][1].init(176, 11, 'cache || {}');
function visit476_196_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['194'][1].init(77, 11, 'stack || []');
function visit475_194_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['187'][1].init(84, 5, 'i < l');
function visit474_187_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['166'][1].init(367, 5, 'allOk');
function visit473_166_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['164'][3].init(159, 21, 'm.status >= ATTACHING');
function visit472_164_3(result) {
  _$jscoverage['/loader/utils.js'].branchData['164'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['164'][2].init(154, 26, 'm && m.status >= ATTACHING');
function visit471_164_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['164'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['164'][1].init(149, 31, 'a && m && m.status >= ATTACHING');
function visit470_164_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['159'][2].init(81, 26, 'module.getType() !== \'css\'');
function visit469_159_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['159'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['159'][1].init(70, 37, '!module || module.getType() !== \'css\'');
function visit468_159_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['131'][1].init(150, 6, 'module');
function visit467_131_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['101'][1].init(477, 5, 'i < l');
function visit466_101_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['93'][1].init(22, 55, 'startsWith(depName, \'../\') || startsWith(depName, \'./\')');
function visit465_93_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['92'][1].init(126, 27, 'typeof depName === \'string\'');
function visit464_92_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['88'][1].init(47, 8, '!depName');
function visit463_88_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['76'][1].init(21, 58, 'doc.getElementsByTagName(\'head\')[0] || doc.documentElement');
function visit462_76_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['60'][1].init(26, 12, 'Plugin.alias');
function visit461_60_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['54'][1].init(54, 12, 'index !== -1');
function visit460_54_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['46'][1].init(40, 30, 's.charAt(s.length - 1) === \'/\'');
function visit459_46_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['37'][1].init(103, 5, 'i < l');
function visit458_37_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['31'][1].init(14, 21, 'typeof s === \'string\'');
function visit457_31_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/utils.js'].functionData[0]++;
  _$jscoverage['/loader/utils.js'].lineData[7]++;
  var Loader = S.Loader, Path = S.Path, host = S.Env.host, TRUE = !0, FALSE = !1, startsWith = S.startsWith, data = Loader.Status, ATTACHED = data.ATTACHED, READY_TO_ATTACH = data.READY_TO_ATTACH, LOADED = data.LOADED, ATTACHING = data.ATTACHING, ERROR = data.ERROR, Utils = Loader.Utils = {}, doc = host.document;
  _$jscoverage['/loader/utils.js'].lineData[30]++;
  function indexMap(s) {
    _$jscoverage['/loader/utils.js'].functionData[1]++;
    _$jscoverage['/loader/utils.js'].lineData[31]++;
    if (visit457_31_1(typeof s === 'string')) {
      _$jscoverage['/loader/utils.js'].lineData[32]++;
      return indexMapStr(s);
    } else {
      _$jscoverage['/loader/utils.js'].lineData[34]++;
      var ret = [], i = 0, l = s.length;
      _$jscoverage['/loader/utils.js'].lineData[37]++;
      for (; visit458_37_1(i < l); i++) {
        _$jscoverage['/loader/utils.js'].lineData[38]++;
        ret[i] = indexMapStr(s[i]);
      }
      _$jscoverage['/loader/utils.js'].lineData[40]++;
      return ret;
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[44]++;
  function indexMapStr(s) {
    _$jscoverage['/loader/utils.js'].functionData[2]++;
    _$jscoverage['/loader/utils.js'].lineData[46]++;
    if (visit459_46_1(s.charAt(s.length - 1) === '/')) {
      _$jscoverage['/loader/utils.js'].lineData[47]++;
      s += 'index';
    }
    _$jscoverage['/loader/utils.js'].lineData[49]++;
    return s;
  }
  _$jscoverage['/loader/utils.js'].lineData[52]++;
  function pluginAlias(runtime, name) {
    _$jscoverage['/loader/utils.js'].functionData[3]++;
    _$jscoverage['/loader/utils.js'].lineData[53]++;
    var index = name.indexOf('!');
    _$jscoverage['/loader/utils.js'].lineData[54]++;
    if (visit460_54_1(index !== -1)) {
      _$jscoverage['/loader/utils.js'].lineData[55]++;
      var pluginName = name.substring(0, index);
      _$jscoverage['/loader/utils.js'].lineData[56]++;
      name = name.substring(index + 1);
      _$jscoverage['/loader/utils.js'].lineData[57]++;
      S.use(pluginName, {
  sync: true, 
  success: function(S, Plugin) {
  _$jscoverage['/loader/utils.js'].functionData[4]++;
  _$jscoverage['/loader/utils.js'].lineData[60]++;
  if (visit461_60_1(Plugin.alias)) {
    _$jscoverage['/loader/utils.js'].lineData[62]++;
    name = Plugin.alias(runtime, name, pluginName);
  }
}});
    }
    _$jscoverage['/loader/utils.js'].lineData[67]++;
    return name;
  }
  _$jscoverage['/loader/utils.js'].lineData[70]++;
  S.mix(Utils, {
  docHead: function() {
  _$jscoverage['/loader/utils.js'].functionData[5]++;
  _$jscoverage['/loader/utils.js'].lineData[76]++;
  return visit462_76_1(doc.getElementsByTagName('head')[0] || doc.documentElement);
}, 
  normalDepModuleName: function(moduleName, depName) {
  _$jscoverage['/loader/utils.js'].functionData[6]++;
  _$jscoverage['/loader/utils.js'].lineData[86]++;
  var i = 0, l;
  _$jscoverage['/loader/utils.js'].lineData[88]++;
  if (visit463_88_1(!depName)) {
    _$jscoverage['/loader/utils.js'].lineData[89]++;
    return depName;
  }
  _$jscoverage['/loader/utils.js'].lineData[92]++;
  if (visit464_92_1(typeof depName === 'string')) {
    _$jscoverage['/loader/utils.js'].lineData[93]++;
    if (visit465_93_1(startsWith(depName, '../') || startsWith(depName, './'))) {
      _$jscoverage['/loader/utils.js'].lineData[95]++;
      return Path.resolve(Path.dirname(moduleName), depName);
    }
    _$jscoverage['/loader/utils.js'].lineData[98]++;
    return Path.normalize(depName);
  }
  _$jscoverage['/loader/utils.js'].lineData[101]++;
  for (l = depName.length; visit466_101_1(i < l); i++) {
    _$jscoverage['/loader/utils.js'].lineData[102]++;
    depName[i] = Utils.normalDepModuleName(moduleName, depName[i]);
  }
  _$jscoverage['/loader/utils.js'].lineData[104]++;
  return depName;
}, 
  createModulesInfo: function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[7]++;
  _$jscoverage['/loader/utils.js'].lineData[113]++;
  S.each(modNames, function(m) {
  _$jscoverage['/loader/utils.js'].functionData[8]++;
  _$jscoverage['/loader/utils.js'].lineData[114]++;
  Utils.createModuleInfo(runtime, m);
});
}, 
  createModuleInfo: function(runtime, modName, cfg) {
  _$jscoverage['/loader/utils.js'].functionData[9]++;
  _$jscoverage['/loader/utils.js'].lineData[126]++;
  modName = indexMapStr(modName);
  _$jscoverage['/loader/utils.js'].lineData[128]++;
  var mods = runtime.Env.mods, module = mods[modName];
  _$jscoverage['/loader/utils.js'].lineData[131]++;
  if (visit467_131_1(module)) {
    _$jscoverage['/loader/utils.js'].lineData[132]++;
    return module;
  }
  _$jscoverage['/loader/utils.js'].lineData[136]++;
  mods[modName] = module = new Loader.Module(S.mix({
  name: modName, 
  runtime: runtime}, cfg));
  _$jscoverage['/loader/utils.js'].lineData[141]++;
  return module;
}, 
  getModules: function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[10]++;
  _$jscoverage['/loader/utils.js'].lineData[151]++;
  var mods = [runtime], module, unalias, allOk, m, runtimeMods = runtime.Env.mods;
  _$jscoverage['/loader/utils.js'].lineData[157]++;
  S.each(modNames, function(modName) {
  _$jscoverage['/loader/utils.js'].functionData[11]++;
  _$jscoverage['/loader/utils.js'].lineData[158]++;
  module = runtimeMods[modName];
  _$jscoverage['/loader/utils.js'].lineData[159]++;
  if (visit468_159_1(!module || visit469_159_2(module.getType() !== 'css'))) {
    _$jscoverage['/loader/utils.js'].lineData[160]++;
    unalias = Utils.unalias(runtime, modName);
    _$jscoverage['/loader/utils.js'].lineData[161]++;
    allOk = S.reduce(unalias, function(a, n) {
  _$jscoverage['/loader/utils.js'].functionData[12]++;
  _$jscoverage['/loader/utils.js'].lineData[162]++;
  m = runtimeMods[n];
  _$jscoverage['/loader/utils.js'].lineData[164]++;
  return visit470_164_1(a && visit471_164_2(m && visit472_164_3(m.status >= ATTACHING)));
}, true);
    _$jscoverage['/loader/utils.js'].lineData[166]++;
    if (visit473_166_1(allOk)) {
      _$jscoverage['/loader/utils.js'].lineData[167]++;
      mods.push(runtimeMods[unalias[0]].exports);
    } else {
      _$jscoverage['/loader/utils.js'].lineData[169]++;
      mods.push(null);
    }
  } else {
    _$jscoverage['/loader/utils.js'].lineData[172]++;
    mods.push(undefined);
  }
});
  _$jscoverage['/loader/utils.js'].lineData[176]++;
  return mods;
}, 
  attachModsRecursively: function(modNames, runtime) {
  _$jscoverage['/loader/utils.js'].functionData[13]++;
  _$jscoverage['/loader/utils.js'].lineData[185]++;
  var i, l = modNames.length;
  _$jscoverage['/loader/utils.js'].lineData[187]++;
  for (i = 0; visit474_187_1(i < l); i++) {
    _$jscoverage['/loader/utils.js'].lineData[188]++;
    Utils.attachModRecursively(modNames[i], runtime);
  }
}, 
  checkModsLoadRecursively: function(modNames, runtime, stack, errorList, cache) {
  _$jscoverage['/loader/utils.js'].functionData[14]++;
  _$jscoverage['/loader/utils.js'].lineData[194]++;
  stack = visit475_194_1(stack || []);
  _$jscoverage['/loader/utils.js'].lineData[196]++;
  cache = visit476_196_1(cache || {});
  _$jscoverage['/loader/utils.js'].lineData[197]++;
  var i, s = 1, l = modNames.length, stackDepth = stack.length;
  _$jscoverage['/loader/utils.js'].lineData[201]++;
  for (i = 0; visit477_201_1(i < l); i++) {
    _$jscoverage['/loader/utils.js'].lineData[202]++;
    s = visit478_202_1(s && Utils.checkModLoadRecursively(modNames[i], runtime, stack, errorList, cache));
    _$jscoverage['/loader/utils.js'].lineData[203]++;
    stack.length = stackDepth;
  }
  _$jscoverage['/loader/utils.js'].lineData[205]++;
  return !!s;
}, 
  checkModLoadRecursively: function(modName, runtime, stack, errorList, cache) {
  _$jscoverage['/loader/utils.js'].functionData[15]++;
  _$jscoverage['/loader/utils.js'].lineData[209]++;
  var mods = runtime.Env.mods, status, m = mods[modName];
  _$jscoverage['/loader/utils.js'].lineData[212]++;
  if (visit479_212_1(modName in cache)) {
    _$jscoverage['/loader/utils.js'].lineData[213]++;
    return cache[modName];
  }
  _$jscoverage['/loader/utils.js'].lineData[215]++;
  if (visit480_215_1(!m)) {
    _$jscoverage['/loader/utils.js'].lineData[216]++;
    cache[modName] = FALSE;
    _$jscoverage['/loader/utils.js'].lineData[217]++;
    return FALSE;
  }
  _$jscoverage['/loader/utils.js'].lineData[219]++;
  status = m.status;
  _$jscoverage['/loader/utils.js'].lineData[220]++;
  if (visit481_220_1(status === ERROR)) {
    _$jscoverage['/loader/utils.js'].lineData[221]++;
    errorList.push(m);
    _$jscoverage['/loader/utils.js'].lineData[222]++;
    cache[modName] = FALSE;
    _$jscoverage['/loader/utils.js'].lineData[223]++;
    return FALSE;
  }
  _$jscoverage['/loader/utils.js'].lineData[225]++;
  if (visit482_225_1(status >= READY_TO_ATTACH)) {
    _$jscoverage['/loader/utils.js'].lineData[226]++;
    cache[modName] = TRUE;
    _$jscoverage['/loader/utils.js'].lineData[227]++;
    return TRUE;
  }
  _$jscoverage['/loader/utils.js'].lineData[229]++;
  if (visit483_229_1(status !== LOADED)) {
    _$jscoverage['/loader/utils.js'].lineData[230]++;
    cache[modName] = FALSE;
    _$jscoverage['/loader/utils.js'].lineData[231]++;
    return FALSE;
  }
  _$jscoverage['/loader/utils.js'].lineData[233]++;
  if (visit484_233_1('@DEBUG@')) {
    _$jscoverage['/loader/utils.js'].lineData[234]++;
    if (visit485_234_1(S.inArray(modName, stack))) {
      _$jscoverage['/loader/utils.js'].lineData[235]++;
      S.log('find cyclic dependency between mods: ' + stack, 'warn');
      _$jscoverage['/loader/utils.js'].lineData[236]++;
      cache[modName] = TRUE;
      _$jscoverage['/loader/utils.js'].lineData[237]++;
      return TRUE;
    }
    _$jscoverage['/loader/utils.js'].lineData[239]++;
    stack.push(modName);
  }
  _$jscoverage['/loader/utils.js'].lineData[242]++;
  if (visit486_242_1(Utils.checkModsLoadRecursively(m.getNormalizedRequires(), runtime, stack, errorList, cache))) {
    _$jscoverage['/loader/utils.js'].lineData[244]++;
    m.status = READY_TO_ATTACH;
    _$jscoverage['/loader/utils.js'].lineData[245]++;
    cache[modName] = TRUE;
    _$jscoverage['/loader/utils.js'].lineData[246]++;
    return TRUE;
  }
  _$jscoverage['/loader/utils.js'].lineData[249]++;
  cache[modName] = FALSE;
  _$jscoverage['/loader/utils.js'].lineData[250]++;
  return FALSE;
}, 
  attachModRecursively: function(modName, runtime) {
  _$jscoverage['/loader/utils.js'].functionData[16]++;
  _$jscoverage['/loader/utils.js'].lineData[259]++;
  var mods = runtime.Env.mods, status, m = mods[modName];
  _$jscoverage['/loader/utils.js'].lineData[262]++;
  status = m.status;
  _$jscoverage['/loader/utils.js'].lineData[264]++;
  if (visit487_264_1(status >= ATTACHING)) {
    _$jscoverage['/loader/utils.js'].lineData[265]++;
    return;
  }
  _$jscoverage['/loader/utils.js'].lineData[267]++;
  m.status = ATTACHING;
  _$jscoverage['/loader/utils.js'].lineData[268]++;
  if (visit488_268_1(m.cjs)) {
    _$jscoverage['/loader/utils.js'].lineData[270]++;
    Utils.attachMod(runtime, m);
  } else {
    _$jscoverage['/loader/utils.js'].lineData[272]++;
    Utils.attachModsRecursively(m.getNormalizedRequires(), runtime);
    _$jscoverage['/loader/utils.js'].lineData[273]++;
    Utils.attachMod(runtime, m);
  }
}, 
  attachMod: function(runtime, module) {
  _$jscoverage['/loader/utils.js'].functionData[17]++;
  _$jscoverage['/loader/utils.js'].lineData[283]++;
  var factory = module.factory, exports;
  _$jscoverage['/loader/utils.js'].lineData[286]++;
  if (visit489_286_1(typeof factory === 'function')) {
    _$jscoverage['/loader/utils.js'].lineData[289]++;
    var require;
    _$jscoverage['/loader/utils.js'].lineData[290]++;
    if (visit490_290_1(module.requires && module.requires.length)) {
      _$jscoverage['/loader/utils.js'].lineData[291]++;
      require = S.bind(module.require, module);
    }
    _$jscoverage['/loader/utils.js'].lineData[296]++;
    exports = factory.apply(module, (module.cjs ? [runtime, require, module.exports, module] : Utils.getModules(runtime, module.getRequiresWithAlias())));
    _$jscoverage['/loader/utils.js'].lineData[299]++;
    if (visit491_299_1(exports !== undefined)) {
      _$jscoverage['/loader/utils.js'].lineData[301]++;
      module.exports = exports;
    }
  } else {
    _$jscoverage['/loader/utils.js'].lineData[305]++;
    module.exports = factory;
  }
  _$jscoverage['/loader/utils.js'].lineData[308]++;
  module.status = ATTACHED;
}, 
  getModNamesAsArray: function(modNames) {
  _$jscoverage['/loader/utils.js'].functionData[18]++;
  _$jscoverage['/loader/utils.js'].lineData[317]++;
  if (visit492_317_1(typeof modNames === 'string')) {
    _$jscoverage['/loader/utils.js'].lineData[318]++;
    modNames = modNames.replace(/\s+/g, '').split(',');
  }
  _$jscoverage['/loader/utils.js'].lineData[320]++;
  return modNames;
}, 
  normalizeModNames: function(runtime, modNames, refModName) {
  _$jscoverage['/loader/utils.js'].functionData[19]++;
  _$jscoverage['/loader/utils.js'].lineData[335]++;
  return Utils.unalias(runtime, Utils.normalizeModNamesWithAlias(runtime, modNames, refModName));
}, 
  unalias: function(runtime, names) {
  _$jscoverage['/loader/utils.js'].functionData[20]++;
  _$jscoverage['/loader/utils.js'].lineData[346]++;
  var ret = [].concat(names), i, m, alias, ok = 0, j, mods = runtime.Env.mods;
  _$jscoverage['/loader/utils.js'].lineData[353]++;
  while (!ok) {
    _$jscoverage['/loader/utils.js'].lineData[354]++;
    ok = 1;
    _$jscoverage['/loader/utils.js'].lineData[355]++;
    for (i = ret.length - 1; visit493_355_1(i >= 0); i--) {
      _$jscoverage['/loader/utils.js'].lineData[356]++;
      if (visit494_356_1((m = mods[ret[i]]) && ('alias' in m))) {
        _$jscoverage['/loader/utils.js'].lineData[357]++;
        ok = 0;
        _$jscoverage['/loader/utils.js'].lineData[358]++;
        alias = m.alias;
        _$jscoverage['/loader/utils.js'].lineData[359]++;
        if (visit495_359_1(typeof alias === 'string')) {
          _$jscoverage['/loader/utils.js'].lineData[360]++;
          alias = [alias];
        }
        _$jscoverage['/loader/utils.js'].lineData[362]++;
        for (j = alias.length - 1; visit496_362_1(j >= 0); j--) {
          _$jscoverage['/loader/utils.js'].lineData[363]++;
          if (visit497_363_1(!alias[j])) {
            _$jscoverage['/loader/utils.js'].lineData[364]++;
            alias.splice(j, 1);
          }
        }
        _$jscoverage['/loader/utils.js'].lineData[367]++;
        ret.splice.apply(ret, [i, 1].concat(indexMap(alias)));
      }
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[371]++;
  return ret;
}, 
  normalizeModNamesWithAlias: function(runtime, modNames, refModName) {
  _$jscoverage['/loader/utils.js'].functionData[21]++;
  _$jscoverage['/loader/utils.js'].lineData[382]++;
  var ret = [], i, l;
  _$jscoverage['/loader/utils.js'].lineData[383]++;
  if (visit498_383_1(modNames)) {
    _$jscoverage['/loader/utils.js'].lineData[385]++;
    for (i = 0 , l = modNames.length; visit499_385_1(i < l); i++) {
      _$jscoverage['/loader/utils.js'].lineData[388]++;
      if (visit500_388_1(modNames[i])) {
        _$jscoverage['/loader/utils.js'].lineData[389]++;
        ret.push(pluginAlias(runtime, indexMap(modNames[i])));
      }
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[394]++;
  if (visit501_394_1(refModName)) {
    _$jscoverage['/loader/utils.js'].lineData[395]++;
    ret = Utils.normalDepModuleName(refModName, ret);
  }
  _$jscoverage['/loader/utils.js'].lineData[397]++;
  return ret;
}, 
  registerModule: function(runtime, name, factory, config) {
  _$jscoverage['/loader/utils.js'].functionData[22]++;
  _$jscoverage['/loader/utils.js'].lineData[408]++;
  name = indexMapStr(name);
  _$jscoverage['/loader/utils.js'].lineData[410]++;
  var mods = runtime.Env.mods, module = mods[name];
  _$jscoverage['/loader/utils.js'].lineData[413]++;
  if (visit502_413_1(module && visit503_413_2(module.factory !== undefined))) {
    _$jscoverage['/loader/utils.js'].lineData[414]++;
    S.log(name + ' is defined more than once', 'warn');
    _$jscoverage['/loader/utils.js'].lineData[415]++;
    return;
  }
  _$jscoverage['/loader/utils.js'].lineData[419]++;
  Utils.createModuleInfo(runtime, name);
  _$jscoverage['/loader/utils.js'].lineData[421]++;
  module = mods[name];
  _$jscoverage['/loader/utils.js'].lineData[425]++;
  S.mix(module, {
  name: name, 
  status: LOADED, 
  factory: factory});
  _$jscoverage['/loader/utils.js'].lineData[431]++;
  S.mix(module, config);
}, 
  getHash: function(str) {
  _$jscoverage['/loader/utils.js'].functionData[23]++;
  _$jscoverage['/loader/utils.js'].lineData[440]++;
  var hash = 5381, i;
  _$jscoverage['/loader/utils.js'].lineData[442]++;
  for (i = str.length; visit504_442_1(--i > -1); ) {
    _$jscoverage['/loader/utils.js'].lineData[443]++;
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  _$jscoverage['/loader/utils.js'].lineData[446]++;
  return hash + '';
}, 
  getRequiresFromFn: function(fn) {
  _$jscoverage['/loader/utils.js'].functionData[24]++;
  _$jscoverage['/loader/utils.js'].lineData[450]++;
  var requires = [];
  _$jscoverage['/loader/utils.js'].lineData[456]++;
  fn.toString().replace(commentRegExp, '').replace(requireRegExp, function(match, dep) {
  _$jscoverage['/loader/utils.js'].functionData[25]++;
  _$jscoverage['/loader/utils.js'].lineData[457]++;
  requires.push(getRequireVal(dep));
});
  _$jscoverage['/loader/utils.js'].lineData[459]++;
  return requires;
}});
  _$jscoverage['/loader/utils.js'].lineData[463]++;
  var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, requireRegExp = /[^.'"]\s*require\s*\(([^)]+)\)/g;
  _$jscoverage['/loader/utils.js'].lineData[466]++;
  function getRequireVal(str) {
    _$jscoverage['/loader/utils.js'].functionData[26]++;
    _$jscoverage['/loader/utils.js'].lineData[467]++;
    var m;
    _$jscoverage['/loader/utils.js'].lineData[469]++;
    if (visit505_469_1(!(m = str.match(/^\s*["']([^'"\s]+)["']\s*$/)))) {
      _$jscoverage['/loader/utils.js'].lineData[470]++;
      S.error('can not find required mod in require call: ' + str);
    }
    _$jscoverage['/loader/utils.js'].lineData[472]++;
    return m[1];
  }
})(KISSY);
