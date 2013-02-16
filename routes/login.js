/*
 * 用户注册
 */
 var cryptoRsa = require('../private/crypto/crypto_rsa');
 var rsaConfig = cryptoRsa.getConfig();

exports.login = function(req, res){
	//获取数据
	var rsaData = {
		modulus:rsaConfig.rsa_n,
		exponent:rsaConfig.rsa_e
	}
	
	//渲染页面
	res.render('login', { title: '用户登录',userFrom:"登录",cryptoData:rsaData});
};