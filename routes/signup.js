/*
 * �û�ע��
 */
 var cryptoRsa = require('../private/crypto/crypto_rsa');
 var rsaConfig = cryptoRsa.getConfig();

exports.signup = function(req, res){
	//��ȡ����
	var rsaData = {
		modulus:rsaConfig.rsa_n,
		exponent:rsaConfig.rsa_e
	}
	
	//��Ⱦҳ��
	res.render('signup', { title: '�û�ע��',userFrom:"ע����Դ",cryptoData:rsaData});
};