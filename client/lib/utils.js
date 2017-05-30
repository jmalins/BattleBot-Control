/**
 * Utility functions
 *
 * @module utils
 */
/* globals XMLHttpRequest */

/**
 * Constrain input to a given range.
 *
 * @param {number} value - input value
 * @param {number} min - minimum value
 * @param {number} max - maximum value
 */
export function constrain (value, min, max) {
  if (value < min) return min
  if (value > max) return max
  return value
}

/**
 * Map a value from an input range to an output range.
 *
 * @param {number} value - input value
 * @param {number} inputMin - input range low value
 * @param {number} inputMax - input range high value
 * @param {number} outputMin - output range low value
 * @param {number} outputMax - output range high value
 */
export function map (value, inputMin, inputMax, outputMin, outputMax) {
  return (value - inputMin) * (outputMax - outputMin) / (inputMax - inputMin) + outputMin
}

/**
 * General AJAX call.
 *
 * @param {string} method - HTTP method
 * @param {string} url - url to call
 * @param {string|object} data - data to send, will be stringified if JSON
 * @param {number?} timeout - timeout in milliseconds
 * @param {string} callback - (err, data)
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
 *
 * @param {string} url - url to call
 * @param {string} callback - (err, data)
 */
export function ajaxGet (url, timeout, callback) {
  return ajax('GET', url, null, timeout, callback)
}

/**
 * XHR wrapper to simplify AJAX PUT calls.
 *
 *
 */
export function ajaxPut (url, data, timeout, callback) {
  return ajax('PUT', url, data, timeout, callback)
}
