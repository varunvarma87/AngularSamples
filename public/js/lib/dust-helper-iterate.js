"use strict";

var dust = require("dustjs-helpers");

/**
 * CNV: Borrowed from Richard Ragan (with permission) from
 * https://github.com/rragan/dust-motes/blob/master/src/helpers/control/iterate.js
 * TODO: Incorporate dust-motes' iterate.js when available.
 *
 * --------------------------------------------------
 *
 * iterate helper, loops over given object.
 * Inspired: https://github.com/akdubya/dustjs/issues/9
 *
 * Example:
 *    {@iterate key=obj}{$key}-{$value} of type {$type}{~n}{/iterate}
 *
 * @param key - object of the iteration - Mandatory parameter
 * @param sort - Optional. If omitted, no sort is done. Values allowed:
 *        sort="asc" - sort ascending (per JavaScript array sort rules)
 *        sort="desc" - sort descending
 *        sort="fname" - Look for fname object in global context,
 *        if found, treat it as a JavaScript array sort compare function.
 *        if not found, result is undefined (actually sorts ascending
 *        but you should not depend on it)
 */
dust.helpers.iterate = function (chunk, context, bodies, params) {
	var body = bodies.block,
		sort,
		arr,
		i,
		k,
		obj,
		compareFn;

	params = params || {};
	function desc(a, b) {
		if (a < b) {
			return 1;
		} else if (a > b) {
			return -1;
		}
		return 0;
	}

	function processBody(key, value) {
		return body(chunk, context.push({
			$key: key,
			$value: value,
			$type: typeof value
		}));
	}

	if (params.key) {
		obj = dust.helpers.tap(params.key, chunk, context);

		if (body) {
			if ( !! params.sort) {
				sort = dust.helpers.tap(params.sort, chunk, context);
				arr = [];
				for (k in obj) {
					if (obj.hasOwnProperty(k)) {
						arr.push(k);
					}
				}
				compareFn = context.global[sort];
				if (!compareFn && sort === 'desc') {
					compareFn = desc;
				}
				if (compareFn) {
					arr.sort(compareFn);
				} else {
					arr.sort();
				}
				for (i = 0; i < arr.length; i++) {
					chunk = processBody(arr[i], obj[arr[i]]);
				}
			} else {
				for (k in obj) {
					if (obj.hasOwnProperty(k)) {
						chunk = processBody(k, obj[k]);
					}
				}
			}
		}
	} // silently allow params.key to be false, should be ok to use @iterate as a condition that does nothing if the key is not truthy
	return chunk;

};