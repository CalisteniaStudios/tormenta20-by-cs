/**
 * A helper class for building MeasuredTemplates for spells and abilities
 * @extends {MeasuredTemplate}
 */
export default class AbilityTemplate extends MeasuredTemplate {

	/**
	 * A factory method to create an AbilityTemplate instance using provided data from an Item5e instance
	 * @param {ItemT20} item               The Item object for which to construct the template
	 * @return {AbilityTemplate|null}     The template object, or null if the item does not produce a template
	 */
	static fromItem(item) {
		let area = foundry.utils.getProperty(item, "system.area").toLowerCase() || "";
		let alcance = foundry.utils.getProperty(item, "system.alcance").toLowerCase() || "";
		if( !area.match(/\d/) ){
			if ( alcance == "short" ) area += " 9m";
			else if ( alcance == "medium" ) area += " 30m";
			else if ( alcance == "long" ) area += " 90m";
		}
		let type, distance, units;
		if( area.match(/cone/) ) type = "cone";
		else if( area.match(/linha|parede|muralha/) ) type = "ray"; 
		else if( area.match(/quadrado|cubo/) ) type = "rect";
		else if( area.match(/esfera|circulo|círculo|raio|cilindro|explosão|emanação/) ) type = "circle";
		if( area.match(/\d+[,|.]?\d?(m|km|q)/) ) units = area.match(/\d+[,|.]?\d?(m|km|q)/)[1];
		if( area.match(/(\d+[,|.]?\d?)[m|km|q]/) ){
			if (area.match(/diametro|diâmetro/i)) distance = area.match(/(\d+[,|.]?\d?)[m|km|q]/)[1].replace(",",".") * 1 / 2;
			else distance = area.match(/(\d+[,|.]?\d?)[m|km|q]/)[1].replace(",",".") * 1;
		}
		
		if (!distance || !["cone", "circle", "rect", "ray"].includes(type)) return null;
		// Prepare template data
		const templateData = {
			t: type,
			user: game.user.id,
			distance: distance,
			direction: 0,
			x: 0,
			y: 0,
			fillColor: game.user.color
		};

		// Additional type-specific data
		switch ( type ) {
			case "cone": // T20 cone RAW should be 54 degrees Width == Length
				templateData.angle = 54;
				break;
			case "rect": // T20 rectangular AoEs are always cubes
				templateData.distance = Math.hypot(distance, distance);
				templateData.width = distance;
				templateData.direction = 45;
				break;
			case "ray": // T20 rays are most commonly 1 square (1,5m) in width (will resize for small maps)
				templateData.distance = Math.min(distance, canvas.dimensions.width/canvas.dimensions.size, canvas.dimensions.height/canvas.dimensions.size);
				if( templateData.distance < distance ) ui.notifications.info(`O template de linha foi reduzido devido ao tamanho do mapa.`);
				templateData.width = canvas.dimensions.distance;
				break;
			default:
				break;
		}

		// Return the template constructed from the item data
		const cls = CONFIG.MeasuredTemplate.documentClass;
		const template = new cls(templateData, {parent: canvas.scene});
		const object = new this(template);
		object.item = item;
		object.actorSheet = item.actor?.sheet || null;
		return object;
	}

	/* -------------------------------------------- */

	/**
	 * Creates a preview of the spell template
	 */
	drawPreview() {
		const initialLayer = canvas.activeLayer;

		// Draw the template and switch to the template layer
		this.draw();
		this.layer.activate();
		this.layer.preview.addChild(this);

		// Hide the sheet that originated the preview
		if ( this.actorSheet ) this.actorSheet.minimize();

		// Activate interactivity
		this.activatePreviewListeners(initialLayer);
	}

	/* -------------------------------------------- */

	/**
	 * Activate listeners for the template preview
	 * @param {CanvasLayer} initialLayer  The initially active CanvasLayer to re-activate after the workflow is complete
	 */
	activatePreviewListeners(initialLayer) {
		const handlers = {};
		let moveTime = 0;

		// Update placement (mouse-move)
		handlers.mm = event => {
			event.stopPropagation();
			let now = Date.now(); // Apply a 20ms throttle
			if ( now - moveTime <= 20 ) return;
			const center = event.data.getLocalPosition(this.layer);
			const snapped = canvas.grid.getSnappedPosition(center.x, center.y, 2);
			if ( game.release.generation < 10 ) this.document.update({x: snapped.x, y: snapped.y});
			else this.document.updateSource({x: snapped.x, y: snapped.y});
			this.refresh();
			moveTime = now;
		};

		// Cancel the workflow (right-click)
		handlers.rc = event => {
			this.layer._onDragLeftCancel(event);
			canvas.stage.off("mousemove", handlers.mm);
			canvas.stage.off("mousedown", handlers.lc);
			canvas.app.view.oncontextmenu = null;
			canvas.app.view.onwheel = null;
			initialLayer.activate();
			this.actorSheet?.maximize();
		};

		// Confirm the workflow (left-click)
		handlers.lc = event => {
			handlers.rc(event);
			const destination = canvas.grid.getSnappedPosition(this.document.x, this.document.y, 2);
			if ( game.release.generation < 10 ) this.document.update(destination);
			else this.document.updateSource(destination);
			canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [this.document.toObject()]);
		};

		// Rotate the template by 3 degree increments (mouse-wheel)
		handlers.mw = event => {
			if ( event.ctrlKey ) event.preventDefault(); // Avoid zooming the browser window
			event.stopPropagation();
			let delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
			let snap = event.shiftKey ? delta : 5;
			const update = {direction: this.document.direction + (snap * Math.sign(event.deltaY))};
			if ( game.release.generation < 10 ) this.document.update(update);
			else this.document.updateSource(update);
			this.refresh();
		};

		// Activate listeners
		canvas.stage.on("mousemove", handlers.mm);
		canvas.stage.on("mousedown", handlers.lc);
		canvas.app.view.oncontextmenu = handlers.rc;
		canvas.app.view.onwheel = handlers.mw;
	}
}
