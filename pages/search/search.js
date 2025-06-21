import request from '../../utils/request'
import axios from '../../utils/axios'

Page({
	data: {
		searchValue: "",
		timer: null,
		searchProductList: "",
		searchProductList1: "",
		contentHeight: "",
		historyList: [],
		productIdList: []
	},
	searchInput(e) {
		this.setData({
			searchProductList: 0,
			searchProductList1: []
		})
		if (e.detail.value.trim() === "") {
			this.setData({
				searchProductList: 0
			})
			return
		}
		if (this.data.timer) {
			clearTimeout(this.data.timer)
			this.setData({
				timer: null,
				timer1: null
			})
		}
		let timer1 = setTimeout(async () => {
			this.setData({
				searchValue: e.detail.value
			})
			const res = await axios.get(request.productBaseUrl + `/getSearchProduct/${this.data.searchValue}`)
			console.log(res)
			this.setData({
				searchProductList: res.data.data
			})
			let itemList = []
			this.data.searchProductList.forEach((item, index) => {
				let itemStr = ""
				let startStr = item.name.substring(0, item.name.indexOf(e.detail.value))
				let middleStr = e.detail.value
				let endStr = item.name.substring(item.name.indexOf(e.detail.value) + e.detail.value.length, item.name.length)
				itemStr = `${startStr}<span class="special">${middleStr}</span>${endStr}`
				const itemObj = {
					itemStr,
					id: item.id,
					name: item.name
				}
				itemList.push(itemObj)
				this.setData({
					searchProductList1: itemList
				})
			})
		}, 1000)
		this.setData({
			timer: timer1,
		})
	},
	async search() {
		if(this.data.searchValue === '') {
			wx.showToast({
				title: '搜索框内容不能为空',
				icon: "none",
				mask: true
			})
			return
		}
		const list = []
		const res = await axios.get(request.productBaseUrl + `/getSearchProduct/${this.data.searchValue}`)
		console.log(res)

		for(let i = 0; i < res.data.data.length; i ++) {
			list.push(res.data.data[i].id)
		}
		this.setData({
			productIdList: list
		})
		let list1 = wx.getStorageSync('historyList')
		list1 = list1.filter((item, index) => {
			return item.name !== this.data.searchValue
		})
		const obj = {
			id: -1,
			name: this.data.searchValue
		}
		list1.unshift(obj)
		this.setData({
			historyList: list1
		})
		wx.setStorageSync('historyList', this.data.historyList)
		const value = this.data.searchValue
		this.setData({
			searchValue: ""
		})
		wx.navigateTo({
			url: `/pages/productList/productList?id=${this.data.productIdList}&value=${value}`,
		})
	},
	clearInput() {
		this.setData({
			searchValue: ""
		})
	},
	onLoad() {
		const windowHeight = wx.getWindowInfo().screenHeight
		const windowWidth = wx.getWindowInfo().windowWidth
		const screenTop = wx.getWindowInfo().screenTop
		const bili = windowHeight / windowWidth
		this.setData({
			contentHeight: (windowHeight - screenTop - 100 - wx.getWindowInfo().statusBarHeight) * bili / 7.5 + 'vw'
		})
		if (wx.getStorageSync('historyList') === '') {
			wx.setStorageSync('historyList', [])
		} else {
			this.setData({
				historyList: wx.getStorageSync('historyList')
			})
		}
	},
	goProductDetail(e) {
		let list = wx.getStorageSync('historyList')
		list = list.filter((item, index) => {
			return item.name !== e.currentTarget.dataset.name
		})
		const obj = {
			id: e.currentTarget.dataset.id,
			name: e.currentTarget.dataset.name
		}
		list.unshift(obj)
		this.setData({
			historyList: list
		})
		wx.setStorageSync('historyList', this.data.historyList)
		this.setData({
			searchValue: ""
		})
		if(e.currentTarget.dataset.id === -1) {
			wx.navigateTo({
				url: `/pages/productList/productList?id=-1&value=${e.currentTarget.dataset.name}`,
			})
			return
		}
		wx.navigateTo({
			url: `/pages/productDetail/productDetail?id=${e.currentTarget.dataset.id}`,
		})
	},
	clearHistory() {
		wx.removeStorageSync('historyList')
		this.setData({
			historyList: []
		})
	}
})