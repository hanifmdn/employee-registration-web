import { Storage } from "@google-cloud/storage";

function initializeStorage(): Storage {
  const projectId = process.env.GCP_PROJECT_ID;

  if (!projectId) {
    throw new Error("GCP_PROJECT_ID belum diatur di environment variable.");
  }

  // Menggunakan Application Default Credentials (gcloud auth application-default)
  return new Storage({
    projectId,
  });
}

export async function uploadFileToGCS(
  file: File,
  bucketName: string,
  destinationPath: string
): Promise<string> {
  try {
    const storage = initializeStorage();
    const bucket = storage.bucket(bucketName);

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const gcsFile = bucket.file(destinationPath);

    await gcsFile.save(fileBuffer, {
      metadata: {
        contentType: file.type,
      },
    });

    return `https://storage.googleapis.com/${bucketName}/${destinationPath}`;
  } catch (error) {
    console.error("GCS Upload Error:", error);
    throw error;
  }
}
