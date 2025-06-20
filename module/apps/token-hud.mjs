export default class TokenHUDT20 extends foundry.applications.hud.TokenHUD {
	static PARTS = {
		hud: {
			root: true,
			template: "systems/tormenta20/templates/apps/hud/token-hud.hbs"
		}
	};
}
