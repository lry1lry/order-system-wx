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
	login
}