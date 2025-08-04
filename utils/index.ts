export const getStatusErrorMessage = (status: number): string => {
  switch (status) {
    case 400:
      return "Bad request - invalid file or data";
    case 401:
      return "Unauthorized access";
    case 403:
      return "Forbidden - file type not allowed";
    case 404:
      return "Upload endpoint not found";
    case 413:
      return "File too large for upload";
    case 415:
      return "Unsupported file format";
    case 429:
      return "Too many upload attempts - please wait";
    case 500:
      return "Server error during upload";
    case 502:
      return "Server temporarily unavailable";
    case 503:
      return "Service temporarily unavailable";
    case 504:
      return "Upload timeout - file may be too large";
    default:
      return `Upload failed with error ${status}`;
  }
};
