import request from '../../utils/request'
import axios from '../../utils/axios'

Page({
	data: {
		product: '',
		count: 1,
		show: false,
		address: ""
	},
	async onLoad(e) {
		console.log(e)
		const res = await axios.get(request.productBaseUrl + `/getOneProductById/${e.id}`)
		console.log(res)
		this.setData({
			product: res.data.data
		})
		if(wx.getStorageSync('openid') === '') {
			return
		}
		const openid = wx.getStorageSync('openid')
		const res1 = await axios.get(request.addressBaseUrl + `/getDefaultAddress/${openid}`)
		console.log(res1)
		this.setData({
			address: res1.data.data.provinceName + res1.data.data.cityName + res1.data.data.countryName + res1.data.data.detailName
		})
	},
	addCart() {
		if(wx.getStorageSync('openid') === '') {
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
	closePopup() {
		this.setData({
			show: false
		})
	},
	changeStep(e) {
		this.setData({
			count: e.detail
		})
	},
	async chooseAddress() {
		if(wx.getStorageSync('openid') === '') {
			wx.showToast({
				title: '您还未登录，登录之后再来使用该功能',
				mask: true,
				icon: "none"
			})
			return
		}
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
		if(res1.data.data === "添加成功") {
			this.setData({
				address: res.provinceName + res.cityName + res.countyName + res.detailInfo
			})
		}
	},
	async confirmAddCart() {
		if(wx.getStorageSync('openid') === '') {
			wx.showToast({
				title: '您还未登录，登录之后再来使用该功能',
				mask: true,
				icon: "none"
			})
			return
		}
		if(this.data.address === "") {
			wx.showToast({
				title: '请先选择收货地址',
				icon: "none",
				mask: true
			})
			return
		}
		const obj = {
			openid: wx.getStorageSync('openid'),
			productId: this.data.product.id,
			num: this.data.count,
			isChecked: 0 
		}
		const res = await axios.post(request.cartBaseUrl + '/insertCart', obj)
		console.log(res)
		if(res.data.data === "加入购物车成功") {
			wx.showToast({
				title: '加入购物车成功',
				mask: true
			})
			this.setData({
				show: false
			})
		}else {
			wx.showToast({
				title: '加入购物车失败',
				icon: "none",
				mask: true
			})
		}
	}
})