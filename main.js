// ==UserScript==
// @name           VK Photo Album Links Scraper
// @namespace      https://github.com/XSiL1337/VK-Photo-Album-Links-Scraper
// @version        1.0
// @description    It just works(?)
// @author         XSiL
// @match          *://vk.com/*
// @match          *://vk.ru/*
// @match          *://*.vk.com/*
// @match          *://*.vk.ru/*
// @icon           https://vk.com/favicon.ico
// @require        https://raw.githubusercontent.com/eligrey/FileSaver.js/master/dist/FileSaver.min.js
// ==/UserScript==

(function() {
    'use strict';

    console.log('VK PALS: Initializing');

    //Get album's ID from URL
    const albumID = window.location.pathname.split('album')[1];
    //Get users's ID from albumId
    const userID = albumID.split('_')[0];

    var executing = false;

    //Get all loaded photos' URLs
    function getPhotoUrls()
    {
        var urls = document.querySelectorAll('a');
        var photoUrls = [];
        for (var i = 0; i<urls.length; i++)
        {
              if (urls[i].href.includes('photo' + userID))
              {
                  //RAM usage optimization?
                  //photoUrls.push(urls[i].href.split('_')[1]);
                  photoUrls.push(urls[i].href);
              }
        }
        return photoUrls;
    }

    //Script starts when page is fully loaded
    window.onload = function()
    {
        console.log('VK PALS: Started');
        if (!window.location.href.includes('album'))
        {
            console.log('VK PALS: An album is not found. Script stopped.');
            return null;
        }

        var totalImageCount = parseInt(document.querySelector("h4").textContent);
        let urlList = new Set();
        var scrollingCooldown = 1000;
        var scrollingOffset = 100;

        //GUI
        var panel = document.createElement('div');
        panel.style.backgroundColor = '#AEE6AE';
        panel.style.padding = '5px';
        panel.style.border = '1px solid #ccc';
        panel.style.borderRadius = '8px';
        panel.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        panel.style.position = 'fixed';
        panel.style.top = '65px';
        panel.style.right = '15px';
        panel.style.width = '100px';
        panel.style.height = '180px';
        panel.classList.add("container");
        panel.style.display = "flex";
        panel.style.columnGap = "10px";
        panel.style.flexDirection = "column";

        var name = document.createElement("span");
        name.style.color = "black";
        name.style.fontSize = '14px';
        name.textContent = 'VK PALS';

        var cooldownText = document.createElement("span");
        cooldownText.style.color = "black";
        cooldownText.style.fontSize = '14px';
        cooldownText.textContent = 'Cooldown (ms)';

        var offsetText = document.createElement("span");
        offsetText.style.color = "black";
        offsetText.style.fontSize = '14px';
        offsetText.textContent = 'Offset (px)';

        var sizeText = document.createElement("span");
        sizeText.style.color = "black";
        sizeText.style.fontSize = '14px';
        sizeText.textContent = 'Album size';

        var inputFieldCooldown = document.createElement('input');
        inputFieldCooldown.type = 'text';
        inputFieldCooldown.id = 'myInput';
        inputFieldCooldown.placeholder = scrollingCooldown;
        inputFieldCooldown.defaultValue = scrollingCooldown;
        inputFieldCooldown.style.width = '70px';
        inputFieldCooldown.style.height = '30px';
        inputFieldCooldown.addEventListener('input', function(event)
        {
            if (!executing) scrollingCooldown = event.target.value;
        });

        var inputFieldOffset = document.createElement('input');
        inputFieldOffset.type = 'text';
        inputFieldOffset.id = 'myInput';
        inputFieldOffset.placeholder = scrollingOffset;
        inputFieldOffset.defaultValue = scrollingOffset;
        inputFieldOffset.style.width = '70px';
        inputFieldOffset.style.height = '30px';
        inputFieldOffset.addEventListener('input', function(event)
        {
            if (!executing) scrollingOffset = event.target.value;
        });

        var inputFieldSize = document.createElement('input');
        inputFieldSize.type = 'text';
        inputFieldSize.id = 'myInput';
        inputFieldSize.placeholder = totalImageCount;
        inputFieldSize.defaultValue = totalImageCount;
        inputFieldSize.style.width = '70px';
        inputFieldSize.style.height = '30px';
        inputFieldSize.addEventListener('input', function(event)
        {
            if (!executing) totalImageCount = event.target.value;
        });

        var button = document.createElement('button');
        button.textContent = 'START';
        button.style.width = '70px';
        button.style.height = '30px';


        var progressBarContainer = document.createElement('div');
        progressBarContainer.style.width = '100%';
        progressBarContainer.style.height = '10px';
        progressBarContainer.style.backgroundColor = '#E0E0E0';

        var progressBar = document.createElement('div');
        progressBar.style.width = '0%';
        progressBar.style.height = '100%';
        progressBar.style.backgroundColor = '#4CAF50';
        progressBarContainer.appendChild(progressBar);

        var progressBarText = document.createElement("span");
        progressBarText.style.color = "black";
        progressBarText.style.fontSize = '14px';
        progressBarText.textContent = '0/' + totalImageCount;

        document.body.appendChild(panel);
        panel.appendChild(name);
        panel.appendChild(button);
        panel.appendChild(progressBarText);
        panel.appendChild(progressBarContainer);
        panel.appendChild(cooldownText);
        panel.appendChild(inputFieldCooldown);
        panel.appendChild(offsetText);
        panel.appendChild(inputFieldOffset);
        panel.appendChild(sizeText);
        panel.appendChild(inputFieldSize);

        window.scrollTo(0, 0);

        //Start button event
        button.addEventListener('click', function()
        {
            executing = true;
            //Scroll to the top
            window.scrollTo(0, 0);
            //Initializing vars
            var repetitionCounter = 0;
            var markedURL;
            var previousMarkedURL;
            var targetPosition = 0;

            function downloadList()
            {
                var stringArray = Array.from(urlList);
                var blob = new Blob([stringArray.join("\n")], { type: "text/plain;charset=utf-8" });
                saveAs(blob, 'urlList_' + albumID + '.txt');
            }

            function processNextURL()
            {
                if (repetitionCounter >= 10)
                {
                    console.log('VK PALS: Unable to collect full list');
                    if (confirm('VK PALS: Unable to get all links.\nTry increasing scrolling cooldown and decreasing scrolling offset.\nIf photos are not loading try later.\nIf there are corrupted images in the album you have to delete them manually.\n\nProgess: ' + progressBarText.textContent + '\nGet collected links anyway?'))
                    {
                        downloadList();
                    }
                    else
                    {
                        location.reload();
                    }
                }
                else
                if (urlList.size < totalImageCount)
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
                    previousMarkedURL = markedURL;
                    markedURL = activeURLs[activeURLs.length - 1];

                    if (previousMarkedURL==markedURL)
                    {
                        repetitionCounter++;
                    }
                    else
                    {
                        repetitionCounter=0;
                    }

                    if (flag)
                    {
                        targetPosition = document.body.scrollHeight;
                    }
                    else
                    {
                        targetPosition -= scrollingOffset;
                    }
                    window.scrollTo(0, targetPosition);
                    // Wait 'scrollingCooldown' ms before processing to the next URL
                    setTimeout(processNextURL, scrollingCooldown);
                }
                else
                {
                    console.log('VK PALS: Completed');
                    downloadList();
                }
                progressBarText.textContent = urlList.size + '/' + totalImageCount;

                progressBar.style.width = Math.round((urlList.size / totalImageCount) * 100) + '%';
                //console.log('list size: ' + urlList.size + ', flag: ' + flag + ', markedURL: ' + markedURL + ' ' + document.body.scrollHeight);
            }

            processNextURL();
        });
        executing = false;

    };//'On load' end


})();//End
/*
To do in 1.1
Memory usage optimization
Create a separate file for GUI
Promt user to restart scraping if failed to scrap all links
*/