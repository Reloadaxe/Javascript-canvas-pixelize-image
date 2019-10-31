let canvas = document.getElementById("canvas");
canvas.style.backgroundColor = "whitesmoke";
let context = canvas.getContext("2d");
let pixels = [[]];
let pixelisation = 3; // Change this with an odd number > 0 (higher = higher pixelised image) // 1, 3, 5, 7, 9, 11

let image = new Image();
image.src = "paysage.jpg";
image.onload = function() {
    canvas.width = image.width * 2;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);
    context.drawImage(image, image.width, 0);
    setup();
}

function setup() {
    let data = context.getImageData(0, 0, image.width, image.height).data;
    let y = 0;
    let x = 0;
    for (let i = 0; i < data.length; i += 4) {
        if (x == image.width) {
            y++;
            pixels.push([]);
            x = 0;
        }
        pixels[y].push([data[i], data[i + 1], data[i + 2], data[i + 3]]);
        x++;
    }
    pixelise();
}

function mostUsedColor(colors) {
    let mostUsed = {first: [], last: [], occur: []};
    let min = {r: 300, g: 300, b: 300};
    let average = {r: 0, g: 0, b: 0};
    let length = colors.length;
    let color;
    for (let i = 0; i < length; i++) {
        average.r += colors[i][0];
        average.g += colors[i][1];
        average.b += colors[i][2];
    }
    average.r /= length;
    average.g /= length;
    average.b /= length;
    
    for (let i = 0; i < length; i++) {
        if (Math.abs(colors[i][0] - average.r) < Math.abs(min.r - average.r))
            min.r = colors[i][0];
        if (Math.abs(colors[i][1] - average.g) < Math.abs(min.g - average.g))
            min.g = colors[i][1];
        if (Math.abs(colors[i][2] - average.b) < Math.abs(min.b - average.b))
            min.b = colors[i][2];
    }
    for (let i = 0; i < length; i++) {
        if (colors[i][0] == min.r)
            mostUsed.first.push(colors[i]);
        if (colors[i][1] == min.g)
            mostUsed.first.push(colors[i]);
        if (colors[i][2] == min.b)
            mostUsed.first.push(colors[i]);
    }
    let index;
    for (let i = 0; i < mostUsed.first.length; i++) {
        index = -1;
        for (let j = 0; j < mostUsed.last.length; j++) {
            if (_.isEqual(mostUsed.first[i], mostUsed.last[j])) {
                index = j;
                break;
            }
        }
        if (index == -1) {
            mostUsed.last.push(mostUsed.first[i]);
            index = mostUsed.last.length - 1;
            mostUsed.occur[index] = 0;
        }
        mostUsed.occur[index]++;
    }
    max = 0;
    for (let i = 0; i < mostUsed.occur.length; i++) {
        if (mostUsed.occur[i] > max) {
            color = mostUsed.last[i];
            max = mostUsed.occur[i];
        }
    }
    return color;
}

function pixelise() {
    let colors;
    let color;
    let data = new ImageData(image.width, image.height);
    for (let y = (pixelisation - 1) / 2; y < pixels.length - (pixelisation - 1) / 2; y += pixelisation) {
        for (let x = (pixelisation - 1) / 2; x < pixels[y].length - (pixelisation - 1) / 2; x += pixelisation) {
            colors = [];
            for (let i = y - (pixelisation - 1) / 2; i < y + (pixelisation - 1) / 2 + 1; i++)
                for (let j = x - (pixelisation - 1) / 2; j < x + (pixelisation - 1) / 2 + 1; j++)
                    colors.push(pixels[i][j]);
            color = mostUsedColor(colors);
            for (let i = y - (pixelisation - 1) / 2; i < y + (pixelisation - 1) / 2 + 1; i++)
                for (let j = x - (pixelisation - 1) / 2; j < x + (pixelisation - 1) / 2 + 1; j++)
                    pixels[i][j] = color;
        }
    }
    let i = 0;
    for (let y = 0; y < pixels.length; y++) {
        for (let x = 0; x < pixels[y].length; x++) {
            data.data[i] = pixels[y][x][0];
            data.data[i + 1] = pixels[y][x][1];
            data.data[i + 2] = pixels[y][x][2];
            data.data[i + 3] = pixels[y][x][3];
            i += 4;
        }
    }
    context.putImageData(data, 0, 0);
}