export const T20Vision = {};

T20Vision.test = new VisionMode({
	id: "test",
	label: "TESTE",
	canvas: { 
		shader: ColorAdjustmentsSamplerShader,
		uniforms: { 
			enable: true,
			contrast: 0,
			saturation: -1.0,
			brightness: 0
		},
		colorize: true
	},
	lighting: {
		background: { enabled: false },
		illumination: {
			enabled: false,
			postProcessingModes: ["EXPOSURE"],
			uniforms: { exposure: 0.8 }
		},
		coloration: {
			enabled: false,
			postProcessingModes: ["SATURATION", "TINT", "EXPOSURE"],
			uniforms: { saturation: -0.75, exposure: 8.0, tint: [0.48, 1.0, 0.48] }
		},
		levels: {
			[VisionMode.LIGHTING_LEVELS.DIM]: VisionMode.LIGHTING_LEVELS.BRIGHT,
			[VisionMode.LIGHTING_LEVELS.BRIGHT]: VisionMode.LIGHTING_LEVELS.BLINDING
		}
	},
	vision: {
		darkness: {min: 0, max: 1, adaptive: true},
		defaults: { attenuation: 0, contrast: 0, saturation: 0, brightness: 0 },
		background: { shader: WaveBackgroundVisionShader },
		coloration: { shader: WaveColorationVisionShader }
	}
});

T20Vision.basic = new VisionMode({
	id: "basic",
	label: "VISION.ModeBasicVision",
	canvas: { colorize: true },
	vision: {
		darkness: {min: 0, max: 1},
		defaults: { attenuation: 0, contrast: 0, saturation: 0, brightness: 0 }
	}
});

	// 5e-style Darkvision
T20Vision.darkvision5e = new VisionMode({
	id: "darkvision5e",
	label: "VISION.ModeDarkvision5e",
	canvas: {
		shader: ColorAdjustmentsSamplerShader,
		uniforms: { enable: true, contrast: 0, saturation: -1.0, brightness: 0 }
	},
	lighting: {
		levels: {
			[VisionMode.LIGHTING_LEVELS.DIM]: VisionMode.LIGHTING_LEVELS.BRIGHT
		}
	},
	vision: {
		darkness: { min: 0, max: 1, adaptive: true },
		defaults: { attenuation: 0, contrast: 0, saturation: -1.0, brightness: 0 }
	}
});

// 5e-style Tremorsense
T20Vision.tremorsense5e = new VisionMode({
	id: "tremorsense5e",
	label: "VISION.ModeTremorsense5e",
	canvas: {
		shader: ColorAdjustmentsSamplerShader,
		uniforms: { enable: true, contrast: 0, saturation: -1, exposure: -0.40 },
		colorize: true
	},
	lighting: {
		background: { enabled: false },
		illumination: { enabled: false },
		coloration: { enabled: false }
	},
	vision: {
		darkness: { min: 0, max: 1, adaptive: false },
		defaults: { attenuation: 0, contrast: 0.65, saturation: 0.3, brightness: 1 },
		background: { shader: WaveBackgroundVisionShader },
		coloration: { shader: WaveColorationVisionShader }
	}
}, { animate: VisionSource.prototype.animateTime });

// Light Amplification
T20Vision.lightAmplification = new VisionMode({
	id: "lightAmplification",
	label: "VISION.ModeLightAmplification",
	canvas: {
		shader: AmplificationSamplerShader,
		uniforms: { enable: true, contrast: 0, saturation: -0.5, exposure: -0.25, tint: [0.48, 1.0, 0.48] }
	},
	lighting: {
		background: { enabled: false },
		illumination: {
			postProcessingModes: ["EXPOSURE"],
			uniforms: { exposure: 0.8 }
		},
		coloration: {
			postProcessingModes: ["SATURATION", "TINT", "EXPOSURE"],
			uniforms: { saturation: -0.75, exposure: 8.0, tint: [0.48, 1.0, 0.48] }
		},
		levels: {
			[VisionMode.LIGHTING_LEVELS.DIM]: VisionMode.LIGHTING_LEVELS.BRIGHT,
			[VisionMode.LIGHTING_LEVELS.BRIGHT]: VisionMode.LIGHTING_LEVELS.BLINDING
		}
	},
	vision: {
		darkness: { min: 0, max: 1, adaptive: false },
		defaults: { attenuation: 0, contrast: 0, saturation: -0.5, brightness: 1 },
		background: { shader: AmplificationBackgroundVisionShader }
	}
}, {animate: VisionSource.prototype.animateTime});
