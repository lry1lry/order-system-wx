import request from '../../utils/request'
import axios from '../../utils/axios'

Page({
	data: {
		userPic: '',
		username: "",
		openId: ""
	},
	async getAvatar(e) {
		console.log(e)
		const res = await axios.upload(request.uploadBaseUrl + '/changeAvatar', e.detail.avatarUrl)
		console.log(res)
		this.setData({
			userPic: res.data
		})
		const obj = {
			id: wx.getStorageSync('id'),
			avatarUrl: res.data
		}
		const res1 = await axios.post(request.wxUserInfoBaseUrl + '/updateAvatar', obj)
		console.log(res1)
		if(res1.data.data === "更新成功") {
			wx.setStorageSync('avatarUrl', res.data)
		}
	},
	async login() {
		wx.showLoading({
			title: '正在登录',
			mask: true
		})
		const res0 = await axios.login()
		console.log(res0)
		const res1 = await axios.get(request.wxUserInfoBaseUrl + `/getLoginInfo/${res0.code}`)
		console.log(res1)
		wx.hideLoading()
		if(res1.data.msg === "success") {
			const obj = {
				openid: res1.data.data.openid,
				nickName: "",
				avatarUrl: 'https://oss.lry.icu/login_pic.png'
			}
			const res3 = await axios.post(request.wxUserInfoBaseUrl + '/login', obj)
			console.log(res3)
			if(res3.data.msg === "success") {
				wx.setStorageSync('openid', res3.data.data.openid)
				wx.setStorageSync('id', res3.data.data.id)
				this.setData({
					openId: res3.data.data.openid
				})
				if(res3.data.data.avatarUrl !== null) {
					this.setData({
						userPic: res3.data.data.avatarUrl
					})
					wx.setStorageSync('avatarUrl', res3.data.data.avatarUrl)
				}else {
					this.setData({
						userPic: 'https://oss.lry.icu/login_pic.png'
					})
					wx.setStorageSync('avatarUrl', 'https://oss.lry.icu/login_pic.png')
				}
				if(res3.data.data.nickName !== null) {
					this.setData({
						username: res3.data.data.nickName
					})
					wx.setStorageSync('nickName', res3.data.data.nickName)
				}else {
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
	nickNameInput(e) {
		const obj = {
			id: wx.getStorageSync('id'),
			nickName: e.detail.value
		}
		const res = axios.post(request.wxUserInfoBaseUrl + '/updateNickName', obj)
		wx.setStorageSync('nickName', e.detail.value)
	},
	async exit() {
		const res = await wx.showModal({
			content: '确定要退出吗'
		})
		console.log(res)
		if(res.confirm === true) {
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
	async goMyOrder() {
		if(wx.getStorageSync('openid') === '') {
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