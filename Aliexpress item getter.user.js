// ==UserScript==
// @name         Aliexpress item getter
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Получает ID, название, цену и конфигурацию
// @author       Andronio
// @homepage     https://github.com/Andronio2/Aliexpress-item-getter
// @supportURL   https://github.com/Andronio2/Aliexpress-item-getter/issues
// @updateURL    https://github.com/Andronio2/Aliexpress-item-getter/raw/master/Aliexpress%20item%20getter.user.js
// @downloadURL  https://github.com/Andronio2/Aliexpress-item-getter/raw/master/Aliexpress%20item%20getter.user.js
// @match        https://aliexpress.ru/item/*
// @match        https://aliexpress.com/item/*
// @match        https://www.aliexpress.com/item/*
// @match        https://www.aliexpress.ru/item/*
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
/*
 * price     - Цена товара
 * ship      - Если есть, то будут цифры, иначе пусто
 * item_name - Название товара, укороченное до 80 символов
 * item_id   - Ссылка на товар
 * item_conf - Конфигурация выбранного товара
 * newstr    - новая строка
 * ' '       - пробел
 */

	let outString = `price + ' ' + ship + item_name + newstr + item_id + newstr + item_conf + newstr + newstr`;

/*
 * Дальше не трогать
 */
    let newstr = '\r\n';

    let productPrice = document.querySelector('.Product_Price__container__1uqb8, .Product_UniformBanner__uniformBanner__o5qwb');
    if (!productPrice) {
        // Старая страница
        productPrice = document.querySelector('.product-price-current');
        if (!productPrice) productPrice = document.querySelector('.product-price');
        if (productPrice) {
            let div = document.createElement('div');
            div.innerHTML = '<button type="button" id="user-get-item" class="old-btn next-btn next-small next-btn-primary">Получить ID</button>';
            div.style.display = 'inline-block';
            productPrice.append(div);
            div.addEventListener('click', btnHandler);
        }
    } else {
        // Новая страница
        let div = document.createElement('div');
        div.id = 'user-get-item';
        productPrice.append(div);
        let observer = new MutationObserver(() => {
            if (document.getElementById('user-get-item')) return; // Смотрим, есть ли наша кнопка
            observer.disconnect(); // Если нет, то создаем заново
            div = document.createElement('div');
            div.innerHTML = '<button type="button" id="user-get-item" class="new-btn contained ali-kit_Button__button__ngexmt ali-kit_Button__size-m__ngexmt ali-kit_Button__primary__ngexmt">Получить ID</button>';
            div.style.display = 'block';
            productPrice.append(div);
            div.addEventListener('click', btnHandler);
        });

        let config = {
            childList: true, // наблюдать за непосредственными детьми
            subtree: true, // и более глубокими потомками
            characterDataOldValue: true // передавать старое значение в колбэк
        }
        observer.observe(productPrice, config);
    }

    function btnHandler(e){
        if (e.target.tagName !== "BUTTON") return;
        const mybtn = e.target;
        let redClass;
        let str = getItemString();
        redClass = e.target.classList.contains('old-btn') ? 'next-btn-primary' : 'ali-kit_Button__primary__ngexmt';
        if (str !== undefined) {
            navigator.clipboard.writeText(str).then(function () {
                console.log('Async: Copying to clipboard was successful!');
                e.target.classList.remove(redClass);
                setTimeout(() => e.target.classList.add(redClass), 500);
            }, function (err) {
                console.error('Async: Could not copy text: ', err);
            });
        }
    }

    function getItemString(){
        let itemProps = document.querySelectorAll('.sku-property, .Product_SkuValuesBar__container__6ryfe');
        let massProps = [];
// Находим только те, что содержат выбор, иначе пропускаем
        for (let i = 0; i < itemProps.length; i++) {
            if (itemProps[i].querySelector('.sku-property-list, .Product_SkuValueBaseItem__item__o90dx')) massProps.push(itemProps[i]);
        }
        let item_conf = '';
        for (let i = 0; i < massProps.length; i++) {
            let item = massProps[i].querySelectorAll('.sku-property-item, .Product_SkuValueBaseItem__item__o90dx');
            let hasSelect = false
            for (let j = 0; j < item.length; j++) {
                if (item[j].classList.contains("selected") || item[j].classList.contains("Product_SkuValueBaseItem__active__o90dx")) {
                    hasSelect = true;
                    item_conf += (j + 1) + ' ';
                    break;
                }
            }
            if (!hasSelect) {
                alert("Не выбрана конфигурация");
                return null;
            }
        }
        item_conf = item_conf.slice(0, -1);
        let price = document.querySelector('.product-price-value, .uniform-banner-box-price, .product-price-current, .Product_UniformBanner__uniformBannerBoxPrice__o5qwb').textContent;
        price = price.match(/\d{1,3}\s\d{3},\d{2}|\d{1,3},\d{3}\.\d{2}|\d{1,3}[\.,]\d{2}/);
        if (price && price.length === 0) {
            console.log('Не нашел цену');
            return null;
        } else {
            price = price[0].replace(/(\d{1,3})\s(\d{3},\d{2})/, '$1$2').replace(/(\d{1,3}),(\d{3}\.\d{2})/, '$1$2');
        }
        let ship = document.querySelector('.Product_NewFreight__freight__vd1kn, .dynamic-shipping-line').textContent;
        ship = ship.match(/\d{1,3}\s\d{3},\d{2}|\d{1,3},\d{3}\.\d{2}|\d{1,3}[\.,]\d{2}/);
		if (ship && ship.length > 0) {
			ship = "+ " + ship[0].replace(/(\d{1,3})\s(\d{3},\d{2})/, '$1$2').replace(/(\d{1,3}),(\d{3}\.\d{2})/, '$1$2') + ' ';
		} else ship = "";
        let item_name = document.querySelector('.product-title, .Product_Name__container__hntp3').textContent.substring(0, 80);       // Укороченное имя;
        let item_id = location.href.match(/.+\.html/)[0];
        let item_string = eval(outString);
        return item_string;
    }
})();
