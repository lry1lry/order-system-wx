import request from '../../utils/request'
import axios from '../../utils/axios'

Page({

	data: {
		address: "", //地址
		contentHeight: "", //内容高度
		openid: "", //用户唯一标识
		cartList: [], //购物车列表
		isChooseAll: false, //是否全选
		totalPrice: 0 //总价格
	},
	async onLoad() {
		//根据不同的设备设置不同的高度
		const windowHeight = wx.getWindowInfo().screenHeight
		const windowWidth = wx.getWindowInfo().windowWidth
		const screenTop = wx.getWindowInfo().screenTop
		const bili = windowHeight / windowWidth
		this.setData({
			contentHeight: (windowHeight - screenTop - 140 - wx.getWindowInfo().statusBarHeight) * bili / 7.5 + 'vw',
		})
	},
	async onTabItemTap() {
		//获取用户openid,如果没有则返回
		const openid1 = wx.getStorageSync('openid')
		this.setData({
			openid: openid1
		})
		if (this.data.openid === '') {
			return
		}
		//获取用户的默认地址
		const res1 = await axios.get(request.addressBaseUrl + `/getDefaultAddress/${openid1}`)
		console.log(res1)
		this.setData({
			address: res1.data.data.provinceName + res1.data.data.cityName + res1.data.data.countryName + res1.data.data.detailName
		})
		//获取用户的购物车信息，将结果保存到数组中
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
	//改变复选框时触发的事件
	async changeCheckBox(e) {
		//将该复选框原本的内容取反
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
		//修改数据库中复选框的数据
		const res = await axios.post(request.cartBaseUrl + '/updateCartChecked', obj)
		wx.hideLoading()
		console.log(res)
		this.checkIsChooseAll()
		this.statisticPrice()
	},
	//改变商品数量时触发的事件
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
		//修改数据库中商品数量的数据
		const res = await axios.post(request.cartBaseUrl + '/updateCartNum', obj)
		wx.hideLoading()
		console.log(res)
		//如果没有选中，不需要计算价格，提高性能
		if (!this.data.cartList[e.currentTarget.dataset.index].isChecked) {
			return
		}
		this.statisticPrice()
	},
	//全选反选
	async chooseAll() {
		//如果购物车内容为空，直接返回
		if (this.data.cartList.length === 0) {
			return
		}
		//将原本复选框的结果取反
		this.setData({
			isChooseAll: !this.data.isChooseAll
		})
		//修改所有商品的复选框的内容
		for (let i = 0; i < this.data.cartList.length; i++) {
			this.setData({
				[`cartList[${i}].isChecked`]: this.data.isChooseAll === true ? 1 : 0
			})
		}
		wx.showLoading({
			title: '请稍后',
			mask: true
		})
		//修改数据库中复选框的数据
		const res = await axios.get(request.cartBaseUrl + `/updateAllCart/${this.data.isChooseAll === true ? 1 : 0}/${this.data.openid}`)
		wx.hideLoading()
		console.log(res)
		this.statisticPrice()
	},
	//检查是否全选
	checkIsChooseAll() {
		//如果购物车数据为空，直接返回
		if (this.data.cartList.length === 0) {
			this.setData({
				isChooseAll: false
			})
			return
		}
		//遍历整个购物车，如果有一个商品没有选中，就不应该全选
		for (let i = 0; i < this.data.cartList.length; i++) {
			if (!this.data.cartList[i].isChecked) {
				this.setData({
					isChooseAll: false
				})
				return
			}
		}
		//所有商品都已选中，全选
		this.setData({
			isChooseAll: true
		})
	},
	//统计价格
	statisticPrice() {
		//价格先重置
		this.setData({
			totalPrice: 0
		})
		//遍历整个购物车，如果该商品没有选中，则不统计该商品的价格
		for (let i = 0; i < this.data.cartList.length; i++) {
			if (!this.data.cartList[i].isChecked) {
				continue
			}
			this.setData({
				totalPrice: this.data.totalPrice + this.data.cartList[i].num * this.data.cartList[i].price
			})
		}
	},
	//购物车数量超出限制时给出的提示信息
	overlimit(e) {
		if (e.detail === "plus") {
			wx.showToast({
				title: '单款最多可买200件',
				icon: "none",
				mask: true
			})
		}
	},
	//右滑删除商品时触发的事件
	async deleteProduct(e) {
		const res = await wx.showModal({
			content: '确定删除该物品吗',
		})
		console.log(res)
		if (res.confirm) {
			//通过id删除商品
			const res1 = await axios.get(request.cartBaseUrl + `/deleteCartById/${e.currentTarget.dataset.id}`)
			console.log(res1)
			//重新获取数据并渲染
			this.onTabItemTap()
		}
	},
	//去结算
	goSettle() {
		wx.navigateTo({
			url: '/pages/settle/settle?place=cart',
		})
	}
})