interface ActiveListener {
	element: HTMLElement;
	type: string;
	handler: EventListenerOrEventListenerObject;
}

let events: ActiveListener[] = [];

export function addEvent(element: HTMLElement, type: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
  element.addEventListener(type, handler, options);
  events.push({ element, type, handler });
}

export function cleanEvents() {

	console.log(`on supprime tous les events enregistrés`);
	events.forEach(listener => {
		listener.element.removeEventListener(listener.type, listener.handler);
	});
	
	events = [];
}
