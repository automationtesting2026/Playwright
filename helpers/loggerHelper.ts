import fs from 'fs';
import path from 'path';

export class LoggerHelper {
  private readonly logDir = path.resolve(process.cwd(), 'reports', 'logs');
  private readonly logFile = path.join(this.logDir, `execution-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);

  constructor() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  info(message: string): void {
    this.write('INFO', message);
  }

  warn(message: string): void {
    this.write('WARN', message);
  }

  error(message: string): void {
    this.write('ERROR', message);
  }

  private write(level: string, message: string): void {
    const entry = `${new Date().toISOString()} [${level}] ${message}\n`;
    fs.appendFileSync(this.logFile, entry, { encoding: 'utf8' });
  }
}
