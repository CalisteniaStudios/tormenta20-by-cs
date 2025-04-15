export default class Tormenta20MeasuredTemplate extends MeasuredTemplate {

	get overrideCoreShapes() {
		return game.settings.get(game.system.id, "overrideMeasuredTemplatesConfig");
	}

	_computeShape() {
		console.log(this.overrideCoreShapes);
		if (!this.overrideCoreShapes || canvas.grid.type != 1) {
			return super._computeShape();
		}

		const { t, distance, direction, angle, width } = this.document;
		const x = this.position.x;
		const y = this.position.y;
		switch (t) {
			case "circle":
				return this.constructor.getT20CircleShape(distance, x, y);
			case "cone":
				return this.constructor.getT20ConeShape(distance, direction, angle);
			case "rect":
				return this.constructor.getRectShape(distance, direction);
			case "ray":
				return this.constructor.getRayShape(distance, direction, width);
		}
	}

	/**
	 * Tormenta20 Circles GridTemplate shaped.
	 * @inheritdoc
	 */
	static getT20CircleShape(distance, cX, cY) {
		console.log("getT20CircleShape");
		const distanceUnit = canvas.dimensions.distance;
		const distancePixels = canvas.dimensions.distancePixels;
		const size = canvas.dimensions.size;

		const xCentered = !Number.isInteger(cX/size);
		const yCentered = !Number.isInteger(cY/size);
		let points = [];
		// START: First Quarter
		let x = distance + (xCentered ? (distanceUnit/2) : 0);
		let y = 0;
		points = points.concat([
			[x, y]
		]);

		x = points.findLast(Boolean)[0];
		y = points.findLast(Boolean)[1];
		for (let i = 0; i < 50; i++) {
			y += distanceUnit / (yCentered && i == 0 ? 2 : 1);
			points = points.concat([
				[x, y]
			]);

			x += -distanceUnit / (xCentered && i == 0 ? 1 : 1);
			points = points.concat([
				[x, y]
			]);
			if (x <= 0) break;
		}
		// Mirror quarter
		let pointsA = points.map((i) => [(i[0] * -1), i[1]]).reverse();
		points = [...points, ...pointsA];
		// Mirror half
		let pointsB = points.map((i) => [(Number(i[0])), (i[1] * -1)]).reverse();
		points = [...points, ...pointsB];

		points = points.flat().map((i) => Number.parseInt(i * distancePixels));
		return new PIXI.Polygon(points);
	}

	/**
	 * Tormenta20 Cones are flat shaped and without GridTemplate mode.
	 * DIAGONAL = GridTemplate + FLAT
	 * VERTICAL = !GriTemplate + FLAT + Angle 67
	 * @inheritdoc
	 */
	static getT20ConeShape(distance, direction, angle) {
		const perpendicular = [0, 90, 180, 270];
		const diagonal = [45, 135, 225, 315];
		direction = this.roundToClosest(direction);
		if (direction == 360) direction = 0;
		// Diagonal Cone
		if (diagonal.includes(direction)) {
			angle = 90;
			return this.getT20ConeShapeDiagonal(distance, direction, angle);
		}
		// Perpendicular Cone
		else if (perpendicular.includes(direction)) {
			return this.getT20ConeShapeVertical(distance, direction, angle);
		}
	}

	static getT20ConeShapeVertical(distance, direction, angle) {
		const distanceUnit = canvas.dimensions.distance;
		const distancePixels = canvas.dimensions.distancePixels;
		let points = [];
		// START: OPEN CONE
		points = points.concat([
			[0, 0],
			[0, (distanceUnit / 2)],
			[distanceUnit, (distanceUnit / 2)]
		]);

		let length = points.findLast(Boolean)[0];
		let width = points.findLast(Boolean)[1];
		for (let i = 0; i < 50; i++) {
			// INCREASE SIZE
			width += distanceUnit;
			points = points.concat([
				[length, width]
			]);
			// INCREASE DISTANCE
			length += (distanceUnit * 2);
			length = Math.min(length, distance);
			points = points.concat([
				[length, width]
			]);
			if (length >= distance) {
				// JOIN
				width *= -1;
				points = points.concat([
					[length, width]
				]);
				break;
			}
		}

		points.toReversed().reduce((acc, p, i) => {
			if (i == 0) return acc;
			acc.push([
				p[0], (p[1] * -1)
			]);
			return acc;
		}, points);
		if (direction == 90) points = points.map((i) => [i[1], i[0]]);
		else if (direction == 180) points = points.map((i) => [(i[0] * -1), i[1]]);
		else if (direction == 270) points = points.map((i) => [i[1], (i[0] * -1)]);

		points = points.flat().map((i) => i * distancePixels);
		return new PIXI.Polygon(points);
	}

	static getT20ConeShapeDiagonal(distance, direction, angle) {
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
			points = points.concat([
				[x, y]
			]);
			x += -distanceUnit;
			points = points.concat([
				[x, y]
			]);
			if (x <= 0) {
				points = points.concat([
					[0, 0]
				]);
				break;
			}
		}
		if (direction == 45) points = points; // .map( i => [i[1], i[0]] );
		else if (direction == 135) points = points.map((i) => [(i[0] * -1), i[1]]);
		else if (direction == 225) points = points.map((i) => [(i[1] * -1), (i[0] * -1)]);
		else if (direction == 315) points = points.map((i) => [i[0], (i[1] * -1)]);

		points = points.flat().map((i) => i * distancePixels);
		return new PIXI.Polygon(points);
	}

	static roundToClosest(number) {
		return Math.round(number / 45) * 45;
	}
}
