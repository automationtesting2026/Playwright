import fs from 'fs';
import path from 'path';

export class FileUtils {
  static createFolderIfNotExists(folderPath: string): void {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
  }

  static resolvePath(relativePath: string): string {
    return path.resolve(process.cwd(), relativePath);
  }
}
