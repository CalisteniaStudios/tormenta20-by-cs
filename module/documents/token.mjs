/**
 * Extend the base TokenDocument class to implement system-specific HP bar logic.
 * @extends {TokenDocument}
 */
export default class TokenDocumentT20 extends TokenDocument {

	/** @inheritdoc */
	getBarAttribute(...args) {
		const data = super.getBarAttribute(...args);
		if (data && (data.attribute === "attributes.pv")) {
			data.value += parseInt(foundry.utils.getProperty(this.actor, "system.attributes.pv.temp") || 0);
		}
		if (data && (data.attribute === "attributes.pm")) {
			data.value += parseInt(foundry.utils.getProperty(this.actor, "system.attributes.pm.temp") || 0);
		}
		return data;
	}

	prepareBaseData() {
		super.prepareBaseData();
		// TokenDocumentT20.prepareSize(this); // TODO isso bloqueia qualquer alteração de tamanho/escala
	}

	static prepareSize(token) {
		const actor = token.actor;
		if (!actor) return;
		const actorSize = actor.system.tracos.tamanho;
		// If not overridden by an actor override, set according to creature size (skipping gargantuan)
		const size = {
			min: 0.5,
			peq: 1,
			med: 1,
			gra: 2,
			eno: 3,
			col: Math.max(token.width, 6)
		}[actorSize] ?? 1; // In case an AE-like corrupted actor size data
		token.width = size;
		token.height = size;

		const absoluteScale = actorSize === "peq" ? 0.8 : 1;
		const mirrorX = token.texture.scaleX < 0 ? -1 : 1;
		token.texture.scaleX = mirrorX * absoluteScale;
		const mirrorY = token.texture.scaleY < 0 ? -1 : 1;
		token.texture.scaleY = mirrorY * absoluteScale;
	}
}
