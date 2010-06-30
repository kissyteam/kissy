package {
	import com.xintend.trine.ajbridge.AJBridge;
	import flash.display.Sprite;
	import flash.events.Event;
	import org.flashdevelop.utils.FlashConnect;
	
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
			
			
			var callbacks: Object = {
										onSend:onSend
									};
									
			AJBridge.init(stage);
			AJBridge.addCallbacks(callbacks);
			AJBridge.ready();
		}
		
		private function onSend(...args):void{
			FlashConnect.atrace.apply(this, args);
		}
		
	}
	
}