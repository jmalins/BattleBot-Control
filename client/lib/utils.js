/**
 * Utility functions
 *
 * @module utils
 */
/* globals XMLHttpRequest */

/**
 * Constrain input to a given range.
 *
 * Identical to the Arduino library function with the same name.
 * @see https://www.arduino.cc/en/Reference/Constrain
 *
 * @param {number} value - input value
 * @param {number} min - minimum value
 * @param {number} max - maximum value
 * @return {number}
 */
export function constrain (value, min, max) {
  if (value < min) return min
  if (value > max) return max
  return value
}

/**
 * Map a value from an input range to an output range.
 *
 * Identical to the Arduino library function with the same name.
 * @see https://www.arduino.cc/en/Reference/Map
 *
 * @param {number} value input value
 * @param {number} inputMin input range low value
 * @param {number} inputMax input range high value
 * @param {number} outputMin output range low value
 * @param {number} outputMax output range high value
 * @return {number}
 */
export function map (value, inputMin, inputMax, outputMin, outputMax) {
  return (value - inputMin) * (outputMax - outputMin) / (inputMax - inputMin) + outputMin
}

/**
 * General AJAX call.
 * @private
 *
 * @param {string} method HTTP method
 * @param {string} url url to call
 * @param {?string|Object} data data to send, will be stringified to JSON if object
 * @param {?number} timeout timeout in milliseconds
 * @param {Function} callback (err, data)
 */
export function ajax (method, url, data, timeout, callback) {
  if (typeof timeout === 'function') {
    callback = timeout
    timeout = undefined
  }

  // get the response //
  const getResponse = (xhr, data) => ({
    status: xhr.status,
    statusText: xhr.statusText,
    data,
    xhr
  })

  // create request //
  const xhr = new XMLHttpRequest()
  xhr.open(method, url, true)
  xhr.timeout = timeout
  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      callback(null, getResponse(xhr, xhr.responseText))
    } else {
      callback(new Error(`${xhr.status} - ${xhr.statusText}`), getResponse(xhr))
    }
  })
  xhr.addEventListener('error', (e) => callback(new Error('Request failed'), getResponse(xhr)))
  xhr.addEventListener('timeout', () => callback(new Error('Request timeout'), getResponse(xhr)))

  if (data) {
    xhr.send(typeof data !== 'string' ? JSON.stringify(data) : data)
  } else {
    xhr.send()
  }
}

/**
 * XHR wrapper to simplify AJAX GET calls.
 * @private
 *
 * @param {string} url url to call
 * @param {?number} timeoutMs connection timeout in milliseconds
 * @param {Function} callback - (err, data)
 */
export function ajaxGet (url, timeoutMs, callback) {
  return ajax('GET', url, null, timeoutMs, callback)
}

/**
 * XHR wrapper to simplify AJAX PUT calls.
 * @private
 *
 * @param {string} url url to call
 * @param {?string|Object} data data to send, will be stringified to JSON if object
 * @param {?number} timeout timeout in milliseconds
 * @param {Function} callback (err, data)
 */
export function ajaxPut (url, data, timeout, callback) {
  return ajax('PUT', url, data, timeout, callback)
}
