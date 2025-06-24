import request from '../../utils/request'
import axios from '../../utils/axios'

Page({

	data: {
		productValue: "", //商品名称
		contentHeight: "", //内容高度
		isShowError: false, //是否展示错误信息
		active: 0, //选中的标签
		allProductList: [], //商品列表
		pageArgs: {}, //上个页面传递过来的数据
		isPriceOrderByDesc: false, //价格是否按降序排序
		isClickWithoutChange: false //在点击之前有没有触发changeTab事件
	},
	onLoad(e) {
		this.setData({
			pageArgs: e
		})
		// 获取内容高度
		const windowHeight = wx.getWindowInfo().screenHeight
		const windowWidth = wx.getWindowInfo().windowWidth
		const screenTop = wx.getWindowInfo().screenTop
		const bili = windowHeight / windowWidth
		this.setData({
			contentHeight: (windowHeight - screenTop - 100 - wx.getWindowInfo().statusBarHeight) * bili / 7.5 + 'vw',
			productValue: this.data.pageArgs.value
		})
		// 获取全部商品信息
		this.goAll()
	},
	// 改变标签页时触发的事件
	changeTab(e) {
		this.setData({
			active: e.detail.index,
			isClickWithoutChange: false
		})
		// 全部
		if (e.detail.index === 0) {
			this.goAll()
		}
		// 销量
		if (e.detail.index === 1) {
			this.goSale()
		}
		// 价格
		if (e.detail.index === 2) {
			if (this.data.isPriceOrderByDesc) {
				// 降序
				this.goPriceDesc()
			} else {
				// 升序
				this.goPriceAsc()
			}
		}
	},
	// 获取全部商品信息
	async goAll() {
		// 获取不到id信息，显示错误信息
		if (this.data.pageArgs.id === "") {
			this.setData({
				isShowError: true
			})
			return
		}
		// 从搜索历史过来的，找到相关的商品列表
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
		// 从搜索按钮过来的
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
		// 从历史记录过来的
		if (this.data.pageArgs.id === "-1") {
			const res = await axios.get(request.productBaseUrl + `/getSearchProduct/${this.data.pageArgs.value}`)
			console.log(res)
			for (let i = 0; i < res.data.data.length; i++) {
				list.push(res.data.data[i].id)
			}
		} else {
			// 从搜索按钮过来的
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
		// 从历史记录过来的
		if (this.data.pageArgs.id === "-1") {
			const res = await axios.get(request.productBaseUrl + `/getSearchProduct/${this.data.pageArgs.value}`)
			console.log(res)
			for (let i = 0; i < res.data.data.length; i++) {
				list.push(res.data.data[i].id)
			}
		} else {
			// 从搜索按钮过来的
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
		// 从历史记录过来的
		if (this.data.pageArgs.id === "-1") {
			const res = await axios.get(request.productBaseUrl + `/getSearchProduct/${this.data.pageArgs.value}`)
			console.log(res)
			for (let i = 0; i < res.data.data.length; i++) {
				list.push(res.data.data[i].id)
			}
		} else {
			// 从搜索按钮过来的
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
	// 点击标签页
	clickTab(e) {
		// 如果触发了change事件，返回
		if (!this.data.isClickWithoutChange) {
			this.setData({
				isClickWithoutChange: true
			})
			return
		}
		// 如果点击的是价格
		if (e.detail.index === 2) {
			this.setData({
				isPriceOrderByDesc: !this.data.isPriceOrderByDesc,
				isClickWithoutChange: true
			})
			// 判断是执行降序还是升序操作
			if (this.data.isPriceOrderByDesc) {
				this.goPriceDesc()
			} else {
				this.goPriceAsc()
			}
		}
	},
	// 去商品详情页
	goProductDetail(e) {
		wx.navigateTo({
			url: `/pages/productDetail/productDetail?id=${e.currentTarget.dataset.id}`,
		})
	}
})