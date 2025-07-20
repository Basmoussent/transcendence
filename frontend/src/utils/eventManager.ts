interface ActiveListener {
	element: HTMLElement | Element;
	type: string;
	handler: EventListenerOrEventListenerObject;
}

let events: ActiveListener[] = [];

export function addEvent(element: HTMLElement | Element, type: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
	// Vérifier si le listener existe déjà
	if (hasEvent(element, type, handler)) {
		console.log(`⚠️ Event listener déjà existant pour ${type} sur`, element);
		return;
	}
	
	element.addEventListener(type, handler, options);
	events.push({ element, type, handler });
}

export function hasEvent(element: HTMLElement | Element, type: string, handler: EventListenerOrEventListenerObject): boolean {
	return events.some(event => 
		event.element === element && 
		event.type === type && 
		event.handler === handler
	);
}

export function removeEvent(element: HTMLElement | Element, type: string, handler: EventListenerOrEventListenerObject) {
	element.removeEventListener(type, handler);
	events = events.filter(event => 
		!(event.element === element && 
		  event.type === type && 
		  event.handler === handler)
	);
}

export function cleanEvents() {
	console.log(`🧹 Suppression de tous les événements enregistrés : ${events.length} événements`);
	events.forEach((listener, index) => {
		console.log(`clean ${listener.type} sur`, listener.element);
		listener.element.removeEventListener(listener.type, listener.handler);
	});

	events = [];
}
