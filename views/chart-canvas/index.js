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
		this.lineStyle = opt.lineStyle || 'normal'
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
			if (this.lineStyle === 'round') {
				this.initLineRound()
			} else {
				this.initLine()
			}
		}
		if (this.type === 'pie') {
			this.initPie()
		}
	}
	vCharts.prototype.initBar = function () {
		let _this = this
		let center = [this.css.width / 2, this.css.height / 2]
		let r = Math.min(this.css.width, this.css.height) / 2
		let oCanvas = document.createElement('canvas')
		oCanvas.setAttribute('width', this.css.width)
		oCanvas.setAttribute('height', this.css.height)
		let ctx = oCanvas.getContext('2d')
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
				let x = i * (_this.barWidth + nSplit)
				let y = (1 - (start + item) / max) * _this.css.height
				let w = _this.barWidth
				let h = item / max * _this.css.height
				start += item
				ctx.fillStyle = _this.colors[idx]
				ctx.fillRect(x, y, w, h)
			})
			ctx.stroke()
		})

		this.container.appendChild(oCanvas)
	}
	vCharts.prototype.initLine = function () {
		let _this = this
		let oCanvas = document.createElement('canvas')
		oCanvas.setAttribute('width', this.css.width)
		oCanvas.setAttribute('height', this.css.height)
		let ctx = oCanvas.getContext('2d')
		ctx.lineWidth = this.lineWidth
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
			ctx.beginPath()
			vQuery.each(data.data, function (item, idx) {
				let x = w1 * idx
				let y = Math.ceil((1 - item / max) * _this.css.height)
				if (idx === 0) {
					ctx.moveTo(x, y)
				} else if (idx < len - 1) {
					ctx.lineTo(x, y)
					ctx.moveTo(x, y)
				} else {
					ctx.lineTo(x, y)
				}
			})
			ctx.strokeStyle = _this.colors[i]
			ctx.stroke()
		})
		this.container.appendChild(oCanvas)
	}
	vCharts.prototype.initLineRound = function () {
		let _this = this
		let oCanvas = document.createElement('canvas')
		oCanvas.setAttribute('width', this.css.width)
		oCanvas.setAttribute('height', this.css.height)
		let ctx = oCanvas.getContext('2d')
		ctx.lineWidth = this.lineWidth
		ctx.lineJoin = 'round'
		ctx.lineCap = 'round'
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
			ctx.beginPath()
			for (let m = 0;m < data.data.length;m++) {
				let x = w1 * m
				let y = Math.ceil((1 - data.data[m] / max) * _this.css.height)
				if (m === 0) {
					ctx.moveTo(x, y)
				} else if (m === data.data.length - 1) {
					let preY = Math.ceil((1 - data.data[m - 1] / max) * _this.css.height)
					if (y === preY) {
						ctx.lineTo(x, y)
					} else {
						let c1 = (w1 * (m - 1) + x) / 2
						let c2 = (y + preY) / 2
						if (y < preY) {
							c2 -= 10
						} else {
							c2 += 10
						}
						ctx.quadraticCurveTo(c1, c2, x, y)
					}
				} else {
					let preY = Math.ceil((1 - data.data[m - 1] / max) * _this.css.height)
					if (y === preY) {
						ctx.lineTo(x, y)
					} else {
						let c1 = (w1 * (m - 1) + x) / 2
						let c2 = (y + preY) / 2
						if (y < preY) {
							c2 -= 10
						} else {
							c2 += 10
						}
						ctx.quadraticCurveTo(c1, c2, x, y)
					}
					ctx.moveTo(x, y)
				}
			}
			ctx.strokeStyle = _this.colors[i]
			ctx.stroke()
		})
		this.container.appendChild(oCanvas)
	}
	vCharts.prototype.initPie = function () {
		let _this = this
		let center = [this.css.width / 2, this.css.height / 2]
		let r = Math.min(this.css.width, this.css.height) / 2
		let oCanvas = document.createElement('canvas')
		oCanvas.setAttribute('width', this.css.width)
		oCanvas.setAttribute('height', this.css.height)
		let ctx = oCanvas.getContext('2d')
		let sum = 0
		let angles = []
		this.series.map((val) => {
	        sum += val || 0
	    })
	    let start = -90
	    this.series.map((val, i) => {
	        let startAng = start * Math.PI / 180
	        start += val * 360 / sum
	        let endAng = start * Math.PI / 180
	        ctx.beginPath()
	        ctx.moveTo(center[0], center[1])
            ctx.fillStyle = _this.colors[i]
            ctx.arc(center[0], center[1], r, startAng, endAng)
            ctx.fill()
	    })
	
	    this.container.appendChild(oCanvas)
	}
	w.vCharts = vCharts
})(window)