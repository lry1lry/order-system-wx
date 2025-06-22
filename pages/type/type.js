import drawQrcode from 'weapp-qrcode'

Page({

	data: {
		activeKey: 0
	},

	async onLoad(options) {
		drawQrcode({
			width: 300,
			height: 300,
			canvasId: 'myQrcode',
			text: 'https://mobile.internet.lry.icu/zijin',
			correctLevel: 3
		})
	}
})