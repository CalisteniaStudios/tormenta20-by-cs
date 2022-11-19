/**
 * Extend the base TokenDocument class to implement system-specific HP bar logic.
 * @extends {TokenDocument}
 */
 export default class TokenDocumentT20 extends TokenDocument {

	/** @inheritdoc */
	getBarAttribute(...args) {
		const data = super.getBarAttribute(...args);
		if ( data && (data.attribute === "attributes.pv") ) {
			data.value += parseInt(getProperty(this.actor, "system.attributes.pv.temp") || 0);
		}
		if ( data && (data.attribute === "attributes.pm") ) {
			data.value += parseInt(getProperty(this.actor, "system.attributes.pm.temp") || 0);
		}
		return data;
	}

	/** @inheritdoc */
	async _preUpdate(changed, options, user) {
		// Bugfix Leftover `skill.treino` on sheet was causing issues on token config
		if ( this.actorData?.system?.pericias ){
			const skills = this.actorData.system.pericias;
			for (const [key, value] of Object.entries(skills)) {
				if ( hasProperty(value, 'treino') ) {
					changed[`actorData.system.pericias.${key}.-=treino`] = null;
				}
			}
		}
		super._preUpdate(changed, options, user);
	}
}