/*
 * Simple script to load locales for my translation website.
 *
 * @author  pbondoer
 * @license CC0
 */

function httpGet(url, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function()
    { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
}

function loadLocale(locale)
{
    httpGet("locale/" + encodeURIComponent(locale.replace(/#/, "")) + ".json", localeLoaded)
}

function localeLoaded(src)
{
    try
    {
        var json = JSON.parse(src);
        for (var key in json)
        {
            var element = document.getElementById(key);
            
            if (!element)
            {
                console.error("Couldn't find element ", key);
                continue;
            }
            
            if (key == "locales")
            {
                var locales = json[key];
                
                for (var lang in locales)
                {
                    var link = document.getElementById(lang);
                    
                    if (!link)
                    {
                        console.error("Couldn't find locale link ", link);
                        continue;
                    }
                    
                    link.innerHTML = "<img src=\"flags/" + lang + ".png\">" + locales[lang];
                }
                continue;
            }
            
            if (key == "title")
                document.title = json[key];
            
            element.innerHTML = json[key];
        }
    }
    catch(e)
    {
        console.error("JSON parse error: ", e);
    }
}

function attachLinks()
{
    var lang = document.getElementById("locales").getElementsByTagName("a");
    
    for (var i = 0; i < lang.length; i++)
    {        
        lang[i].addEventListener("click", function(e) {
            e.preventDefault();
            
            var top  = window.pageYOffset || document.documentElement.scrollTop,
                left = window.pageXOffset || document.documentElement.scrollLeft;
            
            var href;
            if (event.target.tagName == "IMG")
                href = event.target.parentElement.getAttribute("href");
            else
                href = event.target.getAttribute("href");
            
            window.location.hash = href;
            loadLocale(href);
            
            window.scrollTo(left, top);
        });
    }
}

window.addEventListener("load", function()
{
    attachLinks();
    if (window.location.hash)
        loadLocale(window.location.hash);
});