(function(w, u) {
	let base = {
		isArray: function(arr) {
			return Object.prototype.toString.call(arr) === '[object Array]'
		},
		isString: function(str) {
			return (typeof str == 'string') && str.constructor == String
		},
		isNumber: function(num) {
			return Object.prototype.toString.call(num) === '[object Number]'
		},
		isObject: function(obj) {
			return Object.prototype.toString.call(obj) === '[object Object]'
		},
		each: function (param, fn) {
			if (this.isString(param) || this.isArray(param)) {
				for (let i = 0;i < param.length;i++) {
					fn(param[i], i)
				}
			} else if (this.isNumber(param)) {
				for (let i = 0;i < param;i++) {
					fn(i + 1, i)
				}
			} else if (this.isObject(param) && param.length) {
				for (let i = 0;i < param.length;i++) {
					fn(param[i], i)
				}
			} else {
				fn(param)
			}
		},
		toPercent: function (point) {
			return Math.floor(Number(point * 100)) + '%'
		}
	}
	w.base = base
})(window);