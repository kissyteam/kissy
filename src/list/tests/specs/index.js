/**
 * Tc For KISSY Menu.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, List) {

  var $ = S.all,
    KeyCode = S.Node.KeyCode,
    items = [{text:'选项1',value:'a'},{text:'选项2',value:'b'},{text:'选项3',value:'c'},{text:"数字值",value:3}];


  describe('list inital',function(){

    var node = S.one('<section></section>').appendTo('body'),
      list = new List({
        render : node,
        idField : 'value',
        itemTpl : '<li id="l-{value}">{text}</li>',
        items : S.clone(items)
      });
    list.render();
    var el = list.get('el');
    it('test list',function(){
      expect(el).not.toBe(undefined);
      expect(el).not.toBe(null);
      expect(!!el.one('ul')).toBe(true);
    });

    it('test items',function(){
      expect(el.one('ul').all('li').length).toBe(items.length);
    });
    it('test item tpl',function(){
      S.each(items,function(item){
        expect(el.one('#l-' + item.value)).not.toBe(null);
      });
    });
    
  });


  describe('list item tplRender',function(){
    var node = S.one('<section></section>').appendTo('body'),
      list = new List({
        render : node,
        itemTplRender : function(item){
          if(item.value == 'a'){
            return '<li id="l2-a"><span style="color:red">'+item.value+'</span>' + item.text + '</li>'
          }else{
            return '<li>' + item.text + '</li>'
          }
        },
        items : S.clone(items)
      });
    list.render();
    var el = list.get('el');
    it('test item render',function(){
      expect(el.all('#l2-a').length).toBe(1);
    });
  });

  describe('list method',function(){
    var node = S.one('<section></section>').appendTo('body'),
      list = new List({
        render : node,
        idField : 'value',
        items : S.clone(items)
      });
    list.render();
    var el = list.get('el');
    describe('test method for find item',function(){

      it('find item by id',function(){
        var value = 'a'
          item = list.getItem(value);
        expect(item).not.toBe(null);
        expect(item.value).toBe(value);

        var value = 3,
          item = list.getItem(value);
        expect(item).not.toBe(null);
        expect(item.value).toBe(value);
      });

      it('find first',function(){
        var fistItem = items[0];
        expect(fistItem.value).toBe(list.getFirstItem().value);
      });
      it('find last',function(){
        var lastItem = items[items.length - 1];
        expect(lastItem.value).toBe(list.getLastItem().value);
      });
      it('find by index',function(){
        var index = 2;
        expect(items[index].value).toBe(list.getItemAt(index).value);
      });

      it('find by field and value',function(){
        var index = 3,
          field = 'text',
          value = items[index].text;
        expect(items[index].value).toBe(list.findItemByField(field,value).value);
      });

      it('get item text',function(){
        var index = 3,
          text = items[index].text,
          item = list.getItemAt(index);
        expect(item.text).toBe(text);
        expect(list.getItemText(item)).toBe(text);
      });

      it('find element',function(){
        var index = 3,
          text = items[index].text,
          item = list.getItemAt(index),
          element = list.findElement(item);
        expect($(element).text()).toBe(text);
      });
    });

    describe('test item single selection',function(){

      it('select one item',function(){
        var item = list.getFirstItem(),
          element = list.findElement(item);
        list.setSelected(item);
        expect($(element).hasClass('ks-list-item-selected')).toBe(true);
        expect(list.hasStatus(item,'selected')).toBe(true);
        expect(list.isItemSelected(item)).toBe(true);
      });

      it('select other item',function(){
        var item = list.getLastItem(),
          first = list.getFirstItem();
        list.setSelected(item);
        expect(list.hasStatus(item,'selected')).toBe(true);
         expect(list.hasStatus(first,'selected')).toBe(false);
      });

      it('get selected item',function(){
        expect(list.getSelected()).toBe(list.getLastItem());
      });

      it('remove selected status',function(){
        var item = list.getLastItem();
        list.setItemStatus(item,'selected',false);
        expect(list.hasStatus(item,'selected')).toBe(false);
        expect(list.isItemSelected(item)).toBe(false);
      });

      it('clear selected status',function(){
        var item = list.getFirstItem();
        list.setSelected(item);
        expect(list.getSelected()).not.toBe(null);
        list.clearSelection();
        expect(list.getSelected()).toBe(null);
      });

      it('click item',function(){
        var item = list.getFirstItem(),
          element = list.findElement(item);
        $(element).fire('click');
        waits(100);
        runs(function(){
          expect(list.getSelected()).toBe(item);
        });

      });
    });

    describe('test item multiple selection',function(){

      it('select one item',function(){
        list.clearSelection();
        list.set('multipleSelect',true);

        var item = list.getFirstItem(),
          element = list.findElement(item);
        list.setSelected(item);
        expect($(element).hasClass('ks-list-item-selected')).toBe(true);
        expect(list.hasStatus(item,'selected')).toBe(true);
        expect(list.isItemSelected(item)).toBe(true);
      });

      it('select other item',function(){
        var item = list.getLastItem(),
          first = list.getFirstItem();
        list.setSelected(item);
        expect(list.hasStatus(item,'selected')).toBe(true);
         expect(list.hasStatus(first,'selected')).toBe(true);
      });

      it('get selected items',function(){
        expect(list.getSelected()).toBe(list.getFirstItem());
        expect(list.getSelection().length).toBe(2);
      });

      it('remove selected status',function(){
        var item = list.getLastItem();
        list.setItemStatus(item,'selected',false);
        expect(list.hasStatus(item,'selected')).toBe(false);
        expect(list.isItemSelected(item)).toBe(false);
        expect(list.getSelection().length).toBe(1);
      });

      it('select all',function(){
        list.setAllSelection();
        expect(list.getSelection().length).toBe(list.getCount());
      });

      it('clear selected status',function(){
        list.clearSelection();
        expect(list.getSelection().length).toBe(0);
      });

      it('click item',function(){
        var item = list.getFirstItem(),
          element = list.findElement(item);

        $(element).fire('click');
        expect(list.hasStatus(item,'selected')).toBe(true);
      });
      it('click other',function(){
        var item = list.getLastItem(),
         element = list.findElement(item);

        $(element).fire('click');
        expect(list.hasStatus(item,'selected')).toBe(true);
        expect(list.getSelection().length).toBe(2);
      });
      it('click again',function(){
        var item = list.getFirstItem(),
          element = list.findElement(item);

        $(element).fire('click');
        expect(list.hasStatus(item,'selected')).toBe(false);
      });
    });

    describe('test add,remove,update',function(){
      var items1 = [{text:'选项1',value:'a'},{text:'选项2',value:'b'}];

      it('reset items',function(){
        list.set('items',items1);
        expect(list.getCount()).toBe(items1.length);
      });

      it('test add item',function(){
        var count = list.getCount(),
          obj = {text : '3',value : '3'};
        list.addItem(obj);
        expect(list.getCount()).toBe(count + 1);
        expect(list.getItem('3')).not.toBe(null);
      });

      it('test remove item',function(){
        var item = list.getItem('3'),
          count = list.getCount();
        list.removeItem(item);
        expect(list.getCount()).toBe(count - 1);
        expect(list.getItem('3')).toBe(null);
      });

      it('test add item at',function(){
        var obj = {value : '3',text : '3'};

        list.addItemAt(obj,0);
        expect(list.getFirstItem()).toBe(obj);

        obj = {value : '4',text : '4'};
        list.addItemAt(obj,1);
        expect(list.getItemAt(1)).toBe(obj);

      });

      it('test remove items',function(){
        var items = [],
          count = list.getCount();
        items.push(list.getItemAt(0));
        items.push(list.getLastItem());
        list.removeItems(items);
        expect(list.getCount()).toBe(count - 2);
      });

      it('test add items',function(){
        var items2 = [{value : '7',text : '7'},{value : '8',text : '8'}],
          count = list.getCount();
        list.addItems(items2);
        expect(list.getCount()).toBe(count + items2.length);
      });

      it('test update item',function(){
        var item = list.getFirstItem(),
          text = 'new text';
        item.text = text;
        list.updateItem(item);
        expect(list.getItemText(item)).toBe(text);
      });
    });
    
  });


  describe('list status',function(){
    var items = [
        {id : 'active',text : 'active',active : true},
        {id : 'selected',text : 'selected',selected : true},
        {id : 'disabled',text : 'disabled',disabled : true},
        {id:'checked',text : 'checked and disabled',checked:true, disabled:true },
        {id : 'undefine',text : 'undefine status',undefine : true},
        {id : 'no',text : 'no status',undefine : true}
      ],
      node = S.one('<section></section>').appendTo('body'),
      list = new List({
        render : node,
        itemStatusFields : {
          active : 'active',
          selected : 'selected',
          disabled : 'disabled',
          active : 'active'
        },
        items : items
      });
    list.render();
    describe('test list inital status',function(){

      it('test acitve status css',function(){
        var status = 'active'
          item = list.getItem(status),
          element = list.findElement(item);
        expect(list.hasStatus(item,status)).toBe(true);
        expect($(element).hasClass('ks-list-item-' + status)).toBe(true);
      });

      it('test selected status css',function(){
        var status = 'selected'
          item = list.getItem(status),
          element = list.findElement(item);
        expect(list.hasStatus(item,status)).toBe(true);
        expect($(element).hasClass('ks-list-item-' + status)).toBe(true);
      });

      it('test undefine status css',function(){
        var status = 'undefine'
          item = list.getItem(status),
          element = list.findElement(item);
        expect(list.hasStatus(item,status)).toBe(false);
        expect($(element).hasClass('ks-list-item-' + status)).toBe(false);
      });

      it('test multiple status',function(){
        var status = 'checked'
          item = list.getItem(status),
          element = list.findElement(item);
        expect(list.hasStatus(item,status)).toBe(false);
        expect($(element).hasClass('ks-list-item-' + status)).toBe(false);

        expect(list.hasStatus(item,'disabled')).toBe(true);

      });

      it('find items by status',function(){
        expect(list.getItemsByStatus('active').length).toBe(1);
        expect(list.getItemsByStatus('undefine').length).toBe(0);
        expect(list.getItemsByStatus('disabled').length).toBe(2);
        expect(list.getItemsByStatus('checked').length).toBe(0);
      });
    });

    describe('test change status',function(){

      it('add one status',function(){
        var item = list.getItem('no'),
          element = list.findElement(item);
        expect(list.hasStatus(item,'active')).toBe(false);
        list.setItemStatus(item,'active',true);
        expect(list.hasStatus(item,'active')).toBe(true);
        expect($(element).hasClass('ks-list-item-active')).toBe(true);

      });
      it('remove one status',function(){
        var item = list.getItem('no'),
          element = list.findElement(item);
        expect(list.hasStatus(item,'active')).toBe(true);
        list.setItemStatus(item,'active',false);
        expect(list.hasStatus(item,'active')).toBe(false);
        expect($(element).hasClass('ks-list-item-active')).toBe(false);
      });
      it('sync status and item',function(){
        var item = list.getItem('active');
        expect(item.active).toBe(true);
        list.setItemStatus(item,'active',false);
        expect(item.active).toBe(false);
      });

      it('test event of  statuschange',function(){

      });

      it('add to item "disabled" status',function(){
        var item = list.getFirstItem();
        list.setItemStatus(item,'disabled',true);
        expect(list.hasStatus(item,'disabled')).toBe(true);
        expect(item.disabled).toBe(true);
      });

      it('"disabled" prevent other status',function(){
        var item = list.getFirstItem();
        list.setItemStatus(item,'active',true);
        expect(list.hasStatus(item,'active')).toBe(false);
        expect(item.active).toBe(false);
        expect(item.disabled).toBe(true);

        list.setItemStatus(item,'disabled',false);
        expect(item.disabled).toBe(false);
      });

      it('"disabled" clear "selected" status',function(){
        var item = list.getItem('selected');
        list.setItemDisabled(item,true);
        expect(list.hasStatus(item,'disabled')).toBe(true);
        expect(list.hasStatus(item,'selected')).toBe(false);
       // expect(item.selected).toBe(false);
      });

      it('add item width status',function(){
        var obj = {id : 'new',text : 'new active',active : true};
        list.addItem(obj);
        expect(list.hasStatus(obj,'active')).toBe(true);
      });

      it('update item status',function(){
        var item = list.getItem('new');
        item.active = false;
        list.updateItem(item);
        expect(list.hasStatus(item,'active')).toBe(false);
      });

    });
  });
  
  describe('list event',function(){
    var node = S.one('<section></section>').appendTo('body'),
      list = new List({
        render : node,
        idField : 'value',
        items : S.clone(items)
      });
    list.render();

    it('test "itemrendered"',function(){
      var callback = jasmine.createSpy();
      list.on('itemrendered',callback);
      list.addItem({value : 'add',text : 'add item'});
      waits(100);
      runs(function(){
        expect(callback).toHaveBeenCalled();
        list.detach('itemrendered',callback);
      });
    });

    it('test "itemremoved"',function(){
      var callback = jasmine.createSpy(),
        item = list.getItem('add');
      list.on('itemremoved',callback);
      list.removeItem(item);
      waits(100);
      runs(function(){
        expect(callback).toHaveBeenCalled();
        list.detach('itemremoved',callback);
      });
    });

    it('test "itemupdated"',function(){
      var callback = jasmine.createSpy(),
        item = list.getFirstItem();
      item.text = 'update text';
      list.on('itemupdated',callback);
      list.updateItem(item);
      waits(100);
      runs(function(){
        expect(callback).toHaveBeenCalled();
        list.detach('itemupdated',callback);
      });
    });

    it('test status change',function(){
      var item = list.getLastItem(),
        callback = jasmine.createSpy();
     
      list.on('itemstatuschange',callback);
      list.setItemStatus(item,'active',true);
      waits(100);
      runs(function(){
        expect(callback).toHaveBeenCalled();
        list.detach('itemstatuschange',callback);
      });

    });

    it('test selected events,"itemselected"',function(){
      var item = list.getLastItem(),
        callback = jasmine.createSpy(),
        change = jasmine.createSpy();
      list.on('itemselected',callback);
      list.on('selectedchange',change);
      list.setSelected(item);
      
      waits(100);
      runs(function(){
        expect(callback).toHaveBeenCalled();
        expect(change).toHaveBeenCalled();
        list.detach('itemselected',callback);
        list.detach('selectedchange',change);
      });
    });

    it('test selected events,"itemunselected"',function(){
      var item = list.getFirstItem(),
        change = jasmine.createSpy(),
        callback = jasmine.createSpy();
      list.on('itemunselected',callback);
      list.on('selectedchange',change);
      list.setSelected(item);
      
      waits(100);
      runs(function(){
        expect(callback).toHaveBeenCalled();
        expect(change).toHaveBeenCalled();
        list.detach('itemunselected',callback);
        list.detach('selectedchange',change);
      });
    });
    it('test itemclick event',function(){
      var item = list.getLastItem(),
        element = list.findElement(item),
        change = jasmine.createSpy(),
        callback = jasmine.createSpy();
      list.on('itemclick',callback);
      list.on('selectedchange',change);
      $(element).fire('click');
      waits(100);
      runs(function(){
        expect(callback).toHaveBeenCalled();
        expect(change).toHaveBeenCalled();
        list.detach('itemclick',callback);
        list.detach('selectedchange',change);
      });
    });
    it('test itemdbclick event',function(){

    });
    it('when multiple model,test selected event',function(){
      list.set('multipleSelect',true);
      var item = list.getLastItem(),
        element = list.findElement(item),
        change = jasmine.createSpy(),
        callback = jasmine.createSpy();
      list.on('itemclick',callback);
      list.on('selectedchange',change);
      $(element).fire('click');
      waits(100);
      runs(function(){
        expect(callback).toHaveBeenCalled();
        expect(change).toHaveBeenCalled();
        list.detach('itemclick',callback);
        list.detach('selectedchange',change);
      });
    });
  });

  describe('list srcNode',function(){
    var node = S.one('<section class="ks-list"><ul><li class="item item-active" data-id="1">1</li><li  class="item" data-id="2">2</li><li  class="item" data-id="3">3</li><li class="item" data-id="4">4</li></ul></section>').appendTo('body'),
      list = new List({
        srcNode : node,
        itemStatusFields : {
          active : 'active'
        },
        itemCls : 'item'
      });
    list.render();

    it('test items',function(){
      expect(list.getCount()).toBe(node.all('.item').length);
    });

    it('test item status',function(){
      var item = list.getItem('1');
      expect(list.hasStatus(item,'active')).toBe(true);
      expect(item.active).toBe(true);
    });
  });

  describe('list key navigation',function(){

    describe('single column',function(){
      var node = S.one('<section></section>').appendTo('body'),
        list = new List({
          render : node,
          idField : 'value',
          items : S.clone(items)
        });
      list.render();

      describe('no item highlighted',function(){

        it('get left item',function(){
          expect(list._getLeftItem()).toBe(null);
        });
        it('get right item',function(){
          expect(list._getRightItem()).toBe(null);
        });
        it('get down item',function(){
          var item = list._getDownItem();
          expect(item).toBe(list.getFirstItem());
        });
        it('get up item',function(){
          var item = list._getUpperItem();
          expect(item).toBe(list.getLastItem());
        });
      });
      var el = list.get('el');
      it('test key left',function(){
        list.set('focused',true);
        jasmine.simulate(el[0],'keydown',{charCode : KeyCode.LEFT});
        waits(100);
        runs(function(){
          expect(list.getHighlighted()).toBe(null);
        });
      });
      it('test key right',function(){
        jasmine.simulate(el[0],'keydown',{charCode : KeyCode.RIGHT});
        waits(100);
        runs(function(){
          expect(list.getHighlighted()).toBe(null);
        });
      });
      it('test key down',function(){
        jasmine.simulate(el[0],'keydown',{charCode : KeyCode.DOWN});
        waits(100);
        runs(function(){
          expect(list.getHighlighted()).toBe(list.getFirstItem());
        });
      });
      it('test key up',function(){
        jasmine.simulate(el[0],'keydown',{charCode : KeyCode.UP});
        waits(100);
        runs(function(){
          expect(list.getHighlighted()).toBe(list.getLastItem());
        });
      });
      it('test key enter',function(){
  
        jasmine.simulate(el[0],'keydown',{charCode : KeyCode.ENTER});
        waits(100);
        runs(function(){
          expect(list.getSelected()).toBe(list.getLastItem());
        });
      });
    });
    describe('multiple columns',function(){

      var items = [{id : '1',text : '1'},{id : '2',text : '2'},{id : '3',text : '3'},{id : '4',text : '4'},{id : '5',text : '5'},{id : '6',text : '6'},{id : '7',text : '7'}],
        node = S.one('<section></section>').appendTo('body'),
        list = new List({
          render : node,
          elCls : 'column-2',
          items :items
        });
      list.render();
      var el = list.get('el');
      describe('no item highlighted',function(){

        it('get left item',function(){
          list.set('focused',true);
          expect(list._getLeftItem()).toBe(list.getLastItem());
        });
        it('get right item',function(){
          expect(list._getRightItem()).toBe(list.getFirstItem());
        });
        it('get down item',function(){
          var item = list._getDownItem();
          expect(item).toBe(list.getFirstItem());
        });
        it('get up item',function(){
          var item = list._getUpperItem();
          expect(item).toBe(list.getLastItem());
        });
      });

      it('test key down',function(){
        jasmine.simulate(el[0],'keydown',{charCode : KeyCode.DOWN});
        waits(100);
        runs(function(){
          expect(list.getHighlighted()).toBe(list.getFirstItem());
        });
      });

      it('test key up',function(){
        jasmine.simulate(el[0],'keydown',{charCode : KeyCode.UP});
        waits(100);
        runs(function(){
          expect(list.getHighlighted()).toBe(list.getLastItem());
        });
      });

      it('test key left',function(){
        var item = list.getHighlighted(),
          index = list.indexOfItem(item);
        jasmine.simulate(el[0],'keydown',{charCode : KeyCode.LEFT});
        waits(100);
        runs(function(){
          expect(list.getHighlighted()).toBe(list.getItemAt(index - 1));
        });
      });

      it('test key left again',function(){
        var item = list.getHighlighted(),
          index = list.indexOfItem(item);
        jasmine.simulate(el[0],'keydown',{charCode : KeyCode.LEFT});
        waits(100);
        runs(function(){
          expect(list.getHighlighted()).toBe(list.getItemAt(index - 1));
        });
      });

      it('test key right',function(){
        var item = list.getHighlighted(),
          index = list.indexOfItem(item);
        jasmine.simulate(el[0],'keydown',{charCode : KeyCode.RIGHT});
        waits(100);
        runs(function(){
          expect(list.getHighlighted()).toBe(list.getItemAt(index + 1));
        });
        
      });

      it('test key right agin',function(){
        jasmine.simulate(el[0],'keydown',{charCode : KeyCode.RIGHT});
        waits(100);
        runs(function(){
          expect(list.getHighlighted()).toBe(list.getLastItem());
        });
      });


      it('test key enter',function(){
        jasmine.simulate(el[0],'keydown',{charCode : KeyCode.ENTER});
        waits(100);
        runs(function(){
          expect(list.getSelected()).toBe(list.getLastItem());
        });
      });

      it('test key tab',function(){
        jasmine.simulate(el[0],'keydown',{charCode : KeyCode.TAB});
        waits(100);
        runs(function(){
          expect(list.getHighlighted()).toBe(list.getFirstItem());
        });
      });

      it('test key down',function(){
        var item = list.getItem('5');
        list.setHighlighted(item);
        expect(list.getHighlighted()).toBe(item);

        jasmine.simulate(el[0],'keydown',{charCode : KeyCode.DOWN});
        waits(100);
        runs(function(){
          expect(list.getHighlighted()).toBe(list.getItemAt(1));
        });
      });
    })
    describe('when key nav,selected change',function(){
      var items = [{id : '1',text : '1'},{id : '2',text : '2'},{id : '3',text : '3'},{id : '4',text : '4'},{id : '5',text : '5'},{id : '6',text : '6'},{id : '7',text : '7'}],
        node = S.one('<section></section>').appendTo('body'),
        list = new List({
          render : node,
          elCls : 'column-2',
          highlightedStatus : 'selected',
          items :items
        });
      list.render();
      var el = list.get('el');
      it('test key down',function(){
        jasmine.simulate(el[0],'keydown',{charCode : KeyCode.DOWN});
        waits(100);
        runs(function(){
          expect(list.getSelected()).toBe(list.getFirstItem());
        });
      });

      it('test key up',function(){
        jasmine.simulate(el[0],'keydown',{charCode : KeyCode.UP});
        waits(100);
        runs(function(){
          expect(list.getSelected()).toBe(list.getLastItem());
        });
      });

      it('test key left',function(){
        var item = list.getSelected(),
          index = list.indexOfItem(item);
        jasmine.simulate(el[0],'keydown',{charCode : KeyCode.LEFT});
        waits(100);
        runs(function(){
          expect(list.getSelected()).toBe(list.getItemAt(index - 1));
        });
      });

      it('test key left again',function(){
        var item = list.getSelected(),
          index = list.indexOfItem(item);
        jasmine.simulate(el[0],'keydown',{charCode : KeyCode.LEFT});
        waits(100);
        runs(function(){
          expect(list.getSelected()).toBe(list.getItemAt(index - 1));
        });
      });

      it('test key right',function(){
        var item = list.getSelected(),
          index = list.indexOfItem(item);
        jasmine.simulate(el[0],'keydown',{charCode : KeyCode.RIGHT});
        waits(100);
        runs(function(){
          expect(list.getSelected()).toBe(list.getItemAt(index + 1));
        });
        
      });

      it('test key right agin',function(){
        jasmine.simulate(el[0],'keydown',{charCode : KeyCode.RIGHT});
        waits(100);
        runs(function(){
          expect(list.getSelected()).toBe(list.getLastItem());
        });
      });

      it('test key tab',function(){
        jasmine.simulate(el[0],'keydown',{charCode : KeyCode.TAB});
        waits(100);
        runs(function(){
          expect(list.getSelected()).toBe(list.getFirstItem());
        });
      });
    });
  });
  /**/
},{
  requires:['list']
});
