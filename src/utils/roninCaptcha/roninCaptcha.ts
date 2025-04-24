import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { log } from "../../utils/log.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const captchaLogsPath = path.join(__dirname, "../../../axie_data/captcha/");

interface Selector {
  skymavis: string;
  connectWallet: string;
  axieCaptcha: string;
  inputCode: string;
  unlock: string;
  connect: string;
  sign: string;
  emailInput: string;
  submitMail: string;
  removeInput: string;
  unlockPW: string;
  rightArrow: string;
  confirmCaptcha: string;
}

export async function runPythonScript() {
  return new Promise((resolve, reject) => {
    exec(
      `python -m dist.utils.roninCaptcha.roninCaptcha`,
      (error, stdout, stderr) => {
        if (error) {
          log.error(`Error executing Python script: ${error}`);
          return reject(error);
        }
        if (stderr) {
          log.error(`Python script stderr: ${error}`);
          return reject(new Error(stderr));
        }
        const result = stdout.trim().toLowerCase() === "true";
        resolve(result);
      }
    );
  });
}

export async function solveCaptcha(page: any, selector: Selector) {
  let i = 0;
  let axieFound: any = false;

  try {
    await page.screenshot({
      path: path.join(captchaLogsPath, "screenshot.png"),
    });
    while (!axieFound && i < 20) {
      const axieFound = await runPythonScript();
      if (axieFound == true) {
        return true;
      } else {
        await page.waitForSelector(selector.rightArrow);
        await page.click(selector.rightArrow);
        await page.screenshot({
          path: path.join(captchaLogsPath, "screenshot.png"),
        });
      }
      i++;
    }
    if (i >= 20) {
      await page.waitForSelector(selector.confirmCaptcha);
      await page.click(selector.confirmCaptcha);
      return false;
    }
  } catch (error) {
    log.error(`Cant solve captcha: ${error}`);
    return false;
  }
}
