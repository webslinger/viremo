# viremo
**Vi**sual **Re**gression **Mo**nitor

###### What does it do?
Viremo uses puppeteer to crawl defined pages and take screenshot of defined elements, and compare them to established baseline images to detect visual regressions.

## Usage

### Step 1

Get baseline images, for reference:

```
node viremo.js -get-baseline
```

### Step 2

Run comparison

```bash
$ node viremo.js
```

If changes are detected, you will be notified and given a fullpage visual output of the differences.
The output is stored in:

```
|--screenshots
  |--output
  	|--homepage
  	  |--desktop
        |--fullpage.png
        |--fullpage_ref.png
    |--output.html
```

## Configuration
By default Viremo will use a default configuration established by the config module,
to override these settings you can add your own file to this directory:

```
|--config
  |--websites
    |-- <customfile.js>
```

**customfile.js**

```js
const config = require('../config');

module.exports = config.custom(
    "example.com", 
    "https://www.example.com/", 
    [
        config.viewport("desktop",1920,1080),
        config.viewport("mobile",375,812)
    ],
    [
        config.path("homepage","",true,[])
    ],
    [
        "#header",
        ".footer"
    ]
);
```

All properties are required. To use these settings instead of the default, specify the file in the command line:

```
$ node viremo.js -use:customfile.js -set-baseline
```
```
$ node viremo.js -use:customfile.js
```

See ```viremo/config/config.js``` for more information. 

Screenshots are organized by website label and path label from website configuration like so:

```
|--screenshots
  |--new
    |--example.com
      |--homepage
        |--desktop
            |--#header.png
            |--footer.png
        |--mobile
            |--#header.png
            |--footer.png
  |--reference
    |--example.com....
```

## Testing

Testing has been built into viremo. To run tests, from viremo root run:
```$xslt
$ npm test
```