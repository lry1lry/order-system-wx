import request from '../../utils/request'
import axios from '../../utils/axios'

Page({
	data: {
		searchValue: "", //输入框的内容
		timer: null, //定时器
		searchProductList: "", //搜索到的数据列表
		searchProductList1: "", //高亮处理过以后的数据列表
		contentHeight: "", //内容高度
		historyList: [], //历史数据
		productIdList: [] //商品列表
	},
	// 搜索框输入事件
	searchInput(e) {
		// 将数据列表重置
		this.setData({
			searchProductList: 0,
			searchProductList1: []
		})
		// 没有输入时，数据列表清空
		if (e.detail.value.trim() === "") {
			this.setData({
				searchProductList: 0
			})
			return
		}
		// 搜索框新增防抖功能，防止一些无效的请求对服务器造成压力
		// 如果有定时器在运行，先关闭之前的定时器，并重新创建一个新的定时器
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
			// 获取得到的数据列表
			const res = await axios.get(request.productBaseUrl + `/getSearchProduct/${this.data.searchValue}`)
			console.log(res)
			this.setData({
				searchProductList: res.data.data
			})
			let itemList = []
			// 对关键字进行高亮处理
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
	// 点击搜索按钮
	async search() {
		// 如果搜索框内容为空，则直接返回
		if(this.data.searchValue === '') {
			wx.showToast({
				title: '搜索框内容不能为空',
				icon: "none",
				mask: true
			})
			return
		}
		// 获取相关商品列表，将id放入集合中
		const list = []
		const res = await axios.get(request.productBaseUrl + `/getSearchProduct/${this.data.searchValue}`)
		console.log(res)
		for(let i = 0; i < res.data.data.length; i ++) {
			list.push(res.data.data[i].id)
		}
		this.setData({
			productIdList: list
		})
		// 将历史数据拿出来，先进行去重，再把搜索内容插入历史数据中
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
		// 清空搜索框中的数据
		this.setData({
			searchValue: ""
		})
		// 跳转到商品列表页
		wx.navigateTo({
			url: `/pages/productList/productList?id=${this.data.productIdList}&value=${value}`,
		})
	},
	// 清空搜索框的数据
	clearInput() {
		this.setData({
			searchValue: ""
		})
	},
	onLoad() {
		// 获取主体内容高度
		const windowHeight = wx.getWindowInfo().screenHeight
		const windowWidth = wx.getWindowInfo().windowWidth
		const screenTop = wx.getWindowInfo().screenTop
		const bili = windowHeight / windowWidth
		this.setData({
			contentHeight: (windowHeight - screenTop - 100 - wx.getWindowInfo().statusBarHeight) * bili / 7.5 + 'vw'
		})
		// 将历史记录拿出来
		if (wx.getStorageSync('historyList') === '') {
			wx.setStorageSync('historyList', [])
		} else {
			this.setData({
				historyList: wx.getStorageSync('historyList')
			})
		}
	},
	// 去商品详情页
	goProductDetail(e) {
		// 将商品信息去重后存入历史记录中
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
		// 如果是从搜索按钮过来的，去商品列表页
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
	// 清空历史记录
	clearHistory() {
		wx.removeStorageSync('historyList')
		this.setData({
			historyList: []
		})
	}
})