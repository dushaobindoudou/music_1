/*
 * �û�ע��
 */
 var cryptoRsa = require('../private/crypto/crypto_rsa');
 var rsaConfig = cryptoRsa.getConfig();

exports.login = function(req, res){
	//��ȡ����
	var rsaData = {
		modulus:rsaConfig.rsa_n,
		exponent:rsaConfig.rsa_e
	}
	
	//��Ⱦҳ��
	res.render('login', { title: '�û���¼',userFrom:"��¼",cryptoData:rsaData});
};