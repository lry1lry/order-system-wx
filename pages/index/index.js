// index.js
import request from '../../utils/request'
import axios from '../../utils/axios'

Page({
	data: {
		productLbtPic: [], //商品轮播图数组
		bigTypeList: [], //目录数组
		hotProductList: [] //热门商品列表
	},
	onLoad() {
		this.getProductLbtPic()
		this.getBigType()
		this.getHotProduct()
	},
	//获取轮播图照片
	async getProductLbtPic() {
		const res = await axios.get(request.productBaseUrl + "/getProductLbtPic")
		console.log(res)
		this.setData({
			productLbtPic: res.data.data
		})
	},
	//获取目录照片
	async getBigType() {
		const res = await axios.get(request.bigTypeBaseUrl + "/getBigType")
		console.log(res)
		this.setData({
			bigTypeList: res.data.data
		})
	},
	//获取热门商品数据
	async getHotProduct() {
		const res = await axios.get(request.productBaseUrl + "/getHotProduct")
		console.log(res)
		this.setData({
		 hotProductList: res.data.data
		})
	},
	//去搜索页
	goSearch: () => {
		wx.navigateTo({
			url: '/pages/search/search',
		})
	},
	//去商品介绍页
	goProductDetail(e) {
		wx.navigateTo({
			url: `/pages/productDetail/productDetail?id=${e.currentTarget.dataset.id}`,
		})
	},
	//点击tanbar时，重新加载
	onTabItemTap() {
		this.onLoad()
	}
})
