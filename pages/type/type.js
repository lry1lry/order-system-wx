import request from '../../utils/request'
import axios from '../../utils/axios'

Page({

	data: {
		activeKey: 0, //选中的分类
		productList: [], //商品列表
		typeId: 0, //分类id，用来判断是不是属于同一个分类
		typeNode: [] //各个分类距离顶部的距离
	},
	async onLoad() {
		// 获取所有商品及其类别
		const res = await axios.get(request.typeBaseUrl + '/getAllType')
		console.log(res)
		const list = []
		for (let i = 0; i < res.data.data.length; i++) {
			// 如果不是同一个类，在list中插入对应数据
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
			// 如果是同一个类,在productList中插入相关数据
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
		//获取各个分类的节点信息，并且将顶部距离插入到数组中
		const typeList = []
		for (let i = 0; i < list.length; i++) {
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
	// 页面滚动事件
	onPageScroll(e) {
		let activeValue = 0
		for (let i = 0; i < this.data.typeNode.length; i++) {
			if (e.scrollTop > this.data.typeNode[i] - 11) {
				activeValue = i
			}
		}
		this.setData({
			activeKey: activeValue
		})
	},
	// 改变侧边导航事件
	changeSideBar(e) {
		wx.pageScrollTo({
			selector: `.type${e.detail + 1}`,
			offsetTop: -10
		})
	},
	// 去商品详情页
	goProductDetail(e) {
		wx.navigateTo({
			url: `/pages/productDetail/productDetail?id=${e.currentTarget.dataset.id}`,
		})
	}
})