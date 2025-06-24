import request from '../../utils/request'
import axios from '../../utils/axios'

Page({

	data: {
		active: 0, //选中的标签
		openid: "", //用户唯一id
		orderList: [] //订单列表
	},
	async onLoad(options) {
		//如果没有获取到openid,直接返回
		if (wx.getStorageSync('openid') === '') {
			return
		}
		this.setData({
			openid: wx.getStorageSync('openid')
		})
		//检查未支付订单中是否有超时订单，如果有，改变该订单的状态
		const res = await axios.get(request.newOrderBaseUrl + '/checkTimeOutOrder')
		console.log(res)
		//获取该用户的全部订单信息
		this.getOrder(3)
	},
	// 改变标签页时触发的事件
	changeTab(e) {
		if (e.detail.index === 0) {
			this.getOrder(3)
			return
		}
		if (e.detail.index === 1) {
			this.getOrder(0)
			return
		}
		if (e.detail.index === 2) {
			this.getOrder(1)
			return
		}
		if (e.detail.index === 3) {
			this.getOrder(2)
			return
		}
	},
	// 获取订单状态，e表示订单状态，3表示全部订单
	async getOrder(e) {
		wx.showLoading({
			title: '正在查询订单信息',
			mask: true
		})
		//获取订单信息，并将结果放入数组中
		const res = await axios.get(request.newOrderBaseUrl + `/getAllOrderByOpenidAndStatus/${this.data.openid}/${e}`)
		wx.hideLoading()
		console.log(res)
		const list = []
		for (let i = 0; i < res.data.data.length; i++) {
			list.push({
				id: res.data.data[i].id,
				orderNum: res.data.data[i].orderNum,
				proPic: res.data.data1[i].proPic,
				name: res.data.data1[i].name,
				status: res.data.data[i].status === "0" ? "待支付" : res.data.data[i].status === "1" ? "已支付" : "已取消"
			})
		}
		this.setData({
			orderList: list
		})
	},
	// 去订单详情页
	goOrderDetail(e) {
		wx.navigateTo({
			url: `/pages/orderDetail/orderDetail?id=${e.currentTarget.dataset.id}`,
		})
	}
})