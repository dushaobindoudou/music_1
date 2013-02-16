/*
 * 用户注册
 */
 var cryptoRsa = require('../private/crypto/crypto_rsa');
 var rsaConfig = cryptoRsa.getConfig();

exports.signup = function(req, res){
	//获取数据
	var rsaData = {
		modulus:rsaConfig.rsa_n,
		exponent:rsaConfig.rsa_e
	}
	
	//渲染页面
	res.render('signup', { title: '用户注册',userFrom:"注册来源",cryptoData:rsaData});
};