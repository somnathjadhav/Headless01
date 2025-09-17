# Frontend to Backend Typography Sync Guide

## Why This Approach?
- ✅ **Keeps frontend design stable** - no breaking changes
- ✅ **WordPress backend matches frontend** - consistent typography
- ✅ **Small tweaks possible** - make minor adjustments in WordPress
- ✅ **No design disruption** - frontend continues working perfectly

## Current Frontend Typography (from globals.css & Tailwind)
- **Primary Font**: `Inter` (Google Font)
- **Secondary Font**: `Poppins` (Google Font)
- **Mono Font**: `JetBrains Mono` (Google Font)
- **Font Sizes**: Tailwind defaults (16px, 18px, 20px, 24px, 30px, 36px)

## Step 1: Access WordPress Admin Panel
```
http://localhost:10008/wp-admin/admin.php?page=eternitty-headless&tab=theme_options
```

## Step 2: Update WordPress Settings to Match Frontend

### Primary Font Settings
- **Primary Font**: `Inter`
- **Font Family**: `Inter`
- **Font Size**: `16px`
- **Font Weight**: `400`
- **Primary Size**: `16px`
- **Primary Weight**: `400`
- **Primary Line Height**: `1.6`
- **Primary Letter Spacing**: `0px`

### Secondary Font Settings
- **Secondary Font**: `Poppins`
- **Secondary Weight**: `400`
- **Secondary Letter Spacing**: `0px`

### Body Text Settings
- **Body Font**: `Inter`
- **Body Size**: `16px`
- **Body Weight**: `400`
- **Body Line Height**: `1.6`

### Heading Settings (Tailwind Defaults)
- **H1 Font**: `Inter`
- **H1 Size**: `36px` (text-4xl)
- **H1 Weight**: `700`
- **H1 Line Height**: `1.1`

- **H2 Font**: `Inter`
- **H2 Size**: `30px` (text-3xl)
- **H2 Weight**: `600`
- **H2 Line Height**: `1.2`

- **H3 Font**: `Inter`
- **H3 Size**: `24px` (text-2xl)
- **H3 Weight**: `600`
- **H3 Line Height**: `1.3`

- **H4 Font**: `Inter`
- **H4 Size**: `20px` (text-xl)
- **H4 Weight**: `600`
- **H4 Line Height**: `1.4`

- **H5 Font**: `Inter`
- **H5 Size**: `18px` (text-lg)
- **H5 Weight**: `600`
- **H5 Line Height**: `1.5`

- **H6 Font**: `Inter`
- **H6 Size**: `16px` (text-base)
- **H6 Weight**: `600`
- **H6 Line Height**: `1.5`

### General Settings
- **Font Size**: `16px`
- **Font Weight**: `400`
- **Line Height**: `1.6`

## Step 3: Save Changes
1. Click **Save Changes** or **Update** button in WordPress admin
2. Changes will be applied to the backend

## Step 4: Verify Frontend Stability
1. Check your frontend: `http://localhost:3000`
2. Verify typography page: `http://localhost:3000/typography`
3. Use floating preview button to see current settings
4. **Frontend should remain unchanged** - no design breaking!

## Benefits of This Approach

### ✅ Frontend Stability
- No breaking changes to existing design
- All components continue working
- Typography remains consistent

### ✅ Backend Consistency
- WordPress admin matches frontend
- Typography settings are synchronized
- Easy to make small tweaks

### ✅ Future Flexibility
- Make minor adjustments in WordPress
- Test changes without breaking frontend
- Gradual typography improvements

## Making Small Tweaks After Sync

Once WordPress backend matches frontend, you can make small adjustments:

### Safe Tweaks (won't break design)
- **Font weights**: 400 → 500, 600 → 700
- **Line heights**: 1.6 → 1.5, 1.4 → 1.3
- **Letter spacing**: 0px → -0.025em
- **Font sizes**: Small adjustments (±2-4px)

### Test Changes
1. Make small change in WordPress admin
2. Check frontend: `http://localhost:3000/typography`
3. Use floating preview button
4. Revert if design breaks

## Current Frontend Font Stack
```css
/* Primary Font */
--font-primary: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

/* Secondary Font */
--font-secondary: 'Poppins', Georgia, "Times New Roman", serif;

/* Mono Font */
--font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
```

## Testing Your Changes
1. **Homepage**: `http://localhost:3000`
2. **Typography Page**: `http://localhost:3000/typography`
3. **Font Test Page**: `http://localhost:3000/font-test`
4. **Floating Preview**: Blue button on any page

## Troubleshooting
- If frontend breaks, revert WordPress changes
- Check Google Fonts are loading properly
- Clear browser cache after changes
- Verify WordPress admin shows updated values
