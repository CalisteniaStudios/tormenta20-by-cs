const { Ray } = foundry.canvas.geometry;

export default class TemplateLayerT20 extends foundry.canvas.layers.TemplateLayer {
	_onDragLeftMove(event) {
		const interaction = event.interactionData;

		// Snap the destination to the grid
		if (!event.shiftKey) interaction.destination = this.getSnappedPoint(interaction.destination);

		// Compute the ray
		const { origin, destination, preview } = interaction;
		const ray = new Ray(origin, destination);
		let distance = canvas.grid.measurePath([origin, destination]).distance;
		if (preview.document.t === "cone") {
			const distanceUnit = canvas.dimensions.distance;
			distance = Math.max(Math.round(distance / distanceUnit) * distanceUnit, distanceUnit * 2);
		}

		// Update the preview object
		preview.document.direction = Math.normalizeDegrees(Math.toDegrees(ray.angle));
		preview.document.distance = distance;
		preview.renderFlags.set({ refreshShape: true });
	}
}
