/**************************************************************/
/* Module: Drag Ruler																				 */
/**************************************************************/
{
	Hooks.once("dragRuler.ready", () => {
		dragRuler.registerSystem("tormenta20", speedProvider);
	});

	const speedProvider = function (token, playerColor) {
		const baseSpeed = token.actor.data.data.attributes.movement.walk;
		const enjoadoLento = token.actor.data.data.referencias?.find(
			(condicao) =>
				condicao.label === "Enjoado" || condicao.label === "Lento");
		let runMultiplier = 2;
		if (enjoadoLento) runMultiplier = 1;
		// const ranges = [{ range: baseSpeed, color: playerColor },{ range: baseSpeed * 2, color: 0xffff00 },{ range: baseSpeed * runMultiplier, color: 0xff8000 }];
		const ranges = [{range: baseSpeed, color: 0x3222C7},{range: baseSpeed * 2, color:  0xFFEC07}, { range: baseSpeed * 3, color: 0xC033E0  },{range: baseSpeed * 4, color: 0x1BCAD8}];
		for (var i = runMultiplier, len = ranges.length; i < len; i++) {
			ranges.pop();
		};
		return ranges;
	};
}
