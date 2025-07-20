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

	console.log(`🧹 Suppression de tous les événements enregistrés :`);
	events.forEach((listener, index) => {
		console.log(`clean ${listener.element}`);
		listener.element.removeEventListener(listener.type, listener.handler);
	});

	events = [];
}
