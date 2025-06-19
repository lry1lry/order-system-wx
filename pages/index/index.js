// index.js
import request from '../../utils/request'
import axios from '../../utils/axios'

Page({
	data: {
		productLbtPic: [],
		bigTypeList: [],
		hotProductList: []
	},
	onLoad() {
		this.getProductLbtPic()
		this.getBigType()
		this.getHotProduct()
		this.getSystemInfo()
	},
	async getProductLbtPic() {
		const res = await axios.get(request.productBaseUrl + "/getProductLbtPic")
		console.log(res)
		this.setData({
			productLbtPic: res.data.data
		})
	},
	async getBigType() {
		const res = await axios.get(request.bigTypeBaseUrl + "/getBigType")
		console.log(res)
		this.setData({
			bigTypeList: res.data.data
		})
	},
	async getHotProduct() {
		const res = await axios.get(request.productBaseUrl + "/getHotProduct")
		console.log(res)
		this.setData({
		 hotProductList: res.data.data
		})
	},
	getSystemInfo() {
		const res = wx.getWindowInfo()
		console.log(res)
	},
	goSearch: () => {
		wx.navigateTo({
			url: '/pages/search/search',
		})
	}
})
