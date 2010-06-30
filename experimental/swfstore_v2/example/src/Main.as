package {
	import com.xintend.trine.swfstore.SWFStore;
	import flash.display.Sprite;
	import flash.events.Event;
	
	/**
	 * ...
	 * @author Kingfo[Telds longzang]
	 */
	public class Main extends Sprite {
		
		public function Main():void {
			if (stage) init();
			else addEventListener(Event.ADDED_TO_STAGE, init);
		}
		
		private function init(e:Event = null):void {
			removeEventListener(Event.ADDED_TO_STAGE, init);
			// entry point
			
			addChild(new SWFStore())
			
		}
		
	}
	
}