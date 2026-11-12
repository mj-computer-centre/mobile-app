/** Web: downloads the file. A BOM makes Excel read Hindi names as UTF-8. */
export async function saveTextFile(
  fileName: string,
  contents: string,
  mimeType: string,
): Promise<void> {
  const blob = new Blob(['﻿', contents], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
