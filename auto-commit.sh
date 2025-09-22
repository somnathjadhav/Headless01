#!/bin/bash

# Auto-commit script for frontend project
# Commits to branch every 30 minutes, main every hour

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BRANCH_NAME="auto-commit-$(date +%Y%m%d)"
MAIN_BRANCH="main"
COMMIT_MESSAGE_PREFIX="🤖 Auto-commit"

# Function to log with timestamp
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to check if there are changes to commit
has_changes() {
    if [ -n "$(git status --porcelain)" ]; then
        return 0  # Has changes
    else
        return 1  # No changes
    fi
}

# Function to commit changes
commit_changes() {
    local branch=$1
    local message=$2
    
    log "${GREEN}Committing changes to branch: $branch${NC}"
    
    # Add all changes
    git add .
    
    # Commit with message
    git commit -m "$message"
    
    if [ $? -eq 0 ]; then
        log "${GREEN}✅ Successfully committed to $branch${NC}"
        return 0
    else
        log "${RED}❌ Failed to commit to $branch${NC}"
        return 1
    fi
}

# Function to push changes
push_changes() {
    local branch=$1
    
    log "${YELLOW}Pushing changes to remote: $branch${NC}"
    
    # Push to remote
    git push origin "$branch"
    
    if [ $? -eq 0 ]; then
        log "${GREEN}✅ Successfully pushed to remote $branch${NC}"
        return 0
    else
        log "${RED}❌ Failed to push to remote $branch${NC}"
        return 1
    fi
}

# Main execution
main() {
    log "${BLUE}Starting auto-commit process...${NC}"
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log "${RED}❌ Not in a git repository${NC}"
        exit 1
    fi
    
    # Check if there are changes
    if ! has_changes; then
        log "${YELLOW}No changes to commit${NC}"
        exit 0
    fi
    
    # Get current branch
    current_branch=$(git branch --show-current)
    log "${BLUE}Current branch: $current_branch${NC}"
    
    # Create or switch to auto-commit branch
    if ! git show-ref --verify --quiet refs/heads/"$BRANCH_NAME"; then
        log "${YELLOW}Creating new branch: $BRANCH_NAME${NC}"
        git checkout -b "$BRANCH_NAME"
    else
        log "${YELLOW}Switching to existing branch: $BRANCH_NAME${NC}"
        git checkout "$BRANCH_NAME"
    fi
    
    # Commit to branch
    commit_message="$COMMIT_MESSAGE_PREFIX - $(date '+%Y-%m-%d %H:%M:%S')"
    if commit_changes "$BRANCH_NAME" "$commit_message"; then
        push_changes "$BRANCH_NAME"
    fi
    
    # Check if it's time to commit to main (every hour)
    current_minute=$(date +%M)
    if [ "$current_minute" = "00" ]; then
        log "${YELLOW}Hourly commit to main branch${NC}"
        
        # Switch to main branch
        git checkout "$MAIN_BRANCH"
        
        # Merge changes from auto-commit branch
        git merge "$BRANCH_NAME" --no-ff -m "$COMMIT_MESSAGE_PREFIX - Hourly merge to main - $(date '+%Y-%m-%d %H:%M:%S')"
        
        if [ $? -eq 0 ]; then
            log "${GREEN}✅ Successfully merged to main${NC}"
            push_changes "$MAIN_BRANCH"
        else
            log "${RED}❌ Failed to merge to main${NC}"
        fi
        
        # Switch back to auto-commit branch
        git checkout "$BRANCH_NAME"
    fi
    
    log "${GREEN}Auto-commit process completed${NC}"
}

# Run main function
main "$@"
