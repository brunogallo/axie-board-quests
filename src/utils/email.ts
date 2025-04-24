import { log } from "./log.js";
const mailApi = "https://temporary-mail.net/api/v1";

interface MailHeaders extends Record<string, string> {
  "user-agent": string;
  Host: string;
  Referer: string;
  "Content-Type": string;
  "x-requested-with": string;
  Accept: string;
}

let mailHeaders: MailHeaders = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
  Host: "temporary-mail.net",
  Referer: "https://temporary-mail.net",
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  "x-requested-with": "XMLHttpRequest",
  Accept: "application/json, text/javascript, */*; q=0.01",
};

const domains = [
  "deepyinc.com",
  "gongjua.com",
  "comparisions.net",
  "mediaholy.com",
  "maillazy.com",
  "justdefinition.com",
  "inctart.com",
];

async function getCookie(): Promise<void> {
  const req = await fetch(`https://temporary-mail.net/`, {
    method: "GET",
    headers: mailHeaders,
  });
  mailHeaders.cookie = req.headers.get("set-cookie") || ""; // Default to empty string
}

async function getMessages(mailbox: string): Promise<any> {
  if (!mailbox) throw new Error("Mailbox is not set.");
  const req = await fetch(`${mailApi}/mailbox/${mailbox}`, {
    method: "GET",
    headers: mailHeaders,
  });
  return req.json();
}

async function getEmail(): Promise<any> {
  await getCookie();
  const req = await fetch(`${mailApi}/mailbox/keepalive?mailbox=`, {
    method: "GET",
    headers: mailHeaders,
  });
  mailHeaders.cookie = req.headers.get("set-cookie") || ""; // Default to empty string
  return req.json();
}

async function deleteEmail(mail: string, id: string): Promise<boolean> {
  await getCookie();
  const req = await fetch(`${mailApi}/mailbox/${mail}/${id}`, {
    method: "DELETE",
    headers: mailHeaders,
  });
  mailHeaders.cookie = req.headers.get("set-cookie") || ""; // Default to empty string
  return req.status === 200;
}

async function waitForEmailAndExtractCode(mailbox: string): Promise<{
  code: string | null;
  id: string | null;
}> {
  let attempts = 0;
  const maxAttempts = 20;
  const delayTime = 2000;

  //log.info(`Waiting for confirmation code.`);

  while (attempts < maxAttempts) {
    const emails = await getMessages(mailbox);

    if (emails.length > 0) {
      const skyMavisEmails = emails.filter(
        (email: { from: string }) => email.from === "Sky Mavis Account"
      );
      if (skyMavisEmails.length > 0) {
        skyMavisEmails.sort(
          (a: { date: string }, b: { date: string }) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const mostRecentEmail = skyMavisEmails[0];
        const regex = /^(\d{6})/;
        const match = mostRecentEmail.subject.match(regex);

        if (match) {
          const code = match[1];
          const id = mostRecentEmail.id;
          //log.success(`Successfully found confirmation code: ${code}`);
          return { code, id };
        } else {
          //log.error(`Code not found in subject: ${mostRecentEmail.subject}`);
        }
      } else {
        //log.error("Email from expected sender not found.");
      }
    } else {
      //log.error("No emails found.");
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, delayTime));
  }
  return { code: null, id: null };
}

async function generateEmail(): Promise<string> {
  const mail = await getEmail();
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  const email = `${mail.mailbox}@${randomDomain}`;
  log.success(`Mail generated successfully: ${email}`);
  return email;
}

export {
  getCookie,
  getMessages,
  getEmail,
  deleteEmail,
  waitForEmailAndExtractCode,
  generateEmail,
};
