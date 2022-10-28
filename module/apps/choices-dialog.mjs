export default class ChoicesDialog extends Dialog {
	constructor(item, dialogData={}, options={}) {
		super(dialogData, options);
		this.options.classes = ["tormenta20", "choices-form"];
	}
	
	
	static async create(list = [], source, somefing ) {
		
		/* HELPERS */
		function getInputType(key) {
			switch (key) {
				case 'items':
					return 'select';
					break;
				case 'x':
					return 'checkbox';
					break;
				case 'w':
					return 'radiobox';
					break;
				default:
					return 'input';
					break;
			}
		}
	
		function getOptions( key, type, source ){
			switch (key) {
				case 'items':
					return source.items.filter( i=> i.type == type).map( i => ({label: i.name, value:i.name}) )
					break;
				case 'x':
					return 'checkbox';
					break;
				case 'w':
					return 'radiobox';
					break;
				default:
					return [];
					break;
			}
		}

		// Prepare data
		let choices = [];
		for ( let c of list ){
			choices.push({
				type: getInputType(c.key[1]),
				label: c.label,
				name: `${c.id}.${c.value[0]}`, //aeId.{{key}}
				options: getOptions( c.key[1], c.key[2], source )
			});
		}
		
		// Prepare dialog form data
		const data = {
			parent: source,
			choices: choices,
			errors: []
		};

		// Render the ability usage template
		const html = await renderTemplate("systems/tormenta20/templates/apps/choices-dialog.html", data);
		
		return await new Promise((resolve) => {
			const dlg = new this(source, {
				title: game.i18n.localize('T20.Choices'),
				content: html,
				buttons: {
					ok: {
						label: "OK",
						callback: html => {
							const fd = new FormDataExtended(html[0].querySelector("form"));
							resolve( fd.object );
						}
					}
				},
				default: "ok",
				close: () => resolve(null)
			});
			
			// dlg.options.width = 600;
			// dlg.position.width = 600;
			dlg.render(true);
		});
	}
}