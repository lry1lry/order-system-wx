import request from '../../utils/request'
import axios from '../../utils/axios'

Page({

	data: {
		order: {},
		orderNum: ""
	},
	async onLoad(e) {
		const res = await axios.get(request.newOrderBaseUrl + `/getOneOrderById/${e.id}`)
		console.log(res)
		const obj = {
			status: res.data.data.status,
			proPic: res.data.data1.proPic,
			name: res.data.data1.name,
			price: res.data.data1.price,
			num: res.data.data.productNum,
			totalPrice: (res.data.data1.price * res.data.data.productNum).toFixed(2) + "",
			orderNum: res.data.data.orderNum,
			createTime: res.data.data.createTime.replace("T", " ")
		}
		this.setData({
			order: obj,
			orderNum: res.data.data.orderNum
		})
	},
	async goPay() {
		const res = await axios.get(request.newOrderBaseUrl + `/getRemainTime/${this.data.orderNum}`)
		console.log(res)
		if(res.data.data > 15 * 60) {
			wx.showToast({
				title: '该订单已超时，系统已为您自动取消',
				icon: "none",
				mask: true
			})
			return
		}
		const res1 = await axios.get(request.newOrderBaseUrl + `/getOrderByOrderNum/${this.data.orderNum}`)
		console.log(res1)
		let price = 0
		for(let i = 0; i < res1.data.data.length; i ++) {
				price =  price + res1.data.data[i].productNum * res1.data.data1[i].price
		}
		wx.navigateTo({
			url: `/pages/pay/pay?price=${price}&orderNum=${this.data.orderNum}`,
		})
	}
})