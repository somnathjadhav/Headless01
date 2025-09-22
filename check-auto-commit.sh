#!/bin/bash

# Check auto-commit status script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="/Users/eternitty/Projects/frontend"
LOG_FILE="$SCRIPT_DIR/auto-commit.log"

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to check cron jobs
check_cron() {
    log "${BLUE}Checking cron jobs...${NC}"
    
    if crontab -l 2>/dev/null | grep -q "auto-commit.sh"; then
        log "${GREEN}✅ Auto-commit cron job is active${NC}"
        crontab -l 2>/dev/null | grep "auto-commit.sh"
    else
        log "${RED}❌ No auto-commit cron job found${NC}"
    fi
}

# Function to check log file
check_log() {
    log "${BLUE}Checking auto-commit log...${NC}"
    
    if [ -f "$LOG_FILE" ]; then
        log "${GREEN}✅ Log file exists: $LOG_FILE${NC}"
        
        # Show last 10 lines
        log "${YELLOW}Last 10 log entries:${NC}"
        tail -10 "$LOG_FILE"
        
        # Check for errors
        if grep -q "❌" "$LOG_FILE" 2>/dev/null; then
            log "${RED}⚠️  Errors found in log file${NC}"
            grep "❌" "$LOG_FILE" | tail -5
        else
            log "${GREEN}✅ No errors found in recent logs${NC}"
        fi
    else
        log "${YELLOW}⚠️  Log file not found: $LOG_FILE${NC}"
    fi
}

# Function to check git status
check_git() {
    log "${BLUE}Checking git status...${NC}"
    
    cd "$SCRIPT_DIR"
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log "${RED}❌ Not in a git repository${NC}"
        return 1
    fi
    
    # Check current branch
    current_branch=$(git branch --show-current)
    log "${BLUE}Current branch: $current_branch${NC}"
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        log "${YELLOW}⚠️  Uncommitted changes detected${NC}"
        git status --short
    else
        log "${GREEN}✅ No uncommitted changes${NC}"
    fi
    
    # Check for auto-commit branch
    if git show-ref --verify --quiet refs/heads/auto-commit-$(date +%Y%m%d); then
        log "${GREEN}✅ Auto-commit branch exists for today${NC}"
    else
        log "${YELLOW}⚠️  No auto-commit branch for today${NC}"
    fi
}

# Function to show recent commits
show_recent_commits() {
    log "${BLUE}Recent commits (last 5):${NC}"
    git log --oneline -5
}

# Main execution
main() {
    log "${BLUE}Auto-commit Status Check${NC}"
    echo "=================================="
    
    check_cron
    echo ""
    check_git
    echo ""
    check_log
    echo ""
    show_recent_commits
    
    log "${GREEN}Status check completed${NC}"
}

# Run main function
main "$@"
