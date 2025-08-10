# Chat Interface Edit Profile Functionality

## Overview
The chat interface now includes a comprehensive edit profile feature that allows users to update their personal information, travel preferences, and documents directly from the chat sidebar.

## Features

### 1. Profile Editing
- **Basic Information**: Full name, email, date of birth, gender, nationality, language, contact number
- **Travel Preferences**: Preferred travel mode, travel style, budget range, travel interests
- **Emergency Contact**: Name, relationship, contact number, email
- **Travel Documents**: Passport details, visa status, government ID, passenger type

### 2. User Interface
- **Edit Button**: Available in both profile tab and settings tab
- **Modal Interface**: Full-screen modal with organized sections
- **Form Validation**: Real-time validation with error messages
- **Responsive Design**: Works on both desktop and mobile devices

### 3. Data Management
- **Real-time Updates**: Profile changes are immediately reflected in the UI
- **Database Integration**: All changes are saved to the backend database
- **Context Management**: User state is updated in the app context

## How to Use

### Accessing Edit Profile
1. Open the chat interface
2. Click on the sidebar toggle (if on mobile)
3. Navigate to either:
   - **Profile Tab**: Click the "Edit" button next to the profile picture
   - **Settings Tab**: Click "Edit Profile" in the Account section

### Editing Profile Information
1. **Basic Information**: Update personal details like name, contact, etc.
2. **Emergency Contact**: Add or modify emergency contact information
3. **Travel Documents**: Update passport, visa, and ID information
4. **Travel Preferences**: Set budget range, travel style, and interests
5. **Save Changes**: Click "Save Changes" to update your profile

### Profile Picture
- Click "Change Photo" to update your profile picture (functionality to be implemented)

## Technical Implementation

### Components
- `EditProfile.tsx`: Main edit profile modal component
- `EnhancedSidebar.tsx`: Updated sidebar with edit profile integration

### State Management
- Uses React Context for user state management
- Implements `UPDATE_USER` action for profile updates
- Real-time UI updates after successful profile changes

### API Integration
- Integrates with `realApiService.updateUserProfile()`
- Handles form submission and error states
- Provides user feedback through toast notifications

### Form Validation
- Required field validation
- Email format validation
- Phone number format validation
- Real-time error clearing

## File Structure
```
src/features/ChatInterface/
├── EditProfile.tsx          # Edit profile modal component
├── EnhancedSidebar.tsx      # Updated sidebar with edit functionality
└── ...other components
```

## Dependencies
- React hooks (useState, useEffect)
- UI components from shadcn/ui
- Lucide React icons
- App context for state management
- Toast notifications for user feedback

## Future Enhancements
- Profile picture upload functionality
- Additional travel preferences
- Profile completion percentage indicator
- Social media integration
- Profile sharing capabilities

## Notes
- Email field is disabled and cannot be changed
- All form fields are optional except full name
- Profile updates are immediately reflected in the sidebar
- The component handles loading states and error scenarios gracefully
