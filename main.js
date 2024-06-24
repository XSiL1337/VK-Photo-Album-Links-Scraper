// ==UserScript==
// @name         vk.com album downloader
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  try to take over the world!
// @author       XSiL
// @match        *://vk.com/*
// @match        *://vk.ru/*
// @match        *://*.vk.com/*
// @match        *://*.vk.ru/*
// @match        *://*.vk-cdn.com/*
// @match        *://*.vk-cdn.net/*
// @match        *://*.userapi.com/*
// @connect      vk.com
// @connect      vk.ru
// @connect      vk-cdn.com
// @connect      vk-cdn.net
// @connect      userapi.com
// @grant          GM.xmlHttpRequest
// @grant          GM_xmlhttpRequest
// @grant          GM_download
// @grant          GM_info
// @grant          GM_setValue
// @grant          GM_getValue
// @grant          GM_deleteValue
// @grant          GM_listValues
// @grant          GM_addValueChangeListener
// @grant          GM_notification
// @grant          GM.setValue
// @grant          GM.getValue
// @grant          GM.deleteValue
// @grant          GM.listValues
// @grant          unsafeWindow
// @grant          GM_registerMenuCommand
// @grant          GM.addValueChangeListener
// @icon           https://vk.com/favicon.ico
// ==/UserScript==

(function() {
    'use strict';

    console.log('VK Album Downloader is initializing');

    //Get album's ID from URL
    const userId = (window.location.pathname.split('_')[0]).split('album')[1];

    //If argument is a number returns true else false
    function isNumber(value)
    {
        return typeof value === "number" && !Number.isNaN(value);
    }

    function isImageLoaded(img)
    {
        if (!img.complete)
        {
            return false;
        }
        if (img.naturalWidth === 0)
        {
            return false;
        }
        return true;
    }

    // Получение всех изображений на странице
    function getPhotoUrls() {
        var urls = document.querySelectorAll('a');
        var photoUrls = [];
        for (var i = 0; i<urls.length; i++)
        {
              if (urls[i].href.includes('photo' + userId))
              {
                  //optimized
                  //photoUrls.push(urls[i].href.split('_')[1]);
                  photoUrls.push(urls[i].href);
              }
        }
        return photoUrls;
    }

    //Scrolls page down
    function autoScroll() {
        window.scrollTo(0, document.body.scrollHeight);
    }

    //Script starts when page is fully loaded
    window.onload = function()
    {
        console.log('VK Album Downloader has started');
        if (!window.location.href.includes('album'))
        {
            console.log('An album is not found. Script stopped.');
            return null;
        }
        var totalImageCount = parseInt(document.querySelector("h4").textContent);

        if (isNumber(totalImageCount))
        {
            console.log('Total image count in the album: ' + totalImageCount);
        }
        else
        {
            //Generally this code shouldn't be reached. Just in case
            let totalImageCount = parseInt(prompt("Couldn't get total number of photos in the album. Enter it manually."));
        }



                // Create a new button element
    var button = document.createElement('button');

    // Set the button's text
    button.textContent = 'Download album';

    // Style the button and position it in the bottom left corner of the page
    button.style.position = 'fixed';
    button.style.top = '60px';
    button.style.right = '20px';
    button.style.width = '100px';
    button.style.height = '50px';
    // Append the button to the body of the document
    document.body.appendChild(button);

        let urlList = new Set();

        button.addEventListener('click',
                                function()
                                {
        var k = 0;
            var markedURL;
        while (urlList.size<=totalImageCount)
        {
            var activeURLs = getPhotoUrls();

            var flag = false;
            for (var i = 0; i < activeURLs.length; i++)
            {
                if (activeURLs[i] == markedURL)
                {
                    flag = true;
                }
                    urlList.add(activeURLs[i]);
            }
            markedURL = activeURLs[activeURLs.length-1];
            if (flag)
            {
                autoScroll();
            }
            else
            {
                window.scrollTo(0, document.body.scrollHeight - 200);
            }
             console.log('list size' + urlList.size + ' ' + flag + ' ' + markedURL);
            k++;
        }
            //make async and wait every iteration!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

            //получаем все ссылки изображений на странице, "кликаем" и скачиваем все изображения на странице, отмечая их id как скачанные,
            //так же отмечаем самую первую и самую последнюю, двигаемся в самый низ если не находим последнюю то двигаемся немного назад так продолжать пока не скачаем весь альбом


            var it =urlList.values();
//get first entry:
var first = it.next();
//get value out of the iterator entry:
var value = first.value;


                               });



    };//on load end

})();