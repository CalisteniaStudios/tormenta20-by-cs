/* TODO REFACTOR THIS */
export class Tormenta20BaseSettings extends FormApplication {
	constructor (object, options = {}) {
		super(object, options)
	}

	
	/**
	 * Default Options for this FormApplication
	 */
	 static get defaultOptions () {
		 return foundry.utils.mergeObject(super.defaultOptions, {
			id : 'tormenta20-settings-form',
			title : 'Configurações',
			template : './systems/tormenta20/templates/apps/settings.html',
			classes : ['sheet'],
			width : 640,
			height : "auto",
			submitOnChange: false,
      submitOnClose: false,
			defaultSettings: []
		})
	}

	
	getData (options) {
		function prepSetting (key) {
			let data = game.settings.settings.get(`tormenta20.${key}`);
			return foundry.utils.mergeObject( data ,{
				value: game.settings.get('tormenta20', key),
				type : data.type
			});
		}

		const settings = this.options.defaultSettings.reduce(function(acc, setting){
			acc[setting] = prepSetting(setting);
			return acc;
		},{});
		settings.settings = this.options.defaultSettings;
		return settings;
	}

	
	/**
	 * Executes on form submission
	 * @param {Event} e - the form submission event
	 * @param {Object} d - the form data
	 */
	async _updateObject(e,d) {
		const iterableSettings = Object.keys(d);
		for (let key of iterableSettings) {
			game.settings.set('tormenta20', key, d[key]);
		}
	}

	/** @inheritdoc */
	activateListeners(html) {
		super.activateListeners(html);
		
		html.find(".list-control").click(this._onListControl.bind(this));

	}

	/**
	* Add or remove a roll part from a list
	* @param {Event} event     The original click event
	* @return {Promise}
	* @private
	*/
	async _onListControl(event) {
		event.preventDefault();
		const a = event.currentTarget;
		const ds =  a.dataset.type;
		// Add a list item component
		if ( a.classList.contains("add-li") ) {
			// await this._onSubmit(event);  // Submit any unsaved changes
			let dm = this?.object?.lidatamodel[ds];
			game.settings.get
		}
		// Remove a list item component
		if ( a.classList.contains("delete-li") ) {
			// await this._onSubmit(event);  // Submit any unsaved changes

		}
	}
}

export class Tormenta20ActorSheetSettings extends Tormenta20BaseSettings {

	constructor (object, options = {}) {
		super(object, options)
	}

	/**
	 * Default Options for this FormApplication
	 */
	 static get defaultOptions () {
		return foundry.utils.mergeObject(super.defaultOptions, {
		 title : 'Configurações de Ficha',
		 template : './systems/tormenta20/templates/apps/settings.hbs',
		 submitOnChange: false,
		 submitOnClose: false,
		 defaultSettings: ['forceSheetTemplate', 'disableExperience', 'enableLanguages', 'disableJournal']
	 })
 }

	getData (options) {
		return super.getData (options);
	}
	async _updateObject(e,d) {
		super._updateObject(e,d);
	}
}


export class Tormenta20ResourceColorsSettings extends Tormenta20BaseSettings {
	constructor (object, options = {}) {
		super(object, options)
		this.defaultTitle = 'Configurações de Ficha';
		this.defaultTemplate = './systems/tormenta20/templates/apps/settings.html';
		this.defaultSettings =  ['forceSheetTemplate', 'disableExperience', 'enableLanguages', 'disableJournal', 'showDamageCards'];
	}
}