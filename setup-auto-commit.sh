#!/bin/bash

# Setup script for auto-commit functionality
# This script sets up cron jobs to run auto-commit every 30 minutes

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="/Users/eternitty/Projects/frontend"
AUTO_COMMIT_SCRIPT="$SCRIPT_DIR/auto-commit.sh"
LOG_FILE="$SCRIPT_DIR/auto-commit.log"

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to make script executable
make_executable() {
    log "${YELLOW}Making auto-commit script executable...${NC}"
    chmod +x "$AUTO_COMMIT_SCRIPT"
    
    if [ $? -eq 0 ]; then
        log "${GREEN}✅ Script is now executable${NC}"
    else
        log "${RED}❌ Failed to make script executable${NC}"
        exit 1
    fi
}

# Function to setup cron job
setup_cron() {
    log "${YELLOW}Setting up cron job...${NC}"
    
    # Create cron job entry (every 30 minutes)
    CRON_ENTRY="*/30 * * * * cd $SCRIPT_DIR && $AUTO_COMMIT_SCRIPT >> $LOG_FILE 2>&1"
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "auto-commit.sh"; then
        log "${YELLOW}Cron job already exists. Updating...${NC}"
        
        # Remove existing cron job
        crontab -l 2>/dev/null | grep -v "auto-commit.sh" | crontab -
    fi
    
    # Add new cron job
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
    
    if [ $? -eq 0 ]; then
        log "${GREEN}✅ Cron job setup successfully${NC}"
        log "${BLUE}Cron job will run every 30 minutes${NC}"
    else
        log "${RED}❌ Failed to setup cron job${NC}"
        exit 1
    fi
}

# Function to show current cron jobs
show_cron() {
    log "${BLUE}Current cron jobs:${NC}"
    crontab -l 2>/dev/null | grep -E "(auto-commit|frontend)" || echo "No auto-commit cron jobs found"
}

# Function to remove cron job
remove_cron() {
    log "${YELLOW}Removing auto-commit cron job...${NC}"
    
    # Remove cron job
    crontab -l 2>/dev/null | grep -v "auto-commit.sh" | crontab -
    
    if [ $? -eq 0 ]; then
        log "${GREEN}✅ Cron job removed successfully${NC}"
    else
        log "${RED}❌ Failed to remove cron job${NC}"
    fi
}

# Function to test the script
test_script() {
    log "${YELLOW}Testing auto-commit script...${NC}"
    
    if [ -f "$AUTO_COMMIT_SCRIPT" ]; then
        log "${GREEN}✅ Auto-commit script exists${NC}"
        
        # Test if script is executable
        if [ -x "$AUTO_COMMIT_SCRIPT" ]; then
            log "${GREEN}✅ Script is executable${NC}"
        else
            log "${RED}❌ Script is not executable${NC}"
            make_executable
        fi
        
        # Run a test (dry run)
        log "${BLUE}Running test commit...${NC}"
        cd "$SCRIPT_DIR"
        "$AUTO_COMMIT_SCRIPT"
        
    else
        log "${RED}❌ Auto-commit script not found${NC}"
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "Auto-commit setup script"
    echo ""
    echo "Usage: $0 [option]"
    echo ""
    echo "Options:"
    echo "  setup     - Setup auto-commit cron job (default)"
    echo "  test      - Test the auto-commit script"
    echo "  show      - Show current cron jobs"
    echo "  remove    - Remove auto-commit cron job"
    echo "  help      - Show this help message"
    echo ""
    echo "The auto-commit script will:"
    echo "  - Commit changes to a branch every 30 minutes"
    echo "  - Merge to main branch every hour"
    echo "  - Push changes to remote repository"
}

# Main execution
case "${1:-setup}" in
    "setup")
        log "${BLUE}Setting up auto-commit system...${NC}"
        make_executable
        setup_cron
        show_cron
        log "${GREEN}✅ Auto-commit system setup complete!${NC}"
        log "${BLUE}The system will now:${NC}"
        log "${BLUE}  - Commit changes every 30 minutes to auto-commit branch${NC}"
        log "${BLUE}  - Merge to main branch every hour${NC}"
        log "${BLUE}  - Push all changes to remote repository${NC}"
        ;;
    "test")
        test_script
        ;;
    "show")
        show_cron
        ;;
    "remove")
        remove_cron
        ;;
    "help")
        show_help
        ;;
    *)
        log "${RED}Unknown option: $1${NC}"
        show_help
        exit 1
        ;;
esac
