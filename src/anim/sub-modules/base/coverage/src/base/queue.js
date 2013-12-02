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
if (! _$jscoverage['/base/queue.js']) {
  _$jscoverage['/base/queue.js'] = {};
  _$jscoverage['/base/queue.js'].lineData = [];
  _$jscoverage['/base/queue.js'].lineData[5] = 0;
  _$jscoverage['/base/queue.js'].lineData[6] = 0;
  _$jscoverage['/base/queue.js'].lineData[7] = 0;
  _$jscoverage['/base/queue.js'].lineData[13] = 0;
  _$jscoverage['/base/queue.js'].lineData[14] = 0;
  _$jscoverage['/base/queue.js'].lineData[16] = 0;
  _$jscoverage['/base/queue.js'].lineData[19] = 0;
  _$jscoverage['/base/queue.js'].lineData[20] = 0;
  _$jscoverage['/base/queue.js'].lineData[23] = 0;
  _$jscoverage['/base/queue.js'].lineData[24] = 0;
  _$jscoverage['/base/queue.js'].lineData[25] = 0;
  _$jscoverage['/base/queue.js'].lineData[26] = 0;
  _$jscoverage['/base/queue.js'].lineData[30] = 0;
  _$jscoverage['/base/queue.js'].lineData[33] = 0;
  _$jscoverage['/base/queue.js'].lineData[37] = 0;
  _$jscoverage['/base/queue.js'].lineData[38] = 0;
  _$jscoverage['/base/queue.js'].lineData[39] = 0;
  _$jscoverage['/base/queue.js'].lineData[43] = 0;
  _$jscoverage['/base/queue.js'].lineData[45] = 0;
  _$jscoverage['/base/queue.js'].lineData[46] = 0;
  _$jscoverage['/base/queue.js'].lineData[47] = 0;
  _$jscoverage['/base/queue.js'].lineData[48] = 0;
  _$jscoverage['/base/queue.js'].lineData[51] = 0;
  _$jscoverage['/base/queue.js'].lineData[53] = 0;
  _$jscoverage['/base/queue.js'].lineData[55] = 0;
  _$jscoverage['/base/queue.js'].lineData[59] = 0;
  _$jscoverage['/base/queue.js'].lineData[63] = 0;
  _$jscoverage['/base/queue.js'].lineData[64] = 0;
  _$jscoverage['/base/queue.js'].lineData[65] = 0;
  _$jscoverage['/base/queue.js'].lineData[66] = 0;
  _$jscoverage['/base/queue.js'].lineData[68] = 0;
  _$jscoverage['/base/queue.js'].lineData[69] = 0;
  _$jscoverage['/base/queue.js'].lineData[74] = 0;
  _$jscoverage['/base/queue.js'].lineData[75] = 0;
  _$jscoverage['/base/queue.js'].lineData[76] = 0;
  _$jscoverage['/base/queue.js'].lineData[77] = 0;
  _$jscoverage['/base/queue.js'].lineData[79] = 0;
  _$jscoverage['/base/queue.js'].lineData[82] = 0;
  _$jscoverage['/base/queue.js'].lineData[86] = 0;
}
if (! _$jscoverage['/base/queue.js'].functionData) {
  _$jscoverage['/base/queue.js'].functionData = [];
  _$jscoverage['/base/queue.js'].functionData[0] = 0;
  _$jscoverage['/base/queue.js'].functionData[1] = 0;
  _$jscoverage['/base/queue.js'].functionData[2] = 0;
  _$jscoverage['/base/queue.js'].functionData[3] = 0;
  _$jscoverage['/base/queue.js'].functionData[4] = 0;
  _$jscoverage['/base/queue.js'].functionData[5] = 0;
  _$jscoverage['/base/queue.js'].functionData[6] = 0;
}
if (! _$jscoverage['/base/queue.js'].branchData) {
  _$jscoverage['/base/queue.js'].branchData = {};
  _$jscoverage['/base/queue.js'].branchData['14'] = [];
  _$jscoverage['/base/queue.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['19'] = [];
  _$jscoverage['/base/queue.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['23'] = [];
  _$jscoverage['/base/queue.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['25'] = [];
  _$jscoverage['/base/queue.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['45'] = [];
  _$jscoverage['/base/queue.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['47'] = [];
  _$jscoverage['/base/queue.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['51'] = [];
  _$jscoverage['/base/queue.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['63'] = [];
  _$jscoverage['/base/queue.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['65'] = [];
  _$jscoverage['/base/queue.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['68'] = [];
  _$jscoverage['/base/queue.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['75'] = [];
  _$jscoverage['/base/queue.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['77'] = [];
  _$jscoverage['/base/queue.js'].branchData['77'][1] = new BranchData();
}
_$jscoverage['/base/queue.js'].branchData['77'][1].init(49, 10, '!qu.length');
function visit12_77_1(result) {
  _$jscoverage['/base/queue.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['75'][1].init(64, 2, 'qu');
function visit11_75_1(result) {
  _$jscoverage['/base/queue.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['68'][1].init(213, 29, 'S.isEmptyObject(quCollection)');
function visit10_68_1(result) {
  _$jscoverage['/base/queue.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['65'][1].init(123, 12, 'quCollection');
function visit9_65_1(result) {
  _$jscoverage['/base/queue.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['63'][1].init(21, 17, 'queue || queueKey');
function visit8_63_1(result) {
  _$jscoverage['/base/queue.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['51'][1].init(261, 16, 'qu && !qu.length');
function visit7_51_1(result) {
  _$jscoverage['/base/queue.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['47'][1].init(66, 10, 'index > -1');
function visit6_47_1(result) {
  _$jscoverage['/base/queue.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['45'][1].init(87, 2, 'qu');
function visit5_45_1(result) {
  _$jscoverage['/base/queue.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['25'][1].init(54, 16, '!qu && !readOnly');
function visit4_25_1(result) {
  _$jscoverage['/base/queue.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['23'][1].init(247, 12, 'quCollection');
function visit3_23_1(result) {
  _$jscoverage['/base/queue.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['19'][1].init(127, 26, '!quCollection && !readOnly');
function visit2_19_1(result) {
  _$jscoverage['/base/queue.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['14'][1].init(16, 16, 'name || queueKey');
function visit1_14_1(result) {
  _$jscoverage['/base/queue.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/queue.js'].functionData[0]++;
  _$jscoverage['/base/queue.js'].lineData[6]++;
  var Dom = require('dom');
  _$jscoverage['/base/queue.js'].lineData[7]++;
  var queueCollectionKey = S.guid('ks-queue-' + S.now() + '-'), queueKey = S.guid('ks-queue-' + S.now() + '-'), Q;
  _$jscoverage['/base/queue.js'].lineData[13]++;
  function getQueue(node, name, readOnly) {
    _$jscoverage['/base/queue.js'].functionData[1]++;
    _$jscoverage['/base/queue.js'].lineData[14]++;
    name = visit1_14_1(name || queueKey);
    _$jscoverage['/base/queue.js'].lineData[16]++;
    var qu, quCollection = Dom.data(node, queueCollectionKey);
    _$jscoverage['/base/queue.js'].lineData[19]++;
    if (visit2_19_1(!quCollection && !readOnly)) {
      _$jscoverage['/base/queue.js'].lineData[20]++;
      Dom.data(node, queueCollectionKey, quCollection = {});
    }
    _$jscoverage['/base/queue.js'].lineData[23]++;
    if (visit3_23_1(quCollection)) {
      _$jscoverage['/base/queue.js'].lineData[24]++;
      qu = quCollection[name];
      _$jscoverage['/base/queue.js'].lineData[25]++;
      if (visit4_25_1(!qu && !readOnly)) {
        _$jscoverage['/base/queue.js'].lineData[26]++;
        qu = quCollection[name] = [];
      }
    }
    _$jscoverage['/base/queue.js'].lineData[30]++;
    return qu;
  }
  _$jscoverage['/base/queue.js'].lineData[33]++;
  Q = {
  queueCollectionKey: queueCollectionKey, 
  queue: function(node, queue, item) {
  _$jscoverage['/base/queue.js'].functionData[2]++;
  _$jscoverage['/base/queue.js'].lineData[37]++;
  var qu = getQueue(node, queue);
  _$jscoverage['/base/queue.js'].lineData[38]++;
  qu.push(item);
  _$jscoverage['/base/queue.js'].lineData[39]++;
  return qu;
}, 
  remove: function(node, queue, item) {
  _$jscoverage['/base/queue.js'].functionData[3]++;
  _$jscoverage['/base/queue.js'].lineData[43]++;
  var qu = getQueue(node, queue, 1), index;
  _$jscoverage['/base/queue.js'].lineData[45]++;
  if (visit5_45_1(qu)) {
    _$jscoverage['/base/queue.js'].lineData[46]++;
    index = S.indexOf(item, qu);
    _$jscoverage['/base/queue.js'].lineData[47]++;
    if (visit6_47_1(index > -1)) {
      _$jscoverage['/base/queue.js'].lineData[48]++;
      qu.splice(index, 1);
    }
  }
  _$jscoverage['/base/queue.js'].lineData[51]++;
  if (visit7_51_1(qu && !qu.length)) {
    _$jscoverage['/base/queue.js'].lineData[53]++;
    Q.clearQueue(node, queue);
  }
  _$jscoverage['/base/queue.js'].lineData[55]++;
  return qu;
}, 
  'clearQueues': function(node) {
  _$jscoverage['/base/queue.js'].functionData[4]++;
  _$jscoverage['/base/queue.js'].lineData[59]++;
  Dom.removeData(node, queueCollectionKey);
}, 
  clearQueue: function clearQueue(node, queue) {
  _$jscoverage['/base/queue.js'].functionData[5]++;
  _$jscoverage['/base/queue.js'].lineData[63]++;
  queue = visit8_63_1(queue || queueKey);
  _$jscoverage['/base/queue.js'].lineData[64]++;
  var quCollection = Dom.data(node, queueCollectionKey);
  _$jscoverage['/base/queue.js'].lineData[65]++;
  if (visit9_65_1(quCollection)) {
    _$jscoverage['/base/queue.js'].lineData[66]++;
    delete quCollection[queue];
  }
  _$jscoverage['/base/queue.js'].lineData[68]++;
  if (visit10_68_1(S.isEmptyObject(quCollection))) {
    _$jscoverage['/base/queue.js'].lineData[69]++;
    Dom.removeData(node, queueCollectionKey);
  }
}, 
  dequeue: function(node, queue) {
  _$jscoverage['/base/queue.js'].functionData[6]++;
  _$jscoverage['/base/queue.js'].lineData[74]++;
  var qu = getQueue(node, queue, 1);
  _$jscoverage['/base/queue.js'].lineData[75]++;
  if (visit11_75_1(qu)) {
    _$jscoverage['/base/queue.js'].lineData[76]++;
    qu.shift();
    _$jscoverage['/base/queue.js'].lineData[77]++;
    if (visit12_77_1(!qu.length)) {
      _$jscoverage['/base/queue.js'].lineData[79]++;
      Q.clearQueue(node, queue);
    }
  }
  _$jscoverage['/base/queue.js'].lineData[82]++;
  return qu;
}};
  _$jscoverage['/base/queue.js'].lineData[86]++;
  return Q;
});
