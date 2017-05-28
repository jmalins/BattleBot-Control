/**
 * Utility functions
 *
 * @module utils
 */

/**
 * Constrain input to a given range.
 *
 * @param {number} input value
 * @param {number} minimum value
 * @param {number} maximum value
 */
export function constrain (value, min, max) {
  if (value < min) return min
  if (value > max) return max
  return value
}

/**
 * Map a value from an input range to an output range.
 *
 * @param {number} input value
 * @param {number} input range low value
 * @param {number} input range high value
 * @param {number} output range low value
 * @param {number} output range high value
 */
export function map (value, inputMin, inputMax, outputMin, outputMax) {
  return (value - inputMin) * (outputMax - outputMin) / (inputMax - inputMin) + outputMin
}
