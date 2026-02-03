
# Implementation Plan: UI/UX Fixes, Enhanced Settings, and Role-Based Page Controls

## Overview
This plan addresses multiple issues: MPCN Learn overflow/scrolling problems, sign-in page professional styling, sidebar clickability, expanded view options, General Overseer content management for Charter and MPCN Learn, and role-based page access controls.

---

## Part 1: Fix UI/UX Issues

### 1.1 MPCN Learn Overflow and Scrolling Fixes

**Problem:** Content overflows screen boundaries and some sections cannot be scrolled.

**Solution:**
- In `MPCNLearnHome.tsx`: Add proper `overflow-auto` and max-height constraints to the outer container
- In `ModuleViewer.tsx`: Ensure the main content area has proper `overflow-y-auto` and height constraints
- Wrap the Learn page content in a scrollable container with `max-h-[calc(100vh-theme(spacing.16))]`
- Add `overflow-hidden` to parent containers to prevent horizontal overflow

**Files to modify:**
- `src/pages/Learn.tsx` - Add scroll container wrapper
- `src/components/learn/MPCNLearnHome.tsx` - Fix card overflow and scrolling
- `src/components/learn/ModuleViewer.tsx` - Ensure proper scroll area constraints

### 1.2 Professional Sign-In Page Styling

**Problem:** Login page doesn't look professional; highlight colors need improvement.

**Solution:**
- Redesign the Auth page with a more professional gradient background
- Update button styling with subtle gradients instead of flat colors
- Improve the role selection grid with better visual hierarchy
- Add professional styling to form inputs and cards
- Enhance the login button with a professional primary gradient

**Files to modify:**
- `src/pages/Auth.tsx` - Update overall styling, gradient background, button styling
- `src/components/auth/RoleSelectionGrid.tsx` - Improve visual hierarchy and colors
- `src/index.css` - Add professional auth-specific utilities if needed

### 1.3 Sidebar Clickability Issues

**Problem:** In some pages, sidebar elements are not clickable.

**Solution:**
- Verify z-index values across layout components
- Ensure no overlapping elements block pointer events
- Check that `SidebarProvider` context is properly propagating
- Review any `pointer-events-none` classes that might be interfering

**Files to review/modify:**
- `src/components/layout/DashboardLayout.tsx`
- `src/components/layout/AppSidebar.tsx`

---

## Part 2: Enhanced View Options

### 2.1 Expanded View Options Menu

**Current features:** Font Size, Theme, Layout Density

**New features to add:**
- **Sidebar Collapsed/Expanded toggle**
- **Reduce Motion option** (for accessibility)
- **High Contrast Mode**
- **Line Spacing option**

**Files to modify:**
- `src/components/layout/ViewOptionsMenu.tsx` - Add new view options
- `src/index.css` - Add CSS for high contrast and reduced motion

---

## Part 3: General Overseer Content Management

### 3.1 Charter & MPCN Learn Content Editor in Settings

**Requirement:** Allow General Overseer to edit the Charter and MPCN Learn content (add text, edit paragraphs, change wording).

**Solution:**
Create new Settings tabs for content management:

1. **Charter Editor Tab**
   - Editable fields for each principle (title, description)
   - Editable commitments list
   - Tagline and title editing
   - Save to `system_settings` table with key `governance_charter`

2. **MPCN Learn Editor Tab**
   - Module group management (title, description)
   - Individual module content editing with rich text
   - Scripture reference management
   - Save to `system_settings` table with key `mpcn_learn_content`

**Database changes:**
- Add system setting entries for charter and learn content overrides
- Create migration for new settings keys

**Files to create/modify:**
- `src/components/settings/CharterEditor.tsx` (new)
- `src/components/settings/MPCNLearnEditor.tsx` (new)
- `src/pages/Settings.tsx` - Add new tabs
- Database migration for new system_settings entries

### 3.2 Content Override System

The configuration files (`humaneTerminology.ts`, `mpcnLearnConfig.ts`) will remain as defaults, but the system will:
1. Check for database overrides first
2. Fall back to file-based defaults
3. Provide merge logic for partial updates

---

## Part 4: Role-Based Page Access Controls

### 4.1 Feature Toggles System

**Requirement:** Allow General Overseer to disable pages like Trading and Investments for specific roles via login settings.

**Solution:**
1. Create a `feature_access` system setting in the database
2. Build a Feature Access Management UI in Settings
3. Modify `ProtectedRoute` to check feature access settings
4. Store disabled routes per role in the database

**Database schema:**
```json
// system_settings key: "feature_access"
{
  "disabled_routes": {
    "trading": ["employee"],      // Roles that cannot access Trading
    "investments": [],            // All roles allowed
    "reports": []                 // All roles allowed
  }
}
```

**Files to create/modify:**
- `src/components/settings/FeatureAccessManager.tsx` (new)
- `src/pages/Settings.tsx` - Add Feature Access tab
- `src/components/auth/ProtectedRoute.tsx` - Check feature access
- `src/hooks/useFeatureAccess.ts` (new)
- Database migration for feature_access setting

---

## Part 5: Money Segregation Explanation

**Clarification:** The user asked about how MPCN segregates money between freelancers, traders, and investors. This is a business model question, not a technical implementation request. 

Based on the codebase analysis:
- **Freelancing earnings** flow through Work Reports, tracked in `work_reports` table with platform-specific rates
- **Trading activity** is tracked separately in trading-related tables with capital positions
- **Investor funds** are managed through the `investments` table with clear separation via `investor_type`

The system maintains financial segregation through:
1. Separate database tables for each activity type
2. Role-specific dashboards showing only relevant financial data
3. Investment ≠ Control governance principle (investors see returns but don't control operations)
4. Financial Narratives providing read-only visibility for investors

---

## Technical Implementation Summary

### Files to Create
1. `src/components/settings/CharterEditor.tsx`
2. `src/components/settings/MPCNLearnEditor.tsx`
3. `src/components/settings/FeatureAccessManager.tsx`
4. `src/hooks/useFeatureAccess.ts`

### Files to Modify
1. `src/pages/Learn.tsx`
2. `src/components/learn/MPCNLearnHome.tsx`
3. `src/components/learn/ModuleViewer.tsx`
4. `src/pages/Auth.tsx`
5. `src/components/auth/RoleSelectionGrid.tsx`
6. `src/components/layout/ViewOptionsMenu.tsx`
7. `src/pages/Settings.tsx`
8. `src/components/auth/ProtectedRoute.tsx`
9. `src/index.css`
10. `src/config/humaneTerminology.ts` (add hook for overrides)

### Database Changes
- Add migration for new system_settings entries:
  - `governance_charter` - Charter content overrides
  - `mpcn_learn_overrides` - Learning content overrides
  - `feature_access` - Role-based route access controls

---

## Implementation Order
1. Fix critical UI bugs (overflow, scrolling, sidebar)
2. Improve Auth page styling
3. Expand View Options
4. Add Charter Editor to Settings
5. Add MPCN Learn Editor to Settings
6. Implement Feature Access Manager
7. Update ProtectedRoute for dynamic access control
