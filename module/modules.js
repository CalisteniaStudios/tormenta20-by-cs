/**************************************************************/
/* Module: Drag Ruler																				 */
/**************************************************************/
Hooks.once("dragRuler.ready", (SpeedProvider) => {
	class Tormenta20SpeedProvider extends SpeedProvider {
		get colors() {
			return [
				{id: "walk", default: 0x3222C7, name: "Deslocamento"},
				{id: "dash", default: 0xFFEC07, name: "Dobro"},
				{id: "run", default: 0xC033E0, name: "Triplo"},
				{id: "run2", default: 0x1BCAD8, name: "Quádruplo"}
			]
		}
		
		getRanges(token) {
			const baseSpeed = token.actor.system.attributes.movement.walk;
			const enjoadoLento = token.actor.system.referencias?.find(
				(condicao) =>
					condicao.label === "Enjoado" || condicao.label === "Lento");
			let runMultiplier = this.getSetting("dashMultiplier");
			if (enjoadoLento) runMultiplier = 1;
			const ranges = [
				{range: baseSpeed, color: "walk"},
				{range: baseSpeed * 2, color:  "dash"},
				{ range: baseSpeed * 3, color: "run"  },
				{range: baseSpeed * 4, color: "run2"}
			];
			for (var i = runMultiplier, len = ranges.length; i < len; i++) {
				ranges.pop();
			};
			return ranges;
		}
		
		get settings() {
			return [
				{
					id: "dashMultiplier",
					name: "drag-ruler.genericSpeedProvider.settings.dashMultiplier.name",
					hint: "drag-ruler.genericSpeedProvider.settings.dashMultiplier.hint",
					scope: "world",
					config: true,
					type: Number,
					default: 2,
				}
			]
		}
	}
	dragRuler.registerSystem("tormenta20", Tormenta20SpeedProvider);
});
