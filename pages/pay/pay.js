import drawQrcode from 'weapp-qrcode'
import request from '../../utils/request'
import axios from '../../utils/axios'

Page({

	data: {
		price: 0, //价格
		random: 0, //随机数
		timer: null, //定时器
		isAllowPay: 1, //订单状态
		remainTime: "", //格式化后的剩余时间
		time: 0, //剩余时间
		orderNum: "", //订单编号
		place: "" //跳转来源
	},
	async onLoad(e) {
		//显示二维码
		drawQrcode({
			width: 300,
			height: 300,
			canvasId: 'myQrcode',
			text: `https://mobile.internet.lry.icu/zijin/mobile/#/index?price=${e.price}&random=${this.data.random}`,
			correctLevel: 3
		})
		this.setData({
			price: e.price,
			orderNum: e.orderNum,
			place: e.place
		})
		//根据订单号获取倒计时时间
		const res = await axios.get(request.newOrderBaseUrl + `/getRemainTime/${e.orderNum}`)
		console.log(res)
		//获取订单是否已经取消或支付
		const res1 = await axios.get(request.newOrderBaseUrl + `/getIsCancelOrPayOrder/${this.data.orderNum}`)
		console.log(res1)
		if (res1.data.data === "订单已取消") {
			this.setData({
				isAllowPay: 0
			})
			return
		}
		if (res1.data.data === "订单已支付") {
			this.setData({
				isAllowPay: 3
			})
			return
		}
		//如果距离订单提交时间大于15分钟，关闭支付入口
		if (res.data.data > 60 * 15) {
			const obj = {
				orderNum: this.data.orderNum,
				status: "2"
			}
			const res2 = await axios.post(request.newOrderBaseUrl + '/cancelOrderAuto', obj)
			console.log(res2)
			if (res2.data.data === "订单取消成功") {
				this.setData({
					isAllowPay: 0
				})
			}
			return
		}
		//获取倒计时
		this.setData({
			time: 15 * 60 - res.data.data
		})
		this.formatTime(this.data.time)
		//如果有定时器正在运行，清除定时器，如果没有，开启一个定时器
		if (!this.data.timer) {
			this.data.timer = setInterval(async () => {
				// 剩余时间为0,系统自动取消订单
				if (this.data.time === 0) {
					const obj = {
						orderNum: this.data.orderNum,
						status: "2"
					}
					const res2 = await axios.post(request.newOrderBaseUrl + '/cancelOrderAuto', obj)
					console.log(res2)
					clearInterval(this.data.timer)
					this.setData({
						timer: null,
						isAllowPay: 0
					})
				}
				this.setData({
					time: this.data.time - 1
				})
				this.formatTime(this.data.time)
			}, 1000)
		} else {
			clearInterval(this.data.timer)
			this.setData({
				timer: null
			})
		}
	},
	// 刷新二维码
	flushCode() {
		const random = Math.random()
		this.setData({
			random
		})
		drawQrcode({
			width: 300,
			height: 300,
			canvasId: 'myQrcode',
			text: `https://mobile.internet.lry.icu/zijin/mobile/#/index?price=${this.data.price}&random=${this.data.random}`,
			correctLevel: 3
		})
	},
	onUnload() {
		clearInterval(this.data.timer)
		this.setData({
			timer: null
		})
	},
	// 格式化时间
	formatTime(time) {
		let minute = Math.floor(time / 60)
		let second = time % 60
		if (minute < 10) {
			minute = "0" + minute
		}
		if (second < 10) {
			second = "0" + second
		}
		this.setData({
			remainTime: minute + ":" + second
		})
	},
	// 取消订单
	async cancelOrder() {
		// 剩余时间为0
		if (this.data.time <= 0) {
			wx.showToast({
				title: '支付入口已关闭，不可执行该操作',
				icon: "none",
				mask: true
			})
			return
		}
		// 取消订单
		const res = await wx.showModal({
			content: '确定要取消该订单吗',
		})
		if (res.confirm) {
			const obj = {
				orderNum: this.data.orderNum,
				status: "2"
			}
			// 更新订单状态
			const res1 = await axios.post(request.newOrderBaseUrl + '/updateNewOrder', obj)
			console.log(res1)
			if (res1.data.data === "订单超时") {
				wx.showToast({
					title: '该订单已超时，系统已为您自动取消',
					icon: "none",
					mask: true
				})
				return
			}
			if (res1.data.data === "订单处理失败") {
				wx.showToast({
					title: '订单取消失败',
					icon: "none",
					mask: true
				})
				return
			}
			if (res1.data.data === "订单处理成功") {
				clearInterval(this.data.timer)
				this.setData({
					timer: null,
					isAllowPay: 2
				})
				wx.showToast({
					title: '订单取消成功',
					mask: true
				})
				return
			}
		}
	},
	// 完成支付
	async finishPay() {
		if (this.data.time <= 0) {
			wx.showToast({
				title: '支付入口已关闭，不可执行该操作',
				icon: "none",
				mask: true
			})
			return
		}
		wx.showLoading({
			title: '正在获取支付结果',
		})
		// 修改订单状态
		const obj = {
			orderNum: this.data.orderNum,
			status: "1"
		}
		const res1 = await axios.post(request.newOrderBaseUrl + '/updateNewOrder', obj)
		wx.hideLoading()
		console.log(res1)
		if (res1.data.data === "订单超时") {
			wx.showToast({
				title: '该订单已超时，系统已为您自动取消',
				icon: "none",
				mask: true
			})
			return
		}
		if (res1.data.data === "订单处理失败") {
			wx.showToast({
				title: '订单支付失败',
				icon: "none",
				mask: true
			})
			return
		}
		if (res1.data.data === "订单处理成功") {
			//如果是从购物车中购买的，将购物车的相关内容删除
			if (this.data.place === "cart") {
				const res2 = await axios.get(request.cartBaseUrl + `/deleteCartByChecked/${wx.getStorageSync('openid')}`)
				console.log(res2)
			}
			//清除定时器
			clearInterval(this.data.timer)
			this.setData({
				timer: null,
				isAllowPay: 3
			})
			wx.showToast({
				title: '订单支付成功',
				mask: true
			})
			return
		}
	}
})