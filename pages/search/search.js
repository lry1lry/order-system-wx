import request from '../../utils/request'
import axios from '../../utils/axios'

Page({
	data: {
		searchValue: "",
		timer: null,
		searchProductList: "",
		searchProductList1: "",
		contentHeight: ""
	},
	searchInput(e) {
		this.setData({
			searchProductList: 0,
			searchProductList1: []
		})
		if(e.detail.value.trim() === "") {
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
			this.data.searchProductList.forEach((item, index)=> {
				let itemStr = ""
				let startStr = item.name.substring(0, item.name.indexOf(e.detail.value))
				let middleStr = e.detail.value
				let endStr = item.name.substring(item.name.indexOf(e.detail.value) + e.detail.value.length, item.name.length)
				itemStr = `${startStr}<span class="special">${middleStr}</span>${endStr}`
				itemList.push(itemStr)
				this.setData({
					searchProductList1: itemList
				})
			})
		}, 1000)
		this.setData({
			timer: timer1,
		})
	},
	search() {
		console.log(this.data.searchValue)
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
			contentHeight: (windowHeight - screenTop - 100 - wx.getWindowInfo().statusBarHeight)  * bili / 7.5 + 'vw'
		})
	}
})