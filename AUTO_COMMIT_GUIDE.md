# 🤖 Auto-Commit System Guide

## Overview
The auto-commit system automatically commits your changes to a branch every 30 minutes and merges to main every hour.

## How It Works

### 📅 Schedule
- **Every 30 minutes**: Commits changes to `auto-commit-YYYYMMDD` branch
- **Every hour** (at :00 minutes): Merges changes to `main` branch
- **All changes**: Automatically pushed to remote repository

### 🔄 Process Flow
1. **Check for changes**: Only commits if there are uncommitted changes
2. **Create/Switch to branch**: Uses daily branch `auto-commit-YYYYMMDD`
3. **Commit changes**: Adds all changes and commits with timestamp
4. **Push to remote**: Pushes the branch to GitHub
5. **Hourly merge**: At the top of each hour, merges to main and pushes

## 📁 Files Created

### Scripts
- `auto-commit.sh` - Main auto-commit script
- `setup-auto-commit.sh` - Setup and management script
- `check-auto-commit.sh` - Status monitoring script

### Logs
- `auto-commit.log` - Detailed log of all auto-commit activities

## 🛠️ Commands

### Setup (Already Done)
```bash
./setup-auto-commit.sh setup
```

### Check Status
```bash
./check-auto-commit.sh
```

### Test Script
```bash
./setup-auto-commit.sh test
```

### Remove Auto-Commit
```bash
./setup-auto-commit.sh remove
```

### Manual Run
```bash
./auto-commit.sh
```

## 📊 Monitoring

### Check Cron Jobs
```bash
crontab -l
```

### View Logs
```bash
tail -f auto-commit.log
```

### Check Recent Commits
```bash
git log --oneline -10
```

## 🔧 Configuration

### Cron Schedule
- **Current**: `*/30 * * * *` (every 30 minutes)
- **Location**: `/Users/eternitty/Projects/frontend/auto-commit.sh`

### Branch Naming
- **Format**: `auto-commit-YYYYMMDD`
- **Example**: `auto-commit-20250922`

### Commit Messages
- **Format**: `🤖 Auto-commit - YYYY-MM-DD HH:MM:SS`
- **Example**: `🤖 Auto-commit - 2025-09-22 13:28:29`

## ⚠️ Important Notes

1. **No Conflicts**: The system handles branch creation and switching automatically
2. **Safe Merges**: Uses `--no-ff` for merge commits to maintain history
3. **Error Handling**: Logs all errors and continues operation
4. **Remote Sync**: All changes are pushed to GitHub automatically

## 🚨 Troubleshooting

### If Auto-Commit Stops Working
1. Check cron job: `crontab -l`
2. Check logs: `tail auto-commit.log`
3. Test manually: `./auto-commit.sh`
4. Re-setup if needed: `./setup-auto-commit.sh setup`

### If You Want to Stop
```bash
./setup-auto-commit.sh remove
```

### If You Want to Change Schedule
Edit the cron entry in `setup-auto-commit.sh` and re-run setup.

## 📈 Benefits

- ✅ **Automatic backups** of your work every 30 minutes
- ✅ **Version history** maintained with detailed timestamps
- ✅ **Remote sync** ensures your work is always backed up
- ✅ **No manual intervention** required
- ✅ **Safe operation** with error handling and logging

## 🎯 Current Status

- ✅ **Setup Complete**: Auto-commit system is active
- ✅ **Cron Job Active**: Running every 30 minutes
- ✅ **First Commit**: Successfully created and pushed `auto-commit-20250922`
- ✅ **Remote Sync**: Connected to GitHub repository

The system is now running and will automatically commit your changes every 30 minutes!
