# Image Upload Hooks and Components

## Overview

This directory contains specialized hooks and components for handling image uploads in the LevicampAdmin application. The primary implementation follows the "one-function-per-file" rule and uses Zustand for state management.

## Key Files

- `use-images.ts` - Zustand store for managing multiple image uploads
- `/components/tent-management/tents/TentImagesUploader.tsx` - Component for multiple image uploads
- `/components/tent-management/tents/TentImageUploader.tsx` - Component for single image upload

## Technical Implementation

### API Integration

The image upload system uses the following API endpoint:

```
POST /upload/tents
```

With the following parameters:
- `files`: Multiple image files (form-data)
- `folder`: String value based on the tent name

### Response Format

```json
{
  "status": 201,
  "message": "success",
  "data": {
    "urls": [
      "http://89.116.34.215:9000/testing-levi/tents/tenda-1/669a5466-34ac-4dac-8110-445856eefae4.jpg"
    ]
  }
}
```

## State Management

The `useImagesStore` hook manages:

1. Upload progress tracking for multiple files
2. Success/error states
3. Caching of uploaded image URLs
4. Removal of images

## Usage Example

```tsx
// In a component
import { useImagesStore } from '@/hooks/images/use-images';
import { TentImagesUploader } from '@/components/pages/tent-management/tents/TentImagesUploader';

function MyComponent() {
  const handleImagesChange = (imageUrls: string[]) => {
    // Update your form or state with the image URLs
    console.log('Uploaded images:', imageUrls);
  };

  return (
    <TentImagesUploader
      tentName="My Tent"
      onImagesChange={handleImagesChange}
      initialImages={[]}
    />
  );
}
```

## Best Practices

1. **Memory Management**: Object URLs are revoked when components unmount or images are removed to prevent memory leaks
2. **Progressive Upload**: Progress indicators show upload status for better UX
3. **Error Handling**: Comprehensive error handling with user-friendly messages
4. **Image Preview**: Images are previewed before and after upload
5. **Multiple File Support**: Supports uploading multiple images in a single request

## Extending the System

To add support for new upload types:
1. Add a new endpoint in the API handler
2. Create a specialized component for the specific upload scenario
3. Update form components to use the new uploader 