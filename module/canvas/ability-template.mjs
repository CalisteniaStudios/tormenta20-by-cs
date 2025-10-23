const { Ray } = foundry.canvas.geometry;

/**
 * A helper class for building MeasuredTemplates for spells and abilities
 * @extends {MeasuredTemplate}
 */
export default class AbilityTemplate extends foundry.canvas.placeables.MeasuredTemplate {
	get overrideCoreShapes() {
		return game.settings.get("tormenta20", "overrideMeasuredTemplates");
	}

	_computeShape() {
		if (!this.overrideCoreShapes || canvas.grid.type != 1) {
			return super._computeShape();
		}
		const { t, distance, direction, angle, width } = this.document;
		switch (t) {
			case "circle":
				return this.constructor.getCircleShapeT20(distance);
			case "cone":
				return this.constructor.getConeShapeT20(distance, direction, angle);
			case "rect":
				return this.constructor.getRectShapeT20(distance, direction);
			case "ray":
				return this.constructor.getRayShapeT20(distance, direction, width);
		}
	}

	/** @override */
	static getCircleShapeT20(distance) {
		return new PIXI.Polygon(canvas.grid.getCircle({ x: 0, y: 0 }, distance));
	}

	/** @override */
	static getConeShapeT20(distance, direction, angle) {
		if (canvas.grid.isSquare) {
			const diagonal = [45, 135, 225, 315];
			direction = Math.round(direction / 45) * 45;
			if (diagonal.includes(direction)) return this.getDiagonalConeShapeT20(distance, direction);
			return this.getParallelConeShapeT20(distance, direction);
		}
		return new PIXI.Polygon(canvas.grid.getCone({ x: 0, y: 0 }, distance, direction, angle));
	}

	static getParallelConeShapeT20(distance, direction) {
		const distanceUnit = canvas.dimensions.distance;
		const distancePixels = canvas.dimensions.distancePixels;
		let points = [];
		// START: OPEN CONE
		points = points.concat([
			[0, 0],
			[0, distanceUnit / 2],
			[distanceUnit, distanceUnit / 2]
		]);

		let length = points.findLast(Boolean)[0];
		let width = points.findLast(Boolean)[1];
		for (let i = 0; i < 50; i++) {
			// INCREASE SIZE
			width += distanceUnit;
			points = points.concat([[length, width]]);
			// INCREASE DISTANCE
			length += distanceUnit * 2;
			length = Math.min(length, distance);
			points = points.concat([[length, width]]);
			if (length >= distance) {
				// JOIN
				width *= -1;
				points = points.concat([[length, width]]);
				break;
			}
		}

		points.toReversed().reduce((acc, p, i) => {
			if (i === 0) return acc;
			acc.push([p[0], p[1] * -1]);
			return acc;
		}, points);
		if (direction === 90) points = points.map((i) => [i[1], i[0]]);
		else if (direction === 180) points = points.map((i) => [i[0] * -1, i[1]]);
		else if (direction === 270) points = points.map((i) => [i[1], i[0] * -1]);

		points = points.flat().map((i) => i * distancePixels);
		return new PIXI.Polygon(points);
	}

	static getDiagonalConeShapeT20(distance, direction) {
		const distanceUnit = canvas.dimensions.distance;
		const distancePixels = canvas.dimensions.distancePixels;
		let points = [];

		// START: OPEN CONE
		points = points.concat([
			[0, 0],
			[distance, 0]
		]);

		let x = points.findLast(Boolean)[0];
		let y = points.findLast(Boolean)[1];
		for (let i = 0; i < 50; i++) {
			y += distanceUnit;
			points = points.concat([[x, y]]);
			x += -distanceUnit;
			points = points.concat([[x, y]]);
			if (x <= 0) {
				points = points.concat([[0, 0]]);
				break;
			}
		}
		if (direction === 45)
			points = points; // .map( i => [i[1], i[0]] );
		else if (direction === 135) points = points.map((i) => [i[0] * -1, i[1]]);
		else if (direction === 225) points = points.map((i) => [i[1] * -1, i[0] * -1]);
		else if (direction === 315) points = points.map((i) => [i[0], i[1] * -1]);

		points = points.flat().map((i) => i * distancePixels);
		return new PIXI.Polygon(points);
	}

	/** @override */
	static getRayShapeT20(distance, direction, width) {
		const d = canvas.dimensions;
		width *= d.distancePixels;
		const p00 = Ray.fromAngle(0, 0, Math.toRadians(direction - 90), width / 2).B;
		const p01 = Ray.fromAngle(0, 0, Math.toRadians(direction + 90), width / 2).B;
		const p10 = canvas.grid.getTranslatedPoint(p00, direction, distance);
		const p11 = canvas.grid.getTranslatedPoint(p01, direction, distance);

		return new PIXI.Polygon(p00.x, p00.y, p10.x, p10.y, p11.x, p11.y, p01.x, p01.y);
	}

