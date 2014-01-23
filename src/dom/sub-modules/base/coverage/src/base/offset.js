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
if (! _$jscoverage['/base/offset.js']) {
  _$jscoverage['/base/offset.js'] = {};
  _$jscoverage['/base/offset.js'].lineData = [];
  _$jscoverage['/base/offset.js'].lineData[6] = 0;
  _$jscoverage['/base/offset.js'].lineData[7] = 0;
  _$jscoverage['/base/offset.js'].lineData[8] = 0;
  _$jscoverage['/base/offset.js'].lineData[30] = 0;
  _$jscoverage['/base/offset.js'].lineData[53] = 0;
  _$jscoverage['/base/offset.js'].lineData[55] = 0;
  _$jscoverage['/base/offset.js'].lineData[56] = 0;
  _$jscoverage['/base/offset.js'].lineData[57] = 0;
  _$jscoverage['/base/offset.js'].lineData[58] = 0;
  _$jscoverage['/base/offset.js'].lineData[59] = 0;
  _$jscoverage['/base/offset.js'].lineData[61] = 0;
  _$jscoverage['/base/offset.js'].lineData[64] = 0;
  _$jscoverage['/base/offset.js'].lineData[65] = 0;
  _$jscoverage['/base/offset.js'].lineData[66] = 0;
  _$jscoverage['/base/offset.js'].lineData[67] = 0;
  _$jscoverage['/base/offset.js'].lineData[69] = 0;
  _$jscoverage['/base/offset.js'].lineData[87] = 0;
  _$jscoverage['/base/offset.js'].lineData[90] = 0;
  _$jscoverage['/base/offset.js'].lineData[91] = 0;
  _$jscoverage['/base/offset.js'].lineData[94] = 0;
  _$jscoverage['/base/offset.js'].lineData[95] = 0;
  _$jscoverage['/base/offset.js'].lineData[98] = 0;
  _$jscoverage['/base/offset.js'].lineData[99] = 0;
  _$jscoverage['/base/offset.js'].lineData[103] = 0;
  _$jscoverage['/base/offset.js'].lineData[104] = 0;
  _$jscoverage['/base/offset.js'].lineData[107] = 0;
  _$jscoverage['/base/offset.js'].lineData[108] = 0;
  _$jscoverage['/base/offset.js'].lineData[109] = 0;
  _$jscoverage['/base/offset.js'].lineData[110] = 0;
  _$jscoverage['/base/offset.js'].lineData[113] = 0;
  _$jscoverage['/base/offset.js'].lineData[115] = 0;
  _$jscoverage['/base/offset.js'].lineData[130] = 0;
  _$jscoverage['/base/offset.js'].lineData[131] = 0;
  _$jscoverage['/base/offset.js'].lineData[132] = 0;
  _$jscoverage['/base/offset.js'].lineData[133] = 0;
  _$jscoverage['/base/offset.js'].lineData[134] = 0;
  _$jscoverage['/base/offset.js'].lineData[139] = 0;
  _$jscoverage['/base/offset.js'].lineData[143] = 0;
  _$jscoverage['/base/offset.js'].lineData[147] = 0;
  _$jscoverage['/base/offset.js'].lineData[149] = 0;
  _$jscoverage['/base/offset.js'].lineData[150] = 0;
  _$jscoverage['/base/offset.js'].lineData[151] = 0;
  _$jscoverage['/base/offset.js'].lineData[152] = 0;
  _$jscoverage['/base/offset.js'].lineData[158] = 0;
  _$jscoverage['/base/offset.js'].lineData[164] = 0;
  _$jscoverage['/base/offset.js'].lineData[174] = 0;
  _$jscoverage['/base/offset.js'].lineData[175] = 0;
  _$jscoverage['/base/offset.js'].lineData[177] = 0;
  _$jscoverage['/base/offset.js'].lineData[178] = 0;
  _$jscoverage['/base/offset.js'].lineData[179] = 0;
  _$jscoverage['/base/offset.js'].lineData[180] = 0;
  _$jscoverage['/base/offset.js'].lineData[183] = 0;
  _$jscoverage['/base/offset.js'].lineData[184] = 0;
  _$jscoverage['/base/offset.js'].lineData[186] = 0;
  _$jscoverage['/base/offset.js'].lineData[191] = 0;
  _$jscoverage['/base/offset.js'].lineData[192] = 0;
  _$jscoverage['/base/offset.js'].lineData[193] = 0;
  _$jscoverage['/base/offset.js'].lineData[195] = 0;
  _$jscoverage['/base/offset.js'].lineData[199] = 0;
  _$jscoverage['/base/offset.js'].lineData[200] = 0;
  _$jscoverage['/base/offset.js'].lineData[201] = 0;
  _$jscoverage['/base/offset.js'].lineData[203] = 0;
  _$jscoverage['/base/offset.js'].lineData[204] = 0;
  _$jscoverage['/base/offset.js'].lineData[205] = 0;
  _$jscoverage['/base/offset.js'].lineData[206] = 0;
  _$jscoverage['/base/offset.js'].lineData[209] = 0;
  _$jscoverage['/base/offset.js'].lineData[210] = 0;
  _$jscoverage['/base/offset.js'].lineData[212] = 0;
  _$jscoverage['/base/offset.js'].lineData[217] = 0;
  _$jscoverage['/base/offset.js'].lineData[218] = 0;
  _$jscoverage['/base/offset.js'].lineData[219] = 0;
  _$jscoverage['/base/offset.js'].lineData[221] = 0;
  _$jscoverage['/base/offset.js'].lineData[274] = 0;
  _$jscoverage['/base/offset.js'].lineData[275] = 0;
  _$jscoverage['/base/offset.js'].lineData[277] = 0;
  _$jscoverage['/base/offset.js'].lineData[278] = 0;
  _$jscoverage['/base/offset.js'].lineData[280] = 0;
  _$jscoverage['/base/offset.js'].lineData[282] = 0;
  _$jscoverage['/base/offset.js'].lineData[283] = 0;
  _$jscoverage['/base/offset.js'].lineData[288] = 0;
  _$jscoverage['/base/offset.js'].lineData[289] = 0;
  _$jscoverage['/base/offset.js'].lineData[290] = 0;
  _$jscoverage['/base/offset.js'].lineData[292] = 0;
  _$jscoverage['/base/offset.js'].lineData[295] = 0;
  _$jscoverage['/base/offset.js'].lineData[296] = 0;
  _$jscoverage['/base/offset.js'].lineData[297] = 0;
  _$jscoverage['/base/offset.js'].lineData[299] = 0;
  _$jscoverage['/base/offset.js'].lineData[300] = 0;
  _$jscoverage['/base/offset.js'].lineData[301] = 0;
  _$jscoverage['/base/offset.js'].lineData[306] = 0;
  _$jscoverage['/base/offset.js'].lineData[307] = 0;
  _$jscoverage['/base/offset.js'].lineData[308] = 0;
  _$jscoverage['/base/offset.js'].lineData[310] = 0;
  _$jscoverage['/base/offset.js'].lineData[311] = 0;
  _$jscoverage['/base/offset.js'].lineData[313] = 0;
  _$jscoverage['/base/offset.js'].lineData[318] = 0;
  _$jscoverage['/base/offset.js'].lineData[323] = 0;
  _$jscoverage['/base/offset.js'].lineData[324] = 0;
  _$jscoverage['/base/offset.js'].lineData[325] = 0;
  _$jscoverage['/base/offset.js'].lineData[326] = 0;
  _$jscoverage['/base/offset.js'].lineData[327] = 0;
  _$jscoverage['/base/offset.js'].lineData[336] = 0;
  _$jscoverage['/base/offset.js'].lineData[337] = 0;
  _$jscoverage['/base/offset.js'].lineData[338] = 0;
  _$jscoverage['/base/offset.js'].lineData[339] = 0;
  _$jscoverage['/base/offset.js'].lineData[341] = 0;
  _$jscoverage['/base/offset.js'].lineData[342] = 0;
  _$jscoverage['/base/offset.js'].lineData[345] = 0;
  _$jscoverage['/base/offset.js'].lineData[352] = 0;
  _$jscoverage['/base/offset.js'].lineData[357] = 0;
  _$jscoverage['/base/offset.js'].lineData[358] = 0;
  _$jscoverage['/base/offset.js'].lineData[362] = 0;
  _$jscoverage['/base/offset.js'].lineData[363] = 0;
  _$jscoverage['/base/offset.js'].lineData[370] = 0;
  _$jscoverage['/base/offset.js'].lineData[376] = 0;
  _$jscoverage['/base/offset.js'].lineData[377] = 0;
  _$jscoverage['/base/offset.js'].lineData[399] = 0;
  _$jscoverage['/base/offset.js'].lineData[400] = 0;
  _$jscoverage['/base/offset.js'].lineData[402] = 0;
  _$jscoverage['/base/offset.js'].lineData[405] = 0;
  _$jscoverage['/base/offset.js'].lineData[406] = 0;
  _$jscoverage['/base/offset.js'].lineData[408] = 0;
  _$jscoverage['/base/offset.js'].lineData[409] = 0;
  _$jscoverage['/base/offset.js'].lineData[410] = 0;
  _$jscoverage['/base/offset.js'].lineData[414] = 0;
  _$jscoverage['/base/offset.js'].lineData[415] = 0;
  _$jscoverage['/base/offset.js'].lineData[422] = 0;
  _$jscoverage['/base/offset.js'].lineData[424] = 0;
  _$jscoverage['/base/offset.js'].lineData[431] = 0;
  _$jscoverage['/base/offset.js'].lineData[434] = 0;
  _$jscoverage['/base/offset.js'].lineData[435] = 0;
  _$jscoverage['/base/offset.js'].lineData[441] = 0;
  _$jscoverage['/base/offset.js'].lineData[445] = 0;
  _$jscoverage['/base/offset.js'].lineData[447] = 0;
  _$jscoverage['/base/offset.js'].lineData[448] = 0;
  _$jscoverage['/base/offset.js'].lineData[451] = 0;
  _$jscoverage['/base/offset.js'].lineData[455] = 0;
  _$jscoverage['/base/offset.js'].lineData[456] = 0;
  _$jscoverage['/base/offset.js'].lineData[457] = 0;
  _$jscoverage['/base/offset.js'].lineData[459] = 0;
  _$jscoverage['/base/offset.js'].lineData[462] = 0;
}
if (! _$jscoverage['/base/offset.js'].functionData) {
  _$jscoverage['/base/offset.js'].functionData = [];
  _$jscoverage['/base/offset.js'].functionData[0] = 0;
  _$jscoverage['/base/offset.js'].functionData[1] = 0;
  _$jscoverage['/base/offset.js'].functionData[2] = 0;
  _$jscoverage['/base/offset.js'].functionData[3] = 0;
  _$jscoverage['/base/offset.js'].functionData[4] = 0;
  _$jscoverage['/base/offset.js'].functionData[5] = 0;
  _$jscoverage['/base/offset.js'].functionData[6] = 0;
  _$jscoverage['/base/offset.js'].functionData[7] = 0;
  _$jscoverage['/base/offset.js'].functionData[8] = 0;
  _$jscoverage['/base/offset.js'].functionData[9] = 0;
  _$jscoverage['/base/offset.js'].functionData[10] = 0;
  _$jscoverage['/base/offset.js'].functionData[11] = 0;
}
if (! _$jscoverage['/base/offset.js'].branchData) {
  _$jscoverage['/base/offset.js'].branchData = {};
  _$jscoverage['/base/offset.js'].branchData['12'] = [];
  _$jscoverage['/base/offset.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['55'] = [];
  _$jscoverage['/base/offset.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['58'] = [];
  _$jscoverage['/base/offset.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['65'] = [];
  _$jscoverage['/base/offset.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['90'] = [];
  _$jscoverage['/base/offset.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['94'] = [];
  _$jscoverage['/base/offset.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['98'] = [];
  _$jscoverage['/base/offset.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['103'] = [];
  _$jscoverage['/base/offset.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['107'] = [];
  _$jscoverage['/base/offset.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['113'] = [];
  _$jscoverage['/base/offset.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['130'] = [];
  _$jscoverage['/base/offset.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['160'] = [];
  _$jscoverage['/base/offset.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['162'] = [];
  _$jscoverage['/base/offset.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['167'] = [];
  _$jscoverage['/base/offset.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['170'] = [];
  _$jscoverage['/base/offset.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['174'] = [];
  _$jscoverage['/base/offset.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['175'] = [];
  _$jscoverage['/base/offset.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['175'][2] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['175'][3] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['177'] = [];
  _$jscoverage['/base/offset.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['179'] = [];
  _$jscoverage['/base/offset.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['183'] = [];
  _$jscoverage['/base/offset.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['191'] = [];
  _$jscoverage['/base/offset.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['192'] = [];
  _$jscoverage['/base/offset.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['199'] = [];
  _$jscoverage['/base/offset.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['200'] = [];
  _$jscoverage['/base/offset.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['201'] = [];
  _$jscoverage['/base/offset.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['201'][2] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['201'][3] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['203'] = [];
  _$jscoverage['/base/offset.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['205'] = [];
  _$jscoverage['/base/offset.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['209'] = [];
  _$jscoverage['/base/offset.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['217'] = [];
  _$jscoverage['/base/offset.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['218'] = [];
  _$jscoverage['/base/offset.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['278'] = [];
  _$jscoverage['/base/offset.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['288'] = [];
  _$jscoverage['/base/offset.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['288'][2] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['289'] = [];
  _$jscoverage['/base/offset.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['296'] = [];
  _$jscoverage['/base/offset.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['299'] = [];
  _$jscoverage['/base/offset.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['300'] = [];
  _$jscoverage['/base/offset.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['307'] = [];
  _$jscoverage['/base/offset.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['311'] = [];
  _$jscoverage['/base/offset.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['341'] = [];
  _$jscoverage['/base/offset.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['352'] = [];
  _$jscoverage['/base/offset.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['352'][2] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['352'][3] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['353'] = [];
  _$jscoverage['/base/offset.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['353'][2] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['362'] = [];
  _$jscoverage['/base/offset.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['399'] = [];
  _$jscoverage['/base/offset.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['399'][2] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['400'] = [];
  _$jscoverage['/base/offset.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['400'][2] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['422'] = [];
  _$jscoverage['/base/offset.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['431'] = [];
  _$jscoverage['/base/offset.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['436'] = [];
  _$jscoverage['/base/offset.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['437'] = [];
  _$jscoverage['/base/offset.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['437'][2] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['438'] = [];
  _$jscoverage['/base/offset.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['447'] = [];
  _$jscoverage['/base/offset.js'].branchData['447'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['456'] = [];
  _$jscoverage['/base/offset.js'].branchData['456'][1] = new BranchData();
}
_$jscoverage['/base/offset.js'].branchData['456'][1].init(23, 35, 'parseFloat(Dom.css(elem, key)) || 0');
function visit329_456_1(result) {
  _$jscoverage['/base/offset.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['447'][1].init(89, 36, 'Dom.css(elem, POSITION) === \'static\'');
function visit328_447_1(result) {
  _$jscoverage['/base/offset.js'].branchData['447'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['438'][1].init(41, 84, '(currentEl = currentWin.frameElement) && (currentWin = currentWin.parent)');
function visit327_438_1(result) {
  _$jscoverage['/base/offset.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['437'][2].init(938, 25, 'currentWin != relativeWin');
function visit326_437_2(result) {
  _$jscoverage['/base/offset.js'].branchData['437'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['437'][1].init(25, 126, 'currentWin != relativeWin && (currentEl = currentWin.frameElement) && (currentWin = currentWin.parent)');
function visit325_437_1(result) {
  _$jscoverage['/base/offset.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['436'][1].init(584, 152, 'currentWin && currentWin != relativeWin && (currentEl = currentWin.frameElement) && (currentWin = currentWin.parent)');
function visit324_436_1(result) {
  _$jscoverage['/base/offset.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['431'][1].init(365, 25, 'currentWin == relativeWin');
function visit323_431_1(result) {
  _$jscoverage['/base/offset.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['422'][1].init(289, 25, 'relativeWin || currentWin');
function visit322_422_1(result) {
  _$jscoverage['/base/offset.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['400'][2].init(1792, 19, 'body.clientTop || 0');
function visit321_400_2(result) {
  _$jscoverage['/base/offset.js'].branchData['400'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['400'][1].init(1771, 40, 'docElem.clientTop || body.clientTop || 0');
function visit320_400_1(result) {
  _$jscoverage['/base/offset.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['399'][2].init(1736, 20, 'body.clientLeft || 0');
function visit319_399_2(result) {
  _$jscoverage['/base/offset.js'].branchData['399'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['399'][1].init(1714, 42, 'docElem.clientLeft || body.clientLeft || 0');
function visit318_399_1(result) {
  _$jscoverage['/base/offset.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['362'][1].init(104, 27, '!elem.getBoundingClientRect');
function visit317_362_1(result) {
  _$jscoverage['/base/offset.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['353'][2].init(716, 20, 'body && body[prop]');
function visit316_353_2(result) {
  _$jscoverage['/base/offset.js'].branchData['353'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['353'][1].init(72, 43, 'body && body[prop] || documentElementProp');
function visit315_353_1(result) {
  _$jscoverage['/base/offset.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['352'][3].init(641, 30, 'doc[compatMode] === CSS1Compat');
function visit314_352_3(result) {
  _$jscoverage['/base/offset.js'].branchData['352'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['352'][2].init(641, 53, 'doc[compatMode] === CSS1Compat && documentElementProp');
function visit313_352_2(result) {
  _$jscoverage['/base/offset.js'].branchData['352'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['352'][1].init(641, 116, 'doc[compatMode] === CSS1Compat && documentElementProp || body && body[prop] || documentElementProp');
function visit312_352_1(result) {
  _$jscoverage['/base/offset.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['341'][1].init(202, 16, 'UA.mobile && ret');
function visit311_341_1(result) {
  _$jscoverage['/base/offset.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['311'][1].init(172, 23, 'typeof ret !== \'number\'');
function visit310_311_1(result) {
  _$jscoverage['/base/offset.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['307'][1].init(229, 23, 'typeof ret !== \'number\'');
function visit309_307_1(result) {
  _$jscoverage['/base/offset.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['300'][1].init(181, 14, 'name === \'Top\'');
function visit308_300_1(result) {
  _$jscoverage['/base/offset.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['299'][1].init(114, 15, 'name === \'Left\'');
function visit307_299_1(result) {
  _$jscoverage['/base/offset.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['296'][1].init(58, 15, 'v !== undefined');
function visit306_296_1(result) {
  _$jscoverage['/base/offset.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['289'][1].init(21, 15, 'v !== undefined');
function visit305_289_1(result) {
  _$jscoverage['/base/offset.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['288'][2].init(311, 39, 'elem.nodeType === NodeType.ELEMENT_NODE');
function visit304_288_2(result) {
  _$jscoverage['/base/offset.js'].branchData['288'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['288'][1].init(303, 47, 'elem && elem.nodeType === NodeType.ELEMENT_NODE');
function visit303_288_1(result) {
  _$jscoverage['/base/offset.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['278'][1].init(17, 24, 'typeof elem === \'number\'');
function visit302_278_1(result) {
  _$jscoverage['/base/offset.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['218'][1].init(120, 12, 'alignWithTop');
function visit301_218_1(result) {
  _$jscoverage['/base/offset.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['217'][1].init(40, 26, 'alignWithTop === undefined');
function visit300_217_1(result) {
  _$jscoverage['/base/offset.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['209'][1].init(77, 16, 'diffTop.left < 0');
function visit299_209_1(result) {
  _$jscoverage['/base/offset.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['205'][1].init(230, 22, 'alignWithTop === false');
function visit298_205_1(result) {
  _$jscoverage['/base/offset.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['203'][1].init(69, 21, 'alignWithTop === true');
function visit297_203_1(result) {
  _$jscoverage['/base/offset.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['201'][3].init(49, 19, 'diffBottom.left > 0');
function visit296_201_3(result) {
  _$jscoverage['/base/offset.js'].branchData['201'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['201'][2].init(29, 16, 'diffTop.left < 0');
function visit295_201_2(result) {
  _$jscoverage['/base/offset.js'].branchData['201'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['201'][1].init(29, 39, 'diffTop.left < 0 || diffBottom.left > 0');
function visit294_201_1(result) {
  _$jscoverage['/base/offset.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['200'][1].init(25, 18, 'onlyScrollIfNeeded');
function visit293_200_1(result) {
  _$jscoverage['/base/offset.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['199'][1].init(4813, 21, 'allowHorizontalScroll');
function visit292_199_1(result) {
  _$jscoverage['/base/offset.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['192'][1].init(112, 12, 'alignWithTop');
function visit291_192_1(result) {
  _$jscoverage['/base/offset.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['191'][1].init(36, 26, 'alignWithTop === undefined');
function visit290_191_1(result) {
  _$jscoverage['/base/offset.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['183'][1].init(69, 15, 'diffTop.top < 0');
function visit289_183_1(result) {
  _$jscoverage['/base/offset.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['179'][1].init(211, 22, 'alignWithTop === false');
function visit288_179_1(result) {
  _$jscoverage['/base/offset.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['177'][1].init(61, 21, 'alignWithTop === true');
function visit287_177_1(result) {
  _$jscoverage['/base/offset.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['175'][3].init(44, 18, 'diffBottom.top > 0');
function visit286_175_3(result) {
  _$jscoverage['/base/offset.js'].branchData['175'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['175'][2].init(25, 15, 'diffTop.top < 0');
function visit285_175_2(result) {
  _$jscoverage['/base/offset.js'].branchData['175'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['175'][1].init(25, 37, 'diffTop.top < 0 || diffBottom.top > 0');
function visit284_175_1(result) {
  _$jscoverage['/base/offset.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['174'][1].init(3560, 18, 'onlyScrollIfNeeded');
function visit283_174_1(result) {
  _$jscoverage['/base/offset.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['170'][1].init(60, 56, 'parseFloat(Dom.css(container, \'borderBottomWidth\')) || 0');
function visit282_170_1(result) {
  _$jscoverage['/base/offset.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['167'][1].init(61, 55, 'parseFloat(Dom.css(container, \'borderRightWidth\')) || 0');
function visit281_167_1(result) {
  _$jscoverage['/base/offset.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['162'][1].init(51, 53, 'parseFloat(Dom.css(container, \'borderTopWidth\')) || 0');
function visit280_162_1(result) {
  _$jscoverage['/base/offset.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['160'][1].init(52, 54, 'parseFloat(Dom.css(container, \'borderLeftWidth\')) || 0');
function visit279_160_1(result) {
  _$jscoverage['/base/offset.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['130'][1].init(1459, 5, 'isWin');
function visit278_130_1(result) {
  _$jscoverage['/base/offset.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['113'][1].init(885, 35, 'allowHorizontalScroll === undefined');
function visit277_113_1(result) {
  _$jscoverage['/base/offset.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['107'][1].init(577, 29, 'S.isPlainObject(alignWithTop)');
function visit276_107_1(result) {
  _$jscoverage['/base/offset.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['103'][1].init(435, 45, 'container.nodeType === NodeType.DOCUMENT_NODE');
function visit275_103_1(result) {
  _$jscoverage['/base/offset.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['98'][1].init(290, 10, '!container');
function visit274_98_1(result) {
  _$jscoverage['/base/offset.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['94'][1].init(186, 9, 'container');
function visit273_94_1(result) {
  _$jscoverage['/base/offset.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['90'][1].init(88, 27, '!(elem = Dom.get(selector))');
function visit272_90_1(result) {
  _$jscoverage['/base/offset.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['65'][1].init(458, 6, 'i >= 0');
function visit271_65_1(result) {
  _$jscoverage['/base/offset.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['58'][1].init(100, 4, 'elem');
function visit270_58_1(result) {
  _$jscoverage['/base/offset.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['55'][1].init(73, 25, 'coordinates === undefined');
function visit269_55_1(result) {
  _$jscoverage['/base/offset.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['12'][1].init(119, 26, 'doc && doc.documentElement');
function visit268_12_1(result) {
  _$jscoverage['/base/offset.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/offset.js'].functionData[0]++;
  _$jscoverage['/base/offset.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/offset.js'].lineData[8]++;
  var win = S.Env.host, UA = S.UA, doc = win.document, NodeType = Dom.NodeType, docElem = visit268_12_1(doc && doc.documentElement), getWindow = Dom.getWindow, CSS1Compat = 'CSS1Compat', compatMode = 'compatMode', MAX = Math.max, POSITION = 'position', RELATIVE = 'relative', DOCUMENT = 'document', BODY = 'body', DOC_ELEMENT = 'documentElement', VIEWPORT = 'viewport', SCROLL = 'scroll', CLIENT = 'client', LEFT = 'left', TOP = 'top', SCROLL_LEFT = SCROLL + 'Left', SCROLL_TOP = SCROLL + 'Top';
  _$jscoverage['/base/offset.js'].lineData[30]++;
  S.mix(Dom, {
  offset: function(selector, coordinates, relativeWin) {
  _$jscoverage['/base/offset.js'].functionData[1]++;
  _$jscoverage['/base/offset.js'].lineData[53]++;
  var elem;
  _$jscoverage['/base/offset.js'].lineData[55]++;
  if (visit269_55_1(coordinates === undefined)) {
    _$jscoverage['/base/offset.js'].lineData[56]++;
    elem = Dom.get(selector);
    _$jscoverage['/base/offset.js'].lineData[57]++;
    var ret;
    _$jscoverage['/base/offset.js'].lineData[58]++;
    if (visit270_58_1(elem)) {
      _$jscoverage['/base/offset.js'].lineData[59]++;
      ret = getOffset(elem, relativeWin);
    }
    _$jscoverage['/base/offset.js'].lineData[61]++;
    return ret;
  }
  _$jscoverage['/base/offset.js'].lineData[64]++;
  var els = Dom.query(selector), i;
  _$jscoverage['/base/offset.js'].lineData[65]++;
  for (i = els.length - 1; visit271_65_1(i >= 0); i--) {
    _$jscoverage['/base/offset.js'].lineData[66]++;
    elem = els[i];
    _$jscoverage['/base/offset.js'].lineData[67]++;
    setOffset(elem, coordinates);
  }
  _$jscoverage['/base/offset.js'].lineData[69]++;
  return undefined;
}, 
  scrollIntoView: function(selector, container, alignWithTop, allowHorizontalScroll) {
  _$jscoverage['/base/offset.js'].functionData[2]++;
  _$jscoverage['/base/offset.js'].lineData[87]++;
  var elem, onlyScrollIfNeeded;
  _$jscoverage['/base/offset.js'].lineData[90]++;
  if (visit272_90_1(!(elem = Dom.get(selector)))) {
    _$jscoverage['/base/offset.js'].lineData[91]++;
    return;
  }
  _$jscoverage['/base/offset.js'].lineData[94]++;
  if (visit273_94_1(container)) {
    _$jscoverage['/base/offset.js'].lineData[95]++;
    container = Dom.get(container);
  }
  _$jscoverage['/base/offset.js'].lineData[98]++;
  if (visit274_98_1(!container)) {
    _$jscoverage['/base/offset.js'].lineData[99]++;
    container = elem.ownerDocument;
  }
  _$jscoverage['/base/offset.js'].lineData[103]++;
  if (visit275_103_1(container.nodeType === NodeType.DOCUMENT_NODE)) {
    _$jscoverage['/base/offset.js'].lineData[104]++;
    container = getWindow(container);
  }
  _$jscoverage['/base/offset.js'].lineData[107]++;
  if (visit276_107_1(S.isPlainObject(alignWithTop))) {
    _$jscoverage['/base/offset.js'].lineData[108]++;
    allowHorizontalScroll = alignWithTop.allowHorizontalScroll;
    _$jscoverage['/base/offset.js'].lineData[109]++;
    onlyScrollIfNeeded = alignWithTop.onlyScrollIfNeeded;
    _$jscoverage['/base/offset.js'].lineData[110]++;
    alignWithTop = alignWithTop.alignWithTop;
  }
  _$jscoverage['/base/offset.js'].lineData[113]++;
  allowHorizontalScroll = visit277_113_1(allowHorizontalScroll === undefined) ? true : allowHorizontalScroll;
  _$jscoverage['/base/offset.js'].lineData[115]++;
  var isWin = S.isWindow(container), elemOffset = Dom.offset(elem), eh = Dom.outerHeight(elem), ew = Dom.outerWidth(elem), containerOffset, ch, cw, containerScroll, diffTop, diffBottom, win, winScroll, ww, wh;
  _$jscoverage['/base/offset.js'].lineData[130]++;
  if (visit278_130_1(isWin)) {
    _$jscoverage['/base/offset.js'].lineData[131]++;
    win = container;
    _$jscoverage['/base/offset.js'].lineData[132]++;
    wh = Dom.height(win);
    _$jscoverage['/base/offset.js'].lineData[133]++;
    ww = Dom.width(win);
    _$jscoverage['/base/offset.js'].lineData[134]++;
    winScroll = {
  left: Dom.scrollLeft(win), 
  top: Dom.scrollTop(win)};
    _$jscoverage['/base/offset.js'].lineData[139]++;
    diffTop = {
  left: elemOffset[LEFT] - winScroll[LEFT], 
  top: elemOffset[TOP] - winScroll[TOP]};
    _$jscoverage['/base/offset.js'].lineData[143]++;
    diffBottom = {
  left: elemOffset[LEFT] + ew - (winScroll[LEFT] + ww), 
  top: elemOffset[TOP] + eh - (winScroll[TOP] + wh)};
    _$jscoverage['/base/offset.js'].lineData[147]++;
    containerScroll = winScroll;
  } else {
    _$jscoverage['/base/offset.js'].lineData[149]++;
    containerOffset = Dom.offset(container);
    _$jscoverage['/base/offset.js'].lineData[150]++;
    ch = container.clientHeight;
    _$jscoverage['/base/offset.js'].lineData[151]++;
    cw = container.clientWidth;
    _$jscoverage['/base/offset.js'].lineData[152]++;
    containerScroll = {
  left: Dom.scrollLeft(container), 
  top: Dom.scrollTop(container)};
    _$jscoverage['/base/offset.js'].lineData[158]++;
    diffTop = {
  left: elemOffset[LEFT] - (containerOffset[LEFT] + (visit279_160_1(parseFloat(Dom.css(container, 'borderLeftWidth')) || 0))), 
  top: elemOffset[TOP] - (containerOffset[TOP] + (visit280_162_1(parseFloat(Dom.css(container, 'borderTopWidth')) || 0)))};
    _$jscoverage['/base/offset.js'].lineData[164]++;
    diffBottom = {
  left: elemOffset[LEFT] + ew - (containerOffset[LEFT] + cw + (visit281_167_1(parseFloat(Dom.css(container, 'borderRightWidth')) || 0))), 
  top: elemOffset[TOP] + eh - (containerOffset[TOP] + ch + (visit282_170_1(parseFloat(Dom.css(container, 'borderBottomWidth')) || 0)))};
  }
  _$jscoverage['/base/offset.js'].lineData[174]++;
  if (visit283_174_1(onlyScrollIfNeeded)) {
    _$jscoverage['/base/offset.js'].lineData[175]++;
    if (visit284_175_1(visit285_175_2(diffTop.top < 0) || visit286_175_3(diffBottom.top > 0))) {
      _$jscoverage['/base/offset.js'].lineData[177]++;
      if (visit287_177_1(alignWithTop === true)) {
        _$jscoverage['/base/offset.js'].lineData[178]++;
        Dom.scrollTop(container, containerScroll.top + diffTop.top);
      } else {
        _$jscoverage['/base/offset.js'].lineData[179]++;
        if (visit288_179_1(alignWithTop === false)) {
          _$jscoverage['/base/offset.js'].lineData[180]++;
          Dom.scrollTop(container, containerScroll.top + diffBottom.top);
        } else {
          _$jscoverage['/base/offset.js'].lineData[183]++;
          if (visit289_183_1(diffTop.top < 0)) {
            _$jscoverage['/base/offset.js'].lineData[184]++;
            Dom.scrollTop(container, containerScroll.top + diffTop.top);
          } else {
            _$jscoverage['/base/offset.js'].lineData[186]++;
            Dom.scrollTop(container, containerScroll.top + diffBottom.top);
          }
        }
      }
    }
  } else {
    _$jscoverage['/base/offset.js'].lineData[191]++;
    alignWithTop = visit290_191_1(alignWithTop === undefined) ? true : !!alignWithTop;
    _$jscoverage['/base/offset.js'].lineData[192]++;
    if (visit291_192_1(alignWithTop)) {
      _$jscoverage['/base/offset.js'].lineData[193]++;
      Dom.scrollTop(container, containerScroll.top + diffTop.top);
    } else {
      _$jscoverage['/base/offset.js'].lineData[195]++;
      Dom.scrollTop(container, containerScroll.top + diffBottom.top);
    }
  }
  _$jscoverage['/base/offset.js'].lineData[199]++;
  if (visit292_199_1(allowHorizontalScroll)) {
    _$jscoverage['/base/offset.js'].lineData[200]++;
    if (visit293_200_1(onlyScrollIfNeeded)) {
      _$jscoverage['/base/offset.js'].lineData[201]++;
      if (visit294_201_1(visit295_201_2(diffTop.left < 0) || visit296_201_3(diffBottom.left > 0))) {
        _$jscoverage['/base/offset.js'].lineData[203]++;
        if (visit297_203_1(alignWithTop === true)) {
          _$jscoverage['/base/offset.js'].lineData[204]++;
          Dom.scrollLeft(container, containerScroll.left + diffTop.left);
        } else {
          _$jscoverage['/base/offset.js'].lineData[205]++;
          if (visit298_205_1(alignWithTop === false)) {
            _$jscoverage['/base/offset.js'].lineData[206]++;
            Dom.scrollLeft(container, containerScroll.left + diffBottom.left);
          } else {
            _$jscoverage['/base/offset.js'].lineData[209]++;
            if (visit299_209_1(diffTop.left < 0)) {
              _$jscoverage['/base/offset.js'].lineData[210]++;
              Dom.scrollLeft(container, containerScroll.left + diffTop.left);
            } else {
              _$jscoverage['/base/offset.js'].lineData[212]++;
              Dom.scrollLeft(container, containerScroll.left + diffBottom.left);
            }
          }
        }
      }
    } else {
      _$jscoverage['/base/offset.js'].lineData[217]++;
      alignWithTop = visit300_217_1(alignWithTop === undefined) ? true : !!alignWithTop;
      _$jscoverage['/base/offset.js'].lineData[218]++;
      if (visit301_218_1(alignWithTop)) {
        _$jscoverage['/base/offset.js'].lineData[219]++;
        Dom.scrollLeft(container, containerScroll.left + diffTop.left);
      } else {
        _$jscoverage['/base/offset.js'].lineData[221]++;
        Dom.scrollLeft(container, containerScroll.left + diffBottom.left);
      }
    }
  }
}, 
  docWidth: 0, 
  docHeight: 0, 
  viewportHeight: 0, 
  viewportWidth: 0, 
  scrollTop: 0, 
  scrollLeft: 0});
  _$jscoverage['/base/offset.js'].lineData[274]++;
  S.each(['Left', 'Top'], function(name, i) {
  _$jscoverage['/base/offset.js'].functionData[3]++;
  _$jscoverage['/base/offset.js'].lineData[275]++;
  var method = SCROLL + name;
  _$jscoverage['/base/offset.js'].lineData[277]++;
  Dom[method] = function(elem, v) {
  _$jscoverage['/base/offset.js'].functionData[4]++;
  _$jscoverage['/base/offset.js'].lineData[278]++;
  if (visit302_278_1(typeof elem === 'number')) {
    _$jscoverage['/base/offset.js'].lineData[280]++;
    return arguments.callee(win, elem);
  }
  _$jscoverage['/base/offset.js'].lineData[282]++;
  elem = Dom.get(elem);
  _$jscoverage['/base/offset.js'].lineData[283]++;
  var ret, left, top, w, d;
  _$jscoverage['/base/offset.js'].lineData[288]++;
  if (visit303_288_1(elem && visit304_288_2(elem.nodeType === NodeType.ELEMENT_NODE))) {
    _$jscoverage['/base/offset.js'].lineData[289]++;
    if (visit305_289_1(v !== undefined)) {
      _$jscoverage['/base/offset.js'].lineData[290]++;
      elem[method] = parseFloat(v);
    } else {
      _$jscoverage['/base/offset.js'].lineData[292]++;
      ret = elem[method];
    }
  } else {
    _$jscoverage['/base/offset.js'].lineData[295]++;
    w = getWindow(elem);
    _$jscoverage['/base/offset.js'].lineData[296]++;
    if (visit306_296_1(v !== undefined)) {
      _$jscoverage['/base/offset.js'].lineData[297]++;
      v = parseFloat(v);
      _$jscoverage['/base/offset.js'].lineData[299]++;
      left = visit307_299_1(name === 'Left') ? v : Dom.scrollLeft(w);
      _$jscoverage['/base/offset.js'].lineData[300]++;
      top = visit308_300_1(name === 'Top') ? v : Dom.scrollTop(w);
      _$jscoverage['/base/offset.js'].lineData[301]++;
      w.scrollTo(left, top);
    } else {
      _$jscoverage['/base/offset.js'].lineData[306]++;
      ret = w['page' + (i ? 'Y' : 'X') + 'Offset'];
      _$jscoverage['/base/offset.js'].lineData[307]++;
      if (visit309_307_1(typeof ret !== 'number')) {
        _$jscoverage['/base/offset.js'].lineData[308]++;
        d = w[DOCUMENT];
        _$jscoverage['/base/offset.js'].lineData[310]++;
        ret = d[DOC_ELEMENT][method];
        _$jscoverage['/base/offset.js'].lineData[311]++;
        if (visit310_311_1(typeof ret !== 'number')) {
          _$jscoverage['/base/offset.js'].lineData[313]++;
          ret = d[BODY][method];
        }
      }
    }
  }
  _$jscoverage['/base/offset.js'].lineData[318]++;
  return ret;
};
});
  _$jscoverage['/base/offset.js'].lineData[323]++;
  S.each(['Width', 'Height'], function(name) {
  _$jscoverage['/base/offset.js'].functionData[5]++;
  _$jscoverage['/base/offset.js'].lineData[324]++;
  Dom['doc' + name] = function(refWin) {
  _$jscoverage['/base/offset.js'].functionData[6]++;
  _$jscoverage['/base/offset.js'].lineData[325]++;
  refWin = Dom.get(refWin);
  _$jscoverage['/base/offset.js'].lineData[326]++;
  var d = Dom.getDocument(refWin);
  _$jscoverage['/base/offset.js'].lineData[327]++;
  return MAX(d[DOC_ELEMENT][SCROLL + name], d[BODY][SCROLL + name], Dom[VIEWPORT + name](d));
};
  _$jscoverage['/base/offset.js'].lineData[336]++;
  Dom[VIEWPORT + name] = function(refWin) {
  _$jscoverage['/base/offset.js'].functionData[7]++;
  _$jscoverage['/base/offset.js'].lineData[337]++;
  refWin = Dom.get(refWin);
  _$jscoverage['/base/offset.js'].lineData[338]++;
  var win = getWindow(refWin);
  _$jscoverage['/base/offset.js'].lineData[339]++;
  var ret = win['inner' + name];
  _$jscoverage['/base/offset.js'].lineData[341]++;
  if (visit311_341_1(UA.mobile && ret)) {
    _$jscoverage['/base/offset.js'].lineData[342]++;
    return ret;
  }
  _$jscoverage['/base/offset.js'].lineData[345]++;
  var prop = CLIENT + name, doc = win[DOCUMENT], body = doc[BODY], documentElement = doc[DOC_ELEMENT], documentElementProp = documentElement[prop];
  _$jscoverage['/base/offset.js'].lineData[352]++;
  return visit312_352_1(visit313_352_2(visit314_352_3(doc[compatMode] === CSS1Compat) && documentElementProp) || visit315_353_1(visit316_353_2(body && body[prop]) || documentElementProp));
};
});
  _$jscoverage['/base/offset.js'].lineData[357]++;
  function getClientPosition(elem) {
    _$jscoverage['/base/offset.js'].functionData[8]++;
    _$jscoverage['/base/offset.js'].lineData[358]++;
    var box, x, y, doc = elem.ownerDocument, body = doc.body;
    _$jscoverage['/base/offset.js'].lineData[362]++;
    if (visit317_362_1(!elem.getBoundingClientRect)) {
      _$jscoverage['/base/offset.js'].lineData[363]++;
      return {
  left: 0, 
  top: 0};
    }
    _$jscoverage['/base/offset.js'].lineData[370]++;
    box = elem.getBoundingClientRect();
    _$jscoverage['/base/offset.js'].lineData[376]++;
    x = box[LEFT];
    _$jscoverage['/base/offset.js'].lineData[377]++;
    y = box[TOP];
    _$jscoverage['/base/offset.js'].lineData[399]++;
    x -= visit318_399_1(docElem.clientLeft || visit319_399_2(body.clientLeft || 0));
    _$jscoverage['/base/offset.js'].lineData[400]++;
    y -= visit320_400_1(docElem.clientTop || visit321_400_2(body.clientTop || 0));
    _$jscoverage['/base/offset.js'].lineData[402]++;
    return {
  left: x, 
  top: y};
  }
  _$jscoverage['/base/offset.js'].lineData[405]++;
  function getPageOffset(el) {
    _$jscoverage['/base/offset.js'].functionData[9]++;
    _$jscoverage['/base/offset.js'].lineData[406]++;
    var pos = getClientPosition(el), w = getWindow(el);
    _$jscoverage['/base/offset.js'].lineData[408]++;
    pos.left += Dom[SCROLL_LEFT](w);
    _$jscoverage['/base/offset.js'].lineData[409]++;
    pos.top += Dom[SCROLL_TOP](w);
    _$jscoverage['/base/offset.js'].lineData[410]++;
    return pos;
  }
  _$jscoverage['/base/offset.js'].lineData[414]++;
  function getOffset(el, relativeWin) {
    _$jscoverage['/base/offset.js'].functionData[10]++;
    _$jscoverage['/base/offset.js'].lineData[415]++;
    var position = {
  left: 0, 
  top: 0}, currentWin = getWindow(el), offset, currentEl = el;
    _$jscoverage['/base/offset.js'].lineData[422]++;
    relativeWin = visit322_422_1(relativeWin || currentWin);
    _$jscoverage['/base/offset.js'].lineData[424]++;
    do {
      _$jscoverage['/base/offset.js'].lineData[431]++;
      offset = visit323_431_1(currentWin == relativeWin) ? getPageOffset(currentEl) : getClientPosition(currentEl);
      _$jscoverage['/base/offset.js'].lineData[434]++;
      position.left += offset.left;
      _$jscoverage['/base/offset.js'].lineData[435]++;
      position.top += offset.top;
    } while (visit324_436_1(currentWin && visit325_437_1(visit326_437_2(currentWin != relativeWin) && visit327_438_1((currentEl = currentWin.frameElement) && (currentWin = currentWin.parent)))));
    _$jscoverage['/base/offset.js'].lineData[441]++;
    return position;
  }
  _$jscoverage['/base/offset.js'].lineData[445]++;
  function setOffset(elem, offset) {
    _$jscoverage['/base/offset.js'].functionData[11]++;
    _$jscoverage['/base/offset.js'].lineData[447]++;
    if (visit328_447_1(Dom.css(elem, POSITION) === 'static')) {
      _$jscoverage['/base/offset.js'].lineData[448]++;
      elem.style[POSITION] = RELATIVE;
    }
    _$jscoverage['/base/offset.js'].lineData[451]++;
    var old = getOffset(elem), ret = {}, current, key;
    _$jscoverage['/base/offset.js'].lineData[455]++;
    for (key in offset) {
      _$jscoverage['/base/offset.js'].lineData[456]++;
      current = visit329_456_1(parseFloat(Dom.css(elem, key)) || 0);
      _$jscoverage['/base/offset.js'].lineData[457]++;
      ret[key] = current + offset[key] - old[key];
    }
    _$jscoverage['/base/offset.js'].lineData[459]++;
    Dom.css(elem, ret);
  }
  _$jscoverage['/base/offset.js'].lineData[462]++;
  return Dom;
});
