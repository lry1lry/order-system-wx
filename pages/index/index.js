// index.js
import request from '../../utils/request'
import axios from '../../utils/axios'

Page({
	data: {
		productLbtPic: []
	},
	onLoad() {
		this.getProductLbtPic()
	},
	async getProductLbtPic() {
		// const res = await axios.get(request.productBaseUrl + "/getProductLbtPic")
		// console.log(res)
		// this.setData({
		// 	productLbtPic: res.data.data
		// })
	}
})
