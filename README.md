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

Run comparison

### Step 2
```bash
$ node viremo.js
```

If changes are detected, you will be notified and given a fullpage visual output of the differences.
The output is stored in:

```
|--screenshots
  |--output
  	|--homepage
      |--fullpage.png
      |--fullpage_ref.png
    |--output.html
```

## Configuration
By default Viremo will use a default configuration file that looks like this:

**config/websites/default.js**
```js
module.exports = {
    label: "google",                /* Folder Friendly Name */
    url: "https://about.google/",   /* Page URL of Target Website */
    shell: [
        "header",
        "footer",
        // additional css selectors
    ],
    paths: [
        {
            label: "homepage",      /* Folder Friendly Name */ 
            path: "intl/en/",       /* Relative Path From URL */
            shell: true,            /* Check Shell Elements On This Path */
            elements: [             /* Unique Page Elements to Check */
                '.home-hero-copy',
                // additional css selectors 
            ]
        }
    ]
};
```

Screenshots are organized by website label and path label like so:

```
|--screenshots
  |--new
    |--google
      |--homepage
        |--<selector>.png
  |--reference
    |--google
	  |--homepage
        |--<selector>.png
```

You can add additional config files to config/websites/ and utilize them like so:

```
$ node viremo.js -use:newconfig.js
```

To set baseline images just add -get-baseline
```
$ node viremo.js -use:newconfig.js -get-baseline
```

