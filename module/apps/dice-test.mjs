export default class DiceTest extends FormApplication {
	constructor(object={}, options={}) {
		super(object, options);

		this.object = {
			roll: new Roll('1d6'),
			foo: 'bar',
		}
		console.log(this);
	}
	
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "dice-test",
			classes: ["tormenta20"],
			title: 'dice-test',
			template: "systems/tormenta20/templates/apps/dice-test.html",
			width: 500,
			height: 500,
			submitOnChange: true
		});
	}

	getData(){
		const formData = super.getData();
		return formData;
	}

	activateListeners(html) {
		html.find('.add-term').click(this.addTerm.bind(this));
		html.find('.del-term').click(this.deleteTerm.bind(this));
	}

	/** @inheritdoc */
	async _updateObject(event, formData) {
		// foundry.utils.mergeObject(this.object, formData);
		console.log(formData);
	}
	
	addTerm(event){
		console.log(event);
		// r.terms.push(new foundry.dice.terms.OperatorTerm({operator:'+'}))
		// r.terms.push(new foundry.dice.terms.Die({number: 4, faces: 8}))
	}

	deleteTerm(event){
		console.log(event);
	}

}