	/** @override */
	static getRectShapeT20(distance, direction) {
		const endpoint = canvas.grid.getTranslatedPoint({ x: 0, y: 0 }, direction, distance);
		return new PIXI.Rectangle(0, 0, endpoint.x, endpoint.y).normalize();
	}

	/* ---------------------------------------------------- */
	/* ------------- Posicionamento de Magias ------------- */
	/* ---------------------------------------------------- */

	/**
	 * A factory method to create an AbilityTemplate instance using provided data from an Item5e instance
	 * @param {ItemT20} item               The Item object for which to construct the template
	 * @return {AbilityTemplate|null}     The template object, or null if the item does not produce a template
	 */
	static fromItem(item) {
		let area = foundry.utils.getProperty(item, "system.area").toLowerCase() || "";
		let alcance = foundry.utils.getProperty(item, "system.alcance").toLowerCase() || "";
		if (!area.match(/\d/)) {
			if (alcance == "short") area += " 9m";
			else if (alcance == "medium") area += " 30m";
			else if (alcance == "long") area += " 90m";
		}
		let type;
		let distance;
		let units;
		if (area.match(/cone/)) type = "cone";
		else if (area.match(/linha|parede|muralha/)) type = "ray";
		else if (area.match(/quadrado|cubo/)) type = "rect";
		else if (area.match(/esfera|circulo|círculo|raio|cilindro|explosão|emanação/)) type = "circle";
		if (area.match(/\d+[,|.]?\d?(m|km|q)/)) units = area.match(/\d+[,|.]?\d?(m|km|q)/)[1];
		if (area.match(/(\d+[,|.]?\d?)[m|km|q]/)) {
			if (area.match(/diametro|diâmetro/i))
				distance = (area.match(/(\d+[,|.]?\d?)[m|km|q]/)[1].replace(",", ".") * 1) / 2;
			else distance = Number(area.match(/(\d+[,|.]?\d?)[m|km|q]/)[1].replace(",", "."));
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
		switch (type) {
			case "cone": // T20 cone RAW should be 54 degrees Width == Length
				templateData.angle = 54;
				break;
			case "rect": // T20 rectangular AoEs are always cubes
				templateData.distance = 2 * distance;
				templateData.direction = 45;
				break;
			case "ray": {
				// T20 rays are most commonly 1 square (1,5m) in width (will resize for small maps)
				const { height, size, width } = canvas.dimensions;
				templateData.distance = Math.min(distance, width / size, height / size);
				if (templateData.distance < distance)
					ui.notifications.info("O template de linha foi reduzido devido ao tamanho do mapa.");
				templateData.width = canvas.dimensions.distance;
				break;
			}
			default:
				break;
		}

		// Return the template constructed from the item data
		const cls = CONFIG.MeasuredTemplate.documentClass;
		const template = new cls(templateData, { parent: canvas.scene });
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
		if (this.actorSheet) this.actorSheet.minimize();

		// Activate interactivity
		this.activatePreviewListeners(initialLayer);
	}

	/* -------------------------------------------- */

	_refreshShape() {
		const { x, y, direction, distance } = this.document;

		// Grid type
		this.ray = new Ray({ x, y }, canvas.grid.getTranslatedPoint({ x, y }, direction, distance));

		// Get the Template shape
		this.shape = this._computeShape();
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
		handlers.mm = (event) => {
			event.stopPropagation();
			let now = Date.now(); // Apply a 20ms throttle
			if (now - moveTime <= 20) return;
			const center = event.data.getLocalPosition(this.layer);
			const snapped = canvas.grid.getSnappedPosition(center.x, center.y, 2);
			this.document.updateSource({ x: snapped.x, y: snapped.y });
			this.refresh();
			moveTime = now;
		};

		// Cancel the workflow (right-click)
		handlers.rc = (event) => {
			this.layer._onDragLeftCancel(event);
			canvas.stage.off("mousemove", handlers.mm);
			canvas.stage.off("mousedown", handlers.lc);
			canvas.app.view.oncontextmenu = null;
			canvas.app.view.onwheel = null;
			initialLayer.activate();
			this.actorSheet?.maximize();
		};

		// Confirm the workflow (left-click)
		handlers.lc = (event) => {
			handlers.rc(event);
			const destination = canvas.grid.getSnappedPosition(this.document.x, this.document.y, 2);
			this.document.updateSource(destination);
			canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [this.document.toObject()]);
		};

		// Rotate the template by 3 degree increments (mouse-wheel)
		handlers.mw = (event) => {
			if (event.ctrlKey) event.preventDefault(); // Avoid zooming the browser window
			event.stopPropagation();
			let delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
			let snap = event.shiftKey ? delta : 5;
			const update = {
				direction: this.document.direction + snap * Math.sign(event.deltaY)
			};
			this.document.updateSource(update);
			this.refresh();
		};

		// Activate listeners
		canvas.stage.on("mousemove", handlers.mm);
		canvas.stage.on("mousedown", handlers.lc);
		canvas.app.view.oncontextmenu = handlers.rc;
		canvas.app.view.onwheel = handlers.mw;
	}
}
