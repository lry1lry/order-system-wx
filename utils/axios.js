function get(url) {
	return new Promise((resolve, reject) => {
		wx.request({
			url,
			success(res) {
				resolve(res)
			},
			fail(res) {
				reject(res)
			}
		})
	})
}

function post(url, obj) {
	return new Promise((resolve, reject) => {
		wx.request({
			url,
			method: "POST",
			data: obj,
			success(res) {
				resolve(res)
			},
			fail(res) {
				reject(res)
			}
		})
	})
}

function upload(url, filePath) {
	return new Promise((resolve, reject) => {
		wx.uploadFile({
			filePath,
			name: 'image',
			url,
			success(res) {
				resolve(res)
			},
			fail(res) {
				reject(res)
			}
		})
	})
}

function login() {
	return new Promise((resolve, reject) => {
		wx.login({
			success(res) {
				resolve(res)
			},
			fail(res) {
				reject(res)
			}
		})
	})
}

export default {
	get,
	login,
	post,
	upload
}