/* 
 * background.js - simple abstract background generator
 *
 * Changes:
 *  6-Jan-2016
 *   > Stored PI * 2 in var for better framerate on mobile
 *   > Drawing circles to off-screen canvas only once, reducing .arc() ops
 *   + Added mobile detection
 *   + In-depth mobile+debug options
 *
 * @author  pbondoer - http://bondoer.fr/
 * @license CC0 - https://creativecommons.org/publicdomain/zero/1.0/
 */

window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();


window.addEventListener("load", function() {
    var ctx = document.getElementById('background').getContext('2d');
    //gradient
    var gradientSize = 4; // 4 seems to work, initially was 16
    var gradientSmallRadius = 0;
    var minSaturation = 40;
    var maxSaturation = 80;
    var minLightness = 25;
    var maxLightness = 35;
    var maxGradientJitter = 0.1;
    var minGradientJitter = -0.1;
    var maxGradientCycles = 10; // prevents points from moving too much
    //bokeh
    var bokehAmount = 30;
    var maxBokehSize = 0.30;
    var minBokehSize = 0.10;
    var maxBokehAlpha = 0.4;
    var minBokehAlpha = 0.05;
    var maxBokehJitter = 0.3;
    var minBokehJitter = -0.3;
    //both
    var minSpeed = 0.0001;
    var maxSpeed = 0.001;
    //buffers
    var gradientBuffer = document.createElement('canvas').getContext('2d');
    var circleBuffer = document.createElement('canvas').getContext('2d');
    //render time, fps calculations, debug
    var time;
    var targetFps = 60; //not actual fps, but updates per second
    var curFps = 0;
    var cntFps = 0;
    var fps = 0;
    var w = 0;
    var h = 0;
    var scale = 0;
    var mobile = 
    {
        halfRes: false, 
        bokehAmount: bokehAmount / 6,
        force: false
    }
    var debug =
    {
        strokeBokeh: false,
        showFps: false,
        showGradient: false
    }
    //constants for faster calcs
    var pi2 = Math.PI * 2;
    //util functions
    function lerp(a, b, step) {
        return step * (b - a) + a;
    }
    function clamp(a) {
        if (a < 0) return 0;
        if (a > 1) return 1;
        return a;
    }
    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }
    function newColor() {
        return new Color(Math.random() * 360, rand(minSaturation, maxSaturation), rand(minLightness, maxLightness));
    }
    
    function isMobile() { 
        return (
               navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i)
            || mobile.force
        );
    }
    //classes
    function Color(h, s, l) {
        this.h = h;
        this.s = s;
        this.l = l;
        
        this.str = function() {
            return this.h + ", " + this.s + "%, " + this.l +"%";
        }
    }
    function ColorPoint(x, y, color) {
        this.defX = x;
        this.defY = y;
        this.cycles = 0;
        this.oldX = x;
        this.oldY = y;
        this.oldColor = color;
        this.newX = x;
        this.newY = y;
        this.newColor = color;
        this.step = 0;
        this.speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
        
        this.x = function() {
            return lerp(this.oldX, this.newX, this.step);
        }
        this.y = function() {
            return lerp(this.oldY, this.newY, this.step);
        }
        this.color = function() {
            return new Color(lerp(this.oldColor.h, this.newColor.h, this.step),
                             lerp(this.oldColor.s, this.newColor.s, this.step),
                             lerp(this.oldColor.l, this.newColor.l, this.step));
        }

    }
    var colorPoints = [
        new ColorPoint(0, 0, new Color(196, 59, 34)),
        new ColorPoint(0, 1, new Color(269, 79, 32)),
        new ColorPoint(1, 0, new Color(30, 42, 33)),
        new ColorPoint(1, 1, new Color(304, 47, 27))
    ];

    function BokehCircle(x, y, size, alpha) {
        this.oldX = x;
        this.oldY = y;
        this.oldSize = size;
        this.oldAlpha = alpha;
        this.newX = 0;
        this.newY = 0;
        this.newAlpha = 0;
        this.newSize = 0;
        this.step = 0;
        this.speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;

        this.x = function() {
            return lerp(this.oldX, this.newX, this.step);
        }
        this.y = function() {
            return lerp(this.oldY, this.newY, this.step);
        }
        this.alpha = function() {
            return lerp(this.oldAlpha, this.newAlpha, this.step);
        }
        this.size = function() {
            return lerp(this.oldSize, this.newSize, this.step);
        }
    }
    var circles = [];
    
    function resize() {
        w = window.innerWidth;
        h = window.innerHeight;
        scale = Math.sqrt(w * h);
        
        //actual canvas
        ctx.canvas.width = w;
        ctx.canvas.height = h;
        if (isMobile() && mobile.halfRes)
        {
            //half res
            ctx.canvas.width /= 2;
            ctx.canvas.height /= 2;
            ctx.scale(0.5, 0.5);
        }
        
        //circle canvas
        var circleSize = maxBokehSize * scale;
        circleBuffer.canvas.width = circleSize * 2 + 1;
        circleBuffer.canvas.height = circleSize * 2 + 1;
        
        circleBuffer.fillStyle = "rgb(255, 255, 255)";
        circleBuffer.beginPath();
        circleBuffer.arc(circleSize, circleSize, circleSize, 0, pi2);
        circleBuffer.closePath();
        circleBuffer.fill();
    }
    function init() {
        gradientBuffer.canvas.height = gradientSize;
        gradientBuffer.canvas.width = gradientSize;
        
        resize();
        
        if (isMobile())
            bokehAmount = mobile.bokehAmount;
        
        colorPoints.forEach(function(point) {
            point.newX = clamp(point.oldX + rand(minGradientJitter, maxGradientJitter));
            point.newY = clamp(point.oldY + rand(minGradientJitter, maxGradientJitter));
            point.oldColor = newColor();
            point.newColor = newColor();
            point.speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
            point.cycles = 0;
        });
        
        for(i = 0; i < bokehAmount; i++) {
            circles.push(new BokehCircle(Math.random(), Math.random(), rand(minBokehSize, maxBokehSize), rand(minBokehAlpha, maxBokehAlpha)));
            circles[i].newX = clamp(circles[i].oldX + rand(minBokehJitter, maxBokehJitter));
            circles[i].newY = clamp(circles[i].oldY + rand(minBokehJitter, maxBokehJitter));
            circles[i].newAlpha = rand(minBokehAlpha, maxBokehAlpha);
            circles[i].newSize = rand(minBokehSize, maxBokehSize);
            circles[i].speed = rand(minSpeed, maxSpeed);
        }
    }
    function iterate() {
        var now = Date.now();
        curFps += (now - (time || now));
        cntFps++;
        var delta = (now - (time || now)) / (1000 / targetFps);
        time = now;
        
        if(curFps > 1000) {
            fps = 1000 / (curFps / cntFps);
            curFps -= 1000;
            cntFps = 0;
        }
        
        colorPoints.forEach(function(point) {
            point.step += point.speed * delta;
            
            if (point.step >= 1) {
                point.step = 0;
                
                point.oldX = point.newX;
                point.oldY = point.newY;
                point.oldColor = point.newColor;
                
                point.newX = clamp(point.oldX + rand(minGradientJitter, maxGradientJitter));
                point.newY = clamp(point.oldY + rand(minGradientJitter, maxGradientJitter));
                point.newColor = newColor();
                point.speed = rand(minSpeed, maxSpeed);

                point.cycles += 1;
                
                if(point.cycles > maxGradientCycles) {
                    point.newX = point.defX;
                    point.newY = point.defY;
                    point.cycles = 0;
                }
            }
        });
        
        circles.forEach(function(circle) {
            circle.step += circle.speed * delta;
            if(circle.step >= 1) {
                circle.step = 0;
                
                circle.oldX = circle.newX;
                circle.oldY = circle.newY;
                circle.oldAlpha = circle.newAlpha;    
                circle.oldSize = circle.newSize;
                
                circle.newX = clamp(circle.newX + rand(minBokehJitter, maxBokehJitter));
                circle.newY = clamp(circle.newY + rand(minBokehJitter, maxBokehJitter));
                circle.newAlpha = rand(minBokehAlpha, maxBokehAlpha);
                circle.newSize = rand(minBokehSize, maxBokehSize);
                circle.speed = rand(minSpeed, maxSpeed);
            }
        });
    }
    
    function render() {
        iterate();
        
        //draw point gradient to buffer
        gradientBuffer.fillStyle = "#000";
        gradientBuffer.fillRect(0, 0, gradientSize, gradientSize);

        colorPoints.forEach(function(point) {
            var x = point.x() * gradientSize;
            var y = point.y() * gradientSize;
            var grad = gradientBuffer.createRadialGradient(x, y, gradientSmallRadius, x, y, gradientSize);
            grad.addColorStop(0, 'hsla(' + point.color().str() + ', 255)');
            grad.addColorStop(1, 'hsla(' + point.color().str() + ', 0)');

            gradientBuffer.fillStyle = grad;
            gradientBuffer.fillRect(0, 0, gradientSize, gradientSize);
        });

        //draw gradient from memory
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(gradientBuffer.canvas, 0, 0, w, h);

        //draw bokeh
        
        ctx.globalCompositeOperation = "overlay";
        if (debug.strokeBokeh) {
            ctx.strokeStyle = "yellow";
        }
        
        circles.forEach(function(circle) {
            ctx.globalAlpha = circle.alpha();
            ctx.drawImage(circleBuffer.canvas, Math.round(circle.x() * w), Math.round(circle.y() * h), Math.round(circle.size() * scale), Math.round(circle.size() * scale));
            
            if(debug.strokeBokeh) {
                ctx.globalAlpha = 1;
                ctx.globalCompositeOperation = "source-over";
                ctx.strokeRect(Math.round(circle.x() * w), Math.round(circle.y() * h), Math.round(circle.size() * scale), Math.round(circle.size() * scale));
                ctx.globalCompositeOperation = "overlay";
            }
            //old rendering code
            /*
            ctx.fillStyle = "rgba(255, 255, 255, " + circle.alpha() + ")";
            ctx.beginPath();
            ctx.arc(Math.round(circle.x() * w), Math.round(circle.y() * h), Math.round(circle.size() * scale), 0, pi2);
            ctx.closePath();
            ctx.fill();
            */
        });
        ctx.globalAlpha = 1;
        
        //debug info
        if (debug.showGradient) {
            ctx.globalCompositeOperation = "source-over";
        
            colorPoints.forEach(function(point) {
                if(point.cycles >= maxGradientCycles) ctx.fillStyle = 'red';
                else ctx.fillStyle = 'yellow';
                ctx.beginPath();
                ctx.arc(point.x() * w, point.y() * h, 12, 0, pi2);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = 'hsl(' + point.color().str() + ')';
                ctx.beginPath();
                ctx.arc(point.x() * w, point.y() * h, 10, 0, pi2);
                ctx.closePath();
                ctx.fill();
            });   
        }
            
        if (debug.showFps) {
            if(fps <= 10) ctx.fillStyle = 'red';
            else ctx.fillStyle = 'yellow';
            ctx.font="20px 'Open Sans'";
            ctx.fillText(Math.round(fps) + " fps", 10, 20);
        }
        
        //done rendering, wait for frame
        window.requestAnimFrame(render);
    }
    
    //does not seem to impact performance
    window.addEventListener("resize", resize);
    window.addEventListener("touchmove", resize);
    
    init();
    render();
});