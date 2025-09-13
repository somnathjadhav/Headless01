# WordPress Font Reset Guide

## How to Reset All Fonts to Suggested Values in WordPress Admin Panel

### Step 1: Access WordPress Admin Panel
1. Go to: `http://localhost:10008/wp-admin/admin.php?page=eternitty-headless&tab=theme_options`
2. Or navigate to: **WordPress Admin** → **Headless Pro** → **Theme Options**

### Step 2: Update Font Settings

#### Primary Font Settings
- **Primary Font**: `Instrument Sans`
- **Font Family**: `Instrument Sans`
- **Font Size**: `16px`
- **Font Weight**: `400`
- **Primary Size**: `16px`
- **Primary Weight**: `400`
- **Primary Line Height**: `1.6`
- **Primary Letter Spacing**: `0px`

#### Secondary Font Settings
- **Secondary Font**: `Nunito Sans`
- **Secondary Weight**: `400`
- **Secondary Letter Spacing**: `0px`

#### Body Text Settings
- **Body Font**: `Instrument Sans`
- **Body Size**: `16px`
- **Body Weight**: `400`
- **Body Line Height**: `1.6`

#### Heading Settings
- **H1 Font**: `Instrument Sans`
- **H1 Size**: `36px`
- **H1 Weight**: `700`
- **H1 Line Height**: `1.1`

- **H2 Font**: `Instrument Sans`
- **H2 Size**: `30px`
- **H2 Weight**: `600`
- **H2 Line Height**: `1.2`

- **H3 Font**: `Instrument Sans`
- **H3 Size**: `24px`
- **H3 Weight**: `600`
- **H3 Line Height**: `1.3`

- **H4 Font**: `Instrument Sans`
- **H4 Size**: `20px`
- **H4 Weight**: `600`
- **H4 Line Height**: `1.4`

- **H5 Font**: `Instrument Sans`
- **H5 Size**: `18px`
- **H5 Weight**: `600`
- **H5 Line Height**: `1.5`

- **H6 Font**: `Instrument Sans`
- **H6 Size**: `16px`
- **H6 Weight**: `600`
- **H6 Line Height**: `1.5`

#### General Settings
- **Font Size**: `16px`
- **Font Weight**: `400`
- **Line Height**: `1.6`

### Step 3: Save Changes
1. Click **Save Changes** or **Update** button
2. The changes will be applied immediately to your frontend

### Step 4: Verify Changes
1. Go to your frontend: `http://localhost:3000`
2. Check the typography preview: `http://localhost:3000/typography`
3. Use the floating preview button on any page to see the changes

## Suggested Font Stack

### Primary Font: Instrument Sans
- **Use for**: Headings, body text, navigation, buttons, forms
- **Weights**: 400, 500, 600, 700
- **Fallback**: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

### Secondary Font: Nunito Sans
- **Use for**: Quotes, emphasis, secondary content
- **Weights**: 200, 300, 400, 500, 600, 700, 800, 900
- **Fallback**: Georgia, "Times New Roman", serif

### Mono Font: JetBrains Mono
- **Use for**: Code, pre-formatted text, technical content
- **Weights**: 100, 200, 300, 400, 500, 600, 700, 800
- **Fallback**: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace

## Font Size Scale
- **H1**: 36px (2.25rem)
- **H2**: 30px (1.875rem)
- **H3**: 24px (1.5rem)
- **H4**: 20px (1.25rem)
- **H5**: 18px (1.125rem)
- **H6**: 16px (1rem)
- **Body**: 16px (1rem)

## Benefits of These Fonts
1. **Instrument Sans**: Clean, modern, highly readable
2. **Nunito Sans**: Friendly, rounded, great for emphasis
3. **JetBrains Mono**: Excellent for code, designed for developers

## Testing Your Changes
1. **Typography Page**: `http://localhost:3000/typography`
2. **Font Test Page**: `http://localhost:3000/font-test`
3. **Floating Preview**: Click the blue button on any page
4. **Homepage**: `http://localhost:3000`

## Troubleshooting
- If fonts don't load, check Google Fonts are enabled
- Clear browser cache after making changes
- Check console for any font loading errors
- Verify WordPress admin panel shows the updated values
