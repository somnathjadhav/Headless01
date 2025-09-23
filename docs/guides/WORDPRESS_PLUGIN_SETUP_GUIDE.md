# WordPress Plugin Setup Guide - Complete Typography Preset

## 🎯 Complete Instrument Sans Typography Preset

This guide shows how to set up the WordPress plugin with **complete typography properties** including font size, weight, line height, and letter spacing for all elements.

## 📁 Plugin Installation

### Step 1: Add Plugin to WordPress
1. Copy `headless-plugin-main.php` to your WordPress plugins directory
2. Or add the code to your existing Headless Pro plugin
3. Activate the plugin in WordPress admin

### Step 2: Plugin Location
```
/wp-content/plugins/headless-pro/headless-plugin-main.php
```

## 🎨 Complete Typography Properties Included

### Primary Font Settings
- **Font Family**: `Instrument Sans`
- **Font Size**: `16px`
- **Font Weight**: `400`
- **Line Height**: `1.6`

### Primary Typography
- **Primary Font**: `Instrument Sans`
- **Primary Size**: `16px`
- **Primary Weight**: `400`
- **Primary Line Height**: `1.6`
- **Primary Letter Spacing**: `0px`

### Secondary Typography
- **Secondary Font**: `Instrument Sans`
- **Secondary Size**: `16px`
- **Secondary Weight**: `400`
- **Secondary Line Height**: `1.6`
- **Secondary Letter Spacing**: `0px`

### Body Text Typography
- **Body Font**: `Instrument Sans`
- **Body Size**: `16px`
- **Body Weight**: `400`
- **Body Line Height**: `1.6`
- **Body Letter Spacing**: `0px`

### Heading Typography (Complete Hierarchy)

#### H1 - Main Headings
- **H1 Font**: `Instrument Sans`
- **H1 Size**: `36px`
- **H1 Weight**: `700`
- **H1 Line Height**: `1.1`
- **H1 Letter Spacing**: `-0.025em`

#### H2 - Section Headings
- **H2 Font**: `Instrument Sans`
- **H2 Size**: `30px`
- **H2 Weight**: `600`
- **H2 Line Height**: `1.2`
- **H2 Letter Spacing**: `-0.025em`

#### H3 - Subsection Headings
- **H3 Font**: `Instrument Sans`
- **H3 Size**: `24px`
- **H3 Weight**: `600`
- **H3 Line Height**: `1.3`
- **H3 Letter Spacing**: `0px`

#### H4 - Minor Headings
- **H4 Font**: `Instrument Sans`
- **H4 Size**: `20px`
- **H4 Weight**: `600`
- **H4 Line Height**: `1.4`
- **H4 Letter Spacing**: `0px`

#### H5 - Small Headings
- **H5 Font**: `Instrument Sans`
- **H5 Size**: `18px`
- **H5 Weight**: `600`
- **H5 Line Height**: `1.5`
- **H5 Letter Spacing**: `0px`

#### H6 - Smallest Headings
- **H6 Font**: `Instrument Sans`
- **H6 Size**: `16px`
- **H6 Weight**: `600`
- **H6 Line Height**: `1.5`
- **H6 Letter Spacing**: `0px`

### Button Typography
- **Button Font**: `Instrument Sans`
- **Button Size**: `16px`
- **Button Weight**: `500`
- **Button Line Height**: `1.4`
- **Button Letter Spacing**: `0px`

### Navigation Typography
- **Nav Font**: `Instrument Sans`
- **Nav Size**: `16px`
- **Nav Weight**: `500`
- **Nav Line Height**: `1.4`
- **Nav Letter Spacing**: `0px`

### Form Typography
- **Form Font**: `Instrument Sans`
- **Form Size**: `16px`
- **Form Weight**: `400`
- **Form Line Height**: `1.5`
- **Form Letter Spacing**: `0px`

### Caption & Small Text
- **Caption Font**: `Instrument Sans`
- **Caption Size**: `14px`
- **Caption Weight**: `400`
- **Caption Line Height**: `1.4`
- **Caption Letter Spacing**: `0px`

### Quote Typography
- **Quote Font**: `Instrument Sans`
- **Quote Size**: `18px`
- **Quote Weight**: `400`
- **Quote Line Height**: `1.6`
- **Quote Letter Spacing**: `0px`

### Code Typography
- **Code Font**: `JetBrains Mono`
- **Code Size**: `14px`
- **Code Weight**: `400`
- **Code Line Height**: `1.5`
- **Code Letter Spacing**: `0px`

