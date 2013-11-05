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
  _$jscoverage['/base/offset.js'].lineData[8] = 0;
  _$jscoverage['/base/offset.js'].lineData[30] = 0;
  _$jscoverage['/base/offset.js'].lineData[54] = 0;
  _$jscoverage['/base/offset.js'].lineData[55] = 0;
  _$jscoverage['/base/offset.js'].lineData[57] = 0;
  _$jscoverage['/base/offset.js'].lineData[58] = 0;
  _$jscoverage['/base/offset.js'].lineData[60] = 0;
  _$jscoverage['/base/offset.js'].lineData[63] = 0;
  _$jscoverage['/base/offset.js'].lineData[64] = 0;
  _$jscoverage['/base/offset.js'].lineData[65] = 0;
  _$jscoverage['/base/offset.js'].lineData[66] = 0;
  _$jscoverage['/base/offset.js'].lineData[68] = 0;
  _$jscoverage['/base/offset.js'].lineData[86] = 0;
  _$jscoverage['/base/offset.js'].lineData[89] = 0;
  _$jscoverage['/base/offset.js'].lineData[90] = 0;
  _$jscoverage['/base/offset.js'].lineData[93] = 0;
  _$jscoverage['/base/offset.js'].lineData[94] = 0;
  _$jscoverage['/base/offset.js'].lineData[97] = 0;
  _$jscoverage['/base/offset.js'].lineData[98] = 0;
  _$jscoverage['/base/offset.js'].lineData[102] = 0;
  _$jscoverage['/base/offset.js'].lineData[103] = 0;
  _$jscoverage['/base/offset.js'].lineData[106] = 0;
  _$jscoverage['/base/offset.js'].lineData[107] = 0;
  _$jscoverage['/base/offset.js'].lineData[108] = 0;
  _$jscoverage['/base/offset.js'].lineData[109] = 0;
  _$jscoverage['/base/offset.js'].lineData[112] = 0;
  _$jscoverage['/base/offset.js'].lineData[114] = 0;
  _$jscoverage['/base/offset.js'].lineData[129] = 0;
  _$jscoverage['/base/offset.js'].lineData[130] = 0;
  _$jscoverage['/base/offset.js'].lineData[131] = 0;
  _$jscoverage['/base/offset.js'].lineData[132] = 0;
  _$jscoverage['/base/offset.js'].lineData[133] = 0;
  _$jscoverage['/base/offset.js'].lineData[138] = 0;
  _$jscoverage['/base/offset.js'].lineData[142] = 0;
  _$jscoverage['/base/offset.js'].lineData[146] = 0;
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
  _$jscoverage['/base/offset.js'].lineData[279] = 0;
  _$jscoverage['/base/offset.js'].lineData[281] = 0;
  _$jscoverage['/base/offset.js'].lineData[282] = 0;
  _$jscoverage['/base/offset.js'].lineData[287] = 0;
  _$jscoverage['/base/offset.js'].lineData[288] = 0;
  _$jscoverage['/base/offset.js'].lineData[289] = 0;
  _$jscoverage['/base/offset.js'].lineData[291] = 0;
  _$jscoverage['/base/offset.js'].lineData[294] = 0;
  _$jscoverage['/base/offset.js'].lineData[295] = 0;
  _$jscoverage['/base/offset.js'].lineData[296] = 0;
  _$jscoverage['/base/offset.js'].lineData[298] = 0;
  _$jscoverage['/base/offset.js'].lineData[299] = 0;
  _$jscoverage['/base/offset.js'].lineData[300] = 0;
  _$jscoverage['/base/offset.js'].lineData[305] = 0;
  _$jscoverage['/base/offset.js'].lineData[306] = 0;
  _$jscoverage['/base/offset.js'].lineData[307] = 0;
  _$jscoverage['/base/offset.js'].lineData[309] = 0;
  _$jscoverage['/base/offset.js'].lineData[310] = 0;
  _$jscoverage['/base/offset.js'].lineData[312] = 0;
  _$jscoverage['/base/offset.js'].lineData[317] = 0;
  _$jscoverage['/base/offset.js'].lineData[322] = 0;
  _$jscoverage['/base/offset.js'].lineData[323] = 0;
  _$jscoverage['/base/offset.js'].lineData[324] = 0;
  _$jscoverage['/base/offset.js'].lineData[325] = 0;
  _$jscoverage['/base/offset.js'].lineData[326] = 0;
  _$jscoverage['/base/offset.js'].lineData[335] = 0;
  _$jscoverage['/base/offset.js'].lineData[336] = 0;
  _$jscoverage['/base/offset.js'].lineData[337] = 0;
  _$jscoverage['/base/offset.js'].lineData[338] = 0;
  _$jscoverage['/base/offset.js'].lineData[340] = 0;
  _$jscoverage['/base/offset.js'].lineData[341] = 0;
  _$jscoverage['/base/offset.js'].lineData[344] = 0;
  _$jscoverage['/base/offset.js'].lineData[351] = 0;
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
  _$jscoverage['/base/offset.js'].lineData[406] = 0;
  _$jscoverage['/base/offset.js'].lineData[407] = 0;
  _$jscoverage['/base/offset.js'].lineData[409] = 0;
  _$jscoverage['/base/offset.js'].lineData[410] = 0;
  _$jscoverage['/base/offset.js'].lineData[411] = 0;
  _$jscoverage['/base/offset.js'].lineData[415] = 0;
  _$jscoverage['/base/offset.js'].lineData[416] = 0;
  _$jscoverage['/base/offset.js'].lineData[423] = 0;
  _$jscoverage['/base/offset.js'].lineData[425] = 0;
  _$jscoverage['/base/offset.js'].lineData[430] = 0;
  _$jscoverage['/base/offset.js'].lineData[433] = 0;
  _$jscoverage['/base/offset.js'].lineData[434] = 0;
  _$jscoverage['/base/offset.js'].lineData[440] = 0;
  _$jscoverage['/base/offset.js'].lineData[444] = 0;
  _$jscoverage['/base/offset.js'].lineData[446] = 0;
  _$jscoverage['/base/offset.js'].lineData[447] = 0;
  _$jscoverage['/base/offset.js'].lineData[450] = 0;
  _$jscoverage['/base/offset.js'].lineData[454] = 0;
  _$jscoverage['/base/offset.js'].lineData[455] = 0;
  _$jscoverage['/base/offset.js'].lineData[456] = 0;
  _$jscoverage['/base/offset.js'].lineData[458] = 0;
  _$jscoverage['/base/offset.js'].lineData[461] = 0;
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
  _$jscoverage['/base/offset.js'].branchData['54'] = [];
  _$jscoverage['/base/offset.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['57'] = [];
  _$jscoverage['/base/offset.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['64'] = [];
  _$jscoverage['/base/offset.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['89'] = [];
  _$jscoverage['/base/offset.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['93'] = [];
  _$jscoverage['/base/offset.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['97'] = [];
  _$jscoverage['/base/offset.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['102'] = [];
  _$jscoverage['/base/offset.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['106'] = [];
  _$jscoverage['/base/offset.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['112'] = [];
  _$jscoverage['/base/offset.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['129'] = [];
  _$jscoverage['/base/offset.js'].branchData['129'][1] = new BranchData();
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
  _$jscoverage['/base/offset.js'].branchData['287'] = [];
  _$jscoverage['/base/offset.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['287'][2] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['288'] = [];
  _$jscoverage['/base/offset.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['295'] = [];
  _$jscoverage['/base/offset.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['298'] = [];
  _$jscoverage['/base/offset.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['299'] = [];
  _$jscoverage['/base/offset.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['306'] = [];
  _$jscoverage['/base/offset.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['310'] = [];
  _$jscoverage['/base/offset.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['340'] = [];
  _$jscoverage['/base/offset.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['351'] = [];
  _$jscoverage['/base/offset.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['351'][2] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['351'][3] = new BranchData();
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
  _$jscoverage['/base/offset.js'].branchData['423'] = [];
  _$jscoverage['/base/offset.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['430'] = [];
  _$jscoverage['/base/offset.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['435'] = [];
  _$jscoverage['/base/offset.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['436'] = [];
  _$jscoverage['/base/offset.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['436'][2] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['437'] = [];
  _$jscoverage['/base/offset.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['446'] = [];
  _$jscoverage['/base/offset.js'].branchData['446'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['455'] = [];
  _$jscoverage['/base/offset.js'].branchData['455'][1] = new BranchData();
}
_$jscoverage['/base/offset.js'].branchData['455'][1].init(24, 35, 'parseFloat(Dom.css(elem, key)) || 0');
function visit325_455_1(result) {
  _$jscoverage['/base/offset.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['446'][1].init(91, 36, 'Dom.css(elem, POSITION) === \'static\'');
function visit324_446_1(result) {
  _$jscoverage['/base/offset.js'].branchData['446'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['437'][1].init(42, 88, '(currentEl = currentWin[\'frameElement\']) && (currentWin = currentWin.parent)');
function visit323_437_1(result) {
  _$jscoverage['/base/offset.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['436'][2].init(888, 25, 'currentWin != relativeWin');
function visit322_436_2(result) {
  _$jscoverage['/base/offset.js'].branchData['436'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['436'][1].init(26, 131, 'currentWin != relativeWin && (currentEl = currentWin[\'frameElement\']) && (currentWin = currentWin.parent)');
function visit321_436_1(result) {
  _$jscoverage['/base/offset.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['435'][1].init(523, 158, 'currentWin && currentWin != relativeWin && (currentEl = currentWin[\'frameElement\']) && (currentWin = currentWin.parent)');
function visit320_435_1(result) {
  _$jscoverage['/base/offset.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['430'][1].init(299, 25, 'currentWin == relativeWin');
function visit319_430_1(result) {
  _$jscoverage['/base/offset.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['423'][1].init(297, 25, 'relativeWin || currentWin');
function visit318_423_1(result) {
  _$jscoverage['/base/offset.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['400'][2].init(1837, 19, 'body.clientTop || 0');
function visit317_400_2(result) {
  _$jscoverage['/base/offset.js'].branchData['400'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['400'][1].init(1816, 40, 'docElem.clientTop || body.clientTop || 0');
function visit316_400_1(result) {
  _$jscoverage['/base/offset.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['399'][2].init(1780, 20, 'body.clientLeft || 0');
function visit315_399_2(result) {
  _$jscoverage['/base/offset.js'].branchData['399'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['399'][1].init(1758, 42, 'docElem.clientLeft || body.clientLeft || 0');
function visit314_399_1(result) {
  _$jscoverage['/base/offset.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['362'][1].init(111, 27, '!elem.getBoundingClientRect');
function visit313_362_1(result) {
  _$jscoverage['/base/offset.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['353'][2].init(750, 20, 'body && body[prop]');
function visit312_353_2(result) {
  _$jscoverage['/base/offset.js'].branchData['353'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['353'][1].init(90, 43, 'body && body[prop] || documentElementProp');
function visit311_353_1(result) {
  _$jscoverage['/base/offset.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['351'][3].init(657, 30, 'doc[compatMode] === CSS1Compat');
function visit310_351_3(result) {
  _$jscoverage['/base/offset.js'].branchData['351'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['351'][2].init(657, 70, 'doc[compatMode] === CSS1Compat && documentElementProp');
function visit309_351_2(result) {
  _$jscoverage['/base/offset.js'].branchData['351'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['351'][1].init(657, 134, 'doc[compatMode] === CSS1Compat && documentElementProp || body && body[prop] || documentElementProp');
function visit308_351_1(result) {
  _$jscoverage['/base/offset.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['340'][1].init(207, 16, 'UA.mobile && ret');
function visit307_340_1(result) {
  _$jscoverage['/base/offset.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['310'][1].init(176, 23, 'typeof ret !== \'number\'');
function visit306_310_1(result) {
  _$jscoverage['/base/offset.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['306'][1].init(232, 23, 'typeof ret !== \'number\'');
function visit305_306_1(result) {
  _$jscoverage['/base/offset.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['299'][1].init(184, 13, 'name == \'Top\'');
function visit304_299_1(result) {
  _$jscoverage['/base/offset.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['298'][1].init(117, 14, 'name == \'Left\'');
function visit303_298_1(result) {
  _$jscoverage['/base/offset.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['295'][1].init(60, 15, 'v !== undefined');
function visit302_295_1(result) {
  _$jscoverage['/base/offset.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['288'][1].init(22, 15, 'v !== undefined');
function visit301_288_1(result) {
  _$jscoverage['/base/offset.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['287'][2].init(281, 38, 'elem.nodeType == NodeType.ELEMENT_NODE');
function visit300_287_2(result) {
  _$jscoverage['/base/offset.js'].branchData['287'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['287'][1].init(273, 46, 'elem && elem.nodeType == NodeType.ELEMENT_NODE');
function visit299_287_1(result) {
  _$jscoverage['/base/offset.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['278'][1].init(18, 24, 'typeof elem === \'number\'');
function visit298_278_1(result) {
  _$jscoverage['/base/offset.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['218'][1].init(122, 12, 'alignWithTop');
function visit297_218_1(result) {
  _$jscoverage['/base/offset.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['217'][1].init(41, 26, 'alignWithTop === undefined');
function visit296_217_1(result) {
  _$jscoverage['/base/offset.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['209'][1].init(79, 16, 'diffTop.left < 0');
function visit295_209_1(result) {
  _$jscoverage['/base/offset.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['205'][1].init(234, 22, 'alignWithTop === false');
function visit294_205_1(result) {
  _$jscoverage['/base/offset.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['203'][1].init(71, 21, 'alignWithTop === true');
function visit293_203_1(result) {
  _$jscoverage['/base/offset.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['201'][3].init(50, 19, 'diffBottom.left > 0');
function visit292_201_3(result) {
  _$jscoverage['/base/offset.js'].branchData['201'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['201'][2].init(30, 16, 'diffTop.left < 0');
function visit291_201_2(result) {
  _$jscoverage['/base/offset.js'].branchData['201'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['201'][1].init(30, 39, 'diffTop.left < 0 || diffBottom.left > 0');
function visit290_201_1(result) {
  _$jscoverage['/base/offset.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['200'][1].init(26, 18, 'onlyScrollIfNeeded');
function visit289_200_1(result) {
  _$jscoverage['/base/offset.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['199'][1].init(4942, 21, 'allowHorizontalScroll');
function visit288_199_1(result) {
  _$jscoverage['/base/offset.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['192'][1].init(114, 12, 'alignWithTop');
function visit287_192_1(result) {
  _$jscoverage['/base/offset.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['191'][1].init(37, 26, 'alignWithTop === undefined');
function visit286_191_1(result) {
  _$jscoverage['/base/offset.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['183'][1].init(71, 15, 'diffTop.top < 0');
function visit285_183_1(result) {
  _$jscoverage['/base/offset.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['179'][1].init(215, 22, 'alignWithTop === false');
function visit284_179_1(result) {
  _$jscoverage['/base/offset.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['177'][1].init(63, 21, 'alignWithTop === true');
function visit283_177_1(result) {
  _$jscoverage['/base/offset.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['175'][3].init(45, 18, 'diffBottom.top > 0');
function visit282_175_3(result) {
  _$jscoverage['/base/offset.js'].branchData['175'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['175'][2].init(26, 15, 'diffTop.top < 0');
function visit281_175_2(result) {
  _$jscoverage['/base/offset.js'].branchData['175'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['175'][1].init(26, 37, 'diffTop.top < 0 || diffBottom.top > 0');
function visit280_175_1(result) {
  _$jscoverage['/base/offset.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['174'][1].init(3664, 18, 'onlyScrollIfNeeded');
function visit279_174_1(result) {
  _$jscoverage['/base/offset.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['170'][1].init(61, 56, 'parseFloat(Dom.css(container, \'borderBottomWidth\')) || 0');
function visit278_170_1(result) {
  _$jscoverage['/base/offset.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['167'][1].init(62, 55, 'parseFloat(Dom.css(container, \'borderRightWidth\')) || 0');
function visit277_167_1(result) {
  _$jscoverage['/base/offset.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['162'][1].init(52, 53, 'parseFloat(Dom.css(container, \'borderTopWidth\')) || 0');
function visit276_162_1(result) {
  _$jscoverage['/base/offset.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['160'][1].init(53, 54, 'parseFloat(Dom.css(container, \'borderLeftWidth\')) || 0');
function visit275_160_1(result) {
  _$jscoverage['/base/offset.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['129'][1].init(1502, 5, 'isWin');
function visit274_129_1(result) {
  _$jscoverage['/base/offset.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['112'][1].init(911, 35, 'allowHorizontalScroll === undefined');
function visit273_112_1(result) {
  _$jscoverage['/base/offset.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['106'][1].init(597, 29, 'S.isPlainObject(alignWithTop)');
function visit272_106_1(result) {
  _$jscoverage['/base/offset.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['102'][1].init(452, 44, 'container.nodeType == NodeType.DOCUMENT_NODE');
function visit271_102_1(result) {
  _$jscoverage['/base/offset.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['97'][1].init(302, 10, '!container');
function visit270_97_1(result) {
  _$jscoverage['/base/offset.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['93'][1].init(194, 9, 'container');
function visit269_93_1(result) {
  _$jscoverage['/base/offset.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['89'][1].init(92, 27, '!(elem = Dom.get(selector))');
function visit268_89_1(result) {
  _$jscoverage['/base/offset.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['64'][1].init(448, 6, 'i >= 0');
function visit267_64_1(result) {
  _$jscoverage['/base/offset.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['57'][1].init(107, 4, 'elem');
function visit266_57_1(result) {
  _$jscoverage['/base/offset.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['54'][1].init(49, 25, 'coordinates === undefined');
function visit265_54_1(result) {
  _$jscoverage['/base/offset.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['12'][1].init(123, 26, 'doc && doc.documentElement');
function visit264_12_1(result) {
  _$jscoverage['/base/offset.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].lineData[6]++;
KISSY.add('dom/base/offset', function(S, Dom, undefined) {
  _$jscoverage['/base/offset.js'].functionData[0]++;
  _$jscoverage['/base/offset.js'].lineData[8]++;
  var win = S.Env.host, UA = S.UA, doc = win.document, NodeType = Dom.NodeType, docElem = visit264_12_1(doc && doc.documentElement), getWindow = Dom.getWindow, CSS1Compat = 'CSS1Compat', compatMode = 'compatMode', MAX = Math.max, POSITION = 'position', RELATIVE = 'relative', DOCUMENT = 'document', BODY = 'body', DOC_ELEMENT = 'documentElement', VIEWPORT = 'viewport', SCROLL = 'scroll', CLIENT = 'client', LEFT = 'left', TOP = 'top', SCROLL_LEFT = SCROLL + 'Left', SCROLL_TOP = SCROLL + 'Top';
  _$jscoverage['/base/offset.js'].lineData[30]++;
  S.mix(Dom, {
  offset: function(selector, coordinates, relativeWin) {
  _$jscoverage['/base/offset.js'].functionData[1]++;
  _$jscoverage['/base/offset.js'].lineData[54]++;
  if (visit265_54_1(coordinates === undefined)) {
    _$jscoverage['/base/offset.js'].lineData[55]++;
    var elem = Dom.get(selector), ret;
    _$jscoverage['/base/offset.js'].lineData[57]++;
    if (visit266_57_1(elem)) {
      _$jscoverage['/base/offset.js'].lineData[58]++;
      ret = getOffset(elem, relativeWin);
    }
    _$jscoverage['/base/offset.js'].lineData[60]++;
    return ret;
  }
  _$jscoverage['/base/offset.js'].lineData[63]++;
  var els = Dom.query(selector), i;
  _$jscoverage['/base/offset.js'].lineData[64]++;
  for (i = els.length - 1; visit267_64_1(i >= 0); i--) {
    _$jscoverage['/base/offset.js'].lineData[65]++;
    elem = els[i];
    _$jscoverage['/base/offset.js'].lineData[66]++;
    setOffset(elem, coordinates);
  }
  _$jscoverage['/base/offset.js'].lineData[68]++;
  return undefined;
}, 
  scrollIntoView: function(selector, container, alignWithTop, allowHorizontalScroll) {
  _$jscoverage['/base/offset.js'].functionData[2]++;
  _$jscoverage['/base/offset.js'].lineData[86]++;
  var elem, onlyScrollIfNeeded;
  _$jscoverage['/base/offset.js'].lineData[89]++;
  if (visit268_89_1(!(elem = Dom.get(selector)))) {
    _$jscoverage['/base/offset.js'].lineData[90]++;
    return;
  }
  _$jscoverage['/base/offset.js'].lineData[93]++;
  if (visit269_93_1(container)) {
    _$jscoverage['/base/offset.js'].lineData[94]++;
    container = Dom.get(container);
  }
  _$jscoverage['/base/offset.js'].lineData[97]++;
  if (visit270_97_1(!container)) {
    _$jscoverage['/base/offset.js'].lineData[98]++;
    container = elem.ownerDocument;
  }
  _$jscoverage['/base/offset.js'].lineData[102]++;
  if (visit271_102_1(container.nodeType == NodeType.DOCUMENT_NODE)) {
    _$jscoverage['/base/offset.js'].lineData[103]++;
    container = getWindow(container);
  }
  _$jscoverage['/base/offset.js'].lineData[106]++;
  if (visit272_106_1(S.isPlainObject(alignWithTop))) {
    _$jscoverage['/base/offset.js'].lineData[107]++;
    allowHorizontalScroll = alignWithTop.allowHorizontalScroll;
    _$jscoverage['/base/offset.js'].lineData[108]++;
    onlyScrollIfNeeded = alignWithTop.onlyScrollIfNeeded;
    _$jscoverage['/base/offset.js'].lineData[109]++;
    alignWithTop = alignWithTop.alignWithTop;
  }
  _$jscoverage['/base/offset.js'].lineData[112]++;
  allowHorizontalScroll = visit273_112_1(allowHorizontalScroll === undefined) ? true : allowHorizontalScroll;
  _$jscoverage['/base/offset.js'].lineData[114]++;
  var isWin = S.isWindow(container), elemOffset = Dom.offset(elem), eh = Dom.outerHeight(elem), ew = Dom.outerWidth(elem), containerOffset, ch, cw, containerScroll, diffTop, diffBottom, win, winScroll, ww, wh;
  _$jscoverage['/base/offset.js'].lineData[129]++;
  if (visit274_129_1(isWin)) {
    _$jscoverage['/base/offset.js'].lineData[130]++;
    win = container;
    _$jscoverage['/base/offset.js'].lineData[131]++;
    wh = Dom.height(win);
    _$jscoverage['/base/offset.js'].lineData[132]++;
    ww = Dom.width(win);
    _$jscoverage['/base/offset.js'].lineData[133]++;
    winScroll = {
  left: Dom.scrollLeft(win), 
  top: Dom.scrollTop(win)};
    _$jscoverage['/base/offset.js'].lineData[138]++;
    diffTop = {
  left: elemOffset[LEFT] - winScroll[LEFT], 
  top: elemOffset[TOP] - winScroll[TOP]};
    _$jscoverage['/base/offset.js'].lineData[142]++;
    diffBottom = {
  left: elemOffset[LEFT] + ew - (winScroll[LEFT] + ww), 
  top: elemOffset[TOP] + eh - (winScroll[TOP] + wh)};
    _$jscoverage['/base/offset.js'].lineData[146]++;
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
  left: elemOffset[LEFT] - (containerOffset[LEFT] + (visit275_160_1(parseFloat(Dom.css(container, 'borderLeftWidth')) || 0))), 
  top: elemOffset[TOP] - (containerOffset[TOP] + (visit276_162_1(parseFloat(Dom.css(container, 'borderTopWidth')) || 0)))};
    _$jscoverage['/base/offset.js'].lineData[164]++;
    diffBottom = {
  left: elemOffset[LEFT] + ew - (containerOffset[LEFT] + cw + (visit277_167_1(parseFloat(Dom.css(container, 'borderRightWidth')) || 0))), 
  top: elemOffset[TOP] + eh - (containerOffset[TOP] + ch + (visit278_170_1(parseFloat(Dom.css(container, 'borderBottomWidth')) || 0)))};
  }
  _$jscoverage['/base/offset.js'].lineData[174]++;
  if (visit279_174_1(onlyScrollIfNeeded)) {
    _$jscoverage['/base/offset.js'].lineData[175]++;
    if (visit280_175_1(visit281_175_2(diffTop.top < 0) || visit282_175_3(diffBottom.top > 0))) {
      _$jscoverage['/base/offset.js'].lineData[177]++;
      if (visit283_177_1(alignWithTop === true)) {
        _$jscoverage['/base/offset.js'].lineData[178]++;
        Dom.scrollTop(container, containerScroll.top + diffTop.top);
      } else {
        _$jscoverage['/base/offset.js'].lineData[179]++;
        if (visit284_179_1(alignWithTop === false)) {
          _$jscoverage['/base/offset.js'].lineData[180]++;
          Dom.scrollTop(container, containerScroll.top + diffBottom.top);
        } else {
          _$jscoverage['/base/offset.js'].lineData[183]++;
          if (visit285_183_1(diffTop.top < 0)) {
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
    alignWithTop = visit286_191_1(alignWithTop === undefined) ? true : !!alignWithTop;
    _$jscoverage['/base/offset.js'].lineData[192]++;
    if (visit287_192_1(alignWithTop)) {
      _$jscoverage['/base/offset.js'].lineData[193]++;
      Dom.scrollTop(container, containerScroll.top + diffTop.top);
    } else {
      _$jscoverage['/base/offset.js'].lineData[195]++;
      Dom.scrollTop(container, containerScroll.top + diffBottom.top);
    }
  }
  _$jscoverage['/base/offset.js'].lineData[199]++;
  if (visit288_199_1(allowHorizontalScroll)) {
    _$jscoverage['/base/offset.js'].lineData[200]++;
    if (visit289_200_1(onlyScrollIfNeeded)) {
      _$jscoverage['/base/offset.js'].lineData[201]++;
      if (visit290_201_1(visit291_201_2(diffTop.left < 0) || visit292_201_3(diffBottom.left > 0))) {
        _$jscoverage['/base/offset.js'].lineData[203]++;
        if (visit293_203_1(alignWithTop === true)) {
          _$jscoverage['/base/offset.js'].lineData[204]++;
          Dom.scrollLeft(container, containerScroll.left + diffTop.left);
        } else {
          _$jscoverage['/base/offset.js'].lineData[205]++;
          if (visit294_205_1(alignWithTop === false)) {
            _$jscoverage['/base/offset.js'].lineData[206]++;
            Dom.scrollLeft(container, containerScroll.left + diffBottom.left);
          } else {
            _$jscoverage['/base/offset.js'].lineData[209]++;
            if (visit295_209_1(diffTop.left < 0)) {
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
      alignWithTop = visit296_217_1(alignWithTop === undefined) ? true : !!alignWithTop;
      _$jscoverage['/base/offset.js'].lineData[218]++;
      if (visit297_218_1(alignWithTop)) {
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
  if (visit298_278_1(typeof elem === 'number')) {
    _$jscoverage['/base/offset.js'].lineData[279]++;
    return arguments.callee(win, elem);
  }
  _$jscoverage['/base/offset.js'].lineData[281]++;
  elem = Dom.get(elem);
  _$jscoverage['/base/offset.js'].lineData[282]++;
  var ret, left, top, w, d;
  _$jscoverage['/base/offset.js'].lineData[287]++;
  if (visit299_287_1(elem && visit300_287_2(elem.nodeType == NodeType.ELEMENT_NODE))) {
    _$jscoverage['/base/offset.js'].lineData[288]++;
    if (visit301_288_1(v !== undefined)) {
      _$jscoverage['/base/offset.js'].lineData[289]++;
      elem[method] = parseFloat(v);
    } else {
      _$jscoverage['/base/offset.js'].lineData[291]++;
      ret = elem[method];
    }
  } else {
    _$jscoverage['/base/offset.js'].lineData[294]++;
    w = getWindow(elem);
    _$jscoverage['/base/offset.js'].lineData[295]++;
    if (visit302_295_1(v !== undefined)) {
      _$jscoverage['/base/offset.js'].lineData[296]++;
      v = parseFloat(v);
      _$jscoverage['/base/offset.js'].lineData[298]++;
      left = visit303_298_1(name == 'Left') ? v : Dom.scrollLeft(w);
      _$jscoverage['/base/offset.js'].lineData[299]++;
      top = visit304_299_1(name == 'Top') ? v : Dom.scrollTop(w);
      _$jscoverage['/base/offset.js'].lineData[300]++;
      w['scrollTo'](left, top);
    } else {
      _$jscoverage['/base/offset.js'].lineData[305]++;
      ret = w['page' + (i ? 'Y' : 'X') + 'Offset'];
      _$jscoverage['/base/offset.js'].lineData[306]++;
      if (visit305_306_1(typeof ret !== 'number')) {
        _$jscoverage['/base/offset.js'].lineData[307]++;
        d = w[DOCUMENT];
        _$jscoverage['/base/offset.js'].lineData[309]++;
        ret = d[DOC_ELEMENT][method];
        _$jscoverage['/base/offset.js'].lineData[310]++;
        if (visit306_310_1(typeof ret !== 'number')) {
          _$jscoverage['/base/offset.js'].lineData[312]++;
          ret = d[BODY][method];
        }
      }
    }
  }
  _$jscoverage['/base/offset.js'].lineData[317]++;
  return ret;
};
});
  _$jscoverage['/base/offset.js'].lineData[322]++;
  S.each(['Width', 'Height'], function(name) {
  _$jscoverage['/base/offset.js'].functionData[5]++;
  _$jscoverage['/base/offset.js'].lineData[323]++;
  Dom['doc' + name] = function(refWin) {
  _$jscoverage['/base/offset.js'].functionData[6]++;
  _$jscoverage['/base/offset.js'].lineData[324]++;
  refWin = Dom.get(refWin);
  _$jscoverage['/base/offset.js'].lineData[325]++;
  var d = Dom.getDocument(refWin);
  _$jscoverage['/base/offset.js'].lineData[326]++;
  return MAX(d[DOC_ELEMENT][SCROLL + name], d[BODY][SCROLL + name], Dom[VIEWPORT + name](d));
};
  _$jscoverage['/base/offset.js'].lineData[335]++;
  Dom[VIEWPORT + name] = function(refWin) {
  _$jscoverage['/base/offset.js'].functionData[7]++;
  _$jscoverage['/base/offset.js'].lineData[336]++;
  refWin = Dom.get(refWin);
  _$jscoverage['/base/offset.js'].lineData[337]++;
  var win = getWindow(refWin);
  _$jscoverage['/base/offset.js'].lineData[338]++;
  var ret = win['inner' + name];
  _$jscoverage['/base/offset.js'].lineData[340]++;
  if (visit307_340_1(UA.mobile && ret)) {
    _$jscoverage['/base/offset.js'].lineData[341]++;
    return ret;
  }
  _$jscoverage['/base/offset.js'].lineData[344]++;
  var prop = CLIENT + name, doc = win[DOCUMENT], body = doc[BODY], documentElement = doc[DOC_ELEMENT], documentElementProp = documentElement[prop];
  _$jscoverage['/base/offset.js'].lineData[351]++;
  return visit308_351_1(visit309_351_2(visit310_351_3(doc[compatMode] === CSS1Compat) && documentElementProp) || visit311_353_1(visit312_353_2(body && body[prop]) || documentElementProp));
};
});
  _$jscoverage['/base/offset.js'].lineData[357]++;
  function getClientPosition(elem) {
    _$jscoverage['/base/offset.js'].functionData[8]++;
    _$jscoverage['/base/offset.js'].lineData[358]++;
    var box, x, y, doc = elem.ownerDocument, body = doc.body;
    _$jscoverage['/base/offset.js'].lineData[362]++;
    if (visit313_362_1(!elem.getBoundingClientRect)) {
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
    x -= visit314_399_1(docElem.clientLeft || visit315_399_2(body.clientLeft || 0));
    _$jscoverage['/base/offset.js'].lineData[400]++;
    y -= visit316_400_1(docElem.clientTop || visit317_400_2(body.clientTop || 0));
    _$jscoverage['/base/offset.js'].lineData[402]++;
    return {
  left: x, 
  top: y};
  }
  _$jscoverage['/base/offset.js'].lineData[406]++;
  function getPageOffset(el) {
    _$jscoverage['/base/offset.js'].functionData[9]++;
    _$jscoverage['/base/offset.js'].lineData[407]++;
    var pos = getClientPosition(el), w = getWindow(el);
    _$jscoverage['/base/offset.js'].lineData[409]++;
    pos.left += Dom[SCROLL_LEFT](w);
    _$jscoverage['/base/offset.js'].lineData[410]++;
    pos.top += Dom[SCROLL_TOP](w);
    _$jscoverage['/base/offset.js'].lineData[411]++;
    return pos;
  }
  _$jscoverage['/base/offset.js'].lineData[415]++;
  function getOffset(el, relativeWin) {
    _$jscoverage['/base/offset.js'].functionData[10]++;
    _$jscoverage['/base/offset.js'].lineData[416]++;
    var position = {
  left: 0, 
  top: 0}, currentWin = getWindow(el), offset, currentEl = el;
    _$jscoverage['/base/offset.js'].lineData[423]++;
    relativeWin = visit318_423_1(relativeWin || currentWin);
    _$jscoverage['/base/offset.js'].lineData[425]++;
    do {
      _$jscoverage['/base/offset.js'].lineData[430]++;
      offset = visit319_430_1(currentWin == relativeWin) ? getPageOffset(currentEl) : getClientPosition(currentEl);
      _$jscoverage['/base/offset.js'].lineData[433]++;
      position.left += offset.left;
      _$jscoverage['/base/offset.js'].lineData[434]++;
      position.top += offset.top;
    } while (visit320_435_1(currentWin && visit321_436_1(visit322_436_2(currentWin != relativeWin) && visit323_437_1((currentEl = currentWin['frameElement']) && (currentWin = currentWin.parent)))));
    _$jscoverage['/base/offset.js'].lineData[440]++;
    return position;
  }
  _$jscoverage['/base/offset.js'].lineData[444]++;
  function setOffset(elem, offset) {
    _$jscoverage['/base/offset.js'].functionData[11]++;
    _$jscoverage['/base/offset.js'].lineData[446]++;
    if (visit324_446_1(Dom.css(elem, POSITION) === 'static')) {
      _$jscoverage['/base/offset.js'].lineData[447]++;
      elem.style[POSITION] = RELATIVE;
    }
    _$jscoverage['/base/offset.js'].lineData[450]++;
    var old = getOffset(elem), ret = {}, current, key;
    _$jscoverage['/base/offset.js'].lineData[454]++;
    for (key in offset) {
      _$jscoverage['/base/offset.js'].lineData[455]++;
      current = visit325_455_1(parseFloat(Dom.css(elem, key)) || 0);
      _$jscoverage['/base/offset.js'].lineData[456]++;
      ret[key] = current + offset[key] - old[key];
    }
    _$jscoverage['/base/offset.js'].lineData[458]++;
    Dom.css(elem, ret);
  }
  _$jscoverage['/base/offset.js'].lineData[461]++;
  return Dom;
}, {
  requires: ['./api']});
