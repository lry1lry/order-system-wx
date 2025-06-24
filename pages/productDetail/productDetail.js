import request from '../../utils/request'
import axios from '../../utils/axios'

Page({
	data: {
		product: '', //商品对象
		count: 1, //商品数量
		show: false, //购物车弹出框
		show1: false, //立即购买弹出框
		address: "" //地址
	},
	async onLoad(e) {
		console.log(e)
		// 根据id获取单个商品的信息
		const res = await axios.get(request.productBaseUrl + `/getOneProductById/${e.id}`)
		console.log(res)
		this.setData({
			product: res.data.data
		})
		// 如果没有登录，直接返回
		if (wx.getStorageSync('openid') === '') {
			return
		}
		const openid = wx.getStorageSync('openid')
		// 获取用户的默认地址
		const res1 = await axios.get(request.addressBaseUrl + `/getDefaultAddress/${openid}`)
		console.log(res1)
		this.setData({
			address: res1.data.data.provinceName + res1.data.data.cityName + res1.data.data.countryName + res1.data.data.detailName
		})
	},
	// 加入购物车
	addCart() {
		// 没有登录，直接返回
		if (wx.getStorageSync('openid') === '') {
			wx.showToast({
				title: '您还未登录，登录之后再来使用该功能',
				mask: true,
				icon: "none"
			})
			return
		}
		this.setData({
			show: true
		})
	},
	// 点击弹出层的×以后，关闭弹出层
	closePopup() {
		this.setData({
			show: false,
			show1: false
		})
	},
	// 改变商品数量
	changeStep(e) {
		this.setData({
			count: e.detail
		})
	},
	// 选择默认地址
	async chooseAddress() {
		// 没有登录，直接返回
		if (wx.getStorageSync('openid') === '') {
			wx.showToast({
				title: '您还未登录，登录之后再来使用该功能',
				mask: true,
				icon: "none"
			})
			return
		}
		// 将获取到的信息保存到数据库中
		const res = await wx.chooseAddress()
		console.log(res)
		const obj = {
			username: wx.getStorageSync('nickName'),
			openid: wx.getStorageSync('openid'),
			cityName: res.cityName,
			countryName: res.countyName,
			detailName: res.detailInfo,
			provinceName: res.provinceName,
			isDefault: 1
		}
		const res1 = await axios.post(request.addressBaseUrl + '/insertAddress', obj)
		console.log(res1)
		if (res1.data.data === "添加成功") {
			this.setData({
				address: res.provinceName + res.cityName + res.countyName + res.detailInfo
			})
		}
	},
	// 确认加入购物车
	async confirmAddCart() {
		if (wx.getStorageSync('openid') === '') {
			wx.showToast({
				title: '您还未登录，登录之后再来使用该功能',
				mask: true,
				icon: "none"
			})
			return
		}
		if (this.data.address === "") {
			wx.showToast({
				title: '请先选择收货地址',
				icon: "none",
				mask: true
			})
			return
		}
		// 将相关商品信息放入购物车中
		const obj = {
			openid: wx.getStorageSync('openid'),
			productId: this.data.product.id,
			num: this.data.count,
			isChecked: 0
		}
		const res = await axios.post(request.cartBaseUrl + '/insertCart', obj)
		console.log(res)
		// 数量超过限制的提示
		if (res.data.data === "数量超过限制") {
			wx.showToast({
				title: '购物车中单款最多可添加200件',
				icon: "none",
				mask: true
			})
			return
		}
		if (res.data.data === "加入购物车成功") {
			wx.showToast({
				title: '加入购物车成功',
				mask: true
			})
			this.setData({
				show: false
			})
		} else {
			wx.showToast({
				title: '加入购物车失败',
				icon: "none",
				mask: true
			})
		}
	},
	// 立即购买
	purchaseNow() {
		if (wx.getStorageSync('openid') === '') {
			wx.showToast({
				title: '您还未登录，登录之后再来使用该功能',
				mask: true,
				icon: "none"
			})
			return
		}
		this.setData({
			show1: true
		})
	},
	// 确认购买
	confirmPurchase() {
		if (wx.getStorageSync('openid') === '') {
			wx.showToast({
				title: '您还未登录，登录之后再来使用该功能',
				mask: true,
				icon: "none"
			})
			return
		}
		if (this.data.address === "") {
			wx.showToast({
				title: '请先选择收货地址',
				icon: "none",
				mask: true
			})
			return
		}
		wx.navigateTo({
			url: `/pages/settle/settle?place=detail&productId=${this.data.product.id}&productNum=${this.data.count}`,
		})
	}
})