## 🚀 Plugin Features

### Automatic Default Setup
- ✅ **Plugin Activation**: Automatically sets all typography defaults
- ✅ **WordPress Options**: Stores all settings in WordPress database
- ✅ **REST API**: Provides endpoints for frontend consumption
- ✅ **Admin Interface**: WordPress admin panel for management

### REST API Endpoints
- **Theme Options**: `/wp-json/eternitty/v1/theme-options`
- **Header & Footer**: `/wp-json/eternitty/v1/header-footer`
- **Site Info**: `/wp-json/eternitty/v1/site-info`

### WordPress Admin Panel
- **Location**: WordPress Admin → Headless Pro
- **Tabs**: Theme Options, Header & Footer
- **Preview**: Shows current font settings
- **Management**: Easy typography management

## 🔧 Implementation Steps

### Step 1: Install Plugin
1. Copy `headless-plugin-main.php` to WordPress plugins
2. Activate plugin in WordPress admin
3. Plugin automatically sets all defaults

### Step 2: Verify Setup
1. Check WordPress admin: `http://localhost:10008/wp-admin/admin.php?page=eternitty-headless`
2. Test API endpoint: `http://localhost:10008/wp-json/eternitty/v1/theme-options`
3. Check frontend: `http://localhost:3000/typography`

### Step 3: Customize (Optional)
1. Modify settings in WordPress admin
2. Changes automatically sync to frontend
3. Use floating preview button to see changes

## 📊 Typography Hierarchy

### Font Sizes (px)
- **H1**: 36px (2.25rem)
- **H2**: 30px (1.875rem)
- **H3**: 24px (1.5rem)
- **H4**: 20px (1.25rem)
- **H5**: 18px (1.125rem)
- **H6**: 16px (1rem)
- **Body**: 16px (1rem)
- **Caption**: 14px (0.875rem)
- **Quote**: 18px (1.125rem)
- **Code**: 14px (0.875rem)

### Font Weights
- **H1**: 700 (Bold)
- **H2-H6**: 600 (Semibold)
- **Buttons/Nav**: 500 (Medium)
- **Body/Forms**: 400 (Normal)

### Line Heights
- **H1**: 1.1 (Tight)
- **H2**: 1.2
- **H3**: 1.3
- **H4**: 1.4
- **H5-H6**: 1.5
- **Body/Quote**: 1.6 (Comfortable)
- **Buttons/Nav**: 1.4
- **Forms**: 1.5
- **Caption/Code**: 1.4

### Letter Spacing
- **H1-H2**: -0.025em (Tight for large text)
- **All Others**: 0px (Normal)

## 🎯 Benefits

### Complete Typography System
- ✅ **All Elements Covered**: Every typography element has properties
- ✅ **Consistent Hierarchy**: Proper size and weight relationships
- ✅ **Professional Spacing**: Optimized line heights and letter spacing
- ✅ **Easy Customization**: Modify any property in WordPress admin

### Developer Friendly
- ✅ **REST API**: Easy frontend integration
- ✅ **WordPress Standards**: Follows WordPress coding standards
- ✅ **Extensible**: Easy to add more typography properties
- ✅ **Documentation**: Well-documented code and settings

### User Friendly
- ✅ **WordPress Admin**: Familiar interface for content managers
- ✅ **Live Preview**: See changes immediately
- ✅ **Default Presets**: Professional defaults out of the box
- ✅ **Easy Management**: Simple typography management

## 🧪 Testing

### Test Endpoints
```bash
# Test theme options
curl http://localhost:10008/wp-json/eternitty/v1/theme-options

# Test header/footer
curl http://localhost:10008/wp-json/eternitty/v1/header-footer

# Test site info
curl http://localhost:10008/wp-json/eternitty/v1/site-info
```

### Test Frontend
1. **Typography Page**: `http://localhost:3000/typography`
2. **Font Test Page**: `http://localhost:3000/font-test`
3. **Floating Preview**: Blue button on any page
4. **Homepage**: `http://localhost:3000`

## 🚨 Troubleshooting

### Plugin Not Working
1. Check plugin is activated in WordPress admin
2. Verify file permissions
3. Check WordPress error logs
4. Test REST API endpoints

### Typography Not Loading
1. Check Google Fonts are loading
2. Verify WordPress admin settings
3. Clear browser cache
4. Check console for errors

### API Endpoints Not Working
1. Check WordPress permalinks are set
2. Verify plugin is active
3. Test with curl commands
4. Check WordPress REST API is enabled
