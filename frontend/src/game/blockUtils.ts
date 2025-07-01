export abstract class brick {

	protected hp: number;
	protected id: number;
	protected type: string;
	protected color: string;

	constructor(_hp:number,_id:number, _type:string, _color:string) {
		this.hp = _hp;
		this.id = _id;
		this.type = _type;
		this.color = _color;
	}

	public beenHit(): void {
		this.hp--;
	}

	public getHp(): number { return (this.hp); }
	public getId(): number { return (this.id); }
	public getType(): string { return (this.type); }
	public getColor(): string { return (this.color); }
	

}

class blue extends brick {
	constructor(_id:number) {
		super(1, _id, "blue", "#00ABE7"); }
}

class green extends brick {
	constructor(_id:number) {
		super(1, _id, "green", "#81D17D"); }
}

class red extends brick {
	constructor(_id:number) {
		super(1, _id, "red", "#FF101F"); }
}

export function	createRandomBrick(it:number): brick {

	const rand = Math.floor(Math.random() * 3);

	if (rand === 0)
		return (new red(it));
	if (rand === 1)
		return (new green(it));
	return (new blue(it));
}
