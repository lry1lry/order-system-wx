import request from '../../utils/request'
import axios from '../../utils/axios'

Page({

	data: {
		address: "", //地址信息
		top: '0vw', //距离顶部高度
		productList: [], //商品列表
		totalPrice: 0, //总价格
		place: "", //跳转来源
		productId: "", //产品id
		productNum: "" //产品数量
	},
	async onLoad(e) {
		this.setData({
			place: e.place,
			productId: e.productId || "",
			productNum: e.productNum || ""
		})
		//获取距离顶部的距离
		const windowHeight = wx.getWindowInfo().screenHeight
		const windowWidth = wx.getWindowInfo().windowWidth
		const screenTop = wx.getWindowInfo().screenTop
		const bili = windowHeight / windowWidth
		this.setData({
			top: (windowHeight - screenTop - 90 - 130) * bili / 7.5 + 'vw'
		})
		//获取openid，如果没有，直接返回
		if (wx.getStorageSync('openid') === '') {
			return
		}
		const openid = wx.getStorageSync('openid')
		// 获取地址信息
		const res = await axios.get(request.addressBaseUrl + `/getDefaultAddress/${openid}`)
		console.log(res)
		this.setData({
			address: res.data.data.provinceName + res.data.data.cityName + res.data.data.countryName + res.data.data.detailName
		})
		// 如果是从购物车过来的，获取购物车中选中商品的信息并渲染
		if (e.place === "cart") {
			const res2 = await axios.get(request.cartBaseUrl + `/getAllCartByChecked/${openid}`)
			console.log(res2)
			const list = []
			this.setData({
				totalPrice: 0
			})
			for (let i = 0; i < res2.data.data.length; i++) {
				list.push({
					id: res2.data.data[i].id,
					num: res2.data.data[i].num,
					name: res2.data.data1[i].name,
					price: res2.data.data1[i].price,
					proPic: res2.data.data1[i].proPic
				})
				this.setData({
					totalPrice: this.data.totalPrice + res2.data.data[i].num * res2.data.data1[i].price
				})
			}
			this.setData({
				productList: list
			})
			this.setData({
				totalPrice: this.data.totalPrice.toFixed(2) + ""
			})
			return
		}
		// 如果是从商品详情页过来的，根据商品id获取相关信息
		if (e.place === "detail") {
			const list = []
			const res3 = await axios.get(request.productBaseUrl + `/getOneProductById/${e.productId}`)
			console.log(res3)
			list.push({
				id: res3.data.data.id,
				num: e.productNum,
				name: res3.data.data.name,
				price: res3.data.data.price,
				proPic: res3.data.data.proPic
			})
			this.setData({
				productList: list,
				totalPrice: (e.productNum * res3.data.data.price).toFixed(2) + ""
			})
		}
	},
	// 去付款
	async goPay() {
		wx.showLoading({
			title: '正在提交订单',
			mask: true
		})
		let res = null
		// 从购物车过来的，创建订单
		if (this.data.place === "cart") {
			const obj = {
				openid: wx.getStorageSync('openid'),
				address: this.data.address,
				consignee: wx.getStorageSync('nickName')
			}
			res = await axios.post(request.newOrderBaseUrl + '/insertNewOrder', obj)
			wx.hideLoading()
			console.log(res)
		}
		// 从商品详情页过来的，创建订单
		if (this.data.place === "detail") {
			const obj = {
				openid: wx.getStorageSync('openid'),
				address: this.data.address,
				consignee: wx.getStorageSync('nickName'),
				productNum: this.data.productNum,
				productId: this.data.productId
			}
			res = await axios.post(request.newOrderBaseUrl + '/insertOneNewOrder', obj)
			wx.hideLoading()
			console.log(res)
		}
		if (res.data.data === "订单提交失败") {
			wx.showToast({
				title: '订单提交失败',
				icon: "none",
				mask: true
			})
			return
		}
		if (res.data.data === "订单提交成功") {
			wx.navigateTo({
				url: `/pages/pay/pay?price=${this.data.totalPrice}&orderNum=${res.data.data1}&place=${this.data.place}`,
			})
		}
	}
})