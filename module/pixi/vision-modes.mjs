
export class DetectionModeAll extends DetectionMode {
  /** @override */
  static getDetectionFilter() {
    return this._detectionFilter ??= OutlineOverlayFilter.create({
      outlineColor: [0.85, 0.85, 1.0, 1],
      knockout: true
    });
  }

  /** @override */
  _canDetect(visionSource, target) {
    // The source may not be blind if the detection mode requires sight
    const src = visionSource.object.document;
    const isBlind = ( (src instanceof TokenDocument) && (this.type === DetectionMode.DETECTION_TYPES.SIGHT)
      && src.hasStatusEffect(CONFIG.specialStatusEffects.BLIND) );
    return !isBlind;
  }
}

senseAll: new DetectionModeAll({
	id: "senseAll",
	label: "DETECTION.SenseAll",
	walls: false,
	type: DetectionMode.DETECTION_TYPES.OTHER
})