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
		},
		toRadians: function (angdeg) {//角度转换成弧度
			return angdeg / 180.0 * Math.PI;
		},
		toDegrees: function (angrad) {//弧度转换成角度
			return angrad * 180.0 / Math.PI;
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
		this.lineWidth = opt.lineWidth || 2
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
		if (this.type === 'line') {
			this.initLine()
		}
		if (this.type === 'pie') {
			this.initPie()
		}
	}
	vCharts.prototype.initBar = function () {
		let _this = this
		let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		svg.setAttribute('width', this.css.width)
		svg.setAttribute('height', this.css.height)
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
			let start = 0
			vQuery.each(data, function (item, idx) {
				let oRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
				let x = i * (_this.barWidth + nSplit)
				let y = (1 - (start + item) / max) * _this.css.height
				let w = _this.barWidth
				let h = item / max * _this.css.height
				start += item
				oRect.setAttribute('x', x)
				oRect.setAttribute('y', y)
				oRect.setAttribute('width', w)
				oRect.setAttribute('height', h)
				oRect.setAttribute('fill', _this.colors[idx])
				svg.appendChild(oRect)
			})
		})
		this.container.appendChild(svg)
	}
	vCharts.prototype.initLine = function () {
		let _this = this
		let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		svg.setAttribute('width', this.css.width)
		svg.setAttribute('height', this.css.height)
		let max = 0
		let series = []
		let len = 0
		vQuery.each(this.series, function (data, i) {
			len = data.data.length > len ? data.data.length : len
			vQuery.each(data.data, function (item) {
				max = item > max ? item : max
			})
		})
		let w1 = this.css.width / (len - 1)
		vQuery.each(this.series, function (data, i) {
			let oPolyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
			let points = ''
			vQuery.each(data.data, function (item, idx) {
				points += w1 * idx + ',' + Math.ceil((1 - item / max) * _this.css.height) + ' '
			})
			oPolyline.setAttribute('points', points)
			oPolyline.setAttribute('fill', 'none')
			oPolyline.setAttribute('stroke', _this.colors[i])
			oPolyline.setAttribute('stroke-width', _this.lineWidth)
			svg.appendChild(oPolyline)
		})
		this.container.appendChild(svg)
	}
	vCharts.prototype.initPie = function () {
		let _this = this
		let center = [this.css.width / 2, this.css.height / 2]
		let r = Math.min(this.css.width, this.css.height) / 2
		let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		svg.setAttribute('width', this.css.width)
		svg.setAttribute('height', this.css.height)
		let sum = 0
		let angles = []
		this.series.map((val) => {
	        sum += val || 0
	    })
	    let start = 0
	    this.series.map((val, i) => {
	        let oPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')

	        angles.push(val / sum * Math.PI * 2)
	        let end = start + angles[i]

	        let x1 = center[0] + r * Math.sin(start)
	    	let y1 = center[1] - r * Math.cos(start)
	    	let x2 = center[0] + r * Math.sin(end)
	    	let y2 = center[1] - r * Math.cos(end)
	    	var big = end - start > Math.PI ? 1 : 0;

	    	/*
			* A参数太难懂了
			* A rx ry xrotate big dir x y
			* rx x轴半径  ry y轴半径  xrotate x轴与水平顺时针夹角
			* big=1 大角弧度(大于180度) big=0 小角弧度(小于180度)
			* dir=1 凸起  dir=0 凹陷
			* x, y 结束点坐标
	    	*/

	    	let d =`M ${center[0]}, ${center[1]} L ${x1}, ${y1} A ${r}, ${r} 0 ${big} 1 ${x2}, ${y2} Z`

	    	oPath.setAttribute('d', d)
	    	oPath.setAttribute('fill', _this.colors[i])
	    	oPath.setAttribute('stroke', _this.colors[i])
	    	svg.appendChild(oPath)

	        start = end
	    })
	
	    this.container.appendChild(svg)
	}
	w.vCharts = vCharts
})(window)