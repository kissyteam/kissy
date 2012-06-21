/**
 * @fileOverview  a specialized paggingbar which use number buttons 
 * @author dxq613@gmail.com
 */
KISSY.add('grid/numberpaggingbar', function (S,Component,PBar,Bar) {

	var NUMBER_CONTAINER = 'numberContainer',
		CLS_ACTIVE = 'ks-active';
	/**
	* specialized pagging bar auto show numberic buttons
	* Paging Toolbar is typically used as one of the Grid's toolbars.
	* @name Number
    * @constructor
    * @extends Grid.PaggingBar
    * @memberOf Grid.PaggingBar
	*/
	var numberPaggingBar = PBar.extend({
		/**
		* get the initial items of pagging bar
		* @protected
		* @override
		*/
		_getItems : function(){
			var _self = this,
				items = _self.get('items'),
				numberContainerBar = null;
			if(items)
			{
				return items;
			}
			//default items
			items = [];

			//previous item
			items.push(_self._getButtonItem(PBar.ID_PREV));

			//the container of number buttons 
			numberContainerBar = new Bar({id : NUMBER_CONTAINER,elCls:'ks-inline-block'});
			items.push(numberContainerBar);
			_self.set(NUMBER_CONTAINER,numberContainerBar);
			//next item
			items.push(_self._getButtonItem(PBar.ID_NEXT));
			//total page of store
			items.push(_self._getTextItem(PBar.ID_TOTAL_PAGE));
			//current page of store
			items.push(_self._getTextItem(PBar.ID_CURRENT_PAGE));
			//button for skip to
			items.push(_self._getButtonItem(PBar.ID_SKIP));
			return items;
		},
		/**
		* bind buttons event
		* @protected
		* @override
		*/
		_bindButtonEvent : function(){
			var _self = this,
				numberContainerBar = _self.get(NUMBER_CONTAINER);
			_self.constructor.superclass._bindButtonEvent.call(this);
			numberContainerBar.get('el').delegate('click','.ks-number-button',function(event){
				var btn = S.one(event.target),
					page = parseInt(btn.text(),10);
				_self.skipToPage(page);
			});
		},
		//设置页码信息，设置 页数 按钮
		_setNumberPages : function(){
			var _self = this;
			_self.constructor.superclass._setNumberPages.call(_self);
			_self._setNumberButtons();

		},
		//设置 页数 按钮
		_setNumberButtons : function(){
			var _self = this,
				numberContainerBar = _self.get(NUMBER_CONTAINER),
				curPage = _self.get('curPage'),
				totalPage = _self.get('totalPage'),
				numberItems = _self._getNumberItems(curPage,totalPage),
				curItem = null;
			numberContainerBar.removeChildren(true);

			S.each(numberItems,function(item){
				numberContainerBar.addChild(_self._createItem(item));
			});
			curItem = numberContainerBar.getItem(curPage);
			if(curItem){
				//curItem.get('el').addClass(CLS_ACTIVE);
				curItem.set('checked',true);
			}
		},
		//获取所有页码按钮的配置项
		_getNumberItems : function(curPage, totalPage){
			var _self = this,
				result = [],
				maxLimitCount = _self.get('maxLimitCount'),
				showRangeCount = _self.get('showRangeCount'),
				maxPage;

			function addNumberItem(from,to){
				for(var i = from ;i<=to;i++){
					result.push(_self._getNumberItem(i));
				}
			}

			function addEllipsis(){
				result.push(_self._getEllipsisItem());
			}

			if(totalPage < maxLimitCount){
				maxPage = totalPage;
				addNumberItem(1,totalPage);
			}else{
				var startNum = (curPage <= maxLimitCount) ? 1 : (curPage - showRangeCount),
                    lastLimit = curPage + showRangeCount,
                    endNum = lastLimit < totalPage ? (lastLimit > maxLimitCount ? lastLimit : maxLimitCount) : totalPage;
                if (startNum > 1) {
                    addNumberItem(1, 1);
					if(startNum > 2){
						addEllipsis();
					}
                }
                maxPage = endNum;
                addNumberItem(startNum, endNum);
			}

			if (maxPage < totalPage) {
				if(maxPage < totalPage -1){
					addEllipsis();
				}
                addNumberItem(totalPage, totalPage);
            }

			return result;
		},
		//获取省略号
		_getEllipsisItem : function(){
			var _self = this;
			return {
				xtype:'text',
				text : _self.get('ellipsisTemplate')
			};
		},
		//生成页面按钮配置项
		_getNumberItem : function(page){
			var _self = this;
			return {
				id : page,
				xtype : 'button',
				text : ''+page+'',
				elCls : _self.get('numberButtonCls')
			};
		}
		
	},{
		ATTRS:{
			/**
			* the text for skip page button
			* @override
			* @default {String} "确定"
			*/
			skipText : {
				value :'确定'
			},
			/**
			* if the number of page is smaller then this value,show all number buttons,else show ellipsis button
			* @default {Number} 4
			*/
			maxLimitCount : {
				value : 4
			},
			/**
			* 
			*/
			showRangeCount : {
				value : 1	
			},
			/**
			* the css used on number button
			*/
			numberButtonCls:{
				value : 'ks-number-button'
			},
			/**
			* the template of ellipsis which represent the omitted pages number
			*/
			ellipsisTemplate : {
				value : '...'
			},
			/**
			* the template of current page info
			* @override
			* @default {String} '到第 <input type="text" autocomplete="off" class="ks-pb-page" size="20" name="inputItem"> 页'
			*/
			curPageTemplate : {
				value : '到第 <input type="text" autocomplete="off" class="ks-pb-page" size="20" name="inputItem"> 页'
			}
		}
	},{
		xclass : 'number-paggingbar',
		priority : 3	
	});


	PBar.Number = numberPaggingBar;
	return numberPaggingBar;
},{
	 requires:['component','./paggingbar','./bar']
});