import request from '../../utils/request'
import axios from '../../utils/axios'

Page({

	data: {
		productValue: "",
		contentHeight: "",
		isShowError: false,
		active: 0,
		allProductList: [],
		pageArgs: {},
		isPriceOrderByDesc: false,
		isClickWithoutChange: false
	},
	onLoad(e) {
		this.setData({
			pageArgs: e
		})
		const windowHeight = wx.getWindowInfo().screenHeight
		const windowWidth = wx.getWindowInfo().windowWidth
		const screenTop = wx.getWindowInfo().screenTop
		const bili = windowHeight / windowWidth
		this.setData({
			contentHeight: (windowHeight - screenTop - 100 - wx.getWindowInfo().statusBarHeight) * bili / 7.5 + 'vw',
			productValue: this.data.pageArgs.value
		})
		this.goAll()
	},
	changeTab(e) {
		this.setData({
			active: e.detail.index,
			isClickWithoutChange: false
		})
		if (e.detail.index === 0) {
			this.goAll()
		}
		if (e.detail.index === 1) {
			this.goSale()
		}
		if(e.detail.index === 2) {
			if(this.data.isPriceOrderByDesc) {
				this.goPriceDesc()
			}else {
				this.goPriceAsc()
			}
		}
	},
	async goAll() {
		if (this.data.pageArgs.id === "") {
			this.setData({
				isShowError: true
			})
			return
		}
		if (this.data.pageArgs.id === "-1") {
			const res = await axios.get(request.productBaseUrl + `/getSearchProduct/${this.data.pageArgs.value}`)
			console.log(res)
			if (res.data.data.length === 0) {
				this.setData({
					isShowError: true
				})
				return
			}
			const list = []
			for (let i = 0; i < res.data.data.length; i++) {
				list.push(res.data.data[i])
			}
			this.setData({
				allProductList: list
			})
			return
		}
		const list = this.data.pageArgs.id.split(",")
		console.log(list)
		const res = await axios.get(request.productBaseUrl + `/getSearchProductByList/${list}`)
		console.log(res)
		const list1 = []
		for (let i = 0; i < res.data.data.length; i++) {
			list1.push(res.data.data[i])
		}
		this.setData({
			allProductList: list1
		})
	},
	async goSale() {
		let list = []
		if (this.data.pageArgs.id === "-1") {
			const res = await axios.get(request.productBaseUrl + `/getSearchProduct/${this.data.pageArgs.value}`)
			console.log(res)
			for (let i = 0; i < res.data.data.length; i++) {
				list.push(res.data.data[i].id)
			}
		}else {
			list = this.data.pageArgs.id.split(",")
		}
		const res = await axios.get(request.productBaseUrl + `/getSearchProductByListOrderBySale/${list}`)
		console.log(res)
		const list1 = []
		for (let i = 0; i < res.data.data.length; i++) {
			list1.push(res.data.data[i])
		}
		this.setData({
			allProductList: list1
		})
	},
	async goPriceAsc() {
		let list = []
		if (this.data.pageArgs.id === "-1") {
			const res = await axios.get(request.productBaseUrl + `/getSearchProduct/${this.data.pageArgs.value}`)
			console.log(res)
			for (let i = 0; i < res.data.data.length; i++) {
				list.push(res.data.data[i].id)
			}
		}else {
			list = this.data.pageArgs.id.split(",")
		}
		const res = await axios.get(request.productBaseUrl + `/getSearchProductByListOrderByPriceAsc/${list}`)
		console.log(res)
		const list1 = []
		for (let i = 0; i < res.data.data.length; i++) {
			list1.push(res.data.data[i])
		}
		this.setData({
			allProductList: list1
		})
	},
	async goPriceDesc() {
		let list = []
		if (this.data.pageArgs.id === "-1") {
			const res = await axios.get(request.productBaseUrl + `/getSearchProduct/${this.data.pageArgs.value}`)
			console.log(res)
			for (let i = 0; i < res.data.data.length; i++) {
				list.push(res.data.data[i].id)
			}
		}else {
			list = this.data.pageArgs.id.split(",")
		}
		const res = await axios.get(request.productBaseUrl + `/getSearchProductByListOrderByPriceDesc/${list}`)
		console.log(res)
		const list1 = []
		for (let i = 0; i < res.data.data.length; i++) {
			list1.push(res.data.data[i])
		}
		this.setData({
			allProductList: list1
		})
	},
	clickTab(e) {
		if(!this.data.isClickWithoutChange) {
			this.setData({
				isClickWithoutChange: true
			})
			return
		}
		if(e.detail.index === 2) {
			this.setData({
				isPriceOrderByDesc: !this.data.isPriceOrderByDesc,
				isClickWithoutChange: true
			})
			if(this.data.isPriceOrderByDesc) {
				this.goPriceDesc()
			}else {
				this.goPriceAsc()
			}
		}
	},
	goProductDetail(e) {
		wx.navigateTo({
			url: `/pages/productDetail/productDetail?id=${e.currentTarget.dataset.id}`,
		})
	}
})