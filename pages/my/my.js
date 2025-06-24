import request from '../../utils/request'
import axios from '../../utils/axios'

Page({
	data: {
		userPic: '', //用户头像
		username: "", //昵称
		openId: "" //用户唯一id
	},
	//获取用户头像
	async getAvatar(e) {
		console.log(e)
		//将用户头像保存到阿里云服务器中
		const res = await axios.upload(request.uploadBaseUrl + '/changeAvatar', e.detail.avatarUrl)
		console.log(res)
		this.setData({
			userPic: res.data
		})
		const obj = {
			id: wx.getStorageSync('id'),
			avatarUrl: res.data
		}
		//将头像地址保存到数据库中
		const res1 = await axios.post(request.wxUserInfoBaseUrl + '/updateAvatar', obj)
		console.log(res1)
		if (res1.data.data === "更新成功") {
			wx.setStorageSync('avatarUrl', res.data)
		}
	},
	// 登录
	async login() {
		wx.showLoading({
			title: '正在登录',
			mask: true
		})
		// 获取code
		const res0 = await axios.login()
		console.log(res0)
		// 根据code到后端拿到openid等信息
		const res1 = await axios.get(request.wxUserInfoBaseUrl + `/getLoginInfo/${res0.code}`)
		console.log(res1)
		wx.hideLoading()
		if (res1.data.msg === "success") {
			const obj = {
				openid: res1.data.data.openid,
				nickName: "",
				avatarUrl: 'https://oss.lry.icu/login_pic.png'
			}
			//根据openid拿到用户相关信息
			const res3 = await axios.post(request.wxUserInfoBaseUrl + '/login', obj)
			console.log(res3)
			if (res3.data.msg === "success") {
				//将相关信息放到本地缓存中
				wx.setStorageSync('openid', res3.data.data.openid)
				wx.setStorageSync('id', res3.data.data.id)
				this.setData({
					openId: res3.data.data.openid
				})
				//如果头像不为空，用返回过来的头像，如果为空，用默认头像
				if (res3.data.data.avatarUrl !== null) {
					this.setData({
						userPic: res3.data.data.avatarUrl
					})
					wx.setStorageSync('avatarUrl', res3.data.data.avatarUrl)
				} else {
					this.setData({
						userPic: 'https://oss.lry.icu/login_pic.png'
					})
					wx.setStorageSync('avatarUrl', 'https://oss.lry.icu/login_pic.png')
				}
				//如果昵称不为空，用返回过来的昵称，如果为空，用空来代替
				if (res3.data.data.nickName !== null) {
					this.setData({
						username: res3.data.data.nickName
					})
					wx.setStorageSync('nickName', res3.data.data.nickName)
				} else {
					this.setData({
						username: ""
					})
					wx.setStorageSync('nickName', "")
				}
				wx.showToast({
					title: '登录成功',
					mask: true
				})
			}
		}
	},
	onLoad() {
		this.setData({
			openId: wx.getStorageSync('openid'),
			userPic: wx.getStorageSync('avatarUrl'),
			username: wx.getStorageSync('nickName')
		})
	},
	//用户输入昵称事件
	nickNameInput(e) {
		const obj = {
			id: wx.getStorageSync('id'),
			nickName: e.detail.value
		}
		//将输入的昵称更新到数据库中
		const res = axios.post(request.wxUserInfoBaseUrl + '/updateNickName', obj)
		wx.setStorageSync('nickName', e.detail.value)
	},
	// 退出
	async exit() {
		const res = await wx.showModal({
			content: '确定要退出吗'
		})
		console.log(res)
		if (res.confirm === true) {
			// 将内容全部清除
			this.setData({
				userPic: '',
				username: "",
				openId: ""
			})
			wx.removeStorageSync('openid')
			wx.removeStorageSync('id')
			wx.removeStorageSync('avatarUrl')
			wx.removeStorageSync('nickName')
			wx.showToast({
				title: '退出成功',
				mask: true
			})
		}
	},
	// 去我的订单
	async goMyOrder() {
		// 登录以后才可以进行跳转
		if (wx.getStorageSync('openid') === '') {
			const res = await wx.showModal({
				content: '登录即可查看相关信息',
			})
			return
		}
		wx.navigateTo({
			url: '/pages/myOrder/myOrder',
		})
	}
})