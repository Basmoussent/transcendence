export abstract class brick {

	protected hp: number;
	protected type: string;
	protected color: string;

	constructor(_hp:number, _type:string, _color:string) {
		this.hp = _hp;
		this.type = _type;
		this.color = _color;
	}

	public getHp(): number { return (this.hp); }
	public getType(): string { return (this.type); }
	public getColor(): string { return (this.color); }

}


class blue extends brick {
	constructor() {
		super(1, "blue", "#91B8D4"); }
}

class green extends brick {
	constructor() {
		super(2, "green", "#7CA982"); }
}

class red extends brick {
	constructor() {
		super(3, "red", "#A3333D"); }
}

export function	createRandomBrick(): brick {

	const rand = Math.floor(Math.random() * 3);

	if (rand === 0)
		return (new red());
	if (rand === 1)
		return (new green());
	return (new blue());
}
