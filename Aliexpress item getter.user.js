// ==UserScript==
// @name         Aliexpress item getter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Получает ID, название, цену и конфигурацию
// @author       Andronio
// @homepage     https://github.com/Andronio2/Aliexpress-item-getter
// @supportURL   https://github.com/Andronio2/Aliexpress-item-getter/issues
// @updateURL    https://github.com/Andronio2/Aliexpress-item-getter/raw/master/Aliexpress%20item%20getter.user.js
// @downloadURL  https://github.com/Andronio2/Aliexpress-item-getter/raw/master/Aliexpress%20item%20getter.user.js
// @match        https://aliexpress.ru/item/*
// @match        https://aliexpress.com/item/*
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
/*
 * price     - Цена товара
 * ship      - Если есть, то будут цифры, иначе пусто
 * item_name - Название товара, укороченное до 80 символов
 * item_id   - Ссылка на товар
 * mass1[0] \
 * mass1[1] -- выбор 1, 2, 3 соответственно
 * mass1[2] /
 * newstr    - новая строка
 * ' '       - пробел
 */

	let outString = `price + ' ' + ship + item_name + newstr + item_id + newstr + mass1[0] + ' ' + mass1[1] + ' ' + mass1[2] + newstr + newstr`;

/*
 * Дальше не трогать
 */
    let newstr = '\r\n';
    let productPrice = document.querySelector('.product-price-current');
    if (productPrice) {
        let div = document.createElement('div');
        div.innerHTML = '<button type="button" id="user-get-item" class="next-btn next-small next-btn-primary">Получить ID</button>';
        div.style.display = 'inline-block';
        productPrice.before(div);
        let mybtn = document.getElementById('user-get-item');
        mybtn.addEventListener('click', function(){
            let str = getItemString();
            if (str !== undefined) {
                navigator.clipboard.writeText(str).then(function () {
                    console.log('Async: Copying to clipboard was successful!');
                    mybtn.classList.remove("next-btn-primary");
                    setTimeout(() => mybtn.classList.add("next-btn-primary"), 500);
                }, function (err) {
                    console.error('Async: Could not copy text: ', err);
                });
            }
        });
    }

    function getItemString(){
        let mass1 = [0, 0, 0]; // конфигурация
		let mass2 = [null, null, null]; // количество конфигураций
		for (let i = 0; i < 3; i++) {
			let item = document.querySelectorAll(`.sku-property:nth-child(${i+1}) .sku-property-item`);
			mass2[i] = item.length;
			for (let j = 0; j < item.length; j++) {
				if (item[j].classList.contains("selected")) {
					mass1[i] = j + 1;
					break;
				}
			}
		}
		if (mass2[0] && !mass1[0] || mass2[1] && !mass1[1] || mass2[2] && !mass1[2]) return alert("Не выбрана конфигурация");
        let price = document.querySelector('.product-price-value').innerText;
        let ship = document.querySelector('.product-shipping-price > span');
		if (ship && /\d{1,4}[,\.]\d{2}/.test(ship.innerText)) {
			ship = " + " + ship.innerText.match(/\d{1,4}[,\.]\d{2}/)[0];
		} else ship = "";
        let item_name = document.querySelector('.product-title').innerText.substring(0, 80);       // Укороченное имя;
        let item_id = location.href.match(/.+\.html/)[0];
		for (let i = 0; i< 3; i++) {
            if (mass1[i] == 0) mass1[i] = "";
        }
        let item_string = eval(outString);
        return item_string;
    }
})();