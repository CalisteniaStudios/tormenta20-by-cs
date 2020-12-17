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
    let nDiagonal = 0;

    // Determine the total distance traveled
    let nx = Math.abs(Math.ceil(r.dx / d.size));
    let ny = Math.abs(Math.ceil(r.dy / d.size));

    // Determine the number of straight and diagonal moves
    let nd = Math.min(nx, ny);
    let ns = Math.abs(ny - nx);
    nDiagonal += nd;
  
    if (rule === "EQUIDISTANT") {
      return (ns + nd) * canvas.scene.data.gridDistance;
    }

    // Standard Manhattan Movement
    return (ns + nd + nDiagonal) * canvas.scene.data.gridDistance;
  });
};
/* -------------------------------------------- */

/**
 * Hijack Token health bar rendering to include temporary and temp-max health in the bar display
 * TODO: This should probably be replaced with a formal Token class extension
 */
const _TokenGetBarAttribute = Token.prototype.getBarAttribute;
export const getBarAttribute = function(...args) {
  const data = _TokenGetBarAttribute.bind(this)(...args);
  if ( data && (data.attribute === "attributes.pv") ) {
    data.value += parseInt(getProperty(this.actor.data, "data.attributes.pv.temp") || 0);
    data.max += parseInt(getProperty(this.actor.data, "data.attributes.pv.temp") || 0);
  }
  if ( data && (data.attribute === "attributes.pm") ) {
    data.value += parseInt(getProperty(this.actor.data, "data.attributes.pm.temp") || 0);
    data.max += parseInt(getProperty(this.actor.data, "data.attributes.pm.temp") || 0);
  }
  return data;
};
