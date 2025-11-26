# Create New GitHub Branch

## Input
Feature/Bug/Chore description: $ARGUMENTS

## Step 1: Retrieve Planning Information
1. **Load Session File**: Check for existing `.claude/sessions/context_session_{feature_name}.md` from explore-plan
2. **Extract Requirements**: Get detailed implementation plan and selected agents
3. **Validate Technology Stack**: Confirm which agents were selected:
   - Backend: NestJS or Laravel
   - Frontend: Angular or Flutter
4. **Generate Branch Name**: Create conventional branch name from feature description

## Step 2: Ask User for Branch Name (MANDATORY)

**CRITICAL**: ALWAYS ask the user for their preferred branch name BEFORE creating the branch.

1. **Suggest Branch Name**: Generate a conventional branch name from feature description
   ```bash
   FEATURE_NAME=$(echo "$ARGUMENTS" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
   SUGGESTED_BRANCH="feat/$FEATURE_NAME"
   ```

2. **Ask User for Confirmation**:
   - Present suggested branch name to user
   - Ask: "I suggest the branch name: `$SUGGESTED_BRANCH`. Do you want to use this name or would you prefer a different one?"
   - **WAIT for user response**
   - If user provides alternative name, use their name instead

3. **Create Feature Branch** (ONLY after user confirms):
   ```bash
   git fetch origin
   git checkout develop 2>/dev/null || git checkout -b develop
   git pull origin develop 2>/dev/null || echo "No remote develop branch, continuing with local"
   git checkout -b $BRANCH_NAME develop
   echo "✅ Created branch: $BRANCH_NAME"
   ```

4. **Save Branch Info**: Update session file with branch name for next command

## Step 3: Link to Next Workflow Step
After branch creation:
1. Note the branch name
2. **Next step**: `start-working-on-branch-new <branch-name>` to begin implementation
3. Provide summary of what was created

## Quality Checklist
- ✅ Branch name follows convention (feat/feature-name, fix/bug-name, chore/task-name)
- ✅ Branch created from latest develop
- ✅ Session file updated with branch information
- ✅ Ready to begin implementation