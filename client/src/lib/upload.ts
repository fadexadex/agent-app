export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to upload: ${error}`);
  }

  const data = await res.json();
  return data.url; // e.g. "/uploads/file-123.png"
}
