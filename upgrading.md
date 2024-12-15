# Upgrading across versions

This documentation is meant to help you upgrade across versions, when potentially breaking changes are introduced.

## v1.4.0

This version switches from the legacy, "embedded" Boostrap based on v4.3.1 (from the [original codebase](https://github.com/radity/raditian-free-hugo-theme/blob/daa341d4156986787611a01d075ca94233ff4d3b/static/css/main.css)) to the Scss-based version, [v5.3.3](https://getbootstrap.com/docs/5.3) (ast per december'24).

This requires some small adjustments in the `config.toml` file.

### Add build stats
Add the following:
```
[build]
  [build.buildStats]
    disableClasses = false
    disableIDs = false
    disableTags = false
    enable = true
```

### Add new `adritian.css` file

Add the following, under the `params.plugins.css` section:

```
  [[params.plugins.css]]
  URL = "css/adritian.css"
```

### ⚠️ Setup boostrap as Scss

Add the following, under the `params.plugins.scss` section:

```
  [[params.plugins.scss]]
  URL = "scss/bootstrap/bootstrap.scss"
```



## v1.3.4

In `config.toml`, replace
```
  [[params.plugins.css]]
  URL = "css/rad-icons.css"
```
by 
```
  [[params.plugins.css]]
  URL = "css/adritian-icons.css"
```

In your config/content files, replace:
- `icon-linkedin-fill` by `icon-linkedin`
- `icon-smile-fill` by `icon-user`
- `icon-arrow-right` by `icon-circle-arrow-right`
- `icon-mail-fill` by `icon-email`


## v1.2.x to v1.3.x

In `v1.3.x`, the [support for internationalization was added](https://github.com/zetxek/adritian-free-hugo-theme/pull/78).
This means that some of the content previously managed in the `homepage.yaml` file is now managed in `i18n/{language}.yaml`.

For example:
- the main page title was managed in `homepage.yml`:`showcase.title`, now it's managed in `i18n/{language}.yaml`:`logo_text1`
- the page logo was managed in `hugo.toml`:`params.logo` (`text1` and `text2`), now it's managed in `i18n/{language}.yaml`:`logo_text1` and `logo_text2`.

The reason for the change is to allow overriding almost any string in the theme in different content translations. 
