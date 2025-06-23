import request from '../../utils/request'
import axios from '../../utils/axios'

Page({

	data: {
		address: "",
		contentHeight: "",
		openid: "",
		cartList: [],
		isChooseAll: false,
		totalPrice: 0
	},
	async onLoad() {
		const windowHeight = wx.getWindowInfo().screenHeight
		const windowWidth = wx.getWindowInfo().windowWidth
		const screenTop = wx.getWindowInfo().screenTop
		const bili = windowHeight / windowWidth
		this.setData({
			contentHeight: (windowHeight - screenTop - 140 - wx.getWindowInfo().statusBarHeight) * bili / 7.5 + 'vw',
		})
	},
	async onTabItemTap() {
		const openid1 = wx.getStorageSync('openid')
		this.setData({
			openid: openid1
		})
		if (this.data.openid === '') {
			return
		}
		const res1 = await axios.get(request.addressBaseUrl + `/getDefaultAddress/${openid1}`)
		console.log(res1)
		this.setData({
			address: res1.data.data.provinceName + res1.data.data.cityName + res1.data.data.countryName + res1.data.data.detailName
		})
		const res2 = await axios.get(request.cartBaseUrl + `/getAllCart/${openid1}`)
		console.log(res2)
		const list = []
		for (let i = 0; i < res2.data.data.length; i++) {
			list.push({
				id: res2.data.data[i].id,
				isChecked: res2.data.data[i].isChecked,
				num: res2.data.data[i].num,
				name: res2.data.data1[i].name,
				price: res2.data.data1[i].price,
				proPic: res2.data.data1[i].proPic
			})
		}
		this.setData({
			cartList: list
		})
		this.checkIsChooseAll()
		this.statisticPrice()
	},
	async changeCheckBox(e) {
		this.setData({
			['cartList[' + e.currentTarget.dataset.index + '].isChecked']: this.data.cartList[e.currentTarget.dataset.index].isChecked === 1 ? 0 : 1
		})
		const obj = {
			openid: this.data.openid,
			id: e.currentTarget.dataset.id,
			isChecked: this.data.cartList[e.currentTarget.dataset.index].isChecked
		}
		wx.showLoading({
			title: '请稍后',
			mask: true
		})
		const res = await axios.post(request.cartBaseUrl + '/updateCartChecked', obj)
		wx.hideLoading()
		console.log(res)
		this.checkIsChooseAll()
		this.statisticPrice()
	},
	async changeStep(e) {
		this.setData({
			['cartList[' + e.currentTarget.dataset.index + '].num']: e.detail
		})
		const obj = {
			openid: this.data.openid,
			id: e.currentTarget.dataset.id,
			num: this.data.cartList[e.currentTarget.dataset.index].num
		}
		wx.showLoading({
			title: '请稍后',
			mask: true
		})
		const res = await axios.post(request.cartBaseUrl + '/updateCartNum', obj)
		wx.hideLoading()
		console.log(res)
		//如果没有选中，不需要计算价格，提高性能
		if(!this.data.cartList[e.currentTarget.dataset.index].isChecked) {
			return
		}
		this.statisticPrice()
	},
	async chooseAll() {
		this.setData({
			isChooseAll: !this.data.isChooseAll
		})
		for(let i = 0; i < this.data.cartList.length; i ++) {
			this.setData({
				[`cartList[${i}].isChecked`]: this.data.isChooseAll === true ? 1 : 0
			})
		}
		wx.showLoading({
			title: '请稍后',
			mask: true
		})
		const res = await axios.get(request.cartBaseUrl + `/updateAllCart/${this.data.isChooseAll === true ? 1 : 0}/${this.data.openid}`)
		wx.hideLoading()
		console.log(res)
		this.statisticPrice()
	},
	checkIsChooseAll() {
		if(this.data.cartList.length === 0) {
			this.setData({
				isChooseAll: false
			})
			return
		}
		for(let i = 0; i < this.data.cartList.length; i ++) {
			if(!this.data.cartList[i].isChecked) {
				this.setData({
					isChooseAll: false
				})
				return
			}
		}
		this.setData({
			isChooseAll: true
		})
	},
	statisticPrice() {
		this.setData({
			totalPrice: 0
		})
		for(let i = 0; i < this.data.cartList.length; i ++) {
			if(!this.data.cartList[i].isChecked) {
				continue
			}
			this.setData({
				totalPrice: this.data.totalPrice + this.data.cartList[i].num * this.data.cartList[i].price
			})
		}
	},
	overlimit(e) {
		if(e.detail === "plus") {
			wx.showToast({
				title: '单款最多可买200件',
				icon: "none",
				mask: true
			})
		}
	},
	async deleteProduct(e) {
		const res = await wx.showModal({
			content: '确定删除该物品吗',
		})
		console.log(res)
		if(res.confirm) {
			const res1 = await axios.get(request.cartBaseUrl + `/deleteCartById/${e.currentTarget.dataset.id}`)
			console.log(res1)
			this.onTabItemTap()
		}
	},
	goSettle() {
		wx.navigateTo({
			url: '/pages/settle/settle?place=cart',
		})
	}
})