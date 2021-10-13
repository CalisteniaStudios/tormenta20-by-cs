/** @override */
export const measureDistances = function(segments, options={}) {
	if ( !options.gridSpaces ) return BaseGrid.prototype.measureDistances.call(this, segments, options);

	// Track the total number of diagonals
	let nDiagonal = 0;
	const rule = this.parent.diagonalRule;
	const d = canvas.dimensions;

	// Iterate over measured segments
	return segments.map(s => {
		let r = s.ray;

		// Determine the total distance traveled
		let nx = Math.abs(Math.ceil(r.dx / d.size));
		let ny = Math.abs(Math.ceil(r.dy / d.size));

		// Determine the number of straight and diagonal moves
		let nd = Math.min(nx, ny);
		let ns = Math.abs(ny - nx);
		nDiagonal += nd;

		if (rule === "PATHFINDER") {
			let nd10 = Math.floor(nDiagonal / 2) - Math.floor((nDiagonal - nd) / 2);
			let spaces = (nd10 * 2) + (nd - nd10) + ns;
			return spaces * canvas.dimensions.distance;
		} else if (rule === "EQUIDISTANT") {
			return (ns + nd) * canvas.scene.data.gridDistance;
		}

		// Standard Manhattan Movement
		return (ns + (nd * 2)) * canvas.scene.data.gridDistance;
	});
};
/* -------------------------------------------- */

// TokenHUD.prototype._onAttributeUpdate = function (event) {
// 	event.preventDefault();
// 	// Determine new bar value
// 	let input = event.currentTarget,
// 	strVal = input.value.trim(),
// 	operator,
// 	value,
// 	isDelta = false;
// 	if (strVal.match(/(=?[+-]-?)([0-9.]+)/)) {
// 		operator = RegExp.$1;
// 		value = parseFloat(RegExp.$2);
// 		isDelta = ["-", "+"].includes(operator);
// 		operator = operator?.replace("=", "");
// 	} else if (strVal.match(/=?([0-9.]+)/)) {
// 		value = parseFloat(RegExp.$1);
// 	} else return;

// 	let bar = input.dataset.bar;

// 	// For attribute bar values, update the associated Actor
// 	// TODO: Switch to Actor#modifyTokenAttribute
// 	if (bar) {
// 		const actor = this.object?.actor;
// 		if (!actor) return;
// 		const data = this.object.getBarAttribute(bar);
// 		const current = getProperty(actor.data.data, data.attribute);
// 		const updateData = {};

// 	// Set to specified negative value
// 	if (operator === "--" || (!isDelta && operator == "-")) {
// 		updateData[`data.${data.attribute}.value`] = -value;
// 	}

// 	// Add relative value
// 	else {
// 		let dt = value;
// 		if (data.attribute === "attributes.hp" && actor.data.data.attributes.hp.temp > 0 && operator === "-") {
// 			dt = Math.min(0, actor.data.data.attributes.hp.temp - value);
// 			updateData["data.attributes.hp.temp"] = Math.max(0, actor.data.data.attributes.hp.temp - value);
// 			value = actor.data.data.attributes.hp.value + dt;
// 		} else if (operator === "-") {
// 			if (data.attribute === "attributes.hp") value = Math.min(current.value - dt, current.max);
// 			else value = Math.clamped(current.min || 0, current.value - dt, current.max);
// 		} else if (operator === "+") {
// 			if (data.attribute === "attributes.hp") value = Math.min(current.value + dt, current.max);
// 			else value = Math.clamped(current.min || 0, current.value + dt, current.max);
// 		}
// 		updateData[`data.${data.attribute}.value`] = value;
// 	}

// 	actor.update(updateData);
// 	}

// 	// Otherwise update the Token
// 	else {
// 		if (operator === "--" || (!isDelta && operator == "-")) value = -value;
// 		else if (isDelta) {
// 			const current = getProperty(this.object.data, input.name);
// 			if (operator === "-") value = current - value;
// 			else if (operator === "+") value = current + value;
// 		}
// 		this.object.update({ [input.name]: value });
// 	}

// 	// Clear the HUD
// 	this.clear();
// };
