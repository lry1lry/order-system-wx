import request from '../../utils/request'
import axios from '../../utils/axios'

Page({

	data: {
		activeKey: 0,
		productList: [],
		typeId: 0,
		typeNode: []
	},
	async onLoad() {
		const res = await axios.get(request.typeBaseUrl + '/getAllType')
		console.log(res)
		const list = []
		for (let i = 0; i < res.data.data.length; i++) {
			if (res.data.data1[i].id !== this.data.typeId) {
				this.setData({
					typeId: res.data.data1[i].id
				})
				list.push({
					id: res.data.data1[i].id,
					titleName: res.data.data1[i].name,
					productList: [{
						id: res.data.data[i].id,
						productName: res.data.data[i].name,
						proPic: res.data.data[i].proPic
					}]
				})
				continue
			}
			list[list.length - 1].productList.push({
				id: res.data.data[i].id,
				productName: res.data.data[i].name,
				proPic: res.data.data[i].proPic
			})
		}
		console.log(list)
		this.setData({
			productList: list
		})
		//获取各个分类的节点信息
		const typeList = []
		for(let i = 0; i < list.length; i ++) {
			const query = wx.createSelectorQuery()
			query.select(`.type${i + 1}`).boundingClientRect(function (res) {
				typeList.push(res.top)
			})
			query.exec()
			this.setData({
				typeNode: typeList
			})
		}
	},
	onPageScroll(e) {
		let activeValue = 0
		for(let i = 0; i < this.data.typeNode.length; i ++) {
			if(e.scrollTop > this.data.typeNode[i] - 11) {
				activeValue = i
			}
		}
		this.setData({
			activeKey: activeValue
		})
	},
	changeSideBar(e) {
		wx.pageScrollTo({
			selector: `.type${e.detail + 1}`,
			offsetTop: -10
		})
	},
	goProductDetail(e) {
		wx.navigateTo({
			url: `/pages/productDetail/productDetail?id=${e.currentTarget.dataset.id}`,
		})
	}
})