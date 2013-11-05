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
if (! _$jscoverage['/base/attr.js']) {
  _$jscoverage['/base/attr.js'] = {};
  _$jscoverage['/base/attr.js'].lineData = [];
  _$jscoverage['/base/attr.js'].lineData[6] = 0;
  _$jscoverage['/base/attr.js'].lineData[8] = 0;
  _$jscoverage['/base/attr.js'].lineData[40] = 0;
  _$jscoverage['/base/attr.js'].lineData[41] = 0;
  _$jscoverage['/base/attr.js'].lineData[75] = 0;
  _$jscoverage['/base/attr.js'].lineData[81] = 0;
  _$jscoverage['/base/attr.js'].lineData[82] = 0;
  _$jscoverage['/base/attr.js'].lineData[84] = 0;
  _$jscoverage['/base/attr.js'].lineData[87] = 0;
  _$jscoverage['/base/attr.js'].lineData[88] = 0;
  _$jscoverage['/base/attr.js'].lineData[90] = 0;
  _$jscoverage['/base/attr.js'].lineData[92] = 0;
  _$jscoverage['/base/attr.js'].lineData[94] = 0;
  _$jscoverage['/base/attr.js'].lineData[110] = 0;
  _$jscoverage['/base/attr.js'].lineData[118] = 0;
  _$jscoverage['/base/attr.js'].lineData[119] = 0;
  _$jscoverage['/base/attr.js'].lineData[120] = 0;
  _$jscoverage['/base/attr.js'].lineData[121] = 0;
  _$jscoverage['/base/attr.js'].lineData[125] = 0;
  _$jscoverage['/base/attr.js'].lineData[126] = 0;
  _$jscoverage['/base/attr.js'].lineData[127] = 0;
  _$jscoverage['/base/attr.js'].lineData[128] = 0;
  _$jscoverage['/base/attr.js'].lineData[129] = 0;
  _$jscoverage['/base/attr.js'].lineData[130] = 0;
  _$jscoverage['/base/attr.js'].lineData[134] = 0;
  _$jscoverage['/base/attr.js'].lineData[138] = 0;
  _$jscoverage['/base/attr.js'].lineData[140] = 0;
  _$jscoverage['/base/attr.js'].lineData[141] = 0;
  _$jscoverage['/base/attr.js'].lineData[144] = 0;
  _$jscoverage['/base/attr.js'].lineData[145] = 0;
  _$jscoverage['/base/attr.js'].lineData[147] = 0;
  _$jscoverage['/base/attr.js'].lineData[154] = 0;
  _$jscoverage['/base/attr.js'].lineData[155] = 0;
  _$jscoverage['/base/attr.js'].lineData[159] = 0;
  _$jscoverage['/base/attr.js'].lineData[162] = 0;
  _$jscoverage['/base/attr.js'].lineData[163] = 0;
  _$jscoverage['/base/attr.js'].lineData[165] = 0;
  _$jscoverage['/base/attr.js'].lineData[172] = 0;
  _$jscoverage['/base/attr.js'].lineData[174] = 0;
  _$jscoverage['/base/attr.js'].lineData[178] = 0;
  _$jscoverage['/base/attr.js'].lineData[179] = 0;
  _$jscoverage['/base/attr.js'].lineData[180] = 0;
  _$jscoverage['/base/attr.js'].lineData[181] = 0;
  _$jscoverage['/base/attr.js'].lineData[182] = 0;
  _$jscoverage['/base/attr.js'].lineData[184] = 0;
  _$jscoverage['/base/attr.js'].lineData[188] = 0;
  _$jscoverage['/base/attr.js'].lineData[221] = 0;
  _$jscoverage['/base/attr.js'].lineData[227] = 0;
  _$jscoverage['/base/attr.js'].lineData[228] = 0;
  _$jscoverage['/base/attr.js'].lineData[229] = 0;
  _$jscoverage['/base/attr.js'].lineData[231] = 0;
  _$jscoverage['/base/attr.js'].lineData[235] = 0;
  _$jscoverage['/base/attr.js'].lineData[236] = 0;
  _$jscoverage['/base/attr.js'].lineData[237] = 0;
  _$jscoverage['/base/attr.js'].lineData[238] = 0;
  _$jscoverage['/base/attr.js'].lineData[239] = 0;
  _$jscoverage['/base/attr.js'].lineData[240] = 0;
  _$jscoverage['/base/attr.js'].lineData[241] = 0;
  _$jscoverage['/base/attr.js'].lineData[243] = 0;
  _$jscoverage['/base/attr.js'].lineData[247] = 0;
  _$jscoverage['/base/attr.js'].lineData[248] = 0;
  _$jscoverage['/base/attr.js'].lineData[251] = 0;
  _$jscoverage['/base/attr.js'].lineData[261] = 0;
  _$jscoverage['/base/attr.js'].lineData[265] = 0;
  _$jscoverage['/base/attr.js'].lineData[266] = 0;
  _$jscoverage['/base/attr.js'].lineData[267] = 0;
  _$jscoverage['/base/attr.js'].lineData[268] = 0;
  _$jscoverage['/base/attr.js'].lineData[271] = 0;
  _$jscoverage['/base/attr.js'].lineData[280] = 0;
  _$jscoverage['/base/attr.js'].lineData[281] = 0;
  _$jscoverage['/base/attr.js'].lineData[284] = 0;
  _$jscoverage['/base/attr.js'].lineData[285] = 0;
  _$jscoverage['/base/attr.js'].lineData[286] = 0;
  _$jscoverage['/base/attr.js'].lineData[287] = 0;
  _$jscoverage['/base/attr.js'].lineData[288] = 0;
  _$jscoverage['/base/attr.js'].lineData[336] = 0;
  _$jscoverage['/base/attr.js'].lineData[343] = 0;
  _$jscoverage['/base/attr.js'].lineData[344] = 0;
  _$jscoverage['/base/attr.js'].lineData[345] = 0;
  _$jscoverage['/base/attr.js'].lineData[346] = 0;
  _$jscoverage['/base/attr.js'].lineData[348] = 0;
  _$jscoverage['/base/attr.js'].lineData[352] = 0;
  _$jscoverage['/base/attr.js'].lineData[353] = 0;
  _$jscoverage['/base/attr.js'].lineData[357] = 0;
  _$jscoverage['/base/attr.js'].lineData[359] = 0;
  _$jscoverage['/base/attr.js'].lineData[360] = 0;
  _$jscoverage['/base/attr.js'].lineData[364] = 0;
  _$jscoverage['/base/attr.js'].lineData[366] = 0;
  _$jscoverage['/base/attr.js'].lineData[367] = 0;
  _$jscoverage['/base/attr.js'].lineData[370] = 0;
  _$jscoverage['/base/attr.js'].lineData[371] = 0;
  _$jscoverage['/base/attr.js'].lineData[373] = 0;
  _$jscoverage['/base/attr.js'].lineData[376] = 0;
  _$jscoverage['/base/attr.js'].lineData[377] = 0;
  _$jscoverage['/base/attr.js'].lineData[379] = 0;
  _$jscoverage['/base/attr.js'].lineData[380] = 0;
  _$jscoverage['/base/attr.js'].lineData[382] = 0;
  _$jscoverage['/base/attr.js'].lineData[383] = 0;
  _$jscoverage['/base/attr.js'].lineData[386] = 0;
  _$jscoverage['/base/attr.js'].lineData[388] = 0;
  _$jscoverage['/base/attr.js'].lineData[389] = 0;
  _$jscoverage['/base/attr.js'].lineData[390] = 0;
  _$jscoverage['/base/attr.js'].lineData[391] = 0;
  _$jscoverage['/base/attr.js'].lineData[398] = 0;
  _$jscoverage['/base/attr.js'].lineData[401] = 0;
  _$jscoverage['/base/attr.js'].lineData[402] = 0;
  _$jscoverage['/base/attr.js'].lineData[403] = 0;
  _$jscoverage['/base/attr.js'].lineData[404] = 0;
  _$jscoverage['/base/attr.js'].lineData[405] = 0;
  _$jscoverage['/base/attr.js'].lineData[407] = 0;
  _$jscoverage['/base/attr.js'].lineData[408] = 0;
  _$jscoverage['/base/attr.js'].lineData[411] = 0;
  _$jscoverage['/base/attr.js'].lineData[416] = 0;
  _$jscoverage['/base/attr.js'].lineData[425] = 0;
  _$jscoverage['/base/attr.js'].lineData[426] = 0;
  _$jscoverage['/base/attr.js'].lineData[427] = 0;
  _$jscoverage['/base/attr.js'].lineData[430] = 0;
  _$jscoverage['/base/attr.js'].lineData[431] = 0;
  _$jscoverage['/base/attr.js'].lineData[432] = 0;
  _$jscoverage['/base/attr.js'].lineData[433] = 0;
  _$jscoverage['/base/attr.js'].lineData[435] = 0;
  _$jscoverage['/base/attr.js'].lineData[436] = 0;
  _$jscoverage['/base/attr.js'].lineData[451] = 0;
  _$jscoverage['/base/attr.js'].lineData[452] = 0;
  _$jscoverage['/base/attr.js'].lineData[458] = 0;
  _$jscoverage['/base/attr.js'].lineData[459] = 0;
  _$jscoverage['/base/attr.js'].lineData[460] = 0;
  _$jscoverage['/base/attr.js'].lineData[461] = 0;
  _$jscoverage['/base/attr.js'].lineData[462] = 0;
  _$jscoverage['/base/attr.js'].lineData[465] = 0;
  _$jscoverage['/base/attr.js'].lineData[468] = 0;
  _$jscoverage['/base/attr.js'].lineData[470] = 0;
  _$jscoverage['/base/attr.js'].lineData[472] = 0;
  _$jscoverage['/base/attr.js'].lineData[473] = 0;
  _$jscoverage['/base/attr.js'].lineData[476] = 0;
  _$jscoverage['/base/attr.js'].lineData[488] = 0;
  _$jscoverage['/base/attr.js'].lineData[491] = 0;
  _$jscoverage['/base/attr.js'].lineData[493] = 0;
  _$jscoverage['/base/attr.js'].lineData[495] = 0;
  _$jscoverage['/base/attr.js'].lineData[496] = 0;
  _$jscoverage['/base/attr.js'].lineData[498] = 0;
  _$jscoverage['/base/attr.js'].lineData[500] = 0;
  _$jscoverage['/base/attr.js'].lineData[503] = 0;
  _$jscoverage['/base/attr.js'].lineData[505] = 0;
  _$jscoverage['/base/attr.js'].lineData[512] = 0;
  _$jscoverage['/base/attr.js'].lineData[515] = 0;
  _$jscoverage['/base/attr.js'].lineData[516] = 0;
  _$jscoverage['/base/attr.js'].lineData[517] = 0;
  _$jscoverage['/base/attr.js'].lineData[518] = 0;
  _$jscoverage['/base/attr.js'].lineData[519] = 0;
  _$jscoverage['/base/attr.js'].lineData[522] = 0;
  _$jscoverage['/base/attr.js'].lineData[525] = 0;
  _$jscoverage['/base/attr.js'].lineData[526] = 0;
  _$jscoverage['/base/attr.js'].lineData[527] = 0;
  _$jscoverage['/base/attr.js'].lineData[528] = 0;
  _$jscoverage['/base/attr.js'].lineData[529] = 0;
  _$jscoverage['/base/attr.js'].lineData[530] = 0;
  _$jscoverage['/base/attr.js'].lineData[531] = 0;
  _$jscoverage['/base/attr.js'].lineData[535] = 0;
  _$jscoverage['/base/attr.js'].lineData[538] = 0;
  _$jscoverage['/base/attr.js'].lineData[539] = 0;
  _$jscoverage['/base/attr.js'].lineData[542] = 0;
  _$jscoverage['/base/attr.js'].lineData[554] = 0;
  _$jscoverage['/base/attr.js'].lineData[556] = 0;
  _$jscoverage['/base/attr.js'].lineData[558] = 0;
  _$jscoverage['/base/attr.js'].lineData[559] = 0;
  _$jscoverage['/base/attr.js'].lineData[561] = 0;
  _$jscoverage['/base/attr.js'].lineData[562] = 0;
  _$jscoverage['/base/attr.js'].lineData[563] = 0;
  _$jscoverage['/base/attr.js'].lineData[564] = 0;
  _$jscoverage['/base/attr.js'].lineData[565] = 0;
  _$jscoverage['/base/attr.js'].lineData[566] = 0;
  _$jscoverage['/base/attr.js'].lineData[567] = 0;
  _$jscoverage['/base/attr.js'].lineData[568] = 0;
  _$jscoverage['/base/attr.js'].lineData[570] = 0;
  _$jscoverage['/base/attr.js'].lineData[573] = 0;
  _$jscoverage['/base/attr.js'].lineData[574] = 0;
  _$jscoverage['/base/attr.js'].lineData[578] = 0;
  _$jscoverage['/base/attr.js'].lineData[582] = 0;
  _$jscoverage['/base/attr.js'].lineData[586] = 0;
}
if (! _$jscoverage['/base/attr.js'].functionData) {
  _$jscoverage['/base/attr.js'].functionData = [];
  _$jscoverage['/base/attr.js'].functionData[0] = 0;
  _$jscoverage['/base/attr.js'].functionData[1] = 0;
  _$jscoverage['/base/attr.js'].functionData[2] = 0;
  _$jscoverage['/base/attr.js'].functionData[3] = 0;
  _$jscoverage['/base/attr.js'].functionData[4] = 0;
  _$jscoverage['/base/attr.js'].functionData[5] = 0;
  _$jscoverage['/base/attr.js'].functionData[6] = 0;
  _$jscoverage['/base/attr.js'].functionData[7] = 0;
  _$jscoverage['/base/attr.js'].functionData[8] = 0;
  _$jscoverage['/base/attr.js'].functionData[9] = 0;
  _$jscoverage['/base/attr.js'].functionData[10] = 0;
  _$jscoverage['/base/attr.js'].functionData[11] = 0;
  _$jscoverage['/base/attr.js'].functionData[12] = 0;
  _$jscoverage['/base/attr.js'].functionData[13] = 0;
  _$jscoverage['/base/attr.js'].functionData[14] = 0;
  _$jscoverage['/base/attr.js'].functionData[15] = 0;
  _$jscoverage['/base/attr.js'].functionData[16] = 0;
  _$jscoverage['/base/attr.js'].functionData[17] = 0;
  _$jscoverage['/base/attr.js'].functionData[18] = 0;
  _$jscoverage['/base/attr.js'].functionData[19] = 0;
  _$jscoverage['/base/attr.js'].functionData[20] = 0;
  _$jscoverage['/base/attr.js'].functionData[21] = 0;
  _$jscoverage['/base/attr.js'].functionData[22] = 0;
  _$jscoverage['/base/attr.js'].functionData[23] = 0;
}
if (! _$jscoverage['/base/attr.js'].branchData) {
  _$jscoverage['/base/attr.js'].branchData = {};
  _$jscoverage['/base/attr.js'].branchData['10'] = [];
  _$jscoverage['/base/attr.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['41'] = [];
  _$jscoverage['/base/attr.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['43'] = [];
  _$jscoverage['/base/attr.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['44'] = [];
  _$jscoverage['/base/attr.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['82'] = [];
  _$jscoverage['/base/attr.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['87'] = [];
  _$jscoverage['/base/attr.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['88'] = [];
  _$jscoverage['/base/attr.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['115'] = [];
  _$jscoverage['/base/attr.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['118'] = [];
  _$jscoverage['/base/attr.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['120'] = [];
  _$jscoverage['/base/attr.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['128'] = [];
  _$jscoverage['/base/attr.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['129'] = [];
  _$jscoverage['/base/attr.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['144'] = [];
  _$jscoverage['/base/attr.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['159'] = [];
  _$jscoverage['/base/attr.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['162'] = [];
  _$jscoverage['/base/attr.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['179'] = [];
  _$jscoverage['/base/attr.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['181'] = [];
  _$jscoverage['/base/attr.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['227'] = [];
  _$jscoverage['/base/attr.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['235'] = [];
  _$jscoverage['/base/attr.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['237'] = [];
  _$jscoverage['/base/attr.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['238'] = [];
  _$jscoverage['/base/attr.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['240'] = [];
  _$jscoverage['/base/attr.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['247'] = [];
  _$jscoverage['/base/attr.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['265'] = [];
  _$jscoverage['/base/attr.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['267'] = [];
  _$jscoverage['/base/attr.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['280'] = [];
  _$jscoverage['/base/attr.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['284'] = [];
  _$jscoverage['/base/attr.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['343'] = [];
  _$jscoverage['/base/attr.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['352'] = [];
  _$jscoverage['/base/attr.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['359'] = [];
  _$jscoverage['/base/attr.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['364'] = [];
  _$jscoverage['/base/attr.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['366'] = [];
  _$jscoverage['/base/attr.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['370'] = [];
  _$jscoverage['/base/attr.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['376'] = [];
  _$jscoverage['/base/attr.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['377'] = [];
  _$jscoverage['/base/attr.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['377'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['379'] = [];
  _$jscoverage['/base/attr.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['382'] = [];
  _$jscoverage['/base/attr.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['388'] = [];
  _$jscoverage['/base/attr.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['390'] = [];
  _$jscoverage['/base/attr.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['398'] = [];
  _$jscoverage['/base/attr.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['401'] = [];
  _$jscoverage['/base/attr.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['403'] = [];
  _$jscoverage['/base/attr.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['403'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['404'] = [];
  _$jscoverage['/base/attr.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['407'] = [];
  _$jscoverage['/base/attr.js'].branchData['407'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['426'] = [];
  _$jscoverage['/base/attr.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['430'] = [];
  _$jscoverage['/base/attr.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['432'] = [];
  _$jscoverage['/base/attr.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['435'] = [];
  _$jscoverage['/base/attr.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['435'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['449'] = [];
  _$jscoverage['/base/attr.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['458'] = [];
  _$jscoverage['/base/attr.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['461'] = [];
  _$jscoverage['/base/attr.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['470'] = [];
  _$jscoverage['/base/attr.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['472'] = [];
  _$jscoverage['/base/attr.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['491'] = [];
  _$jscoverage['/base/attr.js'].branchData['491'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['495'] = [];
  _$jscoverage['/base/attr.js'].branchData['495'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['496'] = [];
  _$jscoverage['/base/attr.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['498'] = [];
  _$jscoverage['/base/attr.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['498'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['499'] = [];
  _$jscoverage['/base/attr.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['505'] = [];
  _$jscoverage['/base/attr.js'].branchData['505'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['509'] = [];
  _$jscoverage['/base/attr.js'].branchData['509'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['516'] = [];
  _$jscoverage['/base/attr.js'].branchData['516'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['518'] = [];
  _$jscoverage['/base/attr.js'].branchData['518'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['525'] = [];
  _$jscoverage['/base/attr.js'].branchData['525'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['527'] = [];
  _$jscoverage['/base/attr.js'].branchData['527'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['529'] = [];
  _$jscoverage['/base/attr.js'].branchData['529'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['531'] = [];
  _$jscoverage['/base/attr.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['535'] = [];
  _$jscoverage['/base/attr.js'].branchData['535'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['538'] = [];
  _$jscoverage['/base/attr.js'].branchData['538'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['538'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['538'][3] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['556'] = [];
  _$jscoverage['/base/attr.js'].branchData['556'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['562'] = [];
  _$jscoverage['/base/attr.js'].branchData['562'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['565'] = [];
  _$jscoverage['/base/attr.js'].branchData['565'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['567'] = [];
  _$jscoverage['/base/attr.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['573'] = [];
  _$jscoverage['/base/attr.js'].branchData['573'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['573'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['573'][3] = new BranchData();
}
_$jscoverage['/base/attr.js'].branchData['573'][3].init(557, 39, 'nodeType == NodeType.CDATA_SECTION_NODE');
function visit100_573_3(result) {
  _$jscoverage['/base/attr.js'].branchData['573'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['573'][2].init(523, 30, 'nodeType == NodeType.TEXT_NODE');
function visit99_573_2(result) {
  _$jscoverage['/base/attr.js'].branchData['573'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['573'][1].init(523, 73, 'nodeType == NodeType.TEXT_NODE || nodeType == NodeType.CDATA_SECTION_NODE');
function visit98_573_1(result) {
  _$jscoverage['/base/attr.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['567'][1].init(108, 19, '\'textContent\' in el');
function visit97_567_1(result) {
  _$jscoverage['/base/attr.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['565'][1].init(117, 33, 'nodeType == NodeType.ELEMENT_NODE');
function visit96_565_1(result) {
  _$jscoverage['/base/attr.js'].branchData['565'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['562'][1].init(95, 6, 'i >= 0');
function visit95_562_1(result) {
  _$jscoverage['/base/attr.js'].branchData['562'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['556'][1].init(92, 17, 'val === undefined');
function visit94_556_1(result) {
  _$jscoverage['/base/attr.js'].branchData['556'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['538'][3].init(885, 42, 'hook.set(elem, val, \'value\') === undefined');
function visit93_538_3(result) {
  _$jscoverage['/base/attr.js'].branchData['538'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['538'][2].init(865, 62, '!(\'set\' in hook) || hook.set(elem, val, \'value\') === undefined');
function visit92_538_2(result) {
  _$jscoverage['/base/attr.js'].branchData['538'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['538'][1].init(856, 71, '!hook || !(\'set\' in hook) || hook.set(elem, val, \'value\') === undefined');
function visit91_538_1(result) {
  _$jscoverage['/base/attr.js'].branchData['538'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['535'][1].init(699, 50, 'valHooks[nodeName(elem)] || valHooks[elem.type]');
function visit90_535_1(result) {
  _$jscoverage['/base/attr.js'].branchData['535'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['531'][1].init(37, 13, 'value == null');
function visit89_531_1(result) {
  _$jscoverage['/base/attr.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['529'][1].init(471, 14, 'S.isArray(val)');
function visit88_529_1(result) {
  _$jscoverage['/base/attr.js'].branchData['529'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['527'][1].init(375, 23, 'typeof val === \'number\'');
function visit87_527_1(result) {
  _$jscoverage['/base/attr.js'].branchData['527'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['525'][1].init(292, 11, 'val == null');
function visit86_525_1(result) {
  _$jscoverage['/base/attr.js'].branchData['525'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['518'][1].init(62, 19, 'elem.nodeType !== 1');
function visit85_518_1(result) {
  _$jscoverage['/base/attr.js'].branchData['518'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['516'][1].init(1030, 6, 'i >= 0');
function visit84_516_1(result) {
  _$jscoverage['/base/attr.js'].branchData['516'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['509'][1].init(260, 11, 'ret == null');
function visit83_509_1(result) {
  _$jscoverage['/base/attr.js'].branchData['509'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['505'][1].init(367, 23, 'typeof ret === \'string\'');
function visit82_505_1(result) {
  _$jscoverage['/base/attr.js'].branchData['505'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['499'][1].init(46, 44, '(ret = hook.get(elem, \'value\')) !== undefined');
function visit81_499_1(result) {
  _$jscoverage['/base/attr.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['498'][2].init(125, 91, '\'get\' in hook && (ret = hook.get(elem, \'value\')) !== undefined');
function visit80_498_2(result) {
  _$jscoverage['/base/attr.js'].branchData['498'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['498'][1].init(117, 99, 'hook && \'get\' in hook && (ret = hook.get(elem, \'value\')) !== undefined');
function visit79_498_1(result) {
  _$jscoverage['/base/attr.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['496'][1].init(33, 51, 'valHooks[nodeName(elem)] || valHooks[elem.type]');
function visit78_496_1(result) {
  _$jscoverage['/base/attr.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['495'][1].init(77, 4, 'elem');
function visit77_495_1(result) {
  _$jscoverage['/base/attr.js'].branchData['495'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['491'][1].init(101, 19, 'value === undefined');
function visit76_491_1(result) {
  _$jscoverage['/base/attr.js'].branchData['491'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['472'][1].init(64, 27, 'elems[i].hasAttribute(name)');
function visit75_472_1(result) {
  _$jscoverage['/base/attr.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['470'][1].init(136, 7, 'i < len');
function visit74_470_1(result) {
  _$jscoverage['/base/attr.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['461'][1].init(133, 30, 'attrNode && attrNode.specified');
function visit73_461_1(result) {
  _$jscoverage['/base/attr.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['458'][1].init(415, 16, 'i < elems.length');
function visit72_458_1(result) {
  _$jscoverage['/base/attr.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['449'][1].init(10514, 38, 'docElement && !docElement.hasAttribute');
function visit71_449_1(result) {
  _$jscoverage['/base/attr.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['435'][2].init(204, 23, 'propFix[name] || name');
function visit70_435_2(result) {
  _$jscoverage['/base/attr.js'].branchData['435'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['435'][1].init(168, 66, 'R_BOOLEAN.test(name) && (propName = propFix[name] || name) in el');
function visit69_435_1(result) {
  _$jscoverage['/base/attr.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['432'][1].init(60, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit68_432_1(result) {
  _$jscoverage['/base/attr.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['430'][1].init(241, 6, 'i >= 0');
function visit67_430_1(result) {
  _$jscoverage['/base/attr.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['426'][1].init(69, 21, 'attrFix[name] || name');
function visit66_426_1(result) {
  _$jscoverage['/base/attr.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['407'][1].init(188, 36, 'attrNormalizer && attrNormalizer.set');
function visit65_407_1(result) {
  _$jscoverage['/base/attr.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['404'][1].init(34, 22, 'nodeName(el) == \'form\'');
function visit64_404_1(result) {
  _$jscoverage['/base/attr.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['403'][2].init(74, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit63_403_2(result) {
  _$jscoverage['/base/attr.js'].branchData['403'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['403'][1].init(68, 43, 'el && el.nodeType === NodeType.ELEMENT_NODE');
function visit62_403_1(result) {
  _$jscoverage['/base/attr.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['401'][1].init(47, 6, 'i >= 0');
function visit61_401_1(result) {
  _$jscoverage['/base/attr.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['398'][1].init(1004, 12, 'ret === null');
function visit60_398_1(result) {
  _$jscoverage['/base/attr.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['390'][1].init(105, 32, '!attrNode || !attrNode.specified');
function visit59_390_1(result) {
  _$jscoverage['/base/attr.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['388'][1].init(494, 10, 'ret === ""');
function visit58_388_1(result) {
  _$jscoverage['/base/attr.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['382'][1].init(274, 36, 'attrNormalizer && attrNormalizer.get');
function visit57_382_1(result) {
  _$jscoverage['/base/attr.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['379'][1].init(132, 22, 'nodeName(el) == \'form\'');
function visit56_379_1(result) {
  _$jscoverage['/base/attr.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['377'][2].init(32, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit55_377_2(result) {
  _$jscoverage['/base/attr.js'].branchData['377'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['377'][1].init(26, 43, 'el && el.nodeType === NodeType.ELEMENT_NODE');
function visit54_377_1(result) {
  _$jscoverage['/base/attr.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['376'][1].init(2942, 17, 'val === undefined');
function visit53_376_1(result) {
  _$jscoverage['/base/attr.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['370'][1].init(2739, 25, 'R_INVALID_CHAR.test(name)');
function visit52_370_1(result) {
  _$jscoverage['/base/attr.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['366'][1].init(2588, 20, 'R_BOOLEAN.test(name)');
function visit51_366_1(result) {
  _$jscoverage['/base/attr.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['364'][1].init(2542, 21, 'attrFix[name] || name');
function visit50_364_1(result) {
  _$jscoverage['/base/attr.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['359'][1].init(2386, 20, 'pass && attrFn[name]');
function visit49_359_1(result) {
  _$jscoverage['/base/attr.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['352'][1].init(2189, 20, 'pass && attrFn[name]');
function visit48_352_1(result) {
  _$jscoverage['/base/attr.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['343'][1].init(1891, 21, 'S.isPlainObject(name)');
function visit47_343_1(result) {
  _$jscoverage['/base/attr.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['284'][1].init(193, 6, 'i >= 0');
function visit46_284_1(result) {
  _$jscoverage['/base/attr.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['280'][1].init(25, 23, 'propFix[name] || name');
function visit45_280_1(result) {
  _$jscoverage['/base/attr.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['267'][1].init(62, 31, 'getProp(el, name) !== undefined');
function visit44_267_1(result) {
  _$jscoverage['/base/attr.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['265'][1].init(170, 7, 'i < len');
function visit43_265_1(result) {
  _$jscoverage['/base/attr.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['247'][1].init(26, 12, 'elems.length');
function visit42_247_1(result) {
  _$jscoverage['/base/attr.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['240'][1].init(72, 16, 'hook && hook.set');
function visit41_240_1(result) {
  _$jscoverage['/base/attr.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['238'][1].init(49, 6, 'i >= 0');
function visit40_238_1(result) {
  _$jscoverage['/base/attr.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['237'][1].init(559, 19, 'value !== undefined');
function visit39_237_1(result) {
  _$jscoverage['/base/attr.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['235'][1].init(470, 23, 'propFix[name] || name');
function visit38_235_1(result) {
  _$jscoverage['/base/attr.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['227'][1].init(186, 21, 'S.isPlainObject(name)');
function visit37_227_1(result) {
  _$jscoverage['/base/attr.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['181'][1].init(90, 16, 'hook && hook.get');
function visit36_181_1(result) {
  _$jscoverage['/base/attr.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['179'][1].init(17, 21, 'propFix[name] || name');
function visit35_179_1(result) {
  _$jscoverage['/base/attr.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['162'][1].init(22, 16, 'S.isArray(value)');
function visit34_162_1(result) {
  _$jscoverage['/base/attr.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['159'][1].init(155, 35, 'elem.getAttribute(\'value\') === null');
function visit33_159_1(result) {
  _$jscoverage['/base/attr.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['144'][1].init(277, 14, '!values.length');
function visit32_144_1(result) {
  _$jscoverage['/base/attr.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['129'][1].init(30, 19, 'options[i].selected');
function visit31_129_1(result) {
  _$jscoverage['/base/attr.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['128'][1].init(696, 7, 'i < len');
function visit30_128_1(result) {
  _$jscoverage['/base/attr.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['120'][1].init(416, 3, 'one');
function visit29_120_1(result) {
  _$jscoverage['/base/attr.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['118'][1].init(332, 9, 'index < 0');
function visit28_118_1(result) {
  _$jscoverage['/base/attr.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['115'][1].init(200, 34, 'String(elem.type) === \'select-one\'');
function visit27_115_1(result) {
  _$jscoverage['/base/attr.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['88'][1].init(131, 16, 'propName in elem');
function visit26_88_1(result) {
  _$jscoverage['/base/attr.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['87'][1].init(81, 23, 'propFix[name] || name');
function visit25_87_1(result) {
  _$jscoverage['/base/attr.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['82'][1].init(53, 15, 'value === false');
function visit24_82_1(result) {
  _$jscoverage['/base/attr.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['44'][1].init(61, 40, 'R_CLICKABLE.test(el.nodeName) && el.href');
function visit23_44_1(result) {
  _$jscoverage['/base/attr.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['43'][1].init(-1, 102, 'R_FOCUSABLE.test(el.nodeName) || R_CLICKABLE.test(el.nodeName) && el.href');
function visit22_43_1(result) {
  _$jscoverage['/base/attr.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['41'][1].init(216, 40, 'attributeNode && attributeNode.specified');
function visit21_41_1(result) {
  _$jscoverage['/base/attr.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['10'][1].init(86, 26, 'doc && doc.documentElement');
function visit20_10_1(result) {
  _$jscoverage['/base/attr.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].lineData[6]++;
KISSY.add('dom/base/attr', function(S, Dom, undefined) {
  _$jscoverage['/base/attr.js'].functionData[0]++;
  _$jscoverage['/base/attr.js'].lineData[8]++;
  var doc = S.Env.host.document, NodeType = Dom.NodeType, docElement = visit20_10_1(doc && doc.documentElement), EMPTY = '', nodeName = Dom.nodeName, R_BOOLEAN = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i, R_FOCUSABLE = /^(?:button|input|object|select|textarea)$/i, R_CLICKABLE = /^a(?:rea)?$/i, R_INVALID_CHAR = /:|^on/, R_RETURN = /\r/g, attrFix = {}, attrFn = {
  val: 1, 
  css: 1, 
  html: 1, 
  text: 1, 
  data: 1, 
  width: 1, 
  height: 1, 
  offset: 1, 
  scrollTop: 1, 
  scrollLeft: 1}, attrHooks = {
  tabindex: {
  get: function(el) {
  _$jscoverage['/base/attr.js'].functionData[1]++;
  _$jscoverage['/base/attr.js'].lineData[40]++;
  var attributeNode = el.getAttributeNode('tabindex');
  _$jscoverage['/base/attr.js'].lineData[41]++;
  return visit21_41_1(attributeNode && attributeNode.specified) ? parseInt(attributeNode.value, 10) : visit22_43_1(R_FOCUSABLE.test(el.nodeName) || visit23_44_1(R_CLICKABLE.test(el.nodeName) && el.href)) ? 0 : undefined;
}}}, propFix = {
  'hidefocus': 'hideFocus', 
  tabindex: 'tabIndex', 
  readonly: 'readOnly', 
  'for': 'htmlFor', 
  'class': 'className', 
  maxlength: 'maxLength', 
  'cellspacing': 'cellSpacing', 
  'cellpadding': 'cellPadding', 
  rowspan: 'rowSpan', 
  colspan: 'colSpan', 
  usemap: 'useMap', 
  'frameborder': 'frameBorder', 
  'contenteditable': 'contentEditable'}, boolHook = {
  get: function(elem, name) {
  _$jscoverage['/base/attr.js'].functionData[2]++;
  _$jscoverage['/base/attr.js'].lineData[75]++;
  return Dom.prop(elem, name) ? name.toLowerCase() : undefined;
}, 
  set: function(elem, value, name) {
  _$jscoverage['/base/attr.js'].functionData[3]++;
  _$jscoverage['/base/attr.js'].lineData[81]++;
  var propName;
  _$jscoverage['/base/attr.js'].lineData[82]++;
  if (visit24_82_1(value === false)) {
    _$jscoverage['/base/attr.js'].lineData[84]++;
    Dom.removeAttr(elem, name);
  } else {
    _$jscoverage['/base/attr.js'].lineData[87]++;
    propName = visit25_87_1(propFix[name] || name);
    _$jscoverage['/base/attr.js'].lineData[88]++;
    if (visit26_88_1(propName in elem)) {
      _$jscoverage['/base/attr.js'].lineData[90]++;
      elem[propName] = true;
    }
    _$jscoverage['/base/attr.js'].lineData[92]++;
    elem.setAttribute(name, name.toLowerCase());
  }
  _$jscoverage['/base/attr.js'].lineData[94]++;
  return name;
}}, propHooks = {}, attrNodeHook = {}, valHooks = {
  select: {
  get: function(elem) {
  _$jscoverage['/base/attr.js'].functionData[4]++;
  _$jscoverage['/base/attr.js'].lineData[110]++;
  var index = elem.selectedIndex, options = elem.options, ret, i, len, one = (visit27_115_1(String(elem.type) === 'select-one'));
  _$jscoverage['/base/attr.js'].lineData[118]++;
  if (visit28_118_1(index < 0)) {
    _$jscoverage['/base/attr.js'].lineData[119]++;
    return null;
  } else {
    _$jscoverage['/base/attr.js'].lineData[120]++;
    if (visit29_120_1(one)) {
      _$jscoverage['/base/attr.js'].lineData[121]++;
      return Dom.val(options[index]);
    }
  }
  _$jscoverage['/base/attr.js'].lineData[125]++;
  ret = [];
  _$jscoverage['/base/attr.js'].lineData[126]++;
  i = 0;
  _$jscoverage['/base/attr.js'].lineData[127]++;
  len = options.length;
  _$jscoverage['/base/attr.js'].lineData[128]++;
  for (; visit30_128_1(i < len); ++i) {
    _$jscoverage['/base/attr.js'].lineData[129]++;
    if (visit31_129_1(options[i].selected)) {
      _$jscoverage['/base/attr.js'].lineData[130]++;
      ret.push(Dom.val(options[i]));
    }
  }
  _$jscoverage['/base/attr.js'].lineData[134]++;
  return ret;
}, 
  set: function(elem, value) {
  _$jscoverage['/base/attr.js'].functionData[5]++;
  _$jscoverage['/base/attr.js'].lineData[138]++;
  var values = S.makeArray(value), opts = elem.options;
  _$jscoverage['/base/attr.js'].lineData[140]++;
  S.each(opts, function(opt) {
  _$jscoverage['/base/attr.js'].functionData[6]++;
  _$jscoverage['/base/attr.js'].lineData[141]++;
  opt.selected = S.inArray(Dom.val(opt), values);
});
  _$jscoverage['/base/attr.js'].lineData[144]++;
  if (visit32_144_1(!values.length)) {
    _$jscoverage['/base/attr.js'].lineData[145]++;
    elem.selectedIndex = -1;
  }
  _$jscoverage['/base/attr.js'].lineData[147]++;
  return values;
}}};
  _$jscoverage['/base/attr.js'].lineData[154]++;
  S.each(['radio', 'checkbox'], function(r) {
  _$jscoverage['/base/attr.js'].functionData[7]++;
  _$jscoverage['/base/attr.js'].lineData[155]++;
  valHooks[r] = {
  get: function(elem) {
  _$jscoverage['/base/attr.js'].functionData[8]++;
  _$jscoverage['/base/attr.js'].lineData[159]++;
  return visit33_159_1(elem.getAttribute('value') === null) ? 'on' : elem.value;
}, 
  set: function(elem, value) {
  _$jscoverage['/base/attr.js'].functionData[9]++;
  _$jscoverage['/base/attr.js'].lineData[162]++;
  if (visit34_162_1(S.isArray(value))) {
    _$jscoverage['/base/attr.js'].lineData[163]++;
    return elem.checked = S.inArray(Dom.val(elem), value);
  }
  _$jscoverage['/base/attr.js'].lineData[165]++;
  return undefined;
}};
});
  _$jscoverage['/base/attr.js'].lineData[172]++;
  attrHooks['style'] = {
  get: function(el) {
  _$jscoverage['/base/attr.js'].functionData[10]++;
  _$jscoverage['/base/attr.js'].lineData[174]++;
  return el.style.cssText;
}};
  _$jscoverage['/base/attr.js'].lineData[178]++;
  function getProp(elem, name) {
    _$jscoverage['/base/attr.js'].functionData[11]++;
    _$jscoverage['/base/attr.js'].lineData[179]++;
    name = visit35_179_1(propFix[name] || name);
    _$jscoverage['/base/attr.js'].lineData[180]++;
    var hook = propHooks[name];
    _$jscoverage['/base/attr.js'].lineData[181]++;
    if (visit36_181_1(hook && hook.get)) {
      _$jscoverage['/base/attr.js'].lineData[182]++;
      return hook.get(elem, name);
    } else {
      _$jscoverage['/base/attr.js'].lineData[184]++;
      return elem[name];
    }
  }
  _$jscoverage['/base/attr.js'].lineData[188]++;
  S.mix(Dom, {
  _valHooks: valHooks, 
  _propFix: propFix, 
  _attrHooks: attrHooks, 
  _propHooks: propHooks, 
  _attrNodeHook: attrNodeHook, 
  _attrFix: attrFix, 
  prop: function(selector, name, value) {
  _$jscoverage['/base/attr.js'].functionData[12]++;
  _$jscoverage['/base/attr.js'].lineData[221]++;
  var elems = Dom.query(selector), i, elem, hook;
  _$jscoverage['/base/attr.js'].lineData[227]++;
  if (visit37_227_1(S.isPlainObject(name))) {
    _$jscoverage['/base/attr.js'].lineData[228]++;
    S.each(name, function(v, k) {
  _$jscoverage['/base/attr.js'].functionData[13]++;
  _$jscoverage['/base/attr.js'].lineData[229]++;
  Dom.prop(elems, k, v);
});
    _$jscoverage['/base/attr.js'].lineData[231]++;
    return undefined;
  }
  _$jscoverage['/base/attr.js'].lineData[235]++;
  name = visit38_235_1(propFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[236]++;
  hook = propHooks[name];
  _$jscoverage['/base/attr.js'].lineData[237]++;
  if (visit39_237_1(value !== undefined)) {
    _$jscoverage['/base/attr.js'].lineData[238]++;
    for (i = elems.length - 1; visit40_238_1(i >= 0); i--) {
      _$jscoverage['/base/attr.js'].lineData[239]++;
      elem = elems[i];
      _$jscoverage['/base/attr.js'].lineData[240]++;
      if (visit41_240_1(hook && hook.set)) {
        _$jscoverage['/base/attr.js'].lineData[241]++;
        hook.set(elem, value, name);
      } else {
        _$jscoverage['/base/attr.js'].lineData[243]++;
        elem[name] = value;
      }
    }
  } else {
    _$jscoverage['/base/attr.js'].lineData[247]++;
    if (visit42_247_1(elems.length)) {
      _$jscoverage['/base/attr.js'].lineData[248]++;
      return getProp(elems[0], name);
    }
  }
  _$jscoverage['/base/attr.js'].lineData[251]++;
  return undefined;
}, 
  hasProp: function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[14]++;
  _$jscoverage['/base/attr.js'].lineData[261]++;
  var elems = Dom.query(selector), i, len = elems.length, el;
  _$jscoverage['/base/attr.js'].lineData[265]++;
  for (i = 0; visit43_265_1(i < len); i++) {
    _$jscoverage['/base/attr.js'].lineData[266]++;
    el = elems[i];
    _$jscoverage['/base/attr.js'].lineData[267]++;
    if (visit44_267_1(getProp(el, name) !== undefined)) {
      _$jscoverage['/base/attr.js'].lineData[268]++;
      return true;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[271]++;
  return false;
}, 
  removeProp: function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[15]++;
  _$jscoverage['/base/attr.js'].lineData[280]++;
  name = visit45_280_1(propFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[281]++;
  var elems = Dom.query(selector), i, el;
  _$jscoverage['/base/attr.js'].lineData[284]++;
  for (i = elems.length - 1; visit46_284_1(i >= 0); i--) {
    _$jscoverage['/base/attr.js'].lineData[285]++;
    el = elems[i];
    _$jscoverage['/base/attr.js'].lineData[286]++;
    try {
      _$jscoverage['/base/attr.js'].lineData[287]++;
      el[name] = undefined;
      _$jscoverage['/base/attr.js'].lineData[288]++;
      delete el[name];
    }    catch (e) {
}
  }
}, 
  attr: function(selector, name, val, pass) {
  _$jscoverage['/base/attr.js'].functionData[16]++;
  _$jscoverage['/base/attr.js'].lineData[336]++;
  var els = Dom.query(selector), attrNormalizer, i, el = els[0], ret;
  _$jscoverage['/base/attr.js'].lineData[343]++;
  if (visit47_343_1(S.isPlainObject(name))) {
    _$jscoverage['/base/attr.js'].lineData[344]++;
    pass = val;
    _$jscoverage['/base/attr.js'].lineData[345]++;
    for (var k in name) {
      _$jscoverage['/base/attr.js'].lineData[346]++;
      Dom.attr(els, k, name[k], pass);
    }
    _$jscoverage['/base/attr.js'].lineData[348]++;
    return undefined;
  }
  _$jscoverage['/base/attr.js'].lineData[352]++;
  if (visit48_352_1(pass && attrFn[name])) {
    _$jscoverage['/base/attr.js'].lineData[353]++;
    return Dom[name](selector, val);
  }
  _$jscoverage['/base/attr.js'].lineData[357]++;
  name = name.toLowerCase();
  _$jscoverage['/base/attr.js'].lineData[359]++;
  if (visit49_359_1(pass && attrFn[name])) {
    _$jscoverage['/base/attr.js'].lineData[360]++;
    return Dom[name](selector, val);
  }
  _$jscoverage['/base/attr.js'].lineData[364]++;
  name = visit50_364_1(attrFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[366]++;
  if (visit51_366_1(R_BOOLEAN.test(name))) {
    _$jscoverage['/base/attr.js'].lineData[367]++;
    attrNormalizer = boolHook;
  } else {
    _$jscoverage['/base/attr.js'].lineData[370]++;
    if (visit52_370_1(R_INVALID_CHAR.test(name))) {
      _$jscoverage['/base/attr.js'].lineData[371]++;
      attrNormalizer = attrNodeHook;
    } else {
      _$jscoverage['/base/attr.js'].lineData[373]++;
      attrNormalizer = attrHooks[name];
    }
  }
  _$jscoverage['/base/attr.js'].lineData[376]++;
  if (visit53_376_1(val === undefined)) {
    _$jscoverage['/base/attr.js'].lineData[377]++;
    if (visit54_377_1(el && visit55_377_2(el.nodeType === NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/attr.js'].lineData[379]++;
      if (visit56_379_1(nodeName(el) == 'form')) {
        _$jscoverage['/base/attr.js'].lineData[380]++;
        attrNormalizer = attrNodeHook;
      }
      _$jscoverage['/base/attr.js'].lineData[382]++;
      if (visit57_382_1(attrNormalizer && attrNormalizer.get)) {
        _$jscoverage['/base/attr.js'].lineData[383]++;
        return attrNormalizer.get(el, name);
      }
      _$jscoverage['/base/attr.js'].lineData[386]++;
      ret = el.getAttribute(name);
      _$jscoverage['/base/attr.js'].lineData[388]++;
      if (visit58_388_1(ret === "")) {
        _$jscoverage['/base/attr.js'].lineData[389]++;
        var attrNode = el.getAttributeNode(name);
        _$jscoverage['/base/attr.js'].lineData[390]++;
        if (visit59_390_1(!attrNode || !attrNode.specified)) {
          _$jscoverage['/base/attr.js'].lineData[391]++;
          return undefined;
        }
      }
      _$jscoverage['/base/attr.js'].lineData[398]++;
      return visit60_398_1(ret === null) ? undefined : ret;
    }
  } else {
    _$jscoverage['/base/attr.js'].lineData[401]++;
    for (i = els.length - 1; visit61_401_1(i >= 0); i--) {
      _$jscoverage['/base/attr.js'].lineData[402]++;
      el = els[i];
      _$jscoverage['/base/attr.js'].lineData[403]++;
      if (visit62_403_1(el && visit63_403_2(el.nodeType === NodeType.ELEMENT_NODE))) {
        _$jscoverage['/base/attr.js'].lineData[404]++;
        if (visit64_404_1(nodeName(el) == 'form')) {
          _$jscoverage['/base/attr.js'].lineData[405]++;
          attrNormalizer = attrNodeHook;
        }
        _$jscoverage['/base/attr.js'].lineData[407]++;
        if (visit65_407_1(attrNormalizer && attrNormalizer.set)) {
          _$jscoverage['/base/attr.js'].lineData[408]++;
          attrNormalizer.set(el, val, name);
        } else {
          _$jscoverage['/base/attr.js'].lineData[411]++;
          el.setAttribute(name, EMPTY + val);
        }
      }
    }
  }
  _$jscoverage['/base/attr.js'].lineData[416]++;
  return undefined;
}, 
  removeAttr: function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[17]++;
  _$jscoverage['/base/attr.js'].lineData[425]++;
  name = name.toLowerCase();
  _$jscoverage['/base/attr.js'].lineData[426]++;
  name = visit66_426_1(attrFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[427]++;
  var els = Dom.query(selector), propName, el, i;
  _$jscoverage['/base/attr.js'].lineData[430]++;
  for (i = els.length - 1; visit67_430_1(i >= 0); i--) {
    _$jscoverage['/base/attr.js'].lineData[431]++;
    el = els[i];
    _$jscoverage['/base/attr.js'].lineData[432]++;
    if (visit68_432_1(el.nodeType == NodeType.ELEMENT_NODE)) {
      _$jscoverage['/base/attr.js'].lineData[433]++;
      el.removeAttribute(name);
      _$jscoverage['/base/attr.js'].lineData[435]++;
      if (visit69_435_1(R_BOOLEAN.test(name) && (propName = visit70_435_2(propFix[name] || name)) in el)) {
        _$jscoverage['/base/attr.js'].lineData[436]++;
        el[propName] = false;
      }
    }
  }
}, 
  hasAttr: visit71_449_1(docElement && !docElement.hasAttribute) ? function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[18]++;
  _$jscoverage['/base/attr.js'].lineData[451]++;
  name = name.toLowerCase();
  _$jscoverage['/base/attr.js'].lineData[452]++;
  var elems = Dom.query(selector), i, el, attrNode;
  _$jscoverage['/base/attr.js'].lineData[458]++;
  for (i = 0; visit72_458_1(i < elems.length); i++) {
    _$jscoverage['/base/attr.js'].lineData[459]++;
    el = elems[i];
    _$jscoverage['/base/attr.js'].lineData[460]++;
    attrNode = el.getAttributeNode(name);
    _$jscoverage['/base/attr.js'].lineData[461]++;
    if (visit73_461_1(attrNode && attrNode.specified)) {
      _$jscoverage['/base/attr.js'].lineData[462]++;
      return true;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[465]++;
  return false;
} : function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[19]++;
  _$jscoverage['/base/attr.js'].lineData[468]++;
  var elems = Dom.query(selector), i, len = elems.length;
  _$jscoverage['/base/attr.js'].lineData[470]++;
  for (i = 0; visit74_470_1(i < len); i++) {
    _$jscoverage['/base/attr.js'].lineData[472]++;
    if (visit75_472_1(elems[i].hasAttribute(name))) {
      _$jscoverage['/base/attr.js'].lineData[473]++;
      return true;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[476]++;
  return false;
}, 
  val: function(selector, value) {
  _$jscoverage['/base/attr.js'].functionData[20]++;
  _$jscoverage['/base/attr.js'].lineData[488]++;
  var hook, ret, elem, els, i, val;
  _$jscoverage['/base/attr.js'].lineData[491]++;
  if (visit76_491_1(value === undefined)) {
    _$jscoverage['/base/attr.js'].lineData[493]++;
    elem = Dom.get(selector);
    _$jscoverage['/base/attr.js'].lineData[495]++;
    if (visit77_495_1(elem)) {
      _$jscoverage['/base/attr.js'].lineData[496]++;
      hook = visit78_496_1(valHooks[nodeName(elem)] || valHooks[elem.type]);
      _$jscoverage['/base/attr.js'].lineData[498]++;
      if (visit79_498_1(hook && visit80_498_2('get' in hook && visit81_499_1((ret = hook.get(elem, 'value')) !== undefined)))) {
        _$jscoverage['/base/attr.js'].lineData[500]++;
        return ret;
      }
      _$jscoverage['/base/attr.js'].lineData[503]++;
      ret = elem.value;
      _$jscoverage['/base/attr.js'].lineData[505]++;
      return visit82_505_1(typeof ret === 'string') ? ret.replace(R_RETURN, '') : visit83_509_1(ret == null) ? '' : ret;
    }
    _$jscoverage['/base/attr.js'].lineData[512]++;
    return undefined;
  }
  _$jscoverage['/base/attr.js'].lineData[515]++;
  els = Dom.query(selector);
  _$jscoverage['/base/attr.js'].lineData[516]++;
  for (i = els.length - 1; visit84_516_1(i >= 0); i--) {
    _$jscoverage['/base/attr.js'].lineData[517]++;
    elem = els[i];
    _$jscoverage['/base/attr.js'].lineData[518]++;
    if (visit85_518_1(elem.nodeType !== 1)) {
      _$jscoverage['/base/attr.js'].lineData[519]++;
      return undefined;
    }
    _$jscoverage['/base/attr.js'].lineData[522]++;
    val = value;
    _$jscoverage['/base/attr.js'].lineData[525]++;
    if (visit86_525_1(val == null)) {
      _$jscoverage['/base/attr.js'].lineData[526]++;
      val = '';
    } else {
      _$jscoverage['/base/attr.js'].lineData[527]++;
      if (visit87_527_1(typeof val === 'number')) {
        _$jscoverage['/base/attr.js'].lineData[528]++;
        val += '';
      } else {
        _$jscoverage['/base/attr.js'].lineData[529]++;
        if (visit88_529_1(S.isArray(val))) {
          _$jscoverage['/base/attr.js'].lineData[530]++;
          val = S.map(val, function(value) {
  _$jscoverage['/base/attr.js'].functionData[21]++;
  _$jscoverage['/base/attr.js'].lineData[531]++;
  return visit89_531_1(value == null) ? '' : value + '';
});
        }
      }
    }
    _$jscoverage['/base/attr.js'].lineData[535]++;
    hook = visit90_535_1(valHooks[nodeName(elem)] || valHooks[elem.type]);
    _$jscoverage['/base/attr.js'].lineData[538]++;
    if (visit91_538_1(!hook || visit92_538_2(!('set' in hook) || visit93_538_3(hook.set(elem, val, 'value') === undefined)))) {
      _$jscoverage['/base/attr.js'].lineData[539]++;
      elem.value = val;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[542]++;
  return undefined;
}, 
  text: function(selector, val) {
  _$jscoverage['/base/attr.js'].functionData[22]++;
  _$jscoverage['/base/attr.js'].lineData[554]++;
  var el, els, i, nodeType;
  _$jscoverage['/base/attr.js'].lineData[556]++;
  if (visit94_556_1(val === undefined)) {
    _$jscoverage['/base/attr.js'].lineData[558]++;
    el = Dom.get(selector);
    _$jscoverage['/base/attr.js'].lineData[559]++;
    return Dom._getText(el);
  } else {
    _$jscoverage['/base/attr.js'].lineData[561]++;
    els = Dom.query(selector);
    _$jscoverage['/base/attr.js'].lineData[562]++;
    for (i = els.length - 1; visit95_562_1(i >= 0); i--) {
      _$jscoverage['/base/attr.js'].lineData[563]++;
      el = els[i];
      _$jscoverage['/base/attr.js'].lineData[564]++;
      nodeType = el.nodeType;
      _$jscoverage['/base/attr.js'].lineData[565]++;
      if (visit96_565_1(nodeType == NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/attr.js'].lineData[566]++;
        Dom.cleanData(el.getElementsByTagName('*'));
        _$jscoverage['/base/attr.js'].lineData[567]++;
        if (visit97_567_1('textContent' in el)) {
          _$jscoverage['/base/attr.js'].lineData[568]++;
          el.textContent = val;
        } else {
          _$jscoverage['/base/attr.js'].lineData[570]++;
          el.innerText = val;
        }
      } else {
        _$jscoverage['/base/attr.js'].lineData[573]++;
        if (visit98_573_1(visit99_573_2(nodeType == NodeType.TEXT_NODE) || visit100_573_3(nodeType == NodeType.CDATA_SECTION_NODE))) {
          _$jscoverage['/base/attr.js'].lineData[574]++;
          el.nodeValue = val;
        }
      }
    }
  }
  _$jscoverage['/base/attr.js'].lineData[578]++;
  return undefined;
}, 
  _getText: function(el) {
  _$jscoverage['/base/attr.js'].functionData[23]++;
  _$jscoverage['/base/attr.js'].lineData[582]++;
  return el.textContent;
}});
  _$jscoverage['/base/attr.js'].lineData[586]++;
  return Dom;
}, {
  requires: ['./api']});
