# [bondoer.fr](http://bondoer.fr)
My personal website, made with <3 and JavaScript.

![Screenshot](http://i.imgur.com/Crlq5Oc.png)

## Prerequisites
**Server-side**
* [FontAwesome](http://fontawesome.io) in `fonts` folder
* Apache (for `.htaccess`) with
	* mod_mime
	* mod_deflate
	* mod_expires

**Client-side**
* A modern browser with support for
	* Web fonts
	* `<canvas>`
	* `requestAnimationFrame` (although there is a fallback)
	* CSS3 `rgba`, `transition` and `flex` (and all it's derived properties)
* A graphics processor capable of handling 60fps (currently working on optimizing that)

## background.js
background.js is a tiny pseudo-library for generating "sleek multi-color gradient bokeh" backgrounds. I will separate it into another repository soon with expandability in mind (right now, all values can be changed but there is absolutely no way to add a second independent background on the same page, though I'm not exactly sure why you would want to do that).

## To-do
* Optimize `background.js` for mobile (especially scroll lag!)
* Improve mobile layout (not very satisfied with the current list-like layout)

## License
My entire website (except for FontAwesome) is licensed under **Creative Commons Zero**. More information about the license can be found in the `LICENSE` file. Feel free to hack at it as much as you'd like :)!
