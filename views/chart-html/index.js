(function (w, u) {
	let vQuery = {
		getSize: function (elem, name) {
			return parseFloat(this.getStyle(elem, name)) || 0
		},
		getStyle: function (elem, name) {
			name = name.replace(/-[a-z]/g, function(word){
		        return word.substring(1).toUpperCase()
		    })
		    if (elem.style[name]) {
		    	return elem.style[name]
		    } else if (elem.currentStyle) {
		    	return elem.currentStyle[name]
		    } else if (document.defaultView && document.defaultView.getComputedStyle){
		        name = name.replace(/([A-Z])/g, '-$1')
		        name = name.toLowerCase()
		        var s = document.defaultView.getComputedStyle(elem, '')
		        return s && s.getPropertyValue(name)
		    } else {
		    	return null
		    }
		},
		setStyle: function (elem, name, value) {
			name = name.replace(/-(\w)/g, function($0, $1){
				return $1.toUpperCase()
			})
			switch (name) {
	            case 'width':
	            case 'height':
	            case 'padding':
	            case 'paddingLeft':
	            case 'paddingRight':
	            case 'paddingTop':
	            case 'paddingBottom':
	                value = /\%/.test(value) ? value : Math.max(parseInt(value), 0) + 'px'
	                break
	            case 'left':
	            case 'top':
	            case 'bottom':
	            case 'right':
	            case 'margin':
	            case 'marginLeft':
	            case 'marginRight':
	            case 'marginTop':
	            case 'marginBottom':
	                value = /\%/.test(value)?value:parseInt(value) + 'px'
	                break
	        }
	        elem.style[name] = value
		},
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
	let vCharts = function (opt) {
		if(this == window || 'vCharts' in this){
	        return new vCharts(opt)
	    }
		this.$el = opt.$el
		this.type = opt.type
		this.series = opt.series
		this.barWidth = opt.barWidth || 10
		this.css = {
			width: vQuery.getSize(this.$el, 'width'),
			height: vQuery.getSize(this.$el, 'height')
		}
		this.colors = opt.colors || ['#F2637B', '#975FE4', '#FA7F58', '#7985F9', '#FAD337', '#F95858', '#36CBCB', '#3BA0FF', '#80cef6', '#4DCB73', '#F94166', '#E44848', '#F95858']
		this.init()
	}
	vCharts.create = function (opt) {
		return new vCharts(opt)
	}
	vCharts.prototype.init = function () {
		let oDom = document.createElement('div')
		oDom.style.cssText = ';position: absolute;left: 0;top:0;'
		vQuery.setStyle(oDom, 'width', this.css.width)
		vQuery.setStyle(oDom, 'height', this.css.height)
		this.container = oDom
		this.$el.style.position = 'relative'
		this.$el.appendChild(this.container)
		if (this.type === 'bar') {
			this.initBar()
		}
		if (this.type === 'pie') {
			this.initPie()
		}
	}
	vCharts.prototype.initBar = function () {
		let _this = this
		let len = 0
		let max = 0
		let series = []
		vQuery.each(this.series, function (data, i) {
			len = data.data.length > len ? data.data.length : len
		})
		vQuery.each(len, function (num, i) {
			series[i] = {
				length: 0,
				max: 0
			}
			vQuery.each(_this.series, function (item) {
				let x = item.data[i] || 0
				series[i][series[i].length] = x
				series[i]['max'] += x
				series[i]['length'] += 1
			})
		})
		vQuery.each(series, function (item) {
			max = item.max > max ? item.max : max
		})
		let nSplit = (this.css.width - (len * this.barWidth)) / (len - 1 || 1)
		vQuery.each(len, function (num, i) {
			let data = series[i]
			let oDom = document.createElement('div')
			oDom.style.cssText = ';position: absolute;bottom: 0;height: 100%;'
			vQuery.setStyle(oDom, 'width', _this.barWidth)
			vQuery.setStyle(oDom, 'left', i * (_this.barWidth + nSplit))
			let linearStr = ''
			let start = 0
			vQuery.each(data, function (item, idx) {
				let str = _this.colors[idx] + ' ' + vQuery.toPercent(start / max) + ', '
				start += item
				str += _this.colors[idx] + ' ' + vQuery.toPercent(start / max) + ', '
				linearStr += str
			})
			linearStr += 'transparent ' + vQuery.toPercent(start / max) + ', '
			linearStr += 'transparent 100%'
			vQuery.setStyle(oDom, 'background', `linear-gradient(to top, ${linearStr})`)
			_this.container.appendChild(oDom)
		})
	}
	vCharts.prototype.initPie = function () {
		let _this = this
		let size = Math.min(this.css.width, this.css.height)
		let oDom = document.createElement('div')
		oDom.style.cssText = ';position: absolute;left: 50%;top:50%;border-radius: 50%;'
		vQuery.setStyle(oDom, 'width', size)
		vQuery.setStyle(oDom, 'height', size)
		vQuery.setStyle(oDom, 'margin-left', -size / 2)
		vQuery.setStyle(oDom, 'margin-top', -size / 2)
		let conicStr = ''
		let max = 0
		let start = 0
		vQuery.each(this.series, function (item) {
			max += item
		})
		vQuery.each(this.series, function (item, idx) {
			if (start + item === max) {
				conicStr += _this.colors[idx] + ' ' + vQuery.toPercent(start / max) + ', '
				start += item
				conicStr += _this.colors[idx] + ' 100%'
			} else {
				conicStr += _this.colors[idx] + ' ' + vQuery.toPercent(start / max) + ', '
				start += item
				conicStr += _this.colors[idx] + ' ' + vQuery.toPercent(start / max) + ', '
			}
		})
		vQuery.setStyle(oDom, 'background', `conic-gradient(${conicStr})`)
		this.container.appendChild(oDom)
	}
	w.vCharts = vCharts
})(window)